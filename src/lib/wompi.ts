/**
 * Wompi (wompi.sv) — helper server-side
 *
 * Flujo principal (EnlacePago API):
 *   1. create-order route → crea booking pendiente → llama createWompiPaymentLink() → devuelve urlEnlace
 *   2. Usuario paga en lk.wompi.sv/xxxx
 *   3. Wompi llama al webhook configurado en el EnlacePago → se actualiza estado a "paid"
 *
 * Flujo legacy (checkout.wompi.sv — solo usado como fallback):
 *   Checkout hosteado con URL firmada. Geo-restringido a El Salvador desde fuera.
 */
import { createHmac, createHash, timingSafeEqual } from 'crypto'

// ─── OAuth Token ─────────────────────────────────────────────────────────────

let cachedToken: { value: string; expiresAt: number } | null = null

/**
 * Obtiene (o reutiliza) un access token de Wompi SV via OAuth2 Client Credentials.
 * El token se cachea en memoria para no hacer un round-trip en cada pago.
 */
async function getWompiToken(): Promise<string> {
  // Reutilizar token si aún es válido (30s de margen)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.value
  }

  const res = await fetch('https://id.wompi.sv/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     process.env.WOMPI_PUBLIC_KEY!,
      client_secret: process.env.WOMPI_PRIVATE_KEY!,
      audience:      'wompi_api',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[Wompi] OAuth token error (${res.status}): ${text}`)
  }

  const data = await res.json()
  cachedToken = {
    value:     data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  }

  return cachedToken.value
}

// ─── EnlacePago API ──────────────────────────────────────────────────────────

/**
 * Crea un enlace de pago via Wompi SV API (/EnlacePago).
 * Devuelve la URL corta (ej. https://lk.wompi.sv/xxxx).
 *
 * El `bookingId` se usa como identificadorEnlaceComercio para relacionar
 * el pago con la reserva en el webhook.
 */
export async function createWompiPaymentLink(params: {
  bookingId:   string   // booking UUID — identificador único del enlace
  amountUsd:   number   // monto en dólares (ej. 17.50)
  productName: string   // nombre visible en el checkout (ej. "Viaje al Volcán Santa Ana")
  redirectUrl: string   // URL de retorno después del pago
  webhookUrl:  string   // URL donde Wompi notifica el resultado
  fechaFin?:   string   // ISO datetime límite del enlace (ej. trip_date + 'T23:59:59')
}): Promise<{ urlEnlace: string; idEnlace: string }> {
  const token = await getWompiToken()

  const body = {
    identificadorEnlaceComercio: params.bookingId,
    monto:                       params.amountUsd,
    nombreProducto:              params.productName.slice(0, 100), // máximo 100 chars
    formaPago: {
      permitirTarjetaCreditoDebido:  true,
      permitirPagoConPuntoAgricola:  false,
      permitirPagoEnCuotasAgricola:  false,
      permitirPagoEnBitcoin:         false,
      permitePagoQuickPay:           false,
    },
    configuracion: {
      urlRedirect: params.redirectUrl,
      urlWebhook:  params.webhookUrl,
      ...(params.fechaFin && { fechaFin: params.fechaFin }),
    },
    limitesDeUso: {
      cantidadMaximaPagosExitosos: 1,   // un solo pago exitoso por enlace
      cantidadMaximaPagosFallidos: 10,
    },
  }

  const res = await fetch('https://api.wompi.sv/EnlacePago', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[Wompi] EnlacePago error (${res.status}): ${text}`)
  }

  const data = await res.json()

  if (!data.urlEnlace) {
    throw new Error(`[Wompi] EnlacePago no devolvió urlEnlace: ${JSON.stringify(data)}`)
  }

  // `idEnlace` puede venir como número o string — normalizamos a string
  const idEnlace = data.idEnlace != null ? String(data.idEnlace) : ''

  return { urlEnlace: data.urlEnlace as string, idEnlace }
}

/**
 * Consulta un EnlacePago por su ID numérico (`idEnlace` que viene en el redirect).
 * Devuelve la lista de transacciones asociadas para poder reconciliar bookings
 * cuando el webhook no llegó o falló su verificación.
 *
 * Endpoint: GET https://api.wompi.sv/EnlacePago/{id}
 */
export async function consultWompiEnlacePago(idEnlace: string | number): Promise<{
  identificadorEnlaceComercio: string
  monto:                       number
  transacciones: Array<{
    idTransaccion:      string
    monto:              number
    esAprobada:         boolean
    esReal:             boolean
    formaPago:          string
    codigoAutorizacion: string
    mensaje:            string
    fechaTransaccion?:  string
  }>
}> {
  const token = await getWompiToken()

  const res = await fetch(`https://api.wompi.sv/EnlacePago/${idEnlace}`, {
    method:  'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[Wompi] Consultar EnlacePago error (${res.status}): ${text}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await res.json()

  // Wompi SV devuelve PascalCase — normalizamos a camelCase para el resto del código
  console.log('[Wompi] consultWompiEnlacePago response received, keys count:', Object.keys(raw).length)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizeTransaction = (t: any) => ({
    idTransaccion:      String(t.IdTransaccion      ?? t.idTransaccion      ?? ''),
    monto:              Number(t.Monto               ?? t.monto               ?? 0),
    esAprobada:         Boolean(t.EsAprobada         ?? t.esAprobada         ?? false),
    esReal:             Boolean(t.EsReal             ?? t.esReal             ?? false),
    formaPago:          String(t.FormaPago            ?? t.formaPago           ?? ''),
    codigoAutorizacion: String(t.CodigoAutorizacion  ?? t.codigoAutorizacion  ?? ''),
    mensaje:            String(t.Mensaje              ?? t.mensaje              ?? ''),
    fechaTransaccion:   t.FechaTransaccion            ?? t.fechaTransaccion,
  })

  return {
    identificadorEnlaceComercio:
      raw.IdentificadorEnlaceComercio ?? raw.identificadorEnlaceComercio ?? '',
    monto: Number(raw.Monto ?? raw.monto ?? 0),
    transacciones: (raw.Transacciones ?? raw.transacciones ?? []).map(normalizeTransaction),
  }
}

/**
 * Consulta una Transacción Compra (3DS o no) por su idTransaccion.
 * Fallback para el flow 3DS donde no existe un EnlacePago — el booking solo
 * guarda `wompi_transaction_id`.
 *
 * Endpoint: GET https://api.wompi.sv/TransaccionCompra/{id}
 *
 * Devuelve los campos normalizados a camelCase. Wompi responde PascalCase.
 */
export async function consultWompiTransaccion(idTransaccion: string): Promise<{
  idTransaccion:      string
  monto:              number
  esAprobada:         boolean
  esReal:             boolean
  resultadoTransaccion: string
  codigoAutorizacion: string
  fechaTransaccion?:  string
  identificadorEnlaceComercio?: string
  datosAdicionales?:  Record<string, string>
}> {
  const token = await getWompiToken()

  const res = await fetch(`https://api.wompi.sv/TransaccionCompra/${idTransaccion}`, {
    method:  'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[Wompi] Consultar TransaccionCompra error (${res.status}): ${text}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any = await res.json()

  return {
    idTransaccion:        String(raw.IdTransaccion        ?? raw.idTransaccion        ?? ''),
    monto:                Number(raw.Monto                ?? raw.monto                ?? 0),
    esAprobada:           Boolean(raw.EsAprobada          ?? raw.esAprobada           ?? false),
    esReal:               Boolean(raw.EsReal              ?? raw.esReal               ?? false),
    resultadoTransaccion: String(raw.ResultadoTransaccion ?? raw.resultadoTransaccion ?? ''),
    codigoAutorizacion:   String(raw.CodigoAutorizacion   ?? raw.codigoAutorizacion   ?? ''),
    fechaTransaccion:     raw.FechaTransaccion             ?? raw.fechaTransaccion,
    identificadorEnlaceComercio:
      raw.EnlacePago?.IdentificadorEnlaceComercio ?? raw.enlacePago?.identificadorEnlaceComercio,
    datosAdicionales: raw.DatosAdicionales ?? raw.datosAdicionales,
  }
}

// ─── Webhook Verification ────────────────────────────────────────────────────

/**
 * Verifica la firma del webhook de Wompi SV.
 *
 * Wompi SV envía `wompi_hash = HMAC_SHA256(rawBody, apiSecret)` en hex
 * en el header `wompi_hash`. Este es el ÚNICO algoritmo de verificación
 * para todos los webhooks de Wompi SV (tanto EnlacePago como checkout).
 *
 * El secret puede ser:
 *   - `WOMPI_WEBHOOK_SECRET` (preferido — el "API Secret" del panel de Wompi)
 *   - `WOMPI_PRIVATE_KEY` (fallback — mismo valor si no hay un secret separado)
 *
 * Docs: https://docs.wompi.sv/webhook/validar-webhook
 */
export function verifyWompiWebhook(params: {
  rawBody:      string   // body completo tal cual se recibió (sin re-serializar)
  receivedHash: string   // valor del header wompi_hash
}): boolean {
  // Try all possible secret env vars in priority order.
  // Wompi SV uses the "Events Secret" (different from the API private key).
  // We fall back through all candidates so either env var name works.
  const secret =
    process.env.WOMPI_EVENTS_SECRET ??
    process.env.WOMPI_WEBHOOK_SECRET ??
    process.env.WOMPI_PRIVATE_KEY

  if (!secret || secret === 'PENDIENTE') {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Wompi] Ningún secreto de webhook configurado en producción — rechazando')
      return false
    }
    console.warn('[Wompi] secret no configurado — omitiendo verificación (solo dev)')
    return true
  }

  // If no hash was sent by Wompi, skip verification only in dev
  if (!params.receivedHash) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Wompi] wompi_hash ausente — omitiendo (dev)')
      return true
    }
    console.error('[Wompi] wompi_hash ausente en producción — rechazando')
    return false
  }

  const computed = createHmac('sha256', secret)
    .update(params.rawBody, 'utf8')
    .digest('hex')

  // timingSafeEqual requires same-length buffers
  let ok = false
  try {
    const a = Buffer.from(computed.toLowerCase(), 'hex')
    const b = Buffer.from(params.receivedHash.toLowerCase(), 'hex')
    ok = a.length === b.length && timingSafeEqual(a, b)
  } catch {
    ok = false
  }

  const envUsed = process.env.WOMPI_EVENTS_SECRET
    ? 'WOMPI_EVENTS_SECRET'
    : process.env.WOMPI_WEBHOOK_SECRET
    ? 'WOMPI_WEBHOOK_SECRET'
    : 'WOMPI_PRIVATE_KEY'

  if (!ok) {
    console.error('[Wompi] ❌ Firma HMAC inválida', {
      computed,
      received:   params.receivedHash,
      bodyLength: params.rawBody.length,
      envUsed,
    })
  } else {
    console.log(`[Wompi] ✅ Firma HMAC válida (${envUsed})`)
  }

  return ok
}

// ─── Legacy / Utilities ──────────────────────────────────────────────────────

/** Construye la URL del checkout hosteado de Wompi SV (legacy — geo-restringido) */
export function buildWompiCheckoutUrl(params: {
  amountInCents: number
  reference:     string
  redirectUrl:   string
}): string {
  const publicKey = process.env.WOMPI_PUBLIC_KEY
  if (!publicKey) throw new Error('WOMPI_PUBLIC_KEY no configurada')

  const url = new URL('https://checkout.wompi.sv/p/')
  url.searchParams.set('public-key', publicKey)
  url.searchParams.set('currency', 'USD')
  url.searchParams.set('amount-in-cents', String(params.amountInCents))
  url.searchParams.set('reference', params.reference)
  url.searchParams.set('redirect-url', params.redirectUrl)

  const apiSecret = process.env.WOMPI_PRIVATE_KEY
  if (apiSecret) {
    const raw = `${params.reference}${params.amountInCents}USD${apiSecret}`
    const sig = createHash('sha256').update(raw).digest('hex')
    url.searchParams.set('signature:integrity', sig)
  }

  return url.toString()
}

/** Convierte dólares a centavos — Wompi checkout trabaja con centavos enteros */
export function usdToCents(usd: number): number {
  return Math.round(usd * 100)
}

// ─── Native 3DS Charge ───────────────────────────────────────────────────────

interface WompiNativeChargeParams {
  tarjeta: {
    numeroTarjeta:   string
    cvv:             string
    mesVencimiento:  number
    anioVencimiento: number
  }
  monto:      number
  urlRedirect: string
  cliente: {
    nombre:       string
    apellido:     string
    email:        string
    ciudad:       string
    direccion:    string
    idPais:       string
    idRegion:     string
    codigoPostal: string
    telefono:     string
  }
  datosAdicionales?: Record<string, string>
  urlWebhook?:       string
}

interface WompiNativeChargeResponse {
  idTransaccion:       string
  esReal:              boolean
  urlCompletarPago3Ds: string
  monto:               number
}

/**
 * Inicia un cobro nativo con autenticación 3DS via Wompi SV.
 * Devuelve urlCompletarPago3Ds donde el usuario completa el challenge del emisor.
 *
 * Endpoint: POST https://api.wompi.sv/TransaccionCompra/3DS
 */
export async function createWompiNativeCharge(
  params: WompiNativeChargeParams,
): Promise<WompiNativeChargeResponse> {
  const token = await getWompiToken()

  const webhookUrl =
    params.urlWebhook ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.akatrek.com'}/api/trips/wompi/webhook`

  // Body shape per https://docs.wompi.sv/metodos-api/crear-transaccion-compra-3ds
  //  - card object key is `tarjetaCreditoDebido` (Wompi's typo, sic — "Debido" with 'i')
  //  - cliente fields go FLAT at top level (no `cliente` wrapper)
  // Wompi RESPONSES still arrive PascalCase; the parsing below has
  // `data.UrlCompletarPago3Ds ?? data.urlCompletarPago3Ds` fallbacks. The
  // webhook handler at /api/trips/wompi/webhook also parses PascalCase incoming.
  const body = {
    tarjetaCreditoDebido: {
      numeroTarjeta:   params.tarjeta.numeroTarjeta,
      cvv:             params.tarjeta.cvv,
      mesVencimiento:  params.tarjeta.mesVencimiento,
      anioVencimiento: params.tarjeta.anioVencimiento,
    },
    monto:       params.monto,
    urlRedirect: params.urlRedirect,
    nombre:       params.cliente.nombre,
    apellido:     params.cliente.apellido,
    email:        params.cliente.email,
    ciudad:       params.cliente.ciudad,
    direccion:    params.cliente.direccion,
    idPais:       params.cliente.idPais,
    idRegion:     params.cliente.idRegion,
    codigoPostal: params.cliente.codigoPostal,
    telefono:     params.cliente.telefono,
    ...(params.datosAdicionales && { datosAdicionales: params.datosAdicionales }),
    configuracion: {
      urlWebhook: webhookUrl,
    },
  }

  const res = await fetch('https://api.wompi.sv/TransaccionCompra/3DS', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[Wompi] TransaccionCompra/3DS error (${res.status}): ${text}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json()

  const url3ds = data.UrlCompletarPago3Ds ?? data.urlCompletarPago3Ds ?? ''
  if (!url3ds) {
    throw new Error(`[Wompi] 3DS no devolvió UrlCompletarPago3Ds: ${JSON.stringify(data)}`)
  }

  return {
    idTransaccion:       String(data.IdTransaccion      ?? data.idTransaccion      ?? ''),
    esReal:              Boolean(data.EsReal             ?? data.esReal             ?? false),
    urlCompletarPago3Ds: String(url3ds),
    monto:               Number(data.Monto               ?? data.monto               ?? 0),
  }
}

