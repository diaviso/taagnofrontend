"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { CarDrivingScene } from "./CarAnimation";
import { PhoneAnimation, PersonWithPhone } from "./PhoneAnimation";
import { Search, UserPlus, Car, CheckCircle, MapPin, CreditCard } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Recherchez votre trajet",
    description: "Entrez votre ville de départ et d'arrivée, puis sélectionnez la date souhaitée.",
    icon: Search,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "Choisissez votre conducteur",
    description: "Comparez les offres, consultez les profils et les avis des conducteurs.",
    icon: UserPlus,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 3,
    title: "Réservez en un clic",
    description: "Confirmez votre réservation et payez en toute sécurité.",
    icon: CreditCard,
    color: "from-green-500 to-green-600",
  },
  {
    id: 4,
    title: "Voyagez ensemble",
    description: "Retrouvez votre conducteur au point de rendez-vous et profitez du trajet !",
    icon: Car,
    color: "from-amber-500 to-amber-600",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Comment ça marche ?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Voyagez en <span className="text-gradient">4 étapes simples</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Taagno rend le covoiturage simple et accessible à tous. 
            Suivez ces étapes pour commencer votre voyage.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                  activeStep === index
                    ? "bg-white dark:bg-card shadow-elevated scale-[1.02]"
                    : "bg-transparent hover:bg-white/50 dark:hover:bg-card/50"
                }`}
                onClick={() => setActiveStep(index)}
                onMouseEnter={() => setActiveStep(index)}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                  >
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-muted-foreground">
                        ÉTAPE {step.id}
                      </span>
                      {activeStep === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                
                {/* Progress line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-10 top-20 w-0.5 h-6 bg-border" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Animation display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8 min-h-[400px] flex items-center justify-center">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute bottom-4 left-4 w-32 h-32 bg-secondary/10 rounded-full blur-2xl" />
              
              {/* Step animations */}
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full"
              >
                {activeStep === 0 && <SearchAnimation />}
                {activeStep === 1 && <ChooseDriverAnimation />}
                {activeStep === 2 && <BookingAnimation />}
                {activeStep === 3 && <CarDrivingScene />}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SearchAnimation() {
  return (
    <div className="flex flex-col items-center">
      <PhoneAnimation className="w-32 mb-6" />
      <motion.div
        className="flex items-center gap-3 bg-white dark:bg-card rounded-full px-6 py-3 shadow-lg"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <MapPin className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium">Dakar → Thiès</span>
        <Search className="w-5 h-5 text-muted-foreground" />
      </motion.div>
      <motion.p
        className="mt-4 text-sm text-muted-foreground text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Trouvez des trajets disponibles instantanément
      </motion.p>
    </div>
  );
}

function ChooseDriverAnimation() {
  const drivers = [
    { name: "Mamadou", rating: 4.9, trips: 156, avatar: "M" },
    { name: "Fatou", rating: 4.8, trips: 89, avatar: "F" },
    { name: "Ibrahima", rating: 4.7, trips: 234, avatar: "I" },
  ];

  return (
    <div className="space-y-4">
      {drivers.map((driver, index) => (
        <motion.div
          key={driver.name}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 }}
          whileHover={{ scale: 1.02, x: 10 }}
          className="flex items-center gap-4 bg-white dark:bg-card rounded-xl p-4 shadow-soft cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
            {driver.avatar}
          </div>
          <div className="flex-1">
            <p className="font-semibold">{driver.name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-amber-500">★ {driver.rating}</span>
              <span>•</span>
              <span>{driver.trips} trajets</span>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: index * 0.3 }}
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <CheckCircle className="w-4 h-4 text-primary" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

function BookingAnimation() {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="bg-white dark:bg-card rounded-2xl p-6 shadow-elevated w-full max-w-xs"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
      >
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">Total à payer</p>
          <motion.p
            className="text-4xl font-bold text-primary"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            2 500 FCFA
          </motion.p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Trajet</span>
            <span>Dakar → Thiès</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span>15 Fév 2026</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Places</span>
            <span>1 place</span>
          </div>
        </div>
        
        <motion.button
          className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-semibold shadow-glow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          animate={{ 
            boxShadow: [
              "0 4px 30px -4px rgba(34, 197, 94, 0.25)",
              "0 4px 40px -4px rgba(34, 197, 94, 0.45)",
              "0 4px 30px -4px rgba(34, 197, 94, 0.25)",
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Confirmer la réservation
        </motion.button>
      </motion.div>
      
      <motion.div
        className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <CheckCircle className="w-4 h-4 text-green-500" />
        Paiement 100% sécurisé
      </motion.div>
    </div>
  );
}

export function AnimatedStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { value: 50000, suffix: "+", label: "Utilisateurs actifs" },
    { value: 25000, suffix: "+", label: "Trajets effectués" },
    { value: 98, suffix: "%", label: "Satisfaction client" },
    { value: 150, suffix: "+", label: "Villes couvertes" },
  ];

  return (
    <section ref={ref} className="py-16 bg-gradient-to-r from-primary to-primary/80">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center text-white"
            >
              <motion.p
                className="text-4xl md:text-5xl font-bold mb-2"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 1, delay: index * 0.2 }}
              >
                {isInView && (
                  <CountUp end={stat.value} suffix={stat.suffix} />
                )}
              </motion.p>
              <p className="text-white/80 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useState(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  });

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}
