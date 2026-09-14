import { Stack } from "expo-router";

export default function SuperAdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="user-detail" options={{ headerShown: false }} />
    </Stack>
  );
}
