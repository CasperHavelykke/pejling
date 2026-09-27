// Tekster pr. niveau (0-5). Status-linjen er informativ; uglen håner.

export const STATUS: readonly string[] = [
  "Ædru – ingen alkohol i kroppen",
  "Let påvirket – reaktionstiden er allerede lidt længere",
  "Påvirket – hæmningerne falder, og det gør dømmekraften også",
  "Tydeligt fuld – balance og koordination svigter herfra",
  "Meget fuld – hold pause og drik vand, kroppen er bagud",
  "Tag hjem – dømmekraften er reelt sat ud herfra",
];

export const ROASTS: readonly (readonly string[])[] = [
  [
    "Ædru på en bytur? Modigt valg. Eller bare kedeligt.",
    "Nul genstande. Du er designated driver, eller også har du ingen venner her.",
    "Du står med en danskvand og siger “jeg skal tidligt op”. Alle ved, du lyver.",
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

export const LEVEL_TABLE: readonly (readonly [string, string])[] = [
  ["0–0,4 ‰", "Let påvirket"],
  ["0,4–0,8 ‰", "Påvirket"],
  ["0,8–1,2 ‰", "Tydeligt fuld"],
  ["1,2–1,8 ‰", "Meget fuld"],
  ["> 1,8 ‰", "Tag hjem"],
];

export const INFO_EXPLANATION =
  "Tallet er et estimat af, hvor mange genstande der stadig er aktive i kroppen. Én genstand er 12 g alkohol. Kroppen forbrænder ca. 0,15 ‰ i timen, og din vægt og dit køn bestemmer, hvor meget én genstand fylder (Widmarks formel).";

export const INFO_DISCLAIMER =
  "Pejling er vejledende og kan ikke bruges til at vurdere, om du må køre. Intet sendes nogen steder – alt ligger på din telefon.";
