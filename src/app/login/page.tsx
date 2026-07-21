"use client";

import { useEffect, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { authService, usersService } from "@/lib/services";
import { Role } from "@/types";
import { setAuthToken } from "@/lib/api";
import { useAuth } from "@/providers";
import { getIntendedAction, clearIntendedAction } from "@/lib/redirect";
import { toast } from "sonner";
import {
  Car,
  Sparkles,
  Shield,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  KeyRound,
} from "lucide-react";

// Méthode : téléphone (numéro + PIN) pour tous, admin (email + mot de passe) discret.
type Method = "phone" | "admin";
// Sous-étapes du flux téléphone.
type PhoneStep = "phone" | "pin" | "otp" | "setpin";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, needsOnboarding, refetch } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const [method, setMethod] = useState<Method>("phone");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone");
  const [resetMode, setResetMode] = useState(false); // true = OTP pour réinitialiser le PIN

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Flux téléphone
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Connexion admin (email + mot de passe)
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Redirection commune après authentification réussie.
  const postAuthRedirect = async () => {
    const { data: me } = await refetch();
    if (!me) {
      router.push("/onboarding");
      return;
    }
    const isAdmin = me.role === Role.ADMIN;
    const incomplete =
      !me.phoneVerified || !me.hasPin || !me.firstName || !me.lastName || !me.userMode;

    if (!isAdmin && incomplete) {
      router.push("/onboarding");
      return;
    }

    const intendedAction = getIntendedAction();
    if (intendedAction) {
      clearIntendedAction();
      router.push(intendedAction.redirectUrl);
      return;
    }
    router.push(isAdmin ? "/admin" : "/");
  };

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // Callback Google (token dans l'URL)
  useEffect(() => {
    const processAuthCallback = async () => {
      const token = searchParams.get("token");
      if (token && !isProcessing) {
        setIsProcessing(true);
        setAuthToken(token);
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/login");
        }
        await postAuthRedirect();
      }
    };
    processAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isProcessing]);

  // Accès admin via ?admin=1
  useEffect(() => {
    if (searchParams.get("admin") === "1") setMethod("admin");
  }, [searchParams]);

  // Utilisateur déjà connecté qui arrive sur /login → on le renvoie où il faut.
  // Ignoré pendant une connexion en cours (postAuthRedirect s'en charge alors).
  useEffect(() => {
    if (!isAuthenticated || isProcessing || isSubmitting) return;
    if (needsOnboarding) {
      router.push("/onboarding");
      return;
    }
    const intended = getIntendedAction();
    if (intended) {
      clearIntendedAction();
      router.push(intended.redirectUrl);
      return;
    }
    router.push(user?.role === Role.ADMIN ? "/admin" : "/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, needsOnboarding, isProcessing, isSubmitting]);

  // ============ Flux téléphone ============
  const handleContinuePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setIsSubmitting(true);
    try {
      const { nextStep } = await authService.checkPhone(phone);
      if (nextStep === "pin") {
        setPhoneStep("pin");
      } else {
        // Nouveau numéro ou PIN pas encore défini → OTP d'inscription.
        await authService.sendPhoneOtp(phone);
        setResetMode(false);
        setPhoneStep("otp");
        startCountdown();
        toast.success("Code SMS envoyé !");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;
    setIsSubmitting(true);
    try {
      const result = await authService.pinLogin({ phone, pin });
      setAuthToken(result.access_token);
      await refetch();
      toast.success("Connexion réussie !");
      await postAuthRedirect();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Numéro ou code PIN incorrect");
      setPin("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPin = async () => {
    setIsSubmitting(true);
    try {
      await authService.sendPhoneOtp(phone);
      setResetMode(true);
      setPhoneStep("otp");
      startCountdown();
      toast.success("Code de réinitialisation envoyé par SMS");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Impossible d'envoyer le SMS");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setIsSubmitting(true);
    try {
      const result = await authService.verifyPhoneOtp({ phone, code: otp });
      setAuthToken(result.access_token);
      await refetch();
      if (resetMode) {
        // Réinitialisation : on force la définition d'un nouveau PIN.
        setPhoneStep("setpin");
      } else {
        toast.success("Numéro vérifié !");
        await postAuthRedirect();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Code invalide ou expiré");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetNewPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) return;
    setIsSubmitting(true);
    try {
      await usersService.setPin(newPin);
      await refetch();
      toast.success("Nouveau code PIN enregistré !");
      await postAuthRedirect();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Code PIN invalide");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsSubmitting(true);
    try {
      await authService.sendPhoneOtp(phone);
      toast.success("Nouveau code envoyé !");
      startCountdown();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Impossible de renvoyer le SMS");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleLoginUrl();
  };

  // ============ Connexion admin ============
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) return;
    setIsSubmitting(true);
    try {
      const result = await authService.login({ email: adminEmail, password: adminPassword });
      setAuthToken(result.access_token);
      await refetch();
      toast.success("Connexion réussie !");
      await postAuthRedirect();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Email ou mot de passe incorrect");
    } finally {
      setIsSubmitting(false);
    }
  };

  const heading = (() => {
    if (method === "admin")
      return { title: "Connexion admin", subtitle: "Réservé aux administrateurs" };
    switch (phoneStep) {
      case "pin":
        return { title: "Code PIN", subtitle: "Entrez votre code à 4 chiffres" };
      case "otp":
        return { title: "Vérification", subtitle: `Code envoyé au ${phone}` };
      case "setpin":
        return { title: "Nouveau code PIN", subtitle: "Choisissez un nouveau code à 4 chiffres" };
      default:
        return {
          title: "Bienvenue sur Taagno",
          subtitle: "Entrez votre numéro pour vous connecter ou vous inscrire",
        };
    }
  })();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />

      <div className="container relative flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-glow">
                <Car className="h-7 w-7 text-white" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Taagno
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{heading.title}</h1>
            <p className="text-muted-foreground">{heading.subtitle}</p>
          </div>

          <Card className="border-0 shadow-elevated glass-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            <CardContent className="p-8">

              {/* ============ TÉLÉPHONE : saisie du numéro ============ */}
              {method === "phone" && phoneStep === "phone" && (
                <>
                  <form onSubmit={handleContinuePhone} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Numéro de téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+221 77 123 45 67"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10 h-12"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Format: +221XXXXXXXXX ou 7XXXXXXXX
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-12 gap-2 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      {isSubmitting ? "Un instant..." : "Continuer"}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-3 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <Button onClick={handleGoogleLogin} variant="outline" className="w-full h-12 gap-3 text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-all group">
                    <svg className="h-5 w-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continuer avec Google
                  </Button>
                </>
              )}

              {/* ============ TÉLÉPHONE : saisie du PIN (connexion) ============ */}
              {method === "phone" && phoneStep === "pin" && (
                <form onSubmit={handlePinLogin} className="space-y-5">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <KeyRound className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin">Code PIN</Label>
                    <Input
                      id="pin"
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="h-14 text-center text-2xl font-bold tracking-[0.8em]"
                      required
                      maxLength={4}
                      autoFocus
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 gap-2 bg-primary hover:bg-primary/90" disabled={isSubmitting || pin.length !== 4}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {isSubmitting ? "Connexion..." : "Se connecter"}
                  </Button>

                  <div className="text-center space-y-2">
                    <button type="button" onClick={handleForgotPin} disabled={isSubmitting} className="text-sm text-primary hover:underline">
                      Code PIN oublié ?
                    </button>
                    <br />
                    <button type="button" onClick={() => { setPhoneStep("phone"); setPin(""); }} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                      <ArrowLeft className="h-3 w-3" /> Changer de numéro
                    </button>
                  </div>
                </form>
              )}

              {/* ============ TÉLÉPHONE : saisie de l'OTP (inscription / reset) ============ */}
              {method === "phone" && phoneStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Code de vérification</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-14 text-center text-2xl font-bold tracking-[0.5em]"
                      required
                      maxLength={6}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Entrez le code à 6 chiffres reçu par SMS
                    </p>
                  </div>

                  <Button type="submit" className="w-full h-12 gap-2 bg-primary hover:bg-primary/90" disabled={isSubmitting || otp.length !== 6}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    {isSubmitting ? "Vérification..." : "Valider le code"}
                  </Button>

                  <div className="text-center space-y-2">
                    <button type="button" onClick={handleResendOtp} disabled={countdown > 0 || isSubmitting} className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed">
                      {countdown > 0 ? `Renvoyer le code (${countdown}s)` : "Renvoyer le code"}
                    </button>
                    <br />
                    <button type="button" onClick={() => { setPhoneStep("phone"); setOtp(""); }} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                      <ArrowLeft className="h-3 w-3" /> Changer de numéro
                    </button>
                  </div>
                </form>
              )}

              {/* ============ TÉLÉPHONE : nouveau PIN (après reset) ============ */}
              {method === "phone" && phoneStep === "setpin" && (
                <form onSubmit={handleSetNewPin} className="space-y-5">
                  <div className="flex justify-center mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <KeyRound className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPin">Nouveau code PIN (4 chiffres)</Label>
                    <Input
                      id="newPin"
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="••••"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="h-14 text-center text-2xl font-bold tracking-[0.8em]"
                      required
                      maxLength={4}
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Évitez 0000, 1234 et autres codes trop simples
                    </p>
                  </div>

                  <Button type="submit" className="w-full h-12 gap-2 bg-primary hover:bg-primary/90" disabled={isSubmitting || newPin.length !== 4}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {isSubmitting ? "Enregistrement..." : "Enregistrer le PIN"}
                  </Button>
                </form>
              )}

              {/* ============ ADMIN : email + mot de passe ============ */}
              {method === "admin" && (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="admin-email" type="email" placeholder="admin@taagno.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="pl-10 h-12" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-password">Mot de passe</Label>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">Mot de passe oublié ?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="admin-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="pl-10 pr-10 h-12" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 gap-2 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {isSubmitting ? "Connexion..." : "Se connecter"}
                  </Button>
                  <button type="button" onClick={() => setMethod("phone")} className="w-full text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Retour à la connexion par téléphone
                  </button>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-center text-xs text-muted-foreground">
                  En continuant, vous acceptez nos{" "}
                  <Link href="/terms" className="text-primary hover:underline">CGU</Link>{" "}
                  et notre{" "}
                  <Link href="/privacy" className="text-primary hover:underline">politique de confidentialité</Link>.
                </p>
              </div>
            </CardContent>
          </Card>

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
            <CardContent className="p-8 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
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
