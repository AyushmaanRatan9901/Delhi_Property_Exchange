import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsiveTheme } from "../../../constants/theme";

export interface TopCommissionItem {
  id: string;
  rank: number;
  title: string;
  location: string;
  imageUrl: string;
  propertyType: string;
  totalCommissionEarned: number;
  totalDealsClosed: number;
  monthlyRent: number;
  occupancyPercent: number;
  rating: number;
}

interface TopCommissionPropertiesProps {
  topProperties?: TopCommissionItem[];
  onPropertyPress?: (item: TopCommissionItem) => void;
}

const DEFAULT_TOP_PROPERTIES: TopCommissionItem[] = [
  {
    id: "prop-01",
    rank: 1,
    title: "Dwarka Sector 12 Luxury Girls PG",
    location: "Dwarka Sector 12, Delhi",
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    propertyType: "Co-Living & Single Bed",
    totalCommissionEarned: 58000,
    totalDealsClosed: 8,
    monthlyRent: 14500,
    occupancyPercent: 95,
    rating: 4.9,
  },
  {
    id: "prop-02",
    rank: 2,
    title: "Janakpuri West Prime Boys Hostel",
    location: "Janakpuri District Centre, Delhi",
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    propertyType: "Double Sharing & Studio",
    totalCommissionEarned: 47250,
    totalDealsClosed: 9,
    monthlyRent: 10500,
    occupancyPercent: 90,
    rating: 4.9,
  },
  {
    id: "prop-07",
    rank: 3,
    title: "Dwarka Mor Metro Stanza Co-Living",
    location: "Dwarka Mor, West Delhi",
    imageUrl:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
    propertyType: "Co-Living Studio & Double",
    totalCommissionEarned: 42000,
    totalDealsClosed: 6,
    monthlyRent: 14000,
    occupancyPercent: 88,
    rating: 4.8,
  },
  {
    id: "prop-05",
    rank: 4,
    title: "Dwarka Sector 7 Luxury 2BHK Floor",
    location: "Dwarka Sector 7, Delhi",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    propertyType: "Full 2BHK Furnished Apartment",
    totalCommissionEarned: 39000,
    totalDealsClosed: 3,
    monthlyRent: 26000,
    occupancyPercent: 100,
    rating: 4.9,
  },
];

export const TopCommissionProperties: React.FC<
  TopCommissionPropertiesProps
> = ({
  topProperties = DEFAULT_TOP_PROPERTIES,
  onPropertyPress,
}) => {
  const router = useRouter();
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } =
    useResponsiveTheme();

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: "trophy",
          label: "#1 TOP EARNER",
          bg: "#FEF3C7",
          border: "#FDE68A",
          text: "#B45309",
          iconColor: "#D97706",
        };
      case 2:
        return {
          icon: "medal",
          label: "#2 HIGH YIELD",
          bg: "#F1F5F9",
          border: "#CBD5E1",
          text: "#334155",
          iconColor: "#64748B",
        };
      case 3:
        return {
          icon: "award",
          label: "#3 POPULAR",
          bg: "#FFEDD5",
          border: "#FED7AA",
          text: "#C2410C",
          iconColor: "#EA580C",
        };
      default:
        return {
          icon: "star",
          label: `#${rank} EARNER`,
          bg: isDark ? colors.surfaceHover : "#F8FAFC",
          border: colors.borderLight,
          text: colors.textSecondary,
          iconColor: colors.primary,
        };
    }
  };

  return (
    <View
      style={[
        styles.sectionWrapper,
        {
          paddingHorizontal: spacing.screenHorizontal,
          marginTop: spacing.lg,
        },
      ]}
    >
      {/* Title */}
      <View style={[layout.horizontalViewBetween, { marginBottom: spacing.xs + 2 }]}>
        <View>
          <View style={[layout.horizontalView, { alignItems: "center", gap: 5 }]}>
            <MaterialCommunityIcons
              name="crown-outline"
              size={moderateScale(20)}
              color="#D97706"
            />
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(15),
                  fontWeight: "800",
                  color: colors.textPrimary,
                },
              ]}
            >
              Top Property by Commission
            </Text>
          </View>
          <Text
            style={{
              fontSize: moderateScale(11),
              color: colors.textSecondary,
              marginTop: 1,
            }}
          >
            Highest yielding properties registered in your portfolio
          </Text>
        </View>

        <View
          style={[
            styles.goldBadge,
            {
              backgroundColor: isDark
                ? "rgba(245, 158, 11, 0.15)"
                : "#FEF3C7",
              borderColor: isDark
                ? "rgba(245, 158, 11, 0.3)"
                : "#FDE68A",
              borderRadius: radii.pill,
            },
          ]}
        >
          <Text
            style={{
              fontSize: moderateScale(10.5),
              fontWeight: "800",
              color: "#D97706",
            }}
          >
            🏆 Leaderboard
          </Text>
        </View>
      </View>

      {/* Ranked Property Cards */}
      <View style={{ gap: spacing.sm }}>
        {topProperties.map((item) => {
          const rankMeta = getRankBadge(item.rank);

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => {
                if (onPropertyPress) {
                  onPropertyPress(item);
                } else {
                  router.push({
                    pathname: "/Screens/BrokerPanelScreens/PropertyDetailScreen",
                    params: { id: item.id },
                  } as any);
                }
              }}
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: item.rank === 1 ? colors.primary : colors.border,
                  borderRadius: radii.xl,
                  padding: spacing.md,
                },
                shadows.sm,
              ]}
            >
              <View style={[layout.horizontalView, { alignItems: "center" }]}>
                {/* Thumbnail Image */}
                <View style={styles.imageBox}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={[
                      styles.thumbnail,
                      { borderRadius: radii.lg },
                    ]}
                  />
                  {/* Floating Rank Circle */}
                  <View
                    style={[
                      styles.rankCircle,
                      {
                        backgroundColor:
                          item.rank === 1
                            ? "#D97706"
                            : item.rank === 2
                            ? "#64748B"
                            : item.rank === 3
                            ? "#EA580C"
                            : colors.primary,
                      },
                    ]}
                  >
                    <Text style={styles.rankCircleText}>#{item.rank}</Text>
                  </View>
                </View>

                {/* Main Info */}
                <View style={{ flex: 1, marginLeft: spacing.sm + 2 }}>
                  <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
                    <View
                      style={[
                        styles.rankTag,
                        {
                          backgroundColor: rankMeta.bg,
                          borderColor: rankMeta.border,
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(9),
                          fontWeight: "800",
                          color: rankMeta.text,
                        }}
                      >
                        {rankMeta.label}
                      </Text>
                    </View>

                    <View style={[layout.horizontalView, { alignItems: "center" }]}>
                      <Ionicons
                        name="star"
                        size={moderateScale(11)}
                        color="#F59E0B"
                        style={{ marginRight: 2 }}
                      />
                      <Text
                        style={{
                          fontSize: moderateScale(11),
                          fontWeight: "700",
                          color: colors.textPrimary,
                        }}
                      >
                        {item.rating}
                      </Text>
                    </View>
                  </View>

                  {/* Title */}
                  <Text
                    numberOfLines={1}
                    style={[
                      typography.cardTitle,
                      {
                        fontSize: moderateScale(13),
                        fontWeight: "800",
                        color: colors.textPrimary,
                        marginTop: 3,
                      },
                    ]}
                  >
                    {item.title}
                  </Text>

                  {/* Location & Occupancy */}
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(10.5),
                      color: colors.textMuted,
                      marginTop: 1,
                      fontWeight: "500",
                    }}
                  >
                    📍 {item.location} • {item.occupancyPercent}% Occupied
                  </Text>

                  {/* Total Commission Earned Banner */}
                  <View
                    style={[
                      layout.horizontalViewBetween,
                      styles.commissionStrip,
                      {
                        backgroundColor: isDark
                          ? "rgba(16, 185, 129, 0.12)"
                          : "#ECFDF5",
                        borderColor: isDark
                          ? "rgba(16, 185, 129, 0.25)"
                          : "#A7F3D0",
                        borderRadius: radii.md,
                        marginTop: spacing.xs + 2,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 3,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(10.5),
                        color: "#065F46",
                        fontWeight: "700",
                      }}
                    >
                      Total Commission:
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(12.5),
                        fontWeight: "900",
                        color: "#059669",
                      }}
                    >
                      ₹{item.totalCommissionEarned.toLocaleString("en-IN")}{" "}
                      <Text
                        style={{
                          fontSize: moderateScale(9.5),
                          fontWeight: "600",
                          color: colors.textMuted,
                        }}
                      >
                        ({item.totalDealsClosed} Deals)
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionWrapper: {},
  goldBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  card: {
    borderWidth: 1,
  },
  imageBox: {
    position: "relative",
  },
  thumbnail: {
    width: 72,
    height: 72,
    backgroundColor: "#334155",
  },
  rankCircle: {
    position: "absolute",
    top: -5,
    left: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  rankCircleText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "900",
  },
  rankTag: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  commissionStrip: {
    borderWidth: 1,
    alignItems: "center",
  },
});
