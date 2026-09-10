import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { formatCurrency, PayoutTransaction } from "../../constants/fieldAgentData";

interface PayoutHistoryItemProps {
  transaction: PayoutTransaction;
}

export const PayoutHistoryItem: React.FC<PayoutHistoryItemProps> = ({
  transaction,
}) => {
  const isCompleted = transaction.status === "COMPLETED";

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <View
          style={[
            styles.iconCircle,
            isCompleted ? styles.completedCircle : styles.processingCircle,
          ]}
        >
          <Ionicons
            name={isCompleted ? "checkmark-sharp" : "time-outline"}
            size={16}
            color={isCompleted ? "#059669" : "#D97706"}
          />
        </View>
        <View>
          <Text style={styles.methodText}>{transaction.method}</Text>
          <Text style={styles.refText}>{transaction.referenceId}</Text>
          <Text style={styles.dateText}>{transaction.date}</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.amountText, isCompleted && styles.amountCompleted]}>
          + {formatCurrency(transaction.amount)}
        </Text>
        <View
          style={[
            styles.statusPill,
            isCompleted ? styles.statusPillCompleted : styles.statusPillProcessing,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isCompleted ? styles.statusTextCompleted : styles.statusTextProcessing,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 8,
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  completedCircle: {
    backgroundColor: "#ECFDF5",
  },
  processingCircle: {
    backgroundColor: "#FEF3C7",
  },
  methodText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  refText: {
    fontSize: 10.5,
    color: "#64748B",
    fontFamily: "monospace",
    marginTop: 1,
  },
  dateText: {
    fontSize: 10.5,
    color: "#94A3B8",
    marginTop: 2,
  },
  rightCol: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  amountCompleted: {
    color: "#059669",
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusPillCompleted: {
    backgroundColor: "#ECFDF5",
  },
  statusPillProcessing: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  statusTextCompleted: {
    color: "#059669",
  },
  statusTextProcessing: {
    color: "#B45309",
  },
});
