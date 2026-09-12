import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Property Lead</Text>
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
          <View style={styles.infoBanner}>
            <Ionicons name="shield-checkmark" size={18} color="#0F766E" />
            <Text style={styles.infoBannerText}>
              Submitting verified leads gives you direct payout commission. Data confidentiality is guaranteed.
            </Text>
          </View>

          {/* Section 1: Owner Details */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>1. Owner Contact Information</Text>

            <Text style={styles.inputLabel}>Owner Full Name *</Text>
            <View style={styles.inputBox}>
              <Feather name="user" size={17} color="#0D9488" />
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Chandra"
                placeholderTextColor="#94A3B8"
                value={ownerName}
                onChangeText={setOwnerName}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Owner Mobile Number *</Text>
            <View style={styles.inputBox}>
              <Feather name="phone" size={17} color="#0D9488" />
              <TextInput
                style={styles.input}
                placeholder="10-digit phone (e.g. 9811234567)"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                value={ownerPhone}
                onChangeText={setOwnerPhone}
              />
            </View>
            <Text style={styles.securityNote}>
              🔒 Number will be automatically masked once submitted to protect owner privacy.
            </Text>
          </View>

          {/* Section 2: Property Type & Listing Info */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>2. Property Specification</Text>

            {/* Listing Type: Rent vs Sale */}
            <Text style={styles.inputLabel}>Listing Purpose *</Text>
            <View style={styles.listingToggleRow}>
              <TouchableOpacity
                onPress={() => setListingType("RENT")}
                style={[
                  styles.listingToggleBtn,
                  listingType === "RENT" && styles.listingToggleBtnActive,
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={16}
                  color={listingType === "RENT" ? "#0D9488" : "#64748B"}
                />
                <Text
                  style={[
                    styles.listingToggleText,
                    listingType === "RENT" && styles.listingToggleTextActive,
                  ]}
                >
                  For Rent (Monthly)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setListingType("SALE")}
                style={[
                  styles.listingToggleBtn,
                  listingType === "SALE" && styles.listingToggleBtnActive,
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={16}
                  color={listingType === "SALE" ? "#0D9488" : "#64748B"}
                />
                <Text
                  style={[
                    styles.listingToggleText,
                    listingType === "SALE" && styles.listingToggleTextActive,
                  ]}
                >
                  For Sale (Outright)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Property Type Grid */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Property Type *</Text>
            <View style={styles.propTypeGrid}>
              {PROPERTY_TYPES.map((type) => {
                const isSelected = propertyType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setPropertyType(type)}
                    style={[
                      styles.propTypePill,
                      isSelected && styles.propTypePillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.propTypeText,
                        isSelected && styles.propTypeTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Expected Price */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>
              {listingType === "RENT" ? "Expected Monthly Rent (₹)" : "Expected Sale Price (₹)"}
            </Text>
            <View style={styles.inputBox}>
              <Text style={styles.currencyPrefix}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder={listingType === "RENT" ? "e.g. 24000" : "e.g. 7500000"}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={expectedPrice}
                onChangeText={setExpectedPrice}
              />
            </View>
          </View>

          {/* Section 3: 1-Click GPS Location Pin */}
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>3. Location & 1-Click GPS Pin</Text>

            <Text style={styles.inputLabel}>Locality / Area / Sector *</Text>
            <View style={styles.inputBox}>
              <Feather name="map-pin" size={17} color="#0D9488" />
              <TextInput
                style={styles.input}
                placeholder="e.g. Sector 62, Noida"
                placeholderTextColor="#94A3B8"
                value={locality}
                onChangeText={setLocality}
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>
              Building / Flat / Tower Address (Optional)
            </Text>
            <View style={styles.inputBox}>
              <Feather name="navigation" size={17} color="#0D9488" />
              <TextInput
                style={styles.input}
                placeholder="e.g. Flat 302, Tower 4, Royal Greens"
                placeholderTextColor="#94A3B8"
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
                gpsLocation && styles.gpsTriggerBtnAttached,
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
                  {gpsLocation ? "GPS Pin Verified (±3.8m)" : "Capture 1-Click GPS Pin *"}
                </Text>
                <Text style={styles.gpsTriggerSub} numberOfLines={1}>
                  {gpsLocation
                    ? gpsLocation.formattedAddress
                    : "Tap to record current live on-site coordinates"}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Section 4: Property Photos & Video Tour */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>4. Property Photos & Video Tour</Text>
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountText}>{photos.length}/10 Added</Text>
              </View>
            </View>
            <Text style={styles.photoHelpText}>
              Add high-quality photos (living room, bedrooms, kitchen, facade). The 1st photo is your main Cover photo.
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
                  photos.length >= 10 && styles.photoBtnDisabled,
                ]}
              >
                <Ionicons name="camera" size={20} color="#0F766E" />
                <View>
                  <Text style={styles.photoActionTitle}>Take Live Photo</Text>
                  <Text style={styles.photoActionSub}>Use Device Camera</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handlePickFromGallery}
                disabled={isPickingImage || photos.length >= 10}
                style={[
                  styles.photoActionBtn,
                  styles.galleryBtn,
                  photos.length >= 10 && styles.photoBtnDisabled,
                ]}
              >
                <Ionicons name="images" size={20} color="#0369A1" />
                <View>
                  <Text style={[styles.photoActionTitle, { color: "#0369A1" }]}>Browse Gallery</Text>
                  <Text style={styles.photoActionSub}>Select Multiple</Text>
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
                <Text style={styles.previewLabel}>
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
                            <Text style={styles.coverTagText}>COVER</Text>
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

                  {/* Add More Tile */}
                  {photos.length < 10 && (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={handlePickFromGallery}
                      style={styles.addMoreThumbTile}
                    >
                      <Feather name="plus" size={24} color="#0D9488" />
                      <Text style={styles.addMoreThumbText}>Add More</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.photoEmptyBox}>
                <Ionicons name="cloud-upload-outline" size={32} color="#94A3B8" />
                <Text style={styles.photoEmptyTitle}>No Property Photos Added Yet</Text>
                <Text style={styles.photoEmptySub}>
                  Properties with 3+ clear photos get approved 4x faster by the verification team!
                </Text>
              </View>
            )}

            {/* Optional Video Tour Link */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>
              Video Tour / 360 Virtual Tour Link (Optional)
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
          <View style={styles.formSection}>
            <Text style={styles.sectionHeading}>5. Agent Notes & Key Details</Text>
            <View style={[styles.inputBox, { height: 80, alignItems: "flex-start", paddingTop: 10 }]}>
              <TextInput
                style={[styles.input, { height: "100%", textAlignVertical: "top" }]}
                placeholder="e.g. Keys with security guard, available for immediate occupancy..."
                placeholderTextColor="#94A3B8"
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
              {isSubmitting ? "Submitting Lead..." : "Submit Lead & Claim Commission"}
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
