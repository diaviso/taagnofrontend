"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // The backend verify-email endpoint redirects to /login?verified=true on success
  // This page is a fallback if the user lands here directly
  if (!token) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="container relative flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-glow">
                <Car className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Taagno
              </span>
            </div>

            <Card className="border-0 shadow-elevated glass-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
              <CardContent className="p-8">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Lien invalide</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Ce lien de vérification est invalide ou a déjà été utilisé.
                </p>
                <Link href="/login">
                  <Button className="gap-2 bg-primary hover:bg-primary/90">
                    Aller à la page de connexion
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If token is present, redirect to the backend verify-email endpoint
  // which will then redirect to /login?verified=true
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3008/api";
  if (typeof window !== "undefined") {
    window.location.href = `${apiUrl}/auth/verify-email?token=${token}`;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="container relative flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-glow">
              <Car className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Taagno
            </span>
          </div>

          <Card className="border-0 shadow-elevated glass-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            <CardContent className="p-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Vérification en cours...
              </h3>
              <p className="text-muted-foreground text-sm">
                Veuillez patienter pendant que nous vérifions votre adresse
                email.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="container relative flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <div className="w-full max-w-md text-center">
          <Skeleton className="h-14 w-14 rounded-2xl mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Card className="border-0 shadow-elevated">
            <CardContent className="p-8">
              <Skeleton className="h-10 w-10 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
