"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { useDebounced } from "@/lib/hooks";
import { contactLabel, fullName, type User } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Champ de recherche, retardé pour ne pas interroger le serveur à chaque touche. */
export function useSearchState(delay = 350) {
  const [q, setQ] = useState("");
  const debounced = useDebounced(q.trim(), delay);
  return { q, setQ, debounced };
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="w-full sm:max-w-sm">
      <Input icon={<Search />} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </div>
  );
}

/** Ligne de filtres : recherche et sélecteurs, sur une ou deux lignes selon la place. */
export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>;
}

/** Pagination « Précédent / Suivant » avec le rang des éléments affichés. */
export function Pager({ page, pageSize, total, onPage }: { page: number; pageSize: number; total: number; onPage: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <p className="text-[13px] font-semibold text-muted">
        {from}–{to} sur {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)} icon={<ChevronLeft className="h-4 w-4" />}>
          Précédent
        </Button>
        <span className="hidden text-[13px] font-semibold text-muted sm:inline">
          Page {page} / {pages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)} iconRight={<ChevronRight className="h-4 w-4" />}>
          Suivant
        </Button>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4, className = "h-28" }: { rows?: number; className?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn("rounded-[20px]", className)} />
      ))}
    </div>
  );
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-[24px] border border-dashed border-line bg-white">
      <EmptyState
        icon={<TriangleAlert />}
        title="Impossible de charger la liste"
        text="Vérifiez votre connexion puis réessayez."
        action={
          <Button variant="soft" onClick={onRetry}>
            Réessayer
          </Button>
        }
      />
    </div>
  );
}

export function EmptyList({ icon, title, text }: { icon: ReactNode; title: string; text?: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-line bg-white">
      <EmptyState icon={icon} title={title} text={text} />
    </div>
  );
}

/** Carte d'une ligne de liste (apparition en cascade). */
export function AdminCard({ index = 0, className, children }: { index?: number; className?: string; children: ReactNode }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 10) * 0.025 }}
      className={cn("rounded-[20px] border border-line/70 bg-white p-4 shadow-card sm:p-5", className)}
    >
      {children}
    </motion.li>
  );
}

/** Liste de cartes qui s'atténue pendant le rechargement d'une page. */
export function CardList({ children, refreshing }: { children: ReactNode; refreshing?: boolean }) {
  return <ul className={cn("space-y-3 transition-opacity", refreshing && "opacity-60")}>{children}</ul>;
}

/** Personne concernée : nom (lien vers sa fiche) et numéro. */
export function PersonTag({ user, label, link = true, avatar = false, className }: { user?: User | null; label?: string; link?: boolean; avatar?: boolean; className?: string }) {
  if (!user) return <span className="text-muted">—</span>;
  const name = fullName(user);
  const inner = (
    <>
      {avatar && <Avatar user={user} size={28} />}
      <span className="min-w-0">
        {label && <span className="mr-1.5 text-muted">{label}</span>}
        <span className="font-bold text-ink">{name}</span>
        {user.isActive === false && <span className="ml-1.5 rounded-full bg-danger/10 px-1.5 py-0.5 text-[11px] font-bold text-danger">suspendu</span>}
        {user.phone && <span className="ml-1.5 text-muted">{contactLabel(user)}</span>}
      </span>
    </>
  );
  const base = cn("inline-flex items-center gap-2 text-[13.5px] leading-snug", className);
  return link ? (
    <Link href={`/admin/utilisateurs/${user.id}`} className={cn(base, "rounded-md transition hover:text-brand [&_.font-bold]:hover:text-brand")}>
      {inner}
    </Link>
  ) : (
    <span className={base}>{inner}</span>
  );
}

/** Petite ligne d'informations séparées par des points médians. */
export function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[13px] leading-relaxed text-muted", className)}>{children}</p>;
}
