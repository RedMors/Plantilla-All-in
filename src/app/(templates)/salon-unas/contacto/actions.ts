'use server'

export type ContactResult = { success: true } | { error: string }

export async function sendContactMessage(
  _prev: ContactResult | null,
  formData: FormData
): Promise<ContactResult> {
  const name    = (formData.get('nombre')   as string | null)?.trim() ?? ''
  const phone   = (formData.get('telefono') as string | null)?.trim() ?? ''
  const message = (formData.get('mensaje')  as string | null)?.trim() ?? ''
  const service = (formData.get('servicio') as string | null) ?? ''

  if (!name || !phone || !message) {
    return { error: 'Nombre, teléfono y mensaje son requeridos.' }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'Nails by Mariela <noreply@resend.dev>',
        to:   process.env.CONTACT_EMAIL    ?? process.env.RESEND_FROM_EMAIL ?? 'noreply@resend.dev',
        subject: `Contacto web — ${name}`,
        html: `
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          ${service ? `<p><strong>Servicio:</strong> ${service}</p>` : ''}
          <p><strong>Mensaje:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
        `,
      })
    } catch (err) {
      console.error('[contacto] email error:', err)
    }
  }

  return { success: true }
}
