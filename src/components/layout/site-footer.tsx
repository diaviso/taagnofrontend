import { ArrowRight, BadgeCheck, HandCoins, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { SUPPORT_EMAIL } from "@/components/info/legal";
import { Reveal } from "@/components/ui/reveal";
import { POPULAR_ROUTES } from "@/lib/cities";
import { BackToTop } from "./back-to-top";

const RENTAL_CITIES = ["Dakar", "Thiès", "Mbour", "Saint-Louis", "Saly"];

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Trajets populaires",
    links: POPULAR_ROUTES.slice(0, 5).map(([a, b]) => [`/covoiturage?from=${encodeURIComponent(a)}&to=${encodeURIComponent(b)}`, `${a} → ${b}`]),
  },
  {
    title: "Louer une voiture",
    links: RENTAL_CITIES.map((c) => [`/location?city=${encodeURIComponent(c)}`, `Location à ${c}`]),
  },
  {
    title: "Taagno Pro",
    links: [
      ["/pro", "Proposer un trajet"],
      ["/pro", "Louer ma voiture"],
      ["/pro/tableau-de-bord", "Mon espace Pro"],
    ],
  },
  {
    title: "Aide",
    links: [
      ["/aide", "Questions fréquentes"],
      ["/conditions", "Conditions d’utilisation"],
      ["/confidentialite", "Confidentialité"],
    ],
  },
];

/** Pied de page : appel à l'action, liens utiles, contact, petite route animée. */
export function SiteFooter({ showCta = true }: { showCta?: boolean }) {
  return (
    <footer className="relative mt-24 text-white">
      {/* Vague de transition entre la page et le pied de page */}
      <svg className="block h-10 w-full text-brand-dark sm:h-14" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden>
        <path fill="currentColor" d="M0 48C180 16 360 0 540 10s360 50 540 54 300-20 360-34v82H0z" />
      </svg>
      <div className="relative overflow-hidden bg-brand-dark pb-24 md:pb-0">
        <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-brand-g3/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-brand-accent/10 blur-3xl" aria-hidden />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          {showCta && (
            <Reveal>
              <div className="flex flex-col items-start gap-5 rounded-[28px] border border-white/10 bg-white/6 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div>
                  <p className="text-[22px] font-extrabold tracking-tight sm:text-[26px]">Prêt à partir ?</p>
                  <p className="mt-1 text-[14.5px] text-white/70">Des trajets et des voitures partout au Sénégal, sans frais de réservation.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href="/covoiturage"
                    className="btn-sheen relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-[14px] bg-white px-5 text-[15px] font-bold text-brand-dark transition hover:-translate-y-px"
                  >
                    Trouver un trajet <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/pro"
                    className="inline-flex h-12 items-center rounded-[14px] border border-white/25 px-5 text-[15px] font-bold text-white transition hover:bg-white/10"
                  >
                    Proposer ma voiture
                  </Link>
                </div>
              </div>
            </Reveal>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
            <div className="col-span-2 lg:col-span-1">
              <Logo size={36} light />
              <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-white/70">
                Covoiturage et location de voitures entre particuliers, partout au Sénégal.
              </p>
              <ul className="mt-5 space-y-2.5 text-[13.5px] text-white/80">
                {[
                  [BadgeCheck, "Véhicules vérifiés par Taagno"],
                  [HandCoins, "Paiement direct, sans commission"],
                  [Lock, "Numéro partagé après confirmation"],
                ].map(([Icon, text]) => {
                  const I = Icon as typeof BadgeCheck;
                  return (
                    <li key={text as string} className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                        <I className="h-3.5 w-3.5" />
                      </span>
                      {text as string}
                    </li>
                  );
                })}
              </ul>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13.5px] font-bold text-white transition hover:bg-white/20"
              >
                <Mail className="h-4 w-4" /> {SUPPORT_EMAIL}
              </a>
            </div>
            {COLUMNS.map((col, i) => (
              <Reveal key={col.title} delay={0.05 * i}>
                <h3 className="text-[12.5px] font-extrabold uppercase tracking-[0.12em] text-white/50">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([href, label]) => (
                    <li key={label}>
                      <Link href={href} className="group inline-flex items-center gap-1.5 text-[14px] font-medium text-white/80 transition hover:text-white">
                        <span className="h-px w-0 bg-brand-accent transition-all duration-300 group-hover:w-3" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Petite route animée */}
        <div className="relative h-12 overflow-hidden" aria-hidden>
          <div className="absolute inset-x-0 bottom-5 border-t-2 border-dashed border-white/15" />
          <div className="absolute bottom-[22px] left-0 w-full animate-drive [animation-duration:22s]">
            <svg width="54" height="22" viewBox="0 0 74 30">
              <path
                d="M6 20c0-3 1.5-5 4.5-5.6l8-1.6 8.5-6.6C29 5 31 4.4 33.4 4.4h13.8c2.7 0 5 1 6.8 3l5.4 5.8 6.4 1.4c3 .7 5.2 3.3 5.2 6.4v1.7c0 1.4-1.1 2.5-2.5 2.5H8.5C7.1 25.2 6 24.1 6 22.7V20z"
                fill="#fff"
                fillOpacity="0.85"
              />
              <circle cx="20" cy="24.6" r="5.2" fill="#0e1726" />
              <circle cx="56" cy="24.6" r="5.2" fill="#0e1726" />
              <rect x="66" y="16" width="5" height="3" rx="1.5" fill="#ffd27a" />
            </svg>
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-[13px] text-white/60 sm:flex-row sm:px-6">
            <span>
              © {new Date().getFullYear()} Taagno · Fait avec <span className="text-[#ff8a8a]">♥</span> au Sénégal
            </span>
            <div className="flex items-center gap-5">
              <Link href="/conditions" className="hover:text-white">
                Conditions
              </Link>
              <Link href="/confidentialite" className="hover:text-white">
                Confidentialité
              </Link>
              <BackToTop />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
