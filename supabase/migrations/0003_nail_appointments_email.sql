-- Agrega customer_email a nail_appointments (capturado en el paso de formulario del widget)
-- Si la columna ya existe no hace nada (idempotente)

ALTER TABLE nail_appointments
  ADD COLUMN IF NOT EXISTS customer_email text;
