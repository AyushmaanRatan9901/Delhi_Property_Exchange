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
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { logout } from "../../../Redux/Auth/authActions";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function BrokerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    colors,
    typography,
    isDark,
    themeMode,
    setThemeMode,
    moderateScale,
  } = useResponsiveTheme();

  // Broker Profile State
  const [brokerName, setBrokerName] = useState(user?.name || "Rajesh Sharma");
  const [brokerAgency, setBrokerAgency] = useState("Dwarka Prime Stays & PG Hub");
  const [brokerPhone, setBrokerPhone] = useState(user?.phone || "+91 98110 12345");
  const [brokerEmail, setBrokerEmail] = useState(user?.email || "rajesh.broker@estate360.com");
  const [brokerLocation, setBrokerLocation] = useState("Dwarka, Janakpuri & Rohini, Delhi");
  const [reraNumber, setReraNumber] = useState(user?.recordCode || "DLRERA2024A00918");
  const [partnerTier] = useState("Platinum Channel Partner");

  // Preferences
  const [instantLeadAlerts, setInstantLeadAlerts] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [autoDepositCommission, setAutoDepositCommission] = useState(true);

  // Modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [visitingCardVisible, setVisitingCardVisible] = useState(false);
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Temp Edit Form State
  const [tempName, setTempName] = useState(brokerName);
  const [tempAgency, setTempAgency] = useState(brokerAgency);
  const [tempPhone, setTempPhone] = useState(brokerPhone);
  const [tempEmail, setTempEmail] = useState(brokerEmail);
  const [tempLocation, setTempLocation] = useState(brokerLocation);

  // Animation values
  const cardScaleAnim = useRef(new Animated.Value(1)).current;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const handleSaveProfile = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setBrokerName(tempName);
    setBrokerAgency(tempAgency);
    setBrokerPhone(tempPhone);
    setBrokerEmail(tempEmail);
    setBrokerLocation(tempLocation);
    setEditModalVisible(false);
    Alert.alert("Profile Updated", "Your broker profile details have been saved.");
  };

  const handleShareDigitalCard = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({
        title: `${brokerName} - Verified Real Estate Broker`,
        message: `Connect with ${brokerName} (${brokerAgency})\nVerified Platinum Partner • RERA: ${reraNumber}\nSpecialized in PGs, Flats & Commercial Stays.\nPhone: ${brokerPhone}\nEmail: ${brokerEmail}`,
      });
    } catch {}
  };

  const handleRouteToSettings = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push("/Screens/BrokerPanelScreens/Setting" as any);
  };

  const handleLogOut = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of the Broker Partner Portal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await dispatch(logout());
            router.replace("/(auth)/login" as any);
          },
        },
      ]
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

      {/* Top Header Bar with GEAR ICON for Settings */}
      <View style={styles.topNav}>
        <View>
          <Text
            style={[
              styles.screenTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Broker Profile
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDark ? "#94A3B8" : "#64748B" },
            ]}
          >
            Manage business identity & agency credentials
          </Text>
        </View>

        {/* GEAR ICON for SettingScreen */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleRouteToSettings}
          style={[
            styles.gearBtn,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E2E8F0",
            },
          ]}
          accessibilityLabel="Open Settings"
        >
          <Ionicons
            name="settings-sharp"
            size={21}
            color={colors.primary || "#0D9488"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary || "#0D9488"]}
            tintColor={colors.primary || "#0D9488"}
          />
        }
      >
        {/* 1. Hero Broker Identity Card with Verified Tier Badge */}
        <View style={styles.heroCardContainer}>
          <LinearGradient
            colors={["#0D9488", "#0F766E", "#115E59"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroTopRow}>
              {/* Avatar with Status Pulse */}
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
                  }}
                  style={styles.avatarImage}
                />
                <View style={styles.onlineBadge}>
                  <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.heroInfo}>
                <View style={styles.tierPill}>
                  <FontAwesome5 name="crown" size={10} color="#FDE047" />
                  <Text style={styles.tierPillText}>{partnerTier}</Text>
                </View>

                <Text style={styles.heroBrokerName}>{brokerName}</Text>
                <Text style={styles.heroAgencyName}>{brokerAgency}</Text>

                <View style={styles.heroRatingRow}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.heroRatingText}>4.9</Text>
                  <Text style={styles.heroReviewsCount}>(128 Verified Deals)</Text>
                </View>
              </View>
            </View>

            {/* Badges & Key Metadata */}
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <MaterialCommunityIcons
                  name="certificate-outline"
                  size={14}
                  color="#99F6E4"
                />
                <Text style={styles.metaChipText}>RERA: {reraNumber}</Text>
              </View>

              <View style={styles.metaChip}>
                <Ionicons name="location-outline" size={14} color="#99F6E4" />
                <Text style={styles.metaChipText}>Delhi NCR</Text>
              </View>
            </View>

            {/* Action Buttons: Edit Profile & Visiting Card */}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setTempName(brokerName);
                  setTempAgency(brokerAgency);
                  setTempPhone(brokerPhone);
                  setTempEmail(brokerEmail);
                  setTempLocation(brokerLocation);
                  setEditModalVisible(true);
                }}
                style={styles.heroEditBtn}
              >
                <Feather name="edit-2" size={14} color="#0F766E" />
                <Text style={styles.heroEditBtnText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleShareDigitalCard}
                style={styles.heroShareBtn}
              >
                <Feather name="share-2" size={14} color="#FFFFFF" />
                <Text style={styles.heroShareBtnText}>Share Card</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* 2. Broker Performance Overview Metrics */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Real Estate Portfolio Performance
          </Text>

          <View style={styles.metricsGrid}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/BrokerPanel/(tabs)/property" as any)}
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                },
              ]}
            >
              <View
                style={[
                  styles.metricIconBox,
                  { backgroundColor: isDark ? "#0F766E33" : "#CCFBF1" },
                ]}
              >
                <MaterialIcons name="apartment" size={22} color="#0D9488" />
              </View>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? "#F8FAFC" : "#0F172A" },
                ]}
              >
                14 Units
              </Text>
              <Text style={styles.metricLabel}>Managed Properties</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/BrokerPanel/(tabs)/money" as any)}
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                },
              ]}
            >
              <View
                style={[
                  styles.metricIconBox,
                  { backgroundColor: isDark ? "#065F4633" : "#ECFDF5" },
                ]}
              >
                <Ionicons name="key" size={20} color="#059669" />
              </View>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? "#F8FAFC" : "#0F172A" },
                ]}
              >
                38 Deals
              </Text>
              <Text style={styles.metricLabel}>Rooms Rented</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/BrokerPanel/(tabs)/money" as any)}
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                },
              ]}
            >
              <View
                style={[
                  styles.metricIconBox,
                  { backgroundColor: isDark ? "#1E3A8A33" : "#EFF6FF" },
                ]}
              >
                <Ionicons name="wallet-outline" size={20} color="#2563EB" />
              </View>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? "#F8FAFC" : "#0F172A" },
                ]}
              >
                ₹1.32 L
              </Text>
              <Text style={styles.metricLabel}>Total Commission</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setKycModalVisible(true)}
              style={[
                styles.metricCard,
                {
                  backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                },
              ]}
            >
              <View
                style={[
                  styles.metricIconBox,
                  { backgroundColor: isDark ? "#78350F33" : "#FEF3C7" },
                ]}
              >
                <Ionicons name="shield-checkmark" size={20} color="#D97706" />
              </View>
              <Text
                style={[
                  styles.metricValue,
                  { color: isDark ? "#F8FAFC" : "#0F172A" },
                ]}
              >
                100%
              </Text>
              <Text style={styles.metricLabel}>KYC Verified</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. Broker Quick Hub & Business Navigation */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Broker Business Operations
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            {/* Payout Bank Account */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/BrokerPanel/(tabs)/money" as any)}
              style={styles.menuRow}
            >
              <View style={styles.menuRowLeft}>
                <View
                  style={[styles.menuIconCircle, { backgroundColor: "#ECFDF5" }]}
                >
                  <MaterialCommunityIcons
                    name="bank"
                    size={20}
                    color="#059669"
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.menuTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Payout & Settlement Bank
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    HDFC Bank (•••• 4821) • Instant Auto-Credit
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View
              style={[
                styles.menuDivider,
                { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
              ]}
            />

            {/* RERA & Compliance Document */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setKycModalVisible(true)}
              style={styles.menuRow}
            >
              <View style={styles.menuRowLeft}>
                <View
                  style={[styles.menuIconCircle, { backgroundColor: "#EFF6FF" }]}
                >
                  <Ionicons name="document-text" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.menuTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    RERA & Broker Compliance
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    License {reraNumber} • GST Active
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View
              style={[
                styles.menuDivider,
                { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
              ]}
            />

            {/* Digital Business Card Modal */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setVisitingCardVisible(true)}
              style={styles.menuRow}
            >
              <View style={styles.menuRowLeft}>
                <View
                  style={[styles.menuIconCircle, { backgroundColor: "#FAF5FF" }]}
                >
                  <Ionicons name="qr-code-outline" size={20} color="#9333EA" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.menuTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Digital Visiting Card & QR
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    Share with tenants, landlords & clients
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View
              style={[
                styles.menuDivider,
                { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
              ]}
            />

            {/* Settings Screen Shortcut */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleRouteToSettings}
              style={styles.menuRow}
            >
              <View style={styles.menuRowLeft}>
                <View
                  style={[styles.menuIconCircle, { backgroundColor: "#F0FDFA" }]}
                >
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color={colors.primary || "#0D9488"}
                  />
                </View>
                <View>
                  <Text
                    style={[
                      styles.menuTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    App & Broker Settings
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    Notifications, security & account options
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Instant Notification Toggles */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Alerts & Preferences
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? "#F8FAFC" : "#0F172A" },
                  ]}
                >
                  Instant Lead & Visit Alerts
                </Text>
                <Text style={styles.menuSubtitle}>
                  Receive immediate push notification when a visit is booked
                </Text>
              </View>
              <Switch
                value={instantLeadAlerts}
                onValueChange={(val) => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setInstantLeadAlerts(val);
                }}
                trackColor={{ false: "#CBD5E1", true: colors.primary || "#0D9488" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.menuDivider,
                { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
              ]}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? "#F8FAFC" : "#0F172A" },
                  ]}
                >
                  WhatsApp Deal Updates
                </Text>
                <Text style={styles.menuSubtitle}>
                  Get tenancy agreements & commission receipts on WhatsApp
                </Text>
              </View>
              <Switch
                value={whatsappNotifications}
                onValueChange={(val) => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setWhatsappNotifications(val);
                }}
                trackColor={{ false: "#CBD5E1", true: colors.primary || "#0D9488" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.menuDivider,
                { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
              ]}
            />

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? "#F8FAFC" : "#0F172A" },
                  ]}
                >
                  Dark Mode
                </Text>
                <Text style={styles.menuSubtitle}>
                  Toggle dark theme for comfortable night viewing
                </Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setThemeMode(val ? "dark" : "light");
                }}
                trackColor={{ false: "#CBD5E1", true: colors.primary || "#0D9488" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* 5. Support & Legal */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Partner Support & Compliance
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                try {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                } catch {}
                Alert.alert(
                  "Partner Help Desk",
                  "Call Broker Relationship Manager: +91 1800 210 9988\nEmail: broker.support@estate360.com\nHours: 9 AM - 8 PM (Mon-Sat)"
                );
              }}
              style={styles.menuRow}
            >
              <View style={styles.menuRowLeft}>
                <View
                  style={[styles.menuIconCircle, { backgroundColor: "#FEF3C7" }]}
                >
                  <Ionicons name="headset-outline" size={20} color="#D97706" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.menuTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    24/7 Broker Support & Concierge
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    Dedicated relationship manager assistance
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <View
              style={[
                styles.menuDivider,
                { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
              ]}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(
                  "Broker Agreement",
                  "Governed by Indian Real Estate Regulatory Authority (RERA) norms. Commission payouts subject to 5% Section 194H TDS deduction."
                );
              }}
              style={styles.menuRow}
            >
              <View style={styles.menuRowLeft}>
                <View
                  style={[styles.menuIconCircle, { backgroundColor: "#F1F5F9" }]}
                >
                  <Ionicons name="shield-outline" size={20} color="#64748B" />
                </View>
                <View>
                  <Text
                    style={[
                      styles.menuTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Terms of Partnership & Payout Policy
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    View legal terms and TDS compliance rules
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogOut}
            style={styles.logoutBtn}
          >
            <Feather name="log-out" size={18} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Log Out of Broker Portal</Text>
          </TouchableOpacity>

          <Text style={styles.appVersionText}>
            Estate360 Broker Partner App v2.4.0 (Build 2026.03)
          </Text>
        </View>
      </ScrollView>

      {/* MODAL 1: Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
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
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalHeading,
                  { color: isDark ? "#F8FAFC" : "#0F172A" },
                ]}
              >
                Edit Broker Profile
              </Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? "#FFFFFF" : "#0F172A"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Full Name</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    },
                  ]}
                  value={tempName}
                  onChangeText={setTempName}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Agency / Firm Name</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    },
                  ]}
                  value={tempAgency}
                  onChangeText={setTempAgency}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Mobile Number</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    },
                  ]}
                  keyboardType="phone-pad"
                  value={tempPhone}
                  onChangeText={setTempPhone}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Business Email</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    },
                  ]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={tempEmail}
                  onChangeText={setTempEmail}
                />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Operating Locations</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                      color: isDark ? "#F8FAFC" : "#0F172A",
                    },
                  ]}
                  value={tempLocation}
                  onChangeText={setTempLocation}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleSaveProfile}
                style={[
                  styles.saveBtn,
                  { backgroundColor: colors.primary || "#0D9488" },
                ]}
              >
                <Text style={styles.saveBtnText}>Save Profile Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Digital Visiting Card Modal */}
      <Modal
        visible={visitingCardVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisitingCardVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View
            style={[
              styles.visitingCardBox,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            <TouchableOpacity
              onPress={() => setVisitingCardVisible(false)}
              style={styles.cardCloseIcon}
            >
              <Ionicons
                name="close-circle"
                size={26}
                color={isDark ? "#94A3B8" : "#64748B"}
              />
            </TouchableOpacity>

            <LinearGradient
              colors={["#0D9488", "#0F766E"]}
              style={styles.cardHeaderGrad}
            >
              <View style={styles.cardHeaderTop}>
                <FontAwesome5 name="building" size={18} color="#A7F3D0" />
                <Text style={styles.cardHeaderTitle}>ESTATE360 PARTNER</Text>
              </View>
              <Text style={styles.cardBrokerName}>{brokerName}</Text>
              <Text style={styles.cardAgency}>{brokerAgency}</Text>
            </LinearGradient>

            <View style={styles.cardBody}>
              <View style={styles.qrCodeBox}>
                <Ionicons name="qr-code" size={110} color="#0F766E" />
                <Text style={styles.qrCodeNote}>Scan to connect & view inventory</Text>
              </View>

              <View style={styles.cardDetailsList}>
                <View style={styles.cardDetailItem}>
                  <Ionicons name="call-outline" size={15} color="#0D9488" />
                  <Text style={[styles.cardDetailText, { color: isDark ? "#F1F5F9" : "#1E293B" }]}>{brokerPhone}</Text>
                </View>
                <View style={styles.cardDetailItem}>
                  <Ionicons name="mail-outline" size={15} color="#0D9488" />
                  <Text style={[styles.cardDetailText, { color: isDark ? "#F1F5F9" : "#1E293B" }]}>{brokerEmail}</Text>
                </View>
                <View style={styles.cardDetailItem}>
                  <Ionicons name="shield-checkmark-outline" size={15} color="#0D9488" />
                  <Text style={[styles.cardDetailText, { color: isDark ? "#F1F5F9" : "#1E293B" }]}>RERA: {reraNumber}</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleShareDigitalCard}
                style={[
                  styles.cardShareActionBtn,
                  { backgroundColor: colors.primary || "#0D9488" },
                ]}
              >
                <Feather name="share-2" size={16} color="#FFFFFF" />
                <Text style={styles.cardShareActionText}>Share Digital Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: KYC & Compliance Verification Modal */}
      <Modal
        visible={kycModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setKycModalVisible(false)}
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
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalHeading,
                  { color: isDark ? "#F8FAFC" : "#0F172A" },
                ]}
              >
                Broker Verification & KYC
              </Text>
              <TouchableOpacity
                onPress={() => setKycModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? "#FFFFFF" : "#0F172A"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.kycStatusCard}>
                <Ionicons name="checkmark-circle" size={32} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.kycStatusTitle}>Fully Verified Partner</Text>
                  <Text style={styles.kycStatusSub}>All regulatory documents verified on 15 Jan 2026</Text>
                </View>
              </View>

              <View
                style={[
                  styles.kycItem,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
              >
                <View style={styles.kycItemLeft}>
                  <MaterialCommunityIcons name="badge-account-horizontal" size={20} color="#0D9488" />
                  <View>
                    <Text style={[styles.kycItemName, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>RERA Agent Registration</Text>
                    <Text style={styles.kycItemVal}>Number: {reraNumber}</Text>
                  </View>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                </View>
              </View>

              <View
                style={[
                  styles.kycItem,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
              >
                <View style={styles.kycItemLeft}>
                  <Ionicons name="card-outline" size={20} color="#0D9488" />
                  <View>
                    <Text style={[styles.kycItemName, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>Aadhaar & PAN Card</Text>
                    <Text style={styles.kycItemVal}>PAN: ABCPS••••K</Text>
                  </View>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
                </View>
              </View>

              <View
                style={[
                  styles.kycItem,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
              >
                <View style={styles.kycItemLeft}>
                  <MaterialCommunityIcons name="bank" size={20} color="#0D9488" />
                  <View>
                    <Text style={[styles.kycItemName, { color: isDark ? "#F8FAFC" : "#0F172A" }]}>Bank Account (Auto-Settlement)</Text>
                    <Text style={styles.kycItemVal}>HDFC Bank (•••• 4821)</Text>
                  </View>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>ACTIVE</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setKycModalVisible(false)}
                style={[
                  styles.saveBtn,
                  { backgroundColor: colors.primary || "#0D9488" },
                ]}
              >
                <Text style={styles.saveBtnText}>Close Verification Window</Text>
              </TouchableOpacity>
            </ScrollView>
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
  gearBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroCardContainer: {
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  heroGradient: {
    borderRadius: 22,
    padding: 18,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#10B981",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  heroInfo: {
    flex: 1,
  },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 4,
    gap: 5,
  },
  tierPillText: {
    color: "#FDE047",
    fontSize: 10.5,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  heroBrokerName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  heroAgencyName: {
    color: "#CCFBF1",
    fontSize: 12.5,
    fontWeight: "500",
    marginTop: 1,
  },
  heroRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  heroRatingText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  heroReviewsCount: {
    color: "#99F6E4",
    fontSize: 11,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  metaChipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  heroActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
  },
  heroEditBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  heroEditBtnText: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "700",
  },
  heroShareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.22)",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  heroShareBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionContainer: {
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 36 - 10) / 2,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  metricIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11.5,
    color: "#64748B",
    fontWeight: "500",
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  menuSubtitle: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  switchInfo: {
    flex: 1,
    paddingRight: 10,
  },
  logoutContainer: {
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 48,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    gap: 8,
  },
  logoutBtnText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },
  appVersionText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "800",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  formField: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },
  formInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "700",
  },
  visitingCardBox: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  cardCloseIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  cardHeaderGrad: {
    padding: 18,
    paddingTop: 16,
  },
  cardHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    color: "#A7F3D0",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardBrokerName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  cardAgency: {
    color: "#CCFBF1",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  cardBody: {
    padding: 18,
    alignItems: "center",
  },
  qrCodeBox: {
    alignItems: "center",
    marginVertical: 10,
  },
  qrCodeNote: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 6,
  },
  cardDetailsList: {
    width: "100%",
    marginVertical: 12,
    gap: 8,
  },
  cardDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardDetailText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  cardShareActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 44,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  cardShareActionText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  kycStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 12,
    marginBottom: 14,
  },
  kycStatusTitle: {
    color: "#065F46",
    fontSize: 14.5,
    fontWeight: "700",
  },
  kycStatusSub: {
    color: "#047857",
    fontSize: 11.5,
    marginTop: 1,
  },
  kycItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  kycItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  kycItemName: {
    fontSize: 13,
    fontWeight: "700",
  },
  kycItemVal: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});
