"use client";

import { motion } from "framer-motion";
import { CalendarRange, Car, ChevronRight, KeyRound, MapPin, Route, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { EmptyState, Segmented, Skeleton } from "@/components/ui/misc";
import { day, fcfa, parseDay, plural, range, startOfDay, time } from "@/lib/format";
import { cdn } from "@/lib/images";
import { useGivenReviews, useMyBookings, useMyReservations } from "@/lib/queries";
import { BOOKING_STATUS, coverUrl, isActiveBooking, shortName, vehicleTitle, type CarpoolReservation, type RentalBooking } from "@/lib/types";
import { ContactButtons } from "./contact-buttons";

type Tab = "trajets" | "locations";

/** « Mes réservations » : places de covoiturage et locations, à venir puis passées. */
export function MyBookings() {
  const router = useRouter();
  const params = useSearchParams();
  const tab: Tab = params.get("onglet") === "locations" ? "locations" : "trajets";
  const reservations = useMyReservations();
  const bookings = useMyBookings();
  const given = useGivenReviews();

  const trips = useMemo(() => split(reservations.data ?? [], (r) => r.trip?.departureTime, (r) => isActiveBooking(r.status)), [reservations.data]);
  const rentals = useMemo(() => split(bookings.data ?? [], (b) => b.endDate, (b) => isActiveBooking(b.status)), [bookings.data]);

  const pendingReviewTrips = (reservations.data ?? []).filter((r) => r.status === "COMPLETED" && !given.data?.carpoolReservationIds.includes(r.id)).length;
  const pendingReviewRentals = (bookings.data ?? []).filter((b) => b.status === "COMPLETED" && !given.data?.rentalBookingIds.includes(b.id)).length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
      <h1 className="text-[26px] font-extrabold tracking-tight text-ink sm:text-[30px]">Mes réservations</h1>
      <Segmented
        layoutId="my-bookings"
        className="mt-5 w-full sm:w-auto"
        value={tab}
        onChange={(v) => router.replace(v === "locations" ? "/reservations?onglet=locations" : "/reservations", { scroll: false })}
        options={[
          { value: "trajets", label: "Trajets", count: trips.upcoming.length },
          { value: "locations", label: "Locations", count: rentals.upcoming.length },
        ]}
      />

      <div className="mt-6">
        {tab === "trajets" ? (
          reservations.isPending ? (
            <ListSkeleton />
          ) : !reservations.data?.length ? (
            <EmptyCard
              icon={<Route />}
              title="Aucune réservation de trajet"
              text="Trouvez un trajet et réservez votre place en quelques secondes."
              href="/covoiturage"
              cta="Trouver un trajet"
            />
          ) : (
            <Sections
              upcoming={trips.upcoming.map((r, i) => <TripBookingCard key={r.id} r={r} index={i} />)}
              past={trips.past.map((r, i) => (
                <TripBookingCard key={r.id} r={r} index={i} canReview={r.status === "COMPLETED" && !given.data?.carpoolReservationIds.includes(r.id)} />
              ))}
              pastHint={pendingReviewTrips ? `${plural(pendingReviewTrips, "avis")} à donner` : undefined}
            />
          )
        ) : bookings.isPending ? (
          <ListSkeleton />
        ) : !bookings.data?.length ? (
          <EmptyCard icon={<KeyRound />} title="Aucune location" text="Louez une voiture chez un particulier, avec ou sans chauffeur." href="/location" cta="Voir les voitures" />
        ) : (
          <Sections
            upcoming={rentals.upcoming.map((b, i) => <RentalBookingCard key={b.id} b={b} index={i} />)}
            past={rentals.past.map((b, i) => (
              <RentalBookingCard key={b.id} b={b} index={i} canReview={b.status === "COMPLETED" && !given.data?.rentalBookingIds.includes(b.id)} />
            ))}
            pastHint={pendingReviewRentals ? `${plural(pendingReviewRentals, "avis")} à donner` : undefined}
          />
        )}
      </div>
    </div>
  );
}

/** À venir : demande active et date non passée ; le reste est « passé ». */
function split<T>(items: T[], dateOf: (x: T) => string | undefined, active: (x: T) => boolean) {
  const today = startOfDay(new Date()).getTime();
  const upcoming: T[] = [];
  const past: T[] = [];
  for (const x of items) {
    const d = dateOf(x);
    const future = d ? new Date(d).getTime() >= today : false;
    (active(x) && future ? upcoming : past).push(x);
  }
  const t = (x: T) => new Date(dateOf(x) ?? 0).getTime();
  upcoming.sort((a, b) => t(a) - t(b));
  past.sort((a, b) => t(b) - t(a));
  return { upcoming, past };
}

function Sections({ upcoming, past, pastHint }: { upcoming: ReactNode[]; past: ReactNode[]; pastHint?: string }) {
  return (
    <div className="space-y-8">
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-[13px] font-extrabold uppercase tracking-wider text-brand">À venir</h2>
          <div className="space-y-3">{upcoming}</div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-wider text-muted">
            Historique
            {pastHint && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] normal-case tracking-normal text-[#a86a00]">{pastHint}</span>}
          </h2>
          <div className="space-y-3">{past}</div>
        </section>
      )}
    </div>
  );
}

function TripBookingCard({ r, index, canReview }: { r: CarpoolReservation; index: number; canReview?: boolean }) {
  const t = r.trip;
  if (!t) return null;
  const confirmed = r.status === "CONFIRMED";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="overflow-hidden rounded-[22px] border border-line/70 bg-white shadow-card transition hover:shadow-lift"
    >
      <Link href={`/reservations/trajet/${r.id}`} className="group block p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12.5px] font-bold uppercase tracking-wide text-brand">
              {day(t.departureTime)} · {time(t.departureTime)}
            </p>
            <p className="mt-1 truncate text-[17px] font-extrabold text-ink">
              {t.departureCity} → {t.arrivalCity}
            </p>
            {t.meetingPoint && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-muted">
                <MapPin className="h-3.5 w-3.5 shrink-0" /> {t.meetingPoint}
              </p>
            )}
          </div>
          <StatusBadge status={r.status} map={BOOKING_STATUS} />
        </div>
        <div className="mt-4 flex items-center gap-3 border-t border-dashed border-line pt-3.5">
          <Avatar user={t.driver} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-ink">{shortName(t.driver)}</p>
            <p className="text-[12.5px] text-muted">
              {plural(r.seatsReserved, "place")} · {fcfa(t.pricePerSeat * r.seatsReserved)}
            </p>
          </div>
          {canReview ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-[12.5px] font-bold text-[#a86a00]">
              <Star className="h-3.5 w-3.5 fill-gold text-gold" /> Noter
            </span>
          ) : (
            <ChevronRight className="h-5 w-5 text-faint transition group-hover:translate-x-0.5" />
          )}
        </div>
      </Link>
      {!canReview && confirmed && t.driver?.phone && (
        <div className="-mt-1 px-4 pb-4 sm:px-5">
          <ContactButtons
            phone={t.driver.phone}
            name={shortName(t.driver)}
            compact
            message={`Bonjour, j’ai réservé sur Taagno le trajet ${t.departureCity} → ${t.arrivalCity} (${day(t.departureTime).toLowerCase()} à ${time(t.departureTime)}).`}
          />
        </div>
      )}
    </motion.div>
  );
}

function RentalBookingCard({ b, index, canReview }: { b: RentalBooking; index: number; canReview?: boolean }) {
  const v = b.rentalOffer?.vehicle;
  const photo = cdn(coverUrl(v), 320);
  const start = parseDay(b.startDate);
  const end = parseDay(b.endDate);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={`/reservations/location/${b.id}`} className="group flex gap-4 rounded-[22px] border border-line/70 bg-white p-3.5 shadow-card transition hover:shadow-lift">
        <div className="h-24 w-28 shrink-0 overflow-hidden rounded-[16px] bg-surface-alt sm:w-36">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-brand">
              <Car className="h-8 w-8 opacity-50" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-[16px] font-extrabold text-ink">{vehicleTitle(v)}</p>
            <StatusBadge status={b.status} map={BOOKING_STATUS} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft">
            <CalendarRange className="h-3.5 w-3.5 text-brand" /> {range(start, end)}
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[14px] font-extrabold text-ink">{fcfa(b.totalPrice)}</p>
            {canReview && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[12px] font-bold text-[#a86a00]">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" /> Noter
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-36 rounded-[22px]" />
      ))}
    </div>
  );
}

function EmptyCard({ icon, title, text, href, cta }: { icon: ReactNode; title: string; text: string; href: string; cta: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-line bg-white">
      <EmptyState icon={icon} title={title} text={text} action={<LinkButton href={href}>{cta}</LinkButton>} />
    </div>
  );
}
