import { Tabs } from "expo-router";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";

export default function SuperAdminTabsLayout() {
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
        name="users"
        options={{
          title: "Users",
          tabBarIcon: tabIcon("people", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="approvals"
        options={{
          title: "Approvals",
          tabBarIcon: tabIcon("shield-checkmark", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: tabIcon("bar-chart", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: tabIcon("settings", "ionicons"),
        }}
      />
    </Tabs>
  );
}
