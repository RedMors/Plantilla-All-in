-- nail_store: sección de tienda (e-commerce) para la plantilla salon-unas
-- Para una nueva plantilla: COPIAR este archivo y cambiar "nail_" por el nuevo prefijo.
-- Reusa el patrón de pagos de nail_payments (provider_reference/url/payload) para el checkout.

-- ─── Categorías ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nail_product_categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        NOT NULL UNIQUE,
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── Productos ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nail_products (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id  uuid          REFERENCES nail_product_categories(id) ON DELETE SET NULL,

  name         text          NOT NULL,
  slug         text          NOT NULL UNIQUE,
  description  text,

  price        numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url    text,

  -- Control de inventario
  stock        int           NOT NULL DEFAULT 0 CHECK (stock >= 0),

  -- Organización en la tienda
  is_featured  boolean       NOT NULL DEFAULT false,   -- destacado (se muestra primero)
  is_active    boolean       NOT NULL DEFAULT true,     -- activar/ocultar sin borrar
  sort_order   int           NOT NULL DEFAULT 0,

  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nail_products_category_idx ON nail_products (category_id);
CREATE INDEX IF NOT EXISTS nail_products_active_idx   ON nail_products (is_active, is_featured);

-- ─── Pedidos ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nail_orders (
  id                 uuid          PRIMARY KEY DEFAULT gen_random_uuid(),

  customer_name      text          NOT NULL,
  customer_phone     text          NOT NULL,
  customer_email     text,

  status             text          NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending','paid','failed','expired','cancelled','fulfilled')),

  total              numeric(10,2) NOT NULL CHECK (total >= 0),

  -- Pago (mismo patrón que nail_payments): cash | card | lightning
  method             text          CHECK (method IN ('cash','card','lightning')),
  confirmation_code  text,
  provider_reference text,          -- "order:{orderId}" o paymentHash — lookup en webhooks
  provider_url       text,          -- URL de pago (Wompi)
  provider_payload   jsonb,

  paid_at            timestamptz,
  stock_applied      boolean       NOT NULL DEFAULT false,  -- evita descontar stock dos veces
  created_at         timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nail_orders_provider_ref_idx
  ON nail_orders (provider_reference) WHERE provider_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS nail_orders_status_idx ON nail_orders (status);

-- ─── Líneas del pedido ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nail_order_items (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid          NOT NULL REFERENCES nail_orders(id) ON DELETE CASCADE,
  product_id   uuid          REFERENCES nail_products(id) ON DELETE SET NULL,

  product_name text          NOT NULL,          -- snapshot del nombre al momento de la compra
  unit_price   numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity     int           NOT NULL CHECK (quantity > 0),

  created_at   timestamptz   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nail_order_items_order_idx ON nail_order_items (order_id);

-- ─── Descuento atómico de stock (se llama al confirmar el pago) ────────────────
-- Descuenta el stock de cada producto del pedido, sin bajar de 0, una sola vez.
CREATE OR REPLACE FUNCTION nail_apply_order_stock(p_order_id uuid)
RETURNS void AS $$
BEGIN
  -- Solo aplica si el pedido aún no descontó stock
  IF NOT EXISTS (SELECT 1 FROM nail_orders WHERE id = p_order_id AND stock_applied = false) THEN
    RETURN;
  END IF;

  UPDATE nail_products p
  SET stock = GREATEST(0, p.stock - oi.quantity),
      updated_at = now()
  FROM nail_order_items oi
  WHERE oi.order_id = p_order_id AND oi.product_id = p.id;

  UPDATE nail_orders SET stock_applied = true WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql;

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE nail_product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nail_products           ENABLE ROW LEVEL SECURITY;
ALTER TABLE nail_orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE nail_order_items        ENABLE ROW LEVEL SECURITY;

-- Público (anon): puede LEER categorías y productos activos para mostrar la tienda.
DROP POLICY IF EXISTS "Categorías públicas" ON nail_product_categories;
CREATE POLICY "Categorías públicas"
  ON nail_product_categories FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Productos activos públicos" ON nail_products;
CREATE POLICY "Productos activos públicos"
  ON nail_products FOR SELECT TO anon USING (is_active = true);

-- Pedidos y líneas: SOLO service_role (adminDb server-side). Sin política para anon.

COMMENT ON TABLE nail_products IS
  'Productos de la tienda de salon-unas. Patrón replicable: copiar con prefijo carwash_, etc.';
