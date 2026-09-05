import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../../constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface NotificationData {
  id: string;
  type: "visit" | "price_drop" | "token" | "offer" | "security" | "system";
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  read: boolean;
  priority: "high" | "normal" | "low";
  actionText?: string;
  actionRoute?: string;
  propertyId?: string;
  propertyTitle?: string;
  badge?: string;
  badgeColor?: string;
  icon:
    | keyof typeof MaterialCommunityIcons.glyphMap
    | keyof typeof Feather.glyphMap
    | keyof typeof Ionicons.glyphMap;
  iconFamily: "MaterialCommunityIcons" | "Feather" | "Ionicons";
  iconColor: string;
  iconBg: string;
}

const INITIAL_NOTIFICATIONS: NotificationData[] = [
  {
    id: "notif-1",
    type: "visit",
    title: "Guided Property Visit Confirmed! 🗓️",
    message:
      "Your free physical visit for Executive Single Room (Sector 6, Dwarka) is confirmed for Tomorrow at 4:00 PM. Caretaker Ramesh Kumar will meet you.",
    timestamp: "2026-09-05T11:45:00Z",
    timeAgo: "15m ago",
    read: false,
    priority: "high",
    propertyId: "1",
    propertyTitle: "Executive Single Room with Balcony",
    actionText: "View Visit Pass",
    badge: "Upcoming Visit",
    badgeColor: "#10B981",
    icon: "calendar-check",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#10B981",
    iconBg: "rgba(16, 185, 129, 0.14)",
  },
  {
    id: "notif-2",
    type: "price_drop",
    title: "Price Drop Alert: ₹1,000/mo Off! 🏷️",
    message:
      "Safe & Secure Girls Co-living PG (Sector 10, Dwarka) just slashed rent from ₹9,500 to ₹8,500/mo with Zero Brokerage.",
    timestamp: "2026-09-05T10:30:00Z",
    timeAgo: "1h ago",
    read: false,
    priority: "high",
    propertyId: "2",
    propertyTitle: "Safe & Secure Girls Co-living PG",
    actionText: "View Discounted Room",
    badge: "Save ₹12,000/yr",
    badgeColor: "#EF4444",
    icon: "trending-down",
    iconFamily: "Feather",
    iconColor: "#EF4444",
    iconBg: "rgba(239, 68, 68, 0.14)",
  },
  {
    id: "notif-3",
    type: "token",
    title: "Move-in Token Active (48h Lock) 🔑",
    message:
      "Room #204 is exclusively locked for you until Sunday 6:00 PM. Protected by 100% Refundable Deposit Guarantee.",
    timestamp: "2026-09-05T08:15:00Z",
    timeAgo: "3h ago",
    read: false,
    priority: "high",
    propertyId: "1",
    propertyTitle: "Dwarka Sector 6 Premium Stay",
    actionText: "Track Room Lock",
    badge: "Guaranteed Lock",
    badgeColor: "#3B82F6",
    icon: "key-variant",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#3B82F6",
    iconBg: "rgba(59, 130, 246, 0.14)",
  },
  {
    id: "notif-4",
    type: "offer",
    title: "Special Move-in Bonus: ₹2,000 Cashback 🎁",
    message:
      "Apply promo code DELHI2000 at checkout to receive instant ₹2,000 cashback credited directly to your bank account upon check-in.",
    timestamp: "2026-09-04T18:00:00Z",
    timeAgo: "Yesterday",
    read: true,
    priority: "normal",
    actionText: "Copy Code: DELHI2000",
    badge: "Exclusive Bonus",
    badgeColor: "#F59E0B",
    icon: "gift-outline",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#F59E0B",
    iconBg: "rgba(245, 158, 11, 0.14)",
  },
  {
    id: "notif-5",
    type: "security",
    title: "Biometric Access Profile Ready 🛡️",
    message:
      "Your tenant KYC and digital gate pass have been verified by Delhi Property Exchange Trust Desk. 24/7 keyless entry activated.",
    timestamp: "2026-09-04T12:20:00Z",
    timeAgo: "1d ago",
    read: true,
    priority: "normal",
    actionText: "View Digital Pass",
    badge: "Verified Tenant",
    badgeColor: "#8B5CF6",
    icon: "shield-check-outline",
    iconFamily: "MaterialCommunityIcons",
    iconColor: "#8B5CF6",
    iconBg: "rgba(139, 92, 246, 0.14)",
  },
  {
    id: "notif-6",
    type: "system",
    title: "Delhi Property Exchange 2.0 Live 🚀",
    message:
      "Explore 360° virtual tours, transparent rent split calculator, and instant caretaker WhatsApp direct connect.",
    timestamp: "2026-09-03T09:00:00Z",
    timeAgo: "2d ago",
    read: true,
    priority: "low",
    badge: "System Update",
    badgeColor: "#06B6D4",
    icon: "sparkles",
    iconFamily: "Ionicons",
    iconColor: "#06B6D4",
    iconBg: "rgba(6, 182, 212, 0.14)",
  },
];

type FilterTab = "all" | "visit" | "offer" | "security";

export interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  origin?: { x: number; y: number };
}

/**
 * Ultra-Smooth Realistic iOS-Inspired App Launch & Morphing Transition Modal
 * Originates from the exact coordinates of the Header Bell Icon and expands into full-screen
 */
export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  origin,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    colors,
    moderateScale,
    spacing,
    radii,
    typography,
    layout,
    shadows,
    isDark,
  } = useResponsiveTheme();

  // Animation State
  const [modalRendered, setModalRendered] = useState(visible);
  const animProgress = useRef(new Animated.Value(0)).current;
  const animContentSlide = useRef(new Animated.Value(0)).current;
  const [notifications, setNotifications] = useState<NotificationData[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedNotif, setSelectedNotif] = useState<NotificationData | null>(
    null,
  );

  // Dynamic origin calculation based on Header Bell position
  const bellOrigin = useMemo(() => {
    if (origin && origin.x > 0 && origin.y > 0) {
      return origin;
    }
    return {
      x: SCREEN_WIDTH - 76,
      y: (insets.top || 20) + 34,
    };
  }, [origin, insets.top]);

  const ICON_SIZE = 44;

  // Handle open / close animations with realistic iOS spring physics
  useEffect(() => {
    if (visible) {
      setModalRendered(true);
      animProgress.setValue(0);
      animContentSlide.setValue(0);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}

      // Step 1: Smooth, Cinematic iOS Expansion from Icon to Full Screen
      Animated.parallel([
        Animated.timing(animProgress, {
          toValue: 1,
          duration: 540,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(animContentSlide, {
          toValue: 1,
          duration: 500,
          delay: 120,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalRendered) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}

      // Step 2: Smooth Fluid Contraction back into the Bell Icon
      Animated.parallel([
        Animated.timing(animProgress, {
          toValue: 0,
          duration: 360,
          easing: Easing.bezier(0.25, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(animContentSlide, {
          toValue: 0,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalRendered(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    Animated.parallel([
      Animated.timing(animProgress, {
        toValue: 0,
        duration: 360,
        easing: Easing.bezier(0.25, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(animContentSlide, {
        toValue: 0,
        duration: 250,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalRendered(false);
      onClose();
    });
  };

  const handleMarkAllAsRead = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    Alert.alert(
      "All Caught Up! 🎉",
      "All notifications have been marked as read.",
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to remove all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            try {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            } catch (e) {}
            setNotifications([]);
          },
        },
      ],
    );
  };

  const handleItemPress = (item: NotificationData) => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}

    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
    );

    if (item.propertyId) {
      handleClose();
      setTimeout(() => {
        router.push({
          pathname: "/CusomterPanelScreens/PropertyDeatilScreeen/[id]",
          params: { id: item.propertyId },
        } as any);
      }, 300);
    } else if (item.actionText?.includes("DELHI2000")) {
      Alert.alert(
        "Promo Code Copied! 🎁",
        "Code DELHI2000 copied. ₹2,000 will be credited to your account upon move-in confirmation.",
      );
    } else {
      setSelectedNotif(item);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === "all") return notifications;
    if (activeTab === "visit")
      return notifications.filter(
        (n) => n.type === "visit" || n.type === "token",
      );
    if (activeTab === "offer")
      return notifications.filter(
        (n) => n.type === "price_drop" || n.type === "offer",
      );
    if (activeTab === "security")
      return notifications.filter(
        (n) => n.type === "security" || n.type === "system",
      );
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!modalRendered) return null;

  // iOS Morphing Shared Element Calculations
  const targetCenterX = SCREEN_WIDTH / 2;
  const targetCenterY = SCREEN_HEIGHT / 2;
  const deltaX = bellOrigin.x - targetCenterX;
  const deltaY = bellOrigin.y - targetCenterY;

  return (
    <Modal
      visible={modalRendered}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Background Backdrop Smooth Fade & Scale Dissolve */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: animProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Morphing Expanding Shared-Element Window with Smooth Corner Curvature */}
        <Animated.View
          style={[
            styles.morphWindow,
            {
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
              backgroundColor: colors.background,
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.16)"
                : "rgba(0, 0, 0, 0.08)",
              transform: [
                {
                  translateX: animProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [deltaX, 0],
                  }),
                },
                {
                  translateY: animProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [deltaY, 0],
                  }),
                },
                {
                  scaleX: animProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [ICON_SIZE / SCREEN_WIDTH, 1],
                  }),
                },
                {
                  scaleY: animProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [ICON_SIZE / SCREEN_HEIGHT, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Initial Icon State (Micro-badge at the start of launch) */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.launchIconOverlay,
              {
                opacity: animProgress.interpolate({
                  inputRange: [0, 0.12, 0.28],
                  outputRange: [1, 0.8, 0],
                }),
                transform: [
                  {
                    scale: animProgress.interpolate({
                      inputRange: [0, 0.28],
                      outputRange: [1, 2.4],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.launchIconPill,
                {
                  backgroundColor: colors.primary,
                  borderRadius: moderateScale(22),
                  width: moderateScale(44),
                  height: moderateScale(44),
                },
              ]}
            >
              <Ionicons
                name="notifications"
                size={moderateScale(22)}
                color="#FFFFFF"
              />
            </View>
          </Animated.View>

          {/* Full Application Screen Interface */}
          <Animated.View
            style={[
              styles.fullAppContent,
              {
                opacity: animProgress.interpolate({
                  inputRange: [0, 0.15, 0.6, 1],
                  outputRange: [0, 0.4, 0.9, 1],
                }),
              },
            ]}
          >
            <SafeAreaView
              style={[styles.safeArea, { backgroundColor: colors.background }]}
              edges={[]}
            >
              <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={colors.background}
              />

              {/* Top Premium Header Bar */}
              <View
                style={[
                  styles.headerBar,
                  {
                    backgroundColor: isDark
                      ? colors.cardBackground
                      : "rgba(255, 255, 255, 0.96)",
                    borderBottomColor: colors.borderLight,
                    paddingHorizontal: spacing.screenHorizontal,
                    paddingTop:
                      insets.top > 0 ? insets.top + spacing.xs : spacing.md,
                    paddingBottom: spacing.sm + 2,
                  },
                  shadows.sm,
                ]}
              >
                <View style={layout.horizontalViewBetween}>
                  {/* Title & Unread Pill */}
                  <View
                    style={[layout.horizontalView, { gap: spacing.xs + 2 }]}
                  >
                    <View
                      style={[
                        styles.bellIconPill,
                        {
                          backgroundColor: isDark
                            ? colors.surfaceHover
                            : colors.primaryLight,
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Ionicons
                        name="notifications"
                        size={moderateScale(18)}
                        color={colors.primary}
                      />
                    </View>

                    <View>
                      <View style={layout.horizontalView}>
                        <Text
                          style={[
                            typography.sectionTitle,
                            {
                              fontSize: moderateScale(18),
                              fontWeight: "800",
                              color: colors.textPrimary,
                              letterSpacing: -0.3,
                            },
                          ]}
                        >
                          Notifications
                        </Text>
                        {unreadCount > 0 && (
                          <View
                            style={[
                              styles.unreadBadge,
                              {
                                backgroundColor: colors.notificationRed,
                                borderRadius: radii.pill,
                                marginLeft: 6,
                              },
                            ]}
                          >
                            <Text style={styles.unreadBadgeText}>
                              {unreadCount} New
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          color: colors.textSecondary,
                          fontWeight: "500",
                        }}
                      >
                        Delhi Property Exchange Alerts
                      </Text>
                    </View>
                  </View>

                  {/* Actions: Mark Read & Close Circle */}
                  <View style={[layout.horizontalView, { gap: spacing.xs }]}>
                    {unreadCount > 0 && (
                      <TouchableOpacity
                        onPress={handleMarkAllAsRead}
                        activeOpacity={0.7}
                        style={[
                          styles.actionPillBtn,
                          {
                            backgroundColor: isDark
                              ? colors.surfaceHover
                              : colors.surfaceLight,
                            borderColor: colors.border,
                            borderRadius: radii.pill,
                          },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-done"
                          size={moderateScale(14)}
                          color={colors.primary}
                          style={{ marginRight: 3 }}
                        />
                        <Text
                          style={{
                            fontSize: moderateScale(11),
                            fontWeight: "700",
                            color: colors.primary,
                          }}
                        >
                          Mark Read
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Circular Close Button originating back to bell */}
                    <TouchableOpacity
                      onPress={handleClose}
                      activeOpacity={0.8}
                      style={[
                        styles.closeCircleBtn,
                        {
                          backgroundColor: isDark
                            ? colors.surfaceHover
                            : colors.surfaceLight,
                          borderColor: colors.border,
                          borderRadius: radii.round,
                        },
                        shadows.sm,
                      ]}
                    >
                      <Ionicons
                        name="close"
                        size={moderateScale(20)}
                        color={colors.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Filter Tabs Bar */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.tabsScroll,
                    { gap: spacing.xs + 2, paddingTop: spacing.sm + 2 },
                  ]}
                >
                  {[
                    { key: "all", label: `All (${notifications.length})` },
                    { key: "visit", label: "Visits & Locks 🔑" },
                    { key: "offer", label: "Discounts & Offers 🎁" },
                    { key: "security", label: "Trust & Safety 🛡️" },
                  ].map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <TouchableOpacity
                        key={tab.key}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch (e) {}
                          setActiveTab(tab.key as FilterTab);
                        }}
                        activeOpacity={0.8}
                        style={[
                          styles.filterTab,
                          {
                            backgroundColor: isActive
                              ? colors.primary
                              : isDark
                                ? colors.surfaceHover
                                : colors.surfaceLight,
                            borderColor: isActive
                              ? colors.primary
                              : colors.border,
                            borderRadius: radii.pill,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.xs + 2,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(11.5),
                            fontWeight: isActive ? "800" : "600",
                            color: isActive
                              ? colors.white
                              : colors.textSecondary,
                          }}
                        >
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Staggered Notification Cards Stream */}
              <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: spacing.screenHorizontal,
                  paddingTop: spacing.md,
                  paddingBottom:
                    (insets.bottom > 0 ? insets.bottom : 20) + spacing.xxl + 20,
                  gap: spacing.sm + 2,
                }}
                style={{
                  transform: [
                    {
                      translateY: animContentSlide.interpolate({
                        inputRange: [0, 1],
                        outputRange: [22, 0],
                      }),
                    },
                  ],
                }}
              >
                {filteredNotifications.length === 0 ? (
                  /* Empty State */
                  <View style={[layout.center, styles.emptyStateContainer]}>
                    <View
                      style={[
                        styles.emptyIconCircle,
                        {
                          backgroundColor: isDark
                            ? colors.surfaceHover
                            : colors.primaryLight,
                          borderRadius: moderateScale(50),
                        },
                      ]}
                    >
                      <Ionicons
                        name="notifications-off-outline"
                        size={moderateScale(42)}
                        color={colors.primary}
                      />
                    </View>
                    <Text
                      style={[
                        typography.sectionTitle,
                        {
                          fontSize: moderateScale(16),
                          color: colors.textPrimary,
                          marginTop: spacing.md,
                        },
                      ]}
                    >
                      No Notifications in this category
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(12),
                        color: colors.textSecondary,
                        textAlign: "center",
                        marginTop: 4,
                        paddingHorizontal: spacing.xl,
                      }}
                    >
                      You're all up to date! New visit updates, price drops, and
                      move-in tokens will appear here.
                    </Text>
                  </View>
                ) : (
                  filteredNotifications.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleItemPress(item)}
                      activeOpacity={0.88}
                      style={[
                        styles.notifCard,
                        {
                          backgroundColor: !item.read
                            ? isDark
                              ? "rgba(30, 58, 138, 0.22)"
                              : "#F0F9FF"
                            : colors.cardBackground,
                          borderColor: !item.read
                            ? isDark
                              ? "#1E40AF"
                              : "#BAE6FD"
                            : colors.border,
                          borderRadius: radii.xl,
                          padding: spacing.md,
                        },
                        shadows.sm,
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Icon Box */}
                        <View
                          style={[
                            styles.itemIconBox,
                            {
                              backgroundColor: item.iconBg,
                              borderRadius: radii.lg,
                            },
                          ]}
                        >
                          {item.iconFamily === "MaterialCommunityIcons" && (
                            <MaterialCommunityIcons
                              name={item.icon as any}
                              size={moderateScale(20)}
                              color={item.iconColor}
                            />
                          )}
                          {item.iconFamily === "Feather" && (
                            <Feather
                              name={item.icon as any}
                              size={moderateScale(19)}
                              color={item.iconColor}
                            />
                          )}
                          {item.iconFamily === "Ionicons" && (
                            <Ionicons
                              name={item.icon as any}
                              size={moderateScale(20)}
                              color={item.iconColor}
                            />
                          )}
                        </View>

                        {/* Text Details */}
                        <View style={{ flex: 1, marginLeft: spacing.sm + 2 }}>
                          {/* Top Row: Badge & Timestamp */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              {item.badge && (
                                <View
                                  style={[
                                    styles.pillBadge,
                                    {
                                      backgroundColor: isDark
                                        ? "rgba(255,255,255,0.08)"
                                        : "rgba(0,0,0,0.05)",
                                      borderColor:
                                        item.badgeColor || colors.primary,
                                      borderRadius: radii.pill,
                                    },
                                  ]}
                                >
                                  <Text
                                    style={{
                                      fontSize: moderateScale(10),
                                      fontWeight: "800",
                                      color: item.badgeColor || colors.primary,
                                    }}
                                  >
                                    {item.badge}
                                  </Text>
                                </View>
                              )}
                              {!item.read && (
                                <View
                                  style={[
                                    styles.unreadDot,
                                    { backgroundColor: colors.notificationRed },
                                  ]}
                                />
                              )}
                            </View>

                            <Text
                              style={{
                                fontSize: moderateScale(11),
                                color: colors.textMuted,
                                fontWeight: "600",
                              }}
                            >
                              {item.timeAgo}
                            </Text>
                          </View>

                          {/* Title */}
                          <Text
                            style={[
                              typography.cardTitle,
                              {
                                fontSize: moderateScale(13.5),
                                fontWeight: !item.read ? "800" : "700",
                                color: colors.textPrimary,
                                marginTop: 3,
                              },
                            ]}
                          >
                            {item.title}
                          </Text>

                          {/* Message Body */}
                          <Text
                            style={[
                              typography.cardAmenity,
                              {
                                fontSize: moderateScale(12),
                                lineHeight: moderateScale(18),
                                color: colors.textSecondary,
                                marginTop: 2,
                              },
                            ]}
                          >
                            {item.message}
                          </Text>

                          {/* Action Button CTA */}
                          {item.actionText && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginTop: spacing.xs + 2,
                              }}
                            >
                              <View
                                style={[
                                  styles.actionPill,
                                  {
                                    backgroundColor: isDark
                                      ? colors.surfaceHover
                                      : colors.surfaceLight,
                                    borderColor: colors.border,
                                    borderRadius: radii.pill,
                                    paddingHorizontal: spacing.sm + 2,
                                    paddingVertical: 3,
                                  },
                                ]}
                              >
                                <Text
                                  style={{
                                    fontSize: moderateScale(11),
                                    fontWeight: "700",
                                    color: colors.primary,
                                  }}
                                >
                                  {item.actionText} →
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}

                {/* Clear All Footer Button */}
                {notifications.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearAll}
                    activeOpacity={0.75}
                    style={[
                      styles.clearAllBtn,
                      {
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        paddingVertical: spacing.md,
                        marginTop: spacing.md,
                      },
                    ]}
                  >
                    <Feather
                      name="trash-2"
                      size={moderateScale(15)}
                      color={colors.textMuted}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(12.5),
                        fontWeight: "700",
                        color: colors.textMuted,
                      }}
                    >
                      Clear All Notifications
                    </Text>
                  </TouchableOpacity>
                )}
              </Animated.ScrollView>
            </SafeAreaView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * Screen Export (for router support at CusomterPanelScreens/PropertyDeatilScreeen/Notification/notification)
 */
export default function NotificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <NotificationModal
      visible={true}
      onClose={() => router.back()}
      origin={{ x: SCREEN_WIDTH - 76, y: (insets.top || 20) + 34 }}
    />
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(4, 13, 24, 0.65)",
  },
  morphWindow: {
    position: "absolute",
    overflow: "hidden",
    borderRadius: 36,
  },
  launchIconOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  launchIconPill: {
    alignItems: "center",
    justifyContent: "center",
  },
  fullAppContent: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    borderBottomWidth: 1,
  },
  bellIconPill: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  actionPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  closeCircleBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tabsScroll: {
    flexDirection: "row",
  },
  filterTab: {
    borderWidth: 1,
  },
  notifCard: {
    borderWidth: 1.2,
  },
  itemIconBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  pillBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  actionPill: {
    borderWidth: 1,
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptyStateContainer: {
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
  },
});
