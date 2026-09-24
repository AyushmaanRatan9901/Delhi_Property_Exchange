import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
import { useSelector } from "react-redux";
import apiClient from "../../../Redux/api/axiosInstance";
import { RootState } from "../../../Redux/store";
import {
  SuperAdminAssignModal,
  SuperAdminCommissionModal,
  SuperAdminCreateUserModal,
  SuperAdminDealModal,
  SuperAdminLeadDetailModal,
  SuperAdminNotificationModal,
  SuperAdminSideMenu,
} from "../../../components/SuperAdminComponent";
import { useResponsiveTheme } from "../../../constants/theme";

type ViewModeType = "list" | "grid";

interface FilterOption {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: "ALL", label: "All Units", icon: "layers" },
  { id: "NEW", label: "New Leads", icon: "plus-circle" },
  { id: "ASSIGNED", label: "Assigned", icon: "user-check" },
  { id: "UNDER_VERIFICATION", label: "In Review", icon: "clock" },
  { id: "VERIFIED", label: "Verified", icon: "check-circle" },
  { id: "RENTED", label: "Rented", icon: "home" },
  { id: "SOLD", label: "Sold", icon: "award" },
  { id: "REJECTED", label: "Rejected", icon: "x-circle" },
];

export default function SuperAdminDashboard() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();
  const { width: windowWidth } = useWindowDimensions();

  // Responsive device checks
  const isTablet = windowWidth >= 768;
  const isSmallDevice = windowWidth < 380;

  const unreadCount = useSelector(
    (state: RootState) => state.superAdminNotifications?.unreadCount || 0,
  );

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<ViewModeType>("list");

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

  const onRefresh = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCall = (phone?: string) => {
    if (phone) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      Linking.openURL("tel:" + phone.replace(/\s+/g, "")).catch(() => {});
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (phone) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      const clean = phone.replace(/\D/g, "");
      const full = clean.length === 10 ? "91" + clean : clean;
      Linking.openURL(
        "whatsapp://send?phone=" +
          full +
          "&text=Hello%20from%20Delhi%20Property%20Exchange%20SuperAdmin",
      ).catch(() => {});
    }
  };

  const handleResolveDuplicate = async (lead: any) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    Alert.alert(
      "Resolve Duplicate Flag",
      `Choose action for duplicate listing ${lead.leadId || lead._id}:`,
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
              try {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              } catch {}
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
              try {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
              } catch {}
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
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter((l) => {
      return (
        (l.leadId && l.leadId.toLowerCase().includes(q)) ||
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.ownerName && l.ownerName.toLowerCase().includes(q)) ||
        (l.ownerPhone && l.ownerPhone.includes(q)) ||
        (l.locality && l.locality.toLowerCase().includes(q)) ||
        (l.agentName && l.agentName.toLowerCase().includes(q))
      );
    });
  }, [leads, searchQuery]);

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

      {/* Top Gradient Header */}
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
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setIsSideMenuVisible(true);
              }}
              style={styles.hamburgerBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="menu" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Text style={styles.panelBadge}>COMMAND CENTER</Text>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
              <Text style={styles.headerTitle}>Overview & Properties</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setIsNotificationModalVisible(true);
              }}
              style={styles.headerIconCircle}
              activeOpacity={0.75}
            >
              <Feather name="bell" size={17} color="#FFFFFF" />
              {unreadCount > 0 && (
                <View style={styles.headerBellBadge}>
                  <Text style={styles.headerBellBadgeText}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onRefresh}
              style={styles.headerIconCircle}
              activeOpacity={0.75}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>
          Full unmasked owner PII, real-time approvals, deal execution &
          commission desk
        </Text>
      </LinearGradient>

      {/* Content Area */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isTablet && { maxWidth: 1100, alignSelf: "center", width: "94%" },
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
        {/* Metric Quick Stats Carousel / Grid */}
        <View style={styles.statsRow}>
          {/* Total Properties */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setSelectedStatus("ALL");
            }}
            activeOpacity={0.8}
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor:
                  selectedStatus === "ALL" ? "#0D9488" : colors.border,
                borderWidth: selectedStatus === "ALL" ? 2 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: "rgba(13, 148, 136, 0.12)" },
              ]}
            >
              <Feather name="layers" size={14} color="#0D9488" />
            </View>
            <Text style={[styles.statValue, { color: "#0D9488" }]}>
              {totalProps}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Units
            </Text>
          </TouchableOpacity>

          {/* Deals Closed */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setSelectedStatus("RENTED");
            }}
            activeOpacity={0.8}
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor:
                  selectedStatus === "RENTED" ? "#10B981" : colors.border,
                borderWidth: selectedStatus === "RENTED" ? 2 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: "rgba(16, 185, 129, 0.12)" },
              ]}
            >
              <Feather name="check-circle" size={14} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: "#10B981" }]}>
              {closedCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Closed Deals
            </Text>
          </TouchableOpacity>

          {/* Verified Units */}
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setSelectedStatus("VERIFIED");
            }}
            activeOpacity={0.8}
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor:
                  selectedStatus === "VERIFIED" ? "#F59E0B" : colors.border,
                borderWidth: selectedStatus === "VERIFIED" ? 2 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.statIconBadge,
                { backgroundColor: "rgba(245, 158, 11, 0.12)" },
              ]}
            >
              <Feather name="shield" size={14} color="#F59E0B" />
            </View>
            <Text style={[styles.statValue, { color: "#F59E0B" }]}>
              {verifiedCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Verified
            </Text>
          </TouchableOpacity>

          {/* Duplicates */}
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: dupCount > 0 ? "#F59E0B" : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statIconBadge,
                {
                  backgroundColor:
                    dupCount > 0
                      ? "rgba(245, 158, 11, 0.15)"
                      : "rgba(100, 116, 139, 0.1)",
                },
              ]}
            >
              <Feather
                name={dupCount > 0 ? "alert-triangle" : "copy"}
                size={14}
                color={dupCount > 0 ? "#D97706" : "#64748B"}
              />
            </View>
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
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              router.push("/SuperAdminPanel/crm-monitoring" as any);
            }}
            style={[styles.quickActionBtn, { backgroundColor: "#0D9488" }]}
            activeOpacity={0.8}
          >
            <MaterialIcons name="headset-mic" size={14} color="#FFFFFF" />
            <Text style={styles.quickActionBtnText}>CRM Ops</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
              setIsCreateUserModalVisible(true);
            }}
            style={[styles.quickActionBtn, { backgroundColor: "#047857" }]}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={14} color="#FFFFFF" />
            <Text style={styles.quickActionBtnText}>Add User</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input Section */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: colors.border,
            },
          ]}
        >
          <Feather name="search" size={16} color="#0D9488" />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDark ? "#FFFFFF" : "#0F172A" },
            ]}
            placeholder="Search by ID, owner, phone, locality, or agent..."
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={styles.clearSearchBtn}>
                <Feather name="x" size={12} color="#64748B" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Chips Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {FILTER_OPTIONS.map((opt) => {
            const isSelected = selectedStatus === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setSelectedStatus(opt.id);
                }}
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
                activeOpacity={0.75}
              >
                <Feather
                  name={opt.icon}
                  size={12}
                  color={
                    isSelected ? "#FFFFFF" : isDark ? "#94A3B8" : "#64748B"
                  }
                />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? "#FFFFFF" : colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header with View Toggle (Grid / List) */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Property Directory
            </Text>
            <View
              style={[
                styles.countBadge,
                { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" },
              ]}
            >
              <Text
                style={[
                  styles.countBadgeText,
                  { color: isDark ? "#94A3B8" : "#475569" },
                ]}
              >
                {filteredLeads.length}
              </Text>
            </View>
          </View>

          {/* View Mode Switcher (List / Grid) */}
          <View
            style={[
              styles.viewModeToggle,
              {
                backgroundColor: isDark ? colors.cardBackground : "#F1F5F9",
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setViewMode("list");
              }}
              style={[
                styles.viewModeBtn,
                viewMode === "list" && styles.viewModeBtnActive,
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Feather
                name="list"
                size={14}
                color={viewMode === "list" ? "#FFFFFF" : colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                setViewMode("grid");
              }}
              style={[
                styles.viewModeBtn,
                viewMode === "grid" && styles.viewModeBtnActive,
              ]}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Feather
                name="grid"
                size={14}
                color={viewMode === "grid" ? "#FFFFFF" : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Loading / Empty / Property Listing Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#0D9488" size="large" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading property directory...
            </Text>
          </View>
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
            <View
              style={[
                styles.emptyIconCircle,
                { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
              ]}
            >
              <Feather name="inbox" size={32} color="#94A3B8" />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              No Properties Found
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              No property records match your current search query or status
              filter.
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.resetFilterBtn}
              >
                <Text style={styles.resetFilterBtnText}>
                  Clear Search Filter
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : viewMode === "grid" ? (
          <View style={styles.gridContainer}>
            {filteredLeads.map((lead) => (
              <PropertyGridItem
                key={lead._id}
                lead={lead}
                isDark={isDark}
                colors={colors}
                onCall={() => handleCall(lead.ownerPhone)}
                onWhatsApp={() => handleWhatsApp(lead.ownerPhone)}
                onResolveDuplicate={() => handleResolveDuplicate(lead)}
                onDetails={() => {
                  setSelectedLead(lead);
                  setIsDetailModalVisible(true);
                }}
                onAssign={() => {
                  setSelectedLead(lead);
                  setIsAssignModalVisible(true);
                }}
                onDeal={() => {
                  setSelectedLead(lead);
                  setIsDealModalVisible(true);
                }}
                onCommission={() => {
                  setSelectedLead(lead);
                  setIsCommissionModalVisible(true);
                }}
              />
            ))}
          </View>
        ) : (
          filteredLeads.map((lead) => (
            <PropertyListItem
              key={lead._id}
              lead={lead}
              isDark={isDark}
              colors={colors}
              onCall={() => handleCall(lead.ownerPhone)}
              onWhatsApp={() => handleWhatsApp(lead.ownerPhone)}
              onResolveDuplicate={() => handleResolveDuplicate(lead)}
              onDetails={() => {
                setSelectedLead(lead);
                setIsDetailModalVisible(true);
              }}
              onAssign={() => {
                setSelectedLead(lead);
                setIsAssignModalVisible(true);
              }}
              onDeal={() => {
                setSelectedLead(lead);
                setIsDealModalVisible(true);
              }}
              onCommission={() => {
                setSelectedLead(lead);
                setIsCommissionModalVisible(true);
              }}
            />
          ))
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

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components (Memoized for high scroll performance)
// ─────────────────────────────────────────────────────────────────────────────

interface PropertyItemProps {
  lead: any;
  isDark: boolean;
  colors: any;
  onCall: () => void;
  onWhatsApp: () => void;
  onResolveDuplicate: () => void;
  onDetails: () => void;
  onAssign: () => void;
  onDeal: () => void;
  onCommission: () => void;
}

const getStatusBadgeConfig = (st: string) => {
  switch (st?.toLowerCase()) {
    case "verified":
      return {
        color: "#10B981",
        bg: "rgba(16, 185, 129, 0.15)",
        label: "VERIFIED",
      };
    case "rented":
      return {
        color: "#0D9488",
        bg: "rgba(13, 148, 136, 0.15)",
        label: "RENTED",
      };
    case "sold":
      return {
        color: "#8B5CF6",
        bg: "rgba(139, 92, 246, 0.15)",
        label: "SOLD",
      };
    case "under_verification":
      return {
        color: "#F59E0B",
        bg: "rgba(245, 158, 11, 0.15)",
        label: "UNDER REVIEW",
      };
    case "assigned":
      return {
        color: "#3B82F6",
        bg: "rgba(59, 130, 246, 0.15)",
        label: "ASSIGNED",
      };
    case "rejected":
      return {
        color: "#EF4444",
        bg: "rgba(239, 68, 68, 0.15)",
        label: "REJECTED",
      };
    default:
      return {
        color: "#64748B",
        bg: "rgba(100, 116, 139, 0.15)",
        label: (st || "NEW").toUpperCase().replace("_", " "),
      };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Grid Card Sub-Component (2-Column Responsive)
// ─────────────────────────────────────────────────────────────────────────────
const PropertyGridItem = memo(
  ({
    lead,
    isDark,
    colors,
    onCall,
    onWhatsApp,
    onResolveDuplicate,
    onDetails,
    onAssign,
    onDeal,
    onCommission,
  }: PropertyItemProps) => {
    const statusCfg = getStatusBadgeConfig(lead.status);
    const coverImg =
      lead.coverPhoto ||
      (lead.photos && lead.photos[0]?.url) ||
      (lead.images && lead.images[0]);

    return (
      <View
        style={[
          styles.gridCard,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderColor: lead.duplicateFlag?.isDuplicate
              ? "#F59E0B"
              : colors.border,
          },
        ]}
      >
        {/* Duplicate Banner */}
        {lead.duplicateFlag?.isDuplicate && (
          <TouchableOpacity
            onPress={onResolveDuplicate}
            style={[
              styles.gridDupBanner,
              { backgroundColor: isDark ? "#451A03" : "#FEF3C7" },
            ]}
          >
            <Ionicons name="warning" size={11} color="#D97706" />
            <Text
              style={[
                styles.gridDupText,
                { color: isDark ? "#FCD34D" : "#92400E" },
              ]}
              numberOfLines={1}
            >
              Duplicate
            </Text>
            <View style={styles.gridDupPill}>
              <Text style={styles.gridDupPillText}>Fix</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Image / Header Media */}
        <View style={styles.gridImageContainer}>
          {coverImg ? (
            <Image source={{ uri: coverImg }} style={styles.gridPropImg} />
          ) : (
            <View
              style={[
                styles.gridImgPlaceholder,
                { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
              ]}
            >
              <Feather name="home" size={26} color="#94A3B8" />
            </View>
          )}

          {/* Type Badge */}
          <View
            style={[
              styles.gridTypeBadge,
              {
                backgroundColor:
                  lead.listingType === "sale" ? "#7C3AED" : "#0D9488",
              },
            ]}
          >
            <Text style={styles.gridTypeBadgeText}>
              {(lead.listingType || "RENT").toUpperCase()}
            </Text>
          </View>

          {/* Price Tag Overlay */}
          <View style={styles.gridPriceOverlay}>
            <Text style={styles.gridPriceText}>
              ₹{(lead.expectedPrice || 0).toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.gridBody}>
          {/* ID & Status Row */}
          <View style={styles.gridIdRow}>
            <Text style={styles.gridLeadId} numberOfLines={1}>
              {lead.leadId || "LEAD"}
            </Text>
            <View
              style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusCfg.color }]}
              />
              <Text style={[styles.statusText, { color: statusCfg.color }]}>
                {statusCfg.label}
              </Text>
            </View>
          </View>

          {/* Property Title */}
          <Text
            style={[
              styles.gridTitle,
              { color: isDark ? "#FFFFFF" : "#0F172A" },
            ]}
            numberOfLines={1}
          >
            {lead.title ||
              `${lead.propertyType || "Property"} in ${lead.locality || "Delhi"}`}
          </Text>

          {/* Location */}
          <View style={styles.gridLocRow}>
            <Feather name="map-pin" size={11} color="#64748B" />
            <Text
              style={[styles.gridLocText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {lead.locality || "Delhi NCR"}
            </Text>
          </View>

          {/* Owner Details Strip */}
          <View
            style={[
              styles.gridOwnerStrip,
              { backgroundColor: isDark ? "#0B132B" : "#F8FAFC" },
            ]}
          >
            <View style={{ flex: 1, marginRight: 4 }}>
              <Text
                style={[
                  styles.gridOwnerName,
                  { color: isDark ? "#FFFFFF" : "#0F172A" },
                ]}
                numberOfLines={1}
              >
                {lead.ownerName || "Owner"}
              </Text>
              <Text style={styles.gridOwnerPhone} numberOfLines={1}>
                +91 {lead.ownerPhone}
              </Text>
            </View>

            {/* Quick Dialers */}
            <View style={{ flexDirection: "row", gap: 4 }}>
              <TouchableOpacity onPress={onCall} style={styles.gridCommBtn}>
                <Feather name="phone" size={11} color="#0D9488" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onWhatsApp}
                style={[
                  styles.gridCommBtn,
                  { backgroundColor: "rgba(16, 185, 129, 0.12)" },
                ]}
              >
                <FontAwesome5 name="whatsapp" size={11} color="#10B981" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Agent info */}
          <Text
            style={[styles.gridAgentText, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            Agent: {lead.agentName || lead.agent?.name || "Unassigned"}
          </Text>

          {/* Action Grid Buttons */}
          <View style={styles.gridActionsRow}>
            <TouchableOpacity
              onPress={onDetails}
              style={[styles.gridActionBtn, { borderColor: colors.border }]}
              activeOpacity={0.75}
            >
              <Feather
                name="eye"
                size={12}
                color={isDark ? "#CBD5E1" : "#475569"}
              />
              <Text
                style={[
                  styles.gridActionBtnText,
                  { color: isDark ? "#CBD5E1" : "#475569" },
                ]}
              >
                View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onAssign}
              style={[styles.gridActionBtn, { borderColor: "#3B82F6" }]}
              activeOpacity={0.75}
            >
              <Feather name="user-check" size={12} color="#3B82F6" />
              <Text style={[styles.gridActionBtnText, { color: "#3B82F6" }]}>
                Assign
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDeal}
              style={[
                styles.gridActionBtnFilled,
                {
                  backgroundColor: lead.deal?.isClosed ? "#0284C7" : "#10B981",
                },
              ]}
              activeOpacity={0.8}
            >
              <Feather
                name={lead.deal?.isClosed ? "users" : "check-circle"}
                size={12}
                color="#FFFFFF"
              />
              <Text style={styles.gridActionBtnFilledText}>
                {lead.deal?.isClosed ? "Tenant" : "Deal"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. List Card Sub-Component (Full-Width Rich Card)
// ─────────────────────────────────────────────────────────────────────────────
const PropertyListItem = memo(
  ({
    lead,
    isDark,
    colors,
    onCall,
    onWhatsApp,
    onResolveDuplicate,
    onDetails,
    onAssign,
    onDeal,
    onCommission,
  }: PropertyItemProps) => {
    const statusCfg = getStatusBadgeConfig(lead.status);
    const coverImg =
      lead.coverPhoto ||
      (lead.photos && lead.photos[0]?.url) ||
      (lead.images && lead.images[0]);

    return (
      <View
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
              onPress={onResolveDuplicate}
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
              <Image source={{ uri: coverImg }} style={styles.propImg} />
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
                    lead.listingType === "sale" ? "#7C3AED" : "#0D9488",
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
                style={[styles.statusPill, { backgroundColor: statusCfg.bg }]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusCfg.color },
                  ]}
                />
                <Text style={[styles.statusText, { color: statusCfg.color }]}>
                  {statusCfg.label}
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
              {lead.title ||
                (lead.propertyType
                  ? `${lead.propertyType} in ${lead.locality}`
                  : "Property Listing")}
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
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text
                style={[
                  styles.ownerNameText,
                  { color: isDark ? "#FFFFFF" : "#0F172A" },
                ]}
              >
                {lead.ownerName || "Owner"}
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
            <TouchableOpacity onPress={onCall} style={styles.commBtn}>
              <Feather name="phone" size={13} color="#0D9488" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onWhatsApp}
              style={[
                styles.commBtn,
                { backgroundColor: "rgba(16, 185, 129, 0.12)" },
              ]}
            >
              <FontAwesome5 name="whatsapp" size={13} color="#10B981" />
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
              style={[styles.footnoteText, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {lead.locality || "Delhi NCR"}
            </Text>
          </View>
          <Text style={[styles.footnoteText, { color: colors.textMuted }]}>
            Agent: {lead.agentName || lead.agent?.name || "Unassigned"}
          </Text>
        </View>

        {/* Super Admin Quick Actions */}
        <View style={styles.cardActionsRow}>
          <TouchableOpacity
            onPress={onDetails}
            style={[styles.outlineBtn, { borderColor: colors.border }]}
            activeOpacity={0.75}
          >
            <Feather
              name="eye"
              size={13}
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
            onPress={onAssign}
            style={[styles.outlineBtn, { borderColor: "#3B82F6" }]}
            activeOpacity={0.75}
          >
            <Feather name="user-check" size={13} color="#3B82F6" />
            <Text style={[styles.outlineBtnText, { color: "#3B82F6" }]}>
              Assign
            </Text>
          </TouchableOpacity>

          {!lead.deal?.isClosed && lead.status !== "rented" ? (
            <TouchableOpacity
              onPress={onDeal}
              style={[styles.actionFilledBtn, { backgroundColor: "#10B981" }]}
              activeOpacity={0.8}
            >
              <Feather name="check-circle" size={13} color="#FFFFFF" />
              <Text style={styles.actionFilledBtnText}>Close Deal</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onDeal}
              style={[styles.actionFilledBtn, { backgroundColor: "#0284C7" }]}
              activeOpacity={0.8}
            >
              <Feather name="users" size={13} color="#FFFFFF" />
              <Text style={styles.actionFilledBtnText}>Tenant</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onCommission}
            style={[styles.actionFilledBtn, { backgroundColor: "#0D9488" }]}
            activeOpacity={0.8}
          >
            <Ionicons name="cash-outline" size={13} color="#FFFFFF" />
            <Text style={styles.actionFilledBtnText}>Comm.</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 20,
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
    gap: 7,
    marginBottom: 3,
  },
  panelBadge: {
    color: "#99F6E4",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1,
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
    fontSize: 8.5,
    fontWeight: "800",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#0D9488",
  },
  headerBellBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#CCFBF1",
    fontSize: 11.5,
    marginTop: 6,
    lineHeight: 16,
  },
  content: {
    padding: 14,
    gap: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  statIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    textAlign: "center",
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 7,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 11,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    padding: 0,
  },
  clearSearchBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(100, 116, 139, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: 7,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: "800",
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  viewModeToggle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9,
    padding: 2.5,
    borderWidth: 1,
    gap: 2,
  },
  viewModeBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  viewModeBtnActive: {
    backgroundColor: "#0D9488",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyCard: {
    padding: 28,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  emptyDesc: {
    fontSize: 11.5,
    textAlign: "center",
    lineHeight: 16,
  },
  resetFilterBtn: {
    marginTop: 6,
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetFilterBtnText: {
    color: "#0D9488",
    fontSize: 11,
    fontWeight: "700",
  },

  // ───────────────────────────────────────────────────────────────────────────
  // List View Styles
  // ───────────────────────────────────────────────────────────────────────────
  propertyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  duplicateWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  duplicateWarningText: {
    fontSize: 10.5,
    fontWeight: "700",
    flex: 1,
    marginLeft: 5,
  },
  resolveSmallBtn: {
    backgroundColor: "#D97706",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  resolveSmallBtnText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "700",
  },
  cardTopRow: {
    flexDirection: "row",
    gap: 10,
  },
  imageWrap: {
    width: 76,
    height: 76,
    borderRadius: 12,
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
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontWeight: "800",
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leadId: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3.5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  priceTag: {
    fontSize: 15,
    fontWeight: "900",
  },
  ownerStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    borderRadius: 10,
  },
  ownerNameText: {
    fontSize: 12,
    fontWeight: "700",
  },
  ownerPhoneText: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 1,
  },
  aadhaarBadge: {
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  aadhaarBadgeText: {
    color: "#0F766E",
    fontSize: 9,
    fontWeight: "700",
  },
  commActions: {
    flexDirection: "row",
    gap: 5,
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
    fontSize: 10.5,
  },
  cardActionsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  actionFilledBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 7,
    borderRadius: 9,
  },
  actionFilledBtnText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Grid View Styles (2-Column Grid)
  // ───────────────────────────────────────────────────────────────────────────
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48.5%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  gridDupBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  gridDupText: {
    fontSize: 9.5,
    fontWeight: "700",
    flex: 1,
  },
  gridDupPill: {
    backgroundColor: "#D97706",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  gridDupPillText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontWeight: "800",
  },
  gridImageContainer: {
    height: 105,
    width: "100%",
    position: "relative",
  },
  gridPropImg: {
    width: "100%",
    height: "100%",
  },
  gridImgPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  gridTypeBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  gridTypeBadgeText: {
    color: "#FFFFFF",
    fontSize: 8.5,
    fontWeight: "800",
  },
  gridPriceOverlay: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridPriceText: {
    color: "#5EEAD4",
    fontSize: 11,
    fontWeight: "900",
  },
  gridBody: {
    padding: 9,
    gap: 6,
  },
  gridIdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridLeadId: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#64748B",
    maxWidth: "50%",
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 15,
  },
  gridLocRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  gridLocText: {
    fontSize: 10,
    fontWeight: "500",
  },
  gridOwnerStrip: {
    padding: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridOwnerName: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  gridOwnerPhone: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#0D9488",
    marginTop: 1,
  },
  gridCommBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridAgentText: {
    fontSize: 9,
  },
  gridActionsRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2,
  },
  gridActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 5,
    borderRadius: 7,
    borderWidth: 1,
  },
  gridActionBtnText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  gridActionBtnFilled: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingVertical: 5,
    borderRadius: 7,
  },
  gridActionBtnFilledText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "700",
  },
});
