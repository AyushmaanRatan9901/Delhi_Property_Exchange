import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CallerItem } from "../../services/superAdminCrmApi";

interface CreateLeadModalProps {
  visible: boolean;
  callers: CallerItem[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const CreateLeadModal: React.FC<CreateLeadModalProps> = ({
  visible,
  callers,
  onClose,
  onSubmit,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("manual");
  const [requirementType, setRequirementType] = useState<"rent" | "sale">("rent");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [bhk, setBhk] = useState("2");
  const [budgetMin, setBudgetMin] = useState("20000");
  const [budgetMax, setBudgetMax] = useState("35000");
  const [assignedTo, setAssignedTo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Lead name and phone number are required");
      return;
    }
    setError(null);
    try {
      setSubmitting(true);
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        source,
        requirementType,
        priority,
        bhk: [Number(bhk)],
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        assignedTo: assignedTo || undefined,
        remarks: remarks.trim() || undefined,
      });
      setName("");
      setPhone("");
      setEmail("");
      setRemarks("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  const activeCallers = callers.filter((c) => c.caller.status === "active");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Add New CRM Lead
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Create prospective client enquiry
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            {/* Contact Details */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Client Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                placeholder="e.g. Vikramaditya Sharma"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Client Phone *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                placeholder="10-digit mobile number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Requirement Type & Priority Tabs */}
            <View style={styles.segmentedRow}>
              <View style={styles.halfCol}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Requirement</Text>
                <View style={styles.pillRow}>
                  <TouchableOpacity
                    style={[
                      styles.pill,
                      requirementType === "rent" ? styles.activePill : styles.inactivePill,
                    ]}
                    onPress={() => setRequirementType("rent")}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        requirementType === "rent" ? styles.activePillText : styles.inactivePillText,
                      ]}
                    >
                      Rent
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.pill,
                      requirementType === "sale" ? styles.activePill : styles.inactivePill,
                    ]}
                    onPress={() => setRequirementType("sale")}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        requirementType === "sale" ? styles.activePillText : styles.inactivePillText,
                      ]}
                    >
                      Buy
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.halfCol}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
                <View style={styles.pillRow}>
                  {(["medium", "high", "urgent"] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.pill,
                        priority === p ? styles.activePill : styles.inactivePill,
                      ]}
                      onPress={() => setPriority(p)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          priority === p ? styles.activePillText : styles.inactivePillText,
                        ]}
                      >
                        {p.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* BHK & Budget */}
            <View style={styles.segmentedRow}>
              <View style={styles.halfCol}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>BHK (1-4)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      borderColor: colors.border,
                      color: isDark ? "#FFFFFF" : "#0F172A",
                    },
                  ]}
                  keyboardType="numeric"
                  value={bhk}
                  onChangeText={setBhk}
                />
              </View>

              <View style={styles.halfCol}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Max Budget (₹)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                      borderColor: colors.border,
                      color: isDark ? "#FFFFFF" : "#0F172A",
                    },
                  ]}
                  keyboardType="numeric"
                  value={budgetMax}
                  onChangeText={setBudgetMax}
                />
              </View>
            </View>

            {/* Assign to Tele-caller */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Assign Immediately to Caller (Optional)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalCallers}>
                {activeCallers.map((c) => (
                  <TouchableOpacity
                    key={c.caller.id}
                    style={[
                      styles.callerPill,
                      assignedTo === c.caller.id
                        ? { backgroundColor: "#0D9488", borderColor: "#0D9488" }
                        : { backgroundColor: isDark ? "#1E293B" : "#F1F5F9", borderColor: colors.border },
                    ]}
                    onPress={() => setAssignedTo(assignedTo === c.caller.id ? "" : c.caller.id)}
                  >
                    <Text
                      style={[
                        styles.callerPillText,
                        { color: assignedTo === c.caller.id ? "#FFFFFF" : isDark ? "#E2E8F0" : "#334155" },
                      ]}
                    >
                      {c.caller.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Remarks */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Enquiry Notes</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                placeholder="Client preferences, timeline, area..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                value={remarks}
                onChangeText={setRemarks}
              />
            </View>
          </ScrollView>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Create Lead</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 16,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginBottom: 8,
  },
  formContent: {
    marginVertical: 4,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 9,
    fontSize: 13,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  halfCol: {
    flex: 1,
  },
  pillRow: {
    flexDirection: "row",
    gap: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 6,
    alignItems: "center",
    borderWidth: 1,
  },
  activePill: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  inactivePill: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
  },
  pillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  activePillText: {
    color: "#FFFFFF",
  },
  inactivePillText: {
    color: "#475569",
  },
  horizontalCallers: {
    flexDirection: "row",
    marginTop: 4,
  },
  callerPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  callerPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#0D9488",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
