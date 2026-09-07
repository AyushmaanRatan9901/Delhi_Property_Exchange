import { Tabs } from "expo-router";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";

export default function BrokerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      {/* 1. Broker Dashboard Tab */}
      <Tabs.Screen
        name="Dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: tabIcon("grid", "ionicons"),
        }}
      />

      {/* 4. Earnings & Payouts Tab */}
      <Tabs.Screen
        name="money"
        options={{
          title: "Payouts",
          tabBarIcon: tabIcon("wallet", "ionicons"),
        }}
      />

      {/* 2. Add New Property / Stay Tab */}
      <Tabs.Screen
        name="add"
        options={{
          title: "Add Stay",
          tabBarIcon: tabIcon("add-circle", "ionicons"),
        }}
      />

      {/* 3. Deal & Leads History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          title: "Deals",
          tabBarIcon: tabIcon("document-text", "ionicons"),
        }}
      />

      {/* 5. Broker Profile Tab with Circular Verified Avatar */}
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
