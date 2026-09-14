import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { API_BASE_URL } from "../../Redux/api/apiConfig";
import apiClient from "../../Redux/api/axiosInstance";

interface Props {
  visible: boolean;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuperAdminKycModal: React.FC<Props> = ({
  visible,
  user,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const [rejecting, setRejecting] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!user) return null;

  const backendHost = API_BASE_URL.replace("/api/v1", "");

  const getFullUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;
    return backendHost + (path.startsWith("/") ? "" : "/") + path;
  };

  const aadhaarUrl = getFullUrl(user.kyc?.aadhaarDoc || user.aadhaarCard);
  const panUrl = getFullUrl(user.kyc?.panDoc || user.panCard);

  const handleUpdateStatus = async (status: "VERIFIED" | "REJECTED") => {
    if (status === "REJECTED" && !rejectionReason.trim()) {
      Alert.alert("Reason Required", "Please provide a reason for rejecting KYC documents.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.put("/auth/users/" + user._id + "/kyc-status", {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason.trim() : undefined,
      });
      Alert.alert("KYC Updated", "User KYC status has been marked as " + status + "!");
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update KYC status");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
            <View>
              <Text style={styles.badge}>KYC VERIFICATION DESK</Text>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {user.name} ({(user.role || "USER").toUpperCase().replace("_", " ")})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* User Details */}
            <View style={[styles.userBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Phone Number</Text>
                <Text style={[styles.val, { color: "#0D9488", fontWeight: "700" }]}>{user.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Staff / User ID</Text>
                <Text style={[styles.val, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>{user.staffId || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Current KYC Status</Text>
                <View style={[styles.statusPill, { backgroundColor: user.kyc?.status === "VERIFIED" ? "#DCFCE7" : user.kyc?.status === "REJECTED" ? "#FEE2E2" : "#FEF3C7" }]}>
                  <Text style={{ color: user.kyc?.status === "VERIFIED" ? "#166534" : user.kyc?.status === "REJECTED" ? "#991B1B" : "#92400E", fontSize: 11, fontWeight: "700" }}>
                    {user.kyc?.status || "NOT UPLOADED"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Aadhaar Card Document */}
            <View style={[styles.docCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <View style={styles.docHeader}>
                <FontAwesome5 name="id-card" size={16} color="#0D9488" />
                <Text style={[styles.docTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>Aadhaar Card</Text>
                {user.kyc?.aadhaarNumber ? (
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberBadgeText}>No: {user.kyc.aadhaarNumber}</Text>
                  </View>
                ) : null}
              </View>

              {aadhaarUrl ? (
                <Image source={{ uri: aadhaarUrl }} style={styles.docImage} resizeMode="contain" />
              ) : (
                <View style={styles.noDocBox}>
                  <Feather name="file-text" size={24} color="#94A3B8" />
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>No Aadhaar Document Uploaded</Text>
                </View>
              )}
            </View>

            {/* PAN Card Document */}
            <View style={[styles.docCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <View style={styles.docHeader}>
                <FontAwesome5 name="credit-card" size={16} color="#3B82F6" />
                <Text style={[styles.docTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>PAN Card</Text>
                {user.kyc?.panNumber ? (
                  <View style={[styles.numberBadge, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}>
                    <Text style={[styles.numberBadgeText, { color: "#2563EB" }]}>PAN: {user.kyc.panNumber}</Text>
                  </View>
                ) : null}
              </View>

              {panUrl ? (
                <Image source={{ uri: panUrl }} style={styles.docImage} resizeMode="contain" />
              ) : (
                <View style={styles.noDocBox}>
                  <Feather name="file-text" size={24} color="#94A3B8" />
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>No PAN Document Uploaded</Text>
                </View>
              )}
            </View>

            {/* Reject Reason Box */}
            {rejecting && (
              <View style={styles.rejectBox}>
                <Text style={[styles.label, { color: "#EF4444" }]}>REJECTION REASON (MANDATORY)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: "#EF4444" }]}
                  placeholder="e.g. Image blurred / PAN name mismatch"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                />
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionRow}>
              {rejecting ? (
                <>
                  <TouchableOpacity
                    onPress={() => setRejecting(false)}
                    style={[styles.actionBtn, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
                  >
                    <Text style={{ color: isDark ? "#FFFFFF" : "#0F172A", fontWeight: "700" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleUpdateStatus("REJECTED")}
                    disabled={submitting}
                    style={[styles.actionBtn, { backgroundColor: "#EF4444" }]}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>Confirm Reject</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => setRejecting(true)}
                    style={[styles.actionBtn, { backgroundColor: "#EF4444" }]}
                  >
                    <Feather name="x-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.btnText}>Reject KYC</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleUpdateStatus("VERIFIED")}
                    disabled={submitting}
                    style={[styles.actionBtn, { backgroundColor: "#10B981" }]}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Feather name="check-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.btnText}>Approve KYC</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
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
    maxHeight: "90%",
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
  userBox: {
    padding: 14,
    borderRadius: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  val: {
    fontSize: 13,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  docCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  docHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  numberBadge: {
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  numberBadgeText: {
    color: "#0F766E",
    fontSize: 11,
    fontWeight: "700",
  },
  docImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  noDocBox: {
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBox: {
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
