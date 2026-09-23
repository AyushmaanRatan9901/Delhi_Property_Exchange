import { Feather, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SuperAdminCreateUserModal,
  SuperAdminKycModal,
  SuperAdminNotificationModal,
  SuperAdminSideMenu,
} from "../../../components/SuperAdminComponent";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";

const { width } = Dimensions.get("window");

export type RoleType =
  | "ALL"
  | "FIELD_AGENT"
  | "DEALER"
  | "FIELD_STAFF"
  | "TELE_CALLER"
  | "TENANT"
  | "OWNER"
  | "ADMIN"
  | "super_admin"
  | "field_agent"
  | "dealer"
  | "broker"
  | "field_staff"
  | "tele_caller"
  | "tenant"
  | "owner"
  | "admin";

export interface UserKyc {
  status?: "VERIFIED" | "UNDER_REVIEW" | "REJECTED" | string;
  submittedAt?: string;
  documentUrl?: string;
  aadhaarNumber?: string;
  panNumber?: string;
}

export interface UserRecord {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  staffId?: string;
  isActive: boolean;
  commissionRate?: number;
  kyc?: UserKyc;
  createdAt?: string;
  updatedAt?: string;
}

interface RoleBadgeStyle {
  bg: string;
  text: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

interface KycBadgeStyle {
  bg: string;
  text: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
}

const getRoleBadgeStyle = (role: string): RoleBadgeStyle => {
  switch (role?.toLowerCase()) {
    case "field_agent":
      return { bg: "#CCFBF1", text: "#0F766E", label: "Field Agent", icon: "user-check" };
    case "dealer":
    case "broker":
      return { bg: "#EDE9FE", text: "#6D28D9", label: "Dealer / Broker", icon: "briefcase" };
    case "field_staff":
      return { bg: "#DBEAFE", text: "#1E40AF", label: "Verification Staff", icon: "shield" };
    case "tele_caller":
      return { bg: "#FEF3C7", text: "#92400E", label: "Tele-caller", icon: "phone-call" };
    case "tenant":
      return { bg: "#E0F2FE", text: "#0369A1", label: "Tenant", icon: "home" };
    case "owner":
    case "landlord":
      return { bg: "#FCE7F3", text: "#BE185D", label: "Owner / Landlord", icon: "key" };
    case "admin":
      return { bg: "#FEE2E2", text: "#991B1B", label: "Admin", icon: "lock" };
    case "super_admin":
      return { bg: "#FEF2F2", text: "#B91C1C", label: "Super Admin", icon: "award" };
    default:
      return { bg: "#F1F5F9", text: "#475569", label: role || "User", icon: "user" };
  }
};

const getKycBadge = (status?: string): KycBadgeStyle => {
  switch (status?.toUpperCase()) {
    case "VERIFIED":
      return { bg: "#DCFCE7", text: "#166534", icon: "check-circle", label: "KYC Verified" };
    case "UNDER_REVIEW":
      return { bg: "#FEF3C7", text: "#92400E", icon: "clock", label: "Under Review" };
    case "REJECTED":
      return { bg: "#FEE2E2", text: "#991B1B", icon: "x-circle", label: "KYC Rejected" };
    default:
      return { bg: "#F1F5F9", text: "#64748B", icon: "alert-circle", label: "Pending Upload" };
  }
};

export default function SuperAdminUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Modals state
  const [isSideMenuVisible, setIsSideMenuVisible] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [selectedUserForKyc, setSelectedUserForKyc] = useState<UserRecord | null>(null);
  const [isKycModalVisible, setIsKycModalVisible] = useState<boolean>(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState<boolean>(false);

  // Commission editing state
  const [editingCommUserId, setEditingCommUserId] = useState<string | null>(null);
  const [tempCommRate, setTempCommRate] = useState<string>("");

  // Debounce search query to prevent keyboard hitching on large lists
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 200);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    try {
      const roleParam = selectedRole !== "ALL" ? `?role=${selectedRole.toLowerCase()}` : "";
      const res = await apiClient.get(`/auth/users${roleParam}`);
      if (res.data?.data?.users) {
        setUsers(res.data.data.users);
      } else if (Array.isArray(res.data?.users)) {
        setUsers(res.data.users);
      }
    } catch (e: any) {
      console.warn("Could not load users:", e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: UserRecord) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const newStatus = !user.isActive;
    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
    );

    try {
      await apiClient.put(`/auth/users/${user._id}/status`);
    } catch (e: any) {
      // Rollback on failure
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: !newStatus } : u))
      );
      Alert.alert("Status Error", e?.response?.data?.message || e.message || "Failed to update user status");
    }
  };

  const handleSaveCommission = async (user: UserRecord) => {
    const rate = Number(tempCommRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      Alert.alert("Invalid Rate", "Enter a valid percentage between 0 and 100.");
      return;
    }

    try {
      await apiClient.put(`/auth/users/${user._id}/commission`, {
        commissionRate: rate,
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, commissionRate: rate } : u))
      );
      setEditingCommUserId(null);
      Alert.alert("Updated", `Commission rate set to ${rate}% for ${user.name}`);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || e.message || "Failed to update commission rate");
    }
  };

  const handleDeleteUser = (user: UserRecord) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    Alert.alert(
      "Permanently Delete User",
      `Are you sure you want to delete user ${user.name} (${user.staffId || user.role})?\n\nThis will remove their account and system access completely.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete User",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/auth/users/${user._id}`);
              try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch {}
              setUsers((prev) => prev.filter((u) => u._id !== user._id));
              Alert.alert("Deleted", `User account ${user.name} has been permanently deleted.`);
            } catch (err: any) {
              Alert.alert("Delete Error", err?.response?.data?.message || err.message || "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone?: string) => {
    if (phone) Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`).catch(() => {});
  };

  const handleWhatsApp = (phone?: string) => {
    if (phone) {
      const clean = phone.replace(/\D/g, "");
      const full = clean.length === 10 ? `91${clean}` : clean;
      Linking.openURL(
        `whatsapp://send?phone=${full}&text=Hello%20from%20Delhi%20Property%20Exchange%20SuperAdmin`
      ).catch(() => {});
    }
  };

  const filteredUsers = useMemo(() => {
    if (!debouncedQuery) return users;
    return users.filter((u) => {
      return (
        (u.name && u.name.toLowerCase().includes(debouncedQuery)) ||
        (u.phone && u.phone.includes(debouncedQuery)) ||
        (u.staffId && u.staffId.toLowerCase().includes(debouncedQuery)) ||
        (u.email && u.email.toLowerCase().includes(debouncedQuery)) ||
        (u.role && u.role.toLowerCase().includes(debouncedQuery))
      );
    });
  }, [users, debouncedQuery]);

  const stats = useMemo(() => {
    return {
      agentCount: users.filter((u) => u.role === "field_agent").length,
      dealerCount: users.filter((u) => u.role === "dealer" || u.role === "broker").length,
      staffCount: users.filter((u) => u.role === "field_staff" || u.role === "tele_caller").length,
      pendingKycCount: users.filter((u) => u.kyc?.status === "UNDER_REVIEW").length,
      tenantCount: users.filter((u) => u.role === "tenant").length,
    };
  }, [users]);

  const filterOptions = useMemo(
    () => [
      { id: "ALL", label: "All Directory", icon: "users" as const },
      { id: "FIELD_AGENT", label: "Agents", icon: "user-check" as const },
      { id: "DEALER", label: "Dealers / Brokers", icon: "briefcase" as const },
      { id: "FIELD_STAFF", label: "Field Staff", icon: "shield" as const },
      { id: "TELE_CALLER", label: "Tele-callers", icon: "phone-call" as const },
      { id: "TENANT", label: "Tenants", icon: "home" as const },
      { id: "OWNER", label: "Owners", icon: "key" as const },
      { id: "ADMIN", label: "Admins", icon: "lock" as const },
    ],
    []
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle="light-content" />

      {/* Modern Gradient Header */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top + 8, 32) }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              onPress={() => setIsSideMenuVisible(true)}
              style={styles.hamburgerBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="menu" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.livePulseDot} />
                <Text style={styles.panelBadge}>SUPER ADMIN CONSOLE</Text>
              </View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                User & Access Control
              </Text>
            </View>
          </View>

          <View style={styles.headerActionGroup}>
            <TouchableOpacity
              onPress={() => setIsNotificationModalVisible(true)}
              style={styles.headerIconCircle}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="bell" size={17} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsCreateModalVisible(true)}
              style={styles.addUserHeaderBtn}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#FFFFFF", "#F0FDFA"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addUserGradientWrap}
              >
                <Feather name="user-plus" size={14} color="#0D9488" />
                <Text style={styles.addUserHeaderBtnText}>Add User</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>
          Manage team roles, toggle system access, edit commission rates & review KYC
        </Text>
      </LinearGradient>

      {/* Content Area */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 85, 115) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {/* Metric Quick Stats Carousel / Grid */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.statIconBadge, { backgroundColor: "rgba(13, 148, 136, 0.12)" }]}>
              <Feather name="user-check" size={14} color="#0D9488" />
            </View>
            <Text style={[styles.statValue, { color: "#0D9488" }]}>{stats.agentCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Agents</Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.statIconBadge, { backgroundColor: "rgba(139, 92, 246, 0.12)" }]}>
              <Feather name="briefcase" size={14} color="#8B5CF6" />
            </View>
            <Text style={[styles.statValue, { color: "#8B5CF6" }]}>{stats.dealerCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dealers</Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.statIconBadge, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}>
              <Feather name="shield" size={14} color="#3B82F6" />
            </View>
            <Text style={[styles.statValue, { color: "#3B82F6" }]}>{stats.staffCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Staff</Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: stats.pendingKycCount > 0 ? "#F59E0B" : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.statIconBadge,
                {
                  backgroundColor: stats.pendingKycCount > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(100, 116, 139, 0.1)",
                },
              ]}
            >
              <Feather
                name={stats.pendingKycCount > 0 ? "alert-triangle" : "check-circle"}
                size={14}
                color={stats.pendingKycCount > 0 ? "#D97706" : "#64748B"}
              />
            </View>
            <Text
              style={[
                styles.statValue,
                { color: stats.pendingKycCount > 0 ? "#D97706" : colors.textSecondary },
              ]}
            >
              {stats.pendingKycCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending KYC</Text>
          </View>
        </View>

        {/* Elevated Search Bar */}
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
            style={[styles.searchInput, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
            placeholder="Search by name, phone, staff ID, or role..."
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={styles.clearSearchBtn}>
                <Feather name="x" size={12} color="#64748B" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Role Filter Chips Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsRow}
        >
          {filterOptions.map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedRole(r.id as RoleType);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? "#0D9488" : isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: isSelected ? "#0D9488" : colors.border,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Feather
                  name={r.icon}
                  size={12}
                  color={isSelected ? "#FFFFFF" : isDark ? "#94A3B8" : "#64748B"}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? "#FFFFFF" : colors.textSecondary },
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Directory Section Header with View Toggle */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              User Directory
            </Text>
            <View style={[styles.countBadge, { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" }]}>
              <Text style={[styles.countBadgeText, { color: isDark ? "#94A3B8" : "#475569" }]}>
                {filteredUsers.length}
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setViewMode("list");
              }}
              style={[styles.viewModeBtn, viewMode === "list" && styles.viewModeBtnActive]}
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setViewMode("grid");
              }}
              style={[styles.viewModeBtn, viewMode === "grid" && styles.viewModeBtnActive]}
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

        {/* Loading / Empty / Directory Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#0D9488" size="large" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading directory accounts...
            </Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: colors.border,
              },
            ]}
          >
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <Feather name="users" size={32} color="#94A3B8" />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              No Users Found
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              No accounts matched your keyword or selected role. Try resetting your search filters.
            </Text>
            {debouncedQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.resetFilterBtn}
              >
                <Text style={styles.resetFilterBtnText}>Clear Search Filter</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : viewMode === "grid" ? (
          <View style={styles.gridContainer}>
            {filteredUsers.map((user) => (
              <UserGridItem
                key={user._id}
                user={user}
                isDark={isDark}
                colors={colors}
                onSelectKyc={() => {
                  setSelectedUserForKyc(user);
                  setIsKycModalVisible(true);
                }}
                onToggleStatus={() => handleToggleStatus(user)}
                onDelete={() => handleDeleteUser(user)}
                onCall={() => handleCall(user.phone)}
                onWhatsApp={() => handleWhatsApp(user.phone)}
                onNavigateDossier={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({
                    pathname: "/SuperAdminPanel/user-detail" as any,
                    params: {
                      userId: user._id,
                      role: user.role,
                      userName: user.name,
                    },
                  });
                }}
              />
            ))}
          </View>
        ) : (
          filteredUsers.map((user) => (
            <UserListItem
              key={user._id}
              user={user}
              isDark={isDark}
              colors={colors}
              isEditingCommission={editingCommUserId === user._id}
              tempCommRate={tempCommRate}
              setTempCommRate={setTempCommRate}
              onStartEditCommission={() => {
                setEditingCommUserId(user._id);
                setTempCommRate(String(user.commissionRate ?? 15));
              }}
              onSaveCommission={() => handleSaveCommission(user)}
              onCancelCommission={() => setEditingCommUserId(null)}
              onSelectKyc={() => {
                setSelectedUserForKyc(user);
                setIsKycModalVisible(true);
              }}
              onToggleStatus={() => handleToggleStatus(user)}
              onDelete={() => handleDeleteUser(user)}
              onCall={() => handleCall(user.phone)}
              onWhatsApp={() => handleWhatsApp(user.phone)}
              onNavigateDossier={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/SuperAdminPanel/user-detail" as any,
                  params: {
                    userId: user._id,
                    role: user.role,
                    userName: user.name,
                  },
                });
              }}
            />
          ))
        )}
      </ScrollView>

      {/* Side Bar Navigation Menu */}
      <SuperAdminSideMenu
        visible={isSideMenuVisible}
        onClose={() => setIsSideMenuVisible(false)}
        onCreateUserPress={() => setIsCreateModalVisible(true)}
        onNotificationPress={() => setIsNotificationModalVisible(true)}
      />

      {/* Notifications Management Modal */}
      <SuperAdminNotificationModal
        visible={isNotificationModalVisible}
        onClose={() => setIsNotificationModalVisible(false)}
      />

      {/* Account Provisioning Modal */}
      <SuperAdminCreateUserModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={fetchUsers}
      />

      {/* KYC Inspection Modal */}
      <SuperAdminKycModal
        visible={isKycModalVisible}
        user={selectedUserForKyc}
        onClose={() => setIsKycModalVisible(false)}
        onSuccess={fetchUsers}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Components (Memoized for list scrolling performance)
// ─────────────────────────────────────────────────────────────────────────────

interface SubComponentProps {
  user: UserRecord;
  isDark: boolean;
  colors: any;
  onSelectKyc: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
  onNavigateDossier: () => void;
}

const UserGridItem = memo(
  ({
    user,
    isDark,
    colors,
    onSelectKyc,
    onToggleStatus,
    onDelete,
    onCall,
    onWhatsApp,
    onNavigateDossier,
  }: SubComponentProps) => {
    const roleBadge = getRoleBadgeStyle(user.role);
    const kycBadge = getKycBadge(user.kyc?.status);
    const isAgentOrDealer = ["field_agent", "dealer", "broker"].includes(user.role);

    return (
      <View
        style={[
          styles.gridUserCard,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderColor: colors.border,
            opacity: user.isActive ? 1 : 0.75,
          },
        ]}
      >
        {/* Grid Card Top Header */}
        <View style={styles.gridCardTop}>
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.gridAvatar,
                { backgroundColor: user.isActive ? "#0D9488" : "#64748B" },
              ]}
            >
              <Text style={styles.gridAvatarText}>
                {(user.name || "U").slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.gridStatusDot,
                { backgroundColor: user.isActive ? "#10B981" : "#94A3B8" },
              ]}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <View
              style={[
                styles.rolePill,
                {
                  backgroundColor: roleBadge.bg,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                },
              ]}
            >
              <Text style={[styles.rolePillText, { color: roleBadge.text, fontSize: 8.5 }]} numberOfLines={1}>
                {roleBadge.label}
              </Text>
            </View>
            {user.role !== "super_admin" && (
              <TouchableOpacity
                onPress={onDelete}
                style={styles.deleteGridBtn}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="trash-2" size={12} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Identity Details */}
        <TouchableOpacity activeOpacity={0.7} onPress={onNavigateDossier} style={{ marginTop: 2 }}>
          <Text
            style={[styles.gridUserName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
            numberOfLines={1}
          >
            {user.name}
          </Text>
          <Text style={[styles.gridStaffIdText, { color: colors.textSecondary }]} numberOfLines={1}>
            ID: {user.staffId || user._id?.slice(-5)?.toUpperCase() || "N/A"}
          </Text>
        </TouchableOpacity>

        {/* Contact Strip */}
        <View style={[styles.gridContactRow, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
          <Text style={[styles.gridPhoneText, { color: "#0D9488" }]} numberOfLines={1}>
            +91 {user.phone}
          </Text>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <TouchableOpacity onPress={onCall} style={styles.gridCommBtn}>
              <Feather name="phone" size={10} color="#0D9488" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onWhatsApp} style={styles.gridCommBtn}>
              <FontAwesome5 name="whatsapp" size={10} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Toggle & KYC Tag */}
        <View style={styles.gridMetaRow}>
          <TouchableOpacity
            onPress={onSelectKyc}
            style={[styles.gridKycBadge, { backgroundColor: kycBadge.bg }]}
          >
            <Feather name={kycBadge.icon} size={10} color={kycBadge.text} />
            <Text style={[styles.gridKycText, { color: kycBadge.text }]} numberOfLines={1}>
              {user.kyc?.status === "VERIFIED" ? "KYC OK" : user.kyc?.status || "NO KYC"}
            </Text>
          </TouchableOpacity>

          <View style={styles.gridSwitchWrap}>
            <Switch
              value={user.isActive}
              onValueChange={onToggleStatus}
              trackColor={{ false: "#CBD5E1", true: "#0D9488" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Commission Indicator */}
        {isAgentOrDealer && (
          <View style={styles.gridCommRow}>
            <Ionicons name="pricetag-outline" size={11} color="#0D9488" />
            <Text style={[styles.gridCommText, { color: colors.textSecondary }]}>
              {user.commissionRate || 0}% Comm.
            </Text>
          </View>
        )}

        {/* Dossier Link Action */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNavigateDossier}
          style={[styles.gridDossierBtn, { backgroundColor: isDark ? "#0F172A" : "#F0FDFA" }]}
        >
          <Text style={[styles.gridDossierBtnText, { color: "#0D9488" }]}>View Dossier</Text>
          <Feather name="arrow-right" size={11} color="#0D9488" />
        </TouchableOpacity>
      </View>
    );
  }
);

interface ListComponentProps extends SubComponentProps {
  isEditingCommission: boolean;
  tempCommRate: string;
  setTempCommRate: (val: string) => void;
  onStartEditCommission: () => void;
  onSaveCommission: () => void;
  onCancelCommission: () => void;
}

const UserListItem = memo(
  ({
    user,
    isDark,
    colors,
    isEditingCommission,
    tempCommRate,
    setTempCommRate,
    onStartEditCommission,
    onSaveCommission,
    onCancelCommission,
    onSelectKyc,
    onToggleStatus,
    onDelete,
    onCall,
    onWhatsApp,
    onNavigateDossier,
  }: ListComponentProps) => {
    const roleBadge = getRoleBadgeStyle(user.role);
    const kycBadge = getKycBadge(user.kyc?.status);
    const isAgentOrDealer = ["field_agent", "dealer", "broker"].includes(user.role);

    return (
      <View
        style={[
          styles.userCard,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderColor: colors.border,
            opacity: user.isActive ? 1 : 0.75,
          },
        ]}
      >
        {/* User Top Row - Clickable to Dossier */}
        <TouchableOpacity activeOpacity={0.7} onPress={onNavigateDossier} style={styles.userCardTop}>
          <View style={styles.avatarWrapper}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: user.isActive ? "#0D9488" : "#64748B" },
              ]}
            >
              <Text style={styles.avatarText}>
                {(user.name || "U").slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: user.isActive ? "#10B981" : "#94A3B8" },
              ]}
            />
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={[styles.userName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {user.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={[styles.rolePill, { backgroundColor: roleBadge.bg }]}>
                  <Feather name={roleBadge.icon} size={10} color={roleBadge.text} style={{ marginRight: 3 }} />
                  <Text style={[styles.rolePillText, { color: roleBadge.text }]}>
                    {roleBadge.label}
                  </Text>
                </View>
                {user.role !== "super_admin" && (
                  <TouchableOpacity
                    onPress={onDelete}
                    style={styles.deleteUserBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="trash-2" size={13} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 3,
              }}
            >
              <Text style={[styles.staffIdText, { color: colors.textSecondary }]}>
                ID: {user.staffId || user._id.slice(-6).toUpperCase()} • Joined:{" "}
                {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
              <Feather name="chevron-right" size={15} color="#0D9488" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Contact Strip & Active Toggle */}
        <View style={[styles.contactStrip, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.phoneText, { color: "#0D9488" }]}>+91 {user.phone}</Text>
            {user.email ? (
              <Text style={[styles.emailText, { color: colors.textMuted }]} numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>

          <View style={styles.commGroup}>
            <TouchableOpacity onPress={onCall} style={styles.commIconBtn}>
              <Feather name="phone" size={13} color="#0D9488" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onWhatsApp} style={styles.commIconBtn}>
              <FontAwesome5 name="whatsapp" size={13} color="#10B981" />
            </TouchableOpacity>
          </View>

          <View style={styles.switchGroup}>
            <Text style={[styles.switchLabel, { color: user.isActive ? "#10B981" : "#EF4444" }]}>
              {user.isActive ? "ACTIVE" : "INACTIVE"}
            </Text>
            <Switch
              value={user.isActive}
              onValueChange={onToggleStatus}
              trackColor={{ false: "#CBD5E1", true: "#0D9488" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* KYC & Commission Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={onSelectKyc}
            style={[styles.kycReviewBtn, { backgroundColor: kycBadge.bg }]}
          >
            <Feather name={kycBadge.icon} size={13} color={kycBadge.text} />
            <Text style={[styles.kycReviewBtnText, { color: kycBadge.text }]}>
              KYC: {kycBadge.label}
            </Text>
            <Feather name="chevron-right" size={13} color={kycBadge.text} />
          </TouchableOpacity>

          {isAgentOrDealer && (
            <View style={styles.commissionWrap}>
              {isEditingCommission ? (
                <View style={styles.editCommRow}>
                  <TextInput
                    style={[
                      styles.commInput,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                        color: isDark ? "#FFFFFF" : "#0F172A",
                        borderColor: "#0D9488",
                      },
                    ]}
                    keyboardType="numeric"
                    value={tempCommRate}
                    onChangeText={setTempCommRate}
                    maxLength={3}
                  />
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>%</Text>
                  <TouchableOpacity onPress={onSaveCommission} style={styles.saveCommBtn}>
                    <Feather name="check" size={13} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={onCancelCommission} style={styles.cancelCommBtn}>
                    <Feather name="x" size={13} color="#64748B" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={onStartEditCommission}
                  style={[styles.commRatePill, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                >
                  <Ionicons name="pricetag-outline" size={13} color="#0D9488" />
                  <Text style={[styles.commRateText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {user.commissionRate || 0}% Comm.
                  </Text>
                  <Feather name="edit-2" size={11} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Dossier Navigation Footer Strip */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onNavigateDossier}
          style={[styles.dossierFooterStrip, { backgroundColor: isDark ? "#0F172A" : "#F0FDFA" }]}
        >
          <Feather name="file-text" size={13} color="#0D9488" />
          <Text style={[styles.dossierFooterText, { color: "#0D9488" }]}>
            View Activity Dossier, Properties & Financials
          </Text>
          <Feather name="arrow-right" size={13} color="#0D9488" style={{ marginLeft: "auto" }} />
        </TouchableOpacity>
      </View>
    );
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerActionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2DD4BF",
  },
  panelBadge: {
    color: "#99F6E4",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  addUserHeaderBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addUserGradientWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  addUserHeaderBtnText: {
    color: "#0D9488",
    fontSize: 12,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#CCFBF1",
    fontSize: 11.5,
    marginTop: 8,
    lineHeight: 16,
    opacity: 0.95,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
    fontWeight: "500",
  },
  clearSearchBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(100, 116, 139, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
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
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  viewModeToggle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  viewModeBtn: {
    width: 30,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  viewModeBtnActive: {
    backgroundColor: "#0D9488",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    padding: 32,
    borderRadius: 20,
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
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  resetFilterBtn: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(13, 148, 136, 0.12)",
  },
  resetFilterBtnText: {
    color: "#0D9488",
    fontSize: 12,
    fontWeight: "700",
  },
  userCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  userCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 14.5,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  dossierFooterStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 2,
    gap: 6,
  },
  dossierFooterText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  deleteUserBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  staffIdText: {
    fontSize: 11,
    marginTop: 2,
  },
  contactStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
  },
  phoneText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  emailText: {
    fontSize: 10.5,
    marginTop: 1,
  },
  commGroup: {
    flexDirection: "row",
    gap: 6,
    marginRight: 8,
  },
  commIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(13, 148, 136, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  switchGroup: {
    alignItems: "flex-end",
  },
  switchLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  kycReviewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  kycReviewBtnText: {
    fontSize: 11,
    fontWeight: "700",
    flex: 1,
    marginLeft: 6,
  },
  commissionWrap: {
    alignItems: "flex-end",
  },
  commRatePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  commRateText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  editCommRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 12,
    width: 42,
    textAlign: "center",
    fontWeight: "700",
  },
  saveCommBtn: {
    backgroundColor: "#0D9488",
    padding: 6,
    borderRadius: 6,
  },
  cancelCommBtn: {
    padding: 6,
  },

  // Grid Specific Styles
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  gridUserCard: {
    width: "48.5%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    justifyContent: "space-between",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  gridCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  gridAvatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  gridStatusDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  deleteGridBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridUserName: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  gridStaffIdText: {
    fontSize: 9.5,
    marginTop: 1,
  },
  gridContactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },
  gridPhoneText: {
    fontSize: 10.5,
    fontWeight: "700",
    flex: 1,
    marginRight: 4,
  },
  gridCommBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridKycBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3,
    maxWidth: "58%",
  },
  gridKycText: {
    fontSize: 8.5,
    fontWeight: "800",
  },
  gridSwitchWrap: {
    transform: [{ scaleX: 0.65 }, { scaleY: 0.65 }],
    marginRight: -7,
  },
  gridCommRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: -2,
  },
  gridCommText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  gridDossierBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  gridDossierBtnText: {
    fontSize: 10.5,
    fontWeight: "800",
  },
});
