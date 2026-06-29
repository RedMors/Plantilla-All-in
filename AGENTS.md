<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Skills — cuándo invocarlos automáticamente

No explores el directorio de skills. Invoca directamente según estas reglas:

## Siempre después de commits de código
- **`/critico`** — invócalo automáticamente al terminar cualquier sesión que incluya `git commit`. No esperes que el usuario lo pida.

## Al tocar Next.js 16
- **`nextjs-best-practices`** — invócalo si vas a escribir código que toque: `params`/`searchParams` en page/layout, middleware, caching (`fetch`, `unstable_cache`, `'use cache'`), o Server Actions. Next.js 16 tiene breaking changes reales.

## Al diseñar o modificar UI visual
- **`redesign-existing-projects`** — ya instalado en `.agents/skills/`. Invócalo al crear una página nueva o rediseñar una existente.
- **`high-end-visual-design`** — ya instalado en `.agents/skills/`. Invócalo cuando el task es explícitamente mejorar la estética (no solo añadir funcionalidad).

## Al tocar el schema de Supabase
- **`anthropic-skills:database-schema-advisor`** — invócalo antes de escribir cualquier migración SQL nueva. Valida naming, RLS, índices, y relaciones antes de aplicar.

## Al hacer deploy o configurar variables de entorno
- **`anthropic-skills:vercel-master`** — invócalo cuando el task involucre Vercel: dominios, env vars, edge config, o deployment de una plantilla nueva.

## Al integrar WhatsApp o Meta
- **`anthropic-skills:washos-meta-whatsapp`** — skill específico de este proyecto. Invócalo para el botón flotante de WhatsApp y notificaciones de citas.

## Al escribir queries complejas de Supabase
- **`anthropic-skills:sql-queries`** — invócalo para tablas de pagos (`nail_payments`, webhooks Wompi/Blink) o joins complejos entre plantillas.

---

# Stack de este proyecto

- **Working dir:** `/Users/alexismartinez/multi modal/Plantilla-All-in/`
- **Stack:** Next.js 16.2.9 App Router · Supabase (`bulbmkuvemxwwizfefzi`) · Tailwind CSS · Vercel
- **Fuentes:** Geist (body, via `--font-geist-sans`) · Cormorant Garamond (display/headings, via `--font-cormorant`)
- **Paleta Studio Élite:** BRAND `#C4965A` · INK `#0B0B0B` · STONE `#EDE9E3` · CREAM `#FAF9F6`
- **Paleta Pinterest Lite:** BRAND `#ff385c` · fondo blanco · bordes `#ebebeb`
- **NUNCA tocar:** `~/Trip-App/` ni `~/akatrek-app/` (producción Akatrek)
- **NUNCA en client components:** `SUPABASE_SERVICE_ROLE_KEY`
