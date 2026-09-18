import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSelector, useDispatch } from "react-redux";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";
import { RootState } from "../../../Redux/store";
import { setAssignedLeads } from "../../../Redux/VerificationStaff/verificationStaffSlice";
import {
  PropertyVerificationModal,
  NotificationModal,
} from "../../../components/VerificationStaffComponent";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors, isDark } = useResponsiveTheme();

  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  // Redux Real-Time State
  const assignedLeads = useSelector(
    (state: RootState) => state.verificationStaff.assignedLeads
  );
  const unreadNotifCount = useSelector(
    (state: RootState) => state.verificationStaff.unreadCount
  );
  const isSocketConnected = useSelector(
    (state: RootState) => state.verificationStaff.isSocketConnected
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inspectionsList, setInspectionsList] = useState<any[]>([]);
  const [complaintsList, setComplaintsList] = useState<any[]>([]);

  // Modals
  const [selectedLeadForVerify, setSelectedLeadForVerify] = useState<any>(null);
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
  const [isNotifModalVisible, setIsNotifModalVisible] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [leadsRes, inspRes, compRes] = await Promise.allSettled([
        apiClient.get("/leads/assigned-to-me?limit=50"),
        apiClient.get("/leads/my-inspections"),
        apiClient.get("/leads/complaints"),
      ]);

      if (leadsRes.status === "fulfilled" && leadsRes.value.data?.data?.leads) {
        dispatch(setAssignedLeads(leadsRes.value.data.data.leads));
      }

      if (inspRes.status === "fulfilled" && Array.isArray(inspRes.value.data?.data)) {
        setInspectionsList(inspRes.value.data.data);
      }

      if (compRes.status === "fulfilled" && Array.isArray(compRes.value.data?.data)) {
        setComplaintsList(compRes.value.data.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleStartVerification = (leadItem: any) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setSelectedLeadForVerify(leadItem);
    setIsVerifyModalVisible(true);
  };

  // Real-time calculated metrics
  const pendingCount = assignedLeads.filter((l) =>
    ["assigned", "under_verification", "new"].includes(l.status)
  ).length;
  const verifiedCount = assignedLeads.filter((l) =>
    ["verified", "rented", "sold"].includes(l.status)
  ).length;
  const dueInspectionsCount = inspectionsList.filter(
    (i) => i.status === "scheduled" || i.status === "overdue"
  ).length;
  const openComplaintsCount = complaintsList.filter(
    (c) => c.status === "open" || c.status === "in_progress"
  ).length;

  const pendingQueue = assignedLeads.filter((l) =>
    ["assigned", "under_verification", "new"].includes(l.status)
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle="light-content" />

      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top + 10, 36) }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.onlineDot,
                  { backgroundColor: isSocketConnected ? "#10B981" : "#F59E0B" },
                ]}
              />
              <Text style={styles.panelBadge}>
                {isSocketConnected ? "LIVE • VERIFICATION APP" : "VERIFICATION APP"}
              </Text>
            </View>
            <Text style={styles.headerTitle}>On-Ground Verification</Text>
          </View>

          {/* Header Action Buttons: Notification Bell + Refresh */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                setIsNotifModalVisible(true);
              }}
              style={styles.headerActionBtn}
            >
              <Feather name="bell" size={18} color="#FFFFFF" />
              {unreadNotifCount > 0 && (
                <View style={styles.headerNotifBadge}>
                  <Text style={styles.headerNotifBadgeText}>
                    {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={onRefresh} style={styles.headerActionBtn}>
              <Feather name="refresh-cw" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Physical site audits, guided media capture & KYC publication
        </Text>
      </LinearGradient>

      {/* Main Content Body */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={{ color: textSecondary, marginTop: 10, fontSize: 13 }}>Syncing verification assignments...</Text>
          </View>
        ) : (
          <>
            {/* 4 Metric Stats Grid */}
            <View style={styles.statsGrid}>
              <TouchableOpacity
                onPress={() => router.push("/VerificationStaffPanel/(tabs)/pending" as any)}
                style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: "#F59E0B15" }]}>
                  <Feather name="clock" size={18} color="#F59E0B" />
                </View>
                <Text style={[styles.statValue, { color: textPrimary }]}>{pendingCount}</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>Pending Verification</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/VerificationStaffPanel/(tabs)/history" as any)}
                style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: "#10B98115" }]}>
                  <Feather name="check-circle" size={18} color="#10B981" />
                </View>
                <Text style={[styles.statValue, { color: textPrimary }]}>{verifiedCount}</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>Published & Verified</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/VerificationStaffPanel/(tabs)/inspections" as any)}
                style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: "#3B82F615" }]}>
                  <Feather name="shield" size={18} color="#3B82F6" />
                </View>
                <Text style={[styles.statValue, { color: textPrimary }]}>{dueInspectionsCount}</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>6-Mo Inspections Due</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/VerificationStaffPanel/(tabs)/complaints" as any)}
                style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}
              >
                <View style={[styles.statIconWrap, { backgroundColor: "#EF444415" }]}>
                  <Feather name="alert-triangle" size={18} color="#EF4444" />
                </View>
                <Text style={[styles.statValue, { color: textPrimary }]}>{openComplaintsCount}</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>Active Complaints</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Action Hub */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>Quick Verification Actions</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity
                  onPress={() => router.push("/VerificationStaffPanel/(tabs)/pending" as any)}
                  style={[styles.actionBtn, { backgroundColor: "#0D9488" }]}
                >
                  <View style={styles.actionBtnIcon}>
                    <Feather name="camera" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionBtnText}>Start Property Audit</Text>
                  <Text style={styles.actionBtnSub}>Guided photo & KYC</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/VerificationStaffPanel/(tabs)/inspections" as any)}
                  style={[styles.actionBtn, { backgroundColor: "#0284C7" }]}
                >
                  <View style={styles.actionBtnIcon}>
                    <Feather name="check-square" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionBtnText}>6-Month Checklist</Text>
                  <Text style={styles.actionBtnSub}>Periodic safety audit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Real-time Pending Queue */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.sectionTitle, { color: textPrimary }]}>Assigned Queue</Text>
                  <View style={[styles.countChip, { backgroundColor: isDark ? "#134E4A" : "#CCFBF1" }]}>
                    <Text style={styles.countChipText}>{pendingQueue.length} Active</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => router.push("/VerificationStaffPanel/(tabs)/pending" as any)}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>

              {pendingQueue.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}>
                  <Ionicons name="checkmark-done-circle-outline" size={48} color="#10B981" />
                  <Text style={[styles.emptyTitle, { color: textPrimary }]}>Queue Cleared!</Text>
                  <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                    No pending property verifications assigned right now. Live updates will arrive here automatically via Socket.
                  </Text>
                </View>
              ) : (
                pendingQueue.slice(0, 5).map((lead) => (
                  <View
                    key={lead._id}
                    style={[
                      styles.leadCard,
                      {
                        backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                        borderColor: borderCol,
                      },
                    ]}
                  >
                    <View style={styles.leadCardHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <View style={styles.leadIdChip}>
                            <Text style={styles.leadIdChipText}>{lead.leadId || "LEAD"}</Text>
                          </View>
                          <View style={[styles.statusChip, { backgroundColor: "#F59E0B15" }]}>
                            <Text style={[styles.statusChipText, { color: "#D97706" }]}>
                              {lead.status === "assigned" ? "Assigned" : "Under Verification"}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.leadTitle, { color: textPrimary }]} numberOfLines={1}>
                          {lead.propertyType || "Residential"} • {lead.locality || "Property Site"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.leadDetailsRow}>
                      <View style={styles.detailItem}>
                        <Feather name="user" size={13} color={textSecondary} />
                        <Text style={[styles.detailText, { color: textSecondary }]} numberOfLines={1}>
                          {lead.ownerName || "Owner"}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <FontAwesome5 name="rupee-sign" size={12} color="#10B981" />
                        <Text style={[styles.detailText, { color: "#10B981", fontWeight: "700" }]}>
                          ₹{Number(lead.expectedPrice || 0).toLocaleString("en-IN")}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Feather name="map-pin" size={13} color={textSecondary} />
                        <Text style={[styles.detailText, { color: textSecondary }]} numberOfLines={1}>
                          {typeof lead.city === "string"
                            ? lead.city
                            : lead.address?.city || "City"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => handleStartVerification(lead)}
                        style={styles.verifyActionBtn}
                      >
                        <Feather name="shield" size={14} color="#FFFFFF" />
                        <Text style={styles.verifyActionBtnText}>Verify & Publish</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Privacy & Masking Policy Banner */}
            <View style={[styles.infoBanner, { backgroundColor: isDark ? "#082F49" : "#E0F2FE", borderColor: "#38BDF8" }]}>
              <Feather name="lock" size={18} color="#0284C7" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.infoBannerTitle, { color: isDark ? "#BAE6FD" : "#0369A1" }]}>
                  Live Privacy & Anti-Leak Policy
                </Text>
                <Text style={[styles.infoBannerText, { color: isDark ? "#93C5FD" : "#0C4A6E" }]}>
                  Once you publish a listing, owner contacts are locked & masked. Super Admin retains exclusive rights to edit finalized records.
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Property Verification Modal */}
      {selectedLeadForVerify && (
        <PropertyVerificationModal
          visible={isVerifyModalVisible}
          lead={selectedLeadForVerify}
          onClose={() => setIsVerifyModalVisible(false)}
          onSuccess={() => {
            setIsVerifyModalVisible(false);
            fetchDashboardData();
          }}
        />
      )}

      {/* Real-time Notification Modal */}
      <NotificationModal
        visible={isNotifModalVisible}
        onClose={() => setIsNotifModalVisible(false)}
        onOpenLead={(lead) => {
          handleStartVerification(lead);
        }}
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  panelBadge: {
    fontSize: 10,
    fontWeight: "900",
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerNotifBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: "#EF4444",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#0D9488",
  },
  headerNotifBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  content: {
    padding: 16,
    gap: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  countChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countChipText: {
    color: "#0D9488",
    fontSize: 11,
    fontWeight: "800",
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D9488",
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    justifyContent: "center",
  },
  actionBtnIcon: {
    marginBottom: 8,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  actionBtnSub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    marginTop: 2,
  },
  leadCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  leadCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leadIdChip: {
    backgroundColor: "#0D948815",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leadIdChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0D9488",
  },
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: "800",
  },
  leadTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  leadDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "32%",
  },
  detailText: {
    fontSize: 11,
  },
  cardActions: {
    marginTop: 4,
  },
  verifyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  verifyActionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoBannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
  },
  infoBannerText: {
    fontSize: 11,
    lineHeight: 15,
  },
});
