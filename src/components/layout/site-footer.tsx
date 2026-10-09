import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const COLUMNS = [
  {
    title: "Voyager",
    links: [
      ["/covoiturage", "Trouver un trajet"],
      ["/location", "Louer une voiture"],
      ["/covoiturage?from=Dakar&to=Touba", "Dakar → Touba"],
      ["/covoiturage?from=Dakar&to=Saint-Louis", "Dakar → Saint-Louis"],
    ],
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

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-white pb-24 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo size={34} />
          <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-muted">
            Covoiturage et location de voitures entre particuliers, partout au Sénégal. Les paiements se font directement entre vous, sans frais.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-ink">{col.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([href, label]) => (
                <li key={label}>
                  <Link href={href} className="text-[14px] font-medium text-muted transition hover:text-brand">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-[13px] text-muted sm:flex-row sm:px-6">
          <span>© {new Date().getFullYear()} Taagno · Fait au Sénégal</span>
          <span>Dakar · Thiès · Touba · Saint-Louis · Mbour · Ziguinchor</span>
        </div>
      </div>
    </footer>
  );
}
