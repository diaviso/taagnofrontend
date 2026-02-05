"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Car, Users, CreditCard, Shield, Clock } from "lucide-react";

const faqCategories = [
  {
    title: "Général",
    icon: HelpCircle,
    questions: [
      {
        question: "Qu'est-ce que Taagno ?",
        answer: "Taagno est une plateforme sénégalaise de covoiturage et de location de véhicules entre particuliers. Elle permet aux conducteurs de proposer des places dans leur véhicule et aux propriétaires de louer leurs véhicules en toute sécurité."
      },
      {
        question: "Comment créer un compte ?",
        answer: "Pour créer un compte, cliquez sur 'Se connecter' et utilisez votre compte Google. L'inscription est gratuite et ne prend que quelques secondes."
      },
      {
        question: "Taagno est-il disponible dans tout le Sénégal ?",
        answer: "Oui, Taagno couvre les 14 régions du Sénégal. Vous pouvez trouver des trajets et des véhicules à louer dans toutes les grandes villes."
      }
    ]
  },
  {
    title: "Covoiturage",
    icon: Users,
    questions: [
      {
        question: "Comment réserver un trajet ?",
        answer: "Recherchez votre trajet en indiquant votre ville de départ, d'arrivée et la date. Parcourez les offres disponibles et cliquez sur 'Réserver' pour confirmer votre place."
      },
      {
        question: "Comment proposer un trajet ?",
        answer: "Connectez-vous à votre compte, allez dans 'Mes trajets' et cliquez sur 'Créer un trajet'. Remplissez les informations (itinéraire, date, prix, places disponibles) et publiez."
      },
      {
        question: "Puis-je annuler une réservation ?",
        answer: "Oui, vous pouvez annuler une réservation jusqu'à 24h avant le départ. Au-delà, des frais d'annulation peuvent s'appliquer."
      }
    ]
  },
  {
    title: "Location de véhicules",
    icon: Car,
    questions: [
      {
        question: "Comment louer un véhicule ?",
        answer: "Parcourez les offres de location, sélectionnez le véhicule qui vous convient, choisissez vos dates et envoyez une demande de réservation au propriétaire."
      },
      {
        question: "Quels documents sont nécessaires pour louer ?",
        answer: "Vous devez avoir un permis de conduire valide et une pièce d'identité. Le propriétaire peut demander des documents supplémentaires."
      },
      {
        question: "Comment mettre mon véhicule en location ?",
        answer: "Ajoutez votre véhicule dans 'Mes véhicules', fournissez les documents requis (carte grise, assurance) et attendez la validation. Ensuite, créez une offre de location."
      }
    ]
  },
  {
    title: "Paiement",
    icon: CreditCard,
    questions: [
      {
        question: "Quels sont les moyens de paiement acceptés ?",
        answer: "Les paiements se font directement entre utilisateurs. Nous recommandons Orange Money, Wave ou le paiement en espèces lors de la rencontre."
      },
      {
        question: "Y a-t-il des frais de service ?",
        answer: "Taagno est actuellement gratuit pour les utilisateurs. Nous ne prélevons aucune commission sur les transactions."
      }
    ]
  },
  {
    title: "Sécurité",
    icon: Shield,
    questions: [
      {
        question: "Comment Taagno assure-t-il la sécurité ?",
        answer: "Tous les utilisateurs sont vérifiés via Google. Les véhicules de location sont validés par notre équipe. Les avis et notes permettent d'évaluer la fiabilité des utilisateurs."
      },
      {
        question: "Que faire en cas de problème ?",
        answer: "Contactez immédiatement notre support via l'application ou par téléphone au +221 77 123 45 67. Nous sommes disponibles 24h/24 pour vous aider."
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            <HelpCircle className="w-4 h-4 mr-2" />
            Support
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Foire Aux Questions</h1>
          <p className="text-muted-foreground text-lg">
            Trouvez rapidement des réponses à vos questions
          </p>
        </div>

        <div className="space-y-8">
          {faqCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="h-5 w-5 text-primary" />
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.questions.map((faq, faqIndex) => (
                  <div key={faqIndex} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <h4 className="font-medium mb-2">{faq.question}</h4>
                    <p className="text-muted-foreground text-sm">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Vous n&apos;avez pas trouvé votre réponse ?</h3>
            <p className="text-muted-foreground mb-4">
              Notre équipe est disponible 24h/24 pour vous aider
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:contact@taagno.sn" className="text-primary hover:underline">
                contact@taagno.sn
              </a>
              <span className="hidden sm:inline text-muted-foreground">•</span>
              <a href="tel:+221771234567" className="text-primary hover:underline">
                +221 77 123 45 67
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
