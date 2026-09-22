import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { TenantDocumentViewerModal } from "../../../components/TenantComponent/TenantDocumentViewerModal";
import { formatCurrency, TenantDocument, useTenant } from "../../../constants/tenantData";
import { useResponsiveTheme } from "../../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TenantPropertyScreen() {
  const { isDark, colors } = useResponsiveTheme();
  const insets = useSafeAreaInsets();
  const { property, documents } = useTenant();

  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [selectedDoc, setSelectedDoc] = useState<TenantDocument | null>(null);
  const [showDocModal, setShowDocModal] = useState<boolean>(false);

  const photoList = property?.photos && property.photos.length > 0
    ? property.photos
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80"];

  const handleDocClick = (doc: TenantDocument) => {
    setSelectedDoc(doc);
    setShowDocModal(true);
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDark ? colors.background : "#F8FAFC",
          paddingTop: insets.top > 0 ? 0 : 10,
        },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#E2E8F0",
          },
        ]}
      >
        <Text style={[styles.screenTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
          Property Overview
        </Text>
        <View style={[styles.propertyIdPill, { backgroundColor: isDark ? "#0C293D" : "#F0F9FF" }]}>
          <Ionicons name="key" size={12} color={isDark ? "#38BDF8" : "#0284C7"} />
          <Text style={[styles.propertyIdText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
            {property?.propertyId || "DPX-8842"}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photo Gallery Carousel */}
        <View style={styles.galleryWrapper}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
              setActivePhotoIdx(idx);
            }}
          >
            {photoList.map((uri, idx) => (
              <Image key={idx} source={{ uri }} style={styles.carouselImg} />
            ))}
          </ScrollView>

          {/* Pagination dots */}
          <View style={styles.paginationDots}>
            {photoList.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  activePhotoIdx === idx ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Title & Address */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                {property?.title || "Luxury 2BHK High-Rise Apartment"}
              </Text>
              <Text style={[styles.locality, { color: isDark ? colors.textSecondary : "#64748B" }]}>
                {property?.locality || "Sector 62, Noida, Delhi NCR"}
              </Text>
            </View>
            <View style={[styles.occupancyTag, { backgroundColor: "#065F46" }]}>
              <Text style={styles.occupancyText}>OCCUPIED</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? colors.border : "#E2E8F0" }]} />

          {/* Full Address */}
          <View style={styles.addressRow}>
            <Ionicons name="location-sharp" size={18} color={isDark ? "#38BDF8" : "#0284C7"} />
            <Text style={[styles.addressText, { color: isDark ? colors.textPrimary : "#334155" }]}>
              {property?.address?.fullAddress || "Flat 804, Tower B, Stellar Greens Society, Sector 62, Noida"}
            </Text>
          </View>
        </View>

        {/* Specifications Grid */}
        <View
          style={[
            styles.specsGrid,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="home-analytics" size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
            <Text style={[styles.sLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Configuration</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property?.propertyType || "2BHK"}
            </Text>
          </View>

          <View style={styles.specItem}>
            <MaterialCommunityIcons name="ruler-square" size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
            <Text style={[styles.sLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Carpet Area</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property?.carpetAreaSqFt || 980} sq.ft
            </Text>
          </View>

          <View style={styles.specItem}>
            <MaterialCommunityIcons name="bed-king-outline" size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
            <Text style={[styles.sLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Bedrooms</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property?.bedrooms || 2} Beds
            </Text>
          </View>

          <View style={styles.specItem}>
            <MaterialCommunityIcons name="shower" size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
            <Text style={[styles.sLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Bathrooms</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property?.bathrooms || 2} Baths
            </Text>
          </View>

          <View style={styles.specItem}>
            <Feather name="layers" size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
            <Text style={[styles.sLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Floor</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property?.floorNumber || 8} of {property?.totalFloors || 14}
            </Text>
          </View>

          <View style={styles.specItem}>
            <MaterialCommunityIcons name="car-multiple" size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
            <Text style={[styles.sLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Parking</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              Reserved
            </Text>
          </View>
        </View>

        {/* Financial Details Box */}
        <View
          style={[
            styles.financialCard,
            {
              backgroundColor: isDark ? "#0C293D" : "#F0F9FF",
              borderColor: isDark ? "#0369A1" : "#BAE6FD",
            },
          ]}
        >
          <View style={styles.finBlock}>
            <Text style={[styles.fLabel, { color: isDark ? "#7DD3FC" : "#0369A1" }]}>Monthly Rent</Text>
            <Text style={[styles.fVal, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
              {formatCurrency(property?.rentAmount || 18500)}/mo
            </Text>
          </View>
          <View style={styles.finDivider} />
          <View style={styles.finBlock}>
            <Text style={[styles.fLabel, { color: isDark ? "#7DD3FC" : "#0369A1" }]}>Security Deposit</Text>
            <Text style={[styles.fVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
              {formatCurrency(property?.securityDeposit || 37000)}
            </Text>
          </View>
        </View>

        {/* Amenities Section */}
        <View
          style={[
            styles.amenitiesCard,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Included Amenities & Features
          </Text>

          <View style={styles.amenitiesGrid}>
            {(property?.amenities || [
              "24/7 Power Backup",
              "Gated Society with CCTV",
              "Lift Access",
              "Geyser in Bathrooms",
              "Modular Kitchen",
              "Clubhouse & Gym",
              "RO Drinking Water",
              "High-Speed Fiber Ready",
            ]).map((amenity, idx) => (
              <View
                key={idx}
                style={[
                  styles.amenityChip,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#E2E8F0",
                  },
                ]}
              >
                <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                <Text style={[styles.amenityText, { color: isDark ? colors.textPrimary : "#334155" }]}>
                  {amenity}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tenancy Documents Section */}
        <View
          style={[
            styles.docsCard,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.docsHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              Tenancy Documents & KYC
            </Text>
            <View style={[styles.docCountBadge, { backgroundColor: isDark ? "#062A1C" : "#DCFCE7" }]}>
              <Text style={styles.docCountText}>{documents?.length || 4} Verified</Text>
            </View>
          </View>

          <View style={styles.docsList}>
            {documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.docItem,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#E2E8F0",
                  },
                ]}
                onPress={() => handleDocClick(doc)}
                activeOpacity={0.75}
              >
                <View style={[styles.docIconBox, { backgroundColor: isDark ? "#0C293D" : "#E0F2FE" }]}>
                  <Ionicons name="document-text" size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
                </View>

                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.docTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]} numberOfLines={1}>
                    {doc.title}
                  </Text>
                  <Text style={[styles.docMeta, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    {doc.documentNumber} • {doc.fileSize}
                  </Text>
                </View>

                <Feather name="chevron-right" size={18} color={isDark ? colors.textMuted : "#94A3B8"} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Landlord Privacy Protection Notice */}
        <View
          style={[
            styles.privacyNotice,
            {
              backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={18} color="#0D9488" />
          <Text style={[styles.privacyText, { color: isDark ? colors.textSecondary : "#64748B" }]}>
            Landlord direct contact is protected. For any service requests or rent queries, Delhi Property Exchange customer support is available 24/7.
          </Text>
        </View>
      </ScrollView>

      {/* Document Preview Modal */}
      <TenantDocumentViewerModal
        visible={showDocModal}
        document={selectedDoc}
        onClose={() => setShowDocModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  propertyIdPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  propertyIdText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  galleryWrapper: {
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    height: 200,
  },
  carouselImg: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    resizeMode: "cover",
  },
  paginationDots: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: "#FFFFFF",
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  locality: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  occupancyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  occupancyText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  divider: {
    height: 1,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
  },
  specItem: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 10,
    gap: 3,
  },
  sLabel: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  sVal: {
    fontSize: 13,
    fontWeight: "800",
  },
  financialCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  finBlock: {
    alignItems: "center",
    gap: 2,
  },
  fLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  fVal: {
    fontSize: 18,
    fontWeight: "900",
  },
  finDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(148, 163, 184, 0.3)",
  },
  amenitiesCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  docsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  docsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  docCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  docCountText: {
    color: "#16A34A",
    fontSize: 11,
    fontWeight: "800",
  },
  docsList: {
    gap: 8,
  },
  docItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  docIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  docTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  docMeta: {
    fontSize: 11,
  },
  privacyNotice: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  privacyText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
  },
});
