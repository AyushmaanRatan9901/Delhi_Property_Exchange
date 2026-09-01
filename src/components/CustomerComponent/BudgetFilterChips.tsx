import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useResponsiveTheme } from '../../constants/theme';

export interface BudgetRange {
  id: string;
  label: string;
  sublabel: string;
  min: number;
  max: number;
}

const BUDGET_RANGES: BudgetRange[] = [
  { id: 'b1', label: 'Under ₹6,000', sublabel: 'Pocket Friendly', min: 0, max: 6000 },
  { id: 'b2', label: '₹6,000 - ₹10,000', sublabel: 'Most Popular', min: 6000, max: 10000 },
  { id: 'b3', label: '₹10,000 - ₹15,000', sublabel: 'Private & AC', min: 10000, max: 15000 },
  { id: 'b4', label: '₹15,000+', sublabel: 'Luxury Studios', min: 15000, max: 99999 },
];

interface BudgetFilterChipsProps {
  onSelectBudget?: (range: BudgetRange) => void;
}

export const BudgetFilterChips: React.FC<BudgetFilterChipsProps> = ({ onSelectBudget }) => {
  const { colors, moderateScale, spacing, radii, typography, layout } = useResponsiveTheme();
  const [selectedId, setSelectedId] = useState<string>('b2');

  const handleSelect = (b: BudgetRange) => {
    setSelectedId(b.id);
    onSelectBudget?.(b);
  };

  return (
    <View style={[styles.container, { marginVertical: spacing.md }]}>
      <View style={{ paddingHorizontal: spacing.screenHorizontal, marginBottom: spacing.sm }}>
        <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
          Filter by Monthly Budget
        </Text>
        <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginTop: 2 }]}>
          All-inclusive rent with zero hidden maintenance
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
        {BUDGET_RANGES.map((b) => {
          const isSelected = selectedId === b.id;

          return (
            <TouchableOpacity
              key={b.id}
              activeOpacity={0.8}
              onPress={() => handleSelect(b)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.cardBackground,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radii.xl,
                  paddingHorizontal: spacing.md + 2,
                  paddingVertical: spacing.sm,
                },
              ]}
            >
              <Text
                style={[
                  typography.cardTitle,
                  {
                    fontSize: moderateScale(13),
                    color: isSelected ? colors.white : colors.textPrimary,
                    fontWeight: '700',
                  },
                ]}
              >
                {b.label}
              </Text>
              <Text
                style={[
                  typography.cardAmenity,
                  {
                    fontSize: moderateScale(10.5),
                    color: isSelected ? 'rgba(255, 255, 255, 0.9)' : colors.textMuted,
                    marginTop: 2,
                  },
                ]}
              >
                {b.sublabel}
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
  chip: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
});

export default BudgetFilterChips;
