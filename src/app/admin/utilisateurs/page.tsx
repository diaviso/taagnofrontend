"use client";

import { motion } from "framer-motion";
import { ChevronRight, Search, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProPageHeader } from "@/components/pro/widgets";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { useAdminUsers } from "@/lib/admin";
import { useDebounced } from "@/lib/hooks";
import { date } from "@/lib/format";
import { contactLabel, fullName } from "@/lib/types";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search.trim(), 350);
  const { data, isPending, isFetching } = useAdminUsers(debounced);

  return (
    <div>
      <ProPageHeader title="Utilisateurs" subtitle={data ? `${data.length} compte${data.length > 1 ? "s" : ""}${debounced ? " trouvés" : ""}` : undefined} />
      <div className="max-w-md">
        <Input icon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, e-mail ou numéro (77 123 45 67)" />
      </div>
      <div className={`mt-6 transition-opacity ${isFetching && !isPending ? "opacity-60" : ""}`}>
        {isPending ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-[20px]" />
            ))}
          </div>
        ) : !data?.length ? (
          <EmptyState icon={<Users />} title="Aucun utilisateur trouvé" />
        ) : (
          <ul className="space-y-2.5">
            {data.map((u, i) => (
              <motion.li key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.02 }}>
                <Link href={`/admin/utilisateurs/${u.id}`} className="group flex items-center gap-4 rounded-[20px] border border-line/70 bg-white p-3.5 shadow-card transition hover:shadow-lift">
                  <Avatar user={u} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[15px] font-extrabold text-ink">{fullName(u)}</p>
                      {u.role === "ADMIN" && (
                        <Badge tone="brand" icon={<ShieldCheck />}>
                          Admin
                        </Badge>
                      )}
                      {u.isActive === false && <Badge tone="danger">Désactivé</Badge>}
                    </div>
                    <p className="truncate text-[12.5px] text-muted">
                      {contactLabel(u)} · inscrit le {date(u.createdAt)}
                    </p>
                  </div>
                  <div className="hidden gap-4 text-center text-[12px] text-muted md:flex">
                    {[
                      ["Véhicules", u._count?.vehicles],
                      ["Trajets", u._count?.carpoolTripsAsDriver],
                      ["Réservations", (u._count?.carpoolReservations ?? 0) + (u._count?.rentalBookings ?? 0)],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <p className="text-[16px] font-extrabold text-ink">{value ?? 0}</p>
                        {label}
                      </div>
                    ))}
                  </div>
                  <ChevronRight className="h-5 w-5 text-faint" />
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
