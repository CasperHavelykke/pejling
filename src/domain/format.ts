import { strings } from "../i18n";

// Tal med én decimal. Dansk bruger komma, engelsk punktum.
export function da(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(".", strings().decimal);
}

// Aktive genstande: én decimal, men hele tal vises uden ",0".
// 2,04 bliver "2", og 2,06 bliver "2,1".
export function daWhole(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : da(rounded);
}

export function unitsX10Label(x10: number): string {
  return da(x10 / 10);
}

// Klokkeslæt som "23.41", på engelsk "23:41". Bygges i hånden, fordi
// understøttelsen af da-DK i Intl varierer mellem platforme.
export function hhmm(t: number): string {
  const d = new Date(t);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}${strings().timeSeparator}${m}`;
}

// Ved nul er linjen tom, for tallet siger allerede det samme.
export function soberLine(minutes: number): string {
  if (minutes <= 0) return "";
  return strings().zeroLine(Math.floor(minutes / 60), minutes % 60);
}

// Når tallet er nul, men listen stadig står der, fortæller linjen i
// stedet, hvornår listen ryddes.
export function clearLine(minutes: number): string {
  return strings().clearLine(Math.floor(minutes / 60), minutes % 60);
}

export function entryWord(count: number): string {
  return strings().entryWord(count);
}

export function genstandWord(count: number): string {
  return strings().unitWord(count);
}
