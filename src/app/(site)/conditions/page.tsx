import type { Metadata } from "next";
import { LegalPage, SUPPORT_EMAIL, TERMS } from "@/components/info/legal";

export const metadata: Metadata = { title: "Conditions d’utilisation" };

export default function TermsPage() {
  return <LegalPage title="Conditions d’utilisation" subtitle="Utiliser Taagno en confiance." sections={TERMS} contact={SUPPORT_EMAIL} />;
}
