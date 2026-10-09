"use client";

import { Bell, CarFront, LifeBuoy, Ticket } from "lucide-react";
import { AccountPanel } from "@/components/account/account-panel";

export default function ProProfilePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <AccountPanel
        space="pro"
        links={[
          { href: "/pro/vehicules", label: "Mes véhicules", icon: <CarFront /> },
          { href: "/pro/notifications", label: "Notifications", icon: <Bell /> },
          { href: "/reservations", label: "Mes réservations de voyageur", icon: <Ticket />, hint: "Sur le site voyageur, avec le même compte" },
          { href: "/aide", label: "Aide", icon: <LifeBuoy /> },
        ]}
      />
    </div>
  );
}
