import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
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
import { formatCurrency, useFieldAgent } from "../../../constants/fieldAgentData";

export function CommissionWalletScreen() {
  const insets = useSafeAreaInsets();
  const {
    agentProfile,
    availableBalance,
    totalEarnings,
    pendingApproval,
    payoutHistory,
    requestPayout,
    updateBankDetails,
  } = useFieldAgent();

  const [refreshing, setRefreshing] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Commission Wallet</Text>
          <Text style={styles.headerSub}>Live balance, approved payouts & history</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsBankModalVisible(true)}
          style={styles.bankBtn}
        >
          <Ionicons name="card" size={16} color="#0D9488" />
          <Text style={styles.bankBtnText}>Bank Setup</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={payoutHistory}
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
              onWithdrawPress={() => setIsWithdrawModalVisible(true)}
              onBankDetailsPress={() => setIsBankModalVisible(true)}
            />

            {/* Payout Destination Card */}
            <View style={styles.destCard}>
              <View style={styles.destTopRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="shield-checkmark" size={18} color="#0D9488" />
                  <Text style={styles.destTitle}>Verified Payout Account</Text>
                </View>
                <TouchableOpacity onPress={() => setIsBankModalVisible(true)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.destDetailsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.destLabel}>UPI ID</Text>
                  <Text style={styles.destValue}>{agentProfile.bankDetails.upiId}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.destLabel}>Bank Account</Text>
                  <Text style={styles.destValue}>
                    {agentProfile.bankDetails.bankName} ({agentProfile.bankDetails.accountNumber})
                  </Text>
                </View>
              </View>
            </View>

            {/* Section Header */}
            <View style={styles.payoutHeaderRow}>
              <Text style={styles.payoutHeaderTitle}>Payout & Withdrawal History</Text>
              <Text style={styles.payoutHeaderSub}>Automated direct transfers</Text>
            </View>
          </>
        }
        renderItem={({ item }) => <PayoutHistoryItem transaction={item} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="clock" size={32} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Payouts Yet</Text>
            <Text style={styles.emptySub}>
              Withdrawals requested from your available commission will appear here.
            </Text>
          </View>
        }
      />

      {/* Payout Modal */}
      <PayoutRequestModal
        visible={isWithdrawModalVisible}
        onClose={() => setIsWithdrawModalVisible(false)}
        availableBalance={availableBalance}
        bankDetails={agentProfile.bankDetails}
        onRequestPayout={requestPayout}
      />

      {/* Bank Details Modal */}
      <BankDetailsModal
        visible={isBankModalVisible}
        onClose={() => setIsBankModalVisible(false)}
        bankDetails={agentProfile.bankDetails}
        onSave={updateBankDetails}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  headerSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  bankBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  bankBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F766E",
  },
  scrollContent: {
    paddingBottom: 110,
  },
  destCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    padding: 14,
    marginHorizontal: 20,
    marginTop: 14,
  },
  destTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  destTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  editText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0D9488",
  },
  destDetailsRow: {
    flexDirection: "row",
    gap: 12,
  },
  destLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  destValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  payoutHeaderRow: {
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  payoutHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  payoutHeaderSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    maxWidth: "80%",
  },
});
