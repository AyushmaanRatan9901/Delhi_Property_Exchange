import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

const MEAL_TIMES = [
  {
    meal: 'Breakfast',
    time: '7:30 AM - 10:00 AM',
    icon: 'coffee-outline' as const,
    color: '#D97706',
    bgColor: '#FEF3C7',
    darkBgColor: '#451A03',
    items: 'Aloo Parathas, Masala Dosa, Poha, Eggs & Hot Masala Chai',
  },
  {
    meal: 'Lunch',
    time: '12:30 PM - 3:00 PM',
    icon: 'food' as const,
    color: '#059669',
    bgColor: '#ECFDF5',
    darkBgColor: '#064E3B',
    items: 'Fresh Rotis, Dal Tadka, Paneer Butter Masala, Basmati Rice & Salad',
  },
  {
    meal: 'Hi-Tea & Snacks',
    time: '5:30 PM - 6:30 PM',
    icon: 'cookie-outline' as const,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    darkBgColor: '#431407',
    items: 'Crispy Veg Pakoras, Grilled Sandwiches, Cookies & Adrak Chai',
  },
  {
    meal: 'Dinner',
    time: '8:00 PM - 10:30 PM',
    icon: 'silverware-fork-knife' as const,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    darkBgColor: '#2E1065',
    items: 'Kadai Paneer / Chicken Curry, Phulkas, Jeera Rice, Gulab Jamun',
  },
];

export const FoodMealPlanCard: React.FC = () => {
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } = useResponsiveTheme();
  const [selectedMealIndex, setSelectedMealIndex] = useState(0);

  return (
    <View style={[styles.container, { marginVertical: spacing.md, paddingHorizontal: spacing.screenHorizontal }]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderRadius: radii.xxl,
            borderColor: colors.border,
            padding: spacing.lg,
          },
          shadows.sm,
        ]}
      >
        {/* Header */}
        <View style={[layout.horizontalViewBetween, { marginBottom: spacing.md }]}>
          <View>
            <View style={layout.horizontalView}>
              <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>
                Homely 4-Time Meals
              </Text>
              <View
                style={[
                  styles.fssaiBadge,
                  {
                    backgroundColor: '#ECFDF5',
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.xs + 2,
                    paddingVertical: 2,
                    marginLeft: spacing.xs,
                  },
                ]}
              >
                <Text style={{ fontSize: moderateScale(9.5), fontWeight: '700', color: '#059669' }}>
                  ✓ FSSAI Certified
                </Text>
              </View>
            </View>
            <Text style={[typography.categorySubtitle, { fontSize: moderateScale(11.5), color: colors.textSecondary, marginTop: 2 }]}>
              Nutritious, hygienic & prepared fresh with love daily
            </Text>
          </View>
        </View>

        {/* Meal Selector Tabs */}
        <View style={[layout.horizontalViewBetween, { gap: 4, marginBottom: spacing.md }]}>
          {MEAL_TIMES.map((m, idx) => {
            const active = selectedMealIndex === idx;

            return (
              <TouchableOpacity
                key={m.meal}
                onPress={() => setSelectedMealIndex(idx)}
                activeOpacity={0.8}
                style={[
                  styles.mealTab,
                  {
                    backgroundColor: active ? colors.primary : (isDark ? colors.surfaceHover : colors.surfaceLight),
                    borderRadius: radii.lg,
                    paddingVertical: spacing.xs + 2,
                    paddingHorizontal: spacing.xs,
                    flex: 1,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    textAlign: 'center',
                    fontSize: moderateScale(11),
                    fontWeight: active ? '700' : '600',
                    color: active ? colors.white : colors.textPrimary,
                  }}
                >
                  {m.meal.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active Meal Details Box */}
        {(() => {
          const current = MEAL_TIMES[selectedMealIndex];
          const iconBg = isDark ? current.darkBgColor : current.bgColor;

          return (
            <View
              style={[
                styles.mealDetailsBox,
                {
                  backgroundColor: isDark ? colors.surfaceHover : '#F8FAFC',
                  borderRadius: radii.xl,
                  padding: spacing.md,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View style={[layout.horizontalViewBetween, { marginBottom: spacing.xs }]}>
                <View style={layout.horizontalView}>
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: iconBg,
                        width: moderateScale(34),
                        height: moderateScale(34),
                        borderRadius: radii.md,
                        marginRight: spacing.sm,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons name={current.icon} size={moderateScale(20)} color={current.color} />
                  </View>
                  <Text style={[typography.cardTitle, { fontSize: moderateScale(14), color: colors.textPrimary }]}>
                    {current.meal}
                  </Text>
                </View>

                <Text style={{ fontSize: moderateScale(11.5), color: current.color, fontWeight: '700' }}>
                  {current.time}
                </Text>
              </View>

              <Text
                style={[
                  typography.cardAmenity,
                  {
                    fontSize: moderateScale(12),
                    color: colors.textSecondary,
                    lineHeight: 18,
                    marginTop: spacing.xs,
                  },
                ]}
              >
                🥘 <Text style={{ fontWeight: '600', color: colors.textPrimary }}>Menu: </Text>
                {current.items}
              </Text>
            </View>
          );
        })()}

        {/* Bottom Highlights Row */}
        <View style={[layout.horizontalViewBetween, { marginTop: spacing.md }]}>
          <View style={layout.horizontalView}>
            <Ionicons name="checkmark-circle" size={moderateScale(15)} color={colors.verifiedGreen} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: moderateScale(11), color: colors.textSecondary, fontWeight: '500' }}>
              Unlimited Servings
            </Text>
          </View>
          <View style={layout.horizontalView}>
            <Ionicons name="checkmark-circle" size={moderateScale(15)} color={colors.verifiedGreen} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: moderateScale(11), color: colors.textSecondary, fontWeight: '500' }}>
              Veg & Non-Veg Options
            </Text>
          </View>
          <View style={layout.horizontalView}>
            <Ionicons name="checkmark-circle" size={moderateScale(15)} color={colors.verifiedGreen} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: moderateScale(11), color: colors.textSecondary, fontWeight: '500' }}>
              Water Purifier (RO)
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    borderWidth: 1,
  },
  fssaiBadge: {},
  mealTab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealDetailsBox: {
    borderWidth: 1,
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FoodMealPlanCard;
