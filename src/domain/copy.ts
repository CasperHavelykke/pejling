// Tekster pr. niveau (0-5). Status-linjen er informativ; uglen håner.

import { da } from "./format";
import { burnUnitsPerHour, levelThresholds, type Body } from "./widmark";

export const STATUS: readonly string[] = [
  "Ingen aktive genstande",
  "Let påvirket – reaktionstiden er allerede lidt længere",
  "Påvirket – hæmningerne falder, og det gør dømmekraften også",
  "Tydeligt fuld – balance og koordination svigter herfra",
  "Meget fuld – hold pause og drik vand, kroppen er bagud",
  "Tag hjem – dømmekraften er reelt sat ud herfra",
];

export const ROASTS: readonly (readonly string[])[] = [
  // Ved nul må uglen aldrig håne den, der ikke drikker, eller lægge op
  // til at gå i gang. Brodden vender mod de andre i baren.
  [
    "Du er den eneste her, der kan huske aftenen i morgen.",
    "Nul genstande. Jeg dømmer de andre imens.",
    "Chaufføren er aftenens eneste voksne.",
  ],
  [
    "Én genstand, og du føler dig allerede sjov. Det er du ikke.",
    "Du har lige sagt “skål” tre gange til den samme øl.",
    "Du er stadig ædru nok til at høre, hvor kedelig du selv er.",
  ],
  [
    "Du griner af dine egne jokes nu. Ingen andre gør.",
    "Du er begyndt at kalde bartenderen “min ven”. Han hedder noget andet.",
    "Din “dansefod” er bare en fod, du ikke helt styrer.",
    "Du taler højere. Indholdet blev ikke bedre af det.",
  ],
  [
    "Du har fortalt den historie to gange. Den var heller ikke god første gang.",
    "Du har lige inviteret hele baren til brunch. Du kender ingen af dem.",
    "Du synes, du synger med. Det, du gør, er noget andet.",
    "Du siger “jeg er slet ikke fuld” med et sprogcenter, der er lukket for i aften.",
  ],
  [
    "Du danser. Ingen har bedt om det.",
    "Du har krammet en fremmed og kaldt ham “bror”. Han flyttede sig.",
    "Din telefon har 14 selfies med lukkede øjne. De er alle sammen dig.",
    "Du prøver at åbne toiletdøren med dit betalingskort.",
  ],
  [
    "Du skriver til din eks nu, ikke? Læg telefonen. Læg den.",
    "Du har lige tabt en diskussion med en lygtepæl.",
    "I morgen sender du “undskyld for i går” til tre personer. Du husker ikke hvorfor.",
    "Du prøver at bestille kebab i en bar. Det er ikke det, der er problemet.",
  ],
];

// Teksten skifter ved hvert tryk, fordi antallet indgår i valget.
export function roastFor(level: number, drinkCount: number): string {
  const list = ROASTS[Math.min(level, ROASTS.length - 1)];
  return list[(drinkCount + level) % list.length];
}

// Navne på niveau 1-5.
export const LEVEL_NAMES: readonly string[] = [
  "Let påvirket",
  "Påvirket",
  "Tydeligt fuld",
  "Meget fuld",
  "Tag hjem",
];

// Tabellen i info-arket. Grænserne vises som aktive genstande for brugerens
// egen vægt og køn. Appen viser aldrig promille.
export function levelRows(body: Body): (readonly [string, string])[] {
  const t = levelThresholds(body).map((n) => da(n));
  return LEVEL_NAMES.map((name, i) => {
    if (i === 0) return [`Op til ${t[0]}`, name] as const;
    if (i === LEVEL_NAMES.length - 1) return [`Over ${t[i - 1]}`, name] as const;
    return [`${t[i - 1]}–${t[i]}`, name] as const;
  });
}

export function infoExplanation(body: Body): string {
  return `Tallet er et estimat af, hvor mange genstande der stadig er aktive i kroppen. Én genstand er 12 g alkohol. Med din vægt og dit køn forbrænder du ca. ${da(burnUnitsPerHour(body))} genstande i timen.`;
}

// Indholdet af det, man drikker, er en fejlkilde for sig, ved siden af
// kroppens forbrænding.
export const INFO_DRINKS =
  "Knapperne regner med typiske størrelser og styrker. En stærk øl, en stor fadøl eller en drink med ekstra sprut indeholder mere, end knappen tæller. Brug Avanceret, hvis du vil ramme tættere.";

export const INFO_DISCLAIMER =
  "Pejling er vejledende og kan ikke bruges til at vurdere, om du må køre. Nul aktive genstande betyder ikke, at du er klar til at køre. Forbrændingen varierer fra person til person.";

export const INFO_STORAGE =
  "Alt gemmes kun på denne telefon, og intet sendes nogen steder. Sletter du appen, slettes dine indtastninger og indstillinger også og kan ikke hentes tilbage.";
