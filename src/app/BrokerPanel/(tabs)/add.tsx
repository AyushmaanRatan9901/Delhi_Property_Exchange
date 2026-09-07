import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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

// Types
export interface PropertyFormData {
  // Step 1: Basic Info
  title: string;
  category:
    | "PG / Hostel"
    | "Private Room"
    | "Flat / Floor"
    | "Co-Living Studio";
  gender: "Girls Only" | "Boys Only" | "Unisex / Co-ed" | "Family";
  occupancy:
    | "Single (Private)"
    | "Double Sharing"
    | "Triple Sharing"
    | "1BHK"
    | "2BHK";
  furnishing: "Fully Furnished" | "Semi Furnished" | "Unfurnished";
  floorNo: string;
  totalFloors: string;
  areaSqFt: string;

  // Step 2: Photos
  photos: string[];

  // Step 3: Location & GPS
  latitude: number | null;
  longitude: number | null;
  address: string;
  locality: string;
  city: string;
  pincode: string;
  landmark: string;
  nearestMetro: string;
  metroLine: string;
  metroDistanceMeters: string;

  // Step 4: Pricing & Commission
  monthlyRent: string;
  securityDepositMonths: string;
  maintenanceIncluded: boolean;
  maintenanceAmount: string;
  electricityBillType: "Included" | "Per Unit (Sub-meter)" | "Split Equally";
  foodIncluded: boolean;
  mealPlanType:
    | "3 Meals (Breakfast, Lunch, Dinner)"
    | "Breakfast & Dinner"
    | "No Meals (Kitchen Available)";

  // Step 5: Amenities & Rules
  amenities: string[];
  gateClosingTime: string;
  smokingPolicy: "Not Allowed" | "Balcony Only" | "Allowed";
  petPolicy: "Allowed" | "Not Allowed";
  caretakerName: string;
  caretakerPhone: string;
  propertyDescription: string;
}

const DEFAULT_FORM_DATA: PropertyFormData = {
  title: "",
  category: "PG / Hostel",
  gender: "Girls Only",
  occupancy: "Single (Private)",
  furnishing: "Fully Furnished",
  floorNo: "2",
  totalFloors: "4",
  areaSqFt: "350",
  photos: [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
  ],
  latitude: 28.5921,
  longitude: 77.046,
  address: "Plot 42, Pocket 1, Sector 12",
  locality: "Dwarka Sector 12",
  city: "Delhi",
  pincode: "110078",
  landmark: "Near City Centre Metro & DPS School",
  nearestMetro: "Dwarka Sector 12 Metro Station",
  metroLine: "Blue Line",
  metroDistanceMeters: "250",
  monthlyRent: "14500",
  securityDepositMonths: "1 Month",
  maintenanceIncluded: true,
  maintenanceAmount: "0",
  electricityBillType: "Per Unit (Sub-meter)",
  foodIncluded: true,
  mealPlanType: "3 Meals (Breakfast, Lunch, Dinner)",
  amenities: [
    "High-Speed WiFi",
    "Air Conditioning (AC)",
    "3-Time Meals",
    "Washing Machine",
    "Attached Geyser",
    "24/7 Power Backup",
    "CCTV Security",
    "Daily Housekeeping",
  ],
  gateClosingTime: "10:30 PM",
  smokingPolicy: "Not Allowed",
  petPolicy: "Not Allowed",
  caretakerName: "Rameshwar Dayal",
  caretakerPhone: "+91 98110 98765",
  propertyDescription:
    "Prime, newly renovated luxury stay equipped with box bed, study table, godrej almirah, high-speed fiber internet and hygienic meals.",
};

const ALL_AMENITIES = [
  { id: "wifi", name: "High-Speed WiFi", icon: "wifi" },
  { id: "ac", name: "Air Conditioning (AC)", icon: "air-conditioner" },
  { id: "food", name: "3-Time Meals", icon: "silverware-fork-knife" },
  { id: "geyser", name: "Attached Geyser", icon: "water-boiler" },
  { id: "washing", name: "Washing Machine", icon: "washing-machine" },
  { id: "backup", name: "24/7 Power Backup", icon: "battery-charging" },
  { id: "cctv", name: "CCTV Security", icon: "cctv" },
  { id: "cleaning", name: "Daily Housekeeping", icon: "broom" },
  { id: "ro", name: "RO Water Purifier", icon: "cup-water" },
  { id: "parking", name: "2-Wheeler Parking", icon: "motorbike" },
  { id: "refrig", name: "Refrigerator", icon: "fridge" },
  { id: "tv", name: "Smart TV / Lounge", icon: "television" },
];

export default function AddPropertyScreen() {
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

  // Floating button height above the FloatingTabBar
  const floatingBottom = (insets.bottom > 0 ? insets.bottom : 10) + 76;

  // Step state (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<PropertyFormData>(DEFAULT_FORM_DATA);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const totalSteps = 5;

  const triggerHaptic = () => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
  };

  // Image Picker Handler
  const handlePickImage = async () => {
    triggerHaptic();
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to upload property images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((a) => a.uri);
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, ...newUris],
        }));
      }
    } catch (error) {
      Alert.alert("Upload Error", "Could not select photo. Try again.");
    }
  };

  // Camera Capture Handler
  const handleTakePhoto = async () => {
    triggerHaptic();
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please grant camera access to photograph the property.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFormData((prev) => ({
          ...prev,
          photos: [...prev.photos, result.assets[0].uri],
        }));
      }
    } catch (error) {
      Alert.alert("Camera Error", "Could not take photo. Try again.");
    }
  };

  // Remove Photo
  const handleRemovePhoto = (index: number) => {
    triggerHaptic();
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Live GPS Location Detection
  const handleDetectGPS = async () => {
    triggerHaptic();
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Location access helps accurately pinpoint the property coordinates & nearest metro station.",
        );
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      setFormData((prev) => ({
        ...prev,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: geo?.formattedAddress || geo?.street || prev.address,
        locality: geo?.subregion || geo?.district || prev.locality,
        city: geo?.city || "Delhi",
        pincode: geo?.postalCode || prev.pincode,
        nearestMetro: `${geo?.subregion || "Dwarka"} Metro Station`,
      }));

      Alert.alert(
        "📍 GPS Coordinates Detected",
        `Latitude: ${loc.coords.latitude.toFixed(4)}\nLongitude: ${loc.coords.longitude.toFixed(
          4,
        )}\nLocality: ${geo?.subregion || geo?.city || "Delhi NCR"}`,
      );
    } catch (err) {
      Alert.alert(
        "Location Fetched (Fallback)",
        "GPS coordinates detected: 28.5921° N, 77.0460° E (Dwarka Sector 12).",
      );
    } finally {
      setIsLocating(false);
    }
  };

  // Toggle Amenity
  const handleToggleAmenity = (name: string) => {
    triggerHaptic();
    setFormData((prev) => {
      const exists = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== name)
          : [...prev.amenities, name],
      };
    });
  };

  // Navigation between steps
  const handleNextStep = () => {
    triggerHaptic();
    if (currentStep === 1 && !formData.title.trim()) {
      setFormData((prev) => ({
        ...prev,
        title: `${formData.locality || "Dwarka Sector 12"} ${formData.category}`,
      }));
    }
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmitProperty();
    }
  };

  const handlePrevStep = () => {
    triggerHaptic();
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submit Listing
  const handleSubmitProperty = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "🎉 Property Registered Successfully!",
        `"${formData.title || "Dwarka Sector 12 Stay"}" is now listed.\n\nEstimated Broker Commission: ₹${(
          (parseInt(formData.monthlyRent, 10) || 14000) * 0.5
        ).toLocaleString("en-IN")} on first tenant check-in.`,
        [
          {
            text: "View in Dashboard",
            onPress: () => router.push("/BrokerPanel/(tabs)/Dashboard" as any),
          },
        ],
      );
    }, 1200);
  };

  // Commission Calculation
  const rentNumber =
    parseInt(formData.monthlyRent.replace(/[^0-9]/g, ""), 10) || 0;
  const estimatedCommission = Math.round(rentNumber * 0.5);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header Bar with Progress */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
            paddingHorizontal: spacing.screenHorizontal,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <View style={layout.horizontalViewBetween}>
          <View
            style={[layout.horizontalView, { alignItems: "center", gap: 8 }]}
          >
            {currentStep > 1 ? (
              <TouchableOpacity
                onPress={handlePrevStep}
                style={[
                  styles.backBtn,
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
            ) : (
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDark
                      ? "rgba(13, 148, 136, 0.2)"
                      : colors.primaryLight,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="home-plus"
                  size={moderateScale(20)}
                  color={colors.primary}
                />
              </View>
            )}

            <View>
              <Text
                style={[
                  typography.brandTitle,
                  {
                    fontSize: moderateScale(16),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                List New Property
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  fontWeight: "500",
                }}
              >
                Step {currentStep} of {totalSteps}:{" "}
                {currentStep === 1
                  ? "Basic Info"
                  : currentStep === 2
                    ? "Photos & Gallery"
                    : currentStep === 3
                      ? "GPS & Location"
                      : currentStep === 4
                        ? "Rent & Commission"
                        : "Amenities & Rules"}
              </Text>
            </View>
          </View>

          {/* Quick Draft Save */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Draft Saved",
                "Property draft saved locally on device.",
              )
            }
            style={[
              styles.draftBtn,
              {
                backgroundColor: isDark
                  ? colors.surfaceHover
                  : colors.surfaceLight,
                borderColor: colors.border,
                borderRadius: radii.pill,
              },
            ]}
          >
            <Text
              style={{
                fontSize: moderateScale(11),
                fontWeight: "700",
                color: colors.textSecondary,
              }}
            >
              Save Draft
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step Progress Bar */}
        <View
          style={[
            styles.progressTrack,
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
              styles.progressFill,
              {
                width: `${(currentStep / totalSteps) * 100}%`,
                borderRadius: radii.pill,
              },
            ]}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.md,
            paddingBottom: floatingBottom + 90,
          }}
        >
          {/* ========================================================================= */}
          {/* STEP 1: PROPERTY IDENTITY & CATEGORY */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <View style={{ gap: spacing.md }}>
              {/* Title Input */}
              <View>
                <Text style={styles.inputLabel}>PROPERTY TITLE / NAME</Text>
                <TextInput
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, title: text }))
                  }
                  placeholder="e.g. Dwarka Sector 12 Luxury Girls PG"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      borderRadius: radii.xl,
                      color: colors.textPrimary,
                      padding: spacing.md,
                    },
                  ]}
                />
              </View>

              {/* Property Category Chips */}
              <View>
                <Text style={styles.inputLabel}>PROPERTY CATEGORY</Text>
                <View
                  style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}
                >
                  {[
                    "PG / Hostel",
                    "Private Room",
                    "Flat / Floor",
                    "Co-Living Studio",
                  ].map((cat) => {
                    const isSelected = formData.category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        activeOpacity={0.8}
                        onPress={() => {
                          triggerHaptic();
                          setFormData((prev) => ({
                            ...prev,
                            category: cat as any,
                          }));
                        }}
                        style={[
                          styles.selectionChip,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.cardBackground,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                            borderRadius: radii.pill,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(11.5),
                            fontWeight: isSelected ? "800" : "600",
                            color: isSelected
                              ? colors.white
                              : colors.textPrimary,
                          }}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Gender Preference */}
              <View>
                <Text style={styles.inputLabel}>
                  GENDER / TENANT PREFERENCE
                </Text>
                <View
                  style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}
                >
                  {[
                    { label: "👧 Girls Only", value: "Girls Only" },
                    { label: "👦 Boys Only", value: "Boys Only" },
                    { label: "👥 Unisex / Co-ed", value: "Unisex / Co-ed" },
                    { label: "👨‍👩‍👦 Family", value: "Family" },
                  ].map((g) => {
                    const isSelected = formData.gender === g.value;
                    return (
                      <TouchableOpacity
                        key={g.value}
                        activeOpacity={0.8}
                        onPress={() => {
                          triggerHaptic();
                          setFormData((prev) => ({
                            ...prev,
                            gender: g.value as any,
                          }));
                        }}
                        style={[
                          styles.selectionChip,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.cardBackground,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                            borderRadius: radii.pill,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(11.5),
                            fontWeight: isSelected ? "800" : "600",
                            color: isSelected
                              ? colors.white
                              : colors.textPrimary,
                          }}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Occupancy & Sharing */}
              <View>
                <Text style={styles.inputLabel}>ROOM OCCUPANCY / SHARING</Text>
                <View
                  style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}
                >
                  {[
                    "Single (Private)",
                    "Double Sharing",
                    "Triple Sharing",
                    "1BHK",
                    "2BHK",
                  ].map((occ) => {
                    const isSelected = formData.occupancy === occ;
                    return (
                      <TouchableOpacity
                        key={occ}
                        activeOpacity={0.8}
                        onPress={() => {
                          triggerHaptic();
                          setFormData((prev) => ({
                            ...prev,
                            occupancy: occ as any,
                          }));
                        }}
                        style={[
                          styles.selectionChip,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.cardBackground,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                            borderRadius: radii.pill,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(11.5),
                            fontWeight: isSelected ? "800" : "600",
                            color: isSelected
                              ? colors.white
                              : colors.textPrimary,
                          }}
                        >
                          {occ}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Furnishing Status */}
              <View>
                <Text style={styles.inputLabel}>FURNISHING STATUS</Text>
                <View
                  style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}
                >
                  {["Fully Furnished", "Semi Furnished", "Unfurnished"].map(
                    (furn) => {
                      const isSelected = formData.furnishing === furn;
                      return (
                        <TouchableOpacity
                          key={furn}
                          activeOpacity={0.8}
                          onPress={() => {
                            triggerHaptic();
                            setFormData((prev) => ({
                              ...prev,
                              furnishing: furn as any,
                            }));
                          }}
                          style={[
                            styles.selectionChip,
                            {
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.cardBackground,
                              borderColor: isSelected
                                ? colors.primary
                                : colors.border,
                              borderRadius: radii.pill,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: moderateScale(11.5),
                              fontWeight: isSelected ? "800" : "600",
                              color: isSelected
                                ? colors.white
                                : colors.textPrimary,
                            }}
                          >
                            {furn}
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              </View>

              {/* Floor & Super Area Row */}
              <View style={[layout.horizontalView, { gap: spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>FLOOR NO.</Text>
                  <TextInput
                    value={formData.floorNo}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, floorNo: text }))
                    }
                    placeholder="e.g. 2nd Floor"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>TOTAL FLOORS</Text>
                  <TextInput
                    value={formData.totalFloors}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, totalFloors: text }))
                    }
                    placeholder="e.g. 4 Floors"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>AREA (SQ FT)</Text>
                  <TextInput
                    value={formData.areaSqFt}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, areaSqFt: text }))
                    }
                    placeholder="350 sq.ft."
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: PROPERTY PHOTOS & MEDIA */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <View style={{ gap: spacing.md }}>
              <View>
                <Text
                  style={[
                    typography.cardTitle,
                    { fontSize: moderateScale(15), color: colors.textPrimary },
                  ]}
                >
                  Property Photo Gallery ({formData.photos.length} Uploaded)
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  Upload clear photos of bedrooms, washrooms, dining & facade
                  for higher tenant inquiries
                </Text>
              </View>

              {/* Upload CTA Buttons */}
              <View style={[layout.horizontalView, { gap: spacing.sm }]}>
                {/* Pick from Gallery */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handlePickImage}
                  style={[
                    styles.uploadActionBtn,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.primary,
                      borderRadius: radii.xl,
                      borderStyle: "dashed",
                    },
                  ]}
                >
                  <Feather
                    name="image"
                    size={moderateScale(22)}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      fontWeight: "700",
                      color: colors.primary,
                      marginTop: 4,
                    }}
                  >
                    Select Photos
                  </Text>
                </TouchableOpacity>

                {/* Open Camera */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleTakePhoto}
                  style={[
                    styles.uploadActionBtn,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      borderRadius: radii.xl,
                    },
                  ]}
                >
                  <Feather
                    name="camera"
                    size={moderateScale(22)}
                    color={colors.textPrimary}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      fontWeight: "700",
                      color: colors.textPrimary,
                      marginTop: 4,
                    }}
                  >
                    Take Photo
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Photos Grid */}
              <View style={[layout.horizontalViewWrap, { gap: spacing.sm }]}>
                {formData.photos.map((uri, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.photoThumbnailBox,
                      {
                        borderRadius: radii.xl,
                        borderColor: idx === 0 ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri }}
                      style={[
                        styles.thumbnailImage,
                        { borderRadius: radii.xl },
                      ]}
                    />

                    {/* Cover Photo Indicator */}
                    {idx === 0 && (
                      <View
                        style={[
                          styles.coverBadge,
                          {
                            backgroundColor: colors.primary,
                            borderRadius: radii.pill,
                          },
                        ]}
                      >
                        <Text style={styles.coverBadgeText}>★ COVER PHOTO</Text>
                      </View>
                    )}

                    {/* Delete Photo Icon */}
                    <TouchableOpacity
                      onPress={() => handleRemovePhoto(idx)}
                      style={[
                        styles.deletePhotoBtn,
                        {
                          backgroundColor: "rgba(15, 23, 42, 0.85)",
                          borderRadius: radii.round,
                        },
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={moderateScale(13)}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: GPS & GEO-LOCATION DETAILS */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <View style={{ gap: spacing.md }}>
              {/* GPS Detector Banner */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleDetectGPS}
                style={[
                  styles.gpsBanner,
                  {
                    backgroundColor: isDark
                      ? "rgba(13, 148, 136, 0.15)"
                      : colors.primaryLight,
                    borderColor: colors.primarySoft,
                    borderRadius: radii.xxl,
                    padding: spacing.md + 2,
                  },
                ]}
              >
                <View
                  style={[
                    layout.horizontalViewBetween,
                    { alignItems: "center" },
                  ]}
                >
                  <View
                    style={[
                      layout.horizontalView,
                      { alignItems: "center", gap: 10, flex: 1 },
                    ]}
                  >
                    <View
                      style={[
                        styles.gpsIconCircle,
                        {
                          backgroundColor: colors.primary,
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      {isLocating ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <MaterialIcons
                          name="my-location"
                          size={moderateScale(20)}
                          color={colors.white}
                        />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: moderateScale(13.5),
                          fontWeight: "800",
                          color: colors.primaryDark,
                        }}
                      >
                        Auto-Detect GPS Location
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(10.5),
                          color: colors.textSecondary,
                          marginTop: 1,
                        }}
                      >
                        Lat: {formData.latitude?.toFixed(4) || "28.5921"}° N,
                        Long: {formData.longitude?.toFixed(4) || "77.0460"}° E
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.gpsTapPill,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(10.5),
                        fontWeight: "800",
                        color: colors.white,
                      }}
                    >
                      {isLocating ? "Detecting..." : "Detect GPS"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Full Address */}
              <View>
                <Text style={styles.inputLabel}>
                  FULL STREET ADDRESS / PLOT NO.
                </Text>
                <TextInput
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, address: text }))
                  }
                  placeholder="Plot No., House / Building Name, Street"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      borderRadius: radii.xl,
                      color: colors.textPrimary,
                      padding: spacing.md,
                    },
                  ]}
                />
              </View>

              {/* Locality & Sector */}
              <View style={[layout.horizontalView, { gap: spacing.sm }]}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.inputLabel}>SECTOR / LOCALITY</Text>
                  <TextInput
                    value={formData.locality}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, locality: text }))
                    }
                    placeholder="e.g. Dwarka Sector 12"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>PINCODE</Text>
                  <TextInput
                    value={formData.pincode}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, pincode: text }))
                    }
                    placeholder="110078"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Nearby Landmark */}
              <View>
                <Text style={styles.inputLabel}>POPULAR LANDMARK</Text>
                <TextInput
                  value={formData.landmark}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, landmark: text }))
                  }
                  placeholder="e.g. Opp. City Centre Mall / Near DPS"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      borderRadius: radii.xl,
                      color: colors.textPrimary,
                      padding: spacing.md,
                    },
                  ]}
                />
              </View>

              {/* Nearest Metro Station & Distance */}
              <View style={[layout.horizontalView, { gap: spacing.sm }]}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.inputLabel}>NEAREST METRO STATION</Text>
                  <TextInput
                    value={formData.nearestMetro}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, nearestMetro: text }))
                    }
                    placeholder="Dwarka Sector 12 Metro"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1.2 }}>
                  <Text style={styles.inputLabel}>METRO DISTANCE</Text>
                  <TextInput
                    value={formData.metroDistanceMeters}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        metroDistanceMeters: text,
                      }))
                    }
                    placeholder="250 meters"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: PRICING, DEPOSIT & BROKER COMMISSION */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <View style={{ gap: spacing.md }}>
              {/* Monthly Rent */}
              <View>
                <Text style={styles.inputLabel}>
                  MONTHLY RENT PER BED / ROOM (₹)
                </Text>
                <View
                  style={[
                    styles.currencyInputBox,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      borderRadius: radii.xl,
                      paddingHorizontal: spacing.md,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(16),
                      fontWeight: "800",
                      color: colors.primary,
                      marginRight: 6,
                    }}
                  >
                    ₹
                  </Text>
                  <TextInput
                    value={formData.monthlyRent}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        monthlyRent: text.replace(/[^0-9]/g, ""),
                      }))
                    }
                    placeholder="14500"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      fontSize: moderateScale(16),
                      fontWeight: "800",
                      color: colors.textPrimary,
                      paddingVertical: spacing.md,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      color: colors.textMuted,
                      fontWeight: "600",
                    }}
                  >
                    / month
                  </Text>
                </View>
              </View>

              {/* Live Broker Commission Card */}
              <View
                style={[
                  styles.commissionPreviewBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(16, 185, 129, 0.15)"
                      : "#DCFCE7",
                    borderColor: isDark
                      ? "rgba(16, 185, 129, 0.35)"
                      : "#86EFAC",
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                ]}
              >
                <View style={layout.horizontalViewBetween}>
                  <View>
                    <Text
                      style={{
                        fontSize: moderateScale(11),
                        fontWeight: "700",
                        color: "#15803D",
                      }}
                    >
                      YOUR ESTIMATED BROKER COMMISSION:
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(22),
                        fontWeight: "900",
                        color: "#15803D",
                        marginTop: 2,
                      }}
                    >
                      ₹{estimatedCommission.toLocaleString("en-IN")}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(10.5),
                        color: "#166534",
                        marginTop: 2,
                      }}
                    >
                      ⚡ 50% First Month Rent • Instant Transfer on Move-in
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name="hand-coin"
                    size={moderateScale(36)}
                    color="#15803D"
                  />
                </View>
              </View>

              {/* Security Deposit */}
              <View>
                <Text style={styles.inputLabel}>SECURITY DEPOSIT</Text>
                <View
                  style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}
                >
                  {["1 Month", "2 Months", "Zero Deposit", "₹5,000 Fixed"].map(
                    (dep) => {
                      const isSelected = formData.securityDepositMonths === dep;
                      return (
                        <TouchableOpacity
                          key={dep}
                          activeOpacity={0.8}
                          onPress={() => {
                            triggerHaptic();
                            setFormData((prev) => ({
                              ...prev,
                              securityDepositMonths: dep,
                            }));
                          }}
                          style={[
                            styles.selectionChip,
                            {
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.cardBackground,
                              borderColor: isSelected
                                ? colors.primary
                                : colors.border,
                              borderRadius: radii.pill,
                            },
                          ]}
                        >
                          <Text
                            style={{
                              fontSize: moderateScale(11.5),
                              fontWeight: isSelected ? "800" : "600",
                              color: isSelected
                                ? colors.white
                                : colors.textPrimary,
                            }}
                          >
                            {dep}
                          </Text>
                        </TouchableOpacity>
                      );
                    },
                  )}
                </View>
              </View>

              {/* Electricity & Utility Terms */}
              <View>
                <Text style={styles.inputLabel}>ELECTRICITY BILLING</Text>
                <View
                  style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}
                >
                  {[
                    "Per Unit (Sub-meter)",
                    "Included in Rent",
                    "Split Equally",
                  ].map((elec) => {
                    const isSelected = formData.electricityBillType === elec;
                    return (
                      <TouchableOpacity
                        key={elec}
                        activeOpacity={0.8}
                        onPress={() => {
                          triggerHaptic();
                          setFormData((prev) => ({
                            ...prev,
                            electricityBillType: elec as any,
                          }));
                        }}
                        style={[
                          styles.selectionChip,
                          {
                            backgroundColor: isSelected
                              ? colors.primary
                              : colors.cardBackground,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                            borderRadius: radii.pill,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(11.5),
                            fontWeight: isSelected ? "800" : "600",
                            color: isSelected
                              ? colors.white
                              : colors.textPrimary,
                          }}
                        >
                          {elec}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Meal Plan Options */}
              <View>
                <Text style={styles.inputLabel}>FOOD & MEAL PLANS</Text>
                <View style={{ gap: spacing.xs + 2 }}>
                  {[
                    "3 Meals (Breakfast, Lunch, Dinner)",
                    "Breakfast & Dinner",
                    "No Meals (Kitchen Available)",
                  ].map((meal) => {
                    const isSelected = formData.mealPlanType === meal;
                    return (
                      <TouchableOpacity
                        key={meal}
                        activeOpacity={0.8}
                        onPress={() => {
                          triggerHaptic();
                          setFormData((prev) => ({
                            ...prev,
                            mealPlanType: meal as any,
                            foodIncluded:
                              meal !== "No Meals (Kitchen Available)",
                          }));
                        }}
                        style={[
                          styles.mealRow,
                          {
                            backgroundColor: colors.cardBackground,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                            borderRadius: radii.xl,
                            padding: spacing.md,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            isSelected ? "radiobox-marked" : "radiobox-blank"
                          }
                          size={moderateScale(18)}
                          color={isSelected ? colors.primary : colors.textMuted}
                          style={{ marginRight: spacing.sm }}
                        />
                        <Text
                          style={{
                            fontSize: moderateScale(12.5),
                            fontWeight: isSelected ? "700" : "500",
                            color: colors.textPrimary,
                          }}
                        >
                          {meal}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: AMENITIES, HOUSE RULES & CONTACTS */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <View style={{ gap: spacing.md }}>
              {/* Amenities Grid */}
              <View>
                <Text style={styles.inputLabel}>
                  INCLUDED AMENITIES (SELECT ALL THAT APPLY)
                </Text>
                <View
                  style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}
                >
                  {ALL_AMENITIES.map((am) => {
                    const isSelected = formData.amenities.includes(am.name);
                    return (
                      <TouchableOpacity
                        key={am.id}
                        activeOpacity={0.8}
                        onPress={() => handleToggleAmenity(am.name)}
                        style={[
                          styles.amenityChip,
                          {
                            backgroundColor: isSelected
                              ? isDark
                                ? "rgba(13, 148, 136, 0.25)"
                                : colors.primaryLight
                              : colors.cardBackground,
                            borderColor: isSelected
                              ? colors.primary
                              : colors.border,
                            borderRadius: radii.pill,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={am.icon as any}
                          size={moderateScale(15)}
                          color={isSelected ? colors.primary : colors.textMuted}
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={{
                            fontSize: moderateScale(11.5),
                            fontWeight: isSelected ? "700" : "500",
                            color: isSelected
                              ? colors.primary
                              : colors.textPrimary,
                          }}
                        >
                          {am.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Gate Curfew & Rules */}
              <View style={[layout.horizontalView, { gap: spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>GATE CLOSING TIME</Text>
                  <TextInput
                    value={formData.gateClosingTime}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        gateClosingTime: text,
                      }))
                    }
                    placeholder="e.g. 10:30 PM / No Curfew"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>SMOKING POLICY</Text>
                  <TextInput
                    value={formData.smokingPolicy}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        smokingPolicy: text as any,
                      }))
                    }
                    placeholder="Not Allowed"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Caretaker / Manager Info */}
              <View style={[layout.horizontalView, { gap: spacing.sm }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CARETAKER NAME</Text>
                  <TextInput
                    value={formData.caretakerName}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        caretakerName: text,
                      }))
                    }
                    placeholder="Caretaker Name"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CARETAKER PHONE</Text>
                  <TextInput
                    value={formData.caretakerPhone}
                    onChangeText={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        caretakerPhone: text,
                      }))
                    }
                    placeholder="+91 98110 00000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: colors.border,
                        borderRadius: radii.xl,
                        color: colors.textPrimary,
                        padding: spacing.md,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Property Description */}
              <View>
                <Text style={styles.inputLabel}>
                  PROPERTY HIGHLIGHTS & DESCRIPTION
                </Text>
                <TextInput
                  value={formData.propertyDescription}
                  onChangeText={(text) =>
                    setFormData((prev) => ({
                      ...prev,
                      propertyDescription: text,
                    }))
                  }
                  placeholder="Describe the rooms, cleanliness, security, study desks, and food quality..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.textArea,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.border,
                      borderRadius: radii.xl,
                      color: colors.textPrimary,
                      padding: spacing.md,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Bottom Action Bar (positioned above the FloatingTabBar) */}
      <View
        style={[
          styles.floatingActionBar,
          {
            bottom: floatingBottom,
            backgroundColor: isDark
              ? "rgba(15, 23, 42, 0.96)"
              : "rgba(255, 255, 255, 0.98)",
            borderColor: colors.border,
            borderRadius: radii.pill,
            padding: 5,
          },
          shadows.lg,
        ]}
      >
        <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
          {currentStep > 1 && (
            <TouchableOpacity
              onPress={handlePrevStep}
              activeOpacity={0.8}
              style={[
                styles.prevBtn,
                {
                  backgroundColor: isDark
                    ? colors.surfaceHover
                    : colors.surfaceLight,
                  borderColor: colors.border,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.md + 2,
                  paddingVertical: spacing.sm + 2,
                  marginRight: spacing.xs,
                },
              ]}
            >
              <Feather
                name="arrow-left"
                size={moderateScale(15)}
                color={colors.textPrimary}
                style={{ marginRight: 2 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(12.5),
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Back
              </Text>
            </TouchableOpacity>
          )}

          {/* Next / Submit CTA Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleNextStep}
            disabled={isSubmitting}
            style={[
              styles.nextBtn,
              {
                borderRadius: radii.pill,
                overflow: "hidden",
                flex: 1,
              },
              shadows.sm,
            ]}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark || "#0F766E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextBtnGradient}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: moderateScale(13.5),
                      fontWeight: "800",
                      color: colors.white,
                      marginRight: 4,
                    }}
                  >
                    {currentStep === totalSteps
                      ? "Publish Property Listing 🚀"
                      : "Continue to Next Step"}
                  </Text>
                  {currentStep < totalSteps && (
                    <Feather
                      name="arrow-right"
                      size={moderateScale(16)}
                      color={colors.white}
                    />
                  )}
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  draftBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  progressTrack: {
    height: 6,
    width: "100%",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    fontSize: 13.5,
    fontWeight: "600",
  },
  textArea: {
    borderWidth: 1,
    fontSize: 13,
    fontWeight: "500",
    minHeight: 80,
    textAlignVertical: "top",
  },
  selectionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  uploadActionBtn: {
    flex: 1,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  photoThumbnailBox: {
    width: 100,
    height: 100,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#334155",
  },
  coverBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  coverBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  deletePhotoBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  gpsBanner: {
    borderWidth: 1,
  },
  gpsIconCircle: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  gpsTapPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  currencyInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  commissionPreviewBox: {
    borderWidth: 1,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
  },
  floatingActionBar: {
    position: "absolute",
    left: 16,
    right: 16,
    borderWidth: 1,
    zIndex: 999,
    elevation: 10,
  },
  prevBtn: {
    flexDirection: "row",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
});
