import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCodeDisplay from "./QRCodeDisplay";
import { formatCurrency, PaymentInstructions } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantPaymentModalProps {
  visible: boolean;
  month: string;
  amount: number;
  instructions: PaymentInstructions;
  onClose: () => void;
  onPaymentSuccess: (result: { month: string; amount: number; paymentMode: string; utrNumber: string; receiptId: string }) => void;
}

export const TenantPaymentModal: React.FC<TenantPaymentModalProps> = ({
  visible,
  month,
  amount,
  instructions,
  onClose,
  onPaymentSuccess,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const [activeTab, setActiveTab] = useState<"QR" | "BANK" | "DIRECT">("QR");
  const [utrInput, setUtrInput] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<{ utr: string; receiptId: string } | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  const handleSubmitPayment = async (mode: string = "UPI") => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    setIsSubmitting(true);

    const utr = utrInput.trim() || `UPI/${Date.now().toString().slice(-8)}`;
    const receiptId = `RCP-${Date.now().toString().slice(-6)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessResult({ utr, receiptId });
      onPaymentSuccess({
        month,
        amount,
        paymentMode: mode,
        utrNumber: utr,
        receiptId,
      });
    }, 1200);
  };

  const handleResetAndClose = () => {
    setSuccessResult(null);
    setUtrInput("");
    setIsSubmitting(false);
    onClose();
  };

  const qrPayload = `upi://pay?pa=${instructions.upiId}&pn=${encodeURIComponent(instructions.merchantName)}&am=${amount}&cu=INR&tn=Rent_${month.replace(/\s/g, "_")}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleResetAndClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                Pay Rent — {month}
              </Text>
              <Text style={[styles.modalSub, { color: isDark ? colors.textSecondary : "#64748B" }]}>
                Zero Transaction Fees • Instant Verification
              </Text>
            </View>
            <TouchableOpacity onPress={handleResetAndClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={isDark ? colors.textMuted : "#64748B"} />
            </TouchableOpacity>
          </View>

          {/* If Payment Succeeded */}
          {successResult ? (
            <View style={styles.successContainer}>
              <View style={[styles.successCircle, { backgroundColor: isDark ? "#062A1C" : "#DCFCE7" }]}>
                <Ionicons name="checkmark-circle" size={54} color={isDark ? "#34D399" : "#16A34A"} />
              </View>
              <Text style={[styles.successTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                Payment Submitted Successfully!
              </Text>
              <Text style={[styles.successSubtitle, { color: isDark ? colors.textSecondary : "#64748B" }]}>
                Rent of {formatCurrency(amount)} for {month} is verified and recorded in your tenancy ledger.
              </Text>

              <View
                style={[
                  styles.receiptInfoBox,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#E2E8F0",
                  },
                ]}
              >
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Receipt Number</Text>
                  <Text style={[styles.infoVal, { color: isDark ? "#38BDF8" : "#0284C7" }]}>{successResult.receiptId}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Reference UTR</Text>
                  <Text style={[styles.infoVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>{successResult.utr}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Paid Amount</Text>
                  <Text style={[styles.infoVal, { color: isDark ? "#34D399" : "#16A34A", fontWeight: "900" }]}>
                    {formatCurrency(amount)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.doneBtn, { backgroundColor: isDark ? "#0284C7" : "#0284C7" }]}
                onPress={handleResetAndClose}
                activeOpacity={0.8}
              >
                <Text style={styles.doneBtnText}>View Receipt & Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Amount Banner */}
              <View
                style={[
                  styles.amountBanner,
                  {
                    backgroundColor: isDark ? "#0C293D" : "#F0F9FF",
                    borderColor: isDark ? "#0369A1" : "#BAE6FD",
                  },
                ]}
              >
                <Text style={[styles.amountBannerLabel, { color: isDark ? "#7DD3FC" : "#0369A1" }]}>
                  Total Rent Due
                </Text>
                <Text style={[styles.amountBannerVal, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                  {formatCurrency(amount)}
                </Text>
              </View>

              {/* Method Switcher Tabs */}
              <View
                style={[
                  styles.tabBar,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    activeTab === "QR" && {
                      backgroundColor: isDark ? "#0284C7" : "#FFFFFF",
                      shadowColor: "#000",
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setActiveTab("QR")}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={15}
                    color={activeTab === "QR" ? (isDark ? "#FFFFFF" : "#0284C7") : (isDark ? "#94A3B8" : "#64748B")}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === "QR" ? (isDark ? "#FFFFFF" : "#0284C7") : (isDark ? "#94A3B8" : "#64748B") },
                    ]}
                  >
                    UPI QR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    activeTab === "BANK" && {
                      backgroundColor: isDark ? "#0284C7" : "#FFFFFF",
                      shadowColor: "#000",
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setActiveTab("BANK")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="business-outline"
                    size={15}
                    color={activeTab === "BANK" ? (isDark ? "#FFFFFF" : "#0284C7") : (isDark ? "#94A3B8" : "#64748B")}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === "BANK" ? (isDark ? "#FFFFFF" : "#0284C7") : (isDark ? "#94A3B8" : "#64748B") },
                    ]}
                  >
                    Bank Transfer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabItem,
                    activeTab === "DIRECT" && {
                      backgroundColor: isDark ? "#0284C7" : "#FFFFFF",
                      shadowColor: "#000",
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setActiveTab("DIRECT")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="flash"
                    size={15}
                    color={activeTab === "DIRECT" ? (isDark ? "#FFFFFF" : "#0284C7") : (isDark ? "#94A3B8" : "#64748B")}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      { color: activeTab === "DIRECT" ? (isDark ? "#FFFFFF" : "#0284C7") : (isDark ? "#94A3B8" : "#64748B") },
                    ]}
                  >
                    Instant Pay
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab 1: UPI QR Code */}
              {activeTab === "QR" && (
                <View style={styles.qrSection}>
                  <View style={styles.qrContainer}>
                    <QRCodeDisplay value={qrPayload} size={180} backgroundColor="#FFFFFF" color="#0F172A" />
                  </View>

                  <View style={styles.copyRow}>
                    <Text style={[styles.copyLabel, { color: isDark ? colors.textSecondary : "#64748B" }]}>
                      UPI ID: <Text style={{ fontWeight: "800", color: isDark ? colors.textPrimary : "#0F172A" }}>{instructions.upiId}</Text>
                    </Text>
                    <TouchableOpacity
                      style={[styles.copyBtn, { backgroundColor: isDark ? "#0C293D" : "#E0F2FE" }]}
                      onPress={() => copyToClipboard(instructions.upiId, "upi")}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={copiedField === "upi" ? "checkmark" : "copy-outline"}
                        size={14}
                        color={isDark ? "#38BDF8" : "#0284C7"}
                      />
                      <Text style={[styles.copyBtnText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                        {copiedField === "upi" ? "Copied!" : "Copy"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.scanHint, { color: isDark ? colors.textMuted : "#94A3B8" }]}>
                    Scan using Google Pay, PhonePe, Paytm, or BHIM. After payment, enter your 12-digit UTR below.
                  </Text>
                </View>
              )}

              {/* Tab 2: Bank Transfer Details */}
              {activeTab === "BANK" && (
                <View style={styles.bankSection}>
                  <View
                    style={[
                      styles.bankCard,
                      {
                        backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                        borderColor: isDark ? colors.border : "#E2E8F0",
                      },
                    ]}
                  >
                    <View style={styles.bankFieldRow}>
                      <View>
                        <Text style={[styles.bankLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Account Name</Text>
                        <Text style={[styles.bankVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                          {instructions.merchantName}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.bankFieldRow}>
                      <View>
                        <Text style={[styles.bankLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Account Number</Text>
                        <Text style={[styles.bankVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                          {instructions.accountNumber}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.copyBtn, { backgroundColor: isDark ? "#0C293D" : "#E0F2FE" }]}
                        onPress={() => copyToClipboard(instructions.accountNumber, "acc")}
                      >
                        <Text style={[styles.copyBtnText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                          {copiedField === "acc" ? "Copied" : "Copy"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.bankFieldRow}>
                      <View>
                        <Text style={[styles.bankLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>IFSC Code</Text>
                        <Text style={[styles.bankVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                          {instructions.ifscCode}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.copyBtn, { backgroundColor: isDark ? "#0C293D" : "#E0F2FE" }]}
                        onPress={() => copyToClipboard(instructions.ifscCode, "ifsc")}
                      >
                        <Text style={[styles.copyBtnText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                          {copiedField === "ifsc" ? "Copied" : "Copy"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.bankFieldRow}>
                      <View>
                        <Text style={[styles.bankLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Bank & Branch</Text>
                        <Text style={[styles.bankVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                          {instructions.bankName}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Tab 3: Instant App Simulation */}
              {activeTab === "DIRECT" && (
                <View style={styles.directSection}>
                  <View
                    style={[
                      styles.directCard,
                      {
                        backgroundColor: isDark ? "#082F2C" : "#ECFDF5",
                        borderColor: isDark ? "#0D9488" : "#6EE7B7",
                      },
                    ]}
                  >
                    <Ionicons name="shield-checkmark" size={32} color={isDark ? "#2DD4BF" : "#059669"} />
                    <Text style={[styles.directTitle, { color: isDark ? "#2DD4BF" : "#065F46" }]}>
                      Instant Gateway Clearance
                    </Text>
                    <Text style={[styles.directDesc, { color: isDark ? "#99F6E4" : "#047857" }]}>
                      Simulate immediate payment processing with auto-generated bank UTR verification and zero wait time.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.instantPayBtn, { backgroundColor: isDark ? "#0D9488" : "#0D9488" }]}
                    onPress={() => handleSubmitPayment("Instant Gateway")}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="flash" size={18} color="#FFFFFF" />
                        <Text style={styles.instantPayBtnText}>Simulate Instant Pay ({formatCurrency(amount)})</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* UTR Input & Submit Confirmation (for QR / Bank tabs) */}
              {activeTab !== "DIRECT" && (
                <View style={styles.utrSection}>
                  <Text style={[styles.inputLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                    Enter 12-Digit UTR / Transaction Reference
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                        borderColor: isDark ? colors.border : "#CBD5E1",
                        color: isDark ? colors.textPrimary : "#0F172A",
                      },
                    ]}
                    placeholder="e.g. 260904889211 or UPI/..."
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    value={utrInput}
                    onChangeText={setUtrInput}
                    autoCapitalize="characters"
                  />

                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      {
                        backgroundColor: isDark ? "#0284C7" : "#0284C7",
                        opacity: isSubmitting ? 0.7 : 1,
                      },
                    ]}
                    onPress={() => handleSubmitPayment(activeTab === "QR" ? "UPI QR" : "Bank Transfer")}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                        <Text style={styles.confirmBtnText}>I Have Paid • Submit Confirmation</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: "92%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  amountBanner: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  amountBannerLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  amountBannerVal: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 11,
    gap: 5,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "800",
  },
  qrSection: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  qrContainer: {
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  copyLabel: {
    fontSize: 13,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  scanHint: {
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  bankSection: {
    paddingVertical: 4,
  },
  bankCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  bankFieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  bankVal: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  directSection: {
    gap: 14,
    paddingVertical: 8,
  },
  directCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  directTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  directDesc: {
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
  },
  instantPayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  instantPayBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  utrSection: {
    gap: 8,
    marginTop: 4,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "700",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  successContainer: {
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  receiptInfoBox: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoVal: {
    fontSize: 13,
    fontWeight: "800",
  },
  doneBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
