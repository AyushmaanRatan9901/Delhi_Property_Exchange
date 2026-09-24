import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CallerItem } from "../../services/superAdminCrmApi";

interface CallerCardProps {
  item: CallerItem;
  onToggleStatus: (callerId: string, currentStatus: "active" | "inactive") => void;
  onPressDetails?: (caller: CallerItem) => void;
  onViewLeads?: (callerId: string, callerName: string) => void;
}

export const CallerCard: React.FC<CallerCardProps> = ({
  item,
  onToggleStatus,
  onPressDetails,
  onViewLeads,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const { caller, statistics, pendingFollowUps, pendingSiteVisits, currentWorkload } = item;

  const isActive = caller.status === "active";

  const handlePhoneCall = (phoneNumber: string) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {});
  };

  const handleWhatsApp = (phoneNumber: string) => {
    if (!phoneNumber) return;
    const clean = phoneNumber.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${clean.length === 10 ? "91" + clean : clean}`).catch(() => {});
  };

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
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: isActive ? "#0D9488" : "#94A3B8" },
            ]}
          >
            <Text style={styles.avatarText}>
              {caller.name ? caller.name.substring(0, 2).toUpperCase() : "TC"}
            </Text>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: isDark ? "#FFFFFF" : "#0F172A" }]} numberOfLines={1}>
                {caller.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isActive ? "#ECFDF5" : "#FEF2F2" },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: isActive ? "#10B981" : "#EF4444" },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: isActive ? "#059669" : "#DC2626" },
                  ]}
                >
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </Text>
              </View>
            </View>
            <Text style={[styles.staffId, { color: colors.textSecondary }]}>
              {caller.staffId || caller.id.slice(-6)} • {caller.designation || "Tele-caller"}
            </Text>
            <Text style={[styles.phone, { color: colors.textMuted }]}>{caller.phone}</Text>
          </View>
        </View>

        {/* Quick Communication Ribbon */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.miniBtn, { backgroundColor: "#0D9488" }]}
            onPress={() => handlePhoneCall(caller.phone)}
          >
            <Feather name="phone" size={13} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.miniBtn, { backgroundColor: "#10B981" }]}
            onPress={() => handleWhatsApp(caller.phone)}
          >
            <Ionicons name="logo-whatsapp" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Row */}
      <View
        style={[
          styles.metricsRow,
          {
            backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
            borderColor: isDark ? "#334155" : "#F1F5F9",
          },
        ]}
      >
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: "#3B82F6" }]}>{statistics.totalLeads}</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Leads</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: "#10B981" }]}>{statistics.calls}</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Calls</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: "#F59E0B" }]}>{pendingFollowUps}</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Pending Flp</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: "#8B5CF6" }]}>{statistics.siteVisits}</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Visits</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricVal, { color: "#EC4899" }]}>{statistics.conversions}</Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Closed</Text>
        </View>
      </View>

      {/* Footer Controls */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: colors.border }]}
          onPress={() => onViewLeads && onViewLeads(caller.id, caller.name)}
        >
          <Feather name="folder" size={13} color={colors.textSecondary} />
          <Text style={[styles.outlineBtnText, { color: colors.textSecondary }]}>View Leads</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            { backgroundColor: isActive ? "#FEE2E2" : "#DCFCE7" },
          ]}
          onPress={() => onToggleStatus(caller.id, caller.status)}
        >
          <Feather
            name={isActive ? "user-x" : "user-check"}
            size={13}
            color={isActive ? "#DC2626" : "#16A34A"}
          />
          <Text
            style={[
              styles.toggleBtnText,
              { color: isActive ? "#DC2626" : "#16A34A" },
            ]}
          >
            {isActive ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  staffId: {
    fontSize: 11,
    marginTop: 2,
  },
  phone: {
    fontSize: 11,
    marginTop: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 6,
  },
  miniBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: "800",
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
    textTransform: "uppercase",
  },
  metricDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#CBD5E1",
    opacity: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
  },
  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 11,
    fontWeight: "600",
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
