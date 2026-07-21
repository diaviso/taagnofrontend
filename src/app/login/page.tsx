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
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Phone,
} from "lucide-react";

// Méthode d'authentification affichée. Le téléphone est la méthode principale.
type Method = "phone" | "email";
type PhoneStep = "phone" | "otp";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, needsOnboarding, refetch } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Navigation entre méthodes (téléphone par défaut) et sous-étape du flux SMS.
  const [method, setMethod] = useState<Method>("phone");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone");

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flux téléphone (OTP)
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [registerFirstName, setRegisterFirstName] = useState("");
  const [registerLastName, setRegisterLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  // Redirection commune après authentification réussie (email ou téléphone).
  // Règle : un profil incomplet (nom manquant, ou mode manquant) passe TOUJOURS
  // par l'onboarding. Le nom est obligatoire — on ne le contourne jamais, même
  // avec une "action voulue" en attente.
  const postAuthRedirect = async () => {
    const { data: me } = await refetch();
    const nameMissing = !me?.firstName || !me?.lastName;
    const modeMissing = !me?.userMode;

    if (nameMissing) {
      router.push("/onboarding");
      return;
    }

    const intendedAction = getIntendedAction();
    if (intendedAction) {
      // Profil nommé mais sans mode : on peut appliquer le mode de l'action voulue.
      if (modeMissing) {
        try {
          await usersService.updateUserMode(intendedAction.mode);
          await refetch();
        } catch {
          router.push("/onboarding");
          return;
        }
      }
      clearIntendedAction();
      router.push(intendedAction.redirectUrl);
      return;
    }

    if (modeMissing) {
      router.push("/onboarding");
      return;
    }

    router.push("/");
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

  // Handle OAuth callback token
  useEffect(() => {
    const processAuthCallback = async () => {
      const token = searchParams.get("token");
      if (token && !isProcessing) {
        setIsProcessing(true);
        setAuthToken(token);
        // Retirer immédiatement le token de l'URL (historique, Referer, logs).
        if (typeof window !== "undefined") {
          window.history.replaceState({}, "", "/login");
        }
        await refetch();
        await postAuthRedirect();
      }
    };

    processAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isProcessing]);

  // Handle verified=true query param → bascule sur l'onglet email/connexion
  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      toast.success("Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
      setMethod("email");
      setActiveTab("login");
    }
  }, [searchParams]);

  // Redirect if already authenticated. L'onboarding (profil incomplet : nom OU
  // mode manquant) est prioritaire sur l'action voulue.
  useEffect(() => {
    if (isAuthenticated && !isProcessing) {
      if (needsOnboarding) {
        router.push("/onboarding");
        return;
      }
      const intendedAction = getIntendedAction();
      if (intendedAction) {
        clearIntendedAction();
        router.push(intendedAction.redirectUrl);
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, needsOnboarding, router, isProcessing]);

  const handleGoogleLogin = () => {
    window.location.href = authService.getGoogleLoginUrl();
  };

  // ============ Flux téléphone (méthode principale) ============
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setIsSubmitting(true);
    try {
      await authService.sendPhoneOtp(phone);
      toast.success("Code SMS envoyé !");
      setPhoneStep("otp");
      startCountdown();
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
      toast.success("Connexion réussie !");
      await postAuthRedirect();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Code invalide ou expiré");
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

  // ============ Flux email ============
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsSubmitting(true);
    try {
      const result = await authService.login({
        email: loginEmail,
        password: loginPassword,
      });
      setAuthToken(result.access_token);
      await refetch();
      toast.success("Connexion réussie !");
      await postAuthRedirect();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Email ou mot de passe incorrect";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerPassword !== registerConfirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (registerPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await authService.register({
        email: registerEmail,
        password: registerPassword,
        firstName: registerFirstName,
        lastName: registerLastName,
      });
      toast.success(
        result.message || "Un code de vérification a été envoyé à votre email."
      );
      router.push(`/verify-email?email=${encodeURIComponent(registerEmail)}`);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erreur lors de l'inscription";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Titre/sous-titre dynamiques selon la méthode et l'étape.
  const heading =
    method === "phone"
      ? phoneStep === "otp"
        ? { title: "Vérification", subtitle: `Code envoyé au ${phone}` }
        : {
            title: "Bienvenue sur Taagno",
            subtitle: "Connectez-vous ou inscrivez-vous avec votre numéro",
          }
      : activeTab === "login"
        ? {
            title: "Connexion",
            subtitle: "Connectez-vous pour accéder à votre compte",
          }
        : {
            title: "Créer un compte",
            subtitle: "Inscrivez-vous pour rejoindre la communauté",
          };

  const googleButton = (
    <Button
      onClick={handleGoogleLogin}
      variant="outline"
      className="w-full h-12 gap-3 text-sm font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 group"
    >
      <svg
        className="h-5 w-5 group-hover:scale-110 transition-transform"
        viewBox="0 0 24 24"
      >
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
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />

      <div className="container relative flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
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

          {/* Card */}
          <Card className="border-0 shadow-elevated glass-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            <CardContent className="p-8">

              {/* ============ MÉTHODE PRINCIPALE : TÉLÉPHONE ============ */}
              {method === "phone" && phoneStep === "phone" && (
                <>
                  <form onSubmit={handleSendOtp} className="space-y-5">
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

                    <Button
                      type="submit"
                      className="w-full h-12 gap-2 bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {isSubmitting ? "Envoi en cours..." : "Continuer avec mon numéro"}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-3 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  {googleButton}

                  <Button
                    onClick={() => setMethod("email")}
                    variant="ghost"
                    className="w-full h-12 gap-3 mt-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-5 w-5" />
                    Continuer avec un email
                  </Button>
                </>
              )}

              {/* Étape OTP du flux téléphone */}
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

                  <Button
                    type="submit"
                    className="w-full h-12 gap-2 bg-primary hover:bg-primary/90"
                    disabled={isSubmitting || otp.length !== 6}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Vérification..." : "Valider le code"}
                  </Button>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isSubmitting}
                      className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `Renvoyer le code (${countdown}s)` : "Renvoyer le code"}
                    </button>
                    <br />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneStep("phone");
                        setOtp("");
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" /> Changer de numéro
                    </button>
                  </div>
                </form>
              )}

              {/* ============ MÉTHODE SECONDAIRE : EMAIL ============ */}
              {method === "email" && (
                <>
                  <button
                    type="button"
                    onClick={() => setMethod("phone")}
                    className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3 w-3" /> Revenir au téléphone
                  </button>

                  {/* Tabs */}
                  <div className="flex rounded-xl bg-muted/50 p-1 mb-6">
                    <button
                      onClick={() => setActiveTab("login")}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "login"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Connexion
                    </button>
                    <button
                      onClick={() => setActiveTab("register")}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                        activeTab === "register"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Inscription
                    </button>
                  </div>

                  {/* Login Form */}
                  {activeTab === "login" && (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Mot de passe</Label>
                          <Link
                            href="/forgot-password"
                            className="text-xs text-primary hover:underline"
                          >
                            Mot de passe oublié ?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pl-10 pr-10 h-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 gap-2 bg-primary hover:bg-primary/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                        {isSubmitting ? "Connexion..." : "Se connecter"}
                      </Button>
                    </form>
                  )}

                  {/* Register Form */}
                  {activeTab === "register" && (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="register-firstname">Prénom</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="register-firstname"
                              type="text"
                              placeholder="Prénom"
                              value={registerFirstName}
                              onChange={(e) => setRegisterFirstName(e.target.value)}
                              className="pl-10 h-12"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-lastname">Nom</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="register-lastname"
                              type="text"
                              placeholder="Nom"
                              value={registerLastName}
                              onChange={(e) => setRegisterLastName(e.target.value)}
                              className="pl-10 h-12"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Mot de passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 8 caractères"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="pl-10 pr-10 h-12"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Au moins 8 caractères, une majuscule, une minuscule et un chiffre
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password">
                          Confirmer le mot de passe
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="register-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmez votre mot de passe"
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 h-12"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12 gap-2 bg-primary hover:bg-primary/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        {isSubmitting ? "Inscription..." : "S'inscrire"}
                      </Button>
                    </form>
                  )}

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-3 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  {googleButton}
                </>
              )}

              {/* Terms */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-center text-xs text-muted-foreground">
                  En continuant, vous acceptez nos{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    CGU
                  </Link>{" "}
                  et notre{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    politique de confidentialité
                  </Link>
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
