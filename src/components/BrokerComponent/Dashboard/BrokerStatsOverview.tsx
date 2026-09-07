import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsiveTheme } from "../../../constants/theme";

export interface BrokerStatsData {
  totalProperties: number;
  activeProperties: number;
  occupiedProperties: number;
  totalCommission: number;
  totalDeals: number;
  monthlyRevenue: number;
  monthlyGrowthPercent: number;
  monthlyDealsCount: number;
  pendingCommission: number;
  pendingDealsCount: number;
}

interface BrokerStatsOverviewProps {
  stats?: BrokerStatsData;
  onCardPress?: (metric: "properties" | "commission" | "monthly" | "pending") => void;
}

const DEFAULT_STATS: BrokerStatsData = {
  totalProperties: 28,
  activeProperties: 24,
  occupiedProperties: 4,
  totalCommission: 384500,
  totalDeals: 42,
  monthlyRevenue: 68400,
  monthlyGrowthPercent: 18.4,
  monthlyDealsCount: 8,
  pendingCommission: 32500,
  pendingDealsCount: 3,
};

export const BrokerStatsOverview: React.FC<BrokerStatsOverviewProps> = ({
  stats = DEFAULT_STATS,
  onCardPress,
}) => {
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } =
    useResponsiveTheme();

  const formatCurrency = (val: number) => {
    return `₹${new Intl.NumberFormat("en-IN").format(val)}`;
  };

  return (
    <View style={{ paddingHorizontal: spacing.screenHorizontal, marginTop: spacing.md }}>
      {/* Section Title */}
      <View style={[layout.horizontalViewBetween, { marginBottom: spacing.sm }]}>
        <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
          <MaterialCommunityIcons
            name="chart-timeline-variant-shimmer"
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
            Broker Performance & Earnings
          </Text>
        </View>

        <View
          style={[
            styles.liveIndicator,
            {
              backgroundColor: isDark
                ? "rgba(13, 148, 136, 0.15)"
                : colors.primaryLight,
              borderRadius: radii.pill,
            },
          ]}
        >
          <Text
            style={{
              fontSize: moderateScale(10.5),
              fontWeight: "700",
              color: colors.primary,
            }}
          >
            ● Realtime Sync
          </Text>
        </View>
      </View>

      {/* 2x2 Glass KPI Grid */}
      <View style={{ gap: spacing.sm }}>
        {/* Row 1: Total Properties Registered + Total Lifetime Commission */}
        <View style={[layout.horizontalView, { gap: spacing.sm }]}>
          {/* Card 1: Total Registered Properties */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onCardPress?.("properties")}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
              shadows.sm,
            ]}
          >
            <View style={layout.horizontalViewBetween}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(2, 132, 199, 0.18)"
                      : "#E0F2FE",
                    borderRadius: radii.lg,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="home-city"
                  size={moderateScale(20)}
                  color="#0284C7"
                />
              </View>

              <View
                style={[
                  styles.statusTag,
                  {
                    backgroundColor: isDark
                      ? "rgba(16, 185, 129, 0.15)"
                      : "#ECFDF5",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(9.5),
                    fontWeight: "800",
                    color: "#059669",
                  }}
                >
                  {stats.activeProperties} LIVE
                </Text>
              </View>
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "600",
                  color: colors.textSecondary,
                }}
              >
                My Registered Stays
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(22),
                  fontWeight: "900",
                  color: colors.textPrimary,
                  marginTop: 2,
                }}
              >
                {stats.totalProperties}
                <Text
                  style={{
                    fontSize: moderateScale(13),
                    fontWeight: "600",
                    color: colors.textMuted,
                  }}
                >
                  {" "}
                  Properties
                </Text>
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  fontSize: moderateScale(10.5),
                  color: colors.textMuted,
                  fontWeight: "500",
                  marginTop: 4,
                }}
              >
                {stats.activeProperties} Active • {stats.occupiedProperties} Leased
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: Total Commission Earned */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onCardPress?.("commission")}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
              shadows.sm,
            ]}
          >
            <View style={layout.horizontalViewBetween}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(16, 185, 129, 0.18)"
                      : "#DCFCE7",
                    borderRadius: radii.lg,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={moderateScale(20)}
                  color="#15803D"
                />
              </View>

              <View
                style={[
                  styles.statusTag,
                  {
                    backgroundColor: isDark
                      ? "rgba(245, 158, 11, 0.15)"
                      : "#FEF3C7",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(9.5),
                    fontWeight: "800",
                    color: "#D97706",
                  }}
                >
                  {stats.totalDeals} DEALS
                </Text>
              </View>
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "600",
                  color: colors.textSecondary,
                }}
              >
                Total Commission
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(21),
                  fontWeight: "900",
                  color: "#059669",
                  marginTop: 2,
                }}
              >
                {formatCurrency(stats.totalCommission)}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  fontSize: moderateScale(10.5),
                  color: colors.textMuted,
                  fontWeight: "500",
                  marginTop: 4,
                }}
              >
                Lifetime Earned Payouts
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 2: Monthly Revenue + Pending / In-Escrow Commission */}
        <View style={[layout.horizontalView, { gap: spacing.sm }]}>
          {/* Card 3: Monthly Revenue */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onCardPress?.("monthly")}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.md,
                overflow: "hidden",
              },
              shadows.sm,
            ]}
          >
            {/* Subtle Gradient Accent on top */}
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardTopBar}
            />

            <View style={layout.horizontalViewBetween}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(13, 148, 136, 0.18)"
                      : colors.primaryLight,
                    borderRadius: radii.lg,
                  },
                ]}
              >
                <Feather
                  name="trending-up"
                  size={moderateScale(19)}
                  color={colors.primary}
                />
              </View>

              <View
                style={[
                  styles.growthChip,
                  {
                    backgroundColor: isDark
                      ? "rgba(16, 185, 129, 0.2)"
                      : "#DCFCE7",
                  },
                ]}
              >
                <Feather
                  name="arrow-up-right"
                  size={moderateScale(11)}
                  color="#15803D"
                />
                <Text
                  style={{
                    fontSize: moderateScale(9.5),
                    fontWeight: "800",
                    color: "#15803D",
                  }}
                >
                  +{stats.monthlyGrowthPercent}%
                </Text>
              </View>
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "600",
                  color: colors.textSecondary,
                }}
              >
                Monthly Revenue
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(21),
                  fontWeight: "900",
                  color: colors.primary,
                  marginTop: 2,
                }}
              >
                {formatCurrency(stats.monthlyRevenue)}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  fontSize: moderateScale(10.5),
                  color: colors.textMuted,
                  fontWeight: "500",
                  marginTop: 4,
                }}
              >
                {stats.monthlyDealsCount} Deals closed this month
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 4: Pending / Escrow Commission */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onCardPress?.("pending")}
            style={[
              styles.kpiCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
              shadows.sm,
            ]}
          >
            <View style={layout.horizontalViewBetween}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(245, 158, 11, 0.18)"
                      : "#FEF3C7",
                    borderRadius: radii.lg,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="clock-fast"
                  size={moderateScale(20)}
                  color="#D97706"
                />
              </View>

              <View
                style={[
                  styles.statusTag,
                  {
                    backgroundColor: isDark
                      ? "rgba(239, 68, 68, 0.15)"
                      : "#FEE2E2",
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(9.5),
                    fontWeight: "800",
                    color: "#DC2626",
                  }}
                >
                  ESCROW
                </Text>
              </View>
            </View>

            <View style={{ marginTop: spacing.sm }}>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "600",
                  color: colors.textSecondary,
                }}
              >
                Pending Payouts
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(21),
                  fontWeight: "900",
                  color: "#D97706",
                  marginTop: 2,
                }}
              >
                {formatCurrency(stats.pendingCommission)}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  fontSize: moderateScale(10.5),
                  color: colors.textMuted,
                  fontWeight: "500",
                  marginTop: 4,
                }}
              >
                {stats.pendingDealsCount} Deals awaiting move-in
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  liveIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  kpiCard: {
    flex: 1,
    borderWidth: 1,
    position: "relative",
  },
  cardTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  growthChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 1,
  },
});
