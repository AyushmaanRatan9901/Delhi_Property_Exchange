import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';
import { PropertyItem } from './PropertyCard';

export const FEATURED_PROPERTIES: (PropertyItem & { rating: number; reviews: number; badgeText?: string })[] = [
  {
    id: 'f1',
    title: 'Studio Room with Balcony',
    type: 'Room',
    price: 13500,
    pricePeriod: 'month',
    location: 'Dwarka Sector 11',
    amenities: ['AC', 'WiFi', 'Attached Washroom', 'Balcony'],
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    photosCount: 16,
    isVerified: true,
    rating: 4.9,
    reviews: 42,
    badgeText: 'Top Rated',
  },
  {
    id: 'f2',
    title: 'Luxury Boys PG with Gym',
    type: 'PG',
    price: 8900,
    pricePeriod: 'month',
    location: 'Dwarka Sector 7',
    amenities: ['3 Meals', 'Gym', 'WiFi', 'CCTV'],
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    photosCount: 14,
    isVerified: true,
    rating: 4.8,
    reviews: 38,
    badgeText: 'Zero Brokerage',
  },
  {
    id: 'f3',
    title: 'Co-Living Girls Suite',
    type: 'PG',
    price: 9500,
    pricePeriod: 'month',
    location: 'Janakpuri West',
    amenities: ['Food', '24/7 Security', 'AC', 'Housekeeping'],
    imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    photosCount: 20,
    isVerified: true,
    rating: 4.9,
    reviews: 64,
    badgeText: 'Near Metro',
  },
  {
    id: 'f4',
    title: 'Private 1BHK Furnished',
    type: 'Room',
    price: 16500,
    pricePeriod: 'month',
    location: 'Dwarka Sector 14',
    amenities: ['Modular Kitchen', 'Power Backup', 'Sofa'],
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
    photosCount: 18,
    isVerified: true,
    rating: 4.7,
    reviews: 29,
    badgeText: 'Instant Move-in',
  },
];

interface FeaturedPropertyListGridProps {
  onPropertyPress?: (item: PropertyItem) => void;
  onSeeAllPress?: () => void;
}

export const FeaturedPropertyListGrid: React.FC<FeaturedPropertyListGridProps> = ({
  onPropertyPress,
  onSeeAllPress,
}) => {
  const { colors, moderateScale, spacing, radii, typography, shadows, layout, isTablet, isDark } = useResponsiveTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const numCols = isTablet ? 3 : 2;
  const gridGap = spacing.md;
  const horizontalPadding = spacing.screenHorizontal;
  const cardWidth = Math.floor((windowWidth - (horizontalPadding * 2) - ((numCols - 1) * gridGap)) / numCols);

  const toggleFav = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      {/* Header */}
      <View
        style={[
          layout.horizontalViewBetween,
          { paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.md },
        ]}
      >
        <View>
          <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
            Handpicked Top Rated Stays
          </Text>
          <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
            Highest rated by 10,000+ happy tenants
          </Text>
        </View>
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

      {/* Grid */}
      <View
        style={[
          styles.gridContainer,
          {
            paddingHorizontal: horizontalPadding,
            gap: gridGap,
          },
        ]}
      >
        {FEATURED_PROPERTIES.map((item) => {
          const isFav = favorites[item.id] || false;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.92}
              onPress={() => onPropertyPress?.(item)}
              style={[
                styles.card,
                {
                  width: cardWidth,
                  borderRadius: radii.lg,
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                },
                shadows.sm,
              ]}
            >
              {/* Image & Badges */}
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={[styles.image, { height: moderateScale(120), borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg }]}
                />

                {/* Rating Badge */}
                <View
                  style={[
                    styles.ratingBadge,
                    {
                      backgroundColor: 'rgba(15, 23, 42, 0.82)',
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.xs + 2,
                      paddingVertical: 2,
                    },
                  ]}
                >
                  <Ionicons name="star" size={moderateScale(10)} color="#FBBF24" style={{ marginRight: 2 }} />
                  <Text style={[styles.ratingText, { fontSize: moderateScale(10) }]}>
                    {item.rating}
                  </Text>
                </View>

                {/* Favorite Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleFav(item.id)}
                  style={[
                    styles.favButton,
                    {
                      width: moderateScale(26),
                      height: moderateScale(26),
                      borderRadius: radii.round,
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                    },
                  ]}
                >
                  <Ionicons
                    name={isFav ? 'heart' : 'heart-outline'}
                    size={moderateScale(14)}
                    color={isFav ? colors.favoriteRed : '#64748B'}
                  />
                </TouchableOpacity>

                {/* Photos Badge */}
                <View
                  style={[
                    styles.photosBadge,
                    {
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      borderRadius: radii.sm,
                      paddingHorizontal: 4,
                      paddingVertical: 1.5,
                    },
                  ]}
                >
                  <Ionicons name="images-outline" size={moderateScale(9)} color="#FFFFFF" style={{ marginRight: 2 }} />
                  <Text style={[styles.photosText, { fontSize: moderateScale(9) }]}>{item.photosCount}</Text>
                </View>
              </View>

              {/* Card Details */}
              <View style={[styles.content, { padding: spacing.sm }]}>
                {item.badgeText && (
                  <View
                    style={[
                      styles.topTag,
                      {
                        backgroundColor: colors.primaryLight,
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.xs + 2,
                        paddingVertical: 1,
                        alignSelf: 'flex-start',
                        marginBottom: 3,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: moderateScale(9), fontWeight: '700', color: colors.primary }}>
                      {item.badgeText}
                    </Text>
                  </View>
                )}

                <Text numberOfLines={1} style={[typography.cardTitle, { fontSize: moderateScale(12.5), color: colors.textPrimary }]}>
                  {item.title}
                </Text>

                <Text numberOfLines={1} style={[typography.cardLocation, { fontSize: moderateScale(10.5), color: colors.textSecondary, marginTop: 1 }]}>
                  📍 {item.location}
                </Text>

                {/* Amenities preview */}
                <Text numberOfLines={1} style={[typography.cardAmenity, { fontSize: moderateScale(10), color: colors.textMuted, marginTop: 2 }]}>
                  {item.amenities.slice(0, 2).join(' • ')}
                </Text>

                {/* Price */}
                <View style={[layout.horizontalViewBetween, { marginTop: spacing.xs + 2, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
                  <View style={layout.horizontalView}>
                    <Text style={[typography.cardPrice, { fontSize: moderateScale(13.5), color: colors.priceGreen }]}>
                      ₹{new Intl.NumberFormat('en-IN').format(item.price)}
                    </Text>
                    <Text style={[typography.cardPriceUnit, { fontSize: moderateScale(10), color: colors.priceGreen }]}>
                      /{item.pricePeriod === 'month' ? 'mo' : item.pricePeriod}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={moderateScale(18)} color={colors.primary} />
                </View>
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    backgroundColor: '#334155',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  favButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photosBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photosText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {},
  topTag: {},
});

export default FeaturedPropertyListGrid;
