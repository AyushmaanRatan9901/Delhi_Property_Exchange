import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

interface HeroBannerProps {
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSearchPress,
  onFilterPress,
  searchQuery = '',
  onSearchChange,
}) => {
  const { colors, moderateScale, typography, spacing, radii, shadows, layout, isDark } = useResponsiveTheme();

  return (
    <View style={[styles.outerContainer, { paddingHorizontal: spacing.screenHorizontal, marginVertical: spacing.sm }]}>
      <View
        style={[
          styles.cardContainer,
          {
            borderRadius: radii.hero,
            borderColor: colors.border,
            backgroundColor: colors.cardBackground,
          },
          shadows.hero,
        ]}
      >
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.imageBackground}
          imageStyle={{ borderRadius: radii.hero }}
        >
          {/* Subtle dark tint overlay only for image contrast readability */}
          <View style={[styles.overlayShade, { borderRadius: radii.hero }]}>
            {/* Top Heading Content */}
            <View style={{ padding: spacing.lg }}>
              <View style={styles.titleSection}>
                <Text style={[styles.heroTitleMain, { fontSize: moderateScale(22), lineHeight: moderateScale(28) }]}>
                  Find a Room or PG
                </Text>
                <View style={layout.horizontalView}>
                  <Text style={[styles.heroTitleMain, { fontSize: moderateScale(22), lineHeight: moderateScale(28) }]}>
                    that feels like{' '}
                  </Text>
                  <Text
                    style={[
                      styles.heroTitleAccent,
                      {
                        fontSize: moderateScale(25),
                        color: '#5EEAD4',
                        fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'sans-serif-medium',
                      },
                    ]}
                  >
                    Home
                  </Text>
                </View>
              </View>

              {/* Floating Frosted Pill Tags */}
              <View style={[layout.horizontalViewWrap, { marginTop: spacing.sm, gap: 6 }]}>
                {/* 1. Verified Listings */}
                <View style={[styles.tagPill, { borderRadius: radii.pill }]}>
                  <Ionicons
                    name="shield-checkmark"
                    size={moderateScale(12)}
                    color="#5EEAD4"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.tagText, { fontSize: moderateScale(11) }]}>
                    Verified Listings
                  </Text>
                </View>

                {/* 2. Zero Brokerage */}
                <View style={[styles.tagPill, { borderRadius: radii.pill }]}>
                  <Ionicons
                    name="pricetag"
                    size={moderateScale(12)}
                    color="#FDE047"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.tagText, { fontSize: moderateScale(11) }]}>
                    Zero Brokerage
                  </Text>
                </View>

                {/* 3. 100% Safe */}
                <View style={[styles.tagPill, { borderRadius: radii.pill }]}>
                  <Ionicons
                    name="lock-closed"
                    size={moderateScale(12)}
                    color="#93C5FD"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.tagText, { fontSize: moderateScale(11) }]}>
                    Safe & Secure
                  </Text>
                </View>
              </View>

              {/* Floating Elevated Search Bar */}
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={onSearchPress}
                style={[
                  styles.searchBarWrapper,
                  {
                    marginTop: spacing.lg,
                    borderRadius: radii.pill,
                    paddingLeft: spacing.md,
                    paddingRight: spacing.xs,
                    paddingVertical: spacing.xs,
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                  shadows.floating,
                ]}
              >
                <Feather
                  name="search"
                  size={moderateScale(18)}
                  color={colors.primary}
                  style={{ marginRight: spacing.sm }}
                />
                <TextInput
                  placeholder="Search room, PG, area, near metro..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  style={[
                    styles.searchInput,
                    {
                      fontSize: moderateScale(13),
                      color: colors.textPrimary,
                    },
                  ]}
                  editable={!onSearchPress || Boolean(onSearchChange)}
                />
                <TouchableOpacity
                  onPress={onFilterPress}
                  activeOpacity={0.8}
                  style={[
                    styles.filterButton,
                    {
                      width: moderateScale(36),
                      height: moderateScale(36),
                      borderRadius: radii.pill,
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="tune-variant"
                    size={moderateScale(18)}
                    color={colors.white}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
  },
  cardContainer: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageBackground: {
    width: '100%',
  },
  overlayShade: {
    width: '100%',
    backgroundColor: 'rgba(6, 17, 30, 0.52)',
  },
  titleSection: {
    marginBottom: 4,
  },
  heroTitleMain: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  heroTitleAccent: {
    fontWeight: '800',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HeroBanner;
