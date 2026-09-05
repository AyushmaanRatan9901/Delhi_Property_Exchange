import * as Haptics from 'expo-haptics';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

interface CategoryCardsProps {
  onRoomPress?: () => void;
  onPgPress?: () => void;
}

export const CategoryCards: React.FC<CategoryCardsProps> = ({ onRoomPress, onPgPress }) => {
  const { colors, gradients, moderateScale, typography, spacing, radii, shadows, layout, isDark } = useResponsiveTheme();

  const handleRoom = () => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    onRoomPress?.();
  };

  const handlePg = () => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    onPgPress?.();
  };

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.screenHorizontal, marginVertical: spacing.xs }]}>
      <View style={layout.horizontalViewBetween}>
        {/* ROOM Card */}
        <TouchableOpacity
          onPress={handleRoom}
          activeOpacity={0.85}
          style={[styles.cardWrapper, { marginRight: spacing.sm }]}
        >
          <LinearGradient
            colors={gradients.roomCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.cardGradient,
              {
                borderRadius: radii.card,
                padding: spacing.md,
                borderColor: isDark ? colors.roomPinkBorder : '#FFD4DD',
              },
              shadows.categoryPink,
            ]}
          >
            <View style={layout.horizontalView}>
              {/* Pink Home Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    width: moderateScale(46),
                    height: moderateScale(46),
                    borderRadius: radii.lg,
                    backgroundColor: isDark ? colors.cardBackground : colors.white,
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="home"
                  size={moderateScale(28)}
                  color={colors.roomPink}
                />
              </View>

              {/* Text Info */}
              <View style={styles.textContainer}>
                <Text style={[typography.categoryTitle, { fontSize: moderateScale(15), color: colors.textPrimary }]}>
                  ROOM
                </Text>
                <Text
                  numberOfLines={2}
                  style={[typography.categorySubtitle, { fontSize: moderateScale(10.5), color: colors.textSecondary, marginTop: 2 }]}
                >
                  Find best rooms{'\n'}near you
                </Text>
              </View>

              {/* Chevron Arrow */}
              <View
                style={[
                  styles.arrowButton,
                  {
                    width: moderateScale(26),
                    height: moderateScale(26),
                    borderRadius: radii.round,
                    backgroundColor: colors.roomPink,
                  },
                ]}
              >
                <Feather name="chevron-right" size={moderateScale(16)} color={colors.white} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* PG Card */}
        <TouchableOpacity
          onPress={handlePg}
          activeOpacity={0.85}
          style={[styles.cardWrapper, { marginLeft: spacing.sm }]}
        >
          <LinearGradient
            colors={gradients.pgCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.cardGradient,
              {
                borderRadius: radii.card,
                padding: spacing.md,
                borderColor: isDark ? colors.pgBlueBorder : '#BFDBFE',
              },
              shadows.categoryBlue,
            ]}
          >
            <View style={layout.horizontalView}>
              {/* Blue Building Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    width: moderateScale(46),
                    height: moderateScale(46),
                    borderRadius: radii.lg,
                    backgroundColor: isDark ? colors.cardBackground : colors.white,
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="office-building"
                  size={moderateScale(26)}
                  color={colors.pgBlue}
                />
              </View>

              {/* Text Info */}
              <View style={styles.textContainer}>
                <Text style={[typography.categoryTitle, { fontSize: moderateScale(15), color: colors.textPrimary }]}>
                  PG
                </Text>
                <Text
                  numberOfLines={2}
                  style={[typography.categorySubtitle, { fontSize: moderateScale(10.5), color: colors.textSecondary, marginTop: 2 }]}
                >
                  Find best PGs{'\n'}near you
                </Text>
              </View>

              {/* Chevron Arrow */}
              <View
                style={[
                  styles.arrowButton,
                  {
                    width: moderateScale(26),
                    height: moderateScale(26),
                    borderRadius: radii.round,
                    backgroundColor: colors.pgBlue,
                  },
                ]}
              >
                <Feather name="chevron-right" size={moderateScale(16)} color={colors.white} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cardWrapper: {
    flex: 1,
  },
  cardGradient: {
    borderWidth: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  arrowButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

export default CategoryCards;
