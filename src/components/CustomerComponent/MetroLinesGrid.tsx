import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

export interface MetroLineItem {
  id: string;
  lineName: string;
  stations: string;
  color: string;
  badgeBg: string;
  staysCount: string;
  walkTime: string;
}

const METRO_LINES: MetroLineItem[] = [
  {
    id: 'blue',
    lineName: 'Blue Line Hubs',
    stations: 'Dwarka • Janakpuri • Rajiv Chowk • Noida',
    color: '#2563EB',
    badgeBg: '#EFF6FF',
    staysCount: '165+ Stays',
    walkTime: '2-5 min walk',
  },
  {
    id: 'yellow',
    lineName: 'Yellow Line Hubs',
    stations: 'Gurgaon • Hauz Khas • North Campus • Saket',
    color: '#D97706',
    badgeBg: '#FEF3C7',
    staysCount: '140+ Stays',
    walkTime: '3-7 min walk',
  },
  {
    id: 'magenta',
    lineName: 'Magenta Line',
    stations: 'Janakpuri West • IIT Delhi • Okhla • Botanical',
    color: '#DB2777',
    badgeBg: '#FDF2F8',
    staysCount: '95+ Stays',
    walkTime: '2-6 min walk',
  },
  {
    id: 'pink',
    lineName: 'Pink Line Ring',
    stations: 'Netaji Subhash • Dhaula Kuan • Lajpat Nagar',
    color: '#E11D48',
    badgeBg: '#FFF1F2',
    staysCount: '70+ Stays',
    walkTime: '4-8 min walk',
  },
];

interface MetroLinesGridProps {
  onLinePress?: (item: MetroLineItem) => void;
}

export const MetroLinesGrid: React.FC<MetroLinesGridProps> = ({ onLinePress }) => {
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isTablet } = useResponsiveTheme();

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      <View
        style={[
          layout.horizontalViewBetween,
          { paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.md },
        ]}
      >
        <View>
          <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
            Stays Along Metro Corridors
          </Text>
          <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
            Zero commute stress • Walking distance to stations
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.grid,
          {
            paddingHorizontal: spacing.screenHorizontal,
            gap: spacing.sm,
          },
        ]}
      >
        {METRO_LINES.map((m) => (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.85}
            onPress={() => onLinePress?.(m)}
            style={[
              styles.card,
              {
                width: isTablet ? '48.5%' : '100%',
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderRadius: radii.xl,
                padding: spacing.md,
              },
              shadows.sm,
            ]}
          >
            <View style={layout.horizontalViewBetween}>
              <View style={layout.horizontalView}>
                <View
                  style={[
                    styles.bullet,
                    {
                      backgroundColor: m.color,
                      width: moderateScale(12),
                      height: moderateScale(12),
                      borderRadius: moderateScale(6),
                      marginRight: spacing.sm,
                    },
                  ]}
                />
                <Text style={[typography.cardTitle, { fontSize: moderateScale(14), color: colors.textPrimary }]}>
                  {m.lineName}
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: `${m.color}15`,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 2,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: m.color, fontSize: moderateScale(10.5) }]}>
                  {m.walkTime}
                </Text>
              </View>
            </View>

            <Text
              numberOfLines={1}
              style={[
                typography.cardAmenity,
                { fontSize: moderateScale(11.5), color: colors.textSecondary, marginTop: spacing.xs },
              ]}
            >
              {m.stations}
            </Text>

            <View style={[layout.horizontalViewBetween, { marginTop: spacing.sm, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.borderLight }]}>
              <Text style={{ fontSize: moderateScale(11), color: colors.textMuted, fontWeight: '500' }}>
                {m.staysCount}
              </Text>
              <View style={layout.horizontalView}>
                <Text style={{ fontSize: moderateScale(11.5), color: colors.primary, fontWeight: '700', marginRight: 2 }}>
                  Explore
                </Text>
                <Feather name="chevron-right" size={moderateScale(14)} color={colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    borderWidth: 1,
  },
  bullet: {},
  badge: {},
  badgeText: {
    fontWeight: '700',
  },
});

export default MetroLinesGrid;
