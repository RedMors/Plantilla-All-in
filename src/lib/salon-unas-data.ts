export type ServiceVariant = {
  name: string;
  price: number;
  duration: string;
  description: string;
};

export type Service = {
  slug: string;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  image: string;
  gradient: { from: string; to: string };
  variants: ServiceVariant[];
  includes: string[];
  faqs: { q: string; a: string }[];
  related: string[];
};

export const services: Service[] = [
  {
    slug: "manicure-clasica",
    emoji: "💅",
    name: "Manicure clásica",
    tagline: "El clásico que nunca falla",
    description:
      "Tus manos merecen atención real. Limamos, damos forma, retiramos cutículas y aplicamos el esmalte del color que elijas. El servicio semanal que te mantiene impecable sin gastar de más.",
    price: 15,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80&fit=crop",
    gradient: { from: "#fda4af", to: "#fb7185" },
    variants: [
      { name: "Manicure sencilla", price: 15, duration: "45 min", description: "Limpieza, forma y esmalte regular. Perfecto para mantenimiento semanal." },
      { name: "Manicure con brillo", price: 18, duration: "50 min", description: "Todo lo de la sencilla más top coat brillante de larga duración." },
      { name: "Manicure francesa", price: 20, duration: "55 min", description: "Efecto French clásico o con degradado. Elegante para cualquier ocasión." },
      { name: "Manicure spa", price: 25, duration: "60 min", description: "Exfoliación + hidratación profunda + masaje de manos + esmalte a elección." },
    ],
    includes: [
      "Remoción completa del esmalte anterior",
      "Limpieza y retiro de cutículas",
      "Limado y formado a tu gusto",
      "Crema hidratante de manos",
      "Esmalte de tu color favorito",
    ],
    faqs: [
      { q: "¿Cuánto tiempo dura el esmalte?", a: "El esmalte regular dura entre 5 y 7 días con buen cuidado. Si quieres más duración, te recomendamos el semipermanente — dura hasta 3 semanas." },
      { q: "¿Puedo traer mi propio esmalte?", a: "Claro que sí. Tenemos más de 150 colores disponibles, pero si tienes uno especial, con gusto lo usamos sin costo extra." },
      { q: "¿Necesito hacer cita?", a: "Recomendamos reservar con anticipación, especialmente de jueves a sábado. Entre semana muchas veces hay espacio de inmediato." },
    ],
    related: ["pedicure-spa", "semipermanente", "nail-art"],
  },
  {
    slug: "pedicure-spa",
    emoji: "🛁",
    name: "Pedicure spa",
    tagline: "Media hora de descanso para tus pies",
    description:
      "Baño de pies aromático, exfoliación con sal marina, retiro de cutículas, masaje con crema hidratante y esmalte al final. Tus pies van a agradecer cada minuto.",
    price: 20,
    image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=800&q=80&fit=crop",
    gradient: { from: "#a5f3fc", to: "#67e8f9" },
    variants: [
      { name: "Pedicure básico", price: 20, duration: "50 min", description: "Corte, limado, cutícula y esmalte. El cuidado esencial que tus pies necesitan." },
      { name: "Pedicure spa completo", price: 28, duration: "70 min", description: "Baño aromático + exfoliación + masaje relajante + esmalte. Un lujo accesible." },
      { name: "Pedicure medicado", price: 35, duration: "80 min", description: "Tratamiento especializado para callos, piel muy seca o pies con necesidades extra." },
    ],
    includes: [
      "Baño aromático de pies",
      "Exfoliación con sal marina",
      "Retiro de cutículas",
      "Masaje con crema hidratante",
      "Esmalte a elección",
    ],
    faqs: [
      { q: "¿Puedo combinar con manicure?", a: "Sí, y te sale más económico. Tenemos paquetes combinados con descuento. Pregúntanos al momento de reservar." },
      { q: "¿Sirve para pies con callos?", a: "El básico y el spa incluyen tratamiento suave. Para callos profundos o piel muy dañada, el pedicure medicado es la opción correcta." },
      { q: "¿Qué debo llevar?", a: "Sandalias abiertas para no arruinar el esmalte al salir. Todo lo demás lo tenemos nosotras." },
    ],
    related: ["manicure-clasica", "semipermanente", "diseno-personalizado"],
  },
  {
    slug: "nail-art",
    emoji: "🎨",
    name: "Nail Art",
    tagline: "Diseños únicos que hablan por ti",
    description:
      "Flores 3D, geometría perfecta, degradados de colores, efecto espejo, piedras, personajes. Cada diseño es hecho a mano y pensado para ti. Trae tu foto de inspiración y la hacemos realidad.",
    price: 25,
    image: "https://images.unsplash.com/photo-1604855023538-7e8e6e33c11b?w=800&q=80&fit=crop",
    gradient: { from: "#c084fc", to: "#a855f7" },
    variants: [
      { name: "Diseño sencillo (por uña)", price: 3, duration: "—", description: "Flores, líneas, puntos o acento sobre base de esmalte. Precio por uña individual." },
      { name: "Nail Art completo (10 uñas)", price: 25, duration: "90 min", description: "Un diseño coordinado y armonioso en todas las uñas." },
      { name: "Nail Art premium", price: 40, duration: "120 min", description: "Piedras swarovski, cromo, efecto 3D o diseño muy detallado. Para quienes quieren lo mejor." },
      { name: "Uñas temáticas", price: 45, duration: "120 min", description: "Diseño especial para evento: graduación, boda, XV años, Halloween, Navidad." },
    ],
    includes: [
      "Base preparadora y esmalte de color",
      "Diseño a elección del catálogo o personalizado",
      "Materiales de alta calidad incluidos",
      "Top coat de sellado para mayor duración",
      "Acabado mate o brillante según prefieras",
    ],
    faqs: [
      { q: "¿Puedo traer foto del diseño que quiero?", a: "Por favor tráela. Entre más referencias tengas, más fiel será el resultado. Puedes mandar fotos por WhatsApp antes de la cita." },
      { q: "¿Se puede hacer sobre acrílicas?", a: "Sí, y de hecho es una de las mejores combinaciones porque el nail art sobre acrílico dura mucho más." },
      { q: "¿Cuánto tiempo dura el diseño?", a: "Con top coat y buen cuidado, entre 7 y 14 días sobre esmalte regular. Sobre semipermanente puede durar hasta 3 semanas." },
    ],
    related: ["unas-acrilicas", "diseno-personalizado", "semipermanente"],
  },
  {
    slug: "unas-acrilicas",
    emoji: "✨",
    name: "Uñas acrílicas",
    tagline: "El largo que siempre quisiste, sin esperar",
    description:
      "Extensiones de acrílico moldeadas a la forma y longitud que elijas. Resistentes a los golpes, perfectas para quienes tienen las uñas débiles o quieren un largo que su uña natural no da.",
    price: 35,
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80&fit=crop&crop=bottom",
    gradient: { from: "#fde68a", to: "#fbbf24" },
    variants: [
      { name: "Acrílico natural (sin color)", price: 35, duration: "90 min", description: "Extensión en tono natural o transparente. Base perfecta para agregar diseño después." },
      { name: "Acrílico con esmalte regular", price: 40, duration: "100 min", description: "Extensión más el color de tu elección con acabado brillante." },
      { name: "Acrílico con semipermanente", price: 50, duration: "110 min", description: "La mejor combinación: extensión fuerte y color que dura hasta 3 semanas." },
      { name: "Relleno de acrílico", price: 25, duration: "60 min", description: "Mantenimiento cada 2-3 semanas para rellenar el crecimiento natural. Obligatorio para mantener el resultado." },
    ],
    includes: [
      "Preparación y limpieza de uña natural",
      "Aplicación de acrílico de calidad",
      "Formado y limado a tu medida",
      "Sellado y pulido final",
    ],
    faqs: [
      { q: "¿Cada cuánto necesito relleno?", a: "Cada 2 a 3 semanas dependiendo de tu crecimiento. El relleno mantiene las uñas perfectas y cuesta menos que poner nuevas." },
      { q: "¿Dañan la uña natural?", a: "Con la técnica y productos correctos, el daño es mínimo. Siempre preparamos bien la uña natural antes de aplicar." },
      { q: "¿Puedo hacerles nail art?", a: "Sí, es de las mejores superficies para nail art porque el acrílico es liso y firme. El diseño dura mucho más." },
    ],
    related: ["nail-art", "semipermanente", "diseno-personalizado"],
  },
  {
    slug: "semipermanente",
    emoji: "🌸",
    name: "Semipermanente",
    tagline: "Sin astillarse. Sin perder brillo. Hasta 3 semanas.",
    description:
      "Esmalte semipermanente curado con lámpara UV/LED. Sale del salón brillante y sigue igual hasta la tercera semana. Ideal para quienes no tienen tiempo para retoque semanal.",
    price: 18,
    image: "https://images.unsplash.com/photo-1607957630705-00fb7f7bc3b8?w=800&q=80&fit=crop",
    gradient: { from: "#f0abfc", to: "#e879f9" },
    variants: [
      { name: "Semipermanente manos", price: 18, duration: "50 min", description: "Color semipermanente en las 10 uñas de las manos." },
      { name: "Semipermanente pies", price: 20, duration: "50 min", description: "Ideal para combinar con pedicure. Color duradero en pies." },
      { name: "Manos + pies (paquete)", price: 35, duration: "90 min", description: "Los dos servicios juntos con descuento. El favorito de las clientas." },
      { name: "Remoción de semipermanente", price: 8, duration: "20 min", description: "Remoción segura con acetona y protección. Sin dañar la uña." },
    ],
    includes: [
      "Base especial para semipermanente",
      "2 a 3 capas de color",
      "Curado con lámpara LED profesional",
      "Top coat sellador de larga duración",
    ],
    faqs: [
      { q: "¿Realmente dura 3 semanas?", a: "Sí, con cuidado básico: guantes al lavar trastos, evitar acetona y no picar con las uñas. Muchas clientas lo usan así de seguido." },
      { q: "¿Lo puedo poner sobre acrílicas?", a: "Sí, es la combinación más popular. Extensión fuerte por debajo y color duradero por encima. Lo mejor de los dos mundos." },
      { q: "¿Daña mis uñas naturales?", a: "No, siempre y cuando se remueva correctamente. Por eso ofrecemos el servicio de remoción segura." },
    ],
    related: ["manicure-clasica", "pedicure-spa", "unas-acrilicas"],
  },
  {
    slug: "diseno-personalizado",
    emoji: "💎",
    name: "Diseño personalizado",
    tagline: "Tu visión hecha realidad para eventos especiales",
    description:
      "Para bodas, XV años, graduaciones o simplemente porque te mereces algo único. Traes la idea, hablamos el diseño y lo ejecutamos con los mejores materiales. Cotización sin costo.",
    price: 30,
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80&fit=crop",
    gradient: { from: "#d8b4fe", to: "#c084fc" },
    variants: [
      { name: "Diseño para evento (10 uñas)", price: 30, duration: "120 min", description: "Diseño coordinado especial para tu ocasión. Incluye consulta previa." },
      { name: "Pack novia + damas", price: 24, duration: "—", description: "Precio por persona para grupos de 5+. Coordinamos horario para todas." },
      { name: "Diseño 3D con piedras", price: 50, duration: "150 min", description: "Decoración volumétrica con gemas, relieves y acabados premium." },
      { name: "Diseño corporativo / marca", price: 40, duration: "120 min", description: "Logos, colores corporativos o temática específica para eventos de empresa." },
    ],
    includes: [
      "Consulta de diseño previa sin costo",
      "Boceto para aprobación antes de empezar",
      "Materiales de la más alta calidad",
      "Fotografía profesional del resultado",
    ],
    faqs: [
      { q: "¿Con cuánto tiempo debo reservar para una boda?", a: "Mínimo 2 semanas antes para diseños de novia, especialmente si hay damas. Para diseños muy elaborados, 3 semanas." },
      { q: "¿Hacen cotizaciones para grupos?", a: "Sí. Escríbenos por WhatsApp con el número de personas y la fecha, y te armamos un paquete a medida." },
      { q: "¿Pueden replicar un diseño exacto que vi en redes?", a: "Hacemos el mejor esfuerzo. Algunos diseños tienen limitaciones por técnica o materiales, pero siempre te decimos de frente antes de cobrar." },
    ],
    related: ["nail-art", "unas-acrilicas", "semipermanente"],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getRelatedServices(slugs: string[]): Service[] {
  return slugs.map((s) => services.find((sv) => sv.slug === s)).filter(Boolean) as Service[];
}
