import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { SendHorizontal } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Hero room interior image matching the design
const HERO_IMAGE_URI =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=85";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Input value: Mobile Number or Email
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // OTP Verification States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [focusedOtpIndex, setFocusedOtpIndex] = useState<number | null>(null);
  const [timer, setTimer] = useState(30);

  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  // ==========================================
  // ANIMATION REFS
  // ==========================================
  // Screen Mount Entrance
  const heroScaleAnim = useRef(new Animated.Value(1.06)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(24)).current;
  const logoBadgeAnim = useRef(new Animated.Value(-30)).current;
  const logoBadgeOpacity = useRef(new Animated.Value(0)).current;

  // Button Animation
  const buttonScale = useRef(new Animated.Value(1)).current;
  const arrowNudgeAnim = useRef(new Animated.Value(0)).current;
  const sendIconFlyAnim = useRef(new Animated.Value(0)).current;
  const sendIconOpacity = useRef(new Animated.Value(1)).current;

  // Step Transition Animation (Input Form <-> OTP Form)
  const stepTransitionAnim = useRef(new Animated.Value(0)).current; // 0 = Input, 1 = OTP

  // Shake animation for invalid input
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Bottom Wave Floating Breath Animation
  const waveSwayAnim = useRef(new Animated.Value(0)).current;

  // Individual OTP Box Pop Animations
  const otpBoxPopAnims = useRef(
    [0, 1, 2, 3, 4, 5].map(() => new Animated.Value(0)),
  ).current;

  // Validation: Either valid 10-digit number or valid email format
  const isPhone = useMemo(() => {
    const cleaned = inputValue.replace(/\D/g, "");
    return cleaned.length === 10 && !inputValue.includes("@");
  }, [inputValue]);

  const isEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue.trim());
  }, [inputValue]);

  const isValidInput = useMemo(() => {
    return isPhone || isEmail;
  }, [isPhone, isEmail]);

  // ==========================================
  // 1. SCREEN MOUNT ENTRANCE ANIMATION
  // ==========================================
  useEffect(() => {
    Animated.parallel([
      // Hero image zoom in softly
      Animated.timing(heroScaleAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // Top badge drops in
      Animated.parallel([
        Animated.spring(logoBadgeAnim, {
          toValue: 0,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoBadgeOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Main Form Staggers Up
      Animated.parallel([
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(contentSlideAnim, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Loop bottom wave subtle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveSwayAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(waveSwayAnim, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Continuous Arrow pulse when input is valid
  useEffect(() => {
    let arrowLoop: Animated.CompositeAnimation | null = null;
    if (isValidInput && !isOtpSent) {
      arrowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(arrowNudgeAnim, {
            toValue: 5,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(arrowNudgeAnim, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      arrowLoop.start();
    } else {
      arrowNudgeAnim.setValue(0);
    }
    return () => {
      if (arrowLoop) arrowLoop.stop();
    };
  }, [isValidInput, isOtpSent]);

  // Resend OTP Countdown Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOtpSent, timer]);

  // Trigger Error Shake Animation
  const triggerShake = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Button Press Animations
  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.955,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  // Step 1: Send OTP with Slide Transition & Straight Flight Animation
  const handleSendOtp = () => {
    if (!inputValue.trim() || !isValidInput) {
      triggerShake();
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    Keyboard.dismiss();

    // Animate SendHorizontal icon shooting straight forward across the button
    Animated.parallel([
      Animated.timing(sendIconFlyAnim, {
        toValue: 38,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(sendIconOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSendingOtp(true);

      setTimeout(() => {
        setIsSendingOtp(false);
        setIsOtpSent(true);
        setTimer(30);
        setOtpCode(["", "", "", "", "", ""]);

        // Reset flight animation for next time
        sendIconFlyAnim.setValue(0);
        sendIconOpacity.setValue(1);

        // Slide Step 1 out & Step 2 in smoothly
        Animated.spring(stepTransitionAnim, {
          toValue: 1,
          friction: 8,
          tension: 45,
          useNativeDriver: true,
        }).start();

        // Staggered pop for OTP boxes
        otpBoxPopAnims.forEach((anim) => anim.setValue(0));
        Animated.stagger(
          50,
          otpBoxPopAnims.map((anim) =>
            Animated.spring(anim, {
              toValue: 1,
              friction: 5,
              tension: 60,
              useNativeDriver: true,
            }),
          ),
        ).start();

        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 350);
      }, 700);
    });
  };

  // Return to Phone/Email input with reverse slide
  const handleBackToInput = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    sendIconFlyAnim.setValue(0);
    sendIconOpacity.setValue(1);

    Animated.spring(stepTransitionAnim, {
      toValue: 0,
      friction: 8,
      tension: 45,
      useNativeDriver: true,
    }).start(() => {
      setIsOtpSent(false);
    });
  };

  // OTP Box Change Handlers with cell-pop
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otpCode];
    newOtp[index] = text;
    setOtpCode(newOtp);

    if (text) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      // Pop single cell
      otpBoxPopAnims[index].setValue(1.18);
      Animated.spring(otpBoxPopAnims[index], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();

      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP & Route to Dashboard with exit spring
  const handleVerifyOtp = () => {
    const fullOtp = otpCode.join("");
    if (fullOtp.length < 6) {
      triggerShake();
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      router.replace("/CustomerPanel/(tabs)" as any);
    }, 600);
  };

  const heroHeight = Math.max(260, SCREEN_HEIGHT * 0.34);

  // Interpolated Styles for Slide Transition between Input and OTP Form
  const inputFormTranslateX = stepTransitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_WIDTH * 0.9],
  });
  const inputFormOpacity = stepTransitionAnim.interpolate({
    inputRange: [0, 0.6],
    outputRange: [1, 0],
  });

  const otpFormTranslateX = stepTransitionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH * 0.9, 0],
  });
  const otpFormOpacity = stepTransitionAnim.interpolate({
    inputRange: [0.4, 1],
    outputRange: [0, 1],
  });

  // Wave Sway Translation
  const waveTranslateY = waveSwayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* 1. Top Organic Curved Hero Image with Soft Zoom Animation */}
          <View style={[styles.heroWrapper, { height: heroHeight }]}>
            <Animated.Image
              source={{ uri: HERO_IMAGE_URI }}
              style={[
                styles.heroImage,
                {
                  transform: [{ scale: heroScaleAnim }],
                },
              ]}
              resizeMode="cover"
            />

            {/* Bottom Organic Curve Cutout Mask using SVG */}
            <View style={styles.svgCurveOverlay} pointerEvents="none">
              <Svg
                width={SCREEN_WIDTH}
                height={80}
                viewBox={`0 0 ${SCREEN_WIDTH} 80`}
                style={{ position: "absolute", bottom: 0 }}
              >
                <Path
                  d={`M0,0 Q${SCREEN_WIDTH * 0.45},85 ${SCREEN_WIDTH},20 L${SCREEN_WIDTH},80 L0,80 Z`}
                  fill="#FFFFFF"
                />
              </Svg>
            </View>

            {/* Top-Left Circular Brand Logo Badge with Drop Animation */}
            <Animated.View
              style={[
                styles.topLogoBadge,
                {
                  top: Math.max(insets.top + 6, 20),
                  opacity: logoBadgeOpacity,
                  transform: [{ translateY: logoBadgeAnim }],
                },
              ]}
            >
              <Image
                source={require("../../../assets/images/logo1.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* 2. Main Animated Content Container */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: contentFadeAnim,
                transform: [{ translateY: contentSlideAnim }],
              },
            ]}
          >
            {/* Header Titles */}
            <Text style={styles.welcomeTitle}>Welcome home</Text>
            <Text style={styles.welcomeSubtitle}>
              Find verified rooms and PGs near you.
            </Text>

            {/* Forms Container with Smooth Left/Right Slide Transitions */}
            <View style={styles.formsWindow}>
              {!isOtpSent ? (
                /* Step 1: Number or Email Input */
                <Animated.View
                  style={[
                    styles.inputSection,
                    {
                      opacity: inputFormOpacity,
                      transform: [
                        { translateX: inputFormTranslateX },
                        { translateX: shakeAnim },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.inputLabel}>Email or phone number</Text>

                  {/* Input Container with Left Teal Icon Badge */}
                  <View
                    style={[
                      styles.inputContainer,
                      isFocused && styles.inputContainerFocused,
                    ]}
                  >
                    <View style={styles.inputIconBadge}>
                      <Feather
                        name={isEmail ? "mail" : isPhone ? "phone" : "user"}
                        size={19}
                        color="#FFFFFF"
                      />
                    </View>

                    <TextInput
                      style={styles.textInput}
                      placeholder="Email or phone number"
                      placeholderTextColor="#94A3B8"
                      value={inputValue}
                      onChangeText={setInputValue}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="default"
                      returnKeyType="done"
                      onSubmitEditing={handleSendOtp}
                    />

                    {inputValue.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setInputValue("")}
                        style={styles.clearBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Feather name="x-circle" size={17} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Helper validation error note */}
                  {inputValue.trim().length > 0 && !isValidInput && (
                    <Text style={styles.helperText}>
                      Please enter a valid 10-digit phone number or email
                      address
                    </Text>
                  )}

                  {/* Primary Action Button: Send OTP with Scale & Arrow Nudge Animation */}
                  <Animated.View
                    style={{ transform: [{ scale: buttonScale }] }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={handleSendOtp}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      disabled={isSendingOtp}
                      style={styles.primaryButton}
                    >
                      {isSendingOtp ? (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text
                            style={[
                              styles.primaryButtonText,
                              { marginLeft: 10 },
                            ]}
                          >
                            Sending OTP...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>Send OTP</Text>
                          <Animated.View
                            style={{
                              transform: [
                                {
                                  translateX: Animated.add(
                                    arrowNudgeAnim,
                                    sendIconFlyAnim,
                                  ),
                                },
                              ],
                              opacity: sendIconOpacity,
                              marginLeft: 6,
                            }}
                          >
                            <SendHorizontal size={19} color="#FFFFFF" />
                          </Animated.View>
                        </>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              ) : (
                /* Step 2: OTP Verification Screen with Spring Pop Animation */
                <Animated.View
                  style={[
                    styles.inputSection,
                    {
                      opacity: otpFormOpacity,
                      transform: [
                        { translateX: otpFormTranslateX },
                        { translateX: shakeAnim },
                      ],
                    },
                  ]}
                >
                  {/* OTP Header with Change Number/Email Action */}
                  <View style={styles.otpHeaderRow}>
                    <Text style={styles.inputLabel}>Enter 6-digit OTP</Text>
                    <TouchableOpacity
                      onPress={handleBackToInput}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.changeContactText}>Change</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.otpSentToText}>
                    Sent to{" "}
                    <Text style={{ fontWeight: "700", color: "#0F172A" }}>
                      {inputValue}
                    </Text>
                  </Text>

                  {/* 6 Animated Pop OTP Input Boxes */}
                  <View style={styles.otpBoxesRow}>
                    {otpCode.map((digit, idx) => (
                      <Animated.View
                        key={idx}
                        style={{
                          transform: [{ scale: otpBoxPopAnims[idx] }],
                        }}
                      >
                        <TextInput
                          ref={(ref) => {
                            otpInputRefs.current[idx] = ref;
                          }}
                          style={[
                            styles.otpBox,
                            digit ? styles.otpBoxFilled : null,
                            focusedOtpIndex === idx && styles.otpBoxFocused,
                          ]}
                          value={digit}
                          onChangeText={(text) => handleOtpChange(text, idx)}
                          onFocus={() => setFocusedOtpIndex(idx)}
                          onBlur={() => setFocusedOtpIndex(null)}
                          onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                          keyboardType="number-pad"
                          maxLength={1}
                          selectTextOnFocus
                          textAlign="center"
                        />
                      </Animated.View>
                    ))}
                  </View>

                  {/* Resend Timer / Action */}
                  <View style={styles.resendRow}>
                    {timer > 0 ? (
                      <Text style={styles.timerText}>
                        Resend code in{" "}
                        <Text
                          style={{
                            fontWeight: "700",
                            color: "#008F9B",
                          }}
                        >
                          {timer}s
                        </Text>
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setTimer(30);
                          try {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Medium,
                            );
                          } catch {}
                        }}
                      >
                        <Text style={styles.resendActionText}>Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Verify OTP Button -> Routes to Dashboard */}
                  <Animated.View
                    style={{ transform: [{ scale: buttonScale }] }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={handleVerifyOtp}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      disabled={isVerifyingOtp}
                      style={styles.primaryButton}
                    >
                      {isVerifyingOtp ? (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text
                            style={[
                              styles.primaryButtonText,
                              { marginLeft: 10 },
                            ]}
                          >
                            Verifying...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>
                            Verify & Continue
                          </Text>
                          <Feather
                            name="check"
                            size={19}
                            color="#FFFFFF"
                            style={{ marginLeft: 6 }}
                          />
                        </>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              )}
            </View>

            {/* Terms & Privacy Note */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.termsLink}>Terms & Privacy Policy</Text>.
            </Text>

            {/* Secure OTP Login Trust Badge */}
            <View style={styles.secureBadgeRow}>
              <View style={styles.checkIconCircle}>
                <Feather name="check" size={13} color="#0F172A" />
              </View>
              <Text style={styles.secureBadgeText}>Secure OTP login</Text>
            </View>
          </Animated.View>

          {/* Bottom Spacing to let content sit comfortably above waves */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 3. Bottom Decorative Dual Organic Waves with Subtle Floating Sway */}
      <Animated.View style={[styles.bottomWavesWrapper]} pointerEvents="none">
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
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
  },
  heroWrapper: {
    width: SCREEN_WIDTH,
    position: "relative",
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  svgCurveOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  topLogoBadge: {
    position: "absolute",
    left: 16,
    zIndex: 20,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "#FFFFFF",
  },
  welcomeTitle: {
    fontSize: SCREEN_WIDTH < 380 ? 28 : 32,
    fontWeight: "900",
    color: "#0B132B",
    textAlign: "center",
    letterSpacing: -0.6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#475569",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 28,
    fontWeight: "500",
  },
  formsWindow: {
    overflow: "hidden",
  },
  inputSection: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputContainerFocused: {
    borderColor: "#008F9B",
    shadowColor: "#008F9B",
    shadowOpacity: 0.16,
    shadowRadius: 6,
  },
  inputIconBadge: {
    width: 48,
    height: "100%",
    backgroundColor: "#008F9B",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
  },
  clearBtn: {
    paddingHorizontal: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 6,
    marginLeft: 2,
    fontWeight: "500",
  },
  primaryButton: {
    height: 52,
    backgroundColor: "#008F9B",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#008F9B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  otpHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  changeContactText: {
    fontSize: 13,
    color: "#008F9B",
    fontWeight: "700",
  },
  otpSentToText: {
    fontSize: 13.5,
    color: "#64748B",
    marginBottom: 16,
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  otpBox: {
    width: (SCREEN_WIDTH - 48 - 40) / 6,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  otpBoxFilled: {
    borderColor: "#008F9B",
    backgroundColor: "#FFFFFF",
    shadowColor: "#008F9B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  otpBoxFocused: {
    borderColor: "#008F9B",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.8,
  },
  resendRow: {
    alignItems: "center",
    marginVertical: 8,
  },
  timerText: {
    fontSize: 13.5,
    color: "#64748B",
  },
  resendActionText: {
    fontSize: 13.5,
    color: "#008F9B",
    fontWeight: "800",
  },
  termsText: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 22,
    lineHeight: 18,
  },
  termsLink: {
    color: "#334155",
    fontWeight: "600",
  },
  secureBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 26,
    gap: 8,
  },
  checkIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  secureBadgeText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },
  bottomWavesWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
  },
});
