import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

const REVIEWS = [
  {
    id: '1',
    name: 'Aman Verma',
    role: 'Software Engineer @ Swiggy',
    stay: 'Dwarka Sector 9 Single Room',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    comment: 'Found my dream private room within 24 hours of landing in Delhi. Zero brokerage paid, and WiFi speed is consistently 200 Mbps!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Pooja Agarwal',
    role: 'MBA Student @ FMS Delhi',
    stay: 'Janakpuri Girls Co-living',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    comment: 'The biometric security and 24/7 female warden make me and my parents super relaxed. Food quality is just like home.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Rohan Mehta',
    role: 'Product Designer',
    stay: 'Dwarka Sector 6 Studio',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    comment: 'Seamless digital agreement and instant move-in. The room was sparkling clean and exactly like the photos on StayFinder.',
    rating: 5,
  },
];

export const TestimonialsSlider: React.FC = () => {
  const { colors, moderateScale, spacing, radii, typography, wp, shadows, layout } = useResponsiveTheme();
  const cardWidth = Math.min(wp(82), 320);

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
            Stories from Happy Tenants
          </Text>
          <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
            Over 4.9/5 average rating across 15,000+ reviews
          </Text>
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
        {REVIEWS.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                width: cardWidth,
                backgroundColor: colors.cardBackground,
                borderRadius: radii.xl,
                borderColor: colors.border,
                padding: spacing.md + 2,
              },
              shadows.sm,
            ]}
          >
            {/* Stars */}
            <View style={[layout.horizontalView, { marginBottom: spacing.xs + 2 }]}>
              {[...Array(item.rating)].map((_, i) => (
                <Ionicons
                  key={i}
                  name="star"
                  size={moderateScale(15)}
                  color="#FBBF24"
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>

            {/* Comment */}
            <Text
              numberOfLines={3}
              style={[
                styles.commentText,
                { fontSize: moderateScale(12.5), lineHeight: moderateScale(18), color: colors.textPrimary },
              ]}
            >
              "{item.comment}"
            </Text>

            {/* User Profile Info */}
            <View style={[layout.horizontalView, { marginTop: spacing.md }]}>
              <Image
                source={{ uri: item.avatar }}
                style={{
                  width: moderateScale(38),
                  height: moderateScale(38),
                  borderRadius: moderateScale(19),
                  marginRight: spacing.sm,
                  backgroundColor: '#334155',
                }}
              />
              <View style={{ flex: 1 }}>
                <Text style={[typography.cardTitle, { fontSize: moderateScale(13), color: colors.textPrimary }]}>
                  {item.name}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[typography.cardAmenity, { fontSize: moderateScale(10.5), color: colors.textSecondary }]}
                >
                  {item.role}
                </Text>
              </View>
            </View>
          </View>
        ))}
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
  card: {
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  commentText: {
    fontStyle: 'italic',
  },
});

export default TestimonialsSlider;
