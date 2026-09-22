import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency, TenantProperty } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantPropertyCardProps {
  property: TenantProperty | null;
  onPressDetails?: () => void;
  onPressDocuments?: () => void;
}

export const TenantPropertyCard: React.FC<TenantPropertyCardProps> = ({
  property,
  onPressDetails,
  onPressDocuments,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  if (!property) {
    return (
      <View
        style={[
          styles.emptyCard,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderColor: isDark ? colors.border : "#E2E8F0",
          },
        ]}
      >
        <Ionicons name="home-outline" size={40} color={isDark ? "#64748B" : "#94A3B8"} />
        <Text style={[styles.emptyTitle, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
          No Active Property Assigned
        </Text>
        <Text style={[styles.emptyDesc, { color: isDark ? colors.textSecondary : "#64748B" }]}>
          Contact Delhi Property Exchange support to link your verified tenancy agreement.
        </Text>
      </View>
    );
  }

  const coverImg = property.photos?.[0] || property.coverPhoto || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
          borderColor: isDark ? colors.border : "#E2E8F0",
        },
      ]}
    >
      {/* Property Image & Status Overlays */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: coverImg }} style={styles.propertyImage} />
        
        {/* Top Badges */}
        <View style={styles.topBadgeRow}>
          <View style={[styles.badge, { backgroundColor: "rgba(15, 23, 42, 0.75)" }]}>
            <Ionicons name="key" size={12} color="#38BDF8" />
            <Text style={styles.badgeText}>{property.propertyId}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: "#065F46" }]}>
            <View style={styles.activeDot} />
            <Text style={styles.badgeText}>{property.occupancyStatus}</Text>
          </View>
        </View>

        {/* Bottom Configuration Overlay */}
        <View style={styles.bottomOverlay}>
          <Text style={styles.configText}>{property.configuration}</Text>
          <Text style={styles.carpetText}>{property.carpetAreaSqFt} sq.ft</Text>
        </View>
      </View>

      {/* Property Details */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: isDark ? colors.textPrimary : "#0F172A" }]} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={14} color={isDark ? "#38BDF8" : "#0284C7"} />
          <Text style={[styles.localityText, { color: isDark ? colors.textSecondary : "#64748B" }]} numberOfLines={1}>
            {property.locality}
          </Text>
        </View>

        {/* Key Features Chips */}
        <View style={styles.chipsRow}>
          <View style={[styles.chip, { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" }]}>
            <MaterialCommunityIcons name="bed-outline" size={14} color={isDark ? "#94A3B8" : "#475569"} />
            <Text style={[styles.chipText, { color: isDark ? colors.textSecondary : "#475569" }]}>
              {property.bedrooms} Bed
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" }]}>
            <MaterialCommunityIcons name="shower" size={14} color={isDark ? "#94A3B8" : "#475569"} />
            <Text style={[styles.chipText, { color: isDark ? colors.textSecondary : "#475569" }]}>
              {property.bathrooms} Bath
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" }]}>
            <Feather name="layers" size={13} color={isDark ? "#94A3B8" : "#475569"} />
            <Text style={[styles.chipText, { color: isDark ? colors.textSecondary : "#475569" }]}>
              Floor {property.floorNumber}/{property.totalFloors}
            </Text>
          </View>
        </View>

        {/* Financials & Agreement Banner */}
        <View
          style={[
            styles.financialsRow,
            {
              backgroundColor: isDark ? "#0C293D" : "#F0F9FF",
              borderColor: isDark ? "#0369A1" : "#BAE6FD",
            },
          ]}
        >
          <View>
            <Text style={[styles.rentLabel, { color: isDark ? "#7DD3FC" : "#0369A1" }]}>Monthly Rent</Text>
            <Text style={[styles.rentValue, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
              {formatCurrency(property.rentAmount)}
              <Text style={styles.perMonth}>/mo</Text>
            </Text>
          </View>
          <View style={styles.vr} />
          <View>
            <Text style={[styles.rentLabel, { color: isDark ? "#7DD3FC" : "#0369A1" }]}>Security Deposit</Text>
            <Text style={[styles.depositValue, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
              {formatCurrency(property.securityDeposit)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {onPressDetails && (
            <TouchableOpacity
              style={[
                styles.detailBtn,
                { backgroundColor: isDark ? "#0284C7" : "#0284C7" },
              ]}
              onPress={onPressDetails}
              activeOpacity={0.8}
            >
              <Ionicons name="information-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.detailBtnText}>Full Property View</Text>
            </TouchableOpacity>
          )}

          {onPressDocuments && (
            <TouchableOpacity
              style={[
                styles.docsBtn,
                {
                  backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                  borderColor: isDark ? colors.border : "#CBD5E1",
                },
              ]}
              onPress={onPressDocuments}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text-outline" size={16} color={isDark ? "#38BDF8" : "#0284C7"} />
              <Text style={[styles.docsBtnText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>Documents</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  imageWrapper: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  propertyImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  topBadgeRow: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11.5,
    fontWeight: "800",
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  configText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  carpetText: {
    color: "#E2E8F0",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  localityText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  chipText: {
    fontSize: 11.5,
    fontWeight: "700",
  },
  financialsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  rentLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  rentValue: {
    fontSize: 18,
    fontWeight: "900",
  },
  perMonth: {
    fontSize: 12,
    fontWeight: "600",
  },
  depositValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  vr: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(148, 163, 184, 0.3)",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  detailBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  detailBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  docsBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  docsBtnText: {
    fontSize: 13,
    fontWeight: "800",
  },
});
