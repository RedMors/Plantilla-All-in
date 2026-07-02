-- Migración de captura: nail_gallery, nail_testimonials, nail_service_variants
-- Estas 3 tablas YA EXISTEN en producción (creadas manualmente en algún momento anterior)
-- pero nunca tuvieron su DDL versionado en el repo. Esta migración documenta el schema
-- real (columnas confirmadas vía introspección REST) para que el repo deje de tener
-- schema no versionado.
--
-- IMPORTANTE — RLS intencionalmente NO tocado aquí:
-- No pude determinar el estado real de RLS/políticas de estas tablas (el MCP de Supabase
-- está sin ningún permiso, y no hay acceso a pg_policies vía REST sin login al dashboard).
-- El acceso público hoy funciona (confirmado: la anon key lee nail_gallery con HTTP 200).
-- Activar `ENABLE ROW LEVEL SECURITY` a ciegas, sin saber si ya existe o falta la política
-- de lectura pública, podría romper /salon-unas/galeria y /salon-unas/servicios/[slug]
-- (testimonios) en producción. Por eso este archivo NO incluye ALTER TABLE de RLS —
-- solo documenta columnas. Las tablas ya existen, así que CREATE TABLE IF NOT EXISTS
-- es un no-op seguro en el entorno actual.
--
-- Si se recrea el proyecto desde cero (nuevo entorno), habrá que agregar manualmente:
--   ALTER TABLE nail_gallery ENABLE ROW LEVEL SECURITY;
--   CREATE POLICY "Galería pública" ON nail_gallery FOR SELECT TO anon USING (active = true);
--   (mismo patrón para nail_testimonials)

CREATE TABLE IF NOT EXISTS nail_gallery (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   text        NOT NULL,
  alt_text    text,
  sort_order  int         NOT NULL DEFAULT 0,
  active      boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nail_gallery_active_idx ON nail_gallery (active, sort_order);

CREATE TABLE IF NOT EXISTS nail_testimonials (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name  text        NOT NULL,
  text           text        NOT NULL,
  stars          smallint    NOT NULL CHECK (stars BETWEEN 1 AND 5),
  active         boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nail_testimonials_active_idx ON nail_testimonials (active);

CREATE TABLE IF NOT EXISTS nail_service_variants (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id   uuid          NOT NULL REFERENCES nail_services(id) ON DELETE CASCADE,
  name         text          NOT NULL,
  price        numeric(10,2) NOT NULL CHECK (price >= 0),
  duration     text,
  description  text,
  sort_order   int           NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS nail_service_variants_service_idx ON nail_service_variants (service_id, sort_order);

COMMENT ON TABLE nail_gallery IS
  'Galería pública de salon-unas. Creada manualmente antes de versionar migraciones — este archivo documenta su schema real, no crea nada nuevo en el entorno actual.';
COMMENT ON TABLE nail_testimonials IS
  'Testimonios públicos de salon-unas. Mismo caso que nail_gallery — captura, no creación.';
COMMENT ON TABLE nail_service_variants IS
  'Variantes de precio/duración por servicio. Mismo caso — captura, no creación.';
