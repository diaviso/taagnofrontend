import { Compass } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div data-brand="voyageur" className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo size={40} />
      <span className="mt-10 flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Compass className="h-9 w-9" />
      </span>
      <h1 className="mt-5 text-[28px] font-extrabold tracking-tight text-ink">Cette page n’existe pas</h1>
      <p className="mt-2 max-w-sm text-[15px] text-muted">Le lien est peut-être ancien, ou la page a été déplacée. Reprenons la route depuis l’accueil.</p>
      <Link href="/" className="mt-7 inline-flex h-12 items-center rounded-[14px] bg-brand-gradient px-6 text-[15px] font-bold text-white shadow-glow">
        Retour à l’accueil
      </Link>
    </div>
  );
}
