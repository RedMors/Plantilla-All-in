// Métodos de pago soportados por la plataforma
export type PaymentMethod = 'cash' | 'card' | 'lightning'

// Estados del pago
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired'

// Resultado de crear un pago
export type PaymentResult =
  | { method: 'cash';      status: 'pending'; confirmationCode: string; paymentId: string }
  | { method: 'card';      status: 'pending'; redirectUrl: string;      paymentId: string }
  | { method: 'lightning'; status: 'pending'; bolt11: string; paymentHash: string; expiresAt: string; paymentId: string }
  | { error: string }

// Prefijos de plantilla válidos — agregar aquí cuando se crea una nueva
export const TEMPLATE_PREFIXES = ['nail', 'carwash', 'vivero', 'gym', 'ferreteria', 'comedor'] as const
export type TemplatePrefix = typeof TEMPLATE_PREFIXES[number]

// Config mínima que cada plantilla debe declarar
export interface TemplatePaymentConfig {
  prefix: TemplatePrefix
  name: string            // nombre del negocio para emails
  fromEmail: string       // "Nails by Mariela <citas@dominio.sv>"
  currency: 'USD'
  methods: PaymentMethod[]
  brand: string           // hex color para emails
}
