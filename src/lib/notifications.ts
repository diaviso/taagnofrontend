import { toast } from "sonner";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationOptions {
  title: string;
  description?: string;
  type?: NotificationType;
  playSound?: boolean;
  duration?: number;
}

const NOTIFICATION_SOUNDS = {
  success: "/sounds/success.mp3",
  error: "/sounds/error.mp3",
  info: "/sounds/info.mp3",
  warning: "/sounds/warning.mp3",
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported");
      return null;
    }
  }
  return audioContext;
}

async function playNotificationSound(type: NotificationType): Promise<void> {
  if (typeof window === "undefined") return;

  const soundEnabled = localStorage.getItem("taagno_sound_enabled") !== "false";
  if (!soundEnabled) return;

  try {
    const audio = new Audio(NOTIFICATION_SOUNDS[type]);
    audio.volume = 0.5;
    await audio.play();
  } catch (error) {
    // Fallback: use Web Audio API beep
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different frequencies for different notification types
      const frequencies: Record<NotificationType, number> = {
        success: 800,
        error: 300,
        info: 600,
        warning: 500,
      };

      oscillator.frequency.value = frequencies[type];
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Silently fail if audio doesn't work
    }
  }
}

export function notify(options: NotificationOptions): void {
  const { title, description, type = "info", playSound = true, duration = 4000 } = options;

  if (playSound) {
    playNotificationSound(type);
  }

  const toastOptions = {
    description,
    duration,
  };

  switch (type) {
    case "success":
      toast.success(title, toastOptions);
      break;
    case "error":
      toast.error(title, toastOptions);
      break;
    case "warning":
      toast.warning(title, toastOptions);
      break;
    case "info":
    default:
      toast.info(title, toastOptions);
      break;
  }
}

// Predefined notifications for common actions
export const notifications = {
  // Authentication
  loginSuccess: () => notify({
    title: "Connexion réussie",
    description: "Bienvenue sur Taagno !",
    type: "success",
  }),
  
  logoutSuccess: () => notify({
    title: "Déconnexion",
    description: "À bientôt !",
    type: "info",
  }),

  // Mode changes
  modeChanged: (mode: "voyageur" | "proprietaire") => notify({
    title: "Mode changé",
    description: mode === "voyageur" 
      ? "Vous êtes maintenant en mode Voyageur" 
      : "Vous êtes maintenant en mode Propriétaire",
    type: "success",
  }),

  // Vehicles
  vehicleCreated: () => notify({
    title: "Véhicule ajouté",
    description: "Votre véhicule est en attente de validation",
    type: "success",
  }),

  vehicleApproved: () => notify({
    title: "Véhicule approuvé",
    description: "Votre véhicule a été validé par l'administration",
    type: "success",
  }),

  vehicleRejected: () => notify({
    title: "Véhicule refusé",
    description: "Votre véhicule n'a pas été validé",
    type: "error",
  }),

  // Carpool trips
  tripCreated: () => notify({
    title: "Trajet créé",
    description: "Votre trajet est maintenant visible",
    type: "success",
  }),

  tripCancelled: () => notify({
    title: "Trajet annulé",
    description: "Votre trajet a été annulé",
    type: "warning",
  }),

  tripCompleted: () => notify({
    title: "Trajet terminé",
    description: "Votre trajet est maintenant terminé",
    type: "success",
  }),

  // Carpool reservations
  reservationCreated: () => notify({
    title: "Réservation envoyée",
    description: "En attente de confirmation du conducteur",
    type: "success",
  }),

  reservationAccepted: () => notify({
    title: "Réservation confirmée",
    description: "Votre place est réservée !",
    type: "success",
  }),

  reservationRejected: () => notify({
    title: "Réservation refusée",
    description: "Le conducteur a refusé votre demande",
    type: "error",
  }),

  reservationCancelled: () => notify({
    title: "Réservation annulée",
    description: "Votre réservation a été annulée",
    type: "warning",
  }),

  // New reservation received (for driver)
  newReservationReceived: (passengerName: string) => notify({
    title: "Nouvelle réservation",
    description: `${passengerName} souhaite réserver une place`,
    type: "info",
  }),

  // Rental offers
  offerCreated: () => notify({
    title: "Offre de location créée",
    description: "Votre offre est maintenant visible",
    type: "success",
  }),

  offerUpdated: () => notify({
    title: "Offre mise à jour",
    description: "Les modifications ont été enregistrées",
    type: "success",
  }),

  // Rental bookings
  bookingCreated: () => notify({
    title: "Demande de location envoyée",
    description: "En attente de confirmation du propriétaire",
    type: "success",
  }),

  bookingAccepted: () => notify({
    title: "Location confirmée",
    description: "Votre réservation est confirmée !",
    type: "success",
  }),

  bookingRejected: () => notify({
    title: "Location refusée",
    description: "Le propriétaire a refusé votre demande",
    type: "error",
  }),

  bookingCancelled: () => notify({
    title: "Location annulée",
    description: "Votre réservation a été annulée",
    type: "warning",
  }),

  bookingCompleted: () => notify({
    title: "Location terminée",
    description: "Merci d'avoir utilisé Taagno !",
    type: "success",
  }),

  // New booking received (for owner)
  newBookingReceived: (renterName: string) => notify({
    title: "Nouvelle demande de location",
    description: `${renterName} souhaite louer votre véhicule`,
    type: "info",
  }),

  // Generic errors
  genericError: (message?: string) => notify({
    title: "Erreur",
    description: message || "Une erreur est survenue",
    type: "error",
  }),

  // Network errors
  networkError: () => notify({
    title: "Erreur de connexion",
    description: "Vérifiez votre connexion internet",
    type: "error",
  }),
};

// Sound settings
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("taagno_sound_enabled", enabled ? "true" : "false");
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("taagno_sound_enabled") !== "false";
}
