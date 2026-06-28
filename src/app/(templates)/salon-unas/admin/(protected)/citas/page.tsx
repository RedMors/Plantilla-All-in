import { adminDb } from '@/lib/supabase/admin'
import { updateAppointmentStatus } from '../../admin-actions'

export const dynamic = 'force-dynamic'

const BRAND = '#ff385c'

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Todas las citas</h1>
          <p className="text-sm text-[#6a6a6a] mt-1">{appointments?.length ?? 0} citas registradas</p>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#dddddd] p-12 text-center">
          <p className="text-[#929292]">No hay citas todavía.</p>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date} className="bg-white rounded-2xl border border-[#dddddd] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#f0f0f0] bg-[#fafafa]">
              <p className="font-semibold text-[#222222] text-sm">
                {new Date(date + 'T12:00:00').toLocaleDateString('es-SV', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
              <p className="text-xs text-[#929292] mt-0.5">{grouped[date]!.length} cita(s)</p>
            </div>
            <div className="divide-y divide-[#f7f7f7]">
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
                      <p className="text-sm font-semibold text-[#222222]">{formatTime(appt.appointment_time)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#222222] text-sm">{appt.customer_name}</p>
                      <p className="text-xs text-[#6a6a6a]">
                        {appt.nail_services?.name ?? 'Servicio'} · ${appt.nail_services?.price ?? '—'}
                      </p>
                      <p className="text-xs text-[#929292]">{appt.customer_phone}</p>
                      {appt.message && (
                        <p className="text-xs text-[#6a6a6a] mt-1 italic">"{appt.message}"</p>
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
                              <button type="submit" className="text-xs px-2.5 py-1 rounded-full font-semibold text-white bg-[#22c55e] hover:opacity-80 transition-opacity">Confirmar</button>
                            </form>
                            <form action={updateAppointmentStatus.bind(null, appt.id, 'cancelled')}>
                              <button type="submit" className="text-xs px-2.5 py-1 rounded-full font-semibold text-white bg-[#9ca3af] hover:opacity-80 transition-opacity">Cancelar</button>
                            </form>
                          </>
                        )}
                        {appt.status === 'confirmed' && (
                          <form action={updateAppointmentStatus.bind(null, appt.id, 'completed')}>
                            <button type="submit" className="text-xs px-2.5 py-1 rounded-full font-semibold text-white bg-[#3b82f6] hover:opacity-80 transition-opacity">Completada</button>
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
