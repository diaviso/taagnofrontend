"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Shield,
  Clock,
  MapPin
} from "lucide-react";

const helpTopics = [
  {
    icon: FileText,
    title: "Guide de démarrage",
    description: "Apprenez à utiliser Taagno en quelques minutes",
    href: "/faq"
  },
  {
    icon: Shield,
    title: "Sécurité",
    description: "Conseils pour des trajets et locations en toute sécurité",
    href: "/faq"
  },
  {
    icon: MessageCircle,
    title: "FAQ",
    description: "Réponses aux questions fréquemment posées",
    href: "/faq"
  }
];

export default function AidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-12 max-w-4xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
            <HelpCircle className="w-4 h-4 mr-2" />
            Support
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Aide & Support</h1>
          <p className="text-muted-foreground text-lg">
            Nous sommes là pour vous aider
          </p>
        </div>

        {/* Quick Help Topics */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {helpTopics.map((topic, index) => (
            <Link key={index} href={topic.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <topic.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Contactez-nous
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Notre équipe de support est disponible pour répondre à toutes vos questions.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Email</h4>
                  <a href="mailto:support@taagno.sn" className="text-primary hover:underline">
                    support@taagno.sn
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Réponse sous 24h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Téléphone</h4>
                  <a href="tel:+221771234567" className="text-primary hover:underline">
                    +221 77 123 45 67
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lun-Ven, 8h-18h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Horaires</h4>
                  <p className="text-muted-foreground">
                    Lundi - Vendredi : 8h - 18h<br />
                    Samedi : 9h - 13h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Adresse</h4>
                  <p className="text-muted-foreground">
                    Dakar, Sénégal<br />
                    Plateau, Rue Carnot
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Liens utiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/faq">
                <Button variant="outline" className="w-full">FAQ</Button>
              </Link>
              <Link href="/terms">
                <Button variant="outline" className="w-full">CGU</Button>
              </Link>
              <Link href="/privacy">
                <Button variant="outline" className="w-full">Confidentialité</Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className="w-full">À propos</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
