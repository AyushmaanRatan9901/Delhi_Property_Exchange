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
import { RoomChangeRequest } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantRoomChangeModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    reason: string;
    description: string;
    targetBhk?: string;
    targetLocality?: string;
    budgetRange?: string;
    preferredMoveDate?: string;
    photos?: string[];
  }) => Promise<RoomChangeRequest>;
}

const REASONS = [
  { id: "need_bigger_space", label: "Need Bigger Space / Upgrade", icon: "arrow-up-circle-outline" as const },
  { id: "budget_change", label: "Budget Adjustment", icon: "wallet-outline" as const },
  { id: "job_relocation", label: "Job / Office Relocation", icon: "briefcase-outline" as const },
  { id: "roommate_issue", label: "Roommate / Society Change", icon: "people-outline" as const },
  { id: "property_condition", label: "Amenity / Floor Change", icon: "business-outline" as const },
  { id: "other", label: "Other Personal Reason", icon: "help-circle-outline" as const },
];

const BHK_OPTIONS = ["1 RK / Studio", "1 BHK", "2 BHK", "3 BHK", "4 BHK Luxury"];

export const TenantRoomChangeModal: React.FC<TenantRoomChangeModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const [selectedReason, setSelectedReason] = useState<string>("need_bigger_space");
  const [selectedBhk, setSelectedBhk] = useState<string>("3 BHK");
  const [targetLocality, setTargetLocality] = useState<string>("Sector 62 / 63, Noida");
  const [budgetRange, setBudgetRange] = useState<string>("₹22,000 - ₹28,000");
  const [description, setDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Description Required", "Please provide a brief reason for your room change request.");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSubmitting(true);
      await onSubmit({
        reason: selectedReason,
        description: description.trim(),
        targetBhk: selectedBhk,
        targetLocality: targetLocality.trim(),
        budgetRange: budgetRange.trim(),
      });

      setDescription("");
      setIsSubmitting(false);
      onClose();
      Alert.alert("Request Submitted", "Your room/property change request has been assigned to our allocation team.");
    } catch {
      setIsSubmitting(false);
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
                Room / Property Change
              </Text>
              <Text style={[styles.modalSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                Smooth unit transfer with continuous security deposit rollover
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={isDark ? colors.textMuted : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Policy Advisory Banner */}
            <View
              style={[
                styles.policyBanner,
                {
                  backgroundColor: isDark ? "#0C293D" : "#F0F9FF",
                  borderColor: isDark ? "#0369A1" : "#BAE6FD",
                },
              ]}
            >
              <Ionicons name="information-circle" size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
              <Text style={[styles.policyText, { color: isDark ? "#E0F2FE" : "#0369A1" }]}>
                Your current security deposit will automatically transfer to your new unit upon final inspection approval.
              </Text>
            </View>

            {/* 1. Reason Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                1. Reason for Transfer
              </Text>
              <View style={styles.reasonsGrid}>
                {REASONS.map((r) => {
                  const isSelected = selectedReason === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[
                        styles.reasonChip,
                        {
                          backgroundColor: isSelected
                            ? isDark ? "#0C293D" : "#F0F9FF"
                            : isDark ? colors.surfaceLight : "#F8FAFC",
                          borderColor: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.border : "#E2E8F0"),
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setSelectedReason(r.id)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={r.icon}
                        size={18}
                        color={isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? "#94A3B8" : "#64748B")}
                      />
                      <Text
                        style={[
                          styles.reasonText,
                          {
                            color: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.textPrimary : "#334155"),
                            fontWeight: isSelected ? "800" : "600",
                          },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Target Configuration */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                2. Preferred Configuration
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bhkRow}>
                {BHK_OPTIONS.map((bhk) => {
                  const isSelected = selectedBhk === bhk;
                  return (
                    <TouchableOpacity
                      key={bhk}
                      style={[
                        styles.bhkChip,
                        {
                          backgroundColor: isSelected
                            ? isDark ? "#0C293D" : "#F0F9FF"
                            : isDark ? colors.surfaceLight : "#F8FAFC",
                          borderColor: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.border : "#E2E8F0"),
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setSelectedBhk(bhk)}
                    >
                      <Text
                        style={[
                          styles.bhkText,
                          {
                            color: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.textPrimary : "#334155"),
                            fontWeight: isSelected ? "800" : "600",
                          },
                        ]}
                      >
                        {bhk}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 3. Target Locality & Budget */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                3. Target Locality & Estimated Budget
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
                placeholder="Preferred Locality / Sector (e.g. Sector 62, Noida)"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={targetLocality}
                onChangeText={setTargetLocality}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                    marginTop: 6,
                  },
                ]}
                placeholder="Budget Range (e.g. ₹20,000 - ₹25,000)"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={budgetRange}
                onChangeText={setBudgetRange}
              />
            </View>

            {/* 4. Description Notes */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                4. Requirements / Timeline
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
                placeholder="Please describe your specific requirements, preferred floor, family size, move date, etc."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                {
                  backgroundColor: isDark ? "#0284C7" : "#0284C7",
                  opacity: isSubmitting ? 0.7 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit Transfer Request</Text>
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
  policyBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  policyText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    lineHeight: 16,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  reasonsGrid: {
    gap: 6,
  },
  reasonChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 8,
  },
  reasonText: {
    fontSize: 12.5,
  },
  bhkRow: {
    flexDirection: "row",
    gap: 8,
  },
  bhkChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bhkText: {
    fontSize: 12.5,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: "600",
  },
  textArea: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    fontWeight: "500",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 6,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
