import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { TripBookingDetail } from "@/components/booking/booking-detail";
import { PageSpinner } from "@/components/ui/spinner";

export const metadata: Metadata = { title: "Ma réservation" };

export default async function TripBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequireAuth>
      <Suspense fallback={<PageSpinner />}>
        <TripBookingDetail id={id} />
      </Suspense>
    </RequireAuth>
  );
}
