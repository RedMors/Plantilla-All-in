/**
 * Resolución de credenciales de pago **por plantilla** (multi-tenant).
 *
 * Cada plantilla (prefijo: nail, carwash, gym, …) puede tener sus PROPIAS llaves
 * de Wompi/Blink — pensado para cuando cada cliente use su propia cuenta.
 *
 * Regla de resolución (en orden):
 *   1. Llave específica del cliente:  `WOMPI_PUBLIC_KEY_NAIL`
 *   2. Llave compartida (fallback):   `WOMPI_PUBLIC_KEY`
 *
 * Así, activar un cliente nuevo con cuenta propia = SOLO agregar env vars con el
 * sufijo del prefijo. Cero cambios de código. Si no las agregas, usa las compartidas.
 */

function envFor(base: string, prefix: string): string | undefined {
  const specific = process.env[`${base}_${prefix.toUpperCase()}`]
  if (specific && specific.trim()) return specific.trim()
  const shared = process.env[base]
  return shared && shared.trim() ? shared.trim() : undefined
}

export interface WompiCreds {
  clientId?:     string
  clientSecret?: string
  eventsSecret?: string
}

export function wompiCreds(prefix: string): WompiCreds {
  return {
    clientId:     envFor('WOMPI_PUBLIC_KEY', prefix),
    clientSecret: envFor('WOMPI_PRIVATE_KEY', prefix),
    eventsSecret: envFor('WOMPI_EVENTS_SECRET', prefix),
  }
}

export interface BlinkCreds {
  apiKey?:        string
  walletId?:      string
  webhookSecret?: string
}

export function blinkCreds(prefix: string): BlinkCreds {
  return {
    apiKey:        envFor('BLINK_API_KEY', prefix),
    walletId:      envFor('BLINK_WALLET_ID', prefix),
    webhookSecret: envFor('BLINK_WEBHOOK_SECRET', prefix),
  }
}
