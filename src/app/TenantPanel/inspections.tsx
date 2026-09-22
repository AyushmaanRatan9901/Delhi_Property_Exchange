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
import { useTenant, TenantInspection } from "../../constants/tenantData";

export default function TenantInspectionsScreen() {
  const { colors, isDark } = useResponsiveTheme();
  const router = useRouter();
  const { inspections, refreshAll, isRefreshing } = useTenant();

  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed">("all");

  const filteredInspections = inspections.filter((i: TenantInspection) => {
    if (activeTab === "upcoming") return i.status === "scheduled";
    if (activeTab === "completed") return i.status === "completed";
    return true;
  });

  const getStatusBadge = (status: string) => {
    if (status === "completed") {
      return { label: "Verified & Passed", bg: "#DCFCE7", text: "#15803D", icon: "checkmark-circle" };
    }
    return { label: "Upcoming Visit", bg: "#EFF6FF", text: "#2563EB", icon: "time" };
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
            Property Inspections
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>
            Verification reports & condition scorecards
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF" }]}>
        {(["all", "upcoming", "completed"] as const).map((tab) => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                isSelected && { borderBottomColor: "#6366F1", borderBottomWidth: 2 },
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isSelected ? "#6366F1" : isDark ? colors.textMuted : "#64748B", fontWeight: isSelected ? "700" : "500" },
                ]}
              >
                {tab === "all" ? "All Audits" : tab === "upcoming" ? "Scheduled" : "Past Audits"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredInspections.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="shield-checkmark-outline" size={40} color="#6366F1" />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>No Inspections Found</Text>
            <Text style={[styles.emptyDesc, { color: isDark ? colors.textMuted : "#64748B" }]}>
              There are no {activeTab} property inspections scheduled for your unit at this time.
            </Text>
          </View>
        ) : (
          filteredInspections.map((insp: TenantInspection) => {
            const badge = getStatusBadge(insp.status);

            return (
              <View
                key={insp.inspectionId || insp.id}
                style={[
                  styles.card,
                  { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" },
                ]}
              >
                {/* Header */}
                <View style={styles.cardHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon as any} size={13} color={badge.text} />
                    <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
                  </View>
                  <Text style={[styles.dateText, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    {new Date(insp.scheduledDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </View>

                <Text style={[styles.inspectionType, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                  {insp.status === "completed" ? "Completed Property Verification" : "Scheduled Quality Audit"}
                </Text>

                <View style={styles.auditorRow}>
                  <Ionicons name="person-circle-outline" size={16} color="#6366F1" />
                  <Text style={[styles.auditorText, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    Inspector: <Text style={{ fontWeight: "700", color: isDark ? colors.textPrimary : "#0F172A" }}>{insp.inspectorName}</Text>
                  </Text>
                </View>

                {insp.notes && (
                  <View style={[styles.notesBox, { backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }]}>
                    <Text style={[styles.notesLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Inspector Observations:</Text>
                    <Text style={[styles.notesText, { color: isDark ? colors.textPrimary : "#334155" }]}>
                      {insp.notes}
                    </Text>
                  </View>
                )}

                {/* Scorecard checklist */}
                <View style={styles.scorecardContainer}>
                  <Text style={[styles.scorecardTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                    System Health & Safety Checks
                  </Text>
                  <View style={styles.scoreGrid}>
                    <View style={[styles.scoreItem, { backgroundColor: insp.structuralCheck ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)" }]}>
                      <Ionicons name={insp.structuralCheck ? "checkmark-circle" : "alert-circle"} size={14} color={insp.structuralCheck ? "#10B981" : "#F59E0B"} />
                      <Text style={[styles.scoreItemText, { color: insp.structuralCheck ? "#065F46" : "#92400E" }]}>Structural</Text>
                    </View>

                    <View style={[styles.scoreItem, { backgroundColor: insp.electricalCheck ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)" }]}>
                      <Ionicons name={insp.electricalCheck ? "checkmark-circle" : "alert-circle"} size={14} color={insp.electricalCheck ? "#10B981" : "#F59E0B"} />
                      <Text style={[styles.scoreItemText, { color: insp.electricalCheck ? "#065F46" : "#92400E" }]}>Electrical</Text>
                    </View>

                    <View style={[styles.scoreItem, { backgroundColor: insp.plumbingCheck ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)" }]}>
                      <Ionicons name={insp.plumbingCheck ? "checkmark-circle" : "alert-circle"} size={14} color={insp.plumbingCheck ? "#10B981" : "#F59E0B"} />
                      <Text style={[styles.scoreItemText, { color: insp.plumbingCheck ? "#065F46" : "#92400E" }]}>Plumbing</Text>
                    </View>

                    <View style={[styles.scoreItem, { backgroundColor: insp.cleanlinessCheck ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)" }]}>
                      <Ionicons name={insp.cleanlinessCheck ? "checkmark-circle" : "alert-circle"} size={14} color={insp.cleanlinessCheck ? "#10B981" : "#F59E0B"} />
                      <Text style={[styles.scoreItemText, { color: insp.cleanlinessCheck ? "#065F46" : "#92400E" }]}>Cleanliness</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 13,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 14,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
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
  inspectionType: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  auditorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  auditorText: {
    fontSize: 13,
  },
  notesBox: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },
  scorecardContainer: {
    marginTop: 4,
  },
  scorecardTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  scoreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scoreItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  scoreItemText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 40,
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
  },
});
