import type { Metadata } from "next";
import { Suspense } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { RentalBookingDetail } from "@/components/booking/booking-detail";
import { PageSpinner } from "@/components/ui/spinner";

export const metadata: Metadata = { title: "Ma location" };

export default async function RentalBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <RequireAuth>
      <Suspense fallback={<PageSpinner />}>
        <RentalBookingDetail id={id} />
      </Suspense>
    </RequireAuth>
  );
}
