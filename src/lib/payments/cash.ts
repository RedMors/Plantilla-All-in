'use server'

import { adminDb } from '@/lib/supabase/admin'
import { sendCashConfirmation } from './email'
import type { TemplatePaymentConfig, PaymentResult } from './types'

// Genera un código alfanumérico de 6 caracteres (sin O,0,I,1 para evitar confusión)
export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => chars[b % chars.length]).join('')
}

export async function createCashPayment(params: {
  config: TemplatePaymentConfig
  appointmentId: string
  amount: number
  customerEmail: string
  customerName: string
  serviceName: string
  dateLabel: string   // "martes, 1 de julio de 2026"
  timeLabel: string   // "9:00 AM"
}): Promise<PaymentResult> {
  const code = generateConfirmationCode()
  const db = adminDb()

  const { data, error } = await db
    .from(`${params.config.prefix}_payments`)
    .insert({
      appointment_id:    params.appointmentId,
      method:            'cash',
      status:            'pending',
      amount:            params.amount,
      confirmation_code: code,
      provider_reference: `${params.config.prefix}:${params.appointmentId}`,
    })
    .select('id')
    .single()

  if (error) return { error: 'No se pudo registrar el pago. Intenta de nuevo.' }
  if (!data) return { error: 'El pago se guardó pero no se pudo obtener el ID.' }

  // Email no bloquea — si falla, el pago ya quedó registrado
  sendCashConfirmation({
    to:               params.customerEmail,
    businessName:     params.config.name,
    fromEmail:        params.config.fromEmail,
    brandColor:       params.config.brand,
    customerName:     params.customerName,
    serviceName:      params.serviceName,
    date:             params.dateLabel,
    time:             params.timeLabel,
    price:            params.amount,
    confirmationCode: code,
  }).catch(err => console.error('[email] cash confirmation failed:', err))

  return { method: 'cash', status: 'pending', confirmationCode: code, paymentId: data.id }
}
