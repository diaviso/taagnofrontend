"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Bell, BellRing, Briefcase, Heart, LogOut, ShieldCheck, Ticket, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { fullName, isAdmin } from "@/lib/types";
import { prettyPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";

export type MenuSpace = "site" | "pro" | "admin";

/** Menu du compte (avatar) : raccourcis de l'espace courant et passage d'un espace à l'autre. */
export function UserMenu({ space }: { space: MenuSpace }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  if (!user) return null;

  const items: { href: string; label: string; icon: ReactNode }[] =
    space === "pro"
      ? [
          { href: "/pro/profil", label: "Mon profil", icon: <UserRound /> },
          { href: "/pro/notifications", label: "Notifications", icon: <Bell /> },
        ]
      : space === "admin"
        ? []
        : [
            { href: "/reservations", label: "Mes réservations", icon: <Ticket /> },
            { href: "/favoris", label: "Favoris", icon: <Heart /> },
            { href: "/alertes", label: "Alertes trajet", icon: <BellRing /> },
            { href: "/compte", label: "Mon compte", icon: <UserRound /> },
          ];

  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full p-0.5 pr-0.5 transition hover:bg-surface-alt sm:pr-3"
          aria-label="Mon compte"
        >
          <Avatar user={user} size={36} />
          <span className="hidden max-w-[120px] truncate text-[14px] font-bold text-ink sm:block">{user.firstName || "Mon compte"}</span>
        </button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={10}
          className="z-[70] w-[270px] overflow-hidden rounded-[20px] border border-line bg-white p-1.5 shadow-lift data-[state=open]:animate-[pop_.16s_ease-out]"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar user={user} size={42} />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-extrabold text-ink">{fullName(user)}</p>
              <p className="truncate text-[12.5px] text-muted">{prettyPhone(user.phone, true) || user.email}</p>
            </div>
          </div>
          <Dropdown.Separator className="my-1 h-px bg-line" />
          {items.map((it) => (
            <MenuLink key={it.href} href={it.href} icon={it.icon}>
              {it.label}
            </MenuLink>
          ))}
          {items.length > 0 && <Dropdown.Separator className="my-1 h-px bg-line" />}
          {space !== "pro" && (
            <MenuLink href="/pro/tableau-de-bord" icon={<Briefcase />} accent="pro">
              Espace Pro <span className="ml-auto text-[11.5px] font-semibold text-muted">conducteurs, loueurs</span>
            </MenuLink>
          )}
          {space !== "site" && (
            <MenuLink href="/" icon={<Ticket />} accent="site">
              Site voyageur
            </MenuLink>
          )}
          {isAdmin(user) && space !== "admin" && (
            <MenuLink href="/admin" icon={<ShieldCheck />} accent="admin">
              Administration
            </MenuLink>
          )}
          <Dropdown.Separator className="my-1 h-px bg-line" />
          <Dropdown.Item
            onSelect={() => {
              signOut();
              router.push(space === "pro" ? "/pro" : "/");
            }}
            className="flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-semibold text-danger outline-none data-[highlighted]:bg-danger/8 [&_svg]:h-[18px] [&_svg]:w-[18px]"
          >
            <LogOut /> Se déconnecter
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

function MenuLink({ href, icon, children, accent }: { href: string; icon: ReactNode; children: ReactNode; accent?: "pro" | "site" | "admin" }) {
  const color = accent === "pro" ? "#b45309" : accent === "site" ? "#15803d" : accent === "admin" ? "#4f46e5" : undefined;
  return (
    <Dropdown.Item asChild>
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-semibold text-ink outline-none transition data-[highlighted]:bg-surface-alt",
          "[&_svg]:h-[18px] [&_svg]:w-[18px] [&_svg]:text-muted",
        )}
      >
        <span style={color ? { color } : undefined} className="flex [&_svg]:!text-current">
          {icon}
        </span>
        <span className="flex flex-1 items-center gap-2">{children}</span>
      </Link>
    </Dropdown.Item>
  );
}
