"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/services";
import { setAuthToken } from "@/lib/api";
import { useAuth } from "@/providers";
import { toast } from "sonner";
import { Car, Phone, ArrowRight, Loader2, ArrowLeft, Shield } from "lucide-react";

type Step = "phone" | "otp";

export default function PhoneAuthPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;

    setIsSubmitting(true);
    try {
      const result = await authService.sendPhoneOtp(phone);

      // Numéro déjà vérifié → connexion directe sans OTP
      if (result.alreadyVerified && result.access_token) {
        setAuthToken(result.access_token);
        await refetch();
        toast.success("Connexion réussie !");
        router.push("/onboarding");
        return;
      }

      toast.success("Code SMS envoyé !");
      setStep("otp");
      startCountdown();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Impossible d'envoyer le SMS");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setIsSubmitting(true);
    try {
      const result = await authService.verifyPhoneOtp({ phone, code: otp });
      setAuthToken(result.access_token);
      await refetch();
      toast.success("Connexion réussie !");
      router.push("/onboarding");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Code invalide ou expiré");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
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

  return (
    <div className="min-h-screen relative overflow-hidden">
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
            <h1 className="text-2xl font-bold mb-2">Connexion par SMS</h1>
            <p className="text-muted-foreground">
              {step === "phone"
                ? "Entrez votre numéro de téléphone"
                : `Code envoyé au ${phone}`}
            </p>
          </div>

          <Card className="border-0 shadow-elevated glass-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            <CardContent className="p-8">

              {step === "phone" ? (
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
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {isSubmitting ? "Envoi en cours..." : "Recevoir le code SMS"}
                  </Button>
                </form>
              ) : (
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
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    {isSubmitting ? "Vérification..." : "Valider le code"}
                  </Button>

                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={countdown > 0 || isSubmitting}
                      className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `Renvoyer le code (${countdown}s)` : "Renvoyer le code"}
                    </button>
                    <br />
                    <button
                      type="button"
                      onClick={() => { setStep("phone"); setOtp(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="h-3 w-3" /> Changer de numéro
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-border/50 text-center">
                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Retour à la connexion par email
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
