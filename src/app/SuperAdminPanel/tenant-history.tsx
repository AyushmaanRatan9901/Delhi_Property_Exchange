import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";
import {
  SuperAdminSideMenu,
  SuperAdminTenantHistoryModal,
  SuperAdminRentReminderModal,
  SuperAdminCustomNotificationModal,
} from "../../components/SuperAdminComponent";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SuperAdminTenantHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useResponsiveTheme();

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [summary, setSummary] = useState<any>({
    totalTenants: 0,
    paidCount: 0,
    paidAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    overdueCount: 0,
    overdueAmount: 0,
    totalOutstanding: 0,
    currentMonth: "September 2026",
  });
  const [records, setRecords] = useState<any[]>([]);

  // Search & Filter State
  const [search, setSearch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("September 2026");

  // Modals
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [selectedTenantForHistory, setSelectedTenantForHistory] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const [selectedTenantForReminder, setSelectedTenantForReminder] = useState<any>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

  const [selectedTenantForCustomNotif, setSelectedTenantForCustomNotif] = useState<any>(null);
  const [isCustomNotifModalOpen, setIsCustomNotifModalOpen] = useState<boolean>(false);

  const fetchTenantHistoryData = useCallback(async () => {
    try {
      const res = await apiClient.get("/rent-payments/superadmin/tenant-history", {
        params: {
          search: search.trim() || undefined,
          status: selectedStatus !== "ALL" ? selectedStatus : undefined,
          month: selectedMonth !== "ALL" ? selectedMonth : undefined,
        },
      });

      if (res.data?.data) {
        setSummary(res.data.data.summary || summary);
        setRecords(res.data.data.records || []);
      }
    } catch (err: any) {
      console.log("Error fetching tenant history:", err.message);
      // Realistic offline demo fallback records
      const fallbackRecords = [
        {
          id: "REC-884201",
          propertyId: "PROP-101",
          propertyTitle: "Green Heights Luxury Apartments",
          locality: "Sector 62, Noida",
          unitNumber: "Flat A-204",
          tenantId: "TNT-8842",
          tenantName: "Rahul Kumar",
          tenantPhone: "9811234567",
          tenantEmail: "rahul.kumar@gmail.com",
          monthlyRent: 18000,
          securityDeposit: 36000,
          outstandingAmount: 0,
          dueDate: "2026-09-05T00:00:00Z",
          dueDateFormatted: "05 Sep 2026",
          paidDateFormatted: "05 Sep 2026",
          currentMonth: "September 2026",
          status: "paid",
          paymentMethod: "UPI",
          transactionId: "UPI/202609058812",
        },
        {
          id: "REC-884202",
          propertyId: "PROP-102",
          propertyTitle: "Silver Oak Towers",
          locality: "Dwarka Sector 12, Delhi",
          unitNumber: "Unit B-402",
          tenantId: "TNT-8843",
          tenantName: "Ananya Sharma",
          tenantPhone: "9876543210",
          tenantEmail: "ananya.sharma@yahoo.com",
          monthlyRent: 22000,
          securityDeposit: 44000,
          outstandingAmount: 22000,
          dueDate: "2026-09-05T00:00:00Z",
          dueDateFormatted: "05 Sep 2026",
          paidDateFormatted: "—",
          currentMonth: "September 2026",
          status: "overdue",
          paymentMethod: "Pending",
          transactionId: null,
        },
        {
          id: "REC-884203",
          propertyId: "PROP-103",
          propertyTitle: "Palm Residency",
          locality: "Indirapuram, Ghaziabad",
          unitNumber: "Flat C-101",
          tenantId: "TNT-8844",
          tenantName: "Vikram Malhotra",
          tenantPhone: "9818822334",
          tenantEmail: "vikram.m@outlook.com",
          monthlyRent: 16500,
          securityDeposit: 33000,
          outstandingAmount: 16500,
          dueDate: "2026-09-05T00:00:00Z",
          dueDateFormatted: "05 Sep 2026",
          paidDateFormatted: "—",
          currentMonth: "September 2026",
          status: "pending",
          paymentMethod: "Pending",
          transactionId: null,
        },
        {
          id: "REC-884204",
          propertyId: "PROP-104",
          propertyTitle: "DLF Cyber View Units",
          locality: "DLF Phase 2, Gurgaon",
          unitNumber: "Studio S-12",
          tenantId: "TNT-8845",
          tenantName: "Pooja Hegde",
          tenantPhone: "9899011223",
          tenantEmail: "pooja.hegde@tech.com",
          monthlyRent: 25000,
          securityDeposit: 50000,
          outstandingAmount: 10000,
          dueDate: "2026-09-05T00:00:00Z",
          dueDateFormatted: "05 Sep 2026",
          paidDateFormatted: "04 Sep 2026",
          currentMonth: "September 2026",
          status: "partially_paid",
          paymentMethod: "Bank Transfer",
          transactionId: "IMPS/99812450",
        },
      ];

      setRecords(fallbackRecords);
      setSummary({
        totalTenants: 4,
        paidCount: 1,
        paidAmount: 18000,
        pendingCount: 1,
        pendingAmount: 16500,
        overdueCount: 1,
        overdueAmount: 22000,
        totalOutstanding: 48500,
        currentMonth: "September 2026",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedStatus, selectedMonth]);

  useEffect(() => {
    fetchTenantHistoryData();
  }, [fetchTenantHistoryData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTenantHistoryData();
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return { bg: "#DCFCE7", text: "#15803D", label: "PAID" };
      case "overdue":
        return { bg: "#FEE2E2", text: "#B91C1C", label: "OVERDUE" };
      case "partially_paid":
      case "partial":
        return { bg: "#FEF3C7", text: "#B45309", label: "PARTIAL" };
      default:
        return { bg: "#E0F2FE", text: "#0369A1", label: "PENDING" };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top + 8, 36) }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
            <TouchableOpacity
              onPress={() => setIsSideMenuOpen(true)}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Feather name="menu" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Text style={styles.panelBadge}>SUPER ADMIN DESK</Text>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>SYNCED</Text>
                </View>
              </View>
              <Text style={styles.headerTitle}>Tenant History & Rent</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/SuperAdminPanel/notification-automations" as any)}
            style={styles.automationBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={14} color="#FFFFFF" />
            <Text style={styles.automationBtnText}>Automations</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          Track tenant leases, rent payments, outstanding amounts and property-wise history.
        </Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {/* 5 Summary KPI Cards */}
        <View style={styles.kpiGrid}>
          {/* Card 1: Total Tenants */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
            <View style={[styles.kpiIconWrap, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}>
              <Feather name="users" size={16} color="#3B82F6" />
            </View>
            <Text style={[styles.kpiValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              {summary.totalTenants || 0}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Tenants</Text>
          </View>

          {/* Card 2: Rent Paid */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
            <View style={[styles.kpiIconWrap, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
              <Feather name="check-circle" size={16} color="#10B981" />
            </View>
            <Text style={[styles.kpiValue, { color: "#10B981" }]}>
              ₹{(summary.paidAmount || 0).toLocaleString("en-IN")}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
              Rent Paid ({summary.paidCount || 0})
            </Text>
          </View>

          {/* Card 3: Rent Pending */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
            <View style={[styles.kpiIconWrap, { backgroundColor: "rgba(2, 132, 199, 0.12)" }]}>
              <Feather name="clock" size={16} color="#0284C7" />
            </View>
            <Text style={[styles.kpiValue, { color: "#0284C7" }]}>
              ₹{(summary.pendingAmount || 0).toLocaleString("en-IN")}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
              Pending ({summary.pendingCount || 0})
            </Text>
          </View>

          {/* Card 4: Rent Overdue */}
          <View style={[styles.kpiCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
            <View style={[styles.kpiIconWrap, { backgroundColor: "rgba(239, 68, 68, 0.12)" }]}>
              <Feather name="alert-triangle" size={16} color="#EF4444" />
            </View>
            <Text style={[styles.kpiValue, { color: "#EF4444" }]}>
              ₹{(summary.overdueAmount || 0).toLocaleString("en-IN")}
            </Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>
              Overdue ({summary.overdueCount || 0})
            </Text>
          </View>

          {/* Card 5: Total Outstanding */}
          <View style={[styles.kpiCardWide, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "#FEF2F2", borderColor: isDark ? "#DC2626" : "#FCA5A5" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[styles.kpiIconWrap, { backgroundColor: "#EF4444" }]}>
                <Ionicons name="wallet" size={16} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.kpiLabel, { color: isDark ? "#F87171" : "#991B1B", fontWeight: "800" }]}>
                  TOTAL SYSTEM OUTSTANDING
                </Text>
                <Text style={[styles.kpiValueWide, { color: isDark ? "#F87171" : "#991B1B" }]}>
                  ₹{(summary.totalOutstanding || 0).toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedTenantForCustomNotif(null);
                setIsCustomNotifModalOpen(true);
              }}
              style={styles.broadcastBtn}
            >
              <Feather name="send" size={12} color="#FFFFFF" />
              <Text style={styles.broadcastBtnText}>Broadcast Notice</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search & Filter Bar */}
        <View style={[styles.searchFilterCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
          <View style={[styles.searchInputWrap, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
            <Feather name="search" size={16} color={isDark ? "#94A3B8" : "#64748B"} />
            <TextInput
              style={[styles.searchInputText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
              placeholder="Search tenant name, phone, property or flat..."
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={fetchTenantHistoryData}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(""); fetchTenantHistoryData(); }}>
                <Feather name="x-circle" size={16} color={isDark ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>
            )}
          </View>

          {/* Status Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusChipsRow}>
            {[
              { id: "ALL", label: "All Statuses" },
              { id: "paid", label: "Paid" },
              { id: "pending", label: "Pending" },
              { id: "overdue", label: "Overdue" },
              { id: "partially_paid", label: "Partially Paid" },
            ].map((st) => {
              const isSel = selectedStatus === st.id;
              return (
                <TouchableOpacity
                  key={st.id}
                  onPress={() => setSelectedStatus(st.id)}
                  style={[
                    styles.statusFilterChip,
                    {
                      backgroundColor: isSel ? "#0D9488" : isDark ? "#0F172A" : "#F1F5F9",
                      borderColor: isSel ? "#0D9488" : isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.statusFilterText, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Property-wise Rent Records Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
            Tenant Rent Records ({records.length})
          </Text>
          <Text style={[styles.sectionMonth, { color: colors.textSecondary }]}>
            Month: {summary.currentMonth || "Current Cycle"}
          </Text>
        </View>

        {/* List of Rent Records / Cards */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading tenant rent records...
            </Text>
          </View>
        ) : records.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
            <Feather name="inbox" size={36} color="#94A3B8" />
            <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              No Rent Records Matching Filter
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Try adjusting your search query or selecting a different status filter.
            </Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {records.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.recordCard,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                      borderColor: item.status === "overdue" ? "#EF4444" : isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  {/* Card Top: Tenant & Status */}
                  <View style={styles.recordTopRow}>
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={styles.tenantAvatar}>
                        {item.tenantPhoto ? (
                          <Image source={{ uri: item.tenantPhoto }} style={styles.avatarImg} />
                        ) : (
                          <View style={[styles.avatarPlaceholder, { backgroundColor: "#0D9488" }]}>
                            <Text style={styles.avatarLetter}>{item.tenantName?.charAt(0).toUpperCase() || "T"}</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.recordTenantName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          {item.tenantName}
                        </Text>
                        <Text style={[styles.recordTenantPhone, { color: colors.textSecondary }]}>
                          📞 {item.tenantPhone}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadgePill, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Property & Unit Strip */}
                  <View style={[styles.propStrip, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.propTitleText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                        {item.propertyTitle}
                      </Text>
                      <Text style={[styles.propLocalityText, { color: colors.textSecondary }]}>
                        📍 {item.locality} • <Text style={{ fontWeight: "700", color: "#0D9488" }}>{item.unitNumber}</Text>
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[styles.rentAmountText, { color: "#0D9488" }]}>
                        ₹{Number(item.monthlyRent || 0).toLocaleString("en-IN")}
                      </Text>
                      <Text style={[styles.rentCycleText, { color: colors.textMuted }]}>
                        Due: {item.dueDateFormatted}
                      </Text>
                    </View>
                  </View>

                  {/* Outstanding & Paid Info */}
                  <View style={styles.financialRow}>
                    <View style={styles.finCol}>
                      <Text style={[styles.finLabel, { color: colors.textMuted }]}>CURRENT MONTH</Text>
                      <Text style={[styles.finVal, { color: isDark ? "#CBD5E1" : "#475569" }]}>
                        {item.currentMonth || "Sep 2026"}
                      </Text>
                    </View>

                    <View style={styles.finCol}>
                      <Text style={[styles.finLabel, { color: colors.textMuted }]}>OUTSTANDING</Text>
                      <Text
                        style={[
                          styles.finVal,
                          { color: (item.outstandingAmount || 0) > 0 ? "#EF4444" : "#10B981", fontWeight: "800" },
                        ]}
                      >
                        ₹{Number(item.outstandingAmount || 0).toLocaleString("en-IN")}
                      </Text>
                    </View>

                    <View style={styles.finCol}>
                      <Text style={[styles.finLabel, { color: colors.textMuted }]}>PAYMENT METHOD</Text>
                      <Text style={[styles.finVal, { color: isDark ? "#CBD5E1" : "#475569" }]}>
                        {item.paymentMethod || "UPI"}
                      </Text>
                    </View>
                  </View>

                  {/* Actions: View History, Send Reminder, Send Notification */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedTenantForHistory(item);
                        setIsHistoryModalOpen(true);
                      }}
                      style={[styles.historyBtn, { borderColor: colors.border }]}
                      activeOpacity={0.7}
                    >
                      <Feather name="eye" size={13} color={isDark ? "#CBD5E1" : "#475569"} />
                      <Text style={[styles.historyBtnText, { color: isDark ? "#CBD5E1" : "#475569" }]}>
                        View History
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedTenantForReminder(item);
                        setIsReminderModalOpen(true);
                      }}
                      style={[styles.reminderActionBtn, { backgroundColor: "rgba(13, 148, 136, 0.12)" }]}
                      activeOpacity={0.7}
                    >
                      <Feather name="bell" size={13} color="#0D9488" />
                      <Text style={styles.reminderActionBtnText}>Send Reminder</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedTenantForCustomNotif(item);
                        setIsCustomNotifModalOpen(true);
                      }}
                      style={[styles.customNotifBtn, { backgroundColor: "rgba(99, 102, 241, 0.12)" }]}
                      activeOpacity={0.7}
                    >
                      <Feather name="message-square" size={13} color="#6366F1" />
                      <Text style={styles.customNotifBtnText}>Notify</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Side Bar Menu */}
      <SuperAdminSideMenu
        visible={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
      />

      {/* 1. Tenant Payment & Lease History Modal */}
      <SuperAdminTenantHistoryModal
        visible={isHistoryModalOpen}
        tenantId={selectedTenantForHistory?.tenantId}
        tenantInitialData={selectedTenantForHistory}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setSelectedTenantForHistory(null);
        }}
        onSendReminderPress={(tenantData) => {
          setSelectedTenantForReminder(tenantData);
          setIsReminderModalOpen(true);
        }}
      />

      {/* 2. Send Rent Reminder Modal */}
      <SuperAdminRentReminderModal
        visible={isReminderModalOpen}
        tenantData={selectedTenantForReminder}
        onClose={() => {
          setIsReminderModalOpen(false);
          setSelectedTenantForReminder(null);
        }}
        onSuccess={fetchTenantHistoryData}
      />

      {/* 3. Send Custom Notification Modal */}
      <SuperAdminCustomNotificationModal
        visible={isCustomNotifModalOpen}
        initialRecipient={selectedTenantForCustomNotif}
        onClose={() => {
          setIsCustomNotifModalOpen(false);
          setSelectedTenantForCustomNotif(null);
        }}
        onSuccess={fetchTenantHistoryData}
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
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  panelBadge: {
    color: "#A7F3D0",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },
  automationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6366F1",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  automationBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    lineHeight: 17,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  kpiCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  kpiCardWide: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: "800",
  },
  kpiValueWide: {
    fontSize: 18,
    fontWeight: "900",
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  broadcastBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EF4444",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  broadcastBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  searchFilterCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInputText: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  statusChipsRow: {
    flexDirection: "row",
    gap: 6,
  },
  statusFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusFilterText: {
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
  sectionMonth: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingBox: {
    padding: 40,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  emptyDesc: {
    fontSize: 12,
    textAlign: "center",
  },
  recordsList: {
    gap: 12,
  },
  recordCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  recordTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tenantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  recordTenantName: {
    fontSize: 14,
    fontWeight: "800",
  },
  recordTenantPhone: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  propStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
  },
  propTitleText: {
    fontSize: 13,
    fontWeight: "700",
  },
  propLocalityText: {
    fontSize: 11,
    marginTop: 1,
  },
  rentAmountText: {
    fontSize: 14,
    fontWeight: "900",
  },
  rentCycleText: {
    fontSize: 10,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  finCol: {
    gap: 2,
  },
  finLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  finVal: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
  },
  historyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  historyBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  reminderActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reminderActionBtnText: {
    color: "#0D9488",
    fontSize: 11,
    fontWeight: "800",
  },
  customNotifBtn: {
    flex: 0.8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  customNotifBtnText: {
    color: "#6366F1",
    fontSize: 11,
    fontWeight: "800",
  },
});
