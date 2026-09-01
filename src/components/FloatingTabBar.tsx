import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  LayoutChangeEvent,
  ColorValue,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsiveTheme } from '../constants/theme';
import { Tabs } from 'expo-router';

type TabsTabBarProp = NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>;
export type FloatingTabBarProps = TabsTabBarProp extends (props: infer P) => any ? P : any;

export type IconRenderer = (props: {
  focused: boolean;
  color: ColorValue;
  size: number;
}) => React.ReactNode;

/**
 * Helper to build iconic renderers from base name (outline when inactive, filled when active)
 */
export function tabIcon(name: string, iconFamily: 'ionicons' | 'community' | 'feather' = 'ionicons'): IconRenderer {
  function TabIconRenderer({
    focused,
    color,
    size,
  }: {
    focused: boolean;
    color: ColorValue;
    size: number;
  }) {
    const colorStr = color as string;
    if (iconFamily === 'feather') {
      return <Feather name={name as any} size={size} color={colorStr} />;
    }
    if (iconFamily === 'community') {
      return (
        <MaterialCommunityIcons
          name={(focused ? name : `${name}-outline`) as any}
          size={size}
          color={colorStr}
        />
      );
    }
    return (
      <Ionicons
        name={(focused ? name : `${name}-outline`) as any}
        size={size}
        color={colorStr}
      />
    );
  }
  TabIconRenderer.displayName = `TabIcon(${name})`;
  return TabIconRenderer;
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: FloatingTabBarProps) {
  const { colors, isDark, moderateScale, isTablet, wp } = useResponsiveTheme();
  const insets = useSafeAreaInsets();
  const accent = colors.primary;

  const barHeight = Math.round(Math.min(Math.max(moderateScale(62), 56), isTablet ? 72 : 66));
  const maxBarWidth = isTablet ? 560 : Math.min(wp(92), 430);

  const layouts = useRef<Record<string, { x: number; width: number }>>({});

  const [indicator] = useState({
    x: new Animated.Value(0),
    w: new Animated.Value(0),
  });
  const [ready, setReady] = useState(false);

  const moveIndicator = (key: string) => {
    const l = layouts.current[key];
    if (!l) return;

    const horizontalPadding = moderateScale(3);

    Animated.parallel([
      Animated.spring(indicator.x, {
        toValue: l.x - horizontalPadding,
        damping: 18,
        stiffness: 140,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(indicator.w, {
        toValue: l.width + horizontalPadding * 2,
        damping: 18,
        stiffness: 140,
        mass: 0.9,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    const activeRoute = state.routes[state.index];
    if (activeRoute && layouts.current[activeRoute.key]) {
      moveIndicator(activeRoute.key);
      if (!ready) setReady(true);
    }
  }, [state.index, ready]);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View
        style={[
          styles.shadowWrap,
          {
            width: maxBarWidth,
            shadowColor: isDark ? '#000000' : '#0F172A',
            shadowOpacity: isDark ? 0.5 : 0.15,
          },
        ]}
      >
        <BlurView
          intensity={Platform.OS === 'android' ? 60 : 45}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.blur,
            {
              height: barHeight,
              borderRadius: barHeight / 2,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)',
            },
          ]}
        >
          {/* Faux-glass gradient overlay for rich color depth */}
          <LinearGradient
            colors={
              isDark
                ? ['rgba(13, 27, 42, 0.90)', 'rgba(6, 17, 30, 0.95)']
                : ['rgba(255, 255, 255, 0.94)', 'rgba(248, 250, 252, 0.88)']
            }
            style={StyleSheet.absoluteFill}
          />

          {/* Curved top light reflection */}
          <LinearGradient
            colors={
              isDark
                ? ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0)']
                : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0)']
            }
            style={[
              styles.topHighlight,
              {
                height: barHeight * 0.52,
                borderTopLeftRadius: barHeight / 2,
                borderTopRightRadius: barHeight / 2,
              },
            ]}
            pointerEvents="none"
          />

          {/* Sliding Liquid Glass Active Indicator Pill */}
          {ready && (
            <Animated.View
              style={[
                styles.indicatorWrap,
                { transform: [{ translateX: indicator.x }] },
              ]}
            >
              <Animated.View
                style={[
                  styles.indicator,
                  {
                    width: indicator.w,
                    borderRadius: barHeight,
                    backgroundColor: colors.activeTabPill,
                    borderColor: colors.primarySoft,
                  },
                ]}
              />
            </Animated.View>
          )}

          {/* Tab Icons Row */}
          <View style={styles.row}>
            {state.routes.map((route: any, index: number) => {
              const descriptor = descriptors[route.key];
              const focused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({ type: 'tabLongPress', target: route.key });
              };

              return (
                <TabButton
                  key={route.key}
                  route={route}
                  descriptor={descriptor}
                  focused={focused}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  onLayout={(e: LayoutChangeEvent) => {
                    const { x, width } = e.nativeEvent.layout;
                    layouts.current[route.key] = { x, width };
                    if (focused) moveIndicator(route.key);
                  }}
                  accent={accent}
                  barHeight={barHeight}
                />
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

interface TabButtonProps {
  route: any;
  descriptor: any;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onLayout: (e: LayoutChangeEvent) => void;
  accent: string;
  barHeight: number;
}

function TabButton({
  route,
  descriptor,
  focused,
  onPress,
  onLongPress,
  onLayout,
  accent,
  barHeight,
}: TabButtonProps) {
  const { moderateScale, isDark } = useResponsiveTheme();
  const [scale] = useState(() => new Animated.Value(focused ? 1.05 : 0.94));

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.05 : 0.94,
      damping: 15,
      stiffness: 160,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  const options = descriptor.options;
  const label =
    options.tabBarLabel !== undefined
      ? options.tabBarLabel
      : options.title !== undefined
      ? options.title
      : route.name;

  const iconColor = focused ? accent : (isDark ? '#94A3B8' : '#64748B');
  const iconSize = moderateScale(21);
  const renderIcon = options.tabBarIcon;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onLayout={onLayout}
      android_ripple={{
        color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
        borderless: true,
        radius: 34,
      }}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.tabButtonInner, { height: barHeight - 16, transform: [{ scale }] }]}>
        {typeof renderIcon === 'function'
          ? renderIcon({ focused, color: iconColor, size: iconSize })
          : null}
        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            {
              color: focused ? accent : (isDark ? '#94A3B8' : '#64748B'),
              fontSize: moderateScale(10),
              fontWeight: focused ? '700' : '500',
              marginTop: 2,
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  shadowWrap: {
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 14,
  },
  blur: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  indicatorWrap: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
  },
  indicator: {
    height: '100%',
    borderWidth: 0.8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabLabel: {
    letterSpacing: 0.1,
  },
});

export default FloatingTabBar;
