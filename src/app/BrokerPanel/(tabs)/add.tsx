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
import { useEffect, useState } from "react";
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

const PROPERTY_TYPES = [
  "PG / Hostel",
  "Private Room",
  "Flat / Apartment",
  "Co-Living",
];
const BHK_CONFIGS = [
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "1 RK",
  "Single Bed",
  "Double Sharing",
];

export default function SimpleAddPropertyScreen() {
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

  // Form States
  const [propertyName, setPropertyName] = useState("");
  const [propertyType, setPropertyType] = useState("Flat / Apartment");
  const [bhkConfig, setBhkConfig] = useState("1 BHK");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("16500");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [photos, setPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
  ]);

  // Geo-Location States
  const [latitude, setLatitude] = useState<number | null>(28.5921);
  const [longitude, setLongitude] = useState<number | null>(77.046);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("Auto-detected via GPS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerHaptic = () => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
  };

  // 1. Automatically detect Geo-Location on mount
  useEffect(() => {
    autoDetectLocation();
  }, []);

  const autoDetectLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsStatus("Default: Dwarka Sector 12, Delhi");
        setAddress("Plot 42, Sector 12, Dwarka, New Delhi");
        setLandmark("Near City Centre Metro Station");
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      const [geo] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (geo) {
        const detectedAddr = [
          geo.name,
          geo.street,
          geo.subregion || geo.district,
          geo.city,
        ]
          .filter(Boolean)
          .join(", ");
        setAddress(detectedAddr || "Dwarka Sector 12, Delhi");
        setLandmark(geo.name ? `Near ${geo.name}` : "Near Metro Station");
        setGpsStatus(
          `GPS Synced: ${loc.coords.latitude.toFixed(4)}° N, ${loc.coords.longitude.toFixed(4)}° E`,
        );
      }
    } catch (err) {
      setGpsStatus("GPS Synced (Dwarka, Delhi)");
      setAddress("Pocket 1, Sector 12, Dwarka, New Delhi");
      setLandmark("Opposite City Centre Mall");
    } finally {
      setIsLocating(false);
    }
  };

  // Pick Photos
  const handlePickPhoto = async () => {
    triggerHaptic();
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission",
          "Please allow gallery access to upload photos.",
        );
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setPhotos((prev) => [...prev, ...res.assets.map((a) => a.uri)]);
      }
    } catch (e) {
      Alert.alert("Error", "Could not pick image.");
    }
  };

  // Take Camera Photo
  const handleTakePhoto = async () => {
    triggerHaptic();
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission", "Please allow camera access.");
        return;
      }

      const res = await ImagePicker.launchCameraAsync({ quality: 0.85 });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setPhotos((prev) => [...prev, res.assets[0].uri]);
      }
    } catch (e) {
      Alert.alert("Error", "Camera error.");
    }
  };

  const handleRemovePhoto = (idx: number) => {
    triggerHaptic();
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = () => {
    triggerHaptic();
    const finalName =
      propertyName.trim() || `${bhkConfig} ${propertyType} in Dwarka`;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "🎉 Property Listed Successfully!",
        `"${finalName}" is now active and ready for tenant visits.\n\nEstimated Commission: ₹${(
          (parseInt(monthlyRent, 10) || 16500) * 0.5
        ).toLocaleString("en-IN")} on first move-in.`,
        [
          {
            text: "Go to Dashboard",
            onPress: () => router.push("/BrokerPanel/(tabs)/Dashboard" as any),
          },
        ],
      );
    }, 1000);
  };

  const rentNum = parseInt(monthlyRent.replace(/[^0-9]/g, ""), 10) || 0;
  const estimatedCommission = Math.round(rentNum * 0.5);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* Header */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
            paddingHorizontal: spacing.screenHorizontal,
            paddingVertical: spacing.sm + 2,
          },
        ]}
      >
        <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
          <View
            style={[layout.horizontalView, { alignItems: "center", gap: 8 }]}
          >
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

            <View>
              <Text
                style={[
                  typography.brandTitle,
                  {
                    fontSize: moderateScale(16.5),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                Add New Property
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                }}
              >
                Quick Listing Form for Brokers
              </Text>
            </View>
          </View>
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
            paddingBottom: floatingBottom + 85,
            gap: spacing.md,
          }}
        >
          {/* 1. AUTO-DETECTED GEO LOCATION CARD */}
          <View
            style={[
              styles.geoCard,
              {
                backgroundColor: isDark
                  ? "rgba(13, 148, 136, 0.15)"
                  : colors.primaryLight,
                borderColor: colors.primarySoft,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
            ]}
          >
            <View
              style={[layout.horizontalViewBetween, { alignItems: "center" }]}
            >
              <View
                style={[
                  layout.horizontalView,
                  { alignItems: "center", gap: 8, flex: 1 },
                ]}
              >
                <View
                  style={[
                    styles.gpsIconBox,
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
                      size={moderateScale(18)}
                      color={colors.white}
                    />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: moderateScale(12.5),
                      fontWeight: "800",
                      color: colors.primaryDark,
                    }}
                  >
                    Auto-Detected Geo-Location
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(10.5),
                      color: colors.textSecondary,
                      marginTop: 1,
                    }}
                  >
                    {gpsStatus}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={autoDetectLocation}
                disabled={isLocating}
                style={[
                  styles.refreshGpsBtn,
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
                  {isLocating ? "Syncing..." : "Re-sync"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. PROPERTY NAME */}
          <View>
            <Text style={styles.inputLabel}>NAME OF THE PROPERTY</Text>
            <TextInput
              value={propertyName}
              onChangeText={setPropertyName}
              placeholder="e.g. Dwarka Sector 12 Luxury Stays"
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

          {/* 3. PROPERTY TYPE */}
          <View>
            <Text style={styles.inputLabel}>PROPERTY TYPE</Text>
            <View style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}>
              {PROPERTY_TYPES.map((type) => {
                const isSelected = propertyType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.8}
                    onPress={() => {
                      triggerHaptic();
                      setPropertyType(type);
                    }}
                    style={[
                      styles.chip,
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
                        color: isSelected ? colors.white : colors.textPrimary,
                      }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. CONFIGURATION (1BHK, 2BHK, etc.) */}
          <View>
            <Text style={styles.inputLabel}>CONFIGURATION / ROOM TYPE</Text>
            <View style={[layout.horizontalViewWrap, { gap: spacing.xs + 2 }]}>
              {BHK_CONFIGS.map((config) => {
                const isSelected = bhkConfig === config;
                return (
                  <TouchableOpacity
                    key={config}
                    activeOpacity={0.8}
                    onPress={() => {
                      triggerHaptic();
                      setBhkConfig(config);
                    }}
                    style={[
                      styles.chip,
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
                        color: isSelected ? colors.white : colors.textPrimary,
                      }}
                    >
                      {config}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. PROPERTY ADDRESS */}
          <View>
            <Text style={styles.inputLabel}>PROPERTY ADDRESS</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. Plot 42, Pocket 1, Sector 12, Dwarka, Delhi"
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

          {/* 6. NEARBY LANDMARK */}
          <View>
            <Text style={styles.inputLabel}>NEARBY LANDMARK</Text>
            <TextInput
              value={landmark}
              onChangeText={setLandmark}
              placeholder="e.g. Near City Centre Metro & DPS School"
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

          {/* 7. MONTHLY RENT & COMMISSION ESTIMATE */}
          <View>
            <Text style={styles.inputLabel}>MONTHLY RENT (₹)</Text>
            <View
              style={[
                styles.priceInputWrapper,
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
                value={monthlyRent}
                onChangeText={(text) =>
                  setMonthlyRent(text.replace(/[^0-9]/g, ""))
                }
                placeholder="16500"
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

            {/* Estimated Commission Banner */}
            <View
              style={[
                styles.commissionCard,
                {
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "#DCFCE7",
                  borderColor: isDark ? "rgba(16, 185, 129, 0.35)" : "#86EFAC",
                  borderRadius: radii.lg,
                  marginTop: spacing.xs + 2,
                  padding: spacing.sm + 2,
                },
              ]}
            >
              <View
                style={[layout.horizontalViewBetween, { alignItems: "center" }]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: "#15803D",
                    fontWeight: "700",
                  }}
                >
                  💰 Expected Broker Commission:
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(13.5),
                    fontWeight: "900",
                    color: "#15803D",
                  }}
                >
                  ₹{estimatedCommission.toLocaleString("en-IN")}
                </Text>
              </View>
            </View>
          </View>

          {/* 8. PROPERTY PHOTOS */}
          <View>
            <View style={[layout.horizontalViewBetween, { marginBottom: 6 }]}>
              <Text style={styles.inputLabel}>
                PROPERTY PHOTOS ({photos.length})
              </Text>
              <View style={[layout.horizontalView, { gap: 8 }]}>
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  style={[
                    layout.horizontalView,
                    { alignItems: "center", gap: 3 },
                  ]}
                >
                  <Feather
                    name="camera"
                    size={moderateScale(13)}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      color: colors.primary,
                      fontWeight: "700",
                    }}
                  >
                    Camera
                  </Text>
                </TouchableOpacity>
                <Text style={{ color: colors.textMuted }}>•</Text>
                <TouchableOpacity
                  onPress={handlePickPhoto}
                  style={[
                    layout.horizontalView,
                    { alignItems: "center", gap: 3 },
                  ]}
                >
                  <Feather
                    name="plus-circle"
                    size={moderateScale(13)}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      color: colors.primary,
                      fontWeight: "700",
                    }}
                  >
                    Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Photo Thumbnails */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.sm }}
            >
              {/* Add Photo Button Tile */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePickPhoto}
                style={[
                  styles.addPhotoTile,
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
                    fontSize: moderateScale(10.5),
                    fontWeight: "700",
                    color: colors.primary,
                    marginTop: 4,
                  }}
                >
                  + Add Photo
                </Text>
              </TouchableOpacity>

              {photos.map((uri, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.photoBox,
                    {
                      borderRadius: radii.xl,
                      borderColor: idx === 0 ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Image
                    source={{ uri }}
                    style={[styles.photoImg, { borderRadius: radii.xl }]}
                  />

                  {idx === 0 && (
                    <View
                      style={[
                        styles.coverTag,
                        {
                          backgroundColor: colors.primary,
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Text style={styles.coverTagText}>★ COVER</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() => handleRemovePhoto(idx)}
                    style={[
                      styles.deleteBtn,
                      {
                        backgroundColor: "rgba(15, 23, 42, 0.85)",
                        borderRadius: radii.round,
                      },
                    ]}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={moderateScale(12)}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 9. ADDITIONAL INFORMATION */}
          <View>
            <Text style={styles.inputLabel}>ADDITIONAL INFORMATION / PROPERTY NOTES</Text>
            <TextInput
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              placeholder="e.g. Floor no., Furnishing, Attached Washroom, WiFi speed, Gate timing, Meals included, Parking availability, etc."
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
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FLOATING SUBMIT BUTTON (Positioned above the Tab Bar) */}
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
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[
            styles.submitBtn,
            {
              borderRadius: radii.pill,
              overflow: "hidden",
            },
            shadows.sm,
          ]}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || "#0F766E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Text
                  style={{
                    fontSize: moderateScale(14),
                    fontWeight: "900",
                    color: colors.white,
                    marginRight: 6,
                  }}
                >
                  Submit & List Property 🚀
                </Text>
                <Feather
                  name="arrow-right"
                  size={moderateScale(16)}
                  color={colors.white}
                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
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
  iconCircle: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  geoCard: {
    borderWidth: 1,
  },
  gpsIconBox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshGpsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
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
    minHeight: 85,
    textAlignVertical: "top",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  commissionCard: {
    borderWidth: 1,
  },
  addPhotoTile: {
    width: 90,
    height: 90,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  photoBox: {
    width: 90,
    height: 90,
    borderWidth: 1.5,
    position: "relative",
    overflow: "hidden",
  },
  photoImg: {
    width: "100%",
    height: "100%",
    backgroundColor: "#334155",
  },
  coverTag: {
    position: "absolute",
    bottom: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  coverTagText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },
  deleteBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingActionBar: {
    position: "absolute",
    left: 16,
    right: 16,
    borderWidth: 1,
    zIndex: 999,
    elevation: 10,
  },
  submitBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    paddingHorizontal: 18,
    width: "100%",
  },
});
