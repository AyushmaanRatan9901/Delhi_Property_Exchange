import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

interface AutomationRuleModalProps {
  visible: boolean;
  rule: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const DYNAMIC_TAGS = [
  "{{tenant_name}}",
  "{{property_name}}",
  "{{unit_number}}",
  "{{rent_amount}}",
  "{{due_date}}",
  "{{outstanding_amount}}",
  "{{lease_start_date}}",
  "{{lease_end_date}}",
];

export const SuperAdminAutomationRuleModal: React.FC<AutomationRuleModalProps> = ({
  visible,
  rule,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();

  const [name, setName] = useState<string>("");
  const [enabled, setEnabled] = useState<boolean>(true);
  const [event, setEvent] = useState<string>("days_before_due");
  const [daysValue, setDaysValue] = useState<string>("5");
  const [titleTemplate, setTitleTemplate] = useState<string>("");
  const [messageTemplate, setMessageTemplate] = useState<string>("");

  // Channels
  const [inApp, setInApp] = useState<boolean>(true);
  const [push, setPush] = useState<boolean>(true);
  const [sms, setSms] = useState<boolean>(false);
  const [email, setEmail] = useState<boolean>(false);

  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (visible && rule) {
      setName(rule.name || "");
      setEnabled(rule.enabled !== false);
      setEvent(rule.trigger?.event || "days_before_due");
      setDaysValue(
        String(
          rule.trigger?.daysBefore ||
            rule.trigger?.daysAfter ||
            rule.trigger?.recurringDays ||
            "5"
        )
      );
      setTitleTemplate(rule.titleTemplate || "");
      setMessageTemplate(rule.messageTemplate || "");
      setInApp(rule.channels?.inApp !== false);
      setPush(rule.channels?.push !== false);
      setSms(Boolean(rule.channels?.sms));
      setEmail(Boolean(rule.channels?.email));
    }
  }, [visible, rule]);

  if (!visible || !rule) return null;

  const handleInsertTag = (tag: string) => {
    setMessageTemplate((prev) => `${prev} ${tag}`);
  };

  const handleSave = async () => {
    if (!titleTemplate.trim() || !messageTemplate.trim()) {
      Alert.alert("Required", "Please provide a valid title and message template.");
      return;
    }

    setSaving(true);
    try {
      const numDays = Number(daysValue) || 1;
      const trigger = {
        event,
        daysBefore: event.includes("before") ? numDays : 0,
        daysAfter: event.includes("after") ? numDays : 0,
        recurringDays: event.includes("recurring") ? numDays : 0,
      };

      await apiClient.patch(`/notification-automations/${rule._id || rule.id}`, {
        name,
        enabled,
        trigger,
        titleTemplate: titleTemplate.trim(),
        messageTemplate: messageTemplate.trim(),
        channels: {
          inApp,
          push,
          sms,
          email,
        },
      });

      Alert.alert("Automation Saved! ✅", "The automation rule settings have been updated successfully.", [
        {
          text: "OK",
          onPress: () => {
            onSuccess?.();
            onClose();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Save Failed",
        err.response?.data?.message || err.message || "Failed to update automation rule"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
            <View>
              <Text style={styles.badge}>AUTOMATION RULE SETTINGS</Text>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {name || "Configure Automation"}
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
            {/* Status Switcher */}
            <View style={[styles.switchCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <View>
                <Text style={[styles.switchTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Automation Engine Status
                </Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                  {enabled ? "Rule is Active and executing on background schedule" : "Rule is Paused"}
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ false: "#64748B", true: "#10B981" }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Trigger Configuration */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>TRIGGER EVENT</Text>
              <View style={[styles.triggerBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.triggerText, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {event === "days_before_due"
                      ? "Send X Days Before Rent Due Date"
                      : event === "on_due_date"
                      ? "Send on Exact Rent Due Date"
                      : event === "days_after_due"
                      ? "Send X Days After Rent Due Date (Overdue)"
                      : event === "recurring_days_after_due"
                      ? "Send Recurring Every X Days While Overdue"
                      : "Send X Days Before Lease Expiry"}
                  </Text>
                </View>

                {event !== "on_due_date" && (
                  <View style={styles.daysInputWrap}>
                    <TextInput
                      style={[styles.daysInput, { color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#475569" : "#CBD5E1" }]}
                      value={daysValue}
                      onChangeText={setDaysValue}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={[styles.daysLabel, { color: colors.textSecondary }]}>Days</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Title Template */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>NOTIFICATION TITLE TEMPLATE</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    color: isDark ? "#FFFFFF" : "#0F172A",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
                value={titleTemplate}
                onChangeText={setTitleTemplate}
                placeholder="Title template..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />
            </View>

            {/* Message Template */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>MESSAGE BODY TEMPLATE</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    color: isDark ? "#FFFFFF" : "#0F172A",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
                value={messageTemplate}
                onChangeText={setMessageTemplate}
                multiline
                numberOfLines={4}
                placeholder="Message template with dynamic tags..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              />

              {/* Dynamic Tag Chips */}
              <Text style={[styles.tagHelper, { color: colors.textMuted }]}>
                TAP TO INSERT VARIABLE:
              </Text>
              <View style={styles.tagChipsWrap}>
                {DYNAMIC_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => handleInsertTag(tag)}
                    style={[styles.tagChip, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
                  >
                    <Text style={styles.tagChipText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dispatch Channels */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>DISPATCH CHANNELS</Text>
              <View style={styles.channelsRow}>
                <TouchableOpacity
                  onPress={() => setInApp(!inApp)}
                  style={[
                    styles.channelCard,
                    {
                      backgroundColor: inApp ? "#ECFDF5" : isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: inApp ? "#10B981" : isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Ionicons
                    name={inApp ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={inApp ? "#10B981" : "#94A3B8"}
                  />
                  <Text style={[styles.channelText, { color: inApp ? "#065F46" : colors.textSecondary }]}>
                    In-App
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPush(!push)}
                  style={[
                    styles.channelCard,
                    {
                      backgroundColor: push ? "#ECFDF5" : isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: push ? "#10B981" : isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Ionicons
                    name={push ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={push ? "#10B981" : "#94A3B8"}
                  />
                  <Text style={[styles.channelText, { color: push ? "#065F46" : colors.textSecondary }]}>
                    Push
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSms(!sms)}
                  style={[
                    styles.channelCard,
                    {
                      backgroundColor: sms ? "#ECFDF5" : isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: sms ? "#10B981" : isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Ionicons
                    name={sms ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={sms ? "#10B981" : "#94A3B8"}
                  />
                  <Text style={[styles.channelText, { color: sms ? "#065F46" : colors.textSecondary }]}>
                    SMS
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setEmail(!email)}
                  style={[
                    styles.channelCard,
                    {
                      backgroundColor: email ? "#ECFDF5" : isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: email ? "#10B981" : isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Ionicons
                    name={email ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={email ? "#10B981" : "#94A3B8"}
                  />
                  <Text style={[styles.channelText, { color: email ? "#065F46" : colors.textSecondary }]}>
                    Email
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Action */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveBtn, { backgroundColor: saving ? "#94A3B8" : "#6366F1" }]}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Automation Rule</Text>
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
    maxHeight: "92%",
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
    color: "#6366F1",
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
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  formField: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  triggerBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: "700",
  },
  daysInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  daysInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 44,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 14,
  },
  daysLabel: {
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
    minHeight: 80,
  },
  tagHelper: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  tagChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagChipText: {
    fontSize: 11,
    color: "#0D9488",
    fontWeight: "700",
  },
  channelsRow: {
    flexDirection: "row",
    gap: 8,
  },
  channelCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  channelText: {
    fontSize: 11,
    fontWeight: "700",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
