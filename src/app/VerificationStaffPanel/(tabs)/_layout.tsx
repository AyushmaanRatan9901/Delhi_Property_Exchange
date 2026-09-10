import { Tabs } from "expo-router";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";

export default function VerificationStaffTabsLayout() {
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
        name="pending"
        options={{
          title: "Pending",
          tabBarIcon: tabIcon("time", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="inspections"
        options={{
          title: "Inspections",
          tabBarIcon: tabIcon("checkmark-done-circle", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: tabIcon("archive", "ionicons"),
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
