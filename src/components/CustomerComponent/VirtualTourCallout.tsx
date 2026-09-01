import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useResponsiveTheme } from '../../constants/theme';

interface VirtualTourCalloutProps {
  onTourPress?: () => void;
}

export const VirtualTourCallout: React.FC<VirtualTourCalloutProps> = ({ onTourPress }) => {
  const { colors, moderateScale, spacing, radii, typography, shadows, layout } = useResponsiveTheme();

  return (
    <View style={[styles.container, { marginVertical: spacing.md, paddingHorizontal: spacing.screenHorizontal }]}>
      <View
        style={[
          styles.wrapper,
          {
            borderRadius: radii.xxl,
            borderColor: colors.border,
          },
          shadows.md,
        ]}
      >
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
          }}
          style={styles.imageBg}
          imageStyle={{ borderRadius: radii.xxl }}
        >
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.92)']}
            style={[styles.gradient, { padding: spacing.lg, borderRadius: radii.xxl }]}
          >
            {/* Tag */}
            <View
              style={[
                styles.tag,
                {
                  backgroundColor: 'rgba(255, 56, 92, 0.3)',
                  borderColor: '#FF385C',
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  alignSelf: 'flex-start',
                  marginBottom: spacing.xs,
                },
              ]}
            >
              <Text style={{ color: '#FF758F', fontSize: moderateScale(10), fontWeight: '800' }}>
                🥽 360° LIVE EXPERIENCE
              </Text>
            </View>

            <Text style={[styles.title, { fontSize: moderateScale(18), lineHeight: moderateScale(23) }]}>
              Explore Rooms in 3D Virtual Reality
            </Text>
            <Text style={[styles.desc, { fontSize: moderateScale(12), marginTop: 3 }]}>
              Inspect bathrooms, beds, study space and amenities virtually before stepping out of your home.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onTourPress}
              style={[
                styles.btn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radii.pill,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  marginTop: spacing.md,
                  alignSelf: 'flex-start',
                },
              ]}
            >
              <MaterialCommunityIcons name="video-3d" size={moderateScale(18)} color={colors.white} style={{ marginRight: 6 }} />
              <Text style={[styles.btnText, { fontSize: moderateScale(13), color: colors.white }]}>
                Start 3D Virtual Tour
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </ImageBackground>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  imageBg: {
    width: '100%',
  },
  gradient: {},
  tag: {
    borderWidth: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  desc: {
    color: '#E2E8F0',
    lineHeight: 16,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: '700',
  },
});

export default VirtualTourCallout;
