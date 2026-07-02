# Convención de Base de Datos — Plantilla-All-in

Una sola instancia de Supabase. Cada tipo de plantilla tiene su propio prefijo de tabla.
Las tablas de distintas plantillas NO se mezclan — cada negocio opera sobre las suyas.

---

## Prefijos por tipo de plantilla

| Plantilla       | Prefijo DB     | Ruta URL          | Estado     |
|-----------------|----------------|-------------------|------------|
| Salón de uñas   | `nail_`        | `/salon-unas`     | ✅ Listo   |
| Carwash         | `carwash_`     | `/carwash`        | ⏳ Pending |
| Vivero          | `vivero_`      | `/vivero`         | ⏳ Pending |
| Gym             | `gym_`         | `/gym`            | ⏳ Pending |
| Ferretería      | `ferreteria_`  | `/ferreteria`     | ⏳ Pending |
| Comedor/Restaurante | `comedor_` | `/comedor`        | ⏳ Pending |

---

## Tablas obligatorias por plantilla

Toda plantilla debe tener estas tablas con el prefijo correspondiente:

### `{prefix}_services`
Catálogo de servicios o productos del negocio.
```sql
id           uuid PK
slug         text UNIQUE
name         text
description  text
price        numeric(10,2)
active       boolean DEFAULT true
sort_order   int DEFAULT 0
created_at   timestamptz DEFAULT now()
-- Columnas opcionales según el tipo de negocio
```

### `{prefix}_appointments` (para negocios de citas)
```sql
id                uuid PK DEFAULT gen_random_uuid()
service_id        uuid FK → {prefix}_services.id
appointment_date  date NOT NULL
appointment_time  time NOT NULL
customer_name     text NOT NULL
customer_phone    text NOT NULL
message           text
status            text CHECK IN ('pending','confirmed','completed','cancelled') DEFAULT 'pending'
created_at        timestamptz DEFAULT now()

-- Índice UNIQUE para prevenir doble booking:
UNIQUE INDEX ON (service_id, appointment_date, appointment_time)
  WHERE status IN ('pending', 'confirmed')
```

### `{prefix}_manual_sales`
Ventas registradas manualmente por el dueño del negocio.
```sql
id              uuid PK DEFAULT gen_random_uuid()
sale_date       date NOT NULL DEFAULT CURRENT_DATE
description     text NOT NULL
amount          numeric(10,2) NOT NULL
payment_method  text CHECK IN ('efectivo','transferencia','tarjeta') DEFAULT 'efectivo'
notes           text
created_at      timestamptz DEFAULT now()
```

---

## RLS estándar por tabla

```sql
-- Lectura pública (servicios, galería, testimonios)
CREATE POLICY "public_read_{tabla}"
  ON {tabla} FOR SELECT TO anon
  USING (active = true);

-- Escritura pública (citas del cliente)
CREATE POLICY "public_insert_appointments"
  ON {prefix}_appointments FOR INSERT TO anon
  WITH CHECK (true);

-- Service role total (Server Actions) — este es el único acceso de escritura del admin hoy.
CREATE POLICY "service_all_{tabla}"
  ON {tabla} FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

> ⚠️ **Superado (no usar en plantillas nuevas):** el patrón `admin_all_{tabla} ... TO authenticated
> USING (true)` que aparecía aquí antes daba acceso total del admin a **CUALQUIER** usuario
> autenticado del pool de Supabase Auth del proyecto — que es compartido entre plantillas/apps
> (confirmado: el mismo pool de Auth de `salon-unas` tiene usuarios de otros proyectos). Desde
> `salon-unas`, el gate real de acceso al admin vive en `admin/(protected)/layout.tsx`, que
> consulta `nail_admin_users` (ver abajo) — no en una política RLS de `authenticated`. Las
> Server Actions siguen usando `service_role` (bypassa RLS) como único camino de escritura;
> el control de "quién puede entrar al admin" es a nivel de aplicación, no de RLS.

### `{prefix}_admin_users` — acceso al panel admin
```sql
id             uuid PK DEFAULT gen_random_uuid()
auth_user_id   uuid NOT NULL UNIQUE FK → auth.users.id
email          text NOT NULL
full_name      text
role           text CHECK IN ('owner','staff') DEFAULT 'staff'
sections       text[] DEFAULT '{}'   -- solo aplica a 'staff'; 'owner' tiene acceso total
is_active      boolean DEFAULT true
created_by     uuid FK → auth.users.id
created_at     timestamptz DEFAULT now()
last_login_at  timestamptz
```
El `layout.tsx` del admin exige una fila `is_active=true` en esta tabla, no solo sesión válida.

### `{prefix}_audit_log` — trazabilidad de cambios
```sql
id           uuid PK DEFAULT gen_random_uuid()
actor_id     uuid FK → auth.users.id
actor_email  text
action       text CHECK IN ('create','update','delete','toggle_active','login','create_admin_user','export')
entity_type  text NOT NULL
entity_id    uuid
before       jsonb   -- NUNCA debe contener secretos (ej. contraseñas temporales)
after        jsonb   -- NUNCA debe contener secretos
metadata     jsonb
created_at   timestamptz DEFAULT now()
```
Se llena con una llamada explícita a `logAudit()` al final de cada Server Action mutante — no
con triggers de Postgres (el service role no expone el actor de sesión HTTP al trigger sin
infraestructura adicional).

---

## Estructura de archivos por plantilla

```
src/
  app/(templates)/{nombre}/
    page.tsx              ← página pública principal
    layout.tsx            ← metadata
    servicios/[slug]/
      page.tsx            ← detalle de servicio
    admin/
      layout.tsx          ← auth guard
      page.tsx            ← dashboard
      citas/page.tsx      ← historial completo
      ventas/page.tsx     ← ventas manuales
      login/page.tsx      ← acceso
      auth-actions.ts     ← signIn / signOut
      admin-actions.ts    ← updateStatus / addSale
  lib/{nombre}/
    queries.ts            ← todas las queries públicas (anon key)
```

---

## Credenciales de admin por plantilla (demo)

Todos los demos usan `admin@akatrek.com` como dueño.
En producción, cada cliente tiene su propio usuario de Supabase Auth.
