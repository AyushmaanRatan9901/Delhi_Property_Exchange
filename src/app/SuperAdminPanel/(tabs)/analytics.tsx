import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Linking,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { SuperAdminSideMenu } from "../../../components/SuperAdminComponent";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";

const { width } = Dimensions.get("window");

export default function SuperAdminAnalyticsScreen() {
  const [isSideMenuVisible, setIsSideMenuVisible] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();

  const [activeSegment, setActiveSegment] = useState<"analytics" | "ledger">("analytics");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [rentLedgerData, setRentLedgerData] = useState<any[]>([]);

  // Dispute / update modal state
  const [editingLedgerLead, setEditingLedgerLead] = useState<any>(null);
  const [disputeNote, setDisputeNote] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, ledgerRes] = await Promise.all([
        apiClient.get("/leads/admin/analytics"),
        apiClient.get("/leads/admin/rent-ledger"),
      ]);

      if (analyticsRes.data?.data) {
        setAnalyticsData(analyticsRes.data.data);
      }
      if (ledgerRes.data?.data) {
        setRentLedgerData(ledgerRes.data.data);
      }
    } catch (e: any) {
      console.warn("Could not load analytics/ledger data:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleUpdateLedgerStatus = async (leadId: string, entryIdx: number, newStatus: "PAID" | "OVERDUE" | "DISPUTED") => {
    try {
      await apiClient.patch("/leads/" + leadId + "/rent-ledger", {
        ledgerIndex: entryIdx,
        status: newStatus,
        utrNumber: newStatus === "PAID" ? "UPI-" + Math.floor(1000000000 + Math.random() * 9000000000) : undefined,
        resolved: newStatus === "PAID",
      });
      Alert.alert("Ledger Updated", "Payment status recorded as " + newStatus);
      fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const handleResolveDispute = async (leadId: string, entryIdx: number) => {
    try {
      await apiClient.patch("/leads/" + leadId + "/rent-ledger", {
        ledgerIndex: entryIdx,
        status: "PAID",
        disputeNote: disputeNote ? "Resolved: " + disputeNote : "Dispute resolved by Super Admin",
        resolved: true,
      });
      Alert.alert("Dispute Resolved", "Ledger entry updated to PAID & Resolved.");
      setEditingLedgerLead(null);
      setDisputeNote("");
      fetchData();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const statusBreakdown = analyticsData?.statusBreakdown || {};
  const localityStats = analyticsData?.localityStats || [];
  const leaderboard = analyticsData?.leaderboard || [];

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
              <Text style={styles.panelBadge}>BUSINESS INTELLIGENCE</Text>
              <Text style={styles.headerTitle}>Analytics & Rent Ledger</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.headerIconCircle}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Hyperlocal locality velocity, agent leaderboard & universal rent ledger tracking
        </Text>
      </LinearGradient>

      {/* Segment Switcher */}
      <View style={[styles.segmentContainer, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", borderBottomColor: isDark ? "#1E293B" : "#E2E8F0" }]}>
        <TouchableOpacity
          onPress={() => setActiveSegment("analytics")}
          style={[styles.segmentBtn, activeSegment === "analytics" && styles.activeSegmentBtn]}
        >
          <Feather name="bar-chart-2" size={16} color={activeSegment === "analytics" ? "#0D9488" : colors.textSecondary} />
          <Text style={[styles.segmentBtnText, { color: activeSegment === "analytics" ? "#0D9488" : colors.textSecondary, fontWeight: activeSegment === "analytics" ? "800" : "600" }]}>
            Hyperlocal Intelligence
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveSegment("ledger")}
          style={[styles.segmentBtn, activeSegment === "ledger" && styles.activeSegmentBtn]}
        >
          <Ionicons name="receipt-outline" size={16} color={activeSegment === "ledger" ? "#0D9488" : colors.textSecondary} />
          <Text style={[styles.segmentBtnText, { color: activeSegment === "ledger" ? "#0D9488" : colors.textSecondary, fontWeight: activeSegment === "ledger" ? "800" : "600" }]}>
            Universal Rent Ledger ({rentLedgerData.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 85, 115) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <ActivityIndicator color="#0D9488" size="large" style={{ marginVertical: 40 }} />
        ) : activeSegment === "analytics" ? (
          <>
            {/* 1. Inventory Pipeline Funnel */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Feather name="layers" size={18} color="#0D9488" />
                <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Inventory Pipeline Funnel
                </Text>
              </View>

              <View style={styles.funnelRow}>
                <View style={[styles.funnelStep, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}>
                  <Text style={[styles.funnelVal, { color: "#2563EB" }]}>{statusBreakdown.new || 0}</Text>
                  <Text style={[styles.funnelLabel, { color: colors.textSecondary }]}>New Submissions</Text>
                </View>

                <View style={[styles.funnelStep, { backgroundColor: "rgba(245, 158, 11, 0.12)" }]}>
                  <Text style={[styles.funnelVal, { color: "#D97706" }]}>{statusBreakdown.underVerification || 0}</Text>
                  <Text style={[styles.funnelLabel, { color: colors.textSecondary }]}>Under Inspection</Text>
                </View>

                <View style={[styles.funnelStep, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}>
                  <Text style={[styles.funnelVal, { color: "#166534" }]}>{statusBreakdown.verified || 0}</Text>
                  <Text style={[styles.funnelLabel, { color: colors.textSecondary }]}>Verified Inventory</Text>
                </View>

                <View style={[styles.funnelStep, { backgroundColor: "rgba(13, 148, 136, 0.12)" }]}>
                  <Text style={[styles.funnelVal, { color: "#0F766E" }]}>
                    {(statusBreakdown.rented || 0) + (statusBreakdown.sold || 0)}
                  </Text>
                  <Text style={[styles.funnelLabel, { color: colors.textSecondary }]}>Closed Deals</Text>
                </View>
              </View>
            </View>

            {/* 2. Hyperlocal Locality Breakdown */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Feather name="map" size={18} color="#0D9488" />
                <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Hyperlocal Locality Distribution
                </Text>
              </View>

              {localityStats.length === 0 ? (
                <Text style={{ color: colors.textMuted, fontSize: 13, padding: 10 }}>No locality metrics recorded yet.</Text>
              ) : (
                localityStats.map((loc: any, idx: number) => {
                  const conversionPct = loc.total > 0 ? Math.round((loc.closed / loc.total) * 100) : 0;
                  return (
                    <View key={idx} style={[styles.localityRow, { borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.localityName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          {loc._id || "Delhi NCR"}
                        </Text>
                        <Text style={[styles.localitySub, { color: colors.textSecondary }]}>
                          Total: {loc.total} • Verified: {loc.verified} • Closed: {loc.closed}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[styles.conversionText, { color: "#0D9488" }]}>
                          {conversionPct}% Closed
                        </Text>
                        <Text style={[styles.revText, { color: colors.textMuted }]}>
                          ₹{(loc.revenue || 0).toLocaleString("en-IN")} vol.
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* 3. Agent Performance Leaderboard */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Feather name="award" size={18} color="#F59E0B" />
                <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Agent & Broker Performance Leaderboard
                </Text>
              </View>

              {leaderboard.length === 0 ? (
                <Text style={{ color: colors.textMuted, fontSize: 13, padding: 10 }}>No leaderboard data available.</Text>
              ) : (
                leaderboard.map((agt: any, rank: number) => {
                  const medal = rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : "#" + (rank + 1);
                  return (
                    <View key={rank} style={[styles.leaderboardRow, { borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankText}>{medal}</Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.agtName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          {agt.agentName || "Agent Partner"}
                        </Text>
                        <Text style={[styles.agtPhone, { color: colors.textSecondary }]}>
                          {agt.totalSubmissions} Leads • {agt.verifiedCount} Verified • {agt.dealsClosed} Closed
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[styles.commEarned, { color: "#10B981" }]}>
                          ₹{(agt.commissionEarned || 0).toLocaleString("en-IN")}
                        </Text>
                        <Text style={[styles.commLabel, { color: colors.textMuted }]}>Earned</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        ) : (
          /* 2. UNIVERSAL RENT LEDGER */
          <View style={styles.ledgerSection}>
            {rentLedgerData.length === 0 ? (
              <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border, alignItems: "center", padding: 30 }]}>
                <Feather name="file-text" size={36} color="#94A3B8" />
                <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A", marginTop: 8 }]}>No Rented Properties Found</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Once properties are marked as Rented from the Dashboard or Approvals, rent collection ledger items will appear here.
                </Text>
              </View>
            ) : (
              rentLedgerData.map((lead) => {
                const deal = lead.deal || {};
                const ledgerItems = lead.rentLedger?.length > 0 ? lead.rentLedger : [
                  {
                    month: "Current Month",
                    amount: lead.expectedPrice || 0,
                    status: "PENDING",
                  },
                ];

                return (
                  <View
                    key={lead._id}
                    style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.leadIdText}>{lead.leadId || "LEASE"}</Text>
                        <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          {lead.title || (lead.propertyType + " in " + lead.locality)}
                        </Text>
                      </View>
                      <View style={styles.agreementPill}>
                        <Text style={styles.agreementPillText}>{deal.agreementNumber || "AGR-ACTIVE"}</Text>
                      </View>
                    </View>

                    <View style={[styles.ledgerTenantRow, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                      <View>
                        <Text style={[styles.tenantName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          Tenant: {deal.tenantName || "Direct Tenant"} (+91 {deal.tenantPhone || "—"})
                        </Text>
                        <Text style={[styles.ownerSub, { color: colors.textSecondary }]}>
                          Owner: {lead.ownerName} (+91 {lead.ownerPhone})
                        </Text>
                      </View>
                      <Text style={[styles.rentPrice, { color: "#0D9488" }]}>
                        ₹{(lead.expectedPrice || 0).toLocaleString("en-IN")}/mo
                      </Text>
                    </View>

                    {/* Ledger Entries */}
                    {ledgerItems.map((entry: any, eIdx: number) => {
                      const isPaid = entry.status === "PAID";
                      const isDisputed = entry.status === "DISPUTED";
                      const isOverdue = entry.status === "OVERDUE";

                      return (
                        <View key={eIdx} style={[styles.ledgerEntryCard, { borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                              <Text style={[styles.entryMonth, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                                {entry.month || "Month"}
                              </Text>
                              <View style={[
                                styles.entryStatusPill,
                                {
                                  backgroundColor: isPaid ? "#DCFCE7" : isDisputed ? "#FEE2E2" : isOverdue ? "#FEF3C7" : "#E0F2FE",
                                }
                              ]}>
                                <Text style={{
                                  color: isPaid ? "#166534" : isDisputed ? "#991B1B" : isOverdue ? "#92400E" : "#0369A1",
                                  fontSize: 10,
                                  fontWeight: "800"
                                }}>
                                  {entry.status || "PENDING"}
                                </Text>
                              </View>
                            </View>

                            <Text style={[styles.entrySub, { color: colors.textMuted }]}>
                              Amount: ₹{(entry.amount || lead.expectedPrice || 0).toLocaleString("en-IN")}
                              {entry.utrNumber ? " • Ref: " + entry.utrNumber : ""}
                            </Text>

                            {entry.disputeNote ? (
                              <Text style={{ color: "#EF4444", fontSize: 11, marginTop: 2 }}>
                                Note: {entry.disputeNote}
                              </Text>
                            ) : null}
                          </View>

                          {/* Action Buttons for Ledger */}
                          <View style={styles.entryActions}>
                            {!isPaid && (
                              <TouchableOpacity
                                onPress={() => handleUpdateLedgerStatus(lead._id, eIdx, "PAID")}
                                style={[styles.ledgerActionBtn, { backgroundColor: "#10B981" }]}
                              >
                                <Feather name="check" size={12} color="#FFFFFF" />
                                <Text style={styles.ledgerActionBtnText}>Paid</Text>
                              </TouchableOpacity>
                            )}

                            {isDisputed && (
                              <TouchableOpacity
                                onPress={() => handleResolveDispute(lead._id, eIdx)}
                                style={[styles.ledgerActionBtn, { backgroundColor: "#0D9488" }]}
                              >
                                <Feather name="shield" size={12} color="#FFFFFF" />
                                <Text style={styles.ledgerActionBtnText}>Resolve</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
      {/* Side Bar Menu */}
      <SuperAdminSideMenu
        visible={isSideMenuVisible}
        onClose={() => setIsSideMenuVisible(false)}
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
    paddingBottom: 16,
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
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSubtitle: {
    color: "#CCFBF1",
    fontSize: 12,
    marginTop: 4,
  },
  segmentContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  activeSegmentBtn: {
    borderBottomWidth: 3,
    borderBottomColor: "#0D9488",
  },
  segmentBtnText: {
    fontSize: 13,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  leadIdText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  funnelRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  funnelStep: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  funnelVal: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 2,
  },
  funnelLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  localityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  localityName: {
    fontSize: 14,
    fontWeight: "700",
  },
  localitySub: {
    fontSize: 11,
    marginTop: 2,
  },
  conversionText: {
    fontSize: 13,
    fontWeight: "800",
  },
  revText: {
    fontSize: 11,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  rankBadge: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 18,
  },
  agtName: {
    fontSize: 14,
    fontWeight: "700",
  },
  agtPhone: {
    fontSize: 11,
    marginTop: 2,
  },
  commEarned: {
    fontSize: 14,
    fontWeight: "800",
  },
  commLabel: {
    fontSize: 10,
  },
  ledgerSection: {
    gap: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySub: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  agreementPill: {
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  agreementPillText: {
    color: "#0F766E",
    fontSize: 11,
    fontWeight: "800",
  },
  ledgerTenantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  tenantName: {
    fontSize: 13,
    fontWeight: "700",
  },
  ownerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  rentPrice: {
    fontSize: 15,
    fontWeight: "800",
  },
  ledgerEntryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  entryMonth: {
    fontSize: 13,
    fontWeight: "700",
  },
  entryStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  entrySub: {
    fontSize: 11,
    marginTop: 2,
  },
  entryActions: {
    flexDirection: "row",
    gap: 6,
  },
  ledgerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ledgerActionBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
});
