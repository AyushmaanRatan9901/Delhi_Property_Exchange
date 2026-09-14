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

  const [approvedAmount, setApprovedAmount] = useState<string>("");
  const [percentage, setPercentage] = useState<string>("");
  const [status, setStatus] = useState<string>("approved");
  const [remarks, setRemarks] = useState<string>("");
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (lead) {
      const estimated = lead.commission?.approvedAmount || lead.commission?.estimatedAmount || 2000;
      setApprovedAmount(String(estimated));
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
        percentage: Number(percentage) || 0,
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

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
            <View>
              <Text style={styles.badge}>FINANCIAL DISBURSEMENT</Text>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Agent Commission Approval
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
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

            {/* Form Fields */}
            <View style={styles.formRow}>
              <View style={{ flex: 1.2 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>APPROVED COMMISSION (₹)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="e.g. 3500"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="numeric"
                  value={approvedAmount}
                  onChangeText={setApprovedAmount}
                />
              </View>

              <View style={{ flex: 0.8 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>PERCENTAGE (%)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="e.g. 15"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="numeric"
                  value={percentage}
                  onChangeText={setPercentage}
                />
              </View>
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
