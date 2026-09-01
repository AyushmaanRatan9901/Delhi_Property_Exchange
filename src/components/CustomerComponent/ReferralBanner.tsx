import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

interface ReferralBannerProps {
  onReferPress?: () => void;
}

export const ReferralBanner: React.FC<ReferralBannerProps> = ({ onReferPress }) => {
  const { colors, moderateScale, spacing, radii, typography, shadows, layout } = useResponsiveTheme();

  return (
    <View style={[styles.container, { marginVertical: spacing.md, paddingHorizontal: spacing.screenHorizontal }]}>
      <LinearGradient
        colors={['#1E1B4B', '#312E81', '#4338CA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderRadius: radii.xxl,
            padding: spacing.lg,
          },
          shadows.md,
        ]}
      >
        <View style={layout.horizontalViewBetween}>
          {/* Left info */}
          <View style={{ flex: 1, marginRight: spacing.md }}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  alignSelf: 'flex-start',
                  marginBottom: spacing.xs,
                },
              ]}
            >
              <Text style={[styles.badgeText, { fontSize: moderateScale(10) }]}>
                🎁 REFERRAL REWARD
              </Text>
            </View>

            <Text style={[styles.title, { fontSize: moderateScale(17), lineHeight: moderateScale(22) }]}>
              Earn ₹2,000 Cash
            </Text>
            <Text style={[styles.subtitle, { fontSize: moderateScale(11.5), marginTop: 2 }]}>
              For every friend who moves into any StayFinder room or PG.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onReferPress}
              style={[
                styles.btn,
                {
                  backgroundColor: colors.white,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 3,
                  marginTop: spacing.md,
                  alignSelf: 'flex-start',
                },
              ]}
            >
              <Text style={[styles.btnText, { fontSize: moderateScale(12), color: '#312E81' }]}>
                Invite Friends Now
              </Text>
              <Feather name="arrow-right" size={moderateScale(14)} color="#312E81" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          {/* Right Icon */}
          <View
            style={[
              styles.iconWrapper,
              {
                width: moderateScale(68),
                height: moderateScale(68),
                borderRadius: radii.xl,
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
              },
            ]}
          >
            <MaterialCommunityIcons name="gift-open-outline" size={moderateScale(42)} color="#FCD34D" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    overflow: 'hidden',
  },
  badge: {},
  badgeText: {
    color: '#FDE047',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subtitle: {
    color: '#E0E7FF',
    lineHeight: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: '700',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ReferralBanner;
