import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Lock, SendHorizontal, Sparkles, UserCheck } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
import { requestOtp, verifyOtp } from "../../Redux/Auth/authActions";
import {
  clearAuthError,
  resetOtpFlow,
  setSelectedRole,
} from "../../Redux/Auth/authSlice";
import { UserRole } from "../../Redux/Auth/authTypes";
import { STORAGE_KEYS } from "../../Redux/api/apiConfig";
import appStorage from "../../Redux/api/storage";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Hero room interior image
const HERO_IMAGE_URI =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=85";

// Available roles for new member signup
const SIGNUP_ROLES: Array<{
  id: UserRole;
  title: string;
  badge: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
}> = [
  {
    id: "CUSTOMER",
    title: "Tenant / Guest",
    badge: "Most Popular",
    desc: "Find verified rooms, PGs & flats with zero brokerage",
    icon: "home",
    gradient: ["#0D9488", "#0F766E"],
  },
  {
    id: "PROPERTY_OWNER",
    title: "House Owner",
    badge: "Instant Rent",
    desc: "List properties, manage tenants & receive rent payouts",
    icon: "business",
    gradient: ["#3B82F6", "#1D4ED8"],
  },
  {
    id: "FIELD_AGENT",
    title: "Field Agent",
    badge: "Partner",
    desc: "Conduct visits, inspections & earn lucrative payouts",
    icon: "shield-checkmark",
    gradient: ["#F59E0B", "#D97706"],
  },
  {
    id: "VERIFICATION_STAFF",
    title: "Verification Staff",
    badge: "Operations",
    desc: "Verify property details, inspect documents & audit listings",
    icon: "checkmark-done-circle",
    gradient: ["#10B981", "#047857"],
  },
];

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: "Tenant / Guest",
  PROPERTY_OWNER: "House Owner / Landlord",
  FIELD_AGENT: "Field Agent / Partner",
  SUPER_ADMIN: "Super Administrator",
  SUB_ADMIN: "Sub Administrator",
  ADMIN_PARTNER: "Admin Partner",
  VERIFICATION_STAFF: "Verification Staff",
  BROKER: "Broker Partner",
  field_agent: "Field Agent / Partner",
  field_staff: "Verification Staff",
  super_admin: "Super Administrator",
  admin: "Admin Partner",
  tele_caller: "Telecaller Support",
  customer: "Tenant / Guest",
  property_owner: "House Owner / Landlord",
  broker: "Broker Partner",
};

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // Redux Auth State
  const {
    isSendingOtp,
    isVerifyingOtp,
    error: reduxError,
  } = useAppSelector((state) => state.auth);

  // Form States
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRoleState, setSelectedRoleState] =
    useState<UserRole>("CUSTOMER");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isIdentifierFocused, setIsIdentifierFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  // Flow States
  const [isNewUserRegistration, setIsNewUserRegistration] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [detectedUser, setDetectedUser] = useState<{
    name?: string;
    role?: UserRole;
  } | null>(null);

  // Input Refs for reliable keyboard opening
  const identifierInputRef = useRef<TextInput | null>(null);
  const nameInputRef = useRef<TextInput | null>(null);
  const otpInputRefs = useRef<Array<TextInput | null>>([]);

  // OTP Verification States
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);

  // ==========================================
  // ANIMATION REFS
  // ==========================================
  const heroScaleAnim = useRef(new Animated.Value(1.06)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(24)).current;
  const logoBadgeAnim = useRef(new Animated.Value(-30)).current;
  const logoBadgeOpacity = useRef(new Animated.Value(0)).current;

  // New user registration smooth reveal
  const newUserExpandAnim = useRef(new Animated.Value(0)).current;

  // Smooth Dropdown Animation
  const roleDropdownAnim = useRef(new Animated.Value(0)).current;

  // Button Animation
  const buttonScale = useRef(new Animated.Value(1)).current;
  const arrowNudgeAnim = useRef(new Animated.Value(0)).current;
  const sendIconFlyAnim = useRef(new Animated.Value(0)).current;
  const sendIconOpacity = useRef(new Animated.Value(1)).current;

  // Step Transition Animation (Input Form <-> OTP Form)
  const stepTransitionAnim = useRef(new Animated.Value(0)).current; // 0 = Input, 1 = OTP

  // Shake animation for invalid input
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Individual OTP Box Pop Animations
  const otpBoxPopAnims = useRef(
    [0, 1, 2, 3, 4, 5].map(() => new Animated.Value(0)),
  ).current;

  // Input Validation
  const isPhone = useMemo(() => {
    const cleaned = identifier.replace(/\D/g, "");
    return cleaned.length === 10 && !identifier.includes("@");
  }, [identifier]);

  const isEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  }, [identifier]);

  const isValidIdentifier = useMemo(
    () => isPhone || isEmail,
    [isPhone, isEmail],
  );

  // Mount Entrance Animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroScaleAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
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
  }, []);

  // Arrow pulse when input is valid
  useEffect(() => {
    let arrowLoop: Animated.CompositeAnimation | null = null;
    if (isValidIdentifier && !isOtpSent) {
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
  }, [isValidIdentifier, isOtpSent]);

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
      toValue: 0.96,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  // Smooth Reveal for New Member Form
  const revealNewUserRegistration = () => {
    setIsNewUserRegistration(true);
    newUserExpandAnim.setValue(0);
    Animated.spring(newUserExpandAnim, {
      toValue: 1,
      friction: 7,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 250);
  };

  // Smooth Dropdown Toggle & Selection
  const toggleRoleDropdown = () => {
    try {
      Haptics.selectionAsync();
    } catch {}
    if (isRoleDropdownOpen) {
      Animated.timing(roleDropdownAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => setIsRoleDropdownOpen(false));
    } else {
      setIsRoleDropdownOpen(true);
      Animated.spring(roleDropdownAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSelectRole = (role: UserRole) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedRoleState(role);
    Animated.timing(roleDropdownAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => setIsRoleDropdownOpen(false));
  };

  const chevronRotation = roleDropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const currentRoleObj =
    SIGNUP_ROLES.find((r) => r.id === selectedRoleState) || SIGNUP_ROLES[0];

  // Step 1: Send OTP & Auto-Detect Existing User or Prompt Registration
  const handleContinueOrSendOtp = async () => {
    if (!identifier.trim() || !isValidIdentifier) {
      triggerShake();
      identifierInputRef.current?.focus();
      return;
    }

    // If new user form is shown, ensure name is provided
    if (isNewUserRegistration && !fullName.trim()) {
      triggerShake();
      nameInputRef.current?.focus();
      Alert.alert(
        "Name Required",
        "Please enter your full name to create your account.",
      );
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}

    Keyboard.dismiss();

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
    ]).start(async () => {
      dispatch(clearAuthError());

      // Prepare payload: if new user registration is active, pass role and name
      const payload = isNewUserRegistration
        ? {
            identifier: identifier.trim(),
            roleType: selectedRoleState,
            name: fullName.trim(),
          }
        : {
            identifier: identifier.trim(),
          };

      const result = await dispatch(requestOtp(payload));

      sendIconFlyAnim.setValue(0);
      sendIconOpacity.setValue(1);

      if (requestOtp.fulfilled.match(result)) {
        const resData = result.payload;

        let assignedRole = isNewUserRegistration
          ? selectedRoleState
          : resData.role || selectedRoleState || "CUSTOMER";
        let assignedName =
          (isNewUserRegistration && fullName.trim()) ||
          resData.name ||
          (isEmail ? identifier.split("@")[0] : "Member");

        // Check if there is cached/saved user data in local storage for this identifier
        try {
          const storedUserStr = await appStorage.getItem(
            STORAGE_KEYS.USER_DATA,
          );
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr);
            const cleanId = identifier.trim();
            if (storedUser.phone === cleanId || storedUser.email === cleanId) {
              if (storedUser.role) assignedRole = storedUser.role;
              if (storedUser.name) assignedName = storedUser.name;
            }
          }
        } catch (e) {}

        setDetectedUser({
          name: assignedName,
          role: assignedRole,
        });
        dispatch(setSelectedRole(assignedRole));

        setIsOtpSent(true);
        setTimer(30);
        setOtpCode(["", "", "", "", "", ""]);

        // Slide Step 1 out & Step 2 (OTP) in
        Animated.spring(stepTransitionAnim, {
          toValue: 1,
          friction: 8,
          tension: 45,
          useNativeDriver: true,
        }).start();

        // Stagger pop for OTP cells
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
      } else {
        // User not registered on server -> Reveal Name & Dropdown Role selector
        const errorMsg = (result.payload as string) || "";
        const lowerMsg = errorMsg.toLowerCase();
        if (
          !isNewUserRegistration &&
          (lowerMsg.includes("no account found") ||
            lowerMsg.includes("not registered") ||
            lowerMsg.includes("registered nahi hai") ||
            lowerMsg.includes("signup") ||
            lowerMsg.includes("not found"))
        ) {
          revealNewUserRegistration();
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch {}
        } else {
          triggerShake();
          Alert.alert(
            "Notice",
            errorMsg || "Failed to process request. Please try again.",
          );
        }
      }
    });
  };

  // Back to Phone/Email input
  const handleBackToInput = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    sendIconFlyAnim.setValue(0);
    sendIconOpacity.setValue(1);
    dispatch(resetOtpFlow());

    Animated.spring(stepTransitionAnim, {
      toValue: 0,
      friction: 8,
      tension: 45,
      useNativeDriver: true,
    }).start(() => {
      setIsOtpSent(false);
      setTimeout(() => {
        identifierInputRef.current?.focus();
      }, 200);
    });
  };

  // OTP Change
  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otpCode];
    newOtp[index] = text;
    setOtpCode(newOtp);

    if (text) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
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

  // Quick Auto-Fill Dev OTP
  const handleQuickFillTestOtp = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    const devOtp = ["1", "2", "3", "4", "5", "6"];
    setOtpCode(devOtp);
    otpBoxPopAnims.forEach((anim) => anim.setValue(1.15));
    Animated.stagger(
      40,
      otpBoxPopAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
      ),
    ).start();
  };

  // Step 2: Verify OTP and Route to Role Dashboard
  const handleVerifyOtp = async () => {
    const fullOtp = otpCode.join("");
    if (fullOtp.length < 6) {
      triggerShake();
      return;
    }

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const result = await dispatch(
      verifyOtp({
        identifier: identifier.trim(),
        otp: fullOtp,
        isRegister: isNewUserRegistration,
      }),
    );

    if (verifyOtp.fulfilled.match(result)) {
      const user = result.payload.user;
      const role = user?.role || detectedUser?.role;

      console.log("==========================================");
      console.log("🎉 [LOGIN SUCCESS] User authenticated:");
      console.log("👤 Name:       ", user?.name);
      console.log("📧 Email:      ", user?.email || "N/A");
      console.log("📱 Phone:      ", user?.phone || "N/A");
      console.log("🛡️ Role:       ", role);
      console.log("==========================================");

      // Smart Panel Routing
      if (role === "FIELD_AGENT") {
        router.replace("/FiledAgentPanel/(tabs)/Dashboard" as any);
      } else if (role === "SUPER_ADMIN") {
        router.replace("/SuperAdminPanel/(tabs)/Dashboard" as any);
      } else if (role === "PROPERTY_OWNER") {
        router.replace("/HouseOwnerPanel/(tabs)/Dashboard" as any);
      } else if (role === "VERIFICATION_STAFF") {
        router.replace("/VerificationStaffPanel/(tabs)/Dashboard" as any);
      } else if (role === "SUB_ADMIN" || role === "ADMIN_PARTNER") {
        router.replace("/AdminPartnerPanel/(tabs)/Dashboard" as any);
      } else if (role === "BROKER") {
        router.replace("/BrokerPanel/(tabs)/Dashboard" as any);
      } else {
        router.replace("/CustomerPanel/(tabs)" as any);
      }
    } else {
      triggerShake();
      const errorMsg = (result.payload as string) || "Invalid OTP code";
      Alert.alert("Verification Error", errorMsg);
    }
  };

  const heroHeight = Math.max(220, SCREEN_HEIGHT * 0.3);

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

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* 1. Organic Hero Image */}
          <View
            style={[styles.heroWrapper, { height: heroHeight }]}
            pointerEvents="box-none"
          >
            <Animated.Image
              source={{ uri: HERO_IMAGE_URI }}
              style={[
                styles.heroImage,
                { transform: [{ scale: heroScaleAnim }] },
              ]}
              resizeMode="cover"
            />

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

            {/* Top-Left Brand Logo Badge */}
            <Animated.View
              style={[
                styles.topLogoBadge,
                {
                  top: Math.max(insets.top + 6, 20),
                  opacity: logoBadgeOpacity,
                  transform: [{ translateY: logoBadgeAnim }],
                },
              ]}
              pointerEvents="none"
            >
              <Image
                source={require("../../../assets/images/logo1.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* 2. Main Animated Container */}
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
              {isOtpSent
                ? "Enter the verification code sent to your account"
                : isNewUserRegistration
                  ? "Complete your profile to register & get instant access"
                  : "Enter your mobile number or email to proceed"}
            </Text>

            {/* Forms Container */}
            <View style={styles.formsWindow}>
              {!isOtpSent ? (
                /* ============================================================ */
                /* STEP 1: Phone / Email Input + Dynamic Registration Fields */
                /* ============================================================ */
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
                  {/* Identifier Input */}
                  <Text style={styles.inputLabel}>Email or mobile number</Text>
                  <Pressable
                    onPress={() => identifierInputRef.current?.focus()}
                    style={[
                      styles.inputContainer,
                      isIdentifierFocused && styles.inputContainerFocused,
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
                      ref={identifierInputRef}
                      style={styles.textInput}
                      placeholder="Enter mobile or email"
                      placeholderTextColor="#94A3B8"
                      value={identifier}
                      onChangeText={(val) => {
                        setIdentifier(val);
                        if (isNewUserRegistration) {
                          setIsNewUserRegistration(false);
                          newUserExpandAnim.setValue(0);
                        }
                      }}
                      onFocus={() => setIsIdentifierFocused(true)}
                      onBlur={() => setIsIdentifierFocused(false)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="default"
                      returnKeyType={isNewUserRegistration ? "next" : "done"}
                      onSubmitEditing={handleContinueOrSendOtp}
                      cursorColor="#0D9488"
                      selectionColor="rgba(13, 148, 136, 0.3)"
                    />

                    {identifier.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setIdentifier("");
                          setIsNewUserRegistration(false);
                          newUserExpandAnim.setValue(0);
                          identifierInputRef.current?.focus();
                        }}
                        style={styles.clearBtn}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      >
                        <Feather name="x-circle" size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </Pressable>

                  {/* Validation note */}
                  {identifier.trim().length > 0 && !isValidIdentifier && (
                    <Text style={styles.helperText}>
                      Please enter a valid 10-digit mobile number or valid email
                      address
                    </Text>
                  )}

                  {/* ============================================================ */}
                  {/* NEW USER DYNAMIC EXPANSION: Full Name & Dropdown Role Selector */}
                  {/* ============================================================ */}
                  {isNewUserRegistration && (
                    <Animated.View
                      style={[
                        styles.newUserCard,
                        {
                          opacity: newUserExpandAnim,
                          transform: [
                            {
                              translateY: newUserExpandAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [15, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      {/* New Member Header Banner */}
                      <View style={styles.newMemberHeaderRow}>
                        <View style={styles.sparkleBadge}>
                          <Sparkles size={14} color="#0D9488" />
                        </View>
                        <Text style={styles.newMemberTitle}>
                          New Member Registration
                        </Text>
                      </View>

                      {/* Full Name Input (Required) */}
                      <Text style={[styles.inputLabel, { marginTop: 8 }]}>
                        Full Name *
                      </Text>
                      <Pressable
                        onPress={() => nameInputRef.current?.focus()}
                        style={[
                          styles.inputContainer,
                          isNameFocused && styles.inputContainerFocused,
                        ]}
                      >
                        <View
                          style={[
                            styles.inputIconBadge,
                            { backgroundColor: "#0F766E" },
                          ]}
                        >
                          <Feather name="user" size={18} color="#FFFFFF" />
                        </View>
                        <TextInput
                          ref={nameInputRef}
                          style={styles.textInput}
                          placeholder="Enter your full name"
                          placeholderTextColor="#94A3B8"
                          value={fullName}
                          onChangeText={setFullName}
                          onFocus={() => setIsNameFocused(true)}
                          onBlur={() => setIsNameFocused(false)}
                          autoCapitalize="words"
                          returnKeyType="done"
                          onSubmitEditing={handleContinueOrSendOtp}
                          cursorColor="#0D9488"
                          selectionColor="rgba(13, 148, 136, 0.3)"
                        />
                      </Pressable>

                      {/* Smooth Dropdown Role Selector (Required) */}
                      <Text style={[styles.inputLabel, { marginTop: 14 }]}>
                        Select Your Account Role *
                      </Text>

                      <View style={styles.dropdownContainer}>
                        {/* Dropdown Trigger Button */}
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={toggleRoleDropdown}
                          style={[
                            styles.dropdownTrigger,
                            isRoleDropdownOpen && styles.dropdownTriggerActive,
                          ]}
                        >
                          <View
                            style={[
                              styles.dropdownRoleIconBadge,
                              { backgroundColor: currentRoleObj.gradient[0] },
                            ]}
                          >
                            <Ionicons
                              name={currentRoleObj.icon}
                              size={18}
                              color="#FFFFFF"
                            />
                          </View>

                          <View style={styles.dropdownTriggerTextContainer}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <Text style={styles.dropdownTriggerTitle}>
                                {currentRoleObj.title}
                              </Text>
                              <View style={styles.dropdownBadge}>
                                <Text style={styles.dropdownBadgeText}>
                                  {currentRoleObj.badge}
                                </Text>
                              </View>
                            </View>
                            <Text
                              style={styles.dropdownTriggerSubtitle}
                              numberOfLines={1}
                            >
                              {currentRoleObj.desc}
                            </Text>
                          </View>

                          <Animated.View
                            style={[
                              styles.dropdownChevronCircle,
                              isRoleDropdownOpen &&
                                styles.dropdownChevronCircleActive,
                              { transform: [{ rotate: chevronRotation }] },
                            ]}
                          >
                            <Feather
                              name="chevron-down"
                              size={18}
                              color={isRoleDropdownOpen ? "#0D9488" : "#64748B"}
                            />
                          </Animated.View>
                        </TouchableOpacity>

                        {/* Smoothly Expandable Dropdown Menu */}
                        <Animated.View
                          style={[
                            styles.dropdownMenu,
                            {
                              maxHeight: roleDropdownAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 320],
                              }),
                              opacity: roleDropdownAnim.interpolate({
                                inputRange: [0, 0.3, 1],
                                outputRange: [0, 0.5, 1],
                              }),
                              transform: [
                                {
                                  translateY: roleDropdownAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-8, 0],
                                  }),
                                },
                              ],
                            },
                          ]}
                        >
                          {SIGNUP_ROLES.map((item, index) => {
                            const isSelected = selectedRoleState === item.id;
                            const isLast = index === SIGNUP_ROLES.length - 1;
                            return (
                              <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.75}
                                onPress={() => handleSelectRole(item.id)}
                                style={[
                                  styles.dropdownMenuItem,
                                  isSelected && styles.dropdownMenuItemActive,
                                  !isLast && styles.dropdownMenuItemBorder,
                                ]}
                              >
                                <View
                                  style={[
                                    styles.dropdownItemIconCircle,
                                    {
                                      backgroundColor: isSelected
                                        ? item.gradient[0]
                                        : "#F1F5F9",
                                    },
                                  ]}
                                >
                                  <Ionicons
                                    name={item.icon}
                                    size={18}
                                    color={isSelected ? "#FFFFFF" : "#64748B"}
                                  />
                                </View>

                                <View style={{ flex: 1, marginRight: 8 }}>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <Text
                                      style={[
                                        styles.dropdownItemTitle,
                                        isSelected &&
                                          styles.dropdownItemTitleActive,
                                      ]}
                                    >
                                      {item.title}
                                    </Text>
                                    <View
                                      style={[
                                        styles.dropdownItemBadge,
                                        isSelected &&
                                          styles.dropdownItemBadgeActive,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.dropdownItemBadgeText,
                                          isSelected &&
                                            styles.dropdownItemBadgeTextActive,
                                        ]}
                                      >
                                        {item.badge}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text style={styles.dropdownItemDesc}>
                                    {item.desc}
                                  </Text>
                                </View>

                                <View style={styles.dropdownRadioCircle}>
                                  {isSelected ? (
                                    <Ionicons
                                      name="checkmark-circle"
                                      size={20}
                                      color="#0D9488"
                                    />
                                  ) : (
                                    <View
                                      style={styles.dropdownRadioUnchecked}
                                    />
                                  )}
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                        </Animated.View>
                      </View>
                    </Animated.View>
                  )}

                  {/* Backend Error Banner */}
                  {reduxError && !isNewUserRegistration && (
                    <View style={styles.errorBanner}>
                      <Feather name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.errorBannerText}>{reduxError}</Text>
                      <TouchableOpacity
                        onPress={() => {
                          try {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light,
                            );
                          } catch {}
                          dispatch(clearAuthError());
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.errorBannerCloseBtn}
                        activeOpacity={0.7}
                      >
                        <Feather name="x" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Action Button: Send OTP / Register */}
                  <Animated.View
                    style={{
                      transform: [{ scale: buttonScale }],
                      marginTop: 14,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={handleContinueOrSendOtp}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      disabled={isSendingOtp}
                      style={styles.primaryButton}
                    >
                      {isSendingOtp ? (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <ActivityIndicator color="#FFFFFF" size="small" />
                          <Text
                            style={[
                              styles.primaryButtonText,
                              { marginLeft: 10 },
                            ]}
                          >
                            Verifying & Sending OTP...
                          </Text>
                        </View>
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>
                            {isNewUserRegistration
                              ? "Register & Send OTP"
                              : "Continue / Send OTP"}
                          </Text>
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
                /* ============================================================ */
                /* STEP 2: OTP Verification + Unchangeable Detected Profile */
                /* ============================================================ */
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
                  {/* Verified Profile Card */}
                  <View style={styles.detectedAccountBox}>
                    <View style={styles.detectedHeaderRow}>
                      <View style={styles.lockBadge}>
                        <Lock size={12} color="#0F766E" />
                        <Text style={styles.lockBadgeText}>
                          Verified Profile
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={handleBackToInput}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.changeContactText}>Change</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.lockedFieldsContainer}>
                      {/* Name Display */}
                      <View style={styles.lockedRow}>
                        <Text style={styles.lockedLabel}>Name</Text>
                        <Text style={styles.lockedValue} numberOfLines={1}>
                          {detectedUser?.name || fullName || "Registered User"}
                        </Text>
                      </View>

                      <View style={styles.lockedDivider} />

                      {/* Contact Display */}
                      <View style={styles.lockedRow}>
                        <Text style={styles.lockedLabel}>
                          {isEmail ? "Email" : "Phone"}
                        </Text>
                        <Text
                          style={styles.lockedContactValue}
                          numberOfLines={1}
                        >
                          {identifier}
                        </Text>
                      </View>

                      <View style={styles.lockedDivider} />

                      {/* Detected / Selected Role Display */}
                      <View style={styles.lockedRow}>
                        <Text style={styles.lockedLabel}>Account Role</Text>
                        <View style={styles.roleTag}>
                          <UserCheck size={13} color="#0F766E" />
                          <Text style={styles.roleTagText}>
                            {ROLE_LABELS[
                              detectedUser?.role || selectedRoleState
                            ] ||
                              detectedUser?.role ||
                              "Customer"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Dev Test Quick Fill Helper */}
                  <TouchableOpacity
                    onPress={handleQuickFillTestOtp}
                    style={styles.devFillBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.devFillText}>
                      ⚡ Quick Auto-Fill OTP (123456)
                    </Text>
                  </TouchableOpacity>

                  {/* OTP 6-Digit Inputs */}
                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                    Enter 6-digit verification code
                  </Text>

                  <View style={styles.otpRow}>
                    {otpCode.map((digit, index) => {
                      const isFilled = digit.length > 0;
                      return (
                        <Animated.View
                          key={index}
                          style={[
                            styles.otpBoxWrapper,
                            {
                              transform: [
                                {
                                  scale: otpBoxPopAnims[index].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1],
                                  }),
                                },
                              ],
                            },
                          ]}
                        >
                          <TextInput
                            ref={(el) => {
                              otpInputRefs.current[index] = el;
                            }}
                            style={[
                              styles.otpInput,
                              isFilled && styles.otpInputFilled,
                            ]}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) =>
                              handleOtpChange(text, index)
                            }
                            onKeyPress={(e) => handleOtpKeyPress(e, index)}
                            selectTextOnFocus
                            cursorColor="#0D9488"
                          />
                        </Animated.View>
                      );
                    })}
                  </View>

                  {/* Resend OTP & Countdown */}
                  <View style={styles.resendRow}>
                    {timer > 0 ? (
                      <Text style={styles.timerText}>
                        Resend code in{" "}
                        <Text style={styles.timerCount}>{timer}s</Text>
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setTimer(30);
                          handleContinueOrSendOtp();
                        }}
                      >
                        <Text style={styles.resendBtnText}>Resend Code</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Verify Action Button */}
                  <Animated.View
                    style={{
                      transform: [{ scale: buttonScale }],
                      marginTop: 12,
                    }}
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
                          style={{ flexDirection: "row", alignItems: "center" }}
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
                        <Text style={styles.primaryButtonText}>
                          Verify & Proceed
                        </Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              )}
            </View>

            {/* Social Logins Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsRow}>
              {/* Google */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.socialBtn}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  Alert.alert(
                    "Google Login",
                    "Google authentication is enabled for your organization.",
                  );
                }}
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={styles.socialBtnText}>Google</Text>
              </TouchableOpacity>

              {/* Apple */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.socialBtn}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  Alert.alert(
                    "Apple ID",
                    "Sign in with Apple is available on iOS devices.",
                  );
                }}
              >
                <Ionicons name="logo-apple" size={19} color="#0F172A" />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Terms & Privacy */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  heroWrapper: {
    width: SCREEN_WIDTH,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0D9488",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  svgCurveOverlay: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: 80,
  },
  topLogoBadge: {
    position: "absolute",
    left: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 90,
    height: 32,
  },
  formContainer: {
    paddingHorizontal: 22,
    paddingTop: 4,
    backgroundColor: "#FFFFFF",
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 20,
  },
  formsWindow: {
    marginTop: 14,
  },
  inputSection: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 52,
  },
  inputContainerFocused: {
    borderColor: "#0D9488",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  helperText: {
    fontSize: 11.5,
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 4,
  },
  newUserCard: {
    backgroundColor: "#F0FDFA",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#99F6E4",
    padding: 14,
    marginTop: 14,
  },
  newMemberHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sparkleBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
  },
  newMemberTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F766E",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  dropdownContainer: {
    marginTop: 6,
    borderRadius: 16,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  dropdownTriggerActive: {
    borderColor: "#0D9488",
    backgroundColor: "#F0FDFA",
  },
  dropdownRoleIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dropdownTriggerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  dropdownTriggerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  dropdownTriggerSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  dropdownBadge: {
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  dropdownBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#0F766E",
  },
  dropdownChevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginLeft: 6,
  },
  dropdownChevronCircleActive: {
    borderColor: "#99F6E4",
    backgroundColor: "#CCFBF1",
  },
  dropdownMenu: {
    overflow: "hidden",
    marginTop: 6,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#CCFBF1",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  dropdownMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: "#FFFFFF",
  },
  dropdownMenuItemActive: {
    backgroundColor: "#F0FDFA",
  },
  dropdownMenuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItemIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  dropdownItemTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#1E293B",
  },
  dropdownItemTitleActive: {
    color: "#0F766E",
    fontWeight: "800",
  },
  dropdownItemBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  dropdownItemBadgeActive: {
    backgroundColor: "#CCFBF1",
  },
  dropdownItemBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },
  dropdownItemBadgeTextActive: {
    color: "#0D9488",
  },
  dropdownItemDesc: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 1.5,
    lineHeight: 14,
  },
  dropdownRadioCircle: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dropdownRadioUnchecked: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 12.5,
    fontWeight: "600",
  },
  errorBannerCloseBtn: {
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    height: 52,
    borderRadius: 16,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  detectedAccountBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    padding: 14,
  },
  detectedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  lockBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F766E",
  },
  changeContactText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0D9488",
  },
  lockedFieldsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  lockedLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
  },
  lockedValue: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    maxWidth: "70%",
  },
  lockedContactValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    maxWidth: "70%",
  },
  lockedDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  roleTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F766E",
  },
  devFillBtn: {
    alignSelf: "flex-end",
    marginTop: 10,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  devFillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B45309",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  otpBoxWrapper: {
    width: (SCREEN_WIDTH - 44 - 40) / 6,
    height: 52,
  },
  otpInput: {
    width: "100%",
    height: "100%",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  otpInputFilled: {
    borderColor: "#0D9488",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  timerCount: {
    color: "#0D9488",
    fontWeight: "700",
  },
  resendBtnText: {
    fontSize: 13,
    color: "#0D9488",
    fontWeight: "800",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12.5,
    color: "#94A3B8",
    fontWeight: "600",
  },
  socialButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  termsText: {
    fontSize: 11.5,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 22,
    lineHeight: 16,
  },
  termsLink: {
    color: "#0D9488",
    fontWeight: "700",
  },
});
