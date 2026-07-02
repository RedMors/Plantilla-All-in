-- nail_admin_users / nail_audit_log: roles de acceso al admin y trazabilidad de cambios.
--
-- IMPORTANTE — orden de despliegue obligatorio (evita bloquear el admin en producción):
--   1. Aplicar esta migración.
--   2. Sembrar la fila del primer 'owner' (ver INSERT comentado al final — requiere el
--      auth_user_id real, se resuelve server-side con el email del dueño).
--   3. Verificar con un SELECT que la fila existe y is_active = true.
--   4. Solo entonces desplegar el cambio de admin/(protected)/layout.tsx que exige esta tabla.
-- Si el layout se despliega antes del paso 3, NADIE puede entrar al admin (ni el owner).

CREATE TABLE IF NOT EXISTS nail_admin_users (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id   uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email          text        NOT NULL,
  full_name      text,
  role           text        NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),

  -- Secciones permitidas para 'staff' (ej. '{servicios,citas,ventas}'). 'owner' ignora esto
  -- (acceso total) — ver chequeo en el layout y en cada Server Action mutante.
  sections       text[]      NOT NULL DEFAULT '{}',

  is_active      boolean     NOT NULL DEFAULT true,
  created_by     uuid        REFERENCES auth.users(id),
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_login_at  timestamptz
);

CREATE INDEX IF NOT EXISTS nail_admin_users_auth_idx ON nail_admin_users (auth_user_id) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS nail_audit_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     uuid        REFERENCES auth.users(id),
  actor_email  text,        -- copia de conveniencia, evita join para mostrar en UI

  action       text        NOT NULL CHECK (action IN
                 ('create','update','delete','toggle_active','login','create_admin_user','export')),
  entity_type  text        NOT NULL,   -- 'service' | 'product' | 'category' | 'appointment' |
                                        -- 'manual_sale' | 'gallery_item' | 'admin_user' | 'business_info'
  entity_id    uuid,

  -- Snapshots para el diff en UI. NUNCA deben contener secretos (ej. contraseñas temporales) —
  -- ver nota en el plan de implementación sobre create_admin_user.
  before       jsonb,
  after        jsonb,

  metadata     jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nail_audit_log_entity_idx ON nail_audit_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS nail_audit_log_actor_idx  ON nail_audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS nail_audit_log_created_idx ON nail_audit_log (created_at DESC);

-- RLS: mismo patrón que nail_payments/nail_orders — solo service_role (adminDb) toca estas
-- tablas. Sin política para anon: acceso denegado por defecto.
ALTER TABLE nail_admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nail_audit_log   ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE nail_admin_users IS
  'Usuarios con acceso al panel admin de salon-unas (full + lite, comparten datos). Patrón replicable con otros prefijos.';
COMMENT ON TABLE nail_audit_log IS
  'Auditoría de cambios hechos desde el admin. before/after NUNCA deben contener secretos.';

-- Sembrar el primer owner (confirmado con el usuario: admin@akatrek.com).
-- Se ejecuta vía service role (REST/JS), NO requiere login al dashboard.
-- INSERT INTO nail_admin_users (auth_user_id, email, full_name, role, is_active)
-- VALUES ('83fa4808-93e2-4a77-b72e-1b58a66f495d', 'admin@akatrek.com', 'Owner', 'owner', true);
