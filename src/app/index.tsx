import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, G, Path } from "react-native-svg";
import { STORAGE_KEYS } from "../Redux/api/apiConfig";
import appStorage from "../Redux/api/storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);

  // Animation values
  const logoScale = useRef(new Animated.Value(0.35)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  const textSlide = useRef(new Animated.Value(22)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  // Bottom Graphic smooth bottom-to-up entrance
  const graphicOpacity = useRef(new Animated.Value(0)).current;
  const graphicSlide = useRef(new Animated.Value(SCREEN_HEIGHT * 0.35)).current;

  const circleScale = useRef(new Animated.Value(0.6)).current;
  const circleOpacity = useRef(new Animated.Value(0)).current;

  const bottomTextOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  const navigateToNextScreen = async () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    let targetRoute = "/(onboarding)";
    try {
      const accessToken = await appStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await appStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const userJson = await appStorage.getItem(STORAGE_KEYS.USER_DATA);

      console.log("==========================================");
      console.log("[SplashScreen] 🔍 Checking stored session...");

      if (accessToken && refreshToken && userJson) {
        const user = JSON.parse(userJson);
        const role = user?.role;

        console.log("[SplashScreen] ✅ Session verified for role:", role);

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
        console.log(
          "[SplashScreen] ℹ️ No active session found. Routing to onboarding.",
        );
        targetRoute = "/(onboarding)";
      }
    } catch (e) {
      console.log("[SplashScreen] Error reading session:", e);
      targetRoute = "/(onboarding)";
    }

    Animated.parallel([
      Animated.timing(exitScale, {
        toValue: 1.08,
        duration: 350,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 300,
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

    // 1. Top Decorative Circle Reveal
    Animated.parallel([
      Animated.spring(circleScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(circleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Bottom Architectural Graphic: Ultra-smooth Bottom-to-Up Glide
    Animated.parallel([
      Animated.timing(graphicOpacity, {
        toValue: 1,
        duration: 850,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(graphicSlide, {
        toValue: 0,
        duration: 1250,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Logo Spring Entrance
    Animated.sequence([
      Animated.delay(120),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5.5,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 4. Subtle Floating Loop for Logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -5,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 5. Typography Entrance
    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 6. Bottom Tagline Reveal
    Animated.sequence([
      Animated.delay(650),
      Animated.timing(bottomTextOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 7. Progress Beam & Auto Navigation
    Animated.sequence([
      Animated.delay(750),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: false,
      }),
    ]).start(() => {
      setTimeout(() => {
        navigateToNextScreen();
      }, 300);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: exitOpacity,
            transform: [{ scale: exitScale }],
          },
        ]}
      >
        {/* Base Rich Teal / Turquoise Background Gradient */}
        <LinearGradient
          colors={["#00B695", "#00A889", "#00997B", "#008066"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top-Right Decorative Elevated Circle Shape */}
        <Animated.View
          style={[
            styles.topRightCircle,
            {
              opacity: circleOpacity,
              transform: [{ scale: circleScale }],
            },
          ]}
          pointerEvents="none"
        />

        {/* Top Header Bar with Skip Button */}
        <View style={[styles.topBar, { top: Math.max(insets.top + 8, 22) }]}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={navigateToNextScreen}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
            <Feather name="chevron-right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom Graphic Section: Photorealistic Cityscape & 3D Wave with Smooth Bottom-to-Up Slide */}
        <Animated.View
          style={[
            styles.bottomGraphicWrapper,
            {
              opacity: graphicOpacity,
              transform: [{ translateY: graphicSlide }],
            },
          ]}
          pointerEvents="none"
        >
          {/* Framed Graphic View from Image Asset */}
          <View style={styles.graphicImageContainer}>
            <Image
              source={require("../../assets/images/splash.png")}
              style={styles.graphicImage}
              contentFit="cover"
            />

            {/* Deep Base Gradient for Tagline readability */}
            <LinearGradient
              colors={[
                "transparent",
                "rgba(0, 42, 34, 0.65)",
                "rgba(0, 30, 24, 0.95)",
              ]}
              style={styles.graphicBottomFade}
            />
          </View>
        </Animated.View>

        {/* Center Stage: House Logo + Title + Subtitle */}
        <View style={styles.centerContainer}>
          {/* Animated House + Pin Vector Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { translateY: logoFloat }],
              },
            ]}
          >
            <Svg width={115} height={115} viewBox="0 0 120 120">
              {/* House Roof Peaked Outline */}
              <Path
                d="M 16 54 L 60 18 L 86 39"
                stroke="#FFFFFF"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Roof Right Tip Accent */}
              <Path
                d="M 87 40 L 98 49"
                stroke="#5EEAD4"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />

              {/* House Left Wall and Foundation Base */}
              <Path
                d="M 26 50 L 26 88 L 56 88"
                stroke="#FFFFFF"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Solid White Location Pin on Bottom-Right */}
              <G transform="translate(61, 42)">
                <Path
                  d="M 21 0 C 9.4 0 0 9.4 0 21 C 0 34 17 52 21 56 C 25 52 42 34 42 21 C 42 9.4 32.6 0 21 0 Z"
                  fill="#FFFFFF"
                />
                {/* Inner Pin Dot Cutout */}
                <Circle cx="21" cy="20" r="7" fill="#00A889" />
              </G>
            </Svg>
          </Animated.View>

          {/* Clean Typography Title & Subtitle */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            <Text style={styles.titleText}>Field Agent App</Text>
            <Text style={styles.subTitleText}>
              Find Leads • Earn Commission • Grow Together
            </Text>
          </Animated.View>

          {/* Minimalist Progress Indicator */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Bottom Tagline: "Your Property. Our Priority." */}
        <Animated.View
          style={[
            styles.bottomTaglineContainer,
            {
              bottom: Math.max(insets.bottom + 20, 30),
              opacity: bottomTextOpacity,
            },
          ]}
        >
          <Text style={styles.bottomTaglineText}>
            Your Property. Our Priority.
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00997B",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  topRightCircle: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#00C9A7",
    opacity: 0.88,
    shadowColor: "#00382E",
    shadowOffset: { width: -4, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  topBar: {
    position: "absolute",
    right: 20,
    zIndex: 25,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  bottomGraphicWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.52,
    zIndex: 2,
  },
  graphicImageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  graphicImage: {
    width: SCREEN_WIDTH,
    height: "100%",
    position: "absolute",
    bottom: -38,
  },
  graphicTopFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
  },
  graphicBottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: -SCREEN_HEIGHT * 0.08,
    zIndex: 10,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  textContainer: {
    alignItems: "center",
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  subTitleText: {
    color: "rgba(255, 255, 255, 0.92)",
    fontSize: 13.5,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginTop: 10,
    textAlign: "center",
  },
  progressTrack: {
    width: 90,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 2,
    marginTop: 28,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  bottomTaglineContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 15,
  },
  bottomTaglineText: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.4,
    textAlign: "center",
  },
});
