"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, FileCheck2, ImagePlus, RefreshCw, Star, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { api, errorMessage } from "@/lib/api";
import { cdn } from "@/lib/images";
import { uploadImage, useAction } from "@/lib/queries";
import { DOCUMENT_STATUS, DOCUMENT_TYPES, orderedPhotos, type DocumentType, type Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAX_MB = 8;

function checkImage(file: File) {
  if (!file.type.startsWith("image/")) {
    toast.error(`${file.name} : choisissez une image (JPG, PNG).`);
    return false;
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    toast.error(`${file.name} : image trop lourde (${MAX_MB} Mo maximum).`);
    return false;
  }
  return true;
}

/** Photos du véhicule : ajout (plusieurs à la fois), photo principale, suppression. */
export function PhotoManager({ vehicle }: { vehicle: Vehicle }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const { run, busy } = useAction();
  const photos = orderedPhotos(vehicle);
  const invalidate = [["vehicles"], ["vehicle", vehicle.id]];

  const add = async (files: FileList | null) => {
    const list = Array.from(files ?? []).filter(checkImage).slice(0, 10);
    if (!list.length) return;
    setUploading(list.length);
    let hasMain = photos.length > 0;
    let ok = 0;
    for (const file of list) {
      try {
        const url = await uploadImage(file);
        await api.post(`/vehicles/${vehicle.id}/photos`, { url, isMain: !hasMain });
        hasMain = true;
        ok++;
      } catch (e) {
        toast.error(errorMessage(e));
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (ok) toast.success(ok > 1 ? `${ok} photos ajoutées.` : "Photo ajoutée.");
    await run("refresh", async () => null, { invalidate, silent: true });
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <AnimatePresence initial={false}>
          {photos.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-[4/3] overflow-hidden rounded-[16px] bg-surface-alt"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdn(p.url, 500) ?? undefined} alt="" className="h-full w-full object-cover" />
              {p.isMain && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11.5px] font-bold text-brand shadow-soft">
                  <Star className="h-3 w-3 fill-brand" /> Principale
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/55 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                {!p.isMain && (
                  <button
                    type="button"
                    onClick={() => run(`main-${p.id}`, () => api.patch(`/vehicles/${vehicle.id}/photos/${p.id}/main`), { success: "Photo principale changée.", invalidate })}
                    disabled={!!busy}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-white/95 px-2.5 text-[12px] font-bold text-ink hover:bg-white"
                  >
                    <Star className="h-3.5 w-3.5" /> Principale
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => run(`del-${p.id}`, () => api.delete(`/vehicles/${vehicle.id}/photos/${p.id}`), { success: "Photo supprimée.", invalidate })}
                  disabled={!!busy}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-danger hover:bg-white"
                  aria-label="Supprimer la photo"
                >
                  {busy === `del-${p.id}` ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="skeleton flex aspect-[4/3] items-center justify-center rounded-[16px]">
            <Spinner className="h-6 w-6 text-brand" />
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-[16px] border-2 border-dashed border-brand/35 bg-brand-soft/40 text-brand transition hover:border-brand hover:bg-brand-soft"
        >
          <ImagePlus className="h-7 w-7" />
          <span className="text-[13px] font-bold">Ajouter des photos</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => add(e.target.files)} />
      <p className="mt-3 flex items-center gap-2 text-[12.5px] text-muted">
        <Camera className="h-4 w-4" /> Conseil : avant, arrière, intérieur et tableau de bord, en pleine lumière.
      </p>
    </div>
  );
}

/** Documents du véhicule : carte grise, assurance, visite technique. */
export function DocumentsSection({ vehicle }: { vehicle: Vehicle }) {
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const { run, busy } = useAction();
  const refs = useRef<Partial<Record<DocumentType, HTMLInputElement | null>>>({});
  const invalidate = [["vehicles"], ["vehicle", vehicle.id]];

  const upload = async (type: DocumentType, file?: File) => {
    if (!file || !checkImage(file)) return;
    const previous = (vehicle.documents ?? []).filter((d) => d.type === type);
    setUploading(type);
    try {
      const url = await uploadImage(file);
      await api.post(`/vehicles/${vehicle.id}/documents`, { type, fileUrl: url });
      // Le nouveau document remplace l'ancien.
      for (const d of previous) await api.delete(`/vehicles/${vehicle.id}/documents/${d.id}`).catch(() => {});
      toast.success(previous.length ? "Document remplacé. Il sera vérifié par notre équipe." : "Document envoyé. Il sera vérifié par notre équipe.");
      await run("refresh", async () => null, { invalidate, silent: true });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUploading(null);
      const input = refs.current[type];
      if (input) input.value = "";
    }
  };

  return (
    <ul className="space-y-3">
      {DOCUMENT_TYPES.map(({ value, label, hint }) => {
        const doc = (vehicle.documents ?? []).filter((d) => d.type === value).sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0))[0];
        const loading = uploading === value;
        return (
          <li key={value} className={cn("flex items-center gap-4 rounded-[18px] border p-3.5", doc ? "border-line bg-white" : "border-dashed border-brand/35 bg-brand-soft/30")}>
            {doc ? (
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-surface-alt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cdn(doc.fileUrl, 160) ?? undefined} alt={label} className="h-full w-full object-cover" />
              </a>
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] bg-white text-brand">
                <FileCheck2 className="h-6 w-6" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-extrabold text-ink">{label}</p>
              {doc ? <StatusBadge status={doc.status} map={DOCUMENT_STATUS} /> : <p className="text-[12.5px] text-muted">{hint}</p>}
            </div>
            <input ref={(el) => { refs.current[value] = el; }} type="file" accept="image/*" className="hidden" onChange={(e) => upload(value, e.target.files?.[0])} />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={!!uploading}
                onClick={() => refs.current[value]?.click()}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-[12px] px-3.5 text-[13px] font-bold transition disabled:opacity-50",
                  doc ? "bg-surface-alt text-ink hover:bg-line" : "bg-brand-gradient text-white shadow-glow",
                )}
              >
                {loading ? <Spinner className="h-4 w-4" /> : doc ? <RefreshCw className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                <span className="hidden sm:inline">{doc ? "Remplacer" : "Envoyer"}</span>
              </button>
              {doc && (
                <button
                  type="button"
                  disabled={!!busy || !!uploading}
                  onClick={() => run(`doc-${doc.id}`, () => api.delete(`/vehicles/${vehicle.id}/documents/${doc.id}`), { success: "Document supprimé.", invalidate })}
                  className="flex h-10 w-10 items-center justify-center rounded-[12px] text-muted transition hover:bg-danger/10 hover:text-danger"
                  aria-label={`Supprimer ${label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
