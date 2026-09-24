import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CRMLeadItem } from "../../services/superAdminCrmApi";

interface CRMLeadRowProps {
  lead: CRMLeadItem;
  onPress: (lead: CRMLeadItem) => void;
  onAssignPress: (lead: CRMLeadItem) => void;
  onStatusChangePress?: (lead: CRMLeadItem) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: "#EFF6FF", text: "#2563EB" },
  contacted: { bg: "#F0FDF4", text: "#16A34A" },
  qualified: { bg: "#ECFDF5", text: "#059669" },
  matching: { bg: "#FDF4FF", text: "#A855F7" },
  shortlisted: { bg: "#FFFBEB", text: "#D97706" },
  site_visit: { bg: "#FEF3C7", text: "#B45309" },
  negotiation: { bg: "#EEF2FF", text: "#4F46E5" },
  converted: { bg: "#DCFCE7", text: "#15803D" },
  lost: { bg: "#FEE2E2", text: "#B91C1C" },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#64748B",
  medium: "#3B82F6",
  high: "#F59E0B",
  urgent: "#EF4444",
};

export const CRMLeadRow: React.FC<CRMLeadRowProps> = ({
  lead,
  onPress,
  onAssignPress,
  onStatusChangePress,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const statusConfig = STATUS_COLORS[lead.status] || { bg: "#F1F5F9", text: "#475569" };
  const priorityColor = PRIORITY_COLORS[lead.priority] || "#3B82F6";

  const handleCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {});
  };

  const handleWhatsApp = (phoneNumber: string) => {
    if (!phoneNumber) return;
    const clean = phoneNumber.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${clean.length === 10 ? "91" + clean : clean}`).catch(() => {});
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(lead)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
          borderColor: isDark ? colors.border : "#E2E8F0",
        },
      ]}
    >
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.idGroup}>
          <Text style={[styles.leadId, { color: colors.primary }]}>{lead.leadId}</Text>
          <View style={[styles.priorityBadge, { borderColor: priorityColor }]}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {lead.priority?.toUpperCase()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onStatusChangePress && onStatusChangePress(lead)}
          style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}
        >
          <Text style={[styles.statusText, { color: statusConfig.text }]}>
            {lead.status?.replace("_", " ").toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Info */}
      <View style={styles.mainInfo}>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
            {lead.name}
          </Text>
          <Text style={[styles.phone, { color: colors.textSecondary }]}>
            {lead.phone} • {lead.source?.toUpperCase()}
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#0D9488" }]}
            onPress={() => handleCall(lead.phone)}
          >
            <Feather name="phone" size={13} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#10B981" }]}
            onPress={() => handleWhatsApp(lead.phone)}
          >
            <Ionicons name="logo-whatsapp" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Assignment Ribbon */}
      <View
        style={[
          styles.bottomRibbon,
          {
            backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
            borderColor: isDark ? "#334155" : "#F1F5F9",
          },
        ]}
      >
        <View style={styles.assignedToGroup}>
          <Feather
            name={lead.assignedTo ? "user-check" : "user-x"}
            size={12}
            color={lead.assignedTo ? "#059669" : "#DC2626"}
          />
          <Text style={[styles.assignedText, { color: isDark ? "#E2E8F0" : "#334155" }]}>
            {lead.assignedTo ? `Caller: ${lead.assignedTo.name}` : "Unassigned Lead"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.assignBtn,
            { backgroundColor: lead.assignedTo ? "#F1F5F9" : "#0D9488" },
          ]}
          onPress={() => onAssignPress(lead)}
        >
          <Text
            style={[
              styles.assignBtnText,
              { color: lead.assignedTo ? "#0F766E" : "#FFFFFF" },
            ]}
          >
            {lead.assignedTo ? "Reassign" : "Assign Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
    alignItems: "center",
    marginBottom: 8,
  },
  idGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  leadId: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    gap: 3,
  },
  priorityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  priorityText: {
    fontSize: 8,
    fontWeight: "800",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  mainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  phone: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomRibbon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  assignedToGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  assignedText: {
    fontSize: 11,
    fontWeight: "600",
  },
  assignBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  assignBtnText: {
    fontSize: 10,
    fontWeight: "700",
  },
});
