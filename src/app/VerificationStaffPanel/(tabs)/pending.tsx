import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, FontAwesome5 } from "@expo/vector-icons";
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

export default function PendingVerificationsScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const { colors, isDark } = useResponsiveTheme();

  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  // Redux live assigned leads & notifications
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "assigned" | "under_verification" | "new">("ALL");

  // Modals
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNotifModalVisible, setIsNotifModalVisible] = useState(false);

  const fetchPendingLeads = useCallback(async () => {
    try {
      const res = await apiClient.get("/leads/assigned-to-me?limit=50");
      if (res.data?.data?.leads) {
        dispatch(setAssignedLeads(res.data.data.leads));
      }
    } catch (err) {
      console.error("Error fetching assigned leads:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchPendingLeads();
  }, [fetchPendingLeads]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingLeads();
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`);
    }
  };

  const handleOpenMap = (leadItem: any) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    const lat = leadItem.gpsDetails?.latitude || leadItem.latitude || 28.6332;
    const lng = leadItem.gpsDetails?.longitude || leadItem.longitude || 77.3678;
    const label = encodeURIComponent(leadItem.locality || "Property");
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${label}`);
  };

  const handleStartVerification = (leadItem: any) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setSelectedLead(leadItem);
    setIsModalVisible(true);
  };

  const filteredLeads = assignedLeads
    .filter((l) => {
      if (activeFilter === "ALL") return ["assigned", "under_verification", "new"].includes(l.status);
      return l.status === activeFilter;
    })
    .filter((l) => {
      if (!searchQuery.trim()) return true;
      const s = searchQuery.toLowerCase();
      return (
        l.leadId?.toLowerCase().includes(s) ||
        l.locality?.toLowerCase().includes(s) ||
        l.propertyType?.toLowerCase().includes(s) ||
        l.ownerName?.toLowerCase().includes(s)
      );
    });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle="light-content" />

      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        style={[styles.header, { paddingTop: Math.max(insets.top + 10, 36) }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <View style={styles.liveBadgeRow}>
              <View
                style={[
                  styles.onlineDot,
                  { backgroundColor: isSocketConnected ? "#10B981" : "#F59E0B" },
                ]}
              />
              <Text style={styles.headerTag}>
                {isSocketConnected ? "REAL-TIME ASSIGNED QUEUE" : "ASSIGNED QUEUE"}
              </Text>
            </View>
            <Text style={styles.headerTitle}>Pending Verifications</Text>
          </View>

          {/* Action Buttons */}
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

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search by Lead ID, locality, owner..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: "#FFFFFF" }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter Chips Bar */}
      <View style={[styles.filterBar, { borderBottomColor: borderCol }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[
            { key: "ALL", label: `All Active (${assignedLeads.filter((l) => ["assigned", "under_verification", "new"].includes(l.status)).length})` },
            { key: "assigned", label: `Assigned (${assignedLeads.filter((l) => l.status === "assigned").length})` },
            { key: "under_verification", label: `In Progress (${assignedLeads.filter((l) => l.status === "under_verification").length})` },
          ].map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => {
                  try { Haptics.selectionAsync(); } catch {}
                  setActiveFilter(f.key as any);
                }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive
                      ? "#0D9488"
                      : isDark
                      ? "#1E293B"
                      : "#E2E8F0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? "#FFFFFF" : textSecondary, fontWeight: isActive ? "800" : "600" },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Leads List */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={{ color: textSecondary, marginTop: 10, fontSize: 13 }}>Loading assigned properties...</Text>
          </View>
        ) : filteredLeads.length === 0 ? (
          <View style={[styles.emptyBox, { borderColor: borderCol }]}>
            <Feather name="check-circle" size={48} color="#10B981" />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Pending Properties</Text>
            <Text style={[styles.emptyText, { color: textSecondary }]}>
              {searchQuery ? "No matching leads found for your search." : "You have no active verification assignments. New leads will pop up here live."}
            </Text>
          </View>
        ) : (
          filteredLeads.map((lead) => (
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
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <View style={styles.leadIdTag}>
                      <Text style={styles.leadIdText}>{lead.leadId || "LEAD"}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusTag,
                        {
                          backgroundColor:
                            lead.status === "assigned"
                              ? "#F59E0B20"
                              : "#3B82F620",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              lead.status === "assigned"
                                ? "#D97706"
                                : "#2563EB",
                          },
                        ]}
                      >
                        {lead.status === "assigned" ? "Assigned" : "Under Verification"}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>
                    {lead.propertyType || "Residential"} • {lead.locality || "Property Location"}
                  </Text>
                  <Text style={[styles.cardAddress, { color: textSecondary }]} numberOfLines={1}>
                    {typeof lead.address === "string"
                      ? lead.address
                      : lead.address?.fullAddress ||
                        lead.address?.street ||
                        (lead.address?.city
                          ? `${lead.address.city}, ${lead.address.state || ""}`
                          : "") ||
                        lead.locality ||
                        "Property Location"}
                  </Text>
                </View>
              </View>

              {/* Owner Specs Grid */}
              <View style={[styles.specsRow, { backgroundColor: isDark ? "#0F172A" : "#F1F5F9" }]}>
                <View style={styles.specCol}>
                  <Text style={styles.specLabel}>Owner</Text>
                  <Text style={[styles.specVal, { color: textPrimary }]} numberOfLines={1}>
                    {lead.ownerName || "Property Owner"}
                  </Text>
                </View>
                <View style={styles.specCol}>
                  <Text style={styles.specLabel}>Expected Price</Text>
                  <Text style={[styles.specVal, { color: "#10B981" }]}>
                    ₹{Number(lead.expectedPrice || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={styles.specCol}>
                  <Text style={styles.specLabel}>Assigned By</Text>
                  <Text style={[styles.specVal, { color: textPrimary }]} numberOfLines={1}>
                    {lead.assignedByName || "Admin"}
                  </Text>
                </View>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.actionsRow}>
                {lead.ownerPhone && (
                  <TouchableOpacity
                    onPress={() => handleCall(lead.ownerPhone)}
                    style={[styles.smallBtn, { backgroundColor: "#10B98115", borderColor: "#10B98140" }]}
                  >
                    <Feather name="phone-call" size={14} color="#10B981" />
                    <Text style={[styles.smallBtnText, { color: "#10B981" }]}>Call Owner</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => handleOpenMap(lead)}
                  style={[styles.smallBtn, { backgroundColor: "#0284C715", borderColor: "#0284C740" }]}
                >
                  <Feather name="navigation" size={14} color="#0284C7" />
                  <Text style={[styles.smallBtnText, { color: "#0284C7" }]}>Map Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleStartVerification(lead)}
                  style={styles.primaryVerifyBtn}
                >
                  <Feather name="camera" size={14} color="#FFFFFF" />
                  <Text style={styles.primaryVerifyBtnText}>Verify & Publish</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Property Verification Stepper Modal */}
      {selectedLead && (
        <PropertyVerificationModal
          visible={isModalVisible}
          lead={selectedLead}
          onClose={() => setIsModalVisible(false)}
          onSuccess={() => {
            setIsModalVisible(false);
            fetchPendingLeads();
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
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  liveBadgeRow: {
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
  headerTag: {
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  filterBar: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 12,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  leadCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leadIdTag: {
    backgroundColor: "#0D948815",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leadIdText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0D9488",
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  cardAddress: {
    fontSize: 12,
  },
  specsRow: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 10,
    justifyContent: "space-between",
  },
  specCol: {
    flex: 1,
  },
  specLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  specVal: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  primaryVerifyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  primaryVerifyBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  emptyBox: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
