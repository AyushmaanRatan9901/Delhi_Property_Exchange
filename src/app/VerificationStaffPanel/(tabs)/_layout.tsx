import React, { useEffect } from "react";
import { View } from "react-native";
import { Tabs, useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../Redux/store";
import { connectSocketUser } from "../../../services/socketService";
import { fetchStaffNotifications } from "../../../Redux/VerificationStaff/verificationStaffSlice";
import {
  FloatingTabBar,
  tabIcon,
  tabProfileAvatar,
} from "../../../components/FloatingTabBar";
import { RealTimeToastBanner } from "../../../components/VerificationStaffComponent";

export default function VerificationStaffTabsLayout() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?._id) {
      connectSocketUser(user);
      dispatch(fetchStaffNotifications());
    }
  }, [user, dispatch]);

  const handleOpenLead = (lead: any) => {
    // Navigate to pending tab
    router.push("/VerificationStaffPanel/(tabs)/pending" as any);
  };

  return (
    <View style={{ flex: 1 }}>
      <RealTimeToastBanner onOpenLead={handleOpenLead} />
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
            tabBarIcon: tabIcon("shield-checkmark", "ionicons"),
          }}
        />

        <Tabs.Screen
          name="complaints"
          options={{
            title: "Complaints",
            tabBarIcon: tabIcon("construct", "ionicons"),
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
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80"
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
