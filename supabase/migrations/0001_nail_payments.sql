-- nail_payments: tabla de pagos para la plantilla salon-unas
-- Para una nueva plantilla: COPIAR este archivo, cambiar "nail_" por el nuevo prefijo
-- y cambiar la referencia a nail_appointments

CREATE TABLE IF NOT EXISTS nail_payments (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id     uuid        NOT NULL REFERENCES nail_appointments(id) ON DELETE CASCADE,

  -- Método: cash | card | lightning
  method             text        NOT NULL CHECK (method IN ('cash', 'card', 'lightning')),

  -- Estado del pago
  status             text        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'paid', 'failed', 'expired')),

  amount             numeric(10,2) NOT NULL CHECK (amount > 0),

  -- Efectivo: código que el cliente presenta al llegar
  confirmation_code  text,

  -- Wompi / Lightning: referencia con prefijo de plantilla para identificar en webhooks
  -- Formato: "nail:{appointmentId}"
  provider_reference text,

  -- Wompi: URL de pago a la que redirigir al cliente
  provider_url       text,

  -- Payload crudo del webhook (para auditoría y debug)
  provider_payload   jsonb,

  created_at         timestamptz NOT NULL DEFAULT now(),
  paid_at            timestamptz
);

-- Índice para webhooks: buscar por provider_reference en O(log n)
CREATE INDEX IF NOT EXISTS nail_payments_provider_ref_idx
  ON nail_payments (provider_reference)
  WHERE provider_reference IS NOT NULL;

-- Índice para admin dashboard: pagos por cita
CREATE INDEX IF NOT EXISTS nail_payments_appointment_idx
  ON nail_payments (appointment_id);

-- RLS: solo el service_role puede leer/escribir (admin + server actions)
ALTER TABLE nail_payments ENABLE ROW LEVEL SECURITY;

-- No hay política pública: la tabla solo se accede via adminDb() server-side
-- Si en el futuro el cliente necesita ver su propio pago, agregar política aquí

COMMENT ON TABLE nail_payments IS
  'Pagos de la plantilla salon-unas. Patrón replicable: copiar con prefijo carwash_, vivero_, etc.';
