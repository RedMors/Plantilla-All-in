/**
 * Wompi SV — helper server-side (adaptado de la implementación de Akatrek, read-only).
 *
 * Flujo (EnlacePago API):
 *   1. La Server Action crea la cita + payment 'pending' → llama createWompiPaymentLink()
 *      → guarda provider_url y redirige al cliente a lk.wompi.sv/xxxx
 *   2. El cliente paga.
 *   3. Wompi llama al webhook configurado en el enlace → marcamos status='paid'.
 *
 * Mapeo de credenciales (panel de Wompi):
 *   App ID      → WOMPI_PUBLIC_KEY  (client_id)
 *   API secret  → WOMPI_PRIVATE_KEY (client_secret)
 *   Events sec. → WOMPI_EVENTS_SECRET (verificación de firma del webhook)
 */
import { createHmac, timingSafeEqual } from 'crypto'
import { wompiCreds } from './credentials'

// ─── OAuth token (cacheado en memoria, por prefijo/cliente) ──────────────────

const tokenCache = new Map<string, { value: string; expiresAt: number }>()

async function getWompiToken(prefix: string): Promise<string> {
  const cached = tokenCache.get(prefix)
  if (cached && Date.now() < cached.expiresAt - 30_000) {
    return cached.value
  }

  const { clientId, clientSecret } = wompiCreds(prefix)
  if (!clientId || !clientSecret) {
    throw new Error(`[Wompi] Faltan credenciales para "${prefix}" (WOMPI_PUBLIC_KEY[_${prefix.toUpperCase()}] / WOMPI_PRIVATE_KEY[_${prefix.toUpperCase()}])`)
  }

  const res = await fetch('https://id.wompi.sv/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
      audience:      'wompi_api',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[Wompi] OAuth token error (${res.status}): ${text}`)
  }

  const data = await res.json()
  const entry = {
    value:     data.access_token as string,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  }
  tokenCache.set(prefix, entry)
  return entry.value
}

// ─── Crear EnlacePago ─────────────────────────────────────────────────────────

export async function createWompiPaymentLink(params: {
  prefix:      string   // plantilla/cliente — resuelve qué credenciales usar
  reference:   string   // identificadorEnlaceComercio — usamos el appointmentId
  amountUsd:   number
  productName: string
  redirectUrl: string
  webhookUrl:  string
}): Promise<{ urlEnlace: string; idEnlace: string }> {
  const token = await getWompiToken(params.prefix)

  const body = {
    identificadorEnlaceComercio: params.reference,
    monto:                       params.amountUsd,
    nombreProducto:              params.productName.slice(0, 100),
    formaPago: {
      permitirTarjetaCreditoDebido: true,
      permitirPagoConPuntoAgricola: false,
      permitirPagoEnCuotasAgricola: false,
      permitirPagoEnBitcoin:        false,
      permitePagoQuickPay:          false,
    },
    configuracion: {
      urlRedirect: params.redirectUrl,
      urlWebhook:  params.webhookUrl,
    },
    limitesDeUso: {
      cantidadMaximaPagosExitosos: 1,
      cantidadMaximaPagosFallidos: 10,
    },
  }

  const res = await fetch('https://api.wompi.sv/EnlacePago', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body:    JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[Wompi] EnlacePago error (${res.status}): ${text}`)
  }

  const data = await res.json()
  if (!data.urlEnlace) {
    throw new Error(`[Wompi] EnlacePago sin urlEnlace: ${JSON.stringify(data)}`)
  }

  return {
    urlEnlace: data.urlEnlace as string,
    idEnlace:  data.idEnlace != null ? String(data.idEnlace) : '',
  }
}

// ─── Consultar enlace (reconciliar cuando el webhook no llega — útil en localhost) ──

export async function consultWompiEnlacePago(prefix: string, idEnlace: string): Promise<{
  reference: string
  paid:      boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw:       any
}> {
  const token = await getWompiToken(prefix)
  const res = await fetch(`https://api.wompi.sv/EnlacePago/${idEnlace}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`[Wompi] Consultar EnlacePago error (${res.status}): ${text}`)
  }
  const raw = (await res.json()) as Record<string, unknown>
  const txs = (raw.Transacciones ?? raw.transacciones ?? []) as Array<Record<string, unknown>>
  const paid = txs.some(t => Boolean(t.EsAprobada ?? t.esAprobada) && Boolean(t.EsReal ?? t.esReal))
  return {
    reference: String(raw.IdentificadorEnlaceComercio ?? raw.identificadorEnlaceComercio ?? ''),
    paid,
    raw,
  }
}

// ─── Verificación de firma del webhook ────────────────────────────────────────

/**
 * Wompi SV envía `wompi_hash = HMAC_SHA256(rawBody, secret)` (hex) en el header.
 * Secret por plantilla, en orden: WOMPI_EVENTS_SECRET[_PREFIX] → WOMPI_PRIVATE_KEY[_PREFIX].
 */
export function verifyWompiWebhook(params: {
  prefix:       string
  rawBody:      string
  receivedHash: string
}): boolean {
  const creds  = wompiCreds(params.prefix)
  const secret = creds.eventsSecret || creds.clientSecret

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Wompi] Sin secreto de webhook en producción — rechazando')
      return false
    }
    console.warn('[Wompi] Sin secreto — omitiendo verificación (solo dev)')
    return true
  }

  if (!params.receivedHash) {
    if (process.env.NODE_ENV !== 'production') return true
    console.error('[Wompi] wompi_hash ausente en producción — rechazando')
    return false
  }

  const computed = createHmac('sha256', secret).update(params.rawBody, 'utf8').digest('hex')
  try {
    const a = Buffer.from(computed.toLowerCase(), 'hex')
    const b = Buffer.from(params.receivedHash.toLowerCase(), 'hex')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
