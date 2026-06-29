'use server'

import { Resend } from 'resend'
import { adminDb } from '@/lib/supabase/admin'

export type ContactResult = { success: true } | { error: string }

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendContactMessage(
  _prev: ContactResult | null,
  formData: FormData
): Promise<ContactResult> {
  const name    = (formData.get('nombre')        as string | null)?.trim() ?? ''
  const phone   = ((formData.get('telefono_full') as string | null)?.trim()
               || (formData.get('telefono')      as string | null)?.trim()) ?? ''
  const message = (formData.get('mensaje')       as string | null)?.trim() ?? ''
  const service = (formData.get('servicio')      as string | null)?.trim() ?? ''

  if (!name || !phone || !message) {
    return { error: 'Nombre, teléfono y mensaje son requeridos.' }
  }

  // Persiste en DB independientemente de Resend — auditoría siempre disponible
  const db = adminDb()
  const { error: dbError } = await db
    .from('nail_contact_messages')
    .insert({ name, phone, message, service: service || null })

  if (dbError) {
    console.error('[contacto] db error:', dbError.message)
    // No bloquea al usuario — el mensaje se intentará mandar por email igual
  }

  // Email: no-blocking, no falla si Resend no está configurado
  const dest = process.env.CONTACT_EMAIL ?? process.env.RESEND_FROM_EMAIL
  if (process.env.RESEND_API_KEY && dest) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from:    process.env.RESEND_FROM_EMAIL ?? 'Nails by Mariela <noreply@resend.dev>',
        to:      dest,
        subject: `Contacto web — ${esc(name)}`,
        html: `
          <p><strong>Nombre:</strong> ${esc(name)}</p>
          <p><strong>Teléfono:</strong> ${esc(phone)}</p>
          ${service ? `<p><strong>Servicio:</strong> ${esc(service)}</p>` : ''}
          <p><strong>Mensaje:</strong><br/>${esc(message).replace(/\n/g, '<br/>')}</p>
        `,
      })
    } catch (err) {
      console.error('[contacto] email error:', err)
    }
  } else if (!dest) {
    console.warn('[contacto] CONTACT_EMAIL y RESEND_FROM_EMAIL sin configurar — solo guardado en DB')
  }

  return { success: true }
}
