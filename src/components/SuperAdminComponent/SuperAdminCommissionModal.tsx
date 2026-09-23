import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

interface Props {
  visible: boolean;
  lead: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuperAdminCommissionModal: React.FC<Props> = ({
  visible,
  lead,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTablet = windowWidth >= 768;

  const [approvedAmount, setApprovedAmount] = useState<string>("");
  const [firstMonthAmount, setFirstMonthAmount] = useState<string>("");
  const [recurringRate, setRecurringRate] = useState<string>("5");
  const [recurringMonthlyAmount, setRecurringMonthlyAmount] = useState<string>("");
  const [percentage, setPercentage] = useState<string>("");
  const [status, setStatus] = useState<string>("approved");
  const [remarks, setRemarks] = useState<string>("");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (lead) {
      const estimated = lead.commission?.approvedAmount || lead.commission?.firstMonthCommission || lead.commission?.estimatedAmount || 2000;
      const firstMonth = lead.commission?.firstMonthCommission || estimated;
      const recRate = lead.commission?.recurringMonthlyRate || 5;
      const recAmount = lead.commission?.recurringMonthlyCommission || Math.round((lead.expectedPrice || 0) * (recRate / 100));

      setApprovedAmount(String(estimated));
      setFirstMonthAmount(String(firstMonth));
      setRecurringRate(String(recRate));
      setRecurringMonthlyAmount(String(recAmount));
      setPercentage(String(lead.commission?.percentage || 15));
      setStatus(lead.commission?.status || "approved");
      setRemarks(lead.commission?.remarks || "Approved by Super Admin");
    }
  }, [lead, visible]);

  const handleSaveCommission = async () => {
    const amount = Number(approvedAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert("Invalid Amount", "Please enter a valid commission amount.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.patch("/leads/" + lead._id + "/commission", {
        approvedAmount: amount,
        firstMonthCommission: Number(firstMonthAmount) || amount,
        recurringMonthlyRate: Number(recurringRate) || 5,
        recurringMonthlyCommission: Number(recurringMonthlyAmount) || Math.round((lead.expectedPrice || 0) * ((Number(recurringRate) || 5) / 100)),
        percentage: Number(percentage) || 15,
        status,
        remarks: remarks.trim(),
        payoutTransactionId: utrNumber.trim() || undefined,
      });
      Alert.alert("Success", "Commission of ₹" + amount.toLocaleString("en-IN") + " set to " + status.toUpperCase() + "!");
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert("Commission Error", e.message || "Failed to update commission");
    } finally {
      setSubmitting(false);
    }
  };

  if (!lead) return null;

  const dynamicCardStyle = isTablet
    ? {
        width: Math.min(windowWidth * 0.85, 600),
        maxHeight: Math.min(windowHeight * 0.85, 720),
        borderRadius: 24,
        alignSelf: "center" as const,
      }
    : {
        width: "100%" as const,
        maxHeight: Math.min(windowHeight * 0.88, windowHeight - 40),
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[styles.backdrop, isTablet && { justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", justifyContent: isTablet ? "center" : "flex-end", alignItems: isTablet ? "center" : undefined }}
        >
          <View style={[styles.modalCard, dynamicCardStyle, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.badge}>FINANCIAL DISBURSEMENT</Text>
                <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Agent Commission Approval
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Agent Details */}
              <View style={[styles.agentBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(lead.agentName || lead.agent?.name || "A").slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.agentName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {lead.agentName || lead.agent?.name || "Partner Agent"}
                  </Text>
                  <Text style={[styles.agentSub, { color: colors.textSecondary }]}>
                    {lead.agentPhone || lead.agent?.phone} • {lead.agentStaffId || "AGT"}
                  </Text>
                </View>
              </View>

            {/* Form Fields: 1st Month Commission & Recurring Rate */}
            <View style={styles.formRow}>
              <View style={{ flex: 1.2 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>1ST MONTH COMMISSION (₹)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="e.g. 3500"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="numeric"
                  value={firstMonthAmount}
                  onChangeText={(val) => {
                    setFirstMonthAmount(val);
                    setApprovedAmount(val);
                  }}
                />
              </View>

              <View style={{ flex: 0.8 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>RECURRING RATE (%)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="e.g. 5"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="numeric"
                  value={recurringRate}
                  onChangeText={(val) => {
                    setRecurringRate(val);
                    const calculated = Math.round((lead.expectedPrice || 0) * ((Number(val) || 0) / 100));
                    setRecurringMonthlyAmount(String(calculated));
                  }}
                />
              </View>
            </View>

            {/* Monthly Recurring Amount */}
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>EST. RECURRING MONTHLY COMMISSION (₹/MONTH)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                placeholder="e.g. 1300"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                keyboardType="numeric"
                value={recurringMonthlyAmount}
                onChangeText={setRecurringMonthlyAmount}
              />
            </View>

            {/* Status Selection */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>PAYOUT STATUS</Text>
            <View style={styles.statusChipsRow}>
              {[
                { id: "approved", label: "Approved", color: "#0D9488" },
                { id: "paid", label: "Paid / Released", color: "#10B981" },
                { id: "rejected", label: "Rejected", color: "#EF4444" },
              ].map((item) => {
                const isSel = status === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setStatus(item.id)}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: isSel ? item.color : isDark ? "#1E293B" : "#F1F5F9",
                      },
                    ]}
                  >
                    <Text style={[styles.statusChipText, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {status === "paid" && (
              <View style={styles.formField}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>UPI / BANK UTR REFERENCE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="e.g. UPI/49201948201/AXIS"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  value={utrNumber}
                  onChangeText={setUtrNumber}
                />
              </View>
            )}

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>SUPER ADMIN AUDIT REMARKS</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                placeholder="Reason or audit note"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>

            <TouchableOpacity
              onPress={handleSaveCommission}
              disabled={submitting}
              style={[
                styles.saveBtn,
                { backgroundColor: submitting ? "#94A3B8" : "#0D9488" },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Commission Decision</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "85%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  badge: {
    color: "#0D9488",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 20,
    gap: 14,
  },
  agentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  agentName: {
    fontSize: 15,
    fontWeight: "700",
  },
  agentSub: {
    fontSize: 12,
    marginTop: 2,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formField: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  statusChipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statusChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
