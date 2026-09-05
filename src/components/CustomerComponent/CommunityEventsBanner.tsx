import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

const EVENTS = [
  {
    id: 'e1',
    title: 'Rooftop Movie & Popcorn Night',
    day: 'This Saturday, 7:30 PM',
    tag: 'Community Vibe',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'e2',
    title: 'FIFA 25 & Table Tennis Battle',
    day: 'Sunday, 4:00 PM',
    tag: 'Gaming Club',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'e3',
    title: 'Weekend Yoga & Mindfulness',
    day: 'Saturday, 7:00 AM',
    tag: 'Wellness',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=400&q=80',
  },
];

export const CommunityEventsBanner: React.FC = () => {
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, wp } = useResponsiveTheme();
  const cardWidth = Math.min(wp(68), 270);

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      <View style={{ paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.md }}>
        <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
          Life & Community at Delhi Property Exchange
        </Text>
        <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
          Never feel alone • Make lifelong friends and network
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          gap: spacing.md,
        }}
      >
        {EVENTS.map((ev) => (
          <View
            key={ev.id}
            style={[
              styles.card,
              {
                width: cardWidth,
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
              },
              shadows.sm,
            ]}
          >
            <Image
              source={{ uri: ev.imageUrl }}
              style={[styles.image, { height: moderateScale(115), borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl }]}
            />

            <View style={[styles.content, { padding: spacing.md }]}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.primaryLight,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.xs + 2,
                    paddingVertical: 1.5,
                    alignSelf: 'flex-start',
                    marginBottom: 4,
                  },
                ]}
              >
                <Text style={{ fontSize: moderateScale(9.5), fontWeight: '700', color: colors.primary }}>
                  {ev.tag}
                </Text>
              </View>

              <Text numberOfLines={1} style={[typography.cardTitle, { fontSize: moderateScale(13.5), color: colors.textPrimary }]}>
                {ev.title}
              </Text>
              <View style={[layout.horizontalView, { marginTop: spacing.xs }]}>
                <Ionicons name="time-outline" size={moderateScale(13)} color={colors.textSecondary} style={{ marginRight: 3 }} />
                <Text style={[typography.cardAmenity, { fontSize: moderateScale(11), color: colors.textSecondary }]}>
                  {ev.day}
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
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    backgroundColor: '#334155',
  },
  content: {},
  badge: {},
});

export default CommunityEventsBanner;
