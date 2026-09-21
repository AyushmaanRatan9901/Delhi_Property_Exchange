import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
  Alert,
  Share,
} from "react-native";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { useResponsiveTheme } from "../../../constants/theme";
import { AppDispatch, RootState } from "../../../Redux/store";
import {
  fetchSuperAdminNotifications,
  markSuperAdminNotificationAsReadThunk,
  markAllSuperAdminNotificationsAsReadThunk,
  deleteSuperAdminNotificationThunk,
  clearAllSuperAdminNotificationsThunk,
  SuperAdminNotification,
  SuperAdminNotifCategory,
  PanelSource,
  PriorityLevel,
} from "../../../Redux/SuperAdmin/superAdminNotificationSlice";

export { SuperAdminNotification, SuperAdminNotifCategory, PanelSource, PriorityLevel };

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export type DateFilter = "ALL_TIME" | "TODAY" | "THIS_WEEK" | "THIS_MONTH";
export type SortOption = "NEWEST" | "OLDEST" | "PRIORITY" | "UNREAD_FIRST";

// ── COMPONENT PROPS ────────────────────────────────────────────────────────────

export interface SuperAdminNotificationProps {
  isModal?: boolean;
  visible?: boolean;
  onClose?: () => void;
}

// ── MAIN SUPERADMIN NOTIFICATION COMPONENT ─────────────────────────────────────

export const SuperAdminNotificationScreen: React.FC<
  SuperAdminNotificationProps
> = ({ isModal = false, visible = true, onClose }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { colors, isDark } = useResponsiveTheme();

  // Redux state (Live backend notifications + Socket.io updates)
  const reduxNotifications = useSelector(
    (state: RootState) => state.superAdminNotifications.notifications
  );
  const unreadCount = useSelector(
    (state: RootState) => state.superAdminNotifications.unreadCount
  );
  const isNotificationsLoading = useSelector(
    (state: RootState) => state.superAdminNotifications.loading
  );
  const isSocketConnected = useSelector(
    (state: RootState) => state.superAdminNotifications.isSocketConnected
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter States
  const [selectedCategory, setSelectedCategory] =
    useState<SuperAdminNotifCategory>("ALL");
  const [selectedPanel, setSelectedPanel] = useState<PanelSource>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | "UNREAD" | "READ" | "URGENT"
  >("ALL");
  const [selectedDateFilter, setSelectedDateFilter] =
    useState<DateFilter>("ALL_TIME");
  const [selectedSort, setSelectedSort] = useState<SortOption>("NEWEST");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Selected Notification Detail Modal
  const [activeDetailNotif, setActiveDetailNotif] =
    useState<SuperAdminNotification | null>(null);

  // Theme Constants
  const bgPrimary = isDark ? "#090D16" : "#F8FAFC";
  const bgCard = isDark ? "#131B2E" : "#FFFFFF";
  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#64748B");
  const borderCol = colors.border || (isDark ? "#1E293B" : "#E2E8F0");
  const brandPrimary = "#4F46E5"; // Indigo / Royal Blue for SuperAdmin
  const brandSecondary = "#0D9488"; // Teal

  // Fetch real backend notifications on mount and when modal becomes visible
  useEffect(() => {
    if (visible) {
      dispatch(fetchSuperAdminNotifications());
    }
  }, [visible, dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchSuperAdminNotifications()).unwrap();
    } catch {}
    setRefreshing(false);
  };

  // ── FILTERING & COMPUTED STATS ────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = reduxNotifications.length;
    const unread = unreadCount;
    const urgent = reduxNotifications.filter((n) => n.priority === "URGENT").length;
    const payouts = reduxNotifications.filter(
      (n) => n.category === "COMMISSION_PAYOUT" && !n.isRead && !n.read
    ).length;
    const fraud = reduxNotifications.filter(
      (n) => n.category === "FRAUD_COMPLAINT" && !n.isRead && !n.read
    ).length;
    return { total, unread, urgent, payouts, fraud };
  }, [reduxNotifications, unreadCount]);

  const filteredNotifications = useMemo(() => {
    return reduxNotifications
      .filter((notif) => {
        const isRead = Boolean(notif.isRead || notif.read);

        // 1. Search Query Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (notif.title || "").toLowerCase().includes(q);
          const matchMsg = (notif.message || "").toLowerCase().includes(q);
          const matchLocality = (notif.meta?.locality || "").toLowerCase().includes(q);
          const matchLeadId = (notif.meta?.leadId || "").toLowerCase().includes(q);
          const matchUser = (notif.meta?.userName || "").toLowerCase().includes(q);
          const matchStaff = (notif.meta?.staffName || "").toLowerCase().includes(q);
          const matchUtr = (notif.meta?.utrNumber || "").toLowerCase().includes(q);
          if (
            !matchTitle &&
            !matchMsg &&
            !matchLocality &&
            !matchLeadId &&
            !matchUser &&
            !matchStaff &&
            !matchUtr
          ) {
            return false;
          }
        }

        // 2. Category Filter
        if (selectedCategory !== "ALL" && notif.category !== selectedCategory) {
          return false;
        }

        // 3. Panel Source Filter
        if (selectedPanel !== "ALL" && notif.panelSource !== selectedPanel) {
          return false;
        }

        // 4. Status Filter
        if (selectedStatus === "UNREAD" && isRead) return false;
        if (selectedStatus === "READ" && !isRead) return false;
        if (selectedStatus === "URGENT" && notif.priority !== "URGENT")
          return false;

        // 5. Date Filter
        if (selectedDateFilter !== "ALL_TIME") {
          const notifDate = new Date(notif.createdAt).getTime();
          const now = Date.now();
          const oneDay = 24 * 60 * 60 * 1000;
          if (selectedDateFilter === "TODAY" && now - notifDate > oneDay) {
            return false;
          }
          if (selectedDateFilter === "THIS_WEEK" && now - notifDate > 7 * oneDay) {
            return false;
          }
          if (
            selectedDateFilter === "THIS_MONTH" &&
            now - notifDate > 30 * oneDay
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (selectedSort === "NEWEST") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (selectedSort === "OLDEST") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (selectedSort === "PRIORITY") {
          const pMap = { URGENT: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
          return (pMap[b.priority] || 2) - (pMap[a.priority] || 2);
        }
        if (selectedSort === "UNREAD_FIRST") {
          return Number(Boolean(a.isRead || a.read)) - Number(Boolean(b.isRead || b.read));
        }
        return 0;
      });
  }, [
    reduxNotifications,
    searchQuery,
    selectedCategory,
    selectedPanel,
    selectedStatus,
    selectedDateFilter,
    selectedSort,
  ]);

  // Active filter count indicator
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "ALL") count++;
    if (selectedPanel !== "ALL") count++;
    if (selectedStatus !== "ALL") count++;
    if (selectedDateFilter !== "ALL_TIME") count++;
    if (selectedSort !== "NEWEST") count++;
    return count;
  }, [
    selectedCategory,
    selectedPanel,
    selectedStatus,
    selectedDateFilter,
    selectedSort,
  ]);

  // ── ACTIONS ──────────────────────────────────────────────────────────────────

  const handleMarkAsRead = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    dispatch(markSuperAdminNotificationAsReadThunk(id));
  };

  const handleMarkAllAsRead = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    dispatch(markAllSuperAdminNotificationsAsReadThunk());
  };

  const handleDeleteNotification = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    dispatch(deleteSuperAdminNotificationThunk(id));
    if (activeDetailNotif?.id === id || activeDetailNotif?._id === id) {
      setActiveDetailNotif(null);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to permanently clear all notifications for SuperAdmin?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            try {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              );
            } catch {}
            dispatch(clearAllSuperAdminNotificationsThunk());
          },
        },
      ]
    );
  };

  const resetAllFilters = () => {
    setSelectedCategory("ALL");
    setSelectedPanel("ALL");
    setSelectedStatus("ALL");
    setSelectedDateFilter("ALL_TIME");
    setSelectedSort("NEWEST");
    setSearchQuery("");
  };

  const handleQuickAction = (notif: SuperAdminNotification) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    handleMarkAsRead(notif.id || notif._id || "");

    if (notif.actionType === "INVESTIGATE_FRAUD") {
      Alert.alert(
        "🚨 Fraud Investigation",
        `Open investigation for Lead #${notif.meta?.leadId || notif.title}?\n\nStaff Remarks: ${notif.meta?.notes || notif.message}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Take Action / Blacklist",
            style: "destructive",
            onPress: () => {
              Alert.alert(
                "Lead Locked",
                "Lead marked as Fraudulent and blacklisted across platform."
              );
            },
          },
        ]
      );
    } else if (notif.actionType === "APPROVE_PAYOUT") {
      Alert.alert(
        "💰 Approve Payout",
        `Disburse ₹${notif.meta?.amount?.toLocaleString("en-IN") || "0"} to ${notif.meta?.userName || "Agent"}?\n\n${notif.meta?.notes || ""}`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Approve & Pay Now",
            onPress: () => {
              Alert.alert(
                "Payout Approved",
                `₹${notif.meta?.amount?.toLocaleString("en-IN") || "0"} payout queued for instant bank transfer.`
              );
            },
          },
        ]
      );
    } else if (notif.actionType === "REVIEW_LEAD") {
      Alert.alert(
        "📋 Lead Review",
        `Property: ${notif.meta?.propertyTitle || notif.title}\nLocality: ${notif.meta?.locality || ""}\nExpected Price: ₹${notif.meta?.amount?.toLocaleString("en-IN") || ""}`,
        [
          { text: "Close", style: "cancel" },
          {
            text: "Assign Verification Staff",
            onPress: () => {
              if (isModal && onClose) onClose();
              router.push("/SuperAdminPanel/(tabs)/Dashboard" as any);
            },
          },
        ]
      );
    } else {
      setActiveDetailNotif(notif);
    }
  };

  // ── CATEGORY & PANEL HELPER VISUALS ──────────────────────────────────────────

  const getCategoryMeta = (cat: SuperAdminNotifCategory) => {
    switch (cat) {
      case "FRAUD_COMPLAINT":
        return {
          label: "Fraud & Alerts",
          icon: "alert-octagon",
          color: "#EF4444",
          bgColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#FEE2E2",
        };
      case "COMMISSION_PAYOUT":
        return {
          label: "Commission",
          icon: "cash-multiple",
          color: "#10B981",
          bgColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#D1FAE5",
        };
      case "PROPERTY_VERIFICATION":
        return {
          label: "Verification",
          icon: "shield-check",
          color: "#0D9488",
          bgColor: isDark ? "rgba(13, 148, 136, 0.2)" : "#CCFBF1",
        };
      case "LEAD":
        return {
          label: "Leads Pipeline",
          icon: "home-city",
          color: "#4F46E5",
          bgColor: isDark ? "rgba(79, 70, 229, 0.2)" : "#E0E7FF",
        };
      case "USER":
        return {
          label: "User Onboarding",
          icon: "account-group",
          color: "#F59E0B",
          bgColor: isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7",
        };
      case "SYSTEM":
        return {
          label: "System & Settings",
          icon: "cog",
          color: "#8B5CF6",
          bgColor: isDark ? "rgba(139, 92, 246, 0.2)" : "#EDE9FE",
        };
      default:
        return {
          label: "General",
          icon: "bell",
          color: "#64748B",
          bgColor: isDark ? "rgba(100, 116, 139, 0.2)" : "#F1F5F9",
        };
    }
  };

  const getPanelBadge = (panel: PanelSource) => {
    switch (panel) {
      case "VERIFICATION_STAFF":
        return { text: "Field Staff", color: "#0D9488" };
      case "BROKER_AGENT":
        return { text: "Broker / Agent", color: "#4F46E5" };
      case "TENANT":
        return { text: "Tenant App", color: "#3B82F6" };
      case "OWNER":
        return { text: "Owner Portal", color: "#F59E0B" };
      case "SYSTEM_ADMIN":
        return { text: "Super Admin Core", color: "#8B5CF6" };
      default:
        return { text: "Platform", color: "#64748B" };
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  // ── RENDER CONTENT ────────────────────────────────────────────────────────────

  const Content = (
    <View style={[styles.root, { backgroundColor: bgPrimary }]}>
      {/* ── HEADER ── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: isModal ? 16 : Math.max(insets.top + 8, 20),
            backgroundColor: bgCard,
            borderBottomColor: borderCol,
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleGroup}>
            <View style={[styles.crownIconBox, { backgroundColor: brandPrimary }]}>
              <MaterialCommunityIcons name="crown" size={20} color="#FFFFFF" />
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.headerTitle, { color: textPrimary }]}>
                  SuperAdmin Notifications
                </Text>
                {stats.unread > 0 && (
                  <View style={styles.unreadCountPill}>
                    <Text style={styles.unreadCountText}>{stats.unread}</Text>
                  </View>
                )}
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                <View
                  style={[
                    styles.socketIndicator,
                    {
                      backgroundColor: isSocketConnected ? "#10B981" : "#F59E0B",
                    },
                  ]}
                />
                <Text style={[styles.headerSub, { color: textSecondary }]}>
                  {isSocketConnected ? "Real-Time Socket Live" : "Connecting Live Feed..."}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerActionRow}>
            <TouchableOpacity
              onPress={handleRefresh}
              disabled={isNotificationsLoading || refreshing}
              style={[styles.headerIconBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
            >
              {isNotificationsLoading || refreshing ? (
                <ActivityIndicator size="small" color={brandPrimary} />
              ) : (
                <Feather name="refresh-cw" size={16} color={textSecondary} />
              )}
            </TouchableOpacity>

            {isModal && onClose && (
              <TouchableOpacity
                onPress={onClose}
                style={[styles.headerIconBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
              >
                <Ionicons name="close" size={20} color={textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── SEARCH BAR & ADVANCED FILTER TOGGLE ── */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                borderColor: borderCol,
              },
            ]}
          >
            <Feather name="search" size={16} color={textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: textPrimary }]}
              placeholder="Search leads, users, properties, tickets..."
              placeholderTextColor={textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color={textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              try {
                Haptics.selectionAsync();
              } catch {}
              setFilterModalVisible(true);
            }}
            style={[
              styles.filterToggleBtn,
              {
                backgroundColor:
                  activeFiltersCount > 0 ? brandPrimary : isDark ? "#1E293B" : "#F1F5F9",
                borderColor: activeFiltersCount > 0 ? brandPrimary : borderCol,
              },
            ]}
          >
            <Feather
              name="sliders"
              size={16}
              color={activeFiltersCount > 0 ? "#FFFFFF" : textSecondary}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.activeFilterCountDot}>
                <Text style={styles.activeFilterCountDotText}>
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── QUICK METRICS STRIP ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsContainer}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedStatus(selectedStatus === "UNREAD" ? "ALL" : "UNREAD")}
            style={[
              styles.metricCard,
              { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol },
              selectedStatus === "UNREAD" && { borderColor: brandPrimary, borderWidth: 1.5 },
            ]}
          >
            <Text style={[styles.metricLabel, { color: textSecondary }]}>Unread</Text>
            <Text style={[styles.metricValue, { color: brandPrimary }]}>
              {stats.unread}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedCategory(selectedCategory === "FRAUD_COMPLAINT" ? "ALL" : "FRAUD_COMPLAINT")}
            style={[
              styles.metricCard,
              { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol },
              selectedCategory === "FRAUD_COMPLAINT" && { borderColor: "#EF4444", borderWidth: 1.5 },
            ]}
          >
            <Text style={[styles.metricLabel, { color: textSecondary }]}>Fraud Alerts</Text>
            <Text style={[styles.metricValue, { color: "#EF4444" }]}>
              {stats.fraud}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedCategory(selectedCategory === "COMMISSION_PAYOUT" ? "ALL" : "COMMISSION_PAYOUT")}
            style={[
              styles.metricCard,
              { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol },
              selectedCategory === "COMMISSION_PAYOUT" && { borderColor: "#10B981", borderWidth: 1.5 },
            ]}
          >
            <Text style={[styles.metricLabel, { color: textSecondary }]}>Payout Requests</Text>
            <Text style={[styles.metricValue, { color: "#10B981" }]}>
              {stats.payouts}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedStatus(selectedStatus === "URGENT" ? "ALL" : "URGENT")}
            style={[
              styles.metricCard,
              { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol },
              selectedStatus === "URGENT" && { borderColor: "#F59E0B", borderWidth: 1.5 },
            ]}
          >
            <Text style={[styles.metricLabel, { color: textSecondary }]}>Urgent Actions</Text>
            <Text style={[styles.metricValue, { color: "#F59E0B" }]}>
              {stats.urgent}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── HORIZONTAL CATEGORY CHIPS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsContainer}
        >
          {(
            [
              { key: "ALL", label: "All Feeds" },
              { key: "FRAUD_COMPLAINT", label: "🚨 Fraud & Alerts" },
              { key: "COMMISSION_PAYOUT", label: "💰 Commission" },
              { key: "PROPERTY_VERIFICATION", label: "🛡️ Verification" },
              { key: "LEAD", label: "📋 Leads" },
              { key: "USER", label: "👥 Users" },
              { key: "SYSTEM", label: "⚙️ System" },
            ] as { key: SuperAdminNotifCategory; label: string }[]
          ).map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setSelectedCategory(cat.key);
                }}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? brandPrimary
                      : isDark
                      ? "#1E293B"
                      : "#F1F5F9",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isSelected ? "#FFFFFF" : textSecondary,
                      fontWeight: isSelected ? "700" : "600",
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── TOOLBAR (ACTIONS & ACTIVE FILTER SUMMARY) ── */}
      <View
        style={[
          styles.toolbar,
          { backgroundColor: bgCard, borderBottomColor: borderCol },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[styles.resultCountText, { color: textSecondary }]}>
            Showing{" "}
            <Text style={{ fontWeight: "800", color: textPrimary }}>
              {filteredNotifications.length}
            </Text>{" "}
            live notifications
          </Text>
          {activeFiltersCount > 0 && (
            <TouchableOpacity onPress={resetAllFilters} style={styles.clearFiltersChip}>
              <Text style={styles.clearFiltersChipText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {reduxNotifications.some((n) => !n.isRead && !n.read) && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.toolbarActionBtn}
            >
              <Feather name="check-circle" size={13} color={brandSecondary} />
              <Text style={[styles.toolbarActionText, { color: brandSecondary }]}>
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
          {reduxNotifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={styles.toolbarActionBtn}
            >
              <Feather name="trash-2" size={13} color="#EF4444" />
              <Text style={[styles.toolbarActionText, { color: "#EF4444" }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── NOTIFICATION FEED LIST ── */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={brandPrimary}
            colors={[brandPrimary]}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIconBox,
                { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
              ]}
            >
              <MaterialCommunityIcons
                name="bell-check-outline"
                size={40}
                color={textSecondary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>
              No Notifications Found
            </Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              {searchQuery || activeFiltersCount > 0
                ? "Try adjusting or resetting your active filters to see more events."
                : "All SuperAdmin notifications are up to date! Real-time alerts will stream here automatically."}
            </Text>
            {activeFiltersCount > 0 && (
              <TouchableOpacity
                onPress={resetAllFilters}
                style={[styles.resetBtn, { backgroundColor: brandPrimary }]}
              >
                <Text style={styles.resetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredNotifications.map((notif) => {
            const catMeta = getCategoryMeta(notif.category);
            const panelBadge = getPanelBadge(notif.panelSource);
            const isRead = Boolean(notif.isRead || notif.read);
            const notifId = notif.id || notif._id || "";

            return (
              <TouchableOpacity
                key={notifId}
                activeOpacity={0.85}
                onPress={() => setActiveDetailNotif(notif)}
                style={[
                  styles.card,
                  {
                    backgroundColor: bgCard,
                    borderColor: isRead
                      ? borderCol
                      : isDark
                      ? "#374151"
                      : "#CBD5E1",
                    borderLeftWidth: isRead ? 1 : 4,
                    borderLeftColor: isRead
                      ? borderCol
                      : notif.priority === "URGENT"
                      ? "#EF4444"
                      : notif.priority === "HIGH"
                      ? "#F59E0B"
                      : brandPrimary,
                  },
                ]}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View
                      style={[
                        styles.catBadge,
                        { backgroundColor: catMeta.bgColor },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={catMeta.icon as any}
                        size={13}
                        color={catMeta.color}
                      />
                      <Text style={[styles.catBadgeText, { color: catMeta.color }]}>
                        {catMeta.label.toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.panelBadge,
                        { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                      ]}
                    >
                      <Text
                        style={[styles.panelBadgeText, { color: panelBadge.color }]}
                      >
                        {panelBadge.text}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardHeaderRight}>
                    {notif.priority === "URGENT" && (
                      <View style={styles.urgentPulseBadge}>
                        <Text style={styles.urgentPulseText}>URGENT</Text>
                      </View>
                    )}
                    <Text style={[styles.timeAgoText, { color: textSecondary }]}>
                      {formatTimeAgo(notif.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Title & Body */}
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: textPrimary,
                      fontWeight: isRead ? "600" : "800",
                    },
                  ]}
                >
                  {notif.title}
                </Text>

                <Text
                  numberOfLines={3}
                  style={[
                    styles.cardMessage,
                    {
                      color: isRead
                        ? textSecondary
                        : isDark
                        ? "#E2E8F0"
                        : "#334155",
                    },
                  ]}
                >
                  {notif.message}
                </Text>

                {/* Metadata Pills (if any) */}
                {notif.meta && (
                  <View style={styles.metaRow}>
                    {notif.meta.leadId && (
                      <View
                        style={[
                          styles.metaPill,
                          { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                        ]}
                      >
                        <Feather name="hash" size={11} color={textSecondary} />
                        <Text style={[styles.metaPillText, { color: textSecondary }]}>
                          Lead #{notif.meta.leadId}
                        </Text>
                      </View>
                    )}
                    {notif.meta.amount && (
                      <View
                        style={[
                          styles.metaPill,
                          { backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5" },
                        ]}
                      >
                        <Feather name="dollar-sign" size={11} color="#10B981" />
                        <Text style={[styles.metaPillText, { color: "#10B981", fontWeight: "700" }]}>
                          ₹{notif.meta.amount.toLocaleString("en-IN")}
                        </Text>
                      </View>
                    )}
                    {notif.meta.locality && (
                      <View
                        style={[
                          styles.metaPill,
                          { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                        ]}
                      >
                        <Feather name="map-pin" size={11} color={textSecondary} />
                        <Text style={[styles.metaPillText, { color: textSecondary }]}>
                          {notif.meta.locality}
                        </Text>
                      </View>
                    )}
                    {notif.meta.staffName && (
                      <View
                        style={[
                          styles.metaPill,
                          { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                        ]}
                      >
                        <Feather name="user-check" size={11} color="#0D9488" />
                        <Text style={[styles.metaPillText, { color: "#0D9488" }]}>
                          {notif.meta.staffName}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Bottom Quick Action Bar */}
                <View style={styles.cardFooter}>
                  {notif.actionRequired ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleQuickAction(notif)}
                      style={[
                        styles.quickActionButton,
                        {
                          backgroundColor:
                            notif.priority === "URGENT"
                              ? "#EF4444"
                              : brandPrimary,
                        },
                      ]}
                    >
                      <Feather
                        name={
                          notif.actionType === "INVESTIGATE_FRAUD"
                            ? "shield"
                            : notif.actionType === "APPROVE_PAYOUT"
                            ? "check-circle"
                            : "external-link"
                        }
                        size={13}
                        color="#FFFFFF"
                      />
                      <Text style={styles.quickActionButtonText}>
                        {notif.actionType === "INVESTIGATE_FRAUD"
                          ? "Investigate Scam"
                          : notif.actionType === "APPROVE_PAYOUT"
                          ? "Review Payout Request"
                          : notif.actionType === "REVIEW_LEAD"
                          ? "Review & Allocate Lead"
                          : "Take Action"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}

                  <View style={styles.cardFooterRight}>
                    {!isRead && (
                      <TouchableOpacity
                        onPress={() => handleMarkAsRead(notifId)}
                        style={styles.markReadIconBtn}
                      >
                        <Feather name="check" size={15} color={brandSecondary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDeleteNotification(notifId)}
                      style={styles.deleteIconBtn}
                    >
                      <Feather name="trash" size={14} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── ADVANCED FILTER MODAL ── */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.filterModalCard,
              { backgroundColor: bgCard, borderColor: borderCol },
            ]}
          >
            {/* Modal Header */}
            <View
              style={[
                styles.filterModalHeader,
                { borderBottomColor: borderCol },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Feather name="sliders" size={18} color={brandPrimary} />
                <Text style={[styles.filterModalTitle, { color: textPrimary }]}>
                  Advanced Notification Filters
                </Text>
              </View>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={22} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, gap: 20 }}
            >
              {/* 1. Panel Origin */}
              <View>
                <Text style={[styles.filterSectionTitle, { color: textPrimary }]}>
                  Originating Panel / Role
                </Text>
                <View style={styles.filterOptionsGrid}>
                  {(
                    [
                      { key: "ALL", label: "All Panels" },
                      { key: "VERIFICATION_STAFF", label: "Field Staff" },
                      { key: "BROKER_AGENT", label: "Broker / Agent" },
                      { key: "TENANT", label: "Tenant App" },
                      { key: "OWNER", label: "Owner Portal" },
                      { key: "SYSTEM_ADMIN", label: "Super Admin Core" },
                    ] as { key: PanelSource; label: string }[]
                  ).map((opt) => {
                    const isSelected = selectedPanel === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => setSelectedPanel(opt.key)}
                        style={[
                          styles.filterOptionPill,
                          {
                            backgroundColor: isSelected
                              ? brandPrimary
                              : isDark
                              ? "#1E293B"
                              : "#F1F5F9",
                            borderColor: isSelected ? brandPrimary : borderCol,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            { color: isSelected ? "#FFFFFF" : textSecondary },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. Notification Status */}
              <View>
                <Text style={[styles.filterSectionTitle, { color: textPrimary }]}>
                  Read / Priority Status
                </Text>
                <View style={styles.filterOptionsGrid}>
                  {(
                    [
                      { key: "ALL", label: "All Status" },
                      { key: "UNREAD", label: "Unread Only" },
                      { key: "READ", label: "Read Only" },
                      { key: "URGENT", label: "Urgent Priority Only" },
                    ] as { key: "ALL" | "UNREAD" | "READ" | "URGENT"; label: string }[]
                  ).map((opt) => {
                    const isSelected = selectedStatus === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => setSelectedStatus(opt.key)}
                        style={[
                          styles.filterOptionPill,
                          {
                            backgroundColor: isSelected
                              ? brandPrimary
                              : isDark
                              ? "#1E293B"
                              : "#F1F5F9",
                            borderColor: isSelected ? brandPrimary : borderCol,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            { color: isSelected ? "#FFFFFF" : textSecondary },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 3. Date Range */}
              <View>
                <Text style={[styles.filterSectionTitle, { color: textPrimary }]}>
                  Date Timeframe
                </Text>
                <View style={styles.filterOptionsGrid}>
                  {(
                    [
                      { key: "ALL_TIME", label: "All Time" },
                      { key: "TODAY", label: "Today (24h)" },
                      { key: "THIS_WEEK", label: "Past 7 Days" },
                      { key: "THIS_MONTH", label: "Past 30 Days" },
                    ] as { key: DateFilter; label: string }[]
                  ).map((opt) => {
                    const isSelected = selectedDateFilter === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => setSelectedDateFilter(opt.key)}
                        style={[
                          styles.filterOptionPill,
                          {
                            backgroundColor: isSelected
                              ? brandPrimary
                              : isDark
                              ? "#1E293B"
                              : "#F1F5F9",
                            borderColor: isSelected ? brandPrimary : borderCol,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            { color: isSelected ? "#FFFFFF" : textSecondary },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 4. Sort Order */}
              <View>
                <Text style={[styles.filterSectionTitle, { color: textPrimary }]}>
                  Sort Sequence
                </Text>
                <View style={styles.filterOptionsGrid}>
                  {(
                    [
                      { key: "NEWEST", label: "Newest First" },
                      { key: "OLDEST", label: "Oldest First" },
                      { key: "PRIORITY", label: "Highest Priority" },
                      { key: "UNREAD_FIRST", label: "Unread on Top" },
                    ] as { key: SortOption; label: string }[]
                  ).map((opt) => {
                    const isSelected = selectedSort === opt.key;
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => setSelectedSort(opt.key)}
                        style={[
                          styles.filterOptionPill,
                          {
                            backgroundColor: isSelected
                              ? brandPrimary
                              : isDark
                              ? "#1E293B"
                              : "#F1F5F9",
                            borderColor: isSelected ? brandPrimary : borderCol,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            { color: isSelected ? "#FFFFFF" : textSecondary },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Buttons */}
            <View
              style={[
                styles.filterModalFooter,
                { borderTopColor: borderCol },
              ]}
            >
              <TouchableOpacity
                onPress={resetAllFilters}
                style={[
                  styles.filterResetBtn,
                  { borderColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                ]}
              >
                <Text style={[styles.filterResetBtnText, { color: textPrimary }]}>
                  Reset All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                style={[styles.filterApplyBtn, { backgroundColor: brandPrimary }]}
              >
                <Text style={styles.filterApplyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── NOTIFICATION DETAIL INSPECTOR MODAL ── */}
      <Modal
        visible={!!activeDetailNotif}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActiveDetailNotif(null)}
      >
        <View style={styles.modalOverlay}>
          {activeDetailNotif && (
            <View
              style={[
                styles.detailModalCard,
                { backgroundColor: bgCard, borderColor: borderCol },
              ]}
            >
              {/* Detail Header */}
              <View
                style={[
                  styles.detailModalHeader,
                  { borderBottomColor: borderCol },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailModalTitle, { color: textPrimary }]}>
                    Notification Details
                  </Text>
                  <Text style={[styles.detailModalTime, { color: textSecondary }]}>
                    Received {new Date(activeDetailNotif.createdAt).toLocaleString("en-IN")}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setActiveDetailNotif(null)}>
                  <Ionicons name="close" size={22} color={textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 20, gap: 16 }}
              >
                {/* Title */}
                <Text style={[styles.detailCardTitle, { color: textPrimary }]}>
                  {activeDetailNotif.title}
                </Text>

                {/* Message */}
                <Text style={[styles.detailCardMsg, { color: textSecondary }]}>
                  {activeDetailNotif.message}
                </Text>

                {/* Key Meta Details */}
                {activeDetailNotif.meta && (
                  <View
                    style={[
                      styles.detailMetaBox,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                        borderColor: borderCol,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.detailMetaBoxTitle, { color: textPrimary }]}
                    >
                      Associated Event Payload:
                    </Text>

                    {Object.entries(activeDetailNotif.meta).map(([k, v]) => {
                      if (!v || typeof v === "object") return null;
                      return (
                        <View key={k} style={styles.detailMetaRow}>
                          <Text
                            style={[
                              styles.detailMetaKey,
                              { color: textSecondary },
                            ]}
                          >
                            {k.replace(/([A-Z])/g, " $1").toUpperCase()}:
                          </Text>
                          <Text
                            style={[
                              styles.detailMetaVal,
                              { color: textPrimary },
                            ]}
                          >
                            {String(v)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </ScrollView>

              {/* Detail Modal Action Footer */}
              <View
                style={[
                  styles.detailModalFooter,
                  { borderTopColor: borderCol },
                ]}
              >
                <TouchableOpacity
                  onPress={async () => {
                    await Clipboard.setStringAsync(
                      `${activeDetailNotif.title}\n\n${activeDetailNotif.message}`
                    );
                    Alert.alert("Copied", "Notification copied to clipboard.");
                  }}
                  style={[
                    styles.detailActionBtn,
                    { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                  ]}
                >
                  <Feather name="copy" size={15} color={textPrimary} />
                  <Text style={[styles.detailActionBtnText, { color: textPrimary }]}>
                    Copy
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    Share.share({
                      message: `${activeDetailNotif.title}\n\n${activeDetailNotif.message}`,
                    });
                  }}
                  style={[
                    styles.detailActionBtn,
                    { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                  ]}
                >
                  <Feather name="share-2" size={15} color={textPrimary} />
                  <Text style={[styles.detailActionBtnText, { color: textPrimary }]}>
                    Share
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    handleDeleteNotification(activeDetailNotif.id || activeDetailNotif._id || "");
                  }}
                  style={[styles.detailActionBtn, { backgroundColor: "#FEE2E2" }]}
                >
                  <Feather name="trash-2" size={15} color="#EF4444" />
                  <Text style={[styles.detailActionBtnText, { color: "#EF4444" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );

  if (isModal) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={onClose}
      >
        {Content}
      </Modal>
    );
  }

  return <SafeAreaView style={{ flex: 1 }}>{Content}</SafeAreaView>;
};

// ── MODAL VARIANT EXPORT ────────────────────────────────────────────────────────

export interface SuperAdminNotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SuperAdminNotificationModal: React.FC<
  SuperAdminNotificationModalProps
> = ({ visible, onClose }) => {
  return (
    <SuperAdminNotificationScreen
      isModal={true}
      visible={visible}
      onClose={onClose}
    />
  );
};

// ── STYLES ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  crownIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: "600",
  },
  socketIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  unreadCountPill: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 12,
  },
  unreadCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: "100%",
  },
  filterToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeFilterCountDot: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activeFilterCountDotText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  metricsContainer: {
    gap: 10,
    paddingBottom: 10,
  },
  metricCard: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  categoryChipsContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryChipText: {
    fontSize: 12,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  resultCountText: {
    fontSize: 12,
  },
  clearFiltersChip: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clearFiltersChipText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "700",
  },
  toolbarActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  toolbarActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  resetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  panelBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  panelBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgentPulseBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  urgentPulseText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  timeAgoText: {
    fontSize: 11,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardMessage: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(100, 116, 139, 0.2)",
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  quickActionButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  cardFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  markReadIconBtn: {
    padding: 6,
  },
  deleteIconBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  filterModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    minHeight: "50%",
    borderWidth: 1,
  },
  filterModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  filterModalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  filterOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterOptionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  filterModalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  filterResetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterResetBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  filterApplyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterApplyBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  detailModalCard: {
    margin: 20,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: "80%",
    overflow: "hidden",
  },
  detailModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  detailModalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  detailModalTime: {
    fontSize: 11,
    marginTop: 2,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
  },
  detailCardMsg: {
    fontSize: 13,
    lineHeight: 20,
  },
  detailMetaBox: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  detailMetaBoxTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  detailMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailMetaKey: {
    fontSize: 11,
    fontWeight: "700",
  },
  detailMetaVal: {
    fontSize: 12,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  detailModalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  detailActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  detailActionBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

export default SuperAdminNotificationScreen;
