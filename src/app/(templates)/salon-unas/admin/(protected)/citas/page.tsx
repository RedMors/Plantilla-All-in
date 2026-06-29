import { adminDb } from '@/lib/supabase/admin'
import { updateAppointmentStatus } from '../../admin-actions'

export const dynamic = 'force-dynamic'

const BRAND = '#C4965A'
const INK   = '#0B0B0B'
const STONE = '#EDE9E3'
const CREAM = '#FAF9F6'
const MUTED = '#6B6560'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#22c55e',
  completed: '#3b82f6',
  cancelled: '#9ca3af',
}

function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default async function CitasPage() {
  const db = adminDb()

  const { data: appointments } = await db
    .from('nail_appointments')
    .select('*, nail_services(name, price)')
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })
    .limit(100)

  const grouped: Record<string, typeof appointments> = {}
  for (const appt of appointments ?? []) {
    const d = String(appt.appointment_date)
    if (!grouped[d]) grouped[d] = []
    grouped[d]!.push(appt)
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: INK }}>Todas las citas</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>{appointments?.length ?? 0} citas registradas</p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center" style={{ border: `1px solid ${STONE}` }}>
          <p style={{ color: MUTED }}>No hay citas todavía.</p>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date} className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${STONE}` }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: STONE, background: CREAM }}>
              <p className="font-semibold text-sm" style={{ color: INK }}>
                {new Date(date + 'T12:00:00').toLocaleDateString('es-SV', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>{grouped[date]!.length} cita(s)</p>
            </div>
            <div className="divide-y" style={{ borderColor: STONE }}>
              {grouped[date]!.map((appt: {
                id: string
                appointment_time: string
                customer_name: string
                customer_phone: string
                message: string | null
                status: string
                nail_services: { name: string; price: number } | null
              }) => {
                const statusColor = STATUS_COLOR[appt.status] ?? '#9ca3af'
                const statusLabel = STATUS_LABEL[appt.status] ?? appt.status
                return (
                  <div key={appt.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="shrink-0 w-16 text-center">
                      <p className="text-sm font-semibold" style={{ color: INK }}>{formatTime(appt.appointment_time)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: INK }}>{appt.customer_name}</p>
                      <p className="text-xs" style={{ color: MUTED }}>
                        {appt.nail_services?.name ?? 'Servicio'} · ${appt.nail_services?.price ?? '—'}
                      </p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>{appt.customer_phone}</p>
                      {appt.message && (
                        <p className="text-xs mt-1 italic" style={{ color: MUTED }}>"{appt.message}"</p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: statusColor + '22', color: statusColor }}
                      >
                        {statusLabel}
                      </span>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {appt.status === 'pending' && (
                          <>
                            <form action={updateAppointmentStatus.bind(null, appt.id, 'confirmed')}>
                              <button type="submit" className="text-xs px-2.5 py-1 rounded-full font-semibold hover:opacity-80 transition-opacity" style={{ background: INK, color: '#fff' }}>Confirmar</button>
                            </form>
                            <form action={updateAppointmentStatus.bind(null, appt.id, 'cancelled')}>
                              <button type="submit" className="text-xs px-2.5 py-1 rounded-full font-semibold hover:opacity-80 transition-opacity" style={{ background: STONE, color: MUTED }}>Cancelar</button>
                            </form>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <form action={updateAppointmentStatus.bind(null, appt.id, 'completed')}>
                            <button type="submit" className="text-xs px-2.5 py-1 rounded-full font-semibold hover:opacity-80 transition-opacity" style={{ background: BRAND, color: '#fff' }}>Completada</button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
