import React, { createContext, useContext, useState } from "react";
import {
  useColorScheme as _useColorScheme,
  Dimensions,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";

// Base Guideline dimensions (Standard Mobile Device - iPhone 14 / modern Android: 390 x 844)
const GUIDELINE_BASE_WIDTH = 390;
const GUIDELINE_BASE_HEIGHT = 844;

/**
 * Scale element horizontally based on standard screen width
 */
export const scale = (size: number): number => {
  const currentWidth = Dimensions.get("window").width;
  return (currentWidth / GUIDELINE_BASE_WIDTH) * size;
};

/**
 * Scale element vertically based on standard screen height
 */
export const verticalScale = (size: number): number => {
  const currentHeight = Dimensions.get("window").height;
  return (currentHeight / GUIDELINE_BASE_HEIGHT) * size;
};

/**
 * Moderately scale element with customizable factor
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Percentage of screen width (e.g. wp(50) = 50% of screen width)
 */
export const wp = (percentage: number): number => {
  const currentWidth = Dimensions.get("window").width;
  return (percentage * currentWidth) / 100;
};

/**
 * Percentage of screen height (e.g. hp(50) = 50% of screen height)
 */
export const hp = (percentage: number): number => {
  const currentHeight = Dimensions.get("window").height;
  return (percentage * currentHeight) / 100;
};

/**
 * Color Palettes for Light & Dark Mode
 */
export const LightColors = {
  // Brand Primary (Emerald Teal Palette)
  primary: "#0d9488", // Vibrant Emerald Teal - Fresh, Trustworthy, Comforting
  primaryDark: "#0f766e", // Deep Emerald Teal hover
  primaryLight: "#ccfbf1", // Soft mint teal light background
  primarySoft: "#99f6e4", // Soft teal border
  primaryGradientStart: "#0d9488",
  primaryGradientEnd: "#0f766e",

  // Secondary & Accents
  secondary: "#0f766e",
  secondaryLight: "#ccfbf1",
  secondaryBg: "#f0fdfa",

  // Category Accents
  roomPink: "#ea4335",
  roomPinkLight: "#fef2f2",
  roomPinkSoft: "#fee2e2",
  roomPinkBorder: "#fca5a5",

  pgBlue: "#0284c7",
  pgBlueLight: "#f0f9ff",
  pgBlueSoft: "#e0f2fe",
  pgBlueBorder: "#bae6fd",

  // Status & Badges
  verifiedGreen: "#047857",
  verifiedGreenDark: "#00875a",
  verifiedBg: "#ecfdf5",
  verifiedBorder: "#a7f3d0",
  priceGreen: "#00875a",

  // Location System
  locationPinRed: "#ea4335",
  locationAccentBg: "#ccfbf1",
  locationAccentBorder: "#99f6e4",
  locationAccentText: "#0f766e",
  locationGreenBtn: "#00875a",

  ratingYellow: "#f59e0b",
  favoriteRed: "#ea4335",
  notificationRed: "#ea4335",

  // Neutrals & Text (High-Contrast Obsidian Charcoal Text Palette)
  white: "#ffffff",
  black: "#000000",
  textPrimary: "#0f172a", // Deep obsidian charcoal for maximum title readability
  textSecondary: "#1e293b", // Rich slate for body text
  textMuted: "#475569", // Medium dark slate for metadata & location tags
  textLight: "#cbd5e1",

  // Backgrounds & Surfaces
  background: "#f8fafc", // --bg-main: #f8fafc
  backgroundSecondary: "#f1f5f9", // --bg-subtle: #f1f5f9
  cardBackground: "#ffffff", // --bg-card: #ffffff
  surfaceLight: "#f8fafc",
  surfaceHover: "#f1f5f9",

  // Borders & Dividers
  border: "#cbd5e1", // --border-color: #cbd5e1
  borderLight: "#e2e8f0",
  divider: "#cbd5e1",

  // Navigation & Tab Bar
  tabBarBg: "#ffffff",
  tabBarBorder: "#cbd5e1",
  activeTabPill: "#ccfbf1",

  // Glassmorphism & Translucents
  glassWhite: "rgba(255, 255, 255, 0.94)",
  glassCard: "rgba(255, 255, 255, 0.85)",
  glassBorder: "rgba(203, 213, 225, 0.6)",
  overlayDark: "rgba(15, 23, 42, 0.5)",
  overlayLight: "rgba(255, 255, 255, 0.4)",
};

export const DarkColors = {
  // Brand Primary (Dark Mode Mint Teal Palette)
  primary: "#14b8a6", // Bright Mint Teal for Dark Mode
  primaryDark: "#2dd4bf", // Mint Teal hover
  primaryLight: "#132a2f", // Dark teal light background
  primarySoft: "#115e59", // Dark teal border
  primaryGradientStart: "#14b8a6",
  primaryGradientEnd: "#0d9488",

  // Secondary & Accents
  secondary: "#2dd4bf",
  secondaryLight: "#132a2f",
  secondaryBg: "#0f2e2e",

  // Category Accents
  roomPink: "#f87171",
  roomPinkLight: "rgba(248, 113, 113, 0.15)",
  roomPinkSoft: "#381a1a",
  roomPinkBorder: "#5c2424",

  pgBlue: "#38bdf8",
  pgBlueLight: "rgba(56, 189, 248, 0.15)",
  pgBlueSoft: "#13334c",
  pgBlueBorder: "#1e4d6d",

  // Status & Badges
  verifiedGreen: "#6ee7b7",
  verifiedGreenDark: "#059669",
  verifiedBg: "rgba(6, 78, 59, 0.7)",
  verifiedBorder: "#047857",
  priceGreen: "#2dd4bf",

  // Location System
  locationPinRed: "#f87171",
  locationAccentBg: "#132a2f",
  locationAccentBorder: "#115e59",
  locationAccentText: "#2dd4bf",
  locationGreenBtn: "#059669",

  ratingYellow: "#fbbf24",
  favoriteRed: "#f87171",
  notificationRed: "#f87171",

  // Neutrals & Text (Dark Mode Text Palette)
  white: "#ffffff",
  black: "#000000",
  textPrimary: "#ffffff", // Pure White for headings
  textSecondary: "#e2e8f0", // Crisp Ice Slate for body text
  textMuted: "#94a3b8", // Light Slate for captions
  textLight: "#64748b",

  // Backgrounds & Surfaces
  background: "#06111e", // --bg-main: #06111e
  backgroundSecondary: "#172a3a", // --bg-subtle: #172a3a
  cardBackground: "#0d1b2a", // --bg-card: #0d1b2a
  surfaceLight: "#172a3a", // Inner Container / Inputs
  surfaceHover: "#1c3347", // Active / Hover Pills

  // Borders & Dividers
  border: "#264653", // --border-color: #264653
  borderLight: "#1b323c", // Subdued divider
  divider: "#264653",

  // Navigation & Tab Bar
  tabBarBg: "#0d1b2a",
  tabBarBorder: "#264653",
  activeTabPill: "rgba(20, 184, 166, 0.18)",

  // Glassmorphism & Translucents
  glassWhite: "rgba(13, 27, 42, 0.94)",
  glassCard: "rgba(13, 27, 42, 0.84)",
  glassBorder: "rgba(38, 70, 83, 0.6)",
  overlayDark: "rgba(0, 0, 0, 0.75)",
  overlayLight: "rgba(255, 255, 255, 0.12)",
};

export const Colors = {
  light: LightColors,
  dark: DarkColors,
  ...LightColors,
};

export type ThemeColor = keyof typeof LightColors;
export type ThemeMode = "light" | "dark" | "system";

/**
 * Linear Gradient Configurations
 */
export const getThemeGradients = (isDark: boolean) => ({
  primary: isDark
    ? (["#14b8a6", "#0d9488"] as const)
    : (["#0d9488", "#0f766e"] as const),
  purple: isDark
    ? (["#0f766e", "#115e59"] as const)
    : (["#0d9488", "#0f766e"] as const),
  heroBanner: isDark
    ? (["#0d1b2a", "#132a2f", "#06111e"] as const)
    : (["#f8fafc", "#ccfbf1", "#f1f5f9"] as const),
  heroCardBg: isDark
    ? ([
        "rgba(13, 27, 42, 0.96)",
        "rgba(19, 42, 47, 0.96)",
        "rgba(6, 17, 30, 0.96)",
      ] as const)
    : ([
        "rgba(255, 255, 255, 0.96)",
        "rgba(204, 251, 241, 0.92)",
        "rgba(241, 245, 249, 0.90)",
      ] as const),
  heroGlass: isDark
    ? (["rgba(13, 27, 42, 0.94)", "rgba(6, 17, 30, 0.92)"] as const)
    : (["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.65)"] as const),
  roomCard: isDark
    ? (["#1a1520", "#2d1a24"] as const)
    : (["#fef2f2", "#fee2e2"] as const),
  pgCard: isDark
    ? (["#0b1e2c", "#102e42"] as const)
    : (["#f0f9ff", "#e0f2fe"] as const),
  cardOverlay: ["transparent", "rgba(6, 17, 30, 0.88)"] as const,
  searchGlass: isDark
    ? (["rgba(13, 27, 42, 0.95)", "rgba(13, 27, 42, 0.85)"] as const)
    : (["rgba(255, 255, 255, 0.95)", "rgba(255, 255, 255, 0.85)"] as const),
  filterPill: isDark
    ? (["#14b8a6", "#0d9488"] as const)
    : (["#0d9488", "#0f766e"] as const),
  bottomNav: isDark
    ? (["rgba(13, 27, 42, 0.98)", "#06111e"] as const)
    : (["rgba(255, 255, 255, 0.95)", "#f8fafc"] as const),
  badgeVerified: isDark
    ? (["#059669", "#047857"] as const)
    : (["#047857", "#00875a"] as const),
});

export const Gradients = getThemeGradients(false);

/**
 * Dynamic Spacing Tokens
 */
const getDynamicSpacing = (ms: (size: number) => number) => ({
  none: 0,
  half: ms(2),
  one: ms(4),
  two: ms(8),
  three: ms(12),
  four: ms(16),
  five: ms(20),
  six: ms(24),
  xxs: ms(2),
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(20),
  xxl: ms(24),
  xxxl: ms(32),
  huge: ms(40),
  screenHorizontal: ms(16),
  screenVertical: ms(12),
  cardPadding: ms(14),
  gutter: ms(12),
});

export const Spacing = getDynamicSpacing(moderateScale);

/**
 * Dynamic Border Radii Tokens
 */
const getDynamicRadii = (ms: (size: number) => number) => ({
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(20),
  xxl: ms(24),
  hero: ms(28),
  card: ms(20),
  pill: 9999,
  round: 9999,
});

export const Radii = getDynamicRadii(moderateScale);

/**
 * Font definitions
 */
export const Fonts = {
  regular: Platform.select({ ios: "System", default: "sans-serif" }),
  medium: Platform.select({ ios: "System", default: "sans-serif-medium" }),
  bold: Platform.select({ ios: "System", default: "sans-serif" }),
  semiBold: Platform.select({ ios: "System", default: "sans-serif-medium" }),
};

/**
 * Dynamic Typography Tokens
 */
const getDynamicTypography = (
  ms: (size: number) => number,
  colors: typeof LightColors,
  fontScale = 1,
) => {
  const adjust = (size: number) => Math.round(ms(size) / fontScale);

  return {
    brandTitle: {
      fontSize: adjust(22),
      fontWeight: "800" as const,
      letterSpacing: -0.5,
      color: colors.textPrimary,
    },
    brandHighlight: {
      fontSize: adjust(22),
      fontWeight: "800" as const,
      letterSpacing: -0.5,
      color: colors.primary,
    },
    brandTagline: {
      fontSize: adjust(11),
      fontWeight: "500" as const,
      color: colors.textMuted,
    },
    heroTitle: {
      fontSize: adjust(22),
      fontWeight: "800" as const,
      lineHeight: adjust(28),
      color: colors.textPrimary,
    },
    heroTitleAccent: {
      fontSize: adjust(25),
      fontWeight: "700" as const,
      fontStyle: "italic" as const,
      color: colors.primary,
    },
    sectionTitle: {
      fontSize: adjust(17),
      fontWeight: "700" as const,
      color: colors.textPrimary,
      letterSpacing: -0.2,
    },
    sectionSeeAll: {
      fontSize: adjust(13),
      fontWeight: "600" as const,
      color: colors.primary,
    },
    cardTitle: {
      fontSize: adjust(15),
      fontWeight: "700" as const,
      color: colors.textPrimary,
    },
    cardPrice: {
      fontSize: adjust(14),
      fontWeight: "700" as const,
      color: colors.priceGreen,
    },
    cardPriceUnit: {
      fontSize: adjust(12),
      fontWeight: "500" as const,
      color: colors.priceGreen,
    },
    cardLocation: {
      fontSize: adjust(12),
      fontWeight: "400" as const,
      color: colors.textSecondary,
    },
    cardAmenity: {
      fontSize: adjust(11),
      fontWeight: "400" as const,
      color: colors.textSecondary,
    },
    categoryTitle: {
      fontSize: adjust(15),
      fontWeight: "800" as const,
      color: colors.textPrimary,
      letterSpacing: 0.5,
    },
    categorySubtitle: {
      fontSize: adjust(11),
      fontWeight: "400" as const,
      color: colors.textSecondary,
    },
    filterChipText: {
      fontSize: adjust(13),
      fontWeight: "600" as const,
    },
    locationBarText: {
      fontSize: adjust(14),
      fontWeight: "700" as const,
      color: colors.textPrimary,
    },
    locationChangeBtn: {
      fontSize: adjust(12),
      fontWeight: "600" as const,
      color: colors.secondary,
    },
    badgeText: {
      fontSize: adjust(11),
      fontWeight: "600" as const,
    },
    tabLabel: {
      fontSize: adjust(11),
      fontWeight: "600" as const,
    },
  };
};

export const Typography = getDynamicTypography(moderateScale, LightColors);

/**
 * Responsive Shadows / Elevation
 */
export const Shadows = StyleSheet.create({
  none: {
    elevation: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  hero: {
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  card: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  floating: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
  categoryPink: {
    shadowColor: "#FF385C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  categoryBlue: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
});

/**
 * Standard Reusable Horizontal View & Flex Layout Styles
 */
export const LayoutStyles = StyleSheet.create({
  horizontalView: {
    flexDirection: "row",
    alignItems: "center",
  },
  horizontalViewBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  horizontalViewCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  horizontalViewStart: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  horizontalViewEnd: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  horizontalViewWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  alignCenter: {
    alignItems: "center",
  },
  justifyCenter: {
    justifyContent: "center",
  },
  fullFlex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: moderateScale(100),
  },
});

/**
 * Global Theme Context & Provider
 */
interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "system",
  isDark: false,
  setThemeMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  initialMode?: ThemeMode;
}> = ({ children, initialMode = "system" }) => {
  const systemColorScheme = _useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return React.createElement(
    ThemeContext.Provider,
    { value: { themeMode, isDark, setThemeMode, toggleTheme } },
    children,
  );
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Comprehensive Responsive & Themed Hook
 */
export const useResponsiveTheme = () => {
  const { width, height, fontScale } = useWindowDimensions();
  const { isDark, themeMode, toggleTheme, setThemeMode } = useTheme();

  const isPortrait = height >= width;
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;
  const isSmallDevice = Math.min(width, height) < 375;
  const aspectRatio = height / width;

  const dynamicScale = (size: number) => (width / GUIDELINE_BASE_WIDTH) * size;
  const dynamicVerticalScale = (size: number) =>
    (height / GUIDELINE_BASE_HEIGHT) * size;
  const dynamicModerateScale = (size: number, factor = 0.5) =>
    size + (dynamicScale(size) - size) * factor;
  const dynamicWp = (percent: number) => (percent * width) / 100;
  const dynamicHp = (percent: number) => (percent * height) / 100;

  const activeColors = isDark ? DarkColors : LightColors;
  const activeGradients = getThemeGradients(isDark);
  const activeTypography = getDynamicTypography(
    dynamicModerateScale,
    activeColors,
    fontScale,
  );

  return {
    width,
    height,
    fontScale,
    isDark,
    themeMode,
    toggleTheme,
    setThemeMode,
    isPortrait,
    isLandscape,
    isTablet,
    isSmallDevice,
    aspectRatio,
    scale: dynamicScale,
    verticalScale: dynamicVerticalScale,
    moderateScale: dynamicModerateScale,
    wp: dynamicWp,
    hp: dynamicHp,
    colors: activeColors,
    gradients: activeGradients,
    spacing: getDynamicSpacing(dynamicModerateScale),
    radii: getDynamicRadii(dynamicModerateScale),
    typography: activeTypography,
    shadows: Shadows,
    layout: LayoutStyles,
  };
};

export default {
  scale,
  verticalScale,
  moderateScale,
  wp,
  hp,
  useResponsiveTheme,
  useTheme,
  ThemeProvider,
  LightColors,
  DarkColors,
  Colors,
  Gradients,
  Spacing,
  Radii,
  Typography,
  Shadows,
  LayoutStyles,
  Fonts,
};
