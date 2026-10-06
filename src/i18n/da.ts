import type { Strings } from "./types";

export const da: Strings = {
  decimal: ",",
  timeSeparator: ".",

  status: [
    "Ingen aktive genstande",
    "Let påvirket – reaktionstiden er allerede lidt længere",
    "Påvirket – hæmningerne falder, og det gør dømmekraften også",
    "Tydeligt fuld – balance og koordination svigter herfra",
    "Meget fuld – hold pause og drik vand, kroppen er bagud",
    "Tag hjem – dømmekraften er reelt sat ud herfra",
  ],

  testHint: "Tester du mig? Du kan rydde aftenen i skuffen.",

  roasts: [
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
  ],

  levelNames: [
    "Let påvirket",
    "Påvirket",
    "Tydeligt fuld",
    "Meget fuld",
    "Tag hjem",
  ],

  rangeUpTo: (n) => `Op til ${n}`,
  rangeOver: (n) => `Over ${n}`,
  infoExplanation: (perHour) =>
    `Tallet er et estimat af, hvor mange genstande der stadig er aktive i kroppen. Én genstand er 12 g alkohol. Med din vægt og dit køn forbrænder du ca. ${perHour} genstande i timen.`,
  // Indholdet af det, man drikker, er en fejlkilde for sig, ved siden af
  // kroppens forbrænding.
  infoDrinks:
    "Knapperne regner med typiske størrelser og styrker. En stærk øl, en stor fadøl eller en drink med ekstra sprut indeholder mere, end knappen tæller. Swipe knapperne til venstre for flere størrelser, eller for selv at angive størrelse og styrke.",
  infoDisclaimer:
    "Pejling er vejledende og kan ikke bruges til at vurdere, om du må køre. Nul aktive genstande betyder ikke, at du er klar til at køre. Forbrændingen varierer fra person til person.",
  infoStorage:
    "Alt gemmes kun på denne telefon, og intet sendes nogen steder. Sletter du appen, slettes dine indtastninger og indstillinger også og kan ikke hentes tilbage.",

  // Linjen taler om tallet på skærmen og ikke om personen. Ordet "ædru"
  // undgås bevidst: det kan læses som et løfte om at være klar til at køre.
  zeroLine: (h, m) =>
    `Nul aktive genstande om ca. ${h ? `${h} t ` : ""}${m} min`,
  clearLine: (h, m) => `Listen ryddes om ca. ${h ? `${h} t ` : ""}${m} min`,
  // En indtastning er ét tryk på en knap. Den kan fylde mere eller mindre
  // end én genstand, så de to ord må ikke blandes sammen.
  entryWord: (n) => (n === 1 ? "indtastning" : "indtastninger"),
  unitWord: (n) => (n === 1 ? "genstand" : "genstande"),
  unitShort: "gs.",
  dayWord: (n) => (n === 1 ? "dag" : "dage"),

  drinks: {
    øl: { name: "Øl", label: "Øl", sub: "1 genstand" },
    vin: { name: "Vin", label: "Vin", sub: "1,2 genstand" },
    drink: { name: "Drink", label: "Drink", sub: "1,5 genstand" },
    shot: { name: "Shot", label: "Shot", sub: "1 genstand" },
    øl_alm_33: { name: "Alm. øl 33 cl", label: "Alm.", sub: "33 cl · 1" },
    øl_stærk_33: { name: "Stærk øl 33 cl", label: "Stærk", sub: "33 cl · 1,5" },
    øl_alm_50: { name: "Alm. øl 50 cl", label: "Alm.", sub: "50 cl · 1,5" },
    øl_stærk_50: { name: "Stærk øl 50 cl", label: "Stærk", sub: "50 cl · 2,3" },
    drink_mild: { name: "Mild drink", label: "Mild", sub: "1 gs." },
    drink_alm: { name: "Alm. drink", label: "Alm.", sub: "1,5 gs." },
    drink_stærk: { name: "Stærk drink", label: "Stærk", sub: "2 gs." },
    vin_15: { name: "Vin 15 cl", label: "Vin", sub: "15 cl · 1,2" },
    shot_alm_2: { name: "Alm. shot 2 cl", label: "Alm.", sub: "2 cl · 0,5" },
    shot_stærk_2: { name: "Stærk shot 2 cl", label: "Stærk", sub: "2 cl · 0,7" },
    shot_alm_4: { name: "Alm. shot 4 cl", label: "Alm.", sub: "4 cl · 1" },
    shot_stærk_4: { name: "Stærk shot 4 cl", label: "Stærk", sub: "4 cl · 1,4" },
  },
  groups: { beer: "Øl", drink: "Drinks og vin", shot: "Shots" },

  months: [
    "januar",
    "februar",
    "marts",
    "april",
    "maj",
    "juni",
    "juli",
    "august",
    "september",
    "oktober",
    "november",
    "december",
  ],
  weekdaysShort: ["M", "T", "O", "T", "F", "L", "S"],
  weekdaysLong: [
    "søndag",
    "mandag",
    "tirsdag",
    "onsdag",
    "torsdag",
    "fredag",
    "lørdag",
  ],
  longDate: (weekday, day, month) => `${weekday} ${day}. ${month}`,

  main: {
    simple: "Simpel",
    advanced: "Avanceret",
    infoButton: "Om Pejling og dine indstillinger",
    activeLabel: "aktive genstande i kroppen",
    summary: (units, time) => `${units} genstande i aften · seneste ${time}`,
    nothingYet: "Ingen genstande endnu",
    showList: "Vis listen",
  },
  custom: {
    page: "Tilpasset",
    types: { beer: "Øl", wine: "Vin", spirit: "Sprut" },
    size: "Størrelse",
    strength: "Styrke",
    smaller: "Mindre",
    larger: "Større",
    weaker: "Svagere",
    stronger: "Stærkere",
    add: (units, n) => `Tilføj · ${units} ${n === 1 ? "genstand" : "genstande"}`,
    burnTime: (h, m) =>
      `Kroppen bruger ca. ${h ? `${h} t ` : ""}${m ? `${m} min ` : ""}på den`,
    recent: "Seneste",
    recentHint: "Hold nede for at fjerne fra Seneste",
    recentEmpty: "Dine seneste valg kommer til at stå her",
    percent: (n) => `${n} %`,
    name: (type, cl, abv) => `${type} ${cl} cl ${abv} %`,
  },
  reminder: {
    channel: "Påmindelser",
    title: "Pejling",
    body: "Har du fået noget siden sidst? Husk at logge det!",
  },
  drawer: {
    title: "I aften",
    close: "Luk listen",
    empty: "Ingen genstande endnu.",
    undo: "Fortryd",
    undoLabel: (name, time) => `Fortryd ${name} klokken ${time}`,
    history: "Tidligere aftener",
    clear: "Ryd",
    clearTitle: (n) =>
      n === 1
        ? "Ryd aftenens ene indtastning?"
        : `Ryd aftenens ${n} indtastninger?`,
    clearBody: "De kan ikke hentes tilbage.",
    cancel: "Annuller",
  },
  info: {
    you: "Dig",
    weight: "Kropsvægt",
    kiloLess: "Et kilo mindre",
    kiloMore: "Et kilo mere",
    sex: "Køn",
    male: "Mand",
    female: "Kvinde",
    language: "Sprog",
    reminders: "Påmindelser",
    off: "Fra",
    on: "Til",
    remindersHelp:
      "Pejling minder dig om at logge en time efter din seneste indtastning, så længe der er aktive genstande.",
    remindersDenied:
      "Pejling har ikke lov til at vise notifikationer. Giv lov i telefonens indstillinger, og prøv igen.",
    howTitle: "Sådan regner Pejling",
    tableHead: "Aktive genstande",
    now: "nu",
    dataTitle: "Dine data",
    close: "Luk",
  },
  history: {
    title: "Historik",
    back: "Tilbage",
    previousMonth: "Forrige måned",
    nextMonth: "Næste måned",
    noEntries: "Ingen indtastninger",
    noEntriesOn: (date) => `Ingen indtastninger ${date}.`,
    firstUse: "Her kommer dine aftener til at stå, når du har brugt Pejling.",
    tapADay: "Tryk på en dag for at se aftenen.",
    legend: "Farve: maks aktive genstande · Tal: genstande i alt",
    legendLabel:
      "Farven viser aftenens højeste antal aktive genstande, fra let påvirket til tag hjem. Tallet er genstande i alt.",
    units: "Genstande",
    peak: "Maks aktive",
    entries: (n) => (n === 1 ? "Indtastning" : "Indtastninger"),
    pastMidnight:
      "Aftenen fortsatte efter midnat og står samlet på den dag, den startede.",
  },
};
