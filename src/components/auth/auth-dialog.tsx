"use client";

import { Modal } from "@/components/ui/modal";
import { useAuth, useAuthDialog } from "@/lib/auth";
import { isProfileComplete } from "@/lib/types";
import { AuthFlow } from "./auth-flow";

/** Fenêtre de connexion ouverte par `requireAuth()` (réserver, publier, favoris…). */
export function AuthDialog() {
  const { state, close } = useAuthDialog();
  const { user, signOut } = useAuth();

  const onOpenChange = (open: boolean) => {
    if (open) return;
    // Fermée en cours d'inscription : la session incomplète est abandonnée.
    if (user && !isProfileComplete(user)) signOut();
    close(false);
  };

  return (
    <Modal open={state.open} onOpenChange={onOpenChange} title="Connexion" hideHeader size="sm" className="sm:max-w-[440px]">
      <div className="-mx-6 -mb-6 -mt-2">
        <AuthFlow reason={state.reason} onDone={() => close(true)} />
      </div>
    </Modal>
  );
}
