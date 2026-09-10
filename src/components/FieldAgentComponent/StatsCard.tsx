import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatCurrency } from "../../constants/fieldAgentData";

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
  const stats = [
    {
      id: "total",
      label: "Total Leads",
      value: totalLeads.toString(),
      sub: "Submitted by you",
      icon: "file-text" as const,
      color: "#0D9488",
      bg: "#F0FDFA",
      border: "#CCFBF1",
    },
    {
      id: "verified",
      label: "Verified",
      value: verifiedLeads.toString(),
      sub: "Active on platform",
      icon: "check-circle" as const,
      color: "#2563EB",
      bg: "#EFF6FF",
      border: "#DBEAFE",
    },
    {
      id: "converted",
      label: "Rented / Sold",
      value: convertedLeads.toString(),
      sub: "Commission earned",
      icon: "award" as const,
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FEF3C7",
    },
    {
      id: "wallet",
      label: "Wallet Balance",
      value: formatCurrency(availableBalance),
      sub: "Ready for payout",
      icon: "dollar-sign" as const,
      color: "#059669",
      bg: "#ECFDF5",
      border: "#D1FAE5",
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
              <Feather name={item.icon} size={15} color="#FFFFFF" />
            </View>
            <Text style={styles.cardLabel}>{item.label}</Text>
          </View>

          <Text style={[styles.cardValue, { color: item.color }]} numberOfLines={1}>
            {item.value}
          </Text>
          <Text style={styles.cardSub} numberOfLines={1}>
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
    gap: 10,
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
    color: "#475569",
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 2,
  },
});
