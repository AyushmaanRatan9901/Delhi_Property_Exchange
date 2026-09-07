import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useResponsiveTheme } from "../../../constants/theme";

export interface LeadInquiryItem {
  id: string;
  clientName: string;
  clientType: "Student" | "Working Pro" | "Family";
  propertyTitle: string;
  inquiryType: "Visit Requested" | "Rent Query" | "Deposit Paid";
  timeAgo: string;
  phone: string;
  budget: number;
}

interface RecentInquiriesPulseProps {
  inquiries?: LeadInquiryItem[];
  onCallClient?: (phone: string, name: string) => void;
  onViewAllLeads?: () => void;
}

const DEFAULT_INQUIRIES: LeadInquiryItem[] = [
  {
    id: "lead-1",
    clientName: "Aarav Sharma",
    clientType: "Student",
    propertyTitle: "Dwarka Sector 12 Girls PG",
    inquiryType: "Visit Requested",
    timeAgo: "10 mins ago",
    phone: "+91 98765 43210",
    budget: 13500,
  },
  {
    id: "lead-2",
    clientName: "Pooja Malhotra",
    clientType: "Working Pro",
    propertyTitle: "Janakpuri West Boys Hostel",
    inquiryType: "Deposit Paid",
    timeAgo: "45 mins ago",
    phone: "+91 98123 45678",
    budget: 9500,
  },
  {
    id: "lead-3",
    clientName: "Rohan Verma",
    clientType: "Working Pro",
    propertyTitle: "Uttam Nagar Studio",
    inquiryType: "Rent Query",
    timeAgo: "2 hours ago",
    phone: "+91 97654 32109",
    budget: 12000,
  },
];

export const RecentInquiriesPulse: React.FC<RecentInquiriesPulseProps> = ({
  inquiries = DEFAULT_INQUIRIES,
  onCallClient,
  onViewAllLeads,
}) => {
  const { colors, moderateScale, spacing, radii, typography, layout, shadows, isDark } =
    useResponsiveTheme();

  const getInquiryBadge = (type: LeadInquiryItem["inquiryType"]) => {
    switch (type) {
      case "Deposit Paid":
        return {
          bg: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5",
          text: "#059669",
          icon: "cash-check",
        };
      case "Visit Requested":
        return {
          bg: isDark ? "rgba(2, 132, 199, 0.15)" : "#F0F9FF",
          text: "#0284C7",
          icon: "calendar-clock",
        };
      case "Rent Query":
        return {
          bg: isDark ? "rgba(245, 158, 11, 0.15)" : "#FEF3C7",
          text: "#D97706",
          icon: "message-text-outline",
        };
      default:
        return {
          bg: isDark ? colors.surfaceHover : "#F1F5F9",
          text: colors.textSecondary,
          icon: "information-outline",
        };
    }
  };

  return (
    <View
      style={{
        paddingHorizontal: spacing.screenHorizontal,
        marginTop: spacing.lg,
      }}
    >
      {/* Header */}
      <View style={[layout.horizontalViewBetween, { marginBottom: spacing.xs + 2 }]}>
        <View style={[layout.horizontalView, { alignItems: "center", gap: 5 }]}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={moderateScale(19)}
            color={colors.primary}
          />
          <Text
            style={[
              typography.sectionTitle,
              {
                fontSize: moderateScale(15),
                fontWeight: "800",
                color: colors.textPrimary,
              },
            ]}
          >
            Live Inquiries & Visit Leads
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={
            onViewAllLeads ||
            (() =>
              Alert.alert(
                "Lead Pipeline",
                "Total 18 active inquiries across your listed properties."
              ))
          }
          style={[layout.horizontalView, { alignItems: "center" }]}
        >
          <Text
            style={{
              fontSize: moderateScale(12),
              fontWeight: "700",
              color: colors.primary,
              marginRight: 2,
            }}
          >
            Lead Tracker
          </Text>
          <Feather
            name="chevron-right"
            size={moderateScale(14)}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Inquiry Rows */}
      <View style={{ gap: spacing.xs + 2 }}>
        {inquiries.map((item) => {
          const badgeMeta = getInquiryBadge(item.inquiryType);

          return (
            <View
              key={item.id}
              style={[
                styles.leadCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.border,
                  borderRadius: radii.xl,
                  padding: spacing.md,
                },
                shadows.sm,
              ]}
            >
              <View style={[layout.horizontalViewBetween, { alignItems: "center" }]}>
                {/* Client Info */}
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <View style={[layout.horizontalView, { alignItems: "center", gap: 6 }]}>
                    <Text
                      style={[
                        typography.cardTitle,
                        {
                          fontSize: moderateScale(13.5),
                          fontWeight: "800",
                          color: colors.textPrimary,
                        },
                      ]}
                    >
                      {item.clientName}
                    </Text>

                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: badgeMeta.bg,
                          borderRadius: radii.pill,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: moderateScale(9),
                          fontWeight: "800",
                          color: badgeMeta.text,
                        }}
                      >
                        {item.inquiryType}
                      </Text>
                    </View>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: moderateScale(11),
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    🏢 For: {item.propertyTitle}
                  </Text>

                  <Text
                    style={{
                      fontSize: moderateScale(10),
                      color: colors.textMuted,
                      marginTop: 2,
                    }}
                  >
                    ⏱️ {item.timeAgo} • Budget: ₹{item.budget.toLocaleString("en-IN")}
                  </Text>
                </View>

                {/* Call & Chat Buttons */}
                <View style={[layout.horizontalView, { gap: 6 }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      Alert.alert("WhatsApp Chat", `Opening WhatsApp chat with ${item.clientName}`)
                    }
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: isDark
                          ? colors.surfaceHover
                          : "#F1F5F9",
                        borderColor: colors.border,
                        borderRadius: radii.pill,
                        width: moderateScale(34),
                        height: moderateScale(34),
                      },
                    ]}
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={moderateScale(15)}
                      color={colors.textPrimary}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      onCallClient?.(item.phone, item.clientName) ||
                      Alert.alert(
                        "Connecting Call",
                        `Calling tenant lead ${item.clientName} (${item.phone})`
                      )
                    }
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: colors.primary,
                        borderRadius: radii.pill,
                        width: moderateScale(34),
                        height: moderateScale(34),
                      },
                    ]}
                  >
                    <Feather
                      name="phone"
                      size={moderateScale(14)}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  leadCard: {
    borderWidth: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
});
