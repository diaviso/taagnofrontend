"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Partage (menu du téléphone) ou copie du lien. */
export function ShareButton({ title, text, className }: { title: string; text: string; className?: string }) {
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // partage annulé : on ne fait rien
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Lien copié. Collez-le dans WhatsApp ou un SMS.");
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      aria-label="Partager"
      className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-surface-alt text-ink-soft transition hover:bg-brand-soft hover:text-brand", className)}
    >
      <Share2 className="h-[18px] w-[18px]" />
    </button>
  );
}
