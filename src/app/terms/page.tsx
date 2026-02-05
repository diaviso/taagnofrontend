"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Users, Car, AlertTriangle, Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            <FileText className="w-4 h-4 mr-2" />
            Légal
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Conditions Générales d&apos;Utilisation</h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : Février 2026
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                1. Objet
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;utilisation de la plateforme Taagno, 
                un service de mise en relation entre conducteurs et passagers pour le covoiturage, ainsi qu&apos;entre 
                propriétaires et locataires pour la location de véhicules entre particuliers au Sénégal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                2. Inscription et Compte
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Pour utiliser les services de Taagno, vous devez créer un compte en vous connectant via Google OAuth. 
                Vous vous engagez à fournir des informations exactes et à maintenir la confidentialité de vos identifiants.
              </p>
              <ul>
                <li>Vous devez avoir au moins 18 ans pour créer un compte</li>
                <li>Un seul compte par personne est autorisé</li>
                <li>Vous êtes responsable de toutes les activités sur votre compte</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                3. Services de Covoiturage
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Le service de covoiturage permet aux conducteurs de proposer des places dans leur véhicule 
                et aux passagers de réserver ces places pour un trajet donné.
              </p>
              <ul>
                <li>Les conducteurs doivent posséder un permis de conduire valide</li>
                <li>Les véhicules doivent être assurés et en bon état</li>
                <li>Les prix sont fixés par les conducteurs et affichés en FCFA</li>
                <li>Les annulations doivent respecter les délais prévus</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                4. Services de Location
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Le service de location permet aux propriétaires de véhicules de proposer leur véhicule 
                à la location et aux locataires de réserver ces véhicules.
              </p>
              <ul>
                <li>Les véhicules doivent être vérifiés et approuvés par Taagno</li>
                <li>Une caution peut être demandée par le propriétaire</li>
                <li>Le locataire doit posséder un permis de conduire valide</li>
                <li>Tout dommage doit être signalé immédiatement</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                5. Responsabilités
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Taagno agit en tant qu&apos;intermédiaire et ne peut être tenu responsable des litiges 
                entre utilisateurs. Chaque utilisateur est responsable de ses actes sur la plateforme.
              </p>
              <p>
                En cas de litige, nous encourageons les utilisateurs à trouver une solution amiable. 
                Notre service client est disponible pour faciliter la médiation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Contact</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Pour toute question concernant ces CGU, vous pouvez nous contacter à :
              </p>
              <ul>
                <li>Email : contact@taagno.sn</li>
                <li>Téléphone : +221 77 123 45 67</li>
                <li>Adresse : Dakar, Sénégal - Plateau, Rue Carnot</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
