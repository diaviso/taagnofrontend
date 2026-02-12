"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authService } from "@/lib/services";
import { toast } from "sonner";
import {
  Car,
  CheckCircle2,
  Mail,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newCode.every((d) => d !== "")) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleSubmit(pasted);
    }
  };

  const handleSubmit = async (codeStr?: string) => {
    const finalCode = codeStr || code.join("");
    if (finalCode.length !== 6 || !email) return;

    setIsSubmitting(true);
    try {
      await authService.verifyEmail({ email, code: finalCode });
      setIsSuccess(true);
      toast.success("Email vérifié avec succès !");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Code invalide ou expiré";
      toast.error(message);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await authService.resendCode(email);
      toast.success("Un nouveau code a été envoyé à votre adresse email.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const message = error.response?.data?.message || "";
      if (message.includes("déjà vérifié")) {
        toast.info("Votre compte est déjà vérifié. Connectez-vous.");
        router.push("/login");
      } else {
        toast.error(message || "Erreur lors du renvoi du code.");
      }
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
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
                  <Mail className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Lien invalide</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Veuillez vous inscrire pour recevoir un code de vérification.
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
            <h1 className="text-2xl font-bold mb-2">
              {isSuccess ? "Email vérifié !" : "Vérifiez votre email"}
            </h1>
            {!isSuccess && (
              <p className="text-muted-foreground">
                Un code à 6 chiffres a été envoyé à{" "}
                <strong className="text-foreground">{email}</strong>
              </p>
            )}
          </div>

          <Card className="border-0 shadow-elevated glass-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
            <CardContent className="p-8">
              {isSuccess ? (
                <div className="text-center py-4">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Compte activé !
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Votre adresse email a été vérifiée avec succès. Vous pouvez
                    maintenant vous connecter.
                  </p>
                  <Link href="/login">
                    <Button className="gap-2 bg-primary hover:bg-primary/90">
                      Se connecter
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  {/* Code inputs */}
                  <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-background"
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSubmit()}
                    className="w-full h-12 gap-2 bg-primary hover:bg-primary/90 mb-4"
                    disabled={isSubmitting || code.some((d) => d === "")}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    {isSubmitting ? "Vérification..." : "Vérifier"}
                  </Button>

                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Vous n&apos;avez pas reçu le code ?
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResendCode}
                      disabled={isResending}
                      className="gap-2 text-primary"
                    >
                      {isResending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Renvoyer le code
                    </Button>

                    <div className="pt-2">
                      <Link
                        href="/login"
                        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        Retour à la connexion
                      </Link>
                    </div>
                  </div>
                </div>
              )}
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
              <div className="flex justify-center gap-3 mb-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="w-12 h-14 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
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
