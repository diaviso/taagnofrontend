import type { Metadata } from "next";
import { LegalPage, PRIVACY, PRIVACY_EMAIL } from "@/components/info/legal";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function PrivacyPage() {
  return <LegalPage title="Politique de confidentialité" subtitle="Votre vie privée est importante pour nous." sections={PRIVACY} contact={PRIVACY_EMAIL} />;
}
