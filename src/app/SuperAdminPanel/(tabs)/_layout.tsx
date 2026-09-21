import React, { useEffect } from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../Redux/store";
import { connectSocketUser } from "../../../services/socketService";
import { fetchSuperAdminNotifications } from "../../../Redux/SuperAdmin/superAdminNotificationSlice";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";

export default function SuperAdminTabsLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?._id) {
      connectSocketUser(user);
      dispatch(fetchSuperAdminNotifications());
    }
  }, [user, dispatch]);

  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
}
