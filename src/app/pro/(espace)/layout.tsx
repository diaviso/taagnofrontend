"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { RequireAuth } from "@/components/auth/require-auth";
import { ProShell } from "@/components/pro/pro-shell";
import { useAuth } from "@/lib/auth";
import { isProfileComplete } from "@/lib/types";

export default function EspaceLayout({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  if (status === "authenticated" && user && isProfileComplete(user)) return <ProShell>{children}</ProShell>;
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line/70 bg-white">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center px-4 sm:px-6">
          <Link href="/pro">
            <Logo size={32} suffix="Pro" />
          </Link>
        </div>
      </header>
      <RequireAuth
        title="Connectez-vous à Taagno Pro"
        text="Le même compte que sur le site voyageur : votre numéro et votre code PIN. Pas encore de compte ? Il se crée en une minute."
      >
        {null}
      </RequireAuth>
    </div>
  );
}
