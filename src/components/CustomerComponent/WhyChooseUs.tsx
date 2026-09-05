import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

const PILLARS = [
  {
    icon: 'shield-check-outline' as const,
    color: '#34D399',
    bgColor: '#ECFDF5',
    darkBgColor: '#064E3B',
    title: '100% Verified Listings',
    desc: 'Physically inspected rooms with verified owners',
  },
  {
    icon: 'cash-check' as const,
    color: '#FF385C',
    bgColor: '#FFF1F2',
    darkBgColor: '#2D141C',
    title: 'Zero Brokerage',
    desc: 'No hidden commission or surprise charges',
  },
  {
    icon: 'clock-fast' as const,
    color: '#A78BFA',
    bgColor: '#F5F3FF',
    darkBgColor: '#2E1065',
    title: '48hr Deposit Refund',
    desc: 'Safe & transparent security refund process',
  },
  {
    icon: 'headset' as const,
    color: '#60A5FA',
    bgColor: '#EFF6FF',
    darkBgColor: '#172554',
    title: '24/7 On-Ground Help',
    desc: 'Dedicated caretakers & round-the-clock support',
  },
];

export const WhyChooseUs: React.FC = () => {
  const { colors, moderateScale, spacing, radii, typography, shadows, isTablet, isDark } = useResponsiveTheme();

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      <View
        style={[
          styles.cardWrapper,
          {
            marginHorizontal: spacing.screenHorizontal,
            borderRadius: radii.xxl,
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            padding: spacing.lg,
          },
          shadows.sm,
        ]}
      >
        <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary, textAlign: 'center' }]}>
          Why 50,000+ Choose Delhi Property Exchange
        </Text>
        <Text
          style={[
            typography.categorySubtitle,
            { fontSize: moderateScale(12), color: colors.textSecondary, textAlign: 'center', marginTop: 3, marginBottom: spacing.lg },
          ]}
        >
          Your peace of mind is our utmost priority
        </Text>

        {/* 2-Column Grid */}
        <View style={[styles.grid, { gap: spacing.md }]}>
          {PILLARS.map((p, idx) => (
            <View
              key={idx}
              style={[
                styles.pillarItem,
                {
                  width: isTablet ? '23%' : '47%',
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDark ? p.darkBgColor : p.bgColor,
                    width: moderateScale(44),
                    height: moderateScale(44),
                    borderRadius: radii.lg,
                    marginBottom: spacing.xs + 2,
                  },
                ]}
              >
                <MaterialCommunityIcons name={p.icon} size={moderateScale(24)} color={p.color} />
              </View>

              <Text style={[typography.cardTitle, { fontSize: moderateScale(13), color: colors.textPrimary, textAlign: 'center' }]}>
                {p.title}
              </Text>
              <Text
                style={[
                  typography.cardAmenity,
                  { fontSize: moderateScale(10.5), textAlign: 'center', marginTop: 2, color: colors.textSecondary },
                ]}
              >
                {p.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cardWrapper: {
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pillarItem: {
    alignItems: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default WhyChooseUs;
