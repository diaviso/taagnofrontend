"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Hide navbar and footer on proprietaire and admin pages (they have their own layouts)
  const isProprietairePage = pathname?.startsWith("/proprietaire");
  const isAdminPage = pathname?.startsWith("/admin");
  const hideMainLayout = isProprietairePage || isAdminPage;

  if (hideMainLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
