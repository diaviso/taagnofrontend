import { MessageCircle, Phone } from "lucide-react";
import { prettyPhone, whatsappLink } from "@/lib/phone";
import { cn } from "@/lib/utils";

/** Appeler / WhatsApp : affichés une fois la réservation confirmée. */
export function ContactButtons({ phone, name, message, className, compact }: { phone?: string | null; name: string; message?: string; className?: string; compact?: boolean }) {
  if (!phone) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <a
        href={`tel:${phone}`}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[12px] bg-brand-soft font-bold text-brand transition hover:brightness-95 active:scale-[0.97]",
          compact ? "h-9 px-3 text-[13px]" : "h-11 flex-1 px-4 text-[14px]",
        )}
      >
        <Phone className="h-4 w-4" /> {compact ? "Appeler" : `Appeler ${name}`}
      </a>
      <a
        href={whatsappLink(phone, message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[12px] bg-whatsapp/12 font-bold text-[#128c4a] transition hover:bg-whatsapp/20 active:scale-[0.97]",
          compact ? "h-9 px-3 text-[13px]" : "h-11 flex-1 px-4 text-[14px]",
        )}
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      {!compact && <p className="w-full text-center text-[12.5px] text-muted">{prettyPhone(phone, true)}</p>}
    </div>
  );
}
