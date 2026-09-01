import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

export interface OfferItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  code: string;
  lightGradient: readonly [string, string];
  darkGradient: readonly [string, string];
  lightBorder?: string;
  darkBorder?: string;
  accentColor: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const OFFERS: OfferItem[] = [
  {
    id: '1',
    badge: '100% OFF BROKERAGE',
    title: 'Zero Brokerage Deal',
    subtitle: 'Direct owner listings with zero hidden fee',
    code: 'NOBROKER',
    lightGradient: ['#0d9488', '#0f766e'],
    darkGradient: ['#132a2f', '#0d1b2a'],
    lightBorder: '#99f6e4',
    darkBorder: '#115e59',
    accentColor: '#14b8a6',
    icon: 'shield-star',
  },
  {
    id: '2',
    badge: 'STUDENT DISCOUNT',
    title: 'Flat 25% Off 1st Month',
    subtitle: 'Show valid Student ID & get instant off',
    code: 'STUDENT25',
    lightGradient: ['#0284c7', '#0369a1'],
    darkGradient: ['#0f2238', '#0d1b2a'],
    lightBorder: '#bae6fd',
    darkBorder: '#1e4d6d',
    accentColor: '#38bdf8',
    icon: 'school',
  },
  {
    id: '3',
    badge: 'MOVE-IN GIFT',
    title: '₹2,000 Voucher Bonus',
    subtitle: 'On booking room for 3+ months stay',
    code: 'REWARD2000',
    lightGradient: ['#059669', '#047857'],
    darkGradient: ['#0e2a22', '#0d1b2a'],
    lightBorder: '#a7f3d0',
    darkBorder: '#065f46',
    accentColor: '#34d399',
    icon: 'gift-outline',
  },
  {
    id: '4',
    badge: 'EARLY BIRD DEAL',
    title: 'Free WiFi + Laundry',
    subtitle: 'Complimentary high-speed internet & wash',
    code: 'FREEWIFI',
    lightGradient: ['#d97706', '#b45309'],
    darkGradient: ['#2a1f10', '#0d1b2a'],
    lightBorder: '#fde68a',
    darkBorder: '#78350f',
    accentColor: '#fbbf24',
    icon: 'wifi-star',
  },
];

interface SpecialOffersSliderProps {
  onOfferPress?: (offer: OfferItem) => void;
}

export const SpecialOffersSlider: React.FC<SpecialOffersSliderProps> = ({ onOfferPress }) => {
  const { colors, moderateScale, spacing, radii, typography, wp, shadows, isDark } = useResponsiveTheme();
  const cardWidth = Math.min(wp(78), 310);

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      {/* Header */}
      <View
        style={[
          styles.headerRow,
          { paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.sm },
        ]}
      >
        <View style={styles.titleWithBadge}>
          <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
            Exclusive Deals & Offers
          </Text>
          <View
            style={[
              styles.hotBadge,
              {
                backgroundColor: isDark ? 'rgba(234, 67, 53, 0.18)' : '#fef2f2',
                borderColor: isDark ? '#5c2424' : '#fca5a5',
                borderRadius: radii.pill,
                paddingHorizontal: spacing.xs + 3,
                paddingVertical: 2,
                marginLeft: spacing.xs,
              },
            ]}
          >
            <Text style={[styles.hotText, { fontSize: moderateScale(10), color: colors.locationPinRed }]}>
              HOT 🔥
            </Text>
          </View>
        </View>
      </View>

      {/* Slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          gap: spacing.md,
        }}
      >
        {OFFERS.map((offer) => {
          const gradientColors = isDark ? offer.darkGradient : offer.lightGradient;
          const borderColor = isDark ? offer.darkBorder : offer.lightBorder;

          return (
            <TouchableOpacity
              key={offer.id}
              activeOpacity={0.88}
              onPress={() => onOfferPress?.(offer)}
              style={[
                styles.cardWrapper,
                {
                  width: cardWidth,
                  borderRadius: radii.xl,
                  borderColor: borderColor,
                  borderWidth: isDark ? 1.2 : 0,
                },
                shadows.md,
              ]}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.gradientCard,
                  {
                    borderRadius: radii.xl,
                    padding: spacing.md + 2,
                  },
                ]}
              >
                {/* Badge & Icon */}
                <View style={styles.topRow}>
                  <View
                    style={[
                      styles.offerBadge,
                      {
                        backgroundColor: isDark ? `${offer.accentColor}25` : 'rgba(255, 255, 255, 0.25)',
                        borderColor: isDark ? offer.accentColor : 'transparent',
                        borderWidth: isDark ? 1 : 0,
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 3,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.offerBadgeText,
                        {
                          fontSize: moderateScale(10),
                          color: isDark ? offer.accentColor : colors.white,
                        },
                      ]}
                    >
                      {offer.badge}
                    </Text>
                  </View>

                  <MaterialCommunityIcons
                    name={offer.icon}
                    size={moderateScale(24)}
                    color={isDark ? offer.accentColor : 'rgba(255, 255, 255, 0.95)'}
                  />
                </View>

                {/* Title & Subtitle */}
                <Text
                  style={[
                    styles.offerTitle,
                    {
                      fontSize: moderateScale(16),
                      marginTop: spacing.sm,
                      color: colors.white,
                    },
                  ]}
                >
                  {offer.title}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.offerSubtitle,
                    {
                      fontSize: moderateScale(11),
                      marginTop: 2,
                      color: isDark ? '#94A3B8' : 'rgba(255, 255, 255, 0.92)',
                    },
                  ]}
                >
                  {offer.subtitle}
                </Text>

                {/* Code Box & Apply Button */}
                <View
                  style={[
                    styles.codeRow,
                    {
                      marginTop: spacing.md,
                      borderRadius: radii.md,
                      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.18)',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      borderWidth: isDark ? 0.8 : 0,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs,
                    },
                  ]}
                >
                  <Text style={[styles.codeText, { fontSize: moderateScale(11), color: isDark ? '#E2E8F0' : 'rgba(255, 255, 255, 0.92)' }]}>
                    Code: <Text style={[styles.codeBold, { color: isDark ? offer.accentColor : colors.white }]}>{offer.code}</Text>
                  </Text>
                  <View
                    style={[
                      styles.applyPill,
                      {
                        backgroundColor: isDark ? offer.accentColor : colors.white,
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 2,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.applyText,
                        {
                          fontSize: moderateScale(11),
                          color: isDark ? '#06111E' : offer.lightGradient[0],
                          fontWeight: '800',
                        },
                      ]}
                    >
                      Apply
                    </Text>
                  </View>
                </View>
              </LinearGradient>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotBadge: {
    borderWidth: 1,
  },
  hotText: {
    fontWeight: '800',
  },
  cardWrapper: {
    overflow: 'hidden',
  },
  gradientCard: {
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offerBadge: {},
  offerBadgeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  offerTitle: {
    fontWeight: '800',
  },
  offerSubtitle: {
    fontWeight: '500',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {},
  codeBold: {
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  applyPill: {},
  applyText: {},
});

export default SpecialOffersSlider;
