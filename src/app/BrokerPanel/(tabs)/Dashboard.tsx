import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BrokerHeader,
  BrokerQuickActions,
  BrokerStatsOverview,
  LatestAddedProperties,
  MonthlyRevenueAnalytics,
  RecentInquiriesPulse,
  TopCommissionProperties,
} from "../../../components/BrokerComponent";
import { useResponsiveTheme } from "../../../constants/theme";
import { BrokerNotificationModal } from "../../Screens/BrokerPanelScreens/Notification";

export default function BrokerDashboardScreen() {
  const router = useRouter();
  const {
    colors,
    moderateScale,
    spacing,
    radii,
    typography,
    layout,
    shadows,
    isDark,
  } = useResponsiveTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationOrigin, setNotificationOrigin] = useState<{ x: number; y: number } | undefined>(undefined);

  const handleNotificationPress = (origin?: { x: number; y: number }) => {
    if (origin) {
      setNotificationOrigin(origin);
    }
    setNotificationVisible(true);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* 1. Broker Profile Header */}
      <BrokerHeader
        brokerName="Rajesh Sharma"
        brokerAgency="Dwarka Prime Stays & PG Hub"
        unreadNotifications={4}
        onNotificationPress={handleNotificationPress}
        onProfilePress={() => {
          router.push("/BrokerPanel/(tabs)/profile" as any);
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: spacing.xxxl + 80,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* 2. Broker Earnings & Properties KPI Overview (Registered Stays, Total Commission, Monthly Revenue, Pending) */}
        <BrokerStatsOverview
          onCardPress={(metric) => {
            if (metric === "properties") {
              router.push("/BrokerPanel/(tabs)/property" as any);
            } else if (
              metric === "commission" ||
              metric === "monthly" ||
              metric === "pending"
            ) {
              router.push("/BrokerPanel/(tabs)/money" as any);
            }
          }}
        />

        {/* 3. Quick Action Shortcuts */}
        <BrokerQuickActions
          onAddPress={() => router.push("/BrokerPanel/(tabs)/add" as any)}
          onMoneyPress={() => router.push("/BrokerPanel/(tabs)/money" as any)}
          onHistoryPress={() =>
            router.push("/BrokerPanel/(tabs)/property" as any)
          }
        />

        {/* 4. Monthly Revenue Analytics & Goal Tracker with Visual 6-Month Chart */}
        <MonthlyRevenueAnalytics
          currentMonthlyRevenue={68400}
          monthlyTarget={100000}
          onWithdrawPress={() =>
            router.push("/BrokerPanel/(tabs)/money" as any)
          }
        />

        {/* 5. Meri Latest Added Property Section */}
        <LatestAddedProperties
          onViewAllPress={() =>
            router.push("/BrokerPanel/(tabs)/property" as any)
          }
          onPropertyPress={(item) =>
            router.push({
              pathname: "/Screens/BrokerPanelScreens/PropertyDetailScreen",
              params: { id: item.id },
            } as any)
          }
        />

        {/* 6. Commission Boost Tier Promo Banner */}
        <View
          style={{
            paddingHorizontal: spacing.screenHorizontal,
            marginTop: spacing.lg,
          }}
        >
          <LinearGradient
            colors={
              isDark
                ? ["#0F766E", "#115E59"]
                : [colors.primary, colors.primaryDark || "#0F766E"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.boostBanner,
              {
                borderRadius: radii.xxl,
                padding: spacing.md + 2,
              },
              shadows.md,
            ]}
          >
            <View
              style={[layout.horizontalViewBetween, { alignItems: "center" }]}
            >
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <View
                  style={[
                    layout.horizontalView,
                    { alignItems: "center", gap: 5 },
                  ]}
                >
                  <Text style={styles.boostTag}>🔥 ELITE REWARD</Text>
                </View>

                <Text
                  style={[
                    typography.brandTitle,
                    {
                      fontSize: moderateScale(15),
                      fontWeight: "900",
                      color: colors.white,
                      marginTop: 4,
                    },
                  ]}
                >
                  Unlock 60% Commission Tier
                </Text>

                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: "rgba(255, 255, 255, 0.88)",
                    marginTop: 2,
                    fontWeight: "500",
                  }}
                >
                  Close just 2 more deals this month to upgrade from 50% to 60%
                  first-month commission!
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/BrokerPanel/(tabs)/add" as any)}
                style={[
                  styles.boostBtn,
                  {
                    backgroundColor: colors.white,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs + 3,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11.5),
                    fontWeight: "800",
                    color: colors.primaryDark,
                  }}
                >
                  List Now
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* 7. Top Property by Commission Leaderboard */}
        <TopCommissionProperties />

        {/* 8. Live Inquiries & Tenant Visit Requests */}
        <RecentInquiriesPulse
          onCallClient={(phone, name) =>
            Alert.alert("Connecting Call", `Calling client ${name} (${phone})`)
          }
        />
      </ScrollView>

      {/* Dynamic Circular Morphing Notification Modal */}
      <BrokerNotificationModal
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        origin={notificationOrigin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  boostBanner: {
    position: "relative",
    overflow: "hidden",
  },
  boostTag: {
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "800",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
  },
  boostBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
