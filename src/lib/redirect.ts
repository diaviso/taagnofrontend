import { UserMode } from "@/types";

export interface IntendedAction {
  redirectUrl: string;
  action: "reserve_carpool" | "book_rental" | "create_trip" | "create_vehicle" | "create_rental_offer" | "view_reservations" | "view_bookings" | "manage_vehicles";
  mode: UserMode;
  timestamp: number;
}

const STORAGE_KEY = "taagno_intended_action";
const EXPIRY_TIME = 30 * 60 * 1000; // 30 minutes

export function saveIntendedAction(
  redirectUrl: string,
  action: IntendedAction["action"],
  mode: UserMode
): void {
  const intendedAction: IntendedAction = {
    redirectUrl,
    action,
    mode,
    timestamp: Date.now(),
  };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(intendedAction));
  }
}

export function getIntendedAction(): IntendedAction | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    const intendedAction: IntendedAction = JSON.parse(stored);
    
    // Check if expired
    if (Date.now() - intendedAction.timestamp > EXPIRY_TIME) {
      clearIntendedAction();
      return null;
    }

    return intendedAction;
  } catch {
    clearIntendedAction();
    return null;
  }
}

export function clearIntendedAction(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function redirectToLoginWithIntent(
  router: { push: (url: string) => void },
  currentUrl: string,
  action: IntendedAction["action"],
  mode: UserMode
): void {
  saveIntendedAction(currentUrl, action, mode);
  router.push("/login");
}
