"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarRange, HandCoins, Info, KeyRound, MapPin, MessageSquareQuote, ShieldCheck, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { FavoriteButton } from "@/components/cards/favorite-button";
import { OptionIcon } from "@/components/cards/option-icon";
import { PersonCard } from "@/components/people/person-card";
import { DateRangeField } from "@/components/search/date-field";
import { StatusBadge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Switch } from "@/components/ui/field";
import { Gallery } from "@/components/ui/gallery";
import { Card, EmptyState } from "@/components/ui/misc";
import { Modal } from "@/components/ui/modal";
import { ShareButton } from "@/components/ui/share-button";
import { PageSpinner } from "@/components/ui/spinner";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { offerKey } from "@/lib/favorites";
import { apiDay, fcfa, parseDay, plural, range, rentalDays, startOfDay } from "@/lib/format";
import { useMyBookings, useOffer } from "@/lib/queries";
import { BOOKING_STATUS, isActiveBooking, offerWithDriver, orderedPhotos, rentalOptionLabel, vehicleTitle, vehicleTitleYear, type RentalOffer } from "@/lib/types";
import { SuccessCheck } from "./success-check";

export function OfferDetail({ id, initial }: { id: string; initial: RentalOffer | null }) {
  const { data: offer, isPending, error } = useOffer(id, initial);
  if (isPending && !offer) return <PageSpinner />;
  if (!offer) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={<KeyRound />}
          title="Annonce introuvable"
          text={error ? errorMessage(error) : "Cette annonce n’existe plus."}
          action={<LinkButton href="/location">Voir les autres voitures</LinkButton>}
        />
      </div>
    );
  }
  return <OfferView offer={offer} />;
}

function OfferView({ offer }: { offer: RentalOffer }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, requireAuth } = useAuth();
  const myBookings = useMyBookings();

  // Dates reprises de la recherche (?start=…&end=…), si elles sont valides et à venir.
  const preset = (() => {
    const s = params.get("start");
    const e = params.get("end");
    if (!s || !e || !/^\d{4}-\d{2}-\d{2}$/.test(s) || !/^\d{4}-\d{2}-\d{2}$/.test(e)) return [null, null] as const;
    const [a, b] = [s, e].map((x) => {
      const [y, m, d] = x.split("-").map(Number);
      return new Date(y, m - 1, d);
    });
    return a >= startOfDay(new Date()) && b > a ? ([a, b] as const) : ([null, null] as const);
  })();
  const [start, setStart] = useState<Date | null>(preset[0]);
  const [end, setEnd] = useState<Date | null>(preset[1]);
  const [withDriver, setWithDriver] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const v = offer.vehicle;
  const isOwner = !!user && user.id === v?.ownerId;
  const available = offer.isActive && v?.isActive !== false && (v?.status ?? "APPROVED") === "APPROVED";
  // Demande déjà envoyée par ce voyageur (en attente ou confirmée, pas encore terminée).
  const myRequest = (myBookings.data ?? []).find(
    (b) => b.rentalOfferId === offer.id && isActiveBooking(b.status) && parseDay(b.endDate) >= startOfDay(new Date()),
  );
  // Seules les locations confirmées bloquent des jours (fin exclusive : le jour de retour reste libre).
  const booked = (offer.bookings ?? [])
    .filter((b) => b.status === "CONFIRMED")
    .map((b) => [parseDay(b.startDate), parseDay(b.endDate)] as const);
  const overlaps = (s: Date, e: Date) => booked.some(([bs, be]) => s < be && e > bs);
  // Choix du départ : jour pris par une location. Choix du retour : période qui chevaucherait
  // une location (le premier jour d'une autre location reste possible comme jour de retour).
  const isDisabled = (d: Date) => {
    if (start && !end && d > start) return overlaps(start, d);
    return booked.some(([bs, be]) => d >= bs && d < be);
  };
  const days = start && end ? rentalDays(start, end) : 0;
  // Chauffeur : seulement si l'annonce le propose ; sans tarif affiché, il est « à convenir » (hors total).
  const driver = withDriver && offerWithDriver(offer);
  const driverDaily = driver ? (offer.driverPricePerDay ?? 0) : 0;
  const total = days * (offer.pricePerDay + driverDaily);
  const title = vehicleTitleYear(v);

  const pickDates = (s: Date | null, e: Date | null) => {
    if (s && e && overlaps(s, e)) {
      toast.error("Le véhicule est déjà loué sur une partie de cette période. Choisissez d’autres dates.");
      setStart(s);
      setEnd(null);
      return;
    }
    setStart(s);
    setEnd(e);
  };

  const book = () => {
    setMobileOpen(false);
    requireAuth(() => setConfirmOpen(true), "Connectez-vous pour envoyer votre demande de location.");
  };

  const panel = (
    <Card className="p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[28px] font-extrabold leading-none tracking-tight text-ink">{fcfa(offer.pricePerDay)}</p>
          <p className="mt-1.5 text-[13.5px] text-muted">par jour{offer.minDays > 1 ? ` · ${offer.minDays} jours minimum` : ""}</p>
        </div>
      </div>
      {isOwner ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-[14px] bg-surface-alt px-4 py-3 text-[14px] text-ink-soft">C’est votre annonce. Gérez les demandes depuis votre espace Pro.</p>
          <LinkButton href={`/pro/locations/${offer.id}`} block size="lg" variant="solid">
            Gérer mon annonce
          </LinkButton>
        </div>
      ) : myRequest ? (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-[14px] bg-surface-alt px-4 py-3">
            <span className="text-[14px] font-semibold text-ink">
              Votre demande · {range(parseDay(myRequest.startDate), parseDay(myRequest.endDate))}
            </span>
            <StatusBadge status={myRequest.status} map={BOOKING_STATUS} />
          </div>
          <LinkButton href={`/reservations/location/${myRequest.id}`} block size="lg">
            Voir ma demande
          </LinkButton>
        </div>
      ) : !available ? (
        <p className="mt-6 rounded-[14px] bg-surface-alt px-4 py-4 text-center text-[14px] font-semibold text-ink-soft">Cette annonce est en pause pour le moment.</p>
      ) : (
        <div className="mt-6">
          <DateRangeField label="Vos dates" start={start} end={end} onChange={pickDates} minDays={offer.minDays} isDisabled={isDisabled} placeholder="Prise et retour du véhicule" />
          {offerWithDriver(offer) && (
            <div className="mt-4 flex items-center gap-3 rounded-[14px] border border-line px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-soft text-brand">
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-ink">Avec chauffeur</p>
                <p className="text-[12.5px] leading-snug text-muted">
                  {offer.driverPricePerDay ? `+ ${fcfa(offer.driverPricePerDay)} / jour` : "Tarif à convenir avec le propriétaire"}
                </p>
              </div>
              <Switch checked={withDriver} onChange={setWithDriver} label="Avec chauffeur" />
            </div>
          )}
          {days > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-2 text-[14.5px]">
              <div className="flex justify-between">
                <span className="text-muted">
                  {fcfa(offer.pricePerDay)} × {plural(days, "jour")}
                </span>
                <span className="font-bold text-ink">{fcfa(days * offer.pricePerDay)}</span>
              </div>
              {driver && (
                <div className="flex justify-between">
                  <span className="text-muted">{offer.driverPricePerDay ? `Chauffeur × ${plural(days, "jour")}` : "Chauffeur"}</span>
                  <span className="font-bold text-ink">{offer.driverPricePerDay ? fcfa(days * offer.driverPricePerDay) : "À convenir"}</span>
                </div>
              )}
              {offer.depositAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Caution (rendue au retour)</span>
                  <span className="font-bold text-ink">{fcfa(offer.depositAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-dashed border-line pt-3 text-[16px]">
                <span className="font-bold text-ink">Total estimé</span>
                <span className="font-extrabold text-ink">{fcfa(total)}</span>
              </div>
              {driver && !offer.driverPricePerDay && (
                <p className="text-[12.5px] leading-snug text-muted">Le chauffeur n’est pas compté : son tarif se convient avec le propriétaire.</p>
              )}
            </motion.div>
          )}
          <Button block size="xl" className="mt-5" disabled={!days} onClick={book}>
            {days ? "Demander la location" : "Choisissez vos dates"}
          </Button>
          <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-snug text-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Le propriétaire confirme votre demande. Vous réglez ensuite la location directement avec lui.
          </p>
        </div>
      )}
    </Card>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-2 pt-5 sm:px-6 lg:pb-12">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/location"))}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[14px] font-bold text-ink-soft transition hover:bg-white hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </button>
        <div className="flex items-center gap-2">
          <ShareButton title={title} text={`${title} à louer${v?.city ? ` à ${v.city}` : ""} — ${fcfa(offer.pricePerDay)} par jour sur Taagno`} />
          <FavoriteButton favKey={offerKey(offer.id)} />
        </div>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Gallery photos={orderedPhotos(v).map((p) => p.url)} alt={vehicleTitle(v)} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {v?.city && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-[12.5px] font-bold text-brand">
                  <MapPin className="h-3.5 w-3.5" /> {v.city}
                </span>
              )}
              {offerWithDriver(offer) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fdf0dc] px-3 py-1 text-[12.5px] font-bold text-[#b45309]">
                  <UserRound className="h-3.5 w-3.5" /> Chauffeur disponible
                </span>
              )}
            </div>
            <h1 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-ink sm:text-[34px]">{title}</h1>
            <p className="mt-1 text-[15px] text-muted">
              {[v?.color, v?.numberOfSeats ? `${v.numberOfSeats} places` : null].filter(Boolean).join(" · ")}
            </p>
          </div>

          <Card className="grid gap-3 p-5 sm:grid-cols-3">
            <Fact icon={<HandCoins />} label="Prix par jour" value={fcfa(offer.pricePerDay)} />
            <Fact icon={<ShieldCheck />} label="Caution" value={offer.depositAmount ? fcfa(offer.depositAmount) : "Aucune"} />
            <Fact icon={<CalendarRange />} label="Durée minimale" value={plural(offer.minDays, "jour")} />
          </Card>

          {offer.description && (
            <Card className="p-6">
              <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-ink">
                <MessageSquareQuote className="h-5 w-5 text-brand" /> Le mot du propriétaire
              </h2>
              <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-soft">{offer.description}</p>
            </Card>
          )}

          {(offer.options ?? []).length > 0 && (
            <Card className="p-6">
              <h2 className="text-[17px] font-extrabold text-ink">Inclus et services</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(offer.options ?? []).map((o) => (
                  <div key={o} className="flex items-center gap-3 rounded-[14px] bg-surface-alt px-4 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand shadow-card">
                      <OptionIcon option={o} className="h-4 w-4" />
                    </span>
                    <span className="text-[14.5px] font-semibold text-ink">
                      {rentalOptionLabel(o)}
                      {o === "WITH_DRIVER" && (
                        <span className="block text-[12.5px] font-medium text-muted">
                          {offer.driverPricePerDay ? `+ ${fcfa(offer.driverPricePerDay)} par jour, à choisir dans votre demande` : "Tarif à convenir avec le propriétaire"}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {offer.pickupLocation && (
            <Card className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[13px] font-bold uppercase tracking-wide text-muted">Remise des clés</p>
                <p className="text-[15px] font-bold text-ink">{offer.pickupLocation}</p>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <PersonCard user={v?.owner} role="Propriétaire" />
          </Card>
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-[88px]">{panel}</div>
        </div>
      </div>

      <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] z-40 -mx-4 mt-6 border-t border-line bg-white/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 md:bottom-0 lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="flex-1">
            <p className="text-[19px] font-extrabold leading-none text-ink">{fcfa(offer.pricePerDay)}</p>
            <p className="mt-1 text-[12.5px] text-muted">par jour</p>
          </div>
          {isOwner ? (
            <LinkButton href={`/pro/locations/${offer.id}`} variant="soft">
              Gérer
            </LinkButton>
          ) : (
            <Button size="lg" disabled={!available && !myRequest} onClick={() => setMobileOpen(true)}>
              {myRequest ? "Ma demande" : "Choisir mes dates"}
            </Button>
          )}
        </div>
      </div>

      <Modal open={mobileOpen} onOpenChange={setMobileOpen} title="Louer ce véhicule">
        {panel}
      </Modal>

      <ConfirmRental offer={offer} start={start} end={end} withDriver={driver} open={confirmOpen} onOpenChange={setConfirmOpen} />
    </div>
  );
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-soft text-brand [&_svg]:h-[18px] [&_svg]:w-[18px]">{icon}</span>
      <div>
        <p className="text-[12.5px] font-semibold text-muted">{label}</p>
        <p className="text-[15px] font-extrabold text-ink">{value}</p>
      </div>
    </div>
  );
}

function ConfirmRental({
  offer,
  start,
  end,
  withDriver,
  open,
  onOpenChange,
}: {
  offer: RentalOffer;
  start: Date | null;
  end: Date | null;
  withDriver: boolean;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  if (!start || !end) return null;
  const days = rentalDays(start, end);
  const driverDaily = withDriver ? (offer.driverPricePerDay ?? 0) : 0;

  const confirm = async () => {
    setBusy(true);
    try {
      await api.post(`/rental/offers/${offer.id}/bookings`, { startDate: apiDay(start), endDate: apiDay(end), ...(withDriver ? { withDriver: true } : {}) });
      setDone(true);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["offer", offer.id] }), queryClient.invalidateQueries({ queryKey: ["bookings"] })]);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const close = (v: boolean) => {
    onOpenChange(v);
    if (!v) setTimeout(() => setDone(false), 300);
  };

  return (
    <Modal open={open} onOpenChange={close} title={done ? "Demande envoyée" : "Confirmer la demande"} hideHeader={done} size="sm">
      {done ? (
        <div className="py-4 text-center">
          <SuccessCheck tone="warning" />
          <h3 className="mt-5 text-[22px] font-extrabold tracking-tight text-ink">Demande envoyée !</h3>
          <p className="mx-auto mt-2 max-w-xs text-[14.5px] leading-relaxed text-muted">
            Le propriétaire va vous répondre rapidement. Son numéro s’affichera dans votre réservation dès qu’il aura accepté.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <LinkButton href="/reservations?onglet=locations" size="lg" block>
              Voir mes locations
            </LinkButton>
            <Button variant="ghost" onClick={() => close(false)}>
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="rounded-[18px] bg-surface-alt p-4">
            <p className="text-[17px] font-extrabold text-ink">{vehicleTitleYear(offer.vehicle)}</p>
            <p className="mt-1 text-[14px] text-muted">
              {range(start, end)} · {plural(days, "jour")}
            </p>
            {offer.pickupLocation && (
              <p className="mt-2 flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-soft">
                <KeyRound className="h-4 w-4 text-brand" /> {offer.pickupLocation}
              </p>
            )}
            {withDriver && (
              <p className="mt-2 flex items-center gap-1.5 text-[13.5px] font-semibold text-[#b45309]">
                <UserRound className="h-4 w-4" /> Avec chauffeur
              </p>
            )}
          </div>
          <div className="mt-4 space-y-2 text-[14.5px]">
            <div className="flex justify-between">
              <span className="text-muted">Location</span>
              <span className="font-bold text-ink">{fcfa(days * offer.pricePerDay)}</span>
            </div>
            {withDriver && (
              <div className="flex justify-between gap-3">
                <span className="text-muted">Chauffeur</span>
                <span className="text-right font-bold text-ink">{offer.driverPricePerDay ? fcfa(days * offer.driverPricePerDay) : "À convenir avec le propriétaire"}</span>
              </div>
            )}
            {offer.depositAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted">Caution à prévoir</span>
                <span className="font-bold text-ink">{fcfa(offer.depositAmount)}</span>
              </div>
            )}
            {withDriver && (
              <div className="flex justify-between border-t border-dashed border-line pt-3 text-[16px]">
                <span className="font-bold text-ink">Total estimé</span>
                <span className="font-extrabold text-ink">{fcfa(days * (offer.pricePerDay + driverDaily))}</span>
              </div>
            )}
          </div>
          <Button block size="xl" className="mt-6" loading={busy} onClick={confirm}>
            Envoyer ma demande
          </Button>
          <p className="mt-3 text-center text-[12.5px] text-muted">Rien à payer maintenant. Vous pourrez annuler gratuitement.</p>
        </div>
      )}
    </Modal>
  );
}
