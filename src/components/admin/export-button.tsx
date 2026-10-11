"use client";

import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Download, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EXPORTS, downloadExport, type ExportKind } from "@/lib/admin";
import { errorMessage } from "@/lib/api";

/** Lance le téléchargement d'un export CSV et prévient la personne du résultat. */
function useExport() {
  const [busy, setBusy] = useState<ExportKind | null>(null);
  const run = async (kind: ExportKind) => {
    if (busy) return;
    setBusy(kind);
    try {
      const filename = await downloadExport(kind);
      toast.success(`Export prêt : ${filename}`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };
  return { busy, run };
}

/** Export CSV d'une seule liste (en-tête d'une page). */
export function ExportButton({ kind, label = "Exporter (CSV)" }: { kind: ExportKind; label?: string }) {
  const { busy, run } = useExport();
  return (
    <Button variant="outline" size="sm" loading={busy === kind} icon={<Download className="h-4 w-4" />} onClick={() => run(kind)}>
      {label}
    </Button>
  );
}

/** Menu des exports CSV du tableau de bord. */
export function ExportMenu() {
  const { busy, run } = useExport();
  return (
    <Dropdown.Root modal={false}>
      <Dropdown.Trigger asChild>
        <Button variant="outline" size="sm" loading={!!busy} icon={<FileSpreadsheet className="h-4 w-4" />} iconRight={<ChevronDown className="h-4 w-4" />}>
          Exporter (CSV)
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          align="end"
          sideOffset={8}
          className="z-[70] w-[270px] rounded-[18px] border border-line bg-white p-1.5 shadow-lift data-[state=open]:animate-[pop_.16s_ease-out]"
        >
          <p className="px-3 pb-1.5 pt-2 text-[11.5px] font-extrabold uppercase tracking-[0.1em] text-faint">Télécharger un fichier Excel</p>
          {EXPORTS.map(({ kind, label }) => (
            <Dropdown.Item
              key={kind}
              onSelect={() => run(kind)}
              className="flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-semibold text-ink outline-none transition data-[highlighted]:bg-brand-soft data-[highlighted]:text-brand"
            >
              <Download className="h-4 w-4 text-muted" />
              {label}
            </Dropdown.Item>
          ))}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}
