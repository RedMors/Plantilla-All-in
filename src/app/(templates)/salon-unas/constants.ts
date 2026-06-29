// Fuente única de verdad para el template — importar desde aquí, nunca hardcodear.
// Client + Server Components pueden importar esto.

export const BRAND      = '#C4965A'   // champagne gold — acento principal
export const BRAND_LIGHT = '#F0E4CF'  // tint dorado para fondos
export const INK        = '#0B0B0B'   // casi negro — hero, footer, headings fuertes
export const CREAM      = '#FAF9F6'   // fondo base cálido (reemplaza blanco puro)
export const STONE      = '#EDE9E3'   // borders y superficies suaves
export const STONE_MID  = '#D4CCC0'   // borders más marcados
export const TEXT       = '#1A1A1A'   // texto principal
export const MUTED      = '#6B6560'   // texto secundario/muted

export const NAV_LINKS = [
  { href: '/salon-unas/servicios', label: 'Servicios' },
  { href: '/salon-unas/galeria',   label: 'Galería'   },
  { href: '/salon-unas/contacto',  label: 'Contacto'  },
] as const
