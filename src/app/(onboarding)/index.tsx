import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  LayoutChangeEvent,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Modern evening warm-lit residential architecture photo matching the screenshot
const BACKGROUND_IMAGE_URI =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&auto=format&fit=crop&q=85";

const THUMB_SIZE = 52;
const BUTTON_PADDING = 6;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH - 48);
  const dragX = useRef(new Animated.Value(0)).current;
  const holdScale = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const isCompleted = useRef(false);

  // Maximum travel distance for the circle thumb
  const maxSlideDistance = Math.max(
    0,
    containerWidth - THUMB_SIZE - BUTTON_PADDING * 2,
  );

  const completeSwipe = () => {
    if (isCompleted.current) return;
    isCompleted.current = true;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    Animated.parallel([
      Animated.timing(dragX, {
        toValue: maxSlideDistance,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(holdScale, {
        toValue: 1.18,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.replace("/(auth)/login" as any);
    });
  };

  const resetSwipe = () => {
    Animated.parallel([
      Animated.spring(dragX, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(holdScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // PanResponder for smooth left-to-right dragging with hold & hover animation
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 3 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          if (isCompleted.current) return;
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (e) {}

          // Trigger Hover / Hold expansion and neon glow
          Animated.parallel([
            Animated.spring(holdScale, {
              toValue: 1.14,
              friction: 4,
              tension: 50,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 160,
              useNativeDriver: true,
            }),
          ]).start();
        },
        onPanResponderMove: (_, gesture) => {
          if (isCompleted.current) return;
          const newX = Math.max(0, Math.min(gesture.dx, maxSlideDistance));
          dragX.setValue(newX);
        },
        onPanResponderRelease: (_, gesture) => {
          if (isCompleted.current) return;
          if (gesture.dx >= maxSlideDistance * 0.6 || gesture.vx > 0.6) {
            completeSwipe();
          } else {
            resetSwipe();
          }
        },
        onPanResponderTerminate: () => {
          if (!isCompleted.current) {
            resetSwipe();
          }
        },
      }),
    [maxSlideDistance],
  );

  // Text fades out smoothly as thumb moves right
  const textOpacity = dragX.interpolate({
    inputRange: [0, Math.max(1, maxSlideDistance * 0.55)],
    outputRange: [1, 0.1],
    extrapolate: "clamp",
  });

  // Chevrons pulse/fade as thumb approaches right
  const chevronsOpacity = dragX.interpolate({
    inputRange: [0, Math.max(1, maxSlideDistance * 0.7)],
    outputRange: [0.9, 0.25],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* 1. Full Screen Architectural Background Image */}
      <ImageBackground
        source={{ uri: BACKGROUND_IMAGE_URI }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark Top Gradient for status bar & logo visibility */}
        <LinearGradient
          colors={["rgba(10, 15, 30, 0.65)", "transparent"]}
          style={styles.topGradient}
        />

        {/* 2. Top-Right Corner Circle Brand Logo Badge */}
        <View
          style={[
            styles.topRightCornerCircle,
            {
              width: 154 + Math.max(0, insets.top - 20) * 0.35,
              height: 154 + Math.max(0, insets.top - 20) * 0.35,
              borderBottomLeftRadius: 154 + Math.max(0, insets.top - 20) * 0.35,
            },
          ]}
          pointerEvents="none"
        >
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.50)",
              "rgba(255, 255, 255, 0.25)",
              "rgba(255, 255, 255, 0.08)",
            ]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.cornerCircleGradient,
              {
                paddingTop: insets.top > 0 ? insets.top + 9 : 28,
                paddingLeft: 48,
                paddingRight: 6,
                paddingBottom: 74,
              },
            ]}
          >
            <Image
              source={require("../../../assets/images/logo1.png")}
              style={styles.cornerLogoImage}
              resizeMode="contain"
            />
          </LinearGradient>
        </View>

        {/* Bottom Multi-stop Dark Gradient Overlay for Crisp Text Contrast */}
        <LinearGradient
          colors={[
            "transparent",
            "rgba(10, 15, 28, 0.25)",
            "rgba(10, 15, 28, 0.7)",
            "rgba(8, 12, 22, 0.95)",
            "rgba(8, 12, 22, 1.0)",
          ]}
          locations={[0, 0.35, 0.6, 0.82, 1.0]}
          style={styles.bottomGradient}
        />

        {/* 3. Main Bottom Content Area */}
        <View
          style={[
            styles.contentContainer,
            { paddingBottom: Math.max(insets.bottom, 20) + 40 },
          ]}
        >
          {/* Main Headline */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Find Your</Text>
            <Text style={styles.titleText}>Perfect Room or PG</Text>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitleText}>
            Discover verified rooms and PGs{"\n"}in locations you love.
          </Text>

          {/* 4. Smooth Draggable "Swipe to Get Started" Button */}
          <View
            style={styles.getStartedButton}
            onLayout={(e: LayoutChangeEvent) => {
              setContainerWidth(e.nativeEvent.layout.width);
            }}
          >
            {/* Center "Get Started" Text (Fades on slide) */}
            <Animated.View
              style={[styles.labelContainer, { opacity: textOpacity }]}
              pointerEvents="none"
            >
              <Text style={styles.buttonLabel}>Get Started</Text>
            </Animated.View>

            {/* Right Triple Chevron Arrows */}
            <Animated.View
              style={[styles.chevronsContainer, { opacity: chevronsOpacity }]}
              pointerEvents="none"
            >
              <Feather
                name="chevrons-right"
                size={24}
                color="rgba(255, 255, 255, 0.9)"
              />
            </Animated.View>

            {/* Draggable Cyan Circle Thumb with Hover Scale & Glow Halo */}
            <Animated.View
              style={[
                styles.draggableThumbContainer,
                {
                  transform: [{ translateX: dragX }, { scale: holdScale }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              {/* Outer Cyan Neon Glow Halo (Active on Hold & Drag) */}
              <Animated.View
                style={[
                  styles.thumbGlowHalo,
                  {
                    opacity: glowAnim,
                  },
                ]}
                pointerEvents="none"
              />

              <LinearGradient
                colors={["#00FFFF", "#00D2D3", "#0096C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cyanCircle}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        rotate: dragX.interpolate({
                          inputRange: [0, Math.max(1, maxSlideDistance)],
                          outputRange: ["0deg", "22deg"],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  }}
                >
                  <Feather name="arrow-right" size={23} color="#072032" />
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          </View>
        </View>

        {/* 5. Bottom Decorative Dual Organic Waves */}
        <View style={styles.bottomWavesWrapper} pointerEvents="none">
          <Svg
            width={SCREEN_WIDTH}
            height={75}
            viewBox={`0 0 ${SCREEN_WIDTH} 75`}
            style={{ position: "absolute", bottom: 0 }}
          >
            {/* Layer 1: Dark Navy Wave */}
            <Path
              d={`M0,40 Q${SCREEN_WIDTH * 0.3},10 ${SCREEN_WIDTH * 0.65},35 Q${SCREEN_WIDTH * 0.85},48 ${SCREEN_WIDTH},25 L${SCREEN_WIDTH},75 L0,75 Z`}
              fill="#0B132B"
            />

            {/* Layer 2: Vibrant Teal / Cyan Wave */}
            <Path
              d={`M0,52 Q${SCREEN_WIDTH * 0.35},75 ${SCREEN_WIDTH * 0.7},40 Q${SCREEN_WIDTH * 0.88},28 ${SCREEN_WIDTH},48 L${SCREEN_WIDTH},75 L0,75 Z`}
              fill="#008F9B"
            />
          </Svg>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070B14",
  },
  backgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "flex-end",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },
  topRightCornerCircle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 116,
    height: 116,
    borderBottomLeftRadius: 116,
    overflow: "hidden",
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.45)",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  cornerCircleGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cornerLogoImage: {
    width: 84,
    height: 84,
  },
  bottomGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: SCREEN_HEIGHT * 0.65,
    zIndex: 2,
  },
  contentContainer: {
    paddingHorizontal: 24,
    zIndex: 10,
  },
  titleContainer: {
    marginBottom: 12,
  },
  titleText: {
    fontSize: SCREEN_WIDTH < 380 ? 32 : 36,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: SCREEN_WIDTH < 380 ? 38 : 43,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 15.5,
    lineHeight: 23,
    color: "rgba(255, 255, 255, 0.82)",
    fontWeight: "500",
    marginBottom: 32,
  },
  getStartedButton: {
    position: "relative",
    backgroundColor: "rgba(50, 52, 58, 0.86)",
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1.2,
    borderRadius: 40,
    height: 66,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  labelContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 20,
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  chevronsContainer: {
    position: "absolute",
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  draggableThumbContainer: {
    position: "absolute",
    left: 6,
    top: 6,
    zIndex: 10,
  },
  thumbGlowHalo: {
    position: "absolute",
    left: -7,
    top: -7,
    right: -7,
    bottom: -7,
    borderRadius: 33,
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 8,
  },
  cyanCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },
  bottomWavesWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    zIndex: 5,
  },
});
