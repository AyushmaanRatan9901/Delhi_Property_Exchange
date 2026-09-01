import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";

export interface BookingRequestItem {
  id: string;
  propertyTitle: string;
  propertyType: "Room" | "PG";
  location: string;
  price: number;
  imageUrl: string;
  requestType: "visit" | "move_in" | "inquiry";
  status:
    | "scheduled"
    | "caretaker_assigned"
    | "kyc_pending"
    | "completed"
    | "cancelled";
  visitDate: string;
  visitTime: string;
  caretakerName: string;
  caretakerPhone: string;
  caretakerAvatar: string;
  stepsCompleted: number; // 1 to 4
  gateNumber?: string;
  tokenPaid?: number;
}

const INITIAL_REQUESTS: BookingRequestItem[] = [
  {
    id: "req-1",
    propertyTitle: "Executive Single Room with Balcony",
    propertyType: "Room",
    location: "Dwarka, Sector 6, Pocket 2",
    price: 9000,
    imageUrl:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
    requestType: "visit",
    status: "scheduled",
    visitDate: "Tomorrow (Tue, 1 Sep)",
    visitTime: "4:00 PM - 4:30 PM",
    caretakerName: "Ramesh Kumar",
    caretakerPhone: "+91 98112 34567",
    caretakerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    stepsCompleted: 3,
    gateNumber: "Gate 4, Green View Apartments",
  },
  {
    id: "req-2",
    propertyTitle: "Safe & Secure Girls Co-living PG",
    propertyType: "PG",
    location: "Dwarka, Sector 10",
    price: 8500,
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
    requestType: "move_in",
    status: "kyc_pending",
    visitDate: "Move-in: 5 Sep 2026",
    visitTime: "Token Paid: ₹1,000",
    caretakerName: "Priya Sharma (Warden)",
    caretakerPhone: "+91 98765 11223",
    caretakerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    stepsCompleted: 2,
    tokenPaid: 1000,
  },
  {
    id: "req-3",
    propertyTitle: "Luxury Independent Room & AC",
    propertyType: "Room",
    location: "Dwarka, Sector 9",
    price: 11000,
    imageUrl:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
    requestType: "visit",
    status: "caretaker_assigned",
    visitDate: "This Sunday (6 Sep)",
    visitTime: "11:00 AM - 11:30 AM",
    caretakerName: "Suresh Verma",
    caretakerPhone: "+91 99887 76655",
    caretakerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    stepsCompleted: 2,
    gateNumber: "House #42, Main Road",
  },
  {
    id: "req-4",
    propertyTitle: "Premium Boys PG with Gym & Food",
    propertyType: "PG",
    location: "Dwarka, Sector 12",
    price: 7500,
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
    requestType: "visit",
    status: "completed",
    visitDate: "Visited on 28 Aug",
    visitTime: "Completed",
    caretakerName: "Amit Singh",
    caretakerPhone: "+91 97112 23344",
    caretakerAvatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    stepsCompleted: 4,
  },
];

export default function RequestsScreen() {
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

  // State Management
  const [requests, setRequests] =
    useState<BookingRequestItem[]>(INITIAL_REQUESTS);
  const [activeTab, setActiveTab] = useState<
    "All" | "upcoming" | "move_in" | "completed"
  >("All");
  const [selectedRequestForReschedule, setSelectedRequestForReschedule] =
    useState<BookingRequestItem | null>(null);
  const [selectedCaretaker, setSelectedCaretaker] =
    useState<BookingRequestItem | null>(null);

  // Filtered list
  const filteredRequests = useMemo(() => {
    if (activeTab === "All") return requests;
    if (activeTab === "upcoming")
      return requests.filter(
        (r) => r.status === "scheduled" || r.status === "caretaker_assigned",
      );
    if (activeTab === "move_in")
      return requests.filter((r) => r.requestType === "move_in");
    if (activeTab === "completed")
      return requests.filter((r) => r.status === "completed");
    return requests;
  }, [requests, activeTab]);

  // Handlers
  const handleCallCaretaker = (phone: string, name: string) => {
    Alert.alert("Calling Caretaker", `Connecting to ${name} at ${phone}...`);
  };

  const handleWhatsAppCaretaker = (name: string) => {
    Alert.alert("WhatsApp Chat", `Opening WhatsApp chat with ${name}...`);
  };

  const handleOpenDirections = (location: string) => {
    Alert.alert(
      "Directions",
      `Opening navigation route to ${location} in Google Maps.`,
    );
  };

  const handleCancelVisit = (id: string, title: string) => {
    Alert.alert(
      "Cancel Visit",
      `Are you sure you want to cancel your scheduled visit for "${title}"?`,
      [
        { text: "Keep Visit", style: "cancel" },
        {
          text: "Cancel Visit",
          style: "destructive",
          onPress: () => {
            setRequests((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, status: "cancelled" } : item,
              ),
            );
            Alert.alert(
              "Visit Cancelled",
              "Your visit has been cancelled. Caretaker notified.",
            );
          },
        },
      ],
    );
  };

  const handleConfirmReschedule = (newTime: string) => {
    if (!selectedRequestForReschedule) return;
    setRequests((prev) =>
      prev.map((item) =>
        item.id === selectedRequestForReschedule.id
          ? {
              ...item,
              visitDate: "Rescheduled",
              visitTime: newTime,
              status: "scheduled",
            }
          : item,
      ),
    );
    Alert.alert(
      "Visit Rescheduled! 🎉",
      `Your visit has been rescheduled to ${newTime}. Caretaker updated.`,
    );
    setSelectedRequestForReschedule(null);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.xs,
            paddingBottom: spacing.sm,
          },
        ]}
      >
        <View style={layout.horizontalViewBetween}>
          <View>
            <View style={layout.horizontalView}>
              <Text
                style={[
                  typography.sectionTitle,
                  { fontSize: moderateScale(20), color: colors.textPrimary },
                ]}
              >
                My Requests & Visits
              </Text>
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: colors.primaryLight,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.xs + 3,
                    paddingVertical: 2,
                    marginLeft: spacing.xs,
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
                  {requests.filter((r) => r.status !== "cancelled").length}
                </Text>
              </View>
            </View>
            <Text
              style={[
                typography.categorySubtitle,
                {
                  fontSize: moderateScale(12),
                  color: colors.textSecondary,
                  marginTop: 2,
                },
              ]}
            >
              Track scheduled visits, caretakers & move-in lease
            </Text>
          </View>

          {/* Call Helpdesk Action */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "24/7 Housing Support",
                "Calling 1800-123-STAY for visit assistance...",
              )
            }
            activeOpacity={0.8}
            style={[
              styles.helpdeskBtn,
              {
                backgroundColor: isDark
                  ? colors.surfaceHover
                  : colors.surfaceLight,
                borderColor: colors.border,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs + 2,
              },
            ]}
          >
            <Feather
              name="headphones"
              size={moderateScale(14)}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: moderateScale(11.5),
                fontWeight: "700",
                color: colors.primary,
              }}
            >
              Helpdesk
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs + 2, marginTop: spacing.md }}
        >
          {[
            { id: "All", label: "All Requests", count: requests.length },
            {
              id: "upcoming",
              label: "Upcoming Visits",
              count: requests.filter(
                (r) =>
                  r.status === "scheduled" || r.status === "caretaker_assigned",
              ).length,
            },
            {
              id: "move_in",
              label: "Move-in & KYC",
              count: requests.filter((r) => r.requestType === "move_in").length,
            },
            {
              id: "completed",
              label: "Past & Completed",
              count: requests.filter((r) => r.status === "completed").length,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                activeOpacity={0.8}
                style={[
                  styles.tabPill,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : isDark
                        ? colors.surfaceHover
                        : colors.surfaceLight,
                    borderColor: isActive ? colors.primary : colors.border,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs + 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11.5),
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? colors.white : colors.textPrimary,
                  }}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          {
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.md,
            paddingBottom: moderateScale(100),
            gap: spacing.md,
          },
        ]}
        renderItem={({ item }) => {
          const isVisit = item.requestType === "visit";
          const isMoveIn = item.requestType === "move_in";
          const isCompleted = item.status === "completed";
          const isCancelled = item.status === "cancelled";

          return (
            <View
              style={[
                styles.requestCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: isCancelled ? colors.borderLight : colors.border,
                  borderRadius: radii.xxl,
                  opacity: isCancelled ? 0.6 : 1,
                },
                shadows.card,
              ]}
            >
              {/* Card Header Tag Row */}
              <View
                style={[
                  layout.horizontalViewBetween,
                  styles.cardHeader,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderTopLeftRadius: radii.xxl,
                    borderTopRightRadius: radii.xxl,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs + 2,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                  },
                ]}
              >
                <View style={layout.horizontalView}>
                  <MaterialCommunityIcons
                    name={isMoveIn ? "home-lock" : "calendar-check"}
                    size={moderateScale(16)}
                    color={isMoveIn ? colors.secondary : colors.primary}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(11.5),
                      fontWeight: "700",
                      color: isMoveIn ? colors.secondary : colors.primary,
                      textTransform: "uppercase",
                    }}
                  >
                    {isMoveIn ? "Move-in Application" : "Guided Property Visit"}
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "scheduled"
                          ? "#ECFDF5"
                          : item.status === "kyc_pending"
                            ? "#FEF3C7"
                            : item.status === "completed"
                              ? "#EFF6FF"
                              : "#FEE2E2",
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.xs + 3,
                      paddingVertical: 2,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(10.5),
                      fontWeight: "800",
                      color:
                        item.status === "scheduled"
                          ? "#059669"
                          : item.status === "kyc_pending"
                            ? "#D97706"
                            : item.status === "completed"
                              ? "#2563EB"
                              : "#DC2626",
                    }}
                  >
                    {item.status === "scheduled"
                      ? "✓ Confirmed"
                      : item.status === "kyc_pending"
                        ? "⏳ KYC Pending"
                        : item.status === "completed"
                          ? "🏆 Completed"
                          : "✖ Cancelled"}
                  </Text>
                </View>
              </View>

              {/* Property Details Row */}
              <View
                style={[
                  layout.horizontalView,
                  { padding: spacing.md, alignItems: "flex-start" },
                ]}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[
                    styles.thumb,
                    {
                      width: moderateScale(70),
                      height: moderateScale(70),
                      borderRadius: radii.lg,
                    },
                  ]}
                />

                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(14),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {item.propertyTitle}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.cardLocation,
                      {
                        fontSize: moderateScale(11.5),
                        color: colors.textSecondary,
                        marginTop: 2,
                      },
                    ]}
                  >
                    📍 {item.location}
                  </Text>
                  <Text
                    style={[
                      typography.cardPrice,
                      {
                        fontSize: moderateScale(13.5),
                        color: colors.priceGreen,
                        marginTop: 2,
                      },
                    ]}
                  >
                    ₹{new Intl.NumberFormat("en-IN").format(item.price)}
                    <Text style={{ fontSize: moderateScale(10.5) }}>
                      /month
                    </Text>
                  </Text>
                </View>
              </View>

              {/* Progress Timeline Stepper */}
              {!isCancelled && (
                <View
                  style={[
                    styles.timelineBox,
                    {
                      marginHorizontal: spacing.md,
                      backgroundColor: isDark ? colors.surfaceHover : "#F8FAFC",
                      borderRadius: radii.xl,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <View
                    style={[layout.horizontalViewBetween, { marginBottom: 6 }]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(11),
                        color: colors.textSecondary,
                        fontWeight: "600",
                      }}
                    >
                      Request Status
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(11),
                        color: colors.primary,
                        fontWeight: "700",
                      }}
                    >
                      Step {item.stepsCompleted} of 4
                    </Text>
                  </View>

                  {/* 4 Step Progress Bar */}
                  <View style={[layout.horizontalView, styles.progressBar]}>
                    {[1, 2, 3, 4].map((step) => {
                      const isDone = item.stepsCompleted >= step;
                      return (
                        <View
                          key={step}
                          style={[
                            styles.progressSegment,
                            {
                              backgroundColor: isDone
                                ? colors.primary
                                : isDark
                                  ? "#334155"
                                  : "#E2E8F0",
                              borderRadius: radii.pill,
                              height: 4,
                              flex: 1,
                              marginRight: step === 4 ? 0 : 4,
                            },
                          ]}
                        />
                      );
                    })}
                  </View>

                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      color: colors.textPrimary,
                      fontWeight: "600",
                      marginTop: spacing.xs,
                    }}
                  >
                    {item.stepsCompleted === 1
                      ? "1. Request Received by Property Team"
                      : item.stepsCompleted === 2
                        ? "2. Caretaker Assigned & Phone Verified"
                        : item.stepsCompleted === 3
                          ? "3. Visit Date & Pass Active"
                          : "4. Move-in Token & Key Handover"}
                  </Text>
                </View>
              )}

              {/* Timing & Caretaker Strip */}
              {!isCancelled && (
                <View
                  style={[
                    styles.caretakerStrip,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                      marginHorizontal: spacing.md,
                      marginTop: spacing.sm,
                      borderRadius: radii.xl,
                      padding: spacing.md,
                    },
                  ]}
                >
                  {/* Date & Time */}
                  <View
                    style={[
                      layout.horizontalViewBetween,
                      { marginBottom: spacing.xs },
                    ]}
                  >
                    <View style={layout.horizontalView}>
                      <Ionicons
                        name="time-outline"
                        size={moderateScale(15)}
                        color={colors.primary}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          fontSize: moderateScale(12),
                          fontWeight: "700",
                          color: colors.textPrimary,
                        }}
                      >
                        {item.visitDate}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: moderateScale(11.5),
                        color: colors.textSecondary,
                        fontWeight: "600",
                      }}
                    >
                      {item.visitTime}
                    </Text>
                  </View>

                  {/* Gate / Landmark */}
                  {item.gateNumber && (
                    <Text
                      style={{
                        fontSize: moderateScale(11),
                        color: colors.textSecondary,
                        marginBottom: spacing.xs,
                      }}
                    >
                      🚪 Meeting Point: {item.gateNumber}
                    </Text>
                  )}

                  {/* Caretaker Info & Quick Call */}
                  <View
                    style={[
                      layout.horizontalViewBetween,
                      {
                        marginTop: spacing.xs,
                        paddingTop: spacing.xs,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderLight,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => setSelectedCaretaker(item)}
                      style={layout.horizontalView}
                    >
                      <Image
                        source={{ uri: item.caretakerAvatar }}
                        style={[
                          styles.avatar,
                          {
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            marginRight: 6,
                          },
                        ]}
                      />
                      <View>
                        <Text
                          style={{
                            fontSize: moderateScale(12),
                            fontWeight: "700",
                            color: colors.textPrimary,
                          }}
                        >
                          {item.caretakerName}
                        </Text>
                        <Text
                          style={{
                            fontSize: moderateScale(10),
                            color: colors.textMuted,
                          }}
                        >
                          Property Guide
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Caretaker Phone & Chat Actions */}
                    <View style={[layout.horizontalView, { gap: 6 }]}>
                      <TouchableOpacity
                        onPress={() =>
                          handleCallCaretaker(
                            item.caretakerPhone,
                            item.caretakerName,
                          )
                        }
                        activeOpacity={0.8}
                        style={[
                          styles.actionIconBtn,
                          {
                            backgroundColor: "#ECFDF5",
                            borderColor: "#A7F3D0",
                            borderRadius: radii.round,
                            width: 32,
                            height: 32,
                          },
                        ]}
                      >
                        <Feather
                          name="phone"
                          size={moderateScale(14)}
                          color="#059669"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          handleWhatsAppCaretaker(item.caretakerName)
                        }
                        activeOpacity={0.8}
                        style={[
                          styles.actionIconBtn,
                          {
                            backgroundColor: "#EFF6FF",
                            borderColor: "#BFDBFE",
                            borderRadius: radii.round,
                            width: 32,
                            height: 32,
                          },
                        ]}
                      >
                        <Ionicons
                          name="logo-whatsapp"
                          size={moderateScale(16)}
                          color="#2563EB"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleOpenDirections(item.location)}
                        activeOpacity={0.8}
                        style={[
                          styles.actionIconBtn,
                          {
                            backgroundColor: "#F5F3FF",
                            borderColor: "#DDD6FE",
                            borderRadius: radii.round,
                            width: 32,
                            height: 32,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="navigation-variant-outline"
                          size={moderateScale(16)}
                          color="#7C3AED"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* Bottom Card Action Buttons */}
              <View
                style={[
                  layout.horizontalViewBetween,
                  {
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    gap: spacing.sm,
                  },
                ]}
              >
                {!isCompleted && !isCancelled && (
                  <TouchableOpacity
                    onPress={() =>
                      handleCancelVisit(item.id, item.propertyTitle)
                    }
                    activeOpacity={0.8}
                    style={[
                      styles.secondaryActionBtn,
                      {
                        backgroundColor: isDark
                          ? colors.surfaceHover
                          : colors.surfaceLight,
                        borderColor: colors.border,
                        borderRadius: radii.pill,
                        paddingVertical: spacing.xs + 2,
                        flex: 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: moderateScale(11.5),
                        color: colors.favoriteRed,
                        fontWeight: "600",
                      }}
                    >
                      Cancel Visit
                    </Text>
                  </TouchableOpacity>
                )}

                {!isCompleted && !isCancelled && (
                  <TouchableOpacity
                    onPress={() => setSelectedRequestForReschedule(item)}
                    activeOpacity={0.85}
                    style={[
                      styles.primaryActionBtn,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: radii.pill,
                        paddingVertical: spacing.xs + 2,
                        flex: 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: moderateScale(11.5),
                        color: colors.white,
                        fontWeight: "700",
                      }}
                    >
                      Reschedule 🗓️
                    </Text>
                  </TouchableOpacity>
                )}

                {isCompleted && (
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Rate Stay",
                        `Thank you for visiting ${item.propertyTitle}! Please rate the property.`,
                      )
                    }
                    activeOpacity={0.85}
                    style={[
                      styles.primaryActionBtn,
                      {
                        backgroundColor: colors.priceGreen,
                        borderRadius: radii.pill,
                        paddingVertical: spacing.xs + 2,
                        flex: 1,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: moderateScale(11.5),
                        color: colors.white,
                        fontWeight: "700",
                      }}
                    >
                      ⭐ Leave Review & Rent Now
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View
            style={[
              layout.center,
              { marginTop: spacing.xxxl, paddingHorizontal: spacing.xl },
            ]}
          >
            <View
              style={[
                styles.emptyIconBox,
                {
                  width: moderateScale(76),
                  height: moderateScale(76),
                  borderRadius: moderateScale(38),
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={moderateScale(40)}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(18),
                  color: colors.textPrimary,
                  marginTop: spacing.md,
                  textAlign: "center",
                },
              ]}
            >
              No Requests in {activeTab === "All" ? "Queue" : activeTab}
            </Text>
            <Text
              style={[
                typography.categorySubtitle,
                {
                  fontSize: moderateScale(12),
                  color: colors.textSecondary,
                  marginTop: 4,
                  textAlign: "center",
                },
              ]}
            >
              When you schedule a free room visit or apply for a move-in, you
              can track caretaker contact and gate pass details here.
            </Text>
          </View>
        }
      />

      {/* Reschedule Visit Modal */}
      {selectedRequestForReschedule && (
        <Modal
          visible={Boolean(selectedRequestForReschedule)}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedRequestForReschedule(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.cardBackground,
                  borderTopLeftRadius: radii.xxl,
                  borderTopRightRadius: radii.xxl,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  layout.horizontalViewBetween,
                  {
                    padding: spacing.lg,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.sectionTitle,
                    { fontSize: moderateScale(18), color: colors.textPrimary },
                  ]}
                >
                  Reschedule Visit 🗓️
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedRequestForReschedule(null)}
                >
                  <Ionicons
                    name="close"
                    size={moderateScale(24)}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <View
                style={{ padding: spacing.lg, paddingBottom: spacing.xxxl }}
              >
                <Text
                  style={[
                    typography.cardTitle,
                    { fontSize: moderateScale(14), color: colors.textPrimary },
                  ]}
                >
                  {selectedRequestForReschedule.propertyTitle}
                </Text>
                <Text
                  style={[
                    typography.cardLocation,
                    {
                      fontSize: moderateScale(12),
                      color: colors.textSecondary,
                      marginTop: 2,
                    },
                  ]}
                >
                  📍 {selectedRequestForReschedule.location}
                </Text>

                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor: colors.borderLight,
                      marginVertical: spacing.md,
                    },
                  ]}
                />

                <Text
                  style={[
                    typography.cardTitle,
                    {
                      fontSize: moderateScale(13),
                      color: colors.textPrimary,
                      marginBottom: spacing.sm,
                    },
                  ]}
                >
                  Choose New Time Slot:
                </Text>

                <View style={{ gap: spacing.sm }}>
                  {[
                    "Today (Evening, 6:00 PM)",
                    "Tomorrow (Morning, 11:30 AM)",
                    "Tomorrow (Evening, 4:00 PM)",
                    "This Saturday (11:00 AM)",
                    "This Sunday (3:30 PM)",
                  ].map((slot) => (
                    <TouchableOpacity
                      key={slot}
                      activeOpacity={0.8}
                      onPress={() => handleConfirmReschedule(slot)}
                      style={[
                        layout.horizontalViewBetween,
                        styles.slotPill,
                        {
                          backgroundColor: isDark
                            ? colors.surfaceHover
                            : colors.surfaceLight,
                          borderColor: colors.border,
                          borderRadius: radii.xl,
                          padding: spacing.md,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(13),
                          fontWeight: "600",
                          color: colors.textPrimary,
                        }}
                      >
                        {slot}
                      </Text>
                      <Feather
                        name="chevron-right"
                        size={moderateScale(16)}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Caretaker Details Modal */}
      {selectedCaretaker && (
        <Modal
          visible={Boolean(selectedCaretaker)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedCaretaker(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedCaretaker(null)}
            style={styles.modalOverlay}
          >
            <View
              style={[
                styles.caretakerModalBox,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.xxl,
                  padding: spacing.lg,
                  borderColor: colors.border,
                },
                shadows.floating,
              ]}
            >
              <View
                style={[layout.horizontalView, { marginBottom: spacing.md }]}
              >
                <Image
                  source={{ uri: selectedCaretaker.caretakerAvatar }}
                  style={[
                    styles.avatarLarge,
                    {
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      marginRight: spacing.md,
                    },
                  ]}
                />
                <View>
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(16),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {selectedCaretaker.caretakerName}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      color: colors.verifiedGreen,
                      fontWeight: "700",
                    }}
                  >
                    ✓ Verified On-Site Caretaker
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      color: colors.textSecondary,
                    }}
                  >
                    {selectedCaretaker.caretakerPhone}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  layout.horizontalView,
                  { gap: spacing.sm, marginTop: spacing.xs },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    handleCallCaretaker(
                      selectedCaretaker.caretakerPhone,
                      selectedCaretaker.caretakerName,
                    );
                    setSelectedCaretaker(null);
                  }}
                  style={[
                    styles.modalActionBtn,
                    {
                      backgroundColor: "#10B981",
                      borderRadius: radii.pill,
                      paddingVertical: spacing.sm,
                      flex: 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.white,
                      fontWeight: "700",
                      textAlign: "center",
                      fontSize: moderateScale(12.5),
                    }}
                  >
                    📞 Call Now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    handleWhatsAppCaretaker(selectedCaretaker.caretakerName);
                    setSelectedCaretaker(null);
                  }}
                  style={[
                    styles.modalActionBtn,
                    {
                      backgroundColor: "#2563EB",
                      borderRadius: radii.pill,
                      paddingVertical: spacing.sm,
                      flex: 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.white,
                      fontWeight: "700",
                      textAlign: "center",
                      fontSize: moderateScale(12.5),
                    }}
                  >
                    💬 WhatsApp
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  countBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  helpdeskBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  tabPill: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {},
  requestCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  cardHeader: {},
  statusBadge: {},
  thumb: {
    backgroundColor: "#334155",
  },
  timelineBox: {},
  progressBar: {
    marginVertical: 4,
  },
  progressSegment: {},
  caretakerStrip: {},
  avatar: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  actionIconBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  secondaryActionBtn: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 15, 25, 0.68)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "85%",
    borderTopWidth: 1,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  slotPill: {
    borderWidth: 1,
  },
  caretakerModalBox: {
    marginHorizontal: 24,
    marginBottom: "auto",
    marginTop: "auto",
    borderWidth: 1,
  },
  avatarLarge: {
    borderWidth: 2,
    borderColor: "#10B981",
  },
  modalActionBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
