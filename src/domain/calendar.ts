// Kalenderhjælpere. Ugen starter mandag. Navne på måneder og ugedage ligger
// pr. sprog i src/i18n og skrives i hånden, fordi understøttelsen af da-DK
// i Intl varierer mellem platforme.

import { strings } from "../i18n";

export function weekdaysShort(): readonly string[] {
  return strings().weekdaysShort;
}

export type YearMonth = { year: number; month: number };

export function dayKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// Månedens uger. Hver uge har syv pladser; null er en tom plads før den
// første eller efter den sidste dag.
export function monthGrid(year: number, month: number): (number | null)[][] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay: søndag = 0. Flyttes, så mandag = 0.
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function compareMonths(a: YearMonth, b: YearMonth): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

export function monthTitle({ year, month }: YearMonth): string {
  return `${strings().months[month]} ${year}`;
}

// "lørdag 26. september"
export function longDate(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const s = strings();
  return s.longDate(s.weekdaysLong[date.getDay()], d, s.months[m - 1]);
}
