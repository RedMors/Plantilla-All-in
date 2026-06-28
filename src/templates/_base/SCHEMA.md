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

-- Admin total (dueña autenticada)
CREATE POLICY "admin_all_{tabla}"
  ON {tabla} FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Service role total (Server Actions)
CREATE POLICY "service_all_{tabla}"
  ON {tabla} FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

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
