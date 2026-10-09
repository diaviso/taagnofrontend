"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useMediaQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Fenêtre : feuille qui monte du bas sur téléphone, carte centrée sur ordinateur.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  hideHeader,
  size = "md",
  children,
  footer,
  className,
  dismissible = true,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Titre lu par les lecteurs d'écran mais non affiché (contenu sur mesure). */
  hideHeader?: boolean;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  dismissible?: boolean;
}) {
  const desktop = useMediaQuery("(min-width: 640px)", true);
  const width = size === "sm" ? "sm:max-w-[420px]" : size === "lg" ? "sm:max-w-[680px]" : "sm:max-w-[520px]";

  return (
    <Dialog.Root open={open} onOpenChange={(v) => (dismissible || v) && onOpenChange(v)}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[80] bg-ink/45 backdrop-blur-[3px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <div className="pointer-events-none fixed inset-0 z-[81] flex items-end justify-center sm:items-center sm:p-6">
              <Dialog.Content
                asChild
                forceMount
                onInteractOutside={(e) => !dismissible && e.preventDefault()}
                onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
              >
                <motion.div
                  className={cn(
                    "pointer-events-auto relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white shadow-lift",
                    "rounded-t-[28px] sm:rounded-[28px]",
                    width,
                    className,
                  )}
                  initial={desktop ? { opacity: 0, y: 24, scale: 0.97 } : { y: "100%" }}
                  animate={desktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
                  exit={desktop ? { opacity: 0, y: 16, scale: 0.98 } : { y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 340 }}
                >
                  {!desktop && <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line" />}
                  {hideHeader ? (
                    <>
                      <Dialog.Title className="sr-only">{title}</Dialog.Title>
                      {description && <Dialog.Description className="sr-only">{description}</Dialog.Description>}
                    </>
                  ) : (
                    <div className="flex items-start gap-4 px-6 pb-2 pt-5 sm:pt-6">
                      <div className="min-w-0 flex-1">
                        <Dialog.Title className="text-[19px] font-extrabold tracking-tight text-ink">{title}</Dialog.Title>
                        {description && <Dialog.Description className="mt-1 text-[14px] text-muted">{description}</Dialog.Description>}
                      </div>
                      {dismissible && (
                        <Dialog.Close
                          className="-mr-2 -mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-alt hover:text-ink"
                          aria-label="Fermer"
                        >
                          <X className="h-5 w-5" />
                        </Dialog.Close>
                      )}
                    </div>
                  )}
                  {!description && !hideHeader && <Dialog.Description className="sr-only">{title}</Dialog.Description>}
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">{children}</div>
                  {footer && (
                    <div className="border-t border-line bg-white px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>
                  )}
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/** Confirmation d'une action (annulation, suppression…). */
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="sm">
      {message && <div className="text-[14.5px] leading-relaxed text-ink-soft">{message}</div>}
      {children}
      <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="h-11 rounded-[12px] px-5 text-[14.5px] font-bold text-ink-soft transition hover:bg-surface-alt"
        >
          Retour
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-[12px] px-5 text-[14.5px] font-bold text-white transition active:scale-[0.97] disabled:opacity-60",
            danger ? "bg-danger hover:brightness-110" : "bg-brand-gradient shadow-glow",
          )}
        >
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
