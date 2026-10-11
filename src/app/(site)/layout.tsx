import type { ReactNode } from "react";
import { BrandScope } from "@/components/brand/brand-scope";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader, SiteTabBar } from "@/components/layout/site-header";

/** Site voyageur (vert) : recherche, fiches, réservations, compte. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div data-brand="voyageur" className="flex min-h-dvh flex-col overflow-x-clip">
      <BrandScope brand="voyageur" />
      <AnnouncementBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SiteTabBar />
    </div>
  );
}
