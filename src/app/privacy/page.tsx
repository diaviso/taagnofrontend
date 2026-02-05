"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Database, UserCheck, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            <Shield className="w-4 h-4 mr-2" />
            Confidentialité
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Politique de Confidentialité</h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : Février 2026
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                1. Collecte des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Nous collectons les données suivantes lorsque vous utilisez Taagno :
              </p>
              <ul>
                <li>Informations de profil Google (nom, email, photo)</li>
                <li>Informations sur vos véhicules (si vous êtes propriétaire)</li>
                <li>Historique de vos trajets et réservations</li>
                <li>Données de localisation pour les trajets</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                2. Utilisation des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Vos données sont utilisées pour :
              </p>
              <ul>
                <li>Fournir et améliorer nos services</li>
                <li>Faciliter la mise en relation entre utilisateurs</li>
                <li>Assurer la sécurité de la plateforme</li>
                <li>Vous envoyer des notifications importantes</li>
                <li>Analyser l&apos;utilisation de la plateforme</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                3. Protection des Données
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
              </p>
              <ul>
                <li>Chiffrement des données en transit (HTTPS)</li>
                <li>Stockage sécurisé des données</li>
                <li>Accès restreint aux données personnelles</li>
                <li>Authentification sécurisée via Google OAuth</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                4. Vos Droits
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Conformément à la réglementation en vigueur, vous disposez des droits suivants :
              </p>
              <ul>
                <li>Droit d&apos;accès à vos données personnelles</li>
                <li>Droit de rectification de vos données</li>
                <li>Droit à l&apos;effacement de vos données</li>
                <li>Droit à la portabilité de vos données</li>
                <li>Droit d&apos;opposition au traitement</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                5. Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert">
              <p>
                Pour exercer vos droits ou pour toute question concernant vos données personnelles :
              </p>
              <ul>
                <li>Email : privacy@taagno.sn</li>
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
