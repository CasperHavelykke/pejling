// Feedback går gennem telefonens eget mailprogram. Appen åbner en mail
// med adresse, emne og en linje om telefonen, og brugeren skriver resten
// og sender selv. Intet forlader appen, før brugeren trykker send.

import * as Application from "expo-application";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as Device from "expo-device";
import { Linking, Platform } from "react-native";

export const FEEDBACK_ADDRESS = "casper.roket@proton.me";

export type FeedbackText = {
  subject: string;
  version: string;
  system: string;
  device: string;
};

export function feedbackMailto(t: FeedbackText): string {
  // I et rigtigt byg: den installerede version og bygnummeret. I Expo Go
  // ville det være Expo Gos egne tal, og i browseren findes de ikke, så
  // der bruges versionen fra app.json.
  const expoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  const version =
    !expoGo && Application.nativeApplicationVersion
      ? `${Application.nativeApplicationVersion} (${Application.nativeBuildVersion ?? "?"})`
      : (Constants.expoConfig?.version ?? "?");
  const system = `${Platform.OS} ${Device.osVersion ?? ""}`.trim();
  const device = Device.modelName ?? "?";
  const body = [
    "",
    "",
    "---",
    `${t.version}: ${version}`,
    `${t.system}: ${system}`,
    `${t.device}: ${device}`,
  ].join("\n");
  return (
    `mailto:${FEEDBACK_ADDRESS}` +
    `?subject=${encodeURIComponent(t.subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}

export async function openFeedback(t: FeedbackText): Promise<boolean> {
  try {
    await Linking.openURL(feedbackMailto(t));
    return true;
  } catch {
    return false;
  }
}
