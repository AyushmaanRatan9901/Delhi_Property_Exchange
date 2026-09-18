import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSelector, useDispatch } from "react-redux";
import { useResponsiveTheme } from "../../constants/theme";
import { RootState } from "../../Redux/store";
import {
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from "../../Redux/VerificationStaff/verificationStaffSlice";

const { width } = Dimensions.get("window");

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenLead?: (lead: any) => void;
}

export const NotificationModal: React.FC<Props> = ({
  visible,
  onClose,
  onOpenLead,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const dispatch = useDispatch();

  const notifications = useSelector(
    (state: RootState) => state.verificationStaff.notifications
  );
  const unreadCount = useSelector(
    (state: RootState) => state.verificationStaff.unreadCount
  );
  const isSocketConnected = useSelector(
    (state: RootState) => state.verificationStaff.isSocketConnected
  );

  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");
  const cardBg = isDark ? "#1E293B" : "#FFFFFF";

  const handleSelectNotif = (notif: any) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    dispatch(markNotificationRead(notif.id));
    if (notif.lead && onOpenLead) {
      onClose();
      onOpenLead(notif.lead);
    }
  };

  const handleMarkAllRead = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    dispatch(markAllNotificationsRead());
  };

  const handleClearAll = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    dispatch(clearAllNotifications());
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
                    {isSocketConnected ? "Real-Time Connected" : "Connecting..."}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={textSecondary} />
            </TouchableOpacity>
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
          >
            {notifications.length === 0 ? (
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
                  No Notifications Yet
                </Text>
                <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
                  When a property lead is assigned to you in real time, you will receive instant alerts here.
                </Text>
              </View>
            ) : (
              notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  activeOpacity={0.8}
                  onPress={() => handleSelectNotif(notif)}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: notif.read
                        ? borderCol
                        : isDark
                        ? "#0D9488"
                        : "#14B8A6",
                      borderLeftWidth: notif.read ? 1 : 4,
                      borderLeftColor: notif.read ? borderCol : "#0D9488",
                    },
                  ]}
                >
                  <View style={styles.notifCardTop}>
                    <View style={styles.notifTypeRow}>
                      <MaterialCommunityIcons
                        name={
                          notif.type === "lead_assigned"
                            ? "home-plus"
                            : notif.type === "inspection"
                            ? "clipboard-check-outline"
                            : "alert-circle-outline"
                        }
                        size={16}
                        color="#0D9488"
                      />
                      <Text style={styles.notifTypeText}>
                        {notif.type === "lead_assigned"
                          ? "NEW ASSIGNMENT"
                          : notif.type === "inspection"
                          ? "INSPECTION"
                          : "ALERT"}
                      </Text>
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
                        fontWeight: notif.read ? "600" : "800",
                      },
                    ]}
                  >
                    {notif.title}
                  </Text>

                  <Text style={[styles.notifMessage, { color: textSecondary }]}>
                    {notif.message}
                  </Text>

                  {notif.lead && (
                    <View style={styles.actionRow}>
                      <View style={styles.actionChip}>
                        <Feather name="shield" size={12} color="#0D9488" />
                        <Text style={styles.actionChipText}>
                          Tap to Verify
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))
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
    maxHeight: "80%",
    minHeight: "45%",
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
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 1,
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
  closeBtn: {
    padding: 6,
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
    marginBottom: 6,
  },
  notifTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  notifTypeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0D9488",
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
    lineHeight: 17,
  },
  actionRow: {
    marginTop: 8,
    flexDirection: "row",
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
});

export default NotificationModal;
