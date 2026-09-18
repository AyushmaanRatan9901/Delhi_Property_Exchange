import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";
import { ComplaintModal } from "../../../components/VerificationStaffComponent";

const { width } = Dimensions.get("window");

export default function ComplaintsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();

  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [assignedProperties, setAssignedProperties] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "open" | "in_progress" | "resolved" | "room_change">("ALL");

  // Complaint Modal
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      const [compRes, leadsRes] = await Promise.allSettled([
        apiClient.get("/leads/complaints"),
        apiClient.get("/leads/assigned-to-me?limit=50"),
      ]);

      if (compRes.status === "fulfilled" && Array.isArray(compRes.value.data?.data)) {
        setComplaints(compRes.value.data.data);
      }
      if (leadsRes.status === "fulfilled" && leadsRes.value.data?.data?.leads) {
        setAssignedProperties(leadsRes.value.data.data.leads);
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const handleOpenTicket = (ticket: any) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setSelectedTicket(ticket);
    setIsModalVisible(true);
  };

  const handleCreateNew = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setSelectedTicket(null);
    setIsModalVisible(true);
  };

  const filteredTickets = complaints.filter((t) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "room_change") return t.category === "room_change";
    return t.status === activeFilter;
  });

  const getPriorityColor = (pr: string) => {
    switch (pr?.toLowerCase()) {
      case "urgent": return "#EF4444";
      case "high": return "#F97316";
      case "medium": return "#F59E0B";
      default: return "#10B981";
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "plumbing": return "droplet";
      case "electrical": return "zap";
      case "leakage": return "cloud-rain";
      case "room_change": return "refresh-cw";
      case "carpentry": return "tool";
      default: return "help-circle";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        style={[styles.header, { paddingTop: Math.max(insets.top + 10, 36) }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.badgeText}>TENANT & OWNER ISSUES</Text>
            <Text style={styles.headerTitle}>Complaints & Requests</Text>
          </View>
          <TouchableOpacity onPress={handleCreateNew} style={styles.addTicketBtn}>
            <Feather name="plus" size={18} color="#0D9488" />
            <Text style={styles.addTicketText}>Log Issue</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSub}>
          Log and resolve maintenance tickets & room-change requests
        </Text>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {[
            { id: "ALL", label: `All (${complaints.length})` },
            { id: "open", label: "Open" },
            { id: "in_progress", label: "In Progress" },
            { id: "resolved", label: "Resolved" },
            { id: "room_change", label: "Room Change" },
          ].map((flt) => {
            const isSelected = activeFilter === flt.id;
            return (
              <TouchableOpacity
                key={flt.id}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  setActiveFilter(flt.id as any);
                }}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                  { backgroundColor: isSelected ? "#FFFFFF" : "rgba(255,255,255,0.15)" },
                ]}
              >
                <Text style={[styles.filterChipText, { color: isSelected ? "#0D9488" : "#FFFFFF" }]}>
                  {flt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>

      {/* Tickets List */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={{ color: textSecondary, marginTop: 10, fontSize: 13 }}>Loading complaint tickets...</Text>
          </View>
        ) : filteredTickets.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="check-decagram-outline" size={48} color="#10B981" />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Issues Found</Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              All tenant and owner tickets are resolved or no tickets match the selected filter.
            </Text>
          </View>
        ) : (
          filteredTickets.map((ticket, idx) => {
            const prColor = getPriorityColor(ticket.priority);
            const iconName = getCategoryIcon(ticket.category);
            const isResolved = ticket.status === "resolved" || ticket.status === "closed";
            return (
              <TouchableOpacity
                key={ticket.ticketId || idx}
                onPress={() => handleOpenTicket(ticket)}
                style={[styles.ticketCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}
              >
                <View style={styles.ticketHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                    <View style={[styles.catIconBox, { backgroundColor: "#0D948815" }]}>
                      <Feather name={iconName as any} size={15} color="#0D9488" />
                    </View>
                    <View>
                      <Text style={[styles.ticketIdText, { color: textSecondary }]}>{ticket.ticketId}</Text>
                      <Text style={[styles.ticketCatName, { color: "#0D9488" }]}>{(ticket.category || "issue").toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <View style={[styles.priorityPill, { backgroundColor: prColor + "20" }]}>
                      <Text style={[styles.priorityText, { color: prColor }]}>{(ticket.priority || "MEDIUM").toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isResolved ? "#10B98120" : "#F59E0B20", marginTop: 4 }]}>
                      <Text style={[styles.statusBadgeText, { color: isResolved ? "#10B981" : "#F59E0B" }]}>
                        {(ticket.status || "OPEN").replace("_", " ").toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.ticketTitle, { color: textPrimary }]}>{ticket.title}</Text>
                {ticket.description ? (
                  <Text style={[styles.ticketDesc, { color: textSecondary }]} numberOfLines={2}>{ticket.description}</Text>
                ) : null}

                <View style={[styles.ticketFooter, { borderTopColor: borderCol }]}>
                  <Text style={[styles.footerText, { color: textSecondary }]}>
                    📍 {ticket.locality || "Delhi"} • Raised by: {ticket.raisedByName || "Tenant"}
                  </Text>
                  <Feather name="chevron-right" size={16} color={textSecondary} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Modal for viewing/updating or creating tickets */}
      <ComplaintModal
        visible={isModalVisible}
        ticket={selectedTicket}
        propertiesList={assignedProperties}
        onClose={() => setIsModalVisible(false)}
        onSuccess={fetchTickets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  badgeText: {
    color: "#CCFBF1",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  headerSub: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    marginTop: 2,
    marginBottom: 12,
  },
  addTicketBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
  },
  addTicketText: {
    color: "#0D9488",
    fontSize: 12,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
  },
  filterChipActive: {
    elevation: 2,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  content: {
    padding: 16,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 260,
  },
  ticketCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  catIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ticketIdText: {
    fontSize: 10,
    fontWeight: "600",
  },
  ticketCatName: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  priorityPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: "800",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  ticketDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  ticketFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 0.5,
  },
  footerText: {
    fontSize: 11,
    flex: 1,
  },
});
