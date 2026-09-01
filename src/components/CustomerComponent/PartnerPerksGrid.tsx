import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

const PERKS = [
  {
    brand: 'Zomato Gold',
    offer: '3 Months Free',
    desc: 'Free delivery on all food orders',
    icon: 'food-drumstick' as const,
    code: 'STAYZOMATO',
  },
  {
    brand: 'Cult.fit Pass',
    offer: '25% Flat Discount',
    desc: 'Access to 500+ premium gyms',
    icon: 'dumbbell' as const,
    code: 'STAYCULT25',
  },
  {
    brand: 'Zepto Groceries',
    offer: '₹150 Cashback',
    desc: '10-minute grocery delivery',
    icon: 'basket-outline' as const,
    code: 'STAYZEPTO',
  },
  {
    brand: 'Urban Company',
    offer: 'Free Room Cleaning',
    desc: 'Monthly deep sanitary service',
    icon: 'broom' as const,
    code: 'STAYCLEAN',
  },
];

export const PartnerPerksGrid: React.FC = () => {
  const { colors, moderateScale, spacing, radii, typography, shadows, isTablet, isDark } = useResponsiveTheme();

  const handleClaimPerk = (brand: string, code: string) => {
    Alert.alert(
      'Exclusive Tenant Perk 🎉',
      `Use coupon code "${code}" on the ${brand} app to claim your complimentary stay benefit.`
    );
  };

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      <View style={{ paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.md }}>
        <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
          Exclusive Tenant Perks & Benefits
        </Text>
        <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
          Worth ₹15,000+ complimentary with your stay
        </Text>
      </View>

      <View
        style={[
          styles.grid,
          {
            paddingHorizontal: spacing.screenHorizontal,
            gap: spacing.sm,
          },
        ]}
      >
        {PERKS.map((p, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.82}
            onPress={() => handleClaimPerk(p.brand, p.code)}
            style={[
              styles.perkCard,
              {
                width: isTablet ? '23.5%' : '48.2%',
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
              shadows.sm,
            ]}
          >
            {/* Primary Background Icon Box with White Icon */}
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: colors.primary,
                  width: moderateScale(38),
                  height: moderateScale(38),
                  borderRadius: radii.md,
                  marginBottom: spacing.xs + 2,
                },
              ]}
            >
              <MaterialCommunityIcons name={p.icon} size={moderateScale(20)} color={colors.white} />
            </View>

            <Text style={[typography.cardTitle, { fontSize: moderateScale(13), color: colors.textPrimary }]}>
              {p.brand}
            </Text>
            <Text style={{ fontSize: moderateScale(11.5), fontWeight: '700', color: colors.primary, marginTop: 1 }}>
              {p.offer}
            </Text>
            <Text
              numberOfLines={1}
              style={[typography.cardAmenity, { fontSize: moderateScale(10.5), color: colors.textSecondary, marginTop: 2 }]}
            >
              {p.desc}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  perkCard: {
    borderWidth: 1,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PartnerPerksGrid;
