import type { TemplatePaymentConfig } from '@/lib/payments/types'

export const config: TemplatePaymentConfig = {
  prefix:      'nail',
  name:        'Nails by Mariela',
  fromEmail:   process.env.RESEND_FROM_EMAIL ?? 'Nails by Mariela <noreply@resend.dev>',
  currency:    'USD',
  methods:     ['cash'],   // agregar 'card' y 'lightning' cuando estén las keys
  brand:       '#C4965A',   // oro champagne — acento de la variante full (coincide con constants.ts)
}
