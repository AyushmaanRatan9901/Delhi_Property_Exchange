import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import apiClient from "../../Redux/api/axiosInstance";
import { useResponsiveTheme } from "../../constants/theme";
import {
  SuperAdminLeadDetailModal,
  SuperAdminKycModal,
} from "../../components/SuperAdminComponent";

const { width } = Dimensions.get("window");

export default function SuperAdminUserDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useResponsiveTheme();
  const params = useLocalSearchParams();
  const userId = (params.userId || params.id) as string;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({});
  const [properties, setProperties] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [rentLedger, setRentLedger] = useState<any[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Sub-tab selection: 'overview' | 'properties' | 'payouts' | 'tasks'
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modals
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<any>(null);
  const [isLeadDetailModalVisible, setIsLeadDetailModalVisible] = useState(false);
  const [isKycModalVisible, setIsKycModalVisible] = useState(false);
  const [isCommModalVisible, setIsCommModalVisible] = useState(false);
  const [commInputRate, setCommInputRate] = useState<string>("");
  const [savingComm, setSavingComm] = useState<boolean>(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async (isRefresh = false) => {
    if (!userId) return;
    if (!isRefresh) setLoading(true);
    try {
      const res = await apiClient.get(`/auth/users/${userId}/details`);
      if (res.data?.data) {
        const payload = res.data.data;
        setUserData(payload.user || {});
        setMetrics(payload.metrics || {});
        setProperties(payload.properties || []);
        setPayouts(payload.payouts || []);
        setRentLedger(payload.rentLedger || []);
        setAssignedTasks(payload.assignedTasks || []);
        setActivityLogs(payload.activityLogs || []);
      }
    } catch (err: any) {
      console.error("[UserDetail Error]", err?.response?.data || err.message);
      Alert.alert("Error", err?.response?.data?.message || "Failed to load user profile dossier");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserDetails(true);
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL("tel:" + phone.replace(/\s+/g, ""));
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const clean = phone.replace(/\D/g, "");
      const full = clean.length === 10 ? "91" + clean : clean;
      Linking.openURL("whatsapp://send?phone=" + full + "&text=Hello%20" + encodeURIComponent(userData?.name || "Partner") + "%20from%20Delhi%20Property%20Exchange%20Admin");
    }
  };

  const handleSaveUserCommission = async () => {
    if (!userData) return;
    const rateNum = Number(commInputRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      Alert.alert("Invalid Rate", "Please enter a commission percentage between 0 and 100.");
      return;
    }
    setSavingComm(true);
    try {
      await apiClient.put(`/auth/users/${userData._id}/commission`, { commissionRate: rateNum });
      setUserData((prev: any) => ({ ...prev, commissionRate: rateNum }));
      setIsCommModalVisible(false);
      Alert.alert("Success", "Commission rate updated successfully.");
      fetchUserDetails(true);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to update commission rate.");
    } finally {
      setSavingComm(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!userData) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newStatus = !userData.isActive;
    try {
      await apiClient.put(`/auth/users/${userData._id}/status`);
      setUserData((prev: any) => ({ ...prev, isActive: newStatus }));
      Alert.alert("Status Updated", `User account ${newStatus ? "Activated" : "Deactivated"} successfully.`);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to update account status");
    }
  };

  const handleDeleteUser = () => {
    if (!userData) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert(
      "Delete User Account?",
      `Are you sure you want to permanently delete ${userData.name} (${userData.role})? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/auth/users/${userData._id}`);
              Alert.alert("Deleted", `User ${userData.name} deleted successfully.`, [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (err: any) {
              Alert.alert("Deletion Failed", err?.response?.data?.message || "Could not delete user.");
            }
          },
        },
      ]
    );
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "field_agent":
        return { bg: "#CCFBF1", text: "#0F766E", label: "Field Agent" };
      case "dealer":
      case "broker":
        return { bg: "#EDE9FE", text: "#6D28D9", label: "Dealer / Broker" };
      case "field_staff":
        return { bg: "#DBEAFE", text: "#1E40AF", label: "Verification Staff" };
      case "tele_caller":
        return { bg: "#FEF3C7", text: "#92400E", label: "Tele-caller" };
      case "owner":
        return { bg: "#DCFCE7", text: "#166534", label: "Property Owner" };
      case "tenant":
        return { bg: "#FEE2E2", text: "#991B1B", label: "Tenant" };
      case "admin":
        return { bg: "#E0E7FF", text: "#3730A3", label: "Sub Admin" };
      case "super_admin":
        return { bg: "#FEE2E2", text: "#991B1B", label: "Super Admin" };
      default:
        return { bg: "#F1F5F9", text: "#475569", label: role || "User" };
    }
  };

  const getKycBadge = (status?: string) => {
    switch (status) {
      case "VERIFIED":
        return { bg: "#DCFCE7", text: "#166534", label: "KYC VERIFIED", icon: "check-circle" };
      case "UNDER_REVIEW":
        return { bg: "#FEF3C7", text: "#92400E", label: "KYC UNDER REVIEW", icon: "clock" };
      case "REJECTED":
        return { bg: "#FEE2E2", text: "#991B1B", label: "KYC REJECTED", icon: "x-circle" };
      default:
        return { bg: "#F1F5F9", text: "#64748B", label: "KYC NOT UPLOADED", icon: "alert-circle" };
    }
  };

  const role = userData?.role || "user";
  const roleBadge = getRoleBadge(role);
  const kycBadge = getKycBadge(userData?.kyc?.status);

  const isAgentOrDealer = ["field_agent", "dealer", "broker"].includes(role);
  const isOwner = role === "owner";
  const isStaff = ["field_staff", "tele_caller"].includes(role);
  const isAdmin = ["admin", "super_admin"].includes(role);
  const isTenant = role === "tenant";

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading User Dossier...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle="light-content" />

      {/* Top Glassmorphic Header */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top + 8, 32) }]}
      >
        <View style={styles.headerTopBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerSuperBadge}>USER PROFILE & ACTIVITY DOSSIER</Text>
            <Text style={styles.headerMainTitle} numberOfLines={1}>
              {userData?.name || "User Details"}
            </Text>
          </View>

          <TouchableOpacity onPress={onRefresh} style={styles.refreshHeaderBtn}>
            <Feather name="refresh-cw" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* User Identity Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={[styles.heroAvatar, { backgroundColor: userData?.isActive ? "#0D9488" : "#94A3B8" }]}>
              {userData?.profilePhoto ? (
                <Image source={{ uri: userData.profilePhoto }} style={styles.heroAvatarImg} />
              ) : (
                <Text style={styles.heroAvatarText}>{(userData?.name || "U").slice(0, 1).toUpperCase()}</Text>
              )}
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={styles.heroUserName} numberOfLines={1}>
                  {userData?.name}
                </Text>
                <View style={[styles.rolePill, { backgroundColor: roleBadge.bg }]}>
                  <Text style={[styles.rolePillText, { color: roleBadge.text }]}>{roleBadge.label}</Text>
                </View>
              </View>

              <Text style={styles.heroSubText}>
                ID: {userData?.staffId || "N/A"} • Joined: {new Date(userData?.createdAt || Date.now()).toLocaleDateString("en-IN")}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
                <View style={[styles.statusPill, { backgroundColor: userData?.isActive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)" }]}>
                  <View style={[styles.statusDot, { backgroundColor: userData?.isActive ? "#10B981" : "#EF4444" }]} />
                  <Text style={[styles.statusPillText, { color: userData?.isActive ? "#34D399" : "#F87171" }]}>
                    {userData?.isActive ? "ACCOUNT ACTIVE" : "DEACTIVATED"}
                  </Text>
                </View>

                {isAgentOrDealer && (
                  <TouchableOpacity
                    onPress={() => {
                      setCommInputRate(String(userData?.commissionRate || 15));
                      setIsCommModalVisible(true);
                    }}
                    style={styles.commEditPill}
                  >
                    <Ionicons name="pricetag" size={12} color="#5EEAD4" />
                    <Text style={styles.commEditPillText}>{userData?.commissionRate || 15}% Comm.</Text>
                    <Feather name="edit-2" size={10} color="#5EEAD4" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Quick Communication & Action Ribbon */}
          <View style={styles.actionRibbon}>
            <TouchableOpacity onPress={() => handleCall(userData?.phone)} style={styles.ribbonBtn}>
              <Feather name="phone" size={15} color="#FFFFFF" />
              <Text style={styles.ribbonBtnText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleWhatsApp(userData?.phone)} style={[styles.ribbonBtn, { backgroundColor: "#10B981" }]}>
              <FontAwesome5 name="whatsapp" size={15} color="#FFFFFF" />
              <Text style={styles.ribbonBtnText}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsKycModalVisible(true)}
              style={[styles.ribbonBtn, { backgroundColor: kycBadge.bg }]}
            >
              <Feather name={kycBadge.icon as any} size={15} color={kycBadge.text} />
              <Text style={[styles.ribbonBtnText, { color: kycBadge.text }]}>KYC Review</Text>
            </TouchableOpacity>

            <View style={styles.ribbonSwitchBox}>
              <Switch
                value={userData?.isActive}
                onValueChange={handleToggleStatus}
                trackColor={{ false: "#64748B", true: "#10B981" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {userData?.role !== "super_admin" && (
              <TouchableOpacity onPress={handleDeleteUser} style={styles.ribbonDeleteBtn}>
                <Feather name="trash-2" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab("overview");
            }}
            style={[styles.tabItem, activeTab === "overview" && styles.tabItemActive]}
          >
            <Feather name="user-check" size={15} color={activeTab === "overview" ? "#0D9488" : "rgba(255,255,255,0.7)"} />
            <Text style={[styles.tabItemText, activeTab === "overview" && styles.tabItemTextActive]}>
              Dossier & KYC
            </Text>
          </TouchableOpacity>

          {(isAgentOrDealer || isOwner || isTenant) && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("properties");
              }}
              style={[styles.tabItem, activeTab === "properties" && styles.tabItemActive]}
            >
              <Feather name="home" size={15} color={activeTab === "properties" ? "#0D9488" : "rgba(255,255,255,0.7)"} />
              <Text style={[styles.tabItemText, activeTab === "properties" && styles.tabItemTextActive]}>
                Properties ({properties.length})
              </Text>
            </TouchableOpacity>
          )}

          {(isAgentOrDealer || isOwner || isTenant) && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("payouts");
              }}
              style={[styles.tabItem, activeTab === "payouts" && styles.tabItemActive]}
            >
              <Feather name="dollar-sign" size={15} color={activeTab === "payouts" ? "#0D9488" : "rgba(255,255,255,0.7)"} />
              <Text style={[styles.tabItemText, activeTab === "payouts" && styles.tabItemTextActive]}>
                {isOwner ? `Rent Ledger (${payouts.length + rentLedger.length})` : `Payouts (${payouts.length})`}
              </Text>
            </TouchableOpacity>
          )}

          {isStaff && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("tasks");
              }}
              style={[styles.tabItem, activeTab === "tasks" && styles.tabItemActive]}
            >
              <Feather name="check-square" size={15} color={activeTab === "tasks" ? "#0D9488" : "rgba(255,255,255,0.7)"} />
              <Text style={[styles.tabItemText, activeTab === "tasks" && styles.tabItemTextActive]}>
                Assigned Tasks ({assignedTasks.length})
              </Text>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("activity");
              }}
              style={[styles.tabItem, activeTab === "activity" && styles.tabItemActive]}
            >
              <Feather name="activity" size={15} color={activeTab === "activity" ? "#0D9488" : "rgba(255,255,255,0.7)"} />
              <Text style={[styles.tabItemText, activeTab === "activity" && styles.tabItemTextActive]}>
                Admin Logs
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 40, 60) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {/* Role-Specific Metric Summary Cards */}
        {isAgentOrDealer && (
          <View style={styles.metricsContainer}>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Agent Performance & Commission Summary
            </Text>
            <View style={styles.metricGrid}>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#0D9488" }]}>{metrics.totalProperties || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Registered Leads</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>₹{(metrics.totalCommissionEarned || 0).toLocaleString("en-IN")}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Commission</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#F59E0B" }]}>₹{(metrics.pendingCommissionDues || 0).toLocaleString("en-IN")}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Pending Dues</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#6366F1" }]}>₹{(metrics.fulfilledCommissionDues || 0).toLocaleString("en-IN")}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Fulfilled Dues</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#3B82F6" }]}>{metrics.verifiedProperties || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Verified Leads</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#8B5CF6" }]}>{metrics.closedDeals || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Deals Won</Text>
              </View>
            </View>
          </View>
        )}

        {isOwner && (
          <View style={styles.metricsContainer}>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Owner Portfolio & Rent Revenue Summary
            </Text>
            <View style={styles.metricGrid}>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#0D9488" }]}>{metrics.totalProperties || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Properties Owned</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>{metrics.occupiedProperties || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Occupied Units</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#64748B" }]}>{metrics.vacantProperties || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Vacant Units</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>₹{(metrics.fulfilledRentPayouts || 0).toLocaleString("en-IN")}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Released Payouts</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#F59E0B" }]}>₹{(metrics.pendingRentPayouts || 0).toLocaleString("en-IN")}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Pending Payouts</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#EF4444" }]}>₹{(metrics.pendingRentFromTenants || 0).toLocaleString("en-IN")}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Tenant Overdue Rent</Text>
              </View>
            </View>
          </View>
        )}

        {isStaff && (
          <View style={styles.metricsContainer}>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Verification Staff Performance Metrics
            </Text>
            <View style={styles.metricGrid}>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#0D9488" }]}>{metrics.totalAssigned || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Assigned</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>{metrics.completedInspections || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Completed</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#F59E0B" }]}>{metrics.pendingInspections || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Pending Verification</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#3B82F6" }]}>{metrics.completionRate || 0}%</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>SLA Completion Rate</Text>
              </View>
            </View>
          </View>
        )}

        {isAdmin && (
          <View style={styles.metricsContainer}>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Sub-Admin Activity & Governance Stats
            </Text>
            <View style={styles.metricGrid}>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#0D9488" }]}>{metrics.usersCreatedCount || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Users Created</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#3B82F6" }]}>{metrics.leadsAssignedCount || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Leads Assigned</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>{metrics.dealsClosedCount || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Deals Closed</Text>
              </View>
              <View style={[styles.metricCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Text style={[styles.metricVal, { color: "#8B5CF6" }]}>{metrics.payoutsApprovedCount || 0}</Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Payouts Approved</Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 1: Dossier & KYC */}
        {activeTab === "overview" && (
          <View style={styles.tabContentWrap}>
            {/* Identity & Contact Details */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Feather name="info" size={16} color="#0D9488" />
                <Text style={[styles.sectionCardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Identity & Contact Information
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Full Name</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>{userData?.name || "N/A"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Primary Phone</Text>
                <TouchableOpacity onPress={() => handleCall(userData?.phone)}>
                  <Text style={[styles.detailValue, { color: "#0D9488", fontWeight: "700" }]}>+91 {userData?.phone}</Text>
                </TouchableOpacity>
              </View>

              {userData?.alternatePhone ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Alternate Phone</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>+91 {userData?.alternatePhone}</Text>
                </View>
              ) : null}

              {userData?.email ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email Address</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>{userData?.email}</Text>
                </View>
              ) : null}

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>System Role</Text>
                <Text style={[styles.detailValue, { color: roleBadge.text, fontWeight: "700" }]}>{roleBadge.label}</Text>
              </View>

              {userData?.designation ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Designation</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>{userData?.designation}</Text>
                </View>
              ) : null}

              {userData?.locality && userData?.locality.length > 0 ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Assigned Localities</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {Array.isArray(userData?.locality) ? userData.locality.join(", ") : userData.locality}
                  </Text>
                </View>
              ) : null}

              {userData?.address ? (
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Address</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {typeof userData.address === "object"
                      ? `${userData.address.street || ""}, ${userData.address.city || ""}, ${userData.address.pincode || ""}`
                      : userData.address}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Bank & Payout Information */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons name="bank" size={18} color="#0D9488" />
                <Text style={[styles.sectionCardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Bank & Payout Disbursement Details
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Bank Name</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {userData?.bankDetails?.bankName || "Not Provided"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Number</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A", fontWeight: "600" }]}>
                  {userData?.bankDetails?.accountNumber || "Not Provided"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>IFSC Code</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {userData?.bankDetails?.ifsc || userData?.bankDetails?.ifscCode || "Not Provided"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Holder Name</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {userData?.bankDetails?.accountHolder || userData?.bankDetails?.accountHolderName || userData?.name || "Not Provided"}
                </Text>
              </View>

              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>UPI ID</Text>
                <Text style={[styles.detailValue, { color: "#0D9488", fontWeight: "700" }]}>
                  {userData?.upiId || userData?.bankDetails?.upiId || "Not Provided"}
                </Text>
              </View>
            </View>

            {/* KYC & Identity Verification Desk */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Feather name="shield" size={18} color="#0D9488" />
                  <Text style={[styles.sectionCardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    KYC Verification Dossier
                  </Text>
                </View>
                <View style={[styles.rolePill, { backgroundColor: kycBadge.bg }]}>
                  <Text style={[styles.rolePillText, { color: kycBadge.text }]}>{kycBadge.label}</Text>
                </View>
              </View>

              {/* Aadhaar Section */}
              <View style={styles.docBlock}>
                <View style={styles.docHeaderRow}>
                  <Text style={[styles.docHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    Aadhaar Card: {userData?.kyc?.aadhaarNumber ? `•••• ${userData.kyc.aadhaarNumber.slice(-4)}` : "Number Not Added"}
                  </Text>
                  {userData?.kyc?.aadhaarDoc ? (
                    <TouchableOpacity
                      onPress={() => setPreviewDocUrl(userData.kyc.aadhaarDoc)}
                      style={styles.viewDocBtn}
                    >
                      <Feather name="eye" size={13} color="#0D9488" />
                      <Text style={styles.viewDocBtnText}>View Document</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {userData?.kyc?.aadhaarDoc ? (
                  <TouchableOpacity onPress={() => setPreviewDocUrl(userData.kyc.aadhaarDoc)} style={styles.docThumbContainer}>
                    <Image source={{ uri: userData.kyc.aadhaarDoc }} style={styles.docThumbImg} resizeMode="cover" />
                    <View style={styles.docOverlay}>
                      <Feather name="maximize-2" size={16} color="#FFFFFF" />
                      <Text style={styles.docOverlayText}>Tap to inspect</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.noDocBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                    <Feather name="alert-circle" size={16} color="#64748B" />
                    <Text style={[styles.noDocText, { color: colors.textSecondary }]}>Aadhaar card document not uploaded yet</Text>
                  </View>
                )}
              </View>

              {/* PAN Section */}
              <View style={[styles.docBlock, { marginTop: 16 }]}>
                <View style={styles.docHeaderRow}>
                  <Text style={[styles.docHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    PAN Card: {userData?.kyc?.panNumber || "Number Not Added"}
                  </Text>
                  {userData?.kyc?.panDoc ? (
                    <TouchableOpacity
                      onPress={() => setPreviewDocUrl(userData.kyc.panDoc)}
                      style={styles.viewDocBtn}
                    >
                      <Feather name="eye" size={13} color="#0D9488" />
                      <Text style={styles.viewDocBtnText}>View Document</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {userData?.kyc?.panDoc ? (
                  <TouchableOpacity onPress={() => setPreviewDocUrl(userData.kyc.panDoc)} style={styles.docThumbContainer}>
                    <Image source={{ uri: userData.kyc.panDoc }} style={styles.docThumbImg} resizeMode="cover" />
                    <View style={styles.docOverlay}>
                      <Feather name="maximize-2" size={16} color="#FFFFFF" />
                      <Text style={styles.docOverlayText}>Tap to inspect</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.noDocBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                    <Feather name="alert-circle" size={16} color="#64748B" />
                    <Text style={[styles.noDocText, { color: colors.textSecondary }]}>PAN card document not uploaded yet</Text>
                  </View>
                )}
              </View>

              {/* Action Button to Open KYC Desk */}
              <TouchableOpacity
                onPress={() => setIsKycModalVisible(true)}
                style={styles.openKycDeskBtn}
              >
                <Feather name="check-square" size={16} color="#FFFFFF" />
                <Text style={styles.openKycDeskBtnText}>Open KYC Approval & Verification Desk</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 2: Properties & Leads */}
        {activeTab === "properties" && (
          <View style={styles.tabContentWrap}>
            <View style={styles.listHeaderRow}>
              <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {isOwner ? "Properties Owned by User" : "Leads Registered by Agent"} ({properties.length})
              </Text>
            </View>

            {properties.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Feather name="home" size={32} color="#64748B" />
                <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>No Properties Found</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  This user has not registered or owned any property listings yet.
                </Text>
              </View>
            ) : (
              properties.map((prop) => (
                <TouchableOpacity
                  key={prop._id}
                  onPress={() => {
                    setSelectedLeadForDetail(prop);
                    setIsLeadDetailModalVisible(true);
                  }}
                  activeOpacity={0.8}
                  style={[styles.propertyCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}
                >
                  <View style={styles.propertyTopRow}>
                    <View style={styles.propImageWrap}>
                      {prop.coverPhoto ? (
                        <Image source={{ uri: prop.coverPhoto }} style={styles.propCoverImg} />
                      ) : (
                        <View style={[styles.propNoImg, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                          <Feather name="image" size={18} color="#64748B" />
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={[styles.propertyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]} numberOfLines={1}>
                          {prop.title || "Untitled Property"}
                        </Text>
                        <View style={[styles.statusTag, { backgroundColor: prop.status === "verified" ? "#DCFCE7" : prop.status === "rented" ? "#EDE9FE" : "#FEF3C7" }]}>
                          <Text style={[styles.statusTagText, { color: prop.status === "verified" ? "#166534" : prop.status === "rented" ? "#6D28D9" : "#92400E" }]}>
                            {String(prop.status || "NEW").toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.propLocation, { color: colors.textSecondary }]} numberOfLines={1}>
                        📍 {prop.locality || "Delhi NCR"} • {prop.propertyType || "Apartment"}
                      </Text>

                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                        <Text style={[styles.propPrice, { color: "#0D9488" }]}>
                          ₹{(prop.price || prop.rentAmount || 0).toLocaleString("en-IN")}
                          <Text style={{ fontSize: 11, fontWeight: "normal", color: colors.textSecondary }}>
                            {prop.listingType === "sale" ? "" : "/mo"}
                          </Text>
                        </Text>

                        {prop.commission?.amount ? (
                          <Text style={[styles.propCommText, { color: "#10B981" }]}>
                            Comm: ₹{Number(prop.commission.amount).toLocaleString("en-IN")}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* TAB 3: Payouts & Rent Ledger */}
        {activeTab === "payouts" && (
          <View style={styles.tabContentWrap}>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              {isOwner ? "Owner Rent Disbursements & Ledger" : "Agent Commission Payout Transactions"}
            </Text>

            {payouts.length === 0 && rentLedger.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Feather name="dollar-sign" size={32} color="#64748B" />
                <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>No Payout Records</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  No payout transactions or rent ledger items found for this account.
                </Text>
              </View>
            ) : (
              <>
                {payouts.map((pay, idx) => (
                  <View
                    key={idx}
                    style={[styles.payoutCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}
                  >
                    <View style={styles.payoutCardTop}>
                      <View>
                        <Text style={[styles.payoutTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          {pay.propertyTitle || pay.leadId || "Commission Payout"}
                        </Text>
                        <Text style={[styles.payoutSub, { color: colors.textSecondary }]}>
                          Mode: {pay.paymentMode || "UPI"} {pay.utrNumber ? `• UTR: ${pay.utrNumber}` : ""}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[styles.payoutAmount, { color: "#0D9488" }]}>
                          ₹{Number(pay.amount || 0).toLocaleString("en-IN")}
                        </Text>
                        <View style={[styles.statusTag, { backgroundColor: pay.status === "paid" || pay.status === "released" ? "#DCFCE7" : pay.status === "approved" ? "#DBEAFE" : "#FEF3C7" }]}>
                          <Text style={[styles.statusTagText, { color: pay.status === "paid" || pay.status === "released" ? "#166534" : pay.status === "approved" ? "#1E40AF" : "#92400E" }]}>
                            {String(pay.status || "PENDING").toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {pay.bankOrUpiDetails ? (
                      <View style={[styles.payoutDestStrip, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                        <Feather name="credit-card" size={13} color="#0D9488" />
                        <Text style={[styles.payoutDestText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          Disbursed to: {pay.bankOrUpiDetails}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}

                {/* Owner Rent Ledger entries if owner */}
                {isOwner && rentLedger.length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                      Tenant Rent Collection Ledger ({rentLedger.length})
                    </Text>
                    {rentLedger.map((rent, rIdx) => (
                      <View
                        key={rIdx}
                        style={[styles.payoutCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}
                      >
                        <View style={styles.payoutCardTop}>
                          <View>
                            <Text style={[styles.payoutTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                              {rent.propertyTitle || "Property"} • {rent.month || "Current Month"}
                            </Text>
                            <Text style={[styles.payoutSub, { color: colors.textSecondary }]}>
                              Due Date: {rent.dueDate ? new Date(rent.dueDate).toLocaleDateString("en-IN") : "N/A"}
                            </Text>
                          </View>
                          <View style={{ alignItems: "flex-end" }}>
                            <Text style={[styles.payoutAmount, { color: "#10B981" }]}>
                              ₹{Number(rent.amount || 0).toLocaleString("en-IN")}
                            </Text>
                            <View style={[styles.statusTag, { backgroundColor: rent.status === "PAID" ? "#DCFCE7" : rent.status === "OVERDUE" ? "#FEE2E2" : "#FEF3C7" }]}>
                              <Text style={[styles.statusTagText, { color: rent.status === "PAID" ? "#166534" : rent.status === "OVERDUE" ? "#991B1B" : "#92400E" }]}>
                                {rent.status}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* TAB 4: Assigned Tasks (For Verification Staff) */}
        {activeTab === "tasks" && isStaff && (
          <View style={styles.tabContentWrap}>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Assigned Field Verification Tasks ({assignedTasks.length})
            </Text>

            {assignedTasks.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Feather name="check-square" size={32} color="#64748B" />
                <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>No Tasks Assigned</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  This staff member currently has no verification or inspection tasks assigned.
                </Text>
              </View>
            ) : (
              assignedTasks.map((task) => (
                <View
                  key={task._id}
                  style={[styles.taskCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}
                >
                  <View style={styles.taskCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                        {task.title || "Field Inspection Task"}
                      </Text>
                      <Text style={[styles.taskLoc, { color: colors.textSecondary }]}>
                        📍 {task.locality || "Delhi NCR"} • Owner: {task.ownerName || "Owner"} (+91 {task.ownerPhone})
                      </Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: task.status === "verified" ? "#DCFCE7" : "#FEF3C7" }]}>
                      <Text style={[styles.statusTagText, { color: task.status === "verified" ? "#166534" : "#92400E" }]}>
                        {String(task.status).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {task.assignmentNotes ? (
                    <View style={[styles.taskNotesBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
                      <Text style={[styles.taskNotesText, { color: colors.textSecondary }]}>
                        Notes: {task.assignmentNotes}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 5: Admin Activity Logs */}
        {activeTab === "activity" && isAdmin && (
          <View style={styles.tabContentWrap}>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Accounts Created by this Admin ({activityLogs.length})
            </Text>

            {activityLogs.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
                <Feather name="activity" size={32} color="#64748B" />
                <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>No Activity Records</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  This admin has not provisioned any staff or agent accounts yet.
                </Text>
              </View>
            ) : (
              activityLogs.map((log) => (
                <View
                  key={log._id}
                  style={[styles.logCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.logName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>{log.name}</Text>
                    <Text style={[styles.logPhone, { color: colors.textSecondary }]}>
                      +91 {log.phone} • Role: {log.role}
                    </Text>
                  </View>
                  <Text style={[styles.logDate, { color: colors.textMuted }]}>
                    {new Date(log.createdAt).toLocaleDateString("en-IN")}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* KYC Review Modal */}
      {userData && (
        <SuperAdminKycModal
          visible={isKycModalVisible}
          user={userData}
          onClose={() => setIsKycModalVisible(false)}
          onSuccess={() => {
            setIsKycModalVisible(false);
            fetchUserDetails(true);
          }}
        />
      )}

      {/* Commission Rate Edit Modal */}
      <Modal visible={isCommModalVisible} transparent animationType="slide" onRequestClose={() => setIsCommModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="pricetag" size={20} color="#0D9488" />
                <Text style={[styles.modalTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Edit Commission Rate (%)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsCommModalVisible(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Adjust the commission percentage rule applied for `{userData?.name || "Agent"}`.
            </Text>

            <View style={[styles.commInputWrap, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: colors.border }]}>
              <TextInput
                style={[styles.commInputText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
                keyboardType="numeric"
                value={commInputRate}
                onChangeText={setCommInputRate}
                placeholder="15"
                placeholderTextColor="#94A3B8"
                maxLength={3}
              />
              <Text style={styles.commPercentSign}>%</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsCommModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={[styles.modalCancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveUserCommission} disabled={savingComm} style={styles.modalSubmitBtn}>
                {savingComm ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Save Commission</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lead Detail Sheet Modal */}
      <SuperAdminLeadDetailModal
        visible={isLeadDetailModalVisible}
        lead={selectedLeadForDetail}
        onClose={() => setIsLeadDetailModalVisible(false)}
      />

      {/* Document Image Zoom Modal */}
      <Modal visible={!!previewDocUrl} transparent animationType="fade" onRequestClose={() => setPreviewDocUrl(null)}>
        <View style={styles.docZoomBackdrop}>
          <TouchableOpacity onPress={() => setPreviewDocUrl(null)} style={styles.docZoomCloseBtn}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {previewDocUrl && (
            <Image source={{ uri: previewDocUrl }} style={styles.docZoomImage} resizeMode="contain" />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSuperBadge: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#5EEAD4",
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  refreshHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  heroAvatarImg: {
    width: 56,
    height: 56,
  },
  heroAvatarText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroUserName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    maxWidth: width * 0.45,
  },
  heroSubText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
  },
  commEditPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(13, 148, 136, 0.4)",
    gap: 4,
  },
  commEditPillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#5EEAD4",
  },
  actionRibbon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
  },
  ribbonBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  ribbonBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  ribbonSwitchBox: {
    marginLeft: "auto",
  },
  ribbonDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    gap: 6,
    paddingTop: 4,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: "#FFFFFF",
  },
  tabItemText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.8)",
  },
  tabItemTextActive: {
    color: "#0D9488",
  },
  content: {
    padding: 16,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: (width - 42) / 2,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tabContentWrap: {
    gap: 16,
  },
  sectionCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.15)",
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    maxWidth: width * 0.55,
    textAlign: "right",
  },
  docBlock: {
    marginTop: 6,
  },
  docHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  docHeading: {
    fontSize: 13,
    fontWeight: "700",
  },
  viewDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDocBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D9488",
  },
  docThumbContainer: {
    height: 140,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  docThumbImg: {
    width: "100%",
    height: "100%",
  },
  docOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 6,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  docOverlayText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  noDocBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  noDocText: {
    fontSize: 12,
    fontWeight: "500",
  },
  openKycDeskBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 8,
  },
  openKycDeskBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  propertyCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  propertyTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  propImageWrap: {
    width: 65,
    height: 65,
    borderRadius: 12,
    overflow: "hidden",
  },
  propCoverImg: {
    width: "100%",
    height: "100%",
  },
  propNoImg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  propertyTitle: {
    fontSize: 14,
    fontWeight: "700",
    maxWidth: width * 0.45,
  },
  propLocation: {
    fontSize: 12,
    marginTop: 2,
  },
  propPrice: {
    fontSize: 14,
    fontWeight: "800",
  },
  propCommText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 9,
    fontWeight: "800",
  },
  payoutCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  payoutCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payoutTitle: {
    fontSize: 14,
    fontWeight: "700",
    maxWidth: width * 0.55,
  },
  payoutSub: {
    fontSize: 11,
    marginTop: 2,
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  payoutDestStrip: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  payoutDestText: {
    fontSize: 11,
    fontWeight: "600",
  },
  taskCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  taskCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  taskLoc: {
    fontSize: 12,
    marginTop: 2,
  },
  taskNotesBox: {
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  taskNotesText: {
    fontSize: 11,
    fontStyle: "italic",
  },
  logCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  logName: {
    fontSize: 13,
    fontWeight: "700",
  },
  logPhone: {
    fontSize: 11,
    marginTop: 2,
  },
  logDate: {
    fontSize: 11,
  },
  docZoomBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  docZoomCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  docZoomImage: {
    width: "100%",
    height: "80%",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  modalSub: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  commInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  commInputText: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
  },
  commPercentSign: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0D9488",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalSubmitBtn: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  modalSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
