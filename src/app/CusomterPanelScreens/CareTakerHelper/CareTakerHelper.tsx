import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ServiceCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  bgColor: string;
  eta: string;
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "plumbing",
    title: "Plumbing & Water",
    subtitle: "Tap leak, RO, geyser, drainage",
    icon: "droplet",
    color: "#0284C7",
    bgColor: "#E0F2FE",
    eta: "20-30 mins",
  },
  {
    id: "electrical",
    title: "Electrical & AC",
    subtitle: "MCB trip, power socket, fan, AC cooling",
    icon: "zap",
    color: "#D97706",
    bgColor: "#FEF3C7",
    eta: "15-25 mins",
  },
  {
    id: "locksmith",
    title: "Key & Lockout",
    subtitle: "Door lock, key duplicate, digital lock",
    icon: "key",
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    eta: "10-15 mins (Priority)",
  },
  {
    id: "housekeeping",
    title: "Housekeeping",
    subtitle: "Room deep clean, waste removal, dustbin",
    icon: "wind",
    color: "#059669",
    bgColor: "#D1FAE5",
    eta: "Today, 4:00 PM",
  },
  {
    id: "wifi",
    title: "WiFi & Fiber Net",
    subtitle: "Router reboot, slow speed, fiber line",
    icon: "wifi",
    color: "#2563EB",
    bgColor: "#DBEAFE",
    eta: "Within 1 hour",
  },
  {
    id: "carpentry",
    title: "Carpentry & Bed",
    subtitle: "Wardrobe lock, chair, desk, window",
    icon: "tool",
    color: "#DC2626",
    bgColor: "#FEE2E2",
    eta: "Same day dispatch",
  },
];

interface Ticket {
  id: string;
  category: string;
  title: string;
  description: string;
  status: "in_progress" | "resolved" | "scheduled";
  time: string;
  caretakerName: string;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "DPX-TK-4402",
    category: "Electrical & AC",
    title: "Split AC Gas & Filter Service",
    description: "AC not cooling below 24°C in Room #204.",
    status: "in_progress",
    time: "Today, 11:30 AM",
    caretakerName: "Ramesh Yadav (Estate Tech)",
  },
  {
    id: "DPX-TK-3918",
    category: "Plumbing & Water",
    title: "RO Water Purifier Filter Cartridge",
    description: "Floor 2 RO membrane replaced with genuine Kent filter.",
    status: "resolved",
    time: "Yesterday, 3:45 PM",
    caretakerName: "Mohan Kumar (Plumber)",
  },
];

const CareTakerHelper = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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

  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCat, setSelectedCat] = useState<ServiceCategory | null>(
    SERVICE_CATEGORIES[0],
  );
  const [roomNumber, setRoomNumber] = useState("Room 204, Tower B");
  const [issueDesc, setIssueDesc] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCallCaretaker = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    Linking.openURL("tel:18001237829").catch(() => {
      Alert.alert(
        "Caretaker Desk Hotline",
        "Direct Line: 1800-123-7829\nWarden Mobile: +91 98712 34567\nAvailable 24 hours 7 days a week.",
      );
    });
  };

  const handleWhatsApp = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    const text = encodeURIComponent(
      "Hi DPX Caretaker Desk, I am residing at Room 204 and need assistance.",
    );
    Linking.openURL(`https://wa.me/919871234567?text=${text}`).catch(() => {
      Alert.alert(
        "WhatsApp Helpdesk",
        "Chat with Caretaker at +91 98712 34567",
      );
    });
  };

  const openNewTicketModal = (cat?: ServiceCategory) => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    if (cat) setSelectedCat(cat);
    setIssueDesc("");
    setModalVisible(true);
  };

  const submitTicket = () => {
    if (!issueDesc.trim()) {
      Alert.alert("Required", "Please describe the issue briefly.");
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    setIsSubmitting(true);
    setTimeout(() => {
      const newTicket: Ticket = {
        id: `DPX-TK-${Math.floor(1000 + Math.random() * 9000)}`,
        category: selectedCat ? selectedCat.title : "General Assistance",
        title: `${selectedCat ? selectedCat.title : "Service"} Request`,
        description: issueDesc.trim(),
        status: "in_progress",
        time: "Just now",
        caretakerName: "Ramesh Yadav (Estate Tech)",
      };
      setTickets([newTicket, ...tickets]);
      setIsSubmitting(false);
      setModalVisible(false);
      Alert.alert(
        "Ticket Raised! 🛠️",
        `Ticket #${newTicket.id} has been dispatched to your on-ground caretaker. Expected resolution in ${selectedCat?.eta || "30 mins"}.`,
      );
    }, 600);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : "#F8FAFC" },
      ]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Navigation Header */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
            paddingHorizontal: spacing.screenHorizontal,
            paddingVertical: spacing.sm + 2,
          },
        ]}
      >
        <View style={layout.horizontalViewBetween}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark
                  ? colors.surfaceHover
                  : colors.surfaceLight,
                borderColor: colors.border,
                borderRadius: radii.pill,
              },
            ]}
          >
            <Feather
              name="arrow-left"
              size={moderateScale(18)}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: moderateScale(16),
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              24/7 Caretaker Helpdesk
            </Text>
            <View style={[layout.horizontalView, { marginTop: 2 }]}>
              <View style={styles.liveDot} />
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "700",
                  color: "#059669",
                  marginLeft: 4,
                }}
              >
                On-Ground Caretaker Active
              </Text>
            </View>
          </View>

          {/* Quick Call Icon Pill */}
          <TouchableOpacity
            onPress={handleCallCaretaker}
            activeOpacity={0.8}
            style={[
              styles.callTopBtn,
              {
                backgroundColor: "#059669",
                borderRadius: radii.pill,
                paddingHorizontal: spacing.sm + 4,
                paddingVertical: spacing.xs + 2,
              },
            ]}
          >
            <Feather
              name="phone-call"
              size={moderateScale(13)}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: moderateScale(11.5),
                fontWeight: "700",
              }}
            >
              Call
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + moderateScale(40),
          gap: spacing.lg,
        }}
      >
        {/* Assigned Warden / Caretaker Hero Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xxl,
              padding: spacing.md + 2,
            },
            shadows.md,
          ]}
        >
          {/* Header Row with Property Tag */}
          <View
            style={[layout.horizontalViewBetween, { marginBottom: spacing.md }]}
          >
            <View style={layout.horizontalView}>
              <Ionicons
                name="business"
                size={moderateScale(15)}
                color={colors.primary}
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(11.5),
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                DPX RESIDENCY
              </Text>
            </View>
            <View
              style={[
                styles.societyBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "#DCFCE7",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(10.5),
                  fontWeight: "800",
                  color: "#15803D",
                }}
              >
                BLOCK B • SHIFT A
              </Text>
            </View>
          </View>

          {/* Caretaker Profile Strip */}
          <View style={layout.horizontalView}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
              }}
              style={[
                styles.caretakerAvatar,
                {
                  width: moderateScale(56),
                  height: moderateScale(56),
                  borderRadius: moderateScale(28),
                  borderColor: "#059669",
                },
              ]}
            />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <View style={layout.horizontalView}>
                <Text
                  style={{
                    fontSize: moderateScale(15),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  }}
                >
                  Ramesh Yadav
                </Text>
                <MaterialIcons
                  name="verified"
                  size={moderateScale(16)}
                  color="#0284C7"
                  style={{ marginLeft: 4 }}
                />
              </View>
              <Text
                style={{
                  fontSize: moderateScale(11.5),
                  color: colors.textSecondary,
                  marginTop: 1,
                }}
              >
                Senior Estate Warden & Facility Head
              </Text>
              <View style={[layout.horizontalView, { marginTop: 4, gap: 10 }]}>
                <View style={layout.horizontalView}>
                  <Ionicons
                    name="star"
                    size={moderateScale(13)}
                    color="#EAB308"
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      fontWeight: "700",
                      color: colors.textPrimary,
                      marginLeft: 3,
                    }}
                  >
                    4.9
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: colors.textMuted,
                  }}
                >
                  • 240+ Resolved Requests
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button Bar */}
          <View
            style={[
              layout.horizontalView,
              { marginTop: spacing.md, gap: spacing.sm },
            ]}
          >
            {/* Call Button */}
            <TouchableOpacity
              onPress={handleCallCaretaker}
              activeOpacity={0.8}
              style={[
                styles.actionPillBtn,
                {
                  backgroundColor: "#059669",
                  borderRadius: radii.xl,
                  flex: 1,
                },
              ]}
            >
              <Feather
                name="phone"
                size={moderateScale(15)}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(12.5),
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                Call Warden
              </Text>
            </TouchableOpacity>

            {/* WhatsApp Chat Button */}
            <TouchableOpacity
              onPress={handleWhatsApp}
              activeOpacity={0.8}
              style={[
                styles.actionPillBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(34, 197, 94, 0.15)"
                    : "#DCFCE7",
                  borderColor: isDark ? "#15803D" : "#86EFAC",
                  borderWidth: 1,
                  borderRadius: radii.xl,
                  flex: 1,
                },
              ]}
            >
              <Ionicons
                name="logo-whatsapp"
                size={moderateScale(16)}
                color="#16A34A"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(12.5),
                  fontWeight: "700",
                  color: "#16A34A",
                }}
              >
                WhatsApp Desk
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Issue Category Grid */}
        <View>
          <View
            style={[
              layout.horizontalViewBetween,
              { marginBottom: spacing.sm + 2 },
            ]}
          >
            <View>
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(15),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                Request Maintenance / Fix
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  marginTop: 1,
                }}
              >
                Tap any category for instant caretaker dispatch
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => openNewTicketModal()}
              activeOpacity={0.7}
              style={[
                styles.raiseCustomBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.sm + 4,
                  paddingVertical: spacing.xs,
                },
              ]}
            >
              <Feather
                name="plus"
                size={moderateScale(13)}
                color="#FFFFFF"
                style={{ marginRight: 2 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                Custom Ticket
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoryGrid}>
            {SERVICE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => openNewTicketModal(cat)}
                activeOpacity={0.82}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                  shadows.sm,
                ]}
              >
                <View
                  style={[
                    styles.catIconWrap,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : cat.bgColor,
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <Feather
                    name={cat.icon}
                    size={moderateScale(18)}
                    color={cat.color}
                  />
                </View>
                <Text
                  style={{
                    fontSize: moderateScale(13),
                    fontWeight: "800",
                    color: colors.textPrimary,
                    marginTop: spacing.sm,
                  }}
                  numberOfLines={1}
                >
                  {cat.title}
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(10),
                    color: colors.textSecondary,
                    marginTop: 2,
                    lineHeight: moderateScale(13),
                  }}
                  numberOfLines={2}
                >
                  {cat.subtitle}
                </Text>
                <View
                  style={[
                    styles.etaBadge,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceHover
                        : "rgba(0, 0, 0, 0.04)",
                      borderRadius: radii.pill,
                      marginTop: spacing.xs + 3,
                    },
                  ]}
                >
                  <Feather
                    name="clock"
                    size={moderateScale(9.5)}
                    color={colors.textSecondary}
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(9.5),
                      fontWeight: "700",
                      color: colors.textSecondary,
                    }}
                  >
                    {cat.eta}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live Service Tickets Tracker */}
        <View>
          <View
            style={[
              layout.horizontalViewBetween,
              { marginBottom: spacing.sm + 2 },
            ]}
          >
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(15),
                  fontWeight: "800",
                  color: colors.textPrimary,
                },
              ]}
            >
              My Activity & Service History
            </Text>
            <Text
              style={{
                fontSize: moderateScale(11),
                fontWeight: "700",
                color: colors.primary,
              }}
            >
              {tickets.length} Records
            </Text>
          </View>

          <View style={{ gap: spacing.sm }}>
            {tickets.map((t) => {
              const isInProgress = t.status === "in_progress";
              return (
                <View
                  key={t.id}
                  style={[
                    styles.ticketCard,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: isInProgress
                        ? isDark
                          ? "#1E3A8A"
                          : "#BFDBFE"
                        : colors.border,
                      borderRadius: radii.xl,
                      padding: spacing.md,
                      borderLeftWidth: 4,
                      borderLeftColor: isInProgress ? "#2563EB" : "#10B981",
                    },
                    shadows.sm,
                  ]}
                >
                  <View style={layout.horizontalViewBetween}>
                    <View style={layout.horizontalView}>
                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          fontWeight: "800",
                          color: colors.textMuted,
                          marginRight: 6,
                        }}
                      >
                        #{t.id}
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        • {t.category}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: isInProgress
                            ? isDark
                              ? "rgba(37, 99, 235, 0.2)"
                              : "#EFF6FF"
                            : isDark
                              ? "rgba(16, 185, 129, 0.2)"
                              : "#ECFDF5",
                          borderColor: isInProgress ? "#93C5FD" : "#86EFAC",
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(10),
                          fontWeight: "800",
                          color: isInProgress ? "#2563EB" : "#16A34A",
                        }}
                      >
                        {isInProgress ? "IN PROGRESS" : "RESOLVED"}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      fontSize: moderateScale(13.5),
                      fontWeight: "700",
                      color: colors.textPrimary,
                      marginTop: 6,
                    }}
                  >
                    {t.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(11.5),
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    {t.description}
                  </Text>

                  <View
                    style={[
                      layout.horizontalViewBetween,
                      {
                        marginTop: spacing.sm,
                        paddingTop: spacing.xs + 2,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={layout.horizontalView}>
                      <Feather
                        name="user"
                        size={moderateScale(12)}
                        color={colors.textMuted}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          fontSize: moderateScale(10.5),
                          color: colors.textSecondary,
                          fontWeight: "500",
                        }}
                      >
                        {t.caretakerName}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: moderateScale(10.5),
                        color: colors.textMuted,
                      }}
                    >
                      {t.time}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 24/7 Promise Banner */}
        <View
          style={[
            styles.promiseCard,
            {
              backgroundColor: isDark ? "rgba(30, 58, 138, 0.2)" : "#EFF6FF",
              borderColor: isDark ? "#1E40AF" : "#BFDBFE",
              borderRadius: radii.xxl,
              padding: spacing.md + 2,
            },
          ]}
        >
          <View style={layout.horizontalView}>
            <View
              style={[
                styles.shieldIconBox,
                { backgroundColor: "#2563EB", borderRadius: radii.lg },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={moderateScale(20)}
                color="#FFFFFF"
              />
            </View>
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text
                style={{
                  fontSize: moderateScale(13),
                  fontWeight: "800",
                  color: isDark ? "#93C5FD" : "#1E40AF",
                }}
              >
                DPX Zero-Downtime Guarantee
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  marginTop: 2,
                  lineHeight: moderateScale(15),
                }}
              >
                All water, electricity, and lock emergencies are attended to
                within 30 minutes by certified property technicians.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal: Raise New Service Ticket */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.cardBackground,
                borderTopColor: colors.border,
                borderTopLeftRadius: radii.xxl + 8,
                borderTopRightRadius: radii.xxl + 8,
                paddingHorizontal: spacing.screenHorizontal,
                paddingTop: spacing.md,
                paddingBottom: insets.bottom + spacing.md,
              },
              shadows.floating,
            ]}
          >
            {/* Modal Drag Handle */}
            <View
              style={[
                styles.modalHandle,
                { backgroundColor: colors.borderLight },
              ]}
            />

            {/* Modal Header */}
            <View
              style={[
                layout.horizontalViewBetween,
                { marginVertical: spacing.sm },
              ]}
            >
              <View>
                <Text
                  style={{
                    fontSize: moderateScale(16),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  }}
                >
                  Raise Maintenance Request
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: colors.textSecondary,
                  }}
                >
                  Direct dispatch to on-duty warden
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.closeModalBtn,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Feather
                  name="x"
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Category Selector Horizontal Strip */}
            <Text
              style={{
                fontSize: moderateScale(11),
                fontWeight: "700",
                color: colors.textSecondary,
                marginTop: spacing.sm,
                marginBottom: 6,
              }}
            >
              SELECT CATEGORY
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.xs + 2, paddingBottom: 4 }}
            >
              {SERVICE_CATEGORIES.map((cat) => {
                const isSelected = selectedCat?.id === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCat(cat)}
                    activeOpacity={0.8}
                    style={[
                      styles.modalCatChip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                            ? colors.surfaceHover
                            : colors.surfaceLight,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Feather
                      name={cat.icon}
                      size={moderateScale(13)}
                      color={isSelected ? "#FFFFFF" : colors.textPrimary}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(11.5),
                        fontWeight: isSelected ? "700" : "600",
                        color: isSelected ? "#FFFFFF" : colors.textPrimary,
                      }}
                    >
                      {cat.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Room Location */}
            <View style={{ marginTop: spacing.md }}>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "700",
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                UNIT / ROOM LOCATION
              </Text>
              <View
                style={[
                  styles.modalInputBox,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                ]}
              >
                <Feather
                  name="map-pin"
                  size={moderateScale(15)}
                  color={colors.textSecondary}
                  style={{ marginRight: spacing.sm }}
                />
                <TextInput
                  value={roomNumber}
                  onChangeText={setRoomNumber}
                  placeholder="e.g. Room 204, Tower B"
                  placeholderTextColor={colors.textMuted}
                  style={{
                    flex: 1,
                    color: colors.textPrimary,
                    fontSize: moderateScale(13),
                    fontWeight: "600",
                  }}
                />
              </View>
            </View>

            {/* Issue Description */}
            <View style={{ marginTop: spacing.md }}>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "700",
                  color: colors.textSecondary,
                  marginBottom: 4,
                }}
              >
                ISSUE DESCRIPTION *
              </Text>
              <TextInput
                value={issueDesc}
                onChangeText={setIssueDesc}
                placeholder="Describe what's broken or needs maintenance..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                style={[
                  styles.modalTextArea,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                    color: colors.textPrimary,
                    fontSize: moderateScale(13),
                  },
                ]}
              />
            </View>

            {/* Urgency Toggle */}
            <View
              style={[layout.horizontalViewBetween, { marginTop: spacing.md }]}
            >
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "700",
                  color: colors.textSecondary,
                }}
              >
                PRIORITY LEVEL
              </Text>
              <View style={[layout.horizontalView, { gap: spacing.xs }]}>
                <TouchableOpacity
                  onPress={() => setUrgency("normal")}
                  style={[
                    styles.urgencyPill,
                    {
                      backgroundColor:
                        urgency === "normal"
                          ? colors.primary
                          : isDark
                            ? colors.surfaceHover
                            : colors.surfaceLight,
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      fontWeight: "700",
                      color:
                        urgency === "normal" ? "#FFFFFF" : colors.textPrimary,
                    }}
                  >
                    Standard (Same day)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setUrgency("urgent")}
                  style={[
                    styles.urgencyPill,
                    {
                      backgroundColor:
                        urgency === "urgent"
                          ? "#DC2626"
                          : isDark
                            ? colors.surfaceHover
                            : colors.surfaceLight,
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      fontWeight: "700",
                      color:
                        urgency === "urgent" ? "#FFFFFF" : colors.textPrimary,
                    }}
                  >
                    Urgent (15-30 mins)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={submitTicket}
              activeOpacity={0.88}
              disabled={isSubmitting}
              style={[
                styles.modalSubmitBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radii.xl,
                  marginTop: spacing.lg,
                },
                shadows.md,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={layout.horizontalView}>
                  <Feather
                    name="send"
                    size={moderateScale(15)}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: moderateScale(13.5),
                      fontWeight: "800",
                    }}
                  >
                    Dispatch Service Ticket
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default CareTakerHelper;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  callTopBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#059669",
  },
  heroCard: {
    borderWidth: 1,
  },
  societyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  caretakerAvatar: {
    borderWidth: 2,
  },
  actionPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  raiseCustomBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderWidth: 1,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  etaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  ticketCard: {
    borderWidth: 1,
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderWidth: 1,
  },
  promiseCard: {
    borderWidth: 1,
  },
  shieldIconBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopWidth: 1,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCatChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  modalInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  modalTextArea: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 78,
    textAlignVertical: "top",
  },
  urgencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalSubmitBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
});
