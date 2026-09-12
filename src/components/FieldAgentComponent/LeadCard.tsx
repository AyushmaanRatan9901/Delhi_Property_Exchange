import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  formatCurrency,
  LeadItem,
  LeadStatus,
} from "../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../constants/theme";

interface LeadCardProps {
  lead: LeadItem;
  onPress: (lead: LeadItem) => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onPress }) => {
  const { isDark, colors, moderateScale } = useResponsiveTheme();

  const STATUS_CONFIG: Record<
    LeadStatus,
    {
      label: string;
      bg: string;
      text: string;
      icon: keyof typeof Ionicons.glyphMap;
    }
  > = {
    NEW: {
      label: "Under Verification",
      bg: isDark ? "#2E1E08" : "#FEF3C7",
      text: isDark ? "#FCD34D" : "#B45309",
      icon: "time-outline",
    },
    VERIFIED: {
      label: "Verified & Listed",
      bg: isDark ? "#082F2C" : "#CCFBF1",
      text: isDark ? "#2DD4BF" : "#0F766E",
      icon: "shield-checkmark-outline",
    },
    RENTED: {
      label: "Rented Out",
      bg: isDark ? "#0E2440" : "#DBEAFE",
      text: isDark ? "#60A5FA" : "#1E40AF",
      icon: "key-outline",
    },
    SOLD: {
      label: "Sold Out",
      bg: isDark ? "#2E1B4D" : "#F3E8FF",
      text: isDark ? "#C084FC" : "#7E22CE",
      icon: "checkmark-done-circle-outline",
    },
    REJECTED: {
      label: "Needs Info",
      bg: isDark ? "#331111" : "#FEE2E2",
      text: isDark ? "#F87171" : "#B91C1C",
      icon: "alert-circle-outline",
    },
  };

  const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
  const isRentedOrSold = lead.status === "RENTED" || lead.status === "SOLD";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(lead)}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
          borderColor: isDark ? colors.border : "#E2E8F0",
        },
      ]}
    >
      {/* Top Bar: Lead ID + Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.idAndTypeRow}>
          <Text
            style={[
              styles.leadId,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
          >
            {lead.id}
          </Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                { color: isDark ? colors.textSecondary : "#475569" },
              ]}
            >
              {lead.propertyType}
            </Text>
          </View>
          <View
            style={[
              styles.listingBadge,
              lead.listingType === "SALE"
                ? isDark
                  ? { backgroundColor: "#2E1B4D" }
                  : styles.saleBadge
                : isDark
                ? { backgroundColor: "#082F2C" }
                : styles.rentBadge,
            ]}
          >
            <Text
              style={[
                styles.listingBadgeText,
                lead.listingType === "SALE"
                  ? isDark
                    ? { color: "#C084FC" }
                    : styles.saleText
                  : isDark
                  ? { color: "#2DD4BF" }
                  : styles.rentText,
              ]}
            >
              {lead.listingType === "SALE" ? "For Sale" : "For Rent"}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Ionicons name={statusCfg.icon} size={12} color={statusCfg.text} />
          <Text style={[styles.statusText, { color: statusCfg.text }]}>
            {statusCfg.label}
          </Text>
        </View>
      </View>

      {/* Main Body */}
      <View style={styles.bodyRow}>
        {lead.photos && lead.photos.length > 0 ? (
          <Image source={{ uri: lead.photos[0] }} style={styles.thumbImage} />
        ) : (
          <View
            style={[
              styles.placeholderThumb,
              {
                backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
            ]}
          >
            <Feather
              name="home"
              size={moderateScale(24)}
              color={isDark ? colors.textMuted : "#94A3B8"}
            />
          </View>
        )}

        <View style={styles.detailsCol}>
          {/* Locality & Address */}
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color="#EF4444" />
            <Text
              style={[
                styles.locationText,
                { color: isDark ? colors.textSecondary : "#475569" },
              ]}
              numberOfLines={1}
            >
              {lead.locality}
            </Text>
          </View>

          {/* Price */}
          <Text style={[styles.priceText, { color: isDark ? "#2DD4BF" : "#0D9488" }]}>
            {formatCurrency(lead.expectedPrice)}
            <Text
              style={[
                styles.priceSub,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {lead.listingType === "RENT" ? " /month" : ""}
            </Text>
          </Text>
        </View>
      </View>

      {/* Card Footer: Commission & GPS verified badge */}
      <View
        style={[
          styles.footerRow,
          { borderTopColor: isDark ? colors.border : "#F1F5F9" },
        ]}
      >
        <View
          style={[
            styles.gpsVerifiedBadge,
            {
              backgroundColor: isDark ? "#082F2C" : "#F0FDFA",
              borderColor: isDark ? "#115E59" : "#CCFBF1",
            },
          ]}
        >
          <Ionicons
            name="location"
            size={12}
            color={isDark ? "#2DD4BF" : "#0D9488"}
          />
          <Text
            style={[
              styles.gpsVerifiedText,
              { color: isDark ? "#2DD4BF" : "#0F766E" },
            ]}
          >
            1-Click GPS Verified
          </Text>
        </View>

        <View style={styles.commissionBox}>
          <Text
            style={[
              styles.commissionLabel,
              { color: isDark ? colors.textMuted : "#64748B" },
            ]}
          >
            Est. Commission
          </Text>
          <Text
            style={[
              styles.commissionValue,
              { color: isDark ? colors.textPrimary : "#0F172A" },
              isRentedOrSold && styles.commissionValueEarned,
            ]}
          >
            {formatCurrency(lead.commissionAmount)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  idAndTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  leadId: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  listingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rentBadge: {
    backgroundColor: "#F0FDFA",
  },
  saleBadge: {
    backgroundColor: "#FAF5FF",
  },
  listingBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  rentText: {
    color: "#0D9488",
  },
  saleText: {
    color: "#9333EA",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  bodyRow: {
    flexDirection: "row",
    gap: 12,
  },
  thumbImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  placeholderThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  detailsCol: {
    flex: 1,
    justifyContent: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  locationText: {
    fontSize: 11.5,
    fontWeight: "500",
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: "800",
    marginTop: 4,
  },
  priceSub: {
    fontSize: 11,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  gpsVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    borderWidth: 0.8,
  },
  gpsVerifiedText: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  commissionBox: {
    alignItems: "flex-end",
  },
  commissionLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  commissionValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  commissionValueEarned: {
    color: "#10B981",
  },
});
