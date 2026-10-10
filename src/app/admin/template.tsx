import type { ReactNode } from "react";

/** Transition douce entre les pages de l'espace. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
