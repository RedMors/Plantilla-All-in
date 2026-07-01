/**
 * Lightning (Blink) — helper server-side (adaptado de Akatrek, read-only).
 * Docs: https://dev.blink.sv · GraphQL: https://api.blink.sv/graphql · Auth: X-API-KEY
 *
 * Requiere: BLINK_API_KEY, BLINK_WALLET_ID (wallet USD stablesats), BLINK_WEBHOOK_SECRET.
 */
import { timingSafeEqual } from 'crypto'
import { blinkCreds } from './credentials'

const BLINK_URL = 'https://api.blink.sv/graphql'

function blinkEnv(prefix: string) {
  const { apiKey, walletId } = blinkCreds(prefix)
  if (!apiKey || !walletId) {
    throw new Error(`[Blink] Faltan credenciales para "${prefix}" (BLINK_API_KEY[_${prefix.toUpperCase()}] / BLINK_WALLET_ID[_${prefix.toUpperCase()}])`)
  }
  return { apiKey, walletId }
}

export interface BlinkInvoice {
  bolt11:      string   // payment request (lnbc...)
  paymentHash: string   // hex — clave para lookup en webhook
  expiresAt:   string   // ISO
}

// ── Crear invoice USD-denominado ──────────────────────────────────────────────
export async function createLightningInvoice(params: {
  prefix:      string   // plantilla/cliente — resuelve qué credenciales usar
  amountCents: number   // USD en centavos ($28.00 → 2800)
  memo:        string
}): Promise<BlinkInvoice> {
  const { apiKey, walletId } = blinkEnv(params.prefix)

  const mutation = `
    mutation CreateUsdInvoice($input: LnUsdInvoiceCreateOnBehalfOfRecipientInput!) {
      lnUsdInvoiceCreateOnBehalfOfRecipient(input: $input) {
        invoice { paymentRequest paymentHash }
        errors { message }
      }
    }
  `

  const res = await fetch(BLINK_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body: JSON.stringify({
      query: mutation,
      variables: { input: { recipientWalletId: walletId, amount: params.amountCents, memo: params.memo } },
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`[Blink] createInvoice HTTP ${res.status}: ${text}`)
  }

  const data = await res.json()
  const result = data?.data?.lnUsdInvoiceCreateOnBehalfOfRecipient
  if (result?.errors?.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error(`[Blink] ${result.errors.map((e: any) => e.message).join(', ')}`)
  }

  const invoice = result?.invoice
  if (!invoice?.paymentRequest) {
    throw new Error(`[Blink] Sin invoice — ${JSON.stringify(data)}`)
  }

  return {
    bolt11:      invoice.paymentRequest,
    paymentHash: invoice.paymentHash,
    expiresAt:   new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Blink expira en 1h
  }
}

// ── Estado de un invoice (para polling desde el cliente) ──────────────────────
export async function getLightningStatus(
  prefix: string,
  bolt11: string,
): Promise<'PENDING' | 'PAID' | 'EXPIRED'> {
  const { apiKey, walletId } = blinkEnv(prefix)

  const query = `
    query InvoiceStatus($walletId: WalletId!, $paymentRequest: LnPaymentRequest!) {
      me { defaultAccount { walletById(walletId: $walletId) {
        ... on UsdWallet { invoiceByPaymentRequest(paymentRequest: $paymentRequest) { paymentStatus } }
      } } }
    }
  `

  const res = await fetch(BLINK_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': apiKey },
    body:    JSON.stringify({ query, variables: { walletId, paymentRequest: bolt11 } }),
    cache:   'no-store',
  })

  if (!res.ok) throw new Error(`[Blink] getStatus HTTP ${res.status}`)
  const data = await res.json()
  const s = data?.data?.me?.defaultAccount?.walletById?.invoiceByPaymentRequest?.paymentStatus
  if (s === 'PAID' || s === 'EXPIRED') return s
  return 'PENDING'
}

// ── Verificación del webhook de Blink ─────────────────────────────────────────
// Blink NO firma el body con HMAC: se registra el webhook como
//   {APP_URL}/api/payments/blink/webhook?secret=<BLINK_WEBHOOK_SECRET>
// y se compara el query param `secret` contra el valor configurado.
export function verifyBlinkSecret(prefix: string, provided: string | null): boolean {
  const expected = blinkCreds(prefix).webhookSecret
  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Blink] Sin BLINK_WEBHOOK_SECRET en producción — rechazando')
      return false
    }
    console.warn('[Blink] Sin secreto — omitiendo verificación (solo dev)')
    return true
  }
  if (!provided || provided.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  } catch {
    return false
  }
}
