"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Car,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Send,
  ArrowRight,
  Navigation,
  Fuel,
  Route,
  Users,
  Shield,
  Clock,
  Heart,
  Sparkles,
  Linkedin,
  Youtube,
  ChevronRight,
  Globe,
  Award,
  Headphones,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Merci ! Vous êtes inscrit à notre newsletter.");
      setEmail("");
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-background via-muted/20 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Moving road with dashed lines */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="h-16 bg-gradient-to-t from-slate-800 to-transparent" />
          <div className="h-3 bg-slate-700 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center">
              <div className="animate-road-scroll flex gap-8 whitespace-nowrap">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="w-16 h-1 bg-amber-400 rounded-full flex-shrink-0" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Animated vehicles on the road */}
        <div className="absolute bottom-6 animate-car-drive-1">
          <div className="relative transform -scale-x-100">
            <div className="w-10 h-6 bg-primary/60 rounded-t-lg rounded-b-sm relative">
              <div className="absolute bottom-0 left-1 w-2 h-2 bg-slate-800 rounded-full animate-wheel" />
              <div className="absolute bottom-0 right-1 w-2 h-2 bg-slate-800 rounded-full animate-wheel" />
              <div className="absolute top-1 left-1 w-2 h-1.5 bg-cyan-300/50 rounded-sm" />
              <div className="absolute -left-1 top-2 w-1 h-0.5 bg-amber-400 rounded animate-blink" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 animate-car-drive-2">
          <div className="relative">
            <div className="w-8 h-5 bg-amber-500/60 rounded-t-lg rounded-b-sm relative">
              <div className="absolute bottom-0 left-0.5 w-1.5 h-1.5 bg-slate-800 rounded-full animate-wheel" />
              <div className="absolute bottom-0 right-0.5 w-1.5 h-1.5 bg-slate-800 rounded-full animate-wheel" />
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1 bg-cyan-300/50 rounded-sm" />
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 animate-car-drive-3">
          <div className="relative transform -scale-x-100">
            <div className="w-12 h-7 bg-green-500/50 rounded-t-xl rounded-b-sm relative">
              <div className="absolute bottom-0 left-1.5 w-2.5 h-2.5 bg-slate-800 rounded-full animate-wheel" />
              <div className="absolute bottom-0 right-1.5 w-2.5 h-2.5 bg-slate-800 rounded-full animate-wheel" />
              <div className="absolute top-1 left-1 w-3 h-2 bg-cyan-300/40 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Floating transport icons */}
        <div className="absolute top-24 left-[8%] animate-float-slow opacity-5">
          <Car className="h-16 w-16 text-primary" />
        </div>
        <div className="absolute top-40 right-[12%] animate-float-medium opacity-5">
          <Navigation className="h-12 w-12 text-amber-500" />
        </div>
        <div className="absolute top-32 left-[25%] animate-float-fast opacity-5">
          <MapPin className="h-10 w-10 text-green-500" />
        </div>
        <div className="absolute top-20 right-[30%] animate-float-slow opacity-5">
          <Route className="h-14 w-14 text-purple-500" />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Decorative wave top */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-24 text-background" preserveAspectRatio="none">
          <path d="M0 120V60C180 90 360 30 540 45C720 60 900 100 1080 80C1260 60 1350 30 1440 45V120H0Z" fill="currentColor"/>
          <path d="M0 120V80C240 100 480 50 720 70C960 90 1200 50 1440 70V120H0Z" fill="currentColor" fillOpacity="0.5"/>
        </svg>
      </div>

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-amber-500 to-red-500" />

      <div className="container relative z-10 pt-32 pb-24">
        {/* Newsletter Section */}
        <div className="relative mb-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-amber-500/10 to-primary/20 rounded-3xl blur-xl" />
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 backdrop-blur-xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-4">
                  <Sparkles className="h-4 w-4" />
                  Rejoignez la communauté
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Restez connecté !
                </h3>
                <p className="text-slate-300 max-w-md">
                  Recevez les meilleures offres de covoiturage et de location en avant-première
                </p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-lg gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="Entrez votre email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 rounded-xl shadow-lg shadow-primary/25 gap-2">
                  <Send className="h-5 w-5" />
                  <span className="hidden sm:inline">S'inscrire</span>
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-green-600 shadow-xl shadow-primary/30 group-hover:shadow-primary/50 transition-all group-hover:scale-105">
                  <Car className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-500 border-3 border-slate-900 flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-white">
                  Taagno
                </span>
                <p className="text-sm text-slate-400">Voyagez ensemble</p>
              </div>
            </Link>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-sm">
              La plateforme de référence pour le covoiturage et la location de véhicules entre particuliers au Sénégal.
              Économisez, voyagez, partagez !
            </p>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                <Shield className="h-6 w-6 text-green-400 mb-1" />
                <span className="text-xs text-slate-400 text-center">100% Sécurisé</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                <Headphones className="h-6 w-6 text-blue-400 mb-1" />
                <span className="text-xs text-slate-400 text-center">Support 24/7</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10">
                <Award className="h-6 w-6 text-amber-400 mb-1" />
                <span className="text-xs text-slate-400 text-center">N°1 au Sénégal</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook", color: "hover:bg-blue-600" },
                { icon: Instagram, href: "#", label: "Instagram", color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500" },
                { icon: Twitter, href: "#", label: "Twitter", color: "hover:bg-sky-500" },
                { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:bg-blue-700" },
                { icon: Youtube, href: "#", label: "YouTube", color: "hover:bg-red-600" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-slate-400 transition-all duration-300 hover:text-white hover:scale-110 ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-6 text-white flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Services
            </h3>
            <ul className="space-y-4">
              {[
                { href: "/carpool", label: "Covoiturage", icon: Navigation },
                { href: "/rental", label: "Location", icon: Car },
                { href: "/vehicles/create", label: "Ajouter véhicule", icon: Users },
                { href: "/dashboard", label: "Mon espace", icon: Shield },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-3 group"
                  >
                    <link.icon className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                    <span className="relative">
                      {link.label}
                      <span className="absolute left-0 -bottom-1 w-0 group-hover:w-full h-0.5 bg-primary transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold mb-6 text-white flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              Légal
            </h3>
            <ul className="space-y-4">
              {[
                { href: "/terms", label: "CGU" },
                { href: "/privacy", label: "Confidentialité" },
                { href: "/faq", label: "FAQ" },
                { href: "/about", label: "À propos" },
                { href: "/aide", label: "Centre d'aide" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                  >
                    <ChevronRight className="h-4 w-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold mb-6 text-white flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="group">
                <a href="#" className="flex items-start gap-3 text-slate-400 hover:text-white transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Dakar, Sénégal</p>
                    <p className="text-sm">Plateau, Rue Carnot</p>
                  </div>
                </a>
              </li>
              <li className="group">
                <a href="tel:+221771234567" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                    <Phone className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">+221 77 123 45 67</p>
                    <p className="text-sm">Lun-Sam: 8h-20h</p>
                  </div>
                </a>
              </li>
              <li className="group">
                <a href="mailto:contact@taagno.sn" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/30 transition-colors">
                    <Mail className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-white">contact@taagno.sn</p>
                    <p className="text-sm">Réponse sous 24h</p>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-white mb-1">5K+</p>
            <p className="text-sm text-slate-400">Utilisateurs actifs</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-primary mb-1">1K+</p>
            <p className="text-sm text-slate-400">Trajets réalisés</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-amber-500 mb-1">500+</p>
            <p className="text-sm text-slate-400">Véhicules</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-green-500 mb-1">98%</p>
            <p className="text-sm text-slate-400">Satisfaction</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                &copy; {new Date().getFullYear()} Taagno. Fait avec
                <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
                au Sénégal 🇸🇳
              </p>
              <span className="hidden md:inline">|</span>
              <div className="flex items-center gap-4">
                <Link href="/terms" className="hover:text-white transition-colors">CGU</Link>
                <Link href="/privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Online status */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm text-green-400 font-medium">En ligne 24h/24</span>
              </div>

              {/* Payment methods */}
              <div className="hidden md:flex items-center gap-2 text-slate-500">
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">Paiement sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
