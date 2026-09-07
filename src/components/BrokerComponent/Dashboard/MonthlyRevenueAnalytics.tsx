import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsiveTheme } from "../../../constants/theme";

interface MonthlyRevenueAnalyticsProps {
  currentMonthlyRevenue?: number;
  monthlyTarget?: number;
  onWithdrawPress?: () => void;
  onViewStatementPress?: () => void;
}

const MONTHLY_BAR_DATA = [
  { month: "Apr", amount: 38000, deals: 4 },
  { month: "May", amount: 46500, deals: 5 },
  { month: "Jun", amount: 52000, deals: 6 },
  { month: "Jul", amount: 61200, deals: 7 },
  { month: "Aug", amount: 58000, deals: 6 },
  { month: "Sep", amount: 68400, deals: 8, isCurrent: true },
];

export const MonthlyRevenueAnalytics: React.FC<
  MonthlyRevenueAnalyticsProps
> = ({
  currentMonthlyRevenue = 68400,
  monthlyTarget = 100000,
  onWithdrawPress,
  onViewStatementPress,
}) => {
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } =
    useResponsiveTheme();

  const [selectedMonth, setSelectedMonth] = useState<string>("Sep");

  const progressPercent = Math.min(
    100,
    Math.round((currentMonthlyRevenue / monthlyTarget) * 100)
  );

  const maxAmount = Math.max(...MONTHLY_BAR_DATA.map((d) => d.amount));

  const formatK = (val: number) => {
    return `₹${(val / 1000).toFixed(0)}k`;
  };

  const activeBarData =
    MONTHLY_BAR_DATA.find((m) => m.month === selectedMonth) ||
    MONTHLY_BAR_DATA[MONTHLY_BAR_DATA.length - 1];

  return (
    <View
      style={{
        paddingHorizontal: spacing.screenHorizontal,
        marginTop: spacing.lg,
      }}
    >
      <View
        style={[
          styles.containerCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            borderRadius: radii.xxl,
            padding: spacing.md + 2,
          },
          shadows.sm,
        ]}
      >
        {/* Header with Monthly Revenue Milestone */}
        <View style={layout.horizontalViewBetween}>
          <View>
            <View style={[layout.horizontalView, { alignItems: "center", gap: 5 }]}>
              <MaterialCommunityIcons
                name="finance"
                size={moderateScale(18)}
                color={colors.primary}
              />
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(14.5),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                Monthly Revenue Trend
              </Text>
            </View>
            <Text
              style={{
                fontSize: moderateScale(11),
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              Goal: ₹1,00,000 / month • {progressPercent}% Achieved
            </Text>
          </View>

          {/* Withdraw / Payout Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={
              onWithdrawPress ||
              (() =>
                Alert.alert(
                  "Instant Payout Transfer",
                  `Ready to withdraw ₹${new Intl.NumberFormat("en-IN").format(
                    currentMonthlyRevenue
                  )} to registered HDFC Bank A/c ****4821.`
                ))
            }
            style={[
              styles.withdrawBtn,
              {
                borderRadius: radii.pill,
                overflow: "hidden",
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.withdrawGradient}
            >
              <MaterialCommunityIcons
                name="bank-transfer-out"
                size={moderateScale(14)}
                color={colors.white}
                style={{ marginRight: 3 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "700",
                  color: colors.white,
                }}
              >
                Payouts
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Progress Bar Container */}
        <View style={{ marginTop: spacing.md }}>
          <View style={layout.horizontalViewBetween}>
            <Text
              style={{
                fontSize: moderateScale(11),
                fontWeight: "700",
                color: colors.primary,
              }}
            >
              Current: ₹{new Intl.NumberFormat("en-IN").format(currentMonthlyRevenue)}
            </Text>
            <Text
              style={{
                fontSize: moderateScale(11),
                fontWeight: "600",
                color: colors.textMuted,
              }}
            >
              Target: ₹1,00,000
            </Text>
          </View>

          <View
            style={[
              styles.progressBarTrack,
              {
                backgroundColor: isDark ? colors.surfaceHover : "#E2E8F0",
                borderRadius: radii.pill,
                marginTop: 6,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark || "#0F766E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%`, borderRadius: radii.pill },
              ]}
            />
          </View>
        </View>

        {/* 6-Month Visual Bar Chart */}
        <View
          style={[
            styles.chartWrapper,
            {
              backgroundColor: isDark
                ? "rgba(15, 23, 42, 0.4)"
                : colors.surfaceLight,
              borderColor: colors.borderLight,
              borderRadius: radii.xl,
              marginTop: spacing.md,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.barsContainer}>
            {MONTHLY_BAR_DATA.map((item) => {
              const barHeightPct = Math.round((item.amount / maxAmount) * 100);
              const isSelected = selectedMonth === item.month;

              return (
                <TouchableOpacity
                  key={item.month}
                  activeOpacity={0.8}
                  onPress={() => setSelectedMonth(item.month)}
                  style={styles.barColumn}
                >
                  {/* Amount Pill on hover/selected */}
                  <Text
                    style={[
                      styles.barAmountText,
                      {
                        color: isSelected ? colors.primary : colors.textMuted,
                        fontWeight: isSelected ? "800" : "500",
                        fontSize: moderateScale(9),
                      },
                    ]}
                  >
                    {formatK(item.amount)}
                  </Text>

                  {/* Vertical Bar */}
                  <View style={styles.barTrack}>
                    <LinearGradient
                      colors={
                        isSelected
                          ? [colors.primary, colors.primaryDark]
                          : isDark
                          ? ["#334155", "#475569"]
                          : ["#CBD5E1", "#94A3B8"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeightPct}%`,
                          borderRadius: radii.sm,
                        },
                      ]}
                    />
                  </View>

                  {/* Month Label */}
                  <Text
                    style={[
                      styles.barLabel,
                      {
                        fontSize: moderateScale(10.5),
                        fontWeight: isSelected ? "800" : "600",
                        color: isSelected
                          ? colors.primary
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Month Summary Footer */}
          <View
            style={[
              layout.horizontalViewBetween,
              styles.selectedMonthFooter,
              {
                borderTopColor: colors.borderLight,
                paddingTop: spacing.xs + 2,
                marginTop: spacing.sm,
              },
            ]}
          >
            <Text
              style={{
                fontSize: moderateScale(11),
                color: colors.textSecondary,
                fontWeight: "600",
              }}
            >
              📅 {activeBarData.month} 2026 Summary:
            </Text>
            <Text
              style={{
                fontSize: moderateScale(11.5),
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              ₹{new Intl.NumberFormat("en-IN").format(activeBarData.amount)} (
              {activeBarData.deals} Deals)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerCard: {
    borderWidth: 1,
  },
  withdrawBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  withdrawGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressBarTrack: {
    height: 8,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
  },
  chartWrapper: {
    borderWidth: 1,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 110,
    paddingTop: 14,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  barAmountText: {
    marginBottom: 4,
  },
  barTrack: {
    height: 70,
    width: 14,
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
  },
  barLabel: {
    marginTop: 6,
  },
  selectedMonthFooter: {
    borderTopWidth: 1,
  },
});
