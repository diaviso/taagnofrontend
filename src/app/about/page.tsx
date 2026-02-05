"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Users, 
  MapPin, 
  Heart, 
  Target, 
  Sparkles,
  Shield,
  Leaf,
  Handshake
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Confiance",
    description: "La sécurité de nos utilisateurs est notre priorité absolue. Chaque membre est vérifié."
  },
  {
    icon: Handshake,
    title: "Communauté",
    description: "Nous créons des liens entre Sénégalais pour des voyages plus conviviaux."
  },
  {
    icon: Leaf,
    title: "Durabilité",
    description: "En partageant les trajets, nous réduisons notre impact environnemental."
  },
  {
    icon: Heart,
    title: "Accessibilité",
    description: "Des prix justes pour que chacun puisse voyager à travers le Sénégal."
  }
];

const stats = [
  { value: "5000+", label: "Utilisateurs actifs" },
  { value: "14", label: "Régions couvertes" },
  { value: "10000+", label: "Trajets effectués" },
  { value: "98%", label: "Satisfaction" }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Notre Histoire
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              À propos de <span className="text-gradient">Taagno</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Taagno, qui signifie &quot;ensemble&quot; en wolof, est né de la volonté de connecter 
              les Sénégalais et de rendre les déplacements plus accessibles, économiques et conviviaux.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
                <Target className="w-4 h-4 mr-2" />
                Notre Mission
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Révolutionner la mobilité au Sénégal
              </h2>
              <p className="text-muted-foreground mb-4">
                Notre mission est de créer une plateforme de confiance où chaque Sénégalais peut 
                voyager facilement et à moindre coût, tout en créant des liens avec sa communauté.
              </p>
              <p className="text-muted-foreground">
                Que vous soyez étudiant, professionnel ou famille, Taagno vous permet de trouver 
                le trajet idéal ou le véhicule parfait pour vos besoins.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              <Heart className="w-4 h-4 mr-2" />
              Nos Valeurs
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Ce qui nous guide</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nos valeurs sont au cœur de chaque décision que nous prenons
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <Badge className="mb-4 px-3 py-1 bg-primary/10 text-primary border-primary/20">
              Nos Services
            </Badge>
            <h2 className="text-3xl font-bold mb-4">Ce que nous offrons</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Covoiturage</h3>
                  <p className="text-muted-foreground">
                    Partagez vos trajets avec d&apos;autres voyageurs. Économisez sur vos frais 
                    de transport tout en faisant de nouvelles rencontres.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Car className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Location de véhicules</h3>
                  <p className="text-muted-foreground">
                    Louez directement auprès de particuliers. Des véhicules vérifiés 
                    à des prix compétitifs, disponibles partout au Sénégal.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Nous contacter</h3>
            <p className="text-muted-foreground mb-6">
              Une question ? Une suggestion ? Nous sommes à votre écoute.
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>📍 Dakar, Sénégal - Plateau, Rue Carnot</p>
              <p>📧 contact@taagno.sn</p>
              <p>📞 +221 77 123 45 67</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
