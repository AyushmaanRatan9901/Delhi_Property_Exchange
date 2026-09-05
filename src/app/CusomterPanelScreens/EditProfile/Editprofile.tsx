import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const OCCUPATION_OPTIONS = [
  { id: "professional", label: "Working Professional", icon: "briefcase" },
  { id: "student", label: "University Student", icon: "book-open" },
  { id: "freelancer", label: "Freelancer / Creator", icon: "monitor" },
  { id: "business", label: "Business Owner", icon: "trending-up" },
];

const GENDER_OPTIONS = ["Male", "Female", "Other / Prefer not to say"];

const FOOD_PREFERENCES = [
  { id: "veg", label: "Pure Vegetarian 🥗" },
  { id: "non_veg", label: "Non-Veg 🍗" },
  { id: "jain", label: "Jain Food 🌿" },
  { id: "any", label: "No Restriction 🍽️" },
];

const STAY_TYPES = [
  "Single Private Room",
  "Double Sharing PG",
  "Studio Apartment",
  "1 BHK / 2 BHK Flat",
];

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
];

const Editprofile = () => {
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

  // Profile Form States
  const [avatarUri, setAvatarUri] = useState(AVATAR_PRESETS[0]);
  const [fullName, setFullName] = useState("Rahul Sharma");
  const [email, setEmail] = useState("rahul.sharma@example.com");
  const [phone, setPhone] = useState("9876543210");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("15 Aug 1998");
  const [occupation, setOccupation] = useState("professional");
  const [companyOrCollege, setCompanyOrCollege] = useState(
    "Google India / Cyber City",
  );
  const [workLocation, setWorkLocation] = useState("Gurgaon & Dwarka, Delhi");
  const [preferredStayType, setPreferredStayType] = useState(
    "Single Private Room",
  );
  const [foodPreference, setFoodPreference] = useState("veg");
  const [budgetRange, setBudgetRange] = useState("₹8,000 - ₹15,000 /mo");
  const [moveInDate, setMoveInDate] = useState("Immediate (Within 7 Days)");
  const [emergencyName, setEmergencyName] = useState("Sunita Sharma (Mother)");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98112 23344");
  const [emergencyRelation, setEmergencyRelation] =
    useState("Parent / Guardian");

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Profile completeness score calculation
  const completionPercentage = 85;

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Required Field", "Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert(
        "Profile Saved! 🎉",
        "Your verified profile and tenant preferences have been updated.",
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ],
      );
    }, 600);
  };

  const handleAvatarSelect = (uri: string) => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    setAvatarUri(uri);
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Header Bar */}
        <View
          style={[
            styles.topHeader,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.borderLight,
              paddingHorizontal: spacing.screenHorizontal,
              paddingVertical: spacing.sm + 2,
            },
            shadows.sm,
          ]}
        >
          <View style={layout.horizontalViewBetween}>
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={[
                styles.iconBtn,
                {
                  backgroundColor: isDark
                    ? colors.surfaceHover
                    : colors.surfaceLight,
                  borderColor: colors.border,
                  borderRadius: radii.round,
                },
              ]}
            >
              <Feather
                name="arrow-left"
                size={moderateScale(19)}
                color={colors.textPrimary}
              />
            </TouchableOpacity>

            {/* Header Title & Subtitle */}
            <View style={{ alignItems: "center" }}>
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(17),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                Edit Profile
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  fontWeight: "500",
                  marginTop: 1,
                }}
              >
                Personal Details & Tenant KYC
              </Text>
            </View>

            {/* Save Button Header Action */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isSaving}
              style={[
                styles.savePillBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 2,
                },
                shadows.sm,
              ]}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: moderateScale(12.5),
                  fontWeight: "700",
                }}
              >
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Form Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.screenHorizontal,
            paddingTop: spacing.md,
            paddingBottom: insets.bottom + moderateScale(110),
            gap: spacing.lg,
          }}
        >
          {/* Avatar & Completeness Banner */}
          <View
            style={[
              styles.avatarCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#F8FAFC",
                borderColor: colors.border,
                borderRadius: radii.xxl,
                padding: spacing.md + 2,
              },
              shadows.sm,
            ]}
          >
            <View style={{ alignItems: "center" }}>
              {/* Avatar with Camera Overlay */}
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: avatarUri }}
                  style={[
                    styles.avatarImage,
                    {
                      width: moderateScale(88),
                      height: moderateScale(88),
                      borderRadius: moderateScale(44),
                      borderColor: colors.primary,
                    },
                  ]}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    Alert.alert(
                      "Profile Photo",
                      "Select a profile preset below or choose from device gallery.",
                    )
                  }
                  style={[
                    styles.cameraBadge,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.white,
                    },
                  ]}
                >
                  <Feather
                    name="camera"
                    size={moderateScale(13)}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Name & DPX Tenant ID */}
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(16),
                    fontWeight: "800",
                    color: colors.textPrimary,
                    marginTop: spacing.xs + 2,
                  },
                ]}
              >
                {fullName}
              </Text>

              <View
                style={[
                  layout.horizontalView,
                  { gap: 4, marginTop: 2, alignItems: "center" },
                ]}
              >
                <MaterialIcons
                  name="verified"
                  size={moderateScale(14)}
                  color={colors.verifiedGreen || "#10B981"}
                />
                <Text
                  style={{
                    fontSize: moderateScale(11.5),
                    color: colors.verifiedGreen || "#10B981",
                    fontWeight: "700",
                  }}
                >
                  DPX Verified Tenant • ID: #DPX-88294
                </Text>
              </View>

              {/* Preset Avatar Selectors */}
              <View
                style={[
                  layout.horizontalView,
                  { gap: spacing.sm, marginTop: spacing.md },
                ]}
              >
                {AVATAR_PRESETS.map((preset, idx) => {
                  const isSelected = avatarUri === preset;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleAvatarSelect(preset)}
                      activeOpacity={0.8}
                      style={[
                        styles.presetAvatarBtn,
                        {
                          borderColor: isSelected
                            ? colors.primary
                            : "transparent",
                          borderWidth: isSelected ? 2.5 : 0,
                          borderRadius: moderateScale(22),
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: preset }}
                        style={[
                          styles.presetImage,
                          {
                            width: moderateScale(38),
                            height: moderateScale(38),
                            borderRadius: moderateScale(19),
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Profile Completion Meter */}
            <View
              style={[
                styles.completionMeter,
                {
                  backgroundColor: isDark
                    ? colors.surfaceHover
                    : "rgba(16, 185, 129, 0.10)",
                  borderColor: isDark ? colors.border : "#A7F3D0",
                  borderRadius: radii.xl,
                  padding: spacing.sm + 2,
                  marginTop: spacing.md,
                },
              ]}
            >
              <View style={layout.horizontalViewBetween}>
                <View style={layout.horizontalView}>
                  <Ionicons
                    name="shield-checkmark"
                    size={moderateScale(16)}
                    color={colors.verifiedGreen || "#10B981"}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    Profile Strength
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: "800",
                    color: colors.verifiedGreen || "#10B981",
                  }}
                >
                  {completionPercentage}% Complete
                </Text>
              </View>

              {/* Progress Bar Track */}
              <View
                style={[
                  styles.progressBarTrack,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.12)"
                      : "#E2E8F0",
                    borderRadius: radii.pill,
                    marginTop: 6,
                  },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${completionPercentage}%`,
                      backgroundColor: colors.verifiedGreen || "#10B981",
                      borderRadius: radii.pill,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Section 1: Basic Information */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xxl,
                padding: spacing.md + 2,
              },
              shadows.sm,
            ]}
          >
            <View style={[layout.horizontalView, { marginBottom: spacing.md }]}>
              <View
                style={[
                  styles.sectionIconPill,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.primaryLight,
                    borderRadius: radii.md,
                  },
                ]}
              >
                <Feather
                  name="user"
                  size={moderateScale(16)}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(15),
                    fontWeight: "800",
                    color: colors.textPrimary,
                    marginLeft: spacing.sm,
                  },
                ]}
              >
                Personal Information
              </Text>
            </View>

            {/* Field: Full Name */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                  },
                ]}
              >
                FULL NAME *
              </Text>
              <View
                style={[
                  styles.inputFieldBox,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                ]}
              >
                <Feather
                  name="user"
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                  style={{ marginRight: spacing.sm }}
                />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full legal name"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                      fontSize: moderateScale(13.5),
                    },
                  ]}
                />
                {fullName.length > 0 && (
                  <TouchableOpacity onPress={() => setFullName("")}>
                    <Ionicons
                      name="close-circle"
                      size={moderateScale(16)}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Field: Email Address */}
            <View style={[styles.inputGroup, { marginTop: spacing.md }]}>
              <View style={layout.horizontalViewBetween}>
                <Text
                  style={[
                    styles.inputLabel,
                    {
                      fontSize: moderateScale(11.5),
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  EMAIL ADDRESS *
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: colors.verifiedGreen || "#10B981",
                    fontWeight: "700",
                  }}
                >
                  ✓ Verified
                </Text>
              </View>
              <View
                style={[
                  styles.inputFieldBox,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                ]}
              >
                <Feather
                  name="mail"
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                  style={{ marginRight: spacing.sm }}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                      fontSize: moderateScale(13.5),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Field: Mobile Number */}
            <View style={[styles.inputGroup, { marginTop: spacing.md }]}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                  },
                ]}
              >
                MOBILE NUMBER *
              </Text>
              <View
                style={[
                  styles.inputFieldBox,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                ]}
              >
                <View
                  style={[
                    styles.countryPrefix,
                    {
                      borderRightColor: colors.borderLight,
                      paddingRight: spacing.sm,
                      marginRight: spacing.sm,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(13.5),
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    🇮🇳 +91
                  </Text>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                      fontSize: moderateScale(13.5),
                    },
                  ]}
                />
                <Ionicons
                  name="logo-whatsapp"
                  size={moderateScale(17)}
                  color="#22C55E"
                />
              </View>
            </View>

            {/* Field: Gender Selection */}
            <View style={[styles.inputGroup, { marginTop: spacing.md }]}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                    marginBottom: 6,
                  },
                ]}
              >
                GENDER
              </Text>
              <View
                style={[
                  layout.horizontalView,
                  { flexWrap: "wrap", gap: spacing.xs + 2 },
                ]}
              >
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      activeOpacity={0.8}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : isDark
                              ? colors.surfaceHover
                              : colors.surfaceLight,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs + 2,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(12),
                          fontWeight: isSelected ? "700" : "600",
                          color: isSelected ? "#FFFFFF" : colors.textPrimary,
                        }}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Section 2: Professional Details */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xxl,
                padding: spacing.md + 2,
              },
              shadows.sm,
            ]}
          >
            <View style={[layout.horizontalView, { marginBottom: spacing.md }]}>
              <View
                style={[
                  styles.sectionIconPill,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.primaryLight,
                    borderRadius: radii.md,
                  },
                ]}
              >
                <Feather
                  name="briefcase"
                  size={moderateScale(16)}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(15),
                    fontWeight: "800",
                    color: colors.textPrimary,
                    marginLeft: spacing.sm,
                  },
                ]}
              >
                Professional & Campus Info
              </Text>
            </View>

            {/* Occupation Selectors */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                    marginBottom: 6,
                  },
                ]}
              >
                I AM A...
              </Text>
              <View style={{ gap: spacing.xs + 2 }}>
                {OCCUPATION_OPTIONS.map((occ) => {
                  const isSelected = occupation === occ.id;
                  return (
                    <TouchableOpacity
                      key={occ.id}
                      onPress={() => setOccupation(occ.id)}
                      activeOpacity={0.8}
                      style={[
                        layout.horizontalViewBetween,
                        styles.occupationOption,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? "rgba(30, 58, 138, 0.25)"
                              : colors.primaryLight
                            : isDark
                              ? colors.surfaceHover
                              : colors.surfaceLight,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                          borderRadius: radii.xl,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm + 1,
                        },
                      ]}
                    >
                      <View style={layout.horizontalView}>
                        <Feather
                          name={occ.icon as any}
                          size={moderateScale(16)}
                          color={
                            isSelected ? colors.primary : colors.textSecondary
                          }
                          style={{ marginRight: spacing.sm }}
                        />
                        <Text
                          style={{
                            fontSize: moderateScale(13),
                            fontWeight: isSelected ? "700" : "500",
                            color: isSelected
                              ? colors.primary
                              : colors.textPrimary,
                          }}
                        >
                          {occ.label}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={moderateScale(18)}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Company / College */}
            <View style={[styles.inputGroup, { marginTop: spacing.md }]}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                  },
                ]}
              >
                COMPANY / COLLEGE NAME
              </Text>
              <View
                style={[
                  styles.inputFieldBox,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                  style={{ marginRight: spacing.sm }}
                />
                <TextInput
                  value={companyOrCollege}
                  onChangeText={setCompanyOrCollege}
                  placeholder="e.g. Google India / DTU"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                      fontSize: moderateScale(13.5),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Work Location */}
            <View style={[styles.inputGroup, { marginTop: spacing.md }]}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                  },
                ]}
              >
                WORK / CAMPUS LOCATION
              </Text>
              <View
                style={[
                  styles.inputFieldBox,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                  style={{ marginRight: spacing.sm }}
                />
                <TextInput
                  value={workLocation}
                  onChangeText={setWorkLocation}
                  placeholder="e.g. Sector 6 Dwarka, Cyber Hub"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                      fontSize: moderateScale(13.5),
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Section 3: Housing & Stay Preferences */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xxl,
                padding: spacing.md + 2,
              },
              shadows.sm,
            ]}
          >
            <View style={[layout.horizontalView, { marginBottom: spacing.md }]}>
              <View
                style={[
                  styles.sectionIconPill,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.primaryLight,
                    borderRadius: radii.md,
                  },
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={moderateScale(16)}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(15),
                    fontWeight: "800",
                    color: colors.textPrimary,
                    marginLeft: spacing.sm,
                  },
                ]}
              >
                Stay & Living Preferences
              </Text>
            </View>

            {/* Stay Type Preference */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                    marginBottom: 6,
                  },
                ]}
              >
                PREFERRED STAY TYPE
              </Text>
              <View
                style={[
                  layout.horizontalView,
                  { flexWrap: "wrap", gap: spacing.xs + 2 },
                ]}
              >
                {STAY_TYPES.map((type) => {
                  const isSelected = preferredStayType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setPreferredStayType(type)}
                      activeOpacity={0.8}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : isDark
                              ? colors.surfaceHover
                              : colors.surfaceLight,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs + 2,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(12),
                          fontWeight: isSelected ? "700" : "600",
                          color: isSelected ? "#FFFFFF" : colors.textPrimary,
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Food Preference */}
            <View style={[styles.inputGroup, { marginTop: spacing.md }]}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                    marginBottom: 6,
                  },
                ]}
              >
                MEAL & FOOD PREFERENCE
              </Text>
              <View
                style={[
                  layout.horizontalView,
                  { flexWrap: "wrap", gap: spacing.xs + 2 },
                ]}
              >
                {FOOD_PREFERENCES.map((food) => {
                  const isSelected = foodPreference === food.id;
                  return (
                    <TouchableOpacity
                      key={food.id}
                      onPress={() => setFoodPreference(food.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.chipBtn,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : isDark
                              ? colors.surfaceHover
                              : colors.surfaceLight,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                          borderRadius: radii.pill,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.xs + 2,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(12),
                          fontWeight: isSelected ? "700" : "600",
                          color: isSelected ? "#FFFFFF" : colors.textPrimary,
                        }}
                      >
                        {food.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Move-in Date & Budget */}
            <View
              style={[
                layout.horizontalViewBetween,
                { marginTop: spacing.md, gap: spacing.sm },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputLabel,
                    {
                      fontSize: moderateScale(11.5),
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  MOVE-IN TIMELINE
                </Text>
                <View
                  style={[
                    styles.inputFieldBox,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceHover
                        : colors.surfaceLight,
                      borderColor: colors.border,
                      borderRadius: radii.xl,
                    },
                  ]}
                >
                  <TextInput
                    value={moveInDate}
                    onChangeText={setMoveInDate}
                    placeholder="Immediate / Date"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        color: colors.textPrimary,
                        fontSize: moderateScale(12.5),
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.inputLabel,
                    {
                      fontSize: moderateScale(11.5),
                      color: colors.textSecondary,
                    },
                  ]}
                >
                  MONTHLY BUDGET
                </Text>
                <View
                  style={[
                    styles.inputFieldBox,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceHover
                        : colors.surfaceLight,
                      borderColor: colors.border,
                      borderRadius: radii.xl,
                    },
                  ]}
                >
                  <TextInput
                    value={budgetRange}
                    onChangeText={setBudgetRange}
                    placeholder="e.g. ₹10,000"
                    placeholderTextColor={colors.textMuted}
                    style={[
                      styles.textInput,
                      {
                        color: colors.textPrimary,
                        fontSize: moderateScale(12.5),
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Section 4: Emergency Contact Information */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xxl,
                padding: spacing.md + 2,
              },
              shadows.sm,
            ]}
          >
            <View style={[layout.horizontalView, { marginBottom: spacing.md }]}>
              <View
                style={[
                  styles.sectionIconPill,
                  {
                    backgroundColor: "rgba(239, 68, 68, 0.14)",
                    borderRadius: radii.md,
                  },
                ]}
              >
                <Feather
                  name="shield"
                  size={moderateScale(16)}
                  color="#EF4444"
                />
              </View>
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(15),
                    fontWeight: "800",
                    color: colors.textPrimary,
                    marginLeft: spacing.sm,
                  },
                ]}
              >
                Emergency & Guardian Contact
              </Text>
            </View>

            {/* Guardian Name */}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                  },
                ]}
              >
                GUARDIAN / EMERGENCY CONTACT NAME
              </Text>
              <View
                style={[
                  styles.inputFieldBox,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                ]}
              >
                <Feather
                  name="user-check"
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                  style={{ marginRight: spacing.sm }}
                />
                <TextInput
                  value={emergencyName}
                  onChangeText={setEmergencyName}
                  placeholder="Parent / Guardian Name"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                      fontSize: moderateScale(13.5),
                    },
                  ]}
                />
              </View>
            </View>

            {/* Guardian Phone */}
            <View style={[styles.inputGroup, { marginTop: spacing.md }]}>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    fontSize: moderateScale(11.5),
                    color: colors.textSecondary,
                  },
                ]}
              >
                GUARDIAN CONTACT NUMBER
              </Text>
              <View
                style={[
                  styles.inputFieldBox,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                  },
                ]}
              >
                <Feather
                  name="phone-call"
                  size={moderateScale(16)}
                  color={colors.textSecondary}
                  style={{ marginRight: spacing.sm }}
                />
                <TextInput
                  value={emergencyPhone}
                  onChangeText={setEmergencyPhone}
                  keyboardType="phone-pad"
                  placeholder="+91 Emergency contact"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.textInput,
                    {
                      color: colors.textPrimary,
                      fontSize: moderateScale(13.5),
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Section 5: Trust & KYC Verification Card */}
          <View
            style={[
              styles.kycCard,
              {
                backgroundColor: isDark
                  ? "rgba(16, 185, 129, 0.12)"
                  : "#F0FDF4",
                borderColor: isDark ? "#065F46" : "#BBF7D0",
                borderRadius: radii.xxl,
                padding: spacing.md + 2,
              },
            ]}
          >
            <View style={layout.horizontalViewBetween}>
              <View style={layout.horizontalView}>
                <Ionicons
                  name="shield-checkmark"
                  size={moderateScale(20)}
                  color="#16A34A"
                  style={{ marginRight: spacing.sm }}
                />
                <View>
                  <Text
                    style={{
                      fontSize: moderateScale(13.5),
                      fontWeight: "800",
                      color: "#16A34A",
                    }}
                  >
                    Delhi Property Exchange Trust Desk
                  </Text>
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      color: colors.textSecondary,
                      marginTop: 1,
                    }}
                  >
                    Aadhaar ID verified • Zero Brokerage guaranteed
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.verifiedBadge,
                  { backgroundColor: "#DCFCE7", borderColor: "#86EFAC" },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(10.5),
                    fontWeight: "800",
                    color: "#15803D",
                  }}
                >
                  VERIFIED
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Editprofile;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  savePillBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCard: {
    borderWidth: 1,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    borderWidth: 2.5,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  presetAvatarBtn: {
    padding: 1.5,
  },
  presetImage: {},
  completionMeter: {
    borderWidth: 1,
    width: "100%",
  },
  progressBarTrack: {
    height: 6,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
  },
  sectionCard: {
    borderWidth: 1,
  },
  sectionIconPill: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  inputGroup: {
    width: "100%",
  },
  inputLabel: {
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  inputFieldBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 6,
  },
  countryPrefix: {
    borderRightWidth: 1,
  },
  textInput: {
    flex: 1,
    fontWeight: "600",
  },
  chipBtn: {
    borderWidth: 1,
  },
  occupationOption: {
    borderWidth: 1,
  },
  kycCard: {
    borderWidth: 1,
  },
  verifiedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  stickyBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  discardBtn: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveMainBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
