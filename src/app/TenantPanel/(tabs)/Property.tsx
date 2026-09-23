import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
  RefreshControl,
  Modal,
  Alert,
  Share,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useResponsiveTheme } from "../../../constants/theme";
import { formatCurrency, TenantDocument, useTenant } from "../../../constants/tenantData";
import { TenantDocumentViewerModal } from "../../../components/TenantComponent/TenantDocumentViewerModal";

import { TenantPropertySkeleton } from "../../../components/TenantComponent/TenantSkeleton";

export default function TenantPropertyScreen() {
  const { isDark, colors } = useResponsiveTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 768;

  const { property, documents, isLoading, isRefreshing, refreshAll } = useTenant();

  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [selectedDoc, setSelectedDoc] = useState<TenantDocument | null>(null);
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [fullScreenPhoto, setFullScreenPhoto] = useState<string | null>(null);

  const photoList = useMemo(() => {
    if (property?.photos && Array.isArray(property.photos) && property.photos.length > 0) {
      return property.photos;
    }
    if (property?.coverPhoto) {
      return [property.coverPhoto];
    }
    return [];
  }, [property?.photos, property?.coverPhoto]);

  const handleDocClick = (doc: TenantDocument) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSelectedDoc(doc);
    setShowDocModal(true);
  };

  const handleShareAddress = async () => {
    if (!property) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `My Residence Address:\n${property.title || "Property"}\n${property.address?.fullAddress || property.locality || ""}\nProperty ID: ${property.propertyId || property.id}`,
      });
    } catch {}
  };

  const handleCopyPropertyId = () => {
    if (!property) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    Alert.alert("Property ID Copied", `${property.propertyId || property.id} has been copied.`);
  };

  // 1. Loading State
  if (isLoading && !property) {
    return <TenantPropertySkeleton />;
  }

  // 2. Empty State: No Active Property Assigned
  if (!property) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: isDark ? colors.background : "#F8FAFC" },
        ]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* Top Header Bar */}
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
            My Rented Property
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} colors={["#0D9488"]} />
          }
        >
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
            ]}
          >
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? "#0C293D" : "#F0FDFA" }]}>
              <Ionicons name="home-outline" size={44} color="#0D9488" />
            </View>

            <Text style={[styles.emptyTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              No Property Assigned Yet
            </Text>

            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              You do not currently have an active rented property assigned to your registered phone number.
              {"\n\n"}
              Once the Super Admin finalizes your rental deal, your property photos, address, specifications, lease agreement, and rent schedule will appear here in real time.
            </Text>

            <TouchableOpacity
              onPress={refreshAll}
              style={styles.refreshBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.refreshBtnText}>Check for Assignment</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 3. Main Property View with Real Live Data
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

      {/* Top Header Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#E2E8F0",
          },
        ]}
      >
        <View style={styles.topBarLeft}>
          <Text style={[styles.screenTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            My Rented Property
          </Text>
          <View style={styles.statusLivePill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusLiveText}>ACTIVE RESIDENCY</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCopyPropertyId}
          style={[
            styles.propertyIdPill,
            {
              backgroundColor: isDark ? "#0C293D" : "#F0F9FF",
              borderColor: isDark ? "#0369A1" : "#BAE6FD",
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="key" size={13} color={isDark ? "#38BDF8" : "#0284C7"} />
          <Text style={[styles.propertyIdText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
            {property.propertyId || property.id}
          </Text>
          <Feather name="copy" size={11} color={isDark ? "#38BDF8" : "#0284C7"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentTablet]}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} colors={["#0D9488"]} />
        }
      >
        {/* Real Property Photo Carousel */}
        {photoList.length > 0 ? (
          <View style={styles.galleryWrapper}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const slideWidth = windowWidth - 32;
                const idx = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
                setActivePhotoIdx(idx);
              }}
            >
              {photoList.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.9}
                  onPress={() => setFullScreenPhoto(uri)}
                  style={{ width: windowWidth - 32, height: 230 }}
                >
                  <Image source={{ uri }} style={styles.carouselImg} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Photo Counter Pill */}
            <View style={styles.photoCountBadge}>
              <Ionicons name="camera" size={12} color="#FFFFFF" />
              <Text style={styles.photoCountText}>
                {activePhotoIdx + 1} / {photoList.length}
              </Text>
            </View>

            {/* Pagination Dots */}
            {photoList.length > 1 && (
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
            )}
          </View>
        ) : (
          <View
            style={[
              styles.noPhotoBox,
              {
                backgroundColor: isDark ? colors.cardBackground : "#F1F5F9",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
            ]}
          >
            <Ionicons name="images-outline" size={36} color={colors.textSecondary} />
            <Text style={[styles.noPhotoText, { color: colors.textSecondary }]}>
              No property photos uploaded
            </Text>
          </View>
        )}

        {/* Thumbnail Preview Strip */}
        {photoList.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailStrip}
          >
            {photoList.map((uri, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setActivePhotoIdx(idx)}
                style={[
                  styles.thumbnailItem,
                  activePhotoIdx === idx && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri }} style={styles.thumbnailImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Primary Title & Verified Address Card */}
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
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.title, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                {property.title || `${property.propertyType || "Unit"} in ${property.locality || "Delhi NCR"}`}
              </Text>
              <Text style={[styles.locality, { color: isDark ? colors.textSecondary : "#64748B" }]}>
                📍 {property.locality || "Delhi NCR"}
              </Text>
            </View>

            <View style={[styles.occupancyTag, { backgroundColor: "#065F46" }]}>
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              <Text style={styles.occupancyText}>VERIFIED UNIT</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? colors.border : "#E2E8F0" }]} />

          {/* Full Address Block */}
          <View style={styles.addressBlock}>
            <View style={[styles.addressIconBox, { backgroundColor: isDark ? "#0C293D" : "#F0F9FF" }]}>
              <Ionicons name="location" size={18} color="#0D9488" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressLabel, { color: colors.textSecondary }]}>VERIFIED POSTAL ADDRESS</Text>
              <Text style={[styles.addressText, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                {property.address?.fullAddress || property.locality || "Delhi NCR"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleShareAddress} style={styles.shareBtn} activeOpacity={0.7}>
              <Feather name="share-2" size={16} color="#0D9488" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Real Specifications Grid */}
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
            <View style={[styles.specIconBox, { backgroundColor: "rgba(13, 148, 136, 0.1)" }]}>
              <MaterialCommunityIcons name="home-city" size={18} color="#0D9488" />
            </View>
            <Text style={[styles.sLabel, { color: colors.textSecondary }]}>Configuration</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property.propertyType || property.configuration || "Residential"}
            </Text>
          </View>

          <View style={styles.specItem}>
            <View style={[styles.specIconBox, { backgroundColor: "rgba(13, 148, 136, 0.1)" }]}>
              <MaterialCommunityIcons name="ruler-square" size={18} color="#0D9488" />
            </View>
            <Text style={[styles.sLabel, { color: colors.textSecondary }]}>Carpet Area</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property.carpetAreaSqFt ? `${property.carpetAreaSqFt} sq.ft` : "Not specified"}
            </Text>
          </View>

          <View style={styles.specItem}>
            <View style={[styles.specIconBox, { backgroundColor: "rgba(13, 148, 136, 0.1)" }]}>
              <MaterialCommunityIcons name="bed-king-outline" size={18} color="#0D9488" />
            </View>
            <Text style={[styles.sLabel, { color: colors.textSecondary }]}>Bedrooms</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property.bedrooms !== undefined ? `${property.bedrooms} Beds` : "N/A"}
            </Text>
          </View>

          <View style={styles.specItem}>
            <View style={[styles.specIconBox, { backgroundColor: "rgba(13, 148, 136, 0.1)" }]}>
              <MaterialCommunityIcons name="shower" size={18} color="#0D9488" />
            </View>
            <Text style={[styles.sLabel, { color: colors.textSecondary }]}>Bathrooms</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property.bathrooms !== undefined ? `${property.bathrooms} Baths` : "N/A"}
            </Text>
          </View>

          <View style={styles.specItem}>
            <View style={[styles.specIconBox, { backgroundColor: "rgba(13, 148, 136, 0.1)" }]}>
              <Feather name="layers" size={18} color="#0D9488" />
            </View>
            <Text style={[styles.sLabel, { color: colors.textSecondary }]}>Floor Level</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property.floorNumber
                ? `Floor ${property.floorNumber}${property.totalFloors ? ` of ${property.totalFloors}` : ""}`
                : "N/A"}
            </Text>
          </View>

          <View style={styles.specItem}>
            <View style={[styles.specIconBox, { backgroundColor: "rgba(13, 148, 136, 0.1)" }]}>
              <MaterialCommunityIcons name="car-multiple" size={18} color="#0D9488" />
            </View>
            <Text style={[styles.sLabel, { color: colors.textSecondary }]}>Parking</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property.parking || "Available"}
            </Text>
          </View>

          <View style={styles.specItem}>
            <View style={[styles.specIconBox, { backgroundColor: "rgba(13, 148, 136, 0.1)" }]}>
              <MaterialCommunityIcons name="sofa-outline" size={18} color="#0D9488" />
            </View>
            <Text style={[styles.sLabel, { color: colors.textSecondary }]}>Furnishing</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property.furnishing || "Semi-Furnished"}
            </Text>
          </View>

          <View style={styles.specItem}>
            <View style={[styles.specIconBox, { backgroundColor: "rgba(13, 148, 136, 0.1)" }]}>
              <MaterialCommunityIcons name="water-check" size={18} color="#0D9488" />
            </View>
            <Text style={[styles.sLabel, { color: colors.textSecondary }]}>Water Supply</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              24/7 Supply
            </Text>
          </View>

          <View style={styles.specItem}>
            <View style={[styles.specIconBox, { backgroundColor: "rgba(13, 148, 136, 0.1)" }]}>
              <MaterialCommunityIcons name="balcony" size={18} color="#0D9488" />
            </View>
            <Text style={[styles.sLabel, { color: colors.textSecondary }]}>Balconies</Text>
            <Text style={[styles.sVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {property.balconies !== undefined ? `${property.balconies} Attached` : "1 Attached"}
            </Text>
          </View>
        </View>

        {/* Tenancy & Financial Particulars Card */}
        <View
          style={[
            styles.financialCard,
            {
              backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
              borderColor: isDark ? "#1E293B" : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.financialHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="receipt" size={18} color="#0D9488" />
              <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                Tenancy & Lease Terms
              </Text>
            </View>
            <View style={styles.verifiedLeaseBadge}>
              <Ionicons name="checkmark-circle" size={11} color="#10B981" />
              <Text style={styles.verifiedLeaseText}>ACTIVE LEASE</Text>
            </View>
          </View>

          <View style={styles.finGrid}>
            <View style={[styles.finBox, { backgroundColor: isDark ? "#1E293B" : "#F0FDFA" }]}>
              <Text style={[styles.fLabel, { color: "#0D9488" }]}>Monthly Rent</Text>
              <Text style={[styles.fVal, { color: isDark ? "#2DD4BF" : "#0F766E" }]}>
                {formatCurrency(property.rentAmount || 0)}
                <Text style={{ fontSize: 12, fontWeight: "600" }}>/mo</Text>
              </Text>
              <Text style={[styles.fSub, { color: colors.textSecondary }]}>Due 5th of every month</Text>
            </View>

            <View style={[styles.finBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
              <Text style={[styles.fLabel, { color: colors.textSecondary }]}>Security Deposit</Text>
              <Text style={[styles.fVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                {formatCurrency(property.securityDeposit || 0)}
              </Text>
              <Text style={[styles.fSub, { color: colors.textSecondary }]}>Refundable on move-out</Text>
            </View>
          </View>

          {/* Lease Details Table */}
          <View style={[styles.leaseInfoTable, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
            <View style={styles.leaseRow}>
              <Text style={[styles.leaseKey, { color: colors.textSecondary }]}>Agreement No.</Text>
              <Text style={[styles.leaseVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                {property.agreementNumber || "Pending"}
              </Text>
            </View>
            <View style={styles.leaseRow}>
              <Text style={[styles.leaseKey, { color: colors.textSecondary }]}>Lease Duration</Text>
              <Text style={[styles.leaseVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                {property.leaseDurationMonths ? `${property.leaseDurationMonths} Months` : "11 Months"}
              </Text>
            </View>
            <View style={styles.leaseRow}>
              <Text style={[styles.leaseKey, { color: colors.textSecondary }]}>Police Verification</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                <Text style={[styles.leaseVal, { color: "#10B981", fontWeight: "800" }]}>
                  {property.policeVerificationStatus?.toUpperCase() || "PENDING"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Real Amenities Section */}
        {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 && (
          <View
            style={[
              styles.amenitiesCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialCommunityIcons name="star-circle" size={20} color="#0D9488" />
              <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                Society Amenities & Inclusions ({property.amenities.length})
              </Text>
            </View>

            <View style={styles.amenitiesGrid}>
              {property.amenities.map((amenity, idx) => (
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
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={[styles.amenityText, { color: isDark ? colors.textPrimary : "#334155" }]}>
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Real Tenancy Documents & KYC Section */}
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="folder-open" size={18} color="#0D9488" />
              <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                Tenancy Documents & Records
              </Text>
            </View>
            <View style={[styles.docCountBadge, { backgroundColor: isDark ? "#062A1C" : "#DCFCE7" }]}>
              <Text style={styles.docCountText}>{documents?.length || 0} Available</Text>
            </View>
          </View>

          {documents.length > 0 ? (
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
                    <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
                      {doc.documentNumber} • {doc.fileSize} • {doc.category}
                    </Text>
                  </View>

                  <View style={styles.docActionIcon}>
                    <Feather name="eye" size={16} color="#0D9488" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyDocsBox}>
              <Text style={[styles.emptyDocsText, { color: colors.textSecondary }]}>
                No official documents uploaded yet for this property.
              </Text>
            </View>
          )}
        </View>

        {/* Platform Concierge Desk (Protected Routing) */}
        <View
          style={[
            styles.conciergeCard,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons name="shield-account" size={20} color="#0D9488" />
            <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              Society & Concierge Desk
            </Text>
          </View>

          <View style={styles.conciergeList}>
            <View style={[styles.conciergeItem, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
              <Ionicons name="headset" size={18} color="#0D9488" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.conciergeLabel, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Platform Concierge Helpdesk
                </Text>
                <Text style={[styles.conciergeSub, { color: colors.textSecondary }]}>
                  24/7 Tenant & Maintenance Care
                </Text>
              </View>
              <Text style={[styles.conciergeActionText, { color: "#0D9488" }]}>1800-DPX-CARE</Text>
            </View>

            <View style={[styles.conciergeItem, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
              <MaterialCommunityIcons name="security" size={18} color="#0D9488" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.conciergeLabel, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Society Main Gate & Security
                </Text>
                <Text style={[styles.conciergeSub, { color: colors.textSecondary }]}>
                  Gate Intercom & Visitor Access
                </Text>
              </View>
              <Text style={[styles.conciergeActionText, { color: "#0D9488" }]}>Intercom Ext 101</Text>
            </View>
          </View>
        </View>

        {/* Tenant Privacy Protection Notice */}
        <View
          style={[
            styles.privacyNotice,
            {
              backgroundColor: isDark ? "rgba(13, 148, 136, 0.1)" : "#F0FDFA",
              borderColor: isDark ? "#0D9488" : "#99F6E4",
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={20} color="#0D9488" />
          <Text style={[styles.privacyText, { color: isDark ? "#2DD4BF" : "#0F766E" }]}>
            <Text style={{ fontWeight: "800" }}>Protected Tenant Service:</Text> Landlord direct contact and private accounts are securely managed. For any repair requests, rent processing, or property queries, your dedicated Delhi Property Exchange team handles everything seamlessly.
          </Text>
        </View>

        {/* Quick Action Navigation Buttons */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            onPress={() => router.push("/TenantPanel/(tabs)/Complaints" as any)}
            style={[styles.quickActionBtn, styles.complaintQuickBtn]}
            activeOpacity={0.8}
          >
            <Ionicons name="construct-outline" size={18} color="#0D9488" />
            <Text style={styles.complaintQuickBtnText}>Raise Maintenance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/TenantPanel/(tabs)/Rent" as any)}
            style={[styles.quickActionBtn, styles.rentQuickBtn]}
            activeOpacity={0.8}
          >
            <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />
            <Text style={styles.rentQuickBtnText}>Pay Rent & Ledger</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Document Preview Modal */}
      <TenantDocumentViewerModal
        visible={showDocModal}
        document={selectedDoc}
        onClose={() => setShowDocModal(false)}
      />

      {/* Full-Screen Image Zoom Modal */}
      <Modal
        visible={Boolean(fullScreenPhoto)}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenPhoto(null)}
      >
        <View style={styles.fullScreenBackdrop}>
          <TouchableOpacity
            onPress={() => setFullScreenPhoto(null)}
            style={styles.fullScreenCloseBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          {fullScreenPhoto && (
            <Image
              source={{ uri: fullScreenPhoto }}
              style={styles.fullScreenImg}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  centerBox: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    gap: 3,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  statusLivePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#10B981",
  },
  statusLiveText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#10B981",
    letterSpacing: 0.6,
  },
  propertyIdPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  propertyIdText: {
    fontSize: 12,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  scrollContentTablet: {
    maxWidth: 800,
    alignSelf: "center",
    width: "100%",
  },
  galleryWrapper: {
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    height: 230,
  },
  carouselImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noPhotoBox: {
    height: 140,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  noPhotoText: {
    fontSize: 13,
    fontWeight: "600",
  },
  photoCountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
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
    backgroundColor: "#0D9488",
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  thumbnailStrip: {
    gap: 8,
    paddingVertical: 2,
  },
  thumbnailItem: {
    width: 60,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: "#0D9488",
  },
  thumbnailImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
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
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  locality: {
    fontSize: 13,
    fontWeight: "600",
  },
  occupancyTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  occupancyText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
  },
  addressBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  addressIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addressLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  shareBtn: {
    padding: 8,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
  },
  specItem: {
    width: "33.33%",
    alignItems: "center",
    paddingVertical: 8,
    gap: 3,
  },
  specIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  sLabel: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  sVal: {
    fontSize: 12.5,
    fontWeight: "800",
    textAlign: "center",
  },
  financialCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  financialHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verifiedLeaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedLeaseText: {
    color: "#15803D",
    fontSize: 10,
    fontWeight: "800",
  },
  finGrid: {
    flexDirection: "row",
    gap: 10,
  },
  finBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    gap: 2,
  },
  fLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fVal: {
    fontSize: 18,
    fontWeight: "900",
  },
  fSub: {
    fontSize: 10.5,
    marginTop: 2,
  },
  leaseInfoTable: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  leaseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leaseKey: {
    fontSize: 12,
    fontWeight: "600",
  },
  leaseVal: {
    fontSize: 12,
    fontWeight: "700",
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
  docActionIcon: {
    padding: 6,
  },
  emptyDocsBox: {
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyDocsText: {
    fontSize: 12,
  },
  conciergeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  conciergeList: {
    gap: 8,
  },
  conciergeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  conciergeLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  conciergeSub: {
    fontSize: 11,
  },
  conciergeActionText: {
    fontSize: 12,
    fontWeight: "800",
  },
  privacyNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  privacyText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  complaintQuickBtn: {
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    borderWidth: 1.5,
    borderColor: "#0D9488",
  },
  complaintQuickBtnText: {
    color: "#0D9488",
    fontSize: 13,
    fontWeight: "800",
  },
  rentQuickBtn: {
    backgroundColor: "#0D9488",
  },
  rentQuickBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  fullScreenBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.94)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullScreenImg: {
    width: "100%",
    height: "80%",
  },
  // Empty State Styles
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0D9488",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  refreshBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});
