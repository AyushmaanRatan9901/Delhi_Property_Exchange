import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ThemeMode, useResponsiveTheme } from "../../constants/theme";

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: string) => void;
}

interface MenuItem {
  id: string;
  icon: any;
  iconType: "feather" | "ionicons" | "material" | "community" | "fa5";
  title: string;
  subtitle?: string;
  iconColor: string;
  iconBgLight: string;
  iconBgDark: string;
  badge?: string;
  badgeColor?: string;
  danger?: boolean;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
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
    wp,
  } = useResponsiveTheme();

  // Drawer Width
  const drawerWidth = Math.min(wp(84), 350);

  // Animation values
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const [isRendered, setIsRendered] = useState(visible);
  const [userRole, setUserRole] = useState<"tenant" | "owner">("tenant");

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -drawerWidth,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible, drawerWidth]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRendered(false);
      onClose();
    });
  };

  const handleItemPress = (item: MenuItem) => {
    handleClose();
    setTimeout(() => {
      onNavigate?.(item.id);
    }, 280);
  };

  if (!isRendered && !visible) {
    return null;
  }

  // Render dynamic icon helper
  const renderIcon = (item: MenuItem) => {
    const size = moderateScale(19);

    switch (item.iconType) {
      case "feather":
        return <Feather name={item.icon} size={size} color={item.iconColor} />;
      case "ionicons":
        return <Ionicons name={item.icon} size={size} color={item.iconColor} />;
      case "material":
        return (
          <MaterialIcons name={item.icon} size={size} color={item.iconColor} />
        );
      case "community":
        return (
          <MaterialCommunityIcons
            name={item.icon}
            size={size}
            color={item.iconColor}
          />
        );
      case "fa5":
        return (
          <FontAwesome5 name={item.icon} size={size} color={item.iconColor} />
        );
      default:
        return <Feather name="circle" size={size} color={item.iconColor} />;
    }
  };

  const MAIN_MENU: MenuItem[] = [
    {
      id: "home",
      icon: "home",
      iconType: "feather",
      title: "Explore Stays",
      subtitle: "Rooms, PGs & Coliving",
      iconColor: colors.primary,
      iconBgLight: "#ccfbf1",
      iconBgDark: "#132a2f",
    },
    {
      id: "visits",
      icon: "calendar-check-outline",
      iconType: "community",
      title: "Scheduled Visits",
      subtitle: "Track property visit timings",
      iconColor: "#0284c7",
      iconBgLight: "#f0f9ff",
      iconBgDark: "#0b1e2c",
      badge: "2 Active",
      badgeColor: "#0284c7",
    },
    {
      id: "saved",
      icon: "heart",
      iconType: "ionicons",
      title: "Saved & Wishlist",
      subtitle: "Your favorite properties",
      iconColor: colors.locationPinRed,
      iconBgLight: "#fef2f2",
      iconBgDark: "#2a1414",
      badge: "5 Stays",
      badgeColor: colors.locationPinRed,
    },
    {
      id: "agreements",
      icon: "file-document-outline",
      iconType: "community",
      title: "Rental Agreement & KYC",
      subtitle: "Verified digital e-lease",
      iconColor: colors.verifiedGreenDark,
      iconBgLight: "#ecfdf5",
      iconBgDark: "#064e3b",
      badge: "Verified ✔",
      badgeColor: colors.verifiedGreenDark,
    },
    {
      id: "receipts",
      icon: "receipt",
      iconType: "material",
      title: "Payment & Receipts",
      subtitle: "Invoices & rent statements",
      iconColor: colors.primaryDark,
      iconBgLight: "#ccfbf1",
      iconBgDark: "#132a2f",
    },
  ];

  const REWARDS_MENU: MenuItem[] = [
    {
      id: "refer",
      icon: "gift-outline",
      iconType: "community",
      title: "Refer & Earn ₹2,000",
      subtitle: "Cash rewards for friend invites",
      iconColor: colors.locationPinRed,
      iconBgLight: "#fef2f2",
      iconBgDark: "#2a1414",
      badge: "HOT 🔥",
      badgeColor: colors.locationPinRed,
    },
    {
      id: "coupons",
      icon: "ticket-percent-outline",
      iconType: "community",
      title: "Offers & Coupons",
      subtitle: "Zero brokerage & cashbacks",
      iconColor: "#d97706",
      iconBgLight: "#fef3c7",
      iconBgDark: "#382006",
    },
    {
      id: "events",
      icon: "account-group-outline",
      iconType: "community",
      title: "Community & Events",
      subtitle: "Movie nights & meetups",
      iconColor: colors.primary,
      iconBgLight: "#ccfbf1",
      iconBgDark: "#132a2f",
    },
  ];

  const SUPPORT_MENU: MenuItem[] = [
    {
      id: "helpdesk",
      icon: "headset",
      iconType: "material",
      title: "24/7 Caretaker Helpdesk",
      subtitle: "Instant phone & WhatsApp support",
      iconColor: colors.verifiedGreen,
      iconBgLight: "#ecfdf5",
      iconBgDark: "#064e3b",
    },
    {
      id: "safety",
      icon: "shield-check-outline",
      iconType: "community",
      title: "Safety & SOS Center",
      subtitle: "Emergency contact & wardens",
      iconColor: "#0284c7",
      iconBgLight: "#f0f9ff",
      iconBgDark: "#0b1e2c",
    },
    {
      id: "settings",
      icon: "settings",
      iconType: "feather",
      title: "App Settings",
      subtitle: "Preferences & notifications",
      iconColor: colors.textMuted,
      iconBgLight: "#f1f5f9",
      iconBgDark: "#172a3a",
    },
  ];

  return (
    <Modal
      transparent
      visible={isRendered}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Animated Dark Frosted Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
                backgroundColor: "rgba(6, 17, 30, 0.75)",
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sliding Premium Drawer Panel */}
        <Animated.View
          style={[
            styles.drawer,
            {
              width: drawerWidth,
              backgroundColor: colors.background,
              transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
            },
            shadows.floating,
          ]}
        >
          {/* Top Luxury Gradient Header */}
          <LinearGradient
            colors={
              isDark
                ? [colors.cardBackground, "#0D3D52", colors.background]
                : [
                    colors.primary,
                    colors.primaryDark,
                    colors.primaryGradientEnd,
                  ]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.profileHeader,
              {
                paddingTop:
                  Platform.OS === "ios" ? spacing.xxl + 16 : spacing.xxl + 6,
                paddingHorizontal: spacing.lg,
                paddingBottom: spacing.lg,
              },
            ]}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.8}
              style={[
                styles.closeButton,
                {
                  width: moderateScale(34),
                  height: moderateScale(34),
                  borderRadius: radii.round,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                },
              ]}
            >
              <Feather name="x" size={moderateScale(18)} color={colors.white} />
            </TouchableOpacity>

            {/* Profile Avatar & Info Row */}
            <View style={[layout.horizontalView, { marginTop: spacing.sm }]}>
              {/* Avatar with Double-Ring Glow */}
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                  }}
                  style={[
                    styles.avatar,
                    {
                      width: moderateScale(58),
                      height: moderateScale(58),
                      borderRadius: moderateScale(29),
                      borderColor: colors.white,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.activeBadge,
                    {
                      backgroundColor: "#10B981",
                      borderColor: colors.white,
                    },
                  ]}
                />
              </View>

              {/* User Name & Details */}
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <View style={layout.horizontalView}>
                  <Text
                    numberOfLines={1}
                    style={[styles.userName, { fontSize: moderateScale(16.5) }]}
                  >
                    Rahul Sharma
                  </Text>
                  <MaterialIcons
                    name="verified"
                    size={moderateScale(17)}
                    color="#FDE047"
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <Text
                  style={[styles.userPhone, { fontSize: moderateScale(11.5) }]}
                >
                  +91 98765 43210
                </Text>
                <View
                  style={[
                    styles.verifiedTag,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.xs + 3,
                      paddingVertical: 1.5,
                      marginTop: 3,
                      alignSelf: "flex-start",
                    },
                  ]}
                >
                  <Text style={styles.verifiedTagText}>
                    ★ Pro Verified Tenant
                  </Text>
                </View>
              </View>
            </View>

            {/* StayCoins & Wallet Card */}
            <View
              style={[
                styles.walletBox,
                {
                  borderRadius: radii.lg,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 3,
                  marginTop: spacing.md,
                  backgroundColor: "rgba(0, 0, 0, 0.26)",
                  borderColor: "rgba(255, 255, 255, 0.15)",
                },
              ]}
            >
              <View style={layout.horizontalViewBetween}>
                <View style={layout.horizontalView}>
                  <MaterialCommunityIcons
                    name="star-circle"
                    size={moderateScale(20)}
                    color="#FDE047"
                    style={{ marginRight: 6 }}
                  />
                  <View>
                    <Text
                      style={[
                        styles.walletBalance,
                        { fontSize: moderateScale(12) },
                      ]}
                    >
                      StayCoins:{" "}
                      <Text style={{ fontWeight: "800", color: "#FDE047" }}>
                        1,500
                      </Text>
                    </Text>
                    <Text
                      style={[
                        styles.walletSub,
                        { fontSize: moderateScale(9.5) },
                      ]}
                    >
                      ₹1,500 Rent Cash Value
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.redeemButton,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.sm + 2,
                      paddingVertical: 3,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.redeemText,
                      {
                        fontSize: moderateScale(11),
                        color: colors.primaryDark,
                      },
                    ]}
                  >
                    Redeem
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Menu Scrollable Items */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.menuContent,
              {
                paddingHorizontal: spacing.md,
                paddingBottom: spacing.xxl + 20,
              },
            ]}
          >
            {/* Section 1: Main Services */}
            <Text
              style={[
                styles.sectionHeading,
                {
                  fontSize: moderateScale(10.5),
                  color: colors.textMuted,
                  marginTop: spacing.md,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              CORE SERVICES
            </Text>
            <View
              style={[
                styles.menuGroupCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.xl,
                  borderColor: colors.border,
                },
                shadows.sm,
              ]}
            >
              {MAIN_MENU.map((item, index) => {
                const iconBg = isDark ? item.iconBgDark : item.iconBgLight;
                const isLast = index === MAIN_MENU.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => handleItemPress(item)}
                    style={[
                      styles.menuItem,
                      {
                        paddingVertical: spacing.sm + 2,
                        paddingHorizontal: spacing.md,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={layout.horizontalView}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: iconBg,
                            width: moderateScale(36),
                            height: moderateScale(36),
                            borderRadius: radii.lg,
                            marginRight: spacing.md,
                          },
                        ]}
                      >
                        {renderIcon(item)}
                      </View>
                      <View>
                        <Text
                          style={[
                            typography.cardTitle,
                            {
                              fontSize: moderateScale(13.5),
                              color: colors.textPrimary,
                            },
                          ]}
                        >
                          {item.title}
                        </Text>
                        {item.subtitle && (
                          <Text
                            style={[
                              typography.cardAmenity,
                              {
                                fontSize: moderateScale(10.5),
                                color: colors.textSecondary,
                                marginTop: 1,
                              },
                            ]}
                          >
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>

                    {item.badge ? (
                      <View
                        style={[
                          styles.itemBadge,
                          {
                            backgroundColor: `${item.badgeColor}16`,
                            borderColor: item.badgeColor,
                            borderRadius: radii.pill,
                            paddingHorizontal: spacing.xs + 3,
                            paddingVertical: 2,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(10),
                            fontWeight: "700",
                            color: item.badgeColor,
                          }}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    ) : (
                      <Feather
                        name="chevron-right"
                        size={moderateScale(16)}
                        color={colors.textMuted}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section 2: Rewards & Clubs */}
            <Text
              style={[
                styles.sectionHeading,
                {
                  fontSize: moderateScale(10.5),
                  color: colors.textMuted,
                  marginTop: spacing.md,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              REWARDS & COMMUNITY
            </Text>
            <View
              style={[
                styles.menuGroupCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.xl,
                  borderColor: colors.border,
                },
                shadows.sm,
              ]}
            >
              {REWARDS_MENU.map((item, index) => {
                const iconBg = isDark ? item.iconBgDark : item.iconBgLight;
                const isLast = index === REWARDS_MENU.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => handleItemPress(item)}
                    style={[
                      styles.menuItem,
                      {
                        paddingVertical: spacing.sm + 2,
                        paddingHorizontal: spacing.md,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={layout.horizontalView}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: iconBg,
                            width: moderateScale(36),
                            height: moderateScale(36),
                            borderRadius: radii.lg,
                            marginRight: spacing.md,
                          },
                        ]}
                      >
                        {renderIcon(item)}
                      </View>
                      <View>
                        <Text
                          style={[
                            typography.cardTitle,
                            {
                              fontSize: moderateScale(13.5),
                              color: colors.textPrimary,
                            },
                          ]}
                        >
                          {item.title}
                        </Text>
                        {item.subtitle && (
                          <Text
                            style={[
                              typography.cardAmenity,
                              {
                                fontSize: moderateScale(10.5),
                                color: colors.textSecondary,
                                marginTop: 1,
                              },
                            ]}
                          >
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>

                    {item.badge ? (
                      <View
                        style={[
                          styles.itemBadge,
                          {
                            backgroundColor: `${item.badgeColor}16`,
                            borderColor: item.badgeColor,
                            borderRadius: radii.pill,
                            paddingHorizontal: spacing.xs + 3,
                            paddingVertical: 2,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(10),
                            fontWeight: "700",
                            color: item.badgeColor,
                          }}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    ) : (
                      <Feather
                        name="chevron-right"
                        size={moderateScale(16)}
                        color={colors.textMuted}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick 3-Way Theme Switcher Widget */}
            <View
              style={[
                styles.themeWidget,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.xl,
                  padding: spacing.md,
                  marginTop: spacing.md,
                  borderColor: colors.border,
                },
                shadows.sm,
              ]}
            >
              <View
                style={[
                  layout.horizontalViewBetween,
                  { marginBottom: spacing.sm },
                ]}
              >
                <View style={layout.horizontalView}>
                  <Ionicons
                    name={isDark ? "moon" : "sunny"}
                    size={moderateScale(18)}
                    color={isDark ? "#A78BFA" : "#F59E0B"}
                    style={{ marginRight: spacing.xs }}
                  />
                  <Text
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13),
                        color: colors.textPrimary,
                      },
                    ]}
                  >
                    Theme Preference
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: moderateScale(11),
                    color: colors.textSecondary,
                    textTransform: "capitalize",
                  }}
                >
                  {themeMode} Mode
                </Text>
              </View>

              {/* 3 Pills: Light / Dark / System */}
              <View
                style={[
                  layout.horizontalViewBetween,
                  styles.themePillsContainer,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceHover
                      : colors.surfaceLight,
                    borderRadius: radii.pill,
                    padding: 3,
                  },
                ]}
              >
                {(["light", "dark", "system"] as ThemeMode[]).map((mode) => {
                  const isActive = themeMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setThemeMode(mode)}
                      style={[
                        styles.themePillBtn,
                        {
                          backgroundColor: isActive
                            ? colors.primary
                            : "transparent",
                          borderRadius: radii.pill,
                          paddingVertical: spacing.xs,
                          flex: 1,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: moderateScale(11),
                          fontWeight: isActive ? "700" : "500",
                          color: isActive ? colors.white : colors.textPrimary,
                          textTransform: "capitalize",
                        }}
                      >
                        {mode === "light"
                          ? "☀️ Light"
                          : mode === "dark"
                            ? "🌙 Dark"
                            : "⚙️ Auto"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Support & Account */}
            <Text
              style={[
                styles.sectionHeading,
                {
                  fontSize: moderateScale(10.5),
                  color: colors.textMuted,
                  marginTop: spacing.md,
                  marginBottom: spacing.xs,
                },
              ]}
            >
              SUPPORT & LEGAL
            </Text>
            <View
              style={[
                styles.menuGroupCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.xl,
                  borderColor: colors.border,
                },
                shadows.sm,
              ]}
            >
              {SUPPORT_MENU.map((item, index) => {
                const iconBg = isDark ? item.iconBgDark : item.iconBgLight;
                const isLast = index === SUPPORT_MENU.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => handleItemPress(item)}
                    style={[
                      styles.menuItem,
                      {
                        paddingVertical: spacing.sm + 2,
                        paddingHorizontal: spacing.md,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: colors.borderLight,
                      },
                    ]}
                  >
                    <View style={layout.horizontalView}>
                      <View
                        style={[
                          styles.iconBox,
                          {
                            backgroundColor: iconBg,
                            width: moderateScale(36),
                            height: moderateScale(36),
                            borderRadius: radii.lg,
                            marginRight: spacing.md,
                          },
                        ]}
                      >
                        {renderIcon(item)}
                      </View>
                      <View>
                        <Text
                          style={[
                            typography.cardTitle,
                            {
                              fontSize: moderateScale(13.5),
                              color: colors.textPrimary,
                            },
                          ]}
                        >
                          {item.title}
                        </Text>
                        {item.subtitle && (
                          <Text
                            style={[
                              typography.cardAmenity,
                              {
                                fontSize: moderateScale(10.5),
                                color: colors.textSecondary,
                                marginTop: 1,
                              },
                            ]}
                          >
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={moderateScale(16)}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Log Out Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                handleItemPress({
                  id: "logout",
                  icon: "log-out",
                  iconType: "feather",
                  title: "Log Out",
                  iconColor: "#EF4444",
                  iconBgLight: "#FEF2F2",
                  iconBgDark: "#450A0A",
                  danger: true,
                })
              }
              style={[
                styles.logoutButton,
                {
                  backgroundColor: isDark ? "#2D141C" : "#FFF1F2",
                  borderColor: isDark ? "#4C1D2A" : "#FECDD3",
                  borderRadius: radii.xl,
                  paddingVertical: spacing.md,
                  marginTop: spacing.md,
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
                  { fontSize: moderateScale(13), color: colors.favoriteRed },
                ]}
              >
                Log Out of Account
              </Text>
            </TouchableOpacity>

            {/* Footer & App Credentials */}
            <View style={[styles.footer, { marginTop: spacing.lg }]}>
              <View style={layout.horizontalView}>
                <Text
                  style={[
                    typography.brandTitle,
                    { fontSize: moderateScale(15), color: colors.textPrimary },
                  ]}
                >
                  Stay
                </Text>
                <Text
                  style={[
                    typography.brandHighlight,
                    { fontSize: moderateScale(15), color: colors.primary },
                  ]}
                >
                  Finder
                </Text>
                <View
                  style={[
                    styles.verifiedDot,
                    { backgroundColor: colors.verifiedGreen },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.versionText,
                  {
                    fontSize: moderateScale(11),
                    color: colors.textMuted,
                    marginTop: 2,
                  },
                ]}
              >
                Version 2.0.0 • 100% Zero Brokerage
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  profileHeader: {
    position: "relative",
    borderBottomRightRadius: 24,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 48 : 32,
    right: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    borderWidth: 1,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    borderWidth: 2.5,
    backgroundColor: "#334155",
  },
  activeBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  userName: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  userPhone: {
    color: "rgba(255, 255, 255, 0.88)",
    marginTop: 1,
  },
  verifiedTag: {},
  verifiedTagText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "700",
  },
  walletBox: {
    borderWidth: 1,
  },
  walletBalance: {
    color: "#FFFFFF",
  },
  walletSub: {
    color: "rgba(255, 255, 255, 0.75)",
  },
  redeemButton: {},
  redeemText: {
    fontWeight: "700",
  },
  modeSegmentContainer: {
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {},
  sectionHeading: {
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  menuGroupCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  itemBadge: {
    borderWidth: 0.8,
  },
  themeWidget: {
    borderWidth: 1,
  },
  themePillsContainer: {},
  themePillBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  logoutText: {
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  versionText: {
    fontWeight: "500",
  },
});

export default SideMenu;
