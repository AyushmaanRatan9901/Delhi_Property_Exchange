import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActiveRent, formatCurrency } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantRentSummaryCardProps {
  activeRent: ActiveRent | null;
  onPressPay?: () => void;
  onPressQR?: () => void;
  onPressHistory?: () => void;
}

export const TenantRentSummaryCard: React.FC<TenantRentSummaryCardProps> = ({
  activeRent,
  onPressPay,
  onPressQR,
  onPressHistory,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const isPaid = activeRent?.status === "PAID";
  const isOverdue = activeRent?.isOverdue && !isPaid;

  const getStatusBadge = () => {
    if (!activeRent) {
      return {
        bg: isDark ? "#062A1C" : "#DCFCE7",
        text: isDark ? "#34D399" : "#15803D",
        border: isDark ? "#065F46" : "#86EFAC",
        label: "NO DUES",
        icon: "checkmark-circle" as const,
      };
    }
    if (isPaid) {
      return {
        bg: isDark ? "#062A1C" : "#DCFCE7",
        text: isDark ? "#34D399" : "#15803D",
        border: isDark ? "#065F46" : "#86EFAC",
        label: "PAID & VERIFIED",
        icon: "checkmark-circle" as const,
      };
    }
    if (isOverdue) {
      return {
        bg: isDark ? "#331111" : "#FEE2E2",
        text: isDark ? "#F87171" : "#B91C1C",
        border: isDark ? "#7F1D1D" : "#FCA5A5",
        label: "OVERDUE",
        icon: "alert-circle" as const,
      };
    }
    return {
      bg: isDark ? "#2E1E08" : "#FEF3C7",
      text: isDark ? "#FBBF24" : "#B45309",
      border: isDark ? "#78350F" : "#FDE68A",
      label: "RENT DUE",
      icon: "time" as const,
    };
  };

  const badge = getStatusBadge();
  const formattedDueDate = activeRent?.dueDate
    ? new Date(activeRent.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "No Pending Due Date";

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
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconPill, { backgroundColor: isDark ? "#0C293D" : "#F0F9FF" }]}>
            <Ionicons name="receipt-outline" size={18} color={isDark ? "#38BDF8" : "#0284C7"} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              Rent Summary
            </Text>
            <Text style={[styles.headerSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
              {activeRent?.month || "No Active Invoice"}
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusTag,
            {
              backgroundColor: badge.bg,
              borderColor: badge.border,
            },
          ]}
        >
          <Ionicons name={badge.icon} size={13} color={badge.text} />
          <Text style={[styles.statusTagText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      {/* Amount & Due Date Hero Section */}
      <View
        style={[
          styles.amountHeroBox,
          {
            backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
            borderColor: isDark ? colors.border : "#E2E8F0",
          },
        ]}
      >
        <View>
          <Text style={[styles.amountLabel, { color: isDark ? colors.textSecondary : "#64748B" }]}>
            {isPaid ? "Total Paid Amount" : "Payable Rent Amount"}
          </Text>
          <Text style={[styles.amountValue, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            {formatCurrency(activeRent?.amount || 0)}
          </Text>
        </View>

        {/* Due Date & Countdown */}
        <View style={styles.dueBox}>
          <Text style={[styles.dueDateLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>
            {isPaid ? "Paid On" : "Due Date"}
          </Text>
          <Text style={[styles.dueDateValue, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
            {isPaid
              ? (activeRent?.paidDate
                  ? new Date(activeRent.paidDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                  : "Recently")
              : formattedDueDate}
          </Text>
          {!isPaid && (
            <View
              style={[
                styles.daysPill,
                {
                  backgroundColor: isOverdue ? (isDark ? "#331111" : "#FEE2E2") : (isDark ? "#0C293D" : "#E0F2FE"),
                },
              ]}
            >
              <Text
                style={[
                  styles.daysPillText,
                  { color: isOverdue ? (isDark ? "#F87171" : "#B91C1C") : (isDark ? "#38BDF8" : "#0284C7") },
                ]}
              >
                {isOverdue ? "Overdue" : `${activeRent?.daysRemaining ?? 14} days left`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {!isPaid ? (
          <>
            <TouchableOpacity
              style={[styles.payBtn, { backgroundColor: isDark ? "#0284C7" : "#0284C7" }]}
              onPress={onPressPay}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={16} color="#FFFFFF" />
              <Text style={styles.payBtnText}>Pay Rent Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.qrBtn,
                {
                  backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                  borderColor: isDark ? colors.border : "#CBD5E1",
                },
              ]}
              onPress={onPressQR}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="qrcode-scan" size={16} color={isDark ? "#38BDF8" : "#0284C7"} />
              <Text style={[styles.qrBtnText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>Payment QR</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[
              styles.historyBtn,
              {
                backgroundColor: isDark ? colors.surfaceLight : "#F0FDF4",
                borderColor: isDark ? "#065F46" : "#86EFAC",
              },
            ]}
            onPress={onPressHistory}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={16} color={isDark ? "#34D399" : "#16A34A"} />
            <Text style={[styles.historyBtnText, { color: isDark ? "#34D399" : "#15803D" }]}>
              View Paid Receipt & History
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconPill: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  headerSub: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  amountHeroBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  dueBox: {
    alignItems: "flex-end",
    gap: 2,
  },
  dueDateLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  dueDateValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  daysPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  daysPillText: {
    fontSize: 10.5,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  payBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },
  qrBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  qrBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  historyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  historyBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
  },
});
