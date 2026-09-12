import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BankDetails, formatCurrency } from "../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../constants/theme";

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
  const { isDark, colors } = useResponsiveTheme();
  const [amountStr, setAmountStr] = useState(availableBalance.toString());
  const [selectedMethod, setSelectedMethod] = useState<"UPI" | "BANK">("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmountStr(availableBalance > 0 ? availableBalance.toString() : "");
    }
  }, [visible, availableBalance]);

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
    const methodDesc = selectedMethod === "UPI" ? `UPI (${bankDetails?.upiId || ''})` : `Bank (${bankDetails?.bankName || ''})`;
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={styles.overlay}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.container,
                { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF" },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                bounces={false}
              >
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name="flash"
                size={20}
                color={isDark ? "#2DD4BF" : "#0D9488"}
              />
              <Text
                style={[
                  styles.title,
                  { color: isDark ? colors.textPrimary : "#0F172A" },
                ]}
              >
                Instant Commission Payout
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather
                name="x"
                size={20}
                color={isDark ? colors.textMuted : "#0F172A"}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.availBox,
              {
                backgroundColor: isDark ? "#082F2C" : "#F0FDFA",
                borderColor: isDark ? "#115E59" : "#CCFBF1",
              },
            ]}
          >
            <Text
              style={[
                styles.availLabel,
                { color: isDark ? "#2DD4BF" : "#0F766E" },
              ]}
            >
              Available Balance:
            </Text>
            <Text
              style={[
                styles.availValue,
                { color: isDark ? "#34D399" : "#0D9488" },
              ]}
            >
              {formatCurrency(availableBalance)}
            </Text>
          </View>

          <Text
            style={[
              styles.inputLabel,
              { color: isDark ? colors.textSecondary : "#475569" },
            ]}
          >
            Enter Amount to Withdraw
          </Text>
          <View
            style={[
              styles.amountInputBox,
              {
                backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
            ]}
          >
            <Text
              style={[
                styles.currencyPrefix,
                { color: isDark ? "#2DD4BF" : "#0D9488" },
              ]}
            >
              ₹
            </Text>
            <TextInput
              style={[
                styles.amountInput,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
              keyboardType="numeric"
              value={amountStr}
              onChangeText={setAmountStr}
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            />
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            {[2000, 5000, availableBalance].map((preset, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setAmountStr(preset.toString())}
                style={[
                  styles.presetPill,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.presetText,
                    { color: isDark ? colors.textSecondary : "#475569" },
                  ]}
                >
                  {formatCurrency(preset)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Method Selection */}
          <Text
            style={[
              styles.inputLabel,
              { marginTop: 14, color: isDark ? colors.textSecondary : "#475569" },
            ]}
          >
            Payout Destination
          </Text>
          <TouchableOpacity
            onPress={() => setSelectedMethod("UPI")}
            style={[
              styles.methodOption,
              {
                backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
              selectedMethod === "UPI" && {
                borderColor: isDark ? "#2DD4BF" : "#0D9488",
                backgroundColor: isDark ? "#082F2C" : "#F0FDFA",
              },
            ]}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={isDark ? "#2DD4BF" : "#0D9488"}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.methodTitle,
                  { color: isDark ? colors.textPrimary : "#0F172A" },
                ]}
              >
                UPI Instant Transfer
              </Text>
              <Text
                style={[
                  styles.methodSub,
                  { color: isDark ? colors.textMuted : "#64748B" },
                ]}
              >
                {bankDetails?.upiId || "Not Linked"}
              </Text>
            </View>
            <Ionicons
              name={
                selectedMethod === "UPI" ? "checkmark-circle" : "ellipse-outline"
              }
              size={20}
              color={
                selectedMethod === "UPI"
                  ? isDark
                    ? "#2DD4BF"
                    : "#0D9488"
                  : isDark
                  ? "#64748B"
                  : "#94A3B8"
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSelectedMethod("BANK")}
            style={[
              styles.methodOption,
              {
                backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
              selectedMethod === "BANK" && {
                borderColor: isDark ? "#2DD4BF" : "#0D9488",
                backgroundColor: isDark ? "#082F2C" : "#F0FDFA",
              },
            ]}
          >
            <Ionicons
              name="business-outline"
              size={20}
              color={isDark ? "#2DD4BF" : "#0D9488"}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.methodTitle,
                  { color: isDark ? colors.textPrimary : "#0F172A" },
                ]}
              >
                Direct Bank Account
              </Text>
              <Text
                style={[
                  styles.methodSub,
                  { color: isDark ? colors.textMuted : "#64748B" },
                ]}
              >
                {bankDetails?.bankName || "Bank"}{" "}
                {bankDetails?.accountNumber
                  ? `• ${String(bankDetails.accountNumber).slice(-4)}`
                  : ""}
              </Text>
            </View>
            <Ionicons
              name={
                selectedMethod === "BANK" ? "checkmark-circle" : "ellipse-outline"
              }
              size={20}
              color={
                selectedMethod === "BANK"
                  ? isDark
                    ? "#2DD4BF"
                    : "#0D9488"
                  : isDark
                  ? "#64748B"
                  : "#94A3B8"
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleWithdraw}
            disabled={isSubmitting}
            style={[
              styles.submitBtn,
              { backgroundColor: isDark ? "#14B8A6" : "#0D9488" },
            ]}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting
                ? "Processing..."
                : `Withdraw ${formatCurrency(parsedAmount)}`}
            </Text>
          </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  container: {
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
  },
  closeBtn: {
    padding: 6,
  },
  availBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  availLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  availValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 6,
  },
  amountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: "800",
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
  },
  presetsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  presetText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.2,
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginTop: 6,
  },
  methodTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  methodSub: {
    fontSize: 11.5,
  },
  submitBtn: {
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
