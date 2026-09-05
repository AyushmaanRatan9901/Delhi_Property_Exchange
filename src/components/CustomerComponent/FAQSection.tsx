import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

const FAQS = [
  {
    q: 'Is there any brokerage or commission fee?',
    a: 'Zero brokerage! All properties on Delhi Property Exchange are directly verified by our team. You deal directly with verified property managers with 0% brokerage.',
  },
  {
    q: 'Can I schedule a free property visit?',
    a: 'Yes, you can schedule unlimited free in-person or 3D video visits by simply tapping "Book Visit Now" on any property card.',
  },
  {
    q: 'What is included in the monthly rent?',
    a: 'Most properties include high-speed WiFi, daily housekeeping, 24/7 water, electricity backup, and furnished room essentials. Food packages can be customized.',
  },
  {
    q: 'How does security deposit refund work?',
    a: 'Security deposits are safely held in an escrow guarantee. Upon move-out with a standard 30-day notice, your deposit is refunded within 48 hours.',
  },
  {
    q: 'Are friends or family visits allowed?',
    a: 'Yes, day visits are allowed in common areas and designated guest rooms according to property house rules.',
  },
];

export const FAQSection: React.FC = () => {
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } = useResponsiveTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={[styles.container, { marginVertical: spacing.md, paddingHorizontal: spacing.screenHorizontal }]}>
      <Text style={[typography.sectionTitle, { fontSize: moderateScale(17), color: colors.textPrimary, marginBottom: 2 }]}>
        Frequently Asked Questions
      </Text>
      <Text style={[typography.categorySubtitle, { fontSize: moderateScale(12), color: colors.textSecondary, marginBottom: spacing.md }]}>
        Everything you need to know before moving in
      </Text>

      <View style={{ gap: spacing.sm }}>
        {FAQS.map((item, index) => {
          const isExpanded = expandedIndex === index;

          return (
            <View
              key={index}
              style={[
                styles.faqItem,
                {
                  backgroundColor: colors.cardBackground,
                  borderRadius: radii.lg,
                  borderColor: isExpanded ? colors.primary : colors.border,
                  padding: spacing.md,
                },
                shadows.sm,
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggle(index)}
                style={layout.horizontalViewBetween}
              >
                <Text
                  style={[
                    typography.cardTitle,
                    {
                      fontSize: moderateScale(13.5),
                      flex: 1,
                      marginRight: spacing.sm,
                      color: isExpanded ? colors.primary : colors.textPrimary,
                    },
                  ]}
                >
                  {item.q}
                </Text>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={moderateScale(18)}
                  color={isExpanded ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>

              {isExpanded && (
                <Text
                  style={[
                    styles.answer,
                    {
                      fontSize: moderateScale(12),
                      lineHeight: moderateScale(18),
                      color: colors.textSecondary,
                      marginTop: spacing.sm,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingTop: spacing.sm,
                    },
                  ]}
                >
                  {item.a}
                </Text>
              )}
            </View>
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
  faqItem: {
    borderWidth: 1,
  },
  answer: {},
});

export default FAQSection;
