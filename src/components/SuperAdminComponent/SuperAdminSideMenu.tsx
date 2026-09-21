import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, usePathname } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useResponsiveTheme, ThemeMode } from "../../constants/theme";
import { useAppDispatch, useAppSelector } from "../../Redux/hooks";
import { logout } from "../../Redux/Auth/authActions";
import { changeLanguage } from "../../i18n/language";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 350);

interface SuperAdminSideMenuProps {
  visible: boolean;
  onClose: () => void;
  onCreateUserPress?: () => void;
  onNotificationPress?: () => void;
}

interface MenuItem {
  id: string;
  route?: string;
  title: string;
  subtitle: string;
  icon: any;
  iconType: "feather" | "ionicons" | "material" | "community" | "fa5";
  iconColor: string;
  badge?: string;
  badgeColor?: string;
  action?: () => void;
}

export const SuperAdminSideMenu: React.FC<SuperAdminSideMenuProps> = ({
  visible,
  onClose,
  onCreateUserPress,
  onNotificationPress,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { isDark, colors, themeMode, setThemeMode } = useResponsiveTheme();
  const { i18n } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);

  const [isRendered, setIsRendered] = useState(visible);

  // Animation values
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Open & close animation lifecycle
  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 55,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible]);

  // Smooth close helper
  const handleClose = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRendered(false);
      onClose();
    });
  };

  // Gesture PanResponder: Smooth Finger Drag to Close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx < -8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          slideAnim.setValue(gestureState.dx);
          const progress = Math.max(0, 1 + gestureState.dx / DRAWER_WIDTH);
          fadeAnim.setValue(progress);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -DRAWER_WIDTH * 0.25 || gestureState.vx < -0.4) {
          handleClose();
        } else {
          Animated.parallel([
            Animated.spring(slideAnim, {
              toValue: 0,
              friction: 8,
              tension: 50,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  if (!isRendered && !visible) return null;

  const navigateTo = (path: string) => {
    handleClose();
    setTimeout(() => {
      router.push(path as any);
    }, 240);
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Super Admin Sign Out", "Are you sure you want to end your Super Admin session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          handleClose();
          await dispatch(logout());
          router.replace("/(auth)/login" as any);
        },
      },
    ]);
  };

  const handleLanguageToggle = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const nextLang = i18n.language === "hi" ? "en" : "hi";
    await changeLanguage(nextLang);
  };

  const renderIcon = (item: MenuItem) => {
    const size = 18;
    switch (item.iconType) {
      case "feather":
        return <Feather name={item.icon} size={size} color={item.iconColor} />;
      case "ionicons":
        return <Ionicons name={item.icon} size={size} color={item.iconColor} />;
      case "material":
        return <MaterialIcons name={item.icon} size={size} color={item.iconColor} />;
      case "community":
        return <MaterialCommunityIcons name={item.icon} size={size} color={item.iconColor} />;
      case "fa5":
        return <FontAwesome5 name={item.icon} size={size} color={item.iconColor} />;
      default:
        return <Feather name="circle" size={size} color={item.iconColor} />;
    }
  };

  const CORE_MODULES: MenuItem[] = [
    {
      id: "dashboard",
      route: "/SuperAdminPanel/(tabs)/Dashboard",
      title: "Executive Dashboard",
      subtitle: "Unmasked property & owner directory",
      icon: "layout",
      iconType: "feather",
      iconColor: "#0D9488",
    },
    {
      id: "users",
      route: "/SuperAdminPanel/(tabs)/users",
      title: "User & Role Management",
      subtitle: "Staff provisioning, KYC & commissions",
      icon: "users",
      iconType: "feather",
      iconColor: "#3B82F6",
      badge: "Full Control",
      badgeColor: "#3B82F6",
    },
    {
      id: "approvals",
      route: "/SuperAdminPanel/(tabs)/approvals",
      title: "Approvals & Payouts Hub",
      subtitle: "Commission release & duplicate resolver",
      icon: "shield-check-outline",
      iconType: "community",
      iconColor: "#10B981",
      badge: "Live Desk",
      badgeColor: "#10B981",
    },
    {
      id: "analytics",
      route: "/SuperAdminPanel/(tabs)/analytics",
      title: "Analytics & Rent Ledger",
      subtitle: "Pipeline funnel & universal rent ledger",
      icon: "chart-timeline-variant",
      iconType: "community",
      iconColor: "#8B5CF6",
    },
    {
      id: "settings",
      route: "/SuperAdminPanel/(tabs)/settings",
      title: "System Automation & Rules",
      subtitle: "WhatsApp windows, SLAs & commissions",
      icon: "settings",
      iconType: "feather",
      iconColor: "#0F766E",
    },
    {
      id: "notifications",
      title: "Live Notifications & Feed",
      subtitle: "Leads, verifications, KYC & payouts",
      icon: "bell",
      iconType: "feather",
      iconColor: "#EF4444",
      badge: "Real-Time",
      badgeColor: "#EF4444",
      action: () => {
        handleClose();
        if (onNotificationPress) {
          setTimeout(onNotificationPress, 260);
        }
      },
    },
  ];

  const QUICK_ACTIONS: MenuItem[] = [
    {
      id: "create_user",
      title: "Provision New Staff / Agent",
      subtitle: "Create verified staff with auto ID",
      icon: "user-plus",
      iconType: "feather",
      iconColor: "#0D9488",
      action: () => {
        handleClose();
        setTimeout(() => {
          onCreateUserPress?.();
        }, 240);
      },
    },
    {
      id: "duplicate_review",
      title: "Duplicate Resolver Desk",
      subtitle: "Side-by-side Aadhaar & address match",
      icon: "copy",
      iconType: "feather",
      iconColor: "#D97706",
      action: () => {
        navigateTo("/SuperAdminPanel/(tabs)/approvals");
      },
    },
    {
      id: "rent_ledger",
      title: "Universal Rent Ledger",
      subtitle: "System-wide rental collection track",
      icon: "receipt",
      iconType: "material",
      iconColor: "#6366F1",
      action: () => {
        navigateTo("/SuperAdminPanel/(tabs)/analytics");
      },
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
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
                backgroundColor: "rgba(15, 23, 42, 0.75)",
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: isDark ? "#0B132B" : "#FFFFFF",
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={isDark ? ["#0F172A", "#042F2E", "#064E3B"] : ["#0D9488", "#0F766E", "#115E59"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.headerBanner, { paddingTop: Math.max(insets.top + 10, 36) }]}
          >
            <View style={styles.headerTopRow}>
              <View style={styles.superBadgeRow}>
                <MaterialCommunityIcons name="crown" size={16} color="#FDE047" />
                <Text style={styles.superBadgeText}>SUPER ADMIN COMMAND</Text>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileRow}>
              <View style={styles.avatarGlow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>
                    {(user?.name || "Super Admin").slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.onlineDot} />
              </View>

              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.adminName} numberOfLines={1}>
                  {user?.name || "Super Admin"}
                </Text>
                <Text style={styles.adminContact} numberOfLines={1}>
                  {user?.phone ? "+91 " + user.phone : user?.email || "admin@delhiproperty.com"}
                </Text>
                <View style={styles.accessBadge}>
                  <Feather name="shield" size={10} color="#5EEAD4" />
                  <Text style={styles.accessBadgeText}>FULL OWNER PRIVILEGES</Text>
                </View>
              </View>
            </View>

            <View style={styles.dragHintBar}>
              <Feather name="chevron-left" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.dragHintText}>Swipe left with finger to close</Text>
            </View>
          </LinearGradient>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.menuScroll, { paddingBottom: Math.max(insets.bottom + 30, 40) }]}
          >
            <Text style={[styles.sectionHeading, { color: isDark ? "#94A3B8" : "#64748B" }]}>
              CORE ADMINISTRATIVE MODULES
            </Text>

            <View style={[styles.cardGroup, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              {CORE_MODULES.map((item, idx) => {
                const isActive = pathname?.includes(item.id) || (item.id === "dashboard" && pathname?.endsWith("Dashboard"));
                const isLast = idx === CORE_MODULES.length - 1;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      if (item.action) {
                        item.action();
                      } else if (item.route) {
                        navigateTo(item.route);
                      }
                    }}
                    style={[
                      styles.menuItem,
                      {
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: isDark ? "#334155" : "#E2E8F0",
                        backgroundColor: isActive
                          ? isDark
                            ? "rgba(13, 148, 136, 0.2)"
                            : "#F0FDFA"
                          : "transparent",
                      },
                    ]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
                      {renderIcon(item)}
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={[
                          styles.menuTitle,
                          {
                            color: isActive ? "#0D9488" : isDark ? "#FFFFFF" : "#0F172A",
                            fontWeight: isActive ? "800" : "700",
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={[styles.menuSub, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>

                    {item.badge ? (
                      <View style={[styles.itemBadge, { backgroundColor: item.badgeColor + "18", borderColor: item.badgeColor }]}>
                        <Text style={[styles.itemBadgeText, { color: item.badgeColor }]}>{item.badge}</Text>
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={16} color={isActive ? "#0D9488" : "#94A3B8"} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionHeading, { color: isDark ? "#94A3B8" : "#64748B", marginTop: 20 }]}>
              EXECUTIVE SHORTCUTS & DESK
            </Text>

            <View style={[styles.cardGroup, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              {QUICK_ACTIONS.map((item, idx) => {
                const isLast = idx === QUICK_ACTIONS.length - 1;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={item.action}
                    style={[
                      styles.menuItem,
                      {
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
                      {renderIcon(item)}
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.menuTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.menuSub, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    </View>

                    <Feather name="arrow-up-right" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionHeading, { color: isDark ? "#94A3B8" : "#64748B", marginTop: 20 }]}>
              SYSTEM PREFERENCES
            </Text>

            <View style={[styles.cardGroup, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleLanguageToggle}
                style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: isDark ? "#334155" : "#E2E8F0" }]}
              >
                <View style={[styles.iconBox, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
                  <Ionicons name="language" size={18} color="#0D9488" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.menuTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    Display Language / भाषा
                  </Text>
                  <Text style={[styles.menuSub, { color: colors.textSecondary }]}>
                    {i18n.language === "hi" ? "हिंदी (Hindi)" : "English (Default)"}
                  </Text>
                </View>
                <View style={[styles.langPill, { backgroundColor: "#0D9488" }]}>
                  <Text style={styles.langPillText}>{(i18n.language || "en").toUpperCase()}</Text>
                </View>
              </TouchableOpacity>

              <View style={[styles.themeWidget, { padding: 12 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 }}>
                  <Feather name="moon" size={16} color="#0D9488" />
                  <Text style={[styles.menuTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    Theme Mode
                  </Text>
                </View>

                <View style={styles.themeToggleRow}>
                  {(["light", "dark", "system"] as ThemeMode[]).map((mode) => {
                    const isSelected = themeMode === mode;
                    return (
                      <TouchableOpacity
                        key={mode}
                        activeOpacity={0.8}
                        onPress={() => {
                          try {
                            Haptics.selectionAsync();
                          } catch {}
                          setThemeMode(mode);
                        }}
                        style={[
                          styles.themeBtn,
                          {
                            backgroundColor: isSelected
                              ? "#0D9488"
                              : isDark
                              ? "#0F172A"
                              : "#FFFFFF",
                            borderColor: isSelected ? "#0D9488" : isDark ? "#334155" : "#CBD5E1",
                          },
                        ]}
                      >
                        <Ionicons
                          name={mode === "light" ? "sunny" : mode === "dark" ? "moon" : "phone-portrait-outline"}
                          size={14}
                          color={isSelected ? "#FFFFFF" : isDark ? "#94A3B8" : "#475569"}
                        />
                        <Text
                          style={[
                            styles.themeBtnText,
                            {
                              color: isSelected ? "#FFFFFF" : isDark ? "#94A3B8" : "#475569",
                              fontWeight: isSelected ? "800" : "600",
                            },
                          ]}
                        >
                          {mode.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleLogout}
              style={[styles.logoutBtn, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2", borderColor: "#FCA5A5" }]}
            >
              <Feather name="log-out" size={18} color="#EF4444" />
              <Text style={styles.logoutBtnText}>Sign Out Super Admin Session</Text>
            </TouchableOpacity>

            <View style={styles.versionWrap}>
              <View style={styles.securityRow}>
                <Ionicons name="lock-closed" size={12} color="#10B981" />
                <Text style={[styles.versionText, { color: colors.textMuted }]}>
                  Enterprise 256-bit Encrypted • v2.4.0
                </Text>
              </View>
              <Text style={[styles.copyrightText, { color: colors.textMuted }]}>
                Delhi Property Exchange • Super Admin Portal
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
    top: 0,
    bottom: 0,
    left: 0,
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 16,
  },
  headerBanner: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  superBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  superBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FDE047",
    letterSpacing: 0.8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarGlow: {
    position: "relative",
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#0D9488",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#5EEAD4",
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2.5,
    borderColor: "#0F172A",
  },
  adminName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  adminContact: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  accessBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 148, 136, 0.4)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
    gap: 4,
  },
  accessBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#5EEAD4",
    letterSpacing: 0.4,
  },
  dragHintBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 4,
  },
  dragHintText: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },
  menuScroll: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  cardGroup: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuTitle: {
    fontSize: 13.5,
  },
  menuSub: {
    fontSize: 11,
    marginTop: 1,
  },
  itemBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 0.8,
  },
  itemBadgeText: {
    fontSize: 9.5,
    fontWeight: "700",
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  themeWidget: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
  },
  themeToggleRow: {
    flexDirection: "row",
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
  },
  themeBtnText: {
    fontSize: 11,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 22,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#EF4444",
  },
  versionWrap: {
    alignItems: "center",
    marginTop: 18,
    gap: 2,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  versionText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  copyrightText: {
    fontSize: 9.5,
  },
});