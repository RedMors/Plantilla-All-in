-- Mensajes de contacto del formulario público
-- Patrón replicable: copiar con prefijo carwash_contact_messages, vivero_, etc.

CREATE TABLE IF NOT EXISTS nail_contact_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  phone      text        NOT NULL,
  service    text,
  message    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at    timestamptz              -- null = no leído, para badge en admin
);

ALTER TABLE nail_contact_messages ENABLE ROW LEVEL SECURITY;
-- Solo service_role (adminDb) puede leer — nunca el cliente anónimo
