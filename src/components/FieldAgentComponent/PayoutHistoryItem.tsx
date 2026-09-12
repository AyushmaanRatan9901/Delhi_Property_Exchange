import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency, PayoutTransaction } from "../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../constants/theme";

interface PayoutHistoryItemProps {
  transaction: PayoutTransaction;
}

export const PayoutHistoryItem: React.FC<PayoutHistoryItemProps> = ({
  transaction,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();
  const isCompleted = transaction.status === "COMPLETED";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
          borderColor: isDark ? colors.border : "#E2E8F0",
        },
      ]}
    >
      <View style={styles.leftCol}>
        <View
          style={[
            styles.iconCircle,
            isCompleted
              ? { backgroundColor: isDark ? "#062A1C" : "#ECFDF5" }
              : { backgroundColor: isDark ? "#2E1E08" : "#FEF3C7" },
          ]}
        >
          <Ionicons
            name={isCompleted ? "checkmark-sharp" : "time-outline"}
            size={16}
            color={isCompleted ? (isDark ? "#34D399" : "#059669") : isDark ? "#FBBF24" : "#D97706"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.methodText,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
            numberOfLines={1}
          >
            {transaction.method}
          </Text>
          <Text
            style={[
              styles.refText,
              { color: isDark ? colors.textMuted : "#64748B" },
            ]}
            numberOfLines={1}
          >
            {transaction.referenceId}
          </Text>
          <Text
            style={[
              styles.dateText,
              { color: isDark ? colors.textMuted : "#94A3B8" },
            ]}
          >
            {transaction.date}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text
          style={[
            styles.amountText,
            { color: isDark ? colors.textPrimary : "#0F172A" },
            isCompleted && { color: isDark ? "#34D399" : "#059669" },
          ]}
        >
          + {formatCurrency(transaction.amount)}
        </Text>
        <View
          style={[
            styles.statusPill,
            isCompleted
              ? { backgroundColor: isDark ? "#062A1C" : "#ECFDF5" }
              : { backgroundColor: isDark ? "#2E1E08" : "#FEF3C7" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isCompleted
                ? { color: isDark ? "#34D399" : "#059669" }
                : { color: isDark ? "#FBBF24" : "#B45309" },
            ]}
          >
            {transaction.status}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  methodText: {
    fontSize: 13,
    fontWeight: "700",
  },
  refText: {
    fontSize: 10.5,
    fontFamily: "monospace",
    marginTop: 1,
  },
  dateText: {
    fontSize: 10.5,
    marginTop: 2,
  },
  rightCol: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 14.5,
    fontWeight: "800",
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
});
