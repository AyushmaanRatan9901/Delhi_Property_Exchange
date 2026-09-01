import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

export interface PropertyItem {
  id: string;
  title: string;
  type: 'Room' | 'PG';
  price: number;
  pricePeriod?: string;
  location: string;
  amenities: string[];
  imageUrl: string;
  photosCount: number;
  isVerified?: boolean;
  isFavorite?: boolean;
}

interface PropertyCardProps {
  item: PropertyItem;
  onPress?: (item: PropertyItem) => void;
  onFavoriteToggle?: (item: PropertyItem, isFav: boolean) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  item,
  onPress,
  onFavoriteToggle,
}) => {
  const { colors, moderateScale, typography, spacing, radii, shadows, layout, wp, isDark } = useResponsiveTheme();
  const [favorite, setFavorite] = useState(item.isFavorite || false);

  const toggleFavorite = () => {
    const nextState = !favorite;
    setFavorite(nextState);
    onFavoriteToggle?.(item, nextState);
  };

  const formattedPrice = new Intl.NumberFormat('en-IN').format(item.price);
  const cardWidth = Math.min(wp(68), 280);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress?.(item)}
      style={[
        styles.card,
        {
          width: cardWidth,
          borderRadius: radii.card,
          borderColor: colors.border,
          backgroundColor: colors.cardBackground,
        },
        shadows.card,
      ]}
    >
      {/* Image Container with Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={[styles.image, { height: moderateScale(150), borderTopLeftRadius: radii.card, borderTopRightRadius: radii.card }]}
          resizeMode="cover"
        />

        {/* Top Left Verified Badge */}
        {item.isVerified && (
          <View
            style={[
              styles.verifiedBadge,
              {
                borderRadius: radii.pill,
                paddingHorizontal: spacing.sm,
                paddingVertical: 3,
                backgroundColor: colors.verifiedGreenDark,
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle"
              size={moderateScale(12)}
              color={colors.white}
              style={{ marginRight: 3 }}
            />
            <Text style={[styles.verifiedText, { fontSize: moderateScale(11) }]}>
              Verified
            </Text>
          </View>
        )}

        {/* Top Right Favorite Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleFavorite}
          style={[
            styles.favoriteButton,
            {
              width: moderateScale(30),
              height: moderateScale(30),
              borderRadius: radii.round,
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)',
            },
          ]}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={moderateScale(17)}
            color={favorite ? colors.favoriteRed : (isDark ? '#E2E8F0' : '#334155')}
          />
        </TouchableOpacity>

        {/* Bottom Right Photos Count Badge */}
        <View
          style={[
            styles.photoBadge,
            {
              borderRadius: radii.sm,
              paddingHorizontal: spacing.xs + 2,
              paddingVertical: 2,
              backgroundColor: 'rgba(15, 23, 42, 0.78)',
            },
          ]}
        >
          <Feather
            name="image"
            size={moderateScale(11)}
            color={colors.white}
            style={{ marginRight: 3 }}
          />
          <Text style={[styles.photoCountText, { fontSize: moderateScale(11) }]}>
            {item.photosCount}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={[styles.content, { padding: spacing.md }]}>
        {/* Property Title */}
        <Text
          numberOfLines={1}
          style={[typography.cardTitle, { fontSize: moderateScale(15), color: colors.textPrimary, marginBottom: 3 }]}
        >
          {item.title}
        </Text>

        {/* Price Tag */}
        <View style={[layout.horizontalView, { marginBottom: spacing.xs }]}>
          <Text style={[typography.cardPrice, { fontSize: moderateScale(15), color: colors.priceGreen }]}>
            ₹{formattedPrice}
          </Text>
          <Text style={[typography.cardPriceUnit, { fontSize: moderateScale(12), color: colors.priceGreen }]}>
            {' '}/ {item.pricePeriod || 'month'}
          </Text>
        </View>

        {/* Location Row */}
        <View style={[layout.horizontalView, { marginBottom: spacing.xs + 2 }]}>
          <Ionicons
            name="location-outline"
            size={moderateScale(14)}
            color={colors.textSecondary}
            style={{ marginRight: 3 }}
          />
          <Text
            numberOfLines={1}
            style={[typography.cardLocation, { fontSize: moderateScale(12), color: colors.textSecondary }]}
          >
            {item.location}
          </Text>
        </View>

        {/* Amenities Line */}
        <Text
          numberOfLines={1}
          style={[typography.cardAmenity, { fontSize: moderateScale(11), color: colors.textMuted }]}
        >
          {item.amenities.join(' • ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    backgroundColor: '#334155',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCountText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {},
});

export default PropertyCard;
