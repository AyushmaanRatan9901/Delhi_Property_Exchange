import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveTheme } from "../../constants/theme";

interface CRMStatCardProps {
  title: string;
  value: number | string;
  icon: any;
  iconFamily?: "feather" | "ionicons" | "materialCommunity";
  gradientColors: [string, string];
  subtitle?: string;
  onPress?: () => void;
  badgeText?: string;
  badgeColor?: string;
}

export const CRMStatCard: React.FC<CRMStatCardProps> = ({
  title,
  value,
  icon,
  iconFamily = "feather",
  gradientColors,
  subtitle,
  onPress,
  badgeText,
  badgeColor = "#10B981",
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const renderIcon = () => {
    const size = 18;
    const color = "#FFFFFF";
    if (iconFamily === "ionicons") return <Ionicons name={icon} size={size} color={color} />;
    if (iconFamily === "materialCommunity") return <MaterialCommunityIcons name={icon} size={size} color={color} />;
    return <Feather name={icon} size={size} color={color} />;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
          borderColor: isDark ? colors.border : "#E2E8F0",
        },
      ]}
    >
      <View style={styles.headerRow}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          {renderIcon()}
        </LinearGradient>

        {badgeText ? (
          <View style={[styles.badge, { backgroundColor: badgeColor + "20" }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.value, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </Text>

      <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flex: 1,
    minWidth: 140,
    marginHorizontal: 4,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "400",
    marginTop: 2,
  },
});
