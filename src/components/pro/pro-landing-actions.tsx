"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/** Bouton principal de la page Pro : ouvre l'espace (connexion au besoin). */
export function ProCta({ center }: { center?: boolean }) {
  const { status, requireAuth } = useAuth();
  const router = useRouter();
  const go = () => requireAuth(() => router.push("/pro/tableau-de-bord"), "Connectez-vous ou créez votre compte pour publier vos trajets et vos véhicules.");
  return (
    <div className={cn("flex flex-wrap items-center gap-3", center && "justify-center")}>
      <Button variant="white" size="xl" onClick={go} iconRight={<ArrowRight className="h-5 w-5" />}>
        {status === "authenticated" ? "Ouvrir mon espace Pro" : "Commencer gratuitement"}
      </Button>
      {status !== "authenticated" && <span className="text-[13.5px] font-semibold text-white/80">Sans engagement, sans commission</span>}
    </div>
  );
}

export function ProHeaderActions() {
  const { status, requireAuth } = useAuth();
  const router = useRouter();
  return (
    <Button
      variant="white"
      size="sm"
      className="ml-auto h-10 rounded-full px-5 sm:ml-0"
      onClick={() => requireAuth(() => router.push("/pro/tableau-de-bord"))}
    >
      {status === "authenticated" ? "Mon espace" : "Se connecter"}
    </Button>
  );
}
