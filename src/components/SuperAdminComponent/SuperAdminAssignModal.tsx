import React, { useState, useEffect } from "react";
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

export const SuperAdminAssignModal: React.FC<Props> = ({
  visible,
  lead,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isTablet = windowWidth >= 768;

  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      fetchStaff();
    }
  }, [visible]);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/auth/users?role=field_staff");
      if (res.data?.data?.users) {
        setStaffList(res.data.data.users);
        if (res.data.data.users.length > 0) {
          setSelectedStaffId(res.data.data.users[0]._id);
        }
      }
    } catch (e: any) {
      console.warn("Could not fetch staff list:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaffId) {
      Alert.alert("Select Staff", "Please select a field verification staff member.");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.patch("/leads/" + lead._id + "/assign", {
        staffId: selectedStaffId,
        notes: notes.trim(),
      });
      Alert.alert("Success", "Property lead successfully assigned for on-site verification!");
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert("Assignment Error", e.message || "Failed to assign lead");
    } finally {
      setSubmitting(false);
    }
  };

  if (!lead) return null;

  const dynamicCardStyle = isTablet
    ? {
        width: Math.min(windowWidth * 0.85, 600),
        maxHeight: Math.min(windowHeight * 0.85, 700),
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
                <Text style={styles.badge}>PHYSICAL INSPECTION DISPATCH</Text>
                <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Assign Verification Staff
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
              <View style={[styles.propertyPill, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                <Text style={[styles.propertyPillTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {lead.leadId || "LEAD"} • {lead.propertyType} in {lead.locality}
                </Text>
              <Text style={[styles.propertyPillOwner, { color: colors.textSecondary }]}>
                Owner: {lead.ownerName} ({lead.ownerPhone})
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>SELECT FIELD STAFF</Text>

            {loading ? (
              <ActivityIndicator color="#0D9488" style={{ marginVertical: 20 }} />
            ) : staffList.length === 0 ? (
              <View style={[styles.emptyBox, { borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>No verification staff accounts found.</Text>
              </View>
            ) : (
              <View style={styles.staffGrid}>
                {staffList.map((st) => {
                  const isSelected = selectedStaffId === st._id;
                  return (
                    <TouchableOpacity
                      key={st._id}
                      onPress={() => setSelectedStaffId(st._id)}
                      style={[
                        styles.staffCard,
                        {
                          backgroundColor: isSelected
                            ? "rgba(13, 148, 136, 0.12)"
                            : isDark
                            ? "#1E293B"
                            : "#F8FAFC",
                          borderColor: isSelected ? "#0D9488" : isDark ? "#334155" : "#E2E8F0",
                        },
                      ]}
                    >
                      <View style={styles.staffInfo}>
                        <View style={[styles.avatar, { backgroundColor: isSelected ? "#0D9488" : "#64748B" }]}>
                          <Text style={styles.avatarText}>{(st.name || "S").slice(0, 1).toUpperCase()}</Text>
                        </View>
                        <View>
                          <Text style={[styles.staffName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                            {st.name}
                          </Text>
                          <Text style={[styles.staffPhone, { color: colors.textSecondary }]}>
                            {st.phone} • {st.staffId || "STAFF"}
                          </Text>
                        </View>
                      </View>
                      {isSelected && <Feather name="check-circle" size={18} color="#0D9488" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <Text style={[styles.label, { color: colors.textSecondary, marginTop: 12 }]}>
              DISPATCH / ROUTE NOTES (OPTIONAL)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                },
              ]}
              placeholder="e.g. Call owner before visiting between 11 AM - 1 PM"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity
              onPress={handleAssign}
              disabled={submitting || staffList.length === 0}
              style={[
                styles.submitBtn,
                { backgroundColor: submitting || staffList.length === 0 ? "#94A3B8" : "#0D9488" },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Dispatch Lead to Staff</Text>
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
    gap: 12,
  },
  propertyPill: {
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  propertyPillTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  propertyPillOwner: {
    fontSize: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  emptyBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  staffGrid: {
    gap: 8,
  },
  staffCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  staffInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  staffName: {
    fontSize: 14,
    fontWeight: "700",
  },
  staffPhone: {
    fontSize: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 13,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
