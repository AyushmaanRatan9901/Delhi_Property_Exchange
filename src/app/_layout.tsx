import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../Redux/store";
import { useAppDispatch } from "../Redux/hooks";
import { restoreSession } from "../Redux/Auth/authActions";
import { ThemeProvider } from "../constants/theme";
import "../i18n";
import { initializeLanguage } from "../i18n/language";

function AppContent() {
  const dispatch = useAppDispatch();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await initializeLanguage();
      } catch (e) {
        console.warn("[RootLayout] i18n init error:", e);
      } finally {
        setI18nReady(true);
      }
      dispatch(restoreSession());
    }
    init();
  }, [dispatch]);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
