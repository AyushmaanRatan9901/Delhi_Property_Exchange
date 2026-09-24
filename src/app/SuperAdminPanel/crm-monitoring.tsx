import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";
import {
  fetchCRMDashboard,
  fetchCRMCallers,
  createCRMCaller,
  toggleCRMCallerStatus,
  fetchCRMLeads,
  fetchCRMUnassignedLeads,
  createCRMLead,
  assignCRMLead,
  reassignCRMLead,
  updateCRMLeadStatus,
  fetchCRMCalls,
  fetchCRMAISummary,
  fetchCRMSiteVisits,
  updateCRMSiteVisitStatus,
  fetchCRMFollowUps,
  completeCRMFollowUp,
  fetchCRMHandoffs,
  reviewCRMHandoff,
  fetchCRMShowcases,
  controlCRMShowcase,
  fetchCRMAuditLogs,
} from "../../Redux/SuperAdmin/superAdminCrmSlice";
import {
  CRMStatCard,
  CallerCard,
  CRMLeadRow,
  CRMCallLogItem,
  CRMSiteVisitCard,
  CRMFollowUpCard,
  CRMHandoffModal,
  LeadAssignModal,
  AISummaryModal,
  CreateCallerModal,
  CreateLeadModal,
  ScheduleSiteVisitModal,
  TVShowcaseControlModal,
} from "../../components/SuperAdminCRM";
import {
  CallerItem,
  CRMLeadItem,
  CRMCallItem,
  CRMHandoffItem,
  CRMSiteVisitItem,
} from "../../services/superAdminCrmApi";

type CRMActiveTab =
  | "overview"
  | "callers"
  | "leads"
  | "calls"
  | "visits"
  | "followups"
  | "handoffs"
  | "audit";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SuperAdminCRMMonitoringScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { isDark, colors } = useResponsiveTheme();

  const {
    dashboardStats,
    callers,
    leads,
    unassignedLeads,
    calls,
    selectedCallSummary,
    siteVisits,
    followUps,
    handoffs,
    showcases,
    auditLogs,
    loading,
  } = useAppSelector((state) => state.superAdminCrm);

  const [activeTab, setActiveTab] = useState<CRMActiveTab>("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("ALL");

  // Modals state
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [selectedLeadForAssign, setSelectedLeadForAssign] = useState<CRMLeadItem | null>(null);

  const [isHandoffModalVisible, setIsHandoffModalVisible] = useState(false);
  const [selectedHandoff, setSelectedHandoff] = useState<CRMHandoffItem | null>(null);

  const [isAISummaryModalVisible, setIsAISummaryModalVisible] = useState(false);
  const [selectedCallForAI, setSelectedCallForAI] = useState<CRMCallItem | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [isCreateCallerModalVisible, setIsCreateCallerModalVisible] = useState(false);
  const [isCreateLeadModalVisible, setIsCreateLeadModalVisible] = useState(false);
  const [isScheduleVisitModalVisible, setIsScheduleVisitModalVisible] = useState(false);
  const [isTVControlModalVisible, setIsTVControlModalVisible] = useState(false);

  // Load all initial data
  const loadAllData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchCRMDashboard({})),
        dispatch(fetchCRMCallers({})),
        dispatch(fetchCRMLeads({})),
        dispatch(fetchCRMUnassignedLeads(undefined)),
        dispatch(fetchCRMCalls({})),
        dispatch(fetchCRMSiteVisits({})),
        dispatch(fetchCRMFollowUps({})),
        dispatch(fetchCRMHandoffs({})),
        dispatch(fetchCRMShowcases(undefined)),
        dispatch(fetchCRMAuditLogs({})),
      ]);
    } catch (err) {
      console.error("Failed to load CRM data:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // Caller Actions
  const handleToggleCallerStatus = async (callerId: string, currentStatus: "active" | "inactive") => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    Alert.alert(
      "Confirm Status Change",
      `Are you sure you want to ${nextStatus === "active" ? "activate" : "deactivate"} this tele-caller?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            await dispatch(toggleCRMCallerStatus({ id: callerId, status: nextStatus }));
          },
        },
      ]
    );
  };

  // Lead Assign Action
  const handleAssignLead = async (leadId: string, teleCallerId: string, reason?: string) => {
    await dispatch(assignCRMLead({ leadId, teleCallerId, reason }));
    await dispatch(fetchCRMDashboard({}));
  };

  // AI Summary Handler
  const handleOpenAISummary = async (call: CRMCallItem) => {
    setSelectedCallForAI(call);
    setIsAISummaryModalVisible(true);
    setAiLoading(true);
    await dispatch(fetchCRMAISummary(call._id || call.callId));
    setAiLoading(false);
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.leadId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      leadStatusFilter === "ALL" ||
      (leadStatusFilter === "UNASSIGNED" ? !l.assignedTo : l.status === leadStatusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const TABS: Array<{ id: CRMActiveTab; label: string; icon: any; count?: number }> = [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "callers", label: "Callers", icon: "users", count: callers.length },
    { id: "leads", label: "Leads", icon: "target", count: leads.length },
    { id: "calls", label: "Calls", icon: "phone-call", count: calls.length },
    { id: "visits", label: "Site Visits", icon: "map-pin", count: siteVisits.length },
    { id: "followups", label: "Follow-ups", icon: "calendar", count: followUps.length },
    { id: "handoffs", label: "Handoffs", icon: "check-circle", count: handoffs.length },
    { id: "audit", label: "Audit Logs", icon: "shield" },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background : "#F8FAFC",
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={isDark ? "#FFFFFF" : "#0F172A"} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
            CRM & Tele-Caller Ops
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Super Admin Control & Telephony Desk
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.tvBtn, { backgroundColor: "#0D9488" }]}
          onPress={() => setIsTVControlModalVisible(true)}
        >
          <MaterialCommunityIcons name="television-play" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation Ribbon */}
      <View style={styles.tabRibbonWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRibbon}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabPill,
                  isActive
                    ? { backgroundColor: "#0D9488", borderColor: "#0D9488" }
                    : {
                        backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                        borderColor: colors.border,
                      },
                ]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Feather
                  name={tab.icon}
                  size={12}
                  color={isActive ? "#FFFFFF" : isDark ? "#E2E8F0" : "#475569"}
                />
                <Text
                  style={[
                    styles.tabPillText,
                    { color: isActive ? "#FFFFFF" : isDark ? "#E2E8F0" : "#475569" },
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.count !== undefined ? (
                  <View
                    style={[
                      styles.tabCountPill,
                      { backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#F1F5F9" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabCountText,
                        { color: isActive ? "#FFFFFF" : "#64748B" },
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.mainScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TAB 1: OVERVIEW ─────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <View>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Executive Operations Summary
            </Text>

            {/* KPI Cards Row 1 */}
            <View style={styles.statsRow}>
              <CRMStatCard
                title="Total CRM Leads"
                value={dashboardStats?.totalLeads ?? leads.length}
                icon="target"
                gradientColors={["#3B82F6", "#1D4ED8"]}
                subtitle="All pipeline prospects"
                onPress={() => setActiveTab("leads")}
              />
              <CRMStatCard
                title="Active Callers"
                value={`${dashboardStats?.activeCallers ?? callers.filter((c) => c.caller.status === "active").length} / ${callers.length}`}
                icon="users"
                gradientColors={["#0D9488", "#0F766E"]}
                subtitle="Staff on duty"
                badgeText="LIVE"
                badgeColor="#10B981"
                onPress={() => setActiveTab("callers")}
              />
            </View>

            {/* KPI Cards Row 2 */}
            <View style={styles.statsRow}>
              <CRMStatCard
                title="Calls Today"
                value={dashboardStats?.callsToday ?? 0}
                icon="phone-call"
                gradientColors={["#10B981", "#059669"]}
                subtitle="Outbound & Inbound"
                onPress={() => setActiveTab("calls")}
              />
              <CRMStatCard
                title="Overdue Follow-ups"
                value={dashboardStats?.overdueFollowUps ?? 0}
                icon="alert-circle"
                gradientColors={["#EF4444", "#B91C1C"]}
                subtitle="Immediate action required"
                badgeText={dashboardStats?.overdueFollowUps ? "ACTION" : "OK"}
                badgeColor="#EF4444"
                onPress={() => setActiveTab("followups")}
              />
            </View>

            {/* KPI Cards Row 3 */}
            <View style={styles.statsRow}>
              <CRMStatCard
                title="Site Visits Today"
                value={dashboardStats?.siteVisitsToday ?? 0}
                icon="map-pin"
                gradientColors={["#8B5CF6", "#6D28D9"]}
                subtitle="Field inspections"
                onPress={() => setActiveTab("visits")}
              />
              <CRMStatCard
                title="Pending Handoffs"
                value={dashboardStats?.pendingHandoffs ?? handoffs.filter((h) => h.status === "pending").length}
                icon="check-circle"
                gradientColors={["#F59E0B", "#D97706"]}
                subtitle="Awaiting deal closure"
                badgeText={dashboardStats?.pendingHandoffs ? "DESK" : "CLEAR"}
                badgeColor="#F59E0B"
                onPress={() => setActiveTab("handoffs")}
              />
            </View>

            {/* Quick Action Ribbon */}
            <View
              style={[
                styles.quickActionBox,
                {
                  backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.boxTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Quick CRM Actions
              </Text>
              <View style={styles.actionButtonsGrid}>
                <TouchableOpacity
                  style={styles.actionGridItem}
                  onPress={() => setIsCreateCallerModalVisible(true)}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: "#EFF6FF" }]}>
                    <Feather name="user-plus" size={18} color="#2563EB" />
                  </View>
                  <Text style={[styles.actionGridLabel, { color: colors.textSecondary }]}>
                    Add Caller
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionGridItem}
                  onPress={() => setIsCreateLeadModalVisible(true)}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: "#F0FDF4" }]}>
                    <Feather name="plus-circle" size={18} color="#16A34A" />
                  </View>
                  <Text style={[styles.actionGridLabel, { color: colors.textSecondary }]}>
                    New Lead
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionGridItem}
                  onPress={() => setIsTVControlModalVisible(true)}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: "#FEF3C7" }]}>
                    <MaterialCommunityIcons name="television" size={18} color="#D97706" />
                  </View>
                  <Text style={[styles.actionGridLabel, { color: colors.textSecondary }]}>
                    TV Display
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionGridItem}
                  onPress={() => setActiveTab("audit")}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: "#FDF4FF" }]}>
                    <Feather name="shield" size={18} color="#9333EA" />
                  </View>
                  <Text style={[styles.actionGridLabel, { color: colors.textSecondary }]}>
                    Audit Logs
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── TAB 2: CALLERS ──────────────────────────────────────────────── */}
        {activeTab === "callers" && (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Tele-Callers Directory ({callers.length})
              </Text>
              <TouchableOpacity
                style={styles.primaryAddBtn}
                onPress={() => setIsCreateCallerModalVisible(true)}
              >
                <Feather name="user-plus" size={12} color="#FFFFFF" />
                <Text style={styles.primaryAddBtnText}>Add Caller</Text>
              </TouchableOpacity>
            </View>

            {callers.map((caller) => (
              <CallerCard
                key={caller.caller.id}
                item={caller}
                onToggleStatus={handleToggleCallerStatus}
                onViewLeads={(id, name) => {
                  setSearchQuery(name);
                  setActiveTab("leads");
                }}
              />
            ))}
          </View>
        )}

        {/* ── TAB 3: LEADS ────────────────────────────────────────────────── */}
        {activeTab === "leads" && (
          <View>
            {/* Search & Status Filters */}
            <View style={styles.searchFilterRow}>
              <View
                style={[
                  styles.searchBar,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="search" size={15} color="#94A3B8" />
                <TextInput
                  style={[styles.searchInput, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
                  placeholder="Search by client name, mobile, lead ID..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Feather name="x" size={14} color="#94A3B8" />
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.primaryAddBtn}
                onPress={() => setIsCreateLeadModalVisible(true)}
              >
                <Feather name="plus" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Status Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
              {["ALL", "UNASSIGNED", "NEW", "CONTACTED", "QUALIFIED", "SITE_VISIT", "NEGOTIATION", "CONVERTED", "LOST"].map(
                (st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.filterPill,
                      leadStatusFilter === st
                        ? { backgroundColor: "#0D9488", borderColor: "#0D9488" }
                        : {
                            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                            borderColor: colors.border,
                          },
                    ]}
                    onPress={() => setLeadStatusFilter(st)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        { color: leadStatusFilter === st ? "#FFFFFF" : colors.textSecondary },
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>

            {/* Leads List */}
            {filteredLeads.map((lead) => (
              <CRMLeadRow
                key={lead._id}
                lead={lead}
                onPress={(ld) => {
                  setSelectedLeadForAssign(ld);
                  setIsScheduleVisitModalVisible(true);
                }}
                onAssignPress={(ld) => {
                  setSelectedLeadForAssign(ld);
                  setIsAssignModalVisible(true);
                }}
              />
            ))}
          </View>
        )}

        {/* ── TAB 4: CALLS ────────────────────────────────────────────────── */}
        {activeTab === "calls" && (
          <View>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Telephony Monitoring ({calls.length} Logs)
            </Text>

            {calls.map((call) => (
              <CRMCallLogItem
                key={call._id}
                call={call}
                onAISummaryPress={handleOpenAISummary}
              />
            ))}
          </View>
        )}

        {/* ── TAB 5: SITE VISITS ──────────────────────────────────────────── */}
        {activeTab === "visits" && (
          <View>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Field Site Inspections ({siteVisits.length})
            </Text>

            {siteVisits.map((visit) => (
              <CRMSiteVisitCard
                key={visit._id}
                visit={visit}
                onStatusPress={(v) => {
                  Alert.alert("Update Visit Status", "Select new visit stage:", [
                    {
                      text: "Confirmed",
                      onPress: () =>
                        dispatch(updateCRMSiteVisitStatus({ id: v._id, status: "confirmed" })),
                    },
                    {
                      text: "Client Reached",
                      onPress: () =>
                        dispatch(updateCRMSiteVisitStatus({ id: v._id, status: "client_reached" })),
                    },
                    {
                      text: "Completed",
                      onPress: () =>
                        dispatch(updateCRMSiteVisitStatus({ id: v._id, status: "completed" })),
                    },
                    { text: "Cancel", style: "cancel" },
                  ]);
                }}
              />
            ))}
          </View>
        )}

        {/* ── TAB 6: FOLLOW-UPS ───────────────────────────────────────────── */}
        {activeTab === "followups" && (
          <View>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Follow-Up Tasks ({followUps.length})
            </Text>

            {followUps.map((flp) => (
              <CRMFollowUpCard
                key={flp._id}
                followUp={flp}
                onComplete={(id) => dispatch(completeCRMFollowUp({ id }))}
              />
            ))}
          </View>
        )}

        {/* ── TAB 7: HANDOFFS ─────────────────────────────────────────────── */}
        {activeTab === "handoffs" && (
          <View>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              Qualified Lead Handoff Desk ({handoffs.length})
            </Text>

            {handoffs.map((h) => (
              <TouchableOpacity
                key={h._id}
                style={[
                  styles.handoffRowCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedHandoff(h);
                  setIsHandoffModalVisible(true);
                }}
              >
                <View style={styles.handoffHeader}>
                  <Text style={[styles.handoffId, { color: colors.primary }]}>{h.handoffId}</Text>
                  <View
                    style={[
                      styles.handoffStatusPill,
                      {
                        backgroundColor:
                          h.status === "accepted"
                            ? "#DCFCE7"
                            : h.status === "rejected"
                            ? "#FEE2E2"
                            : "#FEF3C7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.handoffStatusText,
                        {
                          color:
                            h.status === "accepted"
                              ? "#15803D"
                              : h.status === "rejected"
                              ? "#DC2626"
                              : "#B45309",
                        },
                      ]}
                    >
                      {h.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.handoffClient, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {h.lead?.name} ({h.lead?.phone})
                </Text>
                <Text style={[styles.handoffCaller, { color: colors.textSecondary }]}>
                  Pitched by: {h.teleCaller?.name} ({h.teleCaller?.staffId || "Staff"})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── TAB 8: AUDIT LOGS ───────────────────────────────────────────── */}
        {activeTab === "audit" && (
          <View>
            <Text style={[styles.sectionHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
              System Audit Trail ({auditLogs.length} Events)
            </Text>

            {auditLogs.map((log) => (
              <View
                key={log._id}
                style={[
                  styles.auditCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.auditHeader}>
                  <Text style={[styles.auditAction, { color: colors.primary }]}>{log.action}</Text>
                  <Text style={[styles.auditTime, { color: colors.textMuted }]}>
                    {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                </View>
                <Text style={[styles.auditActor, { color: isDark ? "#E2E8F0" : "#334155" }]}>
                  Actor: {log.actor?.name || "System"} ({log.actorRole?.toUpperCase()}) • IP: {log.ip || "127.0.0.1"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Interactive Modals */}
      <LeadAssignModal
        visible={isAssignModalVisible}
        lead={selectedLeadForAssign}
        callers={callers}
        onClose={() => {
          setIsAssignModalVisible(false);
          setSelectedLeadForAssign(null);
        }}
        onAssign={handleAssignLead}
      />

      <CRMHandoffModal
        visible={isHandoffModalVisible}
        handoff={selectedHandoff}
        onClose={() => {
          setIsHandoffModalVisible(false);
          setSelectedHandoff(null);
        }}
        onAccept={(id, remarks) => dispatch(reviewCRMHandoff({ id, action: "accept", remarks })).then(() => {})}
        onReject={(id, remarks) => dispatch(reviewCRMHandoff({ id, action: "reject", remarks })).then(() => {})}
        onReturn={(id, remarks) => dispatch(reviewCRMHandoff({ id, action: "return", remarks })).then(() => {})}
      />

      <AISummaryModal
        visible={isAISummaryModalVisible}
        call={selectedCallForAI}
        summaryData={selectedCallSummary}
        loading={aiLoading}
        onClose={() => {
          setIsAISummaryModalVisible(false);
          setSelectedCallForAI(null);
        }}
      />

      <CreateCallerModal
        visible={isCreateCallerModalVisible}
        onClose={() => setIsCreateCallerModalVisible(false)}
        onSubmit={async (data) => {
          await dispatch(createCRMCaller(data));
        }}
      />

      <CreateLeadModal
        visible={isCreateLeadModalVisible}
        callers={callers}
        onClose={() => setIsCreateLeadModalVisible(false)}
        onSubmit={async (data) => {
          await dispatch(createCRMLead(data));
        }}
      />

      <ScheduleSiteVisitModal
        visible={isScheduleVisitModalVisible}
        lead={selectedLeadForAssign}
        onClose={() => {
          setIsScheduleVisitModalVisible(false);
          setSelectedLeadForAssign(null);
        }}
        onSuccess={() => {
          dispatch(fetchCRMSiteVisits({}));
        }}
      />

      <TVShowcaseControlModal
        visible={isTVControlModalVisible}
        showcases={showcases}
        onPlay={(id, index) => dispatch(controlCRMShowcase({ id, action: "play", propertyIndex: index }))}
        onNext={(id) => dispatch(controlCRMShowcase({ id, action: "next" }))}
        onPrevious={(id) => dispatch(controlCRMShowcase({ id, action: "previous" }))}
        onClose={() => setIsTVControlModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  tvBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  tabRibbonWrapper: {
    paddingVertical: 8,
  },
  tabRibbon: {
    paddingHorizontal: 12,
    gap: 6,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  tabCountPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: "700",
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 12,
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  primaryAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0D9488",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  primaryAddBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  quickActionBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 12,
  },
  boxTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  actionButtonsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionGridItem: {
    alignItems: "center",
    flex: 1,
  },
  actionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  actionGridLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  searchFilterRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    padding: 0,
  },
  statusScroll: {
    marginBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 6,
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  handoffRowCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginVertical: 4,
  },
  handoffHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  handoffId: {
    fontSize: 12,
    fontWeight: "800",
  },
  handoffStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  handoffStatusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  handoffClient: {
    fontSize: 14,
    fontWeight: "700",
  },
  handoffCaller: {
    fontSize: 11,
    marginTop: 2,
  },
  auditCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginVertical: 4,
  },
  auditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  auditAction: {
    fontSize: 12,
    fontWeight: "800",
  },
  auditTime: {
    fontSize: 10,
  },
  auditActor: {
    fontSize: 11,
  },
});
