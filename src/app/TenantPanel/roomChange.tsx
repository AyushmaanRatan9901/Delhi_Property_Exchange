import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useResponsiveTheme } from "../../constants/theme";
import { useTenant, RoomChangeRequest } from "../../constants/tenantData";
import { TenantRoomChangeModal } from "../../components/TenantComponent/TenantRoomChangeModal";

export default function TenantRoomChangeScreen() {
  const { colors, isDark } = useResponsiveTheme();
  const router = useRouter();
  const { roomChangeRequests, property, refreshAll, isRefreshing, submitRoomChangeRequest } = useTenant();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { label: "Approved", bg: "#DCFCE7", text: "#15803D", icon: "checkmark-circle" };
      case "rejected":
        return { label: "Declined", bg: "#FEE2E2", text: "#DC2626", icon: "close-circle" };
      default:
        return { label: "Under Review", bg: "#FEF3C7", text: "#D97706", icon: "time" };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF" }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: isDark ? colors.background : "#F1F5F9" }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? colors.textPrimary : "#0F172A"} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Room / Unit Change
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>
            Request a transfer within Delhi Property Exchange
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Allocation Card */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
          <Text style={[styles.cardTag, { color: "#6366F1" }]}>CURRENT ALLOCATION</Text>
          <Text style={[styles.cardTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            {property?.title || "Current Property"}
          </Text>
          <Text style={[styles.cardSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>
            {property?.propertyType || "Apartment"} • {property?.locality || "Delhi NCR"}
          </Text>

          <View style={[styles.infoRow, { borderTopColor: isDark ? colors.border : "#F1F5F9" }]}>
            <View>
              <Text style={[styles.infoLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Current Monthly Rent</Text>
              <Text style={[styles.infoVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                ₹{property?.rentAmount?.toLocaleString("en-IN") || "18,500"} / mo
              </Text>
            </View>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setIsModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Request Transfer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Policy Box */}
        <View style={[styles.policyBox, { backgroundColor: "rgba(99, 102, 241, 0.06)", borderColor: "rgba(99, 102, 241, 0.2)" }]}>
          <Ionicons name="information-circle" size={20} color="#6366F1" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.policyTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              Transfer Guidelines
            </Text>
            <Text style={[styles.policyText, { color: isDark ? colors.textMuted : "#475569" }]}>
              Room transfers require Super Admin review and are subject to unit availability. Standard inspection and inventory audit will be conducted before hand-over.
            </Text>
          </View>
        </View>

        {/* Request History */}
        <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
          Transfer Requests History
        </Text>

        {roomChangeRequests.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="swap-horizontal-outline" size={36} color="#6366F1" />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>No Transfer Requests</Text>
            <Text style={[styles.emptyDesc, { color: isDark ? colors.textMuted : "#64748B" }]}>
              You haven't submitted any room or property transfer applications yet.
            </Text>
          </View>
        ) : (
          roomChangeRequests.map((req: RoomChangeRequest) => {
            const badge = getStatusBadge(req.status);

            return (
              <View
                key={req.requestId || req.id}
                style={[
                  styles.card,
                  { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" },
                ]}
              >
                <View style={styles.reqHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon as any} size={12} color={badge.text} />
                    <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                  <Text style={[styles.dateText, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    {new Date(req.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </View>

                <Text style={[styles.reqReason, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                  "{req.description || req.reason}"
                </Text>

                <View style={styles.prefGrid}>
                  {req.targetBhk && (
                    <View style={styles.prefItem}>
                      <Text style={[styles.prefLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Preferred Type</Text>
                      <Text style={[styles.prefVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>{req.targetBhk}</Text>
                    </View>
                  )}
                  {req.targetLocality && (
                    <View style={styles.prefItem}>
                      <Text style={[styles.prefLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Target Locality</Text>
                      <Text style={[styles.prefVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>{req.targetLocality}</Text>
                    </View>
                  )}
                  {req.budgetRange && (
                    <View style={styles.prefItem}>
                      <Text style={[styles.prefLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Budget</Text>
                      <Text style={[styles.prefVal, { color: "#10B981" }]}>{req.budgetRange}</Text>
                    </View>
                  )}
                </View>

                {req.adminRemarks && (
                  <View style={[styles.adminNoteBox, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }]}>
                    <Text style={[styles.adminNoteLabel, { color: "#6366F1" }]}>Admin Feedback:</Text>
                    <Text style={[styles.adminNoteText, { color: isDark ? colors.textPrimary : "#334155" }]}>
                      {req.adminRemarks}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Room Change Request Modal */}
      <TenantRoomChangeModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={submitRoomChangeRequest}
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
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardTag: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 15,
    fontWeight: "800",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366F1",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  policyBox: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    alignItems: "flex-start",
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  policyText: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },
  reqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 12,
  },
  reqReason: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: "italic",
  },
  prefGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  prefItem: {
    flex: 1,
    minWidth: 90,
  },
  prefLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  prefVal: {
    fontSize: 13,
    fontWeight: "700",
  },
  adminNoteBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  adminNoteLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  adminNoteText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
