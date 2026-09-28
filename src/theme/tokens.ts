import { Platform } from "react-native";

// Design tokens: palet "neon", mørk tilstand.
export const colors = {
  bg: "#14142e",
  red: "#7a1a2a",
  surface: "#232532",
  text: "#e9e9ed",
  // TEST: gennemsigtig hvid, så den dæmpede tekst tager farve efter
  // baggrunden. Designets værdi er "#9397ab".
  muted: "rgba(255,255,255,0.6)",
  divider: "rgba(233,233,237,0.16)",
  pressTint: "rgba(233,233,237,0.07)",
  backdrop: "rgba(20,20,46,0.6)",
  accent: "#9b6cf5",
  accentText: "#b899ff",
  accentTint: "rgba(155,108,245,0.14)",
  btnBg: "#9b6cf5",
  // TEST: hvid tekst og ikoner på knapperne. Designets værdier er
  // btnFg "#15112a" og btnSub "rgba(21,17,42,0.7)".
  btnFg: "#ffffff",
  btnActive: "#7c4fe0",
  btnSub: "rgba(255,255,255,0.8)",
  segOn: "#153f4a",
  segOnFg: "#7fe6f2",
  num: "#4fd8e8",
  // Mørk tekst til lyse flader, fx de kraftigste felter i kalenderen.
  inkOnLight: "#15112a",
  ringSm: "#3f424d",
  ringLg: "#9397ab",
  owlBody: "#5b3fb0",
  owlBelly: "#7f5fe0",
  owlEye: "#f3f5fe",
  owlPupil: "#292b31",
  owlBeak: "#4fd8e8",
  owlCheek: "#e0526a",
} as const;

// Inter i to vægte, aldrig federe end 500. Bricolage Grotesque bruges kun
// til ordet "Pejling".
export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  wordmark: "BricolageGrotesque_600SemiBold",
  serifItalic: Platform.select({
    ios: "Georgia",
    android: "serif",
    default: "Georgia, serif",
  }),
} as const;

export const radius = {
  pill: 999,
  drawer: 16,
  sheet: 14,
  button: 12,
  bubble: 10,
  control: 8,
  ghost: 6,
} as const;

export const space = {
  side: 20,
} as const;
