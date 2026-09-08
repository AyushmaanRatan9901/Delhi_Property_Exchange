import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to Onboarding screen
  return <Redirect href={"/(onboarding)" as any} />;
}
