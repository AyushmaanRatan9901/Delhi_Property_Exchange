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

interface RentReminderModalProps {
  visible: boolean;
  tenantData: any;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SuperAdminRentReminderModal: React.FC<RentReminderModalProps> = ({
  visible,
  tenantData,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();

  const [title, setTitle] = useState<string>("Rent Payment Reminder");
  const [message, setMessage] = useState<string>(
    "Hello {{tenant_name}}, your rent of {{rent_amount}} for {{property_name}} - {{unit_number}} is due on {{due_date}}. Please make the payment before the due date."
  );
  const [sending, setSending] = useState<boolean>(false);

  useEffect(() => {
    if (visible && tenantData) {
      setTitle(`Rent Payment Reminder: ${tenantData.propertyTitle || "Delhi Property"}`);
      setMessage(
        `Hello {{tenant_name}}, your monthly rent of {{rent_amount}} for {{property_name}} ({{unit_number}}) is due on {{due_date}}. Please make the payment before the due date via UPI or App.`
      );
    }
  }, [visible, tenantData]);

  if (!visible || !tenantData) return null;

  const tenantName = tenantData.tenantName || "Resident";
  const propTitle = tenantData.propertyTitle || "Property";
  const unitNumber = tenantData.unitNumber || "Unit";
  const rentAmount = `₹${Number(tenantData.amount || tenantData.monthlyRent || 18000).toLocaleString("en-IN")}`;
  const dueDate = tenantData.dueDateFormatted || "05 Sep 2026";

  // Compute live interpolated preview
  const livePreview = message
    .replace(/\{\{tenant_name\}\}/gi, tenantName)
    .replace(/\{\{property_name\}\}/gi, propTitle)
    .replace(/\{\{unit_number\}\}/gi, unitNumber)
    .replace(/\{\{rent_amount\}\}/gi, rentAmount)
    .replace(/\{\{due_date\}\}/gi, dueDate);

  const handleSendReminder = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Required", "Please provide a valid notification title and message template.");
      return;
    }

    setSending(true);
    try {
      await apiClient.post("/notifications/send-manual", {
        tenantId: tenantData.tenantId,
        propertyId: tenantData.propertyId || tenantData.leadId,
        leadId: tenantData.leadId,
        title: title.trim(),
        message: message.trim(),
        amount: tenantData.amount || tenantData.monthlyRent,
        dueDate: tenantData.dueDate,
        type: "rent_reminder",
        priority: "high",
      });

      Alert.alert(
        "Reminder Dispatched! 🚀",
        `Rent payment reminder has been delivered to ${tenantName}'s mobile app and logged in notification records.`,
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
        "Dispatch Failed",
        err.response?.data?.message || err.message || "Failed to send notification"
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
              <Text style={styles.badge}>MANUAL RENT REMINDER</Text>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Review & Send Rent Notice
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
            {/* Target Particulars */}
            <View style={[styles.targetCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>TENANT:</Text>
                <Text style={[styles.targetVal, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {tenantName} ({tenantData.tenantPhone || "N/A"})
                </Text>
              </View>

              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>PROPERTY:</Text>
                <Text style={[styles.targetVal, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {propTitle} • {unitNumber}
                </Text>
              </View>

              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>AMOUNT:</Text>
                <Text style={[styles.targetVal, { color: "#0D9488", fontWeight: "800" }]}>
                  {rentAmount}
                </Text>
              </View>

              <View style={styles.targetRow}>
                <Text style={[styles.targetLabel, { color: colors.textSecondary }]}>DUE DATE:</Text>
                <Text style={[styles.targetVal, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {dueDate}
                </Text>
              </View>
            </View>

            {/* Title Input */}
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
                value={title}
                onChangeText={setTitle}
                placeholder="Notification Title"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />
            </View>

            {/* Message Template Input */}
            <View style={styles.formField}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>MESSAGE TEMPLATE</Text>
                <Text style={[styles.tagHint, { color: "#0D9488" }]}>Supports dynamic &#123;&#123;tags&#125;&#125;</Text>
              </View>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    color: isDark ? "#FFFFFF" : "#0F172A",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                placeholder="Message template..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />
            </View>

            {/* Live Rendered Preview */}
            <View style={[styles.previewCard, { backgroundColor: isDark ? "rgba(13, 148, 136, 0.12)" : "#F0FDFA", borderColor: isDark ? "#0F766E" : "#99F6E4" }]}>
              <View style={styles.previewHeader}>
                <Ionicons name="phone-portrait-outline" size={16} color="#0D9488" />
                <Text style={styles.previewTitle}>Live Tenant Preview</Text>
              </View>
              <Text style={[styles.previewText, { color: isDark ? "#CCFBF1" : "#134E4A" }]}>
                {livePreview}
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              onPress={handleSendReminder}
              disabled={sending}
              style={[styles.sendBtn, { backgroundColor: sending ? "#94A3B8" : "#0D9488" }]}
              activeOpacity={0.8}
            >
              {sending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.sendBtnText}>Send Rent Reminder to Tenant</Text>
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
    color: "#0D9488",
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
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  targetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  targetVal: {
    fontSize: 13,
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
  tagHint: {
    fontSize: 10,
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
    minHeight: 80,
  },
  previewCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0D9488",
  },
  previewText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  sendBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
