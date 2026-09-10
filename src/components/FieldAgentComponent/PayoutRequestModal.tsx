import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BankDetails, formatCurrency } from "../../constants/fieldAgentData";

interface PayoutRequestModalProps {
  visible: boolean;
  onClose: () => void;
  availableBalance: number;
  bankDetails: BankDetails;
  onRequestPayout: (amount: number, method: string) => Promise<boolean>;
}

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({
  visible,
  onClose,
  availableBalance,
  bankDetails,
  onRequestPayout,
}) => {
  const [amountStr, setAmountStr] = useState(availableBalance.toString());
  const [selectedMethod, setSelectedMethod] = useState<"UPI" | "BANK">("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseInt(amountStr, 10) || 0;

  const handleWithdraw = async () => {
    if (parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter an amount greater than zero.");
      return;
    }
    if (parsedAmount > availableBalance) {
      Alert.alert("Insufficient Balance", "Withdrawal amount cannot exceed available balance.");
      return;
    }

    setIsSubmitting(true);
    const methodDesc = selectedMethod === "UPI" ? `UPI (${bankDetails.upiId})` : `Bank (${bankDetails.bankName})`;
    await onRequestPayout(parsedAmount, methodDesc);
    setIsSubmitting(false);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    Alert.alert(
      "Payout Request Sent! 🎉",
      `Your withdrawal request for ${formatCurrency(parsedAmount)} has been submitted. It will be credited within 2-4 hours.`
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="flash" size={20} color="#0D9488" />
              <Text style={styles.title}>Instant Commission Payout</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <View style={styles.availBox}>
            <Text style={styles.availLabel}>Available Balance:</Text>
            <Text style={styles.availValue}>{formatCurrency(availableBalance)}</Text>
          </View>

          <Text style={styles.inputLabel}>Enter Amount to Withdraw</Text>
          <View style={styles.amountInputBox}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={amountStr}
              onChangeText={setAmountStr}
            />
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            {[2000, 5000, availableBalance].map((preset, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setAmountStr(preset.toString())}
                style={styles.presetPill}
              >
                <Text style={styles.presetText}>{formatCurrency(preset)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Method Selection */}
          <Text style={[styles.inputLabel, { marginTop: 14 }]}>Payout Destination</Text>
          <TouchableOpacity
            onPress={() => setSelectedMethod("UPI")}
            style={[
              styles.methodOption,
              selectedMethod === "UPI" && styles.methodOptionActive,
            ]}
          >
            <Ionicons name="phone-portrait-outline" size={20} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>UPI Instant Transfer</Text>
              <Text style={styles.methodSub}>{bankDetails.upiId}</Text>
            </View>
            <Ionicons
              name={selectedMethod === "UPI" ? "checkmark-circle" : "ellipse-outline"}
              size={20}
              color={selectedMethod === "UPI" ? "#0D9488" : "#94A3B8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedMethod("BANK")}
            style={[
              styles.methodOption,
              selectedMethod === "BANK" && styles.methodOptionActive,
            ]}
          >
            <Ionicons name="business-outline" size={20} color="#0D9488" />
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Direct Bank Account</Text>
              <Text style={styles.methodSub}>{bankDetails.bankName} • {bankDetails.accountNumber}</Text>
            </View>
            <Ionicons
              name={selectedMethod === "BANK" ? "checkmark-circle" : "ellipse-outline"}
              size={20}
              color={selectedMethod === "BANK" ? "#0D9488" : "#94A3B8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleWithdraw}
            disabled={isSubmitting}
            style={styles.submitBtn}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? "Processing..." : `Withdraw ${formatCurrency(parsedAmount)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  closeBtn: {
    padding: 6,
  },
  availBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  availLabel: {
    fontSize: 13,
    color: "#0F766E",
    fontWeight: "600",
  },
  availValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0D9488",
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  amountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0D9488",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  presetsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  presetPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  presetText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#475569",
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginTop: 6,
  },
  methodOptionActive: {
    borderColor: "#0D9488",
    backgroundColor: "#F0FDFA",
  },
  methodTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  methodSub: {
    fontSize: 11.5,
    color: "#64748B",
  },
  submitBtn: {
    backgroundColor: "#0D9488",
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800",
  },
});
