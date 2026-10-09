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
