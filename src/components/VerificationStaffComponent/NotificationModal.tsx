import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSelector, useDispatch } from "react-redux";
import { useResponsiveTheme } from "../../constants/theme";
import { AppDispatch, RootState } from "../../Redux/store";
import {
  fetchStaffNotifications,
  markNotificationAsReadThunk,
  markAllNotificationsAsReadThunk,
  clearAllNotificationsThunk,
  StaffNotification,
} from "../../Redux/VerificationStaff/verificationStaffSlice";

const { width } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenLead?: (lead: any) => void;
}

type FilterType = "all" | "unread" | "assigned" | "alert";

export const NotificationModal: React.FC<Props> = ({
  visible,
  onClose,
  onOpenLead,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const dispatch = useDispatch<AppDispatch>();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const notifications = useSelector(
    (state: RootState) => state.verificationStaff.notifications
  );
  const unreadCount = useSelector(
    (state: RootState) => state.verificationStaff.unreadCount
  );
  const isNotificationsLoading = useSelector(
    (state: RootState) => state.verificationStaff.isNotificationsLoading
  );
  const isSocketConnected = useSelector(
    (state: RootState) => state.verificationStaff.isSocketConnected
  );

  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";

  // Fetch notifications on mount and when modal opens
  useEffect(() => {
    if (visible) {
      dispatch(fetchStaffNotifications());
    }
  }, [visible, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchStaffNotifications()).unwrap();
    } catch {}
    setRefreshing(false);
  };

  const handleSelectNotif = (notif: StaffNotification) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const notifId = notif.id || notif._id;
    if (notifId && !notif.read && !notif.isRead) {
      dispatch(markNotificationAsReadThunk(notifId));
    }
    const leadObj = notif.lead || notif.data?.lead;
    if (leadObj && onOpenLead) {
      onClose();
      onOpenLead(leadObj);
    }
  };

  const handleMarkAllRead = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    dispatch(markAllNotificationsAsReadThunk());
  };

  const handleClearAll = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    dispatch(clearAllNotificationsThunk());
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return "Just now";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return "Recently";
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter((notif) => {
    const isRead = Boolean(notif.read || notif.isRead);
    if (activeFilter === "unread") return !isRead;
    if (activeFilter === "assigned") return notif.type === "lead_assigned";
    if (activeFilter === "alert")
      return (
        notif.type === "scam_alert" ||
        notif.type === "complaint" ||
        notif.type === "complaint_logged" ||
        notif.priority === "urgent" ||
        notif.priority === "high"
      );
    return true;
  });

  const getNotifMeta = (notif: StaffNotification) => {
    switch (notif.type) {
      case "lead_assigned":
        return {
          icon: "home-plus" as const,
          label: "NEW ASSIGNMENT",
          color: "#0D9488",
          bgColor: isDark ? "rgba(13, 148, 136, 0.2)" : "#CCFBF1",
        };
      case "lead_verified":
        return {
          icon: "shield-check" as const,
          label: "VERIFIED",
          color: "#10B981",
          bgColor: isDark ? "rgba(16, 185, 129, 0.2)" : "#D1FAE5",
        };
      case "scam_alert":
        return {
          icon: "alert-octagon" as const,
          label: "FRAUD / SCAM ALERT",
          color: "#EF4444",
          bgColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#FEE2E2",
        };
      case "complaint":
      case "complaint_logged":
      case "complaint_resolved":
        return {
          icon: "alert-circle-outline" as const,
          label: "COMPLAINT TICKET",
          color: "#F59E0B",
          bgColor: isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7",
        };
      case "inspection":
      case "inspection_scheduled":
      case "inspection_completed":
        return {
          icon: "calendar-clock" as const,
          label: "INSPECTION",
          color: "#8B5CF6",
          bgColor: isDark ? "rgba(139, 92, 246, 0.2)" : "#EDE9FE",
        };
      default:
        return {
          icon: "bell-outline" as const,
          label: "SYSTEM ALERT",
          color: "#64748B",
          bgColor: isDark ? "rgba(100, 116, 139, 0.2)" : "#F1F5F9",
        };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderCol }]}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.bellIconBox,
                  { backgroundColor: isDark ? "#134E4A" : "#CCFBF1" },
                ]}
              >
                <Feather name="bell" size={18} color="#0D9488" />
              </View>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={[styles.title, { color: textPrimary }]}>
                    Live Notifications
                  </Text>
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                  <View
                    style={[
                      styles.socketIndicator,
                      { backgroundColor: isSocketConnected ? "#10B981" : "#F59E0B" },
                    ]}
                  />
                  <Text style={{ fontSize: 11, color: textSecondary }}>
                    {isSocketConnected ? "Real-Time Sync Active" : "Connecting Socket..."}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <TouchableOpacity
                onPress={onRefresh}
                style={styles.refreshBtn}
                disabled={isNotificationsLoading || refreshing}
              >
                {isNotificationsLoading || refreshing ? (
                  <ActivityIndicator size="small" color="#0D9488" />
                ) : (
                  <Feather name="refresh-cw" size={18} color={textSecondary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={[styles.filterBar, { borderBottomColor: borderCol }]}>
            {(
              [
                { key: "all", label: "All" },
                { key: "unread", label: `Unread (${unreadCount})` },
                { key: "assigned", label: "Assignments" },
                { key: "alert", label: "Alerts" },
              ] as { key: FilterType; label: string }[]
            ).map((tab) => {
              const isSelected = activeFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setActiveFilter(tab.key);
                  }}
                  style={[
                    styles.filterTab,
                    isSelected && {
                      backgroundColor: isDark ? "#0D9488" : "#0D9488",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      { color: isSelected ? "#FFFFFF" : textSecondary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Action Toolbar */}
          {notifications.length > 0 && (
            <View style={[styles.toolbar, { borderBottomColor: borderCol }]}>
              <TouchableOpacity
                onPress={handleMarkAllRead}
                style={styles.toolbarBtn}
              >
                <Feather name="check-circle" size={14} color="#0D9488" />
                <Text style={styles.toolbarBtnText}>Mark all as read</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearAll}
                style={styles.toolbarBtn}
              >
                <Feather name="trash-2" size={14} color="#EF4444" />
                <Text style={[styles.toolbarBtnText, { color: "#EF4444" }]}>
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0D9488"
                colors={["#0D9488"]}
              />
            }
          >
            {filteredNotifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyIconBox,
                    { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" },
                  ]}
                >
                  <Feather name="bell-off" size={32} color="#94A3B8" />
                </View>
                <Text style={[styles.emptyTitle, { color: textPrimary }]}>
                  {activeFilter === "all"
                    ? "No Notifications Yet"
                    : `No ${activeFilter.toUpperCase()} Notifications`}
                </Text>
                <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                  When real-time property assignments, fraud warnings, or updates occur, they will appear here saved in the database.
                </Text>
              </View>
            ) : (
              filteredNotifications.map((notif) => {
                const meta = getNotifMeta(notif);
                const isRead = Boolean(notif.read || notif.isRead);
                const notifId = notif.id || notif._id;
                const leadObj = notif.lead || notif.data?.lead;

                return (
                  <TouchableOpacity
                    key={notifId}
                    activeOpacity={0.8}
                    onPress={() => handleSelectNotif(notif)}
                    style={[
                      styles.notifCard,
                      {
                        backgroundColor: cardBg,
                        borderColor: isRead
                          ? borderCol
                          : isDark
                          ? "#0D9488"
                          : "#14B8A6",
                        borderLeftWidth: isRead ? 1 : 4,
                        borderLeftColor: isRead ? borderCol : meta.color,
                      },
                    ]}
                  >
                    <View style={styles.notifCardTop}>
                      <View style={styles.notifTypeRow}>
                        <View
                          style={[
                            styles.typeBadge,
                            { backgroundColor: meta.bgColor },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={meta.icon}
                            size={14}
                            color={meta.color}
                          />
                          <Text
                            style={[
                              styles.notifTypeText,
                              { color: meta.color },
                            ]}
                          >
                            {meta.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.notifTime}>
                        {formatTime(notif.createdAt)}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.notifTitle,
                        {
                          color: textPrimary,
                          fontWeight: isRead ? "600" : "800",
                        },
                      ]}
                    >
                      {notif.title}
                    </Text>

                    <Text
                      style={[
                        styles.notifMessage,
                        {
                          color: isRead
                            ? textSecondary
                            : isDark
                            ? "#E2E8F0"
                            : "#334155",
                        },
                      ]}
                    >
                      {notif.message}
                    </Text>

                    {leadObj && (
                      <View style={styles.actionRow}>
                        <View style={styles.actionChip}>
                          <Feather name="shield" size={12} color="#0D9488" />
                          <Text style={styles.actionChipText}>
                            Tap to Open Lead / Verify
                          </Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    minHeight: "50%",
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bellIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
    marginLeft: 6,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  socketIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  refreshBtn: {
    padding: 6,
  },
  closeBtn: {
    padding: 6,
  },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(100, 116, 139, 0.12)",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  toolbarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  toolbarBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D9488",
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  notifCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  notifCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  notifTypeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  notifTypeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  notifTime: {
    fontSize: 11,
    color: "#94A3B8",
  },
  notifTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    marginTop: 10,
    flexDirection: "row",
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
});

export default NotificationModal;
