"use client";

import { BellRing, Bell, Briefcase, Heart, LifeBuoy, Ticket } from "lucide-react";
import { AccountPanel } from "@/components/account/account-panel";
import { RequireAuth } from "@/components/auth/require-auth";

export default function AccountPage() {
  return (
    <RequireAuth title="Votre compte" text="Connectez-vous pour gérer votre profil, vos réservations et vos alertes.">
      <div className="mx-auto max-w-2xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <AccountPanel
          space="site"
          links={[
            { href: "/reservations", label: "Mes réservations", icon: <Ticket />, hint: "Trajets et locations" },
            { href: "/favoris", label: "Favoris", icon: <Heart /> },
            { href: "/alertes", label: "Alertes trajet", icon: <BellRing />, hint: "Soyez prévenu des nouveaux trajets" },
            { href: "/notifications", label: "Notifications", icon: <Bell /> },
            { href: "/pro/tableau-de-bord", label: "Espace Pro", icon: <Briefcase />, hint: "Proposer un trajet ou louer votre voiture" },
            { href: "/aide", label: "Aide", icon: <LifeBuoy /> },
          ]}
        />
      </div>
    </RequireAuth>
  );
}
