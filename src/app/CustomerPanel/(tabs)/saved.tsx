import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PropertyItem } from "../../../components/CustomerComponent/PropertyCard";
import { useResponsiveTheme } from "../../../constants/theme";

interface SavedPropertyItem extends PropertyItem {
  rating: number;
  reviewsCount: number;
  metroDistance: string;
  originalPrice?: number;
  dealTag?: string;
  depositTerms: string;
  foodIncluded: boolean;
  sharingType: string;
  category: "Room" | "PG";
}

const INITIAL_SAVED_STAYS: SavedPropertyItem[] = [
  {
    id: "save-1",
    title: "Executive Single Room with Balcony",
    type: "Room",
    category: "Room",
    price: 9000,
    originalPrice: 9800,
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
    dealTag: "🔥 ₹800 Price Drop",
    depositTerms: "1 Month Deposit",
    foodIncluded: true,
    sharingType: "Single Private",
  },
  {
    id: "save-2",
    title: "Safe & Secure Girls Co-living PG",
    type: "PG",
    category: "PG",
    price: 8500,
    originalPrice: 9000,
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
    dealTag: "⭐ 100% Zero Brokerage",
    depositTerms: "1 Month Deposit",
    foodIncluded: true,
    sharingType: "Double Sharing",
  },
  {
    id: "save-3",
    title: "Luxury Independent Room & AC",
    type: "Room",
    category: "Room",
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
    dealTag: "⚡ Instant Move-in",
    depositTerms: "Zero Deposit Deal",
    foodIncluded: false,
    sharingType: "Single Private",
  },
  {
    id: "save-4",
    title: "Premium Boys PG with Gym & Food",
    type: "PG",
    category: "PG",
    price: 7500,
    originalPrice: 8000,
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
    dealTag: "🥘 3 Meals Included",
    depositTerms: "1 Month Deposit",
    foodIncluded: true,
    sharingType: "Double Sharing",
  },
];

export default function SavedScreen() {
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

  // State Management
  const [savedStays, setSavedStays] =
    useState<SavedPropertyItem[]>(INITIAL_SAVED_STAYS);
  const [activeFolder, setActiveFolder] = useState<"All" | "Room" | "PG">(
    "All",
  );
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [selectedItemForVisit, setSelectedItemForVisit] =
    useState<SavedPropertyItem | null>(null);

  // Dynamic Grid Width Calculation for Symmetrical Spacing
  const numGridCols = isTablet ? 3 : 2;
  const gridGap = spacing.md;
  const horizontalPadding = spacing.screenHorizontal;
  const gridCardWidth = Math.floor(
    (windowWidth - horizontalPadding * 2 - (numGridCols - 1) * gridGap) /
      numGridCols,
  );

  // Filtered List based on Folder Tabs
  const filteredStays = useMemo(() => {
    if (activeFolder === "All") return savedStays;
    return savedStays.filter((s) => s.category === activeFolder);
  }, [savedStays, activeFolder]);

  // Handlers
  const handleRemoveFromWishlist = (id: string, title: string) => {
    Alert.alert("Remove from Saved", `Remove "${title}" from your wishlist?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setSavedStays((prev) => prev.filter((item) => item.id !== id));
          setSelectedForCompare((prev) =>
            prev.filter((itemKey) => itemKey !== id),
          );
        },
      },
    ]);
  };

  const handleShareWishlist = async () => {
    try {
      await Share.share({
        message: `Check out my shortlisted stays on Delhi Property Exchange with Zero Brokerage: https://delhipropertyexchange.com/wishlist`,
      });
    } catch (error) {
      console.log("Error sharing wishlist:", error);
    }
  };

  const handleToggleCompare = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedForCompare.length >= 2) {
        Alert.alert(
          "Compare Limit",
          "You can compare maximum 2 properties at a time.",
        );
        return;
      }
      setSelectedForCompare((prev) => [...prev, id]);
    }
  };

  const comparedProperties = useMemo(() => {
    return savedStays.filter((s) => selectedForCompare.includes(s.id));
  }, [savedStays, selectedForCompare]);

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
                Saved Stays
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
                  {savedStays.length}
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
              Your bookmarked rooms & coliving PGs
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={[layout.horizontalView, { gap: spacing.xs }]}>
            <TouchableOpacity
              onPress={handleShareWishlist}
              activeOpacity={0.8}
              style={[
                styles.headerActionBtn,
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
                name="share-2"
                size={moderateScale(14)}
                color={colors.textPrimary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(11.5),
                  fontWeight: "600",
                  color: colors.textPrimary,
                }}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Folder / Category Chips & List/Grid View Switcher */}
        <View style={[layout.horizontalViewBetween, { marginTop: spacing.md }]}>
          {/* Folders */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.xs + 2 }}
          >
            {[
              { id: "All", label: "All Saved", count: savedStays.length },
              {
                id: "Room",
                label: "Rooms",
                count: savedStays.filter((s) => s.category === "Room").length,
              },
              {
                id: "PG",
                label: "PGs",
                count: savedStays.filter((s) => s.category === "PG").length,
              },
            ].map((f) => {
              const isActive = activeFolder === f.id;

              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setActiveFolder(f.id as any)}
                  activeOpacity={0.8}
                  style={[
                    styles.folderPill,
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
                    {f.label} ({f.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* List View & Grid View Buttons */}
          <View
            style={[
              layout.horizontalView,
              styles.viewToggleGroup,
              {
                backgroundColor: isDark
                  ? colors.surfaceHover
                  : colors.surfaceLight,
                borderRadius: radii.md,
                padding: 2,
                marginLeft: spacing.xs,
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setViewMode("list")}
              activeOpacity={0.8}
              style={[
                styles.viewToggleBtn,
                {
                  backgroundColor:
                    viewMode === "list" ? colors.cardBackground : "transparent",
                  borderRadius: radii.sm,
                  paddingHorizontal: spacing.xs + 3,
                  paddingVertical: 4,
                },
                viewMode === "list" && shadows.sm,
              ]}
            >
              <MaterialIcons
                name="view-agenda"
                size={moderateScale(17)}
                color={viewMode === "list" ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setViewMode("grid")}
              activeOpacity={0.8}
              style={[
                styles.viewToggleBtn,
                {
                  backgroundColor:
                    viewMode === "grid" ? colors.cardBackground : "transparent",
                  borderRadius: radii.sm,
                  paddingHorizontal: spacing.xs + 3,
                  paddingVertical: 4,
                },
                viewMode === "grid" && shadows.sm,
              ]}
            >
              <MaterialIcons
                name="grid-view"
                size={moderateScale(17)}
                color={viewMode === "grid" ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Saved Properties List */}
      <FlatList
        data={filteredStays}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === "grid" ? numGridCols : 1}
        key={viewMode === "grid" ? `saved-grid-${numGridCols}` : "saved-list"}
        columnWrapperStyle={
          viewMode === "grid" ? [styles.gridRow, { gap: gridGap }] : undefined
        }
        contentContainerStyle={[
          styles.listContainer,
          {
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.md,
            paddingBottom:
              selectedForCompare.length > 0
                ? moderateScale(100)
                : moderateScale(40),
            gap: spacing.md,
          },
        ]}
        ListHeaderComponent={
          savedStays.length > 0 && viewMode === "list" ? (
            <View
              style={[
                styles.alertCard,
                {
                  backgroundColor: isDark ? colors.surfaceLight : "#F0FDF4",
                  borderColor: isDark ? colors.border : "#BBF7D0",
                  borderRadius: radii.xl,
                  padding: spacing.md,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              <View style={layout.horizontalView}>
                <Ionicons
                  name="notifications"
                  size={moderateScale(18)}
                  color="#10B981"
                  style={{ marginRight: spacing.sm }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(12.5),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    Price Drop & Availability Alerts Active
                  </Text>
                  <Text
                    style={[
                      typography.cardAmenity,
                      {
                        fontSize: moderateScale(11),
                        color: colors.textSecondary,
                        marginTop: 1,
                      },
                    ]}
                  >
                    We will notify you instantly if any saved stay drops rent or
                    books out.
                  </Text>
                </View>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const isComparing = selectedForCompare.includes(item.id);

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
                    borderColor: isComparing ? colors.primary : colors.border,
                    borderWidth: isComparing ? 2 : 1,
                    borderRadius: radii.xl,
                  },
                  shadows.sm,
                ]}
              >
                <View style={styles.gridImageWrapper}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={[styles.gridImage, { height: moderateScale(125) }]}
                  />

                  {/* Remove Button */}
                  <TouchableOpacity
                    onPress={() =>
                      handleRemoveFromWishlist(item.id, item.title)
                    }
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
                      name="heart"
                      size={moderateScale(15)}
                      color={colors.favoriteRed}
                    />
                  </TouchableOpacity>

                  {/* Rating Badge */}
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
                        fontSize: moderateScale(10.5),
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
                      <Text style={{ fontSize: moderateScale(10) }}>/mo</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleToggleCompare(item.id)}
                      style={[
                        styles.gridCompareBtn,
                        {
                          backgroundColor: isComparing
                            ? colors.primaryLight
                            : isDark
                              ? colors.surfaceHover
                              : colors.surfaceLight,
                          borderRadius: radii.sm,
                          paddingHorizontal: 5,
                          paddingVertical: 2,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(9.5),
                          fontWeight: "700",
                          color: isComparing
                            ? colors.primary
                            : colors.textSecondary,
                        }}
                      >
                        {isComparing ? "✓ Ready" : "+ Compare"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }

          // 2. List View Card Layout
          return (
            <TouchableOpacity
              activeOpacity={0.94}
              onPress={() =>
                router.push({
                  pathname: "/CusomterPanelScreens/PropertyDeatilScreeen/[id]",
                  params: { id: item.id },
                } as any)
              }
              style={[
                styles.cardWrapper,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: isComparing ? colors.primary : colors.border,
                  borderWidth: isComparing ? 2 : 1,
                  borderRadius: radii.xxl,
                },
                shadows.card,
              ]}
            >
              {/* Photo & Top Badges */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[
                    styles.image,
                    {
                      height: moderateScale(165),
                      borderTopLeftRadius: radii.xxl,
                      borderTopRightRadius: radii.xxl,
                    },
                  ]}
                />

                {/* Deal Tag */}
                {item.dealTag && (
                  <View
                    style={[
                      styles.dealBadge,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Text style={styles.dealBadgeText}>{item.dealTag}</Text>
                  </View>
                )}

                {/* Remove from Saved Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleRemoveFromWishlist(item.id, item.title)}
                  style={[
                    styles.removeBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(15, 23, 42, 0.85)"
                        : "rgba(255, 255, 255, 0.95)",
                      borderRadius: radii.round,
                    },
                  ]}
                >
                  <Ionicons
                    name="heart"
                    size={moderateScale(18)}
                    color={colors.favoriteRed}
                  />
                </TouchableOpacity>

                {/* Bottom Image Overlay Badges */}
                <View style={styles.imageBottomRow}>
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
                    <Text style={styles.ratingText}>
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
                      color="#FFFFFF"
                      style={{ marginRight: 3 }}
                    />
                    <Text style={styles.photoText}>
                      {item.photosCount} Photos
                    </Text>
                  </View>
                </View>
              </View>

              {/* Card Information */}
              <View style={{ padding: spacing.md }}>
                {/* Meta Badges */}
                <View
                  style={[layout.horizontalView, { gap: 6, marginBottom: 4 }]}
                >
                  <View
                    style={[
                      styles.tagPill,
                      {
                        backgroundColor:
                          item.category === "Room"
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
                          item.category === "Room"
                            ? colors.roomPink
                            : colors.pgBlue,
                      }}
                    >
                      {item.sharingType}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.tagPill,
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
                      {item.depositTerms}
                    </Text>
                  </View>
                  {item.foodIncluded && (
                    <View
                      style={[
                        styles.tagPill,
                        {
                          backgroundColor: "#ECFDF5",
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(10),
                          fontWeight: "700",
                          color: "#059669",
                        }}
                      >
                        🍲 Food Included
                      </Text>
                    </View>
                  )}
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

                {/* Amenities */}
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

                {/* Pricing & CTA Controls */}
                <View style={layout.horizontalViewBetween}>
                  {/* Price */}
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
                      {item.originalPrice && (
                        <Text
                          style={[
                            styles.originalPrice,
                            {
                              fontSize: moderateScale(12),
                              color: colors.textMuted,
                              marginLeft: 6,
                            },
                          ]}
                        >
                          ₹
                          {new Intl.NumberFormat("en-IN").format(
                            item.originalPrice,
                          )}
                        </Text>
                      )}
                      <Text
                        style={[
                          typography.cardPriceUnit,
                          {
                            fontSize: moderateScale(11),
                            color: colors.priceGreen,
                          },
                        ]}
                      >
                        {" "}
                        / mo
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: moderateScale(10),
                        color: colors.textMuted,
                        fontWeight: "500",
                      }}
                    >
                      Zero Brokerage
                    </Text>
                  </View>

                  {/* Buttons */}
                  <View
                    style={[layout.horizontalView, { gap: spacing.xs + 2 }]}
                  >
                    {/* Compare Checkbox Button */}
                    <TouchableOpacity
                      onPress={() => handleToggleCompare(item.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.compareToggleBtn,
                        {
                          backgroundColor: isComparing
                            ? colors.primaryLight
                            : isDark
                              ? colors.surfaceHover
                              : colors.surfaceLight,
                          borderColor: isComparing
                            ? colors.primary
                            : colors.border,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs + 2,
                        },
                      ]}
                    >
                      <MaterialIcons
                        name="compare-arrows"
                        size={moderateScale(15)}
                        color={
                          isComparing ? colors.primary : colors.textPrimary
                        }
                        style={{ marginRight: 2 }}
                      />
                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          fontWeight: isComparing ? "700" : "500",
                          color: isComparing
                            ? colors.primary
                            : colors.textPrimary,
                        }}
                      >
                        {isComparing ? "Selected" : "Compare"}
                      </Text>
                    </TouchableOpacity>

                    {/* Book Visit Button */}
                    <TouchableOpacity
                      onPress={() => setSelectedItemForVisit(item)}
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
                  width: moderateScale(76),
                  height: moderateScale(76),
                  borderRadius: moderateScale(38),
                  backgroundColor: colors.primaryLight,
                },
              ]}
            >
              <Ionicons
                name="heart-dislike-outline"
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
              No Saved Stays in{" "}
              {activeFolder === "All" ? "Wishlist" : activeFolder}
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
              Tap the heart icon on any room or PG listing to shortlist and
              compare them here.
            </Text>
          </View>
        }
      />

      {/* Floating Compare Action Bar (when 1 or 2 items selected) */}
      {selectedForCompare.length > 0 && (
        <View
          style={[
            styles.compareFloatingBar,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xxl,
              marginHorizontal: spacing.screenHorizontal,
            },
            shadows.floating,
          ]}
        >
          <View style={layout.horizontalViewBetween}>
            <View style={layout.horizontalView}>
              <View
                style={[
                  styles.compareCountCircle,
                  {
                    backgroundColor: colors.primary,
                    width: moderateScale(26),
                    height: moderateScale(26),
                    borderRadius: moderateScale(13),
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: moderateScale(12),
                    fontWeight: "800",
                  }}
                >
                  {selectedForCompare.length}
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    typography.cardTitle,
                    { fontSize: moderateScale(13), color: colors.textPrimary },
                  ]}
                >
                  {selectedForCompare.length === 1
                    ? "Select 1 more to compare"
                    : "2 Stays Ready to Compare"}
                </Text>
                <Text
                  style={[
                    typography.cardAmenity,
                    {
                      fontSize: moderateScale(10.5),
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  Side-by-side rent & amenities analysis
                </Text>
              </View>
            </View>

            <View style={[layout.horizontalView, { gap: spacing.xs }]}>
              <TouchableOpacity
                onPress={() => setSelectedForCompare([])}
                style={{ padding: spacing.xs }}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11.5),
                    color: colors.textMuted,
                    fontWeight: "600",
                  }}
                >
                  Clear
                </Text>
              </TouchableOpacity>

              {selectedForCompare.length === 2 && (
                <TouchableOpacity
                  onPress={() => setCompareModalVisible(true)}
                  activeOpacity={0.85}
                  style={[
                    styles.launchCompareBtn,
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
                      color: colors.white,
                      fontSize: moderateScale(12),
                      fontWeight: "700",
                    }}
                  >
                    Compare Now ⚖️
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Side-by-Side Comparison Modal */}
      {comparedProperties.length === 2 && (
        <Modal
          visible={compareModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCompareModalVisible(false)}
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
                  {
                    borderBottomColor: colors.borderLight,
                    padding: spacing.lg,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.sectionTitle,
                    { fontSize: moderateScale(18), color: colors.textPrimary },
                  ]}
                >
                  Property Comparison ⚖️
                </Text>
                <TouchableOpacity onPress={() => setCompareModalVisible(false)}>
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
                  paddingBottom: spacing.xxxl,
                }}
              >
                {/* 2 Stays Headers Side-by-Side */}
                <View
                  style={[
                    layout.horizontalViewBetween,
                    { gap: spacing.md, marginBottom: spacing.md },
                  ]}
                >
                  {comparedProperties.map((p) => (
                    <View key={p.id} style={{ flex: 1 }}>
                      <Image
                        source={{ uri: p.imageUrl }}
                        style={[
                          styles.compareThumb,
                          {
                            height: moderateScale(100),
                            borderRadius: radii.xl,
                          },
                        ]}
                      />
                      <Text
                        numberOfLines={1}
                        style={[
                          typography.cardTitle,
                          {
                            fontSize: moderateScale(13),
                            color: colors.textPrimary,
                            marginTop: 4,
                          },
                        ]}
                      >
                        {p.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(13),
                          fontWeight: "800",
                          color: colors.priceGreen,
                          marginTop: 1,
                        }}
                      >
                        ₹{new Intl.NumberFormat("en-IN").format(p.price)}/mo
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Comparison Matrix Table */}
                <View
                  style={[
                    styles.compareTable,
                    {
                      borderColor: colors.borderLight,
                      borderRadius: radii.xl,
                      overflow: "hidden",
                    },
                  ]}
                >
                  {[
                    {
                      label: "Monthly Rent",
                      val1: `₹${comparedProperties[0].price}`,
                      val2: `₹${comparedProperties[1].price}`,
                    },
                    {
                      label: "Deposit Terms",
                      val1: comparedProperties[0].depositTerms,
                      val2: comparedProperties[1].depositTerms,
                    },
                    {
                      label: "Metro Distance",
                      val1: comparedProperties[0].metroDistance,
                      val2: comparedProperties[1].metroDistance,
                    },
                    {
                      label: "Meal Plan",
                      val1: comparedProperties[0].foodIncluded
                        ? "Included"
                        : "Self Cooking",
                      val2: comparedProperties[1].foodIncluded
                        ? "Included"
                        : "Self Cooking",
                    },
                    {
                      label: "User Rating",
                      val1: `⭐ ${comparedProperties[0].rating}`,
                      val2: `⭐ ${comparedProperties[1].rating}`,
                    },
                    {
                      label: "Brokerage Fee",
                      val1: "₹0 (Zero)",
                      val2: "₹0 (Zero)",
                    },
                  ].map((row, idx) => (
                    <View
                      key={idx}
                      style={[
                        layout.horizontalViewBetween,
                        styles.compareTableRow,
                        {
                          backgroundColor:
                            idx % 2 === 0
                              ? isDark
                                ? colors.surfaceLight
                                : "#F8FAFC"
                              : colors.cardBackground,
                          paddingVertical: spacing.sm,
                          paddingHorizontal: spacing.md,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          flex: 1,
                          fontSize: moderateScale(11.5),
                          fontWeight: "600",
                          color: colors.textPrimary,
                        }}
                      >
                        {row.label}
                      </Text>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: moderateScale(11.5),
                          textAlign: "center",
                          color: colors.textSecondary,
                        }}
                      >
                        {row.val1}
                      </Text>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: moderateScale(11.5),
                          textAlign: "right",
                          color: colors.textSecondary,
                        }}
                      >
                        {row.val2}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setCompareModalVisible(false);
                    Alert.alert(
                      "Visit Assistant",
                      "Both properties added to your guided physical visit route!",
                    );
                  }}
                  activeOpacity={0.85}
                  style={[
                    styles.scheduleBothBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radii.pill,
                      paddingVertical: spacing.md,
                      marginTop: spacing.lg,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: moderateScale(13.5),
                      fontWeight: "700",
                      textAlign: "center",
                    }}
                  >
                    Schedule Route Visit for Both
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Schedule Free Visit Modal */}
      {selectedItemForVisit && (
        <Modal
          visible={Boolean(selectedItemForVisit)}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedItemForVisit(null)}
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
              <Image
                source={{ uri: selectedItemForVisit.imageUrl }}
                style={[styles.visitModalImage, { height: moderateScale(180) }]}
              />

              <TouchableOpacity
                onPress={() => setSelectedItemForVisit(null)}
                style={styles.visitCloseBtn}
              >
                <Ionicons
                  name="close-circle"
                  size={moderateScale(28)}
                  color="rgba(255, 255, 255, 0.9)"
                />
              </TouchableOpacity>

              <View style={{ padding: spacing.lg }}>
                <Text
                  style={[
                    typography.sectionTitle,
                    { fontSize: moderateScale(17), color: colors.textPrimary },
                  ]}
                >
                  Schedule Free Physical Visit
                </Text>
                <Text
                  style={[
                    typography.cardLocation,
                    {
                      fontSize: moderateScale(12.5),
                      color: colors.textSecondary,
                      marginTop: 2,
                    },
                  ]}
                >
                  📍 {selectedItemForVisit.title} (
                  {selectedItemForVisit.location})
                </Text>

                <Text
                  style={[
                    typography.cardPrice,
                    {
                      fontSize: moderateScale(17),
                      color: colors.priceGreen,
                      marginTop: spacing.xs,
                    },
                  ]}
                >
                  ₹
                  {new Intl.NumberFormat("en-IN").format(
                    selectedItemForVisit.price,
                  )}{" "}
                  / month
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

                {/* Visit Day Selector */}
                <Text
                  style={[
                    typography.cardTitle,
                    {
                      fontSize: moderateScale(13),
                      color: colors.textPrimary,
                      marginBottom: spacing.xs,
                    },
                  ]}
                >
                  Select Preferred Visit Day:
                </Text>
                <View
                  style={[
                    layout.horizontalView,
                    { gap: spacing.sm, marginBottom: spacing.md },
                  ]}
                >
                  {["Today 4 PM", "Tomorrow 11 AM", "This Sunday"].map(
                    (t, idx) => (
                      <View
                        key={t}
                        style={[
                          styles.timeSlotPill,
                          {
                            backgroundColor:
                              idx === 1 ? colors.primary : colors.surfaceHover,
                            borderRadius: radii.pill,
                            paddingHorizontal: spacing.sm + 2,
                            paddingVertical: spacing.xs + 2,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(11.5),
                            fontWeight: "700",
                            color:
                              idx === 1 ? colors.white : colors.textPrimary,
                          }}
                        >
                          {t}
                        </Text>
                      </View>
                    ),
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Visit Confirmed! 🎉",
                      `Caretaker assigned for ${selectedItemForVisit.title}. You will receive a verification SMS.`,
                    );
                    setSelectedItemForVisit(null);
                  }}
                  activeOpacity={0.85}
                  style={[
                    styles.confirmVisitBtn,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: radii.pill,
                      paddingVertical: spacing.md,
                      marginTop: spacing.sm,
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
                    Confirm Free Visit Booking
                  </Text>
                </TouchableOpacity>
              </View>
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
  header: {
    borderBottomWidth: 1,
  },
  countBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  folderPill: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewToggleBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  listContainer: {},
  gridRow: {
    justifyContent: "space-between",
  },
  gridCard: {
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
  gridCompareBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  alertCard: {
    borderWidth: 1,
  },
  cardWrapper: {
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  image: {
    width: "100%",
    backgroundColor: "#334155",
  },
  dealBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dealBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 10.5,
  },
  removeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  imageBottomRow: {
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
  ratingText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 11,
  },
  photoCountPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 11,
  },
  tagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
  compareToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  bookVisitBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  compareFloatingBar: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    padding: 12,
    borderWidth: 1,
  },
  compareCountCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  launchCompareBtn: {
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
  modalHeader: {
    borderBottomWidth: 1,
  },
  compareThumb: {
    width: "100%",
    backgroundColor: "#334155",
  },
  compareTable: {
    borderWidth: 1,
  },
  compareTableRow: {},
  scheduleBothBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  visitModalImage: {
    width: "100%",
  },
  visitCloseBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },
  timeSlotPill: {
    alignItems: "center",
    justifyContent: "center",
  },
  confirmVisitBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
