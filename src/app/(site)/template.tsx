import type { ReactNode } from "react";

/** Transition douce entre les pages (CSS : le contenu s'affiche sans attendre JavaScript). */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
