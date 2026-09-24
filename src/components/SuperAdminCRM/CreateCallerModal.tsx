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

interface CreateCallerModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; email?: string; designation?: string }) => Promise<void>;
}

export const CreateCallerModal: React.FC<CreateCallerModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("Tele-caller / CRM Staff");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Name and phone number are required");
      return;
    }
    setError(null);
    try {
      setSubmitting(true);
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        designation: designation.trim(),
      });
      setName("");
      setPhone("");
      setEmail("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create tele-caller");
    } finally {
      setSubmitting(false);
    }
  };

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
                Register New Tele-Caller
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Provision new CRM staff account
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                placeholder="e.g. Rahul Verma"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Mobile Number *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                placeholder="10-digit Indian Mobile"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Official Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                placeholder="e.g. rahul@estatepartner.in"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Designation</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: colors.border,
                    color: isDark ? "#FFFFFF" : "#0F172A",
                  },
                ]}
                value={designation}
                onChangeText={setDesignation}
              />
            </View>
          </ScrollView>

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Create Account</Text>
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
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    padding: 10,
    fontSize: 13,
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
