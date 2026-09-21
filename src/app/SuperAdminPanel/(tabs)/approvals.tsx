import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Linking,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";
import {
  SuperAdminLeadDetailModal,
  SuperAdminCommissionModal,
  SuperAdminDealModal,
  SuperAdminSideMenu,
  SuperAdminNotificationModal,
} from "../../../components/SuperAdminComponent";

type TabSegment = "commissions" | "owner_payouts" | "duplicates" | "deals";

export default function SuperAdminApprovalsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();

  const [currentTab, setCurrentTab] = useState<TabSegment>("commissions");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Data states
  const [agentCommissions, setAgentCommissions] = useState<any[]>([]);
  const [ownerPayouts, setOwnerPayouts] = useState<any[]>([]);
  const [duplicateLeads, setDuplicateLeads] = useState<any[]>([]);
  const [pendingDeals, setPendingDeals] = useState<any[]>([]);

  // Modals
  const [isSideMenuVisible, setIsSideMenuVisible] = useState<boolean>(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isCommissionModalVisible, setIsCommissionModalVisible] = useState<boolean>(false);
  const [isDealModalVisible, setIsDealModalVisible] = useState<boolean>(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);

  const fetchApprovalsData = useCallback(async () => {
    try {
      const [payoutsRes, duplicatesRes, leadsRes] = await Promise.all([
        apiClient.get("/leads/admin/payouts"),
        apiClient.get("/leads/admin/duplicates"),
        apiClient.get("/leads/admin/all?limit=50"),
      ]);

      if (payoutsRes.data?.data) {
        setAgentCommissions(payoutsRes.data.data.agentCommissions || []);
        setOwnerPayouts(payoutsRes.data.data.ownerPayouts || []);
      }
      if (duplicatesRes.data?.data) {
        setDuplicateLeads(duplicatesRes.data.data);
      }
      if (leadsRes.data?.data?.leads) {
        // Pending deals: verified leads not yet closed as rented/sold
        const verifiedNotClosed = leadsRes.data.data.leads.filter(
          (l: any) => l.status === "verified" && !l.deal?.isClosed
        );
        setPendingDeals(verifiedNotClosed);
      }
    } catch (e: any) {
      console.warn("Error fetching approvals data:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovalsData();
  }, [fetchApprovalsData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApprovalsData();
  };

  const handleReleaseOwnerPayout = async (leadId: string, payoutIdx: number, ownerName: string) => {
    Alert.alert(
      "Release Owner Rent Payout",
      "Confirm rent disbursement release to " + ownerName + "?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve & Release",
          onPress: async () => {
            try {
              await apiClient.patch("/leads/" + leadId + "/owner-payout", {
                payoutIndex: payoutIdx,
                status: "released",
                utrNumber: "UPI-" + Math.floor(1000000000 + Math.random() * 9000000000),
                paymentMode: "UPI",
                remarks: "Approved and released by Super Admin",
              });
              Alert.alert("Success", "Rent payout released to property owner!");
              fetchApprovalsData();
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  };

  const handleResolveDuplicate = async (leadId: string, action: "resolve" | "dismiss" | "archive") => {
    try {
      await apiClient.patch("/leads/" + leadId + "/resolve-duplicate", {
        action,
        notes: action === "archive" ? "Archived duplicate listing" : "Resolved by Super Admin",
      });
      Alert.alert("Success", "Duplicate status updated to: " + action.toUpperCase());
      fetchApprovalsData();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const pendingCommCount = agentCommissions.filter((c) => c.commission?.status === "pending").length;
  const pendingOwnerCount = ownerPayouts.reduce((acc, p) => {
    const pend = (p.ownerPayouts || []).filter((item: any) => item.status === "pending").length;
    return acc + pend;
  }, 0);
  const flaggedDupCount = duplicateLeads.filter((d) => d.duplicateFlag?.status === "flagged").length;

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
              <Text style={styles.panelBadge}>SUPER ADMIN APPROVAL DESK</Text>
              <Text style={styles.headerTitle}>Approvals & Payouts</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={() => setIsNotificationModalVisible(true)}
              style={styles.headerIconCircle}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onRefresh} style={styles.headerIconCircle}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Approve agent commissions, release owner rent disbursements & resolve duplicate flags
        </Text>
      </LinearGradient>

      {/* Segment Tabs */}
      <View style={[styles.segmentContainer, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", borderBottomColor: isDark ? "#1E293B" : "#E2E8F0" }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentScroll}>
          {[
            { id: "commissions", label: "Agent Commissions", count: pendingCommCount },
            { id: "owner_payouts", label: "Owner Payouts", count: pendingOwnerCount },
            { id: "duplicates", label: "Duplicate Review", count: flaggedDupCount },
            { id: "deals", label: "Pending Deals", count: pendingDeals.length },
          ].map((seg) => {
            const isActive = currentTab === seg.id;
            return (
              <TouchableOpacity
                key={seg.id}
                onPress={() => setCurrentTab(seg.id as TabSegment)}
                style={[
                  styles.segmentTab,
                  isActive && { borderBottomColor: "#0D9488", borderBottomWidth: 3 },
                ]}
              >
                <Text
                  style={[
                    styles.segmentTabText,
                    {
                      color: isActive ? "#0D9488" : colors.textSecondary,
                      fontWeight: isActive ? "800" : "600",
                    },
                  ]}
                >
                  {seg.label}
                </Text>
                {seg.count > 0 && (
                  <View style={[styles.badgePill, { backgroundColor: isActive ? "#0D9488" : "#E2E8F0" }]}>
                    <Text style={[styles.badgePillText, { color: isActive ? "#FFFFFF" : "#475569" }]}>
                      {seg.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 85, 115) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <ActivityIndicator color="#0D9488" size="large" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* 1. COMMISSION APPROVALS TAB */}
            {currentTab === "commissions" && (
              <View style={styles.tabSection}>
                {agentCommissions.length === 0 ? (
                  <View style={[styles.emptyBox, { borderColor: colors.border }]}>
                    <Feather name="check-circle" size={32} color="#10B981" />
                    <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>All Commissions Cleared</Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>No pending agent commission requests.</Text>
                  </View>
                ) : (
                  agentCommissions.map((lead) => {
                    const comm = lead.commission || {};
                    const isPending = comm.status === "pending";
                    const isPaid = comm.status === "paid";

                    return (
                      <View
                        key={lead._id}
                        style={[
                          styles.card,
                          {
                            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                            borderColor: isPending ? "#F59E0B" : colors.border,
                          },
                        ]}
                      >
                        <View style={styles.cardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.leadIdText}>{lead.leadId || "LEAD"}</Text>
                            <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]} numberOfLines={1}>
                              {lead.title || "Property in " + lead.locality}
                            </Text>
                          </View>
                          <View style={[styles.statusTag, { backgroundColor: isPaid ? "#DCFCE7" : isPending ? "#FEF3C7" : "#CCFBF1" }]}>
                            <Text style={{ color: isPaid ? "#166534" : isPending ? "#92400E" : "#0F766E", fontSize: 11, fontWeight: "700" }}>
                              {(comm.status || "PENDING").toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.agentStrip, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                          <View>
                            <Text style={[styles.agentName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                              {lead.agent?.name || "Agent"} ({lead.agent?.staffId || "AGT"})
                            </Text>
                            <Text style={[styles.agentPhone, { color: colors.textSecondary }]}>
                              UPI: {lead.agent?.upiId || lead.agent?.bankDetails?.upiId || "Not registered"}
                            </Text>
                          </View>

                          <View style={{ alignItems: "flex-end" }}>
                            <Text style={[styles.amountValue, { color: "#0D9488" }]}>
                              ₹{(comm.approvedAmount || comm.estimatedAmount || 0).toLocaleString("en-IN")}
                            </Text>
                            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
                              {comm.approvedAmount ? "Approved Amount" : "Estimated"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedLead(lead);
                              setIsDetailModalVisible(true);
                            }}
                            style={[styles.outlineBtn, { borderColor: colors.border }]}
                          >
                            <Feather name="eye" size={14} color={isDark ? "#94A3B8" : "#475569"} />
                            <Text style={[styles.outlineBtnText, { color: isDark ? "#CBD5E1" : "#475569" }]}>View Property</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setSelectedLead(lead);
                              setIsCommissionModalVisible(true);
                            }}
                            style={[styles.filledBtn, { backgroundColor: "#0D9488" }]}
                          >
                            <Ionicons name="cash-outline" size={14} color="#FFFFFF" />
                            <Text style={styles.filledBtnText}>
                              {isPending ? "Review & Approve" : "Edit Payout"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* 2. OWNER RENT PAYOUTS TAB */}
            {currentTab === "owner_payouts" && (
              <View style={styles.tabSection}>
                {ownerPayouts.length === 0 ? (
                  <View style={[styles.emptyBox, { borderColor: colors.border }]}>
                    <Feather name="check-circle" size={32} color="#10B981" />
                    <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>No Owner Payouts Queued</Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>When properties are rented, owner payouts appear here.</Text>
                  </View>
                ) : (
                  ownerPayouts.map((lead) => {
                    return (
                      <View
                        key={lead._id}
                        style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}
                      >
                        <View style={styles.cardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.leadIdText}>{lead.leadId || "RENT-UNIT"}</Text>
                            <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                              {lead.title || "Property in " + lead.locality}
                            </Text>
                          </View>
                          <Text style={[styles.amountValue, { color: "#10B981" }]}>
                            ₹{(lead.expectedPrice || 0).toLocaleString("en-IN")}/mo
                          </Text>
                        </View>

                        <View style={[styles.ownerBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                          <Text style={[styles.ownerNameTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                            Owner: {lead.ownerName} (+91 {lead.ownerPhone})
                          </Text>
                          <Text style={[styles.tenantSub, { color: colors.textSecondary }]}>
                            Tenant: {lead.deal?.tenantName || "Direct Tenant"} ({lead.deal?.tenantPhone || "—"})
                          </Text>
                        </View>

                        {/* Payout Items */}
                        {(lead.ownerPayouts || []).map((payout: any, pIdx: number) => {
                          const isReleased = payout.status === "released";
                          return (
                            <View key={pIdx} style={[styles.payoutItem, { borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                              <View>
                                <Text style={[styles.payoutMonth, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                                  {payout.month || "Current Month"} • Net: ₹{payout.amount?.toLocaleString("en-IN")}
                                </Text>
                                <Text style={[styles.payoutRef, { color: colors.textMuted }]}>
                                  Mode: {payout.paymentMode || "UPI"} {payout.utrNumber ? "• UTR: " + payout.utrNumber : ""}
                                </Text>
                              </View>

                              {isReleased ? (
                                <View style={[styles.statusTag, { backgroundColor: "#DCFCE7" }]}>
                                  <Text style={{ color: "#166534", fontSize: 11, fontWeight: "700" }}>RELEASED</Text>
                                </View>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => handleReleaseOwnerPayout(lead._id, pIdx, lead.ownerName)}
                                  style={[styles.smallActionBtn, { backgroundColor: "#10B981" }]}
                                >
                                  <Feather name="send" size={12} color="#FFFFFF" />
                                  <Text style={styles.smallActionBtnText}>Release</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* 3. DUPLICATE REVIEW TAB */}
            {currentTab === "duplicates" && (
              <View style={styles.tabSection}>
                {duplicateLeads.length === 0 ? (
                  <View style={[styles.emptyBox, { borderColor: colors.border }]}>
                    <Feather name="check-circle" size={32} color="#10B981" />
                    <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>No Duplicate Flags</Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>The duplicate detection algorithm has not flagged any collisions.</Text>
                  </View>
                ) : (
                  duplicateLeads.map((dup) => {
                    const original = dup.duplicateFlag?.duplicateOf;
                    return (
                      <View
                        key={dup._id}
                        style={[
                          styles.card,
                          {
                            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                            borderColor: "#F59E0B",
                          },
                        ]}
                      >
                        <View style={styles.dupHeader}>
                          <Ionicons name="warning" size={18} color="#D97706" />
                          <Text style={[styles.dupHeaderText, { color: isDark ? "#FCD34D" : "#92400E" }]}>
                            Duplicate Listing Collision
                          </Text>
                          <View style={[styles.statusTag, { backgroundColor: "#FEF3C7" }]}>
                            <Text style={{ color: "#92400E", fontSize: 10, fontWeight: "800" }}>
                              {(dup.duplicateFlag?.status || "FLAGGED").toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.dupReason, { color: colors.textSecondary }]}>
                          {dup.duplicateFlag?.duplicateReason || "Owner phone or address matches an existing entry."}
                        </Text>

                        {/* Comparison Box */}
                        <View style={styles.comparisonRow}>
                          <View style={[styles.compBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                            <Text style={[styles.compTitle, { color: "#0D9488" }]}>NEW SUBMISSION</Text>
                            <Text style={[styles.compName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>{dup.ownerName}</Text>
                            <Text style={[styles.compPhone, { color: colors.textSecondary }]}>+91 {dup.ownerPhone}</Text>
                            <Text style={[styles.compAgent, { color: colors.textMuted }]}>Agent: {dup.agent?.name || "Agent"}</Text>
                          </View>

                          {original && (
                            <View style={[styles.compBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                              <Text style={[styles.compTitle, { color: "#3B82F6" }]}>EXISTING RECORD</Text>
                              <Text style={[styles.compName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>{original.ownerName}</Text>
                              <Text style={[styles.compPhone, { color: colors.textSecondary }]}>+91 {original.ownerPhone}</Text>
                              <Text style={[styles.compAgent, { color: colors.textMuted }]}>ID: {original.leadId || "ORIG"}</Text>
                            </View>
                          )}
                        </View>

                        {/* Resolution Actions */}
                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            onPress={() => handleResolveDuplicate(dup._id, "dismiss")}
                            style={[styles.outlineBtn, { borderColor: "#10B981" }]}
                          >
                            <Feather name="check" size={14} color="#10B981" />
                            <Text style={[styles.outlineBtnText, { color: "#10B981" }]}>Keep (Valid)</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleResolveDuplicate(dup._id, "archive")}
                            style={[styles.filledBtn, { backgroundColor: "#EF4444" }]}
                          >
                            <Feather name="trash-2" size={14} color="#FFFFFF" />
                            <Text style={styles.filledBtnText}>Archive Duplicate</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* 4. PENDING DEALS TAB */}
            {currentTab === "deals" && (
              <View style={styles.tabSection}>
                {pendingDeals.length === 0 ? (
                  <View style={[styles.emptyBox, { borderColor: colors.border }]}>
                    <Feather name="check-circle" size={32} color="#10B981" />
                    <Text style={[styles.emptyTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>No Pending Verified Leads</Text>
                    <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Verified properties ready to close deals will be listed here.</Text>
                  </View>
                ) : (
                  pendingDeals.map((lead) => {
                    return (
                      <View
                        key={lead._id}
                        style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}
                      >
                        <View style={styles.cardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.leadIdText}>{lead.leadId || "VERIFIED"}</Text>
                            <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                              {lead.title || lead.propertyType + " in " + lead.locality}
                            </Text>
                          </View>
                          <View style={[styles.statusTag, { backgroundColor: "#DCFCE7" }]}>
                            <Text style={{ color: "#166534", fontSize: 11, fontWeight: "700" }}>VERIFIED</Text>
                          </View>
                        </View>

                        <View style={[styles.agentStrip, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                          <View>
                            <Text style={[styles.agentName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                              Owner: {lead.ownerName} (+91 {lead.ownerPhone})
                            </Text>
                            <Text style={[styles.agentPhone, { color: colors.textSecondary }]}>
                              Locality: {lead.locality}
                            </Text>
                          </View>

                          <Text style={[styles.amountValue, { color: "#0D9488" }]}>
                            ₹{(lead.expectedPrice || 0).toLocaleString("en-IN")}
                          </Text>
                        </View>

                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedLead(lead);
                              setIsDetailModalVisible(true);
                            }}
                            style={[styles.outlineBtn, { borderColor: colors.border }]}
                          >
                            <Feather name="eye" size={14} color={isDark ? "#94A3B8" : "#475569"} />
                            <Text style={[styles.outlineBtnText, { color: isDark ? "#CBD5E1" : "#475569" }]}>Inspect Lead</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => {
                              setSelectedLead(lead);
                              setIsDealModalVisible(true);
                            }}
                            style={[styles.filledBtn, { backgroundColor: "#10B981" }]}
                          >
                            <Feather name="check-circle" size={14} color="#FFFFFF" />
                            <Text style={styles.filledBtnText}>Finalize Deal</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Side Bar Menu */}
      <SuperAdminSideMenu
        visible={isSideMenuVisible}
        onClose={() => setIsSideMenuVisible(false)}
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
        onCommissionPress={(l) => {
          setIsDetailModalVisible(false);
          setSelectedLead(l);
          setIsCommissionModalVisible(true);
        }}
        onDealPress={(l) => {
          setIsDetailModalVisible(false);
          setSelectedLead(l);
          setIsDealModalVisible(true);
        }}
      />

      <SuperAdminCommissionModal
        visible={isCommissionModalVisible}
        lead={selectedLead}
        onClose={() => setIsCommissionModalVisible(false)}
        onSuccess={fetchApprovalsData}
      />

      <SuperAdminDealModal
        visible={isDealModalVisible}
        lead={selectedLead}
        onClose={() => setIsDealModalVisible(false)}
        onSuccess={fetchApprovalsData}
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
    borderBottomWidth: 1,
  },
  segmentScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  segmentTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  segmentTabText: {
    fontSize: 13,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: "800",
  },
  content: {
    padding: 16,
  },
  tabSection: {
    gap: 14,
  },
  emptyBox: {
    padding: 40,
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
  emptySub: {
    fontSize: 12,
    textAlign: "center",
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leadIdText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  agentStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  agentName: {
    fontSize: 13,
    fontWeight: "700",
  },
  agentPhone: {
    fontSize: 11,
    marginTop: 2,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
  ownerBox: {
    padding: 10,
    borderRadius: 12,
    gap: 2,
  },
  ownerNameTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  tenantSub: {
    fontSize: 11,
  },
  payoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  payoutMonth: {
    fontSize: 13,
    fontWeight: "700",
  },
  payoutRef: {
    fontSize: 11,
  },
  smallActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallActionBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  dupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dupHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  dupReason: {
    fontSize: 12,
    lineHeight: 18,
  },
  comparisonRow: {
    flexDirection: "row",
    gap: 10,
  },
  compBox: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    gap: 2,
  },
  compTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  compName: {
    fontSize: 13,
    fontWeight: "700",
  },
  compPhone: {
    fontSize: 11,
  },
  compAgent: {
    fontSize: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  filledBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  filledBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
