import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../constants/fieldAgentData";

interface CommissionCardProps {
  availableBalance: number;
  totalEarnings: number;
  pendingApproval: number;
  onWithdrawPress?: () => void;
  onBankDetailsPress?: () => void;
  style?: any;
}

export const CommissionCard: React.FC<CommissionCardProps> = ({
  availableBalance,
  totalEarnings,
  pendingApproval,
  onWithdrawPress,
  onBankDetailsPress,
  style,
}) => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={["#0D9488", "#0F766E"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {/* Top Row: Wallet Title + Bank Setup Pill */}
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.walletIconCircle}>
            <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.cardTitle}>{t("wallet.commissionWallet")}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBankDetailsPress}
          style={styles.bankPill}
        >
          <Ionicons name="card-outline" size={13} color="#FFFFFF" />
          <Text style={styles.bankPillText}>{t("wallet.upiBank")}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>{t("wallet.availForWithdrawal")}</Text>
        <Text style={styles.balanceValue}>
          {formatCurrency(availableBalance)}
        </Text>
      </View>

      {/* Sub Stats Row */}
      <View style={styles.subStatsRow}>
        <View style={styles.subStatItem}>
          <Text style={styles.subStatLabel}>{t("wallet.totalEarned")}</Text>
          <Text style={styles.subStatValue}>
            {formatCurrency(totalEarnings)}
          </Text>
        </View>

        <View style={styles.subStatDivider} />

        <View style={styles.subStatItem}>
          <Text style={styles.subStatLabel}>{t("wallet.pendingApproval")}</Text>
          <Text style={styles.subStatValue}>
            {formatCurrency(pendingApproval)}
          </Text>
        </View>
      </View>

      {/* Action Button: Instant Withdrawal */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onWithdrawPress}
        style={styles.withdrawButton}
      >
        <Ionicons name="flash-outline" size={16} color="#0F766E" />
        <Text style={styles.withdrawButtonText}>{t("wallet.instantPayoutRequest")}</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  walletIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  bankPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  bankPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  balanceContainer: {
    marginTop: 14,
  },
  balanceLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  subStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  subStatItem: {
    flex: 1,
  },
  subStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 10,
  },
  subStatLabel: {
    fontSize: 10.5,
    color: "rgba(255, 255, 255, 0.75)",
    fontWeight: "600",
  },
  subStatValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 1,
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
    gap: 6,
  },
  withdrawButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F766E",
  },
});
