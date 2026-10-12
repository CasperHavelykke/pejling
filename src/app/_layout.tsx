import { BricolageGrotesque_600SemiBold } from "@expo-google-fonts/bricolage-grotesque/600SemiBold";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { isLang, setLang } from "../i18n";
import { deviceLang } from "../i18n/device";
import { loadSettings } from "../storage/store";
import { colors } from "../theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    BricolageGrotesque_600SemiBold,
  });

  // Sproget skal være valgt, før første skærm tegnes. Har brugeren selv
  // valgt et, gælder det. Ellers følger appen telefonens sprog.
  const [langReady, setLangReady] = useState(false);
  useEffect(() => {
    let alive = true;
    loadSettings()
      .then((settings) => {
        setLang(isLang(settings.lang) ? settings.lang : deviceLang());
      })
      .catch(() => setLang(deviceLang()))
      .finally(() => {
        if (alive) setLangReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const fontsDone = loaded || !!error;

  useEffect(() => {
    // Fejler skrifttypen, vises appen med systemets skrift frem for at
    // hænge på splash-skærmen.
    if (fontsDone && langReady) SplashScreen.hideAsync().catch(() => {});
  }, [fontsDone, langReady]);

  if (!fontsDone || !langReady) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </SafeAreaProvider>
  );
}
