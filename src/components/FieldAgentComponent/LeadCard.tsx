import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  formatCurrency,
  LeadItem,
  LeadStatus,
} from "../../constants/fieldAgentData";

interface LeadCardProps {
  lead: LeadItem;
  onPress: (lead: LeadItem) => void;
}

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
    bg: "#FEF3C7",
    text: "#B45309",
    icon: "time-outline",
  },
  VERIFIED: {
    label: "Verified & Listed",
    bg: "#CCFBF1",
    text: "#0F766E",
    icon: "shield-checkmark-outline",
  },
  RENTED: {
    label: "Rented Out",
    bg: "#DBEAFE",
    text: "#1E40AF",
    icon: "key-outline",
  },
  SOLD: {
    label: "Sold Out",
    bg: "#F3E8FF",
    text: "#7E22CE",
    icon: "checkmark-done-circle-outline",
  },
  REJECTED: {
    label: "Needs Info",
    bg: "#FEE2E2",
    text: "#B91C1C",
    icon: "alert-circle-outline",
  },
};

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onPress }) => {
  const statusCfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
  const isRentedOrSold = lead.status === "RENTED" || lead.status === "SOLD";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(lead)}
      style={styles.card}
    >
      {/* Top Bar: Lead ID + Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.idAndTypeRow}>
          <Text style={styles.leadId}>{lead.id}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{lead.propertyType}</Text>
          </View>
          <View
            style={[
              styles.listingBadge,
              lead.listingType === "SALE" ? styles.saleBadge : styles.rentBadge,
            ]}
          >
            <Text
              style={[
                styles.listingBadgeText,
                lead.listingType === "SALE" ? styles.saleText : styles.rentText,
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
          <View style={styles.placeholderThumb}>
            <Feather name="home" size={24} color="#94A3B8" />
          </View>
        )}

        <View style={styles.detailsCol}>
          {/* Locality & Address */}
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color="#EF4444" />
            <Text style={styles.locationText} numberOfLines={1}>
              {lead.locality}
            </Text>
          </View>

          {/* Price */}
          <Text style={styles.priceText}>
            {formatCurrency(lead.expectedPrice)}
            <Text style={styles.priceSub}>
              {lead.listingType === "RENT" ? " /month" : ""}
            </Text>
          </Text>
        </View>
      </View>

      {/* Card Footer: Commission & GPS verified badge */}
      <View style={styles.footerRow}>
        <View style={styles.gpsVerifiedBadge}>
          <Ionicons name="location" size={12} color="#0D9488" />
          <Text style={styles.gpsVerifiedText}>1-Click GPS Verified</Text>
        </View>

        <View style={styles.commissionBox}>
          <Text style={styles.commissionLabel}>Est. Commission</Text>
          <Text
            style={[
              styles.commissionValue,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
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
  },
  leadId: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.2,
  },
  typeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
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
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  detailsCol: {
    flex: 1,
    justifyContent: "center",
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ownerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  maskedPhoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  maskedPhoneText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  maskedHint: {
    fontSize: 9.5,
    color: "#94A3B8",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  locationText: {
    fontSize: 11.5,
    color: "#475569",
    fontWeight: "500",
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#0D9488",
    marginTop: 4,
  },
  priceSub: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  gpsVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  gpsVerifiedText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#0F766E",
  },
  commissionBox: {
    alignItems: "flex-end",
  },
  commissionLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },
  commissionValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  commissionValueEarned: {
    color: "#059669",
  },
});
