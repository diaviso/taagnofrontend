import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { MyBookings } from "@/components/booking/my-bookings";
import { PageSpinner } from "@/components/ui/spinner";

export const metadata: Metadata = { title: "Mes réservations" };

export default function ReservationsPage() {
  return (
    <RequireAuth title="Vos réservations" text="Connectez-vous pour retrouver vos trajets et vos locations.">
      <Suspense fallback={<PageSpinner />}>
        <MyBookings />
      </Suspense>
    </RequireAuth>
  );
}
