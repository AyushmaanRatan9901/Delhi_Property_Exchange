import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

export interface OccupancyItem {
  id: string;
  title: string;
  subtitle: string;
  startingPrice: number;
  badge?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const OCCUPANCY_TYPES: OccupancyItem[] = [
  {
    id: 'single',
    title: 'Single Private Room',
    subtitle: '100% Privacy & Attached Bath',
    startingPrice: 8500,
    badge: 'Popular',
    icon: 'bed-empty',
  },
  {
    id: 'double',
    title: 'Double Sharing',
    subtitle: 'Share with a roommate',
    startingPrice: 5500,
    badge: 'Best Value',
    icon: 'account-multiple-outline',
  },
  {
    id: 'triple',
    title: 'Triple Sharing',
    subtitle: 'Affordable student stay',
    startingPrice: 4200,
    badge: 'Budget',
    icon: 'account-group-outline',
  },
  {
    id: 'studio',
    title: 'Studio Apartment',
    subtitle: 'Furnished with kitchen',
    startingPrice: 14000,
    badge: 'Premium',
    icon: 'home-city-outline',
  },
  {
    id: '1bhk',
    title: '1 BHK Independent',
    subtitle: 'Living room + Bedroom',
    startingPrice: 16000,
    icon: 'door-open',
  },
  {
    id: '2bhk',
    title: '2 BHK Family/Coliving',
    subtitle: 'Spacious for 3-4 friends',
    startingPrice: 22000,
    icon: 'home-group',
  },
];

interface OccupancyTypesProps {
  onSelect?: (item: OccupancyItem) => void;
}

export const OccupancyTypes: React.FC<OccupancyTypesProps> = ({ onSelect }) => {
  const { colors, moderateScale, spacing, radii, typography, shadows, isTablet } = useResponsiveTheme();

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      {/* Header */}
      <View
        style={[
          styles.headerRow,
          { paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.md },
        ]}
      >
        <View>
          <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
            Explore by Sharing & Type
          </Text>
          <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
            Choose room style matching your budget & privacy
          </Text>
        </View>
      </View>

      {/* Grid */}
      <View
        style={[
          styles.gridContainer,
          {
            paddingHorizontal: spacing.screenHorizontal,
            gap: spacing.sm,
          },
        ]}
      >
        {OCCUPANCY_TYPES.map((item) => {
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => onSelect?.(item)}
              style={[
                styles.gridCard,
                {
                  width: isTablet ? '31.5%' : '48.2%',
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.lg,
                  borderColor: colors.border,
                  padding: spacing.md,
                },
                shadows.sm,
              ]}
            >
              {/* Top row with Primary background icon and white icon */}
              <View style={styles.topRow}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: colors.primary,
                      width: moderateScale(38),
                      height: moderateScale(38),
                      borderRadius: radii.md,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={moderateScale(22)}
                    color={colors.white}
                  />
                </View>

                {item.badge && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: colors.primaryLight,
                        borderColor: colors.primarySoft,
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.xs + 3,
                        paddingVertical: 2,
                      },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: colors.primary, fontSize: moderateScale(9.5) }]}>
                      {item.badge}
                    </Text>
                  </View>
                )}
              </View>

              {/* Title & Subtitle */}
              <Text
                numberOfLines={1}
                style={[
                  typography.cardTitle,
                  { fontSize: moderateScale(13.5), color: colors.textPrimary, marginTop: spacing.sm },
                ]}
              >
                {item.title}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  typography.cardAmenity,
                  { fontSize: moderateScale(11), color: colors.textSecondary, marginTop: 2 },
                ]}
              >
                {item.subtitle}
              </Text>

              {/* Starting Price */}
              <View style={[styles.priceRow, { marginTop: spacing.sm }]}>
                <Text style={[styles.fromText, { fontSize: moderateScale(10), color: colors.textMuted }]}>
                  Starts at
                </Text>
                <Text style={[styles.priceText, { fontSize: moderateScale(13), color: colors.priceGreen }]}>
                  {' '}₹{new Intl.NumberFormat('en-IN').format(item.startingPrice)}/mo
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderWidth: 0.8,
  },
  badgeText: {
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  fromText: {
    fontWeight: '500',
  },
  priceText: {
    fontWeight: '700',
  },
});

export default OccupancyTypes;
