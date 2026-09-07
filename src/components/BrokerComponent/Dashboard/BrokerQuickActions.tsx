import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsiveTheme } from "../../../constants/theme";

interface BrokerQuickActionsProps {
  onAddPress?: () => void;
  onMoneyPress?: () => void;
  onHistoryPress?: () => void;
  onSupportPress?: () => void;
}

export const BrokerQuickActions: React.FC<BrokerQuickActionsProps> = ({
  onAddPress,
  onMoneyPress,
  onHistoryPress,
  onSupportPress,
}) => {
  const router = useRouter();
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } =
    useResponsiveTheme();

  const handlePressWithHaptic = (callback?: () => void) => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    callback?.();
  };

  const handleAdd = () => {
    handlePressWithHaptic(
      onAddPress ||
        (() => {
          router.push("/BrokerPanel/(tabs)/add" as any);
        })
    );
  };

  const handleMoney = () => {
    handlePressWithHaptic(
      onMoneyPress ||
        (() => {
          router.push("/BrokerPanel/(tabs)/money" as any);
        })
    );
  };

  const handleHistory = () => {
    handlePressWithHaptic(
      onHistoryPress ||
        (() => {
          router.push("/BrokerPanel/(tabs)/history" as any);
        })
    );
  };

  const handleSupport = () => {
    handlePressWithHaptic(
      onSupportPress ||
        (() => {
          Alert.alert(
            "Priority Broker Helpdesk",
            "Dedicated Partner Manager: Vikram Singh (+91 98110 54321)\nAvailable: 24/7 for instant tenant check-in support."
          );
        })
    );
  };

  return (
    <View
      style={{
        paddingHorizontal: spacing.screenHorizontal,
        marginTop: spacing.lg,
      }}
    >
      {/* Section Header */}
      <View
        style={[
          layout.horizontalViewBetween,
          { marginBottom: spacing.xs + 2 },
        ]}
      >
        <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
          <MaterialCommunityIcons
            name="lightning-bolt"
            size={moderateScale(19)}
            color={colors.primary}
          />
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(15),
                fontWeight: "800",
                color: colors.textPrimary,
              },
            ]}
          >
            Broker Fast-Track Actions
          </Text>
        </View>

        <Text
          style={{
            fontSize: moderateScale(11),
            color: colors.textMuted,
            fontWeight: "600",
          }}
        >
          Quick Hub
        </Text>
      </View>

      {/* 1. HERO SPOTLIGHT ACTION: Register New Stay / PG */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handleAdd}
        style={[
          styles.heroCardContainer,
          {
            borderRadius: radii.xxl,
          },
          shadows.md,
        ]}
      >
        <LinearGradient
          colors={
            isDark
              ? [colors.primary, colors.primaryDark || "#0F766E"]
              : [colors.primary, colors.primaryDark || "#0F766E"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.heroGradient,
            {
              borderRadius: radii.xxl,
              padding: spacing.md + 2,
            },
          ]}
        >
          {/* Subtle Background Glow Accent */}
          <View style={styles.heroBackgroundShape} />

          <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              {/* Top Tag */}
              <View
                style={[
                  styles.heroBadge,
                  {
                    backgroundColor: "rgba(255, 255, 255, 0.22)",
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Feather
                  name="zap"
                  size={moderateScale(10)}
                  color={colors.white}
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.heroBadgeText}>FAST LISTING • 0 BROKERAGE FEE</Text>
              </View>

              {/* Headline */}
              <Text
                style={[
                  typography.brandTitle,
                  {
                    fontSize: moderateScale(16.5),
                    fontWeight: "900",
                    color: colors.white,
                    marginTop: 6,
                    letterSpacing: -0.2,
                  },
                ]}
              >
                + Register New Stay / PG
              </Text>

              <Text
                style={{
                  fontSize: moderateScale(11.5),
                  color: "rgba(255, 255, 255, 0.9)",
                  marginTop: 2,
                  fontWeight: "500",
                  lineHeight: moderateScale(16),
                }}
              >
                List room, PG or flat & earn up to 50% first-month commission
              </Text>
            </View>

            {/* Right Action Button Pill */}
            <View
              style={[
                styles.heroActionBtn,
                {
                  backgroundColor: colors.white,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 3,
                },
                shadows.sm,
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontWeight: "800",
                  color: colors.primaryDark,
                  marginRight: 2,
                }}
              >
                Add Stay
              </Text>
              <Feather
                name="arrow-right"
                size={moderateScale(13)}
                color={colors.primaryDark}
              />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* 2. THREE SLEEK GLASS COMPANION CARDS */}
      <View
        style={[
          layout.horizontalView,
          { gap: spacing.xs + 2, marginTop: spacing.xs + 3 },
        ]}
      >
        {/* Card A: Commission Payouts */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleMoney}
          style={[
            styles.tileCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xl,
              padding: spacing.sm + 2,
            },
            shadows.sm,
          ]}
        >
          <View style={layout.horizontalViewBetween}>
            <View
              style={[
                styles.tileIconBox,
                {
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.18)"
                    : "#DCFCE7",
                  borderRadius: radii.lg,
                },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={moderateScale(17)}
                color="#059669"
              />
            </View>

            <View
              style={[
                styles.tileMicroTag,
                {
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "#ECFDF5",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(8.5),
                  fontWeight: "800",
                  color: "#059669",
                }}
              >
                PAYOUTS
              </Text>
            </View>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: moderateScale(12),
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              Commission
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: moderateScale(10),
                color: "#059669",
                fontWeight: "700",
                marginTop: 1,
              }}
            >
              ₹3.84L Earned ↗
            </Text>
          </View>
        </TouchableOpacity>

        {/* Card B: Deals & History */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleHistory}
          style={[
            styles.tileCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xl,
              padding: spacing.sm + 2,
            },
            shadows.sm,
          ]}
        >
          <View style={layout.horizontalViewBetween}>
            <View
              style={[
                styles.tileIconBox,
                {
                  backgroundColor: isDark
                    ? "rgba(2, 132, 199, 0.18)"
                    : "#E0F2FE",
                  borderRadius: radii.lg,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="file-document-outline"
                size={moderateScale(17)}
                color="#0284C7"
              />
            </View>

            <View
              style={[
                styles.tileMicroTag,
                {
                  backgroundColor: isDark
                    ? "rgba(2, 132, 199, 0.15)"
                    : "#F0F9FF",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(8.5),
                  fontWeight: "800",
                  color: "#0284C7",
                }}
              >
                DEALS
              </Text>
            </View>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: moderateScale(12),
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              Deal History
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: moderateScale(10),
                color: colors.textMuted,
                fontWeight: "600",
                marginTop: 1,
              }}
            >
              42 Closed Deals
            </Text>
          </View>
        </TouchableOpacity>

        {/* Card C: Priority RM & Helpdesk */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleSupport}
          style={[
            styles.tileCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xl,
              padding: spacing.sm + 2,
            },
            shadows.sm,
          ]}
        >
          <View style={layout.horizontalViewBetween}>
            <View
              style={[
                styles.tileIconBox,
                {
                  backgroundColor: isDark
                    ? "rgba(245, 158, 11, 0.18)"
                    : "#FEF3C7",
                  borderRadius: radii.lg,
                },
              ]}
            >
              <Feather
                name="headphones"
                size={moderateScale(16)}
                color="#D97706"
              />
            </View>

            <View
              style={[
                styles.tileMicroTag,
                {
                  backgroundColor: isDark
                    ? "rgba(245, 158, 11, 0.15)"
                    : "#FFFBEB",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(8.5),
                  fontWeight: "800",
                  color: "#D97706",
                }}
              >
                24/7 RM
              </Text>
            </View>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: moderateScale(12),
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              Partner Desk
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: moderateScale(10),
                color: "#D97706",
                fontWeight: "600",
                marginTop: 1,
              }}
            >
              Direct Support
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroCardContainer: {
    overflow: "hidden",
  },
  heroGradient: {
    position: "relative",
    overflow: "hidden",
  },
  heroBackgroundShape: {
    position: "absolute",
    right: -25,
    top: -25,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  heroActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tileCard: {
    flex: 1,
    borderWidth: 1,
    minHeight: 88,
    justifyContent: "space-between",
  },
  tileIconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  tileMicroTag: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
});
