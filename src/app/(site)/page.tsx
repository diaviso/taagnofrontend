import { BadgeCheck, CalendarCheck, CarFront, HandCoins, KeyRound, Lock, MessageCircleHeart, Search, ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { FeaturedOffers, UpcomingTrips } from "@/components/home/home-lists";
import { HeroDecor, RotatingWords } from "@/components/home/hero-extras";
import { HeroRoad } from "@/components/home/hero-road";
import { HomeSearch } from "@/components/search/home-search";
import { LinkButton } from "@/components/ui/button";
import { DrawLine, Reveal } from "@/components/ui/reveal";
import { POPULAR_ROUTES } from "@/lib/cities";

export default function HomePage() {
  return (
    <>
      {/* Héros */}
      <section className="relative overflow-hidden bg-aurora pb-24 pt-[108px] text-white sm:pb-28 sm:pt-[132px]">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-white/8 blur-2xl" />
        <div className="absolute -right-20 -top-10 h-96 w-96 rounded-full bg-[#f59e0b]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal immediate>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-bold backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#ffd27a]" /> Covoiturage et location entre particuliers
            </span>
          </Reveal>
          <Reveal immediate delay={0.06}>
            <h1 className="mt-5 max-w-3xl text-[38px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[54px] lg:text-[62px]">
              Où allez-vous{" "}
              <span className="whitespace-nowrap">
                <RotatingWords
                  className="inline-block text-[#ffd27a]"
                  words={["aujourd’hui", "à Touba", "à Saint-Louis", "à Mbour", "à Thiès", "à Ziguinchor"]}
                />
                &nbsp;?
              </span>
            </h1>
          </Reveal>
          <Reveal immediate delay={0.12}>
            <p className="mt-4 max-w-xl text-[16.5px] leading-relaxed text-white/85 sm:text-[18px]">
              Trouvez une place dans une voiture ou louez un véhicule près de chez vous, partout au Sénégal. Vous payez directement le conducteur, sans frais.
            </p>
          </Reveal>
          <Reveal immediate delay={0.18} className="mt-8 max-w-5xl">
            <HomeSearch />
          </Reveal>
          <Reveal immediate delay={0.26}>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-white/75">Populaires :</span>
              {POPULAR_ROUTES.slice(0, 4).map(([a, b]) => (
                <Link
                  key={`${a}-${b}`}
                  href={`/covoiturage?from=${encodeURIComponent(a)}&to=${encodeURIComponent(b)}`}
                  className="rounded-full border border-white/25 px-3 py-1.5 text-[13px] font-bold text-white transition hover:bg-white/15"
                >
                  {a} → {b}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
        <HeroDecor />
        <HeroRoad />
      </section>

      {/* Atouts */}
      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 sm:px-6">
        <div className="grid gap-3 rounded-[24px] border border-line/70 bg-white p-3 shadow-lift sm:grid-cols-3">
          {[
            { icon: BadgeCheck, title: "Véhicules vérifiés", text: "Carte grise et assurance contrôlées par Taagno." },
            { icon: HandCoins, title: "Aucun frais", text: "Vous réglez le trajet ou la location en main propre." },
            { icon: Lock, title: "Numéro protégé", text: "Partagé seulement après une réservation confirmée." },
          ].map(({ icon: Icon, title, text }, i) => (
            <Reveal immediate key={title} delay={i * 0.06} className="flex items-start gap-3.5 rounded-[18px] p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-brand-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold text-ink">{title}</p>
                <p className="mt-0.5 text-[13.5px] leading-snug text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mt-16 space-y-16 sm:mt-20 sm:space-y-20">
        <UpcomingTrips />

        {/* Comment ça marche */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <h2 className="text-center text-[26px] font-extrabold tracking-tight text-ink sm:text-[32px]">Simple comme bonjour</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-[15px] text-muted">Trois étapes, et vous êtes sur la route.</p>
          </Reveal>
          <div className="relative mt-10 grid gap-5 md:grid-cols-3">
            <DrawLine className="absolute left-[16%] right-[16%] top-[50px] hidden md:block" />
            {[
              { icon: Search, title: "Cherchez", text: "Indiquez votre départ, votre destination et la date. Comparez les prix, les horaires et les avis." },
              { icon: CalendarCheck, title: "Réservez", text: "Demandez vos places en un clic. Le conducteur confirme, souvent en quelques minutes." },
              { icon: CarFront, title: "Voyagez", text: "Retrouvez-vous au point de rendez-vous et réglez le conducteur à bord. Bon voyage !" },
            ].map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className="group relative h-full overflow-hidden rounded-[24px] border border-line/70 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
                  <span className="absolute -right-3 -top-6 text-[110px] font-black leading-none text-brand/[0.06] transition group-hover:text-brand/10">
                    {i + 1}
                  </span>
                  <span className="flex h-13 w-13 items-center justify-center rounded-[16px] bg-brand-gradient text-white shadow-glow">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-[19px] font-extrabold text-ink">{title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <FeaturedOffers />

        {/* Confiance */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-10 overflow-hidden rounded-[32px] bg-white p-6 shadow-card sm:p-10 lg:grid-cols-2">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-[12.5px] font-bold text-brand">
                <ShieldCheck className="h-4 w-4" /> Voyagez l’esprit tranquille
              </span>
              <h2 className="mt-4 text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">
                Une communauté de confiance, avis à l’appui
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Chaque conducteur et chaque propriétaire a un profil public avec ses avis. Après le voyage, vous notez votre conducteur, et il vous note aussi.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Profils avec photo, présentation et nombre de trajets",
                  "Notes et commentaires après chaque trajet ou location",
                  "Documents des véhicules vérifiés par notre équipe",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 text-[14.5px] font-semibold text-ink">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/12 text-success">
                      <BadgeCheck className="h-4 w-4" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="relative">
              <div className="relative mx-auto max-w-sm">
                <div className="overflow-hidden rounded-[24px] border border-line/70 bg-canvas shadow-soft">
                  <div className="h-20 bg-brand-gradient" />
                  <div className="-mt-10 px-5 pb-5">
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-[26px] font-extrabold text-brand ring-4 ring-white shadow-soft">
                      <CarFront className="h-9 w-9" />
                    </span>
                    <p className="mt-3 text-[17px] font-extrabold text-ink">Votre conducteur</p>
                    <p className="flex items-center gap-1.5 text-[13.5px] font-bold text-ink">
                      <Star className="h-4 w-4 fill-gold text-gold" /> Note moyenne et avis détaillés
                    </p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      {["Trajets", "Passagers", "Avis"].map((label) => (
                        <div key={label} className="rounded-[14px] bg-white px-2 py-2.5">
                          <span className="mx-auto block h-3 w-8 rounded-full bg-brand/20" />
                          <span className="mt-1.5 block text-[11.5px] font-semibold text-muted">{label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {["Numéro vérifié", "Véhicule vérifié"].map((b) => (
                        <span key={b} className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[12px] font-bold text-success">
                          <BadgeCheck className="h-3.5 w-3.5" /> {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="absolute -right-4 -top-5 flex h-12 w-12 animate-float items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow">
                  <MessageCircleHeart className="h-6 w-6" />
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Appel aux conducteurs et propriétaires */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div data-brand="pro" className="relative overflow-hidden rounded-[32px] bg-aurora p-8 text-white sm:p-12">
              <div className="dot-grid absolute inset-0 opacity-50" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[12.5px] font-bold">
                    <KeyRound className="h-4 w-4" /> Taagno Pro
                  </span>
                  <h2 className="mt-4 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[36px]">Vous avez une voiture ? Faites‑la rouler pour vous.</h2>
                  <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-white/85">
                    Partagez vos frais de route en proposant vos places, ou louez votre véhicule quand vous ne l’utilisez pas. Publication gratuite, vous fixez vos prix.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <LinkButton href="/pro" variant="white" size="lg">
                      Découvrir Taagno Pro
                    </LinkButton>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["0 FCFA", "de commission"],
                    ["2 min", "pour publier"],
                    ["100 %", "de vos gains"],
                    ["24h/24", "vos demandes"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-[20px] bg-white/12 p-4 backdrop-blur">
                      <p className="text-[24px] font-extrabold">{value}</p>
                      <p className="text-[13px] font-semibold text-white/80">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}
