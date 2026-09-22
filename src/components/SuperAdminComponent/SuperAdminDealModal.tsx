import React, { useState, useEffect, useMemo } from "react";
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
  Image,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

interface TenantUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  profilePhoto?: string;
  role: string;
  createdAt?: string;
}

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
  const [finalPrice, setFinalPrice] = useState<string>("50000");
  const [deposit, setDeposit] = useState<string>("");

  // Tenant selection state
  const [tenants, setTenants] = useState<TenantUser[]>([]);
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantUser | null>(null);
  const [tenantSearch, setTenantSearch] = useState<string>("");
  const [isTenantPickerOpen, setIsTenantPickerOpen] = useState<boolean>(false);
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);

  // Form fields
  const [tenantName, setTenantName] = useState<string>("");
  const [tenantPhone, setTenantPhone] = useState<string>("");
  const [tenantEmail, setTenantEmail] = useState<string>("");
  const [tenantAadhaarLast4, setTenantAadhaarLast4] = useState<string>("");
  const [agreementNumber, setAgreementNumber] = useState<string>("");
  const [policeVerificationStatus, setPoliceVerificationStatus] = useState<string>("pending");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [removingTenant, setRemovingTenant] = useState<boolean>(false);

  // Check if lead currently has an assigned tenant or closed deal
  const hasAssignedTenant = Boolean(
    lead?.deal?.isClosed ||
    lead?.status === "rented" ||
    lead?.deal?.tenantName ||
    lead?.deal?.tenantId
  );

  // Fetch tenants on mount or when modal opens
  useEffect(() => {
    if (visible) {
      fetchTenants();
    }
  }, [visible]);

  useEffect(() => {
    if (lead) {
      setDealType(lead.deal?.dealType || (lead.listingType === "sale" ? "sale" : "rent"));
      setFinalPrice(
        lead.deal?.finalPrice
          ? String(lead.deal.finalPrice)
          : lead.expectedPrice
          ? String(lead.expectedPrice)
          : "50000"
      );
      setDeposit(
        lead.deal?.deposit
          ? String(lead.deal.deposit)
          : lead.securityDeposit
          ? String(lead.securityDeposit)
          : ""
      );
      setTenantName(lead.deal?.tenantName || "");
      setTenantPhone(lead.deal?.tenantPhone || "");
      setTenantEmail(lead.deal?.tenantEmail || "");
      setTenantAadhaarLast4(lead.deal?.tenantAadhaarLast4 || "");
      setAgreementNumber(
        lead.deal?.agreementNumber || "AGR-DPE-" + Math.floor(100000 + Math.random() * 900000)
      );
      setPoliceVerificationStatus(lead.deal?.policeVerificationStatus || "pending");
      setNotes(lead.deal?.notes || "");

      // If tenant details exist, try to match in registered tenants
      if (lead.deal?.tenantName) {
        const match = tenants.find(
          (t) =>
            (lead.deal?.tenantId && t._id === lead.deal.tenantId) ||
            (lead.deal?.tenantPhone && t.phone === lead.deal.tenantPhone)
        );
        if (match) {
          setSelectedTenant(match);
          setIsManualEntry(false);
        } else {
          setIsManualEntry(true);
        }
      } else {
        setSelectedTenant(null);
        setIsManualEntry(false);
      }
    }
  }, [lead, visible, tenants]);

  const fetchTenants = async () => {
    setLoadingTenants(true);
    try {
      // Fetch registered users with role=tenant
      const res = await apiClient.get("/auth/users", {
        params: { role: "tenant", limit: 100 },
      });
      const userList = res.data?.data?.users || res.data?.users || [];
      if (userList.length > 0) {
        setTenants(userList);
      } else {
        // Fallback: fetch all users
        const fallbackRes = await apiClient.get("/auth/users", { params: { limit: 100 } });
        const allUsers = fallbackRes.data?.data?.users || fallbackRes.data?.users || [];
        const filtered = allUsers.filter((u: any) => u.role === "tenant" || !["super_admin", "admin"].includes(u.role));
        setTenants(filtered);
      }
    } catch (err) {
      console.log("Error fetching tenants:", err);
      // Realistic default tenant list for offline/development fallback
      setTenants([
        {
          _id: "TNT-8842-USR",
          name: "Rohan Verma",
          phone: "9811234567",
          email: "rohan.verma@example.com",
          role: "tenant",
          profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        },
        {
          _id: "TNT-9912-USR",
          name: "Ananya Sharma",
          phone: "9876543210",
          email: "ananya.sharma@gmail.com",
          role: "tenant",
          profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        },
        {
          _id: "TNT-7714-USR",
          name: "Vikram Malhotra",
          phone: "9818822334",
          email: "vikram.m@outlook.com",
          role: "tenant",
          profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        },
      ]);
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleSelectTenant = (tenant: TenantUser) => {
    setSelectedTenant(tenant);
    setTenantName(tenant.name || "");
    setTenantPhone(tenant.phone || "");
    setTenantEmail(tenant.email || "");
    setIsTenantPickerOpen(false);
    setIsManualEntry(false);
  };

  const handleClearSelectedTenant = () => {
    setSelectedTenant(null);
    setTenantName("");
    setTenantPhone("");
    setTenantEmail("");
  };

  const filteredTenants = useMemo(() => {
    if (!tenantSearch.trim()) return tenants;
    const q = tenantSearch.toLowerCase();
    return tenants.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.phone?.includes(q) ||
        t.email?.toLowerCase().includes(q)
    );
  }, [tenants, tenantSearch]);

  const handleConfirmDeal = async () => {
    if (!tenantName.trim()) {
      Alert.alert("Required", "Please select a registered tenant or enter the Tenant / Buyer name.");
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
        tenantId: selectedTenant?._id || undefined,
        tenantName: tenantName.trim(),
        tenantPhone: tenantPhone.trim(),
        tenantEmail: tenantEmail.trim() || undefined,
        tenantAadhaarLast4: tenantAadhaarLast4.trim(),
        agreementNumber: agreementNumber.trim(),
        policeVerificationStatus,
        notes: notes.trim(),
      });

      Alert.alert(
        "Deal Finalized! 🎉",
        `Property "${lead.title || lead.locality || "Unit"}" has been successfully assigned to ${tenantName}. It will now show instantly on the Tenant's app and their rent ledger is active!`,
        [
          {
            text: "OK",
            onPress: () => {
              onSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert("Deal Confirmation Error", e.message || "Failed to confirm deal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveTenant = () => {
    const tenantDispName =
      lead?.deal?.tenantName || selectedTenant?.name || tenantName || "Current Tenant";

    Alert.alert(
      "Remove / Vacate Tenant?",
      `Are you sure you want to remove "${tenantDispName}" from "${lead?.title || lead?.locality || "this property"}"?\n\n• The unit will be vacated immediately\n• Property status will revert to "VERIFIED"\n• The tenant will no longer see this property in their app`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Vacate & Remove",
          style: "destructive",
          onPress: async () => {
            setRemovingTenant(true);
            try {
              await apiClient.delete("/leads/" + lead._id + "/deal");
              Alert.alert(
                "Tenant Removed & Unit Vacated 🎉",
                `The tenant has been successfully removed. Property "${lead?.title || lead?.locality || "Unit"}" is now vacant and restored to VERIFIED status.`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      onSuccess();
                      onClose();
                    },
                  },
                ]
              );
            } catch (err: any) {
              Alert.alert(
                "Failed to Remove Tenant",
                err.response?.data?.message || err.message || "An error occurred while vacating the unit."
              );
            } finally {
              setRemovingTenant(false);
            }
          },
        },
      ]
    );
  };

  if (!lead) return null;

  return (
    <>
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
                {lead.title || (lead.propertyType + " in " + (lead.locality || "Delhi NCR"))}
              </Text>
              <Text style={[styles.propOwner, { color: colors.textSecondary }]}>
                Owner: {lead.ownerName} ({lead.ownerPhone})
              </Text>
            </View>

            {/* Current Occupancy Status Banner */}
            {hasAssignedTenant && (
              <View style={[styles.occupiedBanner, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.12)" : "#FEF2F2", borderColor: isDark ? "#DC2626" : "#FCA5A5" }]}>
                <View style={styles.occupiedBannerLeft}>
                  <Ionicons name="person-circle" size={24} color="#EF4444" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.occupiedBannerTitle, { color: isDark ? "#F87171" : "#991B1B" }]}>
                      Current Tenant: {lead.deal?.tenantName || selectedTenant?.name || "Assigned"}
                    </Text>
                    <Text style={[styles.occupiedBannerSub, { color: isDark ? "#FCA5A5" : "#B91C1C" }]}>
                      Phone: {lead.deal?.tenantPhone || selectedTenant?.phone || "N/A"} • Deal Closed / Active
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleRemoveTenant}
                  disabled={removingTenant}
                  style={styles.vacateQuickBtn}
                  activeOpacity={0.7}
                >
                  {removingTenant ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather name="user-x" size={13} color="#FFFFFF" />
                      <Text style={styles.vacateQuickBtnText}>Vacate</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

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
                  placeholder="e.g. 50000"
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

            {/* Tenant / Buyer Info Section Header */}
            <View style={styles.tenantSectionHeader}>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                TENANT / BUYER PARTICULARS
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setIsManualEntry(!isManualEntry);
                  if (!isManualEntry) {
                    setSelectedTenant(null);
                  }
                }}
                style={styles.toggleModeBtn}
              >
                <Text style={styles.toggleModeText}>
                  {isManualEntry ? "← Choose Registered Tenant" : "Enter Manually"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* REGISTERED TENANT SELECTION MODE */}
            {!isManualEntry ? (
              <View style={styles.tenantSelectionContainer}>
                {selectedTenant ? (
                  // Selected Tenant Card
                  <View style={[styles.selectedTenantCard, { backgroundColor: isDark ? "#1E293B" : "#F0FDF4", borderColor: isDark ? "#059669" : "#86EFAC" }]}>
                    <View style={styles.selectedTenantHeader}>
                      <View style={styles.tenantAvatar}>
                        {selectedTenant.profilePhoto ? (
                          <Image source={{ uri: selectedTenant.profilePhoto }} style={styles.avatarImg} />
                        ) : (
                          <View style={[styles.avatarPlaceholder, { backgroundColor: "#0D9488" }]}>
                            <Text style={styles.avatarLetter}>
                              {selectedTenant.name?.charAt(0)?.toUpperCase() || "T"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text style={[styles.selectedTenantName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                            {selectedTenant.name}
                          </Text>
                          <View style={styles.verifiedTag}>
                            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                            <Text style={styles.verifiedTagText}>REGISTERED</Text>
                          </View>
                        </View>
                        <Text style={[styles.selectedTenantPhone, { color: colors.textSecondary }]}>
                          📞 {selectedTenant.phone} {selectedTenant.email ? `• ✉️ ${selectedTenant.email}` : ""}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={handleClearSelectedTenant}
                        style={styles.changeTenantBtn}
                      >
                        <Text style={styles.changeTenantText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // Select Tenant Trigger Button
                  <TouchableOpacity
                    onPress={() => setIsTenantPickerOpen(true)}
                    style={[styles.selectTenantTrigger, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#CBD5E1" }]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.selectTenantLeft}>
                      <View style={styles.triggerIconBox}>
                        <Ionicons name="people" size={18} color="#0D9488" />
                      </View>
                      <View>
                        <Text style={[styles.selectTenantLabel, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          Select Registered Tenant from List
                        </Text>
                        <Text style={[styles.selectTenantSub, { color: colors.textSecondary }]}>
                          {loadingTenants ? "Loading tenant directory..." : `${tenants.length} registered tenants available`}
                        </Text>
                      </View>
                    </View>
                    <Feather name="chevron-down" size={18} color={isDark ? "#94A3B8" : "#64748B"} />
                  </TouchableOpacity>
                )}

                {/* Additional Aadhaar Input */}
                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>AADHAAR LAST 4 DIGITS</Text>
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
              </View>
            ) : (
              // MANUAL TENANT ENTRY MODE
              <View style={styles.manualEntryContainer}>
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

                <View style={styles.formField}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL ADDRESS (OPTIONAL)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFFFFF" : "#0F172A", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                    placeholder="e.g. rahul.sharma@example.com"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    keyboardType="email-address"
                    value={tenantEmail}
                    onChangeText={setTenantEmail}
                  />
                </View>
              </View>
            )}

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

            {/* Actions: Vacate Tenant & Finalize/Update Deal */}
            <View style={styles.actionsContainer}>
              {hasAssignedTenant && (
                <TouchableOpacity
                  onPress={handleRemoveTenant}
                  disabled={removingTenant || submitting}
                  style={[
                    styles.removeTenantBtn,
                    {
                      backgroundColor: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2",
                      borderColor: isDark ? "#DC2626" : "#FCA5A5",
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  {removingTenant ? (
                    <ActivityIndicator color="#EF4444" />
                  ) : (
                    <>
                      <Feather name="user-x" size={16} color="#EF4444" />
                      <Text style={styles.removeTenantBtnText}>Remove Tenant & Vacate Unit</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleConfirmDeal}
                disabled={submitting || removingTenant}
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
                    <Text style={styles.confirmBtnText}>
                      {hasAssignedTenant ? "Update Deal & Assignment" : "Finalize Deal & Generate Records"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>

      {/* TENANT PICKER SEARCHABLE MODAL */}
      <Modal visible={isTenantPickerOpen} animationType="slide" transparent onRequestClose={() => setIsTenantPickerOpen(false)}>
        <View style={styles.pickerBackdrop}>
          <View style={[styles.pickerCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
            {/* Header */}
            <View style={[styles.pickerHeader, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <View>
                <Text style={[styles.pickerTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Select Registered Tenant
                </Text>
                <Text style={[styles.pickerSub, { color: colors.textSecondary }]}>
                  Choose tenant to immediately assign property to their app
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsTenantPickerOpen(false)} style={styles.pickerCloseBtn}>
                <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.pickerSearchBar, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <Feather name="search" size={16} color={isDark ? "#94A3B8" : "#64748B"} />
              <TextInput
                style={[styles.pickerSearchInput, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
                placeholder="Search tenant by name, phone, or email..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                value={tenantSearch}
                onChangeText={setTenantSearch}
              />
              {tenantSearch.length > 0 && (
                <TouchableOpacity onPress={() => setTenantSearch("")}>
                  <Feather name="x-circle" size={16} color={isDark ? "#94A3B8" : "#64748B"} />
                </TouchableOpacity>
              )}
            </View>

            {/* List of Tenants */}
            {loadingTenants ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#0D9488" />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading tenant directory...</Text>
              </View>
            ) : filteredTenants.length === 0 ? (
              <View style={styles.emptyTenantBox}>
                <Ionicons name="person-outline" size={40} color={isDark ? "#475569" : "#94A3B8"} />
                <Text style={[styles.emptyTenantTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>No Tenants Found</Text>
                <Text style={[styles.emptyTenantSub, { color: colors.textSecondary }]}>
                  No registered tenants match your search query.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsTenantPickerOpen(false);
                    setIsManualEntry(true);
                  }}
                  style={styles.manualEntryBtn}
                >
                  <Text style={styles.manualEntryBtnText}>Enter Tenant Manually Instead</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView contentContainerStyle={styles.tenantListScroll} showsVerticalScrollIndicator={false}>
                {filteredTenants.map((t) => (
                  <TouchableOpacity
                    key={t._id}
                    onPress={() => handleSelectTenant(t)}
                    style={[
                      styles.tenantItem,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.tenantAvatar}>
                      {t.profilePhoto ? (
                        <Image source={{ uri: t.profilePhoto }} style={styles.avatarImg} />
                      ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: "#0D9488" }]}>
                          <Text style={styles.avatarLetter}>{t.name?.charAt(0)?.toUpperCase() || "T"}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.tenantInfo}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={[styles.tenantItemName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          {t.name}
                        </Text>
                        <View style={styles.verifiedTag}>
                          <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                          <Text style={styles.verifiedTagText}>TENANT</Text>
                        </View>
                      </View>
                      <Text style={[styles.tenantItemPhone, { color: colors.textSecondary }]}>
                        📞 {t.phone}
                      </Text>
                      {t.email && (
                        <Text style={[styles.tenantItemEmail, { color: isDark ? "#94A3B8" : "#64748B" }]}>
                          ✉️ {t.email}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={isDark ? "#94A3B8" : "#CBD5E1"} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  occupiedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  occupiedBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  occupiedBannerTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  occupiedBannerSub: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  vacateQuickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  vacateQuickBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
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
  tenantSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  toggleModeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  toggleModeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
  tenantSelectionContainer: {
    gap: 10,
  },
  selectTenantTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  selectTenantLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  triggerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectTenantLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  selectTenantSub: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedTenantCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
  },
  selectedTenantHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  tenantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  selectedTenantName: {
    fontSize: 15,
    fontWeight: "800",
  },
  selectedTenantPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#15803D",
  },
  changeTenantBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(13, 148, 136, 0.12)",
  },
  changeTenantText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D9488",
  },
  manualEntryContainer: {
    gap: 10,
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
  actionsContainer: {
    gap: 10,
    marginTop: 10,
  },
  removeTenantBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  removeTenantBtnText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "800",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  // Picker Modal Styles
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  pickerCard: {
    maxHeight: "85%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 30,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  pickerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  pickerCloseBtn: {
    padding: 6,
  },
  pickerSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  loadingBox: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  emptyTenantBox: {
    padding: 40,
    alignItems: "center",
    gap: 8,
  },
  emptyTenantTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  emptyTenantSub: {
    fontSize: 13,
    textAlign: "center",
  },
  manualEntryBtn: {
    marginTop: 12,
    backgroundColor: "#0D9488",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  manualEntryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  tenantListScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  tenantItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  tenantInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  tenantItemName: {
    fontSize: 14,
    fontWeight: "700",
  },
  tenantItemPhone: {
    fontSize: 12,
  },
  tenantItemEmail: {
    fontSize: 11,
  },
});
