import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Types for Properties, Room Rentals and Transactions
export interface PropertyCommissionSummary {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  totalRooms: number;
  rentedCount: number;
  totalCommission: number;
  creditedCommission: number;
  pendingCommission: number;
  category: string;
}

export interface RoomRentalRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  roomNumber: string;
  roomType: string;
  tenantName: string;
  tenantPhone: string;
  rentAmount: number;
  commissionAmount: number;
  commissionPercentage: number;
  rentalDate: string;
  month: string; // "Jan", "Feb", ...
  year: number; // 2026, 2025, ...
  creditStatus: "CREDITED" | "PROCESSING" | "PENDING";
  creditDate?: string;
  utrNumber?: string;
  payoutAccount: string;
  agreementId: string;
  tdsDeducted: number;
  netCredited: number;
}

// Managed properties for the broker
const MANAGED_PROPERTIES: PropertyCommissionSummary[] = [
  {
    id: "all",
    name: "All Properties",
    location: "Dwarka, Janakpuri & Rohini",
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    totalRooms: 51,
    rentedCount: 38,
    totalCommission: 132250,
    creditedCommission: 114500,
    pendingCommission: 17750,
    category: "All",
  },
  {
    id: "prop-01",
    name: "Dwarka Sec 12 Luxury Girls PG",
    location: "Sector 12, Dwarka, Delhi",
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    totalRooms: 20,
    rentedCount: 19,
    totalCommission: 58000,
    creditedCommission: 50750,
    pendingCommission: 7250,
    category: "PG / Hostel",
  },
  {
    id: "prop-02",
    name: "Janakpuri West Boys Hostel",
    location: "Janakpuri District Centre",
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    totalRooms: 30,
    rentedCount: 27,
    totalCommission: 47250,
    creditedCommission: 42000,
    pendingCommission: 5250,
    category: "PG / Hostel",
  },
  {
    id: "prop-03",
    name: "Rohini Sec 15 Furnished 1BHK",
    location: "Sector 15, Rohini, Delhi",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    totalRooms: 1,
    rentedCount: 3,
    totalCommission: 27000,
    creditedCommission: 21750,
    pendingCommission: 5250,
    category: "Flat / Floor",
  },
];

// Complete Room Rentals and Commission History Records
const MOCK_ROOM_RENTALS: RoomRentalRecord[] = [
  {
    id: "RENT-2026-001",
    propertyId: "prop-01",
    propertyName: "Dwarka Sec 12 Luxury Girls PG",
    roomNumber: "Room 102 (AC Single)",
    roomType: "Private Deluxe Room",
    tenantName: "Pooja Verma",
    tenantPhone: "+91 98711 54321",
    rentAmount: 14500,
    commissionAmount: 7250,
    commissionPercentage: 50,
    rentalDate: "04 Mar 2026",
    month: "Mar",
    year: 2026,
    creditStatus: "CREDITED",
    creditDate: "05 Mar 2026, 02:45 PM",
    utrNumber: "HDFC9842103982",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-DWK-8819",
    tdsDeducted: 362.5,
    netCredited: 6887.5,
  },
  {
    id: "RENT-2026-002",
    propertyId: "prop-02",
    propertyName: "Janakpuri West Boys Hostel",
    roomNumber: "Room 204 (Double Sharing Bed A)",
    roomType: "Twin Sharing AC",
    tenantName: "Aman Tripathi",
    tenantPhone: "+91 98102 99887",
    rentAmount: 10500,
    commissionAmount: 5250,
    commissionPercentage: 50,
    rentalDate: "02 Mar 2026",
    month: "Mar",
    year: 2026,
    creditStatus: "CREDITED",
    creditDate: "03 Mar 2026, 11:30 AM",
    utrNumber: "HDFC9831920811",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-JNK-4421",
    tdsDeducted: 262.5,
    netCredited: 4987.5,
  },
  {
    id: "RENT-2026-003",
    propertyId: "prop-01",
    propertyName: "Dwarka Sec 12 Luxury Girls PG",
    roomNumber: "Room 305 (Single Balcony)",
    roomType: "Premium Single Room",
    tenantName: "Sneha Reddy",
    tenantPhone: "+91 99100 22334",
    rentAmount: 15500,
    commissionAmount: 7750,
    commissionPercentage: 50,
    rentalDate: "27 Feb 2026",
    month: "Feb",
    year: 2026,
    creditStatus: "CREDITED",
    creditDate: "28 Feb 2026, 04:15 PM",
    utrNumber: "HDFC9817762514",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-DWK-8790",
    tdsDeducted: 387.5,
    netCredited: 7362.5,
  },
  {
    id: "RENT-2026-004",
    propertyId: "prop-03",
    propertyName: "Rohini Sec 15 Furnished 1BHK",
    roomNumber: "Floor 2 - 1BHK Suite",
    roomType: "Complete Furnished Floor",
    tenantName: "Vikram & Neha Malhotra",
    tenantPhone: "+91 98118 76543",
    rentAmount: 18000,
    commissionAmount: 9000,
    commissionPercentage: 50,
    rentalDate: "18 Feb 2026",
    month: "Feb",
    year: 2026,
    creditStatus: "PROCESSING",
    creditDate: "Initiated • Expected within 24h",
    utrNumber: "Pending Bank Clearance",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-ROH-1290",
    tdsDeducted: 450,
    netCredited: 8550,
  },
  {
    id: "RENT-2026-005",
    propertyId: "prop-02",
    propertyName: "Janakpuri West Boys Hostel",
    roomNumber: "Room 108 (Double Sharing Bed B)",
    roomType: "Twin Sharing Non-AC",
    tenantName: "Rohan Kapoor",
    tenantPhone: "+91 97112 33445",
    rentAmount: 9500,
    commissionAmount: 4750,
    commissionPercentage: 50,
    rentalDate: "10 Feb 2026",
    month: "Feb",
    year: 2026,
    creditStatus: "CREDITED",
    creditDate: "11 Feb 2026, 06:10 PM",
    utrNumber: "HDFC9798213341",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-JNK-4390",
    tdsDeducted: 237.5,
    netCredited: 4512.5,
  },
  {
    id: "RENT-2026-006",
    propertyId: "prop-01",
    propertyName: "Dwarka Sec 12 Luxury Girls PG",
    roomNumber: "Room 201 (AC Double Bed A)",
    roomType: "Double Sharing Luxury",
    tenantName: "Ananya Deshmukh",
    tenantPhone: "+91 98188 66778",
    rentAmount: 12000,
    commissionAmount: 6000,
    commissionPercentage: 50,
    rentalDate: "20 Jan 2026",
    month: "Jan",
    year: 2026,
    creditStatus: "CREDITED",
    creditDate: "21 Jan 2026, 01:20 PM",
    utrNumber: "HDFC9756123490",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-DWK-8650",
    tdsDeducted: 300,
    netCredited: 5700,
  },
  {
    id: "RENT-2026-007",
    propertyId: "prop-01",
    propertyName: "Dwarka Sec 12 Luxury Girls PG",
    roomNumber: "Room 201 (AC Double Bed B)",
    roomType: "Double Sharing Luxury",
    tenantName: "Kavita Rao",
    tenantPhone: "+91 98111 88990",
    rentAmount: 12000,
    commissionAmount: 6000,
    commissionPercentage: 50,
    rentalDate: "22 Jan 2026",
    month: "Jan",
    year: 2026,
    creditStatus: "CREDITED",
    creditDate: "23 Jan 2026, 03:40 PM",
    utrNumber: "HDFC9759876543",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-DWK-8662",
    tdsDeducted: 300,
    netCredited: 5700,
  },
  {
    id: "RENT-2026-008",
    propertyId: "prop-02",
    propertyName: "Janakpuri West Boys Hostel",
    roomNumber: "Room 302 (Single Studio)",
    roomType: "Private Single AC",
    tenantName: "Kartik Saxena",
    tenantPhone: "+91 98777 44332",
    rentAmount: 13500,
    commissionAmount: 6750,
    commissionPercentage: 50,
    rentalDate: "14 Jan 2026",
    month: "Jan",
    year: 2026,
    creditStatus: "PENDING",
    creditDate: "Pending Owner Approval",
    utrNumber: "Awaiting Confirmation",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-JNK-4310",
    tdsDeducted: 337.5,
    netCredited: 6412.5,
  },
  {
    id: "RENT-2025-009",
    propertyId: "prop-01",
    propertyName: "Dwarka Sec 12 Luxury Girls PG",
    roomNumber: "Room 105 (AC Single)",
    roomType: "Single Deluxe Room",
    tenantName: "Meera Nair",
    tenantPhone: "+91 98112 00991",
    rentAmount: 14500,
    commissionAmount: 7250,
    commissionPercentage: 50,
    rentalDate: "15 Dec 2025",
    month: "Dec",
    year: 2025,
    creditStatus: "CREDITED",
    creditDate: "16 Dec 2025, 05:00 PM",
    utrNumber: "HDFC9688123409",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-DWK-8501",
    tdsDeducted: 362.5,
    netCredited: 6887.5,
  },
  {
    id: "RENT-2025-010",
    propertyId: "prop-03",
    propertyName: "Rohini Sec 15 Furnished 1BHK",
    roomNumber: "Floor 1 - 1BHK Flat",
    roomType: "1BHK Independent Floor",
    tenantName: "Arjun Singhal",
    tenantPhone: "+91 98990 11223",
    rentAmount: 17500,
    commissionAmount: 8750,
    commissionPercentage: 50,
    rentalDate: "05 Dec 2025",
    month: "Dec",
    year: 2025,
    creditStatus: "CREDITED",
    creditDate: "06 Dec 2025, 02:15 PM",
    utrNumber: "HDFC9671239845",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-ROH-1180",
    tdsDeducted: 437.5,
    netCredited: 8312.5,
  },
  {
    id: "RENT-2025-011",
    propertyId: "prop-02",
    propertyName: "Janakpuri West Boys Hostel",
    roomNumber: "Room 201 (Double Sharing Bed A)",
    roomType: "Twin Sharing Room",
    tenantName: "Varun Bajaj",
    tenantPhone: "+91 98765 44331",
    rentAmount: 10500,
    commissionAmount: 5250,
    commissionPercentage: 50,
    rentalDate: "18 Nov 2025",
    month: "Nov",
    year: 2025,
    creditStatus: "CREDITED",
    creditDate: "19 Nov 2025, 12:40 PM",
    utrNumber: "HDFC9611290348",
    payoutAccount: "HDFC Bank (•••• 4821)",
    agreementId: "AGR-JNK-4190",
    tdsDeducted: 262.5,
    netCredited: 4987.5,
  },
];

const AVAILABLE_YEARS = [2026, 2025, 2024];
const AVAILABLE_MONTHS = [
  "All Months",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function BrokerMoneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, isDark, moderateScale } = useResponsiveTheme();

  // Active Tab: 0 = "Commission", 1 = "History"
  const [activeTab, setActiveTab] = useState<"commission" | "history">("commission");
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Filters for Commission Tab
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<string>("All Months");

  // Filter for History Tab
  const [historyStatusFilter, setHistoryStatusFilter] = useState<
    "ALL" | "CREDITED" | "PROCESSING" | "PENDING"
  >("ALL");
  const [historySearchQuery, setHistorySearchQuery] = useState("");

  // Modal Detail State
  const [selectedRecord, setSelectedRecord] = useState<RoomRentalRecord | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Refreshing State
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const contentFadeAnim = useRef(new Animated.Value(1)).current;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  // Handle Tab Switch
  const switchTab = (tab: "commission" | "history") => {
    if (activeTab === tab) return;
    try {
      Haptics.selectionAsync();
    } catch {}
    setActiveTab(tab);

    Animated.parallel([
      Animated.spring(tabIndicatorAnim, {
        toValue: tab === "commission" ? 0 : 1,
        friction: 8,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(contentFadeAnim, {
          toValue: 0.4,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Filtered Room Rentals for Commission Tab
  const filteredCommissionRecords = useMemo(() => {
    return MOCK_ROOM_RENTALS.filter((record) => {
      const matchProperty =
        selectedPropertyId === "all" || record.propertyId === selectedPropertyId;
      const matchYear = record.year === selectedYear;
      const matchMonth =
        selectedMonth === "All Months" || record.month === selectedMonth;
      return matchProperty && matchYear && matchMonth;
    });
  }, [selectedPropertyId, selectedYear, selectedMonth]);

  // Aggregated Stats for Selected Filter
  const stats = useMemo(() => {
    const totalCommission = filteredCommissionRecords.reduce(
      (sum, r) => sum + r.commissionAmount,
      0
    );
    const creditedCommission = filteredCommissionRecords
      .filter((r) => r.creditStatus === "CREDITED")
      .reduce((sum, r) => sum + r.commissionAmount, 0);
    const pendingCommission = filteredCommissionRecords
      .filter((r) => r.creditStatus === "PENDING" || r.creditStatus === "PROCESSING")
      .reduce((sum, r) => sum + r.commissionAmount, 0);
    const roomsRentedCount = filteredCommissionRecords.length;

    return {
      totalCommission,
      creditedCommission,
      pendingCommission,
      roomsRentedCount,
    };
  }, [filteredCommissionRecords]);

  // Filtered Transactions for History Tab
  const filteredHistoryRecords = useMemo(() => {
    return MOCK_ROOM_RENTALS.filter((record) => {
      const matchStatus =
        historyStatusFilter === "ALL" || record.creditStatus === historyStatusFilter;
      const query = historySearchQuery.trim().toLowerCase();
      const matchQuery =
        query === "" ||
        record.propertyName.toLowerCase().includes(query) ||
        record.tenantName.toLowerCase().includes(query) ||
        record.roomNumber.toLowerCase().includes(query) ||
        (record.utrNumber && record.utrNumber.toLowerCase().includes(query)) ||
        record.id.toLowerCase().includes(query);
      return matchStatus && matchQuery;
    });
  }, [historyStatusFilter, historySearchQuery]);

  const handleOpenDetail = (record: RoomRentalRecord) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleDownloadStatement = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    Alert.alert(
      "Statement Exported",
      "Commission statement & TDS summary for Rajesh Sharma has been downloaded to your device as PDF.",
      [{ text: "OK" }]
    );
  };

  const handleWithdrawPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Alert.alert(
      "Instant Settlement",
      "₹" +
        stats.creditedCommission.toLocaleString("en-IN") +
        " is already settled directly to your registered bank account (HDFC Bank •••• 4821). Next auto-cycle is daily at 11:59 PM.",
      [{ text: "Great!" }]
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#090D14" : "#F8FAFC" },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#090D14" : "#F8FAFC"}
      />

      {/* Top Header Bar */}
      <View style={styles.topNav}>
        <View>
          <Text
            style={[
              styles.screenTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Commission & Payouts
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDark ? "#94A3B8" : "#64748B" },
            ]}
          >
            Track room rentals, broker share & bank credits
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleDownloadStatement}
          style={[
            styles.statementBtn,
            {
              backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
              borderColor: isDark ? "#334155" : "#E2E8F0",
            },
          ]}
        >
          <Feather
            name="download"
            size={16}
            color={isDark ? "#38BDF8" : "#0284C7"}
          />
          <Text
            style={[
              styles.statementBtnText,
              { color: isDark ? "#38BDF8" : "#0284C7" },
            ]}
          >
            Statement
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animated 2-Tab Navigation (Commission vs History) */}
      <View style={styles.tabContainer}>
        <View
          style={[
            styles.tabTrack,
            {
              backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
            },
          ]}
        >
          {/* Sliding Indicator */}
          <Animated.View
            style={[
              styles.tabSlider,
              {
                backgroundColor: colors.primary || "#0D9488",
                transform: [
                  {
                    translateX: tabIndicatorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [2, (SCREEN_WIDTH - 36) / 2],
                    }),
                  },
                ],
              },
            ]}
          />

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.tabButton}
            onPress={() => switchTab("commission")}
          >
            <Ionicons
              name="pie-chart-outline"
              size={17}
              color={
                activeTab === "commission"
                  ? "#FFFFFF"
                  : isDark
                  ? "#94A3B8"
                  : "#64748B"
              }
            />
            <Text
              style={[
                styles.tabButtonText,
                {
                  color:
                    activeTab === "commission"
                      ? "#FFFFFF"
                      : isDark
                      ? "#94A3B8"
                      : "#64748B",
                  fontWeight: activeTab === "commission" ? "700" : "500",
                },
              ]}
            >
              Commission
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.tabButton}
            onPress={() => switchTab("history")}
          >
            <Ionicons
              name="time-outline"
              size={17}
              color={
                activeTab === "history"
                  ? "#FFFFFF"
                  : isDark
                  ? "#94A3B8"
                  : "#64748B"
              }
            />
            <Text
              style={[
                styles.tabButtonText,
                {
                  color:
                    activeTab === "history"
                      ? "#FFFFFF"
                      : isDark
                      ? "#94A3B8"
                      : "#64748B",
                  fontWeight: activeTab === "history" ? "700" : "500",
                },
              ]}
            >
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary || "#0D9488"]}
            tintColor={colors.primary || "#0D9488"}
          />
        }
      >
        <Animated.View style={{ opacity: contentFadeAnim }}>
          {activeTab === "commission" ? (
            /* =================================================== */
            /* TAB 1: COMMISSION ANALYTICS & PROPERTY BREAKDOWN */
            /* =================================================== */
            <View>
              {/* 1. Gradient Lifetime Commission Card */}
              <View style={styles.bannerContainer}>
                <LinearGradient
                  colors={["#0D9488", "#0F766E", "#115E59"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientCard}
                >
                  <View style={styles.bannerTopRow}>
                    <View>
                      <Text style={styles.bannerSubhead}>
                        Total Commission Generated
                      </Text>
                      <Text style={styles.bannerAmount}>
                        ₹{stats.totalCommission.toLocaleString("en-IN")}
                      </Text>
                    </View>

                    <View style={styles.badgeLive}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.badgeLiveText}>
                        {selectedMonth === "All Months"
                          ? `Year ${selectedYear}`
                          : `${selectedMonth} ${selectedYear}`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bannerDivider} />

                  <View style={styles.bannerMetricsRow}>
                    <View style={styles.bannerMetricCol}>
                      <Text style={styles.bannerMetricLabel}>
                        Rooms Rented
                      </Text>
                      <View style={styles.bannerMetricValueRow}>
                        <Ionicons name="key" size={15} color="#A7F3D0" />
                        <Text style={styles.bannerMetricValue}>
                          {stats.roomsRentedCount} Deals
                        </Text>
                      </View>
                    </View>

                    <View style={styles.bannerMetricCol}>
                      <Text style={styles.bannerMetricLabel}>
                        Credited to Bank
                      </Text>
                      <View style={styles.bannerMetricValueRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color="#34D399"
                        />
                        <Text style={styles.bannerMetricValue}>
                          ₹{stats.creditedCommission.toLocaleString("en-IN")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.bannerMetricCol}>
                      <Text style={styles.bannerMetricLabel}>
                        In Process / Due
                      </Text>
                      <View style={styles.bannerMetricValueRow}>
                        <Ionicons
                          name="hourglass-outline"
                          size={14}
                          color="#FDE047"
                        />
                        <Text style={styles.bannerMetricValue}>
                          ₹{stats.pendingCommission.toLocaleString("en-IN")}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Bank Link Pill */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleWithdrawPress}
                    style={styles.bankLinkRow}
                  >
                    <View style={styles.bankInfoLeft}>
                      <MaterialCommunityIcons
                        name="bank-check"
                        size={18}
                        color="#CCFBF1"
                      />
                      <Text style={styles.bankLinkText}>
                        Auto Payout: HDFC Bank (•••• 4821)
                      </Text>
                    </View>
                    <View style={styles.settledBadge}>
                      <Text style={styles.settledBadgeText}>Active UTR</Text>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              {/* 2. Select Property Horizontal Scroll View */}
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text
                    style={[
                      styles.sectionHeading,
                      { color: isDark ? "#F1F5F9" : "#0F172A" },
                    ]}
                  >
                    Select Managed Property
                  </Text>
                  <Text
                    style={[
                      styles.sectionSub,
                      { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    Inspect specific PG / Flat rentals & commission
                  </Text>
                </View>
                <Text style={styles.propertyCountBadge}>
                  {MANAGED_PROPERTIES.length - 1} Properties
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.propertyScrollTrack}
              >
                {MANAGED_PROPERTIES.map((property) => {
                  const isSelected = selectedPropertyId === property.id;
                  return (
                    <TouchableOpacity
                      key={property.id}
                      activeOpacity={0.88}
                      onPress={() => {
                        try {
                          Haptics.selectionAsync();
                        } catch {}
                        setSelectedPropertyId(property.id);
                      }}
                      style={[
                        styles.propertyCard,
                        {
                          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                          borderColor: isSelected
                            ? colors.primary || "#0D9488"
                            : isDark
                            ? "#334155"
                            : "#E2E8F0",
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <View style={styles.propertyCardImageWrapper}>
                        <Image
                          source={{ uri: property.imageUrl }}
                          style={styles.propertyCardImage}
                        />
                        {isSelected && (
                          <View style={styles.selectedTickBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color="#FFFFFF"
                            />
                          </View>
                        )}
                        <View style={styles.propertyTag}>
                          <Text style={styles.propertyTagText}>
                            {property.category}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.propertyCardBody}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.propertyCardTitle,
                            {
                              color: isDark ? "#F8FAFC" : "#0F172A",
                              fontWeight: isSelected ? "700" : "600",
                            },
                          ]}
                        >
                          {property.name}
                        </Text>

                        <Text
                          numberOfLines={1}
                          style={[
                            styles.propertyCardLocation,
                            { color: isDark ? "#94A3B8" : "#64748B" },
                          ]}
                        >
                          <Ionicons
                            name="location-sharp"
                            size={12}
                            color="#0D9488"
                          />{" "}
                          {property.location}
                        </Text>

                        <View style={styles.propertyCardFooter}>
                          <View>
                            <Text style={styles.propertyOccupancyText}>
                              {property.id === "all"
                                ? "38 Total Leases"
                                : `${property.rentedCount}/${property.totalRooms} Rooms Rented`}
                            </Text>
                            <Text
                              style={[
                                styles.propertyEarnedText,
                                {
                                  color: colors.primary || "#0D9488",
                                },
                              ]}
                            >
                              ₹{property.totalCommission.toLocaleString("en-IN")} Earned
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 3. Year & Month Selectors */}
              <View style={styles.filtersSection}>
                {/* Year Selector */}
                <View style={styles.filterBlock}>
                  <View style={styles.filterTitleRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={colors.primary || "#0D9488"}
                    />
                    <Text
                      style={[
                        styles.filterTitle,
                        { color: isDark ? "#E2E8F0" : "#334155" },
                      ]}
                    >
                      Select Year
                    </Text>
                  </View>

                  <View style={styles.yearRow}>
                    {AVAILABLE_YEARS.map((year) => {
                      const isYearSelected = selectedYear === year;
                      return (
                        <TouchableOpacity
                          key={year}
                          activeOpacity={0.8}
                          onPress={() => {
                            try {
                              Haptics.selectionAsync();
                            } catch {}
                            setSelectedYear(year);
                          }}
                          style={[
                            styles.yearChip,
                            {
                              backgroundColor: isYearSelected
                                ? colors.primary || "#0D9488"
                                : isDark
                                ? "#1E293B"
                                : "#FFFFFF",
                              borderColor: isYearSelected
                                ? colors.primary || "#0D9488"
                                : isDark
                                ? "#334155"
                                : "#E2E8F0",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.yearChipText,
                              {
                                color: isYearSelected
                                  ? "#FFFFFF"
                                  : isDark
                                  ? "#94A3B8"
                                  : "#475569",
                                fontWeight: isYearSelected ? "700" : "500",
                              },
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Month Selector */}
                <View style={styles.filterBlock}>
                  <View style={styles.filterTitleRow}>
                    <Ionicons
                      name="filter-outline"
                      size={16}
                      color={colors.primary || "#0D9488"}
                    />
                    <Text
                      style={[
                        styles.filterTitle,
                        { color: isDark ? "#E2E8F0" : "#334155" },
                      ]}
                    >
                      Select Month
                    </Text>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.monthsTrack}
                  >
                    {AVAILABLE_MONTHS.map((month) => {
                      const isMonthSelected = selectedMonth === month;
                      return (
                        <TouchableOpacity
                          key={month}
                          activeOpacity={0.8}
                          onPress={() => {
                            try {
                              Haptics.selectionAsync();
                            } catch {}
                            setSelectedMonth(month);
                          }}
                          style={[
                            styles.monthChip,
                            {
                              backgroundColor: isMonthSelected
                                ? colors.primary || "#0D9488"
                                : isDark
                                ? "#1E293B"
                                : "#FFFFFF",
                              borderColor: isMonthSelected
                                ? colors.primary || "#0D9488"
                                : isDark
                                ? "#334155"
                                : "#E2E8F0",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.monthChipText,
                              {
                                color: isMonthSelected
                                  ? "#FFFFFF"
                                  : isDark
                                  ? "#94A3B8"
                                  : "#475569",
                                fontWeight: isMonthSelected ? "700" : "500",
                              },
                            ]}
                          >
                            {month}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              {/* 4. Room Rentals Breakdown & Commission Settlement Status */}
              <View style={styles.roomListSection}>
                <View style={styles.roomListHeaderRow}>
                  <View>
                    <Text
                      style={[
                        styles.sectionHeading,
                        { color: isDark ? "#F8FAFC" : "#0F172A" },
                      ]}
                    >
                      Room Rentals & Account Credit
                    </Text>
                    <Text
                      style={[
                        styles.sectionSub,
                        { color: isDark ? "#94A3B8" : "#64748B" },
                      ]}
                    >
                      {filteredCommissionRecords.length} rooms rented in{" "}
                      {selectedMonth === "All Months"
                        ? `${selectedYear}`
                        : `${selectedMonth} ${selectedYear}`}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.dealCountPill,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F1F5F9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dealCountPillText,
                        { color: colors.primary || "#0D9488" },
                      ]}
                    >
                      {filteredCommissionRecords.length} Deals
                    </Text>
                  </View>
                </View>

                {filteredCommissionRecords.length === 0 ? (
                  <View
                    style={[
                      styles.emptyStateCard,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <Ionicons
                      name="receipt-outline"
                      size={44}
                      color="#94A3B8"
                    />
                    <Text
                      style={[
                        styles.emptyStateTitle,
                        { color: isDark ? "#F1F5F9" : "#1E293B" },
                      ]}
                    >
                      No rentals recorded
                    </Text>
                    <Text style={styles.emptyStateSub}>
                      No room rental commissions logged for {selectedMonth}{" "}
                      {selectedYear} on this property.
                    </Text>
                  </View>
                ) : (
                  filteredCommissionRecords.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.88}
                      onPress={() => handleOpenDetail(item)}
                      style={[
                        styles.rentalCard,
                        {
                          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                          borderColor: isDark ? "#334155" : "#E2E8F0",
                        },
                      ]}
                    >
                      {/* Top Row: Room Number & Credit Status Badge */}
                      <View style={styles.rentalTopRow}>
                        <View style={styles.roomBadge}>
                          <Ionicons name="bed-outline" size={15} color="#0D9488" />
                          <Text style={styles.roomBadgeText}>
                            {item.roomNumber}
                          </Text>
                        </View>

                        {item.creditStatus === "CREDITED" ? (
                          <View style={styles.statusCreditedBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={14}
                              color="#059669"
                            />
                            <Text style={styles.statusCreditedText}>
                              Credited in Bank
                            </Text>
                          </View>
                        ) : item.creditStatus === "PROCESSING" ? (
                          <View style={styles.statusProcessingBadge}>
                            <Ionicons
                              name="hourglass-outline"
                              size={13}
                              color="#D97706"
                            />
                            <Text style={styles.statusProcessingText}>
                              Processing
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.statusPendingBadge}>
                            <Ionicons
                              name="alert-circle-outline"
                              size={14}
                              color="#DC2626"
                            />
                            <Text style={styles.statusPendingText}>
                              Pending Approval
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Property Name & Tenant */}
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.rentalPropertyName,
                          { color: isDark ? "#F1F5F9" : "#0F172A" },
                        ]}
                      >
                        {item.propertyName}
                      </Text>

                      <View style={styles.tenantInfoRow}>
                        <View style={styles.tenantLeft}>
                          <Ionicons
                            name="person-circle-outline"
                            size={16}
                            color="#64748B"
                          />
                          <Text
                            style={[
                              styles.tenantNameText,
                              { color: isDark ? "#CBD5E1" : "#475569" },
                            ]}
                          >
                            {item.tenantName}
                          </Text>
                        </View>

                        <Text style={styles.rentalDateText}>
                          Rented on {item.rentalDate}
                        </Text>
                      </View>

                      {/* Financials & Payout Details */}
                      <View
                        style={[
                          styles.rentalFinanceBox,
                          {
                            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                            borderColor: isDark ? "#334155" : "#EEF2F6",
                          },
                        ]}
                      >
                        <View style={styles.financeCol}>
                          <Text style={styles.financeLabel}>Monthly Rent</Text>
                          <Text
                            style={[
                              styles.financeValue,
                              { color: isDark ? "#F1F5F9" : "#1E293B" },
                            ]}
                          >
                            ₹{item.rentAmount.toLocaleString("en-IN")}
                          </Text>
                        </View>

                        <View style={styles.financeDivider} />

                        <View style={styles.financeCol}>
                          <Text style={styles.financeLabel}>
                            Broker Share ({item.commissionPercentage}%)
                          </Text>
                          <Text
                            style={[
                              styles.financeCommissionValue,
                              { color: colors.primary || "#0D9488" },
                            ]}
                          >
                            ₹{item.commissionAmount.toLocaleString("en-IN")}
                          </Text>
                        </View>

                        <View style={styles.financeDivider} />

                        <View style={styles.financeCol}>
                          <Text style={styles.financeLabel}>Net Credited</Text>
                          <Text
                            style={[
                              styles.financeNetValue,
                              { color: isDark ? "#34D399" : "#059669" },
                            ]}
                          >
                            ₹{item.netCredited.toLocaleString("en-IN")}
                          </Text>
                        </View>
                      </View>

                      {/* Credit Audit Footer */}
                      <View style={styles.creditFooterRow}>
                        <View style={styles.creditFooterLeft}>
                          <Ionicons
                            name="wallet-outline"
                            size={14}
                            color="#0D9488"
                          />
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.creditFooterText,
                              { color: isDark ? "#94A3B8" : "#64748B" },
                            ]}
                          >
                            {item.creditStatus === "CREDITED"
                              ? `Settled: ${item.utrNumber} (${item.creditDate})`
                              : item.creditStatus === "PROCESSING"
                              ? "Transferred to clearing queue"
                              : "Invoice generated • Awaiting owner"}
                          </Text>
                        </View>

                        <Feather
                          name="chevron-right"
                          size={16}
                          color="#94A3B8"
                        />
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          ) : (
            /* =================================================== */
            /* TAB 2: COMPLETE TRANSACTION HISTORY & LEDGER */
            /* =================================================== */
            <View style={styles.historySection}>
              {/* Search Bar */}
              <View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
              >
                <Feather name="search" size={18} color="#94A3B8" />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: isDark ? "#F8FAFC" : "#0F172A" },
                  ]}
                  placeholder="Search by property, tenant, UTR or ID..."
                  placeholderTextColor="#94A3B8"
                  value={historySearchQuery}
                  onChangeText={setHistorySearchQuery}
                />
                {historySearchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setHistorySearchQuery("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x-circle" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Status Filter Chips */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.historyFilterTrack}
              >
                {(
                  [
                    { key: "ALL", label: "All Transactions" },
                    { key: "CREDITED", label: "Credited ✅" },
                    { key: "PROCESSING", label: "Processing ⏳" },
                    { key: "PENDING", label: "Pending ⚠️" },
                  ] as const
                ).map((chip) => {
                  const isChipActive = historyStatusFilter === chip.key;
                  return (
                    <TouchableOpacity
                      key={chip.key}
                      activeOpacity={0.8}
                      onPress={() => {
                        try {
                          Haptics.selectionAsync();
                        } catch {}
                        setHistoryStatusFilter(chip.key);
                      }}
                      style={[
                        styles.historyChip,
                        {
                          backgroundColor: isChipActive
                            ? colors.primary || "#0D9488"
                            : isDark
                            ? "#1E293B"
                            : "#FFFFFF",
                          borderColor: isChipActive
                            ? colors.primary || "#0D9488"
                            : isDark
                            ? "#334155"
                            : "#E2E8F0",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.historyChipText,
                          {
                            color: isChipActive
                              ? "#FFFFFF"
                              : isDark
                              ? "#94A3B8"
                              : "#64748B",
                            fontWeight: isChipActive ? "700" : "500",
                          },
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* History Transaction List */}
              <View style={styles.historyList}>
                {filteredHistoryRecords.length === 0 ? (
                  <View
                    style={[
                      styles.emptyStateCard,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <Ionicons
                      name="search-outline"
                      size={44}
                      color="#94A3B8"
                    />
                    <Text
                      style={[
                        styles.emptyStateTitle,
                        { color: isDark ? "#F1F5F9" : "#1E293B" },
                      ]}
                    >
                      No transactions found
                    </Text>
                    <Text style={styles.emptyStateSub}>
                      Try changing your search term or filter chips.
                    </Text>
                  </View>
                ) : (
                  filteredHistoryRecords.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.88}
                      onPress={() => handleOpenDetail(item)}
                      style={[
                        styles.historyCard,
                        {
                          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                          borderColor: isDark ? "#334155" : "#E2E8F0",
                        },
                      ]}
                    >
                      <View style={styles.historyCardHeader}>
                        <View style={styles.historyCardIdBadge}>
                          <Text style={styles.historyCardIdText}>
                            {item.id}
                          </Text>
                        </View>

                        {item.creditStatus === "CREDITED" ? (
                          <View style={styles.statusCreditedBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={13}
                              color="#059669"
                            />
                            <Text style={styles.statusCreditedText}>
                              Settled
                            </Text>
                          </View>
                        ) : item.creditStatus === "PROCESSING" ? (
                          <View style={styles.statusProcessingBadge}>
                            <Ionicons
                              name="hourglass-outline"
                              size={13}
                              color="#D97706"
                            />
                            <Text style={styles.statusProcessingText}>
                              In Clearing
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.statusPendingBadge}>
                            <Ionicons
                              name="alert-circle-outline"
                              size={13}
                              color="#DC2626"
                            />
                            <Text style={styles.statusPendingText}>
                              Pending
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.historyCardBody}>
                        <View style={{ flex: 1 }}>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.historyPropName,
                              { color: isDark ? "#F8FAFC" : "#0F172A" },
                            ]}
                          >
                            {item.propertyName}
                          </Text>
                          <Text
                            style={[
                              styles.historyRoomName,
                              { color: isDark ? "#94A3B8" : "#64748B" },
                            ]}
                          >
                            {item.roomNumber} • Tenant: {item.tenantName}
                          </Text>
                          <Text style={styles.historyDateStamp}>
                            Rental Date: {item.rentalDate}
                          </Text>
                        </View>

                        <View style={styles.historyAmountWrapper}>
                          <Text
                            style={[
                              styles.historyAmountText,
                              { color: colors.primary || "#0D9488" },
                            ]}
                          >
                            +₹{item.commissionAmount.toLocaleString("en-IN")}
                          </Text>
                          <Text style={styles.historyNetText}>
                            Net: ₹{item.netCredited.toLocaleString("en-IN")}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.historyCardFooter,
                          {
                            borderTopColor: isDark ? "#334155" : "#F1F5F9",
                          },
                        ]}
                      >
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.historyBankText,
                            { color: isDark ? "#94A3B8" : "#64748B" },
                          ]}
                        >
                          🏦 {item.payoutAccount}
                        </Text>
                        <Text style={styles.historyViewReceipt}>
                          View Receipt →
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Detail & Receipt Bottom Sheet Modal */}
      <Modal
        visible={isDetailModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                paddingBottom: insets.bottom + 20,
              },
            ]}
          >
            {/* Modal Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? "#F8FAFC" : "#0F172A" },
                  ]}
                >
                  Commission Receipt
                </Text>
                <Text
                  style={[
                    styles.modalSub,
                    { color: isDark ? "#94A3B8" : "#64748B" },
                  ]}
                >
                  Invoice #{selectedRecord?.id}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsDetailModalVisible(false)}
                style={[
                  styles.closeModalBtn,
                  { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                ]}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? "#FFFFFF" : "#0F172A"}
                />
              </TouchableOpacity>
            </View>

            {selectedRecord && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Settlement Status Box */}
                <View
                  style={[
                    styles.modalStatusBox,
                    {
                      backgroundColor:
                        selectedRecord.creditStatus === "CREDITED"
                          ? "#ECFDF5"
                          : selectedRecord.creditStatus === "PROCESSING"
                          ? "#FFFBEB"
                          : "#FEF2F2",
                      borderColor:
                        selectedRecord.creditStatus === "CREDITED"
                          ? "#A7F3D0"
                          : selectedRecord.creditStatus === "PROCESSING"
                          ? "#FDE68A"
                          : "#FECACA",
                    },
                  ]}
                >
                  <View style={styles.modalStatusIconWrapper}>
                    <Ionicons
                      name={
                        selectedRecord.creditStatus === "CREDITED"
                          ? "checkmark-circle"
                          : selectedRecord.creditStatus === "PROCESSING"
                          ? "hourglass"
                          : "alert-circle"
                      }
                      size={28}
                      color={
                        selectedRecord.creditStatus === "CREDITED"
                          ? "#059669"
                          : selectedRecord.creditStatus === "PROCESSING"
                          ? "#D97706"
                          : "#DC2626"
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.modalStatusTitle,
                        {
                          color:
                            selectedRecord.creditStatus === "CREDITED"
                              ? "#065F46"
                              : selectedRecord.creditStatus === "PROCESSING"
                              ? "#92400E"
                              : "#991B1B",
                        },
                      ]}
                    >
                      {selectedRecord.creditStatus === "CREDITED"
                        ? "Commission Credited to Account"
                        : selectedRecord.creditStatus === "PROCESSING"
                        ? "Settlement in Progress"
                        : "Pending Confirmation"}
                    </Text>
                    <Text
                      style={[
                        styles.modalStatusSub,
                        {
                          color:
                            selectedRecord.creditStatus === "CREDITED"
                              ? "#047857"
                              : selectedRecord.creditStatus === "PROCESSING"
                              ? "#B45309"
                              : "#B91C1C",
                        },
                      ]}
                    >
                      {selectedRecord.creditDate}
                    </Text>
                  </View>
                </View>

                {/* Rental Details Card */}
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
                      styles.modalCardHeading,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Rental & Room Information
                  </Text>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Property</Text>
                    <Text
                      style={[
                        styles.modalValue,
                        { color: isDark ? "#E2E8F0" : "#1E293B" },
                      ]}
                    >
                      {selectedRecord.propertyName}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Room / Unit</Text>
                    <Text
                      style={[
                        styles.modalValue,
                        { color: isDark ? "#E2E8F0" : "#1E293B" },
                      ]}
                    >
                      {selectedRecord.roomNumber} ({selectedRecord.roomType})
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Tenant Name</Text>
                    <Text
                      style={[
                        styles.modalValue,
                        { color: isDark ? "#E2E8F0" : "#1E293B" },
                      ]}
                    >
                      {selectedRecord.tenantName} ({selectedRecord.tenantPhone})
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Agreement ID</Text>
                    <Text style={[styles.modalValue, { color: "#0D9488" }]}>
                      {selectedRecord.agreementId}
                    </Text>
                  </View>
                </View>

                {/* Commission Calculation Breakdown */}
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
                      styles.modalCardHeading,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Financial & Tax Breakdown
                  </Text>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Tenant Monthly Rent</Text>
                    <Text
                      style={[
                        styles.modalValue,
                        { color: isDark ? "#E2E8F0" : "#1E293B" },
                      ]}
                    >
                      ₹{selectedRecord.rentAmount.toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>
                      Broker Commission ({selectedRecord.commissionPercentage}%)
                    </Text>
                    <Text
                      style={[
                        styles.modalValue,
                        { color: colors.primary || "#0D9488", fontWeight: "700" },
                      ]}
                    >
                      ₹{selectedRecord.commissionAmount.toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>TDS Deduction (5%)</Text>
                    <Text style={[styles.modalValue, { color: "#DC2626" }]}>
                      - ₹{selectedRecord.tdsDeducted.toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View style={styles.modalDivider} />

                  <View style={styles.modalRow}>
                    <Text
                      style={[
                        styles.modalLabel,
                        { fontWeight: "700", fontSize: 15 },
                      ]}
                    >
                      Net Amount Settled
                    </Text>
                    <Text
                      style={[
                        styles.modalValue,
                        {
                          color: isDark ? "#34D399" : "#059669",
                          fontWeight: "800",
                          fontSize: 16,
                        },
                      ]}
                    >
                      ₹{selectedRecord.netCredited.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                {/* Bank Settlement Audit Info */}
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
                      styles.modalCardHeading,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Bank Payout Details
                  </Text>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Credited Account</Text>
                    <Text
                      style={[
                        styles.modalValue,
                        { color: isDark ? "#E2E8F0" : "#1E293B" },
                      ]}
                    >
                      {selectedRecord.payoutAccount}
                    </Text>
                  </View>

                  <View style={styles.modalRow}>
                    <Text style={styles.modalLabel}>Bank UTR Reference</Text>
                    <Text
                      style={[
                        styles.modalValue,
                        { color: "#0D9488", fontWeight: "600" },
                      ]}
                    >
                      {selectedRecord.utrNumber}
                    </Text>
                  </View>
                </View>

                {/* Modal Action Buttons */}
                <View style={styles.modalActionRow}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={handleDownloadStatement}
                    style={[
                      styles.modalDownloadBtn,
                      { backgroundColor: colors.primary || "#0D9488" },
                    ]}
                  >
                    <Feather name="download" size={17} color="#FFFFFF" />
                    <Text style={styles.modalDownloadText}>
                      Download Official Invoice
                    </Text>
                  </TouchableOpacity>
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
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  statementBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  statementBtnText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  tabContainer: {
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  tabTrack: {
    flexDirection: "row",
    height: 44,
    borderRadius: 12,
    position: "relative",
    padding: 2,
    alignItems: "center",
  },
  tabSlider: {
    position: "absolute",
    width: (SCREEN_WIDTH - 36) / 2 - 4,
    height: 40,
    borderRadius: 10,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 14,
  },
  bannerContainer: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  gradientCard: {
    borderRadius: 20,
    padding: 18,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  bannerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  bannerSubhead: {
    color: "#CCFBF1",
    fontSize: 12.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bannerAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  badgeLive: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  badgeLiveText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "700",
  },
  bannerDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginVertical: 14,
  },
  bannerMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bannerMetricCol: {
    flex: 1,
  },
  bannerMetricLabel: {
    color: "#99F6E4",
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 3,
  },
  bannerMetricValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bannerMetricValue: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  bankLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 14,
  },
  bankInfoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  bankLinkText: {
    color: "#F0FDFA",
    fontSize: 11.5,
    fontWeight: "600",
  },
  settledBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  settledBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  propertyCountBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0D9488",
  },
  propertyScrollTrack: {
    paddingHorizontal: 18,
    gap: 12,
    paddingBottom: 4,
  },
  propertyCard: {
    width: 190,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  propertyCardImageWrapper: {
    height: 100,
    width: "100%",
    position: "relative",
  },
  propertyCardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  selectedTickBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#0D9488",
    borderRadius: 12,
    padding: 2,
  },
  propertyTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  propertyTagText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "700",
  },
  propertyCardBody: {
    padding: 10,
  },
  propertyCardTitle: {
    fontSize: 13,
    marginBottom: 3,
  },
  propertyCardLocation: {
    fontSize: 11,
    marginBottom: 6,
  },
  propertyCardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 6,
    marginTop: 2,
  },
  propertyOccupancyText: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "500",
  },
  propertyEarnedText: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 1,
  },
  filtersSection: {
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 10,
  },
  filterBlock: {
    marginBottom: 12,
  },
  filterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  yearRow: {
    flexDirection: "row",
    gap: 8,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  yearChipText: {
    fontSize: 13,
  },
  monthsTrack: {
    gap: 8,
  },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 6.5,
    borderRadius: 10,
    borderWidth: 1,
  },
  monthChipText: {
    fontSize: 12.5,
  },
  roomListSection: {
    paddingHorizontal: 18,
    marginTop: 8,
  },
  roomListHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  dealCountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dealCountPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyStateCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },
  emptyStateSub: {
    fontSize: 12.5,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
    maxWidth: 240,
  },
  rentalCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  rentalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 5,
  },
  roomBadgeText: {
    color: "#0F766E",
    fontSize: 12,
    fontWeight: "700",
  },
  statusCreditedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusCreditedText: {
    color: "#059669",
    fontSize: 11,
    fontWeight: "700",
  },
  statusProcessingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusProcessingText: {
    color: "#D97706",
    fontSize: 11,
    fontWeight: "700",
  },
  statusPendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  statusPendingText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "700",
  },
  rentalPropertyName: {
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 4,
  },
  tenantInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  tenantLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tenantNameText: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  rentalDateText: {
    fontSize: 11.5,
    color: "#94A3B8",
  },
  rentalFinanceBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  financeCol: {
    flex: 1,
    alignItems: "center",
  },
  financeDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },
  financeLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 2,
    textAlign: "center",
  },
  financeValue: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  financeCommissionValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  financeNetValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  creditFooterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  creditFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  creditFooterText: {
    fontSize: 11,
  },
  historySection: {
    paddingHorizontal: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
  },
  historyFilterTrack: {
    gap: 8,
    paddingBottom: 12,
  },
  historyChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  historyChipText: {
    fontSize: 12.5,
  },
  historyList: {
    marginTop: 4,
  },
  historyCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyCardIdBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  historyCardIdText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  historyCardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  historyPropName: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  historyRoomName: {
    fontSize: 12,
    marginBottom: 2,
  },
  historyDateStamp: {
    fontSize: 11,
    color: "#94A3B8",
  },
  historyAmountWrapper: {
    alignItems: "flex-end",
  },
  historyAmountText: {
    fontSize: 16,
    fontWeight: "800",
  },
  historyNetText: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "600",
    marginTop: 2,
  },
  historyCardFooter: {
    borderTopWidth: 1,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyBankText: {
    fontSize: 11.5,
  },
  historyViewReceipt: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0D9488",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "88%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalStatusBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    gap: 12,
  },
  modalStatusIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalStatusTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalStatusSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalDetailCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalCardHeading: {
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  modalLabel: {
    fontSize: 12.5,
    color: "#64748B",
  },
  modalValue: {
    fontSize: 12.5,
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "60%",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 6,
  },
  modalActionRow: {
    marginTop: 8,
    marginBottom: 10,
  },
  modalDownloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  modalDownloadText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
