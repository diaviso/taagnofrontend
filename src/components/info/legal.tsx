import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export const LAST_UPDATE = "Dernière mise à jour : octobre 2026";
export const SUPPORT_EMAIL = "support@taagno.sn";
export const PRIVACY_EMAIL = "privacy@taagno.sn";

export interface LegalSection {
  title: string;
  intro?: string;
  bullets?: string[];
  outro?: string;
  extra?: ReactNode;
}

export const TERMS: LegalSection[] = [
  {
    title: "Acceptation des conditions",
    intro:
      "En utilisant le site Taagno et les applications Taagno (voyageurs) et Taagno Pro (propriétaires et conducteurs), vous acceptez les présentes conditions d’utilisation. Si vous ne les acceptez pas, veuillez ne pas utiliser le service.",
  },
  {
    title: "Description du service",
    intro: "Taagno est une plateforme de mise en relation, disponible sur le site et dans deux applications :",
    bullets: [
      "L’espace voyageur : chercher un trajet en covoiturage ou louer un véhicule",
      "Taagno Pro, pour les propriétaires et conducteurs : publier ses véhicules, ses trajets et ses offres de location",
    ],
    outro: "Taagno agit uniquement en tant qu’intermédiaire et ne fournit pas directement de services de transport ou de location.",
  },
  {
    title: "Inscription et compte",
    intro: "Pour utiliser Taagno, vous devez :",
    bullets: [
      "Être âgé d’au moins 18 ans",
      "Fournir des informations exactes et à jour",
      "Vous connecter avec votre numéro de téléphone et un code PIN à 4 chiffres (un code SMS vous est envoyé à l’inscription ou en cas d’oubli)",
      "Garder votre code PIN secret et ne le communiquer à personne",
      "Signaler toute utilisation non autorisée de votre compte",
    ],
  },
  {
    title: "Obligations des utilisateurs",
    intro: "En tant qu’utilisateur, vous vous engagez à :",
    bullets: [
      "Respecter les lois en vigueur au Sénégal",
      "Fournir des informations véridiques sur vos véhicules",
      "Respecter les réservations confirmées",
      "Maintenir vos véhicules en bon état et conformes",
      "Disposer d’une assurance valide pour tout véhicule publié",
    ],
  },
  {
    title: "Vérification des véhicules",
    intro:
      "Tous les véhicules publiés depuis Taagno Pro sont soumis à vérification. Les documents requis incluent l’assurance, la carte grise et la visite technique. Taagno se réserve le droit de refuser ou de suspendre tout véhicule non conforme.",
  },
  {
    title: "Prix, caution et paiements",
    intro: "Taagno ne gère aucun paiement et ne collecte, ne conserve ni ne reverse aucune somme d’argent.",
    bullets: [
      "Le prix d’un trajet ou d’une location, ainsi que la caution éventuelle, se règlent directement entre les personnes concernées",
      "Mettez-vous d’accord clairement sur le montant et le mode de règlement avant le départ ou la remise du véhicule",
    ],
  },
  {
    title: "Annulations",
    intro: "Les conditions d’annulation varient selon le type de service :",
    bullets: ["Covoiturage : annulation gratuite avant la confirmation du conducteur", "Location : annulation selon les conditions du propriétaire"],
    outro: "Les annulations répétées peuvent entraîner la suspension du compte.",
  },
  {
    title: "Responsabilité",
    intro: "Taagno ne peut être tenu responsable :",
    bullets: [
      "Des dommages survenant lors des trajets ou des locations",
      "Des litiges entre utilisateurs",
      "Des accords financiers (prix, caution) conclus directement entre utilisateurs",
      "De la qualité des véhicules au-delà de la vérification initiale",
    ],
  },
  {
    title: "Modification des conditions",
    intro: "Taagno se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des modifications par notification.",
  },
];

export const PRIVACY: LegalSection[] = [
  {
    title: "Données collectées",
    intro: "Sur le site, dans Taagno et dans Taagno Pro, nous collectons les données suivantes :",
    bullets: [
      "Informations d’identification : nom, prénom, numéro de téléphone",
      "Données de connexion : code PIN (conservé sous forme chiffrée) et codes SMS de vérification",
      "Informations véhicule : marque, modèle, plaque, photos, documents",
      "Données de trajets : villes de départ et d’arrivée, dates, prix indiqué",
      "Données de réservation : dates, statuts, prix et caution indiqués",
    ],
  },
  {
    title: "Utilisation des données",
    intro: "Vos données sont utilisées pour :",
    bullets: [
      "Fournir et améliorer nos services",
      "Gérer votre compte et vos réservations",
      "Vérifier les véhicules et les documents",
      "Communiquer avec vous (notifications, SMS de vérification)",
      "Assurer la sécurité de la plateforme",
    ],
  },
  {
    title: "Stockage et sécurité",
    intro: "Vos données sont stockées de manière sécurisée :",
    bullets: [
      "Le code PIN est protégé par un chiffrement irréversible et n’est jamais conservé en clair",
      "Les communications sont protégées par HTTPS",
      "L’accès aux données est restreint au personnel autorisé",
      "Les serveurs sont hébergés dans des centres de données sécurisés",
    ],
  },
  {
    title: "Partage des données",
    intro: "Vos données personnelles ne sont jamais vendues. Elles peuvent être partagées :",
    bullets: [
      "Avec les autres utilisateurs (nom, photo de profil, et votre numéro uniquement après une réservation confirmée)",
      "Avec les autorités compétentes en cas d’obligation légale",
      "Avec nos prestataires techniques pour le fonctionnement de la plateforme",
    ],
  },
  {
    title: "Vos droits",
    intro: "Conformément à la loi sénégalaise sur la protection des données, vous disposez des droits suivants :",
    bullets: [
      "Droit d’accès à vos données",
      "Droit de rectification de vos informations",
      "Droit de suppression de votre compte (depuis « Mon compte »)",
      "Droit d’opposition au traitement de vos données",
      "Droit à la portabilité de vos données",
    ],
  },
  {
    title: "Cookies et stockage local",
    intro:
      "Le site n’utilise ni cookie publicitaire ni outil de suivi. Votre navigateur conserve seulement votre session (pour rester connecté), vos favoris et vos dernières recherches. La session est effacée lorsque vous vous déconnectez.",
  },
  {
    title: "Durée de conservation",
    intro: "Vos données sont conservées :",
    bullets: [
      "Données de compte : tant que le compte est actif",
      "Données de réservation : 2 ans après la dernière activité",
      "Données de véhicule : tant que le véhicule est publié",
      "Après suppression du compte : 30 jours maximum",
    ],
  },
];

/** Lien d'appel à l'action à la fin d'une section. */
function SectionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-[15px] font-bold text-brand hover:underline">
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

/**
 * Suppression du compte (page exigée par Google Play). Décrit ce que fait réellement
 * `deleteAccount` côté serveur : suppression en cascade, refus (409) si activité à venir.
 */
export const ACCOUNT_DELETION: LegalSection[] = [
  {
    title: "Supprimer votre compte",
    intro:
      "Vous pouvez supprimer votre compte vous-même, à tout moment. C’est le même compte pour le site, l’application Taagno et l’application Taagno Pro : le supprimer depuis l’un d’eux le supprime partout.",
    bullets: [
      "Dans l’application Taagno : onglet « Compte », puis « Supprimer mon compte » tout en bas de la page",
      "Dans l’application Taagno Pro : onglet « Profil », puis « Supprimer mon compte » tout en bas de la page",
      "Sur le site : connectez-vous, ouvrez la page « Compte », puis choisissez « Supprimer mon compte »",
    ],
    outro: "Une confirmation vous est demandée, puis la suppression est immédiate. Elle ne peut pas être annulée.",
    extra: <SectionLink href="/compte">Ouvrir la page Compte</SectionLink>,
  },
  {
    title: "Quand la suppression est impossible",
    intro: "Pour ne laisser personne dans l’embarras, la suppression est refusée tant que votre compte a une activité à venir :",
    bullets: [
      "Une réservation de place (en attente ou confirmée) sur un trajet qui n’est pas encore parti",
      "Une demande de location ou une location (en attente ou confirmée) dont la date de retour n’est pas passée",
      "Un trajet que vous avez publié et qui n’est pas encore parti",
      "Une demande (en attente ou confirmée) sur l’un de vos trajets ou l’une de vos annonces de location",
    ],
    outro: "Un message vous l’explique alors : annulez ou terminez d’abord ces réservations, trajets et locations, puis recommencez.",
  },
  {
    title: "Ce qui est supprimé",
    intro: "Une fois la suppression confirmée, votre compte et les données qui y sont rattachées sont effacés de nos serveurs :",
    bullets: [
      "Votre profil : nom, prénom, photo, présentation, numéro de téléphone, code PIN et adresse e-mail éventuelle",
      "Vos véhicules, ainsi que les liens vers leurs photos et leurs documents (carte grise, assurance, visite technique)",
      "Vos trajets, vos annonces de location et les demandes reçues",
      "Vos réservations de places et vos demandes de location, y compris les anciennes",
      "Vos alertes de trajet, vos notifications et les appareils enregistrés pour les notifications",
      "Les avis que vous avez laissés et ceux que vous avez reçus",
      "Vos favoris et vos dernières recherches, effacés de l’appareil où vous supprimez le compte (ils ne sont jamais enregistrés sur nos serveurs)",
    ],
    outro:
      "Les avis que vous avez laissés ne sont pas gardés sous forme anonyme : ils disparaissent avec votre compte, et leur note est retirée de la moyenne des personnes que vous aviez notées.",
  },
  {
    title: "Ce qui peut être conservé",
    intro: "Quelques éléments échappent à la suppression du compte :",
    bullets: [
      "Les fichiers de vos photos et de vos documents de véhicule : leur adresse est effacée de nos serveurs, mais les fichiers eux-mêmes sont hébergés chez notre prestataire d’images et ne sont pas retirés automatiquement",
      "Les notifications que d’autres personnes ont déjà reçues à votre sujet (une demande, une annulation…) : elles restent dans leur liste, avec votre prénom et l’initiale de votre nom",
      "Ce que vous avez échangé en dehors de Taagno, par appel, SMS ou WhatsApp, avec un conducteur, un passager, un propriétaire ou un locataire",
    ],
    outro:
      "Taagno ne gérant aucun paiement, aucun moyen de paiement ni historique de paiement n’est rattaché à votre compte. Notre politique de confidentialité fixe à 30 jours au maximum la durée de conservation après la suppression d’un compte.",
    extra: <SectionLink href="/confidentialite">Lire la politique de confidentialité</SectionLink>,
  },
  {
    title: "Besoin d’aide ?",
    intro:
      "Une difficulté pour supprimer votre compte, un doute sur ce qui sera effacé ? Passez par la page d’aide : nous répondons en général dans la journée.",
    extra: <SectionLink href="/aide">Aller à la page d’aide</SectionLink>,
  },
];

export const FAQ = [
  {
    q: "Comment créer un compte ?",
    a: "Cliquez sur « Se connecter », saisissez votre numéro de téléphone puis le code reçu par SMS. Vous choisissez ensuite un code PIN à 4 chiffres, qui vous servira à vous connecter sur le site comme dans les applications.",
  },
  {
    q: "J’ai oublié mon code PIN.",
    a: "Sur l’écran de connexion, saisissez votre numéro puis touchez « Code PIN oublié ? ». Un code SMS vous permet d’en choisir un nouveau.",
  },
  {
    q: "Comment réserver un trajet ?",
    a: "Recherchez un trajet par ville de départ et d’arrivée, ouvrez sa fiche, choisissez le nombre de places puis touchez « Réserver ». Avec la réservation instantanée, votre place est confirmée tout de suite ; sinon le conducteur valide votre demande.",
  },
  {
    q: "Comment louer un véhicule ?",
    a: "Dans « Location », choisissez une ville et vos dates, ouvrez l’annonce qui vous plaît et envoyez votre demande. Le propriétaire la confirme, puis son numéro s’affiche dans votre réservation.",
  },
  {
    q: "Comment se règlent le prix et la caution ?",
    a: "Taagno ne gère aucun paiement. Le prix et la caution se règlent directement entre vous (espèces, Wave, Orange Money…). Mettez-vous d’accord avant le départ ou la remise du véhicule.",
  },
  {
    q: "Quand vois-je le numéro du conducteur ou du propriétaire ?",
    a: "Dès que votre réservation est confirmée, son numéro apparaît dans « Mes réservations », avec des boutons pour l’appeler ou lui écrire sur WhatsApp. Votre numéro lui est communiqué de la même façon.",
  },
  {
    q: "Comment publier un trajet ou louer ma voiture ?",
    a: "Rendez-vous dans l’espace Taagno Pro. Ajoutez votre véhicule avec ses photos et ses documents (carte grise, assurance, visite technique). Une fois approuvé par notre équipe, publiez un trajet ou une offre de location en quelques minutes.",
  },
  {
    q: "Comment annuler une réservation ?",
    a: "Ouvrez « Mes réservations », sélectionnez la réservation et touchez « Annuler ». Le conducteur ou le propriétaire est prévenu automatiquement.",
  },
  {
    q: "Comment supprimer mon compte ?",
    a: "Dans l’onglet « Compte » (application Taagno ou site) ou « Profil » (application Taagno Pro), touchez « Supprimer mon compte » tout en bas. C’est impossible tant qu’une réservation, une location ou un trajet à venir est en cours. Le détail est sur la page « Suppression du compte ».",
  },
  {
    q: "Comment être prévenu d’un nouveau trajet ?",
    a: "Après une recherche, touchez « Créer une alerte ». Vous recevez une notification dès qu’un conducteur publie un trajet correspondant.",
  },
];

/** Mise en page d'un texte légal (conditions, confidentialité). */
export function LegalPage({ title, subtitle, sections, contact }: { title: string; subtitle: string; sections: LegalSection[]; contact: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6">
      <p className="text-[13px] font-bold uppercase tracking-wider text-brand">{LAST_UPDATE}</p>
      <h1 className="mt-2 text-[30px] font-extrabold tracking-tight text-ink sm:text-[36px]">{title}</h1>
      <p className="mt-2 text-[16px] text-muted">{subtitle}</p>
      <div className="mt-8 space-y-4">
        {sections.map((s, i) => (
          <section key={s.title} className="rounded-[22px] border border-line/70 bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-3 text-[18px] font-extrabold text-ink">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[14px] text-brand">{i + 1}</span>
              {s.title}
            </h2>
            {s.intro && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{s.intro}</p>}
            {s.bullets && (
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-[15px] leading-relaxed text-ink-soft">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {s.outro && <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{s.outro}</p>}
            {s.extra && <div className="mt-4">{s.extra}</div>}
          </section>
        ))}
        <section className="rounded-[22px] bg-brand-soft/60 p-6">
          <h2 className="text-[18px] font-extrabold text-ink">Contact</h2>
          <p className="mt-2 text-[15px] text-ink-soft">
            Une question ? Écrivez-nous à{" "}
            <a href={`mailto:${contact}`} className="font-bold text-brand hover:underline">
              {contact}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
