import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY no configurado')
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

// ── Template HTML base (funciona en Gmail, Apple Mail, Outlook) ────────────

function emailWrapper(brandColor: string, businessName: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f7f7f7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="520" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td style="background:${brandColor};padding:24px 32px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">${businessName}</p>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;background:#f7f7f7;border-top:1px solid #ebebeb;">
            <p style="margin:0;font-size:11px;color:#929292;">Este correo fue enviado automáticamente. No respondas a este mensaje.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Confirmación de cita en efectivo ──────────────────────────────────────

export async function sendCashConfirmation(params: {
  to: string
  businessName: string
  fromEmail: string
  brandColor: string
  customerName: string
  serviceName: string
  date: string          // "martes, 1 de julio de 2026"
  time: string          // "9:00 AM"
  price: number
  confirmationCode: string
}) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;">¡Tu cita está confirmada!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;">Hola ${params.customerName}, aquí está el resumen de tu cita.</p>

    <!-- Detalles -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #ebebeb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f7f7f7;"><td style="padding:12px 16px;font-size:12px;font-weight:600;color:#929292;text-transform:uppercase;letter-spacing:0.5px;">Servicio</td><td style="padding:12px 16px;font-size:14px;color:#111111;font-weight:600;">${params.serviceName}</td></tr>
      <tr><td style="padding:12px 16px;font-size:12px;font-weight:600;color:#929292;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #ebebeb;">Fecha</td><td style="padding:12px 16px;font-size:14px;color:#111111;border-top:1px solid #ebebeb;">${params.date}</td></tr>
      <tr style="background:#f7f7f7;"><td style="padding:12px 16px;font-size:12px;font-weight:600;color:#929292;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #ebebeb;">Hora</td><td style="padding:12px 16px;font-size:14px;color:#111111;border-top:1px solid #ebebeb;">${params.time}</td></tr>
      <tr><td style="padding:12px 16px;font-size:12px;font-weight:600;color:#929292;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #ebebeb;">Total</td><td style="padding:12px 16px;font-size:14px;font-weight:700;color:#111111;border-top:1px solid #ebebeb;">$${params.price.toFixed(2)}</td></tr>
    </table>

    <!-- Código de confirmación -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">Tu código de confirmación</p>
      <p style="margin:0;font-size:32px;font-weight:800;letter-spacing:8px;color:#166534;">${params.confirmationCode}</p>
      <p style="margin:8px 0 0;font-size:12px;color:#4ade80;">Preséntalo al llegar al salón</p>
    </div>

    <p style="margin:0;font-size:13px;color:#929292;">El pago se realiza en el local. Si necesitas cancelar, contáctanos con anticipación.</p>
  `
  await getResend().emails.send({
    from: params.fromEmail,
    to:   params.to,
    subject: `Cita confirmada — ${params.serviceName} · Código ${params.confirmationCode}`,
    html: emailWrapper(params.brandColor, params.businessName, body),
  })
}

// ── Confirmación de pago exitoso (tarjeta o Lightning) ────────────────────

export async function sendPaymentConfirmation(params: {
  to: string
  businessName: string
  fromEmail: string
  brandColor: string
  customerName: string
  serviceName: string
  date: string
  time: string
  price: number
  method: 'card' | 'lightning'
}) {
  const methodLabel = params.method === 'card' ? 'Tarjeta' : 'Lightning (Bitcoin)'
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;">¡Pago recibido!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:#555555;">Hola ${params.customerName}, tu pago fue procesado exitosamente.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #ebebeb;border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f7f7f7;"><td style="padding:12px 16px;font-size:12px;font-weight:600;color:#929292;text-transform:uppercase;letter-spacing:0.5px;">Servicio</td><td style="padding:12px 16px;font-size:14px;color:#111111;font-weight:600;">${params.serviceName}</td></tr>
      <tr><td style="padding:12px 16px;font-size:12px;font-weight:600;color:#929292;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #ebebeb;">Fecha</td><td style="padding:12px 16px;font-size:14px;color:#111111;border-top:1px solid #ebebeb;">${params.date}</td></tr>
      <tr style="background:#f7f7f7;"><td style="padding:12px 16px;font-size:12px;font-weight:600;color:#929292;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #ebebeb;">Hora</td><td style="padding:12px 16px;font-size:14px;color:#111111;border-top:1px solid #ebebeb;">${params.time}</td></tr>
      <tr><td style="padding:12px 16px;font-size:12px;font-weight:600;color:#929292;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #ebebeb;">Total pagado</td><td style="padding:12px 16px;font-size:14px;font-weight:700;color:#111111;border-top:1px solid #ebebeb;">$${params.price.toFixed(2)}</td></tr>
      <tr style="background:#f7f7f7;"><td style="padding:12px 16px;font-size:12px;font-weight:600;color:#929292;text-transform:uppercase;letter-spacing:0.5px;border-top:1px solid #ebebeb;">Método</td><td style="padding:12px 16px;font-size:14px;color:#111111;border-top:1px solid #ebebeb;">${methodLabel}</td></tr>
    </table>

    <p style="margin:0;font-size:13px;color:#929292;">Nos vemos pronto. Si tienes alguna duda, responde a este correo.</p>
  `
  await getResend().emails.send({
    from: params.fromEmail,
    to:   params.to,
    subject: `Pago confirmado — ${params.serviceName}`,
    html: emailWrapper(params.brandColor, params.businessName, body),
  })
}
