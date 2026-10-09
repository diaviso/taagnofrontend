"use client";

import { BadgeCheck, CarFront, KeyRound, MessageSquareHeart, Route, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { LinkButton } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/misc";
import { RatingPill, Stars } from "@/components/ui/rating";
import { PageSpinner } from "@/components/ui/spinner";
import { memberSince, relative } from "@/lib/format";
import { usePublicProfile, useUserReviews } from "@/lib/queries";
import { shortName, userRating, type PublicProfile } from "@/lib/types";

/** Profil public d'un membre : jamais de téléphone ni d'e-mail. */
export function PublicProfileView({ id, initial }: { id: string; initial: PublicProfile | null }) {
  const { data, isPending } = usePublicProfile(id);
  const profile = data ?? initial;
  const reviews = useUserReviews(id);

  if (isPending && !profile) return <PageSpinner />;
  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-14">
        <EmptyState icon={<Users />} title="Profil introuvable" action={<LinkButton href="/">Accueil</LinkButton>} />
      </div>
    );
  }
  const s = profile.stats ?? {};
  const stats = [
    { icon: Route, label: "Trajets", value: s.tripsCompleted ?? 0 },
    { icon: Users, label: "Passagers", value: s.passengersCarried ?? 0 },
    { icon: KeyRound, label: "Locations", value: s.rentalsCompleted ?? 0 },
    { icon: CarFront, label: "Véhicules", value: s.vehiclesCount ?? 0 },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-6 sm:px-6">
      <Card className="overflow-hidden">
        <div className="h-28 bg-aurora" />
        <div className="-mt-14 flex flex-col items-center px-6 pb-6 text-center">
          <Avatar user={profile} size={112} ring />
          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-ink">{shortName(profile)}</h1>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 text-[14px] text-muted">
            <RatingPill value={userRating(profile)} count={profile.ratingCount} />
            {profile.createdAt && <span>{memberSince(profile.createdAt)}</span>}
          </div>
          {profile.phoneVerified && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[12.5px] font-bold text-success">
              <BadgeCheck className="h-4 w-4" /> Numéro vérifié
            </span>
          )}
          {profile.bio && <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">« {profile.bio} »</p>}
        </div>
        <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1 border-line py-4 [&:not(:last-child)]:border-r max-sm:[&:nth-child(2)]:border-r-0 max-sm:[&:nth-child(-n+2)]:border-b">
              <Icon className="h-4.5 w-4.5 text-brand" />
              <span className="text-[20px] font-extrabold text-ink">{value}</span>
              <span className="text-[12px] font-semibold text-muted">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-ink">
            <MessageSquareHeart className="h-5 w-5 text-brand" /> Avis
          </h2>
          {reviews.data?.averageRating ? <Stars value={reviews.data.averageRating} size={15} /> : null}
        </div>
        {!reviews.data?.reviews.length ? (
          <p className="mt-3 text-[14px] text-muted">Pas encore d’avis. Les avis apparaissent après chaque trajet ou location terminé.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.data.reviews.map((r) => (
              <li key={r.id} className="rounded-[16px] bg-surface-alt p-4">
                <div className="flex items-center gap-3">
                  <Avatar user={r.author} size={32} />
                  <span className="flex-1 text-[14px] font-bold text-ink">{shortName(r.author)}</span>
                  <Stars value={r.rating} size={13} />
                </div>
                {r.comment && <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{r.comment}</p>}
                {r.createdAt && <p className="mt-1 text-[12px] text-faint">{relative(r.createdAt)}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
