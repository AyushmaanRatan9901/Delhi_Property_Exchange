import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";

export interface BrokerManagedProperty {
  id: string;
  title: string;
  category: "PG / Hostel" | "Private Room" | "Flat / Floor" | "Co-Living";
  gender: "Girls Only" | "Boys Only" | "Unisex" | "Family";
  bhkConfig: "1 BHK" | "2 BHK" | "3 BHK" | "1 RK" | "Single Bed" | "Double Sharing" | "Triple Sharing";
  location: string;
  metroDistance: string;
  imageUrl: string;
  monthlyRent: number;
  expectedCommission: number;
  totalCommissionEarned: number;
  totalDealsClosed: number;
  status: "Active" | "Occupied" | "Under Review";
  occupancyPercent: number;
  totalUnits: number;
  availableUnits: number;
  viewsThisMonth: number;
  leadsCount: number;
  rating: number;
  reviewsCount: number;
  amenities: string[];
  caretakerName: string;
  caretakerPhone: string;
  dateAdded: string;
  depositMonths: string;
}

export const BROKER_PROPERTIES_DATA: BrokerManagedProperty[] = [
  {
    id: "prop-01",
    title: "Dwarka Sector 12 Luxury Girls PG",
    category: "PG / Hostel",
    gender: "Girls Only",
    bhkConfig: "Single Bed",
    location: "Sector 12, Dwarka, New Delhi",
    metroDistance: "200m from Blue Line Metro",
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 14500,
    expectedCommission: 7250,
    totalCommissionEarned: 58000,
    totalDealsClosed: 8,
    status: "Active",
    occupancyPercent: 95,
    totalUnits: 20,
    availableUnits: 1,
    viewsThisMonth: 340,
    leadsCount: 22,
    rating: 4.9,
    reviewsCount: 38,
    amenities: ["WiFi", "AC", "3 Meals", "Washing Machine", "Geyser", "CCTV Security", "Housekeeping"],
    caretakerName: "Rameshwar Dayal",
    caretakerPhone: "+91 98110 12345",
    dateAdded: "Added 2 days ago",
    depositMonths: "1 Month",
  },
  {
    id: "prop-02",
    title: "Janakpuri West Prime Boys Hostel",
    category: "PG / Hostel",
    gender: "Boys Only",
    bhkConfig: "Double Sharing",
    location: "Janakpuri District Centre, Delhi",
    metroDistance: "150m from Blue & Magenta Line",
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 10500,
    expectedCommission: 5250,
    totalCommissionEarned: 47250,
    totalDealsClosed: 9,
    status: "Active",
    occupancyPercent: 90,
    totalUnits: 30,
    availableUnits: 3,
    viewsThisMonth: 290,
    leadsCount: 18,
    rating: 4.8,
    reviewsCount: 29,
    amenities: ["WiFi", "AC", "3 Meals", "Gym Access", "Power Backup", "RO Water"],
    caretakerName: "Sanjay Mishra",
    caretakerPhone: "+91 98765 23456",
    dateAdded: "Added 5 days ago",
    depositMonths: "1 Month",
  },
  {
    id: "prop-03",
    title: "Rohini Sector 15 Furnished 1BHK Floor",
    category: "Flat / Floor",
    gender: "Family",
    bhkConfig: "1 BHK",
    location: "Rohini Sector 15, North Delhi",
    metroDistance: "350m from Red Line Metro",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 18000,
    expectedCommission: 9000,
    totalCommissionEarned: 27000,
    totalDealsClosed: 3,
    status: "Active",
    occupancyPercent: 100,
    totalUnits: 1,
    availableUnits: 0,
    viewsThisMonth: 185,
    leadsCount: 12,
    rating: 4.7,
    reviewsCount: 15,
    amenities: ["Furnished", "Modular Kitchen", "Balcony", "Car Parking", "Geyser", "Lift"],
    caretakerName: "Kuldeep Singh",
    caretakerPhone: "+91 98112 34567",
    dateAdded: "Added 1 week ago",
    depositMonths: "2 Months",
  },
  {
    id: "prop-04",
    title: "Cyber Hub Co-Living Executive Suites",
    category: "Co-Living",
    gender: "Unisex",
    bhkConfig: "Single Bed",
    location: "DLF Phase 2, Near Cyber City, Gurgaon",
    metroDistance: "250m from Rapid Metro",
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 22000,
    expectedCommission: 11000,
    totalCommissionEarned: 66000,
    totalDealsClosed: 6,
    status: "Active",
    occupancyPercent: 96,
    totalUnits: 25,
    availableUnits: 1,
    viewsThisMonth: 420,
    leadsCount: 31,
    rating: 4.9,
    reviewsCount: 44,
    amenities: ["WiFi (300 Mbps)", "Chef Cooked Meals", "Biometric Lock", "Gym", "Gaming Lounge", "Housekeeping"],
    caretakerName: "Anil Rawat",
    caretakerPhone: "+91 99990 45678",
    dateAdded: "Added 2 weeks ago",
    depositMonths: "1 Month",
  },
  {
    id: "prop-05",
    title: "Uttam Nagar East Scholar Studio PG",
    category: "PG / Hostel",
    gender: "Boys Only",
    bhkConfig: "Double Sharing",
    location: "Uttam Nagar East, West Delhi",
    metroDistance: "100m from Blue Line Metro",
    imageUrl:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 8500,
    expectedCommission: 4250,
    totalCommissionEarned: 38250,
    totalDealsClosed: 9,
    status: "Active",
    occupancyPercent: 92,
    totalUnits: 16,
    availableUnits: 2,
    viewsThisMonth: 210,
    leadsCount: 16,
    rating: 4.6,
    reviewsCount: 21,
    amenities: ["WiFi", "Meals", "Study Desk", "RO Water", "CCTV", "Inverter Backup"],
    caretakerName: "Manoj Kumar",
    caretakerPhone: "+91 98114 56789",
    dateAdded: "Added 2 weeks ago",
    depositMonths: "₹5,000 Fixed",
  },
  {
    id: "prop-06",
    title: "Dwarka Sector 7 Luxury 2BHK Independent Floor",
    category: "Flat / Floor",
    gender: "Family",
    bhkConfig: "2 BHK",
    location: "Dwarka Sector 7, Delhi",
    metroDistance: "400m from Sector 9 Metro",
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 26000,
    expectedCommission: 13000,
    totalCommissionEarned: 26000,
    totalDealsClosed: 2,
    status: "Occupied",
    occupancyPercent: 100,
    totalUnits: 1,
    availableUnits: 0,
    viewsThisMonth: 165,
    leadsCount: 19,
    rating: 4.9,
    reviewsCount: 12,
    amenities: ["Fully Furnished", "Covered Car Parking", "Italian Modular Kitchen", "Power Backup", "2 Balconies"],
    caretakerName: "Vikram Malhotra",
    caretakerPhone: "+91 98101 67890",
    dateAdded: "Added 3 weeks ago",
    depositMonths: "2 Months",
  },
  {
    id: "prop-07",
    title: "Noida Sector 62 IT Hub Professional Stay",
    category: "Co-Living",
    gender: "Unisex",
    bhkConfig: "Single Bed",
    location: "Sector 62, Electronic City, Noida",
    metroDistance: "300m from Blue Line Metro",
    imageUrl:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 13000,
    expectedCommission: 6500,
    totalCommissionEarned: 45500,
    totalDealsClosed: 7,
    status: "Active",
    occupancyPercent: 88,
    totalUnits: 24,
    availableUnits: 3,
    viewsThisMonth: 275,
    leadsCount: 20,
    rating: 4.8,
    reviewsCount: 31,
    amenities: ["High-Speed WiFi", "Breakfast & Dinner", "AC", "Laundry", "Geyser", "24/7 Security"],
    caretakerName: "Pradeep Joshi",
    caretakerPhone: "+91 98710 78901",
    dateAdded: "Added 3 weeks ago",
    depositMonths: "1 Month",
  },
  {
    id: "prop-08",
    title: "Laxmi Nagar CA & UPSC Aspirants PG",
    category: "PG / Hostel",
    gender: "Boys Only",
    bhkConfig: "Double Sharing",
    location: "Laxmi Nagar Metro Pillar 42, East Delhi",
    metroDistance: "80m from Blue Line Metro",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 9000,
    expectedCommission: 4500,
    totalCommissionEarned: 36000,
    totalDealsClosed: 8,
    status: "Active",
    occupancyPercent: 94,
    totalUnits: 18,
    availableUnits: 1,
    viewsThisMonth: 310,
    leadsCount: 24,
    rating: 4.7,
    reviewsCount: 27,
    amenities: ["Silent Study Hall", "WiFi", "Homely Meals", "AC", "Library Access", "Power Backup"],
    caretakerName: "Harish Chandra",
    caretakerPhone: "+91 98118 89012",
    dateAdded: "Added 1 month ago",
    depositMonths: "₹5,000 Fixed",
  },
  {
    id: "prop-09",
    title: "Sagarpur Main Road Scholar PG For Girls",
    category: "PG / Hostel",
    gender: "Girls Only",
    bhkConfig: "Triple Sharing",
    location: "Main Road, Sagarpur West, New Delhi",
    metroDistance: "450m from Dabri Mor Metro",
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 7800,
    expectedCommission: 3900,
    totalCommissionEarned: 31200,
    totalDealsClosed: 8,
    status: "Active",
    occupancyPercent: 100,
    totalUnits: 12,
    availableUnits: 0,
    viewsThisMonth: 190,
    leadsCount: 15,
    rating: 4.8,
    reviewsCount: 19,
    amenities: ["WiFi", "3 Meals", "Biometric Entry", "Warden 24/7", "Geyser", "Filtered RO"],
    caretakerName: "Sunita Sharma",
    caretakerPhone: "+91 98119 90123",
    dateAdded: "Added 1 month ago",
    depositMonths: "1 Month",
  },
  {
    id: "prop-10",
    title: "Janakpuri Block C Premium 3BHK Builder Floor",
    category: "Flat / Floor",
    gender: "Family",
    bhkConfig: "3 BHK",
    location: "Block C, Janakpuri, New Delhi",
    metroDistance: "300m from Janakpuri West Interchange",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    monthlyRent: 38000,
    expectedCommission: 19000,
    totalCommissionEarned: 19000,
    totalDealsClosed: 1,
    status: "Under Review",
    occupancyPercent: 0,
    totalUnits: 1,
    availableUnits: 1,
    viewsThisMonth: 95,
    leadsCount: 8,
    rating: 5.0,
    reviewsCount: 4,
    amenities: ["Ultra Luxury Furnishing", "Private Terrace", "2 Stilt Car Parkings", "Modular Bar & Kitchen", "Gated Security"],
    caretakerName: "Rajinder Kapoor",
    caretakerPhone: "+91 98100 01234",
    dateAdded: "Added Yesterday",
    depositMonths: "2 Months",
  },
];

const FILTER_TABS = [
  "All (10)",
  "Active / Live",
  "Occupied",
  "Girls Only",
  "Boys Only",
  "Flats & Floors",
];

export default function BrokerPropertiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } =
    useResponsiveTheme();

  // Floating clearance above FloatingTabBar
  const floatingBottom = (insets.bottom > 0 ? insets.bottom : 10) + 76;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All (10)");
  const [selectedProperty, setSelectedProperty] = useState<BrokerManagedProperty | null>(null);

  const triggerHaptic = () => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
  };

  // Filtered Properties
  const filteredList = useMemo(() => {
    return BROKER_PROPERTIES_DATA.filter((item) => {
      // 1. Text Search
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchConfig = item.bhkConfig.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchCat && !matchConfig) return false;
      }

      // 2. Tab Filter
      if (selectedFilter === "Active / Live" && item.status !== "Active") return false;
      if (selectedFilter === "Occupied" && item.status !== "Occupied") return false;
      if (selectedFilter === "Girls Only" && item.gender !== "Girls Only") return false;
      if (selectedFilter === "Boys Only" && item.gender !== "Boys Only") return false;
      if (selectedFilter === "Flats & Floors" && item.category !== "Flat / Floor") return false;

      return true;
    });
  }, [searchQuery, selectedFilter]);

  // Overall Stats summary
  const totalListed = BROKER_PROPERTIES_DATA.length;
  const activeCount = BROKER_PROPERTIES_DATA.filter((p) => p.status === "Active").length;
  const totalLifetimeCommission = BROKER_PROPERTIES_DATA.reduce(
    (acc, curr) => acc + curr.totalCommissionEarned,
    0
  );

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* 1. Header Bar */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.xs,
            paddingBottom: spacing.sm,
          },
        ]}
      >
        <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
          <View>
            <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
              <MaterialCommunityIcons
                name="home-city"
                size={moderateScale(22)}
                color={colors.primary}
              />
              <Text
                style={[
                  typography.brandTitle,
                  {
                    fontSize: moderateScale(17),
                    fontWeight: "900",
                    color: colors.textPrimary,
                  },
                ]}
              >
                My Registered Stays
              </Text>
            </View>
            <Text
              style={{
                fontSize: moderateScale(11),
                color: colors.textSecondary,
                marginTop: 1,
              }}
            >
              {totalListed} Properties Portfolio • ₹
              {new Intl.NumberFormat("en-IN").format(totalLifetimeCommission)} Earned
            </Text>
          </View>

          {/* Quick Add Stay Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              triggerHaptic();
              router.push("/BrokerPanel/(tabs)/add" as any);
            }}
            style={[
              styles.addBtnHeader,
              {
                backgroundColor: colors.primary,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs + 2,
              },
              shadows.sm,
            ]}
          >
            <Feather
              name="plus"
              size={moderateScale(14)}
              color={colors.white}
              style={{ marginRight: 2 }}
            />
            <Text
              style={{
                fontSize: moderateScale(11.5),
                fontWeight: "800",
                color: colors.white,
              }}
            >
              Add Stay
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? colors.surfaceHover : colors.surfaceLight,
              borderColor: colors.border,
              borderRadius: radii.xl,
              marginTop: spacing.sm,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <Feather
            name="search"
            size={moderateScale(16)}
            color={colors.textMuted}
            style={{ marginRight: spacing.xs }}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by title, Dwarka, Janakpuri, 1BHK, PG..."
            placeholderTextColor={colors.textMuted}
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                fontSize: moderateScale(12.5),
              },
            ]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={moderateScale(16)}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs + 2, marginTop: spacing.sm }}
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = selectedFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => {
                  triggerHaptic();
                  setSelectedFilter(tab);
                }}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.sm + 2,
                    paddingVertical: 5,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    fontWeight: isSelected ? "800" : "600",
                    color: isSelected ? colors.white : colors.textPrimary,
                  }}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Main Properties List (10 Items) */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.md,
          paddingBottom: floatingBottom + 70,
          gap: spacing.md,
        }}
        renderItem={({ item }) => {
          const isGirls = item.gender === "Girls Only";
          const isBoys = item.gender === "Boys Only";

          return (
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => {
                triggerHaptic();
                router.push({
                  pathname: "/Screens/BrokerPanelScreens/PropertyDetailScreen",
                  params: { id: item.id },
                } as any);
              }}
              style={[
                styles.propertyCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  borderRadius: radii.xxl,
                },
                shadows.sm,
              ]}
            >
              {/* Top Banner Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[
                    styles.cardImage,
                    {
                      borderTopLeftRadius: radii.xxl,
                      borderTopRightRadius: radii.xxl,
                    },
                  ]}
                />

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === "Active"
                          ? "#059669"
                          : item.status === "Occupied"
                          ? "#0284C7"
                          : "#D97706",
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <View style={styles.statusDot} />
                  <Text style={styles.statusBadgeText}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>

                {/* Rating Badge */}
                <View
                  style={[
                    styles.ratingPill,
                    {
                      backgroundColor: "rgba(15, 23, 42, 0.82)",
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <Ionicons
                    name="star"
                    size={moderateScale(11)}
                    color="#F59E0B"
                    style={{ marginRight: 2 }}
                  />
                  <Text style={styles.ratingText}>
                    {item.rating} ({item.reviewsCount})
                  </Text>
                </View>

                {/* Date Tag */}
                <View
                  style={[
                    styles.dateTag,
                    {
                      backgroundColor: "rgba(15, 23, 42, 0.8)",
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <Text style={styles.dateTagText}>{item.dateAdded}</Text>
                </View>
              </View>

              {/* Property Details Body */}
              <View style={{ padding: spacing.md }}>
                {/* Category & Gender Pill Row */}
                <View style={[layout.horizontalView, { gap: 6, marginBottom: 4 }]}>
                  <View
                    style={[
                      styles.microBadge,
                      {
                        backgroundColor: isGirls
                          ? isDark
                            ? "rgba(244, 63, 94, 0.18)"
                            : "#FFE4E6"
                          : isBoys
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
                        fontSize: moderateScale(9.5),
                        fontWeight: "800",
                        color: isGirls ? "#E11D48" : isBoys ? "#0284C7" : "#059669",
                      }}
                    >
                      {item.gender}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.microBadge,
                      {
                        backgroundColor: isDark ? colors.surfaceHover : "#F1F5F9",
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(9.5),
                        fontWeight: "700",
                        color: colors.textSecondary,
                      }}
                    >
                      {item.bhkConfig} • {item.category}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text
                  numberOfLines={1}
                  style={[
                    typography.cardTitle,
                    {
                      fontSize: moderateScale(14.5),
                      fontWeight: "800",
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {item.title}
                </Text>

                {/* Location & Metro */}
                <View style={[layout.horizontalView, { marginTop: 2 }]}>
                  <Ionicons
                    name="location-outline"
                    size={moderateScale(13)}
                    color={colors.textSecondary}
                    style={{ marginRight: 2 }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(11.5),
                      color: colors.textSecondary,
                    }}
                  >
                    {item.location} • {item.metroDistance}
                  </Text>
                </View>

                {/* Amenities List */}
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: moderateScale(10.5),
                    color: colors.textMuted,
                    marginTop: 4,
                  }}
                >
                  ✓ {item.amenities.slice(0, 4).join(" • ")} +{item.amenities.length - 4} more
                </Text>

                {/* Divider */}
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor: colors.borderLight,
                      marginVertical: spacing.xs + 3,
                    },
                  ]}
                />

                {/* Pricing & Commission Grid */}
                <View style={layout.horizontalViewBetween}>
                  {/* Monthly Rent */}
                  <View>
                    <Text
                      style={{
                        fontSize: moderateScale(9.5),
                        color: colors.textMuted,
                        fontWeight: "600",
                      }}
                    >
                      Monthly Rent
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(15),
                        fontWeight: "900",
                        color: colors.textPrimary,
                      }}
                    >
                      ₹{item.monthlyRent.toLocaleString("en-IN")}
                      <Text
                        style={{
                          fontSize: moderateScale(10.5),
                          fontWeight: "500",
                          color: colors.textMuted,
                        }}
                      >
                        /mo
                      </Text>
                    </Text>
                  </View>

                  {/* Broker Commission Badge */}
                  <View
                    style={[
                      styles.commissionCard,
                      {
                        backgroundColor: isDark
                          ? "rgba(16, 185, 129, 0.15)"
                          : "#DCFCE7",
                        borderColor: isDark
                          ? "rgba(16, 185, 129, 0.35)"
                          : "#86EFAC",
                        borderRadius: radii.md,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(8.5),
                        fontWeight: "700",
                        color: "#15803D",
                        textAlign: "right",
                      }}
                    >
                      YOUR COMMISSION
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        fontWeight: "900",
                        color: "#15803D",
                        textAlign: "right",
                      }}
                    >
                      ₹{item.expectedCommission.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                {/* Bottom Footer: Stats & Actions */}
                <View
                  style={[
                    layout.horizontalViewBetween,
                    {
                      marginTop: spacing.xs + 3,
                      paddingTop: spacing.xs + 2,
                      borderTopWidth: 1,
                      borderTopColor: colors.borderLight,
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(10.5),
                      color: colors.textMuted,
                      fontWeight: "600",
                    }}
                  >
                    👁️ {item.viewsThisMonth} Views • 📩 {item.leadsCount} Leads •{" "}
                    {item.occupancyPercent}% Occupied
                  </Text>

                  {/* Action Buttons */}
                  <View style={[layout.horizontalView, { gap: 6 }]}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        Alert.alert(
                          "Caretaker Contact",
                          `${item.caretakerName}\nPhone: ${item.caretakerPhone}`
                        )
                      }
                      style={[
                        styles.miniBtn,
                        {
                          backgroundColor: isDark
                            ? colors.surfaceHover
                            : "#F1F5F9",
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Feather
                        name="phone"
                        size={moderateScale(12)}
                        color={colors.textPrimary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        triggerHaptic();
                        router.push({
                          pathname: "/Screens/BrokerPanelScreens/PropertyDetailScreen",
                          params: { id: item.id },
                        } as any);
                      }}
                      style={[
                        styles.manageBtn,
                        {
                          backgroundColor: colors.primary,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.sm + 2,
                          paddingVertical: 4,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          fontWeight: "800",
                          color: colors.white,
                        }}
                      >
                        Manage ↗
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View
            style={[
              layout.center,
              { marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
            ]}
          >
            <MaterialCommunityIcons
              name="home-search-outline"
              size={moderateScale(48)}
              color={colors.primary}
            />
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(16),
                  color: colors.textPrimary,
                  marginTop: spacing.sm,
                },
              ]}
            >
              No Properties Found
            </Text>
            <Text
              style={{
                fontSize: moderateScale(12),
                color: colors.textSecondary,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              Try searching by a different sector or filter tab.
            </Text>
          </View>
        }
      />

      {/* 3. Property Detail & Management Modal */}
      {selectedProperty && (
        <Modal
          visible={!!selectedProperty}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedProperty(null)}
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
              {/* Modal Top Bar */}
              <View
                style={[
                  layout.horizontalViewBetween,
                  {
                    padding: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                  },
                ]}
              >
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.sectionTitle,
                      {
                        fontSize: moderateScale(16),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {selectedProperty.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      color: colors.textSecondary,
                    }}
                  >
                    📍 {selectedProperty.location}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedProperty(null)}
                  style={[
                    styles.closeModalBtn,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceHover
                        : colors.surfaceLight,
                      borderRadius: radii.round,
                    },
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={moderateScale(20)}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}
              >
                {/* Image */}
                <Image
                  source={{ uri: selectedProperty.imageUrl }}
                  style={[
                    styles.modalImage,
                    { borderRadius: radii.xl, height: moderateScale(160) },
                  ]}
                />

                {/* Earnings & Deal History Summary */}
                <View
                  style={[
                    styles.earningsBanner,
                    {
                      backgroundColor: isDark
                        ? "rgba(16, 185, 129, 0.15)"
                        : "#DCFCE7",
                      borderColor: isDark
                        ? "rgba(16, 185, 129, 0.3)"
                        : "#86EFAC",
                      borderRadius: radii.xl,
                      marginTop: spacing.md,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <View style={layout.horizontalViewBetween}>
                    <View>
                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          color: "#15803D",
                          fontWeight: "700",
                        }}
                      >
                        Total Commission Generated:
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(20),
                          fontWeight: "900",
                          color: "#15803D",
                          marginTop: 2,
                        }}
                      >
                        ₹
                        {selectedProperty.totalCommissionEarned.toLocaleString(
                          "en-IN"
                        )}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          color: "#15803D",
                          fontWeight: "700",
                        }}
                      >
                        Deals Closed:
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(16),
                          fontWeight: "800",
                          color: "#15803D",
                          marginTop: 2,
                        }}
                      >
                        {selectedProperty.totalDealsClosed} Tenants
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Caretaker Info Card */}
                <View
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceHover
                        : colors.surfaceLight,
                      borderColor: colors.border,
                      borderRadius: radii.xl,
                      marginTop: spacing.md,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(12.5),
                      fontWeight: "800",
                      color: colors.textPrimary,
                      marginBottom: 4,
                    }}
                  >
                    👤 Property Caretaker Details
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      color: colors.textSecondary,
                    }}
                  >
                    Name: {selectedProperty.caretakerName}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Phone: {selectedProperty.caretakerPhone}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Security Deposit: {selectedProperty.depositMonths}
                  </Text>
                </View>

                {/* Amenities Chips */}
                <Text
                  style={{
                    fontSize: moderateScale(13),
                    fontWeight: "800",
                    color: colors.textPrimary,
                    marginTop: spacing.md,
                    marginBottom: spacing.xs,
                  }}
                >
                  Included Amenities & Perks:
                </Text>
                <View style={[layout.horizontalViewWrap, { gap: spacing.xs }]}>
                  {selectedProperty.amenities.map((am) => (
                    <View
                      key={am}
                      style={[
                        styles.modalAmenityPill,
                        {
                          backgroundColor: isDark
                            ? "rgba(13, 148, 136, 0.2)"
                            : colors.primaryLight,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.sm + 2,
                          paddingVertical: 4,
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
                        ✓ {am}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={[layout.horizontalView, { gap: spacing.sm, marginTop: spacing.lg }]}>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Calling Caretaker",
                        `Connecting with ${selectedProperty.caretakerName} (${selectedProperty.caretakerPhone})`
                      );
                    }}
                    style={[
                      styles.modalActionBtn,
                      {
                        backgroundColor: isDark
                          ? colors.surfaceHover
                          : colors.surfaceLight,
                        borderColor: colors.border,
                        borderRadius: radii.pill,
                        flex: 1,
                      },
                    ]}
                  >
                    <Feather
                      name="phone"
                      size={moderateScale(15)}
                      color={colors.textPrimary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(12.5),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      Call Caretaker
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        "Share Listing Link",
                        `Copied verified sharing link for ${selectedProperty.title}`
                      );
                    }}
                    style={[
                      styles.modalActionBtn,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: radii.pill,
                        flex: 1,
                      },
                    ]}
                  >
                    <Feather
                      name="share-2"
                      size={moderateScale(15)}
                      color={colors.white}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(12.5),
                        fontWeight: "800",
                        color: colors.white,
                      }}
                    >
                      Share Property
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    borderBottomWidth: 1,
  },
  addBtnHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 2,
  },
  filterPill: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  propertyCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  cardImage: {
    width: "100%",
    height: 145,
    backgroundColor: "#334155",
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#FFFFFF",
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  ratingPill: {
    position: "absolute",
    bottom: 8,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  dateTag: {
    position: "absolute",
    bottom: 8,
    right: 10,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  dateTagText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "700",
  },
  microBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  commissionCard: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  miniBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  manageBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "85%",
    borderTopWidth: 1,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalImage: {
    width: "100%",
    backgroundColor: "#334155",
  },
  earningsBanner: {
    borderWidth: 1,
  },
  infoBox: {
    borderWidth: 1,
  },
  modalAmenityPill: {},
  modalActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
  },
});