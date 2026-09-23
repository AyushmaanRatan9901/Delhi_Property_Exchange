import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SuperAdminAssignModal,
  SuperAdminCommissionModal,
  SuperAdminCreateUserModal,
  SuperAdminDealModal,
  SuperAdminLeadDetailModal,
  SuperAdminSideMenu,
  SuperAdminNotificationModal,
} from "../../../components/SuperAdminComponent";
import { useSelector } from "react-redux";
import { RootState } from "../../../Redux/store";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";

export default function SuperAdminDashboard() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Responsive device checks
  const isTablet = windowWidth >= 768;
  const isSmallDevice = windowWidth < 380;
  const isMediumScreen = windowWidth >= 380 && windowWidth < 768;

  const unreadCount = useSelector(
    (state: RootState) => state.superAdminNotifications?.unreadCount || 0
  );

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Analytics summary
  const [analytics, setAnalytics] = useState<any>(null);

  // Modals state
  const [isSideMenuVisible, setIsSideMenuVisible] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] =
    useState<boolean>(false);
  const [isAssignModalVisible, setIsAssignModalVisible] =
    useState<boolean>(false);
  const [isDealModalVisible, setIsDealModalVisible] = useState<boolean>(false);
  const [isCommissionModalVisible, setIsCommissionModalVisible] =
    useState<boolean>(false);
  const [isCreateUserModalVisible, setIsCreateUserModalVisible] =
    useState<boolean>(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] =
    useState<boolean>(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const statusParam =
        selectedStatus !== "ALL"
          ? "&status=" + selectedStatus.toLowerCase()
          : "";
      const [leadsRes, analyticsRes] = await Promise.all([
        apiClient.get("/leads/admin/all?limit=50" + statusParam),
        apiClient.get("/leads/admin/analytics"),
      ]);

      if (leadsRes.data?.data?.leads) {
        setLeads(leadsRes.data.data.leads);
      }
      if (analyticsRes.data?.data) {
        setAnalytics(analyticsRes.data.data);
      }
    } catch (e: any) {
      console.warn("Failed to fetch SuperAdmin dashboard data:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL("tel:" + phone.replace(/\s+/g, ""));
  };

  const handleWhatsApp = (phone: string) => {
    if (phone) {
      const clean = phone.replace(/\D/g, "");
      const full = clean.length === 10 ? "91" + clean : clean;
      Linking.openURL(
        "whatsapp://send?phone=" +
          full +
          "&text=Hello%20from%20Delhi%20Property%20Exchange%20SuperAdmin",
      );
    }
  };

  const handleResolveDuplicate = async (lead: any) => {
    Alert.alert(
      "Resolve Duplicate Flag",
      "Choose action for duplicate listing " + (lead.leadId || lead._id) + ":",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Dismiss Flag",
          onPress: async () => {
            try {
              await apiClient.patch(
                "/leads/" + lead._id + "/resolve-duplicate",
                { action: "dismiss" },
              );
              Alert.alert("Success", "Duplicate flag dismissed.");
              fetchDashboardData();
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
        {
          text: "Archive Duplicate",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.patch(
                "/leads/" + lead._id + "/resolve-duplicate",
                { action: "archive", notes: "Archived duplicate listing" },
              );
              Alert.alert("Archived", "Duplicate property archived.");
              fetchDashboardData();
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ],
    );
  };

  // Filter leads based on search query
  const filteredLeads = leads.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (l.leadId && l.leadId.toLowerCase().includes(q)) ||
      (l.title && l.title.toLowerCase().includes(q)) ||
      (l.ownerName && l.ownerName.toLowerCase().includes(q)) ||
      (l.ownerPhone && l.ownerPhone.includes(q)) ||
      (l.locality && l.locality.toLowerCase().includes(q)) ||
      (l.agentName && l.agentName.toLowerCase().includes(q))
    );
  });

  const getStatusColor = (st: string) => {
    switch (st?.toLowerCase()) {
      case "verified":
        return "#10B981";
      case "rented":
      case "sold":
        return "#0D9488";
      case "under_verification":
      case "assigned":
        return "#F59E0B";
      case "rejected":
        return "#EF4444";
      default:
        return "#3B82F6";
    }
  };

  const totalProps = analytics?.totalProperties || leads.length || 0;
  const verifiedCount = analytics?.statusBreakdown?.verified || 0;
  const closedCount =
    (analytics?.statusBreakdown?.rented || 0) +
    (analytics?.statusBreakdown?.sold || 0);
  const dupCount = analytics?.statusBreakdown?.duplicates || 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : "#F8FAFC" },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header Banner */}
      <LinearGradient
        colors={
          isDark
            ? ["#0F172A", "#061A23", "#042F2E"]
            : ["#0D9488", "#0F766E", "#115E59"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top + 10, 36) }]}
      >
        <View style={styles.headerTop}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              flex: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => setIsSideMenuVisible(true)}
              style={styles.hamburgerBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="menu" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Text style={styles.panelBadge}>
                  SUPER ADMIN COMMAND CENTER
                </Text>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              <Text style={styles.headerTitle}>Overview & Directory</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={() => setIsNotificationModalVisible(true)}
              style={styles.headerIconCircle}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={18} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.headerBellBadge}>
                  <Text style={styles.headerBellBadgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh} style={styles.headerIconCircle}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Full unmasked owner access, instant approvals, deal booking & live
          stream
        </Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isTablet && { maxWidth: 1040, alignSelf: "center", width: "94%" },
          { paddingBottom: Math.max(insets.bottom + 85, 115) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0D9488"
          />
        }
      >
        {/* Metric Quick Stats */}
        <View style={[styles.statsRow, isSmallDevice && { flexWrap: "wrap", gap: 8 }]}>
          <View
            style={[
              styles.statCard,
              isSmallDevice && { width: "48%", flex: undefined },
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: "#0D9488" }]}>
              {totalProps}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Properties
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              isSmallDevice && { width: "48%", flex: undefined },
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {closedCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Deals Closed
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              isSmallDevice && { width: "48%", flex: undefined },
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>
              {verifiedCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Verified Units
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              isSmallDevice && { width: "48%", flex: undefined },
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: dupCount > 0 ? "#F59E0B" : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statValue,
                { color: dupCount > 0 ? "#D97706" : "#64748B" },
              ]}
            >
              {dupCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Duplicates
            </Text>
          </View>
        </View>

        {/* Quick Action Navigation Bar */}
        <View style={[styles.quickActionsRow, isSmallDevice && { flexWrap: "wrap", gap: 8 }]}>
          <TouchableOpacity
            onPress={() => setIsCreateUserModalVisible(true)}
            style={[styles.quickActionBtn, isSmallDevice && { minWidth: "48%", flex: undefined }, { backgroundColor: "#0D9488" }]}
          >
            <Feather name="user-plus" size={16} color="#FFFFFF" />
            <Text style={styles.quickActionBtnText}>Add User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push("/SuperAdminPanel/(tabs)/approvals" as any)
            }
            style={[styles.quickActionBtn, isSmallDevice && { minWidth: "48%", flex: undefined }, { backgroundColor: "#3B82F6" }]}
          >
            <Feather name="shield" size={16} color="#FFFFFF" />
            <Text style={styles.quickActionBtnText}>Approvals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push("/SuperAdminPanel/(tabs)/analytics" as any)
            }
            style={[styles.quickActionBtn, isSmallDevice && { minWidth: "48%", flex: undefined }, { backgroundColor: "#8B5CF6" }]}
          >
            <Ionicons name="receipt-outline" size={16} color="#FFFFFF" />
            <Text style={styles.quickActionBtnText}>Rent Ledger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push("/SuperAdminPanel/(tabs)/settings" as any)
            }
            style={[styles.quickActionBtn, isSmallDevice && { minWidth: "48%", flex: undefined }, { backgroundColor: "#0F766E" }]}
          >
            <Feather name="sliders" size={16} color="#FFFFFF" />
            <Text style={styles.quickActionBtnText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filter Bar */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="search" size={18} color="#64748B" />
            <TextInput
              style={[
                styles.searchInput,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
              placeholder="Search by ID, owner, phone, locality, agent..."
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={16} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>

          {/* Status Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {[
              "ALL",
              "NEW",
              "ASSIGNED",
              "UNDER_VERIFICATION",
              "VERIFIED",
              "RENTED",
              "SOLD",
              "REJECTED",
            ].map((st) => {
              const isSelected = selectedStatus === st;
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => setSelectedStatus(st)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected
                        ? "#0D9488"
                        : isDark
                          ? colors.cardBackground
                          : "#FFFFFF",
                      borderColor: isSelected ? "#0D9488" : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isSelected ? "#FFFFFF" : colors.textSecondary },
                    ]}
                  >
                    {st.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Property Directory Listing */}
        <View style={styles.sectionHeaderRow}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#FFFFFF" : "#0F172A" },
            ]}
          >
            Property & Owner Directory ({filteredLeads.length})
          </Text>
          <Text style={[styles.sectionSub, { color: "#0D9488" }]}>
            UNMASKED PII ACCESS
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            color="#0D9488"
            size="large"
            style={{ marginVertical: 30 }}
          />
        ) : filteredLeads.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <Feather name="inbox" size={36} color="#94A3B8" />
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              No Properties Found
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              No property records match your current filter criteria.
            </Text>
          </View>
        ) : (
          filteredLeads.map((lead) => {
            const statusColor = getStatusColor(lead.status);
            const coverImg =
              lead.coverPhoto ||
              (lead.photos && lead.photos[0]?.url) ||
              (lead.images && lead.images[0]);

            return (
              <View
                key={lead._id}
                style={[
                  styles.propertyCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: lead.duplicateFlag?.isDuplicate
                      ? "#F59E0B"
                      : colors.border,
                  },
                ]}
              >
                {/* Duplicate Alert Pill */}
                {lead.duplicateFlag?.isDuplicate && (
                  <View
                    style={[
                      styles.duplicateWarning,
                      { backgroundColor: isDark ? "#451A03" : "#FEF3C7" },
                    ]}
                  >
                    <Ionicons name="warning" size={14} color="#D97706" />
                    <Text
                      style={[
                        styles.duplicateWarningText,
                        { color: isDark ? "#FCD34D" : "#92400E" },
                      ]}
                    >
                      Duplicate Listing Flagged
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleResolveDuplicate(lead)}
                      style={styles.resolveSmallBtn}
                    >
                      <Text style={styles.resolveSmallBtnText}>Resolve</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Card Top Info */}
                <View style={styles.cardTopRow}>
                  <View style={styles.imageWrap}>
                    {coverImg ? (
                      <Image
                        source={{ uri: coverImg }}
                        style={styles.propImg}
                      />
                    ) : (
                      <View
                        style={[
                          styles.imgPlaceholder,
                          { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                        ]}
                      >
                        <Feather name="home" size={24} color="#94A3B8" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor:
                            lead.listingType === "sale" ? "#6D28D9" : "#0D9488",
                        },
                      ]}
                    >
                      <Text style={styles.typeBadgeText}>
                        {(lead.listingType || "RENT").toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.idRow}>
                      <Text style={styles.leadId}>{lead.leadId || "LEAD"}</Text>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: statusColor + "20" },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: statusColor },
                          ]}
                        />
                        <Text
                          style={[styles.statusText, { color: statusColor }]}
                        >
                          {lead.status?.toUpperCase().replace("_", " ")}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.cardTitle,
                        { color: isDark ? "#FFFFFF" : "#0F172A" },
                      ]}
                      numberOfLines={1}
                    >
                      {lead.title || lead.propertyType + " in " + lead.locality}
                    </Text>

                    <Text style={[styles.priceTag, { color: "#0D9488" }]}>
                      ₹{(lead.expectedPrice || 0).toLocaleString("en-IN")}
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>
                        {lead.listingType === "sale" ? " (Total)" : " /month"}
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* Owner Info Strip (UNMASKED) */}
                <View
                  style={[
                    styles.ownerStrip,
                    { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={[
                          styles.ownerNameText,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        {lead.ownerName}
                      </Text>
                      {lead.ownerAadhaarLast4 ? (
                        <View style={styles.aadhaarBadge}>
                          <Text style={styles.aadhaarBadgeText}>
                            Adhr: ****{lead.ownerAadhaarLast4}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.ownerPhoneText, { color: "#0D9488" }]}>
                      +91 {lead.ownerPhone}
                    </Text>
                  </View>

                  <View style={styles.commActions}>
                    <TouchableOpacity
                      onPress={() => handleCall(lead.ownerPhone)}
                      style={styles.commBtn}
                    >
                      <Feather name="phone" size={14} color="#0D9488" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleWhatsApp(lead.ownerPhone)}
                      style={styles.commBtn}
                    >
                      <FontAwesome5 name="whatsapp" size={14} color="#10B981" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Location & Agent Footnote */}
                <View style={styles.cardFootnote}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      flex: 1,
                    }}
                  >
                    <Feather name="map-pin" size={12} color="#64748B" />
                    <Text
                      style={[
                        styles.footnoteText,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {lead.locality || "Delhi NCR"}
                    </Text>
                  </View>
                  <Text
                    style={[styles.footnoteText, { color: colors.textMuted }]}
                  >
                    Agent: {lead.agentName || lead.agent?.name || "Agent"}
                  </Text>
                </View>

                {/* Super Admin Quick Actions */}
                <View style={[styles.cardActionsRow, isSmallDevice && { flexWrap: "wrap", gap: 6 }]}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedLead(lead);
                      setIsDetailModalVisible(true);
                    }}
                    style={[styles.outlineBtn, isSmallDevice && { minWidth: "48%", flex: undefined }, { borderColor: colors.border }]}
                  >
                    <Feather
                      name="eye"
                      size={14}
                      color={isDark ? "#94A3B8" : "#475569"}
                    />
                    <Text
                      style={[
                        styles.outlineBtnText,
                        { color: isDark ? "#CBD5E1" : "#475569" },
                      ]}
                    >
                      Details
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedLead(lead);
                      setIsAssignModalVisible(true);
                    }}
                    style={[styles.outlineBtn, isSmallDevice && { minWidth: "48%", flex: undefined }, { borderColor: "#3B82F6" }]}
                  >
                    <Feather name="user-check" size={14} color="#3B82F6" />
                    <Text style={[styles.outlineBtnText, { color: "#3B82F6" }]}>
                      Assign
                    </Text>
                  </TouchableOpacity>

                  {!lead.deal?.isClosed && lead.status !== "rented" ? (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedLead(lead);
                        setIsDealModalVisible(true);
                      }}
                      style={[
                        styles.actionFilledBtn,
                        isSmallDevice && { minWidth: "48%", flex: undefined },
                        { backgroundColor: "#10B981" },
                      ]}
                    >
                      <Feather name="check-circle" size={14} color="#FFFFFF" />
                      <Text style={styles.actionFilledBtnText}>Close Deal</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedLead(lead);
                        setIsDealModalVisible(true);
                      }}
                      style={[
                        styles.actionFilledBtn,
                        isSmallDevice && { minWidth: "48%", flex: undefined },
                        { backgroundColor: "#0284C7" },
                      ]}
                    >
                      <Feather name="users" size={14} color="#FFFFFF" />
                      <Text style={styles.actionFilledBtnText}>Manage Tenant</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedLead(lead);
                      setIsCommissionModalVisible(true);
                    }}
                    style={[
                      styles.actionFilledBtn,
                      isSmallDevice && { minWidth: "48%", flex: undefined },
                      { backgroundColor: "#0D9488" },
                    ]}
                  >
                    <Ionicons name="cash-outline" size={14} color="#FFFFFF" />
                    <Text style={styles.actionFilledBtnText}>Comm.</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Side Bar Menu */}
      <SuperAdminSideMenu
        visible={isSideMenuVisible}
        onClose={() => setIsSideMenuVisible(false)}
        onCreateUserPress={() => setIsCreateUserModalVisible(true)}
        onNotificationPress={() => setIsNotificationModalVisible(true)}
      />

      {/* Notifications Modal */}
      <SuperAdminNotificationModal
        visible={isNotificationModalVisible}
        onClose={() => setIsNotificationModalVisible(false)}
      />

      {/* Modals */}
      <SuperAdminLeadDetailModal
        visible={isDetailModalVisible}
        lead={selectedLead}
        onClose={() => setIsDetailModalVisible(false)}
        onAssignPress={(l) => {
          setIsDetailModalVisible(false);
          setSelectedLead(l);
          setIsAssignModalVisible(true);
        }}
        onDealPress={(l) => {
          setIsDetailModalVisible(false);
          setSelectedLead(l);
          setIsDealModalVisible(true);
        }}
        onCommissionPress={(l) => {
          setIsDetailModalVisible(false);
          setSelectedLead(l);
          setIsCommissionModalVisible(true);
        }}
        onResolveDuplicate={(l) => {
          setIsDetailModalVisible(false);
          handleResolveDuplicate(l);
        }}
      />

      <SuperAdminAssignModal
        visible={isAssignModalVisible}
        lead={selectedLead}
        onClose={() => setIsAssignModalVisible(false)}
        onSuccess={fetchDashboardData}
      />

      <SuperAdminDealModal
        visible={isDealModalVisible}
        lead={selectedLead}
        onClose={() => setIsDealModalVisible(false)}
        onSuccess={fetchDashboardData}
      />

      <SuperAdminCommissionModal
        visible={isCommissionModalVisible}
        lead={selectedLead}
        onClose={() => setIsCommissionModalVisible(false)}
        onSuccess={fetchDashboardData}
      />

      <SuperAdminCreateUserModal
        visible={isCreateUserModalVisible}
        onClose={() => setIsCreateUserModalVisible(false)}
        onSuccess={fetchDashboardData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  panelBadge: {
    color: "#99F6E4",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  liveText: {
    color: "#A7F3D0",
    fontSize: 9,
    fontWeight: "800",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#0D9488",
  },
  headerBellBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#CCFBF1",
    fontSize: 12,
    marginTop: 6,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  quickActionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  searchSection: {
    gap: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  sectionSub: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  emptyCard: {
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: "center",
  },
  propertyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  duplicateWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  duplicateWarningText: {
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
    marginLeft: 6,
  },
  resolveSmallBtn: {
    backgroundColor: "#D97706",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resolveSmallBtnText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  cardTopRow: {
    flexDirection: "row",
    gap: 12,
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },
  propImg: {
    width: "100%",
    height: "100%",
  },
  imgPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leadId: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  priceTag: {
    fontSize: 16,
    fontWeight: "900",
  },
  ownerStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
  },
  ownerNameText: {
    fontSize: 13,
    fontWeight: "700",
  },
  ownerPhoneText: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  aadhaarBadge: {
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  aadhaarBadgeText: {
    color: "#0F766E",
    fontSize: 10,
    fontWeight: "700",
  },
  commActions: {
    flexDirection: "row",
    gap: 6,
  },
  commBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(13, 148, 136, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardFootnote: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footnoteText: {
    fontSize: 11,
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  actionFilledBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionFilledBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
