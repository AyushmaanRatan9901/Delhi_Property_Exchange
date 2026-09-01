import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsiveTheme } from "../../constants/theme";
import { PropertyCard, PropertyItem } from "./PropertyCard";

export const SAMPLE_PROPERTIES: PropertyItem[] = [
  {
    id: "1",
    title: "Single Room",
    type: "Room",
    price: 9000,
    pricePeriod: "month",
    location: "Dwarka, Sector 6",
    amenities: ["Furnished", "WiFi", "Attached Bathroom"],
    imageUrl:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
    photosCount: 12,
    isVerified: true,
    isFavorite: false,
  },
  {
    id: "2",
    title: "Independent Room",
    type: "Room",
    price: 11000,
    pricePeriod: "month",
    location: "Dwarka, Sector 9",
    amenities: ["Furnished", "WiFi", "Attached Bathroom"],
    imageUrl:
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
    photosCount: 10,
    isVerified: true,
    isFavorite: false,
  },
  {
    id: "3",
    title: "PG for Boys",
    type: "PG",
    price: 7500,
    pricePeriod: "month",
    location: "Dwarka, Sector 12",
    amenities: ["WiFi", "Food", "Laundry", "CCTV"],
    imageUrl:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
    photosCount: 15,
    isVerified: true,
    isFavorite: false,
  },
  {
    id: "4",
    title: "PG for Girls",
    type: "PG",
    price: 8500,
    pricePeriod: "month",
    location: "Dwarka, Sector 10",
    amenities: ["3 Meals", "WiFi", "AC", "Security"],
    imageUrl:
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80",
    photosCount: 18,
    isVerified: true,
    isFavorite: false,
  },
];

interface PropertyListProps {
  properties?: PropertyItem[];
  onPropertyPress?: (item: PropertyItem) => void;
  onSeeAllPress?: () => void;
  onFilterChange?: (filter: "All" | "Room" | "PG") => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  properties = SAMPLE_PROPERTIES,
  onPropertyPress,
  onSeeAllPress,
  onFilterChange,
}) => {
  const { colors, moderateScale, typography, spacing, radii, layout, isDark } =
    useResponsiveTheme();
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Room" | "PG">(
    "All",
  );

  const handleFilterSelect = (filter: "All" | "Room" | "PG") => {
    setSelectedFilter(filter);
    onFilterChange?.(filter);
  };

  const filteredProperties = properties.filter((item) => {
    if (selectedFilter === "All") return true;
    return item.type.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      {/* Section Header Row */}
      <View
        style={[
          layout.horizontalViewBetween,
          {
            paddingHorizontal: spacing.screenHorizontal,
            marginBottom: spacing.md,
          },
        ]}
      >
        <Text
          style={[
            typography.sectionTitle,
            { fontSize: moderateScale(17), color: colors.textPrimary },
          ]}
        >
          Rooms & PGs Near You
        </Text>
        <TouchableOpacity
          onPress={onSeeAllPress}
          activeOpacity={0.7}
          style={layout.horizontalView}
        >
          <Text
            style={[
              typography.sectionSeeAll,
              {
                fontSize: moderateScale(13),
                color: colors.primary,
                marginRight: 2,
              },
            ]}
          >
            See All
          </Text>
          <Feather
            name="chevron-right"
            size={moderateScale(15)}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs Row (All / Room / PG) */}
      <View
        style={[
          layout.horizontalView,
          {
            paddingHorizontal: spacing.screenHorizontal,
            marginBottom: spacing.md,
            gap: spacing.sm,
          },
        ]}
      >
        {(["All", "Room", "PG"] as const).map((tab) => {
          const isActive = selectedFilter === tab;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => handleFilterSelect(tab)}
              activeOpacity={0.8}
              style={[
                styles.filterTab,
                {
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.xs + 2,
                  backgroundColor: isActive
                    ? colors.primary
                    : colors.cardBackground,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  typography.filterChipText,
                  {
                    fontSize: moderateScale(13),
                    color: isActive ? colors.white : colors.textSecondary,
                    fontWeight: isActive ? "700" : "500",
                  },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Horizontal Property Cards List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          gap: spacing.md,
        }}
      >
        {filteredProperties.map((item) => (
          <PropertyCard key={item.id} item={item} onPress={onPropertyPress} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  filterTab: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PropertyList;
