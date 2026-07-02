// Fuente única de verdad para valores estáticos del template — importar desde aquí,
// no hardcodear en cada archivo. Client + Server Components pueden importar esto.
//
// IDENTIDAD (lite): beauty suave y moderna — rosa polvo + crema cálida + casi-negro
// tibio. Es deliberadamente opuesta a la variante full (oro champagne / negro / serif).
//
// REGLA DE ORO: ningún color hex suelto en los componentes. Todo sale de aquí.
// Ver DESIGN.md en esta misma carpeta para el contrato visual completo.

// ─── Acentos ──────────────────────────────────────────────────────────────
export const BRAND      = '#B86A82'  // rosa polvo — acento principal (CTAs, iconos, links)
export const ROSE_DEEP  = '#934F66'  // rosa profundo — hover/active y texto-acento de alto contraste

// ─── Superficies ──────────────────────────────────────────────────────────
export const BLUSH      = '#FBF4F1'  // fondo base cálido (reemplaza blanco puro y #f7f7f7)
export const PETAL      = '#F7E8E6'  // tint rosa para secciones/superficies (reemplaza el gris #f7f7f7)

// ─── Texto ────────────────────────────────────────────────────────────────
export const PLUM       = '#3A2A2E'  // casi-negro cálido — headings y texto fuerte (reemplaza #222222)
export const MAUVE      = '#8A7176'  // texto secundario/muted (reemplaza #6a6a6a)
export const MAUVE_SOFT = '#B6A4A7'  // texto/placeholder más suave (reemplaza #929292 y #ccc)

// ─── Líneas ───────────────────────────────────────────────────────────────
export const LINE       = '#EFE0DD'  // hairline borders (reemplaza #ebebeb)

// ─── Acento secundario (usar con MUCHA mesura) ─────────────────────────────
export const SAGE       = '#9DB29A'  // verde fresco que combina con el rosa — MÁXIMO 1–2 usos en todo el sitio

// ─── Forma y profundidad (para className o style) ──────────────────────────
export const RADIUS = {
  sm:   '12px',
  md:   '16px',
  lg:   '22px',
  card: '24px',
  pill: '9999px',
} as const

export const SHADOW = {
  soft: '0 4px 20px -4px rgba(184,106,130,0.14)',  // sombra rosa difusa — cards, hover suave
  card: '0 8px 30px -8px rgba(184,106,130,0.16)',  // card elevado
} as const

// ─── Navegación ───────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { href: '/salon-unas-lite/servicios', label: 'Servicios' },
  { href: '/salon-unas-lite/tienda',    label: 'Tienda' },
  { href: '/salon-unas-lite/galeria',   label: 'Galería' },
  { href: '/salon-unas-lite/contacto',  label: 'Contacto' },
] as const
