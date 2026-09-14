import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  StatusBar,
  Linking,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";
import {
  SuperAdminCreateUserModal,
  SuperAdminKycModal,
  SuperAdminSideMenu,
} from "../../../components/SuperAdminComponent";

export default function SuperAdminUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals
  const [isSideMenuVisible, setIsSideMenuVisible] = useState<boolean>(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [selectedUserForKyc, setSelectedUserForKyc] = useState<any>(null);
  const [isKycModalVisible, setIsKycModalVisible] = useState<boolean>(false);

  // Commission edit state
  const [editingCommUserId, setEditingCommUserId] = useState<string | null>(null);
  const [tempCommRate, setTempCommRate] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    try {
      const roleParam = selectedRole !== "ALL" ? "?role=" + selectedRole.toLowerCase() : "";
      const res = await apiClient.get("/auth/users" + roleParam);
      if (res.data?.data?.users) {
        setUsers(res.data.data.users);
      }
    } catch (e: any) {
      console.warn("Could not load users:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleToggleStatus = async (user: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const newStatus = !user.isActive;
    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
    );

    try {
      await apiClient.put("/auth/users/" + user._id + "/status");
    } catch (e: any) {
      // Revert on failure
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: !newStatus } : u))
      );
      Alert.alert("Status Error", e.message || "Failed to update user status");
    }
  };

  const handleSaveCommission = async (user: any) => {
    const rate = Number(tempCommRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      Alert.alert("Invalid Rate", "Enter a valid percentage between 0 and 100.");
      return;
    }

    try {
      await apiClient.put("/auth/users/" + user._id + "/commission", {
        commissionRate: rate,
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, commissionRate: rate } : u))
      );
      setEditingCommUserId(null);
      Alert.alert("Updated", "Commission rate set to " + rate + "% for " + user.name);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update commission rate");
    }
  };

  const handleDeleteUser = (user: any) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}

    Alert.alert(
      "Permanently Delete User",
      "Are you sure you want to delete user " + user.name + " (" + (user.staffId || user.role) + ")?\n\nThis will remove their account and system access completely.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete User",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete("/auth/users/" + user._id);
              try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              } catch {}
              setUsers((prev) => prev.filter((u) => u._id !== user._id));
              Alert.alert("Deleted", "User account " + user.name + " has been permanently deleted.");
            } catch (err: any) {
              Alert.alert("Delete Error", err.message || "Failed to delete user");
            }
          },
        },
      ]
    );
  };

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL("tel:" + phone.replace(/\s+/g, ""));
  };

  const handleWhatsApp = (phone: string) => {
    if (phone) {
      const clean = phone.replace(/\D/g, "");
      const full = clean.length === 10 ? "91" + clean : clean;
      Linking.openURL("whatsapp://send?phone=" + full + "&text=Hello%20from%20Delhi%20Property%20Exchange%20SuperAdmin");
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.staffId && u.staffId.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const getRoleBadgeStyle = (role: string) => {
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
      case "admin":
        return { bg: "#FEE2E2", text: "#991B1B", label: "Admin" };
      default:
        return { bg: "#F1F5F9", text: "#475569", label: role };
    }
  };

  const getKycBadge = (status?: string) => {
    switch (status) {
      case "VERIFIED":
        return { bg: "#DCFCE7", text: "#166534", icon: "check-circle" };
      case "UNDER_REVIEW":
        return { bg: "#FEF3C7", text: "#92400E", icon: "clock" };
      case "REJECTED":
        return { bg: "#FEE2E2", text: "#991B1B", icon: "x-circle" };
      default:
        return { bg: "#F1F5F9", text: "#64748B", icon: "alert-circle" };
    }
  };

  const agentCount = users.filter((u) => u.role === "field_agent").length;
  const dealerCount = users.filter((u) => u.role === "dealer" || u.role === "broker").length;
  const staffCount = users.filter((u) => u.role === "field_staff" || u.role === "tele_caller").length;
  const pendingKycCount = users.filter((u) => u.kyc?.status === "UNDER_REVIEW").length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top + 10, 36) }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
            <TouchableOpacity
              onPress={() => setIsSideMenuVisible(true)}
              style={styles.hamburgerBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="menu" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.panelBadge}>SUPER ADMIN CONTROL</Text>
              <Text style={styles.headerTitle}>User & Role Management</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setIsCreateModalVisible(true)}
            style={styles.addUserHeaderBtn}
          >
            <Feather name="user-plus" size={16} color="#0D9488" />
            <Text style={styles.addUserHeaderBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Provision staff, toggle active access, edit commissions, delete accounts & review KYC
        </Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 85, 115) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {/* Metric Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: "#0D9488" }]}>{agentCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Field Agents</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: "#8B5CF6" }]}>{dealerCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dealers / Brokers</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: "#3B82F6" }]}>{staffCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Staff Team</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: pendingKycCount > 0 ? "#F59E0B" : colors.border }]}>
            <Text style={[styles.statValue, { color: pendingKycCount > 0 ? "#D97706" : "#64748B" }]}>{pendingKycCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending KYC</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
          <Feather name="search" size={18} color="#64748B" />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
            placeholder="Search by name, mobile, staff ID, or role..."
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

        {/* Role Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
          {[
            { id: "ALL", label: "All Users" },
            { id: "FIELD_AGENT", label: "Agents" },
            { id: "DEALER", label: "Dealers / Brokers" },
            { id: "FIELD_STAFF", label: "Verification Staff" },
            { id: "TELE_CALLER", label: "Tele-callers" },
            { id: "ADMIN", label: "Admins" },
          ].map((r) => {
            const isSelected = selectedRole === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => setSelectedRole(r.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? "#0D9488" : isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: isSelected ? "#0D9488" : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: isSelected ? "#FFFFFF" : colors.textSecondary }]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Users List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
            Directory ({filteredUsers.length})
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#0D9488" size="large" style={{ marginVertical: 30 }} />
        ) : filteredUsers.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
            <Feather name="users" size={36} color="#94A3B8" />
            <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>No Users Found</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              No accounts found matching your selected role or search keyword.
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => {
            const roleBadge = getRoleBadgeStyle(user.role);
            const kycBadge = getKycBadge(user.kyc?.status);
            const isAgentOrDealer = ["field_agent", "dealer", "broker"].includes(user.role);

            return (
              <View
                key={user._id}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                    opacity: user.isActive ? 1 : 0.7,
                  },
                ]}
              >
                {/* User Header - Clickable for Full Dossier */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/SuperAdminPanel/user-detail",
                      params: { userId: user._id, role: user.role, userName: user.name },
                    });
                  }}
                  style={styles.userCardTop}
                >
                  <View style={[styles.avatar, { backgroundColor: user.isActive ? "#0D9488" : "#94A3B8" }]}>
                    <Text style={styles.avatarText}>{(user.name || "U").slice(0, 1).toUpperCase()}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={[styles.userName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                        {user.name}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <View style={[styles.rolePill, { backgroundColor: roleBadge.bg }]}>
                          <Text style={[styles.rolePillText, { color: roleBadge.text }]}>{roleBadge.label}</Text>
                        </View>
                        {user.role !== "super_admin" && (
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user);
                            }}
                            style={styles.deleteUserBtn}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Feather name="trash-2" size={15} color="#EF4444" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                      <Text style={[styles.staffIdText, { color: colors.textSecondary }]}>
                        ID: {user.staffId || "N/A"} • Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString("en-IN")}
                      </Text>
                      <Feather name="chevron-right" size={16} color="#0D9488" />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Contact & Switch Bar */}
                <View style={[styles.contactStrip, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.phoneText, { color: "#0D9488" }]}>
                      +91 {user.phone}
                    </Text>
                    {user.email ? (
                      <Text style={[styles.emailText, { color: colors.textMuted }]} numberOfLines={1}>
                        {user.email}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.commGroup}>
                    <TouchableOpacity onPress={() => handleCall(user.phone)} style={styles.commIconBtn}>
                      <Feather name="phone" size={14} color="#0D9488" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleWhatsApp(user.phone)} style={styles.commIconBtn}>
                      <FontAwesome5 name="whatsapp" size={14} color="#10B981" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.switchGroup}>
                    <Text style={[styles.switchLabel, { color: user.isActive ? "#10B981" : "#EF4444" }]}>
                      {user.isActive ? "ACTIVE" : "INACTIVE"}
                    </Text>
                    <Switch
                      value={user.isActive}
                      onValueChange={() => handleToggleStatus(user)}
                      trackColor={{ false: "#CBD5E1", true: "#0D9488" }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                {/* KYC & Commission Controls */}
                <View style={styles.controlsRow}>
                  {/* KYC Badge & Review Action */}
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedUserForKyc(user);
                      setIsKycModalVisible(true);
                    }}
                    style={[styles.kycReviewBtn, { backgroundColor: kycBadge.bg }]}
                  >
                    <Feather name={kycBadge.icon as any} size={14} color={kycBadge.text} />
                    <Text style={[styles.kycReviewBtnText, { color: kycBadge.text }]}>
                      KYC: {user.kyc?.status || "NOT UPLOADED"}
                    </Text>
                    <Feather name="chevron-right" size={14} color={kycBadge.text} />
                  </TouchableOpacity>

                  {/* Commission Rate Config */}
                  {isAgentOrDealer && (
                    <View style={styles.commissionWrap}>
                      {editingCommUserId === user._id ? (
                        <View style={styles.editCommRow}>
                          <TextInput
                            style={[styles.commInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: "#0D9488" }]}
                            keyboardType="numeric"
                            value={tempCommRate}
                            onChangeText={setTempCommRate}
                            maxLength={3}
                          />
                          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>%</Text>
                          <TouchableOpacity onPress={() => handleSaveCommission(user)} style={styles.saveCommBtn}>
                            <Feather name="check" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setEditingCommUserId(null)} style={styles.cancelCommBtn}>
                            <Feather name="x" size={14} color="#64748B" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            setEditingCommUserId(user._id);
                            setTempCommRate(String(user.commissionRate || 15));
                          }}
                          style={[styles.commRatePill, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                        >
                          <Ionicons name="pricetag-outline" size={14} color="#0D9488" />
                          <Text style={[styles.commRateText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                            {user.commissionRate || 0}% Comm.
                          </Text>
                          <Feather name="edit-2" size={12} color="#64748B" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                {/* Dossier Navigation Footer Strip */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({
                      pathname: "/SuperAdminPanel/user-detail",
                      params: { userId: user._id, role: user.role, userName: user.name },
                    });
                  }}
                  style={[styles.dossierFooterStrip, { backgroundColor: isDark ? "#0F172A" : "#F0FDFA" }]}
                >
                  <Feather name="file-text" size={13} color="#0D9488" />
                  <Text style={[styles.dossierFooterText, { color: "#0D9488" }]}>
                    View Activity Dossier, Properties & Payouts
                  </Text>
                  <Feather name="arrow-right" size={13} color="#0D9488" style={{ marginLeft: "auto" }} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Side Bar Menu */}
      <SuperAdminSideMenu
        visible={isSideMenuVisible}
        onClose={() => setIsSideMenuVisible(false)}
        onCreateUserPress={() => setIsCreateModalVisible(true)}
      />

      {/* Modals */}
      <SuperAdminCreateUserModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={fetchUsers}
      />

      <SuperAdminKycModal
        visible={isKycModalVisible}
        user={selectedUserForKyc}
        onClose={() => setIsKycModalVisible(false)}
        onSuccess={fetchUsers}
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
  panelBadge: {
    color: "#99F6E4",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 4,
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
  addUserHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addUserHeaderBtnText: {
    color: "#0D9488",
    fontSize: 12,
    fontWeight: "800",
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
  userCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  userCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    fontSize: 18,
    fontWeight: "800",
  },
  userName: {
    fontSize: 15,
    fontWeight: "800",
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dossierFooterStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 10,
    gap: 6,
  },
  dossierFooterText: {
    fontSize: 12,
    fontWeight: "700",
  },
  deleteUserBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    fontSize: 13,
    fontWeight: "700",
  },
  emailText: {
    fontSize: 11,
  },
  commGroup: {
    flexDirection: "row",
    gap: 6,
    marginRight: 10,
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
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 2,
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
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  commRateText: {
    fontSize: 12,
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
    paddingVertical: 4,
    fontSize: 12,
    width: 44,
    textAlign: "center",
  },
  saveCommBtn: {
    backgroundColor: "#0D9488",
    padding: 6,
    borderRadius: 6,
  },
  cancelCommBtn: {
    padding: 6,
  },
});
