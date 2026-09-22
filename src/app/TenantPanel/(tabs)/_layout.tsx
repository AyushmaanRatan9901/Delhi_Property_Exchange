import React, { useMemo } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";
import { useTenant } from "../../../constants/tenantData";

export default function TenantTabsLayout() {
  const { t } = useTranslation();
  const { profile } = useTenant();

  const profileAvatarIcon = useMemo(() => {
    return tabProfileAvatar(
      profile?.profilePhoto ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80"
    );
  }, [profile?.profilePhoto]);

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <FloatingTabBar {...props} />}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: t("tenant.navigation.home", "Home"),
            tabBarIcon: tabIcon("home", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="Property"
          options={{
            title: t("tenant.navigation.property", "Property"),
            tabBarIcon: tabIcon("business", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="Rent"
          options={{
            title: t("tenant.navigation.rent", "Rent"),
            tabBarIcon: tabIcon("wallet", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="Complaints"
          options={{
            title: t("tenant.navigation.complaints", "Complaints"),
            tabBarIcon: tabIcon("construct", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="Profile"
          options={{
            title: t("tenant.navigation.profile", "Profile"),
            tabBarIcon: profileAvatarIcon,
          }}
        />
      </Tabs>
    </View>
  );
}
