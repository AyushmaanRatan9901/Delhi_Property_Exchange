import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  AgentQRCode,
  BankDetailsModal,
} from "../../../components/FieldAgentComponent";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";
import { logout } from "../../../Redux/Auth/authActions";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";

export function AgentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);

  const [realUser, setRealUser] = useState<any>(reduxUser);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  // Fetch real profile from backend /auth/me
  const fetchRealProfile = useCallback(async () => {
    try {
      const res = await apiClient.get("/auth/me");
      if (res.data?.data) {
        setRealUser(res.data.data);
      }
    } catch (err) {
      console.log("[AgentProfileScreen] fetch profile error:", err);
    }
  }, []);

  useEffect(() => {
    fetchRealProfile();
  }, [fetchRealProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRealProfile();
    setRefreshing(false);
  };

  const currentUser = realUser || reduxUser || {};

  // Formatted Profile Data
  const displayName = currentUser.name || "Field Partner";
  const displayPhone = currentUser.phone
    ? `+91 ${currentUser.phone.replace(/\D/g, "").slice(-10)}`
    : "Phone Not Set";
  const displayEmail = currentUser.email || "No email registered";
  const displayStaffId =
    currentUser.staffId ||
    currentUser.recordCode ||
    currentUser.id ||
    currentUser._id ||
    "AGT-PENDING";
  const displayRole = (currentUser.role || "FIELD_AGENT")
    .replace(/_/g, " ")
    .toUpperCase();
  const displayLocality = currentUser.address?.city
    ? `${currentUser.address.street ? currentUser.address.street + ", " : ""}${currentUser.address.city}`
    : currentUser.address?.fullAddress || "Delhi NCR Region";
  const displayJoined = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Active";
  const displayAvatar =
    currentUser.profilePhoto ||
    currentUser.avatar ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  const bankDetails = {
    upiId: currentUser.bankDetails?.upiId || currentUser.upiId || "",
    accountHolder:
      currentUser.bankDetails?.accountHolder ||
      currentUser.bankDetails?.accountHolderName ||
      currentUser.name ||
      "",
    bankName: currentUser.bankDetails?.bankName || "",
    accountNumber: currentUser.bankDetails?.accountNumber || "",
    ifsc:
      currentUser.bankDetails?.ifsc || currentUser.bankDetails?.ifscCode || "",
  };

  const handleCopyId = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    Alert.alert("Staff / Agent ID", `Your ID: ${displayStaffId}`);
  };

  const handleUpdateBank = async (details: any) => {
    try {
      setIsLoading(true);
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
        setRealUser(res.data.data);
      }
      setIsBankModalVisible(false);
      // Alert.alert("Saved Successfully", "Your payout account details have been updated.");
    } catch (err: any) {
      Alert.alert(
        "Update Error",
        err.message || "Could not save payout details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out from Field Agent Panel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await dispatch(logout());
            router.replace("/(auth)/login" as any);
          },
        },
      ],
    );
  };

  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();

  // Theme Gradients
  const primaryGradient = isDark
    ? (["#14b8a6", "#0d9488"] as const)
    : (["#0d9488", "#0f766e"] as const);

  const purpleGradient = isDark
    ? (["#0f766e", "#115e59"] as const)
    : (["#0d9488", "#0f766e"] as const);

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
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? colors.textPrimary : "#0F172A" },
          ]}
        >
          {t("profile.headerTitle")}
        </Text>
        {isLoading && <ActivityIndicator size="small" color="#0D9488" />}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0D9488"]}
          />
        }
      >
        {/* Agent ID Badge Card */}
        <LinearGradient
          colors={primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.idCard}
        >
          {/* Top Row: Official Badge Tag + Status */}
          <View style={styles.idTopRow}>
            <View style={styles.officialBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
              <Text style={styles.officialBadgeText}>
                {t("fieldAgent.verifiedPartner")}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <View style={styles.liveDot} />
              <Text style={styles.statusPillText}>
                {currentUser.isActive !== false ? "ACTIVE" : "PENDING"}
              </Text>
            </View>
          </View>

          {/* Main Info Row: Avatar + Agent Details + QR at Right */}
          <View style={styles.idMainRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              <View style={styles.verifiedCheckBadge}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.agentInfoBlock}>
              <Text style={styles.agentName} numberOfLines={1}>
                {displayName}
              </Text>
              <View style={styles.agentTierBadge}>
                <Text style={styles.agentTierText}>⭐ {displayRole}</Text>
              </View>
              <Text style={styles.agentJoined}>Reg: {displayJoined}</Text>
            </View>

            {/* QR Code Container at Right Side */}
            <View style={styles.qrBox}>
              <AgentQRCode
                value={displayStaffId}
                size={60}
                color="#0F766E"
                backgroundColor="#FFFFFF"
              />
              <Text style={styles.qrScanText}>{t("fieldAgent.scanId")}</Text>
            </View>
          </View>

          <View style={styles.idDivider} />

          {/* Bottom Row: Staff ID & Copy button */}
          <View style={styles.idBottomRow}>
            <View>
              <Text style={styles.idLabel}>{t("fieldAgent.uniqueId")}</Text>
              <Text style={styles.idNumber}>{displayStaffId}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopyId}
              style={styles.copyIdBtn}
            >
              <Feather name="copy" size={13} color="#FFFFFF" />
              <Text style={styles.copyIdText}>{t("fieldAgent.copyId")}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Real Contact Information */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <Text
            style={[
              styles.cardHeader,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
          >
            {t("profile.personalDetails")}
          </Text>
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {t("profile.mobilePhone")}
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {displayPhone}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {t("profile.emailAddress")}
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {displayEmail}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {t("profile.assignedTerritory")}
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {displayLocality}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {t("profile.accountStatus")}
            </Text>
            <View
              style={[
                styles.verifiedTag,
                isDark && { backgroundColor: "rgba(5, 150, 105, 0.2)" },
              ]}
            >
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text
                style={[styles.verifiedTagText, isDark && { color: "#34D399" }]}
              >
                {currentUser.isActive !== false
                  ? t("profile.activeVerified")
                  : t("profile.underReview")}
              </Text>
            </View>
          </View>
        </View>

        {/* Real Bank & UPI Payout Info */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.cardHeaderWithAction}>
            <Text
              style={[
                styles.cardHeader,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {t("profile.payoutAccountDetails")}
            </Text>
            <TouchableOpacity onPress={() => setIsBankModalVisible(true)}>
              <Text
                style={[styles.editActionText, isDark && { color: "#2dd4bf" }]}
              >
                {bankDetails.upiId ||
                bankDetails.accountNumber ||
                bankDetails.bankName
                  ? "Update"
                  : "+ Add"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              UPI ID (Instant)
            </Text>
            <Text style={[styles.valHighlight, isDark && { color: "#2dd4bf" }]}>
              {bankDetails.upiId || "Not Linked"}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              Bank Name
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {bankDetails.bankName || "Not Linked"}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              Account Number
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {bankDetails.accountNumber
                ? `•••• ${String(bankDetails.accountNumber).slice(-4)}`
                : "Not Linked"}
            </Text>
          </View>
          {bankDetails.ifsc ? (
            <>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: isDark ? colors.border : "#F1F5F9" },
                ]}
              />
              <View style={styles.row}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.textMuted : "#64748B" },
                  ]}
                >
                  IFSC Code
                </Text>
                <Text
                  style={[
                    styles.val,
                    { color: isDark ? colors.textPrimary : "#0F172A" },
                  ]}
                >
                  {bankDetails.ifsc}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Security & Access Notice */}
        <View
          style={[
            styles.securityBox,
            isDark && {
              backgroundColor: "rgba(13, 148, 136, 0.15)",
              borderColor: "rgba(13, 148, 136, 0.3)",
            },
          ]}
        >
          <Feather
            name="shield"
            size={18}
            color={isDark ? "#2dd4bf" : "#0F766E"}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.securityTitle, isDark && { color: "#2dd4bf" }]}
            >
              {t("profile.partnerPrivacySecurity")}
            </Text>
            <Text style={[styles.securityDesc, isDark && { color: "#99F6E4" }]}>
              • You can only view leads personally submitted by you.{"\n"}•
              Owner contact numbers are automatically masked once submitted to
              protect privacy.{"\n"}• Commission payouts are credited directly
              to your registered UPI / Bank account.
            </Text>
          </View>
        </View>

        {/* Support & Helpline */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <Text
            style={[
              styles.cardHeader,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
          >
            {t("profile.supportHeader")}
          </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "WhatsApp Support",
                "Connecting to Field Coordinator on WhatsApp...",
              )
            }
            style={styles.supportRow}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
            <Text
              style={[
                styles.supportText,
                { color: isDark ? colors.textSecondary : "#334155" },
              ]}
            >
              {t("profile.chatWithCoordinator")}
            </Text>
            <Feather
              name="chevron-right"
              size={16}
              color={isDark ? colors.textMuted : "#94A3B8"}
            />
          </TouchableOpacity>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Agent Helpline",
                "Toll-free Agent Helpline: 1800-419-8800",
              )
            }
            style={styles.supportRow}
          >
            <Feather
              name="phone-call"
              size={17}
              color={isDark ? "#2dd4bf" : "#0D9488"}
            />
            <Text
              style={[
                styles.supportText,
                { color: isDark ? colors.textSecondary : "#334155" },
              ]}
            >
              {t("profile.agentPriorityHelpline")}
            </Text>
            <Feather
              name="chevron-right"
              size={16}
              color={isDark ? colors.textMuted : "#94A3B8"}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            isDark && {
              backgroundColor: "rgba(220, 38, 38, 0.15)",
              borderColor: "rgba(220, 38, 38, 0.3)",
            },
          ]}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={[styles.logoutBtnText, isDark && { color: "#F87171" }]}>
            {t("profile.logoutBtn")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bank Modal */}
      <BankDetailsModal
        visible={isBankModalVisible}
        onClose={() => setIsBankModalVisible(false)}
        bankDetails={bankDetails}
        onSave={handleUpdateBank}
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
    fontWeight: "800",
    color: "#0F172A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  idCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  idTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  officialBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.92)",
    letterSpacing: 0.8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  idMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  verifiedCheckBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    backgroundColor: "#059669",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  agentInfoBlock: {
    flex: 1,
    justifyContent: "center",
  },
  agentName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  agentTierBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  agentTierText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  agentJoined: {
    fontSize: 10.5,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 3,
    fontWeight: "500",
  },
  qrBox: {
    backgroundColor: "#FFFFFF",
    padding: 5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  qrScanText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#0F766E",
    marginTop: 3,
    letterSpacing: 0.5,
  },
  idDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    marginVertical: 14,
  },
  idBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  idLabel: {
    fontSize: 9.5,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  idNumber: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  copyIdBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  copyIdText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  cardHeaderWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0D9488",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  label: {
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "600",
  },
  val: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    maxWidth: "60%",
    textAlign: "right",
  },
  valHighlight: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0D9488",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#16A34A",
  },
  securityBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F766E",
    marginBottom: 4,
  },
  securityDesc: {
    fontSize: 11.5,
    color: "#0F766E",
    lineHeight: 16,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  supportText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1.2,
    borderColor: "#FEE2E2",
    height: 50,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },
});
