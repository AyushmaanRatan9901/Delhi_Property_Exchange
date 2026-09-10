import { Tabs } from "expo-router";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";

export default function FieldAgentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: tabIcon("grid", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="visits"
        options={{
          title: "Visits",
          tabBarIcon: tabIcon("calendar", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="properties"
        options={{
          title: "Properties",
          tabBarIcon: tabIcon("home", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="leads"
        options={{
          title: "Leads",
          tabBarIcon: tabIcon("people", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabProfileAvatar(
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80",
          ),
        }}
      />
    </Tabs>
  );
}
