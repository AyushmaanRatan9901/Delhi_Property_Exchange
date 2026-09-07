import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsiveTheme } from "../../../constants/theme";

interface BrokerHeaderProps {
  brokerName?: string;
  brokerAgency?: string;
  avatarUrl?: string;
  unreadNotifications?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onSupportPress?: () => void;
}

export const BrokerHeader: React.FC<BrokerHeaderProps> = ({
  brokerName = "Rajesh Sharma",
  brokerAgency = "Dwarka Prime Stays & PG Hub",
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  unreadNotifications = 4,
  onNotificationPress,
  onProfilePress,
  onSupportPress,
}) => {
  const { colors, moderateScale, spacing, radii, typography, layout, isDark, toggleTheme } =
    useResponsiveTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.xs,
          paddingBottom: spacing.sm + 2,
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      {/* Top Bar: Broker Identity & Status */}
      <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
        {/* Left: Avatar + Name + Partner Badge */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onProfilePress}
          style={[layout.horizontalView, { flex: 1, marginRight: spacing.sm }]}
        >
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: avatarUrl }}
              style={[
                styles.avatar,
                {
                  width: moderateScale(44),
                  height: moderateScale(44),
                  borderRadius: radii.round,
                  borderColor: colors.primary,
                },
              ]}
            />
            {/* Verified Broker Shield Mini-Badge */}
            <View
              style={[
                styles.verifiedBadge,
                {
                  backgroundColor: colors.priceGreen || "#10B981",
                  borderColor: colors.cardBackground,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="check-decagram"
                size={moderateScale(11)}
                color={colors.white}
              />
            </View>
          </View>

          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <View style={[layout.horizontalView, { alignItems: "center", gap: 4 }]}>
              <Text
                numberOfLines={1}
                style={[
                  typography.brandTitle,
                  {
                    fontSize: moderateScale(15.5),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                {brokerName}
              </Text>
              <View
                style={[
                  styles.eliteTag,
                  {
                    backgroundColor: isDark
                      ? "rgba(13, 148, 136, 0.2)"
                      : colors.primaryLight,
                    borderColor: colors.primarySoft,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(9.5),
                    fontWeight: "800",
                    color: colors.primary,
                    letterSpacing: 0.3,
                  }}
                >
                  PRO BROKER
                </Text>
              </View>
            </View>

            <Text
              numberOfLines={1}
              style={[
                typography.brandTagline,
                {
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  marginTop: 1,
                  fontWeight: "500",
                },
              ]}
            >
              🏢 {brokerAgency}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Right Actions: Theme Toggle + Support + Notifications */}
        <View style={[layout.horizontalView, { gap: spacing.xs + 2 }]}>
          {/* Quick Support Call */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={
              onSupportPress ||
              (() =>
                Alert.alert(
                  "Broker Priority Desk",
                  "Connecting you with your dedicated Partner Manager (10 AM - 8 PM)."
                ))
            }
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? colors.surfaceHover : colors.surfaceLight,
                borderColor: colors.border,
                borderRadius: radii.pill,
                width: moderateScale(36),
                height: moderateScale(36),
              },
            ]}
          >
            <Feather
              name="headphones"
              size={moderateScale(16)}
              color={colors.primary}
            />
          </TouchableOpacity>

          {/* Theme Switcher (if available) */}
          {toggleTheme && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={toggleTheme}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isDark ? colors.surfaceHover : colors.surfaceLight,
                  borderColor: colors.border,
                  borderRadius: radii.pill,
                  width: moderateScale(36),
                  height: moderateScale(36),
                },
              ]}
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={moderateScale(16)}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
          )}

          {/* Notification Bell with Badge */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={
              onNotificationPress ||
              (() =>
                Alert.alert(
                  "Commission & Deal Alerts",
                  `You have ${unreadNotifications} unread deal alerts and lead updates.`
                ))
            }
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark ? colors.surfaceHover : colors.surfaceLight,
                borderColor: colors.border,
                borderRadius: radii.pill,
                width: moderateScale(36),
                height: moderateScale(36),
              },
            ]}
          >
            <Feather
              name="bell"
              size={moderateScale(16)}
              color={colors.textPrimary}
            />
            {unreadNotifications > 0 && (
              <View
                style={[
                  styles.notificationBadge,
                  {
                    backgroundColor: colors.notificationRed || "#EF4444",
                    borderColor: colors.background,
                  },
                ]}
              >
                <Text style={styles.notificationBadgeText}>
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Status Strip */}
      <View
        style={[
          styles.statusStrip,
          {
            backgroundColor: isDark
              ? "rgba(16, 185, 129, 0.1)"
              : "#ECFDF5",
            borderColor: isDark ? "rgba(16, 185, 129, 0.25)" : "#A7F3D0",
            borderRadius: radii.pill,
            marginTop: spacing.xs + 2,
          },
        ]}
      >
        <View style={styles.onlineDot} />
        <Text
          style={{
            fontSize: moderateScale(11),
            fontWeight: "700",
            color: "#059669",
            flex: 1,
          }}
        >
          Live & Accepting Client Visits • Direct Broker Payouts Active
        </Text>
        <Text
          style={{
            fontSize: moderateScale(10.5),
            fontWeight: "700",
            color: colors.primary,
          }}
        >
          Dwarka & NCR
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    borderWidth: 2,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  eliteTag: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  iconBtn: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  statusStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderWidth: 1,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
  },
});
