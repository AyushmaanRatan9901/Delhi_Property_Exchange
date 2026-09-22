import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../../constants/theme";
import { useTenant, TenantComplaint } from "../../../constants/tenantData";
import { TenantRaiseComplaintModal } from "../../../components/TenantComponent/TenantRaiseComplaintModal";
import { TenantComplaintDetailModal } from "../../../components/TenantComponent/TenantComplaintDetailModal";

const STATUS_FILTERS = ["all", "active", "in_progress", "resolved"] as const;

export default function ComplaintsScreen() {
  const { colors, isDark } = useResponsiveTheme();
  const { complaints, refreshAll, isRefreshing, raiseComplaint, addComplaintMessage, reopenComplaint } = useTenant();

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRaiseModalVisible, setIsRaiseModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<TenantComplaint | null>(null);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c: TenantComplaint) => {
      // Filter by tab status
      let matchesStatus = true;
      if (activeFilter === "active") {
        matchesStatus = c.status === "submitted" || c.status === "assigned" || c.status === "reopened" || c.status === "open";
      } else if (activeFilter === "in_progress") {
        matchesStatus = c.status === "in_progress";
      } else if (activeFilter === "resolved") {
        matchesStatus = c.status === "resolved" || c.status === "closed";
      }

      // Filter by search query
      const matchesSearch =
        !searchQuery.trim() ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [complaints, activeFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return { label: "Resolved", bg: "#DCFCE7", text: "#15803D", icon: "checkmark-circle" };
      case "in_progress":
        return { label: "In Progress", bg: "#EFF6FF", text: "#2563EB", icon: "time" };
      case "assigned":
        return { label: "Assigned", bg: "#FEF3C7", text: "#D97706", icon: "person" };
      case "reopened":
        return { label: "Reopened", bg: "#FEE2E2", text: "#DC2626", icon: "alert-circle" };
      default:
        return { label: "Submitted", bg: "#F1F5F9", text: "#64748B", icon: "document-text" };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return { label: "Urgent", bg: "#FEE2E2", text: "#DC2626" };
      case "high":
        return { label: "High", bg: "#FFEDD5", text: "#EA580C" };
      case "medium":
        return { label: "Medium", bg: "#FEF9C3", text: "#CA8A04" };
      default:
        return { label: "Low", bg: "#F1F5F9", text: "#64748B" };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF" }]}>
        <View>
          <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Complaints & Maintenance
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>
            Track and raise maintenance requests
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.raiseBtn, { backgroundColor: "#6366F1" }]}
          onPress={() => setIsRaiseModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.raiseBtnText}>Raise Issue</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
          <Ionicons name="search-outline" size={18} color={isDark ? colors.textMuted : "#94A3B8"} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? colors.textPrimary : "#0F172A" }]}
            placeholder="Search by ticket, title, or category..."
            placeholderTextColor={isDark ? colors.textMuted : "#94A3B8"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={isDark ? colors.textMuted : "#94A3B8"} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterList}>
          {STATUS_FILTERS.map((filter) => {
            const isSelected = activeFilter === filter;
            const label = filter === "all" ? "All Requests" : filter === "in_progress" ? "In Progress" : filter.charAt(0).toUpperCase() + filter.slice(1);
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? "#6366F1" : isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: isSelected ? "#6366F1" : isDark ? colors.border : "#E2E8F0",
                  },
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    { color: isSelected ? "#FFFFFF" : isDark ? colors.textPrimary : "#64748B", fontWeight: isSelected ? "700" : "500" },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="construct-outline" size={40} color="#6366F1" />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>No Maintenance Requests</Text>
            <Text style={[styles.emptyDesc, { color: isDark ? colors.textMuted : "#64748B" }]}>
              {searchQuery ? "No requests matched your search criteria." : "All systems operational! You have no open maintenance complaints."}
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setIsRaiseModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyBtnText}>Report an Issue</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredComplaints.map((item: TenantComplaint) => {
            const status = getStatusBadge(item.status);
            const priority = getPriorityBadge(item.priority);

            return (
              <TouchableOpacity
                key={item.ticketId || item.id}
                style={[
                  styles.complaintCard,
                  { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" },
                ]}
                onPress={() => setSelectedComplaint(item)}
                activeOpacity={0.7}
              >
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View style={styles.ticketBadge}>
                    <Text style={styles.ticketText}>{item.ticketId}</Text>
                  </View>
                  <View style={styles.badgeGroup}>
                    <View style={[styles.priorityBadge, { backgroundColor: priority.bg }]}>
                      <Text style={[styles.priorityBadgeText, { color: priority.text }]}>{priority.label}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Ionicons name={status.icon as any} size={12} color={status.text} style={{ marginRight: 4 }} />
                      <Text style={[styles.statusBadgeText, { color: status.text }]}>{status.label}</Text>
                    </View>
                  </View>
                </View>

                {/* Content */}
                <Text style={[styles.complaintTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[styles.complaintDesc, { color: isDark ? colors.textMuted : "#64748B" }]} numberOfLines={2}>
                  {item.description}
                </Text>

                {/* Footer Info */}
                <View style={[styles.cardFooter, { borderTopColor: isDark ? colors.border : "#F1F5F9" }]}>
                  <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={13} color={isDark ? colors.textMuted : "#94A3B8"} />
                    <Text style={[styles.footerText, { color: isDark ? colors.textMuted : "#64748B" }]}>
                      {new Date(item.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Ionicons name="folder-open-outline" size={13} color={isDark ? colors.textMuted : "#94A3B8"} />
                    <Text style={[styles.footerText, { color: isDark ? colors.textMuted : "#64748B", textTransform: "capitalize" }]}>
                      {item.category}
                    </Text>
                  </View>
                  {item.assignedStaffName && (
                    <View style={styles.footerItem}>
                      <Ionicons name="person-circle-outline" size={13} color="#6366F1" />
                      <Text style={[styles.footerText, { color: "#6366F1", fontWeight: "600" }]}>
                        {item.assignedStaffName}
                      </Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color={isDark ? colors.textMuted : "#94A3B8"} style={{ marginLeft: "auto" }} />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Modals */}
      <TenantRaiseComplaintModal
        visible={isRaiseModalVisible}
        onClose={() => setIsRaiseModalVisible(false)}
        onSubmit={raiseComplaint}
      />

      <TenantComplaintDetailModal
        visible={!!selectedComplaint}
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onSendMessage={addComplaintMessage}
        onReopen={reopenComplaint}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  raiseBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 4,
    elevation: 2,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  raiseBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    padding: 0,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterList: {
    gap: 8,
    paddingRight: 10,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 13,
  },
  complaintCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ticketBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  ticketText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6366F1",
    letterSpacing: 0.5,
  },
  badgeGroup: {
    flexDirection: "row",
    gap: 6,
  },
  priorityBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  complaintTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  complaintDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
