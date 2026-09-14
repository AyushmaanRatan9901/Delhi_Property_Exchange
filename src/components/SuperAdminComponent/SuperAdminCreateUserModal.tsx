import React, { useState } from "react";
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
import { Feather } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES = [
  { id: "field_agent", label: "Field Agent", desc: "Submits properties & earns commission" },
  { id: "dealer", label: "Dealer / Broker", desc: "Partner broker with custom commission" },
  { id: "field_staff", label: "Verification Staff", desc: "On-site physical inspection & checklist" },
  { id: "tele_caller", label: "Tele-caller", desc: "Follows up leads & coordinates visits" },
  { id: "admin", label: "Operational Admin", desc: "Manages day-to-day leads & staff" },
];

export const SuperAdminCreateUserModal: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();

  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [role, setRole] = useState<string>("field_agent");
  const [commissionRate, setCommissionRate] = useState<string>("15");
  const [locality, setLocality] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleCreateUser = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter the full name of the user.");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      Alert.alert("Required", "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post("/auth/users", {
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        role,
        commissionRate: ["field_agent", "dealer"].includes(role) ? Number(commissionRate) || 0 : undefined,
        locality: locality.trim() ? [locality.trim()] : undefined,
      });

      Alert.alert("User Created!", "Account for " + name.trim() + " successfully registered as " + role.toUpperCase() + " with Staff ID!");
      setName("");
      setPhone("");
      setEmail("");
      setLocality("");
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert("Creation Error", e.message || "Failed to create user account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
            <View>
              <Text style={styles.badge}>MASTER USER PROVISIONING</Text>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Add Staff or Partner Agent
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Role Selection */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>SELECT SYSTEM ROLE</Text>
            <View style={styles.rolesGrid}>
              {ROLES.map((r) => {
                const isSelected = role === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => setRole(r.id)}
                    style={[
                      styles.roleOption,
                      {
                        backgroundColor: isSelected
                          ? "rgba(13, 148, 136, 0.12)"
                          : isDark
                          ? "#1E293B"
                          : "#F8FAFC",
                        borderColor: isSelected ? "#0D9488" : isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.roleName, { color: isSelected ? "#0D9488" : isDark ? "#FFFFFF" : "#0F172A" }]}>
                        {r.label}
                      </Text>
                      <Text style={[styles.roleDesc, { color: colors.textSecondary }]}>
                        {r.desc}
                      </Text>
                    </View>
                    {isSelected && <Feather name="check-circle" size={18} color="#0D9488" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* User Details */}
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>FULL NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                placeholder="e.g. Vikram Singh"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1.2 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>MOBILE NUMBER (LOGIN OTP)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="10-digit mobile"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View style={{ flex: 0.8 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>COMMISSION (%)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="e.g. 15"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="numeric"
                  value={commissionRate}
                  onChangeText={setCommissionRate}
                  editable={["field_agent", "dealer"].includes(role)}
                />
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL ADDRESS (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                placeholder="e.g. vikram@example.com"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>PRIMARY LOCALITY / ZONE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                placeholder="e.g. South Delhi, Dwarka, Noida Sector 62"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={locality}
                onChangeText={setLocality}
              />
            </View>

            <TouchableOpacity
              onPress={handleCreateUser}
              disabled={submitting}
              style={[
                styles.submitBtn,
                { backgroundColor: submitting ? "#94A3B8" : "#0D9488" },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="user-plus" size={18} color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Create User Account</Text>
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
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rolesGrid: {
    gap: 8,
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  roleName: {
    fontSize: 14,
    fontWeight: "700",
  },
  roleDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formField: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
