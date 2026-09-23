import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE_URL } from "../../Redux/api/apiConfig";
import { TenantProfile, useTenant } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantEditProfileModalProps {
  visible: boolean;
  profile: TenantProfile;
  onClose: () => void;
  onSave: (updated: Partial<TenantProfile>) => Promise<boolean>;
}

export const TenantEditProfileModal: React.FC<TenantEditProfileModalProps> = ({
  visible,
  profile,
  onClose,
  onSave,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const { uploadAadhaar } = useTenant();

  const [name, setName] = useState<string>(profile?.name || "");
  const [phone] = useState<string>(profile?.phone || "");
  const [email] = useState<string>(profile?.email || "");
  const [occupation, setOccupation] = useState<string>(profile?.occupation || "");
  const [aadhaarNumber, setAadhaarNumber] = useState<string>(profile?.aadhaarNumber || "");
  const [aadhaarDoc, setAadhaarDoc] = useState<string>(profile?.aadhaarDoc || "");
  const [aadhaarStatus, setAadhaarStatus] = useState<string>(profile?.aadhaarStatus || "NOT_UPLOADED");
  const [newAadhaarPicked, setNewAadhaarPicked] = useState<boolean>(false);

  const [emergencyName, setEmergencyName] = useState<string>(profile?.emergencyContact?.name || "");
  const [emergencyPhone, setEmergencyPhone] = useState<string>(profile?.emergencyContact?.phone || "");
  const [emergencyRelation, setEmergencyRelation] = useState<string>(profile?.emergencyContact?.relation || "");
  const [permanentAddress, setPermanentAddress] = useState<string>(profile?.permanentAddress || "");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Sync state whenever modal opens or profile changes
  useEffect(() => {
    if (visible && profile) {
      setName(profile.name || "");
      setOccupation(profile.occupation || "");
      setAadhaarNumber(profile.aadhaarNumber || "");
      setAadhaarDoc(profile.aadhaarDoc || "");
      setAadhaarStatus(profile.aadhaarStatus || "NOT_UPLOADED");
      setEmergencyName(profile.emergencyContact?.name || "");
      setEmergencyPhone(profile.emergencyContact?.phone || "");
      setEmergencyRelation(profile.emergencyContact?.relation || "");
      setPermanentAddress(profile.permanentAddress || "");
      setNewAadhaarPicked(false);
    }
  }, [visible, profile]);

  const getDocUri = (uri?: string) => {
    if (!uri) return "";
    if (uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("file://") || uri.startsWith("data:")) {
      return uri;
    }
    const serverHost = API_BASE_URL.replace("/api/v1", "");
    return `${serverHost}${uri.startsWith("/") ? "" : "/"}${uri}`;
  };

  const handlePickAadhaar = async (source: "camera" | "gallery") => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Camera Permission Required",
            "Please allow camera access in your device settings to take a photo of your Aadhaar card."
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.85,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uri = result.assets[0].uri;
          setAadhaarDoc(uri);
          setNewAadhaarPicked(true);
          setAadhaarStatus("UNDER_REVIEW");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Gallery Permission Required",
            "Please allow photo library access in your device settings to select your Aadhaar card."
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.85,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uri = result.assets[0].uri;
          setAadhaarDoc(uri);
          setNewAadhaarPicked(true);
          setAadhaarStatus("UNDER_REVIEW");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (err) {
      console.log("[TenantEditProfileModal] Aadhaar picker error:", err);
      Alert.alert("Picker Error", "Could not load selected Aadhaar document image.");
    }
  };

  const promptAadhaarPicker = () => {
    Alert.alert(
      "Upload Aadhaar Card",
      "Choose a method to upload your Aadhaar Card document photo:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Camera", onPress: () => handlePickAadhaar("camera") },
        { text: "Choose from Gallery", onPress: () => handlePickAadhaar("gallery") },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your full name.");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSaving(true);

      // 1. Upload Aadhaar Card Document if a new local photo was picked
      if (newAadhaarPicked && aadhaarDoc && !aadhaarDoc.startsWith("http")) {
        const formData = new FormData();
        const filename = aadhaarDoc.split("/").pop() || `aadhaar_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

        formData.append("document", {
          uri: aadhaarDoc,
          name: filename,
          type,
        } as any);
        formData.append("aadhaarNumber", aadhaarNumber.replace(/\s+/g, "").trim());

        const uploadRes = await uploadAadhaar(formData);
        if (!uploadRes.success) {
          Alert.alert("Upload Notice", uploadRes.message || "Aadhaar file upload could not complete, saving other details.");
        }
      }

      // 2. Save profile updates (Note: email and phone are omitted/immutable)
      await onSave({
        name: name.trim(),
        occupation: occupation.trim(),
        aadhaarNumber: aadhaarNumber.replace(/\s+/g, "").trim(),
        emergencyContact: {
          name: emergencyName.trim(),
          phone: emergencyPhone.trim(),
          relation: emergencyRelation.trim(),
        },
        permanentAddress: permanentAddress.trim(),
      });

      setIsSaving(false);
      onClose();
      Alert.alert("Profile Updated", "Your profile details have been successfully saved.");
    } catch {
      setIsSaving(false);
    }
  };

  const renderStatusBadge = () => {
    switch (aadhaarStatus) {
      case "VERIFIED":
        return (
          <View style={[styles.statusBadge, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
            <Ionicons name="shield-checkmark" size={13} color="#10B981" />
            <Text style={[styles.statusBadgeText, { color: "#065F46" }]}>VERIFIED</Text>
          </View>
        );
      case "UNDER_REVIEW":
        return (
          <View style={[styles.statusBadge, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
            <Ionicons name="time-outline" size={13} color="#D97706" />
            <Text style={[styles.statusBadgeText, { color: "#92400E" }]}>UNDER REVIEW</Text>
          </View>
        );
      case "REJECTED":
        return (
          <View style={[styles.statusBadge, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
            <Ionicons name="alert-circle" size={13} color="#EF4444" />
            <Text style={[styles.statusBadgeText, { color: "#991B1B" }]}>REJECTED</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" }]}>
            <Ionicons name="cloud-upload-outline" size={13} color="#64748B" />
            <Text style={[styles.statusBadgeText, { color: "#475569" }]}>NOT UPLOADED</Text>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                Edit Profile & KYC
              </Text>
              <Text style={[styles.modalSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                Update personal details, Aadhaar card & emergency contact
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={isDark ? colors.textMuted : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. Personal Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                Personal Information
              </Text>

              <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Your full legal name"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />

              {/* Locked Phone Number */}
              <View style={styles.labelRow}>
                <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>Phone Number</Text>
                <View style={styles.immutableTag}>
                  <Ionicons name="lock-closed" size={10} color="#64748B" />
                  <Text style={styles.immutableText}>LOCKED / IMMUTABLE</Text>
                </View>
              </View>
              <TextInput
                style={[
                  styles.input,
                  styles.disabledInput,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                    borderColor: isDark ? colors.border : "#E2E8F0",
                    color: isDark ? "#94A3B8" : "#64748B",
                  },
                ]}
                value={phone}
                editable={false}
              />

              {/* Locked Email Address */}
              <View style={styles.labelRow}>
                <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>Email Address</Text>
                <View style={styles.immutableTag}>
                  <Ionicons name="lock-closed" size={10} color="#64748B" />
                  <Text style={styles.immutableText}>LOCKED / IMMUTABLE</Text>
                </View>
              </View>
              <TextInput
                style={[
                  styles.input,
                  styles.disabledInput,
                  {
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                    borderColor: isDark ? colors.border : "#E2E8F0",
                    color: isDark ? "#94A3B8" : "#64748B",
                  },
                ]}
                value={email}
                editable={false}
              />

              <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>Occupation / Workplace</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                  },
                ]}
                value={occupation}
                onChangeText={setOccupation}
                placeholder="e.g. Software Engineer at Tech Corp"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />
            </View>

            {/* 2. Aadhaar Card KYC Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                  Aadhaar Card Verification
                </Text>
                {renderStatusBadge()}
              </View>

              <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>
                Aadhaar Number (12 Digits)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                  },
                ]}
                value={aadhaarNumber}
                onChangeText={setAadhaarNumber}
                placeholder="e.g. 1234 5678 9012"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                keyboardType="numeric"
                maxLength={14}
              />

              <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>
                Aadhaar Card Photo / Document
              </Text>

              {aadhaarDoc ? (
                <View style={[styles.previewContainer, { borderColor: isDark ? colors.border : "#CBD5E1" }]}>
                  <Image
                    source={{ uri: getDocUri(aadhaarDoc) }}
                    style={styles.aadhaarPreviewImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.changeDocBtn}
                    onPress={promptAadhaarPicker}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="camera" size={14} color="#FFFFFF" />
                    <Text style={styles.changeDocText}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.uploadDocBox,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#CBD5E1",
                    },
                  ]}
                  onPress={promptAadhaarPicker}
                  activeOpacity={0.8}
                >
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="cloud-upload" size={24} color="#6366F1" />
                  </View>
                  <Text style={[styles.uploadBoxTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                    Upload Aadhaar Card (Front/Both sides)
                  </Text>
                  <Text style={[styles.uploadBoxSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    Tap to take photo or choose from photo library (JPG, PNG)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 3. Emergency Contact */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                Emergency Contact Details
              </Text>

              <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>Guardian / Contact Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                  },
                ]}
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholder="e.g. Rajesh Verma"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />

              <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>Contact Number</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                  },
                ]}
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />

              <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>Relationship</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                  },
                ]}
                value={emergencyRelation}
                onChangeText={setEmergencyRelation}
                placeholder="e.g. Parent, Sibling, Spouse"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />
            </View>

            {/* 4. Permanent Address */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                Permanent / Home Address
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                  },
                ]}
                value={permanentAddress}
                onChangeText={setPermanentAddress}
                placeholder="Enter your permanent residence address with city & pincode"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Locked Administrative Notice */}
            <View
              style={[
                styles.lockedBanner,
                {
                  backgroundColor: isDark ? "rgba(99,102,241,0.08)" : "#EEF2FF",
                  borderColor: isDark ? "rgba(99,102,241,0.2)" : "#C7D2FE",
                },
              ]}
            >
              <Ionicons name="lock-closed" size={16} color="#6366F1" />
              <Text style={[styles.lockedText, { color: isDark ? "#CBD5E1" : "#3730A3" }]}>
                Email address and mobile number are permanently linked to your lease agreement identity and OTP login.
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: "#6366F1",
                  opacity: isSaving ? 0.7 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Profile & KYC</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: "92%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  modalSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  section: {
    gap: 5,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 13.5,
    fontWeight: "800",
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    marginTop: 4,
  },
  immutableTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(100, 116, 139, 0.12)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 3,
  },
  immutableText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.4,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  disabledInput: {
    opacity: 0.85,
  },
  textArea: {
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  uploadDocBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  uploadBoxTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  uploadBoxSub: {
    fontSize: 10.5,
    textAlign: "center",
  },
  previewContainer: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  aadhaarPreviewImage: {
    width: "100%",
    height: 140,
    backgroundColor: "#0F172A",
  },
  changeDocBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeDocText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  lockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  lockedText: {
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
    fontWeight: "600",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
