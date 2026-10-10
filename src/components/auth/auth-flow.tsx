"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, Mail, MessageSquareText, Phone, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { WheelMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Input, TextField } from "@/components/ui/field";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPhoneInput, isValidPhone, isWeakPin, phoneE164, prettyPhone } from "@/lib/phone";
import { hasName, isProfileComplete, realEmail, type User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GoogleButton } from "./google-button";

type Step = "phone" | "pin" | "otp" | "name" | "addPhone" | "verifyPhone" | "newPin" | "confirmPin" | "email";

const STEP_INDEX: Record<Step, number> = {
  phone: 0,
  email: 0,
  pin: 1,
  otp: 1,
  name: 2,
  addPhone: 2,
  verifyPhone: 2,
  newPin: 3,
  confirmPin: 3,
};

/** Numéro déjà connu du compte : celui en attente de vérification (SMS envoyé) ou le numéro enregistré. */
const knownPhone = (u: User) => u.pendingPhone || u.phone || "";

/** Première étape manquante d'un compte connecté (nom, numéro vérifié, code PIN). */
function missingStep(u: User): Step | null {
  if (!hasName(u)) return "name";
  if (!u.phoneVerified) return "addPhone";
  if (!u.hasPin && !realEmail(u)) return "newPin";
  return null;
}

/**
 * Connexion et inscription, comme dans les applications : numéro → code PIN (compte
 * existant) ou code SMS (nouveau compte / PIN oublié) → nom → code PIN.
 * Google et l'e-mail restent possibles ; ces comptes ajoutent ensuite leur numéro
 * (vérifié par SMS) pour être joints après une réservation, le code PIN y est facultatif.
 */
export function AuthFlow({
  onDone,
  reason,
  welcome = "Bienvenue sur Taagno",
  next,
  onClose,
}: {
  onDone: () => void;
  /** Fenêtre de connexion : bouton « Fermer » dans l'en-tête. */
  onClose?: () => void;
  reason?: string;
  welcome?: string;
  /** Page où revenir après une connexion Google (par défaut : la page courante). */
  next?: string;
}) {
  const { user, signIn, signOut, adoptToken, refresh } = useAuth();
  // Compte déjà connecté mais incomplet (retour de Google…) : on démarre à l'étape manquante.
  const incomplete = user && !isProfileComplete(user) ? user : null;
  const [step, setStep] = useState<Step>(() => (incomplete ? (missingStep(incomplete) ?? "name") : "phone"));
  const [phone, setPhone] = useState(() => formatPhoneInput(incomplete ? knownPhone(incomplete) : ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [errorTick, setErrorTick] = useState(0);
  const [forgot, setForgot] = useState(false);
  const [newAccount, setNewAccount] = useState(!!incomplete);
  const [testCode, setTestCode] = useState<string | null>(null);
  const [firstPin, setFirstPin] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [firstName, setFirstName] = useState(incomplete?.firstName ?? "");
  const [lastName, setLastName] = useState(incomplete?.lastName ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const resumed = useRef(!!incomplete);

  // Profil chargé après l'ouverture (fenêtre de connexion) : on reprend à l'étape manquante.
  useEffect(() => {
    if (resumed.current || !user || isProfileComplete(user)) return;
    resumed.current = true;
    setPhone(formatPhoneInput(knownPhone(user)));
    setNewAccount(true);
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setStep(missingStep(user) ?? "name");
  }, [user]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const e164 = phoneE164(phone);
  const pinOptional = !!user && !!realEmail(user) && !forgot;

  const go = (s: Step) => {
    setError(null);
    setConflict(false);
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

  /** Après une connexion : compléter ce qui manque, sinon terminer. */
  const continueWith = (u: User, isNew: boolean) => {
    const missing = missingStep(u);
    if (missing === "name") {
      setFirstName(u.firstName ?? "");
      setLastName(u.lastName ?? "");
    }
    if (missing === "addPhone") setPhone(formatPhoneInput(knownPhone(u)));
    if (missing) go(missing);
    else finish(isNew, false);
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
      continueWith(u, false);
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
      else continueWith(u, isNew);
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
      if (u) continueWith(u, true);
    });
  };

  // Numéro d'un compte Google ou e-mail : rattaché puis vérifié par SMS.
  const sendLinkOtp = async () => {
    await api.post("/users/me/phone/send-otp", { phone: e164 });
    setResendIn(60);
    go("verifyPhone");
  };

  const submitAddPhone = (e?: FormEvent) => {
    e?.preventDefault();
    if (!isValidPhone(phone)) {
      fail(new Error("Numéro invalide. Exemple : 77 123 45 67."));
      return;
    }
    run(async () => {
      try {
        await sendLinkOtp();
      } catch (err) {
        if (err instanceof ApiError && err.status === 409) setConflict(true);
        throw err;
      }
    });
  };

  const submitVerifyPhone = (code: string) =>
    run(async () => {
      await api.post("/users/me/phone/verify", { code });
      const u = await refresh();
      if (!u) return;
      if (!u.hasPin) go("newPin");
      else finish(true, false);
    });

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
        // Le serveur ferme les autres sessions et renvoie un nouveau jeton : à enregistrer,
        // sinon la session tomberait juste après.
        const data = await api.post<{ access_token?: string }>("/users/me/pin", { pin });
        if (data?.access_token) adoptToken(data.access_token);
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
      continueWith(u, false);
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

  /** Le numéro saisi appartient déjà à un compte : on s'y connecte plutôt. */
  const loginWithThisNumber = () => {
    const keep = phone;
    signOut();
    setForgot(false);
    setNewAccount(false);
    go("phone");
    setPhone(keep);
  };

  const back: (() => void) | null =
    step === "pin" || step === "otp" || step === "email"
      ? () => go("phone")
      : step === "confirmPin"
        ? () => go("newPin")
        : step === "verifyPhone"
          ? () => go("addPhone")
          : null;

  const pretty = prettyPhone(phone, true);
  const texts: Record<Step, [string, string]> = {
    phone: [welcome, reason ?? "Entrez votre numéro de téléphone pour continuer. Pas de mot de passe à retenir."],
    pin: ["Bon retour !", `Entrez le code PIN de votre compte ${pretty}.`],
    otp: ["Vérification", `Saisissez le code à 6 chiffres envoyé par SMS au ${pretty}.`],
    name: ["Faisons connaissance", "Votre nom rassure les conducteurs et les propriétaires."],
    addPhone: [
      user?.firstName ? `Bienvenue ${user.firstName} !` : "Votre numéro",
      "Dernière étape : votre numéro permet à votre conducteur ou à votre locataire de vous joindre. Il n’est jamais affiché publiquement.",
    ],
    verifyPhone: ["Vérification", `Saisissez le code à 6 chiffres envoyé par SMS au ${pretty}.`],
    newPin: [
      forgot ? "Nouveau code PIN" : "Créez votre code PIN",
      pinOptional ? "Facultatif : 4 chiffres pour vous connecter aussi avec votre numéro, sur le site et dans les apps." : "4 chiffres pour vous connecter en un instant, sans SMS.",
    ],
    confirmPin: ["Confirmez votre code", "Saisissez à nouveau vos 4 chiffres."],
    email: ["Connexion par e-mail", "Pour les comptes créés avec une adresse e-mail."],
  };
  const [title, subtitle] = texts[step];
  const progress = STEP_INDEX[step];

  const phoneInput = (id: string) => (
    <div className="flex gap-2">
      <span className="flex h-12 items-center gap-2 rounded-[14px] border border-line bg-surface-alt px-3.5 text-[15px] font-bold text-ink">
        <span className="text-lg leading-none" aria-hidden>
          🇸🇳
        </span>
        +221
      </span>
      <div className="flex-1">
        <Input
          id={id}
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
  );

  return (
    <div className="flex flex-col">
      {/* En-tête en dégradé de la marque */}
      <div className="relative overflow-hidden bg-aurora px-6 pb-7 pt-6 text-white">
        <div className="dot-grid absolute inset-0 opacity-60" />
        <motion.div
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10"
          animate={{ scale: [1, 1.12, 1], rotate: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-10 left-1/3 h-24 w-24 rounded-full bg-white/8"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
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
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ width: i <= progress ? 24 : 6, opacity: i <= progress ? 1 : 0.4 }}
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    className="h-1.5 rounded-full bg-white"
                  />
                ))}
              </div>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer"
                  className="-mr-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>
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
            initial={{ opacity: 0, x: 28, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -28, filter: "blur(4px)" }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            {step === "phone" && (
              <form onSubmit={submitPhone} className="flex flex-col gap-4">
                <label className="text-[13.5px] font-bold text-ink" htmlFor="auth-phone">
                  Numéro de téléphone
                </label>
                {phoneInput("auth-phone")}
                <ErrorText error={error} />
                <Button type="submit" size="lg" block loading={busy} iconRight={<ArrowRight className="h-4.5 w-4.5" />}>
                  Continuer
                </Button>
                <Divider />
                <GoogleButton next={next} />
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

            {(step === "otp" || step === "verifyPhone") && (
              <CodeStep>
                <CodeInput length={6} oneTimeCode onComplete={step === "otp" ? submitOtp : submitVerifyPhone} error={errorTick} disabled={busy} />
                <ErrorText error={error} center />
                <BusyLine busy={busy} />
                {testCode && step === "otp" && (
                  <p className="mx-auto rounded-full bg-warning/12 px-3 py-1 text-[12.5px] font-bold text-[#b46b05]">Mode test : code {testCode}</p>
                )}
                <div className="mt-1 flex flex-col items-center gap-2 text-[14px]">
                  {resendIn > 0 ? (
                    <span className="text-muted">Renvoyer le code dans {resendIn} s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => run(step === "otp" ? sendOtp : sendLinkOtp)}
                      className="inline-flex items-center gap-1.5 font-bold text-brand hover:underline"
                    >
                      <MessageSquareText className="h-4 w-4" /> Renvoyer le code
                    </button>
                  )}
                  <button type="button" onClick={() => go(step === "otp" ? "phone" : "addPhone")} className="font-semibold text-muted hover:text-ink">
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
                <UseAnother onClick={useAnotherNumber} label={realEmail(user) ? "Utiliser un autre compte" : undefined} />
              </form>
            )}

            {step === "addPhone" && (
              <form onSubmit={submitAddPhone} className="flex flex-col gap-4">
                <label className="text-[13.5px] font-bold text-ink" htmlFor="auth-link-phone">
                  Votre numéro de téléphone
                </label>
                {phoneInput("auth-link-phone")}
                <ErrorText error={error} />
                {conflict && (
                  <Button type="button" variant="soft" block onClick={loginWithThisNumber}>
                    Me connecter avec ce numéro
                  </Button>
                )}
                <Button type="submit" size="lg" block loading={busy} iconRight={<ArrowRight className="h-4.5 w-4.5" />}>
                  Recevoir le code par SMS
                </Button>
                <UseAnother onClick={useAnotherNumber} label="Utiliser un autre compte" />
              </form>
            )}

            {(step === "newPin" || step === "confirmPin") && (
              <CodeStep>
                <CodeInput key={step} length={4} obscure onComplete={step === "newPin" ? submitNewPin : submitConfirmPin} error={errorTick} disabled={busy} />
                <ErrorText error={error} center />
                <BusyLine busy={busy} />
                {step === "newPin" && (
                  <ul className="mt-1 space-y-1.5 rounded-[14px] bg-surface-alt px-4 py-3 text-[13px] text-muted">
                    <li className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-brand" /> Évitez 1234, 0000 ou votre année de naissance.
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-brand" /> Le même code sert sur le site et dans les apps.
                    </li>
                  </ul>
                )}
                {pinOptional ? (
                  <button type="button" onClick={() => finish(true, false)} className="mx-auto mt-1 text-[14px] font-bold text-brand hover:underline">
                    Plus tard
                  </button>
                ) : (
                  <UseAnother onClick={useAnotherNumber} />
                )}
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
                <Divider />
                <GoogleButton next={next} />
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

function Divider() {
  return (
    <div className="flex items-center gap-3 text-[12.5px] font-semibold text-faint" aria-hidden>
      <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
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

function UseAnother({ onClick, label = "Utiliser un autre numéro" }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="mx-auto mt-1 text-[13px] font-semibold text-muted hover:text-ink">
      {label}
    </button>
  );
}
