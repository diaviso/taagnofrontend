"use client";

import { ArrowRight, MessageSquareHeart, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminCard, CardList, EmptyList, ListSkeleton, LoadError, Pager, PersonTag, SearchField, Toolbar, useSearchState } from "@/components/admin/admin-ui";
import { ExportButton } from "@/components/admin/export-button";
import { ProPageHeader } from "@/components/pro/widgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/misc";
import { ConfirmModal } from "@/components/ui/modal";
import { Stars } from "@/components/ui/rating";
import { ADMIN_INVALIDATE, PAGE_SIZE, adminActions, useAdminReviews, type AdminReview } from "@/lib/admin";
import { relative } from "@/lib/format";
import { useAction } from "@/lib/queries";
import { fullName } from "@/lib/types";

type Filter = "ALL" | "1" | "2" | "3" | "4" | "5";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "1", label: "1 ★" },
  { value: "2", label: "2 ★" },
  { value: "3", label: "3 ★" },
  { value: "4", label: "4 ★" },
  { value: "5", label: "5 ★" },
];

export default function AdminReviewsPage() {
  const search = useSearchState();
  const [rating, setRating] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminReview | null>(null);
  const { run, busy } = useAction();
  const { data, isPending, isFetching, isError, refetch } = useAdminReviews({ rating: rating === "ALL" ? undefined : Number(rating), q: search.debounced || undefined, page });

  return (
    <div>
      <ProPageHeader
        title="Avis"
        subtitle={data ? `${data.total} avis${search.debounced || rating !== "ALL" ? " correspondants" : ""}` : "Les avis laissés après un trajet ou une location."}
        actions={<ExportButton kind="reviews" />}
      />
      <Toolbar>
        <SearchField
          value={search.q}
          onChange={(v) => {
            search.setQ(v);
            setPage(1);
          }}
          placeholder="Commentaire, auteur ou personne notée"
        />
        <Segmented
          layoutId="admin-reviews-rating"
          size="sm"
          className="w-full overflow-x-auto scrollbar-none sm:w-auto"
          value={rating}
          onChange={(v) => {
            setRating(v);
            setPage(1);
          }}
          options={FILTERS}
        />
      </Toolbar>

      <div className="mt-6">
        {isPending ? (
          <ListSkeleton />
        ) : isError ? (
          <LoadError onRetry={() => refetch()} />
        ) : !data.items.length ? (
          <EmptyList icon={<MessageSquareHeart />} title="Aucun avis" text="Aucun avis ne correspond à ces filtres." />
        ) : (
          <>
            <CardList refreshing={isFetching}>
              {data.items.map((r, i) => (
                <AdminCard key={r.id} index={i}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Stars value={r.rating} size={16} />
                      <span className="text-[15px] font-extrabold text-ink">{r.rating}/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="muted">{r.carpoolReservationId ? "Covoiturage" : r.rentalBookingId ? "Location" : "Avis"}</Badge>
                      <span className="text-[12.5px] text-faint">{relative(r.createdAt)}</span>
                    </div>
                  </div>
                  {r.comment ? (
                    <p className="mt-3 whitespace-pre-line break-words rounded-[14px] bg-surface-alt px-4 py-3 text-[14.5px] leading-relaxed text-ink-soft">« {r.comment} »</p>
                  ) : (
                    <p className="mt-3 text-[13.5px] italic text-muted">Note sans commentaire.</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <PersonTag user={r.author} label="De" />
                    <ArrowRight className="hidden h-4 w-4 text-faint sm:block" />
                    <PersonTag user={r.target} label="Pour" />
                  </div>
                  <div className="mt-3 flex justify-end border-t border-dashed border-line pt-3">
                    <Button variant="danger" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={() => setTarget(r)}>
                      Supprimer
                    </Button>
                  </div>
                </AdminCard>
              ))}
            </CardList>
            <Pager page={data.page} pageSize={data.pageSize || PAGE_SIZE} total={data.total} onPage={setPage} />
          </>
        )}
      </div>

      <ConfirmModal
        open={!!target}
        onOpenChange={(v) => !v && setTarget(null)}
        title="Supprimer cet avis ?"
        danger
        confirmLabel="Supprimer l’avis"
        loading={busy === "delete"}
        message={
          target && (
            <>
              L’avis {target.rating}/5 de <strong>{fullName(target.author)}</strong> sur <strong>{fullName(target.target)}</strong> sera supprimé. Sa note sera retirée de la note moyenne de {fullName(target.target)}. Cette action est irréversible.
            </>
          )
        }
        onConfirm={async () => {
          if (!target) return;
          const ok = await run("delete", () => adminActions.deleteReview(target.id), { success: "Avis supprimé, la note moyenne est mise à jour.", invalidate: ADMIN_INVALIDATE });
          if (ok !== undefined) setTarget(null);
        }}
      />
    </div>
  );
}
