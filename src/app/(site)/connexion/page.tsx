"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AuthFlow } from "@/components/auth/auth-flow";
import { PageSpinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth";
import { isProfileComplete } from "@/lib/types";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function Connexion() {
  const router = useRouter();
  const params = useSearchParams();
  const { status, user } = useAuth();
  const next = safeNext(params.get("next"));

  useEffect(() => {
    if (status === "authenticated" && user && isProfileComplete(user)) router.replace(next);
  }, [status, user, next, router]);

  if (status === "loading") return <PageSpinner />;
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="overflow-hidden rounded-[28px] border border-line/70 bg-white shadow-lift">
        <AuthFlow onDone={() => router.replace(next)} />
      </div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Connexion />
    </Suspense>
  );
}
