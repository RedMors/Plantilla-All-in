import { notFound } from "next/navigation";
import { getService, getRelatedServices, services } from "@/lib/salon-unas-data";
import Link from "next/link";

const BRAND = "#ff385c";

export async function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.name} — Nails by Mariela`,
    description: service.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = getRelatedServices(service.related);

  return (
    <div
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      className="min-h-screen bg-white text-[#222222]"
    >
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#dddddd]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/salon-unas" className="flex items-center gap-2 shrink-0">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: BRAND }}
            >
              N
            </span>
            <span className="font-semibold text-[#222222] hidden sm:block">
              Nails by Mariela
            </span>
          </Link>
          <Link
            href="/salon-unas#reservar"
            className="shrink-0 px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: BRAND }}
          >
            Reservar cita
          </Link>
        </div>
      </header>

      {/* ── HERO DEL SERVICIO ────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${service.gradient.from} 0%, ${service.gradient.to} 100%)`,
            opacity: 0.15,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-[#6a6a6a] mb-6">
            <Link href="/salon-unas" className="hover:underline">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/salon-unas#servicios" className="hover:underline">
              Servicios
            </Link>
            <span>/</span>
            <span className="text-[#222222] font-medium">{service.name}</span>
          </nav>

          <div className="flex items-start gap-6">
            {/* Emoji blob */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
              style={{
                background: `linear-gradient(135deg, ${service.gradient.from}, ${service.gradient.to})`,
              }}
            >
              {service.emoji}
            </div>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: BRAND }}>
                {service.tagline}
              </p>
              <h1 className="text-4xl font-bold text-[#222222] mb-3 leading-tight">
                {service.name}
              </h1>
              <p className="text-lg text-[#3f3f3f] max-w-2xl leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* ── COLUMNA PRINCIPAL ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-12">

            {/* OPCIONES / VARIANTES */}
            <section>
              <h2 className="text-xl font-bold text-[#222222] mb-6">
                Elige tu opción
              </h2>
              <div className="space-y-3">
                {service.variants.map((variant, i) => (
                  <label
                    key={i}
                    className="flex items-start gap-4 p-5 rounded-2xl border border-[#dddddd] cursor-pointer hover:border-[#ff385c] transition-colors group"
                  >
                    <input
                      type="radio"
                      name="variant"
                      defaultChecked={i === 0}
                      className="mt-1 accent-[#ff385c] w-4 h-4 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="font-semibold text-[#222222]">
                          {variant.name}
                        </span>
                        <span className="font-bold text-lg" style={{ color: BRAND }}>
                          ${variant.price}
                        </span>
                      </div>
                      <p className="text-sm text-[#6a6a6a] mt-1">
                        {variant.description}
                        {variant.duration !== "—" && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-[#929292]">
                            ⏱ {variant.duration}
                          </span>
                        )}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* QUÉ INCLUYE */}
            <section>
              <h2 className="text-xl font-bold text-[#222222] mb-5">
                ¿Qué incluye?
              </h2>
              <ul className="space-y-3">
                {service.includes.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#3f3f3f]">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shrink-0"
                      style={{ background: BRAND }}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* PREGUNTAS FRECUENTES */}
            <section>
              <h2 className="text-xl font-bold text-[#222222] mb-6">
                Preguntas frecuentes
              </h2>
              <div className="space-y-4">
                {service.faqs.map((faq, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-[#f7f7f7]"
                  >
                    <p className="font-semibold text-[#222222] mb-2">
                      {faq.q}
                    </p>
                    <p className="text-sm text-[#3f3f3f] leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── SIDEBAR RESERVA ──────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-[#dddddd] p-6 shadow-sm bg-white">
              <p className="text-sm text-[#6a6a6a] mb-1">Desde</p>
              <p className="text-4xl font-bold text-[#222222] mb-1">
                ${service.price}
                <span className="text-base font-normal text-[#6a6a6a]"> / servicio</span>
              </p>
              <div className="flex items-center gap-1 text-sm text-[#6a6a6a] mb-6">
                <span style={{ color: BRAND }}>★ 4.9</span>
                <span>· 48 reseñas</span>
              </div>

              <div className="mb-6 space-y-2">
                {/* Fecha */}
                <div className="rounded-2xl border border-[#dddddd] p-3 focus-within:border-[#222222] transition-colors">
                  <p className="text-xs font-semibold text-[#929292] uppercase tracking-widest mb-2">
                    Fecha
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      aria-label="Día"
                      className="col-span-1 bg-[#f7f7f7] rounded-xl px-2 py-1.5 text-sm text-[#222222] outline-none border-0 cursor-pointer"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    <select
                      aria-label="Mes"
                      className="col-span-1 bg-[#f7f7f7] rounded-xl px-2 py-1.5 text-sm text-[#222222] outline-none border-0 cursor-pointer"
                    >
                      {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      aria-label="Año"
                      className="col-span-1 bg-[#f7f7f7] rounded-xl px-2 py-1.5 text-sm text-[#222222] outline-none border-0 cursor-pointer"
                    >
                      <option>2025</option>
                      <option>2026</option>
                    </select>
                  </div>
                </div>

                {/* Hora */}
                <div className="rounded-2xl border border-[#dddddd] p-3 focus-within:border-[#222222] transition-colors">
                  <p className="text-xs font-semibold text-[#929292] uppercase tracking-widest mb-2">
                    Hora
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"].map((h) => (
                      <label
                        key={h}
                        className="flex items-center justify-center py-1.5 rounded-xl text-sm cursor-pointer border border-[#ebebeb] hover:border-[#ff385c] hover:text-[#ff385c] transition-colors has-[:checked]:border-[#ff385c] has-[:checked]:text-[#ff385c] has-[:checked]:font-semibold"
                      >
                        <input type="radio" name="hora" className="sr-only" defaultChecked={h === "9:00 AM"} />
                        {h}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button
                className="w-full py-3.5 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90 mb-3"
                style={{ background: BRAND }}
              >
                Reservar ahora
              </button>
              <p className="text-xs text-[#929292] text-center">
                No se cobra hasta confirmar la cita
              </p>

              <div className="mt-5 pt-5 border-t border-[#dddddd] space-y-2 text-sm text-[#3f3f3f]">
                <div className="flex justify-between">
                  <span>{service.name}</span>
                  <span>${service.price}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#222222] pt-2 border-t border-[#ebebeb]">
                  <span>Total</span>
                  <span>${service.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SERVICIOS RELACIONADOS ──────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#dddddd]">
            <h2 className="text-xl font-bold text-[#222222] mb-6">
              También te puede interesar
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/salon-unas/servicios/${rel.slug}`}
                  className="group flex flex-col rounded-2xl border border-[#dddddd] overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Color strip */}
                  <div
                    className="h-28 flex items-center justify-center text-4xl"
                    style={{
                      background: `linear-gradient(135deg, ${rel.gradient.from}, ${rel.gradient.to})`,
                    }}
                  >
                    {rel.emoji}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="font-semibold text-[#222222] mb-1 group-hover:underline">
                      {rel.name}
                    </p>
                    <p className="text-sm text-[#6a6a6a] flex-1 mb-3 line-clamp-2">
                      {rel.tagline}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: BRAND }}>
                        Desde ${rel.price}
                      </span>
                      <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background: "#ffd1da", color: BRAND }}
                      >
                        Ver más →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
