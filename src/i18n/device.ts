import { getLocales } from "expo-localization";
import { langForDevice, type Lang } from "./index";

// Telefonens første sprog afgør, hvad appen starter på.
export function deviceLang(): Lang {
  try {
    return langForDevice(getLocales()[0]?.languageCode);
  } catch {
    return "da";
  }
}
