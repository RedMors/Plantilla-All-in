import type { TemplatePaymentConfig } from '@/lib/payments/types'

export const config: TemplatePaymentConfig = {
  prefix:      'nail',
  name:        'Nails by Mariela',
  fromEmail:   process.env.RESEND_FROM_EMAIL ?? 'Nails by Mariela <noreply@resend.dev>',
  currency:    'USD',
  methods:     ['cash', 'card', 'lightning'],   // comparte credenciales con salon-unas (mismo prefix 'nail')
  brand:       '#B86A82',   // rosa polvo — acento de la variante lite (coincide con constants.ts)
}
