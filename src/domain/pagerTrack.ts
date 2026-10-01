// Hvordan skærmen følger fingeren, når knappanelerne swipes.
//
// Panelerne er ikke lige høje. Fulgte feltets højde fingeren jævnt hele
// vejen, ville toppen af det høje panel være skjult under det meste af
// swipet. Derfor når feltet den fulde højde tidligt: i den første del af
// bevægelsen ind mod et højere panel, og først i den sidste del på vej væk
// fra det. Alt andet på skærmen, der skifter mellem panelerne, følger samme
// kurve, så det hele flytter sig samlet.

// Så stor en del af et swipe går der, før feltet har det høje panels højde.
export const EARLY = 0.3;

export type Track = {
  // Vandrette positioner i punkter, stigende.
  input: number[];
  // Hvilket panels værdi der gælder ved hver position.
  pages: number[];
};

export function buildTrack(
  heights: readonly (number | null)[],
  width: number,
): Track {
  const input: number[] = [];
  const pages: number[] = [];
  heights.forEach((height, i) => {
    input.push(i * width);
    pages.push(i);
    if (i === heights.length - 1) return;
    const next = heights[i + 1];
    if (height === null || next === null) return;
    if (next > height + 0.5) {
      // Næste panel er højere: nå dets højde tidligt.
      input.push((i + EARLY) * width);
      pages.push(i + 1);
    } else if (height > next + 0.5) {
      // Dette panel er højere: hold dets højde, til det næsten er ude.
      input.push((i + 1 - EARLY) * width);
      pages.push(i);
    }
  });
  return { input, pages };
}

// Værdien pr. panel lagt ud på sporets positioner.
export function alongTrack<T>(track: Track, values: readonly T[]): T[] {
  return track.pages.map((page) => values[page]);
}
