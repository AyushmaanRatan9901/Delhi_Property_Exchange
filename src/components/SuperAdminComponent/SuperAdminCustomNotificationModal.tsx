import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

interface CustomNotificationModalProps {
  visible: boolean;
  initialRecipient?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const NOTIFICATION_TYPES = [
  { id: "rent_reminder", label: "Rent Reminder", icon: "time-outline", color: "#0D9488" },
  { id: "rent_due", label: "Rent Due", icon: "calendar-outline", color: "#0284C7" },
  { id: "rent_overdue", label: "Rent Overdue", icon: "alert-circle-outline", color: "#EF4444" },
  { id: "security_deposit", label: "Security Deposit", icon: "shield-checkmark-outline", color: "#6366F1" },
  { id: "lease_expiry", label: "Lease Expiry", icon: "document-text-outline", color: "#F59E0B" },
  { id: "maintenance_inspection", label: "Maintenance / Inspection", icon: "construct-outline", color: "#8B5CF6" },
  { id: "custom", label: "Custom Notification", icon: "mail-outline", color: "#10B981" },
];

export const SuperAdminCustomNotificationModal: React.FC<CustomNotificationModalProps> = ({
  visible,
  initialRecipient,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();

  const [selectedType, setSelectedType] = useState<string>("custom");
  const [recipientRole, setRecipientRole] = useState<string>("tenant");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [priority, setPriority] = useState<string>("medium");
  const [sending, setSending] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      if (initialRecipient) {
        setTitle(`Notice for ${initialRecipient.tenantName || initialRecipient.name || "Resident"}`);
      } else {
        setTitle("");
      }
      setMessage("");
      setSelectedType("custom");
    }
  }, [visible, initialRecipient]);

  if (!visible) return null;

  const handleSend = async () => {
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a notification title.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Required", "Please enter the notification message body.");
      return;
    }

    setSending(true);
    try {
      await apiClient.post("/notifications/send-custom", {
        recipientId: initialRecipient?.tenantId || initialRecipient?._id || initialRecipient?.id || undefined,
        recipientRole,
        propertyId: initialRecipient?.propertyId || initialRecipient?.leadId,
        leadId: initialRecipient?.leadId,
        type: selectedType,
        title: title.trim(),
        message: message.trim(),
        priority,
      });

      Alert.alert(
        "Notification Sent! ✉️",
        "Your notification has been dispatched successfully and recorded in the audit history.",
        [
          {
            text: "OK",
            onPress: () => {
              onSuccess?.();
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        "Sending Failed",
        err.response?.data?.message || err.message || "Failed to dispatch notification"
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
            <View>
              <Text style={styles.badge}>NOTIFICATION DISPATCHER</Text>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Send Custom Notification
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
            >
              <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Recipient Target Info */}
            <View style={[styles.targetCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>TARGET RECIPIENT</Text>
              <Text style={[styles.targetName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {initialRecipient?.tenantName || initialRecipient?.name
                  ? `${initialRecipient?.tenantName || initialRecipient?.name} (${initialRecipient?.propertyTitle || "Direct User"})`
                  : "All Active Registered Tenants"}
              </Text>
            </View>

            {/* Notification Type Selector */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>NOTIFICATION TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeChipsRow}>
                {NOTIFICATION_TYPES.map((t) => {
                  const isSel = selectedType === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setSelectedType(t.id)}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor: isSel ? t.color : isDark ? "#1E293B" : "#F1F5F9",
                          borderColor: isSel ? t.color : isDark ? "#334155" : "#E2E8F0",
                        },
                      ]}
                    >
                      <Ionicons
                        name={t.icon as any}
                        size={14}
                        color={isSel ? "#FFFFFF" : colors.textSecondary}
                      />
                      <Text style={[styles.typeChipText, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Title */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>NOTIFICATION TITLE</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    color: isDark ? "#FFFFFF" : "#0F172A",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
                placeholder="e.g. Scheduled Society Maintenance Notice"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Message Body */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>MESSAGE CONTENT</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    color: isDark ? "#FFFFFF" : "#0F172A",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
                placeholder="Type your message to be delivered directly to the user's notification feed..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Priority Selector */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>PRIORITY LEVEL</Text>
              <View style={styles.priorityRow}>
                {["low", "medium", "high", "urgent"].map((p) => {
                  const isSel = priority === p;
                  const pCol = p === "urgent" ? "#EF4444" : p === "high" ? "#F59E0B" : p === "medium" ? "#3B82F6" : "#10B981";
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPriority(p)}
                      style={[
                        styles.priorityBtn,
                        {
                          backgroundColor: isSel ? pCol : isDark ? "#1E293B" : "#F1F5F9",
                        },
                      ]}
                    >
                      <Text style={[styles.priorityText, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Action */}
            <TouchableOpacity
              onPress={handleSend}
              disabled={sending}
              style={[styles.sendBtn, { backgroundColor: sending ? "#94A3B8" : "#10B981" }]}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.sendBtnText}>Dispatch Notification Now</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "90%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  badge: {
    color: "#10B981",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 20,
    gap: 14,
  },
  targetCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  targetName: {
    fontSize: 14,
    fontWeight: "700",
  },
  formField: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  typeChipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    textAlignVertical: "top",
    minHeight: 85,
  },
  priorityRow: {
    flexDirection: "row",
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "800",
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  sendBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
