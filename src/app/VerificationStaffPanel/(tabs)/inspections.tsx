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
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";
import { InspectionChecklistModal } from "../../../components/VerificationStaffComponent";

const { width } = Dimensions.get("window");

export default function InspectionsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();

  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inspections, setInspections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"due" | "completed">("due");

  // Inspection Checklist Modal
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchInspections = useCallback(async () => {
    try {
      const res = await apiClient.get("/leads/my-inspections");
      if (Array.isArray(res.data?.data)) {
        setInspections(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching inspections:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInspections();
  };

  const handleStartInspection = (insp: any) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    setSelectedInspection(insp);
    setIsModalVisible(true);
  };

  const dueList = inspections.filter((i) => i.status === "scheduled" || i.status === "overdue");
  const completedList = inspections.filter((i) => i.status === "completed");

  const displayList = activeTab === "due" ? dueList : completedList;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        style={[styles.header, { paddingTop: Math.max(insets.top + 10, 36) }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.badgeText}>6-MONTH ROUTINE VISITS</Text>
            <Text style={styles.headerTitle}>Property Inspections</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{dueList.length} Due</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>
          Conduct semi-annual structural, safety & tenant welfare audits
        </Text>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab("due")}
            style={[styles.tabBtn, activeTab === "due" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === "due" ? "#0D9488" : "#FFFFFF" }]}>
              Due Visits ({dueList.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("completed")}
            style={[styles.tabBtn, activeTab === "completed" && styles.tabBtnActive]}
          >
            <Text style={[styles.tabBtnText, { color: activeTab === "completed" ? "#0D9488" : "#FFFFFF" }]}>
              Completed ({completedList.length})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Main List */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={{ color: textSecondary, marginTop: 10, fontSize: 13 }}>Loading routine inspection schedule...</Text>
          </View>
        ) : displayList.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="shield-checkmark-outline" size={48} color="#10B981" />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>
              {activeTab === "due" ? "No Inspections Currently Due" : "No Past Completed Inspections"}
            </Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              {activeTab === "due"
                ? "All rented and verified properties are up to date on their 6-month checks."
                : "Inspections you complete and file will appear in this log."}
            </Text>
          </View>
        ) : (
          displayList.map((item, idx) => {
            const isDue = item.status === "scheduled" || item.status === "overdue";
            const dateStr = item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Scheduled";
            return (
              <View
                key={item.inspectionId || idx}
                style={[styles.inspCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}
              >
                <View style={styles.inspHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <View style={[styles.statusChip, { backgroundColor: isDue ? "#F59E0B20" : "#10B98120" }]}>
                        <Text style={[styles.statusChipText, { color: isDue ? "#F59E0B" : "#10B981" }]}>
                          {(item.status || "SCHEDULED").toUpperCase()}
                        </Text>
                      </View>
                      <Text style={[styles.inspId, { color: textSecondary }]}>{item.leadTrackingId || item.inspectionId}</Text>
                    </View>
                    <Text style={[styles.inspTitle, { color: textPrimary }]} numberOfLines={1}>
                      {item.title || `${item.propertyType} in ${item.locality}`}
                    </Text>
                  </View>
                  <Text style={[styles.dateText, { color: textSecondary }]}>Due: {dateStr}</Text>
                </View>

                {/* Details Banner */}
                <View style={[styles.detailsBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                  <Text style={[styles.detailItem, { color: textSecondary }]}>📍 {item.fullAddress || item.locality}</Text>
                  <Text style={[styles.detailItem, { color: textSecondary }]}>👤 Tenant: {item.tenantName || "Direct Tenant"}</Text>
                  {item.conditionScore ? (
                    <Text style={[styles.detailItem, { color: "#0D9488", fontWeight: "700", textTransform: "capitalize" }]}>
                      ⭐ Condition: {item.conditionScore.replace("_", " ")}
                    </Text>
                  ) : null}
                  {item.notes ? (
                    <Text style={[styles.detailItem, { color: textSecondary, fontStyle: "italic" }]}>"{item.notes}"</Text>
                  ) : null}
                </View>

                {/* Action */}
                {isDue ? (
                  <TouchableOpacity
                    onPress={() => handleStartInspection(item)}
                    style={styles.conductBtn}
                  >
                    <Feather name="clipboard" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.conductBtnText}>Conduct 6-Mo Audit</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedBadge}>
                    <Feather name="check-circle" size={14} color="#10B981" style={{ marginRight: 4 }} />
                    <Text style={styles.completedText}>Report Recorded</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Inspection Modal */}
      {selectedInspection && (
        <InspectionChecklistModal
          visible={isModalVisible}
          inspection={selectedInspection}
          onClose={() => setIsModalVisible(false)}
          onSuccess={fetchInspections}
        />
      )}
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
  countBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 7,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
  },
  tabBtnText: {
    fontSize: 12,
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
  inspCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  inspHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusChipText: {
    fontSize: 9,
    fontWeight: "800",
  },
  inspId: {
    fontSize: 10,
    fontWeight: "600",
  },
  inspTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 11,
    fontWeight: "600",
  },
  detailsBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    gap: 3,
  },
  detailItem: {
    fontSize: 11,
  },
  conductBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingVertical: 10,
    borderRadius: 10,
  },
  conductBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  completedText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "700",
  },
});
