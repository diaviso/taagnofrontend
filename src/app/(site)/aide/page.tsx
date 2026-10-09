import { Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { Faq } from "@/components/info/faq";
import { FAQ, SUPPORT_EMAIL } from "@/components/info/legal";

export const metadata: Metadata = {
  title: "Aide et questions fréquentes",
  description: "Réserver un trajet, louer une voiture, publier sur Taagno Pro, code PIN oublié… Toutes les réponses.",
};

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6">
      <h1 className="text-[30px] font-extrabold tracking-tight text-ink sm:text-[36px]">Comment pouvons-nous vous aider ?</h1>
      <p className="mt-2 text-[16px] text-muted">Trouvez une réponse ci-dessous ou écrivez-nous.</p>
      <div className="mt-8">
        <Faq items={FAQ} />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a href={`mailto:${SUPPORT_EMAIL}`} className="group flex items-center gap-4 rounded-[22px] border border-line/70 bg-white p-5 shadow-card transition hover:shadow-lift">
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
            <Mail className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[15px] font-extrabold text-ink">Écrire au support</span>
            <span className="block text-[13.5px] text-muted">{SUPPORT_EMAIL}</span>
          </span>
        </a>
        <div className="flex items-center gap-4 rounded-[22px] border border-line/70 bg-white p-5 shadow-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-whatsapp/12 text-[#128c4a]">
            <MessageCircle className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-[15px] font-extrabold text-ink">Réponse rapide</span>
            <span className="block text-[13.5px] text-muted">Nous répondons en général dans la journée.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
