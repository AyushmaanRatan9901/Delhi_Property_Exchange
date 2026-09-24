import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CRMSiteVisitItem } from "../../services/superAdminCrmApi";

interface CRMSiteVisitCardProps {
  visit: CRMSiteVisitItem;
  onStatusPress?: (visit: CRMSiteVisitItem) => void;
  onFeedbackPress?: (visit: CRMSiteVisitItem) => void;
  onCancelPress?: (visit: CRMSiteVisitItem) => void;
}

const VISIT_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  requested: { label: "Requested", bg: "#EFF6FF", text: "#2563EB" },
  confirmed: { label: "Confirmed", bg: "#F0FDF4", text: "#16A34A" },
  agent_assigned: { label: "Agent Assigned", bg: "#EEF2FF", text: "#4F46E5" },
  client_reached: { label: "Client Reached", bg: "#FEF3C7", text: "#D97706" },
  in_progress: { label: "In Progress", bg: "#FDF4FF", text: "#A855F7" },
  completed: { label: "Completed", bg: "#DCFCE7", text: "#15803D" },
  visit_completed: { label: "Completed", bg: "#DCFCE7", text: "#15803D" },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", text: "#DC2626" },
  no_show: { label: "No Show", bg: "#F3F4F6", text: "#6B7280" },
};

export const CRMSiteVisitCard: React.FC<CRMSiteVisitCardProps> = ({
  visit,
  onStatusPress,
  onFeedbackPress,
  onCancelPress,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const statusInfo = VISIT_STATUS_CONFIG[visit.status] || {
    label: visit.status,
    bg: "#F1F5F9",
    text: "#475569",
  };

  const visitDateFormatted = visit.scheduledAt
    ? new Date(visit.scheduledAt).toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not scheduled";

  const isCompleted = visit.status === "completed" || visit.status === "visit_completed";
  const isCancelled = visit.status === "cancelled";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
          borderColor: isDark ? colors.border : "#E2E8F0",
        },
      ]}
    >
      {/* Header */}
      <View style={styles.topRow}>
        <View style={styles.idCol}>
          <Text style={[styles.visitId, { color: colors.primary }]}>{visit.visitId}</Text>
          <Text style={[styles.dateTime, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
            {visitDateFormatted}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onStatusPress && onStatusPress(visit)}
          style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}
        >
          <Text style={[styles.statusText, { color: statusInfo.text }]}>
            {statusInfo.label.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Client & Property Details */}
      <View style={styles.detailsBlock}>
        <View style={styles.detailRow}>
          <Feather name="user" size={13} color="#3B82F6" />
          <Text style={[styles.clientName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
            {visit.lead?.name || "Client"}
          </Text>
          <Text style={[styles.clientPhone, { color: colors.textMuted }]}>
            ({visit.lead?.phone})
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Feather name="map-pin" size={13} color="#EF4444" />
          <Text style={[styles.propertyName, { color: colors.textSecondary }]} numberOfLines={1}>
            {visit.property?.locality || visit.meetingLocation || "Delhi NCR Location"}
            {visit.property?.expectedPrice ? ` • ₹${visit.property.expectedPrice.toLocaleString("en-IN")}` : ""}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Feather name="shield" size={13} color="#10B981" />
          <Text style={[styles.agentName, { color: colors.textSecondary }]}>
            Field Agent: {visit.assignedFieldAgent?.name || "Unassigned"}
            {visit.assignedFieldAgent?.phone ? ` (${visit.assignedFieldAgent.phone})` : ""}
          </Text>
        </View>
      </View>

      {/* Footer Controls */}
      <View style={styles.footerRow}>
        {!isCancelled && !isCompleted ? (
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: "#FCA5A5" }]}
            onPress={() => onCancelPress && onCancelPress(visit)}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.feedbackBtn,
            { backgroundColor: isCompleted ? "#F0FDF4" : "#0D9488" },
          ]}
          onPress={() => onFeedbackPress && onFeedbackPress(visit)}
        >
          <Feather
            name={isCompleted ? "check-circle" : "message-square"}
            size={12}
            color={isCompleted ? "#15803D" : "#FFFFFF"}
          />
          <Text
            style={[
              styles.feedbackBtnText,
              { color: isCompleted ? "#15803D" : "#FFFFFF" },
            ]}
          >
            {isCompleted ? "View Feedback" : "Record Feedback"}
          </Text>
        </TouchableOpacity>
      </View>
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
  visitId: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  dateTime: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  detailsBlock: {
    gap: 4,
    marginVertical: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  clientName: {
    fontSize: 13,
    fontWeight: "600",
  },
  clientPhone: {
    fontSize: 11,
  },
  propertyName: {
    fontSize: 12,
    flex: 1,
  },
  agentName: {
    fontSize: 11,
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
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
  },
  feedbackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  feedbackBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
