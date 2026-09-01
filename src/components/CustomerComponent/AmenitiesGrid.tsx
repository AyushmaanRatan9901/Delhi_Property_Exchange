import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

export interface AmenityFilterItem {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bgColor: string;
  darkBgColor: string;
}

const AMENITIES: AmenityFilterItem[] = [
  { id: 'wifi', name: 'High-Speed WiFi', icon: 'wifi', color: '#60A5FA', bgColor: '#EFF6FF', darkBgColor: '#172554' },
  { id: 'food', name: '3-Time Meals', icon: 'silverware-fork-knife', color: '#FB923C', bgColor: '#FFF7ED', darkBgColor: '#431407' },
  { id: 'cleaning', name: 'Daily Cleaning', icon: 'broom', color: '#34D399', bgColor: '#ECFDF5', darkBgColor: '#064E3B' },
  { id: 'ac', name: 'AC & Geyser', icon: 'air-conditioner', color: '#38BDF8', bgColor: '#F0F9FF', darkBgColor: '#082F49' },
  { id: 'power', name: '24/7 Power', icon: 'lightning-bolt', color: '#FBBF24', bgColor: '#FEF3C7', darkBgColor: '#451A03' },
  { id: 'laundry', name: 'Auto Laundry', icon: 'washing-machine', color: '#A78BFA', bgColor: '#F5F3FF', darkBgColor: '#2E1065' },
  { id: 'security', name: 'Biometric / CCTV', icon: 'shield-check', color: '#F87171', bgColor: '#FEF2F2', darkBgColor: '#450A0A' },
  { id: 'gym', name: 'Gym & Games', icon: 'dumbbell', color: '#FF385C', bgColor: '#FFF1F2', darkBgColor: '#2D141C' },
];

interface AmenitiesGridProps {
  onAmenityPress?: (amenity: AmenityFilterItem) => void;
}

export const AmenitiesGrid: React.FC<AmenitiesGridProps> = ({ onAmenityPress }) => {
  const { colors, moderateScale, spacing, radii, typography, shadows, isTablet, isDark } = useResponsiveTheme();

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
            Top Included Amenities
          </Text>
          <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
            All-inclusive stays with zero extra hassle
          </Text>
        </View>
      </View>

      {/* 4 Columns Grid */}
      <View
        style={[
          styles.grid,
          {
            paddingHorizontal: spacing.screenHorizontal,
            gap: spacing.xs + 3,
          },
        ]}
      >
        {AMENITIES.map((item) => {
          const iconBg = isDark ? item.darkBgColor : item.bgColor;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => onAmenityPress?.(item)}
              style={[
                styles.amenityCard,
                {
                  width: isTablet ? '11.5%' : '22.8%',
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.lg,
                  borderColor: colors.border,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.xs,
                },
                shadows.sm,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: iconBg,
                    width: moderateScale(42),
                    height: moderateScale(42),
                    borderRadius: radii.pill,
                    marginBottom: spacing.xs + 2,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={moderateScale(22)}
                  color={item.color}
                />
              </View>

              <Text
                numberOfLines={2}
                style={[
                  styles.amenityLabel,
                  {
                    fontSize: moderateScale(11),
                    color: colors.textPrimary,
                  },
                ]}
              >
                {item.name}
              </Text>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityLabel: {
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 14,
  },
});

export default AmenitiesGrid;
