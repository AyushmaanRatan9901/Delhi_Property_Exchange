import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CRMHandoffItem } from "../../services/superAdminCrmApi";

interface CRMHandoffModalProps {
  visible: boolean;
  handoff: CRMHandoffItem | null;
  onClose: () => void;
  onAccept: (id: string, remarks: string) => Promise<void>;
  onReject: (id: string, remarks: string) => Promise<void>;
  onReturn: (id: string, remarks: string) => Promise<void>;
}

export const CRMHandoffModal: React.FC<CRMHandoffModalProps> = ({
  visible,
  handoff,
  onClose,
  onAccept,
  onReject,
  onReturn,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!handoff) return null;

  const handleAction = async (actionFn: (id: string, rem: string) => Promise<void>) => {
    try {
      setSubmitting(true);
      await actionFn(handoff._id, remarks);
      setRemarks("");
      onClose();
    } catch (err) {
      console.error("Handoff action error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = handoff.status === "pending";

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
          {/* Modal Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Review Qualified Handoff
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {handoff.handoffId} • Status: {handoff.status.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Lead & Caller Box */}
            <View
              style={[
                styles.sectionBox,
                {
                  backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>PROSPECT CLIENT</Text>
              <Text style={[styles.boldText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {handoff.lead?.name} ({handoff.lead?.phone})
              </Text>
              <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                Requirement: {handoff.lead?.requirementType?.toUpperCase() || "RENT"} • Status: {handoff.lead?.status?.toUpperCase()}
              </Text>
            </View>

            <View
              style={[
                styles.sectionBox,
                {
                  backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>QUALIFIED BY TELE-CALLER</Text>
              <Text style={[styles.boldText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {handoff.teleCaller?.name} ({handoff.teleCaller?.staffId || "Staff"})
              </Text>
              <Text style={[styles.smallText, { color: colors.textSecondary }]}>
                Phone: {handoff.teleCaller?.phone}
              </Text>
            </View>

            {/* Interest & Qualification Notes */}
            {handoff.clientInterest ? (
              <View style={styles.contentBlock}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Client Interest Level:</Text>
                <Text style={[styles.bodyText, { color: isDark ? "#E2E8F0" : "#334155" }]}>
                  {handoff.clientInterest}
                </Text>
              </View>
            ) : null}

            {handoff.teleCallerNotes ? (
              <View style={styles.contentBlock}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Tele-caller Pitch Notes:</Text>
                <Text style={[styles.bodyText, { color: isDark ? "#E2E8F0" : "#334155" }]}>
                  {handoff.teleCallerNotes}
                </Text>
              </View>
            ) : null}

            {handoff.lastCallSummary ? (
              <View style={styles.contentBlock}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Last Call Conversation Summary:</Text>
                <Text style={[styles.bodyText, { color: isDark ? "#E2E8F0" : "#334155" }]}>
                  {handoff.lastCallSummary}
                </Text>
              </View>
            ) : null}

            {/* Admin Remarks Input */}
            {isPending ? (
              <View style={styles.inputBlock}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Super Admin Review Remarks:
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      borderColor: colors.border,
                      color: isDark ? "#FFFFFF" : "#0F172A",
                    },
                  ]}
                  placeholder="Enter remarks, terms, or guidance for deal closing..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={remarks}
                  onChangeText={setRemarks}
                />
              </View>
            ) : handoff.adminRemarks ? (
              <View style={styles.contentBlock}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Previous Admin Remarks:</Text>
                <Text style={[styles.bodyText, { color: isDark ? "#E2E8F0" : "#334155" }]}>
                  {handoff.adminRemarks}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Action Buttons */}
          {isPending ? (
            <View style={styles.actionsFooter}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#DC2626" }]}
                onPress={() => handleAction(onReject)}
                disabled={submitting}
              >
                <Feather name="x-circle" size={14} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#F59E0B" }]}
                onPress={() => handleAction(onReturn)}
                disabled={submitting}
              >
                <Feather name="corner-up-left" size={14} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Return</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#15803D", flex: 1.2 }]}
                onPress={() => handleAction(onAccept)}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check-circle" size={14} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Accept Deal</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.closedFooter}>
              <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                <Text style={styles.doneBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
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
    maxHeight: "85%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  scrollContent: {
    marginVertical: 4,
  },
  sectionBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  boldText: {
    fontSize: 13,
    fontWeight: "700",
  },
  smallText: {
    fontSize: 11,
    marginTop: 2,
  },
  contentBlock: {
    marginVertical: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  inputBlock: {
    marginVertical: 8,
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    textAlignVertical: "top",
  },
  actionsFooter: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  closedFooter: {
    paddingTop: 12,
    alignItems: "center",
  },
  doneBtn: {
    width: "100%",
    backgroundColor: "#0D9488",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
