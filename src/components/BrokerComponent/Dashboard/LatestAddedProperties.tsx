import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsiveTheme } from "../../../constants/theme";

export interface BrokerPropertyItem {
  id: string;
  title: string;
  imageUrl: string;
  propertyType: string;
  gender: "Boys" | "Girls" | "Unisex" | "Family";
  location: string;
  metroDistance: string;
  monthlyRent: number;
  expectedCommission: number;
  status: "Active" | "Under Review" | "Occupied";
  addedDate: string;
  viewsThisWeek: number;
  inquiriesCount: number;
  rating: number;
}

interface LatestAddedPropertiesProps {
  properties?: BrokerPropertyItem[];
  onViewAllPress?: () => void;
  onPropertyPress?: (item: BrokerPropertyItem) => void;
}

const DEFAULT_LATEST_PROPERTIES: BrokerPropertyItem[] = [
  {
    id: "prop-01",
    title: "Dwarka Sector 12 Luxury Girls PG",
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    propertyType: "Single & Double Sharing",
    gender: "Girls",
    location: "Dwarka Sector 12, Delhi",
    metroDistance: "200m from Metro",
    monthlyRent: 13500,
    expectedCommission: 6750,
    status: "Active",
    addedDate: "Added 3 hours ago",
    viewsThisWeek: 84,
    inquiriesCount: 9,
    rating: 4.8,
  },
  {
    id: "prop-02",
    title: "Janakpuri West Prime Boys Hostel",
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    propertyType: "Triple Sharing & Studio",
    gender: "Boys",
    location: "Janakpuri West, Delhi",
    metroDistance: "150m from Blue Line",
    monthlyRent: 9500,
    expectedCommission: 4750,
    status: "Active",
    addedDate: "Added Yesterday",
    viewsThisWeek: 122,
    inquiriesCount: 14,
    rating: 4.9,
  },
  {
    id: "prop-03",
    title: "Rohini Sector 15 Furnished 1BHK Flat",
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    propertyType: "1BHK Independent Floor",
    gender: "Family",
    location: "Rohini Sector 15, Delhi",
    metroDistance: "400m from Metro",
    monthlyRent: 18500,
    expectedCommission: 9250,
    status: "Under Review",
    addedDate: "Added 2 days ago",
    viewsThisWeek: 45,
    inquiriesCount: 4,
    rating: 4.7,
  },
  {
    id: "prop-04",
    title: "Uttam Nagar East Co-Living Studio",
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
    propertyType: "Private Studio Apartment",
    gender: "Unisex",
    location: "Uttam Nagar East, Delhi",
    metroDistance: "300m from Blue Line",
    monthlyRent: 12000,
    expectedCommission: 6000,
    status: "Occupied",
    addedDate: "Added 5 days ago",
    viewsThisWeek: 160,
    inquiriesCount: 18,
    rating: 4.9,
  },
];

export const LatestAddedProperties: React.FC<LatestAddedPropertiesProps> = ({
  properties = DEFAULT_LATEST_PROPERTIES,
  onViewAllPress,
  onPropertyPress,
}) => {
  const router = useRouter();
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } =
    useResponsiveTheme();

  const getStatusColor = (status: BrokerPropertyItem["status"]) => {
    switch (status) {
      case "Active":
        return {
          bg: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5",
          text: "#059669",
          dot: "#10B981",
        };
      case "Under Review":
        return {
          bg: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7",
          text: "#D97706",
          dot: "#F59E0B",
        };
      case "Occupied":
        return {
          bg: isDark ? "rgba(2, 132, 199, 0.15)" : "#F0F9FF",
          text: "#0284C7",
          dot: "#0284C7",
        };
      default:
        return {
          bg: isDark ? "rgba(100, 116, 139, 0.15)" : "#F1F5F9",
          text: "#64748B",
          dot: "#94A3B8",
        };
    }
  };

  return (
    <View style={{ marginTop: spacing.lg }}>
      {/* Header with Title & View All */}
      <View
        style={[
          layout.horizontalViewBetween,
          { paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.xs + 2 },
        ]}
      >
        <View>
          <View style={[layout.horizontalView, { alignItems: "center", gap: 5 }]}>
            <MaterialCommunityIcons
              name="home-plus-outline"
              size={moderateScale(19)}
              color={colors.primary}
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
              Meri Latest Added Property
            </Text>
          </View>
          <Text
            style={{
              fontSize: moderateScale(11),
              color: colors.textSecondary,
              marginTop: 1,
            }}
          >
            Recently registered stays & expected broker commission
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={
            onViewAllPress ||
            (() => {
              router.push("/BrokerPanel/(tabs)/property" as any);
            })
          }
          style={[layout.horizontalView, { alignItems: "center" }]}
        >
          <Text
            style={{
              fontSize: moderateScale(12),
              fontWeight: "700",
              color: colors.primary,
              marginRight: 2,
            }}
          >
            View All ({properties.length})
          </Text>
          <Feather
            name="chevron-right"
            size={moderateScale(14)}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          gap: spacing.md,
          paddingVertical: spacing.xs,
        }}
      >
        {properties.map((item) => {
          const statusStyle = getStatusColor(item.status);

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
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
                styles.propertyCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  borderRadius: radii.xxl,
                  width: moderateScale(270),
                },
                shadows.sm,
              ]}
            >
              {/* Image with Badges */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[
                    styles.propertyImage,
                    {
                      borderTopLeftRadius: radii.xxl,
                      borderTopRightRadius: radii.xxl,
                    },
                  ]}
                />

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: statusStyle.bg,
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusStyle.dot },
                    ]}
                  />
                  <Text
                    style={{
                      fontSize: moderateScale(10),
                      fontWeight: "800",
                      color: statusStyle.text,
                    }}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>

                {/* Time Tag on Bottom */}
                <View
                  style={[
                    styles.timeBadge,
                    {
                      backgroundColor: "rgba(15, 23, 42, 0.82)",
                      borderRadius: radii.pill,
                    },
                  ]}
                >
                  <Feather
                    name="clock"
                    size={moderateScale(10)}
                    color="#FFFFFF"
                    style={{ marginRight: 3 }}
                  />
                  <Text style={styles.timeBadgeText}>{item.addedDate}</Text>
                </View>
              </View>

              {/* Property Details */}
              <View style={{ padding: spacing.sm + 2 }}>
                {/* Gender & Type Row */}
                <View style={[layout.horizontalView, { gap: 6, marginBottom: 4 }]}>
                  <View
                    style={[
                      styles.pillTag,
                      {
                        backgroundColor:
                          item.gender === "Girls"
                            ? isDark
                              ? "rgba(244, 63, 94, 0.15)"
                              : "#FFE4E6"
                            : item.gender === "Boys"
                            ? isDark
                              ? "rgba(2, 132, 199, 0.15)"
                              : "#E0F2FE"
                            : isDark
                            ? "rgba(16, 185, 129, 0.15)"
                            : "#ECFDF5",
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(9.5),
                        fontWeight: "700",
                        color:
                          item.gender === "Girls"
                            ? "#E11D48"
                            : item.gender === "Boys"
                            ? "#0284C7"
                            : "#059669",
                      }}
                    >
                      {item.gender === "Girls"
                        ? "👧 Girls"
                        : item.gender === "Boys"
                        ? "👦 Boys"
                        : "👥 Unisex"}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(10.5),
                      fontWeight: "600",
                      color: colors.textMuted,
                      flex: 1,
                    }}
                  >
                    {item.propertyType}
                  </Text>
                </View>

                {/* Title */}
                <Text
                  numberOfLines={1}
                  style={[
                    typography.cardTitle,
                    {
                      fontSize: moderateScale(13.5),
                      fontWeight: "800",
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  {item.title}
                </Text>

                {/* Location */}
                <View style={[layout.horizontalView, { marginTop: 2 }]}>
                  <Ionicons
                    name="location-outline"
                    size={moderateScale(12)}
                    color={colors.textSecondary}
                    style={{ marginRight: 2 }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(11),
                      color: colors.textSecondary,
                    }}
                  >
                    {item.location} • {item.metroDistance}
                  </Text>
                </View>

                {/* Divider */}
                <View
                  style={[
                    styles.divider,
                    {
                      backgroundColor: colors.borderLight,
                      marginVertical: spacing.xs + 2,
                    },
                  ]}
                />

                {/* Pricing & Commission Grid */}
                <View style={layout.horizontalViewBetween}>
                  {/* Monthly Rent */}
                  <View>
                    <Text
                      style={{
                        fontSize: moderateScale(9.5),
                        color: colors.textMuted,
                        fontWeight: "600",
                      }}
                    >
                      Monthly Rent
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13.5),
                        fontWeight: "800",
                        color: colors.textPrimary,
                      }}
                    >
                      ₹{item.monthlyRent.toLocaleString("en-IN")}/mo
                    </Text>
                  </View>

                  {/* Broker Commission Card */}
                  <View
                    style={[
                      styles.commissionBadge,
                      {
                        backgroundColor: isDark
                          ? "rgba(16, 185, 129, 0.15)"
                          : "#DCFCE7",
                        borderColor: isDark
                          ? "rgba(16, 185, 129, 0.3)"
                          : "#86EFAC",
                        borderRadius: radii.md,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(8.5),
                        fontWeight: "700",
                        color: "#15803D",
                        textAlign: "right",
                      }}
                    >
                      YOUR COMMISSION
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13),
                        fontWeight: "900",
                        color: "#15803D",
                        textAlign: "right",
                      }}
                    >
                      ₹{item.expectedCommission.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                {/* Bottom Stats: Views & Inquiries */}
                <View
                  style={[
                    layout.horizontalViewBetween,
                    {
                      marginTop: spacing.xs + 2,
                      paddingTop: spacing.xs,
                      borderTopWidth: 1,
                      borderTopColor: colors.borderLight,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(10),
                      color: colors.textMuted,
                      fontWeight: "600",
                    }}
                  >
                    👁️ {item.viewsThisWeek} Views • 📩 {item.inquiriesCount} Leads
                  </Text>

                  <View style={[layout.horizontalView, { alignItems: "center" }]}>
                    <Ionicons
                      name="star"
                      size={moderateScale(10)}
                      color="#F59E0B"
                      style={{ marginRight: 2 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(10.5),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      {item.rating}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  propertyCard: {
    borderWidth: 1,
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
  },
  propertyImage: {
    width: "100%",
    height: 125,
    backgroundColor: "#334155",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  timeBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  timeBadgeText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "700",
  },
  pillTag: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  commissionBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
