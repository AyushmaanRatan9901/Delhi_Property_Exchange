import { Stack } from "expo-router";
import React from "react";

export default function SplashLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
