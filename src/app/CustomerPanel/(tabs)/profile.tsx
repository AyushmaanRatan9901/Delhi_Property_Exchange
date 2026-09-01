import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";

export default function ProfileScreen() {
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
    themeMode,
    setThemeMode,
  } = useResponsiveTheme();

  // User Profile States
  const [userName, setUserName] = useState("Rahul Sharma");
  const [userPhone, setUserPhone] = useState("+91 98765 43210");
  const [userEmail, setUserEmail] = useState("rahul.sharma@example.com");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  // Modals
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [leaseModalVisible, setLeaseModalVisible] = useState(false);

  // Temporary Edit Form State
  const [tempName, setTempName] = useState(userName);
  const [tempPhone, setTempPhone] = useState(userPhone);
  const [tempEmail, setTempEmail] = useState(userEmail);

  const handleSaveProfile = () => {
    setUserName(tempName);
    setUserPhone(tempPhone);
    setUserEmail(tempEmail);
    setEditProfileModalVisible(false);
    Alert.alert(
      "Profile Updated",
      "Your profile details have been saved successfully.",
    );
  };

  const handleLogOut = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of StayFinder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () =>
          Alert.alert("Logged Out", "You have been securely logged out."),
      },
    ]);
  };

  const topInset =
    insets.top > 0
      ? insets.top
      : Platform.OS === "ios"
        ? 44
        : StatusBar.currentHeight || 24;

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: moderateScale(90) },
        ]}
      >
        {/* Velvet Header Section */}
        <LinearGradient
          colors={
            isDark
              ? [colors.cardBackground, "#0D3D52", colors.background]
              : [colors.primary, colors.primaryDark, colors.primaryGradientEnd]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.headerGradient,
            {
              paddingHorizontal: spacing.screenHorizontal,
              paddingTop: topInset + spacing.sm,
              paddingBottom: spacing.xl,
              borderBottomLeftRadius: radii.xxl,
              borderBottomRightRadius: radii.xxl,
            },
          ]}
        >
          {/* Header Title & Edit Action */}
          <View
            style={[layout.horizontalViewBetween, { marginBottom: spacing.md }]}
          >
            <Text
              style={{
                color: colors.white,
                fontSize: moderateScale(20),
                fontWeight: "800",
              }}
            >
              My Account
            </Text>
            <TouchableOpacity
              onPress={() => {
                setTempName(userName);
                setTempPhone(userPhone);
                setTempEmail(userEmail);
                setEditProfileModalVisible(true);
              }}
              activeOpacity={0.8}
              style={[
                styles.editPill,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.22)",
                  borderColor: "rgba(255, 255, 255, 0.35)",
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.sm + 2,
                  paddingVertical: spacing.xs,
                },
              ]}
            >
              <Feather
                name="edit-2"
                size={moderateScale(13)}
                color={colors.white}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  color: colors.white,
                  fontSize: moderateScale(11.5),
                  fontWeight: "700",
                }}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          {/* User Info Row */}
          <View style={layout.horizontalView}>
            {/* Avatar with Ring */}
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80",
                }}
                style={[
                  styles.avatar,
                  {
                    width: moderateScale(68),
                    height: moderateScale(68),
                    borderRadius: moderateScale(34),
                    borderColor: colors.white,
                  },
                ]}
              />
              <View
                style={[
                  styles.verifiedCheckBadge,
                  { backgroundColor: "#10B981", borderColor: colors.white },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={moderateScale(11)}
                  color={colors.white}
                />
              </View>
            </View>

            {/* Name, Phone, Email & Tag */}
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <View style={layout.horizontalView}>
                <Text
                  numberOfLines={1}
                  style={[styles.userName, { fontSize: moderateScale(18) }]}
                >
                  {userName}
                </Text>
                <MaterialIcons
                  name="verified"
                  size={moderateScale(18)}
                  color="#FDE047"
                  style={{ marginLeft: 4 }}
                />
              </View>
              <Text
                style={[styles.userContact, { fontSize: moderateScale(12) }]}
              >
                {userPhone} • {userEmail}
              </Text>
              <View
                style={[
                  styles.proBadge,
                  {
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.xs + 4,
                    paddingVertical: 2,
                    marginTop: 4,
                    alignSelf: "flex-start",
                  },
                ]}
              >
                <Text style={styles.proBadgeText}>★ Pro Verified Tenant</Text>
              </View>
            </View>
          </View>

          {/* 3-Column Metrics Dashboard Strip */}
          <View
            style={[
              styles.metricsCard,
              {
                backgroundColor: "rgba(0, 0, 0, 0.28)",
                borderColor: "rgba(255, 255, 255, 0.15)",
                borderRadius: radii.xl,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.sm,
                marginTop: spacing.lg,
              },
            ]}
          >
            <View style={layout.horizontalViewBetween}>
              {/* Metric 1 */}
              <View style={styles.metricColumn}>
                <Text
                  style={[
                    styles.metricNumber,
                    { fontSize: moderateScale(16), color: "#FDE047" },
                  ]}
                >
                  1,500
                </Text>
                <Text
                  style={[
                    styles.metricLabel,
                    { fontSize: moderateScale(10.5) },
                  ]}
                >
                  StayCoins (₹1,500)
                </Text>
              </View>

              <View
                style={[
                  styles.metricDivider,
                  { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                ]}
              />

              {/* Metric 2 */}
              <View style={styles.metricColumn}>
                <Text
                  style={[
                    styles.metricNumber,
                    { fontSize: moderateScale(16), color: colors.white },
                  ]}
                >
                  1 Stay
                </Text>
                <Text
                  style={[
                    styles.metricLabel,
                    { fontSize: moderateScale(10.5) },
                  ]}
                >
                  Active Lease
                </Text>
              </View>

              <View
                style={[
                  styles.metricDivider,
                  { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                ]}
              />

              {/* Metric 3 */}
              <View style={styles.metricColumn}>
                <Text
                  style={[
                    styles.metricNumber,
                    { fontSize: moderateScale(16), color: "#34D399" },
                  ]}
                >
                  ₹4,000
                </Text>
                <Text
                  style={[
                    styles.metricLabel,
                    { fontSize: moderateScale(10.5) },
                  ]}
                >
                  Rewards Earned
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Section 1: Rental Documents & KYC */}
        <View
          style={[
            styles.sectionWrapper,
            {
              paddingHorizontal: spacing.screenHorizontal,
              marginTop: spacing.lg,
            },
          ]}
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
            Rental Documents & KYC
          </Text>

          <View
            style={[
              styles.cardGroup,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
              },
              shadows.sm,
            ]}
          >
            {/* 1. Lease Agreement */}
            <TouchableOpacity
              onPress={() => setLeaseModalVisible(true)}
              activeOpacity={0.7}
              style={[
                styles.menuRow,
                { padding: spacing.md, borderBottomColor: colors.borderLight },
              ]}
            >
              <View style={layout.horizontalView}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#EFF6FF",
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="file-document-outline"
                    size={moderateScale(20)}
                    color="#2563EB"
                  />
                </View>
                <View style={{ marginLeft: spacing.md }}>
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13.5),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    Active Rental Agreement
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
                    Dwarka Sector 6 • E-Signed & Valid
                  </Text>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={moderateScale(16)}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* 2. Digital KYC Proof */}
            <TouchableOpacity
              onPress={() => setKycModalVisible(true)}
              activeOpacity={0.7}
              style={[
                styles.menuRow,
                { padding: spacing.md, borderBottomColor: colors.borderLight },
              ]}
            >
              <View style={layout.horizontalView}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? "#064E3B" : "#ECFDF5",
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="shield-account-outline"
                    size={moderateScale(20)}
                    color="#059669"
                  />
                </View>
                <View style={{ marginLeft: spacing.md }}>
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13.5),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    Tenant KYC Verification
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
                    Aadhaar & Police Verified ✔
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.verifiedMiniTag,
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
                  Verified
                </Text>
              </View>
            </TouchableOpacity>

            {/* 3. Rent Receipts */}
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "HRA Receipts",
                  "Downloading your rent receipts and GST invoice for HRA tax exemption...",
                )
              }
              activeOpacity={0.7}
              style={[styles.menuRow, { padding: spacing.md }]}
            >
              <View style={layout.horizontalView}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? "#2E1065" : "#F5F3FF",
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="receipt-long"
                    size={moderateScale(20)}
                    color="#7C3AED"
                  />
                </View>
                <View style={{ marginLeft: spacing.md }}>
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13.5),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    Payment Receipts & Invoices
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
                    Download monthly rent slips for HRA
                  </Text>
                </View>
              </View>
              <Feather
                name="download"
                size={moderateScale(16)}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 4: Notification Preferences */}
        <View
          style={[
            styles.sectionWrapper,
            {
              paddingHorizontal: spacing.screenHorizontal,
              marginTop: spacing.lg,
            },
          ]}
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
            Notifications & Updates
          </Text>

          <View
            style={[
              styles.cardGroup,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
              },
              shadows.sm,
            ]}
          >
            {/* Push Notifications */}
            <View
              style={[
                layout.horizontalViewBetween,
                styles.menuRow,
                { padding: spacing.md, borderBottomColor: colors.borderLight },
              ]}
            >
              <View style={layout.horizontalView}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <Feather
                    name="bell"
                    size={moderateScale(18)}
                    color={colors.primary}
                  />
                </View>
                <View style={{ marginLeft: spacing.md }}>
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    Visit & Price Drop Alerts
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
                    Instant push notifications
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#64748B", true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            {/* WhatsApp Updates */}
            <View
              style={[
                layout.horizontalViewBetween,
                styles.menuRow,
                { padding: spacing.md },
              ]}
            >
              <View style={layout.horizontalView}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <Ionicons
                    name="logo-whatsapp"
                    size={moderateScale(18)}
                    color="#10B981"
                  />
                </View>
                <View style={{ marginLeft: spacing.md }}>
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    WhatsApp Visit Pass
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
                    Get gate pass on WhatsApp
                  </Text>
                </View>
              </View>
              <Switch
                value={whatsappUpdates}
                onValueChange={setWhatsappUpdates}
                trackColor={{ false: "#64748B", true: "#10B981" }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* Section 5: Support & Legal */}
        <View
          style={[
            styles.sectionWrapper,
            {
              paddingHorizontal: spacing.screenHorizontal,
              marginTop: spacing.lg,
            },
          ]}
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
            Support & Safety
          </Text>

          <View
            style={[
              styles.cardGroup,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
              },
              shadows.sm,
            ]}
          >
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Helpdesk",
                  "Connecting to 24/7 Housing Caretaker at 1800-123-STAY",
                )
              }
              activeOpacity={0.7}
              style={[
                styles.menuRow,
                { padding: spacing.md, borderBottomColor: colors.borderLight },
              ]}
            >
              <View style={layout.horizontalView}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <Feather
                    name="headphones"
                    size={moderateScale(18)}
                    color="#059669"
                  />
                </View>
                <Text
                  style={[
                    typography.cardTitle,
                    {
                      fontSize: moderateScale(13.5),
                      color: colors.textPrimary,
                      marginLeft: spacing.md,
                    },
                  ]}
                >
                  24/7 Caretaker Helpdesk
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={moderateScale(16)}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Safety & Emergency",
                  "Emergency Warden: +91 99999 11111",
                )
              }
              activeOpacity={0.7}
              style={[
                styles.menuRow,
                { padding: spacing.md, borderBottomColor: colors.borderLight },
              ]}
            >
              <View style={layout.horizontalView}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={moderateScale(18)}
                    color="#2563EB"
                  />
                </View>
                <Text
                  style={[
                    typography.cardTitle,
                    {
                      fontSize: moderateScale(13.5),
                      color: colors.textPrimary,
                      marginLeft: spacing.md,
                    },
                  ]}
                >
                  Safety & Emergency SOS
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={moderateScale(16)}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Terms & Privacy",
                  "StayFinder guarantees 100% deposit security and zero brokerage.",
                )
              }
              activeOpacity={0.7}
              style={[styles.menuRow, { padding: spacing.md }]}
            >
              <View style={layout.horizontalView}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                      borderRadius: radii.lg,
                    },
                  ]}
                >
                  <Feather
                    name="file-text"
                    size={moderateScale(18)}
                    color={colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    typography.cardTitle,
                    {
                      fontSize: moderateScale(13.5),
                      color: colors.textPrimary,
                      marginLeft: spacing.md,
                    },
                  ]}
                >
                  Terms, Privacy & Refund Policy
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={moderateScale(16)}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Button */}
        <View
          style={{
            paddingHorizontal: spacing.screenHorizontal,
            marginTop: spacing.xl,
          }}
        >
          <TouchableOpacity
            onPress={handleLogOut}
            activeOpacity={0.8}
            style={[
              styles.logoutBtn,
              {
                backgroundColor: isDark ? "#2D141C" : "#FFF1F2",
                borderColor: isDark ? "#4C1D2A" : "#FECDD3",
                borderRadius: radii.xl,
                paddingVertical: spacing.md,
              },
            ]}
          >
            <Feather
              name="log-out"
              size={moderateScale(16)}
              color={colors.favoriteRed}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.logoutText,
                { fontSize: moderateScale(13.5), color: colors.favoriteRed },
              ]}
            >
              Log Out of Account
            </Text>
          </TouchableOpacity>

          {/* App Version & Credits */}
          <View style={[styles.footerCredits, { marginTop: spacing.lg }]}>
            <Text
              style={{
                fontSize: moderateScale(11.5),
                color: colors.textMuted,
                fontWeight: "600",
              }}
            >
              StayFinder Mobile v2.4 • Build 2026
            </Text>
            <Text
              style={{
                fontSize: moderateScale(10.5),
                color: colors.textMuted,
                marginTop: 2,
              }}
            >
              100% Verified Housing & Zero Brokerage Network
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileModalVisible(false)}
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
                Edit Profile Details
              </Text>
              <TouchableOpacity
                onPress={() => setEditProfileModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={moderateScale(24)}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <View style={{ padding: spacing.lg }}>
              <Text
                style={[
                  typography.cardTitle,
                  {
                    fontSize: moderateScale(13),
                    color: colors.textSecondary,
                    marginBottom: 4,
                  },
                ]}
              >
                Full Name
              </Text>
              <TextInput
                value={tempName}
                onChangeText={setTempName}
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDark ? colors.surfaceHover : "#F8FAFC",
                    borderColor: colors.border,
                    borderRadius: radii.lg,
                    color: colors.textPrimary,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                  },
                ]}
              />

              <Text
                style={[
                  typography.cardTitle,
                  {
                    fontSize: moderateScale(13),
                    color: colors.textSecondary,
                    marginBottom: 4,
                  },
                ]}
              >
                Mobile Number
              </Text>
              <TextInput
                value={tempPhone}
                onChangeText={setTempPhone}
                keyboardType="phone-pad"
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDark ? colors.surfaceHover : "#F8FAFC",
                    borderColor: colors.border,
                    borderRadius: radii.lg,
                    color: colors.textPrimary,
                    padding: spacing.md,
                    marginBottom: spacing.md,
                  },
                ]}
              />

              <Text
                style={[
                  typography.cardTitle,
                  {
                    fontSize: moderateScale(13),
                    color: colors.textSecondary,
                    marginBottom: 4,
                  },
                ]}
              >
                Email Address
              </Text>
              <TextInput
                value={tempEmail}
                onChangeText={setTempEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.inputBox,
                  {
                    backgroundColor: isDark ? colors.surfaceHover : "#F8FAFC",
                    borderColor: colors.border,
                    borderRadius: radii.lg,
                    color: colors.textPrimary,
                    padding: spacing.md,
                    marginBottom: spacing.lg,
                  },
                ]}
              />

              <TouchableOpacity
                onPress={handleSaveProfile}
                activeOpacity={0.85}
                style={[
                  styles.saveBtn,
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
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* KYC Details Modal */}
      <Modal
        visible={kycModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setKycModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setKycModalVisible(false)}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.infoModalBox,
              {
                backgroundColor: colors.cardBackground,
                borderRadius: radii.xxl,
                padding: spacing.xl,
                borderColor: colors.border,
              },
              shadows.floating,
            ]}
          >
            <View
              style={[
                styles.kycCheckIcon,
                {
                  backgroundColor: "#ECFDF5",
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  alignSelf: "center",
                  marginBottom: spacing.sm,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={moderateScale(28)}
                color="#059669"
              />
            </View>

            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(17),
                  color: colors.textPrimary,
                  textAlign: "center",
                },
              ]}
            >
              Tenant KYC Verified ✔
            </Text>
            <Text
              style={[
                typography.cardAmenity,
                {
                  fontSize: moderateScale(12),
                  color: colors.textSecondary,
                  textAlign: "center",
                  marginTop: 4,
                },
              ]}
            >
              Your government ID proof & police verification are active and
              verified.
            </Text>

            <View
              style={[
                styles.kycDetailsList,
                {
                  backgroundColor: isDark ? colors.surfaceHover : "#F8FAFC",
                  borderRadius: radii.xl,
                  padding: spacing.md,
                  marginTop: spacing.md,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(12),
                  color: colors.textPrimary,
                  fontWeight: "600",
                }}
              >
                🆔 Aadhaar: •••• •••• 4521 (Verified)
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(12),
                  color: colors.textPrimary,
                  fontWeight: "600",
                  marginTop: 4,
                }}
              >
                📄 Police Intimation: Submitted ✔
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setKycModalVisible(false)}
              style={[
                styles.closeModalBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radii.pill,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.lg,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.white,
                  fontWeight: "700",
                  textAlign: "center",
                  fontSize: moderateScale(13),
                }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Lease Agreement Modal */}
      <Modal
        visible={leaseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLeaseModalVisible(false)}
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
                Digital Lease Agreement
              </Text>
              <TouchableOpacity onPress={() => setLeaseModalVisible(false)}>
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
              <View
                style={[
                  styles.leaseHeaderBox,
                  {
                    backgroundColor: isDark ? colors.surfaceHover : "#F8FAFC",
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(14),
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  Executive Single Room • Dwarka Sec 6
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(12),
                    color: colors.priceGreen,
                    fontWeight: "700",
                    marginTop: 2,
                  }}
                >
                  Monthly Rent: ₹9,000 | Deposit: ₹9,000 (Protected)
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Valid From: 1 Sep 2026 to 31 Aug 2027 (11 Months Lease)
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "E-Lease Downloaded",
                    "Official stamp-paper e-agreement PDF saved to your downloads folder.",
                  );
                  setLeaseModalVisible(false);
                }}
                activeOpacity={0.85}
                style={[
                  styles.saveBtn,
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
                  Download E-Signed Lease PDF 📄
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {},
  headerGradient: {},
  editPill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    borderWidth: 2.5,
    backgroundColor: "#334155",
  },
  verifiedCheckBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  userContact: {
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 1,
  },
  proBadge: {},
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  metricsCard: {
    borderWidth: 1,
  },
  metricColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metricNumber: {
    fontWeight: "800",
  },
  metricLabel: {
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
    fontWeight: "500",
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  sectionWrapper: {},
  cardGroup: {
    borderWidth: 1,
    overflow: "hidden",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedMiniTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  ownerCard: {
    borderWidth: 1,
  },
  switchRolePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  themePillsRow: {},
  themePillBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  logoutText: {
    fontWeight: "700",
  },
  footerCredits: {
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
  inputBox: {
    borderWidth: 1,
  },
  saveBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  infoModalBox: {
    marginHorizontal: 24,
    marginBottom: "auto",
    marginTop: "auto",
    borderWidth: 1,
  },
  kycCheckIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  kycDetailsList: {},
  closeModalBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  leaseHeaderBox: {},
});
