import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CRMLeadItem, superAdminCrmApi } from "../../services/superAdminCrmApi";

interface ScheduleSiteVisitModalProps {
  visible: boolean;
  lead: CRMLeadItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleSiteVisitModal: React.FC<ScheduleSiteVisitModalProps> = ({
  visible,
  lead,
  onClose,
  onSuccess,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const [scheduledAt, setScheduledAt] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [meetingLocation, setMeetingLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!lead) return null;

  const handleConflictCheckAndSubmit = async () => {
    try {
      setCheckingConflict(true);
      setConflictWarning(null);

      // Verify conflict check
      const checkRes = await superAdminCrmApi.checkAvailability({
        scheduledAt: new Date(scheduledAt).toISOString(),
        leadId: lead._id,
      });

      if (checkRes?.hasConflict) {
        setConflictWarning(checkRes.conflicts?.[0]?.message || "Scheduling conflict detected!");
        setCheckingConflict(false);
        return;
      }

      setSubmitting(true);
      await superAdminCrmApi.createSiteVisit({
        leadId: lead._id,
        propertyId: "65f1234567890abcdef12345", // Primary matched property or default
        scheduledAt: new Date(scheduledAt).toISOString(),
        meetingLocation: meetingLocation || "On-site Client Meeting",
        notes,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setConflictWarning(err?.message || "Failed to schedule site visit");
    } finally {
      setCheckingConflict(false);
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Schedule Site Visit
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                For {lead.name} ({lead.leadId})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {conflictWarning ? (
            <View style={styles.warningBox}>
              <Feather name="alert-triangle" size={14} color="#DC2626" />
              <Text style={styles.warningText}>{conflictWarning}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            {/* Date Time Picker / Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Visit Date & Time (YYYY-MM-DDTHH:mm) *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                value={scheduledAt}
                onChangeText={setScheduledAt}
              />
            </View>

            {/* Meeting Location */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Meeting Location</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                placeholder="e.g. Royal Palms Main Gate, Sector 62"
                placeholderTextColor={colors.textMuted}
                value={meetingLocation}
                onChangeText={setMeetingLocation}
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Staff Notes</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                placeholder="Client coming with family, keys with caretaker..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </ScrollView>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleConflictCheckAndSubmit}
            disabled={checkingConflict || submitting}
          >
            {checkingConflict || submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Validate & Schedule Visit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
    flex: 1,
  },
  formContent: {
    marginVertical: 4,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 9,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: "#0D9488",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
