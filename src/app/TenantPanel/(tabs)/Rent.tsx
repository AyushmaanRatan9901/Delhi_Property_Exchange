import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { TenantPaymentModal } from "../../../components/TenantComponent/TenantPaymentModal";
import { TenantReceiptModal } from "../../../components/TenantComponent/TenantReceiptModal";
import {
  formatCurrency,
  RentLedgerItem,
  useTenant,
} from "../../../constants/tenantData";
import { useResponsiveTheme } from "../../../constants/theme";

export default function TenantRentScreen() {
  const { isDark, colors } = useResponsiveTheme();
  const insets = useSafeAreaInsets();

  const {
    property,
    activeRent,
    ledgerHistory,
    paymentInstructions,
    profile,
    isRefreshing,
    refreshAll,
    payRent,
  } = useTenant();

  const [filter, setFilter] = useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [selectedLedgerItem, setSelectedLedgerItem] = useState<RentLedgerItem | null>(null);

  const handleRefresh = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await refreshAll();
  };

  const handleOpenReceipt = (item: RentLedgerItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedLedgerItem(item);
    setShowReceiptModal(true);
  };

  const filteredHistory = ledgerHistory.filter((item) => {
    if (filter === "PAID") return item.status === "PAID";
    if (filter === "PENDING") return item.status === "PENDING" || item.status === "OVERDUE";
    return true;
  });

  const isCurrentPaid = activeRent?.status === "PAID";

  const getLedgerStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return { bg: isDark ? "#062A1C" : "#DCFCE7", text: isDark ? "#34D399" : "#16A34A", label: "PAID" };
      case "OVERDUE":
        return { bg: isDark ? "#331111" : "#FEE2E2", text: isDark ? "#F87171" : "#B91C1C", label: "OVERDUE" };
      case "PROCESSING":
        return { bg: isDark ? "#0C293D" : "#E0F2FE", text: isDark ? "#38BDF8" : "#0284C7", label: "PROCESSING" };
      default:
        return { bg: isDark ? "#2E1E08" : "#FEF3C7", text: isDark ? "#FBBF24" : "#D97706", label: "PENDING" };
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDark ? colors.background : "#F8FAFC",
          paddingTop: insets.top > 0 ? 0 : 10,
        },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Header */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#E2E8F0",
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
          Rent & Ledger
        </Text>
        <TouchableOpacity
          style={[styles.payTopBtn, { backgroundColor: isDark ? "#0284C7" : "#0284C7" }]}
          onPress={() => setShowPaymentModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="flash" size={14} color="#FFFFFF" />
          <Text style={styles.payTopBtnText}>Pay Rent</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#0284C7"]}
            tintColor={isDark ? "#38BDF8" : "#0284C7"}
          />
        }
      >
        {/* Active Rent Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={[styles.heroSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                Current Rent • {activeRent?.month || "This Month"}
              </Text>
              <Text style={[styles.heroAmount, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                {formatCurrency(activeRent?.amount || 18500)}
              </Text>
            </View>

            <View
              style={[
                styles.heroStatusTag,
                {
                  backgroundColor: isCurrentPaid
                    ? isDark ? "#062A1C" : "#DCFCE7"
                    : isDark ? "#2E1E08" : "#FEF3C7",
                },
              ]}
            >
              <Ionicons
                name={isCurrentPaid ? "checkmark-circle" : "time"}
                size={13}
                color={isCurrentPaid ? "#16A34A" : "#D97706"}
              />
              <Text
                style={[
                  styles.heroStatusText,
                  { color: isCurrentPaid ? (isDark ? "#34D399" : "#16A34A") : (isDark ? "#FBBF24" : "#B45309") },
                ]}
              >
                {isCurrentPaid ? "PAID" : "DUE"}
              </Text>
            </View>
          </View>

          {/* Due date info */}
          <View
            style={[
              styles.dueInfoBox,
              {
                backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
            ]}
          >
            <View style={styles.dueInfoRow}>
              <Ionicons name="calendar-outline" size={16} color={isDark ? "#38BDF8" : "#0284C7"} />
              <Text style={[styles.dueInfoText, { color: isDark ? colors.textSecondary : "#475569" }]}>
                {isCurrentPaid
                  ? `Payment received on ${activeRent?.paidDate ? new Date(activeRent.paidDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recently"}`
                  : `Due on ${activeRent?.dueDate ? new Date(activeRent.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "5th of this month"}`}
              </Text>
            </View>
            {!isCurrentPaid && (
              <View style={[styles.countdownPill, { backgroundColor: isDark ? "#0C293D" : "#E0F2FE" }]}>
                <Text style={[styles.countdownText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                  {activeRent?.daysRemaining ?? 14} days left
                </Text>
              </View>
            )}
          </View>

          {/* Action Row */}
          <View style={styles.heroActionsRow}>
            {!isCurrentPaid ? (
              <>
                <TouchableOpacity
                  style={[styles.heroPayBtn, { backgroundColor: isDark ? "#0284C7" : "#0284C7" }]}
                  onPress={() => setShowPaymentModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="flash" size={16} color="#FFFFFF" />
                  <Text style={styles.heroPayBtnText}>Pay Rent Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.heroQrBtn,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#CBD5E1",
                    },
                  ]}
                  onPress={() => setShowPaymentModal(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="qrcode-scan" size={16} color={isDark ? "#38BDF8" : "#0284C7"} />
                  <Text style={[styles.heroQrBtnText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>QR Code</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[
                  styles.heroReceiptBtn,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F0FDF4",
                    borderColor: isDark ? "#065F46" : "#86EFAC",
                  },
                ]}
                onPress={() => {
                  if (activeRent) {
                    handleOpenReceipt({
                      id: activeRent.ledgerId || "LED-001",
                      month: activeRent.month,
                      amount: activeRent.amount,
                      dueDate: activeRent.dueDate,
                      paidDate: activeRent.paidDate || new Date(),
                      status: "PAID",
                      paymentMode: activeRent.paymentMode || "UPI",
                      utrNumber: activeRent.utrNumber,
                      receiptId: `RCP-${activeRent.month.replace(/\s/g, "")}`,
                    });
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="receipt-outline" size={16} color={isDark ? "#34D399" : "#16A34A"} />
                <Text style={[styles.heroReceiptBtnText, { color: isDark ? "#34D399" : "#15803D" }]}>
                  View Official Digital Receipt
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Ledger History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeaderRow}>
            <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              Payment Ledger & Receipts
            </Text>

            {/* Filter Tabs */}
            <View style={[styles.filterGroup, { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" }]}>
              {(["ALL", "PAID", "PENDING"] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterTab,
                    filter === f && {
                      backgroundColor: isDark ? "#0284C7" : "#FFFFFF",
                      shadowColor: "#000",
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setFilter(f)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      { color: filter === f ? (isDark ? "#FFFFFF" : "#0284C7") : (isDark ? "#94A3B8" : "#64748B") },
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ledger Cards */}
          <View style={styles.ledgerList}>
            {filteredHistory.map((item) => {
              const statusData = getLedgerStatusBadge(item.status);
              const paidStr = item.paidDate
                ? new Date(item.paidDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "Awaiting Payment";

              return (
                <View
                  key={item.id}
                  style={[
                    styles.ledgerCard,
                    {
                      backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                    },
                  ]}
                >
                  <View style={styles.ledgerTopRow}>
                    <View style={styles.ledgerMonthBox}>
                      <View style={[styles.ledgerIconCircle, { backgroundColor: isDark ? "#0C293D" : "#F0F9FF" }]}>
                        <Ionicons name="wallet-outline" size={18} color={isDark ? "#38BDF8" : "#0284C7"} />
                      </View>
                      <View>
                        <Text style={[styles.ledgerMonth, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                          {item.month}
                        </Text>
                        <Text style={[styles.ledgerDate, { color: isDark ? colors.textMuted : "#64748B" }]}>
                          {paidStr}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end", gap: 3 }}>
                      <Text style={[styles.ledgerAmt, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                        {formatCurrency(item.amount)}
                      </Text>
                      <View style={[styles.ledgerStatusTag, { backgroundColor: statusData.bg }]}>
                        <Text style={[styles.ledgerStatusText, { color: statusData.text }]}>
                          {statusData.label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Ref & Receipt Link */}
                  <View
                    style={[
                      styles.ledgerBottomRow,
                      { borderTopColor: isDark ? colors.border : "#F1F5F9" },
                    ]}
                  >
                    <Text style={[styles.ledgerRef, { color: isDark ? colors.textMuted : "#94A3B8" }]}>
                      {item.utrNumber ? `Ref: ${item.utrNumber}` : `Mode: ${item.paymentMode || "UPI"}`}
                    </Text>

                    {item.status === "PAID" ? (
                      <TouchableOpacity
                        style={styles.receiptLink}
                        onPress={() => handleOpenReceipt(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="receipt-outline" size={14} color={isDark ? "#38BDF8" : "#0284C7"} />
                        <Text style={[styles.receiptLinkText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                          Receipt
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.payLink}
                        onPress={() => setShowPaymentModal(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.payLinkText}>Pay Now</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Payment Flow Modal */}
      <TenantPaymentModal
        visible={showPaymentModal}
        month={activeRent?.month || "Current Month"}
        amount={activeRent?.amount || 18500}
        instructions={paymentInstructions}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={(res) => {
          payRent(res);
        }}
      />

      {/* Digital Receipt Modal */}
      <TenantReceiptModal
        visible={showReceiptModal}
        ledgerItem={selectedLedgerItem}
        property={property}
        tenantName={profile.name}
        tenantPhone={profile.phone}
        onClose={() => setShowReceiptModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  payTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  payTopBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  heroCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroSub: {
    fontSize: 12,
    fontWeight: "600",
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  heroStatusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  heroStatusText: {
    fontSize: 11,
    fontWeight: "900",
  },
  dueInfoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  dueInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  dueInfoText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  countdownPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: "800",
  },
  heroActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  heroPayBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  heroPayBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },
  heroQrBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  heroQrBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  heroReceiptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  heroReceiptBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
  historySection: {
    gap: 10,
  },
  historyHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
  },
  filterGroup: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 2,
  },
  filterTab: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: "800",
  },
  ledgerList: {
    gap: 10,
  },
  ledgerCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  ledgerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ledgerMonthBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ledgerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ledgerMonth: {
    fontSize: 14,
    fontWeight: "800",
  },
  ledgerDate: {
    fontSize: 11.5,
    marginTop: 1,
  },
  ledgerAmt: {
    fontSize: 16,
    fontWeight: "900",
  },
  ledgerStatusTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ledgerStatusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  ledgerBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
  },
  ledgerRef: {
    fontSize: 11,
    fontWeight: "500",
  },
  receiptLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  receiptLinkText: {
    fontSize: 12,
    fontWeight: "800",
  },
  payLink: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#0284C7",
  },
  payLinkText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
});
