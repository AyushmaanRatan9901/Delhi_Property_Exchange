import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantQuickActionsGridProps {
  onPayRent: () => void;
  onViewProperty: () => void;
  onRaiseComplaint: () => void;
  onRoomChange: () => void;
  onViewDocuments: () => void;
  onViewInspections: () => void;
  onViewNotifications: () => void;
  unreadNotificationsCount?: number;
  openComplaintsCount?: number;
  upcomingInspectionsCount?: number;
}

export const TenantQuickActionsGrid: React.FC<TenantQuickActionsGridProps> = ({
  onPayRent,
  onViewProperty,
  onRaiseComplaint,
  onRoomChange,
  onViewDocuments,
  onViewInspections,
  onViewNotifications,
  unreadNotificationsCount = 0,
  openComplaintsCount = 0,
  upcomingInspectionsCount = 0,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const actions = [
    {
      id: "pay",
      title: "Pay Rent",
      subtitle: "Zero fee UPI",
      icon: "flash" as const,
      family: "ionicons" as const,
      color: "#0284C7",
      bgLight: "#F0F9FF",
      bgDark: "#0C293D",
      badge: null,
      onPress: onPayRent,
    },
    {
      id: "complaint",
      title: "Raise Issue",
      subtitle: "Fast repairs",
      icon: "construct" as const,
      family: "ionicons" as const,
      color: "#D97706",
      bgLight: "#FEF3C7",
      bgDark: "#2E1E08",
      badge: openComplaintsCount > 0 ? `${openComplaintsCount} Active` : null,
      badgeColor: "#F59E0B",
      onPress: onRaiseComplaint,
    },
    {
      id: "room",
      title: "Room Change",
      subtitle: "Transfer unit",
      icon: "swap-horizontal" as const,
      family: "ionicons" as const,
      color: "#8B5CF6",
      bgLight: "#F5F3FF",
      bgDark: "#241842",
      badge: null,
      onPress: onRoomChange,
    },
    {
      id: "property",
      title: "My Property",
      subtitle: "Flat info & BHK",
      icon: "business" as const,
      family: "ionicons" as const,
      color: "#0D9488",
      bgLight: "#F0FDFA",
      bgDark: "#082F2C",
      badge: null,
      onPress: onViewProperty,
    },
    {
      id: "docs",
      title: "Documents",
      subtitle: "Agreement & PVC",
      icon: "document-text" as const,
      family: "ionicons" as const,
      color: "#2563EB",
      bgLight: "#EFF6FF",
      bgDark: "#0E244D",
      badge: "Verified",
      badgeColor: "#10B981",
      onPress: onViewDocuments,
    },
    {
      id: "inspections",
      title: "Inspections",
      subtitle: "Audit reports",
      icon: "shield-checkmark" as const,
      family: "ionicons" as const,
      color: "#059669",
      bgLight: "#ECFDF5",
      bgDark: "#062A1C",
      badge: upcomingInspectionsCount > 0 ? `${upcomingInspectionsCount} Due` : null,
      badgeColor: "#059669",
      onPress: onViewInspections,
    },
    {
      id: "notifs",
      title: "Notifications",
      subtitle: "Alerts & feed",
      icon: "notifications" as const,
      family: "ionicons" as const,
      color: "#E11D48",
      bgLight: "#FFF1F2",
      bgDark: "#380D17",
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} New` : null,
      badgeColor: "#E11D48",
      onPress: onViewNotifications,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
        Quick Services
      </Text>

      <View style={styles.grid}>
        {actions.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.actionCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
            ]}
            onPress={item.onPress}
            activeOpacity={0.75}
          >
            {/* Top Icon & Badge */}
            <View style={styles.cardTopRow}>
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: isDark ? item.bgDark : item.bgLight },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>

              {item.badge && (
                <View style={[styles.badgePill, { backgroundColor: item.badgeColor || item.color }]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </View>

            {/* Labels */}
            <Text style={[styles.actionTitle, { color: isDark ? colors.textPrimary : "#1E293B" }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.actionSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionCard: {
    width: "48.2%",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "800",
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  actionSubtitle: {
    fontSize: 11.5,
    fontWeight: "500",
  },
});
