import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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
import { TenantComplaint } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantRaiseComplaintModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    preferredVisitTime?: string;
    photos?: string[];
  }) => Promise<TenantComplaint>;
}

const CATEGORIES = [
  { id: "plumbing", label: "Plumbing", icon: "water" as const, color: "#0284C7" },
  { id: "electrical", label: "Electrical", icon: "flash" as const, color: "#D97706" },
  { id: "water", label: "Water Supply", icon: "water-outline" as const, color: "#06B6D4" },
  { id: "cleaning", label: "Cleaning", icon: "sparkles" as const, color: "#10B981" },
  { id: "maintenance", label: "Maintenance", icon: "construct" as const, color: "#6366F1" },
  { id: "appliance", label: "Appliance", icon: "tv-outline" as const, color: "#8B5CF6" },
  { id: "damage", label: "Property Damage", icon: "hammer" as const, color: "#EF4444" },
  { id: "other", label: "Other Request", icon: "help-circle-outline" as const, color: "#64748B" },
];

const PRIORITIES: Array<{ id: "low" | "medium" | "high" | "urgent"; label: string; color: string }> = [
  { id: "low", label: "Low (3-5 Days)", color: "#10B981" },
  { id: "medium", label: "Medium (Standard)", color: "#0284C7" },
  { id: "high", label: "High (Within 24h)", color: "#F59E0B" },
  { id: "urgent", label: "Urgent (Emergency)", color: "#EF4444" },
];

const TIME_SLOTS = [
  "Morning (9 AM - 12 PM)",
  "Afternoon (12 PM - 4 PM)",
  "Evening (4 PM - 7 PM)",
  "Weekend Anytime",
];

export const TenantRaiseComplaintModal: React.FC<TenantRaiseComplaintModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>("plumbing");
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [photos, setPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleAddPhoto = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    Alert.alert("Attach Photo", "Simulating photo attachment from device gallery.");
    setPhotos((prev) => [
      ...prev,
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
    ]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() && !description.trim()) {
      Alert.alert("Missing Details", "Please provide a brief description of the issue.");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSubmitting(true);
      await onSubmit({
        category: selectedCategory,
        title: title.trim() || `${selectedCategory.toUpperCase()} Maintenance`,
        description: description.trim() || title.trim(),
        priority: selectedPriority,
        preferredVisitTime: selectedSlot,
        photos,
      });

      // Reset
      setTitle("");
      setDescription("");
      setIsSubmitting(false);
      onClose();
      Alert.alert("Complaint Submitted", "Your request has been logged. Our maintenance team will contact you shortly.");
    } catch (err) {
      setIsSubmitting(false);
      Alert.alert("Error", "Could not submit complaint. Please try again.");
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
                Raise Maintenance Request
              </Text>
              <Text style={[styles.modalSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                Verified technicians assigned within 24 hours
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={isDark ? colors.textMuted : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* 1. Category Picker */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                1. Select Issue Category
              </Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catChip,
                        {
                          backgroundColor: isSelected
                            ? isDark ? "#0C293D" : "#F0F9FF"
                            : isDark ? colors.surfaceLight : "#F8FAFC",
                          borderColor: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.border : "#E2E8F0"),
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={18}
                        color={isSelected ? (isDark ? "#38BDF8" : "#0284C7") : cat.color}
                      />
                      <Text
                        style={[
                          styles.catText,
                          {
                            color: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.textPrimary : "#334155"),
                            fontWeight: isSelected ? "800" : "600",
                          },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Issue Title & Description */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                2. Issue Details
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
                placeholder="Short Title (e.g. Master bathroom tap dripping)"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                    color: isDark ? colors.textPrimary : "#0F172A",
                  },
                ]}
                placeholder="Detailed description of problem, location in flat, etc."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* 3. Priority Selector */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                3. Urgency / Priority
              </Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => {
                  const isSelected = selectedPriority === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.priorityChip,
                        {
                          backgroundColor: isSelected
                            ? isDark ? "#0C293D" : "#F0F9FF"
                            : isDark ? colors.surfaceLight : "#F8FAFC",
                          borderColor: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.border : "#E2E8F0"),
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setSelectedPriority(p.id)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                      <Text
                        style={[
                          styles.priorityText,
                          {
                            color: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.textPrimary : "#334155"),
                            fontWeight: isSelected ? "800" : "600",
                          },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Preferred Visit Time */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                4. Preferred Technician Visit Slot
              </Text>
              <View style={styles.slotsRow}>
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.slotChip,
                        {
                          backgroundColor: isSelected
                            ? isDark ? "#0C293D" : "#F0F9FF"
                            : isDark ? colors.surfaceLight : "#F8FAFC",
                          borderColor: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.border : "#E2E8F0"),
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                      activeOpacity={0.75}
                    >
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? "#94A3B8" : "#64748B")}
                      />
                      <Text
                        style={[
                          styles.slotText,
                          {
                            color: isSelected ? (isDark ? "#38BDF8" : "#0284C7") : (isDark ? colors.textPrimary : "#334155"),
                            fontWeight: isSelected ? "800" : "600",
                          },
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. Photos Attachment */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                5. Photos & Media Proof
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
                {photos.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumbWrapper}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => handleRemovePhoto(idx)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close" size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity
                  style={[
                    styles.addPhotoBtn,
                    {
                      backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#CBD5E1",
                    },
                  ]}
                  onPress={handleAddPhoto}
                  activeOpacity={0.75}
                >
                  <Ionicons name="camera-outline" size={24} color={isDark ? "#38BDF8" : "#0284C7"} />
                  <Text style={[styles.addPhotoText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>Add Photo</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Submit Action */}
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
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Submit Complaint</Text>
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
    paddingBottom: 24,
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
    fontSize: 12,
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
    gap: 16,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    width: "48.2%",
  },
  catText: {
    fontSize: 12.5,
  },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13.5,
    fontWeight: "600",
  },
  textArea: {
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 13.5,
    fontWeight: "500",
    marginTop: 4,
  },
  priorityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
  },
  slotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  slotText: {
    fontSize: 12,
  },
  photosRow: {
    flexDirection: "row",
    gap: 10,
  },
  photoThumbWrapper: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  photoThumb: {
    width: "100%",
    height: "100%",
  },
  removePhotoBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoBtn: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addPhotoText: {
    fontSize: 10,
    fontWeight: "700",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
