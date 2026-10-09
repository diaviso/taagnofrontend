import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/types";

const tones: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/12 text-[#b46b05]",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-[#0784bf]",
  muted: "bg-surface-alt text-muted",
  brand: "bg-brand-soft text-brand",
};

const dots: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  muted: "bg-faint",
  brand: "bg-brand",
};

export function Badge({
  tone = "brand",
  dot,
  icon,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-bold [&_svg]:h-3.5 [&_svg]:w-3.5",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />}
      {icon}
      {children}
    </span>
  );
}

export function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; tone: Tone }> }) {
  const s = map[status] ?? { label: status, tone: "muted" as Tone };
  return (
    <Badge tone={s.tone} dot>
      {s.label}
    </Badge>
  );
}
