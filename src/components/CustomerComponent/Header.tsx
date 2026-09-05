import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useResponsiveTheme } from "../../constants/theme";

interface HeaderProps {
  onMenuPress?: () => void;
  onNotificationPress?: (origin?: { x: number; y: number }) => void;
  onProfilePress?: () => void;
  unreadNotifications?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onNotificationPress,

  unreadNotifications = 3,
}) => {
  const bellRef = React.useRef<View>(null);
  const {
    colors,
    moderateScale,
    typography,
    spacing,
    layout,
    isDark,
    toggleTheme,
    themeMode,
  } = useResponsiveTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.xs,
          paddingBottom: spacing.sm,
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      {/* Left: Menu & Brand */}
      <View style={layout.horizontalView}>
        <TouchableOpacity
          onPress={onMenuPress}
          activeOpacity={0.7}
          style={[styles.menuButton, { marginRight: spacing.md }]}
        >
          <Feather
            name="menu"
            size={moderateScale(24)}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        <View>
          <View style={[layout.horizontalView, { alignItems: "center" }]}>
            <Text
              style={[
                typography.brandTitle,
                {
                  fontSize: moderateScale(17),
                  fontWeight: "800",
                  color: colors.textPrimary,
                },
              ]}
            >
              Delhi Property{" "}
            </Text>
            <Text
              style={[
                typography.brandHighlight,
                {
                  fontSize: moderateScale(17),
                  fontWeight: "800",
                  color: colors.primary,
                },
              ]}
            >
              Exchange
            </Text>
          </View>
          <Text
            style={[
              typography.brandTagline,
              { fontSize: moderateScale(10.5), color: colors.textSecondary },
            ]}
          >
            Verified Housing & Zero Brokerage
          </Text>
        </View>
      </View>

      {/* Right: Theme Toggle (Hidden on System Mode), Notifications & Profile Avatar */}
      <View style={layout.horizontalView}>
        {/* Dark/Light Mode Switcher - only shown when theme is not locked to system default */}
        {themeMode !== "system" && (
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.7}
            style={[
              styles.iconButton,
              {
                backgroundColor: isDark
                  ? colors.surfaceHover
                  : colors.surfaceLight,
                borderRadius: moderateScale(18),
                width: moderateScale(36),
                height: moderateScale(36),
                marginRight: spacing.sm,
              },
            ]}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={moderateScale(19)}
              color={isDark ? "#FBBF24" : "#64748B"}
            />
          </TouchableOpacity>
        )}

        {/* Notification Bell */}
        <TouchableOpacity
          ref={bellRef}
          onPress={() => {
            if (bellRef.current) {
              bellRef.current.measureInWindow((x, y, width, height) => {
                onNotificationPress?.({
                  x: x + width / 2,
                  y: y + height / 2,
                });
              });
            } else {
              onNotificationPress?.();
            }
          }}
          activeOpacity={0.7}
          style={[styles.iconButton, { marginRight: spacing.sm }]}
        >
          <Ionicons
            name="notifications-outline"
            size={moderateScale(24)}
            color={colors.textPrimary}
          />
          {unreadNotifications > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.notificationRed },
              ]}
            >
              <Text style={styles.badgeText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* User Profile Avatar */}
        <TouchableOpacity
          onPress={() =>
            router.push("/CusomterPanelScreens/EditProfile/Editprofile")
          }
          activeOpacity={0.8}
          style={styles.avatarContainer}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            }}
            style={[
              styles.avatar,
              {
                width: moderateScale(36),
                height: moderateScale(36),
                borderRadius: moderateScale(18),
                borderColor: isDark ? colors.border : colors.primarySoft,
              },
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    padding: 4,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  avatarContainer: {
    padding: 1,
  },
  avatar: {
    borderWidth: 2,
    backgroundColor: "#E2E8F0",
  },
});
