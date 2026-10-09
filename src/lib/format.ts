/** Formatage en français (franc CFA, dates), aligné sur les applications mobiles. */

const NB = " ";

function group(value: number) {
  const negative = value < 0;
  const digits = Math.round(Math.abs(value)).toString();
  let out = "";
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) out += NB;
    out += digits[i];
  }
  return `${negative ? "-" : ""}${out}`;
}

/** 12 450 FCFA */
export const fcfa = (value: number) => `${group(value)}${NB}FCFA`;

/** 12 450 (sans devise) */
export const number = (value: number) => group(value);

/** 1,2 M FCFA · 85 k FCFA */
export function fcfaCompact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    const m = value / 1_000_000;
    return `${(m >= 100 ? m.toFixed(0) : m.toFixed(1)).replace(".", ",").replace(",0", "")}${NB}M${NB}FCFA`;
  }
  if (abs >= 1000) return `${Math.round(value / 1000)}${NB}k${NB}FCFA`;
  return fcfa(value);
}

export const plural = (n: number, singular: string, pluralForm?: string) =>
  `${n} ${n > 1 ? (pluralForm ?? `${singular}s`) : singular}`;

const dtf = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("fr-FR", opts);
const F_TIME = dtf({ hour: "2-digit", minute: "2-digit" });
const F_DAY = dtf({ weekday: "short", day: "numeric", month: "short" });
const F_DATE = dtf({ day: "numeric", month: "short", year: "numeric" });
const F_DATE_SHORT = dtf({ day: "numeric", month: "short" });
const F_LONG = dtf({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
const F_DAY_MONTH = dtf({ day: "numeric", month: "long" });
const F_MONTH = dtf({ month: "short" });
const F_MONTH_YEAR = dtf({ month: "long", year: "numeric" });

export const toDate = (d: Date | string) => (typeof d === "string" ? new Date(d) : d);

/** Jour d'une date de location (`@db.Date`, minuit UTC) → minuit local du même jour. */
export function parseDay(iso: string) {
  const d = new Date(iso);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** `AAAA-MM-JJ` attendu par l'API pour les jours. */
export function apiDay(d: Date) {
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Jour local à minuit (comparaisons de dates). */
export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysUntil(date: Date | string) {
  const today = startOfDay(new Date());
  const target = startOfDay(toDate(date));
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Nombre de jours facturés entre deux dates (fin exclusive), au moins 1. */
export function rentalDays(start: Date, end: Date) {
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const b = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(1, Math.round((b - a) / 86_400_000));
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const time = (d: Date | string) => F_TIME.format(toDate(d));

/** « Aujourd’hui », « Demain », « Hier » ou « sam. 12 oct. » */
export function day(d: Date | string) {
  const n = daysUntil(d);
  if (n === 0) return "Aujourd’hui";
  if (n === 1) return "Demain";
  if (n === -1) return "Hier";
  return cap(F_DAY.format(toDate(d)));
}

/** « Demain à 08:30 » */
export const dayTime = (d: Date | string) => `${day(d)} à ${time(d)}`;

export const date = (d?: Date | string | null) => (d ? F_DATE.format(toDate(d)) : "—");
export const dateShort = (d?: Date | string | null) => (d ? F_DATE_SHORT.format(toDate(d)) : "—");
export const longDate = (d: Date | string) => cap(F_LONG.format(toDate(d)));
export const monthShort = (d: Date) => cap(F_MONTH.format(d).replace(".", ""));
export const monthYear = (d: Date) => cap(F_MONTH_YEAR.format(d));

/** « 1er novembre », « 5 novembre » */
export function dayMonth(d: Date | string) {
  const x = toDate(d);
  const s = F_DAY_MONTH.format(x);
  return x.getDate() === 1 ? s.replace(/^1 /, "1er ") : s;
}

/** « Du 12 au 15 oct. » / « Du 28 sept. au 2 oct. » */
export function range(start: Date, end: Date) {
  if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
    return `Du ${start.getDate()} au ${F_DATE_SHORT.format(end)}`;
  }
  return `Du ${F_DATE_SHORT.format(start)} au ${F_DATE_SHORT.format(end)}`;
}

/** « à l’instant », « il y a 5 min », « hier », « 12 sept. » */
export function relative(d: Date | string) {
  const diff = Date.now() - toDate(d).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l’instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} j`;
  return dateShort(d);
}

/** « dans 3 h », « dans 2 j » : délai avant un départ. */
export function countdown(d: Date | string) {
  const diff = toDate(d).getTime() - Date.now();
  if (diff < 0) return "Départ passé";
  const min = Math.floor(diff / 60_000);
  if (min < 60) return `dans ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `dans ${h} h`;
  return `dans ${Math.floor(h / 24)} j`;
}

/** Note moyenne affichée « 4,8 ». */
export const rating = (value: number) => value.toFixed(1).replace(".", ",");

/** « membre depuis mars 2025 » */
export const memberSince = (d?: string | null) => (d ? `Membre depuis ${F_MONTH_YEAR.format(new Date(d))}` : "");
