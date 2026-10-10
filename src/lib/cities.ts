import { fold } from "./utils";

/** Villes et localités du Sénégal proposées dans les champs « Départ » / « Arrivée ».
 * La saisie reste libre : une ville absente de la liste est acceptée. */
export const SENEGAL_CITIES = [
  "Dakar", "Thiès", "Saint-Louis", "Touba", "Mbour", "Kaolack", "Ziguinchor", "Rufisque",
  "Diourbel", "Louga", "Tambacounda", "Kolda", "Fatick", "Kaffrine", "Kédougou", "Matam",
  "Sédhiou", "Mbacké", "Tivaouane", "Richard-Toll", "Saly", "Somone", "Joal-Fadiouth", "Pikine",
  "Guédiawaye", "Keur Massar", "Diamniadio", "AIBD (aéroport)", "Bargny", "Sébikotane", "Pout",
  "Khombole", "Mékhé", "Kébémer", "Linguère", "Dahra", "Podor", "Dagana", "Ourossogui", "Bakel",
  "Vélingara", "Bignona", "Cap Skirring", "Oussouye", "Nioro du Rip", "Guinguinéo", "Gossas",
  "Foundiougne", "Sokone", "Toubab Dialaw", "Popenguine", "Lac Rose",
];

/**
 * Nom officiel d'une ville saisie librement : « thies » → « Thiès », « saint louis » →
 * « Saint-Louis ». La recherche du serveur ne tient pas compte des accents : sans cela,
 * « Thies » ne trouverait pas les trajets de « Thiès ». Une ville inconnue reste telle quelle.
 */
export function canonicalCity(input: string) {
  const key = (s: string) => fold(s).replace(/[-'’\s]+/g, " ").trim();
  const k = key(input);
  if (!k) return input.trim();
  return SENEGAL_CITIES.find((c) => key(c) === k) ?? input.trim();
}

/** Villes correspondant à `query` (début de mot d'abord), au plus `limit`. */
export function matchCities(query: string, limit = 6) {
  const q = fold(query);
  if (!q) return SENEGAL_CITIES.slice(0, limit);
  const starts = SENEGAL_CITIES.filter((c) => fold(c).startsWith(q));
  const contains = SENEGAL_CITIES.filter((c) => !fold(c).startsWith(q) && fold(c).includes(q));
  return [...starts, ...contains].slice(0, limit);
}

/** Trajets populaires mis en avant sur l'accueil. */
export const POPULAR_ROUTES: [string, string][] = [
  ["Dakar", "Touba"],
  ["Dakar", "Saint-Louis"],
  ["Dakar", "Thiès"],
  ["Dakar", "Mbour"],
  ["Thiès", "Kaolack"],
  ["Dakar", "Ziguinchor"],
];
