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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

interface Props {
  visible: boolean;
  lead: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuperAdminDealModal: React.FC<Props> = ({
  visible,
  lead,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();

  const [dealType, setDealType] = useState<string>("rent");
  const [finalPrice, setFinalPrice] = useState<string>("");
  const [deposit, setDeposit] = useState<string>("");
  const [tenantName, setTenantName] = useState<string>("");
  const [tenantPhone, setTenantPhone] = useState<string>("");
  const [tenantAadhaarLast4, setTenantAadhaarLast4] = useState<string>("");
  const [agreementNumber, setAgreementNumber] = useState<string>("");
  const [policeVerificationStatus, setPoliceVerificationStatus] = useState<string>("pending");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (lead) {
      setDealType(lead.listingType === "sale" ? "sale" : "rent");
      setFinalPrice(lead.expectedPrice ? String(lead.expectedPrice) : "");
      setDeposit(lead.securityDeposit ? String(lead.securityDeposit) : "");
      const rand = Math.floor(100000 + Math.random() * 900000);
      setAgreementNumber("AGR-DPE-" + rand);
    }
  }, [lead, visible]);

  const handleConfirmDeal = async () => {
    if (!tenantName.trim()) {
      Alert.alert("Required", "Please enter the Tenant / Buyer's full name.");
      return;
    }
    if (!tenantPhone.trim() || tenantPhone.trim().length < 10) {
      Alert.alert("Required", "Please enter a valid 10-digit mobile number for the tenant.");
      return;
    }
    if (!finalPrice || Number(finalPrice) <= 0) {
      Alert.alert("Required", "Please enter a valid finalized price.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.patch("/leads/" + lead._id + "/deal", {
        dealType,
        finalPrice: Number(finalPrice),
        deposit: Number(deposit) || 0,
        tenantName: tenantName.trim(),
        tenantPhone: tenantPhone.trim(),
        tenantAadhaarLast4: tenantAadhaarLast4.trim(),
        agreementNumber: agreementNumber.trim(),
        policeVerificationStatus,
        notes: notes.trim(),
      });
      Alert.alert("Deal Finalized!", "Property has been successfully closed and marked as Rented/Sold. Initial Rent Ledger & Owner Payout entries generated!");
      onSuccess();
      onClose();
    } catch (e: any) {
      Alert.alert("Deal Confirmation Error", e.message || "Failed to confirm deal");
    } finally {
      setSubmitting(false);
    }
  };

  if (!lead) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
            <View>
              <Text style={styles.badge}>DEAL FINALIZATION & BOOKING</Text>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Confirm Deal & Rent Agreement
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Property Summary */}
            <View style={[styles.propSummary, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
              <Text style={[styles.propTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {lead.title || (lead.propertyType + " in " + lead.locality)}
              </Text>
              <Text style={[styles.propOwner, { color: colors.textSecondary }]}>
                Owner: {lead.ownerName} ({lead.ownerPhone})
              </Text>
            </View>

            {/* Deal Type Switcher */}
            <View style={styles.dealTypeRow}>
              <TouchableOpacity
                onPress={() => setDealType("rent")}
                style={[
                  styles.dealTypeBtn,
                  {
                    backgroundColor: dealType === "rent" ? "#0D9488" : isDark ? "#1E293B" : "#F1F5F9",
                  },
                ]}
              >
                <Ionicons name="key" size={16} color={dealType === "rent" ? "#FFFFFF" : colors.textSecondary} />
                <Text style={[styles.dealTypeBtnText, { color: dealType === "rent" ? "#FFFFFF" : colors.textSecondary }]}>
                  RENTAL LEASE
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDealType("sale")}
                style={[
                  styles.dealTypeBtn,
                  {
                    backgroundColor: dealType === "sale" ? "#6D28D9" : isDark ? "#1E293B" : "#F1F5F9",
                  },
                ]}
              >
                <MaterialCommunityIcons name="home-city" size={16} color={dealType === "sale" ? "#FFFFFF" : colors.textSecondary} />
                <Text style={[styles.dealTypeBtnText, { color: dealType === "sale" ? "#FFFFFF" : colors.textSecondary }]}>
                  OUTRIGHT SALE
                </Text>
              </TouchableOpacity>
            </View>

            {/* Price & Deposit */}
            <View style={styles.formRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {dealType === "sale" ? "FINAL SALE PRICE (₹)" : "MONTHLY RENT (₹)"}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="e.g. 25000"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="numeric"
                  value={finalPrice}
                  onChangeText={setFinalPrice}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>SECURITY DEPOSIT (₹)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="e.g. 50000"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="numeric"
                  value={deposit}
                  onChangeText={setDeposit}
                />
              </View>
            </View>

            {/* Tenant / Buyer Info */}
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>TENANT / BUYER PARTICULARS</Text>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>FULL NAME</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={tenantName}
                onChangeText={setTenantName}
              />
            </View>

            <View style={styles.formRow}>
              <View style={{ flex: 1.2 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>MOBILE NUMBER</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="10-digit number"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={tenantPhone}
                  onChangeText={setTenantPhone}
                />
              </View>

              <View style={{ flex: 0.8 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>AADHAAR LAST 4</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  placeholder="e.g. 4912"
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="numeric"
                  maxLength={4}
                  value={tenantAadhaarLast4}
                  onChangeText={setTenantAadhaarLast4}
                />
              </View>
            </View>

            {/* Agreement & Police Verification */}
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>COMPLIANCE & LEGAL AGREEMENT</Text>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>RENT AGREEMENT NUMBER</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                value={agreementNumber}
                onChangeText={setAgreementNumber}
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>POLICE VERIFICATION STATUS</Text>
              <View style={styles.statusChipsRow}>
                {["pending", "submitted", "verified"].map((st) => {
                  const isSel = policeVerificationStatus === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => setPoliceVerificationStatus(st)}
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: isSel
                            ? "#0D9488"
                            : isDark
                            ? "#1E293B"
                            : "#F1F5F9",
                        },
                      ]}
                    >
                      <Text style={[styles.statusChipText, { color: isSel ? "#FFFFFF" : colors.textSecondary }]}>
                        {st.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleConfirmDeal}
              disabled={submitting}
              style={[
                styles.confirmBtn,
                { backgroundColor: submitting ? "#94A3B8" : "#10B981" },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check-circle" size={18} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>Finalize Deal & Generate Records</Text>
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
  propSummary: {
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  propTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  propOwner: {
    fontSize: 12,
  },
  dealTypeRow: {
    flexDirection: "row",
    gap: 10,
  },
  dealTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  dealTypeBtnText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 6,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formField: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  statusChipsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statusChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});
