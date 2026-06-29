-- Mejoras de constraints en nail_payments:
-- 1. Cambia CHECK (amount > 0) a CHECK (amount >= 0) para permitir servicios gratuitos
-- 2. Agrega UNIQUE en confirmation_code para evitar colisiones de referencia
-- 3. Agrega índice parcial en status para queries del admin dashboard

-- 1. Permite amount = 0 (consultas gratuitas, descuentos 100%, etc.)
ALTER TABLE nail_payments
  DROP CONSTRAINT IF EXISTS nail_payments_amount_check;

ALTER TABLE nail_payments
  ADD CONSTRAINT nail_payments_amount_check CHECK (amount >= 0);

-- 2. UNIQUE en confirmation_code (código que el cliente presenta al llegar)
ALTER TABLE nail_payments
  ADD CONSTRAINT nail_payments_confirmation_code_unique UNIQUE (confirmation_code);

-- 3. Índice parcial para el admin: pagos pendientes de confirmar
CREATE INDEX IF NOT EXISTS nail_payments_status_pending_idx
  ON nail_payments (status)
  WHERE status = 'pending';
