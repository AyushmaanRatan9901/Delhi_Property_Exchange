import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GPSPickerModal } from "../../../components/FieldAgentComponent";
import { useResponsiveTheme } from "../../../constants/theme";
import {
  GPSLocation,
  ListingType,
  PropertyType,
  useFieldAgent,
} from "../../../constants/fieldAgentData";

const PROPERTY_TYPES: PropertyType[] = [
  "1BHK",
  "2BHK",
  "3BHK",
  "PG / Studio",
  "Independent House",
  "Commercial Shop",
];

export function AddNewLeadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();
  const { addNewLead } = useFieldAgent();

  // Form Fields
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [locality, setLocality] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("2BHK");
  const [listingType, setListingType] = useState<ListingType>("RENT");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [remarks, setRemarks] = useState("");
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);

  // Photo & Video Tour States
  const [photos, setPhotos] = useState<string[]>([]);
  const [videoLink, setVideoLink] = useState("");
  const [isPickingImage, setIsPickingImage] = useState(false);

  // Modals & UI States
  const [isGpsModalVisible, setIsGpsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Photo Picker Handlers ─────────────────────────────────────
  const handleTakePhoto = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please grant camera access in settings to capture live property photos."
        );
        return;
      }

      setIsPickingImage(true);
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPhotos((prev) => (prev.length < 10 ? [...prev, uri] : prev));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      Alert.alert("Camera Error", "Failed to capture photo. Please try again.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Gallery Permission Required",
          "Please grant media library access to select property photos."
        );
        return;
      }

      setIsPickingImage(true);
      const remainingSlots = 10 - photos.length;
      if (remainingSlots <= 0) {
        Alert.alert("Limit Reached", "You can upload a maximum of 10 property photos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((a) => a.uri);
        setPhotos((prev) => [...prev, ...newUris].slice(0, 10));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      Alert.alert("Gallery Error", "Failed to select photos. Please try again.");
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setPhotos((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
    Alert.alert("Cover Photo Updated", "This image is now set as the primary cover photo.");
  };

  const handleCaptureGps = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setIsGpsModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!ownerName.trim()) {
      Alert.alert("Required Field", "Please enter owner full name.");
      return;
    }
    const cleanPhone = ownerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit mobile number for owner.");
      return;
    }
    if (!locality.trim()) {
      Alert.alert("Required Field", "Please enter property locality / area.");
      return;
    }
    if (!gpsLocation) {
      Alert.alert("GPS Pin Required", "Please click 'Capture 1-Click GPS Pin' to verify on-site location.");
      return;
    }

    const priceNum = parseInt(expectedPrice.replace(/\D/g, ""), 10) || (listingType === "RENT" ? 25000 : 7500000);

    setIsSubmitting(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}

    const defaultFallbackPhotos = [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
    ];

    const finalPhotos = photos.length > 0 ? photos : defaultFallbackPhotos;

    try {
      const newLead = await addNewLead({
        ownerName: ownerName.trim(),
        ownerPhone: cleanPhone,
        locality: locality.trim(),
        fullAddress: fullAddress.trim() || locality.trim(),
        propertyType,
        listingType,
        expectedPrice: priceNum,
        gpsLocation,
        photos: finalPhotos,
        videoLink: videoLink.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      setIsSubmitting(false);

      Alert.alert(
        "Lead Submitted Successfully! 🎉",
        `Lead ID ${newLead.id} is created with ${finalPhotos.length} photo(s) and sent to Verification team. Estimated commission ₹${newLead.commissionAmount} is queued for your wallet.`,
        [
          {
            text: "View My Leads",
            onPress: () => router.replace("/FiledAgentPanel/(tabs)/leads" as any),
          },
        ]
      );
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert("Submission Error", "Could not submit lead to backend. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? colors.cardBackground : "#FFFFFF"} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) + 8, backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderBottomColor: isDark ? colors.border : "#F1F5F9" }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" }]}
        >
          <Feather name="arrow-left" size={20} color={isDark ? colors.textPrimary : "#0F172A"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>{t("fieldAgent.addNewLeadQuick")}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
        >
          {/* Top Banner */}
          <View style={[styles.infoBanner, isDark && { backgroundColor: "rgba(13, 148, 136, 0.15)", borderColor: "rgba(13, 148, 136, 0.3)" }]}>
            <Ionicons name="shield-checkmark" size={18} color={isDark ? "#2dd4bf" : "#0F766E"} />
            <Text style={[styles.infoBannerText, isDark && { color: "#2dd4bf" }]}>
              {t("fieldAgent.dataSecurityNotice")}
            </Text>
          </View>

          {/* Section 1: Owner Details */}
          <View style={[styles.formSection, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>1. {t("fieldAgent.ownerContactDetails")}</Text>

            <Text style={[styles.inputLabel, { color: isDark ? colors.textSecondary : "#334155" }]}>{t("fieldAgent.ownerNameLabel")}</Text>
            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
              <Feather name="user" size={17} color="#0D9488" />
              <TextInput
                style={[styles.input, { color: isDark ? colors.textPrimary : "#0F172A" }]}
                placeholder={t("fieldAgent.ownerNamePlaceholder")}
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={ownerName}
                onChangeText={setOwnerName}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12, color: isDark ? colors.textSecondary : "#334155" }]}>{t("fieldAgent.ownerPhoneLabel")}</Text>
            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
              <Feather name="phone" size={17} color="#0D9488" />
              <TextInput
                style={[styles.input, { color: isDark ? colors.textPrimary : "#0F172A" }]}
                placeholder={t("fieldAgent.ownerPhonePlaceholder")}
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                keyboardType="phone-pad"
                maxLength={10}
                value={ownerPhone}
                onChangeText={setOwnerPhone}
              />
            </View>
            <Text style={[styles.securityNote, { color: isDark ? colors.textMuted : "#64748B" }]}>
              {t("fieldAgent.numberMaskedNotice")}
            </Text>
          </View>

          {/* Section 2: Property Type & Listing Info */}
          <View style={[styles.formSection, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>2. {t("fieldAgent.propertyType")}</Text>

            {/* Listing Type: Rent vs Sale */}
            <Text style={[styles.inputLabel, { color: isDark ? colors.textSecondary : "#334155" }]}>{t("fieldAgent.listingPurpose")}</Text>
            <View style={styles.listingToggleRow}>
              <TouchableOpacity
                onPress={() => setListingType("RENT")}
                style={[
                  styles.listingToggleBtn,
                  { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#E2E8F0" },
                  listingType === "RENT" && [styles.listingToggleBtnActive, isDark && { backgroundColor: "rgba(13, 148, 136, 0.2)" }],
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={16}
                  color={listingType === "RENT" ? (isDark ? "#2dd4bf" : "#0D9488") : (isDark ? "#94A3B8" : "#64748B")}
                />
                <Text
                  style={[
                    styles.listingToggleText,
                    { color: isDark ? colors.textSecondary : "#64748B" },
                    listingType === "RENT" && [styles.listingToggleTextActive, isDark && { color: "#2dd4bf" }],
                  ]}
                >
                  {t("fieldAgent.forRent")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setListingType("SALE")}
                style={[
                  styles.listingToggleBtn,
                  { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#E2E8F0" },
                  listingType === "SALE" && [styles.listingToggleBtnActive, isDark && { backgroundColor: "rgba(13, 148, 136, 0.2)" }],
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={16}
                  color={listingType === "SALE" ? (isDark ? "#2dd4bf" : "#0D9488") : (isDark ? "#94A3B8" : "#64748B")}
                />
                <Text
                  style={[
                    styles.listingToggleText,
                    { color: isDark ? colors.textSecondary : "#64748B" },
                    listingType === "SALE" && [styles.listingToggleTextActive, isDark && { color: "#2dd4bf" }],
                  ]}
                >
                  {t("fieldAgent.forSale")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Property Type Grid */}
            <Text style={[styles.inputLabel, { marginTop: 14, color: isDark ? colors.textSecondary : "#334155" }]}>{t("fieldAgent.propertyType")}</Text>
            <View style={styles.propTypeGrid}>
              {PROPERTY_TYPES.map((type) => {
                const isSelected = propertyType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setPropertyType(type)}
                    style={[
                      styles.propTypePill,
                      { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#E2E8F0" },
                      isSelected && [styles.propTypePillActive, isDark && { backgroundColor: "rgba(13, 148, 136, 0.25)", borderColor: "#0D9488" }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.propTypeText,
                        { color: isDark ? colors.textSecondary : "#64748B" },
                        isSelected && [styles.propTypeTextActive, isDark && { color: "#2dd4bf" }],
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Expected Price */}
            <Text style={[styles.inputLabel, { marginTop: 14, color: isDark ? colors.textSecondary : "#334155" }]}>
              {listingType === "RENT" ? t("fieldAgent.expectedRent") : t("fieldAgent.expectedSale")}
            </Text>
            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                style={[styles.input, { color: isDark ? colors.textPrimary : "#0F172A" }]}
                placeholder={listingType === "RENT" ? "e.g. 24000" : "e.g. 7500000"}
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                keyboardType="numeric"
                value={expectedPrice}
                onChangeText={setExpectedPrice}
              />
            </View>
          </View>

          {/* Section 3: 1-Click GPS Location Pin */}
          <View style={[styles.formSection, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>3. {t("fieldAgent.gpsPickerTitle")}</Text>

            <Text style={[styles.inputLabel, { color: isDark ? colors.textSecondary : "#334155" }]}>{t("fieldAgent.localityLabel")}</Text>
            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
              <Feather name="map-pin" size={17} color="#0D9488" />
              <TextInput
                style={[styles.input, { color: isDark ? colors.textPrimary : "#0F172A" }]}
                placeholder={t("fieldAgent.localityPlaceholder")}
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={locality}
                onChangeText={setLocality}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12, color: isDark ? colors.textSecondary : "#334155" }]}>
              {t("fieldAgent.addressLabel")}
            </Text>
            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
              <Feather name="navigation" size={17} color="#0D9488" />
              <TextInput
                style={[styles.input, { color: isDark ? colors.textPrimary : "#0F172A" }]}
                placeholder={t("fieldAgent.addressPlaceholder")}
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={fullAddress}
                onChangeText={setFullAddress}
              />
            </View>

            {/* 1-Click GPS Trigger */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleCaptureGps}
              style={[
                styles.gpsTriggerBtn,
                isDark && { backgroundColor: "rgba(13, 148, 136, 0.15)", borderColor: "rgba(13, 148, 136, 0.3)" },
                gpsLocation && [styles.gpsTriggerBtnAttached, isDark && { backgroundColor: "rgba(5, 150, 105, 0.2)", borderColor: "rgba(5, 150, 105, 0.4)" }],
              ]}
            >
              <Ionicons
                name={gpsLocation ? "checkmark-circle" : "location"}
                size={22}
                color={gpsLocation ? "#059669" : "#0D9488"}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.gpsTriggerTitle,
                    gpsLocation && { color: "#059669" },
                  ]}
                >
                  {gpsLocation ? t("fieldAgent.gpsVerifiedBtn") : t("fieldAgent.captureGpsBtn")}
                </Text>
                <Text style={[styles.gpsTriggerSub, { color: isDark ? colors.textMuted : "#64748B" }]} numberOfLines={1}>
                  {gpsLocation
                    ? gpsLocation.formattedAddress
                    : t("fieldAgent.gpsSubHint")}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Section 4: Property Photos & Video Tour */}
          <View style={[styles.formSection, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>4. {t("fieldAgent.photosAndTour")}</Text>
              <View style={[styles.photoCountBadge, isDark && { backgroundColor: "rgba(13, 148, 136, 0.25)" }]}>
                <Text style={[styles.photoCountText, isDark && { color: "#2dd4bf" }]}>{t("fieldAgent.photosAddedCount", { count: photos.length })}</Text>
              </View>
            </View>
            <Text style={[styles.photoHelpText, { color: isDark ? colors.textMuted : "#64748B" }]}>
              {t("fieldAgent.photosHelpText")}
            </Text>

            {/* Quick Upload Action Buttons */}
            <View style={styles.photoActionRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleTakePhoto}
                disabled={isPickingImage || photos.length >= 10}
                style={[
                  styles.photoActionBtn,
                  styles.cameraBtn,
                  isDark && { backgroundColor: "rgba(13, 148, 136, 0.15)", borderColor: "rgba(13, 148, 136, 0.3)" },
                  photos.length >= 10 && styles.photoBtnDisabled,
                ]}
              >
                <Ionicons name="camera" size={20} color={isDark ? "#2dd4bf" : "#0F766E"} />
                <View>
                  <Text style={[styles.photoActionTitle, { color: isDark ? "#2dd4bf" : "#0F766E" }]}>{t("fieldAgent.takeLivePhoto")}</Text>
                  <Text style={[styles.photoActionSub, { color: isDark ? colors.textMuted : "#64748B" }]}>{t("fieldAgent.useCamera")}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickFromGallery}
                disabled={isPickingImage || photos.length >= 10}
                style={[
                  styles.photoActionBtn,
                  styles.galleryBtn,
                  isDark && { backgroundColor: "rgba(3, 105, 161, 0.15)", borderColor: "rgba(3, 105, 161, 0.3)" },
                  photos.length >= 10 && styles.photoBtnDisabled,
                ]}
              >
                <Ionicons name="images" size={20} color={isDark ? "#38bdf8" : "#0369A1"} />
                <View>
                  <Text style={[styles.photoActionTitle, { color: isDark ? "#38bdf8" : "#0369A1" }]}>{t("fieldAgent.browseGallery")}</Text>
                  <Text style={[styles.photoActionSub, { color: isDark ? colors.textMuted : "#64748B" }]}>{t("fieldAgent.selectMultiple")}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {isPickingImage && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#0D9488" />
                <Text style={styles.loadingText}>Processing photos...</Text>
              </View>
            )}

            {/* Photos Preview Thumbnails */}
            {photos.length > 0 ? (
              <View style={styles.photoPreviewSection}>
                <Text style={[styles.previewLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>
                  Tap any photo to set as Cover Photo ({photos.length} uploaded)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoThumbList}>
                  {photos.map((uri, index) => {
                    const isCover = index === 0;
                    return (
                      <TouchableOpacity
                        key={`${uri}-${index}`}
                        activeOpacity={0.85}
                        onPress={() => handleSetCoverPhoto(index)}
                        style={[
                          styles.thumbWrapper,
                          isCover && styles.thumbWrapperCover,
                        ]}
                      >
                        <Image source={{ uri }} style={styles.thumbImage} />
                        
                        {/* Cover Tag */}
                        {isCover && (
                          <View style={styles.coverTag}>
                            <Ionicons name="star" size={10} color="#FFFFFF" />
                            <Text style={styles.coverTagText}>{t("fieldAgent.coverTag")}</Text>
                          </View>
                        )}

                        {/* Remove Button */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleRemovePhoto(index)}
                          style={styles.thumbDeleteBtn}
                        >
                          <Feather name="x" size={13} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Order Indicator */}
                        <View style={styles.orderBadge}>
                          <Text style={styles.orderBadgeText}>#{index + 1}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  {/* + {t("fieldAgent.selectMultiple")} Tile */}
                  {photos.length < 10 && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={handlePickFromGallery}
                      style={[styles.addMoreThumbTile, isDark && { backgroundColor: "rgba(13, 148, 136, 0.15)", borderColor: "#0D9488" }]}
                    >
                      <Feather name="plus" size={24} color="#0D9488" />
                      <Text style={[styles.addMoreThumbText, isDark && { color: "#2dd4bf" }]}>Add More</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            ) : (
              <View style={[styles.photoEmptyBox, { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#CBD5E1" }]}>
                <Ionicons name="cloud-upload-outline" size={32} color={isDark ? "#64748B" : "#94A3B8"} />
                <Text style={[styles.photoEmptyTitle, { color: isDark ? colors.textPrimary : "#475569" }]}>{t("fieldAgent.noPhotosYet")}</Text>
                <Text style={[styles.photoEmptySub, { color: isDark ? colors.textMuted : "#94A3B8" }]}>
                  Properties with 3+ clear photos get approved 4x faster by the verification team!
                </Text>
              </View>
            )}

            {/* Optional Video Tour Link */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>
              {t("fieldAgent.videoTourLink")}
            </Text>
            <View style={styles.inputBox}>
              <Ionicons name="videocam-outline" size={18} color="#0D9488" />
              <TextInput
                style={styles.input}
                placeholder="e.g. https://youtu.be/... or Drive link"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                keyboardType="url"
                value={videoLink}
                onChangeText={setVideoLink}
              />
            </View>
          </View>

          {/* Section 5: Remarks / Key Notes */}
          <View style={[styles.formSection, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>5. {t("fieldAgent.agentNotes")}</Text>
            <View style={[styles.inputBox, { backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC", borderColor: isDark ? colors.border : "#E2E8F0", height: 80, alignItems: "flex-start", paddingTop: 10 }]}>
              <TextInput
                style={[styles.input, { color: isDark ? colors.textPrimary : "#0F172A", height: "100%", textAlignVertical: "top" }]}
                placeholder={t("fieldAgent.agentNotesPlaceholder")}
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                multiline
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>
          </View>

          {/* Submit Action Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={styles.submitButton}
          >
            <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? t("fieldAgent.submittingLead") : t("fieldAgent.submitLeadBtn")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* GPS Picker Modal */}
      <GPSPickerModal
        visible={isGpsModalVisible}
        localityHint={locality}
        onClose={() => setIsGpsModalVisible(false)}
        onLocationSelected={(loc) => setGpsLocation(loc)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#0F766E",
    fontWeight: "600",
    lineHeight: 16,
  },
  formSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  securityNote: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 15,
  },
  listingToggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  listingToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  listingToggleBtnActive: {
    borderColor: "#0D9488",
    backgroundColor: "#F0FDFA",
  },
  listingToggleText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#64748B",
  },
  listingToggleTextActive: {
    color: "#0D9488",
  },
  propTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  propTypePill: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  propTypePillActive: {
    borderColor: "#0D9488",
    backgroundColor: "#CCFBF1",
  },
  propTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  propTypeTextActive: {
    color: "#0F766E",
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0D9488",
  },
  gpsTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderWidth: 1.5,
    borderColor: "#CCFBF1",
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    gap: 10,
  },
  gpsTriggerBtnAttached: {
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  },
  gpsTriggerTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0D9488",
  },
  gpsTriggerSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    height: 54,
    borderRadius: 18,
    gap: 8,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15.5,
    fontWeight: "800",
  },

  // ── Photo & Video Tour Styles ──────────────────────────────
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  photoCountBadge: {
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  photoCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F766E",
  },
  photoHelpText: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 12,
  },
  photoActionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    gap: 8,
  },
  cameraBtn: {
    backgroundColor: "#F0FDFA",
    borderColor: "#99F6E4",
  },
  galleryBtn: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  photoBtnDisabled: {
    opacity: 0.5,
  },
  photoActionTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F766E",
  },
  photoActionSub: {
    fontSize: 10.5,
    color: "#64748B",
    marginTop: 1,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 12,
    color: "#0D9488",
    fontWeight: "600",
  },
  photoPreviewSection: {
    marginTop: 4,
    marginBottom: 6,
  },
  previewLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 8,
  },
  photoThumbList: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  thumbWrapper: {
    width: 100,
    height: 100,
    borderRadius: 14,
    marginRight: 10,
    position: "relative",
    backgroundColor: "#E2E8F0",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    overflow: "hidden",
  },
  thumbWrapperCover: {
    borderColor: "#0D9488",
    borderWidth: 2.5,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  coverTag: {
    position: "absolute",
    top: 5,
    left: 5,
    backgroundColor: "#0D9488",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coverTagText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  thumbDeleteBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  orderBadge: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  orderBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addMoreThumbTile: {
    width: 100,
    height: 100,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#0D9488",
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    gap: 4,
  },
  addMoreThumbText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
  photoEmptyBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 14,
    marginVertical: 4,
  },
  photoEmptyTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginTop: 6,
  },
  photoEmptySub: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 3,
    lineHeight: 15,
  },
});

export default AddNewLeadScreen;
