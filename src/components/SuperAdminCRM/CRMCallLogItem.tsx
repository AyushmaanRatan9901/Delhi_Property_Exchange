import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CRMCallItem } from "../../services/superAdminCrmApi";

interface CRMCallLogItemProps {
  call: CRMCallItem;
  onAISummaryPress?: (call: CRMCallItem) => void;
  onPlayRecording?: (recordingUrl: string) => void;
}

const OUTCOME_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  connected: { label: "Connected", bg: "#DCFCE7", text: "#15803D" },
  interested: { label: "Interested", bg: "#EFF6FF", text: "#2563EB" },
  site_visit_requested: { label: "Visit Requested", bg: "#FEF3C7", text: "#B45309" },
  not_reachable: { label: "Not Reachable", bg: "#FEE2E2", text: "#B91C1C" },
  busy: { label: "Line Busy", bg: "#F3F4F6", text: "#4B5563" },
  call_later: { label: "Call Later", bg: "#FFFBEB", text: "#D97706" },
  wrong_number: { label: "Wrong Number", bg: "#FEE2E2", text: "#DC2626" },
  in_progress: { label: "In Progress", bg: "#F0FDF4", text: "#059669" },
};

export const CRMCallLogItem: React.FC<CRMCallLogItemProps> = ({
  call,
  onAISummaryPress,
  onPlayRecording,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const outcome = OUTCOME_CONFIG[call.outcome] || {
    label: call.outcome || "Call",
    bg: "#F1F5F9",
    text: "#475569",
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const callTimeFormatted = call.startedAt
    ? new Date(call.startedAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      })
    : "Recently";

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
        <View style={styles.callerLeadCol}>
          <View style={styles.iconLeadRow}>
            <Feather
              name={call.direction === "inbound" ? "phone-incoming" : "phone-outgoing"}
              size={13}
              color={call.direction === "inbound" ? "#10B981" : "#3B82F6"}
            />
            <Text style={[styles.leadName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              {call.lead?.name || "Client Lead"}
            </Text>
            {call.lead?.leadId ? (
              <Text style={[styles.leadId, { color: colors.textMuted }]}>
                ({call.lead.leadId})
              </Text>
            ) : null}
          </View>
          <Text style={[styles.callerName, { color: colors.textSecondary }]}>
            by {call.teleCaller?.name || "Tele-caller"} ({call.teleCaller?.staffId || "Staff"})
          </Text>
        </View>

        <View style={[styles.outcomeBadge, { backgroundColor: outcome.bg }]}>
          <Text style={[styles.outcomeText, { color: outcome.text }]}>{outcome.label}</Text>
        </View>
      </View>

      {/* Time & Duration Bar */}
      <View style={styles.timeDurationRow}>
        <Text style={[styles.timeText, { color: colors.textMuted }]}>{callTimeFormatted}</Text>
        <View style={styles.durationPill}>
          <Feather name="clock" size={11} color="#64748B" />
          <Text style={styles.durationText}>{formatDuration(call.duration)}</Text>
        </View>
      </View>

      {/* Notes / Transcript snippet if any */}
      {call.notes ? (
        <View
          style={[
            styles.notesBox,
            {
              backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
              borderColor: isDark ? "#334155" : "#F1F5F9",
            },
          ]}
        >
          <Text style={[styles.notesText, { color: colors.textSecondary }]} numberOfLines={2}>
            {call.notes}
          </Text>
        </View>
      ) : null}

      {/* Footer Actions (AI Summary & Recording) */}
      <View style={styles.footerRow}>
        {call.recordingUrl ? (
          <TouchableOpacity
            style={styles.recordingBtn}
            onPress={() => onPlayRecording && onPlayRecording(call.recordingUrl!)}
          >
            <Feather name="play-circle" size={14} color="#0D9488" />
            <Text style={styles.recordingBtnText}>Play Recording</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.noRecordingBadge}>
            <Feather name="mic-off" size={11} color="#94A3B8" />
            <Text style={styles.noRecordingText}>No Recording</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.aiBtn}
          onPress={() => onAISummaryPress && onAISummaryPress(call)}
        >
          <MaterialCommunityIcons name="robot" size={14} color="#6366F1" />
          <Text style={styles.aiBtnText}>AI Summary</Text>
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
    marginBottom: 6,
  },
  callerLeadCol: {
    flex: 1,
    marginRight: 8,
  },
  iconLeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leadName: {
    fontSize: 14,
    fontWeight: "700",
  },
  leadId: {
    fontSize: 11,
    fontWeight: "500",
  },
  callerName: {
    fontSize: 11,
    marginTop: 2,
  },
  outcomeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  outcomeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  timeDurationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
  },
  durationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  notesBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
  },
  recordingBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  recordingBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
  noRecordingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  noRecordingText: {
    fontSize: 10,
    color: "#94A3B8",
  },
  aiBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6366F1",
  },
});
