import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Supprime accents et casse pour comparer des noms (villes, recherches). */
export function fold(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Attend `ms` millisecondes (animations, anti-rebond). */
export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
