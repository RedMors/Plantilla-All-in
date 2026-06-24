import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nails by Mariela — San Salvador",
  description:
    "Salón de uñas profesional en San Salvador. Manicure, pedicure, nail art y más.",
};

export default function SalonUnasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
