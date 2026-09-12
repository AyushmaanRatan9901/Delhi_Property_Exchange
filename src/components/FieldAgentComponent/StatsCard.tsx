import { Feather } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatCurrency } from "../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../constants/theme";

interface StatsGridProps {
  totalLeads: number;
  verifiedLeads: number;
  convertedLeads: number;
  availableBalance: number;
  onCardPress?: (type: string) => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalLeads,
  verifiedLeads,
  convertedLeads,
  availableBalance,
  onCardPress,
}) => {
  const { t } = useTranslation();
  const { isDark, colors, moderateScale } = useResponsiveTheme();

  const stats = [
    {
      id: "total",
      label: t("fieldAgent.totalLeads"),
      value: totalLeads.toString(),
      sub: t("fieldAgent.myStats"),
      icon: "file-text" as const,
      color: isDark ? "#2DD4BF" : "#0D9488",
      bg: isDark ? "#082F2C" : "#F0FDFA",
      border: isDark ? "#115E59" : "#CCFBF1",
    },
    {
      id: "verified",
      label: t("fieldAgent.verifiedLeads"),
      value: verifiedLeads.toString(),
      sub: t("common.active"),
      icon: "check-circle" as const,
      color: isDark ? "#60A5FA" : "#2563EB",
      bg: isDark ? "#0E2440" : "#EFF6FF",
      border: isDark ? "#1E40AF" : "#DBEAFE",
    },
    {
      id: "converted",
      label: t("fieldAgent.rentedSold"),
      value: convertedLeads.toString(),
      sub: t("common.completed"),
      icon: "award" as const,
      color: isDark ? "#FBBF24" : "#D97706",
      bg: isDark ? "#2E1E08" : "#FFFBEB",
      border: isDark ? "#78350F" : "#FEF3C7",
    },
    {
      id: "wallet",
      label: t("fieldAgent.availableBalance"),
      value: formatCurrency(availableBalance),
      sub: t("wallet.starPartner"),
      icon: "dollar-sign" as const,
      color: isDark ? "#34D399" : "#059669",
      bg: isDark ? "#062A1C" : "#ECFDF5",
      border: isDark ? "#065F46" : "#A7F3D0",
    },
  ];

  return (
    <View style={styles.grid}>
      {stats.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.8}
          onPress={() => onCardPress?.(item.id)}
          style={[
            styles.card,
            { backgroundColor: item.bg, borderColor: item.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrapper, { backgroundColor: item.color }]}>
              <Feather name={item.icon} size={moderateScale(14)} color="#FFFFFF" />
            </View>
            <Text
              style={[
                styles.cardLabel,
                { color: isDark ? colors.textSecondary : "#475569" },
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>

          <Text
            style={[styles.cardValue, { color: item.color }]}
            numberOfLines={1}
          >
            {item.value}
          </Text>
          <Text
            style={[
              styles.cardSub,
              { color: isDark ? colors.textMuted : "#64748B" },
            ]}
            numberOfLines={1}
          >
            {item.sub}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  card: {
    width: "48.5%",
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  iconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: 10.5,
    marginTop: 2,
  },
});
