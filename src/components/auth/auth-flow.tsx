"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Mail, MessageSquareText, Phone, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { WheelMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Input, TextField } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPhoneInput, isValidPhone, isWeakPin, phoneE164, prettyPhone } from "@/lib/phone";
import { isProfileComplete, type User } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "phone" | "pin" | "otp" | "name" | "newPin" | "confirmPin" | "email";

const STEP_INDEX: Record<Step, number> = { phone: 0, email: 0, pin: 1, otp: 1, name: 2, newPin: 3, confirmPin: 3 };

/**
 * Connexion et inscription par numéro de téléphone, comme dans les applications :
 * numéro → code PIN (compte existant) ou code SMS (nouveau compte / PIN oublié)
 * → nom → création du code PIN. La connexion par e-mail reste possible pour les
 * anciens comptes et l'administration.
 */
export function AuthFlow({
  onDone,
  reason,
  welcome = "Bienvenue sur Taagno",
}: {
  onDone: () => void;
  reason?: string;
  welcome?: string;
}) {
  const { user, signIn, signOut, refresh } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTick, setErrorTick] = useState(0);
  const [forgot, setForgot] = useState(false);
  const [newAccount, setNewAccount] = useState(false);
  const [testCode, setTestCode] = useState<string | null>(null);
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const resumed = useRef(false);

  // Compte déjà connecté mais profil incomplet : on reprend à l'étape manquante.
  useEffect(() => {
    if (resumed.current || !user || isProfileComplete(user)) return;
    resumed.current = true;
    setPhone(formatPhoneInput(user.phone ?? ""));
    setNewAccount(true);
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setStep(user.firstName?.trim() && user.lastName?.trim() ? "newPin" : "name");
  }, [user]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const e164 = phoneE164(phone);

  const go = (s: Step) => {
    setError(null);
    setStep(s);
  };

  const fail = (e: unknown) => {
    setBusy(false);
    setError(e instanceof ApiError || e instanceof Error ? e.message : "Une erreur est survenue. Réessayez.");
    setErrorTick((t) => t + 1);
  };

  const run = async (task: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await task();
      setBusy(false);
    } catch (e) {
      fail(e);
    }
  };

  const finish = (welcomeNew: boolean, pinReset: boolean) => {
    if (welcomeNew || pinReset) {
      toast.success(pinReset ? "Nouveau code PIN enregistré." : "Bienvenue sur Taagno !", {
        icon: <Sparkles className="h-4 w-4" />,
      });
    }
    onDone();
  };

  const afterLogin = (u: User, isNew: boolean) => {
    if (!u.firstName?.trim() || !u.lastName?.trim()) {
      setFirstName(u.firstName ?? "");
      setLastName(u.lastName ?? "");
      go("name");
    } else if (!u.hasPin) {
      go("newPin");
    } else {
      finish(isNew, false);
    }
  };

  const sendOtp = async () => {
    const data = await api.post<{ _testOtp?: string }>("/auth/send-phone-otp", { phone: e164 });
    setTestCode(data?._testOtp ?? null);
    setResendIn(60);
    go("otp");
  };

  const submitPhone = (e?: FormEvent) => {
    e?.preventDefault();
    if (!isValidPhone(phone)) {
      fail(new Error("Numéro invalide. Exemple : 77 123 45 67."));
      return;
    }
    run(async () => {
      const data = await api.post<{ nextStep?: string }>("/auth/phone/check", { phone: e164 });
      if (data?.nextStep === "pin") {
        setForgot(false);
        go("pin");
      } else {
        await sendOtp();
      }
    });
  };

  const submitPin = (pin: string) =>
    run(async () => {
      const data = await api.post<{ access_token: string }>("/auth/pin/login", { phone: e164, pin });
      const u = await signIn(data.access_token);
      afterLogin(u, false);
    });

  const forgotPin = () =>
    run(async () => {
      setForgot(true);
      await sendOtp();
    });

  const submitOtp = (code: string) =>
    run(async () => {
      const data = await api.post<{ access_token: string }>("/auth/verify-phone-otp", { phone: e164, code });
      const u = await signIn(data.access_token);
      const isNew = !isProfileComplete(u);
      setNewAccount(isNew);
      if (forgot) go("newPin");
      else afterLogin(u, isNew);
    });

  const submitName = (e: FormEvent) => {
    e.preventDefault();
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      fail(new Error("Indiquez votre prénom et votre nom."));
      return;
    }
    run(async () => {
      await api.patch("/users/me/profile", { firstName: firstName.trim(), lastName: lastName.trim() });
      const u = await refresh();
      if (u?.hasPin && !forgot) finish(true, false);
      else go("newPin");
    });
  };

  const submitNewPin = (pin: string) => {
    if (isWeakPin(pin)) {
      fail(new Error("Code trop courant (1234, 2580, une année…). Choisissez-en un autre."));
      return;
    }
    setFirstPin(pin);
    go("confirmPin");
  };

  const submitConfirmPin = (pin: string) => {
    if (pin !== firstPin) {
      setStep("newPin");
      fail(new Error("Les deux codes ne correspondent pas. Recommencez."));
      return;
    }
    run(async () => {
      try {
        await api.post("/users/me/pin", { pin });
      } catch (e) {
        setFirstPin(null);
        setStep("newPin");
        throw e;
      }
      await refresh();
      finish(newAccount, forgot);
    });
  };

  const submitEmail = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      fail(new Error("Saisissez votre e-mail et votre mot de passe."));
      return;
    }
    run(async () => {
      const data = await api.post<{ access_token: string }>("/auth/login", { email: email.trim(), password });
      const u = await signIn(data.access_token);
      if (isProfileComplete(u)) finish(false, false);
      else afterLogin(u, false);
    });
  };

  const useAnotherNumber = () => {
    signOut();
    setPhone("");
    setForgot(false);
    setNewAccount(false);
    setFirstPin(null);
    go("phone");
  };

  const back: (() => void) | null =
    step === "pin" || step === "otp" || step === "email" ? () => go("phone") : step === "confirmPin" ? () => go("newPin") : null;

  const pretty = prettyPhone(phone, true);
  const texts: Record<Step, [string, string]> = {
    phone: [welcome, reason ?? "Entrez votre numéro de téléphone pour continuer. Pas de mot de passe à retenir."],
    pin: ["Bon retour !", `Entrez le code PIN de votre compte ${pretty}.`],
    otp: ["Vérification", `Saisissez le code à 6 chiffres envoyé par SMS au ${pretty}.`],
    name: ["Faisons connaissance", "Votre nom rassure les conducteurs et les propriétaires."],
    newPin: [forgot ? "Nouveau code PIN" : "Créez votre code PIN", "4 chiffres pour vous connecter en un instant, sans SMS."],
    confirmPin: ["Confirmez votre code", "Saisissez à nouveau vos 4 chiffres."],
    email: ["Connexion par e-mail", "Pour les comptes créés avec une adresse e-mail."],
  };
  const [title, subtitle] = texts[step];
  const progress = STEP_INDEX[step];

  return (
    <div className="flex flex-col">
      {/* En-tête en dégradé de la marque */}
      <div className="relative overflow-hidden bg-aurora px-6 pb-7 pt-6 text-white">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center justify-between">
            {back ? (
              <button
                type="button"
                onClick={back}
                className="-ml-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                aria-label="Retour"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <WheelMark size={40} light animated />
            )}
            <div className="flex gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn("h-1.5 rounded-full transition-all duration-300", i <= progress ? "w-6 bg-white" : "w-1.5 bg-white/35")}
                />
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
              <h2 className="mt-5 text-[24px] font-extrabold leading-tight tracking-tight">{title}</h2>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-white/85">{subtitle}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="px-6 pb-6 pt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {step === "phone" && (
              <form onSubmit={submitPhone} className="flex flex-col gap-4">
                <label className="text-[13.5px] font-bold text-ink" htmlFor="auth-phone">
                  Numéro de téléphone
                </label>
                <div className="flex gap-2">
                  <span className="flex h-12 items-center gap-2 rounded-[14px] border border-line bg-surface-alt px-3.5 text-[15px] font-bold text-ink">
                    <span className="text-lg leading-none" aria-hidden>🇸🇳</span>+221
                  </span>
                  <div className="flex-1">
                    <Input
                      id="auth-phone"
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
                <ErrorText error={error} />
                <Button type="submit" size="lg" block loading={busy} iconRight={<ArrowRight className="h-4.5 w-4.5" />}>
                  Continuer
                </Button>
                <div className="flex items-center gap-2 rounded-[14px] bg-surface-alt px-4 py-3 text-[13px] text-muted">
                  <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-brand" />
                  Votre numéro n’est jamais affiché publiquement. Il est partagé uniquement après une réservation confirmée.
                </div>
                <button type="button" onClick={() => go("email")} className="mx-auto text-[13px] font-semibold text-muted underline-offset-4 hover:text-ink hover:underline">
                  Compte créé avec un e-mail ?
                </button>
              </form>
            )}

            {step === "pin" && (
              <CodeStep>
                <CodeInput length={4} obscure onComplete={submitPin} error={errorTick} disabled={busy} />
                <ErrorText error={error} center />
                <BusyLine busy={busy} />
                <button type="button" onClick={forgotPin} disabled={busy} className="mx-auto mt-2 text-[14px] font-bold text-brand hover:underline">
                  Code PIN oublié ?
                </button>
              </CodeStep>
            )}

            {step === "otp" && (
              <CodeStep>
                <CodeInput length={6} oneTimeCode onComplete={submitOtp} error={errorTick} disabled={busy} />
                <ErrorText error={error} center />
                <BusyLine busy={busy} />
                {testCode && (
                  <p className="mx-auto rounded-full bg-warning/12 px-3 py-1 text-[12.5px] font-bold text-[#b46b05]">
                    Mode test : code {testCode}
                  </p>
                )}
                <div className="mt-1 flex flex-col items-center gap-2 text-[14px]">
                  {resendIn > 0 ? (
                    <span className="text-muted">Renvoyer le code dans {resendIn} s</span>
                  ) : (
                    <button type="button" onClick={() => run(sendOtp)} className="inline-flex items-center gap-1.5 font-bold text-brand hover:underline">
                      <MessageSquareText className="h-4 w-4" /> Renvoyer le code
                    </button>
                  )}
                  <button type="button" onClick={() => go("phone")} className="font-semibold text-muted hover:text-ink">
                    Modifier le numéro
                  </button>
                </div>
              </CodeStep>
            )}

            {step === "name" && (
              <form onSubmit={submitName} className="flex flex-col gap-4">
                <TextField label="Prénom" autoFocus autoComplete="given-name" placeholder="Awa" icon={<UserRound />} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <TextField label="Nom" autoComplete="family-name" placeholder="Diop" icon={<UserRound />} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <ErrorText error={error} />
                <Button type="submit" size="lg" block loading={busy} iconRight={<ArrowRight className="h-4.5 w-4.5" />}>
                  Continuer
                </Button>
                <UseAnother onClick={useAnotherNumber} />
              </form>
            )}

            {(step === "newPin" || step === "confirmPin") && (
              <CodeStep>
                <CodeInput
                  key={step}
                  length={4}
                  obscure
                  onComplete={step === "newPin" ? submitNewPin : submitConfirmPin}
                  error={errorTick}
                  disabled={busy}
                />
                <ErrorText error={error} center />
                <BusyLine busy={busy} />
                {step === "newPin" && (
                  <ul className="mt-1 space-y-1.5 rounded-[14px] bg-surface-alt px-4 py-3 text-[13px] text-muted">
                    <li className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-brand" /> Évitez 1234, 0000 ou votre année de naissance.</li>
                    <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-brand" /> Le même code sert sur le site et dans les apps.</li>
                  </ul>
                )}
                <UseAnother onClick={useAnotherNumber} />
              </CodeStep>
            )}

            {step === "email" && (
              <form onSubmit={submitEmail} className="flex flex-col gap-4">
                <TextField label="E-mail" type="email" autoFocus autoComplete="email" icon={<Mail />} value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextField label="Mot de passe" type="password" autoComplete="current-password" icon={<Lock />} value={password} onChange={(e) => setPassword(e.target.value)} />
                <ErrorText error={error} />
                <Button type="submit" size="lg" block loading={busy}>
                  Se connecter
                </Button>
                <p className="text-center text-[13px] text-muted">
                  Vous avez un numéro sénégalais ?{" "}
                  <button type="button" onClick={() => go("phone")} className="font-bold text-brand hover:underline">
                    Connexion par téléphone
                  </button>
                </p>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function CodeStep({ children }: { children: ReactNode }) {
  return <div className="flex flex-col items-stretch gap-4 py-2">{children}</div>;
}

function ErrorText({ error, center }: { error: string | null; center?: boolean }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={cn("text-[13.5px] font-semibold text-danger", center && "text-center")}
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function BusyLine({ busy }: { busy: boolean }) {
  return busy ? <p className="text-center text-[13px] font-semibold text-muted">Vérification…</p> : null;
}

function UseAnother({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mx-auto mt-1 text-[13px] font-semibold text-muted hover:text-ink">
      Utiliser un autre numéro
    </button>
  );
}
