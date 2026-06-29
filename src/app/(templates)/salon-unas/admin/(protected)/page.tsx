import { adminDb } from '@/lib/supabase/admin'
import { updateAppointmentStatus } from '../admin-actions'

export const dynamic = 'force-dynamic'

const BRAND       = '#C4965A'
const BRAND_LIGHT = '#F0E4CF'
const INK         = '#0B0B0B'
const STONE       = '#EDE9E3'
const CREAM       = '#FAF9F6'
const MUTED       = '#6B6560'

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

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-SV', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export default async function AdminDashboard() {
  const db = adminDb()
  const today = new Date().toISOString().split('T')[0]

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const monthStart = today.slice(0, 7) + '-01'

  const [
    { data: todayAppts },
    { data: recentAppts },
    { count: pendingCount },
    { count: confirmedCount },
    { data: monthAppts },
    { data: weekData },
  ] = await Promise.all([
    db.from('nail_appointments')
      .select('*, nail_services(name, price)')
      .eq('appointment_date', today)
      .neq('status', 'cancelled')
      .order('appointment_time')
      .limit(50),

    db.from('nail_appointments')
      .select('*, nail_services(name, price)')
      .gte('appointment_date', today)
      .neq('status', 'cancelled')
      .order('appointment_date')
      .order('appointment_time')
      .limit(20),

    db.from('nail_appointments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),

    db.from('nail_appointments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'confirmed'),

    db.from('nail_appointments')
      .select('nail_services(price)')
      .in('status', ['confirmed', 'completed'])
      .gte('appointment_date', monthStart),

    db.from('nail_appointments')
      .select('appointment_date, status')
      .gte('appointment_date', weekStartStr)
      .lte('appointment_date', today)
      .neq('status', 'cancelled'),
  ])

  // Supabase infiere nail_services como array en el tipo aunque en runtime es objeto único
  const monthRevenue = (monthAppts ?? []).reduce((sum, a) => {
    const svc = a.nail_services as unknown as { price: number } | null
    return sum + (svc?.price ?? 0)
  }, 0)

  const dayMap: Record<string, number> = {}
  for (const a of weekData ?? []) {
    const d = String(a.appointment_date)
    dayMap[d] = (dayMap[d] ?? 0) + 1
  }
  const maxDay = Math.max(...Object.values(dayMap), 1)

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split('T')[0]
    return { label: days[i], key, count: dayMap[key] ?? 0, isToday: key === today }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: INK }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>
          {new Date().toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Citas hoy',    value: todayAppts?.length ?? 0,      color: INK   },
          { label: 'Pendientes',   value: pendingCount ?? 0,             color: '#92713A' },
          { label: 'Confirmadas',  value: confirmedCount ?? 0,           color: '#3d7a4e' },
          { label: 'Ingresos mes', value: `$${monthRevenue.toFixed(0)}`, color: INK   },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-5" style={{ border: `1px solid ${STONE}` }}>
            <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: MUTED }}>{stat.label}</p>
            <p className="text-3xl font-bold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="bg-white rounded-2xl p-6" style={{ border: `1px solid ${STONE}` }}>
        <h2 className="text-sm font-semibold mb-5" style={{ color: INK }}>Citas esta semana</h2>
        <div className="flex items-end gap-2 h-24">
          {weekDays.map(day => (
            <div key={day.key} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                <div
                  className="w-full rounded-t-lg transition-all"
                  style={{
                    height: day.count > 0 ? `${Math.max((day.count / maxDay) * 80, 8)}px` : '4px',
                    background: day.isToday ? INK : day.count > 0 ? BRAND_LIGHT : STONE,
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: MUTED }}>{day.label}</span>
              {day.count > 0 && (
                <span className="text-xs font-semibold" style={{ color: day.isToday ? INK : BRAND }}>
                  {day.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Today appointments */}
      <div className="bg-white rounded-2xl p-6" style={{ border: `1px solid ${STONE}` }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold" style={{ color: INK }}>Citas de hoy</h2>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: BRAND_LIGHT, color: '#92713A' }}
          >
            {todayAppts?.length ?? 0} citas
          </span>
        </div>

        {!todayAppts?.length ? (
          <p className="text-sm text-center py-8" style={{ color: MUTED }}>No hay citas para hoy.</p>
        ) : (
          <div className="space-y-3">
            {todayAppts.map((appt: {
              id: string
              appointment_time: string
              customer_name: string
              customer_phone: string
              status: string
              nail_services: { name: string; price: number } | null
            }) => (
              <AppointmentRow key={appt.id} appt={appt} />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      {(recentAppts?.filter((a: { appointment_date: string }) => a.appointment_date !== today).length ?? 0) > 0 && (
        <div className="bg-white rounded-2xl p-6" style={{ border: `1px solid ${STONE}` }}>
          <h2 className="font-bold mb-5" style={{ color: INK }}>Próximas citas</h2>
          <div className="space-y-3">
            {recentAppts!
              .filter((a: { appointment_date: string }) => a.appointment_date !== today)
              .map((appt: {
                id: string
                appointment_date: string
                appointment_time: string
                customer_name: string
                customer_phone: string
                status: string
                nail_services: { name: string; price: number } | null
              }) => (
                <AppointmentRow key={appt.id} appt={appt} showDate />
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

type Appt = {
  id: string
  appointment_date?: string
  appointment_time: string
  customer_name: string
  customer_phone: string
  status: string
  nail_services: { name: string; price: number } | null
}

function AppointmentRow({ appt, showDate = false }: { appt: Appt; showDate?: boolean }) {
  const statusColor = STATUS_COLOR[appt.status] ?? '#9ca3af'
  const statusLabel = STATUS_LABEL[appt.status] ?? appt.status

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl" style={{ background: CREAM }}>
      <div className="shrink-0 text-center min-w-[48px]">
        {showDate && appt.appointment_date && (
          <p className="text-xs leading-tight" style={{ color: MUTED }}>{formatDate(appt.appointment_date)}</p>
        )}
        <p className="text-sm font-semibold" style={{ color: INK }}>{formatTime(appt.appointment_time)}</p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: INK }}>{appt.customer_name}</p>
        <p className="text-xs" style={{ color: MUTED }}>{appt.nail_services?.name ?? 'Servicio'} · ${appt.nail_services?.price ?? '—'}</p>
        <p className="text-xs" style={{ color: '#9ca3af' }}>{appt.customer_phone}</p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <span
          className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ background: statusColor + '22', color: statusColor }}
        >
          {statusLabel}
        </span>
        {appt.status === 'pending' && (
          <div className="flex gap-1">
            <form action={updateAppointmentStatus.bind(null, appt.id, 'confirmed')}>
              <button
                type="submit"
                className="text-xs px-2.5 py-1 rounded-full font-semibold transition-opacity hover:opacity-80"
                style={{ background: INK, color: '#fff' }}
              >
                Confirmar
              </button>
            </form>
            <form action={updateAppointmentStatus.bind(null, appt.id, 'cancelled')}>
              <button
                type="submit"
                className="text-xs px-2.5 py-1 rounded-full font-semibold transition-opacity hover:opacity-80"
                style={{ background: STONE, color: MUTED }}
              >
                Cancelar
              </button>
            </form>
          </div>
        )}
        {appt.status === 'confirmed' && (
          <form action={updateAppointmentStatus.bind(null, appt.id, 'completed')}>
            <button
              type="submit"
              className="text-xs px-2.5 py-1 rounded-full font-semibold transition-opacity hover:opacity-80"
              style={{ background: BRAND, color: '#fff' }}
            >
              Completada
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
