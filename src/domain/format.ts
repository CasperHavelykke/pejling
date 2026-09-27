// Dansk talformat: decimalkomma, én decimal.
export function da(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(".", ",");
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

export function soberLine(minutes: number): string {
  if (minutes <= 0) return "Ingen aktiv alkohol i kroppen.";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `Ædru om ca. ${h ? `${h} t ` : ""}${m} min`;
}

export function genstandWord(count: number): string {
  return count === 1 ? "genstand" : "genstande";
}
