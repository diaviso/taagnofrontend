import { BadgeCheck, Banknote, CalendarCheck, CarFront, ClipboardCheck, HandCoins, KeyRound, Route, ShieldCheck, Star, ThumbsUp, Zap } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Faq } from "@/components/info/faq";
import { SiteFooter } from "@/components/layout/site-footer";
import { ProCta, ProHeaderActions } from "@/components/pro/pro-landing-actions";
import { EarningsSimulator } from "@/components/pro/earnings-simulator";
import { Reveal } from "@/components/ui/reveal";

const STEPS = [
  { icon: CarFront, title: "Ajoutez votre véhicule", text: "Marque, modèle, quelques photos et vos documents : carte grise, assurance, visite technique." },
  { icon: ClipboardCheck, title: "Taagno vérifie", text: "Notre équipe contrôle vos documents. Vous êtes prévenu dès que votre véhicule est approuvé." },
  { icon: Route, title: "Publiez", text: "Un trajet en 2 minutes, ou une offre de location avec vos prix, votre caution et vos conditions." },
  { icon: HandCoins, title: "Encaissez", text: "Acceptez les demandes qui vous conviennent. Vos passagers et locataires vous paient directement." },
];

const BENEFITS = [
  { icon: Banknote, title: "0 commission", text: "Tout ce que vous gagnez est pour vous. La publication est gratuite." },
  { icon: ThumbsUp, title: "Vous choisissez", text: "Acceptez ou refusez chaque demande après avoir vu le profil et les avis." },
  { icon: Zap, title: "Réservation instantanée", text: "Activez-la pour remplir vos places sans répondre à chaque demande." },
  { icon: ShieldCheck, title: "Numéro protégé", text: "Votre numéro n’est partagé qu’avec les personnes que vous avez acceptées." },
  { icon: Star, title: "Avis et réputation", text: "Chaque trajet et chaque location renforcent votre profil." },
  { icon: CalendarCheck, title: "Tout au même endroit", text: "Demandes, passagers, locations et gains estimés dans votre tableau de bord." },
];

const PRO_FAQ = [
  { q: "Combien coûte Taagno Pro ?", a: "La publication de vos trajets et de vos offres de location est gratuite, sans commission. Vous êtes payé directement par vos passagers et vos locataires." },
  { q: "Quels documents faut-il fournir ?", a: "Une photo lisible de la carte grise, de l’attestation d’assurance et de la dernière visite technique. Ils servent uniquement à vérifier le véhicule et ne sont jamais publiés." },
  { q: "Combien de temps prend la vérification ?", a: "Notre équipe vérifie les véhicules au fil de l’eau. Vous recevez une notification dès que le vôtre est approuvé, ou un message expliquant ce qu’il faut corriger." },
  { q: "Puis-je refuser une demande ?", a: "Oui. Sauf si vous activez la réservation instantanée, chaque demande attend votre accord. Vous voyez le profil et les avis de la personne avant de répondre." },
  { q: "Comment fixer mes prix ?", a: "Vous êtes libre. Pour un trajet, partagez vos frais (carburant, péage). Pour une location, regardez les prix des véhicules comparables sur Taagno." },
];

export default function ProLandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-canvas">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/pro">
            <Logo size={34} suffix="Pro" light />
          </Link>
          <Link href="/" className="ml-auto hidden text-[14px] font-bold text-white/85 hover:text-white sm:block">
            Je cherche un trajet
          </Link>
          <ProHeaderActions />
        </div>
      </header>

      <section className="relative overflow-hidden bg-aurora pb-20 pt-[120px] text-white sm:pb-28 sm:pt-[150px]">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <Reveal immediate>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-bold backdrop-blur">
                <BadgeCheck className="h-4 w-4" /> Pour les conducteurs et les propriétaires
              </span>
            </Reveal>
            <Reveal immediate delay={0.06}>
              <h1 className="mt-5 text-[38px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[54px]">
                Votre voiture peut vous rapporter de l’argent.
              </h1>
            </Reveal>
            <Reveal immediate delay={0.12}>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85">
                Proposez vos places libres sur vos trajets, ou louez votre véhicule quand il ne roule pas. Gratuit, sans commission, et vous gardez la main sur tout.
              </p>
            </Reveal>
            <Reveal immediate delay={0.18} className="mt-8">
              <ProCta />
            </Reveal>
          </div>
          <Reveal immediate delay={0.15}>
            <div className="grid gap-4">
              {[
                { icon: Route, title: "Covoiturage", text: "Dakar → Touba ce vendredi ? Remplissez vos 3 places libres et partagez les frais.", tone: "bg-white text-ink" },
                { icon: KeyRound, title: "Location", text: "Votre voiture dort le week-end ? Louez-la, avec ou sans chauffeur.", tone: "bg-white/12 text-white backdrop-blur" },
              ].map(({ icon: Icon, title, text, tone }, i) => (
                <div key={title} className={`rounded-[24px] p-6 shadow-lift ${tone} ${i === 1 ? "lg:ml-10" : "lg:mr-10"}`}>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${i === 0 ? "bg-brand-gradient text-white" : "bg-white/20 text-white"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-[19px] font-extrabold">{title}</p>
                  <p className={`mt-1 text-[14.5px] leading-relaxed ${i === 0 ? "text-muted" : "text-white/85"}`}>{text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <EarningsSimulator />
        </Reveal>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[28px] font-extrabold tracking-tight text-ink sm:text-[34px]">Comment ça marche</h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-[15px] text-muted">Quatre étapes, et votre premier passager vous attend.</p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.07}>
              <div className="relative h-full rounded-[24px] border border-line/70 bg-white p-6 shadow-card">
                <span className="text-[13px] font-extrabold text-brand">Étape {i + 1}</span>
                <span className="mt-3 flex h-12 w-12 items-center justify-center rounded-[16px] bg-brand-gradient text-white shadow-glow">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-[18px] font-extrabold text-ink">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center text-[28px] font-extrabold tracking-tight text-ink sm:text-[34px]">Pensé pour vous simplifier la route</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.06}>
              <div className="flex h-full gap-4 rounded-[22px] bg-white p-5 shadow-card">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[16px] font-extrabold text-ink">{title}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted">{text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-3xl px-4 sm:px-6">
        <h2 className="mb-6 text-center text-[28px] font-extrabold tracking-tight text-ink">Questions fréquentes</h2>
        <Faq items={PRO_FAQ} />
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-aurora px-6 py-12 text-center text-white sm:px-12">
          <div className="dot-grid absolute inset-0 opacity-50" />
          <div className="relative">
            <h2 className="text-[28px] font-extrabold tracking-tight sm:text-[36px]">Prêt à prendre la route ?</h2>
            <p className="mx-auto mt-3 max-w-lg text-[15.5px] text-white/85">Créez votre espace en une minute avec votre numéro de téléphone.</p>
            <div className="mt-7 flex justify-center">
              <ProCta center />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter showCta={false} />
    </div>
  );
}
