# Estado del proyecto — Plantilla-All-in

> Templates web para negocios locales de El Salvador. La gracia: tener plantillas
> **funcionales** que se puedan usar tal cual o modificar para **vender como servicio**.
> Una sola instancia de Supabase; cada rubro opera sobre tablas con su propio prefijo.

**Stack:** Next.js 16.2.9 (App Router) · Supabase · Tailwind · Vercel.
**Convención de DB:** `src/templates/_base/SCHEMA.md` (prefijos `nail_`, `carwash_`, …).
**Reglas de skills y stack:** `AGENTS.md`.

---

## Plantillas

| Rubro | Ruta | Prefijo DB | Estado |
| ----- | ---- | ---------- | ------ |
| Salón de uñas — **full** | `/salon-unas` | `nail_` | ✅ Implementada (admin, pagos cash, mapa, galería) |
| Salón de uñas — **lite** | `/salon-unas-lite` | `nail_` | 🟡 Funcional, pero **rediseño rosa pendiente** |
| Carwash | `/carwash` | `carwash_` | ⏳ Pendiente |
| Vivero | `/vivero` | `vivero_` | ⏳ Pendiente |
| Gym | `/gym` | `gym_` | ⏳ Pendiente |
| Ferretería | `/ferreteria` | `ferreteria_` | ⏳ Pendiente |
| Comedor / Restaurante | `/comedor` | `comedor_` | ⏳ Pendiente |

---

## Las dos variantes del salón de uñas

Son **identidades opuestas a propósito** para mostrar rango al vender. Cada una
tiene su contrato visual cerrado en el `DESIGN.md` de su carpeta — esa es la
**única fuente de verdad** de colores, tipografía y componentes.

| | **full** (`salon-unas`) | **lite** (`salon-unas-lite`) |
| --- | --- | --- |
| Vibe | Oro / editorial / premium | Rosa / suave / cercano |
| Acento | `#C4965A` oro champagne | `#B86A82` rosa polvo |
| Fondo | `#FAF9F6` crema | `#FBF4F1` blush |
| Tipografía | Cormorant Garamond (serif) | Plus Jakarta Sans |
| Profundidad | Plano, cero sombras | Sombras rosadas difusas |
| Contrato | `salon-unas/DESIGN.md` | `salon-unas-lite/DESIGN.md` |

> Regla: **nombres descriptivos** (`lite` / `full`). No usamos marcas poéticas
> ("Studio Élite", "Blush Studio", etc.) — generaban confusión entre docs.

---

## Pendiente inmediato: migración visual del lite

El lite todavía renderiza con la identidad vieja (coral Airbnb + grises fríos +
`system-ui`). El rediseño rosa está **preparado pero no aplicado**:

- ✅ Tokens listos en `salon-unas-lite/constants.ts` (rosa, sombras, radios).
- ✅ Contrato visual en `salon-unas-lite/DESIGN.md` con el "Migration map" exacto.
- ⏳ Falta: aplicar el find→replace en los componentes y cargar Plus Jakarta Sans.

**Orden de migración:** `layout.tsx` → `page.tsx` → `SearchBar.tsx` →
`servicios/*` → `galeria/*` → `contacto/*`. Un archivo a la vez, revisando diff.

> Nota: al cambiar `constants.ts`, los componentes que importan `BRAND` ya pasan
> de coral a rosa automáticamente; los demás hex hardcodeados siguen pendientes
> hasta correr el Migration map.

---

## Dónde vive cada cosa

```
src/app/(templates)/
├── salon-unas/          ← variante full (oro/editorial)
│   ├── DESIGN.md          contrato visual (blindaje)
│   ├── constants.ts       tokens
│   └── template.config.ts brand #C4965A para emails de pago
└── salon-unas-lite/     ← variante lite (rosa/suave)
    ├── DESIGN.md          contrato visual + Migration map
    ├── constants.ts       tokens rosa (listos)
    └── template.config.ts brand #B86A82 para emails de pago

src/templates/_base/
├── SCHEMA.md                         convención de DB compartida
└── design-references/
    └── airbnb-lite-legacy.md         análisis Airbnb (identidad vieja del lite, histórico)

src/lib/payments/   flujo de pagos (cash; card/lightning pendientes)
src/lib/salon/      queries Supabase del salón
```

---

## Historial de orden (este pase)

- Se movieron los `DESIGN.md` (antes sueltos en `~/Downloads`) a su carpeta de template.
- Se reconciló el naming a descriptivo (`lite`/`full`) en `AGENTS.md` y docs.
- Se aplicaron los tokens rosa al `constants.ts` del lite (migración de componentes pendiente).
- Se corrigió `brand` en ambos `template.config.ts` para que coincida con cada paleta.
- Se movió `src/lib/design-airbnb.md` → `src/templates/_base/design-references/airbnb-lite-legacy.md`.
