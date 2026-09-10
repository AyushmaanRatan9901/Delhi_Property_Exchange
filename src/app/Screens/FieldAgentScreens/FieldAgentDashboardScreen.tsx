import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AgentHeader,
  BankDetailsModal,
  CommissionCard,
  LeadCard,
  LeadDetailModal,
  PayoutRequestModal,
  StatsGrid,
} from "../../../components/FieldAgentComponent";
import { LeadItem, useFieldAgent } from "../../../constants/fieldAgentData";

export function FieldAgentDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    agentProfile,
    leads,
    availableBalance,
    totalEarnings,
    pendingApproval,
    requestPayout,
    updateBankDetails,
  } = useFieldAgent();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  const totalCount = leads.length;
  const verifiedCount = leads.filter((l) => l.status === "VERIFIED").length;
  const convertedCount = leads.filter((l) => l.status === "RENTED" || l.status === "SOLD").length;

  const recentLeads = leads.slice(0, 3);

  const handleRefresh = () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  };

  const handleLeadPress = (lead: LeadItem) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedLead(lead);
    setIsDetailModalVisible(true);
  };

  const handleNotificationPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    Alert.alert(
      "Agent Notifications 🔔",
      "• Lead #LD-9038 was approved by verification staff! Commission added to wallet.\n• Payout of ₹6,000 processed to your UPI."
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <AgentHeader
        profile={agentProfile}
        onNotificationPress={handleNotificationPress}
        onProfilePress={() => router.push("/FiledAgentPanel/(tabs)/profile" as any)}
      />

      <ScrollView
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
      >
        {/* Quick 1-Click Submit New Lead Hero Action */}
        <View style={styles.heroActionContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              } catch {}
              router.push("/FiledAgentPanel/(tabs)/visits" as any);
            }}
            style={styles.heroBtnWrapper}
          >
            <LinearGradient
              colors={["#0F766E", "#0D9488"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroIconBox}>
                <Ionicons name="add-circle" size={28} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>Submit New Property Lead</Text>
                <Text style={styles.heroSubtitle}>
                  1-Click GPS Pin • Earn up to ₹15,000 commission
                </Text>
              </View>

              <View style={styles.heroArrowCircle}>
                <Feather name="arrow-right" size={18} color="#0D9488" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* 4 Stats Grid */}
        <StatsGrid
          totalLeads={totalCount}
          verifiedLeads={verifiedCount}
          convertedLeads={convertedCount}
          availableBalance={availableBalance}
          onCardPress={(type) => {
            try {
              Haptics.selectionAsync();
            } catch {}
            if (type === "wallet") {
              router.push("/FiledAgentPanel/(tabs)/properties" as any);
            } else {
              router.push("/FiledAgentPanel/(tabs)/leads" as any);
            }
          }}
        />

        {/* Commission Wallet Snapshot */}
        <CommissionCard
          availableBalance={availableBalance}
          totalEarnings={totalEarnings}
          pendingApproval={pendingApproval}
          onWithdrawPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {}
            setIsWithdrawModalVisible(true);
          }}
          onBankDetailsPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            setIsBankModalVisible(true);
          }}
        />

        {/* Recent Submissions Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Recent Submitted Leads</Text>
            <Text style={styles.sectionSub}>Only your personally submitted leads</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/FiledAgentPanel/(tabs)/leads" as any)}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>View All ({leads.length})</Text>
            <Feather name="chevron-right" size={14} color="#0D9488" />
          </TouchableOpacity>
        </View>

        {/* Recent Leads List */}
        <View style={styles.leadsListContainer}>
          {recentLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onPress={handleLeadPress} />
          ))}
        </View>

        {/* Partner Tip / Incentive Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconBox}>
            <Ionicons name="sparkles" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Monthly Partner Bonus 🏆</Text>
            <Text style={styles.tipDesc}>
              Submit 5 verified leads this month and receive an extra ₹2,500 bonus directly in your UPI wallet!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        visible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
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
  scrollContent: {
    paddingBottom: 110,
  },
  heroActionContainer: {
    paddingHorizontal: 20,
    marginTop: 14,
  },
  heroBtnWrapper: {
    borderRadius: 20,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    gap: 12,
  },
  heroIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    fontSize: 11.5,
    color: "#CCFBF1",
    marginTop: 2,
    fontWeight: "600",
  },
  heroArrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  sectionSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0D9488",
  },
  leadsListContainer: {
    paddingHorizontal: 20,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 14,
    gap: 12,
  },
  tipIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#92400E",
  },
  tipDesc: {
    fontSize: 11.5,
    color: "#B45309",
    marginTop: 2,
    lineHeight: 16,
  },
});
