import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";

export interface AgentNotificationItem {
  id: string;
  type: "payout" | "lead_verified" | "lead_status" | "incentive" | "system";
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  read: boolean;
  priority: "high" | "normal" | "low";
  actionText?: string;
  actionRoute?: string;
  amount?: number;
  badge?: string;
  badgeColor?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
}

const INITIAL_AGENT_NOTIFICATIONS: AgentNotificationItem[] = [
  {
    id: "notif-1",
    type: "lead_verified",
    title: "Lead Verified & Approved! 🎉",
    message:
      "2BHK Builder Floor in Sector 62, Noida has passed physical verification. Commission ₹1,500 has been credited to your wallet balance.",
    timestamp: "2026-09-12T11:45:00Z",
    timeAgo: "10m ago",
    read: false,
    priority: "high",
    actionText: "View Commission Wallet",
    actionRoute: "/FiledAgentPanel/(tabs)/wallet",
    amount: 1500,
    badge: "Verified + ₹1,500",
    badgeColor: "#059669",
    icon: "checkmark-circle",
    iconColor: "#059669",
    iconBg: "rgba(5, 150, 105, 0.14)",
  },
  {
    id: "notif-2",
    type: "payout",
    title: "Instant Payout Successful 💸",
    message:
      "Withdrawal of ₹3,500 via UPI has been processed successfully to your linked account. Ref: TXN-893214.",
    timestamp: "2026-09-12T09:30:00Z",
    timeAgo: "2h ago",
    read: false,
    priority: "high",
    actionText: "Check Payout Receipt",
    actionRoute: "/FiledAgentPanel/(tabs)/wallet",
    amount: 3500,
    badge: "UPI Disbursed",
    badgeColor: "#0D9488",
    icon: "flash",
    iconColor: "#0D9488",
    iconBg: "rgba(13, 148, 136, 0.14)",
  },
  {
    id: "notif-3",
    type: "lead_status",
    title: "Staff Assigned for Verification 📋",
    message:
      "Field verification staff Ramesh Chandra is assigned for your submitted lead (3BHK Flat, Indirapuram). Verification is scheduled for today at 4:30 PM.",
    timestamp: "2026-09-12T08:15:00Z",
    timeAgo: "3h ago",
    read: false,
    priority: "normal",
    actionText: "View Lead Details",
    actionRoute: "/FiledAgentPanel/(tabs)/leads",
    badge: "Staff Assigned",
    badgeColor: "#2563EB",
    icon: "person-add",
    iconColor: "#2563EB",
    iconBg: "rgba(37, 99, 235, 0.14)",
  },
  {
    id: "notif-4",
    type: "incentive",
    title: "Weekend Flash Bonus Alert! 🚀",
    message:
      "Earn an extra ₹1,000 cash bonus by submitting 3 or more verified residential leads in South Delhi & Noida this weekend.",
    timestamp: "2026-09-11T18:00:00Z",
    timeAgo: "1d ago",
    read: true,
    priority: "high",
    actionText: "Submit New Lead Now",
    actionRoute: "/FiledAgentPanel/(tabs)/addLead",
    badge: "₹1,000 Extra",
    badgeColor: "#D97706",
    icon: "trophy",
    iconColor: "#D97706",
    iconBg: "rgba(217, 119, 6, 0.14)",
  },
  {
    id: "notif-5",
    type: "system",
    title: "Payout Account Linked 🔒",
    message:
      "Your primary UPI and Bank account details were successfully verified and linked for instant direct settlements.",
    timestamp: "2026-09-10T14:20:00Z",
    timeAgo: "2d ago",
    read: true,
    priority: "low",
    actionText: "View Profile",
    actionRoute: "/FiledAgentPanel/(tabs)/profile",
    badge: "Security",
    badgeColor: "#64748B",
    icon: "shield-checkmark",
    iconColor: "#0D9488",
    iconBg: "rgba(13, 148, 136, 0.12)",
  },
  {
    id: "notif-6",
    type: "lead_status",
    title: "Property Listed Live 🏠",
    message:
      "1BHK Independent Floor (Lajpat Nagar) is now live on Delhi Property Exchange tenant app. Prospective tenants are viewing your listing.",
    timestamp: "2026-09-09T10:00:00Z",
    timeAgo: "3d ago",
    read: true,
    priority: "normal",
    actionText: "View My Leads",
    actionRoute: "/FiledAgentPanel/(tabs)/leads",
    badge: "Live on Market",
    badgeColor: "#059669",
    icon: "home",
    iconColor: "#059669",
    iconBg: "rgba(5, 150, 105, 0.12)",
  },
];

const FILTER_TABS = [
  { id: "ALL", label: "All" },
  { id: "PAYOUTS", label: "Payouts & Wallet" },
  { id: "LEADS", label: "Lead Updates" },
  { id: "OFFERS", label: "Incentives" },
];

export function AgentNotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<AgentNotificationItem[]>(
    INITIAL_AGENT_NOTIFICATIONS
  );
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (selectedFilter === "ALL") return true;
      if (selectedFilter === "PAYOUTS") return item.type === "payout";
      if (selectedFilter === "LEADS")
        return item.type === "lead_verified" || item.type === "lead_status";
      if (selectedFilter === "OFFERS") return item.type === "incentive";
      return true;
    });
  }, [notifications, selectedFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const handleMarkAllAsRead = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = (item: AgentNotificationItem) => {
    try {
      Haptics.selectionAsync();
    } catch {}

    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );

    if (item.actionRoute) {
      router.push(item.actionRoute as any);
    }
  };

  const handleDeleteNotification = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch {}
            setNotifications([]);
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: AgentNotificationItem }) => {
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.notifCard,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderColor: isUnread
              ? isDark
                ? "#0D9488"
                : "#99F6E4"
              : isDark
              ? colors.border
              : "#F1F5F9",
          },
          isUnread && styles.notifCardUnread,
        ]}
      >
        {/* Unread Indicator Bar */}
        {isUnread && <View style={styles.unreadBar} />}

        <View style={styles.cardHeader}>
          {/* Icon Badge */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: item.iconBg,
              },
            ]}
          >
            <Ionicons name={item.icon} size={20} color={item.iconColor} />
          </View>

          {/* Title & Badge */}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.notifTitle,
                  { color: isDark ? colors.textPrimary : "#0F172A" },
                  isUnread && styles.notifTitleUnread,
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.badge && (
                <View
                  style={[
                    styles.badgePill,
                    {
                      backgroundColor: isDark
                        ? "rgba(13, 148, 136, 0.2)"
                        : "rgba(13, 148, 136, 0.12)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          item.badgeColor || (isDark ? "#2DD4BF" : "#0D9488"),
                      },
                    ]}
                  >
                    {item.badge}
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.notifTime,
                { color: isDark ? colors.textMuted : "#94A3B8" },
              ]}
            >
              {item.timeAgo}
            </Text>
          </View>

          {/* Delete action */}
          <TouchableOpacity
            onPress={() => handleDeleteNotification(item.id)}
            style={styles.deleteBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather
              name="x"
              size={15}
              color={isDark ? colors.textMuted : "#94A3B8"}
            />
          </TouchableOpacity>
        </View>

        {/* Message */}
        <Text
          style={[
            styles.notifMessage,
            { color: isDark ? colors.textSecondary : "#334155" },
          ]}
        >
          {item.message}
        </Text>

        {/* Action Button Footer */}
        {item.actionText && (
          <View style={styles.cardFooter}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleNotificationPress(item)}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isDark ? "#082F2C" : "#F0FDFA",
                  borderColor: isDark ? "#115E59" : "#CCFBF1",
                },
              ]}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  { color: isDark ? "#2DD4BF" : "#0D9488" },
                ]}
              >
                {item.actionText}
              </Text>
              <Feather
                name="arrow-right"
                size={14}
                color={isDark ? "#2DD4BF" : "#0D9488"}
              />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : "#F8FAFC" },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? colors.cardBackground : "#FFFFFF"}
      />

      {/* Header with Safe Area Flow */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 10) + 8,
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#F1F5F9",
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backBtn,
              { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" },
            ]}
          >
            <Feather
              name="arrow-left"
              size={20}
              color={isDark ? colors.textPrimary : "#0F172A"}
            />
          </TouchableOpacity>
          <View>
            <Text
              style={[
                styles.headerTitle,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {t("notifications.headerTitle")}
            </Text>
            <Text
              style={[
                styles.headerSub,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {unreadCount > 0
                ? `${unreadCount} unread alert${unreadCount > 1 ? "s" : ""}`
                : "All caught up"}
            </Text>
          </View>
        </View>

        {/* Header Action Buttons */}
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleMarkAllAsRead}
              style={[
                styles.headerActionPill,
                {
                  backgroundColor: isDark
                    ? "rgba(13, 148, 136, 0.2)"
                    : "#F0FDFA",
                  borderColor: isDark
                    ? "rgba(13, 148, 136, 0.3)"
                    : "#CCFBF1",
                },
              ]}
            >
              <Ionicons
                name="checkmark-done"
                size={14}
                color={isDark ? "#2DD4BF" : "#0D9488"}
              />
              <Text
                style={[
                  styles.headerActionText,
                  { color: isDark ? "#2DD4BF" : "#0D9488" },
                ]}
              >
                {t("notifications.markRead")}
              </Text>
            </TouchableOpacity>
          )}

          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={[
                styles.clearBtn,
                { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" },
              ]}
            >
              <Feather
                name="trash-2"
                size={16}
                color={isDark ? colors.textMuted : "#64748B"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View
        style={[
          styles.filterContainer,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#F1F5F9",
          },
        ]}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = selectedFilter === item.id;
            return (
              <TouchableOpacity
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setSelectedFilter(item.id);
                }}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? "rgba(13, 148, 136, 0.2)"
                        : "#F0FDFA"
                      : isDark
                      ? colors.surfaceLight
                      : "#F8FAFC",
                    borderColor: isSelected
                      ? "#0D9488"
                      : isDark
                      ? colors.border
                      : "#E2E8F0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    {
                      color: isSelected
                        ? isDark
                          ? "#2DD4BF"
                          : "#0D9488"
                        : isDark
                        ? colors.textSecondary
                        : "#64748B",
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0D9488"]}
            tintColor="#0D9488"
          />
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconBox,
                { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" },
              ]}
            >
              <Ionicons
                name="notifications-off-outline"
                size={38}
                color={isDark ? colors.textMuted : "#94A3B8"}
              />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {t("notifications.noNotificationsTitle")}
            </Text>
            <Text
              style={[
                styles.emptySub,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {selectedFilter !== "ALL"
                ? "There are no notifications under this category."
                : "You're all caught up! New lead verification and payout alerts will appear here."}
            </Text>
          </View>
        }
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  headerSub: {
    fontSize: 11.5,
    marginTop: 1,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerActionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerActionText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  clearBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  filterContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  notifCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 16,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  notifCardUnread: {
    borderWidth: 1.5,
  },
  unreadBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#0D9488",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  notifTitleUnread: {
    fontWeight: "800",
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  notifTime: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "500",
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.15)",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
  },
});
