// Fuente única de verdad para valores estáticos del template — importar desde aquí,
// no hardcodear en cada archivo. Client + Server Components pueden importar esto.

export const BRAND = '#ff385c'

export const NAV_LINKS = [
  { href: '/salon-unas-lite/servicios', label: 'Servicios' },
  { href: '/salon-unas-lite/galeria',   label: 'Galería' },
  { href: '/salon-unas-lite/opiniones', label: 'Opiniones' },
  { href: '/salon-unas-lite/contacto',  label: 'Contacto' },
] as const
