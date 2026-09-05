import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Share,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Comprehensive Property Mock Data Base
const PROPERTIES_DATABASE: Record<string, any> = {
  "1": {
    id: "1",
    title: "Executive Single Room with Balcony",
    type: "Room",
    category: "Room",
    price: 9000,
    originalPrice: 9800,
    location: "Sector 6, Dwarka, New Delhi",
    fullAddress: "Pocket 2, Block B, Sector 6 Dwarka, New Delhi - 110075",
    metroDistance: "350m from Sec 6 Metro Station",
    deposit: "₹9,000 (1 Month • 100% Refundable)",
    noticePeriod: "30 Days Notice",
    rating: 4.9,
    reviewsCount: 48,
    isVerified: true,
    sharingType: "Single Private Room",
    gender: "Co-Living / Any",
    foodIncluded: true,
    caretakerName: "Ramesh Kumar",
    caretakerPhone: "+91 98112 34567",
    caretakerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "Luxurious, well-ventilated single private room featuring a private attached balcony, modern wooden wardrobe, high-speed optical WiFi, and attached washroom with 24/7 geyser. Located within 350 meters of Dwarka Sector 6 Metro station with zero brokerage.",
    amenities: [
      { name: "100 Mbps WiFi", icon: "wifi" },
      { name: "Split AC & Inverter", icon: "air-conditioner" },
      { name: "Attached Bathroom", icon: "shower" },
      { name: "Private Balcony", icon: "balcony" },
      { name: "Daily Cleaning", icon: "broom" },
      { name: "3 Homely Meals", icon: "silverware-fork-knife" },
      { name: "RO Water & Fridge", icon: "fridge" },
      { name: "24/7 CCTV & Security", icon: "shield-check" },
      { name: "Automatic Washing Machine", icon: "washing-machine" },
      { name: "Power Backup", icon: "lightning-bolt" },
    ],
    mealPlan: {
      breakfast: "Poha / Paratha / Idli + Tea (8:00 AM - 10:00 AM)",
      lunch: "Dal, Seasonal Sabzi, Roti, Rice & Salad (1:00 PM - 3:00 PM)",
      snacks: "Evening Chai + Biscuits / Pakoda (5:30 PM)",
      dinner:
        "Special Paneer / Curry, Dal Tadka, Phulka Roti & Kheer (8:30 PM - 10:30 PM)",
    },
    rules: [
      "No smoking inside the room (Balcony allowed)",
      "Visitors allowed during daytime (9 AM - 9 PM)",
      "Night entry gate pass on WhatsApp",
      "1 Month refundable security deposit",
    ],
    landmarks: [
      { name: "Sector 6 Metro Station", dist: "350 meters (4 min walk)" },
      { name: "Sector 6 Central Market", dist: "150 meters" },
      { name: "Venkateshwar Hospital", dist: "1.2 km" },
      { name: "IGI Airport Terminal 3", dist: "15 min drive" },
    ],
  },
  "2": {
    id: "2",
    title: "Safe & Secure Girls Co-living PG",
    type: "PG",
    category: "PG",
    price: 8500,
    originalPrice: 9000,
    location: "Sector 10, Dwarka, New Delhi",
    fullAddress: "Plot 14, Sector 10 Dwarka, New Delhi - 110075",
    metroDistance: "500m from Sec 10 Metro Station",
    deposit: "₹8,500 (1 Month • 100% Refundable)",
    noticePeriod: "30 Days Notice",
    rating: 5.0,
    reviewsCount: 64,
    isVerified: true,
    sharingType: "Double Sharing",
    gender: "Girls Only",
    foodIncluded: true,
    caretakerName: "Priya Sharma (Warden)",
    caretakerPhone: "+91 98765 11223",
    caretakerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80",
    ],
    description:
      "Ultra-secure girls co-living stay with biometric fingerprint access, 24/7 female warden on site, CCTV surveillance, 3 homely cooked North/South Indian meals, high-speed WiFi, laundry, and daily housekeeping.",
    amenities: [
      { name: "Biometric Security", icon: "fingerprint" },
      { name: "3 Fresh Meals Daily", icon: "silverware-fork-knife" },
      { name: "Split AC", icon: "air-conditioner" },
      { name: "High-Speed WiFi", icon: "wifi" },
      { name: "Housekeeping Daily", icon: "broom" },
      { name: "Laundry Service", icon: "washing-machine" },
      { name: "RO Pure Water", icon: "water" },
      { name: "Female Warden On-Site", icon: "shield-account" },
    ],
    mealPlan: {
      breakfast: "Nutritious Breakfast + Tea/Coffee",
      lunch: "Homestyle Lunch with Curd & Salad",
      snacks: "Evening Snacks & Tea",
      dinner: "Deluxe Dinner with Weekend Special Desserts",
    },
    rules: [
      "Strictly Girls Only Residence",
      "Biometric Entry for all residents",
      "Quiet hours after 11 PM",
    ],
    landmarks: [
      { name: "Sector 10 Metro Station", dist: "500 meters (6 min walk)" },
      { name: "Dwarka Court Complex", dist: "800 meters" },
      { name: "City Centre Mall", dist: "1.5 km" },
    ],
  },
};

export default function PropertyDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

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

  // State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [visitModalVisible, setVisitModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("Tomorrow 4:00 PM");
  const [tokenModalVisible, setTokenModalVisible] = useState(false);

  // Property Data resolution
  const property = useMemo(() => {
    const propId = String(id || "1");
    if (PROPERTIES_DATABASE[propId]) return PROPERTIES_DATABASE[propId];
    // Fallback template
    return {
      ...PROPERTIES_DATABASE["1"],
      id: propId,
      title: `Premium Verified Stay #${propId}`,
    };
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${property.title} in ${property.location} on Delhi Property Exchange with Zero Brokerage: https://delhipropertyexchange.com/stay/${property.id}`,
      });
    } catch (e) {
      console.log("Share error", e);
    }
  };

  const handleCallCaretaker = () => {
    Alert.alert(
      "Calling Caretaker",
      `Connecting to ${property.caretakerName} at ${property.caretakerPhone}...`,
    );
  };

  const handleWhatsApp = () => {
    Alert.alert(
      "WhatsApp Chat",
      `Opening official WhatsApp chat with caretaker ${property.caretakerName}...`,
    );
  };

  const handleConfirmVisit = () => {
    setVisitModalVisible(false);
    Alert.alert(
      "Visit Confirmed! 🎉",
      `Your guided visit for ${property.title} is scheduled for ${selectedSlot}. Caretaker ${property.caretakerName} will meet you at the property.`,
    );
  };

  const handleConfirmToken = () => {
    setTokenModalVisible(false);
    Alert.alert(
      "Room Reserved! 🔑",
      `₹1,000 Move-in Token received for ${property.title}. Your room is locked for 48 hours with 100% money-back guarantee.`,
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={[]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Main Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: moderateScale(110) + insets.bottom,
        }}
      >
        {/* Top Image Carousel with Floating Navigation Controls */}
        <View style={styles.imageCarouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {property.images.map((img: string, idx: number) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={[styles.carouselImage, { height: moderateScale(270) }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Floating Top Navigation Header */}
          <View
            style={[
              styles.floatingNavHeader,
              { paddingHorizontal: spacing.md, paddingTop: spacing.xxxl },
            ]}
          >
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              style={[
                styles.navCircleBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(13, 27, 42, 0.82)"
                    : "rgba(255, 255, 255, 0.92)",
                  borderRadius: radii.round,
                },
                shadows.sm,
              ]}
            >
              <Feather
                name="arrow-left"
                size={moderateScale(20)}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            {/* Right Buttons: Share & Favorite */}
            <View style={[layout.horizontalView, { gap: spacing.sm }]}>
              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.8}
                style={[
                  styles.navCircleBtn,
                  {
                    backgroundColor: isDark
                      ? "rgba(13, 27, 42, 0.82)"
                      : "rgba(255, 255, 255, 0.92)",
                    borderRadius: radii.round,
                  },
                  shadows.sm,
                ]}
              >
                <Feather
                  name="share-2"
                  size={moderateScale(18)}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsFavorite(!isFavorite)}
                activeOpacity={0.8}
                style={[
                  styles.navCircleBtn,
                  {
                    backgroundColor: isDark
                      ? "rgba(13, 27, 42, 0.82)"
                      : "rgba(255, 255, 255, 0.92)",
                    borderRadius: radii.round,
                  },
                  shadows.sm,
                ]}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={moderateScale(20)}
                  color={
                    isFavorite ? colors.locationPinRed : colors.textPrimary
                  }
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Indicators on Image */}
          <View
            style={[
              layout.horizontalViewBetween,
              styles.imageBottomIndicators,
              { paddingHorizontal: spacing.md },
            ]}
          >
            {/* Verified Badge */}
            {property.isVerified && (
              <View
                style={[
                  styles.verifiedPill,
                  {
                    backgroundColor: colors.verifiedBg,
                    borderColor: colors.verifiedBorder,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={moderateScale(13)}
                  color={colors.verifiedGreen}
                  style={{ marginRight: 3 }}
                />
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    fontWeight: "700",
                    color: colors.verifiedGreen,
                  }}
                >
                  Delhi Property Exchange Verified
                </Text>
              </View>
            )}

            {/* Photo Index Counter */}
            <View
              style={[
                styles.photoCounterPill,
                {
                  backgroundColor: "rgba(6, 17, 30, 0.78)",
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Feather
                name="image"
                size={moderateScale(12)}
                color="#FFFFFF"
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: moderateScale(11),
                  fontWeight: "700",
                }}
              >
                {activeImageIndex + 1} / {property.images.length} Photos
              </Text>
            </View>
          </View>
        </View>

        {/* Section 1: Property Overview & Titles */}
        <View
          style={{
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.md,
          }}
        >
          {/* Category & Gender Pills */}
          <View
            style={[
              layout.horizontalView,
              { gap: spacing.xs, marginBottom: spacing.xs },
            ]}
          >
            <View
              style={[
                styles.tagBadge,
                {
                  backgroundColor: colors.primaryLight,
                  borderRadius: radii.pill,
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
                {property.sharingType}
              </Text>
            </View>
            <View
              style={[
                styles.tagBadge,
                {
                  backgroundColor: isDark
                    ? colors.surfaceHover
                    : colors.surfaceLight,
                  borderRadius: radii.pill,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "600",
                  color: colors.textSecondary,
                }}
              >
                {property.gender}
              </Text>
            </View>
            <View
              style={[
                styles.tagBadge,
                { backgroundColor: "#ECFDF5", borderRadius: radii.pill },
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "700",
                  color: "#047857",
                }}
              >
                ⭐ Zero Brokerage
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(20),
                color: colors.textPrimary,
                marginTop: 2,
              },
            ]}
          >
            {property.title}
          </Text>

          {/* Address & Metro Location */}
          <View style={[layout.horizontalView, { marginTop: 4 }]}>
            <Ionicons
              name="location-outline"
              size={moderateScale(16)}
              color={colors.locationPinRed}
              style={{ marginRight: 2 }}
            />
            <Text
              style={[
                typography.cardLocation,
                {
                  fontSize: moderateScale(13),
                  color: colors.textSecondary,
                  flex: 1,
                },
              ]}
            >
              {property.fullAddress}
            </Text>
          </View>

          <View style={[layout.horizontalView, { marginTop: 4 }]}>
            <MaterialCommunityIcons
              name="subway-variant"
              size={moderateScale(15)}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: moderateScale(12),
                color: colors.primary,
                fontWeight: "700",
              }}
            >
              {property.metroDistance}
            </Text>
          </View>

          {/* Rating & Reviews Bar */}
          <View
            style={[
              layout.horizontalView,
              { marginTop: spacing.sm, gap: spacing.md },
            ]}
          >
            <View
              style={[
                layout.horizontalView,
                styles.ratingBox,
                {
                  backgroundColor: isDark ? colors.surfaceHover : "#FEF3C7",
                  borderRadius: radii.md,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                },
              ]}
            >
              <Ionicons
                name="star"
                size={moderateScale(13)}
                color="#F59E0B"
                style={{ marginRight: 3 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                {property.rating}
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  marginLeft: 3,
                }}
              >
                ({property.reviewsCount} verified reviews)
              </Text>
            </View>

            <Text
              style={{
                fontSize: moderateScale(11),
                color: colors.verifiedGreen,
                fontWeight: "700",
              }}
            >
              ✓ 100% Move-in Ready
            </Text>
          </View>

          {/* Slashed Price & Deposit Highlight Card */}
          <View
            style={[
              styles.priceHighlightCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#F0FDFA",
                borderColor: isDark ? colors.border : "#99F6E4",
                borderRadius: radii.xl,
                padding: spacing.md,
                marginTop: spacing.md,
              },
              shadows.sm,
            ]}
          >
            {/* Top Row: Rent & Deposit side-by-side with flex: 1 */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: spacing.sm,
              }}
            >
              {/* Left Column: Monthly Rent */}
              <View style={{ flex: 1.1 }}>
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: colors.textSecondary,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Monthly Rent
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "baseline",
                    flexWrap: "wrap",
                    marginTop: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(20),
                      fontWeight: "800",
                      color: colors.primary,
                    }}
                  >
                    ₹{new Intl.NumberFormat("en-IN").format(property.price)}
                  </Text>
                  {property.originalPrice && (
                    <Text
                      style={{
                        fontSize: moderateScale(12),
                        color: colors.textMuted,
                        textDecorationLine: "line-through",
                        marginLeft: 6,
                      }}
                    >
                      ₹
                      {new Intl.NumberFormat("en-IN").format(
                        property.originalPrice,
                      )}
                    </Text>
                  )}
                  <Text
                    style={{
                      fontSize: moderateScale(11.5),
                      color: colors.textSecondary,
                      marginLeft: 2,
                    }}
                  >
                    /mo
                  </Text>
                </View>
              </View>

              {/* Vertical Hairline Divider */}
              <View
                style={{
                  width: 1,
                  height: "100%",
                  minHeight: 36,
                  backgroundColor: isDark ? colors.border : "#CCFBF1",
                  marginHorizontal: 2,
                }}
              />

              {/* Right Column: Security Deposit */}
              <View style={{ flex: 1.1, alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: colors.textSecondary,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Security Deposit
                </Text>
                <Text
                  numberOfLines={2}
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: "700",
                    color: colors.textPrimary,
                    textAlign: "right",
                    marginTop: 3,
                  }}
                >
                  {property.deposit}
                </Text>
              </View>
            </View>

            {/* Bottom Guarantee Banner inside Card */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark
                  ? "rgba(16, 185, 129, 0.12)"
                  : "#ECFDF5",
                borderRadius: radii.md || 8,
                paddingHorizontal: spacing.sm,
                paddingVertical: 5,
                marginTop: spacing.sm,
              }}
            >
              <Ionicons
                name="shield-checkmark"
                size={moderateScale(13)}
                color={colors.verifiedGreen || "#10B981"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: "600",
                  color: colors.verifiedGreen || "#047857",
                  flex: 1,
                }}
              >
                100% Refundable Deposit • Zero Hidden Charges
              </Text>
            </View>
          </View>
        </View>

        {/* Section 2: Key 4-Grid Highlights */}
        <View
          style={{
            paddingHorizontal: spacing.screenHorizontal,
            marginTop: spacing.lg,
          }}
        >
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(15),
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              },
            ]}
          >
            Key Highlights
          </Text>

          <View style={styles.highlightsGrid}>
            {[
              {
                icon: "subway-variant",
                label: "Nearest Metro",
                val: "350m Walk",
              },
              { icon: "shield-star", label: "Brokerage Fee", val: "₹0 (Zero)" },
              {
                icon: "silverware-fork-knife",
                label: "Meals Available",
                val: "3 Daily Meals",
              },
              {
                icon: "clock-check-outline",
                label: "Notice Period",
                val: property.noticePeriod,
              },
            ].map((h, i) => (
              <View
                key={i}
                style={[
                  styles.highlightCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.lg,
                    padding: spacing.sm + 2,
                    width: "48.2%",
                  },
                  shadows.sm,
                ]}
              >
                <View
                  style={[
                    styles.highlightIconBox,
                    { backgroundColor: colors.primary, borderRadius: radii.md },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={h.icon as any}
                    size={moderateScale(18)}
                    color={colors.white}
                  />
                </View>
                <Text
                  style={{
                    fontSize: moderateScale(10.5),
                    color: colors.textSecondary,
                    marginTop: spacing.xs,
                  }}
                >
                  {h.label}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: "700",
                    color: colors.textPrimary,
                    marginTop: 1,
                  }}
                >
                  {h.val}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 3: About & Description */}
        <View
          style={{
            paddingHorizontal: spacing.screenHorizontal,
            marginTop: spacing.lg,
          }}
        >
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(15),
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              },
            ]}
          >
            About This Stay
          </Text>
          <Text
            style={[
              typography.cardAmenity,
              {
                fontSize: moderateScale(13),
                lineHeight: moderateScale(20),
                color: colors.textSecondary,
              },
            ]}
          >
            {property.description}
          </Text>
        </View>

        {/* Section 4: All Amenities Grid */}
        <View
          style={{
            paddingHorizontal: spacing.screenHorizontal,
            marginTop: spacing.lg,
          }}
        >
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(15),
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              },
            ]}
          >
            Amenities & Comforts ({property.amenities.length})
          </Text>

          <View style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}>
            {property.amenities.map((a: any, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.amenityPill,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.sm + 2,
                    paddingVertical: spacing.xs + 2,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={a.icon}
                  size={moderateScale(15)}
                  color={colors.primary}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    fontSize: moderateScale(11.5),
                    fontWeight: "600",
                    color: colors.textPrimary,
                  }}
                >
                  {a.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 5: Meal Plan Schedule */}
        {property.mealPlan && (
          <View
            style={{
              paddingHorizontal: spacing.screenHorizontal,
              marginTop: spacing.lg,
            }}
          >
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(15),
                  color: colors.textPrimary,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              Daily Meal Plan Schedule 🍲
            </Text>

            <View
              style={[
                styles.mealCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  borderRadius: radii.xl,
                  padding: spacing.md,
                },
                shadows.sm,
              ]}
            >
              {[
                {
                  title: "Breakfast",
                  menu: property.mealPlan.breakfast,
                  icon: "coffee-outline",
                },
                {
                  title: "Lunch",
                  menu: property.mealPlan.lunch,
                  icon: "food-drumstick-outline",
                },
                {
                  title: "Evening Snacks",
                  menu: property.mealPlan.snacks,
                  icon: "cupcake",
                },
                {
                  title: "Dinner",
                  menu: property.mealPlan.dinner,
                  icon: "silverware-fork-knife",
                },
              ].map((m, idx) => (
                <View
                  key={idx}
                  style={[
                    layout.horizontalView,
                    {
                      paddingVertical: spacing.xs + 2,
                      borderBottomWidth: idx === 3 ? 0 : 1,
                      borderBottomColor: colors.borderLight,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={m.icon as any}
                    size={moderateScale(18)}
                    color={colors.primary}
                    style={{ marginRight: spacing.sm }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: moderateScale(12),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      {m.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(11),
                        color: colors.textSecondary,
                        marginTop: 1,
                      }}
                    >
                      {m.menu}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Section 6: On-Site Caretaker Contact Card */}
        <View
          style={{
            paddingHorizontal: spacing.screenHorizontal,
            marginTop: spacing.lg,
          }}
        >
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(15),
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              },
            ]}
          >
            Property Caretaker & Guide
          </Text>

          <View
            style={[
              styles.caretakerCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
              shadows.sm,
            ]}
          >
            <View style={layout.horizontalViewBetween}>
              <View style={layout.horizontalView}>
                <Image
                  source={{ uri: property.caretakerAvatar }}
                  style={[
                    styles.caretakerAvatar,
                    { width: 46, height: 46, borderRadius: 23 },
                  ]}
                />
                <View style={{ marginLeft: spacing.md }}>
                  <Text
                    style={{
                      fontSize: moderateScale(14),
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    {property.caretakerName}
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(11.5),
                      color: colors.verifiedGreen,
                      fontWeight: "600",
                    }}
                  >
                    ✓ Verified On-Site Manager
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(10.5),
                      color: colors.textMuted,
                    }}
                  >
                    Typically replies within 5 mins
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={[layout.horizontalView, { gap: 8 }]}>
                <TouchableOpacity
                  onPress={handleCallCaretaker}
                  activeOpacity={0.8}
                  style={[
                    styles.contactCircleBtn,
                    { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" },
                  ]}
                >
                  <Feather
                    name="phone"
                    size={moderateScale(16)}
                    color="#059669"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleWhatsApp}
                  activeOpacity={0.8}
                  style={[
                    styles.contactCircleBtn,
                    { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
                  ]}
                >
                  <Ionicons
                    name="logo-whatsapp"
                    size={moderateScale(18)}
                    color="#2563EB"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Section 7: House Rules */}
        <View
          style={{
            paddingHorizontal: spacing.screenHorizontal,
            marginTop: spacing.lg,
          }}
        >
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(15),
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              },
            ]}
          >
            House Rules & Policies
          </Text>

          <View
            style={[
              styles.rulesCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
              shadows.sm,
            ]}
          >
            {property.rules.map((rule: string, idx: number) => (
              <View
                key={idx}
                style={[layout.horizontalView, { marginVertical: 3 }]}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={moderateScale(15)}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: moderateScale(12),
                    color: colors.textSecondary,
                    flex: 1,
                  }}
                >
                  {rule}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section 8: Location & Transit Landmarks */}
        <View
          style={{
            paddingHorizontal: spacing.screenHorizontal,
            marginTop: spacing.lg,
          }}
        >
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(15),
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              },
            ]}
          >
            Location & Transit Map
          </Text>

          <View
            style={[
              styles.landmarksCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
              shadows.sm,
            ]}
          >
            {property.landmarks.map((l: any, idx: number) => (
              <View
                key={idx}
                style={[layout.horizontalViewBetween, { paddingVertical: 4 }]}
              >
                <View style={layout.horizontalView}>
                  <MaterialIcons
                    name="place"
                    size={moderateScale(16)}
                    color={colors.locationPinRed}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      fontWeight: "600",
                      color: colors.textPrimary,
                    }}
                  >
                    {l.name}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: colors.primary,
                    fontWeight: "700",
                  }}
                >
                  {l.dist}
                </Text>
              </View>
            ))}

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Google Maps",
                  `Opening directions to ${property.fullAddress} in Google Maps.`,
                )
              }
              activeOpacity={0.8}
              style={[
                styles.mapActionBtn,
                {
                  backgroundColor: isDark
                    ? colors.surfaceHover
                    : colors.surfaceLight,
                  borderRadius: radii.pill,
                  marginTop: spacing.sm,
                  paddingVertical: spacing.xs + 2,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(11.5),
                  fontWeight: "700",
                  color: colors.primary,
                  textAlign: "center",
                }}
              >
                📍 Open Guided Route in Google Maps
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View
        style={[
          styles.stickyBottomBar,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderTopColor: isDark
              ? "rgba(255, 255, 255, 0.10)"
              : "rgba(0, 0, 0, 0.06)",
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.sm + 4,
            paddingBottom:
              insets.bottom > 0 ? insets.bottom + spacing.xs : spacing.md,
          },
          shadows.floating,
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Price & Deposit Summary */}
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text
                style={{
                  fontSize: moderateScale(19),
                  fontWeight: "800",
                  color: colors.primary,
                  letterSpacing: -0.3,
                }}
              >
                ₹{new Intl.NumberFormat("en-IN").format(property.price)}
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11.5),
                  color: colors.textSecondary,
                  fontWeight: "600",
                  marginLeft: 3,
                }}
              >
                /mo
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 2,
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: colors.verifiedGreen || "#10B981",
                  marginRight: 4,
                }}
              />
              <Text
                style={{
                  fontSize: moderateScale(10.5),
                  color: colors.verifiedGreen || "#10B981",
                  fontWeight: "700",
                }}
              >
                Zero Brokerage
              </Text>
            </View>
          </View>

          {/* 2 Primary CTAs */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs + 2,
            }}
          >
            {/* Schedule Visit */}
            <TouchableOpacity
              onPress={() => setVisitModalVisible(true)}
              activeOpacity={0.85}
              style={[
                styles.scheduleVisitBtn,
                {
                  backgroundColor: isDark
                    ? colors.surfaceHover
                    : colors.surfaceLight,
                  borderColor: colors.border,
                  borderRadius: radii.pill || 24,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm + 1,
                },
              ]}
            >
              <Feather
                name="calendar"
                size={moderateScale(13.5)}
                color={colors.textPrimary}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Book Visit
              </Text>
            </TouchableOpacity>

            {/* Lock Room Token */}
            <TouchableOpacity
              onPress={() => setTokenModalVisible(true)}
              activeOpacity={0.85}
              style={[
                styles.lockRoomBtn,
                {
                  borderRadius: radii.pill || 24,
                  overflow: "hidden",
                },
                shadows.sm,
              ]}
            >
              <LinearGradient
                colors={
                  isDark
                    ? [colors.primary, colors.primaryDark]
                    : [
                        colors.primary,
                        colors.primaryGradientEnd || colors.primaryDark,
                      ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: spacing.md + 4,
                  paddingVertical: spacing.sm + 2,
                }}
              >
                <Feather
                  name="key"
                  size={moderateScale(13.5)}
                  color="#FFFFFF"
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={{
                    fontSize: moderateScale(12.5),
                    fontWeight: "800",
                    color: "#FFFFFF",
                  }}
                >
                  Reserve Stay
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Schedule Visit Modal */}
      <Modal
        visible={visitModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
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
                Schedule Free Property Visit
              </Text>
              <TouchableOpacity onPress={() => setVisitModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={moderateScale(24)}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                padding: spacing.lg,
                paddingBottom: spacing.xxxl + insets.bottom,
              }}
            >
              <Text
                style={[
                  typography.cardTitle,
                  { fontSize: moderateScale(13.5), color: colors.textPrimary },
                ]}
              >
                {property.title}
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11.5),
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                📍 {property.location}
              </Text>

              <Text
                style={[
                  typography.cardTitle,
                  {
                    fontSize: moderateScale(13),
                    color: colors.textPrimary,
                    marginTop: spacing.md,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                Select Preferred Time Slot:
              </Text>

              <View style={{ gap: spacing.xs + 2 }}>
                {[
                  "Today (Evening, 4:00 PM)",
                  "Today (Evening, 6:00 PM)",
                  "Tomorrow (Morning, 11:00 AM)",
                  "Tomorrow (Evening, 4:30 PM)",
                  "This Sunday (3:00 PM)",
                ].map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    onPress={() => setSelectedSlot(slot)}
                    activeOpacity={0.8}
                    style={[
                      layout.horizontalViewBetween,
                      styles.slotOption,
                      {
                        backgroundColor:
                          selectedSlot === slot
                            ? colors.primaryLight
                            : isDark
                              ? colors.surfaceHover
                              : colors.surfaceLight,
                        borderColor:
                          selectedSlot === slot
                            ? colors.primary
                            : colors.border,
                        borderRadius: radii.xl,
                        padding: spacing.md,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(12.5),
                        fontWeight: selectedSlot === slot ? "700" : "500",
                        color:
                          selectedSlot === slot
                            ? colors.primary
                            : colors.textPrimary,
                      }}
                    >
                      {slot}
                    </Text>
                    {selectedSlot === slot && (
                      <Ionicons
                        name="checkmark-circle"
                        size={moderateScale(18)}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleConfirmVisit}
                activeOpacity={0.85}
                style={[
                  styles.confirmBtn,
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
                    fontSize: moderateScale(14),
                    fontWeight: "700",
                    textAlign: "center",
                  }}
                >
                  Confirm Free Guided Visit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reserve Stay Token Modal */}
      <Modal
        visible={tokenModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTokenModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
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
                Lock Room with ₹1,000 Token 🔑
              </Text>
              <TouchableOpacity onPress={() => setTokenModalVisible(false)}>
                <Ionicons
                  name="close"
                  size={moderateScale(24)}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View
              style={{
                padding: spacing.lg,
                paddingBottom: spacing.xxxl + insets.bottom,
              }}
            >
              <View
                style={[
                  styles.tokenGuaranteebox,
                  {
                    backgroundColor: isDark ? colors.surfaceHover : "#ECFDF5",
                    borderColor: "#A7F3D0",
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(13),
                    fontWeight: "700",
                    color: "#047857",
                  }}
                >
                  🛡️ 100% Refundable Token Guarantee
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Locks the room exclusively for you for 48 hours. If you decide
                  not to move in after physical visit, 100% token is refunded
                  instantly.
                </Text>
              </View>

              <View
                style={[styles.priceBreakdown, { marginVertical: spacing.md }]}
              >
                <View style={layout.horizontalViewBetween}>
                  <Text
                    style={{
                      fontSize: moderateScale(12.5),
                      color: colors.textSecondary,
                    }}
                  >
                    Monthly Rent
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(12.5),
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    ₹{property.price}
                  </Text>
                </View>
                <View style={[layout.horizontalViewBetween, { marginTop: 4 }]}>
                  <Text
                    style={{
                      fontSize: moderateScale(12.5),
                      color: colors.textSecondary,
                    }}
                  >
                    Brokerage Fee
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(12.5),
                      fontWeight: "700",
                      color: colors.verifiedGreen,
                    }}
                  >
                    ₹0 (Zero)
                  </Text>
                </View>
                <View style={[layout.horizontalViewBetween, { marginTop: 4 }]}>
                  <Text
                    style={{
                      fontSize: moderateScale(12.5),
                      color: colors.textSecondary,
                    }}
                  >
                    Token to Pay Now
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(14),
                      fontWeight: "800",
                      color: colors.primary,
                    }}
                  >
                    ₹1,000
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleConfirmToken}
                activeOpacity={0.85}
                style={[
                  styles.confirmBtn,
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
                  Pay ₹1,000 & Reserve Stay
                </Text>
              </TouchableOpacity>
            </View>
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
  imageCarouselContainer: {
    position: "relative",
    width: SCREEN_WIDTH,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    backgroundColor: "#1E293B",
  },
  floatingNavHeader: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navCircleBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  imageBottomIndicators: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  photoCounterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceHighlightCard: {
    borderWidth: 1,
  },
  highlightsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  highlightCard: {
    borderWidth: 1,
  },
  highlightIconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  amenityPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  mealCard: {
    borderWidth: 1,
  },
  caretakerCard: {
    borderWidth: 1,
  },
  caretakerAvatar: {
    backgroundColor: "#334155",
  },
  contactCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  rulesCard: {
    borderWidth: 1,
  },
  landmarksCard: {
    borderWidth: 1,
  },
  mapActionBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  stickyBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  scheduleVisitBtn: {
    flexDirection: "row",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lockRoomBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(6, 17, 30, 0.72)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    maxHeight: "85%",
    borderTopWidth: 1,
  },
  slotOption: {
    borderWidth: 1,
  },
  confirmBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  tokenGuaranteebox: {
    borderWidth: 1,
  },
  priceBreakdown: {},
});
