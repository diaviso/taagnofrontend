/** Numéros de téléphone sénégalais (+221, 9 chiffres) — mêmes règles que les apps. */

export const PHONE_PREFIX = "+221";

/** Les 9 chiffres nationaux saisis (« 77 123 45 67 » → « 771234567 »). */
export function phoneDigits(input: string) {
  let d = input.replace(/[^0-9]/g, "");
  if (d.startsWith("00221")) d = d.slice(5);
  if (d.startsWith("221") && d.length === 12) d = d.slice(3);
  if (d.startsWith("0") && d.length === 10) d = d.slice(1);
  return d;
}

/** Numéro national valide : 9 chiffres, mobile (7x) ou fixe (33). */
export function isValidPhone(input: string) {
  const d = phoneDigits(input);
  return d.length === 9 && /^(7[05678]|3[03])/.test(d);
}

/** Format international envoyé à l'API : « +221771234567 ». */
export function phoneE164(input: string) {
  return `${PHONE_PREFIX}${phoneDigits(input)}`;
}

/** Affichage « 77 123 45 67 » (espaces insécables), avec l'indicatif si demandé. */
export function prettyPhone(input?: string | null, withPrefix = false) {
  if (!input) return "";
  const d = phoneDigits(input);
  if (d.length !== 9) return input;
  const nb = " ";
  const s = `${d.slice(0, 2)}${nb}${d.slice(2, 5)}${nb}${d.slice(5, 7)}${nb}${d.slice(7)}`;
  return withPrefix ? `${PHONE_PREFIX}${nb}${s}` : s;
}

/** Saisie progressive : « 771234 » → « 77 123 4 ». */
export function formatPhoneInput(input: string) {
  const d = phoneDigits(input).slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return parts.join(" ");
}

/** Lien WhatsApp vers un numéro sénégalais. */
export function whatsappLink(phone: string, text?: string) {
  const d = phoneDigits(phone);
  const q = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/221${d}${q}`;
}

/** Codes PIN refusés par le serveur (chiffres identiques, suites, codes courants, années). */
export function isWeakPin(pin: string) {
  if (/^(\d)\1{3}$/.test(pin)) return true;
  if ("0123456789".includes(pin) || "9876543210".includes(pin)) return true;
  return COMMON_PINS.has(pin);
}

const COMMON_PINS = new Set([
  "1212", "7777", "1004", "2000", "4444", "2222", "6969", "9999", "3333",
  "5555", "6666", "1122", "1313", "8888", "2001", "1010", "2020", "1234",
  "2580", "0852", "1379", "9731", "3197", "7913", "1470", "0741", "3690",
  "2468", "1357", "1259", "9518",
  "2121", "2323", "3232", "1221", "2112", "0110", "1001",
  "1980", "1985", "1990", "1991", "1992", "1993", "1994", "1995", "1996",
  "1997", "1998", "1999", "2010", "2011", "2012", "2015", "2018", "2019",
  "2021", "2022", "2023", "2024", "2025",
]);
