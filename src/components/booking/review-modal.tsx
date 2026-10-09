"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api, errorMessage } from "@/lib/api";
import { shortName, type User } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS = ["", "Décevant", "Moyen", "Bien", "Très bien", "Excellent !"];

/** Noter une réservation terminée (conducteur, passager, propriétaire ou locataire). */
export function ReviewModal({
  open,
  onOpenChange,
  person,
  role,
  carpoolReservationId,
  rentalBookingId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  person?: User | null;
  role: string;
  carpoolReservationId?: string;
  rentalBookingId?: string;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const shown = hover || rating;

  const submit = async () => {
    setBusy(true);
    try {
      await api.post("/reviews", {
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
        ...(carpoolReservationId ? { carpoolReservationId } : {}),
        ...(rentalBookingId ? { rentalBookingId } : {}),
      });
      toast.success("Merci pour votre avis !");
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Votre avis" description={`Comment s’est passé votre expérience avec ${shortName(person)} ?`} size="sm">
      <div className="flex flex-col items-center pt-2 text-center">
        <Avatar user={person} size={64} />
        <p className="mt-2 text-[15px] font-extrabold text-ink">{shortName(person)}</p>
        <p className="text-[12.5px] font-semibold text-muted">{role}</p>
        <div className="mt-5 flex gap-1.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.button
              key={i}
              type="button"
              whileTap={{ scale: 0.8 }}
              animate={{ scale: i <= shown ? 1.08 : 1 }}
              onMouseEnter={() => setHover(i)}
              onClick={() => setRating(i)}
              aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
              className="p-1"
            >
              <Star className={cn("h-10 w-10 transition-colors", i <= shown ? "fill-gold text-gold" : "fill-line text-line")} />
            </motion.button>
          ))}
        </div>
        <p className="mt-2 h-5 text-[14px] font-bold text-gold">{LABELS[shown]}</p>
      </div>
      <Textarea
        className="mt-4"
        placeholder="Un mot sur le trajet, la ponctualité, l’accueil… (facultatif)"
        value={comment}
        maxLength={500}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button block size="lg" className="mt-5" disabled={!rating} loading={busy} onClick={submit}>
        Publier mon avis
      </Button>
    </Modal>
  );
}
