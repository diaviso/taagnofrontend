"use client";

import { Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { contactWhatsappLink, prettyPhone } from "@/lib/phone";
import { usePublicSettings } from "@/lib/queries";
import type { PublicSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Action {
  key: "phone" | "whatsapp" | "email";
  label: string;
  value: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

/** Les moyens de joindre le support renseignés dans l'administration (les autres sont ignorés). */
export function supportActions(support?: PublicSettings["support"] | null): Action[] {
  const actions: Action[] = [];
  if (support?.phone) actions.push({ key: "phone", label: "Appeler", value: prettyPhone(support.phone, true), href: `tel:${support.phone}`, icon: Phone });
  if (support?.whatsapp) {
    actions.push({
      key: "whatsapp",
      label: "WhatsApp",
      value: prettyPhone(support.whatsapp, true),
      href: contactWhatsappLink(support.whatsapp, "Bonjour, j’ai une question sur Taagno."),
      icon: MessageCircle,
      external: true,
    });
  }
  if (support?.email) actions.push({ key: "email", label: "E-mail", value: support.email, href: `mailto:${support.email}`, icon: Mail });
  return actions;
}

/**
 * Boutons Appeler / WhatsApp / E-mail du support. Rien ne s'affiche quand aucune
 * coordonnée n'est renseignée.
 */
export function SupportActions({ variant }: { variant: "cards" | "footer" }) {
  const { data } = usePublicSettings();
  return <SupportActionsView support={data?.support} variant={variant} />;
}

/** Bloc « Une question ? » de la page Aide : absent tant que le support n'a aucune coordonnée. */
export function SupportContact() {
  const { data } = usePublicSettings();
  if (!supportActions(data?.support).length) return null;
  return (
    <section className="mt-10" aria-labelledby="support-title">
      <h2 id="support-title" className="text-[20px] font-extrabold tracking-tight text-ink">
        Une autre question ?
      </h2>
      <p className="mb-4 mt-1 text-[14.5px] text-muted">L’équipe Taagno vous répond en général dans la journée.</p>
      <SupportActionsView support={data?.support} variant="cards" />
    </section>
  );
}

/** Affichage seul (aussi utilisé pour l'aperçu dans l'administration). */
export function SupportActionsView({ support, variant }: { support?: PublicSettings["support"] | null; variant: "cards" | "footer" }) {
  const actions = supportActions(support);
  if (!actions.length) return null;

  if (variant === "footer") {
    return (
      <div className="mt-6 flex flex-wrap gap-2">
        {actions.map(({ key, label, value, href, icon: Icon, external }) => (
          <a
            key={key}
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            title={value}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13.5px] font-bold text-white transition hover:bg-white/20 active:scale-95"
          >
            <Icon className="h-4 w-4" /> {label}
          </a>
        ))}
      </div>
    );
  }

  const tones: Record<Action["key"], string> = {
    phone: "bg-brand-soft text-brand",
    whatsapp: "bg-whatsapp/12 text-[#128c4a]",
    email: "bg-brand-soft text-brand",
  };
  const titles: Record<Action["key"], string> = { phone: "Appeler le support", whatsapp: "Écrire sur WhatsApp", email: "Écrire au support" };
  return (
    <div className={cn("grid gap-4", actions.length === 1 ? "" : actions.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
      {actions.map(({ key, value, href, icon: Icon, external }) => (
        <a
          key={key}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group flex items-center gap-4 rounded-[22px] border border-line/70 bg-white p-5 shadow-card transition hover:shadow-lift"
        >
          <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]", tones[key])}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-extrabold text-ink">{titles[key]}</span>
            <span className="block truncate text-[13.5px] text-muted">{value}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
