"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { reviewsService } from "@/lib/services";
import { toast } from "sonner";

// Dialogue pour laisser un avis (note 1–5 + commentaire) sur une transaction
// terminée. Fournir soit carpoolReservationId, soit rentalBookingId.
export function ReviewDialog({
  trigger,
  targetName,
  carpoolReservationId,
  rentalBookingId,
  onReviewed,
}: {
  trigger: React.ReactNode;
  targetName?: string;
  carpoolReservationId?: string;
  rentalBookingId?: string;
  onReviewed?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      toast.error("Choisissez une note");
      return;
    }
    setSubmitting(true);
    try {
      await reviewsService.create({
        rating,
        comment: comment.trim() || undefined,
        carpoolReservationId,
        rentalBookingId,
      });
      toast.success("Merci pour votre avis !");
      setOpen(false);
      setRating(0);
      setComment("");
      onReviewed?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Impossible d'envoyer l'avis");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Noter {targetName || "cette personne"}</DialogTitle>
          <DialogDescription>
            Votre avis aide la communauté à voyager en confiance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-3">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Note">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i} étoile${i > 1 ? "s" : ""}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-9 w-9 transition-colors ${
                    (hover || rating) >= i
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Ajoutez un commentaire (optionnel)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            className="min-h-24"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={submitting || rating < 1} className="gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Envoyer mon avis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
