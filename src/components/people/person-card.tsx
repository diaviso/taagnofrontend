"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { RatingPill } from "@/components/ui/rating";
import { memberSince, plural } from "@/lib/format";
import { usePublicProfile } from "@/lib/queries";
import { shortName, userRating, type User } from "@/lib/types";

/** Carte « conducteur » / « propriétaire » : identité publique et lien vers le profil. */
export function PersonCard({ user, role, href }: { user?: User | null; role: string; href?: string }) {
  const { data: profile } = usePublicProfile(user?.id);
  const person = { ...user, ...profile } as User;
  const stats = profile?.stats;
  const link = href ?? (user?.id ? `/membres/${user.id}` : undefined);
  const content = (
    <>
      <Avatar user={person} size={56} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold uppercase tracking-wide text-muted">{role}</p>
        <p className="truncate text-[17px] font-extrabold text-ink">{shortName(person)}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-muted">
          <RatingPill value={userRating(person)} count={person.ratingCount} />
          {stats?.tripsCompleted ? <span>· {plural(stats.tripsCompleted, "trajet")}</span> : null}
          {stats?.rentalsCompleted ? <span>· {plural(stats.rentalsCompleted, "location")}</span> : null}
          {person.createdAt && <span className="hidden sm:inline">· {memberSince(person.createdAt)}</span>}
        </div>
      </div>
      {link && <ChevronRight className="h-5 w-5 shrink-0 text-faint transition group-hover:translate-x-0.5 group-hover:text-brand" />}
    </>
  );
  return (
    <div>
      {link ? (
        <Link href={link} className="group flex items-center gap-4 rounded-[18px] transition">
          {content}
        </Link>
      ) : (
        <div className="flex items-center gap-4">{content}</div>
      )}
      {person.bio && <p className="mt-4 rounded-[16px] bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-ink-soft">« {person.bio} »</p>}
    </div>
  );
}
