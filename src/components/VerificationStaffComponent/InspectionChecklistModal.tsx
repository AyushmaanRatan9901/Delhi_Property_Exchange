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
  Switch,
  Image,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

interface Props {
  visible: boolean;
  inspection: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InspectionChecklistModal: React.FC<Props> = ({
  visible,
  inspection,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  const [conditionScore, setConditionScore] = useState("good");
  const [structuralCheck, setStructuralCheck] = useState(true);
  const [electricalCheck, setElectricalCheck] = useState(true);
  const [plumbingCheck, setPlumbingCheck] = useState(true);
  const [cleanlinessCheck, setCleanlinessCheck] = useState(true);
  const [tenantFeedback, setTenantFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!inspection) return null;

  const handleAddPhoto = () => {
    if (photoUrl.trim() && photoUrl.startsWith("http")) {
      setPhotos((prev) => [...prev, photoUrl.trim()]);
      setPhotoUrl("");
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    }
  };

  const handleAddDemoPhoto = () => {
    setPhotos((prev) => [
      ...prev,
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
    ]);
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  };

  const handleSubmitReport = async () => {
    setSubmitting(true);
    try {
      const payload = {
        conditionScore,
        structuralCheck,
        electricalCheck,
        plumbingCheck,
        cleanlinessCheck,
        tenantFeedback: tenantFeedback.trim(),
        notes: notes.trim() || "6-Month routine check completed on site.",
        photos,
      };

      const propertyId = inspection.propertyLeadId || inspection._id;
      await apiClient.post(`/leads/${propertyId}/inspection-report`, payload);

      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Alert.alert("Report Submitted 🎉", `6-Month inspection report for ${inspection.leadTrackingId || "Property"} has been recorded.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert("Submission Failed", err?.response?.data?.message || "Could not submit inspection report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: "#0D948820" }]}>
                  <Text style={styles.badgeText}>6-MONTH INSPECTION</Text>
                </View>
                <Text style={[styles.leadId, { color: textSecondary }]}>{inspection.leadTrackingId || inspection.inspectionId}</Text>
              </View>
              <Text style={[styles.headerTitle, { color: textPrimary }]} numberOfLines={1}>
                {inspection.title || `${inspection.propertyType} in ${inspection.locality}`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
              <Feather name="x" size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Property & Tenant Meta */}
            <View style={[styles.infoCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol }]}>
              <Text style={[styles.infoLocality, { color: textPrimary }]}>{inspection.locality || "Delhi NCR"}</Text>
              <Text style={[styles.infoSub, { color: textSecondary }]}>Tenant: {inspection.tenantName || "Occupied Tenant"}</Text>
              <Text style={[styles.infoSub, { color: textSecondary }]}>Rent: ₹{Number(inspection.price || 0).toLocaleString("en-IN")}/mo</Text>
            </View>

            {/* Condition Score Selector */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>Overall Condition Rating</Text>
              <View style={styles.pillRow}>
                {["excellent", "good", "fair", "needs_repair", "poor"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setConditionScore(c)}
                    style={[
                      styles.condPill,
                      conditionScore === c && styles.condPillActive,
                      { borderColor: conditionScore === c ? "#0D9488" : borderCol },
                    ]}
                  >
                    <Text
                      style={[
                        styles.condPillText,
                        { color: conditionScore === c ? "#0D9488" : textSecondary, textTransform: "capitalize" },
                      ]}
                    >
                      {c.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Routine Checklist Switches */}
            <View style={[styles.checklistCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol }]}>
              <Text style={[styles.checklistTitle, { color: textPrimary }]}>Safety & Fixture Audit Checklist</Text>

              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>Walls & Structural Health OK</Text>
                <Switch value={structuralCheck} onValueChange={setStructuralCheck} trackColor={{ false: "#94A3B8", true: "#0D9488" }} />
              </View>
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>Electrical & Wiring Working Properly</Text>
                <Switch value={electricalCheck} onValueChange={setElectricalCheck} trackColor={{ false: "#94A3B8", true: "#0D9488" }} />
              </View>
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>Plumbing, Taps & Drains Free Flow</Text>
                <Switch value={plumbingCheck} onValueChange={setPlumbingCheck} trackColor={{ false: "#94A3B8", true: "#0D9488" }} />
              </View>
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: textPrimary }]}>House Cleanliness & Hygiene Maintained</Text>
                <Switch value={cleanlinessCheck} onValueChange={setCleanlinessCheck} trackColor={{ false: "#94A3B8", true: "#0D9488" }} />
              </View>
            </View>

            {/* Tenant Feedback */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>Tenant Feedback / Issues Mentioned</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                placeholder="e.g. Tenant requested minor faucet washer tightening in kitchen."
                placeholderTextColor={textSecondary}
                multiline
                numberOfLines={2}
                value={tenantFeedback}
                onChangeText={setTenantFeedback}
              />
            </View>

            {/* Inspector Notes */}
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: textSecondary }]}>Inspector Assessment Remarks</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                placeholder="General observations, wear and tear remarks..."
                placeholderTextColor={textSecondary}
                multiline
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Inspection Photos */}
            <View style={styles.formGroup}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={[styles.inputLabel, { color: textSecondary, marginBottom: 0 }]}>Inspection Photos ({photos.length})</Text>
                <TouchableOpacity onPress={handleAddDemoPhoto}>
                  <Text style={{ color: "#0D9488", fontSize: 11, fontWeight: "600" }}>+ Sample Photo</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  style={[styles.textInput, { flex: 1, backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                  placeholder="Paste image URL..."
                  placeholderTextColor={textSecondary}
                  value={photoUrl}
                  onChangeText={setPhotoUrl}
                />
                <TouchableOpacity onPress={handleAddPhoto} style={styles.addPhotoBtn}>
                  <Feather name="plus" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {photos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoThumbList}>
                  {photos.map((p, idx) => (
                    <Image key={idx} source={{ uri: p }} style={styles.photoThumb} resizeMode="cover" />
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { borderColor: borderCol }]}>
              <Text style={{ color: textSecondary, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSubmitReport} disabled={submitting} style={styles.submitBtn}>
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Submit Inspection Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    marginTop: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: "#0D9488",
    fontSize: 9,
    fontWeight: "800",
  },
  leadId: {
    fontSize: 11,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 60,
  },
  infoCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  infoLocality: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoSub: {
    fontSize: 12,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  condPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  condPillActive: {
    backgroundColor: "#0D948815",
  },
  condPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  checklistCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
    marginRight: 10,
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    textAlignVertical: "top",
  },
  addPhotoBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  photoThumbList: {
    flexDirection: "row",
    marginTop: 8,
  },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default InspectionChecklistModal;
