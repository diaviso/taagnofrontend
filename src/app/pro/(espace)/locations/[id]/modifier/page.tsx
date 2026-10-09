"use client";

import { useParams } from "next/navigation";
import { OfferEditor } from "@/components/pro/offer-editor";

export default function EditOfferPage() {
  const { id } = useParams<{ id: string }>();
  return <OfferEditor offerId={id} />;
}
