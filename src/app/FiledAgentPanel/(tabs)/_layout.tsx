import React from "react";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";
import { FieldAgentProvider } from "../../../constants/fieldAgentData";

export default function FieldAgentTabsLayout() {
  const { t } = useTranslation();

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
            title: t("navigation.dashboard"),
            tabBarIcon: tabIcon("grid", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="leads"
          options={{
            title: t("navigation.leads"),
            tabBarIcon: tabIcon("list", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="addLead"
          options={{
            title: t("navigation.addLead"),
            tabBarIcon: tabIcon("add-circle", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="wallet"
          options={{
            title: t("navigation.wallet"),
            tabBarIcon: tabIcon("wallet", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t("navigation.profile"),
            tabBarIcon: tabProfileAvatar(
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80",
            ),
          }}
        />
      </Tabs>
    </FieldAgentProvider>
  );
}
