import { Redirect } from "expo-router";

export default function Index() {
  // Redirect directly to the CustomerPanel tabs home
  return <Redirect href={"/CustomerPanel" as any} />;
}
