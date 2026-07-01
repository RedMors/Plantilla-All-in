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
| Salón de uñas — **full** | `/salon-unas` | `nail_` | ✅ Implementada (admin, pagos cash, mapa, galería). 🟡 Wompi + Lightning en integración |
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

src/lib/payments/   flujo de pagos (cash ✅; card/Wompi + lightning/Blink en integración)
src/lib/salon/      queries Supabase del salón
```

---

## Pagos — Wompi (tarjeta) + Lightning (Blink)

**Estado:** ✅ **Wompi (tarjeta) y Lightning (Blink) implementados y verificados end-to-end** en local.
`config.methods: ['cash','card','lightning']`. Credenciales en `.env.local` (Wompi test app + Blink USD wallet).
URL de producción (Vercel): `https://plantillas-zeta.vercel.app`.
Se reusó la lógica probada de **Akatrek (`~/Trip-App/`) como referencia de SOLO LECTURA**
— adaptada (no copiada textual) al patrón de `src/lib/payments/`.

### Lo implementado (este pase)
- `src/lib/payments/wompi.ts` → OAuth client-credentials + `POST /EnlacePago` +
  `verifyWompiWebhook` (HMAC) + `consultWompiEnlacePago` (reconciliar).
- `src/lib/payments/lightning.ts` → `createLightningInvoice` + `getLightningStatus` (polling) +
  `verifyBlinkSecret` (Blink usa `?secret=` en la URL, NO HMAC).
- Webhooks: `src/app/api/payments/wompi/webhook/route.ts` y `.../blink/webhook/route.ts`
  → `status='paid'`, `paid_at`, cita `confirmed`, `provider_payload` crudo.
- `actions.ts`: `bookAppointment` ramifica por método (cash / redirect Wompi / invoice Lightning).
  Nueva action `checkLightningPayment(paymentId)` para polling desde el cliente.
- `BookingWidget.tsx`: selector gateado por `config.methods`, redirect a Wompi, paso Lightning
  (deep link `lightning:` + invoice copiable + spinner de espera + polling cada 4s).
- `template.config.ts`: `methods: ['cash', 'card', 'lightning']`. Credenciales en `.env.local`.

### Estructura multi-cliente (credenciales por plantilla)
`src/lib/payments/credentials.ts` resuelve las llaves por prefijo: busca la específica del
cliente (`WOMPI_PUBLIC_KEY_<PREFIJO>`, `BLINK_API_KEY_<PREFIJO>`, …) y cae a la compartida
(`WOMPI_PUBLIC_KEY`, `BLINK_API_KEY`, …). Activar un cliente con cuenta propia = SOLO agregar
env vars con el sufijo del prefijo; cero código.

Reglas operativas de la config actual de demos (detalle sensible en la memoria privada del asistente):
- **NO registrar el webhook de Blink** en el dashboard (un solo callback por cuenta).
- El salón confirma Lightning con **polling** (`checkLightningPayment`), no necesita webhook.

### Lo que falta para cerrar (producción en Vercel)
- **Agregar en Vercel** las env vars de pago (hoy Vercel solo tiene las 3 de Supabase):
  `NEXT_PUBLIC_APP_URL=https://plantillas-zeta.vercel.app`, `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`,
  `WOMPI_EVENTS_SECRET`, `BLINK_API_KEY`, `BLINK_WALLET_ID`, `BLINK_WEBHOOK_SECRET`.
- **Commit + push** del código de pagos (hoy está sin subir → prod corre código viejo sin pagos).
- **Wompi panel:** Redirect `…/salon-unas/servicios?pago=ok` y webhook `…/api/payments/wompi/webhook`.
- Correr **`security-review`** antes de mergear (regla AGENTS.md).
- ⚠️ Secrets de Wompi/Blink viajaron por chat → **rotarlos** al montar en prod.

### Referencia Akatrek (read-only — NUNCA modificar `~/Trip-App/`)
| Necesito… | Mirar en Akatrek |
| --- | --- |
| OAuth + EnlacePago + verificación de firma Wompi | `~/Trip-App/src/lib/wompi.ts` |
| Invoice USD Lightning (GraphQL Blink) | `~/Trip-App/src/lib/blink.ts` |
| Handler de webhook Wompi | `~/Trip-App/src/app/api/trips/wompi/webhook/route.ts` |
| Handler de webhook Blink | `~/Trip-App/src/app/api/blink/webhook/route.ts` |
| Mapa para ubicar cualquier cosa | `~/Trip-App/.claude/CODEBASE_MAP.md` (graphify) |

### Env vars necesarias (mismos nombres que Akatrek)
```
WOMPI_PUBLIC_KEY=        WOMPI_PRIVATE_KEY=
WOMPI_WEBHOOK_SECRET=    WOMPI_EVENTS_SECRET=      # HMAC — REQUERIDO en prod
BLINK_API_KEY=          BLINK_WALLET_ID=          # wallet USD stablesats
BLINK_WEBHOOK_SECRET=                             # HMAC — REQUERIDO en prod
```

---

## Historial de orden (este pase)

- Se movieron los `DESIGN.md` (antes sueltos en `~/Downloads`) a su carpeta de template.
- Se reconciló el naming a descriptivo (`lite`/`full`) en `AGENTS.md` y docs.
- Se aplicaron los tokens rosa al `constants.ts` del lite (migración de componentes pendiente).
- Se corrigió `brand` en ambos `template.config.ts` para que coincida con cada paleta.
- Se movió `src/lib/design-airbnb.md` → `src/templates/_base/design-references/airbnb-lite-legacy.md`.
