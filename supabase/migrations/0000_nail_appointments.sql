-- nail_appointments: tabla base de citas para la plantilla salon-unas
-- Para una nueva plantilla: COPIAR este archivo, cambiar "nail_" por el nuevo prefijo
-- Esta migración debe aplicarse ANTES que 0001_nail_payments.sql

CREATE TABLE IF NOT EXISTS nail_appointments (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  service_id       uuid        NOT NULL,
  variant_id       uuid,

  appointment_date date        NOT NULL,
  appointment_time time        NOT NULL,

  customer_name    text        NOT NULL,
  customer_phone   text        NOT NULL,
  customer_email   text,

  message          text,
  status           text        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),

  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Índice para el admin dashboard: citas por fecha
CREATE INDEX IF NOT EXISTS nail_appointments_date_idx
  ON nail_appointments (appointment_date);

-- Índice para rate limiting: citas pendientes por teléfono
CREATE INDEX IF NOT EXISTS nail_appointments_phone_status_idx
  ON nail_appointments (customer_phone, status)
  WHERE status = 'pending';

-- Índice para disponibilidad de slots: servicio + fecha + estado
CREATE INDEX IF NOT EXISTS nail_appointments_slots_idx
  ON nail_appointments (service_id, appointment_date, status)
  WHERE status IN ('pending', 'confirmed');

-- UNIQUE constraint anti double-booking: una cita por servicio/fecha/hora/estado activo
-- (Reemplaza el constraint que fue aplicado directamente en Supabase en una sesión anterior)
CREATE UNIQUE INDEX IF NOT EXISTS nail_appointments_no_double_booking
  ON nail_appointments (service_id, appointment_date, appointment_time)
  WHERE status IN ('pending', 'confirmed');

-- RLS: el cliente anónimo solo puede leer fecha y hora (para mostrar slots disponibles)
ALTER TABLE nail_appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Slots públicos — solo fecha y hora"
  ON nail_appointments
  FOR SELECT
  TO anon
  USING (status IN ('pending', 'confirmed'));

-- service_role (adminDb) bypasses RLS — puede leer/escribir todo sin política adicional

COMMENT ON TABLE nail_appointments IS
  'Citas de la plantilla salon-unas. Patrón replicable: copiar con prefijo carwash_, vivero_, etc.';
