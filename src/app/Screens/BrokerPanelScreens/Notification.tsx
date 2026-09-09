import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Linking,
  Modal,
  Platform,
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
import { useResponsiveTheme } from "../../../constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface BrokerNotificationItem {
  id: string;
  type: "VISIT" | "COMMISSION" | "PROPERTY" | "LEAD" | "SYSTEM";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: "HIGH" | "NORMAL";
  meta?: {
    propertyName?: string;
    roomNumber?: string;
    tenantName?: string;
    tenantPhone?: string;
    amount?: number;
    utrNumber?: string;
    visitDateTime?: string;
  };
}

const INITIAL_NOTIFICATIONS: BrokerNotificationItem[] = [
  {
    id: "notif-01",
    type: "VISIT",
    title: "New In-Person Visit Booked 🗓️",
    message:
      "Pooja Verma has scheduled a property visit for Dwarka Sec 12 Luxury Girls PG (Room 102).",
    timestamp: "10 mins ago",
    isRead: false,
    priority: "HIGH",
    meta: {
      propertyName: "Dwarka Sec 12 Luxury Girls PG",
      roomNumber: "Room 102 (AC Single)",
      tenantName: "Pooja Verma",
      tenantPhone: "+91 98711 54321",
      visitDateTime: "Tomorrow, 04:30 PM",
    },
  },
  {
    id: "notif-02",
    type: "COMMISSION",
    title: "Commission Credited to Bank! 🎉",
    message:
      "₹7,250 broker commission for Janakpuri Boys Hostel (Room 204) has been credited to your HDFC Bank account.",
    timestamp: "1 hour ago",
    isRead: false,
    priority: "HIGH",
    meta: {
      propertyName: "Janakpuri West Boys Hostel",
      roomNumber: "Room 204",
      amount: 7250,
      utrNumber: "HDFC9842103982",
    },
  },
  {
    id: "notif-03",
    type: "LEAD",
    title: "High-Priority Lead Inquiry 👤",
    message:
      "Aman Tripathi is looking for a Twin Sharing AC PG near Janakpuri Metro with a budget of ₹11,000/mo.",
    timestamp: "3 hours ago",
    isRead: false,
    priority: "HIGH",
    meta: {
      tenantName: "Aman Tripathi",
      tenantPhone: "+91 98102 99887",
      propertyName: "Janakpuri West Boys Hostel",
    },
  },
  {
    id: "notif-04",
    type: "PROPERTY",
    title: "Listing Approved & Live 🏢",
    message:
      "Your new listing 'Rohini Sector 15 Furnished 1BHK Floor' has passed verification and is now live for tenant bookings.",
    timestamp: "Yesterday, 06:15 PM",
    isRead: true,
    priority: "NORMAL",
    meta: {
      propertyName: "Rohini Sec 15 Furnished 1BHK",
    },
  },
  {
    id: "notif-05",
    type: "COMMISSION",
    title: "Payout Settlement in Clearing ⏳",
    message:
      "₹9,000 payout for Rohini Floor 2 has been initiated and will settle to HDFC Bank (•••• 4821) within 24 hours.",
    timestamp: "Yesterday, 02:00 PM",
    isRead: true,
    priority: "NORMAL",
    meta: {
      propertyName: "Rohini Sec 15 Furnished 1BHK",
      amount: 9000,
    },
  },
  {
    id: "notif-06",
    type: "SYSTEM",
    title: "Monthly Broker Performance Report 📊",
    message:
      "Your February 2026 statement is ready: 38 deals closed, ₹1,32,250 total commission generated.",
    timestamp: "2 days ago",
    isRead: true,
    priority: "NORMAL",
  },
];

export interface BrokerNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  origin?: { x: number; y: number };
}

/**
 * Ultra-Smooth Realistic iOS-Inspired Morphing Transition Modal for Broker Notifications
 * Originates from the exact coordinates of the Header Bell Icon and expands into full-screen
 */
export const BrokerNotificationModal: React.FC<
  BrokerNotificationModalProps
> = ({ visible, onClose, origin }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, moderateScale, spacing, radii, typography, isDark } =
    useResponsiveTheme();

  // Animation State
  const [modalRendered, setModalRendered] = useState(visible);
  const animProgress = useRef(new Animated.Value(0)).current;
  const animContentSlide = useRef(new Animated.Value(0)).current;

  const [notifications, setNotifications] = useState<BrokerNotificationItem[]>(
    INITIAL_NOTIFICATIONS,
  );
  const [activeCategory, setActiveCategory] = useState<
    "ALL" | "VISIT" | "COMMISSION" | "LEAD" | "PROPERTY"
  >("ALL");
  const [selectedNotif, setSelectedNotif] =
    useState<BrokerNotificationItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Dynamic origin calculation based on Header Bell position
  const bellOrigin = useMemo(() => {
    if (origin && origin.x > 0 && origin.y > 0) {
      return origin;
    }
    return {
      x: SCREEN_WIDTH - 50,
      y: (insets.top || 20) + 30,
    };
  }, [origin, insets.top]);

  const ICON_SIZE = 40;

  // Handle open / close animations with realistic iOS bezier curves
  useEffect(() => {
    if (visible) {
      setModalRendered(true);
      animProgress.setValue(0);
      animContentSlide.setValue(0);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e) {}

      // Expansion from Bell Icon to Full Screen
      Animated.parallel([
        Animated.timing(animProgress, {
          toValue: 1,
          duration: 520,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(animContentSlide, {
          toValue: 1,
          duration: 480,
          delay: 100,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalRendered) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}

      // Contraction back into the Bell Icon
      Animated.parallel([
        Animated.timing(animProgress, {
          toValue: 0,
          duration: 340,
          easing: Easing.bezier(0.25, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(animContentSlide, {
          toValue: 0,
          duration: 240,
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
        duration: 340,
        easing: Easing.bezier(0.25, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(animContentSlide, {
        toValue: 0,
        duration: 240,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalRendered(false);
      onClose();
    });
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (activeCategory === "ALL") return notifications;
    return notifications.filter((n) => n.type === activeCategory);
  }, [notifications, activeCategory]);

  const handleMarkAllAsRead = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    Alert.alert("All Read", "All broker notifications marked as read.");
  };

  const handleNotificationPress = (item: BrokerNotificationItem) => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
    );
    setSelectedNotif(item);
    setDetailModalVisible(true);
  };

  const handleCallTenant = (phone?: string) => {
    if (!phone) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Linking.openURL(`tel:${phone}`);
    } catch {
      Alert.alert("Call", `Dialing ${phone}`);
    }
  };

  const handleOpenCommission = () => {
    setDetailModalVisible(false);
    handleClose();
    setTimeout(() => {
      router.push("/BrokerPanel/(tabs)/money" as any);
    }, 350);
  };

  const handleOpenProperties = () => {
    setDetailModalVisible(false);
    handleClose();
    setTimeout(() => {
      router.push("/BrokerPanel/(tabs)/property" as any);
    }, 350);
  };

  const getCategoryIcon = (type: BrokerNotificationItem["type"]) => {
    switch (type) {
      case "VISIT":
        return {
          icon: <Ionicons name="calendar" size={19} color="#0284C7" />,
          bg: "#E0F2FE",
          label: "Visit",
          badgeColor: "#0284C7",
        };
      case "COMMISSION":
        return {
          icon: <Ionicons name="wallet" size={19} color="#059669" />,
          bg: "#ECFDF5",
          label: "Commission",
          badgeColor: "#059669",
        };
      case "LEAD":
        return {
          icon: <Ionicons name="person-add" size={19} color="#D97706" />,
          bg: "#FEF3C7",
          label: "New Lead",
          badgeColor: "#D97706",
        };
      case "PROPERTY":
        return {
          icon: <MaterialIcons name="apartment" size={20} color="#7C3AED" />,
          bg: "#EDE9FE",
          label: "Property",
          badgeColor: "#7C3AED",
        };
      case "SYSTEM":
      default:
        return {
          icon: <Ionicons name="notifications" size={19} color="#64748B" />,
          bg: "#F1F5F9",
          label: "System",
          badgeColor: "#64748B",
        };
    }
  };

  if (!modalRendered) return null;

  // Morphing calculations
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
        {/* Background Backdrop Smooth Fade */}
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

        {/* Morphing Expanding Shared-Element Window */}
        <Animated.View
          style={[
            styles.morphWindow,
            {
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
              backgroundColor: isDark ? "#090D14" : "#F8FAFC",
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
          {/* Micro Icon Overlay at Start of Expansion */}
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
                  backgroundColor: colors.primary || "#0D9488",
                  borderRadius: moderateScale(20),
                  width: moderateScale(40),
                  height: moderateScale(40),
                },
              ]}
            >
              <Ionicons
                name="notifications"
                size={moderateScale(20)}
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
              style={[
                styles.safeArea,
                { backgroundColor: isDark ? "#090D14" : "#F8FAFC" },
              ]}
              edges={["top", "bottom"]}
            >
              <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                backgroundColor={isDark ? "#090D14" : "#F8FAFC"}
              />

              {/* 1. Header Bar with Status Bar Inset */}
              <View
                style={[
                  styles.topNav,
                  {
                    paddingTop:
                      Math.max(
                        insets.top,
                        Platform.OS === "android"
                          ? StatusBar.currentHeight || 24
                          : 20,
                      ) + 6,
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleClose}
                  style={[
                    styles.backBtn,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Feather
                    name="arrow-left"
                    size={20}
                    color={isDark ? "#F8FAFC" : "#0F172A"}
                  />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                  <Text
                    style={[
                      styles.screenTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Broker Notifications
                  </Text>
                  <Text
                    style={[
                      styles.screenSubtitle,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    {unreadCount > 0
                      ? `${unreadCount} unread updates`
                      : "All caught up"}
                  </Text>
                </View>

                {unreadCount > 0 ? (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleMarkAllAsRead}
                    style={[
                      styles.markAllBtn,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-done"
                      size={16}
                      color={colors.primary || "#0D9488"}
                    />
                    <Text
                      style={[
                        styles.markAllText,
                        { color: colors.primary || "#0D9488" },
                      ]}
                    >
                      Read All
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 40 }} />
                )}
              </View>

              {/* 2. Category Filter Chips */}
              <View style={styles.filterBar}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterScroll}
                >
                  {(
                    [
                      { key: "ALL", label: `All (${notifications.length})` },
                      { key: "VISIT", label: "Visits 📅" },
                      { key: "COMMISSION", label: "Commission 💰" },
                      { key: "LEAD", label: "Leads 👤" },
                      { key: "PROPERTY", label: "Properties 🏢" },
                    ] as const
                  ).map((chip) => {
                    const isActive = activeCategory === chip.key;
                    return (
                      <TouchableOpacity
                        key={chip.key}
                        activeOpacity={0.8}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                          setActiveCategory(chip.key);
                        }}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor: isActive
                              ? colors.primary || "#0D9488"
                              : isDark
                                ? "#1E293B"
                                : "#FFFFFF",
                            borderColor: isActive
                              ? colors.primary || "#0D9488"
                              : isDark
                                ? "#334155"
                                : "#E2E8F0",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            {
                              color: isActive
                                ? "#FFFFFF"
                                : isDark
                                  ? "#94A3B8"
                                  : "#64748B",
                              fontWeight: isActive ? "700" : "500",
                            },
                          ]}
                        >
                          {chip.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 3. Notification Items List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 18,
                  paddingTop: 8,
                  paddingBottom: insets.bottom + 40,
                }}
              >
                {filteredNotifications.length === 0 ? (
                  <View
                    style={[
                      styles.emptyCard,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <Ionicons
                      name="notifications-off-outline"
                      size={48}
                      color="#94A3B8"
                    />
                    <Text
                      style={[
                        styles.emptyTitle,
                        { color: isDark ? "#F8FAFC" : "#0F172A" },
                      ]}
                    >
                      No notifications here
                    </Text>
                    <Text style={styles.emptySub}>
                      You don't have any notifications in the selected category.
                    </Text>
                  </View>
                ) : (
                  filteredNotifications.map((item) => {
                    const config = getCategoryIcon(item.type);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.88}
                        onPress={() => handleNotificationPress(item)}
                        style={[
                          styles.notifCard,
                          {
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            borderColor: !item.isRead
                              ? colors.primary || "#0D9488"
                              : isDark
                                ? "#334155"
                                : "#E2E8F0",
                            borderWidth: !item.isRead ? 1.5 : 1,
                          },
                        ]}
                      >
                        {/* Unread Indicator Dot */}
                        {!item.isRead && (
                          <View
                            style={[
                              styles.unreadDot,
                              { backgroundColor: colors.primary || "#0D9488" },
                            ]}
                          />
                        )}

                        <View style={styles.cardMainRow}>
                          {/* Category Icon */}
                          <View
                            style={[
                              styles.notifIconBox,
                              {
                                backgroundColor: isDark ? "#0F172A" : config.bg,
                              },
                            ]}
                          >
                            {config.icon}
                          </View>

                          {/* Body */}
                          <View style={styles.notifBody}>
                            <View style={styles.cardHeaderRow}>
                              <View
                                style={[
                                  styles.catBadge,
                                  {
                                    backgroundColor: isDark
                                      ? "#0F172A"
                                      : config.bg,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.catBadgeText,
                                    { color: config.badgeColor },
                                  ]}
                                >
                                  {config.label}
                                </Text>
                              </View>

                              <Text style={styles.timestampText}>
                                {item.timestamp}
                              </Text>
                            </View>

                            <Text
                              style={[
                                styles.notifTitle,
                                {
                                  color: isDark ? "#F8FAFC" : "#0F172A",
                                  fontWeight: !item.isRead ? "800" : "600",
                                },
                              ]}
                            >
                              {item.title}
                            </Text>

                            <Text
                              numberOfLines={2}
                              style={[
                                styles.notifMessage,
                                { color: isDark ? "#94A3B8" : "#64748B" },
                              ]}
                            >
                              {item.message}
                            </Text>

                            {/* Quick Metadata Pill */}
                            {item.meta?.amount && (
                              <View style={styles.metaAmountPill}>
                                <Ionicons
                                  name="cash-outline"
                                  size={13}
                                  color="#059669"
                                />
                                <Text style={styles.metaAmountText}>
                                  ₹{item.meta.amount.toLocaleString("en-IN")}
                                </Text>
                              </View>
                            )}

                            {item.meta?.visitDateTime && (
                              <View style={styles.metaVisitPill}>
                                <Ionicons
                                  name="time-outline"
                                  size={13}
                                  color="#0284C7"
                                />
                                <Text style={styles.metaVisitText}>
                                  {item.meta.visitDateTime}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </Animated.View>
      </View>

      {/* 4. Notification Detail Bottom Sheet Modal */}
      <Modal
        visible={detailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.detailModalOverlay}>
          <View
            style={[
              styles.detailModalSheet,
              {
                backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text
                  style={[
                    styles.modalHeading,
                    { color: isDark ? "#F8FAFC" : "#0F172A" },
                  ]}
                >
                  Notification Details
                </Text>
                <Text style={styles.modalTime}>{selectedNotif?.timestamp}</Text>
              </View>

              <TouchableOpacity
                onPress={() => setDetailModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? "#FFFFFF" : "#0F172A"}
                />
              </TouchableOpacity>
            </View>

            {selectedNotif && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View
                  style={[
                    styles.modalInfoCard,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalTitleText,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    {selectedNotif.title}
                  </Text>
                  <Text
                    style={[
                      styles.modalMsgText,
                      { color: isDark ? "#CBD5E1" : "#475569" },
                    ]}
                  >
                    {selectedNotif.message}
                  </Text>
                </View>

                {selectedNotif.meta && (
                  <View
                    style={[
                      styles.modalDetailCard,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalMetaHeading,
                        { color: isDark ? "#F8FAFC" : "#0F172A" },
                      ]}
                    >
                      Associated Details
                    </Text>

                    {selectedNotif.meta.propertyName && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Property</Text>
                        <Text
                          style={[
                            styles.metaVal,
                            { color: isDark ? "#F8FAFC" : "#0F172A" },
                          ]}
                        >
                          {selectedNotif.meta.propertyName}
                        </Text>
                      </View>
                    )}

                    {selectedNotif.meta.roomNumber && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Room / Unit</Text>
                        <Text
                          style={[
                            styles.metaVal,
                            { color: isDark ? "#F8FAFC" : "#0F172A" },
                          ]}
                        >
                          {selectedNotif.meta.roomNumber}
                        </Text>
                      </View>
                    )}

                    {selectedNotif.meta.tenantName && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Tenant / Client</Text>
                        <Text
                          style={[
                            styles.metaVal,
                            { color: isDark ? "#F8FAFC" : "#0F172A" },
                          ]}
                        >
                          {selectedNotif.meta.tenantName} (
                          {selectedNotif.meta.tenantPhone})
                        </Text>
                      </View>
                    )}

                    {selectedNotif.meta.visitDateTime && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Visit Schedule</Text>
                        <Text style={[styles.metaVal, { color: "#0284C7" }]}>
                          {selectedNotif.meta.visitDateTime}
                        </Text>
                      </View>
                    )}

                    {selectedNotif.meta.amount && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Credited Amount</Text>
                        <Text
                          style={[
                            styles.metaVal,
                            { color: "#059669", fontWeight: "800" },
                          ]}
                        >
                          ₹{selectedNotif.meta.amount.toLocaleString("en-IN")}
                        </Text>
                      </View>
                    )}

                    {selectedNotif.meta.utrNumber && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>UTR Reference</Text>
                        <Text
                          style={[
                            styles.metaVal,
                            { color: "#0D9488", fontWeight: "600" },
                          ]}
                        >
                          {selectedNotif.meta.utrNumber}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.modalActionRow}>
                  {selectedNotif.meta?.tenantPhone && (
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() =>
                        handleCallTenant(selectedNotif.meta?.tenantPhone)
                      }
                      style={[
                        styles.actionPrimaryBtn,
                        { backgroundColor: "#0D9488" },
                      ]}
                    >
                      <Ionicons name="call" size={17} color="#FFFFFF" />
                      <Text style={styles.actionPrimaryText}>Call Tenant</Text>
                    </TouchableOpacity>
                  )}

                  {selectedNotif.type === "COMMISSION" && (
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={handleOpenCommission}
                      style={[
                        styles.actionPrimaryBtn,
                        { backgroundColor: "#059669" },
                      ]}
                    >
                      <Ionicons name="wallet" size={17} color="#FFFFFF" />
                      <Text style={styles.actionPrimaryText}>
                        View Commission Ledger
                      </Text>
                    </TouchableOpacity>
                  )}

                  {selectedNotif.type === "PROPERTY" && (
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={handleOpenProperties}
                      style={[
                        styles.actionPrimaryBtn,
                        { backgroundColor: "#7C3AED" },
                      ]}
                    >
                      <MaterialIcons
                        name="apartment"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text style={styles.actionPrimaryText}>
                        Manage Properties
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

// Standalone Screen Export for direct route access
export default function BrokerNotificationScreen() {
  const router = useRouter();
  return (
    <BrokerNotificationModal
      visible={true}
      onClose={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.push("/BrokerPanel/(tabs)/Dashboard" as any);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.58)",
  },
  morphWindow: {
    position: "absolute",
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
  },
  launchIconOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  launchIconPill: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fullAppContent: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "700",
  },
  filterBar: {
    paddingBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12.5,
  },
  notifCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  notifIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notifBody: {
    flex: 1,
    paddingRight: 10,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  catBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  timestampText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  notifTitle: {
    fontSize: 14,
    marginBottom: 3,
  },
  notifMessage: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  metaAmountPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
    gap: 4,
  },
  metaAmountText: {
    color: "#059669",
    fontSize: 11.5,
    fontWeight: "700",
  },
  metaVisitPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 6,
    gap: 4,
  },
  metaVisitText: {
    color: "#0284C7",
    fontSize: 11.5,
    fontWeight: "700",
  },
  emptyCard: {
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12.5,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
    maxWidth: 240,
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  detailModalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "85%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalTime: {
    fontSize: 11.5,
    color: "#94A3B8",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalInfoCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalTitleText: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  modalMsgText: {
    fontSize: 13,
    lineHeight: 19,
  },
  modalDetailCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  modalMetaHeading: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4.5,
  },
  metaLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  metaVal: {
    fontSize: 12.5,
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "60%",
  },
  modalActionRow: {
    gap: 8,
    marginBottom: 10,
  },
  actionPrimaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  actionPrimaryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
