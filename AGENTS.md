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

## Al implementar features de pagos
- **`security-review`** — antes de mergear cualquier feature que toque Wompi, Blink o manejo de tokens de pago.
- **`incremental-implementation`** — para flujos complejos de múltiples pasos (Wompi EnlacePago + webhook + estado de reserva).

## Al optimizar
- **`verify`** / **`run`** — para confirmar que un cambio funciona en el browser real antes de reportar como terminado.
- **`simplify`** — después de implementaciones grandes, para limpiar código redundante.
- **`performance-optimization`** — si hay problemas de LCP, bundle size, o queries lentas.

## Al crear formularios de reserva o contacto
- **`form-cro`** — para mejorar conversión del booking form y contacto.

## Al crear una plantilla nueva (carwash, gym, vivero, etc.)
- **`anthropic-skills:theme-factory`** — genera el design system completo de la plantilla: paleta, tipografía, tokens, constantes. Invócalo ANTES de escribir código de una plantilla nueva.
- **`design:design-system`** — cuando haya 4+ plantillas activas, para formalizar el sistema de `constants.ts` compartido entre templates.

## Al optimizar las páginas públicas de cada plantilla
- **`page-cro`** — el homepage de cada plantilla es una landing page de conversión. Invócalo cuando el dueño del negocio reporte pocas reservas o al auditar una plantilla antes de entregarla.

## Al construir componentes UI complejos
- **`frontend-ui-engineering`** — BookingWidget, formulario de pagos Wompi, display de QR Lightning, animaciones de entrada. Diferente a los skills de diseño — es sobre ingeniería del componente.

## Al diseñar APIs y webhooks
- **`api-and-interface-design`** — al diseñar los endpoints de webhooks (Wompi/Blink) y las Server Actions de pagos antes de implementarlos.

## Al preparar para producción real
- **`observability-and-instrumentation`** — cuando haya clientes reales. Invócalo para definir qué errores loggear, qué métricas capturar, y cómo monitorear fallos de pago.
- **`design:accessibility-review`** — los sitios públicos se venden a negocios reales. Invócalo antes de entregar cada plantilla a un cliente.

## Al agregar dependencias nuevas
- **`anthropic-skills:dependency-auditor`** — antes de instalar cualquier paquete nuevo (framer-motion, librerías de pagos, etc.). Valida bundle size, licencias y vulnerabilidades.

## Al actualizar versiones del stack
- **`deprecation-and-migration`** — cuando Next.js o Supabase lancen breaking changes. Invócalo para planificar la migración sin romper plantillas en producción.

## Skills que NO se usan en este proyecto
`seo-redmors-*`, `small-business:*`, `productivity:*`, `email-sequence`, `paid-ads`,
`social-content`, `docx`, `pdf`, `pptx`, `xlsx`, `anthropic-skills:humanizer`,
`anthropic-skills:algorithmic-art`, `competitor-alternatives`, `referral-program`,
`free-tool-strategy`. No los invoques aunque parezcan relevantes superficialmente.

---

# Stack de este proyecto

- **Working dir:** `/Users/alexismartinez/multi modal/Plantilla-All-in/`
- **Stack:** Next.js 16.2.9 App Router · Supabase (`bulbmkuvemxwwizfefzi`) · Tailwind CSS · Vercel
- **Fuentes:** Geist (body, via `--font-geist-sans`) · Cormorant Garamond (display/headings, via `--font-cormorant`)
- **Paleta Studio Élite:** BRAND `#C4965A` · INK `#0B0B0B` · STONE `#EDE9E3` · CREAM `#FAF9F6`
- **Paleta Pinterest Lite:** BRAND `#ff385c` · fondo blanco · bordes `#ebebeb`
- **NUNCA tocar:** `~/Trip-App/` ni `~/akatrek-app/` (producción Akatrek)
- **NUNCA en client components:** `SUPABASE_SERVICE_ROLE_KEY`
