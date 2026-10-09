"use client";

import { useParams } from "next/navigation";
import { TripEditor } from "@/components/pro/trip-editor";

export default function EditTripPage() {
  const { id } = useParams<{ id: string }>();
  return <TripEditor tripId={id} />;
}
