"use client";

import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { PageSpinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth";
import { isProfileComplete } from "@/lib/types";

/** Page réservée aux membres connectés : propose la connexion sur place. */
export function RequireAuth({ children, title, text }: { children: ReactNode; title?: string; text?: string }) {
  const { status, user, requireAuth } = useAuth();
  if (status === "loading") return <PageSpinner />;
  if (status === "anonymous" || !user || !isProfileComplete(user)) {
    const unfinished = !!user && !isProfileComplete(user);
    return (
      <div className="mx-auto max-w-lg px-4 py-14">
        <div className="rounded-[28px] border border-line/70 bg-white shadow-card">
          <EmptyState
            icon={<LockKeyhole />}
            title={unfinished ? "Terminez votre inscription" : (title ?? "Connectez-vous pour continuer")}
            text={
              unfinished
                ? "Il ne manque qu’une étape (votre nom, votre numéro ou votre code PIN) pour accéder à cette page."
                : (text ?? "Votre numéro de téléphone et votre code PIN suffisent. Pas encore de compte ? Il se crée en une minute.")
            }
            action={
              <Button size="lg" onClick={() => requireAuth()}>
                {unfinished ? "Continuer" : "Se connecter"}
              </Button>
            }
          />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
