import { Tabs } from "expo-router";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";

export default function HouseOwnerTabsLayout() {
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
        name="properties"
        options={{
          title: "My Units",
          tabBarIcon: tabIcon("business", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "List Stay",
          tabBarIcon: tabIcon("add-circle", "ionicons"),
        }}
      />

      <Tabs.Screen
        name="tenants"
        options={{
          title: "Tenants",
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
