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
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appStorage from "../../Redux/api/storage";
import { STORAGE_KEYS } from "../../Redux/api/apiConfig";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);

  // ==========================================
  // ANIMATION TIMELINES
  // ==========================================
  // 1. Ambient Background Glow Breathing
  const bgGlowScale = useRef(new Animated.Value(0.8)).current;
  const bgGlowOpacity = useRef(new Animated.Value(0)).current;

  // 2. Central Logo Reveal & Spring
  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-15)).current;
  const logoFloatAnim = useRef(new Animated.Value(0)).current;

  // 3. Orbiting Micro-Badge Entrances
  const badge1Anim = useRef(new Animated.Value(0)).current; // Top-Left (Key)
  const badge2Anim = useRef(new Animated.Value(0)).current; // Top-Right (Building)
  const badge3Anim = useRef(new Animated.Value(0)).current; // Bottom-Right (Shield)
  const badge4Anim = useRef(new Animated.Value(0)).current; // Bottom-Left (Star)

  // 4. Typography & Tagline
  const titleSlide = useRef(new Animated.Value(25)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const tagSlide = useRef(new Animated.Value(15)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;

  // 5. Progress Beam
  const progressWidth = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;

  // 6. Master Screen Exit
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  const navigateToNextScreen = async () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    // Check stored session safely via appStorage adapter (ACCESS_TOKEN, REFRESH_TOKEN, USER_DATA)
    let targetRoute = "/(onboarding)";
    try {
      const accessToken = await appStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await appStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userJson = await appStorage.getItem(STORAGE_KEYS.USER_DATA);

      console.log("==========================================");
      console.log("[SplashScreen] 🔍 Checking stored session (ACCESS_TOKEN, REFRESH_TOKEN, USER_DATA)...");
      console.log("[SplashScreen] Access Token:", accessToken ? `${accessToken.substring(0, 25)}...` : "None");
      console.log("[SplashScreen] Refresh Token:", refreshToken ? `${refreshToken.substring(0, 25)}...` : "None");
      console.log("[SplashScreen] User Data:", userJson || "None");

      // Only route to dashboard if ALL THREE (access token, refresh token, and user data) are present
      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson);
        const role = user?.role;

        console.log("[SplashScreen] ✅ All auth credentials present for:", user?.name || user?.email || user?.phone, "| Role:", role);

        if (role === "FIELD_AGENT") {
          targetRoute = "/FiledAgentPanel/(tabs)/Dashboard";
        } else if (role === "SUPER_ADMIN") {
          targetRoute = "/SuperAdminPanel/(tabs)/Dashboard";
        } else if (role === "PROPERTY_OWNER") {
          targetRoute = "/HouseOwnerPanel/(tabs)/Dashboard";
        } else if (role === "VERIFICATION_STAFF") {
          targetRoute = "/VerificationStaffPanel/(tabs)/Dashboard";
        } else if (role === "SUB_ADMIN" || role === "ADMIN_PARTNER") {
          targetRoute = "/AdminPartnerPanel/(tabs)/Dashboard";
        } else if (role === "BROKER") {
          targetRoute = "/BrokerPanel/(tabs)/Dashboard";
        } else {
          targetRoute = "/CustomerPanel/(tabs)";
        }
      } else {
        console.log("[SplashScreen] ℹ️ Auth tokens/user data missing or incomplete. Routing to onboarding screen.");
        targetRoute = "/(onboarding)";
      }
      console.log("[SplashScreen] 🚀 Navigating to:", targetRoute);
      console.log("==========================================");
    } catch (e: any) {
      console.log("[SplashScreen] Error reading session from storage:", e?.message);
      targetRoute = "/(onboarding)";
    }

    // Cinematic Zoom-Through Exit
    Animated.parallel([
      Animated.timing(exitScale, {
        toValue: 1.18,
        duration: 380,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 320,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace(targetRoute as any);
    });
  };

  useEffect(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    // 1. Start Ambient Background Glow Loop
    Animated.parallel([
      Animated.timing(bgGlowOpacity, {
        toValue: 0.85,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(bgGlowScale, {
        toValue: 1.2,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Central Logo Spring In
    Animated.sequence([
      Animated.delay(180),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5.5,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(logoRotate, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 3. Staggered Orbiting Feature Badges
    Animated.stagger(100, [
      Animated.spring(badge1Anim, {
        toValue: 1,
        friction: 5,
        tension: 55,
        delay: 500,
        useNativeDriver: true,
      }),
      Animated.spring(badge2Anim, {
        toValue: 1,
        friction: 5,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.spring(badge3Anim, {
        toValue: 1,
        friction: 5,
        tension: 55,
        useNativeDriver: true,
      }),
      Animated.spring(badge4Anim, {
        toValue: 1,
        friction: 5,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();

    // 4. Subtle Floating Loop for Center Logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 5. Typography Entrance
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.spring(titleSlide, {
          toValue: 0,
          friction: 7,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(tagSlide, {
          toValue: 0,
          friction: 7,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 6. Loading Beam Progress Animation
    Animated.sequence([
      Animated.delay(850),
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(progressWidth, {
        toValue: 1,
        duration: 1400,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Auto-navigate after splash sequence finishes
      setTimeout(() => {
        navigateToNextScreen();
      }, 250);
    });
  }, []);

  const logoRotationInterpolate = logoRotate.interpolate({
    inputRange: [-15, 0],
    outputRange: ["-15deg", "0deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Main Animated Outer Container */}
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: exitOpacity,
            transform: [{ scale: exitScale }],
          },
        ]}
      >
        {/* 1. Deep Luxury Background Gradient */}
        <LinearGradient
          colors={["#06090E", "#0B151C", "#072421", "#041614"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* 2. Radial Ambient Glow Halo behind the Center Logo */}
        <Animated.View
          style={[
            styles.radialGlowWrapper,
            {
              opacity: bgGlowOpacity,
              transform: [{ scale: bgGlowScale }],
            },
          ]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[
              "rgba(13, 148, 136, 0.45)",
              "rgba(15, 118, 110, 0.2)",
              "rgba(6, 9, 14, 0)",
            ]}
            style={styles.radialGlowCircle}
          />
        </Animated.View>

        {/* 3. Top Skip Button for Fast Access */}
        <View style={[styles.topBar, { top: Math.max(insets.top + 8, 24) }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={navigateToNextScreen}
            style={styles.skipBtn}
          >
            <Text style={styles.skipText}>Skip</Text>
            <Feather name="chevron-right" size={14} color="#99F6E4" />
          </TouchableOpacity>
        </View>

        {/* 4. Center Stage: Brand Icon + Dynamic Floating Badges */}
        <View style={styles.centerStage}>
          {/* Outer Breathing Rings */}
          <View style={styles.concentricRing1} />
          <View style={styles.concentricRing2} />

          {/* Micro Badge 1: Top-Left (Instant Key Access) */}
          <Animated.View
            style={[
              styles.floatingBadge,
              styles.badgeTopLeft,
              {
                opacity: badge1Anim,
                transform: [
                  {
                    scale: badge1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                  {
                    translateY: badge1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#0D9488", "#0F766E"]}
              style={styles.badgeInner}
            >
              <Ionicons name="key" size={16} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Micro Badge 2: Top-Right (Premium Stays / PG) */}
          <Animated.View
            style={[
              styles.floatingBadge,
              styles.badgeTopRight,
              {
                opacity: badge2Anim,
                transform: [
                  {
                    scale: badge2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                  {
                    translateY: badge2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#3B82F6", "#1D4ED8"]}
              style={styles.badgeInner}
            >
              <MaterialIcons name="apartment" size={18} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Micro Badge 3: Bottom-Right (100% Verified Shield) */}
          <Animated.View
            style={[
              styles.floatingBadge,
              styles.badgeBottomRight,
              {
                opacity: badge3Anim,
                transform: [
                  {
                    scale: badge3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                  {
                    translateY: badge3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={styles.badgeInner}
            >
              <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Micro Badge 4: Bottom-Left (5-Star Rating) */}
          <Animated.View
            style={[
              styles.floatingBadge,
              styles.badgeBottomLeft,
              {
                opacity: badge4Anim,
                transform: [
                  {
                    scale: badge4Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                  {
                    translateY: badge4Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#F59E0B", "#D97706"]}
              style={styles.badgeInner}
            >
              <Ionicons name="star" size={15} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Central Logo Box with Float and Pop */}
          <Animated.View
            style={[
              styles.logoCard,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { rotate: logoRotationInterpolate },
                  { translateY: logoFloatAnim },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={["#134E4A", "#0F766E", "#0D9488"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCardGradient}
            >
              {/* Logo Image from Assets */}
              <Image
                source={require("../../../assets/images/logo1.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* 5. Typography & Brand Identity Reveal */}
        <View style={styles.brandTextContainer}>
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleSlide }],
            }}
          >
            <View style={styles.brandTagPill}>
              <View style={styles.brandTagDot} />
              <Text style={styles.brandTagPillText}>
                DELHI NCR PROPERTY HUB
              </Text>
            </View>

            <Text style={styles.brandTitle}>
              DELHI PROPERTY{" "}
              <Text style={styles.brandTitleHighlight}>EXCHANGE</Text>
            </Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: tagOpacity,
              transform: [{ translateY: tagSlide }],
            }}
          >
            <Text style={styles.brandSubtitle}>
              Smart Stays • Instant Leases • Zero Brokerage
            </Text>
          </Animated.View>
        </View>

        {/* 6. Sleek Bottom Loading Beam */}
        <Animated.View
          style={[
            styles.bottomProgressWrapper,
            {
              opacity: progressOpacity,
              paddingBottom: Math.max(insets.bottom + 20, 36),
            },
          ]}
        >
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={["#2DD4BF", "#0D9488", "#14B8A6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>

          <Text style={styles.progressStatusText}>
            Initializing Real Estate Engine...
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#06090E",
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  radialGlowWrapper: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.28 - 140,
    left: SCREEN_WIDTH / 2 - 140,
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  radialGlowCircle: {
    width: "100%",
    height: "100%",
    borderRadius: 140,
  },
  topBar: {
    position: "absolute",
    right: 20,
    zIndex: 20,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  skipText: {
    color: "#E2E8F0",
    fontSize: 12.5,
    fontWeight: "600",
  },
  centerStage: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SCREEN_HEIGHT * 0.16,
    position: "relative",
  },
  concentricRing1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(13, 148, 136, 0.22)",
  },
  concentricRing2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: "rgba(13, 148, 136, 0.1)",
  },
  logoCard: {
    width: 124,
    height: 124,
    borderRadius: 34,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 14,
    zIndex: 10,
  },
  logoCardGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.35)",
    padding: 18,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  floatingBadge: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    zIndex: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeInner: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  badgeTopLeft: {
    top: 8,
    left: 8,
  },
  badgeTopRight: {
    top: 10,
    right: 8,
  },
  badgeBottomRight: {
    bottom: 8,
    right: 12,
  },
  badgeBottomLeft: {
    bottom: 10,
    left: 10,
  },
  brandTextContainer: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: -20,
  },
  brandTagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 148, 136, 0.2)",
    borderColor: "rgba(20, 184, 166, 0.4)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 10,
    gap: 6,
  },
  brandTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2DD4BF",
  },
  brandTagPillText: {
    color: "#2DD4BF",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  brandTitleHighlight: {
    color: "#2DD4BF",
  },
  brandSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.4,
  },
  bottomProgressWrapper: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  progressBarTrack: {
    width: "100%",
    maxWidth: 240,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressStatusText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 10,
    letterSpacing: 0.3,
  },
});
