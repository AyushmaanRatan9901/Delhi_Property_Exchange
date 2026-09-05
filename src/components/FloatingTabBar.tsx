import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ColorValue,
  Image,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveTheme } from "../constants/theme";

type TabsTabBarProp = NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>;
export type FloatingTabBarProps = TabsTabBarProp extends (props: infer P) => any
  ? P
  : any;

export type IconRenderer = (props: {
  focused: boolean;
  color: ColorValue;
  size: number;
}) => React.ReactNode;

export interface AccountItem {
  id: string;
  username: string;
  avatar: string;
  subtitle?: string;
  unreadCount?: number;
  isActive?: boolean;
}

const DEFAULT_ACCOUNTS: AccountItem[] = [
  {
    id: "acc-1",
    username: "ayushmaanratan",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80",
    isActive: true,
  },
  {
    id: "acc-2",
    username: "Raju_8979",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=180&q=80",
    subtitle: "2 chats",
    unreadCount: 2,
    isActive: false,
  },
];

/**
 * Helper to build iconic renderers from base name (outline when inactive, filled when active)
 */
export function tabIcon(
  name: string,
  iconFamily: "ionicons" | "community" | "feather" = "ionicons",
): IconRenderer {
  function TabIconRenderer({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: ColorValue;
    size: number;
  }) {
    const colorStr = color as string;
    if (iconFamily === "feather") {
      return <Feather name={name as any} size={size} color={colorStr} />;
    }
    if (iconFamily === "community") {
      return (
        <MaterialCommunityIcons
          name={(focused ? name : `${name}-outline`) as any}
          size={size}
          color={colorStr}
        />
      );
    }
    return (
      <Ionicons
        name={(focused ? name : `${name}-outline`) as any}
        size={size}
        color={colorStr}
      />
    );
  }
  TabIconRenderer.displayName = `TabIcon(${name})`;
  return TabIconRenderer;
}

/**
 * Helper to render a circular user profile avatar image with an active focus ring
 */
export function tabProfileAvatar(
  avatarUri = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80",
): IconRenderer {
  function ProfileAvatarRenderer({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: ColorValue;
    size: number;
  }) {
    const colorStr = color as string;
    const avatarDiameter = size + 4;

    return (
      <View
        style={{
          width: avatarDiameter + 4,
          height: avatarDiameter + 4,
          borderRadius: (avatarDiameter + 4) / 2,
          borderWidth: focused ? 2 : 1,
          borderColor: focused ? colorStr : "rgba(148, 163, 184, 0.4)",
          alignItems: "center",
          justifyContent: "center",
          padding: 1,
        }}
      >
        <Image
          source={{ uri: avatarUri }}
          style={{
            width: avatarDiameter,
            height: avatarDiameter,
            borderRadius: avatarDiameter / 2,
          }}
          resizeMode="cover"
        />
      </View>
    );
  }
  ProfileAvatarRenderer.displayName = "ProfileAvatarRenderer";
  return ProfileAvatarRenderer;
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: FloatingTabBarProps) {
  const { colors, isDark, moderateScale, isTablet, wp, spacing, radii } =
    useResponsiveTheme();
  const insets = useSafeAreaInsets();
  const accent = colors.primary;

  const barHeight = Math.round(
    Math.min(Math.max(moderateScale(56), 52), isTablet ? 66 : 58),
  );
  const maxBarWidth = isTablet ? 560 : Math.min(wp(92), 430);

  const layouts = useRef<Record<string, { x: number; width: number }>>({});
  const barContainerRef = useRef<View>(null);
  const barPageLayout = useRef<{ pageX: number; width: number }>({
    pageX: 0,
    width: maxBarWidth,
  });

  const [indicator] = useState({
    x: new Animated.Value(0),
    w: new Animated.Value(0),
  });
  const [ready, setReady] = useState(false);
  const [dragHoverIndex, setDragHoverIndex] = useState<number | null>(null);

  // Account Switcher & Add Account Modals State
  const [accounts, setAccounts] = useState<AccountItem[]>(DEFAULT_ACCOUNTS);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [addAccountModalVisible, setAddAccountModalVisible] = useState(false);

  const moveIndicator = (key: string) => {
    const l = layouts.current[key];
    if (!l) return;

    const horizontalPadding = moderateScale(3);

    Animated.parallel([
      Animated.spring(indicator.x, {
        toValue: l.x - horizontalPadding,
        damping: 18,
        stiffness: 140,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(indicator.w, {
        toValue: l.width + horizontalPadding * 2,
        damping: 18,
        stiffness: 140,
        mass: 0.9,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    const activeRoute = state.routes[state.index];
    if (activeRoute && layouts.current[activeRoute.key]) {
      moveIndicator(activeRoute.key);
      if (!ready) setReady(true);
    }
  }, [state.index, ready]);

  // Determine which tab index corresponds to an absolute X coordinate on screen
  const getIndexFromTouch = (pageX: number): number => {
    const total = state.routes.length;
    if (total === 0) return 0;

    const localX = pageX - barPageLayout.current.pageX;

    // Check specific layout bounds
    for (let i = 0; i < total; i++) {
      const route = state.routes[i];
      const l = layouts.current[route.key];
      if (l && localX >= l.x && localX <= l.x + l.width) {
        return i;
      }
    }

    // Fallback: divide width proportionally
    const w = barPageLayout.current.width || maxBarWidth;
    const clampedX = Math.max(0, Math.min(localX, w));
    const idx = Math.floor((clampedX / w) * total);
    return Math.max(0, Math.min(idx, total - 1));
  };

  // Hold and drag PanResponder
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.vx) > 0.15,
        onPanResponderGrant: (evt) => {
          const idx = getIndexFromTouch(evt.nativeEvent.pageX);
          setDragHoverIndex(idx);
          const route = state.routes[idx];
          if (route) moveIndicator(route.key);
        },
        onPanResponderMove: (evt) => {
          const idx = getIndexFromTouch(evt.nativeEvent.pageX);
          setDragHoverIndex(idx);
          const route = state.routes[idx];
          if (route) moveIndicator(route.key);
        },
        onPanResponderRelease: (evt) => {
          const idx = getIndexFromTouch(evt.nativeEvent.pageX);
          setDragHoverIndex(null);
          const targetRoute = state.routes[idx];
          if (targetRoute) {
            const event = navigation.emit({
              type: "tabPress",
              target: targetRoute.key,
              canPreventDefault: true,
            });
            if (state.index !== idx && !event.defaultPrevented) {
              navigation.navigate(targetRoute.name, targetRoute.params);
            }
            moveIndicator(targetRoute.key);
          }
        },
        onPanResponderTerminate: () => {
          setDragHoverIndex(null);
          const activeRoute = state.routes[state.index];
          if (activeRoute) moveIndicator(activeRoute.key);
        },
      }),
    [state.routes, state.index, navigation],
  );

  const handleBarLayout = () => {
    barContainerRef.current?.measure((x, y, width, height, pageX) => {
      if (width) {
        barPageLayout.current = { pageX, width };
      }
    });
  };

  const handleOpenAccountModal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // noop
    }
    setAccountModalVisible(true);
  };

  const handleSelectAccount = (selectedId: string) => {
    try {
      Haptics.selectionAsync();
    } catch {
      // noop
    }
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        isActive: acc.id === selectedId,
      })),
    );
    const target = accounts.find((a) => a.id === selectedId);
    setAccountModalVisible(false);
    if (target) {
      Alert.alert("Account Switched", `Logged in as @${target.username}`);
    }
  };

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
      >
        <View
          ref={barContainerRef}
          onLayout={handleBarLayout}
          {...panResponder.panHandlers}
          style={[
            styles.shadowWrap,
            {
              width: maxBarWidth,
              shadowColor: isDark ? "#000000" : "#0F172A",
              shadowOpacity: isDark ? 0.35 : 0.08,
            },
          ]}
        >
          <BlurView
            intensity={100}
            tint={isDark ? "dark" : "light"}
            style={[
              styles.blur,
              {
                height: barHeight,
                borderRadius: barHeight / 2,
                borderWidth: 1.2,
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.25)"
                  : "rgba(255, 255, 255, 0.85)",
              },
            ]}
          >
            {/* Luminous liquid glass refraction layer */}
            <LinearGradient
              colors={
                isDark
                  ? [
                      "rgba(255, 255, 255, 0.08)",
                      "rgba(255, 255, 255, 0.02)",
                      "rgba(0, 0, 0, 0.15)",
                    ]
                  : [
                      "rgba(255, 255, 255, 0.35)",
                      "rgba(255, 255, 255, 0.08)",
                      "rgba(255, 255, 255, 0.20)",
                    ]
              }
              style={StyleSheet.absoluteFill}
            />

            {/* Specular top glass prism reflection */}
            <LinearGradient
              colors={
                isDark
                  ? [
                      "rgba(255, 255, 255, 0.35)",
                      "rgba(255, 255, 255, 0.08)",
                      "rgba(255, 255, 255, 0)",
                    ]
                  : [
                      "rgba(255, 255, 255, 0.90)",
                      "rgba(255, 255, 255, 0.35)",
                      "rgba(255, 255, 255, 0)",
                    ]
              }
              style={[
                styles.topHighlight,
                {
                  height: barHeight * 0.5,
                  borderTopLeftRadius: barHeight / 2,
                  borderTopRightRadius: barHeight / 2,
                },
              ]}
              pointerEvents="none"
            />

            {/* Sliding Liquid Glass Active Indicator Pill */}
            {ready && (
              <Animated.View
                style={[
                  styles.indicatorWrap,
                  { transform: [{ translateX: indicator.x }] },
                ]}
              >
                <Animated.View
                  style={[
                    styles.indicator,
                    {
                      width: indicator.w,
                      borderRadius: barHeight,
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.18)"
                        : "rgba(16, 155, 161, 0.16)",
                      borderWidth: 0,
                    },
                  ]}
                />
              </Animated.View>
            )}

            {/* Tab Icons Row */}
            <View style={styles.row}>
              {state.routes.map((route: any, index: number) => {
                const descriptor = descriptors[route.key];
                const focused =
                  dragHoverIndex !== null
                    ? dragHoverIndex === index
                    : state.index === index;

                const onPress = () => {
                  const event = navigation.emit({
                    type: "tabPress",
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                };

                const onLongPress = () => {
                  if (route.name === "profile") {
                    handleOpenAccountModal();
                  } else {
                    navigation.emit({
                      type: "tabLongPress",
                      target: route.key,
                    });
                  }
                };

                return (
                  <TabButton
                    key={route.key}
                    route={route}
                    descriptor={descriptor}
                    focused={focused}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    onLayout={(e: LayoutChangeEvent) => {
                      const { x, width } = e.nativeEvent.layout;
                      layouts.current[route.key] = { x, width };
                      if (state.index === index) moveIndicator(route.key);
                    }}
                    accent={accent}
                    barHeight={barHeight}
                  />
                );
              })}
            </View>
          </BlurView>
        </View>
      </View>

      {/* MODAL 1: Account Switcher Bottom Sheet (Hold Profile for 1 Sec) */}
      <Modal
        visible={accountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setAccountModalVisible(false)}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.bottomSheetContainer,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.06)",
                paddingBottom: Math.max(insets.bottom, 22),
              },
            ]}
          >
            {/* Top Drag Handle */}
            <View style={styles.dragHandleWrapper}>
              <View
                style={[
                  styles.dragHandle,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.22)"
                      : "#CBD5E1",
                  },
                ]}
              />
            </View>

            {/* Sheet Title Bar */}
            <View style={[styles.modalHeaderRow, { marginBottom: spacing.sm }]}>
              <Text
                style={[
                  styles.modalTitleText,
                  {
                    color: colors.textPrimary,
                    fontSize: moderateScale(16),
                  },
                ]}
              >
                Switch Accounts
              </Text>
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(16, 155, 161, 0.20)"
                      : colors.primaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    {
                      color: colors.primary,
                      fontSize: moderateScale(11),
                    },
                  ]}
                >
                  {accounts.length} Saved
                </Text>
              </View>
            </View>

            {/* Accounts Enclosure Card Box */}
            <View
              style={[
                styles.accountsBox,
                {
                  backgroundColor: isDark
                    ? colors.backgroundSecondary
                    : "#F8FAFC",
                  borderColor: colors.border,
                  borderRadius: radii.xl || 18,
                },
              ]}
            >
              {accounts.map((acc, idx) => (
                <React.Fragment key={acc.id}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelectAccount(acc.id)}
                    style={styles.accountRow}
                  >
                    {/* Avatar with active ring */}
                    <View
                      style={[
                        styles.avatarRing,
                        {
                          borderColor: acc.isActive
                            ? colors.primary
                            : "transparent",
                          padding: acc.isActive ? 2 : 0,
                        },
                      ]}
                    >
                      <Image
                        source={{ uri: acc.avatar }}
                        style={[
                          styles.accountAvatar,
                          {
                            borderColor: acc.isActive
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      />
                    </View>

                    {/* Username & subtitle */}
                    <View style={styles.accountInfo}>
                      <Text
                        style={[
                          styles.accountUsername,
                          {
                            color: colors.textPrimary,
                            fontSize: moderateScale(15),
                          },
                        ]}
                      >
                        @{acc.username}
                      </Text>
                      {acc.isActive ? (
                        <View style={styles.statusRow}>
                          <View
                            style={[
                              styles.activeDot,
                              {
                                backgroundColor:
                                  colors.verifiedGreen || "#10B981",
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.accountSubtitle,
                              {
                                color: colors.textMuted,
                                fontSize: moderateScale(11.5),
                              },
                            ]}
                          >
                            Active now
                          </Text>
                        </View>
                      ) : acc.subtitle ? (
                        <View style={styles.statusRow}>
                          <View
                            style={[
                              styles.activeDot,
                              {
                                backgroundColor:
                                  colors.notificationRed || "#EF4444",
                              },
                            ]}
                          />
                          <Text
                            style={[
                              styles.accountSubtitle,
                              {
                                color: colors.textMuted,
                                fontSize: moderateScale(11.5),
                              },
                            ]}
                          >
                            {acc.subtitle}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Checkmark or Selection Circle */}
                    {acc.isActive ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={moderateScale(24)}
                        color={colors.primary}
                      />
                    ) : (
                      <Ionicons
                        name="ellipse-outline"
                        size={moderateScale(22)}
                        color={colors.textLight || colors.textMuted}
                      />
                    )}
                  </TouchableOpacity>

                  {/* Divider */}
                  <View
                    style={[
                      styles.rowDivider,
                      { backgroundColor: colors.borderLight || colors.border },
                    ]}
                  />
                </React.Fragment>
              ))}

              {/* Action: Add New Account */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {
                    // noop
                  }
                  setAccountModalVisible(false);
                  setTimeout(() => {
                    setAddAccountModalVisible(true);
                  }, 250);
                }}
                style={styles.addAccountRow}
              >
                <View
                  style={[
                    styles.plusIconWrap,
                    {
                      backgroundColor: isDark
                        ? "rgba(16, 155, 161, 0.18)"
                        : colors.primaryLight,
                    },
                  ]}
                >
                  <Feather
                    name="plus"
                    size={moderateScale(19)}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.addAccountText,
                    {
                      color: colors.textPrimary,
                      fontSize: moderateScale(14.5),
                    },
                  ]}
                >
                  Add New Account
                </Text>
                <Feather
                  name="chevron-right"
                  size={moderateScale(18)}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 2: Add Account Options Bottom Sheet */}
      <Modal
        visible={addAccountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddAccountModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setAddAccountModalVisible(false)}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.bottomSheetContainer,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.12)"
                  : "rgba(0, 0, 0, 0.06)",
                paddingBottom: Math.max(insets.bottom, 24),
              },
            ]}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandleWrapper}>
              <View
                style={[
                  styles.dragHandle,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.22)"
                      : "#CBD5E1",
                  },
                ]}
              />
            </View>

            {/* Header Icon & Title */}
            <View style={styles.addAccountHeaderBlock}>
              <View
                style={[
                  styles.addAccountIconCircle,
                  {
                    backgroundColor: isDark
                      ? "rgba(16, 155, 161, 0.18)"
                      : colors.primaryLight,
                  },
                ]}
              >
                <Feather
                  name="user-plus"
                  size={moderateScale(24)}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.addAccountModalTitle,
                  {
                    color: colors.textPrimary,
                    fontSize: moderateScale(17.5),
                  },
                ]}
              >
                Add Account
              </Text>
              <Text
                style={[
                  styles.addAccountModalSubtitle,
                  {
                    color: colors.textMuted,
                    fontSize: moderateScale(12.5),
                  },
                ]}
              >
                Log in to an existing profile or register a new account to
                switch workspaces seamlessly.
              </Text>
            </View>

            {/* Primary Button: Log in to existing account */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setAddAccountModalVisible(false);
                Alert.alert(
                  "Log in to Existing Account",
                  "Redirecting to secure login...",
                );
              }}
              style={[
                styles.loginPrimaryButton,
                { borderRadius: radii.pill || 28 },
              ]}
            >
              <LinearGradient
                colors={
                  isDark
                    ? [colors.primary, colors.primaryDark]
                    : [
                        colors.primary,
                        colors.primaryGradientEnd || colors.primaryDark,
                      ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.gradientButtonInner,
                  { borderRadius: radii.pill || 28 },
                ]}
              >
                <Feather
                  name="log-in"
                  size={moderateScale(17)}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.loginPrimaryButtonText,
                    { fontSize: moderateScale(14.5) },
                  ]}
                >
                  Log in to existing account
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Button: Create New Account */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setAddAccountModalVisible(false);
                Alert.alert(
                  "Create New Account",
                  "Redirecting to account registration...",
                );
              }}
              style={[
                styles.createSecondaryButton,
                {
                  backgroundColor: isDark
                    ? colors.backgroundSecondary
                    : "#FFFFFF",
                  borderColor: colors.border,
                  borderRadius: radii.pill || 28,
                },
              ]}
            >
              <Feather
                name="user-check"
                size={moderateScale(17)}
                color={colors.textPrimary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.createSecondaryButtonText,
                  {
                    color: colors.textPrimary,
                    fontSize: moderateScale(14.5),
                  },
                ]}
              >
                Create New Account
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

interface TabButtonProps {
  route: any;
  descriptor: any;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
  accent: string;
  barHeight: number;
}

function TabButton({
  route,
  descriptor,
  focused,
  onPress,
  onLongPress,
  onLayout,
  accent,
  barHeight,
}: TabButtonProps) {
  const { moderateScale, isDark } = useResponsiveTheme();
  const [scale] = useState(() => new Animated.Value(focused ? 1.05 : 0.94));

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.05 : 0.94,
      damping: 15,
      stiffness: 160,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  const options = descriptor.options;
  const iconColor = focused ? accent : isDark ? "#94A3B8" : "#64748B";
  const iconSize = moderateScale(23);
  const renderIcon = options.tabBarIcon;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={route.name === "profile" ? 1000 : 500}
      onLayout={onLayout}
      android_ripple={{
        color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
        borderless: true,
        radius: 34,
      }}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabButtonInner,
          { height: barHeight - 12, transform: [{ scale }] },
        ]}
      >
        {typeof renderIcon === "function"
          ? renderIcon({ focused, color: iconColor, size: iconSize })
          : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    zIndex: 100,
  },
  shadowWrap: {
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 14,
  },
  blur: {
    overflow: "hidden",
    borderWidth: 1,
  },
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  indicatorWrap: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 0,
  },
  indicator: {
    height: "100%",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabButtonInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  tabLabel: {
    letterSpacing: 0.1,
  },

  /* Modals Styling */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  dragHandleWrapper: {
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 4,
  },
  dragHandle: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    paddingTop: 4,
  },
  modalTitleText: {
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontWeight: "700",
  },
  accountsBox: {
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 6,
    overflow: "hidden",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarRing: {
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  accountAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
  },
  accountInfo: {
    flex: 1,
    marginLeft: 14,
  },
  accountUsername: {
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  accountSubtitle: {
    fontWeight: "500",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  addAccountRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  plusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addAccountText: {
    marginLeft: 14,
    flex: 1,
    fontWeight: "700",
  },

  /* Add Account Modal 2 */
  addAccountHeaderBlock: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },
  addAccountIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  addAccountModalTitle: {
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  addAccountModalSubtitle: {
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  loginPrimaryButton: {
    marginBottom: 12,
    overflow: "hidden",
  },
  gradientButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  loginPrimaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  createSecondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    paddingVertical: 13.5,
    marginBottom: 6,
  },
  createSecondaryButtonText: {
    fontWeight: "700",
  },
});

export default FloatingTabBar;
