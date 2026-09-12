import { Tabs } from "expo-router";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";
import { FieldAgentProvider } from "../../../constants/fieldAgentData";

export default function FieldAgentTabsLayout() {
  return (
    <FieldAgentProvider>
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
          name="leads"
          options={{
            title: "My Leads",
            tabBarIcon: tabIcon("list", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="addLead"
          options={{
            title: "Add Lead",
            tabBarIcon: tabIcon("add-circle", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="wallet"
          options={{
            title: "Wallet",
            tabBarIcon: tabIcon("wallet", "ionicons"),
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
    </FieldAgentProvider>
  );
}
