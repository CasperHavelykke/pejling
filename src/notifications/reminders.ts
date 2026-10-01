// Påmindelser om at logge. De laves på telefonen selv og sendes ikke fra
// en server, så intet forlader telefonen.

import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

type Api = typeof import("expo-notifications");

const CHANNEL = "reminders";

let loaded: Api | null | undefined;

// Pakken hentes først, når den skal bruges. På Android melder den fejl
// allerede ved indlæsning i Expo Go, hvor notifikationer ikke findes, og
// det ville vælte hele appen under udvikling. Her er påmindelser blot
// utilgængelige. I den rigtige app indlæses pakken som normalt.
function api(): Api | null {
  if (loaded !== undefined) return loaded;
  const inExpoGo =
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (Platform.OS === "android" && inExpoGo) {
    loaded = null;
    return loaded;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    loaded = require("expo-notifications") as Api;
  } catch {
    loaded = null;
  }
  return loaded;
}

// Android kræver en kanal, før systemet vil spørge om lov.
async function ensureChannel(n: Api, name: string): Promise<void> {
  if (Platform.OS !== "android") return;
  await n.setNotificationChannelAsync(CHANNEL, {
    name,
    importance: n.AndroidImportance.DEFAULT,
  });
}

// Spørger om lov, hvis der ikke er svaret endnu. Sandt, hvis appen må
// vise notifikationer.
export async function requestReminderPermission(
  channelName: string,
): Promise<boolean> {
  const n = api();
  if (!n) return false;
  await ensureChannel(n, channelName);
  const current = await n.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await n.requestPermissionsAsync();
  return asked.granted;
}

// Erstatter alle planlagte påmindelser med dem, der skal gælde nu.
export async function setReminders(
  times: readonly number[],
  text: { title: string; body: string; channel: string },
): Promise<void> {
  const n = api();
  if (!n) return;
  await n.cancelAllScheduledNotificationsAsync();
  if (times.length === 0) return;
  await ensureChannel(n, text.channel);
  for (const at of times) {
    await n.scheduleNotificationAsync({
      content: { title: text.title, body: text.body },
      trigger: {
        type: n.SchedulableTriggerInputTypes.DATE,
        date: new Date(at),
        channelId: CHANNEL,
      },
    });
  }
}

// Fjerner påmindelser, der allerede er vist. Åbner man appen, er de
// overflødige.
export async function clearShownReminders(): Promise<void> {
  const n = api();
  if (!n) return;
  await n.dismissAllNotificationsAsync();
}
