# DESIGN.md — salon-unas (identidad oro / editorial — full)

> **Identidad:** estudio de uñas premium. Oro champagne, casi-negro, crema cálida
> y serif clásico de alto contraste. Es **deliberadamente distinta** a la variante
> lite (rosa polvo / sans suave). No la acerques a esa.

> **CÓMO USAR ESTE ARCHIVO (importante):**
> Esta identidad **ya está implementada y funcionando** en el código. Este
> DESIGN.md existe para BLINDARLA: que cualquier cambio futuro respete estos
> tokens en vez de improvisar. Tu trabajo NO es rediseñar — es mantener la
> coherencia. No cambies la paleta, no metas sombras, no metas rosa, no
> cambies el serif por un sans. Si algo no está aquí, déjalo como está.

---

## 1. Visual Theme & Atmosphere

- **Mood:** premium, sofisticado, editorial de revista. Lujo cálido, no frío.
- **Densidad:** muy aireada y dramática. Hero casi a pantalla completa, tipografía gigante.
- **Filosofía:** alto contraste (negro/crema/oro) + serif imponente + **superficies planas**. La elegancia viene de la tipografía y el espacio, no de efectos.
- **Anti-meta:** que NO parezca template suave ni "amigable". Es aspiracional y editorial.

---

## 2. Color Palette & Roles

Todos en `constants.ts`. **Ningún hex suelto en componentes.**

| Token         | Hex       | Rol |
| ------------- | --------- | --- |
| `BRAND`       | `#C4965A` | Oro champagne — acento principal: eyebrows, palabra-acento en itálica, CTAs, bordes de botón |
| `BRAND_LIGHT` | `#F0E4CF` | Tint dorado para fondos suaves |
| `INK`         | `#0B0B0B` | Casi-negro — hero, footer, headings fuertes |
| `CREAM`       | `#FAF9F6` | Fondo base cálido (reemplaza el blanco puro) |
| `STONE`       | `#EDE9E3` | Bordes y superficies suaves |
| `STONE_MID`   | `#D4CCC0` | Bordes más marcados |
| `TEXT`        | `#1A1A1A` | Texto principal sobre fondo claro |
| `MUTED`       | `#6B6560` | Texto secundario / muted |

> **Regla de superficie:** el fondo de página es `CREAM`, nunca blanco puro.
> Las secciones oscuras usan `INK`. El oro `BRAND` es acento, **nunca** fondo de área grande.

---

## 3. Typography Rules

- **Display / headings:** `Cormorant Garamond` (serif clásico de alto contraste). Ya cargado vía `next/font/google` en `salon-unas/layout.tsx` como `--font-cormorant`.
- **Cuerpo / UI:** sans del sistema (`--font-geist-sans, system-ui`). El serif es SOLO para títulos y palabras-acento.
- Firma de la marca: la **palabra-acento en itálica y color `BRAND`** dentro del H1 (ej. "*por ti.*").

| Uso            | Fuente    | Peso | Tamaño                    | Color | Tracking |
| -------------- | --------- | ---- | ------------------------- | ----- | -------- |
| H1 (hero)      | Cormorant | 600  | `clamp(52px, 8vw, 96px)`  | blanco/`INK`, acento `BRAND` itálica | `-0.01em` |
| H2 (sección)   | Cormorant | 600  | `clamp(28px, 3vw, 40px)`  | `INK` | `-0.01em` |
| Body           | sans      | 400  | `16–18px`, `leading-relaxed` | `MUTED` | normal |
| Eyebrow / tag  | sans      | 600  | `10–11px`, `uppercase`    | `BRAND` | `0.25em`–`0.35em` |
| Nav links      | sans      | 500  | `11px`, `uppercase`       | `MUTED` → `INK` hover | `0.1em`–`0.12em` |

> El `tracking` ancho en mayúsculas (`0.25em`+) en eyebrows y nav es parte de la firma. No lo quites.

---

## 4. Component Stylings

### Botón primario (CTA "Reservar cita")
- `rounded-full`, `px-8 py-4`, `text-sm font-semibold tracking-wide`, texto blanco, fondo `BRAND`.
- Ícono final (flecha) **anidado en su propio círculo**: `w-6 h-6 rounded-full bg-black/15 flex items-center justify-center`.
- Hover `opacity-90`, `active:scale-[0.97]`, `transition-all duration-300` con `cubic-bezier(0.32,0.72,0,1)`.

### Botón secundario
- `rounded-full`, `px-8 py-4`, borde `1px` (`border-white/25` sobre oscuro, o `STONE_MID` sobre claro), texto translúcido.
- Hover: sube opacidad del borde y del texto. **Sin relleno.**

### Botón outline-oro (nav)
- Borde `BRAND`, texto `BRAND`, `rounded-full`, `px-5 py-2.5`, `text-[11px] uppercase tracking-[0.12em]`.
- Hover: invierte → fondo `BRAND`, texto blanco.

### Card
- Radios contenidos: `rounded-xl` / `rounded-2xl` (NO radios gigantes tipo `[24px]+`).
- **Sin sombra.** La separación viene de bordes `STONE`/`STONE_MID` y del fondo `CREAM` vs blanco/`INK`.
- Hover sutil: cambio de borde o leve `opacity`/`translate`, nunca una sombra que aparece.

### Bloque de cifras (pilares)
- Números grandes en serif `Cormorant`, label pequeño en sans uppercase con tracking. Separados por bordes `STONE`.

---

## 5. Layout Principles

- **Ancho:** `max-w-6xl`, padding `px-6`.
- **Hero:** `min-h-[92vh]`, contenido alineado a la izquierda, anclado abajo (`flex flex-col justify-end pb-20 pt-32`). Imagen de fondo al ~30% opacidad sobre `INK` con gradiente lateral.
- **Ritmo:** secciones generosas; alterna `CREAM` e `INK` para drama. Eyebrow → H2 serif → contenido.
- **Asimetría editorial** permitida (texto a un lado, contenido al otro), pero ordenada. Nada rotado ni "bento".

---

## 6. Depth & Elevation

- **Superficies planas. Cero sombras.** La jerarquía se logra con:
  - Contraste de fondo: `INK` (oscuro) vs `CREAM` (claro) vs blanco (card).
  - Bordes hairline: `STONE` (suave) y `STONE_MID` (marcado).
  - Sobre el hero: gradientes de `INK` (`from-[#0B0B0B] via-[#0B0B0B]/80 to-transparent`).
- Prohibido: `shadow-md`/`shadow-lg`, sombras de color, glows. Si aparece una sombra, el diseño falla.

---

## 7. Do's and Don'ts

**Do**
- Serif `Cormorant` en títulos + palabra-acento itálica en oro.
- Fondo `CREAM`, secciones `INK` para contraste, oro solo como acento.
- Eyebrows en mayúsculas con tracking ancho.
- Superficies planas con bordes finos.

**Don't**
- ❌ Meter rosa o coral (eso es de la variante lite).
- ❌ Agregar sombras (esta plantilla es plana a propósito).
- ❌ Cambiar el serif por un sans en los títulos.
- ❌ Radios gigantes/pillowy en las cards (mantén `xl`/`2xl`).
- ❌ Usar el oro `BRAND` como fondo de áreas grandes — es acento.
- ❌ Rediseñar el hero o "modernizarlo". Ya está terminado.

---

## 8. Responsive Behavior

- Mobile-first; breakpoints `sm:` (640) y `md:` (768).
- Hero: el `clamp()` ya escala el H1; en mobile reduce `pt`/`pb` y mantén alineación izquierda.
- Nunca `h-screen` rígido — usa `min-h-[92vh]` / `min-h-[100dvh]`.
- Nav: labels uppercase visibles en `md:`, `MobileNav` debajo.
- Touch targets ≥ 44px (los `py-4` cumplen).

---

## 9. Referencia rápida de color

`BRAND #C4965A` · `BRAND_LIGHT #F0E4CF` · `INK #0B0B0B` · `CREAM #FAF9F6` ·
`STONE #EDE9E3` · `STONE_MID #D4CCC0` · `TEXT #1A1A1A` · `MUTED #6B6560`
