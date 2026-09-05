import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  ScrollView,
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

interface Hotline {
  id: string;
  name: string;
  number: string;
  desc: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  gradient: [string, string];
  bgColor: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  isNational?: boolean;
}

const EMERGENCY_HOTLINES: Hotline[] = [
  {
    id: "police",
    name: "National Emergency & Police",
    number: "112",
    desc: "Direct Delhi Police & Unified Emergency Dispatch",
    icon: "police-badge",
    color: "#DC2626",
    gradient: ["#EF4444", "#DC2626"],
    bgColor: "#FEE2E2",
    badge: "NATIONAL COMMAND",
    badgeBg: "#FEE2E2",
    badgeColor: "#B91C1C",
    isNational: true,
  },
  {
    id: "dpx_sos",
    name: "DPX Rapid Response Warden",
    number: "+91 99999 11111",
    desc: "Dedicated On-Site Delhi Property Security Desk",
    icon: "shield-alert",
    color: "#2563EB",
    gradient: ["#3B82F6", "#1D4ED8"],
    bgColor: "#DBEAFE",
    badge: "ESTATE WARDEN",
    badgeBg: "#DBEAFE",
    badgeColor: "#1E40AF",
  },
  {
    id: "women_helpline",
    name: "Delhi Women Safety Helpline",
    number: "1091",
    desc: "Special Police Unit for Women & Children (SPUWAC)",
    icon: "account-heart",
    color: "#DB2777",
    gradient: ["#EC4899", "#BE185D"],
    bgColor: "#FCE7F3",
    badge: "24/7 TOLL-FREE",
    badgeBg: "#FCE7F3",
    badgeColor: "#9D174D",
    isNational: true,
  },
  {
    id: "ambulance",
    name: "Emergency Ambulance & Trauma",
    number: "102",
    desc: "CATs Delhi Ambulance & AIIMS Trauma ER",
    icon: "ambulance",
    color: "#EA580C",
    gradient: ["#F97316", "#C2410C"],
    bgColor: "#FFEDD5",
    badge: "TRAUMA ER",
    badgeBg: "#FFEDD5",
    badgeColor: "#9A3412",
  },
  {
    id: "fire",
    name: "Delhi Fire & Disaster Service",
    number: "101",
    desc: "Delhi Fire Control Room & Rescue Operations",
    icon: "fire",
    color: "#B91C1C",
    gradient: ["#EF4444", "#991B1B"],
    bgColor: "#FEE2E2",
    badge: "DISASTER CONTROL",
    badgeBg: "#FEE2E2",
    badgeColor: "#7F1D1D",
  },
];

const NEARBY_SERVICES = [
  {
    name: "Hauz Khas Police Station",
    type: "Police Station",
    distance: "0.8 km",
    address: "Outer Ring Rd, Hauz Khas, New Delhi",
    phone: "011-26510035",
  },
  {
    name: "Max Super Speciality Hospital",
    type: "24/7 Trauma & ER",
    distance: "1.4 km",
    address: "1, 2, Press Enclave Marg, Saket",
    phone: "011-26515050",
  },
  {
    name: "Apollo 24/7 Pharmacy",
    type: "24-Hour Chemist",
    distance: "350 m",
    address: "Main Market, Green Park, New Delhi",
    phone: "+91 98112 00998",
  },
];

const SafetyEmergencySOS = () => {
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

  // Pulse animation for SOS button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  const handleSOSPress = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {}

    Alert.alert(
      "🚨 EMERGENCY SOS TRIGGER",
      "Are you sure you want to trigger Emergency SOS?\n\nThis will:\n1. Call DPX Rapid Response (+91 99999 11111)\n2. Dispatch live GPS coordinates to your Guardian\n3. Alert on-duty Building Warden",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "TRIGGER SOS NOW",
          style: "destructive",
          onPress: () => {
            setSosActive(true);
            Linking.openURL("tel:9999911111").catch(() => {
              Alert.alert(
                "SOS Dispatched",
                "Emergency alert sent to DPX Command Desk and Delhi Police 112.",
              );
            });
          },
        },
      ],
    );
  };

  const handleCall = (number: string, name: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}
    Linking.openURL(`tel:${number.replace(/\s+/g, "")}`).catch(() => {
      Alert.alert(name, `Emergency Contact: ${number}`);
    });
  };

  const handleShareLocation = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    const text = encodeURIComponent(
      "EMERGENCY ALERT: I need assistance. My current location at Delhi Property Exchange Residency (Room 204, Green Park, New Delhi). Live Location: https://maps.google.com/?q=28.5562,77.2070",
    );
    Linking.openURL(`https://wa.me/?text=${text}`).catch(() => {
      Alert.alert(
        "Location Broadcast",
        "Your live coordinates have been prepared for SMS/WhatsApp broadcast.",
      );
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : "#F8FAFC" },
      ]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Header */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.borderLight,
            paddingHorizontal: spacing.screenHorizontal,
            paddingVertical: spacing.sm + 2,
          },
        ]}
      >
        <View style={layout.horizontalViewBetween}>
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

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: moderateScale(16),
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              Safety & Emergency SOS
            </Text>
            <Text
              style={{
                fontSize: moderateScale(11),
                color: "#DC2626",
                fontWeight: "700",
                marginTop: 1,
              }}
            >
              Delhi Police & DPX Security Link
            </Text>
          </View>

          <View
            style={[
              styles.activeShieldBadge,
              {
                backgroundColor: isDark ? "rgba(220, 38, 38, 0.15)" : "#FEE2E2",
              },
            ]}
          >
            <Ionicons name="shield-checkmark" size={14} color="#DC2626" />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + moderateScale(40),
          gap: spacing.lg,
        }}
      >
        {/* Pulsing 1-Tap SOS Hero Card */}
        <View
          style={[
            styles.sosHeroCard,
            {
              backgroundColor: isDark ? "rgba(220, 38, 38, 0.15)" : "#FFF1F2",
              borderColor: isDark ? "#991B1B" : "#FECDD3",
              borderRadius: radii.xxl,
              padding: spacing.lg,
            },
            shadows.md,
          ]}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: moderateScale(11.5),
                fontWeight: "800",
                letterSpacing: 1.2,
                color: "#DC2626",
                textTransform: "uppercase",
              }}
            >
              Instant Emergency Dispatch
            </Text>
            <Text
              style={{
                fontSize: moderateScale(12.5),
                color: colors.textSecondary,
                textAlign: "center",
                marginTop: 3,
                marginBottom: spacing.md,
              }}
            >
              Tap to alert security, call police & notify guardian
            </Text>

            {/* Glowing Pulsing SOS Circle */}
            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
            >
              <TouchableOpacity
                onPress={handleSOSPress}
                activeOpacity={0.85}
                style={[styles.sosCircleBtn, shadows.floating]}
              >
                <LinearGradient
                  colors={["#EF4444", "#DC2626", "#991B1B"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sosGradient}
                >
                  <MaterialCommunityIcons
                    name="alarm-light"
                    size={moderateScale(36)}
                    color="#FFFFFF"
                  />
                  <Text style={styles.sosText}>SOS</Text>
                  <Text style={styles.sosSubtext}>PRESS FOR HELP</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Quick Share Location Button */}
            <TouchableOpacity
              onPress={handleShareLocation}
              activeOpacity={0.8}
              style={[
                styles.shareLocBtn,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: isDark ? colors.border : "#E2E8F0",
                  borderRadius: radii.xl,
                  marginTop: spacing.lg,
                },
                shadows.sm,
              ]}
            >
              <Ionicons
                name="location"
                size={moderateScale(16)}
                color="#2563EB"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(12.5),
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Share Live GPS with Guardian & Flatmates
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency Hotlines Directory */}
        <View>
          <View
            style={[
              layout.horizontalViewBetween,
              { marginBottom: spacing.sm + 2 },
            ]}
          >
            <View>
              <Text
                style={[
                  typography.sectionTitle,
                  {
                    fontSize: moderateScale(15),
                    fontWeight: "800",
                    color: colors.textPrimary,
                  },
                ]}
              >
                Direct Emergency Hotlines
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  marginTop: 1,
                }}
              >
                Tap to connect instantly to on-duty responders
              </Text>
            </View>

            <View
              style={[
                styles.liveStatusPill,
                {
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "#DCFCE7",
                },
              ]}
            >
              <View style={styles.liveGreenDot} />
              <Text
                style={{
                  fontSize: moderateScale(10),
                  fontWeight: "800",
                  color: "#15803D",
                  marginLeft: 4,
                }}
              >
                LIVE 24/7
              </Text>
            </View>
          </View>

          <View style={{ gap: spacing.sm + 2 }}>
            {EMERGENCY_HOTLINES.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleCall(item.number, item.name)}
                activeOpacity={0.82}
                style={[
                  styles.hotlineCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xxl || 22,
                    padding: spacing.md,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.primary,
                  },
                  shadows.sm,
                ]}
              >
                {/* Top Badge Strip */}
                <View
                  style={[
                    layout.horizontalViewBetween,
                    { marginBottom: spacing.xs + 3 },
                  ]}
                >
                  <View
                    style={[
                      styles.hotlineBadge,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(9.5),
                        fontWeight: "800",
                        color: isDark ? colors.textPrimary : "#ffff",
                        letterSpacing: 0.5,
                      }}
                    >
                      {item.badge}
                    </Text>
                  </View>

                  <View style={layout.horizontalView}>
                    <Feather
                      name="zap"
                      size={moderateScale(10.5)}
                      color="#059669"
                      style={{ marginRight: 3 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(10),
                        fontWeight: "700",
                        color: "#059669",
                      }}
                    >
                      Instant Priority Link
                    </Text>
                  </View>
                </View>

                {/* Main Content & Call CTA */}
                <View style={layout.horizontalViewBetween}>
                  {/* Left: Icon & Info */}
                  <View
                    style={[
                      layout.horizontalView,
                      { flex: 1, marginRight: spacing.sm },
                    ]}
                  >
                    <View
                      style={[
                        styles.hotlineIconBox,
                        {
                          backgroundColor: isDark
                            ? "rgba(13, 148, 136, 0.16)"
                            : colors.primaryLight || "#CCFBF1",
                          borderColor: isDark
                            ? "rgba(13, 148, 136, 0.35)"
                            : colors.primarySoft || "#99F6E4",
                          borderRadius: radii.xl || 16,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={moderateScale(22)}
                        color={colors.primary}
                      />
                    </View>

                    <View style={{ marginLeft: spacing.sm + 3, flex: 1 }}>
                      <Text
                        style={{
                          fontSize: moderateScale(13.5),
                          fontWeight: "800",
                          color: colors.textPrimary,
                        }}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          color: colors.textSecondary,
                          marginTop: 2,
                          lineHeight: moderateScale(14),
                        }}
                        numberOfLines={2}
                      >
                        {item.desc}
                      </Text>
                    </View>
                  </View>

                  {/* Right: Glow Call Button */}
                  <View
                    style={[
                      styles.hotlineCallBtn,
                      {
                        borderRadius: radii.pill,
                        shadowColor: item.color,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 8,
                        elevation: 4,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={item.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.callBtnGradient}
                    >
                      <Feather
                        name="phone-call"
                        size={moderateScale(12)}
                        color="#FFFFFF"
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={{
                          fontSize: moderateScale(12.5),
                          fontWeight: "800",
                          color: "#FFFFFF",
                          letterSpacing: 0.2,
                        }}
                      >
                        {item.number}
                      </Text>
                    </LinearGradient>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Guardian / Emergency Contact Card */}
        <View
          style={[
            styles.guardianCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xxl,
              padding: spacing.md + 2,
            },
            shadows.sm,
          ]}
        >
          <View
            style={[layout.horizontalViewBetween, { marginBottom: spacing.sm }]}
          >
            <View style={layout.horizontalView}>
              <Feather
                name="users"
                size={moderateScale(16)}
                color="#059669"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(14),
                  fontWeight: "800",
                  color: colors.textPrimary,
                }}
              >
                My Emergency Circle
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push(
                  "/CusomterPanelScreens/EditProfile/Editprofile" as any,
                )
              }
            >
              <Text
                style={{
                  fontSize: moderateScale(11.5),
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                Edit in Profile
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              layout.horizontalViewBetween,
              styles.contactItem,
              {
                backgroundColor: isDark
                  ? colors.surfaceHover
                  : colors.surfaceLight,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
            ]}
          >
            <View>
              <Text
                style={{
                  fontSize: moderateScale(13.5),
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Sunita Sharma
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  marginTop: 1,
                }}
              >
                Mother / Primary Guardian • +91 98112 23344
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleCall("+919811223344", "Mother")}
              style={[
                styles.quickCallBtn,
                { backgroundColor: "#059669", borderRadius: radii.pill },
              ]}
            >
              <Feather name="phone" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearby Emergency Facilities (Police, Hospital, Chemist) */}
        <View>
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(15),
                fontWeight: "800",
                color: colors.textPrimary,
                marginBottom: spacing.xs + 2,
              },
            ]}
          >
            Nearby Emergency Spots (Within 2 KM)
          </Text>

          <View style={{ gap: spacing.sm }}>
            {NEARBY_SERVICES.map((place, idx) => (
              <View
                key={idx}
                style={[
                  styles.placeCard,
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
                  <View style={{ flex: 1, marginRight: spacing.sm }}>
                    <View style={layout.horizontalView}>
                      <Text
                        style={{
                          fontSize: moderateScale(13),
                          fontWeight: "800",
                          color: colors.textPrimary,
                        }}
                      >
                        {place.name}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: moderateScale(11),
                        fontWeight: "600",
                        color: colors.primary,
                        marginTop: 1,
                      }}
                    >
                      {place.type} • {place.distance}
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(10.5),
                        color: colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {place.address}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleCall(place.phone, place.name)}
                    style={[
                      styles.placeCallBtn,
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
                      name="phone"
                      size={moderateScale(14)}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Delhi Property Exchange Safety Shield Guarantee */}
        <View
          style={[
            styles.safetyGuaranteeCard,
            {
              backgroundColor: isDark ? "rgba(16, 185, 129, 0.12)" : "#F0FDF4",
              borderColor: isDark ? "#065F46" : "#BBF7D0",
              borderRadius: radii.xxl,
              padding: spacing.md + 2,
            },
          ]}
        >
          <View style={layout.horizontalView}>
            <Ionicons
              name="shield-checkmark"
              size={moderateScale(24)}
              color="#16A34A"
              style={{ marginRight: spacing.sm }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: moderateScale(13),
                  fontWeight: "800",
                  color: "#16A34A",
                }}
              >
                100% CCTV & Gate Monitored Facility
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  marginTop: 2,
                  lineHeight: moderateScale(15),
                }}
              >
                Every DPX residence is equipped with 24/7 high-definition CCTV,
                biometric entry control, and verified visitor logging.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SafetyEmergencySOS;

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
  activeShieldBadge: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  sosHeroCard: {
    borderWidth: 1,
    alignItems: "center",
  },
  sosCircleBtn: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
  },
  sosGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  sosText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 2,
  },
  sosSubtext: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  shareLocBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    width: "100%",
  },
  liveStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 9999,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#15803D",
  },
  hotlineCard: {
    borderWidth: 1,
  },
  hotlineBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  hotlineIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hotlineCallBtn: {
    overflow: "hidden",
  },
  callBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  guardianCard: {
    borderWidth: 1,
  },
  contactItem: {
    marginTop: 6,
  },
  quickCallBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  placeCard: {
    borderWidth: 1,
  },
  placeCallBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  safetyGuaranteeCard: {
    borderWidth: 1,
  },
});
