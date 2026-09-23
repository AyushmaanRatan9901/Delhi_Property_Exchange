import React, { useState, useMemo } from "react";
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
import { useTenant, TenantNotification } from "../../constants/tenantData";
import { TenantNotificationsSkeleton } from "../../components/TenantComponent/TenantSkeleton";

const NOTIF_FILTERS = ["all", "rent_due", "inspection_scheduled", "complaint_update", "announcement"] as const;

export default function TenantNotificationsScreen() {
  const { colors, isDark } = useResponsiveTheme();
  const router = useRouter();
  const { notifications, markNotificationRead, markAllNotificationsRead, refreshAll, isLoading, isRefreshing } = useTenant();

  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter((n: TenantNotification) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const getNotifMeta = (type: string) => {
    switch (type) {
      case "rent_due":
      case "rent_paid":
        return { icon: "card-outline", color: "#10B981", bg: "#ECFDF5" };
      case "inspection_scheduled":
      case "inspection_completed":
        return { icon: "shield-checkmark-outline", color: "#3B82F6", bg: "#EFF6FF" };
      case "complaint_update":
      case "complaint_resolved":
        return { icon: "construct-outline", color: "#F59E0B", bg: "#FEF3C7" };
      case "room_change":
        return { icon: "swap-horizontal-outline", color: "#8B5CF6", bg: "#F3E8FF" };
      default:
        return { icon: "megaphone-outline", color: "#6366F1", bg: "#EEF2FF" };
    }
  };

  const handleNotificationPress = (notif: TenantNotification) => {
    if (!notif.read) {
      markNotificationRead(notif._id);
    }
    if (notif.type.startsWith("rent")) {
      router.push("/TenantPanel/(tabs)/Rent" as any);
    } else if (notif.type.startsWith("complaint")) {
      router.push("/TenantPanel/(tabs)/Complaints" as any);
    } else if (notif.type.startsWith("inspection")) {
      router.push("/TenantPanel/inspections" as any);
    }
  };

  if (isLoading) {
    return <TenantNotificationsSkeleton />;
  }

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
            Notifications
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>
            Stay updated with alerts & messages
          </Text>
        </View>
        <TouchableOpacity
          style={styles.markAllBtn}
          onPress={markAllNotificationsRead}
          activeOpacity={0.7}
        >
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF" }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {NOTIF_FILTERS.map((f) => {
            const isSelected = activeFilter === f;
            const label = f === "all" ? "All" : f === "rent_due" ? "Rent" : f === "inspection_scheduled" ? "Inspections" : f === "complaint_update" ? "Complaints" : "Announcements";
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? "#6366F1" : isDark ? colors.background : "#F1F5F9",
                  },
                ]}
                onPress={() => setActiveFilter(f)}
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
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={40} color="#6366F1" />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>No Notifications</Text>
            <Text style={[styles.emptyDesc, { color: isDark ? colors.textMuted : "#64748B" }]}>
              You are all caught up! New reminders and announcements will appear here.
            </Text>
          </View>
        ) : (
          filteredNotifications.map((n: TenantNotification) => {
            const meta = getNotifMeta(n.type);

            return (
              <TouchableOpacity
                key={n._id}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: n.read ? (isDark ? colors.border : "#E2E8F0") : "#6366F1",
                    borderLeftWidth: n.read ? 1 : 4,
                    borderLeftColor: n.read ? (isDark ? colors.border : "#E2E8F0") : "#6366F1",
                  },
                ]}
                onPress={() => handleNotificationPress(n)}
                activeOpacity={0.7}
              >
                <View style={[styles.notifIcon, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon as any} size={20} color={meta.color} />
                </View>
                <View style={styles.notifBody}>
                  <View style={styles.notifTitleRow}>
                    <Text style={[styles.notifTitle, { color: isDark ? colors.textPrimary : "#0F172A", fontWeight: n.read ? "600" : "800" }]}>
                      {n.title}
                    </Text>
                    {!n.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={[styles.notifMessage, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    {n.message}
                  </Text>
                  <View style={styles.notifFooter}>
                    <Text style={[styles.notifTime, { color: isDark ? colors.textMuted : "#94A3B8" }]}>
                      {new Date(n.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </Text>
                    <View style={styles.actionPrompt}>
                      <Text style={styles.actionPromptText}>View details</Text>
                      <Ionicons name="arrow-forward" size={12} color="#6366F1" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
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
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  markAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6366F1",
  },
  filterBar: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  filterPillText: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  notifCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    gap: 12,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  notifBody: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366F1",
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  notifFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notifTime: {
    fontSize: 11,
  },
  actionPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionPromptText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6366F1",
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
