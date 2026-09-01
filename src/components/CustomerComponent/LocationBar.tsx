import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

interface LocationBarProps {
  location?: string;
  onPressLocation?: () => void;
  onChangePress?: () => void;
}

export const LocationBar: React.FC<LocationBarProps> = ({
  location = 'Dwarka, Delhi',
  onPressLocation,
  onChangePress,
}) => {
  const { colors, moderateScale, typography, spacing, layout, radii } = useResponsiveTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingHorizontal: spacing.screenHorizontal,
          marginVertical: spacing.xs,
        },
      ]}
    >
      {/* Current Selected Location */}
      <TouchableOpacity
        onPress={onPressLocation}
        activeOpacity={0.7}
        style={[layout.horizontalView, styles.locationWrapper]}
      >
        <Ionicons
          name="location-sharp"
          size={moderateScale(20)}
          color={colors.primary}
          style={{ marginRight: spacing.xs }}
        />
        <Text style={[typography.locationBarText, { fontSize: moderateScale(15), color: colors.textPrimary, marginRight: spacing.xs }]}>
          {location}
        </Text>
        <Feather name="chevron-down" size={moderateScale(18)} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Change Location Button */}
      <TouchableOpacity
        onPress={onChangePress}
        activeOpacity={0.8}
        style={[
          styles.changeButton,
          {
            backgroundColor: colors.secondaryBg,
            borderColor: colors.secondaryLight,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs + 2,
            borderRadius: radii.pill,
          },
        ]}
      >
        <MaterialIcons
          name="my-location"
          size={moderateScale(15)}
          color={colors.secondary}
          style={{ marginRight: spacing.xs }}
        />
        <Text style={[typography.locationChangeBtn, { fontSize: moderateScale(12), color: colors.secondary }]}>
          Change
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationWrapper: {
    flex: 1,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default LocationBar;
