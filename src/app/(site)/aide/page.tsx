import type { Metadata } from "next";
import { Faq } from "@/components/info/faq";
import { FAQ } from "@/components/info/legal";
import { SupportContact } from "@/components/info/support-actions";

export const metadata: Metadata = {
  title: "Aide et questions fréquentes",
  description: "Réserver un trajet, louer une voiture, publier sur Taagno Pro, code PIN oublié… Toutes les réponses.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6">
      <h1 className="text-[30px] font-extrabold tracking-tight text-ink sm:text-[36px]">Comment pouvons-nous vous aider ?</h1>
      <p className="mt-2 text-[16px] text-muted">Trouvez une réponse ci-dessous ou contactez l’équipe.</p>
      <div className="mt-8">
        <Faq items={FAQ} />
      </div>
      <SupportContact />
    </div>
  );
}
