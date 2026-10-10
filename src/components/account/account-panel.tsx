"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Camera, ChevronRight, KeyRound, LogOut, MessageSquareHeart, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Field, Textarea, TextField } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { RatingPill, Stars } from "@/components/ui/rating";
import { Spinner } from "@/components/ui/spinner";
import { api, ApiError, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { clearLocalData } from "@/lib/favorites";
import { memberSince, relative } from "@/lib/format";
import { isWeakPin, prettyPhone } from "@/lib/phone";
import { uploadImage, useUserReviews } from "@/lib/queries";
import { fullName, shortName, userRating, type User } from "@/lib/types";

import { ChangePhoneModal } from "./change-phone-modal";

export interface AccountLink {
  href: string;
  label: string;
  icon: ReactNode;
  hint?: string;
}

/** Compte : photo, nom, présentation, code PIN, avis reçus, déconnexion, suppression. */
export function AccountPanel({ links, space }: { links: AccountLink[]; space: "site" | "pro" }) {
  const { user, signOut, refresh } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneResume, setPhoneResume] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const reviews = useUserReviews(user?.id);

  if (!user) return null;

  const onPhoto = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Choisissez une photo JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image trop lourde (8 Mo maximum).");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      await api.patch("/users/me/profile", { photoUrl: url });
      await refresh();
      toast.success("Photo mise à jour.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removePhoto = async () => {
    try {
      await api.patch("/users/me/profile", { photoUrl: null });
      await refresh();
      toast.success("Photo retirée.");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/users/me");
      signOut();
      queryClient.clear();
      clearLocalData();
      toast.success("Votre compte a été supprimé. À bientôt !");
      router.push("/");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Identité */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-aurora" />
        <div className="-mt-12 px-5 pb-5 sm:px-6">
          <div className="flex items-end justify-between gap-3">
            <div className="relative">
              <Avatar user={user} size={96} ring />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-glow ring-4 ring-white transition hover:scale-105"
                aria-label="Changer la photo"
              >
                {uploading ? <Spinner className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Modifier le profil
            </Button>
          </div>
          <h1 className="mt-3 text-[24px] font-extrabold tracking-tight text-ink">{fullName(user)}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-muted">
            <span className="font-semibold text-ink-soft">{prettyPhone(user.phone, true)}</span>
            <button
              type="button"
              onClick={() => {
                setPhoneResume(false);
                setPhoneOpen(true);
              }}
              className="font-bold text-brand hover:underline"
            >
              {user.phone ? "Changer de numéro" : "Ajouter un numéro"}
            </button>
            <RatingPill value={userRating(user)} count={user.ratingCount} />
            {user.createdAt && <span>{memberSince(user.createdAt)}</span>}
          </div>
          {user.pendingPhone && (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[14px] bg-warning/10 px-4 py-2.5 text-[13.5px] text-ink-soft">
              <span>
                Nouveau numéro en attente de validation : <span className="font-bold text-ink">{prettyPhone(user.pendingPhone, true)}</span>. Votre numéro actuel reste actif.
              </span>
              <button
                type="button"
                onClick={() => {
                  setPhoneResume(true);
                  setPhoneOpen(true);
                }}
                className="font-bold text-brand hover:underline"
              >
                Saisir le code
              </button>
            </p>
          )}
          {user.bio ? (
            <p className="mt-3 rounded-[14px] bg-surface-alt px-4 py-3 text-[14px] leading-relaxed text-ink-soft">« {user.bio} »</p>
          ) : (
            <button type="button" onClick={() => setEditOpen(true)} className="mt-3 text-[13.5px] font-bold text-brand hover:underline">
              + Ajouter une présentation (rassure vos interlocuteurs)
            </button>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/membres/${user.id}`} className="text-[13px] font-bold text-muted hover:text-brand">
              Voir mon profil public →
            </Link>
            {user.photoUrl && (
              <button type="button" onClick={removePhoto} className="ml-auto text-[13px] font-semibold text-muted hover:text-danger">
                Retirer la photo
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Raccourcis */}
      {links.length > 0 && (
        <Card className="divide-y divide-line overflow-hidden">
          {links.map((l, i) => (
            <motion.div key={l.href} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={l.href} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-surface-alt">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-brand-soft text-brand [&_svg]:h-5 [&_svg]:w-5">{l.icon}</span>
                <span className="flex-1">
                  <span className="block text-[15px] font-bold text-ink">{l.label}</span>
                  {l.hint && <span className="block text-[12.5px] text-muted">{l.hint}</span>}
                </span>
                <ChevronRight className="h-5 w-5 text-faint transition group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ))}
        </Card>
      )}

      {/* Avis reçus */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[17px] font-extrabold text-ink">
            <MessageSquareHeart className="h-5 w-5 text-brand" /> Avis reçus
          </h2>
          {reviews.data?.averageRating ? (
            <span className="flex items-center gap-2 text-[14px] font-bold text-ink">
              <Stars value={reviews.data.averageRating} size={14} /> {reviews.data.averageRating.toFixed(1).replace(".", ",")}
            </span>
          ) : null}
        </div>
        {!reviews.data?.reviews.length ? (
          <p className="mt-3 text-[14px] text-muted">
            {space === "pro" ? "Les avis de vos passagers et locataires apparaîtront ici." : "Les avis de vos conducteurs apparaîtront ici après vos trajets."}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.data.reviews.slice(0, 6).map((r) => (
              <li key={r.id} className="rounded-[16px] bg-surface-alt p-4">
                <div className="flex items-center gap-3">
                  <Avatar user={r.author} size={32} />
                  <span className="flex-1 text-[14px] font-bold text-ink">{shortName(r.author)}</span>
                  <Stars value={r.rating} size={13} />
                </div>
                {r.comment && <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{r.comment}</p>}
                {r.createdAt && <p className="mt-1 text-[12px] text-faint">{relative(r.createdAt)}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Sécurité */}
      <Card className="divide-y divide-line overflow-hidden">
        <button type="button" onClick={() => setPinOpen(true)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface-alt">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-surface-alt text-ink-soft">
            <KeyRound className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-bold text-ink">{user.hasPin ? "Changer mon code PIN" : "Créer mon code PIN"}</span>
            <span className="block text-[12.5px] text-muted">Le même code sert sur le site et dans les applications</span>
          </span>
          <ChevronRight className="h-5 w-5 text-faint" />
        </button>
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push(space === "pro" ? "/pro" : "/");
          }}
          className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface-alt"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-surface-alt text-ink-soft">
            <LogOut className="h-5 w-5" />
          </span>
          <span className="flex-1 text-[15px] font-bold text-ink">Se déconnecter</span>
        </button>
        <button type="button" onClick={() => setDeleteOpen(true)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-danger/5">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-danger/10 text-danger">
            <Trash2 className="h-5 w-5" />
          </span>
          <span className="flex-1 text-[15px] font-bold text-danger">Supprimer mon compte</span>
        </button>
      </Card>

      <EditProfileModal open={editOpen} onOpenChange={setEditOpen} user={user} onSaved={refresh} />
      <ChangePinModal open={pinOpen} onOpenChange={setPinOpen} hasPin={!!user.hasPin} />
      <ChangePhoneModal open={phoneOpen} onOpenChange={setPhoneOpen} user={user} resume={phoneResume} />
      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer votre compte ?"
        message="Vos informations, véhicules, trajets et annonces seront définitivement effacés. Impossible tant qu’une réservation ou une location est en cours."
        confirmLabel="Supprimer définitivement"
        danger
        loading={deleting}
        onConfirm={deleteAccount}
      >
        <p className="mt-3 text-[13px] text-muted">
          <Link href="/suppression-compte" className="font-bold text-brand hover:underline">
            Voir ce qui est supprimé
          </Link>
        </p>
      </ConfirmModal>
    </div>
  );
}

function EditProfileModal({ open, onOpenChange, user, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; user: User; onSaved: () => Promise<unknown> }) {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [busy, setBusy] = useState(false);
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setBio(user.bio ?? "");
    }
  }

  const save = async () => {
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      toast.error("Indiquez votre prénom et votre nom.");
      return;
    }
    setBusy(true);
    try {
      await api.patch("/users/me/profile", { firstName: firstName.trim(), lastName: lastName.trim(), bio: bio.trim() });
      await onSaved();
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      toast.success("Profil enregistré.");
      onOpenChange(false);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier le profil"
      footer={
        <Button block size="lg" loading={busy} onClick={save}>
          Enregistrer
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Prénom" icon={<UserRound />} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Nom" icon={<UserRound />} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Field label="Présentation" optional hint={`${bio.length}/300 · Ex. « Je fais Dakar–Thiès chaque semaine, ponctuel et non-fumeur. »`}>
          <Textarea value={bio} maxLength={300} onChange={(e) => setBio(e.target.value)} placeholder="Quelques mots sur vous" />
        </Field>
      </div>
    </Modal>
  );
}

type PinStep = "current" | "new" | "confirm";

/**
 * Code PIN : « Code PIN actuel » d'abord (si le compte en a un), puis le nouveau code deux fois.
 * Le serveur ferme les autres sessions et renvoie un nouveau jeton, que l'on enregistre.
 */
function ChangePinModal({ open, onOpenChange, hasPin }: { open: boolean; onOpenChange: (v: boolean) => void; hasPin: boolean }) {
  const { adoptToken, refresh } = useAuth();
  const [step, setStep] = useState<PinStep>(hasPin ? "current" : "new");
  const [currentPin, setCurrentPin] = useState("");
  const [first, setFirst] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState(false);

  // À chaque ouverture, on repart de la première étape.
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) {
      setStep(hasPin ? "current" : "new");
      setCurrentPin("");
      setFirst("");
      setError(null);
    }
  }

  const fail = (msg: string) => {
    setError(msg);
    setTick((t) => t + 1);
  };

  const onCurrent = (pin: string) => {
    setCurrentPin(pin);
    setError(null);
    setStep("new");
  };

  const onNew = (pin: string) => {
    if (isWeakPin(pin)) {
      fail("Code trop courant (1234, 2580, une année…). Choisissez-en un autre.");
      return;
    }
    setFirst(pin);
    setError(null);
    setStep("confirm");
  };

  const onConfirm = async (pin: string) => {
    if (pin !== first) {
      setStep("new");
      fail("Les deux codes ne correspondent pas. Recommencez.");
      return;
    }
    setBusy(true);
    try {
      const data = await api.post<{ access_token?: string; sessionsRevoked?: boolean }>("/users/me/pin", {
        pin,
        ...(hasPin ? { currentPin } : {}),
      });
      // Les autres sessions sont fermées, y compris l'ancien jeton de cet appareil.
      if (data?.access_token) adoptToken(data.access_token);
      await refresh();
      const othersSignedOut = data?.sessionsRevoked ?? hasPin;
      toast.success(othersSignedOut ? "Nouveau code PIN enregistré. Vos autres appareils devront se reconnecter." : "Code PIN enregistré.");
      onOpenChange(false);
    } catch (e) {
      const code = e instanceof ApiError ? e.code : undefined;
      const status = e instanceof ApiError ? e.status : undefined;
      if (code === "WRONG_CURRENT_PIN" || code === "CURRENT_PIN_REQUIRED" || status === 403) {
        // Code actuel faux (ou trop d'essais) : retour à la première étape avec le message du serveur.
        setCurrentPin("");
        setStep("current");
      } else {
        setStep("new");
      }
      fail(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<PinStep, [string, string]> = {
    current: ["Code PIN actuel", "Saisissez votre code actuel pour confirmer que c’est bien vous."],
    new: ["Nouveau code PIN", "Choisissez 4 chiffres faciles à retenir pour vous, difficiles à deviner."],
    confirm: ["Confirmez votre code", "Saisissez à nouveau les 4 chiffres."],
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={titles[step][0]} description={titles[step][1]} size="sm">
      <div className="flex flex-col gap-4 py-4">
        <CodeInput key={step} length={4} obscure onComplete={step === "current" ? onCurrent : step === "new" ? onNew : onConfirm} error={error ? tick : 0} disabled={busy} />
        {error && (
          <p className="text-center text-[13.5px] font-semibold text-danger" role="alert">
            {error}
          </p>
        )}
        {busy && <p className="text-center text-[13px] text-muted">Enregistrement…</p>}
        {step === "current" && (
          <p className="text-center text-[13px] text-muted">Code oublié ? Déconnectez-vous, puis touchez « Code PIN oublié ? » sur l’écran de connexion.</p>
        )}
      </div>
    </Modal>
  );
}
