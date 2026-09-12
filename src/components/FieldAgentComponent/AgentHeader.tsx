import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AgentProfile } from "../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../constants/theme";

interface AgentHeaderProps {
  profile?: AgentProfile;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({
  profile,
  onNotificationPress,
  onProfilePress,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useResponsiveTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
          borderBottomColor: isDark ? colors.border : "#F1F5F9",
          paddingTop: Math.max(insets.top, 10) + 8,
        },
      ]}
    >
      {/* Company Brand & Logo Section */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onProfilePress}
        style={styles.brandSection}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.brandTitleText,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
              numberOfLines={1}
            >
              Delhi Property{" "}
              <Text style={styles.brandHighlightText}>Exchange</Text>
            </Text>
          </View>
          <View style={styles.subRow}>
            <View style={styles.badgePill}>
              <Ionicons name="shield-checkmark" size={10} color="#0D9488" />
              <Text style={styles.badgePillText}>Field Partner Portal</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Notification Bell Button */}
      <TouchableOpacity
        onPress={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {}
          if (onNotificationPress) {
            onNotificationPress();
          } else {
            router.push("/FiledAgentPanel/notifications" as any);
          }
        }}
        style={[
          styles.notifButton,
          {
            backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
            borderColor: isDark ? colors.border : "#E2E8F0",
          },
        ]}
        activeOpacity={0.75}
      >
        <Feather
          name="bell"
          size={19}
          color={isDark ? colors.textPrimary : "#0F172A"}
        />
        <View style={styles.notifDot} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  logoWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    borderWidth: 1.2,
    borderColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandTitleText: {
    fontSize: 16.5,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  brandHighlightText: {
    color: "#0D9488",
    fontWeight: "900",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    borderWidth: 0.8,
    borderColor: "#CCFBF1",
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0F766E",
    letterSpacing: 0.2,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  notifDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7.5,
    height: 7.5,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
