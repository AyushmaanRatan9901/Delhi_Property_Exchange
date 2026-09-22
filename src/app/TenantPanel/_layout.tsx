import { Stack } from "expo-router";
import React from "react";
import { TenantProvider } from "../../constants/tenantData";

export default function TenantPanelLayout() {
  return (
    <TenantProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="inspections" options={{ headerShown: false }} />
        <Stack.Screen name="roomChange" options={{ headerShown: false }} />
        <Stack.Screen name="documents" options={{ headerShown: false }} />
      </Stack>
    </TenantProvider>
  );
}
