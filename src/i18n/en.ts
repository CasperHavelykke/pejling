import type { Strings } from "./types";

// Engelsk. Samme regler som på dansk: aldrig promille, aldrig "sober",
// og aldrig et løfte om, at man kan køre. Enheden hedder "drink" og er
// 12 g alkohol ligesom den danske genstand.
export const en: Strings = {
  decimal: ".",
  timeSeparator: ":",

  status: [
    "No active drinks",
    "Slightly affected – your reactions are already a little slower",
    "Affected – inhibitions drop, and so does your judgement",
    "Clearly drunk – balance and coordination start to fail here",
    "Very drunk – take a break and drink water, your body is behind",
    "Go home – your judgement is effectively gone from here",
  ],

  roasts: [
    // Ved nul vender brodden mod de andre i baren, aldrig mod den, der
    // ikke drikker.
    [
      "You're the only one here who'll remember tonight.",
      "Zero drinks. I'll judge the others in the meantime.",
      "The driver is the only adult here tonight.",
    ],
    [
      "One drink and you already think you're funny. You're not.",
      "You just said “cheers” three times to the same beer.",
      "You're still sharp enough to hear how boring you are.",
    ],
    [
      "You're laughing at your own jokes now. Nobody else is.",
      "You've started calling the bartender “my friend”. That's not his name.",
      "Your “dancing foot” is just a foot you don't fully control.",
      "You're talking louder. The content didn't improve.",
    ],
    [
      "You've told that story twice. It wasn't good the first time either.",
      "You just invited the whole bar to brunch. You know none of them.",
      "You think you're singing along. What you're doing is something else.",
      "You say “I'm not drunk at all” with a speech centre that has closed for the night.",
    ],
    [
      "You're dancing. Nobody asked.",
      "You hugged a stranger and called him “bro”. He moved away.",
      "Your phone has 14 selfies with your eyes closed. They're all you.",
      "You're trying to open the bathroom door with your bank card.",
    ],
    [
      "You're texting your ex, aren't you? Put the phone down. Put it down.",
      "You just lost an argument with a lamp post.",
      "Tomorrow you'll text “sorry about last night” to three people. You won't remember why.",
      "You're trying to order a kebab in a bar. That's not the problem here.",
    ],
  ],

  levelNames: [
    "Slightly affected",
    "Affected",
    "Clearly drunk",
    "Very drunk",
    "Go home",
  ],

  rangeUpTo: (n) => `Up to ${n}`,
  rangeOver: (n) => `Over ${n}`,
  infoExplanation: (perHour) =>
    `The number is an estimate of how many drinks are still active in your body. One drink here is 12 g of alcohol. With your weight and sex, your body burns off about ${perHour} drinks per hour.`,
  infoDrinks:
    "The buttons assume typical sizes and strengths. A strong beer, a large draught beer or a drink with extra spirits contains more than the button counts. Swipe the buttons to the left for more sizes, or to set the size and strength yourself.",
  infoDisclaimer:
    "Pejling is a guide only and cannot be used to judge whether you may drive. Zero active drinks does not mean you are fit to drive. How fast alcohol is burned off varies from person to person.",
  infoStorage:
    "Everything is stored on this phone only, and nothing is sent anywhere. If you delete the app, your entries and settings are deleted too and cannot be recovered.",

  zeroLine: (h, m) =>
    `Zero active drinks in about ${h ? `${h} h ` : ""}${m} min`,
  entryWord: (n) => (n === 1 ? "entry" : "entries"),
  unitWord: (n) => (n === 1 ? "drink" : "drinks"),
  unitShort: "dr.",
  dayWord: (n) => (n === 1 ? "day" : "days"),

  drinks: {
    øl: { name: "Beer", label: "Beer", sub: "1 drink" },
    vin: { name: "Wine", label: "Wine", sub: "1.2 drinks" },
    drink: { name: "Cocktail", label: "Cocktail", sub: "1.5 drinks" },
    shot: { name: "Shot", label: "Shot", sub: "1 drink" },
    øl_alm_33: { name: "Regular beer 33 cl", label: "Reg.", sub: "33 cl · 1" },
    øl_stærk_33: { name: "Strong beer 33 cl", label: "Strong", sub: "33 cl · 1.5" },
    øl_alm_50: { name: "Regular beer 50 cl", label: "Reg.", sub: "50 cl · 1.5" },
    øl_stærk_50: { name: "Strong beer 50 cl", label: "Strong", sub: "50 cl · 2.3" },
    drink_mild: { name: "Light cocktail", label: "Light", sub: "1 dr." },
    drink_alm: { name: "Regular cocktail", label: "Reg.", sub: "1.5 dr." },
    drink_stærk: { name: "Strong cocktail", label: "Strong", sub: "2 dr." },
    vin_15: { name: "Wine 15 cl", label: "Wine", sub: "15 cl · 1.2" },
    shot_alm_2: { name: "Regular shot 2 cl", label: "Reg.", sub: "2 cl · 0.5" },
    shot_stærk_2: { name: "Strong shot 2 cl", label: "Strong", sub: "2 cl · 0.7" },
    shot_alm_4: { name: "Regular shot 4 cl", label: "Reg.", sub: "4 cl · 1" },
    shot_stærk_4: { name: "Strong shot 4 cl", label: "Strong", sub: "4 cl · 1.4" },
  },
  groups: { beer: "Beer", drink: "Cocktails and wine", shot: "Shots" },

  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  weekdaysShort: ["M", "T", "W", "T", "F", "S", "S"],
  weekdaysLong: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  longDate: (weekday, day, month) => `${weekday} ${day} ${month}`,

  main: {
    simple: "Simple",
    advanced: "Advanced",
    infoButton: "About Pejling and your settings",
    activeLabel: "active drinks in your body",
    summary: (units, time) => `${units} drinks tonight · latest ${time}`,
    nothingYet: "No drinks yet",
    showList: "Show the list",
  },
  custom: {
    page: "Custom",
    types: { beer: "Beer", wine: "Wine", spirit: "Spirits" },
    size: "Size",
    strength: "Strength",
    smaller: "Smaller",
    larger: "Larger",
    weaker: "Weaker",
    stronger: "Stronger",
    add: (units, n) => `Add · ${units} ${n === 1 ? "drink" : "drinks"}`,
    recent: "Recent",
    recentHint: "Press and hold to remove from Recent",
    recentEmpty: "Your recent choices will show up here",
    percent: (n) => `${n}%`,
    name: (type, cl, abv) => `${type} ${cl} cl ${abv}%`,
  },
  drawer: {
    title: "Tonight",
    close: "Close the list",
    empty: "No drinks yet.",
    undo: "Undo",
    undoLabel: (name, time) => `Undo ${name} at ${time}`,
    history: "Earlier nights",
  },
  info: {
    you: "You",
    weight: "Body weight",
    kiloLess: "One kilo less",
    kiloMore: "One kilo more",
    sex: "Sex",
    male: "Male",
    female: "Female",
    language: "Language",
    howTitle: "How Pejling calculates",
    tableHead: "Active drinks",
    dataTitle: "Your data",
    close: "Close",
  },
  history: {
    title: "History",
    back: "Back",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    noEntries: "No entries",
    noEntriesOn: (date) => `No entries on ${date}.`,
    firstUse: "Your nights will show up here once you have used Pejling.",
    tapADay: "Tap a day to see the night.",
    legend: "Colour: peak active drinks · Number: drinks in total",
    legendLabel:
      "The colour shows the highest number of active drinks that night, from slightly affected to go home. The number is drinks in total.",
    units: "Drinks",
    peak: "Peak active",
    entries: (n) => (n === 1 ? "Entry" : "Entries"),
    pastMidnight:
      "The night continued past midnight and is kept together on the day it started.",
  },
};
