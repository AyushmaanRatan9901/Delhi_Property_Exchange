import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

export interface CollectionItem {
  id: string;
  title: string;
  count: string;
  tag: string;
  imageUrl: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: '1',
    title: 'Near Metro Stations',
    count: '140+ Stays',
    tag: '< 5 min walk',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    title: 'Girls Safe Stays',
    count: '95+ Verified PGs',
    tag: '24/7 Wardens',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    title: 'Student Hubs (DU & IIT)',
    count: '110+ Stays',
    tag: 'Budget Friendly',
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '4',
    title: 'Luxury Coliving & Gym',
    count: '50+ Premium',
    tag: 'All-inclusive',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '5',
    title: 'No Lock-in Stays',
    count: '75+ Flexible',
    tag: 'Monthly Renewal',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
  },
];

interface TrendingCollectionsProps {
  onCollectionPress?: (item: CollectionItem) => void;
  onSeeAllPress?: () => void;
}

export const TrendingCollections: React.FC<TrendingCollectionsProps> = ({
  onCollectionPress,
  onSeeAllPress,
}) => {
  const { colors, moderateScale, spacing, radii, typography, wp, shadows, layout } = useResponsiveTheme();
  const cardWidth = Math.min(wp(52), 210);

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      {/* Header Row */}
      <View
        style={[
          layout.horizontalViewBetween,
          { paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.md },
        ]}
      >
        <View>
          <Text style={[typography.sectionTitle, { fontSize: moderateScale(17) }]}>
            Trending Collections
          </Text>
          <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), marginTop: 2 }]}>
            Curated stays tailored for your lifestyle
          </Text>
        </View>
        <TouchableOpacity
          onPress={onSeeAllPress}
          activeOpacity={0.7}
          style={layout.horizontalView}
        >
          <Text style={[typography.sectionSeeAll, { fontSize: moderateScale(13), marginRight: 2 }]}>
            See All
          </Text>
          <Feather name="chevron-right" size={moderateScale(15)} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          gap: spacing.md,
        }}
      >
        {COLLECTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            onPress={() => onCollectionPress?.(item)}
            style={[
              styles.cardWrapper,
              {
                width: cardWidth,
                height: moderateScale(170),
                borderRadius: radii.xl,
              },
              shadows.md,
            ]}
          >
            <ImageBackground
              source={{ uri: item.imageUrl }}
              style={styles.imageBackground}
              imageStyle={{ borderRadius: radii.xl }}
            >
              <LinearGradient
                colors={['transparent', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.9)']}
                style={[
                  styles.gradientOverlay,
                  {
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                ]}
              >
                {/* Top Tag */}
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: radii.pill,
                      paddingHorizontal: spacing.xs + 3,
                      paddingVertical: 2,
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { fontSize: moderateScale(10), color: colors.primary }]}>
                    {item.tag}
                  </Text>
                </View>

                {/* Bottom Title & Count */}
                <View>
                  <Text
                    numberOfLines={2}
                    style={[styles.collectionTitle, { fontSize: moderateScale(14) }]}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.countText, { fontSize: moderateScale(11), marginTop: 2 }]}>
                    {item.count}
                  </Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cardWrapper: {
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  tagBadge: {
    alignSelf: 'flex-start',
  },
  tagText: {
    fontWeight: '700',
  },
  collectionTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  countText: {
    color: '#E2E8F0',
    fontWeight: '500',
  },
});

export default TrendingCollections;
