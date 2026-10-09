# Taagno — site web

Site Next.js de Taagno (covoiturage et location de véhicules entre particuliers au Sénégal).
Il reprend l'approche des applications mobiles : **un seul site, trois espaces bien séparés**,
avec le même compte (numéro de téléphone + code PIN).

| Espace | Adresse | Couleur | Pour qui |
| --- | --- | --- | --- |
| Voyageur | `/` | vert | chercher un trajet, louer une voiture, réserver, suivre ses réservations |
| Taagno Pro | `/pro` | ambre | conducteurs et propriétaires : véhicules, trajets, locations, demandes, gains |
| Administration | `/admin` | indigo | équipe Taagno : vérification des véhicules, comptes |

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3010
```

Par défaut, le site utilise l'API de production. Pour l'API locale (`tagnobackend` sur le port 3008),
créez `.env.local` à partir de `.env.example`.

```bash
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm run build      # build de production
```

## Fonctionnement

- Le navigateur appelle toujours `/api/...` : Next relaie vers le backend (`next.config.ts`),
  sans réglage CORS, quel que soit le domaine.
- Les fiches trajet (`/covoiturage/[id]`), location (`/location/[id]`) et les profils publics
  (`/membres/[id]`) sont rendues côté serveur avec leurs aperçus de partage (WhatsApp, réseaux).
- La session (jeton) est gardée dans le navigateur ; favoris et recherches récentes aussi.
- Aucun paiement sur le site : prix et caution se règlent directement entre les personnes.

## Structure

- `src/app/(site)` — espace voyageur
- `src/app/pro` — page Taagno Pro et espace Pro (`(espace)`)
- `src/app/admin` — administration
- `src/components` — interface (connexion, recherche, cartes, réservation, Pro, admin)
- `src/lib` — API, session, modèles, formats, règles métier

## Déploiement

N'importe quel hébergeur Next.js (Vercel, Railway…). Variables : `API_URL` (facultative,
production par défaut) et `NEXT_PUBLIC_SITE_URL` (adresse publique du site).
