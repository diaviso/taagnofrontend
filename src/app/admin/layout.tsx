import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { BrandScope } from "@/components/brand/brand-scope";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Admin Taagno" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div data-brand="admin">
      <BrandScope brand="admin" />
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
