import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AmenitiesGrid,
  AmenityFilterItem,
  BudgetFilterChips,
  BudgetRange,
  CampusCorporateHubs,
  CategoryCards,
  CollectionItem,
  CommunityEventsBanner,
  CustomerFooter,
  FAQSection,
  FeaturedPropertyListGrid,
  FoodMealPlanCard,
  GenderPreference,
  GenderPreferenceSelector,
  Header,
  HeroBanner,
  HowItWorksSteps,
  HubItem,
  LocationBar,
  MetroLineItem,
  MetroLinesGrid,
  OccupancyItem,
  OccupancyTypes,
  OfferItem,
  PartnerPerksGrid,
  PropertyItem,
  PropertyList,
  ReferralBanner,
  SideMenu,
  SpecialOffersSlider,
  TestimonialsSlider,
  TrendingCollections,
  VirtualTourCallout,
  WhyChooseUs,
} from "../../../components/CustomerComponent";
import { useResponsiveTheme } from "../../../constants/theme";
import { NotificationModal } from "../../CusomterPanelScreens/PropertyDeatilScreeen/Notification/notification";

const ALL_CITIES = [
  { id: "1", name: "Dwarka, Delhi", state: "Delhi" },
  { id: "2", name: "Sagarpur, Delhi", state: "Delhi" },
  { id: "3", name: "Janakpuri, Delhi", state: "Delhi" },
  { id: "4", name: "Rohini, Delhi", state: "Delhi" },
  { id: "5", name: "Uttam Nagar, Delhi", state: "Delhi" },
  { id: "6", name: "Laxmi Nagar, Delhi", state: "Delhi" },
  { id: "7", name: "Sector 62, Noida", state: "Uttar Pradesh" },
  { id: "8", name: "Cyber City, Gurgaon", state: "Haryana" },
  { id: "9", name: "Koramangala, Bangalore", state: "Karnataka" },
  { id: "10", name: "HSR Layout, Bangalore", state: "Karnataka" },
];

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { colors, moderateScale, spacing, radii, typography, layout, isDark } =
    useResponsiveTheme();

  // State Management
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationOrigin, setNotificationOrigin] = useState<
    { x: number; y: number } | undefined
  >(undefined);
  const [currentLocation, setCurrentLocation] = useState("Dwarka, Delhi");
  const [selectedPopularLocation, setSelectedPopularLocation] =
    useState("Dwarka");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyItem | null>(
    null,
  );

  // Handlers
  const handleMenuPress = () => {
    setSideMenuVisible(true);
  };

  const handleNotificationPress = (origin?: { x: number; y: number }) => {
    if (origin) {
      setNotificationOrigin(origin);
    }
    setNotificationVisible(true);
  };

  const handleProfilePress = () => {
    Alert.alert("Profile", "Navigating to user account settings");
  };

  const handleLocationSelect = (loc: string) => {
    setSelectedPopularLocation(loc);
    setCurrentLocation(`${loc}, Delhi`);
  };

  const handleCategoryPress = (category: "ROOM" | "PG") => {
    const typeParam = category === "ROOM" ? "Room" : "PG";
    router.push({
      pathname: "/CustomerPanel/(tabs)/search",
      params: {
        type: typeParam,
        gender: "All",
        sharing: "All",
      },
    } as any);
  };

  const handleFilterPress = () => {
    Alert.alert(
      "Filters",
      "Filter by Budget (₹3,000 - ₹30,000), Gender, Sharing Type, AC/Non-AC, Food included",
    );
  };

  const handlePropertyPress = (property: PropertyItem) => {
    router.push({
      pathname: "/CusomterPanelScreens/PropertyDeatilScreeen/[id]",
      params: { id: property.id },
    } as any);
  };

  const handleOfferPress = (offer: OfferItem) => {
    Alert.alert(
      "Coupon Applied",
      `Code "${offer.code}" activated! Enjoy ${offer.title}.`,
    );
  };

  const handleGenderSelect = (pref: GenderPreference) => {
    let genderParam: "All" | "Boys" | "Girls" | "Unisex" = "All";
    let typeParam: "All" | "Room" | "PG" = "All";
    let sharingParam: string = "All";
    let queryParam: string = "";

    switch (pref.id) {
      case "boys":
        genderParam = "Boys";
        typeParam = "PG";
        break;
      case "girls":
        genderParam = "Girls";
        typeParam = "PG";
        break;
      case "coliving":
        genderParam = "Unisex";
        typeParam = "PG";
        break;
      case "family":
        typeParam = "Room";
        sharingParam = "1BHK";
        queryParam = "";
        break;
      case "all":
      default:
        genderParam = "All";
        typeParam = "All";
        sharingParam = "All";
        queryParam = "";
        break;
    }

    router.push({
      pathname: "/CustomerPanel/(tabs)/search",
      params: {
        gender: genderParam,
        type: typeParam,
        sharing: sharingParam,
        query: queryParam,
        genderPrefId: pref.id,
      },
    } as any);
  };

  const handleBudgetSelect = (range: BudgetRange) => {
    router.push({
      pathname: "/CustomerPanel/(tabs)/search",
      params: {
        minPrice: range.min.toString(),
        maxPrice: range.max.toString(),
        budgetId: range.id,
      },
    } as any);
  };

  const handleOccupancySelect = (item: OccupancyItem) => {
    Alert.alert(
      item.title,
      `Filtering stays for ${item.title} (Starting ₹${item.startingPrice}/month)`,
    );
  };

  const handleMetroPress = (metro: MetroLineItem) => {
    Alert.alert(
      metro.lineName,
      `Viewing stays along ${metro.lineName} (${metro.staysCount})`,
    );
  };

  const handleAmenityPress = (amenity: AmenityFilterItem) => {
    Alert.alert(
      amenity.name,
      `Showing verified stays offering ${amenity.name}`,
    );
  };

  const handleHubPress = (hub: HubItem) => {
    Alert.alert(hub.name, `Showing stays near ${hub.name} (${hub.distance})`);
  };

  const handleTourPress = () => {
    Alert.alert(
      "3D Virtual Tour",
      "Launching 360° virtual reality room inspection experience",
    );
  };

  const handleCollectionPress = (collection: CollectionItem) => {
    Alert.alert(
      collection.title,
      `Opening collection with ${collection.count}`,
    );
  };

  const handleReferPress = () => {
    Alert.alert(
      "Refer & Earn",
      "Your invite link copied! Share with friends to earn ₹2,000 on their move-in.",
    );
  };

  const handleCallSupport = () => {
    Alert.alert(
      "Calling Support",
      "Connecting to 24/7 Delhi Property Exchange Housing Assistant at 1800-123-STAY",
    );
  };

  const handleWhatsAppSupport = () => {
    Alert.alert(
      "WhatsApp Support",
      "Opening WhatsApp chat with Delhi Property Exchange Support Team",
    );
  };

  const handleSideMenuNavigate = (menuId: string) => {
    switch (menuId) {
      case "visits":
        Alert.alert(
          "Scheduled Visits",
          "You have 2 scheduled visits: Tomorrow 4 PM at Dwarka Sector 6.",
        );
        break;
      case "saved":
        Alert.alert("Saved Properties", "Opening your 5 bookmarked rooms.");
        break;
      case "agreements":
        Alert.alert(
          "Rental Agreements",
          "Your digital e-lease agreement is verified and active.",
        );
        break;
      case "receipts":
        Alert.alert(
          "Payment Receipts",
          "Downloading your latest rent receipts & GST invoices.",
        );
        break;
      case "refer":
        handleReferPress();
        break;
      case "helpdesk":
        handleCallSupport();
        break;
      case "logout":
        Alert.alert("Log Out", "Are you sure you want to log out?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Log Out",
            style: "destructive",
            onPress: () =>
              Alert.alert("Logged Out", "You have been logged out."),
          },
        ]);
        break;
      default:
        break;
    }
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

      {/* Premium Animated Smooth Side Menu (Left to Right) */}
      <SideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        onNavigate={handleSideMenuNavigate}
      />

      {/* 1. Top Header with Dark/Light Toggle */}
      <Header
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
        unreadNotifications={3}
      />

      {/* 2. Current Location & Change Button */}
      <LocationBar
        location={currentLocation}
        onPressLocation={() => setLocationModalVisible(true)}
        onChangePress={() => setLocationModalVisible(true)}
      />

      {/* Main Long Comprehensive Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: moderateScale(100) },
        ]}
      >
        {/* 3. Hero Promo Banner & Floating Search Bar */}
        <HeroBanner
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterPress={handleFilterPress}
        />

        {/* 4. Special Offers & Deals Slider */}
        <SpecialOffersSlider onOfferPress={handleOfferPress} />

        {/* 5. Who is Moving In (Gender Preference Selector) */}
        <GenderPreferenceSelector onSelect={handleGenderSelect} />

        {/* 6. Quick Category Cards (ROOM & PG) */}
        <CategoryCards
          onRoomPress={() => handleCategoryPress("ROOM")}
          onPgPress={() => handleCategoryPress("PG")}
        />

        {/* 7. Popular Locations Chips
        <PopularLocations
          selectedLocation={selectedPopularLocation}
          onSelectLocation={handleLocationSelect}
          onSeeAllPress={() => setLocationModalVisible(true)}
        /> */}

        {/* 8. Filter by Monthly Budget */}
        <BudgetFilterChips onSelectBudget={handleBudgetSelect} />

        {/* 9. Rooms & PGs Near You (Tabs & Cards) */}
        <PropertyList
          onPropertyPress={handlePropertyPress}
          onSeeAllPress={() =>
            Alert.alert("All Listings", "Opening full property directory")
          }
        />

        {/* 10. Explore by Sharing & Occupancy Grid */}
        <OccupancyTypes onSelect={handleOccupancySelect} />

        {/* 11. Stays Along Delhi Metro Corridors Grid */}
        <MetroLinesGrid onLinePress={handleMetroPress} />

        {/* 12. Top Included Amenities 4-Column Grid */}
        <AmenitiesGrid onAmenityPress={handleAmenityPress} />

        {/* 13. College & Tech Parks Special Hubs */}
        <CampusCorporateHubs onHubPress={handleHubPress} />

        {/* 14. Homely 4-Time Food & Meal Plan Showcase */}
        <FoodMealPlanCard />

        {/* 15. 360° Live Virtual Room Tour Callout */}
        <VirtualTourCallout onTourPress={handleTourPress} />

        {/* 16. Trending Curated Collections */}
        <TrendingCollections
          onCollectionPress={handleCollectionPress}
          onSeeAllPress={() =>
            Alert.alert("All Collections", "Browsing all curated lists")
          }
        />

        {/* 17. Handpicked Top Rated Stays 2-Column Grid */}
        <FeaturedPropertyListGrid
          onPropertyPress={handlePropertyPress}
          onSeeAllPress={() =>
            Alert.alert("Top Rated Stays", "Viewing all 4.8+ rated properties")
          }
        />

        {/* 18. How Delhi Property Exchange Works 4 Simple Steps */}
        <HowItWorksSteps />

        {/* 19. Exclusive Tenant Perks & Partner Benefits */}
        <PartnerPerksGrid />

        {/* 20. Why Choose Us Trust Pillars */}
        <WhyChooseUs />

        {/* 21. Tenant Reviews & Testimonials Slider */}
        <TestimonialsSlider />

        {/* 22. Community Events & Life at Delhi Property Exchange */}
        <CommunityEventsBanner />

        {/* 23. Referral & Cash Reward Banner */}
        <ReferralBanner onReferPress={handleReferPress} />

        {/* 24. FAQ Section Accordion */}
        <FAQSection />

        {/* 25. Customer Support Footer */}
        <CustomerFooter
          onCallSupport={handleCallSupport}
          onWhatsAppSupport={handleWhatsAppSupport}
        />
      </ScrollView>

      {/* Location Picker Modal */}
      <Modal
        visible={locationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                borderRadius: radii.xxl,
                padding: spacing.xl,
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                layout.horizontalViewBetween,
                { marginBottom: spacing.lg },
              ]}
            >
              <Text
                style={[
                  typography.sectionTitle,
                  { fontSize: moderateScale(18), color: colors.textPrimary },
                ]}
              >
                Select Your City or Area
              </Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <Ionicons
                  name="close-circle-outline"
                  size={moderateScale(26)}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={ALL_CITIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setCurrentLocation(item.name);
                    const areaName = item.name.split(",")[0].trim();
                    setSelectedPopularLocation(areaName);
                    setLocationModalVisible(false);
                  }}
                  style={[
                    styles.locationOption,
                    {
                      paddingVertical: spacing.md,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={layout.horizontalView}>
                    <Ionicons
                      name="location"
                      size={moderateScale(20)}
                      color={colors.primary}
                      style={{ marginRight: spacing.sm }}
                    />
                    <View>
                      <Text
                        style={[
                          typography.cardTitle,
                          {
                            fontSize: moderateScale(14),
                            color: colors.textPrimary,
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={[
                          typography.cardAmenity,
                          {
                            fontSize: moderateScale(11),
                            color: colors.textSecondary,
                          },
                        ]}
                      >
                        {item.state}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Property Details Modal */}
      {selectedProperty && (
        <Modal
          visible={Boolean(selectedProperty)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedProperty(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  borderRadius: radii.xxl,
                  padding: spacing.xl,
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  layout.horizontalViewBetween,
                  { marginBottom: spacing.md },
                ]}
              >
                <Text
                  style={[
                    typography.sectionTitle,
                    { fontSize: moderateScale(18), color: colors.textPrimary },
                  ]}
                >
                  {selectedProperty.title}
                </Text>
                <TouchableOpacity onPress={() => setSelectedProperty(null)}>
                  <Ionicons
                    name="close"
                    size={moderateScale(24)}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  typography.cardPrice,
                  {
                    fontSize: moderateScale(18),
                    color: colors.priceGreen,
                    marginBottom: spacing.xs,
                  },
                ]}
              >
                ₹{new Intl.NumberFormat("en-IN").format(selectedProperty.price)}{" "}
                / {selectedProperty.pricePeriod}
              </Text>
              <Text
                style={[
                  typography.cardLocation,
                  {
                    fontSize: moderateScale(13),
                    color: colors.textSecondary,
                    marginBottom: spacing.md,
                  },
                ]}
              >
                📍 {selectedProperty.location}
              </Text>

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
                Included Amenities:
              </Text>
              <Text
                style={[
                  typography.cardAmenity,
                  {
                    fontSize: moderateScale(13),
                    color: colors.textSecondary,
                    marginBottom: spacing.lg,
                  },
                ]}
              >
                {selectedProperty.amenities.join(" • ")}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Booking Request Sent",
                    `Visit scheduled for ${selectedProperty.title}! Our caretaker will call you.`,
                  );
                  setSelectedProperty(null);
                }}
                style={[
                  styles.bookNowButton,
                  {
                    backgroundColor: colors.primary,
                    borderRadius: radii.pill,
                    paddingVertical: spacing.md,
                  },
                ]}
              >
                <Text style={styles.bookNowText}>Book Free Visit Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Dynamic Circular Reveal Notification Modal originating from the Header Bell */}
      <NotificationModal
        visible={notificationVisible}
        onClose={() => setNotificationVisible(false)}
        origin={notificationOrigin}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "75%",
    width: "100%",
    borderTopWidth: 1,
  },
  locationOption: {
    borderBottomWidth: 1,
  },
  bookNowButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  bookNowText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
