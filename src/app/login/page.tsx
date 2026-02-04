"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authService, usersService } from "@/lib/services";
import { setAuthToken } from "@/lib/api";
import { useAuth } from "@/providers";
import { getIntendedAction, clearIntendedAction } from "@/lib/redirect";
import { Car, Sparkles, Shield, Users } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, needsOnboarding, setUserMode, refetch } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processAuthCallback = async () => {
      const token = searchParams.get("token");
      if (token && !isProcessing) {
        setIsProcessing(true);
        setAuthToken(token);
        await refetch();
        
        // Check for intended action
        const intendedAction = getIntendedAction();
        
        if (intendedAction) {
          // User had an intended action, set their mode and redirect
          try {
            await usersService.updateUserMode(intendedAction.mode);
            await refetch();
            clearIntendedAction();
            router.push(intendedAction.redirectUrl);
          } catch (error) {
            // If mode update fails, clear and go to onboarding
            clearIntendedAction();
            router.push("/onboarding");
          }
        } else {
          // No intended action, check if needs onboarding
          router.push("/onboarding");
        }
      }
    };

    processAuthCallback();
  }, [searchParams, router, refetch, isProcessing]);

  useEffect(() => {
    if (isAuthenticated && !isProcessing) {
      const intendedAction = getIntendedAction();
      if (intendedAction) {
        // Already authenticated, redirect to intended URL
        clearIntendedAction();
        router.push(intendedAction.redirectUrl);
      } else if (needsOnboarding) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, needsOnboarding, router, isProcessing]);

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleLoginUrl();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      <div className="absolute inset-0 pattern-dots opacity-30" />

      <div className="container relative flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-glow">
                <Car className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Taagno
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Bienvenue</h1>
            <p className="text-muted-foreground">
              Connectez-vous pour accéder à votre compte
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-elevated glass-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            <CardContent className="p-8">
              <Button
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-14 gap-3 text-base font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 group"
              >
                <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuer avec Google
              </Button>

              <div className="mt-8 pt-6 border-t border-border/50">
                <p className="text-center text-sm text-muted-foreground">
                  En vous connectant, vous acceptez nos{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    conditions d&apos;utilisation
                  </a>{" "}
                  et notre{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    politique de confidentialité
                  </a>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trust indicators */}
          <div className="mt-8 flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>+1000 utilisateurs</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>100% gratuit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="container relative flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Skeleton className="h-14 w-14 rounded-2xl mx-auto mb-4" />
            <Skeleton className="h-8 w-32 mx-auto mb-2" />
            <Skeleton className="h-5 w-48 mx-auto" />
          </div>
          <Card className="border-0 shadow-elevated">
            <CardContent className="p-8">
              <Skeleton className="h-14 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}
