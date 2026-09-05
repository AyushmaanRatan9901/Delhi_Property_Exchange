import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

const STEPS = [
  {
    step: '01',
    icon: 'compass-outline' as const,
    color: '#FF385C',
    bgColor: '#FFF1F2',
    darkBgColor: '#2D141C',
    title: 'Discover & Shortlist',
    desc: 'Browse 100% verified photos, amenities, and exact rent without brokers.',
  },
  {
    step: '02',
    icon: 'calendar-check-outline' as const,
    color: '#2563EB',
    bgColor: '#EFF6FF',
    darkBgColor: '#172554',
    title: 'Book Free Visit',
    desc: 'Schedule guided physical visits or instant 360° video walkthroughs.',
  },
  {
    step: '03',
    icon: 'shield-check-outline' as const,
    color: '#059669',
    bgColor: '#ECFDF5',
    darkBgColor: '#064E3B',
    title: 'Digital Agreement',
    desc: 'Sign hassle-free e-lease agreements with 100% transparent deposit guarantee.',
  },
  {
    step: '04',
    icon: 'key-outline' as const,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    darkBgColor: '#2E1065',
    title: 'Instant Move-in',
    desc: 'Collect keys, meet your housemates, and enjoy fully managed living.',
  },
];

export const HowItWorksSteps: React.FC = () => {
  const { colors, moderateScale, spacing, radii, typography, shadows, isDark, layout } = useResponsiveTheme();

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      <View
        style={[
          styles.cardWrapper,
          {
            marginHorizontal: spacing.screenHorizontal,
            backgroundColor: colors.cardBackground,
            borderRadius: radii.xxl,
            borderColor: colors.border,
            padding: spacing.lg,
          },
          shadows.sm,
        ]}
      >
        <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary, textAlign: 'center' }]}>
          How Delhi Property Exchange Works
        </Text>
        <Text
          style={[
            typography.categorySubtitle,
            { fontSize: moderateScale(12), color: colors.textSecondary, textAlign: 'center', marginTop: 2, marginBottom: spacing.lg },
          ]}
        >
          Moving into your dream stay is simple as 1-2-3-4
        </Text>

        <View style={{ gap: spacing.md }}>
          {STEPS.map((s, idx) => {
            const iconBg = isDark ? s.darkBgColor : s.bgColor;

            return (
              <View key={idx} style={[layout.horizontalView, styles.stepRow]}>
                {/* Step Icon */}
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: iconBg,
                      width: moderateScale(46),
                      height: moderateScale(46),
                      borderRadius: radii.xl,
                      marginRight: spacing.md,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name={s.icon} size={moderateScale(24)} color={s.color} />
                  <View
                    style={[
                      styles.stepBadge,
                      {
                        backgroundColor: s.color,
                        borderRadius: radii.pill,
                      },
                    ]}
                  >
                    <Text style={styles.stepBadgeText}>{s.step}</Text>
                  </View>
                </View>

                {/* Step Info */}
                <View style={{ flex: 1 }}>
                  <Text style={[typography.cardTitle, { fontSize: moderateScale(14), color: colors.textPrimary }]}>
                    {s.title}
                  </Text>
                  <Text
                    style={[
                      typography.cardAmenity,
                      { fontSize: moderateScale(11.5), color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
                    ]}
                  >
                    {s.desc}
                  </Text>
                </View>
              </View>
            );
          })}
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
  stepRow: {
    alignItems: 'flex-start',
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stepBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default HowItWorksSteps;
