"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, MessageSquareText, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { api, ApiError, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPhoneInput, isValidPhone, phoneDigits, phoneE164, prettyPhone } from "@/lib/phone";
import type { User } from "@/lib/types";

type Step = "phone" | "pin" | "code";

const TITLES: Record<Step, [string, string]> = {
  phone: ["Changer de numéro", "Entrez votre nouveau numéro : un code vous sera envoyé par SMS."],
  pin: ["Code PIN actuel", "Pour votre sécurité, saisissez votre code PIN."],
  code: ["Vérification", "Saisissez le code à 6 chiffres reçu par SMS."],
};

/**
 * Changement de numéro : nouveau numéro → code PIN actuel (si le compte en a un) → code SMS.
 * Le numéro actuel reste actif jusqu'à la validation du code (le nouveau est « en attente »).
 */
export function ChangePhoneModal({
  open,
  onOpenChange,
  user,
  resume,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  /** Reprend un changement déjà commencé (`user.pendingPhone`) à l'étape du code SMS. */
  resume?: boolean;
}) {
  const queryClient = useQueryClient();
  const { refresh } = useAuth();
  const needsPin = !!user.hasPin && !!user.phoneVerified;
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [testCode, setTestCode] = useState<string | null>(null);

  // À l'ouverture : on repart de zéro, ou on reprend un changement en attente.
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      const pending = resume && user.pendingPhone ? user.pendingPhone : "";
      setStep(pending ? "code" : "phone");
      setPhone(formatPhoneInput(pending));
      setPin("");
      setError(null);
      setBusy(false);
      setResendIn(0);
      setTestCode(null);
    }
  }

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const fail = (message: string) => {
    setError(message);
    setTick((t) => t + 1);
  };

  const e164 = phoneE164(phone);

  const send = async (pinValue: string) => {
    setBusy(true);
    setError(null);
    try {
      const data = await api.post<{ _testOtp?: string }>("/users/me/phone/send-otp", {
        phone: e164,
        ...(needsPin ? { pin: pinValue } : {}),
      });
      // Code de test renvoyé par l'API locale : affiché en développement seulement.
      setTestCode(process.env.NODE_ENV !== "production" ? (data?._testOtp ?? null) : null);
      setResendIn(60);
      setStep("code");
      // Le profil porte maintenant `pendingPhone` : la page Compte peut proposer de reprendre.
      void refresh();
    } catch (e) {
      const code = e instanceof ApiError ? e.code : undefined;
      const status = e instanceof ApiError ? e.status : undefined;
      if (code === "WRONG_CURRENT_PIN" || code === "CURRENT_PIN_REQUIRED" || status === 403) {
        setPin("");
        setStep("pin");
      } else if (status !== 429 && step === "pin") {
        // Numéro refusé (déjà utilisé, identique au vôtre…) : on revient le corriger.
        setStep("phone");
      }
      fail(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submitPhone = (e?: FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    if (!isValidPhone(phone)) {
      fail("Numéro invalide. Exemple : 77 123 45 67.");
      return;
    }
    if (phoneDigits(phone) === phoneDigits(user.phone ?? "")) {
      fail("C’est déjà votre numéro actuel.");
      return;
    }
    setError(null);
    if (needsPin) setStep("pin");
    else send("");
  };

  const submitPin = (value: string) => {
    setPin(value);
    send(value);
  };

  const resend = () => {
    if (needsPin && !pin) {
      setError(null);
      setStep("pin");
    } else {
      send(pin);
    }
  };

  const verify = async (code: string) => {
    setBusy(true);
    setError(null);
    try {
      await api.post("/users/me/phone/verify", { code });
      await refresh();
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Numéro mis à jour.");
      onOpenChange(false);
    } catch (e) {
      fail(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const [title, description] = TITLES[step];
  const pretty = prettyPhone(phone, true);

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={step === "code" && pretty ? `Saisissez le code à 6 chiffres envoyé par SMS au ${pretty}.` : description}
      size="sm"
    >
      <div className="flex flex-col gap-4 pt-2">
        {step === "phone" && (
          <form onSubmit={submitPhone} className="flex flex-col gap-4">
            <label className="text-[13.5px] font-bold text-ink" htmlFor="change-phone">
              Nouveau numéro de téléphone
            </label>
            <div className="flex gap-2">
              <span className="flex h-12 items-center gap-2 rounded-[14px] border border-line bg-surface-alt px-3.5 text-[15px] font-bold text-ink">
                <span className="text-lg leading-none" aria-hidden>
                  🇸🇳
                </span>
                +221
              </span>
              <div className="flex-1">
                <Input
                  id="change-phone"
                  autoFocus
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="77 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                  invalid={!!error}
                  className="text-[17px] tracking-wide"
                />
              </div>
            </div>
            {error && (
              <p className="text-[13.5px] font-semibold text-danger" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" block loading={busy} iconRight={<ArrowRight className="h-4.5 w-4.5" />}>
              {needsPin ? "Continuer" : "Recevoir le code par SMS"}
            </Button>
          </form>
        )}

        {step === "pin" && (
          <div className="flex flex-col gap-4 py-2">
            <CodeInput length={4} obscure onComplete={submitPin} error={error ? tick : 0} disabled={busy} />
            {error && (
              <p className="text-center text-[13.5px] font-semibold text-danger" role="alert">
                {error}
              </p>
            )}
            {busy && <p className="text-center text-[13px] font-semibold text-muted">Envoi du code…</p>}
            <button type="button" onClick={() => setStep("phone")} className="mx-auto text-[13.5px] font-semibold text-muted hover:text-ink">
              Modifier le numéro
            </button>
          </div>
        )}

        {step === "code" && (
          <div className="flex flex-col gap-4 py-2">
            <CodeInput length={6} oneTimeCode onComplete={verify} error={error ? tick : 0} disabled={busy} />
            {error && (
              <p className="text-center text-[13.5px] font-semibold text-danger" role="alert">
                {error}
              </p>
            )}
            {busy && <p className="text-center text-[13px] font-semibold text-muted">Vérification…</p>}
            {testCode && <p className="mx-auto rounded-full bg-warning/12 px-3 py-1 text-[12.5px] font-bold text-[#b46b05]">Mode test : code {testCode}</p>}
            <div className="flex flex-col items-center gap-2 text-[14px]">
              {resendIn > 0 ? (
                <span className="text-muted">Renvoyer le code dans {resendIn} s</span>
              ) : (
                <button type="button" onClick={resend} disabled={busy} className="inline-flex items-center gap-1.5 font-bold text-brand hover:underline">
                  <MessageSquareText className="h-4 w-4" /> Renvoyer le code
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("phone");
                }}
                className="font-semibold text-muted hover:text-ink"
              >
                Modifier le numéro
              </button>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-[14px] bg-surface-alt px-4 py-3 text-[13px] text-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          Votre numéro actuel reste actif jusqu’à la validation du code.
        </div>
      </div>
    </Modal>
  );
}
