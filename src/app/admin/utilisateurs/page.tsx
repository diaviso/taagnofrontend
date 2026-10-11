"use client";

import { motion } from "framer-motion";
import { ChevronRight, Search, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ExportButton } from "@/components/admin/export-button";
import { ProPageHeader } from "@/components/pro/widgets";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { EmptyState, Segmented, Skeleton } from "@/components/ui/misc";
import { useAdminUsers } from "@/lib/admin";
import { useDebounced } from "@/lib/hooks";
import { date } from "@/lib/format";
import { contactLabel, fullName } from "@/lib/types";

type Filter = "ALL" | "ACTIVE" | "SUSPENDED";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");
  const debounced = useDebounced(search.trim(), 350);
  const { data: all, isPending, isFetching } = useAdminUsers(debounced);
  // Le serveur renvoie tous les comptes : le filtre actifs / suspendus se fait ici.
  const data = all?.filter((u) => (filter === "ACTIVE" ? u.isActive !== false : filter === "SUSPENDED" ? u.isActive === false : true));
  const suspended = all?.filter((u) => u.isActive === false).length ?? 0;

  return (
    <div>
      <ProPageHeader
        title="Utilisateurs"
        subtitle={data ? `${data.length} compte${data.length > 1 ? "s" : ""}${debounced || filter !== "ALL" ? ` trouvé${data.length > 1 ? "s" : ""}` : ""}` : undefined}
        actions={<ExportButton kind="users" />}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-md">
          <Input icon={<Search />} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom, e-mail ou numéro (77 123 45 67)" aria-label="Rechercher un utilisateur" />
        </div>
        <Segmented
          layoutId="admin-users-filter"
          className="w-full sm:w-auto"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ALL", label: "Tous" },
            { value: "ACTIVE", label: "Actifs" },
            { value: "SUSPENDED", label: "Suspendus", count: filter === "SUSPENDED" ? undefined : suspended },
          ]}
        />
      </div>
      <div className={`mt-6 transition-opacity ${isFetching && !isPending ? "opacity-60" : ""}`}>
        {isPending ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-[20px]" />
            ))}
          </div>
        ) : !data?.length ? (
          <EmptyState icon={<Users />} title="Aucun utilisateur trouvé" text={filter === "SUSPENDED" ? "Aucun compte suspendu pour le moment." : undefined} />
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
                      {u.isActive === false && <Badge tone="danger">Suspendu</Badge>}
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
