import type { Metadata } from "next";
import { ACCOUNT_DELETION, LegalPage, SUPPORT_EMAIL } from "@/components/info/legal";

export const metadata: Metadata = {
  title: "Suppression du compte",
  description: "Comment supprimer votre compte Taagno ou Taagno Pro, ce qui est effacé, ce qui peut être conservé et dans quels cas la suppression est impossible.",
};

export default function AccountDeletionPage() {
  return (
    <LegalPage
      title="Suppression du compte"
      subtitle="Supprimer votre compte Taagno ou Taagno Pro, et ce que deviennent vos données."
      sections={ACCOUNT_DELETION}
      contact={SUPPORT_EMAIL}
    />
  );
}
