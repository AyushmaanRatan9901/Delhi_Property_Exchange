import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { TenantProfile } from "../../constants/tenantData";
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

  const [name, setName] = useState<string>(profile.name);
  const [email, setEmail] = useState<string>(profile.email);
  const [occupation, setOccupation] = useState<string>(profile.occupation || "");
  const [emergencyName, setEmergencyName] = useState<string>(profile.emergencyContact?.name || "");
  const [emergencyPhone, setEmergencyPhone] = useState<string>(profile.emergencyContact?.phone || "");
  const [emergencyRelation, setEmergencyRelation] = useState<string>(profile.emergencyContact?.relation || "");
  const [permanentAddress, setPermanentAddress] = useState<string>(profile.permanentAddress || "");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter your full name.");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSaving(true);
      await onSave({
        name: name.trim(),
        email: email.trim(),
        occupation: occupation.trim(),
        emergencyContact: {
          name: emergencyName.trim(),
          phone: emergencyPhone.trim(),
          relation: emergencyRelation.trim(),
        },
        permanentAddress: permanentAddress.trim(),
      });
      setIsSaving(false);
      onClose();
      Alert.alert("Profile Updated", "Your profile and emergency contact information have been updated.");
    } catch {
      setIsSaving(false);
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
                Edit Profile & Contacts
              </Text>
              <Text style={[styles.modalSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                Update personal details & emergency guardian
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
              />

              <Text style={[styles.fieldLabel, { color: isDark ? colors.textSecondary : "#475569" }]}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                  },
                ]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
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

            {/* 2. Emergency Contact */}
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

            {/* 3. Permanent Address */}
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
                  backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              <Ionicons name="lock-closed" size={16} color={isDark ? "#94A3B8" : "#64748B"} />
              <Text style={[styles.lockedText, { color: isDark ? colors.textMuted : "#64748B" }]}>
                Tenancy parameters (Property allocation, Rent ₹, Agreement & KYC numbers) are verified and locked by Super Admin / Staff.
              </Text>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: isDark ? "#0284C7" : "#0284C7",
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
                  <Text style={styles.saveBtnText}>Save Profile Changes</Text>
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
  sectionLabel: {
    fontSize: 13.5,
    fontWeight: "800",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    marginTop: 4,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  textArea: {
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    fontWeight: "500",
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
