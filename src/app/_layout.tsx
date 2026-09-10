import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../Redux/store";
import { useAppDispatch } from "../Redux/hooks";
import { restoreSession } from "../Redux/Auth/authActions";
import { ThemeProvider } from "../constants/theme";

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

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
