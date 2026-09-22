import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TenantComplaint } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantComplaintDetailModalProps {
  visible: boolean;
  complaint: TenantComplaint | null;
  onClose: () => void;
  onSendMessage: (ticketId: string, text: string, photos?: string[]) => Promise<boolean>;
  onReopen: (ticketId: string, reason: string) => Promise<boolean>;
}

export const TenantComplaintDetailModal: React.FC<TenantComplaintDetailModalProps> = ({
  visible,
  complaint,
  onClose,
  onSendMessage,
  onReopen,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const [replyText, setReplyText] = useState<string>("");
  const [reopenReason, setReopenReason] = useState<string>("");
  const [showReopenInput, setShowReopenInput] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!complaint) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return { bg: isDark ? "#062A1C" : "#DCFCE7", text: isDark ? "#34D399" : "#16A34A", label: "RESOLVED" };
      case "in_progress":
      case "assigned":
        return { bg: isDark ? "#0C293D" : "#E0F2FE", text: isDark ? "#38BDF8" : "#0284C7", label: "IN PROGRESS" };
      case "reopened":
        return { bg: isDark ? "#331111" : "#FEE2E2", text: isDark ? "#F87171" : "#B91C1C", label: "REOPENED" };
      default:
        return { bg: isDark ? "#2E1E08" : "#FEF3C7", text: isDark ? "#FBBF24" : "#D97706", label: "SUBMITTED" };
    }
  };

  const statusBadge = getStatusBadge(complaint.status);
  const isResolved = complaint.status === "resolved" || complaint.status === "closed";

  const handleSend = async () => {
    if (!replyText.trim()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsSending(true);
      await onSendMessage(complaint.ticketId, replyText.trim());
      setReplyText("");
    } catch {} finally {
      setIsSending(false);
    }
  };

  const handleReopenSubmit = async () => {
    if (!reopenReason.trim()) {
      Alert.alert("Reason Required", "Please explain why you are reopening this issue.");
      return;
    }
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSending(true);
      await onReopen(complaint.ticketId, reopenReason.trim());
      setShowReopenInput(false);
      setReopenReason("");
      Alert.alert("Complaint Reopened", "Our supervisor has been notified of your update.");
    } catch {} finally {
      setIsSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={[styles.ticketTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                  {complaint.ticketId}
                </Text>
                <View style={[styles.statusTag, { backgroundColor: statusBadge.bg }]}>
                  <Text style={[styles.statusTagText, { color: statusBadge.text }]}>{statusBadge.label}</Text>
                </View>
              </View>
              <Text style={[styles.modalSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                {complaint.category.toUpperCase()} • Priority: {complaint.priority.toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={isDark ? colors.textMuted : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Overview Card */}
            <View
              style={[
                styles.overviewCard,
                {
                  backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              <Text style={[styles.issueTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                {complaint.title}
              </Text>
              <Text style={[styles.issueDesc, { color: isDark ? colors.textSecondary : "#475569" }]}>
                {complaint.description}
              </Text>

              {/* Staff & Slot details */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={[styles.mLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Assigned Staff</Text>
                  <Text style={[styles.mVal, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                    {complaint.assignedStaffName || "Maintenance Desk"}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.mLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Preferred Slot</Text>
                  <Text style={[styles.mVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                    {complaint.preferredVisitTime || "Standard Hours"}
                  </Text>
                </View>
              </View>

              {/* Media preview */}
              {complaint.photos && complaint.photos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
                  {complaint.photos.map((uri, idx) => (
                    <Image key={idx} source={{ uri }} style={styles.photoThumb} />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Reopen Box if Resolved */}
            {isResolved && (
              <View
                style={[
                  styles.resolvedBanner,
                  {
                    backgroundColor: isDark ? "#062A1C" : "#DCFCE7",
                    borderColor: isDark ? "#065F46" : "#86EFAC",
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  <Text style={[styles.resolvedText, { color: isDark ? "#34D399" : "#15803D" }]}>
                    This issue was marked resolved by maintenance staff.
                  </Text>
                </View>

                {!showReopenInput ? (
                  <TouchableOpacity
                    style={[styles.reopenToggleBtn, { backgroundColor: isDark ? "#331111" : "#FEE2E2" }]}
                    onPress={() => setShowReopenInput(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="refresh" size={14} color="#EF4444" />
                    <Text style={styles.reopenToggleText}>Issue Persists? Reopen Ticket</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.reopenInputWrapper}>
                    <TextInput
                      style={[
                        styles.reopenInput,
                        {
                          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                          borderColor: isDark ? "#EF4444" : "#FCA5A5",
                          color: isDark ? colors.textPrimary : "#0F172A",
                        },
                      ]}
                      placeholder="Why are you reopening? (e.g. Tap still leaking)"
                      placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                      value={reopenReason}
                      onChangeText={setReopenReason}
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        style={[styles.reopenSubmitBtn, { backgroundColor: "#EF4444" }]}
                        onPress={handleReopenSubmit}
                        disabled={isSending}
                      >
                        <Text style={styles.reopenSubmitText}>Confirm Reopen</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.reopenCancelBtn, { borderColor: isDark ? colors.border : "#CBD5E1" }]}
                        onPress={() => setShowReopenInput(false)}
                      >
                        <Text style={[styles.reopenCancelText, { color: isDark ? colors.textMuted : "#64748B" }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Timeline / Message Feed */}
            <View style={styles.timelineSection}>
              <Text style={[styles.timelineHeader, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                Activity & Updates Timeline
              </Text>

              <View style={styles.messagesList}>
                {complaint.messages && complaint.messages.length > 0 ? (
                  complaint.messages.map((msg, idx) => {
                    const isTenant = msg.senderRole === "tenant";
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.msgBubble,
                          isTenant ? styles.msgTenant : styles.msgStaff,
                          {
                            backgroundColor: isTenant
                              ? isDark ? "#0C293D" : "#E0F2FE"
                              : isDark ? colors.surfaceLight : "#F1F5F9",
                            borderColor: isTenant
                              ? isDark ? "#0369A1" : "#BAE6FD"
                              : isDark ? colors.border : "#E2E8F0",
                          },
                        ]}
                      >
                        <View style={styles.msgHeader}>
                          <Text style={[styles.msgSender, { color: isTenant ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? "#34D399" : "#059669") }]}>
                            {msg.senderName} ({isTenant ? "You" : "Staff"})
                          </Text>
                          <Text style={[styles.msgTime, { color: isDark ? colors.textMuted : "#94A3B8" }]}>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                              : "Recently"}
                          </Text>
                        </View>
                        <Text style={[styles.msgText, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                          {msg.text}
                        </Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={[styles.msgBubble, { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC" }]}>
                    <Text style={[styles.msgText, { color: isDark ? colors.textSecondary : "#64748B" }]}>
                      Complaint registered. Staff assignment in progress.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Reply Input */}
            {!isResolved && (
              <View
                style={[
                  styles.replyBox,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                  },
                ]}
              >
                <TextInput
                  style={[styles.replyInput, { color: isDark ? colors.textPrimary : "#0F172A" }]}
                  placeholder="Add additional notes or update for technician..."
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                />
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    {
                      backgroundColor: isDark ? "#0284C7" : "#0284C7",
                      opacity: replyText.trim() ? 1 : 0.5,
                    },
                  ]}
                  onPress={handleSend}
                  disabled={!replyText.trim() || isSending}
                  activeOpacity={0.8}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
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
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  ticketTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: "800",
  },
  modalSub: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: "600",
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
  overviewCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  issueDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
    marginTop: 4,
  },
  metaItem: {
    gap: 2,
  },
  mLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  mVal: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  photosRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  photoThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  resolvedBanner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  resolvedText: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  reopenToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  reopenToggleText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "800",
  },
  reopenInputWrapper: {
    gap: 8,
    marginTop: 4,
  },
  reopenInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12.5,
  },
  reopenSubmitBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  reopenSubmitText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  reopenCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  reopenCancelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timelineSection: {
    gap: 8,
  },
  timelineHeader: {
    fontSize: 14,
    fontWeight: "800",
  },
  messagesList: {
    gap: 8,
  },
  msgBubble: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  msgTenant: {
    alignSelf: "flex-end",
    width: "90%",
  },
  msgStaff: {
    alignSelf: "flex-start",
    width: "90%",
  },
  msgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  msgSender: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  msgTime: {
    fontSize: 10.5,
  },
  msgText: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  replyBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  replyInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 80,
    fontSize: 13,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
