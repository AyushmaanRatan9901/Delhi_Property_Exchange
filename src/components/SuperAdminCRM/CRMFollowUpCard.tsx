import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CRMFollowUpItem } from "../../services/superAdminCrmApi";

interface CRMFollowUpCardProps {
  followUp: CRMFollowUpItem;
  onComplete: (id: string) => void;
  onCancel?: (id: string) => void;
}

export const CRMFollowUpCard: React.FC<CRMFollowUpCardProps> = ({
  followUp,
  onComplete,
  onCancel,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const isCompleted = followUp.status === "completed";
  const isCancelled = followUp.status === "cancelled";

  const isOverdue =
    !isCompleted &&
    !isCancelled &&
    new Date(followUp.scheduledAt).getTime() < new Date().setHours(0, 0, 0, 0);

  const formattedDueDate = followUp.scheduledAt
    ? new Date(followUp.scheduledAt).toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No date";

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {});
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
          borderColor: isOverdue ? "#FCA5A5" : isDark ? colors.border : "#E2E8F0",
        },
      ]}
    >
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.idCol}>
          <Text style={[styles.followupId, { color: colors.primary }]}>
            {followUp.followupId} • {followUp.type?.toUpperCase()}
          </Text>
          <Text
            style={[
              styles.dueDate,
              { color: isOverdue ? "#DC2626" : isDark ? "#FFFFFF" : "#0F172A" },
            ]}
          >
            {formattedDueDate}
          </Text>
        </View>

        {isOverdue ? (
          <View style={styles.overdueBadge}>
            <Feather name="alert-circle" size={10} color="#DC2626" />
            <Text style={styles.overdueText}>OVERDUE</Text>
          </View>
        ) : isCompleted ? (
          <View style={styles.completedBadge}>
            <Feather name="check" size={10} color="#15803D" />
            <Text style={styles.completedText}>DONE</Text>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>PENDING</Text>
          </View>
        )}
      </View>

      {/* Lead & Caller Details */}
      <View style={styles.infoBlock}>
        <View style={styles.row}>
          <Feather name="user" size={12} color="#3B82F6" />
          <Text style={[styles.leadName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
            {followUp.lead?.name || "Client"}
          </Text>
          <TouchableOpacity onPress={() => handleCall(followUp.lead?.phone)}>
            <Text style={[styles.leadPhone, { color: colors.primary }]}>
              {followUp.lead?.phone}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Feather name="headphones" size={12} color="#8B5CF6" />
          <Text style={[styles.callerName, { color: colors.textSecondary }]}>
            Assigned Caller: {followUp.assignedTo?.name || "Staff"}
          </Text>
        </View>

        {followUp.notes ? (
          <View
            style={[
              styles.notesBox,
              {
                backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                borderColor: isDark ? "#334155" : "#F1F5F9",
              },
            ]}
          >
            <Text style={[styles.notesText, { color: colors.textSecondary }]}>
              {followUp.notes}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Footer Controls */}
      {!isCompleted && !isCancelled ? (
        <View style={styles.footerRow}>
          {onCancel ? (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => onCancel(followUp._id)}
            >
              <Text style={styles.cancelBtnText}>Dismiss</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() => onComplete(followUp._id)}
          >
            <Feather name="check-circle" size={13} color="#FFFFFF" />
            <Text style={styles.completeBtnText}>Mark Complete</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  idCol: {
    flex: 1,
  },
  followupId: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  dueDate: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overdueText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#DC2626",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  completedText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#15803D",
  },
  pendingBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#2563EB",
  },
  infoBlock: {
    gap: 4,
    marginVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leadName: {
    fontSize: 13,
    fontWeight: "600",
  },
  leadPhone: {
    fontSize: 12,
    fontWeight: "600",
  },
  callerName: {
    fontSize: 11,
  },
  notesBox: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 6,
    marginTop: 4,
  },
  notesText: {
    fontSize: 11,
    lineHeight: 15,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  cancelBtnText: {
    fontSize: 11,
    color: "#64748B",
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#0D9488",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  completeBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
