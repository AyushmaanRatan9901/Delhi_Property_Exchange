import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PropertyItem } from "../../../components/CustomerComponent/PropertyCard";
import { useResponsiveTheme } from "../../../constants/theme";

export interface ExtendedPropertyItem extends PropertyItem {
  rating: number;
  reviewsCount: number;
  metroDistance: string;
  depositMonths: string;
  gender: "Boys" | "Girls" | "Unisex" | "Any";
  sharingType: "Single" | "Double" | "Triple" | "Studio" | "1BHK";
  furnishing: "Furnished" | "Semi-Furnished";
  hasFood: boolean;
  hasAC: boolean;
}

const SEARCH_DATABASE: ExtendedPropertyItem[] = [
  {
    id: "s1",
    title: "Executive Single Room with Balcony",
    type: "Room",
    price: 9000,
    pricePeriod: "month",
    location: "Dwarka, Sector 6",
    amenities: ["Furnished", "WiFi", "Attached Bathroom", "Balcony"],
    imageUrl:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
    photosCount: 14,
    isVerified: true,
    rating: 4.9,
    reviewsCount: 38,
    metroDistance: "350m from Sec 6 Metro",
    depositMonths: "1 Month Deposit",
    gender: "Any",
    sharingType: "Single",
    furnishing: "Furnished",
    hasFood: true,
    hasAC: true,
  },
  {
    id: "s2",
    title: "Luxury Independent Room & AC",
    type: "Room",
    price: 11000,
    pricePeriod: "month",
    location: "Dwarka, Sector 9",
    amenities: ["AC", "WiFi", "Attached Washroom", "Daily Cleaning"],
    imageUrl:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
    photosCount: 16,
    isVerified: true,
    rating: 4.8,
    reviewsCount: 42,
    metroDistance: "400m from Sec 9 Metro",
    depositMonths: "Zero Deposit Deal",
    gender: "Any",
    sharingType: "Single",
    furnishing: "Furnished",
    hasFood: false,
    hasAC: true,
  },
  {
    id: "s3",
    title: "Premium Boys PG with Gym & Food",
    type: "PG",
    price: 7500,
    pricePeriod: "month",
    location: "Dwarka, Sector 12",
    amenities: ["3 Meals", "Gym", "WiFi", "Laundry", "CCTV"],
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
    photosCount: 18,
    isVerified: true,
    rating: 4.9,
    reviewsCount: 56,
    metroDistance: "200m from Sec 12 Metro",
    depositMonths: "1 Month Deposit",
    gender: "Boys",
    sharingType: "Double",
    furnishing: "Furnished",
    hasFood: true,
    hasAC: true,
  },
  {
    id: "s4",
    title: "Safe & Secure Girls Co-living PG",
    type: "PG",
    price: 8500,
    pricePeriod: "month",
    location: "Dwarka, Sector 10",
    amenities: ["3 Homely Meals", "24/7 Security", "AC", "WiFi"],
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
    photosCount: 22,
    isVerified: true,
    rating: 5.0,
    reviewsCount: 64,
    metroDistance: "500m from Sec 10 Metro",
    depositMonths: "1 Month Deposit",
    gender: "Girls",
    sharingType: "Double",
    furnishing: "Furnished",
    hasFood: true,
    hasAC: true,
  },
  {
    id: "s5",
    title: "Modern Studio Apartment & Modular Kitchen",
    type: "Room",
    price: 14500,
    pricePeriod: "month",
    location: "Janakpuri West",
    amenities: ["Modular Kitchen", "Power Backup", "Smart TV", "Balcony"],
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80",
    photosCount: 20,
    isVerified: true,
    rating: 4.8,
    reviewsCount: 29,
    metroDistance: "600m from Janakpuri Metro",
    depositMonths: "1 Month Deposit",
    gender: "Any",
    sharingType: "Studio",
    furnishing: "Furnished",
    hasFood: false,
    hasAC: true,
  },
  {
    id: "s6",
    title: "Budget Student Double Sharing Room",
    type: "PG",
    price: 5200,
    pricePeriod: "month",
    location: "Sagarpur, Delhi",
    amenities: ["High Speed WiFi", "RO Water", "Study Table"],
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
    photosCount: 11,
    isVerified: true,
    rating: 4.6,
    reviewsCount: 24,
    metroDistance: "1.2 km from Metro",
    depositMonths: "Zero Brokerage",
    gender: "Boys",
    sharingType: "Double",
    furnishing: "Semi-Furnished",
    hasFood: false,
    hasAC: false,
  },
];

export default function SearchScreen() {
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
    isTablet,
  } = useResponsiveTheme();

  const { width: windowWidth } = useWindowDimensions();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | "Room" | "PG">(
    "All",
  );
  const [selectedGender, setSelectedGender] = useState<
    "All" | "Boys" | "Girls" | "Unisex"
  >("All");
  const [selectedSharing, setSelectedSharing] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(25000);
  const [onlyVerified, setOnlyVerified] = useState(true);
  const [foodIncludedOnly, setFoodIncludedOnly] = useState(false);
  const [acOnly, setAcOnly] = useState(false);
  const [sortBy, setSortBy] = useState<
    "recommended" | "price_low" | "price_high" | "rating"
  >("recommended");

  // UI View state
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExtendedPropertyItem | null>(
    null,
  );
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    s1: true,
    s4: true,
  });

  const numGridCols = isTablet ? 3 : 2;
  const gridGap = spacing.md;
  const horizontalPadding = spacing.screenHorizontal;
  const gridCardWidth = Math.floor(
    (windowWidth - horizontalPadding * 2 - (numGridCols - 1) * gridGap) /
      numGridCols,
  );

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return SEARCH_DATABASE.filter((item) => {
      // Query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchAmenities = item.amenities.some((a) =>
          a.toLowerCase().includes(q),
        );
        if (!matchTitle && !matchLoc && !matchAmenities) return false;
      }

      // Type filter
      if (selectedType !== "All" && item.type !== selectedType) return false;

      // Gender filter
      if (
        selectedGender !== "All" &&
        item.gender !== "Any" &&
        item.gender !== selectedGender
      )
        return false;

      // Sharing filter
      if (selectedSharing !== "All" && item.sharingType !== selectedSharing)
        return false;

      // Max price
      if (item.price > maxPrice) return false;

      // Verified
      if (onlyVerified && !item.isVerified) return false;

      // Food
      if (foodIncludedOnly && !item.hasFood) return false;

      // AC
      if (acOnly && !item.hasAC) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [
    searchQuery,
    selectedType,
    selectedGender,
    selectedSharing,
    maxPrice,
    onlyVerified,
    foodIncludedOnly,
    acOnly,
    sortBy,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== "All") count++;
    if (selectedGender !== "All") count++;
    if (selectedSharing !== "All") count++;
    if (maxPrice < 25000) count++;
    if (foodIncludedOnly) count++;
    if (acOnly) count++;
    return count;
  }, [
    selectedType,
    selectedGender,
    selectedSharing,
    maxPrice,
    foodIncludedOnly,
    acOnly,
  ]);

  const resetFilters = () => {
    setSelectedType("All");
    setSelectedGender("All");
    setSelectedSharing("All");
    setMaxPrice(25000);
    setFoodIncludedOnly(false);
    setAcOnly(false);
    setSortBy("recommended");
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

      {/* Top Fixed Header with Search Box */}
      <View
        style={[
          styles.headerWrapper,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.xs,
            paddingBottom: spacing.sm,
          },
        ]}
      >
        {/* Search Input Bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark ? colors.surfaceHover : "#F8FAFC",
              borderColor: colors.border,
              borderRadius: radii.xl,
              paddingHorizontal: spacing.md,
            },
          ]}
        >
          <Feather
            name="search"
            size={moderateScale(18)}
            color={colors.primary}
            style={{ marginRight: spacing.sm }}
          />
          <TextInput
            placeholder="Search sector, area, metro, PG name..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.searchInput,
              { color: colors.textPrimary, fontSize: moderateScale(13.5) },
            ]}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={{ padding: 4 }}
            >
              <Ionicons
                name="close-circle"
                size={moderateScale(18)}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Voice Search",
                  "Listening for location or stay name...",
                )
              }
              style={{ padding: 4 }}
            >
              <Feather
                name="mic"
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Horizontal Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.xs + 2, marginTop: spacing.sm }}
        >
          {/* Main Filter Modal Trigger Button */}
          <TouchableOpacity
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.8}
            style={[
              styles.filterPillBtn,
              {
                backgroundColor:
                  activeFiltersCount > 0
                    ? colors.primary
                    : isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                borderColor:
                  activeFiltersCount > 0 ? colors.primary : colors.border,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs + 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={moderateScale(15)}
              color={activeFiltersCount > 0 ? colors.white : colors.textPrimary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: moderateScale(11.5),
                fontWeight: "700",
                color:
                  activeFiltersCount > 0 ? colors.white : colors.textPrimary,
              }}
            >
              Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}
            </Text>
          </TouchableOpacity>

          {/* Sort By Pill */}
          <TouchableOpacity
            onPress={() => setSortModalVisible(true)}
            activeOpacity={0.8}
            style={[
              styles.filterPillBtn,
              {
                backgroundColor: isDark
                  ? colors.surfaceHover
                  : colors.surfaceLight,
                borderColor: colors.border,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs + 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="sort"
              size={moderateScale(15)}
              color={colors.primary}
              style={{ marginRight: 3 }}
            />
            <Text
              style={{
                fontSize: moderateScale(11.5),
                fontWeight: "600",
                color: colors.textPrimary,
              }}
            >
              {sortBy === "price_low"
                ? "Price: Low"
                : sortBy === "price_high"
                  ? "Price: High"
                  : sortBy === "rating"
                    ? "Top Rated"
                    : "Recommended"}
            </Text>
            <Feather
              name="chevron-down"
              size={moderateScale(14)}
              color={colors.textSecondary}
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>

          {/* Type Selector (Room / PG) */}
          {(["All", "Room", "PG"] as const).map((type) => {
            const isSelected = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                activeOpacity={0.8}
                style={[
                  styles.filterPillBtn,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryLight
                      : isDark
                        ? colors.surfaceHover
                        : colors.surfaceLight,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.sm + 2,
                    paddingVertical: spacing.xs + 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11.5),
                    fontWeight: isSelected ? "700" : "500",
                    color: isSelected ? colors.primary : colors.textSecondary,
                  }}
                >
                  {type === "All" ? "All Types" : type}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Gender Filter Chips */}
          {(["Boys", "Girls", "Unisex"] as const).map((g) => {
            const isSelected = selectedGender === g;
            return (
              <TouchableOpacity
                key={g}
                onPress={() => setSelectedGender(isSelected ? "All" : g)}
                activeOpacity={0.8}
                style={[
                  styles.filterPillBtn,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryLight
                      : isDark
                        ? colors.surfaceHover
                        : colors.surfaceLight,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.sm + 2,
                    paddingVertical: spacing.xs + 1,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11.5),
                    fontWeight: isSelected ? "700" : "500",
                    color: isSelected ? colors.primary : colors.textSecondary,
                  }}
                >
                  {g === "Boys"
                    ? "👦 Boys Only"
                    : g === "Girls"
                      ? "👧 Girls Safe"
                      : "👥 Co-Living"}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Food Included Toggle Chip */}
          <TouchableOpacity
            onPress={() => setFoodIncludedOnly(!foodIncludedOnly)}
            activeOpacity={0.8}
            style={[
              styles.filterPillBtn,
              {
                backgroundColor: foodIncludedOnly
                  ? colors.primaryLight
                  : isDark
                    ? colors.surfaceHover
                    : colors.surfaceLight,
                borderColor: foodIncludedOnly ? colors.primary : colors.border,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.sm + 2,
                paddingVertical: spacing.xs + 1,
              },
            ]}
          >
            <Text
              style={{
                fontSize: moderateScale(11.5),
                fontWeight: foodIncludedOnly ? "700" : "500",
                color: foodIncludedOnly ? colors.primary : colors.textSecondary,
              }}
            >
              🍲 Meals Included
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Results Header: Count & View Switcher */}
      <View
        style={[
          layout.horizontalViewBetween,
          {
            paddingHorizontal: spacing.screenHorizontal,
            paddingVertical: spacing.xs + 2,
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text
          style={{
            fontSize: moderateScale(12.5),
            fontWeight: "700",
            color: colors.textPrimary,
          }}
        >
          {filteredProperties.length} Verified Stays Found
        </Text>

        <View style={layout.horizontalView}>
          <TouchableOpacity
            onPress={() => setViewMode("list")}
            style={[
              styles.viewToggleBtn,
              {
                backgroundColor:
                  viewMode === "list" ? colors.primaryLight : "transparent",
                borderRadius: radii.sm,
                padding: 4,
                marginRight: 4,
              },
            ]}
          >
            <MaterialIcons
              name="view-agenda"
              size={moderateScale(18)}
              color={viewMode === "list" ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode("grid")}
            style={[
              styles.viewToggleBtn,
              {
                backgroundColor:
                  viewMode === "grid" ? colors.primaryLight : "transparent",
                borderRadius: radii.sm,
                padding: 4,
              },
            ]}
          >
            <MaterialIcons
              name="grid-view"
              size={moderateScale(18)}
              color={viewMode === "grid" ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Results Listing */}
      <FlatList
        data={filteredProperties}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === "grid" ? numGridCols : 1}
        key={viewMode === "grid" ? `grid-view-${numGridCols}` : "list-view"}
        columnWrapperStyle={
          viewMode === "grid" ? [styles.gridRow, { gap: gridGap }] : undefined
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: spacing.screenHorizontal,
            paddingBottom: spacing.xxxl + 70,
            gap: spacing.md,
          },
        ]}
        renderItem={({ item }) => {
          const isFav = favorites[item.id] || false;

          // 1. Grid View Card Layout
          if (viewMode === "grid") {
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname:
                      "/CusomterPanelScreens/PropertyDeatilScreeen/[id]",
                    params: { id: item.id },
                  } as any)
                }
                style={[
                  styles.gridCard,
                  {
                    width: gridCardWidth,
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                  shadows.sm,
                ]}
              >
                <View style={styles.gridImageWrapper}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={[styles.gridImage, { height: moderateScale(130) }]}
                  />
                  <TouchableOpacity
                    onPress={() => toggleFavorite(item.id)}
                    style={[
                      styles.gridFavBtn,
                      {
                        backgroundColor: isDark
                          ? "rgba(15, 23, 42, 0.85)"
                          : "rgba(255, 255, 255, 0.92)",
                      },
                    ]}
                  >
                    <Ionicons
                      name={isFav ? "heart" : "heart-outline"}
                      size={moderateScale(15)}
                      color={isFav ? colors.favoriteRed : "#64748B"}
                    />
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.gridRatingBadge,
                      { backgroundColor: "rgba(15, 23, 42, 0.8)" },
                    ]}
                  >
                    <Ionicons
                      name="star"
                      size={moderateScale(10)}
                      color="#FBBF24"
                      style={{ marginRight: 2 }}
                    />
                    <Text style={styles.gridRatingText}>{item.rating}</Text>
                  </View>
                </View>

                <View style={{ padding: spacing.sm }}>
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(12.5),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.cardLocation,
                      {
                        fontSize: moderateScale(11),
                        color: colors.textSecondary,
                        marginTop: 1,
                      },
                    ]}
                  >
                    📍 {item.location}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(10),
                      color: colors.primary,
                      fontWeight: "600",
                      marginTop: 1,
                    }}
                  >
                    🚇 {item.metroDistance}
                  </Text>

                  <View
                    style={[
                      layout.horizontalViewBetween,
                      { marginTop: spacing.xs },
                    ]}
                  >
                    <Text
                      style={[
                        typography.cardPrice,
                        {
                          fontSize: moderateScale(13.5),
                          color: colors.priceGreen,
                        },
                      ]}
                    >
                      ₹{new Intl.NumberFormat("en-IN").format(item.price)}
                      <Text style={{ fontSize: moderateScale(10.5) }}>/mo</Text>
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }

          // 2. Full-Width Premium List Card Layout
          return (
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                router.push({
                  pathname: "/CusomterPanelScreens/PropertyDeatilScreeen/[id]",
                  params: { id: item.id },
                } as any)
              }
              style={[
                styles.listCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  borderRadius: radii.xxl,
                },
                shadows.card,
              ]}
            >
              {/* Image & Photo Count */}
              <View style={styles.listImageWrapper}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[
                    styles.listImage,
                    {
                      height: moderateScale(175),
                      borderTopLeftRadius: radii.xxl,
                      borderTopRightRadius: radii.xxl,
                    },
                  ]}
                />

                {/* Verified Badge */}
                {item.isVerified && (
                  <View
                    style={[
                      styles.verifiedPill,
                      {
                        backgroundColor: colors.verifiedGreenDark,
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={moderateScale(12)}
                      color={colors.white}
                      style={{ marginRight: 3 }}
                    />
                    <Text style={styles.verifiedPillText}>Verified</Text>
                  </View>
                )}

                {/* Favorite Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleFavorite(item.id)}
                  style={[
                    styles.listFavBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(15, 23, 42, 0.85)"
                        : "rgba(255, 255, 255, 0.95)",
                      borderRadius: radii.round,
                    },
                  ]}
                >
                  <Ionicons
                    name={isFav ? "heart" : "heart-outline"}
                    size={moderateScale(18)}
                    color={
                      isFav
                        ? colors.favoriteRed
                        : isDark
                          ? "#E2E8F0"
                          : "#334155"
                    }
                  />
                </TouchableOpacity>

                {/* Rating & Photos Badges on bottom */}
                <View style={styles.bottomImageRow}>
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
                      color="#FBBF24"
                      style={{ marginRight: 3 }}
                    />
                    <Text style={styles.ratingPillText}>
                      {item.rating} ({item.reviewsCount})
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.photoCountPill,
                      {
                        backgroundColor: "rgba(15, 23, 42, 0.82)",
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Feather
                      name="image"
                      size={moderateScale(11)}
                      color={colors.white}
                      style={{ marginRight: 3 }}
                    />
                    <Text style={styles.photoCountText}>
                      {item.photosCount} Photos
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card Content & Details */}
              <View style={{ padding: spacing.md }}>
                {/* Gender / Sharing Badge row */}
                <View
                  style={[layout.horizontalView, { marginBottom: 3, gap: 6 }]}
                >
                  <View
                    style={[
                      styles.subBadge,
                      {
                        backgroundColor:
                          item.gender === "Girls"
                            ? colors.roomPinkLight
                            : colors.pgBlueLight,
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(10),
                        fontWeight: "700",
                        color:
                          item.gender === "Girls"
                            ? colors.roomPink
                            : colors.pgBlue,
                      }}
                    >
                      {item.gender === "Girls"
                        ? "👧 Girls Only"
                        : item.gender === "Boys"
                          ? "👦 Boys Only"
                          : "👥 Unisex Co-living"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.subBadge,
                      {
                        backgroundColor: isDark
                          ? colors.surfaceHover
                          : "#F1F5F9",
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(10),
                        fontWeight: "600",
                        color: colors.textSecondary,
                      }}
                    >
                      {item.sharingType} Room
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.subBadge,
                      { backgroundColor: "#ECFDF5", borderRadius: radii.pill },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(10),
                        fontWeight: "700",
                        color: "#059669",
                      }}
                    >
                      {item.depositMonths}
                    </Text>
                  </View>
                </View>

                {/* Title */}
                <Text
                  numberOfLines={1}
                  style={[
                    typography.cardTitle,
                    { fontSize: moderateScale(15), color: colors.textPrimary },
                  ]}
                >
                  {item.title}
                </Text>

                {/* Location & Metro Distance */}
                <View style={[layout.horizontalView, { marginTop: 3 }]}>
                  <Ionicons
                    name="location-outline"
                    size={moderateScale(14)}
                    color={colors.textSecondary}
                    style={{ marginRight: 2 }}
                  />
                  <Text
                    style={[
                      typography.cardLocation,
                      {
                        fontSize: moderateScale(12),
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {item.location}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      color: colors.primary,
                      fontWeight: "600",
                      marginLeft: 6,
                    }}
                  >
                    • 🚇 {item.metroDistance}
                  </Text>
                </View>

                {/* Amenities Line */}
                <Text
                  numberOfLines={1}
                  style={[
                    typography.cardAmenity,
                    {
                      fontSize: moderateScale(11),
                      color: colors.textMuted,
                      marginTop: 4,
                    },
                  ]}
                >
                  {item.amenities.join(" • ")}
                </Text>

                {/* Divider */}
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor: colors.borderLight,
                      marginVertical: spacing.sm,
                    },
                  ]}
                />

                {/* Price & Action Buttons Row */}
                <View style={layout.horizontalViewBetween}>
                  <View>
                    <View style={layout.horizontalView}>
                      <Text
                        style={[
                          typography.cardPrice,
                          {
                            fontSize: moderateScale(17),
                            color: colors.priceGreen,
                          },
                        ]}
                      >
                        ₹{new Intl.NumberFormat("en-IN").format(item.price)}
                      </Text>
                      <Text
                        style={[
                          typography.cardPriceUnit,
                          {
                            fontSize: moderateScale(11.5),
                            color: colors.priceGreen,
                          },
                        ]}
                      >
                        {" "}
                        / {item.pricePeriod}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: moderateScale(10),
                        color: colors.textMuted,
                        fontWeight: "500",
                      }}
                    >
                      Zero Brokerage Fee
                    </Text>
                  </View>

                  <View
                    style={[layout.horizontalView, { gap: spacing.xs + 2 }]}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert(
                          "Calling Caretaker",
                          `Connecting to dedicated caretaker for ${item.title}`,
                        )
                      }
                      activeOpacity={0.8}
                      style={[
                        styles.callCaretakerBtn,
                        {
                          backgroundColor: isDark
                            ? colors.surfaceHover
                            : colors.surfaceLight,
                          borderColor: colors.border,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs + 2,
                        },
                      ]}
                    >
                      <Feather
                        name="phone"
                        size={moderateScale(13)}
                        color={colors.textPrimary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setSelectedItem(item)}
                      activeOpacity={0.85}
                      style={[
                        styles.bookVisitBtn,
                        {
                          backgroundColor: colors.primary,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs + 2,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(12),
                          fontWeight: "700",
                          color: colors.white,
                        }}
                      >
                        Book Visit
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
              { marginTop: spacing.xxxl, paddingHorizontal: spacing.xl },
            ]}
          >
            <View
              style={[
                styles.emptyIconBox,
                {
                  width: moderateScale(70),
                  height: moderateScale(70),
                  borderRadius: moderateScale(35),
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="home-search-outline"
                size={moderateScale(38)}
                color={colors.primary}
              />
            </View>
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(17),
                  color: colors.textPrimary,
                  marginTop: spacing.md,
                  textAlign: "center",
                },
              ]}
            >
              No Stays Found Matching Filters
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
              Try broadening your budget or exploring other sectors in Dwarka &
              Delhi NCR
            </Text>

            <TouchableOpacity
              onPress={resetFilters}
              activeOpacity={0.8}
              style={[
                styles.resetBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.lg,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: moderateScale(13),
                  fontWeight: "700",
                }}
              >
                Reset All Filters
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Comprehensive Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
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
            {/* Modal Header */}
            <View
              style={[
                layout.horizontalViewBetween,
                styles.modalHeader,
                { borderBottomColor: colors.borderLight, padding: spacing.lg },
              ]}
            >
              <Text
                style={[
                  typography.sectionTitle,
                  { fontSize: moderateScale(18), color: colors.textPrimary },
                ]}
              >
                Filter Stays
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={moderateScale(24)}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                padding: spacing.lg,
                paddingBottom: spacing.xxl,
              }}
            >
              {/* Property Category */}
              <Text
                style={[
                  typography.cardTitle,
                  {
                    fontSize: moderateScale(14),
                    color: colors.textPrimary,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                Property Category
              </Text>
              <View
                style={[
                  layout.horizontalView,
                  { gap: spacing.sm, marginBottom: spacing.lg },
                ]}
              >
                {(["All", "Room", "PG"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setSelectedType(t)}
                    style={[
                      styles.modalOptionPill,
                      {
                        backgroundColor:
                          selectedType === t
                            ? colors.primary
                            : colors.surfaceHover,
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs + 2,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          selectedType === t
                            ? colors.white
                            : colors.textPrimary,
                        fontWeight: "700",
                        fontSize: moderateScale(12),
                      }}
                    >
                      {t === "All" ? "All Stays" : t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Gender Preference */}
              <Text
                style={[
                  typography.cardTitle,
                  {
                    fontSize: moderateScale(14),
                    color: colors.textPrimary,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                Gender Community
              </Text>
              <View
                style={[
                  layout.horizontalView,
                  {
                    gap: spacing.sm,
                    marginBottom: spacing.lg,
                    flexWrap: "wrap",
                  },
                ]}
              >
                {(["All", "Boys", "Girls", "Unisex"] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setSelectedGender(g)}
                    style={[
                      styles.modalOptionPill,
                      {
                        backgroundColor:
                          selectedGender === g
                            ? colors.primary
                            : colors.surfaceHover,
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.xs + 2,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          selectedGender === g
                            ? colors.white
                            : colors.textPrimary,
                        fontWeight: "700",
                        fontSize: moderateScale(12),
                      }}
                    >
                      {g === "All"
                        ? "Any"
                        : g === "Boys"
                          ? "👦 Boys Only"
                          : g === "Girls"
                            ? "👧 Girls Safe"
                            : "👥 Co-Living"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sharing Type */}
              <Text
                style={[
                  typography.cardTitle,
                  {
                    fontSize: moderateScale(14),
                    color: colors.textPrimary,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                Room Sharing Type
              </Text>
              <View
                style={[
                  layout.horizontalView,
                  {
                    gap: spacing.sm,
                    marginBottom: spacing.lg,
                    flexWrap: "wrap",
                  },
                ]}
              >
                {["All", "Single", "Double", "Triple", "Studio", "1BHK"].map(
                  (st) => (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setSelectedSharing(st)}
                      style={[
                        styles.modalOptionPill,
                        {
                          backgroundColor:
                            selectedSharing === st
                              ? colors.primary
                              : colors.surfaceHover,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs + 2,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            selectedSharing === st
                              ? colors.white
                              : colors.textPrimary,
                          fontWeight: "700",
                          fontSize: moderateScale(12),
                        }}
                      >
                        {st === "All" ? "Any Sharing" : `${st} Room`}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {/* Toggles */}
              <Text
                style={[
                  typography.cardTitle,
                  {
                    fontSize: moderateScale(14),
                    color: colors.textPrimary,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                Key Amenities
              </Text>
              <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
                <TouchableOpacity
                  onPress={() => setFoodIncludedOnly(!foodIncludedOnly)}
                  style={[
                    layout.horizontalViewBetween,
                    styles.toggleRow,
                    {
                      borderColor: colors.borderLight,
                      paddingVertical: spacing.xs,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    🍲 3-Time Food / Meals Included
                  </Text>
                  <Ionicons
                    name={foodIncludedOnly ? "checkbox" : "square-outline"}
                    size={moderateScale(22)}
                    color={foodIncludedOnly ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAcOnly(!acOnly)}
                  style={[
                    layout.horizontalViewBetween,
                    styles.toggleRow,
                    {
                      borderColor: colors.borderLight,
                      paddingVertical: spacing.xs,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    ❄️ Air Conditioned (AC) Room
                  </Text>
                  <Ionicons
                    name={acOnly ? "checkbox" : "square-outline"}
                    size={moderateScale(22)}
                    color={acOnly ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setOnlyVerified(!onlyVerified)}
                  style={[
                    layout.horizontalViewBetween,
                    styles.toggleRow,
                    {
                      borderColor: colors.borderLight,
                      paddingVertical: spacing.xs,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    🛡️ Verified Landlords Only
                  </Text>
                  <Ionicons
                    name={onlyVerified ? "checkbox" : "square-outline"}
                    size={moderateScale(22)}
                    color={onlyVerified ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View
                style={[
                  layout.horizontalView,
                  { gap: spacing.md, marginTop: spacing.md },
                ]}
              >
                <TouchableOpacity
                  onPress={resetFilters}
                  style={[
                    styles.modalResetBtn,
                    {
                      borderColor: colors.border,
                      borderRadius: radii.pill,
                      paddingVertical: spacing.md,
                      flex: 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: moderateScale(13),
                      color: colors.textSecondary,
                      fontWeight: "700",
                    }}
                  >
                    Reset All
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFilterModalVisible(false)}
                  style={[
                    styles.modalApplyBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radii.pill,
                      paddingVertical: spacing.md,
                      flex: 2,
                    },
                  ]}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: moderateScale(13),
                      color: colors.white,
                      fontWeight: "700",
                    }}
                  >
                    Show {filteredProperties.length} Stays
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sort By Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.sortModalBox,
              {
                backgroundColor: colors.cardBackground,
                borderRadius: radii.xxl,
                padding: spacing.lg,
                borderColor: colors.border,
              },
              shadows.floating,
            ]}
          >
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(16),
                  color: colors.textPrimary,
                  marginBottom: spacing.md,
                },
              ]}
            >
              Sort Properties By
            </Text>

            {[
              { id: "recommended", label: "⭐ Recommended & Popular" },
              { id: "price_low", label: "💵 Price: Low to High" },
              { id: "price_high", label: "💎 Price: High to Low" },
              { id: "rating", label: "🏆 Highest Rated (4.8+)" },
            ].map((s) => {
              const active = sortBy === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => {
                    setSortBy(s.id as any);
                    setSortModalVisible(false);
                  }}
                  style={[
                    layout.horizontalViewBetween,
                    {
                      paddingVertical: spacing.sm + 2,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.borderLight,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(13.5),
                      fontWeight: active ? "700" : "500",
                      color: active ? colors.primary : colors.textPrimary,
                    }}
                  >
                    {s.label}
                  </Text>
                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={moderateScale(20)}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Property Inspection Detail Modal */}
      {selectedItem && (
        <Modal
          visible={Boolean(selectedItem)}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.detailModalContent,
                {
                  backgroundColor: colors.cardBackground,
                  borderTopLeftRadius: radii.xxl,
                  borderTopRightRadius: radii.xxl,
                  borderColor: colors.border,
                },
              ]}
            >
              <Image
                source={{ uri: selectedItem.imageUrl }}
                style={[
                  styles.detailModalImage,
                  { height: moderateScale(210) },
                ]}
              />

              <TouchableOpacity
                onPress={() => setSelectedItem(null)}
                style={styles.detailCloseBtn}
              >
                <Ionicons
                  name="close-circle"
                  size={moderateScale(30)}
                  color="rgba(255, 255, 255, 0.9)"
                />
              </TouchableOpacity>

              <ScrollView
                contentContainerStyle={{
                  padding: spacing.lg,
                  paddingBottom: spacing.xxxl,
                }}
              >
                <View
                  style={[layout.horizontalViewBetween, { marginBottom: 4 }]}
                >
                  <Text
                    style={[
                      typography.sectionTitle,
                      {
                        fontSize: moderateScale(18),
                        color: colors.textPrimary,
                        flex: 1,
                      },
                    ]}
                  >
                    {selectedItem.title}
                  </Text>
                  <View
                    style={[
                      layout.horizontalView,
                      styles.ratingPillSmall,
                      { backgroundColor: "#FEF3C7" },
                    ]}
                  >
                    <Ionicons
                      name="star"
                      size={moderateScale(12)}
                      color="#D97706"
                      style={{ marginRight: 2 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(12),
                        fontWeight: "700",
                        color: "#D97706",
                      }}
                    >
                      {selectedItem.rating}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    typography.cardPrice,
                    {
                      fontSize: moderateScale(20),
                      color: colors.priceGreen,
                      marginBottom: 2,
                    },
                  ]}
                >
                  ₹{new Intl.NumberFormat("en-IN").format(selectedItem.price)}{" "}
                  <Text style={{ fontSize: moderateScale(13) }}>
                    / {selectedItem.pricePeriod}
                  </Text>
                </Text>
                <Text
                  style={[
                    typography.cardLocation,
                    {
                      fontSize: moderateScale(13),
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  📍 {selectedItem.location} • 🚇 {selectedItem.metroDistance}
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
                      fontSize: moderateScale(14),
                      color: colors.textPrimary,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Included Amenities & Perks:
                </Text>
                <View
                  style={[
                    layout.horizontalViewWrap,
                    { gap: spacing.xs, marginBottom: spacing.lg },
                  ]}
                >
                  {selectedItem.amenities.map((am) => (
                    <View
                      key={am}
                      style={[
                        styles.amenityChip,
                        {
                          backgroundColor: colors.surfaceHover,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: 4,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(11.5),
                          color: colors.textPrimary,
                          fontWeight: "500",
                        }}
                      >
                        ✓ {am}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Visit Scheduled!",
                      `Free in-person visit requested for ${selectedItem.title}. Caretaker will call you.`,
                    );
                    setSelectedItem(null);
                  }}
                  activeOpacity={0.85}
                  style={[
                    styles.confirmBookBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radii.pill,
                      paddingVertical: spacing.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: moderateScale(14),
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    Schedule Free Visit Now
                  </Text>
                </TouchableOpacity>
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
  headerWrapper: {
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 5,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
  },
  filterPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  viewToggleBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {},
  gridRow: {
    justifyContent: "space-between",
  },
  gridCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  gridImageWrapper: {
    position: "relative",
    width: "100%",
  },
  gridImage: {
    width: "100%",
    backgroundColor: "#334155",
  },
  gridFavBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  gridRatingBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gridRatingText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  listCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  listImageWrapper: {
    position: "relative",
    width: "100%",
  },
  listImage: {
    width: "100%",
    backgroundColor: "#334155",
  },
  verifiedPill: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedPillText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11,
  },
  listFavBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomImageRow: {
    position: "absolute",
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  photoCountPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  subBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  callCaretakerBtn: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bookVisitBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 15, 25, 0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "85%",
    borderTopWidth: 1,
  },
  modalHeader: {
    borderBottomWidth: 1,
  },
  modalOptionPill: {},
  toggleRow: {
    borderBottomWidth: 1,
  },
  modalResetBtn: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalApplyBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  sortModalBox: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderWidth: 1,
  },
  detailModalContent: {
    maxHeight: "85%",
    borderTopWidth: 1,
  },
  detailModalImage: {
    width: "100%",
  },
  detailCloseBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },
  ratingPillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  amenityChip: {},
  confirmBookBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
