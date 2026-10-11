import type { Metadata } from "next";
import { Suspense } from "react";
import { PageSpinner } from "@/components/ui/spinner";
import { RentalsAdmin } from "./rentals-admin";

export const metadata: Metadata = { title: "Locations" };

export default function AdminRentalsPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <RentalsAdmin />
    </Suspense>
  );
}
