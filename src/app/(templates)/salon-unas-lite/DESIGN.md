# DESIGN.md — salon-unas-lite (identidad rosa)

> **Identidad:** beauty brand suave, cálida y moderna. Rosa polvo, crema cálida
> y un casi-negro tibio. Sans moderno. Es **deliberadamente distinta** a la
> variante full (oro champagne / negro / serif editorial). No la acerques a esa.

> **CÓMO USAR ESTE ARCHIVO (importante):**
> Este DESIGN.md es un contrato cerrado, no una invitación a rediseñar.
> Tu trabajo es aplicar EXACTAMENTE estos tokens dentro de la estructura
> de páginas que ya existe. No inventes paletas, no cambies layouts, no
> agregues secciones nuevas, no toques la lógica (server actions, queries,
> booking). Si algo no está especificado aquí, deja el comportamiento como
> está. Menos es más.

> **ESTADO:** los tokens ya viven en `constants.ts`. Los componentes todavía
> usan hex hardcodeados de la versión anterior (coral Airbnb). La migración
> está pendiente — ver el "Migration map" más abajo.

---

## 1. Visual Theme & Atmosphere

- **Mood:** suave, femenino, fresco, cercano. "Salón de barrio moderno y cuidado", no lujo intimidante.
- **Densidad:** aireada. Mucho respiro entre secciones (`py-16` a `py-24`).
- **Filosofía:** la personalidad la cargan el **color cálido**, las **formas redondeadas** y las **sombras rosadas difusas** — no efectos llamativos. Calma > impacto.
- **Anti-meta:** que NO parezca clon de Airbnb ni dashboard SaaS. Cero coral `#ff385c`, cero grises fríos.

---

## 2. Color Palette & Roles

Todos los colores viven en `constants.ts`. **Ningún hex suelto en componentes.**

| Token        | Hex       | Rol |
| ------------ | --------- | --- |
| `BRAND`      | `#B86A82` | Acento principal: CTAs rellenos, iconos, links, precios |
| `ROSE_DEEP`  | `#934F66` | Hover/active de CTAs; texto-acento cuando necesita más contraste |
| `BLUSH`      | `#FBF4F1` | Fondo base de toda la página (reemplaza el blanco puro) |
| `PETAL`      | `#F7E8E6` | Fondo de secciones alternas y superficies suaves |
| `PLUM`       | `#3A2A2E` | Headings y texto fuerte (casi-negro tibio, nunca negro frío) |
| `MAUVE`      | `#8A7176` | Texto secundario / descripciones |
| `MAUVE_SOFT` | `#B6A4A7` | Placeholders, texto terciario, iconos inactivos |
| `LINE`       | `#EFE0DD` | Bordes hairline, divisores |
| `SAGE`       | `#9DB29A` | Acento secundario fresco — **máximo 1–2 usos en TODO el sitio** |

### Migration map (find → replace exacto)

La estructura ya está bien; solo hay que cambiar valores. Reemplaza cada
hex hardcodeado por el token correspondiente (importándolo de `constants.ts`):

| Antes (hardcoded) | Después (token) | Notas |
| ----------------- | --------------- | ----- |
| `#ff385c`         | `BRAND`         | el coral de Airbnb — fuera por completo |
| `#222222`         | `PLUM`          | headings / texto fuerte |
| `#3f3f3f`         | `MAUVE`         | links de nav en estado base |
| `#6a6a6a`         | `MAUVE`         | texto secundario |
| `#929292`         | `MAUVE_SOFT`    | texto terciario en footer |
| `#ccc`            | `MAUVE_SOFT`    | flechas / iconos inactivos |
| `#ebebeb`         | `LINE`          | bordes |
| `#f7f7f7`         | `PETAL`         | fondos de sección y placeholders de imagen |
| `bg-white` (página)| `BLUSH`        | el fondo base deja de ser blanco puro |

> Las cards SÍ pueden seguir siendo blancas (`#fff`) sobre fondo `BLUSH`/`PETAL`
> para que floten. El blanco se reserva para cards, no para el fondo de página.

---

## 3. Typography Rules

- **Familia única:** `Plus Jakarta Sans` (sans geométrico moderno, suave). Se carga con `next/font/google` en `salon-unas-lite/layout.tsx`, igual que la full carga Cormorant. **No uses** Inter, Roboto, Arial ni `system-ui`.
- La personalidad sale del **contraste de peso y tamaño**, no de mezclar fuentes.

| Uso            | Peso | Tamaño                          | Color  | Tracking |
| -------------- | ---- | ------------------------------- | ------ | -------- |
| H1 (hero)      | 800  | `clamp(34px, 6vw, 60px)`        | `PLUM` o blanco sobre foto | `-0.02em` |
| H2 (sección)   | 700  | `clamp(24px, 3vw, 34px)`        | `PLUM` | `-0.01em` |
| H3 (card)      | 600  | `15–16px`                       | `PLUM` | normal |
| Body           | 400  | `15–16px`, `leading-relaxed`    | `MAUVE`| normal |
| Eyebrow / tag  | 600  | `11px`, `uppercase`             | `BRAND`| `0.2em` |
| Precio         | 700  | `14–15px`                       | `BRAND`| normal |

**Snippet exacto para `layout.tsx`** (única edición de layout permitida — espeja cómo la full carga su fuente):

```tsx
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
})

// en el <div> raíz del layout:
//   className={`${jakarta.variable} min-h-screen flex flex-col`}
//   style={{ fontFamily: 'var(--font-jakarta), sans-serif', background: BLUSH, color: PLUM }}
```

---

## 4. Component Stylings

### Botón primario (CTA "Reservar")
- `rounded-full`, `px-7 py-3`, `font-semibold text-sm`, texto blanco.
- Fondo `BRAND`; hover → `ROSE_DEEP` (no `opacity`). `active:scale-[0.97]`.
- Transición: `transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]`.
- A11y: si quieres AA estricto en la etiqueta, sube el label a 15–16px **o** usa `ROSE_DEEP` como fondo.

### Botón secundario
- `rounded-full`, `px-7 py-3`, borde `1px LINE`, texto `PLUM`, fondo transparente.
- Hover: fondo `PETAL`.

### Card (servicio / sección)
- Fondo blanco `#fff` sobre página `BLUSH`. `rounded-[24px]` (`RADIUS.card`).
- Sombra `SHADOW.soft`; hover → `SHADOW.card` + `-translate-y-0.5`.
- **Sin borde gris.** Si necesita borde, `1px LINE`. Nunca `border-gray-*`.

### Input / SearchBar
- `rounded-full` (search) o `rounded-[16px]` (textarea/inputs de formulario).
- Borde `1px LINE`; focus → borde `BRAND` + `ring-2` de `BRAND` al 15% de opacidad.
- Placeholder en `MAUVE_SOFT`.

### Nav (header)
- Sticky, fondo `BLUSH/95` + `backdrop-blur-sm`, borde inferior `1px LINE`.
- Links en `MAUVE`, hover `PLUM`.
- Logo: círculo `BRAND` con la inicial en blanco (ya existe — solo cambia el color vía `BRAND`).

### Iconos
- `lucide-react`, `strokeWidth={1.8}`, color `BRAND` o `MAUVE`. Tamaño 18–20.

---

## 5. Layout Principles

- **Ancho de contenido:** `max-w-6xl` para grids, `max-w-3xl` para texto/búsqueda.
- **Padding lateral:** `px-6`.
- **Ritmo vertical:** secciones `py-16` → `py-24`. Alterna fondo `BLUSH` / `PETAL` para separar bloques sin líneas duras.
- **Grids:** `gap-5` a `gap-6`. Servicios en `sm:grid-cols-3`, section-cards en `sm:grid-cols-2`.
- **No** metas bento asimétrico ni layouts rotados. Esta plantilla es ordenada y suave a propósito.

---

## 6. Depth & Elevation

- Sombras **siempre rosadas y difusas**, nunca negras/grises:
  - Reposo: `SHADOW.soft` → `0 4px 20px -4px rgba(184,106,130,0.14)`
  - Elevado/hover: `SHADOW.card` → `0 8px 30px -8px rgba(184,106,130,0.16)`
- Prohibido: `shadow-md`, `shadow-lg` de Tailwind y cualquier `rgba(0,0,0,…)` en sombras.
- Jerarquía de superficie: `BLUSH` (página) < `PETAL` (sección) < `#fff` (card flotante).

---

## 7. Do's and Don'ts

**Do**
- Mantener la estructura de páginas actual; solo recolorear y resuavizar.
- Fondo de página cálido (`BLUSH`), cards blancas que flotan.
- Sombras rosadas, esquinas grandes, mucho aire.
- Un único acento (`BRAND`); `SAGE` casi nunca.

**Don't**
- ❌ Volver al coral `#ff385c` ni a cualquier rosa neón/fucsia.
- ❌ Grises fríos (`#22..`, `#6a..`, `#eb..`) — todo migra a la paleta cálida.
- ❌ Serif (eso es de la variante full).
- ❌ Sombras negras, bordes grises duros, esquinas cuadradas.
- ❌ Inventar secciones, animaciones llamativas o "hero rediseñado". No es el encargo.

---

## 8. Responsive Behavior

- Mobile-first. Breakpoint principal `sm:` (640px), secundario `md:` (768px).
- Hero: `h-[420px]` aprox en mobile, texto centrado; nunca `h-screen` (usa `min-h-[…]`).
- Grids colapsan a `grid-cols-1` con `gap-5`.
- Touch targets ≥ 44px. Botones `py-3` ya cumplen.
- Nav: links visibles en `md:`, `MobileNav` (hamburguesa) debajo de eso.

---

## 9. Referencia rápida de color

`BRAND #B86A82` · `ROSE_DEEP #934F66` · `BLUSH #FBF4F1` · `PETAL #F7E8E6` ·
`PLUM #3A2A2E` · `MAUVE #8A7176` · `MAUVE_SOFT #B6A4A7` · `LINE #EFE0DD` · `SAGE #9DB29A`

### Nota de accesibilidad

El rosa `#B86A82` sobre botón con texto blanco da ~3.6:1 de contraste (pasa AA
solo para texto grande/bold). Para el CTA con label `text-sm` semibold está en
el límite. Para AA estricto: sube el label a 15–16px **o** usa `ROSE_DEEP`
(`#934F66`) como fondo del botón.

### Orden de migración recomendado

`layout.tsx` → `page.tsx` → `SearchBar.tsx` → `servicios/*` → `galeria/*` →
`contacto/*`. Un archivo a la vez, mostrando el diff antes de seguir.
