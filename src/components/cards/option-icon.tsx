import {
  Armchair,
  Ban,
  Briefcase,
  Car,
  Cog,
  Infinity as InfinityIcon,
  Music,
  PawPrint,
  ShieldCheck,
  Snowflake,
  Truck,
  UserRound,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Icône de chaque option de trajet ou de location. */
export const OPTION_ICONS: Record<string, LucideIcon> = {
  INSTANT_BOOKING: Zap,
  AIR_CONDITIONING: Snowflake,
  LUGGAGE: Briefcase,
  NON_SMOKING: Ban,
  MUSIC: Music,
  PETS: PawPrint,
  WOMEN_ONLY: Users,
  WITH_DRIVER: UserRound,
  DELIVERY: Truck,
  UNLIMITED_MILEAGE: InfinityIcon,
  AUTOMATIC: Cog,
  INSURANCE_INCLUDED: ShieldCheck,
  SEATS: Armchair,
  CAR: Car,
};

export function OptionIcon({ option, className }: { option: string; className?: string }) {
  const Icon = OPTION_ICONS[option] ?? Car;
  return <Icon className={className} />;
}
