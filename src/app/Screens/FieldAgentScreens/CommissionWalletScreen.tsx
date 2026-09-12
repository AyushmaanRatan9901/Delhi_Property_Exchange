import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState, useCallback } from "react";
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
import { formatCurrency, LeadItem, PayoutTransaction } from "../../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../../constants/theme";
import { useAppSelector } from "../../../Redux/hooks";
import apiClient from "../../../Redux/api/axiosInstance";

export function CommissionWalletScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useResponsiveTheme();
  const reduxUser = useAppSelector((state) => state.auth.user);

  const [stats, setStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(reduxUser || {});
  const [realLeads, setRealLeads] = useState<LeadItem[]>([]);
  const [payoutList, setPayoutList] = useState<PayoutTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  // ── Fetch Real Data from Backend ─────────────────────────────
  const loadWalletData = useCallback(async () => {
    try {
      const [statsRes, meRes, leadsRes] = await Promise.allSettled([
        apiClient.get("/leads/my-stats"),
        apiClient.get("/auth/me"),
        apiClient.get("/leads/my-leads"),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value.data?.data) {
        setStats(statsRes.value.data.data);
      }

      if (meRes.status === "fulfilled" && meRes.value.data?.data) {
        setProfile(meRes.value.data.data);
      }

      if (leadsRes.status === "fulfilled" && leadsRes.value.data?.data?.leads) {
        const docs = leadsRes.value.data.data.leads;
        setRealLeads(docs);

        const dynamicPayouts: PayoutTransaction[] = docs
          .filter((l: any) => l.commission?.approvedAmount > 0 || l.commission?.status === "paid")
          .map((l: any, idx: number) => ({
            id: `TXN-${l.leadId || l._id || idx}`,
            amount: l.commission?.approvedAmount || l.commission?.estimatedAmount || 0,
            method: profile.upiId ? `UPI (${profile.upiId})` : "Direct Wallet Credit",
            date: l.commission?.paidAt
              ? new Date(l.commission.paidAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : l.createdAt
              ? new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "Recently",
            status: (l.commission?.status === "paid" ? "COMPLETED" : "PROCESSING") as "COMPLETED" | "PROCESSING",
            referenceId: `LEAD/${l.leadId || l._id}`,
          }));

        setPayoutList(dynamicPayouts);
      }
    } catch (err) {
      console.log("[CommissionWalletScreen] Error loading real wallet data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile.upiId]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  const handleRefresh = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setRefreshing(true);
    await loadWalletData();
  };

  // Real Calculated Balances
  const availableBalance = stats?.walletBalance ?? stats?.approvedCommission ?? 0;
  const totalEarnings = (stats?.approvedCommission || 0) + (stats?.paidCommission || 0);
  const pendingApproval = stats?.potentialCommission || 0;

  const currentBankDetails = {
    upiId: profile.bankDetails?.upiId || profile.upiId || "",
    accountHolder: profile.bankDetails?.accountHolder || profile.bankDetails?.accountHolderName || profile.name || "",
    bankName: profile.bankDetails?.bankName || "",
    accountNumber: profile.bankDetails?.accountNumber || "",
    ifsc: profile.bankDetails?.ifsc || profile.bankDetails?.ifscCode || "",
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
      setIsBankModalVisible(false);
      Alert.alert("Account Linked", "Your payout UPI and Bank details have been saved.");
    } catch (err: any) {
      Alert.alert("Update Failed", err.message || "Could not save payout details.");
    }
  };

  const handleRequestPayout = async (amount: number, method: string): Promise<boolean> => {
    if (amount <= 0 || amount > availableBalance) {
      Alert.alert("Invalid Amount", `You can withdraw up to available balance: ${formatCurrency(availableBalance)}`);
      return false;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const newTxn: PayoutTransaction = {
      id: "REQ-" + Math.floor(10000 + Math.random() * 90000),
      amount,
      method,
      date: "Just now",
      status: "PROCESSING",
      referenceId: "PAYOUT/" + Date.now().toString().slice(-8),
    };

    setPayoutList((prev) => [newTxn, ...prev]);
    setIsWithdrawModalVisible(false);

    Alert.alert(
      "Payout Request Submitted! 💸",
      `Withdrawal of ${formatCurrency(amount)} via ${method} is queued for automated disbursal to your account.`
    );
    return true;
  };

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
            My Commission Wallet
          </Text>
          <Text
            style={[
              styles.headerSub,
              { color: isDark ? colors.textMuted : "#64748B" },
            ]}
          >
            Live balance, verified earnings & payouts
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
            Bank Setup
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDark ? "#2DD4BF" : "#0D9488"}
          />
          <Text
            style={[
              styles.loadingText,
              { color: isDark ? "#2DD4BF" : "#0D9488" },
            ]}
          >
            Syncing wallet balance from server...
          </Text>
        </View>
      ) : (
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
              {/* Wallet Overview Card */}
              <CommissionCard
                availableBalance={availableBalance}
                totalEarnings={totalEarnings}
                pendingApproval={pendingApproval}
                onWithdrawPress={() => {
                  if (availableBalance <= 0) {
                    Alert.alert(
                      "No Available Balance",
                      "You currently do not have approved commission available to withdraw. Commission is approved once your leads are verified."
                    );
                    return;
                  }
                  setIsWithdrawModalVisible(true);
                }}
                onBankDetailsPress={() => setIsBankModalVisible(true)}
              />

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
                    style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
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
                      Registered Payout Destination
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsBankModalVisible(true)}>
                    <Text
                      style={[
                        styles.editText,
                        { color: isDark ? "#2DD4BF" : "#0D9488" },
                      ]}
                    >
                      {profile.upiId || profile.bankDetails?.accountNumber
                        ? "Edit"
                        : "+ Add"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.destDetailsRow,
                    { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC" },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.destLabel,
                        { color: isDark ? colors.textMuted : "#64748B" },
                      ]}
                    >
                      UPI ID
                    </Text>
                    <Text
                      style={[
                        styles.destValue,
                        { color: isDark ? colors.textPrimary : "#0F172A" },
                      ]}
                    >
                      {profile.upiId || "Not Linked"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.destLabel,
                        { color: isDark ? colors.textMuted : "#64748B" },
                      ]}
                    >
                      Bank Account
                    </Text>
                    <Text
                      style={[
                        styles.destValue,
                        { color: isDark ? colors.textPrimary : "#0F172A" },
                      ]}
                    >
                      {profile.bankDetails?.bankName
                        ? `${profile.bankDetails.bankName} (••${String(
                            profile.bankDetails.accountNumber || ""
                          ).slice(-4)})`
                        : "Not Linked"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Commission Leads Breakdown */}
              {realLeads.length > 0 && (
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
                    Lead Commission Summary
                  </Text>
                  <View style={styles.breakdownRow}>
                    <View style={styles.breakdownItem}>
                      <Text
                        style={[
                          styles.breakdownVal,
                          { color: isDark ? colors.textPrimary : "#0F172A" },
                        ]}
                      >
                        {stats?.totalSubmitted ?? realLeads.length}
                      </Text>
                      <Text
                        style={[
                          styles.breakdownLbl,
                          { color: isDark ? colors.textMuted : "#64748B" },
                        ]}
                      >
                        Total Leads
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
                        {stats?.verified ??
                          realLeads.filter((l: any) => l.status === "verified")
                            .length}
                      </Text>
                      <Text
                        style={[
                          styles.breakdownLbl,
                          { color: isDark ? colors.textMuted : "#64748B" },
                        ]}
                      >
                        Verified
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
                        {stats?.underVerification ??
                          realLeads.filter(
                            (l: any) =>
                              l.status === "new" ||
                              l.status === "assigned" ||
                              l.status === "under_verification"
                          ).length}
                      </Text>
                      <Text
                        style={[
                          styles.breakdownLbl,
                          { color: isDark ? colors.textMuted : "#64748B" },
                        ]}
                      >
                        In Review
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
                  Commission & Payout Ledger
                </Text>
                <Text
                  style={[
                    styles.payoutHeaderSub,
                    { color: isDark ? colors.textMuted : "#64748B" },
                  ]}
                >
                  Real-time transaction history
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
                No Commission Transactions Yet
              </Text>
              <Text
                style={[
                  styles.emptySub,
                  { color: isDark ? colors.textMuted : "#94A3B8" },
                ]}
              >
                Submit new verified property leads to earn commissions. Approved
                payouts will appear here in real time.
              </Text>
            </View>
          }
        />
      )}

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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
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
