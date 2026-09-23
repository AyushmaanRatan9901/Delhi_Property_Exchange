import React, { useEffect, useRef } from "react";
import {
  Animated,
  DimensionValue,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../constants/theme";

interface SkeletonBoxProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { isDark } = useResponsiveTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const baseBg = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(203, 213, 225, 0.6)";

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseBg,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ── 1. Tenant Home Screen Skeleton ────────────────────────────────
export const TenantHomeSkeleton: React.FC = () => {
  const { isDark, colors } = useResponsiveTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background : "#F8FAFC",
          paddingTop: insets.top > 0 ? 0 : 10,
        },
      ]}
    >
      {/* Header Skeleton */}
      <View style={[styles.headerRow, { borderBottomColor: isDark ? colors.border : "#E2E8F0" }]}>
        <View style={styles.headerLeft}>
          <SkeletonBox width={46} height={46} borderRadius={23} />
          <View style={{ gap: 6 }}>
            <SkeletonBox width={90} height={12} borderRadius={4} />
            <SkeletonBox width={140} height={16} borderRadius={4} />
          </View>
        </View>
        <SkeletonBox width={40} height={40} borderRadius={20} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Rent Summary Card Skeleton */}
        <View
          style={[
            styles.cardSkeleton,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <SkeletonBox width={36} height={36} borderRadius={10} />
              <View style={{ gap: 4 }}>
                <SkeletonBox width={100} height={14} borderRadius={4} />
                <SkeletonBox width={70} height={11} borderRadius={4} />
              </View>
            </View>
            <SkeletonBox width={90} height={26} borderRadius={13} />
          </View>

          <View style={styles.amountHeroSkeleton}>
            <View style={{ gap: 6 }}>
              <SkeletonBox width={110} height={12} borderRadius={4} />
              <SkeletonBox width={130} height={26} borderRadius={6} />
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <SkeletonBox width={60} height={12} borderRadius={4} />
              <SkeletonBox width={80} height={16} borderRadius={4} />
              <SkeletonBox width={70} height={20} borderRadius={10} />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <SkeletonBox width="60%" height={44} borderRadius={12} />
            <SkeletonBox width="36%" height={44} borderRadius={12} />
          </View>
        </View>

        {/* Quick Actions Grid Skeleton */}
        <View style={{ gap: 10 }}>
          <SkeletonBox width={120} height={16} borderRadius={4} />
          <View style={styles.gridRow}>
            <SkeletonBox width="48%" height={74} borderRadius={14} />
            <SkeletonBox width="48%" height={74} borderRadius={14} />
          </View>
          <View style={styles.gridRow}>
            <SkeletonBox width="48%" height={74} borderRadius={14} />
            <SkeletonBox width="48%" height={74} borderRadius={14} />
          </View>
          <View style={styles.gridRow}>
            <SkeletonBox width="48%" height={74} borderRadius={14} />
            <SkeletonBox width="48%" height={74} borderRadius={14} />
          </View>
        </View>

        {/* My Residence Card Skeleton */}
        <View style={{ gap: 10 }}>
          <View style={styles.rowBetween}>
            <SkeletonBox width={110} height={16} borderRadius={4} />
            <SkeletonBox width={50} height={14} borderRadius={4} />
          </View>
          <View
            style={[
              styles.cardSkeleton,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: isDark ? colors.border : "#E2E8F0",
                padding: 0,
                overflow: "hidden",
              },
            ]}
          >
            <SkeletonBox width="100%" height={160} borderRadius={0} />
            <View style={{ padding: 14, gap: 10 }}>
              <SkeletonBox width="80%" height={16} borderRadius={4} />
              <SkeletonBox width="50%" height={12} borderRadius={4} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <SkeletonBox width={70} height={24} borderRadius={6} />
                <SkeletonBox width={70} height={24} borderRadius={6} />
                <SkeletonBox width={70} height={24} borderRadius={6} />
              </View>
            </View>
          </View>
        </View>

        {/* Notifications Skeleton */}
        <SkeletonBox width="100%" height={60} borderRadius={14} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── 2. Tenant Property Screen Skeleton ────────────────────────────
export const TenantPropertySkeleton: React.FC = () => {
  const { isDark, colors } = useResponsiveTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background : "#F8FAFC",
          paddingTop: insets.top > 0 ? 0 : 10,
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Carousel Skeleton */}
        <SkeletonBox width="100%" height={260} borderRadius={20} />

        {/* Title & Price Header Card */}
        <View
          style={[
            styles.cardSkeleton,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <SkeletonBox width="85%" height={22} borderRadius={6} />
          <SkeletonBox width="60%" height={14} borderRadius={4} />
          <View style={[styles.rowBetween, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: isDark ? colors.border : "#E2E8F0" }]}>
            <SkeletonBox width={120} height={28} borderRadius={6} />
            <SkeletonBox width={100} height={24} borderRadius={12} />
          </View>
        </View>

        {/* Key Specs Grid Skeleton */}
        <View style={styles.gridRow}>
          <SkeletonBox width="48%" height={64} borderRadius={12} />
          <SkeletonBox width="48%" height={64} borderRadius={12} />
        </View>
        <View style={styles.gridRow}>
          <SkeletonBox width="48%" height={64} borderRadius={12} />
          <SkeletonBox width="48%" height={64} borderRadius={12} />
        </View>

        {/* Contract & Agreement Card Skeleton */}
        <View
          style={[
            styles.cardSkeleton,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <SkeletonBox width={140} height={16} borderRadius={4} />
          <View style={{ gap: 8, marginTop: 6 }}>
            <SkeletonBox width="100%" height={14} borderRadius={4} />
            <SkeletonBox width="100%" height={14} borderRadius={4} />
            <SkeletonBox width="80%" height={14} borderRadius={4} />
          </View>
        </View>

        {/* Amenities Pills Skeleton */}
        <View
          style={[
            styles.cardSkeleton,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <SkeletonBox width={130} height={16} borderRadius={4} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <SkeletonBox width={90} height={28} borderRadius={14} />
            <SkeletonBox width={110} height={28} borderRadius={14} />
            <SkeletonBox width={85} height={28} borderRadius={14} />
            <SkeletonBox width={100} height={28} borderRadius={14} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── 3. Tenant Rent Screen Skeleton ────────────────────────────────
export const TenantRentSkeleton: React.FC = () => {
  const { isDark, colors } = useResponsiveTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background : "#F8FAFC",
          paddingTop: insets.top > 0 ? 0 : 10,
        },
      ]}
    >
      <View style={[styles.headerRow, { borderBottomColor: isDark ? colors.border : "#E2E8F0" }]}>
        <View style={{ gap: 4 }}>
          <SkeletonBox width={120} height={20} borderRadius={6} />
          <SkeletonBox width={160} height={12} borderRadius={4} />
        </View>
        <SkeletonBox width={40} height={40} borderRadius={20} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Rent Hero Card Skeleton */}
        <View
          style={[
            styles.cardSkeleton,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.rowBetween}>
            <SkeletonBox width={120} height={18} borderRadius={4} />
            <SkeletonBox width={90} height={24} borderRadius={12} />
          </View>
          <View style={{ marginVertical: 12, gap: 6 }}>
            <SkeletonBox width={90} height={12} borderRadius={4} />
            <SkeletonBox width={160} height={32} borderRadius={6} />
          </View>
          <SkeletonBox width="100%" height={46} borderRadius={12} />
        </View>

        {/* Filter Pills Skeleton */}
        <View style={{ flexDirection: "row", gap: 8, marginVertical: 4 }}>
          <SkeletonBox width={70} height={34} borderRadius={17} />
          <SkeletonBox width={80} height={34} borderRadius={17} />
          <SkeletonBox width={90} height={34} borderRadius={17} />
        </View>

        {/* Transaction Ledger Items Skeleton */}
        <View style={{ gap: 10 }}>
          <SkeletonBox width="100%" height={74} borderRadius={14} />
          <SkeletonBox width="100%" height={74} borderRadius={14} />
          <SkeletonBox width="100%" height={74} borderRadius={14} />
          <SkeletonBox width="100%" height={74} borderRadius={14} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── 4. Tenant Complaints Screen Skeleton ──────────────────────────
export const TenantComplaintsSkeleton: React.FC = () => {
  const { isDark, colors } = useResponsiveTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <View style={[styles.headerRow, { borderBottomColor: isDark ? colors.border : "#E2E8F0", paddingTop: 56 }]}>
        <View style={{ gap: 4 }}>
          <SkeletonBox width={180} height={20} borderRadius={6} />
          <SkeletonBox width={140} height={12} borderRadius={4} />
        </View>
        <SkeletonBox width={100} height={38} borderRadius={19} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar Skeleton */}
        <SkeletonBox width="100%" height={44} borderRadius={12} />

        {/* Filter Pills Skeleton */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <SkeletonBox width={60} height={32} borderRadius={16} />
          <SkeletonBox width={75} height={32} borderRadius={16} />
          <SkeletonBox width={90} height={32} borderRadius={16} />
          <SkeletonBox width={80} height={32} borderRadius={16} />
        </View>

        {/* Complaint Ticket Cards Skeleton */}
        <View style={{ gap: 12, marginTop: 6 }}>
          <SkeletonBox width="100%" height={110} borderRadius={16} />
          <SkeletonBox width="100%" height={110} borderRadius={16} />
          <SkeletonBox width="100%" height={110} borderRadius={16} />
        </View>
      </ScrollView>
    </View>
  );
};

// ── 5. Tenant Profile Screen Skeleton ─────────────────────────────
export const TenantProfileSkeleton: React.FC = () => {
  const { isDark, colors } = useResponsiveTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <View style={[styles.headerRow, { borderBottomColor: isDark ? colors.border : "#E2E8F0", paddingTop: 56 }]}>
        <SkeletonBox width={140} height={22} borderRadius={6} />
        <SkeletonBox width={36} height={36} borderRadius={18} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Skeleton */}
        <View
          style={[
            styles.cardSkeleton,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
              alignItems: "center",
              paddingVertical: 20,
            },
          ]}
        >
          <SkeletonBox width={80} height={80} borderRadius={40} />
          <View style={{ alignItems: "center", gap: 6, marginTop: 12, width: "100%" }}>
            <SkeletonBox width={140} height={18} borderRadius={6} />
            <SkeletonBox width={110} height={20} borderRadius={6} />
            <SkeletonBox width={180} height={14} borderRadius={4} />
          </View>
          <SkeletonBox width={140} height={36} borderRadius={18} style={{ marginTop: 12 }} />
        </View>

        {/* KYC Aadhaar Card Skeleton */}
        <View
          style={[
            styles.cardSkeleton,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <SkeletonBox width={36} height={36} borderRadius={10} />
              <View style={{ gap: 4 }}>
                <SkeletonBox width={140} height={14} borderRadius={4} />
                <SkeletonBox width={110} height={11} borderRadius={4} />
              </View>
            </View>
            <SkeletonBox width={80} height={22} borderRadius={6} />
          </View>
          <SkeletonBox width="100%" height={50} borderRadius={12} style={{ marginTop: 10 }} />
        </View>

        {/* Contract Terms Grid Skeleton */}
        <View
          style={[
            styles.cardSkeleton,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <SkeletonBox width={150} height={16} borderRadius={4} />
          <View style={[styles.gridRow, { marginTop: 10 }]}>
            <SkeletonBox width="48%" height={40} borderRadius={8} />
            <SkeletonBox width="48%" height={40} borderRadius={8} />
          </View>
          <View style={styles.gridRow}>
            <SkeletonBox width="48%" height={40} borderRadius={8} />
            <SkeletonBox width="48%" height={40} borderRadius={8} />
          </View>
        </View>

        {/* Menu Cards Skeleton */}
        <SkeletonBox width="100%" height={140} borderRadius={16} />
      </ScrollView>
    </View>
  );
};

// ── 6. Tenant Documents Screen Skeleton ───────────────────────────
export const TenantDocumentsSkeleton: React.FC = () => {
  const { isDark, colors } = useResponsiveTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <View style={[styles.headerRow, { borderBottomColor: isDark ? colors.border : "#E2E8F0", paddingTop: 56 }]}>
        <SkeletonBox width={36} height={36} borderRadius={18} />
        <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
          <SkeletonBox width={160} height={18} borderRadius={6} />
          <SkeletonBox width={120} height={12} borderRadius={4} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SkeletonBox width="100%" height={74} borderRadius={14} />
        <SkeletonBox width={130} height={16} borderRadius={4} style={{ marginTop: 8 }} />
        <View style={{ gap: 10 }}>
          <SkeletonBox width="100%" height={80} borderRadius={14} />
          <SkeletonBox width="100%" height={80} borderRadius={14} />
          <SkeletonBox width="100%" height={80} borderRadius={14} />
          <SkeletonBox width="100%" height={80} borderRadius={14} />
        </View>
      </ScrollView>
    </View>
  );
};

// ── 7. Tenant Inspections Screen Skeleton ─────────────────────────
export const TenantInspectionsSkeleton: React.FC = () => {
  const { isDark, colors } = useResponsiveTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <View style={[styles.headerRow, { borderBottomColor: isDark ? colors.border : "#E2E8F0", paddingTop: 56 }]}>
        <SkeletonBox width={36} height={36} borderRadius={18} />
        <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
          <SkeletonBox width={160} height={18} borderRadius={6} />
          <SkeletonBox width={130} height={12} borderRadius={4} />
        </View>
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 12 }}>
        <SkeletonBox width="30%" height={34} borderRadius={8} />
        <SkeletonBox width="30%" height={34} borderRadius={8} />
        <SkeletonBox width="30%" height={34} borderRadius={8} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SkeletonBox width="100%" height={160} borderRadius={16} />
        <SkeletonBox width="100%" height={160} borderRadius={16} />
      </ScrollView>
    </View>
  );
};

// ── 8. Tenant Room Change Screen Skeleton ─────────────────────────
export const TenantRoomChangeSkeleton: React.FC = () => {
  const { isDark, colors } = useResponsiveTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <View style={[styles.headerRow, { borderBottomColor: isDark ? colors.border : "#E2E8F0", paddingTop: 56 }]}>
        <SkeletonBox width={36} height={36} borderRadius={18} />
        <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
          <SkeletonBox width={160} height={18} borderRadius={6} />
          <SkeletonBox width={140} height={12} borderRadius={4} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SkeletonBox width="100%" height={80} borderRadius={14} />
        <SkeletonBox width={150} height={16} borderRadius={4} style={{ marginTop: 8 }} />
        <SkeletonBox width="100%" height={130} borderRadius={16} />
        <SkeletonBox width="100%" height={130} borderRadius={16} />
      </ScrollView>
    </View>
  );
};

// ── 9. Tenant Notifications Screen Skeleton ───────────────────────
export const TenantNotificationsSkeleton: React.FC = () => {
  const { isDark, colors } = useResponsiveTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <View style={[styles.headerRow, { borderBottomColor: isDark ? colors.border : "#E2E8F0", paddingTop: 56 }]}>
        <SkeletonBox width={36} height={36} borderRadius={18} />
        <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
          <SkeletonBox width={130} height={18} borderRadius={6} />
          <SkeletonBox width={100} height={12} borderRadius={4} />
        </View>
        <SkeletonBox width={70} height={28} borderRadius={14} />
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        <SkeletonBox width={50} height={30} borderRadius={15} />
        <SkeletonBox width={75} height={30} borderRadius={15} />
        <SkeletonBox width={85} height={30} borderRadius={15} />
        <SkeletonBox width={70} height={30} borderRadius={15} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 10 }}>
          <SkeletonBox width="100%" height={74} borderRadius={14} />
          <SkeletonBox width="100%" height={74} borderRadius={14} />
          <SkeletonBox width="100%" height={74} borderRadius={14} />
          <SkeletonBox width="100%" height={74} borderRadius={14} />
          <SkeletonBox width="100%" height={74} borderRadius={14} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  cardSkeleton: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountHeroSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
