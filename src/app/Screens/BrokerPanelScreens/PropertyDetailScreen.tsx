import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";
import {
  BROKER_PROPERTIES_DATA,
  BrokerManagedProperty,
} from "../../BrokerPanel/(tabs)/property";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mock Gallery Images generator
const getPropertyGallery = (mainImage: string) => [
  mainImage,
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
];

export interface PropertyCommissionRecord {
  id: string;
  tenantName: string;
  tenantPhone: string;
  unitBooked: string;
  monthlyRent: number;
  commissionRate: string;
  commissionAmount: number;
  payoutStatus: "Settled" | "Processing";
  dealDate: string;
  payoutDate: string;
  transactionRef: string;
  paymentMethod: string;
  tdsRate: string;
  tdsAmount: number;
  netPayout: number;
}

const getPropertyCommissionRecords = (
  property: BrokerManagedProperty
): PropertyCommissionRecord[] => {
  const count = property.totalDealsClosed || 4;
  const baseRent = property.monthlyRent;
  const comm = property.expectedCommission;

  const mockTenantList = [
    { name: "Aman Verma", unit: "Room 102 - Single Bed", date: "02 Sep 2026", status: "Processing" as const },
    { name: "Priya Sundaram", unit: "Room 204 - Bed B", date: "24 Aug 2026", status: "Settled" as const },
    { name: "Deepak Choudhary", unit: "Room 105 - Private", date: "12 Aug 2026", status: "Settled" as const },
    { name: "Kavita Singhal", unit: "Room 301 - Deluxe", date: "28 Jul 2026", status: "Settled" as const },
    { name: "Rahul Deshmukh", unit: "Room 202 - Bed A", date: "15 Jul 2026", status: "Settled" as const },
    { name: "Siddharth Goel", unit: "Room 108 - Studio", date: "01 Jul 2026", status: "Settled" as const },
    { name: "Ananya Iyer", unit: "Room 304 - Bed B", date: "18 Jun 2026", status: "Settled" as const },
    { name: "Vikas Aggarwal", unit: "Room 206 - Single", date: "05 Jun 2026", status: "Settled" as const },
  ];

  return mockTenantList.slice(0, Math.max(count, 3)).map((item, idx) => {
    const isProcessing = item.status === "Processing";
    const tds = Math.round(comm * 0.05); // 5% TDS under Sec 194H
    const net = comm - tds;

    return {
      id: `comm-${property.id}-${idx + 1}`,
      tenantName: item.name,
      tenantPhone: `+91 98110 ${12340 + idx * 87}`,
      unitBooked: item.unit,
      monthlyRent: baseRent,
      commissionRate: "50% 1st Month Rent",
      commissionAmount: comm,
      payoutStatus: isProcessing ? "Processing" : "Settled",
      dealDate: item.date,
      payoutDate: isProcessing ? "Est. 09 Sep 2026" : item.date,
      transactionRef: isProcessing
        ? "HOLD-ESCROW-291"
        : `TXN-DPX-${984210 + idx * 137}`,
      paymentMethod: isProcessing ? "Escrow (Move-in Clearance)" : "Direct Bank (IMPS)",
      tdsRate: "5% (Sec 194H)",
      tdsAmount: tds,
      netPayout: net,
    };
  });
};

const MOCK_LEADS_FOR_PROPERTY = [
  {
    id: "lead-01",
    clientName: "Aarav Sharma",
    type: "Student • IP University",
    inquiry: "Requested In-Person Visit",
    time: "15 mins ago",
    phone: "+91 98765 43210",
  },
  {
    id: "lead-02",
    clientName: "Pooja Malhotra",
    type: "Working Pro • Cyber City",
    inquiry: "Deposit Token Paid (Move-in 10th Sep)",
    time: "1 hour ago",
    phone: "+91 98123 45678",
  },
  {
    id: "lead-03",
    clientName: "Rohan Verma",
    type: "Working Pro • Tech Mahindra",
    inquiry: "Rent & Food Inquiry",
    time: "3 hours ago",
    phone: "+91 97654 32109",
  },
];

export default function BrokerPropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } =
    useResponsiveTheme();

  // Find Property Data
  const propertyId = params.id || "prop-01";
  const property: BrokerManagedProperty =
    BROKER_PROPERTIES_DATA.find((p: BrokerManagedProperty) => p.id === propertyId) ||
    BROKER_PROPERTIES_DATA[0];

  const galleryImages = getPropertyGallery(property.imageUrl);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Commission History records & filter state
  const commissionRecords = useMemo(
    () => getPropertyCommissionRecords(property),
    [property]
  );
  const [selectedCommFilter, setSelectedCommFilter] = useState("All");
  const [selectedReceiptRecord, setSelectedReceiptRecord] =
    useState<PropertyCommissionRecord | null>(null);

  const filteredCommissions = useMemo(() => {
    if (selectedCommFilter === "Settled") {
      return commissionRecords.filter((r) => r.payoutStatus === "Settled");
    }
    if (selectedCommFilter === "Processing") {
      return commissionRecords.filter((r) => r.payoutStatus === "Processing");
    }
    return commissionRecords;
  }, [commissionRecords, selectedCommFilter]);

  const settledTotal = useMemo(() => {
    return commissionRecords
      .filter((r) => r.payoutStatus === "Settled")
      .reduce((acc, curr) => acc + curr.netPayout, 0);
  }, [commissionRecords]);

  const settledCount = commissionRecords.filter(
    (r) => r.payoutStatus === "Settled"
  ).length;
  const processingCount = commissionRecords.filter(
    (r) => r.payoutStatus === "Processing"
  ).length;

  const triggerHaptic = () => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
  };

  // Share Property Link
  const handleShare = async () => {
    triggerHaptic();
    try {
      await Share.share({
        message: `🏢 Check out ${property.title} in ${property.location}!\nMonthly Rent: ₹${property.monthlyRent.toLocaleString(
          "en-IN"
        )}/mo\nMetro: ${property.metroDistance}\nBook free visit now via Delhi Property Exchange.`,
      });
    } catch (error) {}
  };

  // Open Maps
  const handleOpenMaps = () => {
    triggerHaptic();
    const query = encodeURIComponent(`${property.title}, ${property.location}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url!).catch(() => {
      Alert.alert("Maps", `Directions to ${property.location}`);
    });
  };

  // Floating button height
  const floatingBottom = insets.bottom > 0 ? insets.bottom + 10 : 16;

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: floatingBottom + 90,
        }}
      >
        {/* 1. HERO IMAGE CAROUSEL WITH FLOATING NAV */}
        <View style={styles.heroContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {galleryImages.map((uri, idx) => (
              <Image
                key={idx}
                source={{ uri }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Dark Gradient Overlay for readability */}
          <LinearGradient
            colors={["rgba(15, 23, 42, 0.65)", "transparent", "rgba(15, 23, 42, 0.75)"]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* Floating Top Nav Bar */}
          <View style={[styles.topNavBar, { paddingTop: Platform.OS === "android" ? 10 : 4 }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={[
                styles.navBtn,
                {
                  backgroundColor: "rgba(15, 23, 42, 0.75)",
                  borderRadius: radii.round,
                },
              ]}
            >
              <Feather name="arrow-left" size={moderateScale(19)} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Status Pill in Center */}
            <View
              style={[
                styles.navStatusPill,
                {
                  backgroundColor:
                    property.status === "Active"
                      ? "#059669"
                      : property.status === "Occupied"
                      ? "#0284C7"
                      : "#D97706",
                  borderRadius: radii.pill,
                },
              ]}
            >
              <View style={styles.whiteDot} />
              <Text style={styles.navStatusText}>
                {property.status === "Active"
                  ? "LIVE ON PORTAL"
                  : property.status.toUpperCase()}
              </Text>
            </View>

            {/* Share Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShare}
              style={[
                styles.navBtn,
                {
                  backgroundColor: "rgba(15, 23, 42, 0.75)",
                  borderRadius: radii.round,
                },
              ]}
            >
              <Feather name="share-2" size={moderateScale(18)} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Bottom Hero Info: Carousel Dots & Photo Count */}
          <View style={[layout.horizontalViewBetween, styles.heroBottomBar]}>
            {/* Image Dots */}
            <View style={[layout.horizontalView, { gap: 5 }]}>
              {galleryImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    {
                      width: activeImageIndex === idx ? 18 : 6,
                      backgroundColor:
                        activeImageIndex === idx
                          ? colors.primary
                          : "rgba(255, 255, 255, 0.5)",
                      borderRadius: 3,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Photo Counter Pill */}
            <View
              style={[
                styles.counterPill,
                {
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Feather
                name="camera"
                size={moderateScale(11)}
                color="#FFFFFF"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.counterText}>
                {activeImageIndex + 1} / {galleryImages.length} Photos
              </Text>
            </View>
          </View>
        </View>

        {/* 2. MAIN PROPERTY HEADER & TITLE CARD */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              padding: spacing.md + 2,
            },
            shadows.sm,
          ]}
        >
          {/* Category, Gender, Rating Tags */}
          <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
            <View style={[layout.horizontalView, { gap: 6 }]}>
              <View
                style={[
                  styles.tagPill,
                  {
                    backgroundColor:
                      property.gender === "Girls Only"
                        ? isDark
                          ? "rgba(244, 63, 94, 0.18)"
                          : "#FFE4E6"
                        : property.gender === "Boys Only"
                        ? isDark
                          ? "rgba(2, 132, 199, 0.18)"
                          : "#E0F2FE"
                        : isDark
                        ? "rgba(16, 185, 129, 0.18)"
                        : "#ECFDF5",
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(10),
                    fontWeight: "800",
                    color:
                      property.gender === "Girls Only"
                        ? "#E11D48"
                        : property.gender === "Boys Only"
                        ? "#0284C7"
                        : "#059669",
                  }}
                >
                  {property.gender}
                </Text>
              </View>

              <View
                style={[
                  styles.tagPill,
                  {
                    backgroundColor: isDark ? colors.surfaceHover : "#F1F5F9",
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(10),
                    fontWeight: "700",
                    color: colors.textSecondary,
                  }}
                >
                  {property.bhkConfig} • {property.category}
                </Text>
              </View>
            </View>

            {/* Rating */}
            <View style={[layout.horizontalView, { alignItems: "center" }]}>
              <Ionicons
                name="star"
                size={moderateScale(13)}
                color="#F59E0B"
                style={{ marginRight: 2 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(13),
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                {property.rating}{" "}
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    fontWeight: "500",
                    color: colors.textMuted,
                  }}
                >
                  ({property.reviewsCount})
                </Text>
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={[
              typography.brandTitle,
              {
                fontSize: moderateScale(18),
                fontWeight: "900",
                color: colors.textPrimary,
                marginTop: spacing.xs + 2,
              },
            ]}
          >
            {property.title}
          </Text>

          {/* Location & Metro Distance */}
          <View style={[layout.horizontalView, { marginTop: 4, alignItems: "center" }]}>
            <Ionicons
              name="location-outline"
              size={moderateScale(15)}
              color={colors.primary}
              style={{ marginRight: 3 }}
            />
            <Text
              style={{
                fontSize: moderateScale(12.5),
                color: colors.textSecondary,
                fontWeight: "600",
                flex: 1,
              }}
            >
              {property.location}
            </Text>
          </View>

          <View
            style={[
              styles.metroBadge,
              {
                backgroundColor: isDark ? "rgba(13, 148, 136, 0.15)" : colors.primaryLight,
                borderColor: colors.primarySoft,
                borderRadius: radii.lg,
                marginTop: spacing.xs + 2,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="train"
              size={moderateScale(14)}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: moderateScale(11.5),
                fontWeight: "700",
                color: colors.primaryDark,
              }}
            >
              {property.metroDistance}
            </Text>
          </View>
        </View>

        {/* 3. 💰 BROKER COMMISSION & FINANCIAL BREAKDOWN */}
        <View
          style={[
            styles.financialCard,
            {
              backgroundColor: isDark ? "rgba(16, 185, 129, 0.12)" : "#ECFDF5",
              borderColor: isDark ? "rgba(16, 185, 129, 0.3)" : "#A7F3D0",
              borderRadius: radii.xxl,
              marginHorizontal: spacing.screenHorizontal,
              marginTop: spacing.md,
              padding: spacing.md + 2,
            },
            shadows.sm,
          ]}
        >
          {/* Header */}
          <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
            <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
              <MaterialCommunityIcons
                name="cash-check"
                size={moderateScale(22)}
                color="#059669"
              />
              <Text
                style={{
                  fontSize: moderateScale(15),
                  fontWeight: "900",
                  color: "#065F46",
                }}
              >
                Broker Financial Summary
              </Text>
            </View>

            <View style={styles.verifiedPayoutTag}>
              <Text style={styles.verifiedPayoutText}>⚡ DIRECT SETTLEMENT</Text>
            </View>
          </View>

          {/* Commission 2x2 Breakdown */}
          <View style={[layout.horizontalView, { gap: spacing.sm, marginTop: spacing.md }]}>
            {/* Rent */}
            <View
              style={[
                styles.statMiniBox,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.xl,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.statLabel}>MONTHLY RENT</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                ₹{property.monthlyRent.toLocaleString("en-IN")}
                <Text style={{ fontSize: moderateScale(11), color: colors.textMuted }}>
                  /mo
                </Text>
              </Text>
              <Text style={styles.statSub}>Deposit: {property.depositMonths}</Text>
            </View>

            {/* Expected Commission */}
            <View
              style={[
                styles.statMiniBox,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.xl,
                  borderColor: "#86EFAC",
                },
              ]}
            >
              <Text style={[styles.statLabel, { color: "#15803D" }]}>
                YOUR COMMISSION / DEAL
              </Text>
              <Text style={[styles.statValue, { color: "#059669" }]}>
                ₹{property.expectedCommission.toLocaleString("en-IN")}
              </Text>
              <Text style={[styles.statSub, { color: "#15803D" }]}>
                50% 1st Month Payout
              </Text>
            </View>
          </View>

          <View style={[layout.horizontalView, { gap: spacing.sm, marginTop: spacing.xs + 2 }]}>
            {/* Lifetime Earned */}
            <View
              style={[
                styles.statMiniBox,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.xl,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.statLabel}>TOTAL EARNED SO FAR</Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                ₹{property.totalCommissionEarned.toLocaleString("en-IN")}
              </Text>
              <Text style={styles.statSub}>Lifetime Earnings</Text>
            </View>

            {/* Deals Closed */}
            <View
              style={[
                styles.statMiniBox,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.xl,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.statLabel}>DEALS CLOSED</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>
                {property.totalDealsClosed} Tenants
              </Text>
              <Text style={styles.statSub}>Verified Leases</Text>
            </View>
          </View>
        </View>

        {/* 4. 💰 PROPERTY COMMISSION & DEALS HISTORY SECTION */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xxl,
              marginHorizontal: spacing.screenHorizontal,
              marginTop: spacing.md,
              padding: spacing.md + 2,
            },
            shadows.sm,
          ]}
        >
          {/* Header */}
          <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
            <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
              <MaterialCommunityIcons
                name="receipt-text-check-outline"
                size={moderateScale(20)}
                color={colors.primary}
              />
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(14.5),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                Commission & Deals History
              </Text>
            </View>

            <View
              style={[
                styles.settledBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "#DCFCE7",
                  borderColor: isDark
                    ? "rgba(16, 185, 129, 0.3)"
                    : "#86EFAC",
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text style={styles.settledBadgeText}>
                ₹{settledTotal.toLocaleString("en-IN")} Settled
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: moderateScale(11),
              color: colors.textSecondary,
              marginTop: 2,
              marginBottom: spacing.sm,
            }}
          >
            Verified closed deals & net broker payout ledger for this stay
          </Text>

          {/* Filter Tabs: All, Settled, Processing */}
          <View style={[layout.horizontalView, { gap: 6, marginBottom: spacing.sm + 2 }]}>
            {[
              { key: "All", label: `All (${commissionRecords.length})` },
              { key: "Settled", label: `Settled (${settledCount})` },
              { key: "Processing", label: `Processing (${processingCount})` },
            ].map((tab) => {
              const isSelected = selectedCommFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.8}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedCommFilter(tab.key);
                  }}
                  style={[
                    styles.commFilterChip,
                    {
                      backgroundColor: isSelected
                        ? colors.primary
                        : isDark
                        ? colors.surfaceHover
                        : "#F1F5F9",
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.sm + 2,
                      paddingVertical: 5,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(10.5),
                      fontWeight: isSelected ? "800" : "600",
                      color: isSelected ? colors.white : colors.textSecondary,
                    }}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Commission Record Deal Cards */}
          <View style={{ gap: spacing.sm }}>
            {filteredCommissions.map((record) => {
              const isSettled = record.payoutStatus === "Settled";

              return (
                <View
                  key={record.id}
                  style={[
                    styles.dealCard,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceHover
                        : colors.surfaceLight,
                      borderColor: isSettled
                        ? isDark
                          ? "rgba(16, 185, 129, 0.25)"
                          : "#BBF7D0"
                        : isDark
                        ? "rgba(245, 158, 11, 0.25)"
                        : "#FED7AA",
                      borderRadius: radii.xl,
                      padding: spacing.md,
                    },
                  ]}
                >
                  {/* Top Row: Tenant Name & Payout Status Tag */}
                  <View
                    style={[
                      layout.horizontalViewBetween,
                      { alignItems: "center", marginBottom: 6 },
                    ]}
                  >
                    <View style={[layout.horizontalView, { alignItems: "center", gap: 8 }]}>
                      <View
                        style={[
                          styles.tenantAvatar,
                          {
                            backgroundColor: isSettled ? "#10B981" : "#F59E0B",
                            borderRadius: radii.pill,
                          },
                        ]}
                      >
                        <Text style={styles.avatarText}>
                          {record.tenantName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={{
                            fontSize: moderateScale(13),
                            fontWeight: "800",
                            color: colors.textPrimary,
                          }}
                        >
                          {record.tenantName}
                        </Text>
                        <Text
                          style={{
                            fontSize: moderateScale(10),
                            color: colors.textSecondary,
                          }}
                        >
                          Deal Closed on {record.dealDate}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={[
                        styles.statusPillSmall,
                        {
                          backgroundColor: isSettled
                            ? isDark
                              ? "rgba(16, 185, 129, 0.2)"
                              : "#DCFCE7"
                            : isDark
                            ? "rgba(245, 158, 11, 0.2)"
                            : "#FEF3C7",
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Ionicons
                        name={isSettled ? "checkmark-circle" : "time-outline"}
                        size={moderateScale(11)}
                        color={isSettled ? "#059669" : "#D97706"}
                        style={{ marginRight: 3 }}
                      />
                      <Text
                        style={{
                          fontSize: moderateScale(9.5),
                          fontWeight: "800",
                          color: isSettled ? "#059669" : "#D97706",
                        }}
                      >
                        {isSettled ? "PAID TO BANK" : "IN ESCROW"}
                      </Text>
                    </View>
                  </View>

                  {/* Middle: Unit Config & Rent Info */}
                  <View
                    style={[
                      styles.unitBox,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.borderLight,
                        borderRadius: radii.md,
                        padding: spacing.xs + 2,
                        marginVertical: 4,
                      },
                    ]}
                  >
                    <View style={layout.horizontalViewBetween}>
                      <Text
                        style={{
                          fontSize: moderateScale(10.5),
                          color: colors.textSecondary,
                          fontWeight: "600",
                        }}
                      >
                        🚪 Booked:{" "}
                        <Text style={{ fontWeight: "800", color: colors.textPrimary }}>
                          {record.unitBooked}
                        </Text>
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(10.5),
                          color: colors.textSecondary,
                        }}
                      >
                        Rent: ₹{record.monthlyRent.toLocaleString("en-IN")}/mo
                      </Text>
                    </View>
                  </View>

                  {/* Financial Calculation Row */}
                  <View
                    style={[
                      layout.horizontalViewBetween,
                      {
                        alignItems: "center",
                        marginTop: spacing.xs + 2,
                        paddingTop: spacing.xs + 2,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View>
                      <Text
                        style={{
                          fontSize: moderateScale(9.5),
                          color: colors.textMuted,
                          fontWeight: "600",
                        }}
                      >
                        NET COMMISSION (50% - 5% TDS)
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(16),
                          fontWeight: "900",
                          color: isSettled ? "#059669" : "#D97706",
                        }}
                      >
                        ₹{record.netPayout.toLocaleString("en-IN")}
                        <Text
                          style={{
                            fontSize: moderateScale(10),
                            fontWeight: "500",
                            color: colors.textMuted,
                          }}
                        >
                          {" "}(Gross ₹{record.commissionAmount.toLocaleString("en-IN")})
                        </Text>
                      </Text>
                    </View>

                    {/* View Invoice / Receipt Button */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        triggerHaptic();
                        setSelectedReceiptRecord(record);
                      }}
                      style={[
                        styles.receiptBtn,
                        {
                          backgroundColor: colors.primary,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.sm + 2,
                          paddingVertical: 5,
                        },
                      ]}
                    >
                      <Feather
                        name="file-text"
                        size={moderateScale(11)}
                        color="#FFFFFF"
                        style={{ marginRight: 3 }}
                      />
                      <Text style={styles.receiptBtnText}>View Receipt</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Footer Settlement Ref */}
                  <View
                    style={[
                      layout.horizontalViewBetween,
                      { marginTop: 6, alignItems: "center" },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(9),
                        color: colors.textMuted,
                      }}
                    >
                      Ref: {record.transactionRef} • {record.paymentMethod}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(9),
                        color: isSettled ? "#059669" : "#D97706",
                        fontWeight: "700",
                      }}
                    >
                      {isSettled
                        ? `Paid on ${record.payoutDate}`
                        : `Release ${record.payoutDate}`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Direct Settlement Policy Note */}
          <View
            style={[
              styles.policyBox,
              {
                backgroundColor: isDark
                  ? "rgba(13, 148, 136, 0.12)"
                  : colors.primaryLight,
                borderColor: colors.primarySoft,
                borderRadius: radii.lg,
                marginTop: spacing.md,
                padding: spacing.sm,
              },
            ]}
          >
            <View style={[layout.horizontalView, { alignItems: "center", gap: 5 }]}>
              <MaterialCommunityIcons
                name="shield-check"
                size={moderateScale(15)}
                color={colors.primary}
              />
              <Text
                style={{
                  fontSize: moderateScale(10.5),
                  color: colors.primaryDark,
                  fontWeight: "700",
                  flex: 1,
                }}
              >
                Instant Payout Guarantee: Commission is automatically transferred to your bank account within 24 hours of tenant advance confirmation.
              </Text>
            </View>
          </View>
        </View>

        {/* 5. 📊 LIVE OCCUPANCY & INVENTORY TRACKER */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xxl,
              marginHorizontal: spacing.screenHorizontal,
              marginTop: spacing.md,
              padding: spacing.md + 2,
            },
            shadows.sm,
          ]}
        >
          <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
            <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
              <MaterialCommunityIcons
                name="chart-donut"
                size={moderateScale(19)}
                color={colors.primary}
              />
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(14.5),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                Occupancy & Inventory Status
              </Text>
            </View>

            <Text
              style={{
                fontSize: moderateScale(13),
                fontWeight: "900",
                color: property.occupancyPercent >= 90 ? "#059669" : colors.primary,
              }}
            >
              {property.occupancyPercent}% Occupied
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            style={[
              styles.occupancyTrack,
              {
                backgroundColor: isDark ? colors.surfaceHover : "#E2E8F0",
                borderRadius: radii.pill,
                marginTop: spacing.sm,
              },
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark || "#0F766E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.occupancyFill,
                {
                  width: `${property.occupancyPercent}%`,
                  borderRadius: radii.pill,
                },
              ]}
            />
          </View>

          {/* Sub Stats Row */}
          <View
            style={[
              layout.horizontalViewBetween,
              {
                marginTop: spacing.sm + 2,
                paddingTop: spacing.xs + 2,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
              },
            ]}
          >
            <Text
              style={{
                fontSize: moderateScale(11),
                color: colors.textSecondary,
                fontWeight: "600",
              }}
            >
              🛏️ Total Units:{" "}
              <Text style={{ fontWeight: "800", color: colors.textPrimary }}>
                {property.totalUnits}
              </Text>
            </Text>

            <Text
              style={{
                fontSize: moderateScale(11),
                color: property.availableUnits > 0 ? "#059669" : "#DC2626",
                fontWeight: "800",
              }}
            >
              ● {property.availableUnits} Vacant Units Ready
            </Text>

            <Text
              style={{
                fontSize: moderateScale(11),
                color: colors.textMuted,
                fontWeight: "600",
              }}
            >
              👁️ {property.viewsThisMonth} Views
            </Text>
          </View>
        </View>

        {/* 5. 📍 GPS GEO-LOCATION & DIRECTIONS */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xxl,
              marginHorizontal: spacing.screenHorizontal,
              marginTop: spacing.md,
              padding: spacing.md + 2,
            },
            shadows.sm,
          ]}
        >
          <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
            <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
              <MaterialIcons
                name="my-location"
                size={moderateScale(19)}
                color={colors.primary}
              />
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(14.5),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                GPS Coordinates & Location
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleOpenMaps}
              style={[
                styles.mapsBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Feather
                name="map-pin"
                size={moderateScale(11)}
                color="#FFFFFF"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.mapsBtnText}>Google Maps</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            <Text
              style={{
                fontSize: moderateScale(12.5),
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              {property.location}
            </Text>
            <Text
              style={{
                fontSize: moderateScale(11),
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              GPS Pin: 28.5921° N, 77.0460° E (Dwarka Hub)
            </Text>
            <Text
              style={{
                fontSize: moderateScale(11),
                color: colors.textMuted,
                marginTop: 2,
              }}
            >
              🚇 Nearest Station: {property.metroDistance}
            </Text>
          </View>
        </View>

        {/* 6. 🛋️ AMENITIES & PERKS */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xxl,
              marginHorizontal: spacing.screenHorizontal,
              marginTop: spacing.md,
              padding: spacing.md + 2,
            },
            shadows.sm,
          ]}
        >
          <View style={[layout.horizontalView, { alignItems: "center", gap: 6, marginBottom: spacing.sm }]}>
            <MaterialCommunityIcons
              name="checkbox-marked-circle-outline"
              size={moderateScale(19)}
              color={colors.primary}
            />
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(14.5),
                  fontWeight: "800",
                  color: colors.textPrimary,
                },
              ]}
            >
              Included Amenities ({property.amenities.length})
            </Text>
          </View>

          <View style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}>
            {property.amenities.map((am: string) => (
              <View
                key={am}
                style={[
                  styles.amenityChip,
                  {
                    backgroundColor: isDark
                      ? "rgba(13, 148, 136, 0.2)"
                      : colors.primaryLight,
                    borderColor: isDark
                      ? "rgba(13, 148, 136, 0.35)"
                      : colors.primarySoft,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.sm + 3,
                    paddingVertical: 6,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11.5),
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  ✓ {am}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7. ⚡ RECENT CLIENT LEADS FOR THIS PROPERTY */}
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xxl,
              marginHorizontal: spacing.screenHorizontal,
              marginTop: spacing.md,
              padding: spacing.md + 2,
            },
            shadows.sm,
          ]}
        >
          <View style={[layout.horizontalViewBetween, { alignItems: "center", marginBottom: spacing.sm }]}>
            <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
              <MaterialCommunityIcons
                name="account-group"
                size={moderateScale(19)}
                color={colors.primary}
              />
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(14.5),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                Active Tenant Leads ({property.leadsCount})
              </Text>
            </View>

            <View
              style={[
                styles.demandPill,
                {
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "#DCFCE7",
                  borderColor: isDark
                    ? "rgba(16, 185, 129, 0.3)"
                    : "#86EFAC",
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text style={styles.demandPillText}>● High Demand</Text>
            </View>
          </View>

          <View style={{ gap: spacing.xs + 2 }}>
            {MOCK_LEADS_FOR_PROPERTY.map((lead) => (
              <View
                key={lead.id}
                style={[
                  styles.leadRow,
                  {
                    backgroundColor: isDark ? colors.surfaceHover : colors.surfaceLight,
                    borderColor: colors.borderLight,
                    borderRadius: radii.xl,
                    padding: spacing.sm + 2,
                  },
                ]}
              >
                <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
                  <View style={{ flex: 1 }}>
                    <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
                      <Text
                        style={{
                          fontSize: moderateScale(13),
                          fontWeight: "800",
                          color: colors.textPrimary,
                        }}
                      >
                        {lead.clientName}
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(10),
                          color: colors.textMuted,
                          fontWeight: "600",
                        }}
                      >
                        {lead.time}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: moderateScale(11),
                        color: colors.textSecondary,
                        marginTop: 1,
                      }}
                    >
                      {lead.type}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(10.5),
                        color: "#059669",
                        fontWeight: "700",
                        marginTop: 3,
                      }}
                    >
                      ✓ {lead.inquiry}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* 8. FLOATING ACTION CTA BAR */}
      <View
        style={[
          styles.floatingBottomBar,
          {
            bottom: floatingBottom,
            backgroundColor: isDark
              ? "rgba(15, 23, 42, 0.96)"
              : "rgba(255, 255, 255, 0.98)",
            borderColor: colors.border,
            borderRadius: radii.pill,
            padding: 6,
          },
          shadows.lg,
        ]}
      >
        {/* Full Width Book Visit / Register Deal CTA */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            triggerHaptic();
            Alert.alert(
              "Client Visit Scheduled!",
              `Visit booking registered for ${property.title}.\n\nYour commission of ₹${property.expectedCommission.toLocaleString(
                "en-IN"
              )} will be escrowed on token advance payment.`
            );
          }}
          style={[
            styles.bottomPrimaryBtn,
            {
              borderRadius: radii.pill,
              overflow: "hidden",
              width: "100%",
            },
            shadows.sm,
          ]}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || "#0F766E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Text
              style={{
                fontSize: moderateScale(13.5),
                fontWeight: "900",
                color: colors.white,
                marginRight: 6,
              }}
            >
              Book Visit for Client ⚡
            </Text>
            <Feather name="arrow-right" size={moderateScale(16)} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 10. COMMISSION PAYOUT RECEIPT MODAL */}
      <Modal
        visible={!!selectedReceiptRecord}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedReceiptRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.receiptModalCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xxl,
              },
              shadows.lg,
            ]}
          >
            {/* Modal Header */}
            <View
              style={[
                layout.horizontalViewBetween,
                styles.receiptHeader,
                { borderBottomColor: colors.borderLight },
              ]}
            >
              <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={moderateScale(20)}
                  color="#059669"
                />
                <Text
                  style={{
                    fontSize: moderateScale(14),
                    fontWeight: "900",
                    color: colors.textPrimary,
                  }}
                >
                  Commission Settlement Receipt
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedReceiptRecord(null)}
                style={styles.closeModalBtn}
              >
                <Ionicons
                  name="close-circle"
                  size={moderateScale(22)}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {selectedReceiptRecord && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
                <View style={{ padding: spacing.md }}>
                  {/* Status Banner */}
                  <View
                    style={[
                      styles.receiptStatusBanner,
                      {
                        backgroundColor:
                          selectedReceiptRecord.payoutStatus === "Settled"
                            ? isDark
                              ? "rgba(16, 185, 129, 0.15)"
                              : "#ECFDF5"
                            : isDark
                            ? "rgba(245, 158, 11, 0.15)"
                            : "#FEF3C7",
                        borderColor:
                          selectedReceiptRecord.payoutStatus === "Settled"
                            ? isDark
                              ? "rgba(16, 185, 129, 0.3)"
                              : "#86EFAC"
                            : isDark
                            ? "rgba(245, 158, 11, 0.3)"
                            : "#FED7AA",
                        borderRadius: radii.lg,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        selectedReceiptRecord.payoutStatus === "Settled"
                          ? "checkmark-circle"
                          : "time"
                      }
                      size={moderateScale(18)}
                      color={
                        selectedReceiptRecord.payoutStatus === "Settled"
                          ? "#059669"
                          : "#D97706"
                      }
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text
                        style={{
                          fontSize: moderateScale(11.5),
                          fontWeight: "800",
                          color:
                            selectedReceiptRecord.payoutStatus === "Settled"
                              ? "#059669"
                              : "#D97706",
                        }}
                      >
                        {selectedReceiptRecord.payoutStatus === "Settled"
                          ? "PAYOUT TRANSFERRED TO BANK"
                          : "ESCROW CLEARANCE PENDING"}
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(10),
                          color:
                            selectedReceiptRecord.payoutStatus === "Settled"
                              ? isDark
                                ? "#6EE7B7"
                                : "#047857"
                              : isDark
                              ? "#FCD34D"
                              : "#B45309",
                          marginTop: 1,
                        }}
                      >
                        Ref: {selectedReceiptRecord.transactionRef} •{" "}
                        {selectedReceiptRecord.payoutDate}
                      </Text>
                    </View>
                  </View>

                  {/* Property & Tenant Meta */}
                  <View
                    style={[
                      styles.receiptMetaBox,
                      {
                        backgroundColor: isDark ? colors.surfaceHover : colors.surfaceLight,
                        borderColor: colors.borderLight,
                        borderRadius: radii.md,
                      },
                    ]}
                  >
                    <Text style={styles.receiptMetaLabel}>PROPERTY</Text>
                    <Text style={[styles.receiptMetaValue, { color: colors.textPrimary }]}>
                      {property.title}
                    </Text>
                    <Text style={{ fontSize: moderateScale(10.5), color: colors.textSecondary }}>
                      {property.location}
                    </Text>

                    <View style={[styles.dashedDivider, { borderColor: colors.borderLight }]} />

                    <View style={layout.horizontalViewBetween}>
                      <View>
                        <Text style={styles.receiptMetaLabel}>TENANT</Text>
                        <Text style={[styles.receiptMetaValue, { color: colors.textPrimary }]}>
                          {selectedReceiptRecord.tenantName}
                        </Text>
                        <Text style={{ fontSize: moderateScale(10), color: colors.textMuted }}>
                          {selectedReceiptRecord.tenantPhone}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.receiptMetaLabel}>ROOM / BED</Text>
                        <Text style={[styles.receiptMetaValue, { color: colors.textPrimary }]}>
                          {selectedReceiptRecord.unitBooked}
                        </Text>
                        <Text style={{ fontSize: moderateScale(10), color: colors.textMuted }}>
                          Deal: {selectedReceiptRecord.dealDate}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Financial Breakdown Table */}
                  <View
                    style={[
                      styles.breakdownTable,
                      {
                        backgroundColor: isDark ? colors.surfaceHover : "#F8FAFC",
                        borderColor: colors.borderLight,
                        borderRadius: radii.xl,
                      },
                    ]}
                  >
                    <Text style={[styles.receiptMetaLabel, { marginBottom: 6 }]}>
                      TAX INVOICE BREAKDOWN
                    </Text>

                    <View style={[layout.horizontalViewBetween, styles.tableRow]}>
                      <Text style={[styles.tableLabel, { color: colors.textSecondary }]}>
                        First Month Tenant Rent
                      </Text>
                      <Text style={[styles.tableVal, { color: colors.textPrimary }]}>
                        ₹{selectedReceiptRecord.monthlyRent.toLocaleString("en-IN")}
                      </Text>
                    </View>

                    <View style={[layout.horizontalViewBetween, styles.tableRow]}>
                      <Text style={[styles.tableLabel, { color: colors.textSecondary }]}>
                        Broker Commission Rate
                      </Text>
                      <Text style={[styles.tableVal, { color: "#059669", fontWeight: "700" }]}>
                        50% Flat
                      </Text>
                    </View>

                    <View style={[layout.horizontalViewBetween, styles.tableRow]}>
                      <Text style={[styles.tableLabel, { color: colors.textSecondary }]}>
                        Gross Brokerage
                      </Text>
                      <Text style={[styles.tableVal, { color: colors.textPrimary }]}>
                        ₹{selectedReceiptRecord.commissionAmount.toLocaleString("en-IN")}
                      </Text>
                    </View>

                    <View style={[layout.horizontalViewBetween, styles.tableRow]}>
                      <Text style={[styles.tableLabel, { color: "#DC2626" }]}>
                        Less: TDS Deducted ({selectedReceiptRecord.tdsRate})
                      </Text>
                      <Text style={[styles.tableVal, { color: "#DC2626" }]}>
                        -₹{selectedReceiptRecord.tdsAmount.toLocaleString("en-IN")}
                      </Text>
                    </View>

                    <View style={[styles.dashedDivider, { borderColor: colors.borderLight, marginVertical: 6 }]} />

                    <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
                      <Text
                        style={{
                          fontSize: moderateScale(12.5),
                          fontWeight: "900",
                          color: colors.textPrimary,
                        }}
                      >
                        Net Payout Credited
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(17),
                          fontWeight: "900",
                          color: "#059669",
                        }}
                      >
                        ₹{selectedReceiptRecord.netPayout.toLocaleString("en-IN")}
                      </Text>
                    </View>
                  </View>

                  {/* Settlement Mode Card */}
                  <View style={{ marginTop: spacing.sm }}>
                    <Text style={{ fontSize: moderateScale(10), color: colors.textMuted }}>
                      Settlement Mode: {selectedReceiptRecord.paymentMethod} • Direct Bank Transfer to Primary Account (State Bank of India •••• 4019).
                    </Text>
                  </View>

                  {/* Share Action */}
                  <View style={[layout.horizontalView, { gap: spacing.sm, marginTop: spacing.md }]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={async () => {
                        triggerHaptic();
                        try {
                          await Share.share({
                            message: `📄 Commission Settlement Receipt\nProperty: ${property.title}\nTenant: ${selectedReceiptRecord.tenantName} (${selectedReceiptRecord.unitBooked})\nNet Broker Payout: ₹${selectedReceiptRecord.netPayout.toLocaleString(
                              "en-IN"
                            )}\nRef: ${selectedReceiptRecord.transactionRef}\nStatus: ${selectedReceiptRecord.payoutStatus}`,
                          });
                        } catch (e) {}
                      }}
                      style={[
                        styles.modalShareBtn,
                        {
                          backgroundColor: colors.primary,
                          borderRadius: radii.pill,
                          flex: 1,
                        },
                      ]}
                    >
                      <Feather
                        name="share-2"
                        size={moderateScale(13)}
                        color="#FFFFFF"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.modalShareBtnText}>Share Receipt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setSelectedReceiptRecord(null)}
                      style={[
                        styles.modalCloseBtn,
                        {
                          backgroundColor: isDark ? colors.surfaceHover : "#F1F5F9",
                          borderColor: colors.border,
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Text style={[styles.modalCloseBtnText, { color: colors.textPrimary }]}>
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  heroContainer: {
    position: "relative",
    width: SCREEN_WIDTH,
    height: 260,
    backgroundColor: "#334155",
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 260,
  },
  topNavBar: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  navBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  navStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    gap: 4,
  },
  whiteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  navStatusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  heroBottomBar: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  dot: {
    height: 6,
  },
  counterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  counterText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metroBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  financialCard: {
    borderWidth: 1,
  },
  verifiedPayoutTag: {
    backgroundColor: "rgba(5, 150, 105, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedPayoutText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#059669",
    letterSpacing: 0.4,
  },
  statMiniBox: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  statSub: {
    fontSize: 9.5,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 2,
  },
  cardContainer: {
    borderWidth: 1,
  },
  settledBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  settledBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#15803D",
  },
  commFilterChip: {
    borderWidth: 1,
  },
  dealCard: {
    borderWidth: 1,
  },
  tenantAvatar: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "900",
  },
  statusPillSmall: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  unitBox: {
    borderWidth: 1,
  },
  receiptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  receiptBtnText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "800",
  },
  policyBox: {
    borderWidth: 1,
  },
  occupancyTrack: {
    height: 8,
    width: "100%",
    overflow: "hidden",
  },
  occupancyFill: {
    height: "100%",
  },
  mapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  mapsBtnText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "800",
  },
  amenityChip: {
    borderWidth: 1,
  },
  demandPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  demandPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
  },
  leadRow: {
    borderWidth: 1,
  },
  floatingBottomBar: {
    position: "absolute",
    left: 16,
    right: 16,
    borderWidth: 1,
    zIndex: 999,
    elevation: 10,
  },
  bottomPrimaryBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  btnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  receiptModalCard: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    overflow: "hidden",
  },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeModalBtn: {
    padding: 2,
  },
  receiptStatusBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  receiptMetaBox: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  receiptMetaLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  receiptMetaValue: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  dashedDivider: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    marginVertical: 8,
  },
  breakdownTable: {
    borderWidth: 1,
    padding: 10,
  },
  tableRow: {
    paddingVertical: 3,
  },
  tableLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  tableVal: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  modalShareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  modalShareBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  modalCloseBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
