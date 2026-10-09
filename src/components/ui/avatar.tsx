import { cdn } from "@/lib/images";
import { initials, type User } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Avatar({ user, size = 44, className, ring }: { user?: User | null; size?: number; className?: string; ring?: boolean }) {
  const src = cdn(user?.photoUrl, size * 3);
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gradient font-extrabold text-white",
        ring && "ring-4 ring-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initials(user)
      )}
    </span>
  );
}
