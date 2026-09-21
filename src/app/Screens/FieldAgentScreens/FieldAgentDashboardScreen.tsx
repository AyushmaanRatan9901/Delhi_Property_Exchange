import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
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
import { useResponsiveTheme } from "../../../constants/theme";
import { useAppSelector } from "../../../Redux/hooks";

export function FieldAgentDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduxUser = useAppSelector((state) => state?.auth.user);
  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();

  const {
    agentProfile,
    leads,
    availableBalance,
    totalEarnings,
    pendingApproval,
    refreshLeads,
    requestPayout,
    updateBankDetails,
  } = useFieldAgent();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  // Real live profile from logged-in user
  const liveProfile = {
    id:
      (reduxUser as any)?.staffId ||
      (reduxUser as any)?.recordCode ||
      (reduxUser as any)?.id ||
      (reduxUser as any)?._id ||
      agentProfile.id ||
      "AGT-7821",
    name: reduxUser?.name || agentProfile.name || "Field Agent",
    phone: reduxUser?.phone || agentProfile.phone || "",
    email: reduxUser?.email || agentProfile.email || "",
    tier: ((reduxUser?.role || "Field Agent") as string).replace(/_/g, " "),
    tierLevel: agentProfile.tierLevel || 1,
    assignedLocality:
      (reduxUser as any)?.address?.city ||
      (reduxUser as any)?.city ||
      agentProfile.assignedLocality ||
      "Delhi NCR",
    joinedDate: (reduxUser as any)?.createdAt
      ? new Date((reduxUser as any).createdAt).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        })
      : agentProfile.joinedDate,
    kycStatus: ((reduxUser as any)?.isVerified !== false
      ? "VERIFIED"
      : "PENDING") as "VERIFIED" | "PENDING",
    avatar:
      (reduxUser as any)?.profilePhoto ||
      (reduxUser as any)?.avatar ||
      agentProfile.avatar,
    bankDetails: {
      upiId:
        (reduxUser as any)?.bankDetails?.upiId ||
        agentProfile.bankDetails?.upiId ||
        "",
      accountHolder:
        (reduxUser as any)?.bankDetails?.accountHolder ||
        (reduxUser as any)?.bankDetails?.accountHolderName ||
        agentProfile.bankDetails?.accountHolder ||
        reduxUser?.name ||
        "",
      bankName:
        (reduxUser as any)?.bankDetails?.bankName ||
        agentProfile.bankDetails?.bankName ||
        "",
      accountNumber:
        (reduxUser as any)?.bankDetails?.accountNumber ||
        agentProfile.bankDetails?.accountNumber ||
        "",
      ifsc:
        (reduxUser as any)?.bankDetails?.ifsc ||
        (reduxUser as any)?.bankDetails?.ifscCode ||
        agentProfile.bankDetails?.ifsc ||
        "",
    },
  };

  const totalCount = leads.length;
  const verifiedCount = leads.filter((l) => l.status === "VERIFIED").length;
  const convertedCount = leads.filter(
    (l) => l.status === "RENTED" || l.status === "SOLD",
  ).length;

  const recentLeads = leads.slice(0, 3);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (refreshLeads) await refreshLeads();
    } catch {}
    setRefreshing(false);
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
    router.push("/FiledAgentPanel/notifications" as any);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : "#F8FAFC" },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? colors.cardBackground : "#FFFFFF"}
      />

      {/* Top Header */}
      <AgentHeader
        profile={liveProfile}
        onNotificationPress={handleNotificationPress}
        onProfilePress={() =>
          router.push("/FiledAgentPanel/(tabs)/profile" as any)
        }
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
              router.push("/FiledAgentPanel/(tabs)/addLead" as any);
            }}
            style={styles.heroBtnWrapper}
          >
            <LinearGradient
              colors={isDark ? ["#0F766E", "#042F2E"] : ["#0F766E", "#0D9488"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroGradient}
            >
              <View style={styles.heroIconBox}>
                <Ionicons name="add-circle" size={28} color="#FFFFFF" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>
                  {t("fieldAgent.addNewLeadQuick")}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {t("fieldAgent.gpsPickerTitle")} •{" "}
                  {t("fieldAgent.submitLeadBtn")}
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
              router.push("/FiledAgentPanel/(tabs)/wallet" as any);
            } else {
              router.push("/FiledAgentPanel/(tabs)/leads" as any);
            }
          }}
        />

        {/* Commission Wallet Snapshot */}
        <View style={styles.commissionCardWrapper}>
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
        </View>

        {/* Recent Submissions Header */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {t("fieldAgent.recentSubmissions")}
            </Text>
            <Text
              style={[
                styles.sectionSub,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {t("profile.privacyBullet1")}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/FiledAgentPanel/(tabs)/leads" as any)}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>
              {t("common.viewAll")} ({leads.length})
            </Text>
            <Feather
              name="chevron-right"
              size={14}
              color={isDark ? "#2DD4BF" : "#0D9488"}
            />
          </TouchableOpacity>
        </View>

        {/* Recent Leads List */}
        <View style={styles.leadsListContainer}>
          {recentLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onPress={handleLeadPress} />
          ))}
        </View>

        {/* Partner Tip / Incentive Card */}
        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: isDark ? "#2E1E08" : "#FEF3C7",
              borderColor: isDark ? "#78350F" : "#FDE68A",
            },
          ]}
        >
          <View
            style={[
              styles.tipIconBox,
              { backgroundColor: isDark ? "#451A03" : "#FFFFFF" },
            ]}
          >
            <Ionicons name="sparkles" size={20} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.tipTitle,
                { color: isDark ? "#FCD34D" : "#92400E" },
              ]}
            >
              {t("fieldAgent.monthlyBonusTitle")}
            </Text>
            <Text
              style={[
                styles.tipDesc,
                { color: isDark ? "#FBBF24" : "#B45309" },
              ]}
            >
              {t("fieldAgent.monthlyBonusDesc")}
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
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroActionContainer: {
    paddingHorizontal: 20,
    marginTop: 14,
  },
  commissionCardWrapper: {
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
  },
  sectionSub: {
    fontSize: 11.5,
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
    borderWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  tipDesc: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 16,
  },
});

export default FieldAgentDashboardScreen;
