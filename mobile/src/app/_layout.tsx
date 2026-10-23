import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import AppTabs from "@/components/app-tabs";
import { Sheets } from "@/components/sheets";
import { Toast } from "@/components/toast";
import { useLarder } from "@/lib/larder/store";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.resolve(useLarder.persist.rehydrate()).finally(() => {
      setReady(true);
      void SplashScreen.hideAsync();
    });
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <AppTabs />
      <Sheets />
      <Toast />
    </>
  );
}
