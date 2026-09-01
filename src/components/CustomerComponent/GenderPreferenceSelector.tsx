import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

export interface GenderPreference {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  count: string;
}

const PREFERENCES: GenderPreference[] = [
  { id: 'all', label: 'All Stays', icon: 'home-variant-outline', count: '450+ Active' },
  { id: 'boys', label: 'Boys PGs', icon: 'account', count: '180+ Stays' },
  { id: 'girls', label: 'Girls PGs', icon: 'face-woman-outline', count: '160+ Safe PGs' },
  { id: 'coliving', label: 'Co-Living', icon: 'account-group-outline', count: '90+ Hubs' },
  { id: 'family', label: 'Flats & 1BHK', icon: 'home-heart', count: '60+ Stays' },
];

interface GenderPreferenceSelectorProps {
  onSelect?: (pref: GenderPreference) => void;
}

export const GenderPreferenceSelector: React.FC<GenderPreferenceSelectorProps> = ({ onSelect }) => {
  const { colors, moderateScale, spacing, radii, typography, layout } = useResponsiveTheme();
  const [selectedId, setSelectedId] = useState<string>('all');

  const handleSelect = (p: GenderPreference) => {
    setSelectedId(p.id);
    onSelect?.(p);
  };

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      <View style={{ paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.sm }}>
        <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
          Who is Moving In?
        </Text>
        <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
          Filter properties by gender preference and house community
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          gap: spacing.sm,
        }}
      >
        {PREFERENCES.map((p) => {
          const isSelected = selectedId === p.id;

          return (
            <TouchableOpacity
              key={p.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(p)}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected ? colors.primaryLight : colors.cardBackground,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radii.xl,
                  paddingHorizontal: spacing.md + 2,
                  paddingVertical: spacing.sm,
                },
              ]}
            >
              <View style={layout.horizontalView}>
                <MaterialCommunityIcons
                  name={p.icon}
                  size={moderateScale(18)}
                  color={isSelected ? colors.primary : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    typography.cardTitle,
                    {
                      fontSize: moderateScale(13),
                      color: isSelected ? colors.primary : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '600',
                    },
                  ]}
                >
                  {p.label}
                </Text>
              </View>
              <Text
                style={[
                  typography.cardAmenity,
                  {
                    fontSize: moderateScale(10.5),
                    color: isSelected ? colors.primaryDark : colors.textMuted,
                    marginTop: 2,
                    textAlign: 'center',
                  },
                ]}
              >
                {p.count}
              </Text>
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
  card: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 110,
  },
});

export default GenderPreferenceSelector;
