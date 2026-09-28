// Dansk talformat: decimalkomma, én decimal.
export function da(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(".", ",");
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

// Klokkeslæt som "23.41". Bygges i hånden, fordi understøttelsen af
// da-DK i Intl varierer mellem platforme.
export function hhmm(t: number): string {
  const d = new Date(t);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}.${m}`;
}

// Linjen taler om tallet på skærmen og ikke om personen. Ordet "ædru"
// undgås bevidst: det kan læses som et løfte om at være klar til at køre.
// Ved nul er linjen tom, for statuslinjen siger allerede det samme.
export function soberLine(minutes: number): string {
  if (minutes <= 0) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `Nul aktive genstande om ca. ${h ? `${h} t ` : ""}${m} min`;
}

// En indtastning er ét tryk på en knap. Den kan fylde mere eller mindre
// end én genstand, så de to ord må ikke blandes sammen.
export function entryWord(count: number): string {
  return count === 1 ? "indtastning" : "indtastninger";
}

export function genstandWord(count: number): string {
  return count === 1 ? "genstand" : "genstande";
}
