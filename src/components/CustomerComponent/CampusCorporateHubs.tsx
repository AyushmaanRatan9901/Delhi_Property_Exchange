import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

export interface HubItem {
  id: string;
  type: 'Campus' | 'Corporate';
  name: string;
  sub: string;
  distance: string;
  stays: string;
  imageUrl: string;
}

const HUBS: HubItem[] = [
  {
    id: 'h1',
    type: 'Campus',
    name: 'NSUT & IP University',
    sub: 'Dwarka Sector 3 & 16',
    distance: '0.8 km away',
    stays: '65+ Student PGs',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'h2',
    type: 'Corporate',
    name: 'Cyber City & Udyog Vihar',
    sub: 'DLF Phase 2, Gurgaon',
    distance: '15 min via Rapid Metro',
    stays: '110+ Coliving Hubs',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'h3',
    type: 'Campus',
    name: 'DU North Campus',
    sub: 'Vishwavidyalaya Metro',
    distance: 'Direct Yellow Line',
    stays: '90+ Student PGs',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'h4',
    type: 'Corporate',
    name: 'Noida Sector 62 IT Hub',
    sub: 'Electronic City Metro',
    distance: '5 min from Tech Parks',
    stays: '80+ Managed Rooms',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
  },
];

interface CampusCorporateHubsProps {
  onHubPress?: (hub: HubItem) => void;
}

export const CampusCorporateHubs: React.FC<CampusCorporateHubsProps> = ({ onHubPress }) => {
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, wp } = useResponsiveTheme();
  const [activeTab, setActiveTab] = useState<'All' | 'Campus' | 'Corporate'>('All');
  const cardWidth = Math.min(wp(65), 260);

  const filtered = HUBS.filter((h) => activeTab === 'All' || h.type === activeTab);

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      {/* Header & Tabs */}
      <View
        style={[
          layout.horizontalViewBetween,
          { paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.sm },
        ]}
      >
        <View>
          <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
            Popular College & Tech Hubs
          </Text>
          <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
            Stay close to your campus or workplace
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View
        style={[
          layout.horizontalView,
          { paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.md, gap: spacing.sm },
        ]}
      >
        {(['All', 'Campus', 'Corporate'] as const).map((tab) => {
          const isActive = activeTab === tab;

          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isActive ? colors.primary : colors.cardBackground,
                  borderColor: isActive ? colors.primary : colors.border,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs + 1,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? colors.white : colors.textSecondary,
                }}
              >
                {tab === 'All' ? 'All Hubs' : tab === 'Campus' ? '🎓 Colleges' : '💼 IT Parks'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Hubs Slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          gap: spacing.md,
        }}
      >
        {filtered.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            onPress={() => onHubPress?.(item)}
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
              source={{ uri: item.imageUrl }}
              style={[styles.image, { height: moderateScale(110), borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl }]}
            />

            <View style={[styles.info, { padding: spacing.md }]}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: item.type === 'Campus' ? colors.roomPinkLight : colors.pgBlueLight,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.xs + 2,
                    paddingVertical: 1.5,
                    alignSelf: 'flex-start',
                    marginBottom: 4,
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: moderateScale(9.5),
                    fontWeight: '700',
                    color: item.type === 'Campus' ? colors.roomPink : colors.pgBlue,
                  }}
                >
                  {item.type === 'Campus' ? '🎓 University Zone' : '🏢 Tech Hub'}
                </Text>
              </View>

              <Text numberOfLines={1} style={[typography.cardTitle, { fontSize: moderateScale(13.5), color: colors.textPrimary }]}>
                {item.name}
              </Text>
              <Text numberOfLines={1} style={[typography.cardAmenity, { fontSize: moderateScale(11), color: colors.textSecondary, marginTop: 1 }]}>
                {item.sub}
              </Text>

              <View style={[layout.horizontalViewBetween, { marginTop: spacing.sm, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
                <Text style={{ fontSize: moderateScale(11), color: colors.priceGreen, fontWeight: '600' }}>
                  {item.distance}
                </Text>
                <Text style={{ fontSize: moderateScale(11), color: colors.textMuted }}>
                  {item.stays}
                </Text>
              </View>
            </View>
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
  tabPill: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    backgroundColor: '#334155',
  },
  info: {},
  badge: {},
});

export default CampusCorporateHubs;
