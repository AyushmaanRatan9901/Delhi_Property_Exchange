import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TenantNotification } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantNotificationsPreviewProps {
  notifications: TenantNotification[];
  onViewAll: () => void;
  onNotificationPress?: (notif: TenantNotification) => void;
}

export const TenantNotificationsPreview: React.FC<TenantNotificationsPreviewProps> = ({
  notifications,
  onViewAll,
  onNotificationPress,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "rent_due":
      case "rent_paid":
        return { name: "receipt-outline" as const, color: "#0284C7", bg: isDark ? "#0C293D" : "#F0F9FF" };
      case "inspection_scheduled":
      case "inspection_completed":
        return { name: "shield-checkmark-outline" as const, color: "#059669", bg: isDark ? "#062A1C" : "#ECFDF5" };
      case "complaint_update":
      case "complaint_raised":
        return { name: "construct-outline" as const, color: "#D97706", bg: isDark ? "#2E1E08" : "#FEF3C7" };
      default:
        return { name: "notifications-outline" as const, color: "#8B5CF6", bg: isDark ? "#241842" : "#F5F3FF" };
    }
  };

  const previewList = notifications.slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="notifications-outline" size={18} color={isDark ? colors.textPrimary : "#0F172A"} />
          <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Recent Updates
          </Text>
        </View>

        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7} style={styles.viewAllBtn}>
          <Text style={[styles.viewAllText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>View All</Text>
          <Feather name="chevron-right" size={14} color={isDark ? "#38BDF8" : "#0284C7"} />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {previewList.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <Ionicons name="checkmark-done-circle-outline" size={32} color={isDark ? "#34D399" : "#10B981"} />
          <Text style={[styles.emptyText, { color: isDark ? colors.textMuted : "#64748B" }]}>
            You're all caught up! No new alerts.
          </Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          {previewList.map((notif) => {
            const iconData = getNotifIcon(notif.type);
            const dateStr = notif.createdAt
              ? new Date(notif.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
              : "Recently";

            return (
              <TouchableOpacity
                key={notif._id}
                style={[
                  styles.notifCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: isDark ? colors.border : "#E2E8F0",
                  },
                ]}
                onPress={() => onNotificationPress?.(notif)}
                activeOpacity={0.75}
              >
                <View style={[styles.iconCircle, { backgroundColor: iconData.bg }]}>
                  <Ionicons name={iconData.name} size={18} color={iconData.color} />
                </View>

                <View style={styles.notifContent}>
                  <View style={styles.notifTopRow}>
                    <Text
                      style={[
                        styles.notifTitle,
                        { color: isDark ? colors.textPrimary : "#1E293B", fontWeight: notif.read ? "600" : "800" },
                      ]}
                      numberOfLines={1}
                    >
                      {notif.title}
                    </Text>
                    <Text style={[styles.notifDate, { color: isDark ? colors.textMuted : "#94A3B8" }]}>
                      {dateStr}
                    </Text>
                  </View>

                  <Text
                    style={[styles.notifMessage, { color: isDark ? colors.textSecondary : "#64748B" }]}
                    numberOfLines={2}
                  >
                    {notif.message}
                  </Text>
                </View>

                {!notif.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
  },
  listWrapper: {
    gap: 8,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    position: "relative",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: {
    flex: 1,
    gap: 3,
  },
  notifTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notifTitle: {
    fontSize: 13.5,
    flex: 1,
    marginRight: 6,
  },
  notifDate: {
    fontSize: 11,
    fontWeight: "600",
  },
  notifMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0284C7",
    position: "absolute",
    top: 12,
    right: 12,
  },
  emptyCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
