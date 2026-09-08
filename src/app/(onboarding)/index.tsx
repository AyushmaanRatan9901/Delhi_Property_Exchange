import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  LayoutChangeEvent,
  PanResponder,
  Platform,
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
  const isCompleted = useRef(false);

  // Maximum travel distance for the circle thumb
  const maxSlideDistance = Math.max(
    0,
    containerWidth - THUMB_SIZE - BUTTON_PADDING * 2
  );

  const completeSwipe = () => {
    if (isCompleted.current) return;
    isCompleted.current = true;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}

    Animated.timing(dragX, {
      toValue: maxSlideDistance,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      router.replace("/CustomerPanel/(tabs)" as any);
    });
  };

  const resetSwipe = () => {
    Animated.spring(dragX, {
      toValue: 0,
      friction: 6,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  // PanResponder for smooth left-to-right dragging
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 3 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (e) {}
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
    [maxSlideDistance]
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

        {/* 2. Top Header with Circular Brand Logo (Matching Screenshot Top Right) */}
        <SafeAreaView edges={["top"]} style={styles.safeHeader}>
          <View style={styles.headerRow}>
            <View />
            {/* Top Right Translucent Brand Logo Badge */}
            <View style={styles.logoBadgeOuter}>
              <LinearGradient
                colors={["rgba(56, 189, 248, 0.85)", "rgba(14, 165, 233, 0.4)"]}
                style={styles.logoGradientRing}
              >
                <View style={styles.logoInnerCircle}>
                  <MaterialCommunityIcons
                    name="home-city-outline"
                    size={16}
                    color="#0284C7"
                  />
                  <Text style={styles.logoText}>CHHABRA STAY</Text>
                  <Text style={styles.logoSubText}>DELHI NCR</Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        </SafeAreaView>

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
            { paddingBottom: Math.max(insets.bottom, 16) + 36 },
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
              style={[
                styles.labelContainer,
                { opacity: textOpacity },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.buttonLabel}>Get Started</Text>
            </Animated.View>

            {/* Right Triple Chevron Arrows */}
            <Animated.View
              style={[
                styles.chevronsContainer,
                { opacity: chevronsOpacity },
              ]}
              pointerEvents="none"
            >
              <Feather
                name="chevrons-right"
                size={24}
                color="rgba(255, 255, 255, 0.9)"
              />
            </Animated.View>

            {/* Draggable Cyan Circle Thumb */}
            <Animated.View
              style={[
                styles.draggableThumbContainer,
                {
                  transform: [{ translateX: dragX }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <LinearGradient
                colors={["#00E5FF", "#00B4D8", "#0096C7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cyanCircle}
              >
                <Feather name="arrow-right" size={22} color="#072032" />
              </LinearGradient>
            </Animated.View>
          </View>
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
    justifyContent: "space-between",
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 140,
    zIndex: 1,
  },
  safeHeader: {
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 12 : 4,
  },
  logoBadgeOuter: {
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  logoGradientRing: {
    padding: 1.5,
    borderRadius: 30,
  },
  logoInnerCircle: {
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#E2E8F0",
    fontSize: 6.5,
    fontWeight: "900",
    letterSpacing: 0.6,
    marginTop: 1,
  },
  logoSubText: {
    color: "#38BDF8",
    fontSize: 5.5,
    fontWeight: "800",
    letterSpacing: 0.4,
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
  cyanCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00E5FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  waveContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 24,
    zIndex: 5,
    overflow: "hidden",
  },
  waveBackdrop: {
    position: "absolute",
    left: -20,
    right: -20,
    bottom: -10,
    height: 28,
    backgroundColor: "#006E7F",
    borderTopLeftRadius: SCREEN_WIDTH * 0.9,
    borderTopRightRadius: SCREEN_WIDTH * 0.7,
    opacity: 0.6,
  },
  waveFront: {
    position: "absolute",
    left: -10,
    right: -10,
    bottom: -6,
    height: 22,
    borderTopLeftRadius: SCREEN_WIDTH * 0.6,
    borderTopRightRadius: SCREEN_WIDTH * 0.9,
  },
});
