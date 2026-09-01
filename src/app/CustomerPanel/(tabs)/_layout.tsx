import React from "react";
import { Tabs } from "expo-router";
import { FloatingTabBar, tabIcon, tabProfileAvatar } from "../../../components/FloatingTabBar";

export default function CustomerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      {/* 1. Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: tabIcon("home", "ionicons"),
        }}
      />

      {/* 2. Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: tabIcon("search", "ionicons"),
        }}
      />

      {/* 3. Saved Tab */}
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: tabIcon("heart", "ionicons"),
        }}
      />

      {/* 4. Requests Tab */}
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: tabIcon("calendar", "ionicons"),
        }}
      />

      {/* 5. Profile Tab (Circular User Avatar Image with Focus Ring) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: tabProfileAvatar(
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80"
          ),
        }}
      />
    </Tabs>
  );
}
