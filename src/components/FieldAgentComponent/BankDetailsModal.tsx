import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { BankDetails } from "../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../constants/theme";

interface BankDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  bankDetails: BankDetails;
  onSave: (details: Partial<BankDetails>) => void;
}

export const BankDetailsModal: React.FC<BankDetailsModalProps> = ({
  visible,
  onClose,
  bankDetails,
  onSave,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();
  const [upiId, setUpiId] = useState(bankDetails?.upiId || "");
  const [accountHolder, setAccountHolder] = useState(bankDetails?.accountHolder || "");
  const [bankName, setBankName] = useState(bankDetails?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(bankDetails?.accountNumber || "");
  const [ifsc, setIfsc] = useState(bankDetails?.ifsc || "");

  // Sync / autofill state whenever modal becomes visible or bankDetails prop updates
  useEffect(() => {
    if (visible && bankDetails) {
      setUpiId(bankDetails.upiId || "");
      setAccountHolder(bankDetails.accountHolder || "");
      setBankName(bankDetails.bankName || "");
      setAccountNumber(bankDetails.accountNumber || "");
      setIfsc(bankDetails.ifsc || "");
    }
  }, [visible, bankDetails]);

  const handleSave = () => {
    if (!upiId.trim()) {
      Alert.alert("Error", "Please enter a valid UPI ID for commission payouts.");
      return;
    }
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    onSave({
      upiId: upiId.trim(),
      accountHolder: accountHolder.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim().toUpperCase(),
    });
    Alert.alert("Success", "Payout Bank & UPI details saved successfully!");
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
                      name="card"
                      size={20}
                      color={isDark ? "#2DD4BF" : "#0D9488"}
                    />
                    <Text
                      style={[
                        styles.title,
                        { color: isDark ? colors.textPrimary : "#0F172A" },
                      ]}
                    >
                      {t("fieldAgent.bankDetailsTitle")}
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

                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.textSecondary : "#475569" },
                  ]}
                >
                  {t("fieldAgent.primaryUpiLabel")}
                </Text>
                <View
                  style={[
                    styles.inputBox,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.input,
                      { color: isDark ? colors.textPrimary : "#0F172A" },
                    ]}
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder="e.g. yourname@okaxis"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    autoCapitalize="none"
                  />
                </View>

                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.textSecondary : "#475569" },
                  ]}
                >
                  {t("fieldAgent.accountHolderLabel")}
                </Text>
                <View
                  style={[
                    styles.inputBox,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.input,
                      { color: isDark ? colors.textPrimary : "#0F172A" },
                    ]}
                    value={accountHolder}
                    onChangeText={setAccountHolder}
                    placeholder="Full name as in bank"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  />
                </View>

                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.textSecondary : "#475569" },
                  ]}
                >
                  {t("fieldAgent.bankNameLabel")}
                </Text>
                <View
                  style={[
                    styles.inputBox,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.input,
                      { color: isDark ? colors.textPrimary : "#0F172A" },
                    ]}
                    value={bankName}
                    onChangeText={setBankName}
                    placeholder="e.g. HDFC Bank"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  />
                </View>

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1.4 }}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? colors.textSecondary : "#475569" },
                      ]}
                    >
                      {t("fieldAgent.accountNumberLabel")}
                    </Text>
                    <View
                      style={[
                        styles.inputBox,
                        {
                          backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                          borderColor: isDark ? colors.border : "#E2E8F0",
                        },
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.input,
                          { color: isDark ? colors.textPrimary : "#0F172A" },
                        ]}
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        placeholder="Account Number"
                        placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.label,
                        { color: isDark ? colors.textSecondary : "#475569" },
                      ]}
                    >
                      {t("fieldAgent.ifscLabel")}
                    </Text>
                    <View
                      style={[
                        styles.inputBox,
                        {
                          backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                          borderColor: isDark ? colors.border : "#E2E8F0",
                        },
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.input,
                          { color: isDark ? colors.textPrimary : "#0F172A" },
                        ]}
                        value={ifsc}
                        onChangeText={setIfsc}
                        placeholder="IFSC"
                        placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSave}
                  style={[
                    styles.saveBtn,
                    { backgroundColor: isDark ? "#14B8A6" : "#0D9488" },
                  ]}
                >
                  <Text style={styles.saveBtnText}>{t("fieldAgent.saveBankBtn")}</Text>
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
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 16.5,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 4,
  },
  inputBox: {
    borderWidth: 1.2,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: "center",
  },
  input: {
    fontSize: 14,
    fontWeight: "600",
  },
  rowInputs: {
    flexDirection: "row",
    gap: 10,
  },
  saveBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
