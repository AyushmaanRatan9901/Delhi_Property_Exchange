import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";
import { STORAGE_KEYS } from "../Redux/api/apiConfig";
import appStorage from "../Redux/api/storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);

  // Animation Values
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  const textSlide = useRef(new Animated.Value(20)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const skylineOpacity = useRef(new Animated.Value(0)).current;
  const skylineSlide = useRef(new Animated.Value(30)).current;

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

    // Smooth Zoom-Out Transition
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

    // 1. Logo Pop & Spring Entrance
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 2. Continuous Subtle Floating of the Logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloat, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloat, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // 3. Text Reveal
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.spring(textSlide, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 4. Skyline Silhouette Fade-In
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(skylineOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(skylineSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 5. Bottom Tagline
    Animated.sequence([
      Animated.delay(800),
      Animated.timing(bottomTextOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 6. Progress & Auto Navigate
    Animated.sequence([
      Animated.delay(800),
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
        {/* Rich Turquoise / Emerald Gradient Background */}
        <LinearGradient
          colors={["#00B894", "#009E80", "#00846C", "#006654"]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Ambient Fluid Waves in Background */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            viewBox="0 0 400 800"
            style={StyleSheet.absoluteFill}
          >
            {/* Upper soft wave */}
            <Path
              d="M -50,160 Q 120,80 250,180 T 450,150 L 450,0 L -50,0 Z"
              fill="rgba(255, 255, 255, 0.05)"
            />
            {/* Mid curved wave */}
            <Path
              d="M -50,380 Q 140,280 240,400 T 450,340 L 450,600 L -50,600 Z"
              fill="rgba(0, 70, 58, 0.12)"
            />
            {/* Deep subtle wave contour */}
            <Path
              d="M -50,520 Q 150,460 300,560 T 450,500"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="40"
              fill="none"
            />
          </Svg>
        </View>

        {/* Top Status Bar Padding & Skip Option */}
        <View style={[styles.topBar, { top: Math.max(insets.top + 6, 20) }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={navigateToNextScreen}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
            <Feather
              name="chevron-right"
              size={14}
              color="rgba(255, 255, 255, 0.85)"
            />
          </TouchableOpacity>
        </View>

        {/* Center Section: Logo + App Name + Tagline */}
        <View style={styles.centerContainer}>
          {/* Animated Logo with floating effect */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { translateY: logoFloat }],
              },
            ]}
          >
            {/* Custom SVG House + Location Pin Logo Matching the Reference */}
            <Svg width={110} height={110} viewBox="0 0 120 120">
              <Defs>
                <SvgLinearGradient
                  id="roofAccent"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <Stop offset="0%" stopColor="#5EEAD4" />
                  <Stop offset="100%" stopColor="#2DD4BF" />
                </SvgLinearGradient>
              </Defs>

              {/* House Roof (Left slant to peak) */}
              <Path
                d="M 18 52 L 60 18 L 84 37"
                stroke="#FFFFFF"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Roof Accent Pill on top-right */}
              <Path
                d="M 85 38 L 98 48"
                stroke="url(#roofAccent)"
                strokeWidth="8.5"
                strokeLinecap="round"
                fill="none"
              />

              {/* House Main Walls (Left side and bottom floor) */}
              <Path
                d="M 28 50 L 28 88 L 56 88"
                stroke="#FFFFFF"
                strokeWidth="8.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Solid White Location Pin on Bottom-Right */}
              <G transform="translate(62, 44)">
                {/* Pin Shape */}
                <Path
                  d="M 20 0 C 8.95 0 0 8.95 0 20 C 0 32.5 16 50 20 54 C 24 50 40 32.5 40 20 C 40 8.95 31.05 0 20 0 Z"
                  fill="#FFFFFF"
                />
                {/* Inner Pin Cutout Dot */}
                <Circle cx="20" cy="19" r="6.5" fill="#008E74" />
              </G>
            </Svg>
          </Animated.View>

          {/* Typography Header & Subtitle */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            <Text style={styles.titleText}>Delhi Exchange Property</Text>
            <Text style={styles.subTitleText}>
              Find Leads • Earn Commission • Grow Together
            </Text>
          </Animated.View>

          {/* Sleek Progress Indicator */}
          <View style={styles.progressBarWrapper}>
            <Animated.View
              style={[
                styles.progressBarFill,
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

        {/* Bottom Cityscape Silhouette Art */}
        <Animated.View
          style={[
            styles.bottomSkylineWrapper,
            {
              opacity: skylineOpacity,
              transform: [{ translateY: skylineSlide }],
            },
          ]}
          pointerEvents="none"
        >
          <Svg
            width={SCREEN_WIDTH}
            height={220}
            viewBox="0 0 400 220"
            style={styles.skylineSvg}
            preserveAspectRatio="xMidYMax slice"
          >
            {/* Background Layer Towers */}
            <G fill="rgba(0, 48, 40, 0.28)">
              <Rect x="20" y="70" width="45" height="150" rx="3" />
              <Rect x="80" y="45" width="55" height="175" rx="4" />
              <Rect x="150" y="80" width="40" height="140" rx="2" />
              <Rect x="200" y="30" width="65" height="190" rx="5" />
              <Rect x="280" y="60" width="50" height="160" rx="3" />
              <Rect x="340" y="85" width="45" height="135" rx="2" />
            </G>

            {/* Midground Layer Buildings with Window Details */}
            <G fill="rgba(0, 40, 32, 0.42)">
              {/* Building 1 */}
              <Rect x="5" y="110" width="55" height="110" rx="4" />
              {/* Windows B1 */}
              <Rect
                x="15"
                y="125"
                width="8"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
              <Rect
                x="30"
                y="125"
                width="8"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
              <Rect
                x="45"
                y="125"
                width="8"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
              <Rect
                x="15"
                y="145"
                width="8"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
              <Rect
                x="30"
                y="145"
                width="8"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
              <Rect
                x="45"
                y="145"
                width="8"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />

              {/* Tower 2 */}
              <Rect x="70" y="75" width="60" height="145" rx="4" />
              {/* Spire */}
              <Path
                d="M 98 75 L 100 55 L 102 75 Z"
                fill="rgba(0, 40, 32, 0.42)"
              />
              {/* Windows Tower 2 */}
              <Rect
                x="82"
                y="90"
                width="10"
                height="14"
                rx="1"
                fill="rgba(255,255,255,0.09)"
              />
              <Rect
                x="108"
                y="90"
                width="10"
                height="14"
                rx="1"
                fill="rgba(255,255,255,0.09)"
              />
              <Rect
                x="82"
                y="115"
                width="10"
                height="14"
                rx="1"
                fill="rgba(255,255,255,0.09)"
              />
              <Rect
                x="108"
                y="115"
                width="10"
                height="14"
                rx="1"
                fill="rgba(255,255,255,0.09)"
              />
              <Rect
                x="82"
                y="140"
                width="10"
                height="14"
                rx="1"
                fill="rgba(255,255,255,0.09)"
              />
              <Rect
                x="108"
                y="140"
                width="10"
                height="14"
                rx="1"
                fill="rgba(255,255,255,0.09)"
              />

              {/* Building 3 */}
              <Rect x="140" y="100" width="50" height="120" rx="3" />
              <Rect
                x="152"
                y="115"
                width="7"
                height="10"
                rx="1"
                fill="rgba(255,255,255,0.07)"
              />
              <Rect
                x="170"
                y="115"
                width="7"
                height="10"
                rx="1"
                fill="rgba(255,255,255,0.07)"
              />
              <Rect
                x="152"
                y="132"
                width="7"
                height="10"
                rx="1"
                fill="rgba(255,255,255,0.07)"
              />
              <Rect
                x="170"
                y="132"
                width="7"
                height="10"
                rx="1"
                fill="rgba(255,255,255,0.07)"
              />

              {/* Skyscraper Center */}
              <Rect x="200" y="55" width="70" height="165" rx="5" />
              <Path
                d="M 233 55 L 235 38 L 237 55 Z"
                fill="rgba(0, 40, 32, 0.42)"
              />
              {/* Window grid */}
              <Rect
                x="212"
                y="70"
                width="11"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />
              <Rect
                x="230"
                y="70"
                width="11"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />
              <Rect
                x="248"
                y="70"
                width="11"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />
              <Rect
                x="212"
                y="90"
                width="11"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />
              <Rect
                x="230"
                y="90"
                width="11"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />
              <Rect
                x="248"
                y="90"
                width="11"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />
              <Rect
                x="212"
                y="110"
                width="11"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />
              <Rect
                x="230"
                y="110"
                width="11"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />
              <Rect
                x="248"
                y="110"
                width="11"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.1)"
              />

              {/* Building 5 */}
              <Rect x="280" y="85" width="55" height="135" rx="3" />
              <Rect
                x="292"
                y="100"
                width="8"
                height="11"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
              <Rect
                x="312"
                y="100"
                width="8"
                height="11"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
              <Rect
                x="292"
                y="120"
                width="8"
                height="11"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
              <Rect
                x="312"
                y="120"
                width="8"
                height="11"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />

              {/* Building 6 */}
              <Rect x="345" y="105" width="50" height="115" rx="3" />
              <Rect
                x="358"
                y="120"
                width="9"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
              <Rect
                x="375"
                y="120"
                width="9"
                height="12"
                rx="1"
                fill="rgba(255,255,255,0.08)"
              />
            </G>

            {/* Trees & Low-rise details at ground level */}
            <G fill="rgba(0, 30, 24, 0.5)">
              <Circle cx="65" cy="205" r="14" />
              <Circle cx="135" cy="208" r="12" />
              <Circle cx="195" cy="206" r="15" />
              <Circle cx="275" cy="207" r="13" />
              <Circle cx="340" cy="209" r="11" />
            </G>
          </Svg>
        </Animated.View>

        {/* Bottom Tagline: "Your Property. Our Priority." */}
        <Animated.View
          style={[
            styles.bottomTaglineWrapper,
            {
              bottom: Math.max(insets.bottom + 18, 28),
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
    backgroundColor: "#00846C",
  },
  contentWrapper: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  topBar: {
    position: "absolute",
    right: 20,
    zIndex: 20,
  },
  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: -40,
    zIndex: 10,
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  subTitleText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13.5,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginTop: 10,
    textAlign: "center",
  },
  progressBarWrapper: {
    width: 100,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    marginTop: 32,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  bottomSkylineWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 5,
  },
  skylineSvg: {
    position: "absolute",
    bottom: 0,
  },
  bottomTaglineWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 15,
  },
  bottomTaglineText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.4,
    textAlign: "center",
  },
});
