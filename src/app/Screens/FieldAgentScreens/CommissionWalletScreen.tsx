import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BankDetailsModal,
  CommissionCard,
  PayoutHistoryItem,
  PayoutRequestModal,
} from "../../../components/FieldAgentComponent";
import {
  formatCurrency,
  LeadItem,
  PayoutTransaction,
  useFieldAgent,
} from "../../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../../constants/theme";
import { useAppSelector } from "../../../Redux/hooks";
import apiClient from "../../../Redux/api/axiosInstance";

export function CommissionWalletScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();
  const reduxUser = useAppSelector((state) => state.auth.user);

  // Central Source of Truth from FieldAgentContext (same as Dashboard.tsx)
  const {
    agentProfile,
    leads,
    payoutHistory,
    availableBalance,
    totalEarnings,
    pendingApproval,
    recurringMonthlyActive,
    refreshLeads,
    requestPayout: contextRequestPayout,
    updateBankDetails: contextUpdateBankDetails,
  } = useFieldAgent();

  const [profile, setProfile] = useState<any>(reduxUser || agentProfile || {});
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  // Fetch updated profile for bank details
  const loadProfile = useCallback(async () => {
    try {
      const res = await apiClient.get("/auth/me");
      if (res.data?.data) {
        setProfile(res.data.data);
      }
    } catch (err) {
      // Continue with redux / context fallback
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleRefresh = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setRefreshing(true);
    await Promise.allSettled([refreshLeads(), loadProfile()]);
    setRefreshing(false);
  };

  // Construct dynamic payout transaction list from leads + payoutHistory
  const payoutList = useMemo(() => {
    const dynamicPayouts: PayoutTransaction[] = [];

    leads.forEach((l: any, idx: number) => {
      if (
        Array.isArray(l.recurringCommissions) &&
        l.recurringCommissions.length > 0
      ) {
        l.recurringCommissions.forEach((rc: any, rcIdx: number) => {
          dynamicPayouts.push({
            id: `TXN-${l.id || l._id}-${rc.month}-${rcIdx}`,
            amount: rc.commissionAmount || 0,
            method:
              rc.type === "first_month"
                ? "1st Month Move-In Commission"
                : `Monthly Recurring (${rc.month})`,
            date: rc.createdAt
              ? new Date(rc.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : rc.month || "Recently",
            status:
              rc.status === "paid" ? "COMPLETED" : "PROCESSING",
            referenceId: `LEAD/${l.id || l._id}`,
          });
        });
      } else if (
        (l.status === "RENTED" || l.status === "SOLD") &&
        (l.commissionAmount > 0 || l.firstMonthCommission > 0)
      ) {
        const commAmt = l.commissionAmount || l.firstMonthCommission || 0;
        dynamicPayouts.push({
          id: `TXN-${l.id || l._id || idx}`,
          amount: commAmt,
          method:
            l.listingType === "SALE"
              ? "Property Sale Commission"
              : "Tenant Move-In Commission",
          date: l.submissionDate || "Recently",
          status:
            l.commissionStatus === "PAID"
              ? "COMPLETED"
              : "PROCESSING",
          referenceId: `LEAD/${l.id || l._id}`,
        });
      }
    });

    // Merge with payout requests
    const combined = [...payoutHistory, ...dynamicPayouts];
    // Remove potential duplicates by id
    const seen = new Set();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [leads, payoutHistory]);

  const currentBankDetails = {
    upiId:
      profile.bankDetails?.upiId ||
      profile.upiId ||
      agentProfile.bankDetails?.upiId ||
      "",
    accountHolder:
      profile.bankDetails?.accountHolder ||
      profile.bankDetails?.accountHolderName ||
      agentProfile.bankDetails?.accountHolder ||
      profile.name ||
      "",
    bankName:
      profile.bankDetails?.bankName ||
      agentProfile.bankDetails?.bankName ||
      "",
    accountNumber:
      profile.bankDetails?.accountNumber ||
      agentProfile.bankDetails?.accountNumber ||
      "",
    ifsc:
      profile.bankDetails?.ifsc ||
      profile.bankDetails?.ifscCode ||
      agentProfile.bankDetails?.ifsc ||
      "",
  };

  const handleUpdateBank = async (details: any) => {
    try {
      const res = await apiClient.put("/auth/profile", {
        upiId: details.upiId,
        bankDetails: {
          upiId: details.upiId,
          accountHolder: details.accountHolder,
          accountHolderName: details.accountHolder,
          bankName: details.bankName,
          accountNumber: details.accountNumber,
          ifsc: details.ifsc,
          ifscCode: details.ifsc,
        },
      });

      if (res.data?.data) {
        setProfile(res.data.data);
      }
      if (contextUpdateBankDetails) {
        contextUpdateBankDetails(details);
      }
      setIsBankModalVisible(false);
      Alert.alert(t("wallet.accountLinkedTitle"), t("wallet.accountLinkedMsg"));
    } catch (err: any) {
      Alert.alert(
        t("wallet.updateFailed"),
        err.message || "Could not save payout details."
      );
    }
  };

  const handleRequestPayout = async (
    amount: number,
    method: string
  ): Promise<boolean> => {
    if (amount <= 0 || amount > availableBalance) {
      Alert.alert(
        t("wallet.invalidAmountTitle"),
        t("wallet.invalidAmountMsg", {
          amount: formatCurrency(availableBalance),
        })
      );
      return false;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    if (contextRequestPayout) {
      await contextRequestPayout(amount, method);
    }

    setIsWithdrawModalVisible(false);

    Alert.alert(
      t("wallet.payoutSubmittedTitle"),
      t("wallet.payoutSubmittedMsg", {
        amount: formatCurrency(amount),
        method,
      })
    );
    return true;
  };

  const totalLeadsCount = leads.length;
  const verifiedLeadsCount = leads.filter(
    (l) => l.status === "VERIFIED" || l.status === "RENTED" || l.status === "SOLD"
  ).length;
  const inReviewLeadsCount = leads.filter(
    (l) =>
      l.status === "NEW" ||
      (l.status as string) === "ASSIGNED" ||
      (l.status as string) === "UNDER_VERIFICATION"
  ).length;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background : "#F8FAFC",
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? colors.cardBackground : "#FFFFFF"}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 10) + 8,
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#F1F5F9",
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
          >
            {t("wallet.headerTitle")}
          </Text>
          <Text
            style={[
              styles.headerSub,
              { color: isDark ? colors.textMuted : "#64748B" },
            ]}
          >
            {t("wallet.headerSub")}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsBankModalVisible(true)}
          style={[
            styles.bankBtn,
            {
              backgroundColor: isDark ? "#082F2C" : "#F0FDFA",
              borderColor: isDark ? "#115E59" : "#CCFBF1",
            },
          ]}
        >
          <Ionicons
            name="card"
            size={16}
            color={isDark ? "#2DD4BF" : "#0D9488"}
          />
          <Text
            style={[
              styles.bankBtnText,
              { color: isDark ? "#2DD4BF" : "#0D9488" },
            ]}
          >
            {t("wallet.bankSetup")}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={payoutList}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0D9488"]}
            tintColor="#0D9488"
          />
        }
        ListHeaderComponent={
          <>
            {/* Wallet Overview Card - Exact same values as Dashboard */}
            <CommissionCard
              availableBalance={availableBalance}
              totalEarnings={totalEarnings}
              pendingApproval={pendingApproval}
              recurringMonthlyActive={recurringMonthlyActive}
              onWithdrawPress={() => {
                if (availableBalance <= 0) {
                  Alert.alert(
                    t("wallet.noBalanceTitle"),
                    t("wallet.noBalanceMsg")
                  );
                  return;
                }
                setIsWithdrawModalVisible(true);
              }}
              onBankDetailsPress={() => setIsBankModalVisible(true)}
            />

            {/* Recurring Commission Model Notice Banner */}
            <View
              style={{
                backgroundColor: isDark ? "#0A2540" : "#EFF6FF",
                borderColor: isDark ? "#1E40AF" : "#BFDBFE",
                borderWidth: 1,
                borderRadius: 16,
                padding: 14,
                marginTop: 12,
                gap: 6,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons
                  name="repeat"
                  size={16}
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "800",
                    color: isDark ? "#93C5FD" : "#1E40AF",
                  }}
                >
                  Recurring Monthly Commission Model
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11.5,
                  lineHeight: 16,
                  color: isDark ? "#CBD5E1" : "#3B82F6",
                }}
              >
                • <Text style={{ fontWeight: "700" }}>Initial Commission</Text>
                : Earned when a tenant is registered and pays the 1st month rent.
                {"\n"}•{" "}
                <Text style={{ fontWeight: "700" }}>Monthly Recurring</Text>:
                Earn continuous monthly commission on every rent payment as long
                as the tenant resides.{"\n"}•{" "}
                <Text style={{ fontWeight: "700" }}>Verification</Text>:
                Property verification approves the listing live, but commission
                activates upon tenant move-in.
              </Text>
            </View>

            {/* Payout Destination Card */}
            <View
              style={[
                styles.destCard,
                {
                  backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              <View style={styles.destTopRow}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={18}
                    color={isDark ? "#2DD4BF" : "#0D9488"}
                  />
                  <Text
                    style={[
                      styles.destTitle,
                      { color: isDark ? colors.textPrimary : "#0F172A" },
                    ]}
                  >
                    {t("wallet.registeredDestination")}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsBankModalVisible(true)}>
                  <Text
                    style={[
                      styles.editText,
                      { color: isDark ? "#2DD4BF" : "#0D9488" },
                    ]}
                  >
                    {currentBankDetails.upiId ||
                    currentBankDetails.accountNumber
                      ? t("wallet.edit")
                      : t("wallet.add")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.destDetailsRow,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.destLabel,
                      { color: isDark ? colors.textMuted : "#64748B" },
                    ]}
                  >
                    {t("wallet.upiId")}
                  </Text>
                  <Text
                    style={[
                      styles.destValue,
                      { color: isDark ? colors.textPrimary : "#0F172A" },
                    ]}
                  >
                    {currentBankDetails.upiId || t("wallet.notLinked")}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.destLabel,
                      { color: isDark ? colors.textMuted : "#64748B" },
                    ]}
                  >
                    {t("wallet.bankAccount")}
                  </Text>
                  <Text
                    style={[
                      styles.destValue,
                      { color: isDark ? colors.textPrimary : "#0F172A" },
                    ]}
                  >
                    {currentBankDetails.bankName
                      ? `${currentBankDetails.bankName} (••${String(
                          currentBankDetails.accountNumber || ""
                        ).slice(-4)})`
                      : t("wallet.notLinked")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Commission Leads Breakdown */}
            {totalLeadsCount > 0 && (
              <View
                style={[
                  styles.leadsBreakdownCard,
                  {
                    backgroundColor: isDark
                      ? colors.cardBackground
                      : "#FFFFFF",
                    borderColor: isDark ? colors.border : "#E2E8F0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.breakdownHeader,
                    { color: isDark ? colors.textPrimary : "#0F172A" },
                  ]}
                >
                  {t("wallet.leadCommissionSummary")}
                </Text>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownItem}>
                    <Text
                      style={[
                        styles.breakdownVal,
                        { color: isDark ? colors.textPrimary : "#0F172A" },
                      ]}
                    >
                      {totalLeadsCount}
                    </Text>
                    <Text
                      style={[
                        styles.breakdownLbl,
                        { color: isDark ? colors.textMuted : "#64748B" },
                      ]}
                    >
                      {t("wallet.totalLeads")}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.breakdownDivider,
                      { backgroundColor: isDark ? colors.border : "#E2E8F0" },
                    ]}
                  />
                  <View style={styles.breakdownItem}>
                    <Text
                      style={[
                        styles.breakdownVal,
                        { color: isDark ? "#34D399" : "#059669" },
                      ]}
                    >
                      {verifiedLeadsCount}
                    </Text>
                    <Text
                      style={[
                        styles.breakdownLbl,
                        { color: isDark ? colors.textMuted : "#64748B" },
                      ]}
                    >
                      {t("wallet.verified")}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.breakdownDivider,
                      { backgroundColor: isDark ? colors.border : "#E2E8F0" },
                    ]}
                  />
                  <View style={styles.breakdownItem}>
                    <Text
                      style={[
                        styles.breakdownVal,
                        { color: isDark ? "#FBBF24" : "#D97706" },
                      ]}
                    >
                      {inReviewLeadsCount}
                    </Text>
                    <Text
                      style={[
                        styles.breakdownLbl,
                        { color: isDark ? colors.textMuted : "#64748B" },
                      ]}
                    >
                      {t("wallet.inReview")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Section Header */}
            <View style={styles.payoutHeaderRow}>
              <Text
                style={[
                  styles.payoutHeaderTitle,
                  { color: isDark ? colors.textPrimary : "#0F172A" },
                ]}
              >
                {t("wallet.ledgerTitle")}
              </Text>
              <Text
                style={[
                  styles.payoutHeaderSub,
                  { color: isDark ? colors.textMuted : "#64748B" },
                ]}
              >
                {t("wallet.ledgerSub")}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => <PayoutHistoryItem transaction={item} />}
        ListEmptyComponent={
          <View
            style={[
              styles.emptyBox,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
            ]}
          >
            <Feather
              name="clock"
              size={32}
              color={isDark ? colors.textMuted : "#94A3B8"}
            />
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? colors.textSecondary : "#475569" },
              ]}
            >
              {t("wallet.noTransactionsYet")}
            </Text>
            <Text
              style={[
                styles.emptySub,
                { color: isDark ? colors.textMuted : "#94A3B8" },
              ]}
            >
              {t("wallet.noTransactionsSub")}
            </Text>
          </View>
        }
      />

      {/* Payout Modal */}
      <PayoutRequestModal
        visible={isWithdrawModalVisible}
        onClose={() => setIsWithdrawModalVisible(false)}
        availableBalance={availableBalance}
        bankDetails={currentBankDetails}
        onRequestPayout={handleRequestPayout}
      />

      {/* Bank Details Modal */}
      <BankDetailsModal
        visible={isBankModalVisible}
        onClose={() => setIsBankModalVisible(false)}
        bankDetails={currentBankDetails}
        onSave={handleUpdateBank}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  headerSub: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: "500",
  },
  bankBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.2,
    gap: 6,
  },
  bankBtnText: {
    fontSize: 12,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  destCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  destTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  destTitle: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  editText: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  destDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  destLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 2,
  },
  destValue: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  leadsBreakdownCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
    marginVertical: 10,
  },
  breakdownHeader: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  breakdownItem: {
    alignItems: "center",
  },
  breakdownVal: {
    fontSize: 18,
    fontWeight: "900",
  },
  breakdownLbl: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  breakdownDivider: {
    width: 1,
    height: 28,
  },
  payoutHeaderRow: {
    marginTop: 14,
    marginBottom: 12,
  },
  payoutHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  payoutHeaderSub: {
    fontSize: 11.5,
    marginTop: 1,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    borderRadius: 18,
    borderWidth: 1.2,
    borderStyle: "dashed",
    paddingHorizontal: 20,
    marginTop: 6,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptySub: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});

export default CommissionWalletScreen;
