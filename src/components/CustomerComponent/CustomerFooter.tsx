import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

interface CustomerFooterProps {
  onCallSupport?: () => void;
  onWhatsAppSupport?: () => void;
}

export const CustomerFooter: React.FC<CustomerFooterProps> = ({
  onCallSupport,
  onWhatsAppSupport,
}) => {
  const { colors, moderateScale, spacing, radii, typography, layout, shadows } = useResponsiveTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.screenHorizontal, marginTop: spacing.lg, marginBottom: spacing.xl }]}>
      {/* Help Card */}
      <View
        style={[
          styles.helpCard,
          {
            backgroundColor: colors.cardBackground,
            borderRadius: radii.xl,
            borderColor: colors.border,
            padding: spacing.lg,
          },
          shadows.sm,
        ]}
      >
        <Text style={[typography.sectionTitle, { fontSize: moderateScale(15), color: colors.textPrimary, textAlign: 'center' }]}>
          Need Assistance Finding the Right Stay?
        </Text>
        <Text
          style={[
            typography.categorySubtitle,
            { fontSize: moderateScale(11.5), color: colors.textSecondary, textAlign: 'center', marginTop: 2, marginBottom: spacing.md },
          ]}
        >
          Our housing experts will personally match verified rooms according to your budget
        </Text>

        <View style={[layout.horizontalViewCenter, { gap: spacing.md }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onCallSupport}
            style={[
              styles.callBtn,
              {
                backgroundColor: colors.primary,
                borderRadius: radii.pill,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs + 3,
              },
            ]}
          >
            <Feather name="phone-call" size={moderateScale(14)} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={[styles.btnText, { fontSize: moderateScale(12), color: colors.white }]}>
              Call Support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onWhatsAppSupport}
            style={[
              styles.callBtn,
              {
                backgroundColor: '#22C55E',
                borderRadius: radii.pill,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs + 3,
              },
            ]}
          >
            <Ionicons name="logo-whatsapp" size={moderateScale(16)} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={[styles.btnText, { fontSize: moderateScale(12), color: colors.white }]}>
              WhatsApp Us
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Brand Tagline & Version */}
      <View style={[layout.center, { marginTop: spacing.lg }]}>
        <View style={layout.horizontalView}>
          <Text style={[typography.brandTitle, { fontSize: moderateScale(17), color: colors.textPrimary }]}>Stay</Text>
          <Text style={[typography.brandHighlight, { fontSize: moderateScale(17), color: colors.primary }]}>Finder</Text>
        </View>
        <Text style={[typography.cardAmenity, { fontSize: moderateScale(11), color: colors.textMuted, marginTop: 2 }]}>
          Find Your Perfect Stay • Made with ❤️ for Tenants
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  helpCard: {
    borderWidth: 1,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontWeight: '700',
  },
});

export default CustomerFooter;
