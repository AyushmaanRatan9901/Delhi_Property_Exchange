import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

interface PopularLocationsProps {
  selectedLocation?: string;
  onSelectLocation?: (location: string) => void;
  onSeeAllPress?: () => void;
  locations?: string[];
}

const DEFAULT_LOCATIONS = [
  'Dwarka',
  'Sagarpur',
  'Janakpuri',
  'Rohini',
  'Uttam Nagar',
  'Laxmi Nagar',
  'Noida',
  'Gurgaon',
];

export const PopularLocations: React.FC<PopularLocationsProps> = ({
  selectedLocation = 'Dwarka',
  onSelectLocation,
  onSeeAllPress,
  locations = DEFAULT_LOCATIONS,
}) => {
  const { colors, moderateScale, typography, spacing, radii, layout, isDark } = useResponsiveTheme();

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      {/* Header Row */}
      <View
        style={[
          layout.horizontalViewBetween,
          { paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.sm },
        ]}
      >
        <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
          Popular Locations
        </Text>
        <TouchableOpacity
          onPress={onSeeAllPress}
          activeOpacity={0.7}
          style={layout.horizontalView}
        >
          <Text style={[typography.sectionSeeAll, { fontSize: moderateScale(13), color: colors.primary, marginRight: 2 }]}>
            See All
          </Text>
          <Feather name="chevron-right" size={moderateScale(15)} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Scrolling Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          gap: spacing.sm,
        }}
      >
        {locations.map((loc) => {
          const isSelected = selectedLocation.toLowerCase() === loc.toLowerCase();

          return (
            <TouchableOpacity
              key={loc}
              onPress={() => onSelectLocation?.(loc)}
              activeOpacity={0.8}
              style={[
                styles.chip,
                {
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 3,
                  backgroundColor: isSelected ? colors.primaryLight : colors.cardBackground,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name="location-outline"
                size={moderateScale(15)}
                color={isSelected ? colors.primary : colors.textSecondary}
                style={{ marginRight: spacing.xs }}
              />
              <Text
                style={[
                  typography.filterChipText,
                  {
                    fontSize: moderateScale(13),
                    color: isSelected ? colors.primary : colors.textPrimary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {loc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default PopularLocations;
