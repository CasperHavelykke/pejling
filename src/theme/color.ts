// Farveblanding i OKLCH. Svarer til CSS color-mix(in oklch, a, b p%),
// som React Native ikke har.

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function toLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function toGamma(c: number): number {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function rgbToOklch([r, g, b]: Rgb): [number, number, number] {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.sqrt(A * A + B * B);
  const H = (Math.atan2(B, A) * 180) / Math.PI;
  return [L, C, H < 0 ? H + 360 : H];
}

function oklchToRgb([L, C, H]: [number, number, number]): Rgb {
  const hr = (H * Math.PI) / 180;
  const A = C * Math.cos(hr);
  const B = C * Math.sin(hr);
  const l = Math.pow(L + 0.3963377774 * A + 0.2158037573 * B, 3);
  const m = Math.pow(L - 0.1055613458 * A - 0.0638541728 * B, 3);
  const s = Math.pow(L - 0.0894841775 * A - 1.291485548 * B, 3);
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [toGamma(r), toGamma(g), toGamma(b)];
}

function channel(c: number): number {
  return Math.round(Math.min(1, Math.max(0, c)) * 255);
}

// Blander hex-farven a med andelen p (0..1) af hex-farven b.
// Farvetonen følger den korteste vej rundt på farvehjulet.
export function mixOklch(a: string, b: string, p: number): string {
  const t = Math.min(1, Math.max(0, p));
  const [l1, c1, h1] = rgbToOklch(hexToRgb(a));
  const [l2, c2, h2] = rgbToOklch(hexToRgb(b));
  let dh = h2 - h1;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const rgb = oklchToRgb([
    l1 + (l2 - l1) * t,
    c1 + (c2 - c1) * t,
    (h1 + dh * t + 360) % 360,
  ]);
  return `rgb(${channel(rgb[0])}, ${channel(rgb[1])}, ${channel(rgb[2])})`;
}

// Punktet mellem to farver skrevet som "rgb(r, g, b)", regnet kanal for
// kanal. Det er sådan, en animeret farve bevæger sig, så funktionen kan
// fortælle, hvilken farve en overgang står på lige nu.
export function lerpRgb(a: string, b: string, p: number): string {
  const t = Math.min(1, Math.max(0, p));
  const from = a.match(/\d+/g)?.map(Number) ?? [];
  const to = b.match(/\d+/g)?.map(Number) ?? [];
  if (from.length < 3 || to.length < 3) return b;
  const mix = (i: number) => Math.round(from[i] + (to[i] - from[i]) * t);
  return `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`;
}
