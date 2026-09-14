import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

const { width } = Dimensions.get("window");

interface Props {
  visible: boolean;
  lead: any;
  onClose: () => void;
  onAssignPress?: (lead: any) => void;
  onDealPress?: (lead: any) => void;
  onCommissionPress?: (lead: any) => void;
  onResolveDuplicate?: (lead: any) => void;
  onStatusChange?: () => void;
}

export const SuperAdminLeadDetailModal: React.FC<Props> = ({
  visible,
  lead: initialLead,
  onClose,
  onAssignPress,
  onDealPress,
  onCommissionPress,
  onResolveDuplicate,
  onStatusChange,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const [lead, setLead] = useState<any>(initialLead);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Sub-modal for Recording Tenant Rent Payment
  const [isTenantRentModalVisible, setIsTenantRentModalVisible] = useState(false);
  const [rentMonth, setRentMonth] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [rentUtr, setRentUtr] = useState("");
  const [rentMode, setRentMode] = useState("UPI");
  const [rentStatus, setRentStatus] = useState<"PAID" | "PENDING" | "OVERDUE">("PAID");
  const [savingRent, setSavingRent] = useState(false);

  // Sub-modal for Releasing Owner Rent Payout
  const [isOwnerPayoutModalVisible, setIsOwnerPayoutModalVisible] = useState(false);
  const [payoutMonth, setPayoutMonth] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutUtr, setPayoutUtr] = useState("");
  const [payoutMode, setPayoutMode] = useState("UPI");
  const [payoutRemarks, setPayoutRemarks] = useState("");
  const [savingPayout, setSavingPayout] = useState(false);

  // Sub-modal for Editing Owner Details
  const [isEditOwnerModalVisible, setIsEditOwnerModalVisible] = useState(false);
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editOwnerPhone, setEditOwnerPhone] = useState("");
  const [editAltPhone, setEditAltPhone] = useState("");
  const [editOwnerEmail, setEditOwnerEmail] = useState("");
  const [editOwnerAadhaar, setEditOwnerAadhaar] = useState("");
  const [editOwnerPan, setEditOwnerPan] = useState("");
  const [editHouseNo, setEditHouseNo] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");
  const [editAccountHolder, setEditAccountHolder] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [editAccountNumber, setEditAccountNumber] = useState("");
  const [editIfscCode, setEditIfscCode] = useState("");
  const [editUpiId, setEditUpiId] = useState("");
  const [editOwnerNotes, setEditOwnerNotes] = useState("");
  const [savingOwnerDetails, setSavingOwnerDetails] = useState(false);

  React.useEffect(() => {
    setLead(initialLead);
    if (initialLead) {
      const currentM = new Date().toLocaleString("default", { month: "short", year: "numeric" });
      setRentMonth(currentM);
      setPayoutMonth(currentM);
      const rentVal = String(initialLead.deal?.finalPrice || initialLead.expectedPrice || initialLead.rentAmount || "");
      setRentAmount(rentVal);
      setPayoutAmount(String(Math.round((Number(rentVal) || 0) * 0.95) || ""));

      // Populate Edit Owner State
      setEditOwnerName(initialLead.ownerName || "");
      setEditOwnerPhone(initialLead.ownerPhone || "");
      setEditAltPhone(initialLead.alternatePhone || "");
      setEditOwnerEmail(initialLead.ownerEmail || "");
      setEditOwnerAadhaar(initialLead.ownerAadhaarLast4 || "");
      setEditOwnerPan(initialLead.ownerPanCard || "");
      setEditHouseNo(initialLead.ownerAddress?.houseNo || "");
      setEditStreet(initialLead.ownerAddress?.street || "");
      setEditCity(initialLead.ownerAddress?.city || "");
      setEditState(initialLead.ownerAddress?.state || "");
      setEditPincode(initialLead.ownerAddress?.pincode || "");
      setEditAccountHolder(initialLead.ownerBankDetails?.accountHolderName || initialLead.ownerName || "");
      setEditBankName(initialLead.ownerBankDetails?.bankName || "");
      setEditAccountNumber(initialLead.ownerBankDetails?.accountNumber || "");
      setEditIfscCode(initialLead.ownerBankDetails?.ifscCode || "");
      setEditUpiId(initialLead.ownerBankDetails?.upiId || "");
      setEditOwnerNotes(initialLead.ownerNotes || "");
    }
  }, [initialLead]);

  if (!lead) return null;

  const photos = lead.photos && lead.photos.length > 0
    ? lead.photos.map((p: any) => (typeof p === "string" ? p : p.url))
    : lead.images && lead.images.length > 0
    ? lead.images
    : lead.coverPhoto
    ? [lead.coverPhoto]
    : [];

  const handleCall = (phone?: string) => {
    if (phone) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      Linking.openURL("tel:" + String(phone).replace(/\s+/g, ""));
    }
  };

  const handleWhatsApp = (phone?: string, name?: string) => {
    if (phone) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      const clean = String(phone).replace(/\D/g, "");
      const full = clean.length === 10 ? "91" + clean : clean;
      const greet = name ? encodeURIComponent("Hello " + name + ",") : "Hello,";
      Linking.openURL("whatsapp://send?phone=" + full + "&text=" + greet + "%20regarding%20property%20" + encodeURIComponent(lead.title || lead.leadId));
    }
  };

  const handleEmail = (email?: string) => {
    if (email) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      Linking.openURL("mailto:" + email + "?subject=" + encodeURIComponent("Regarding Property: " + (lead.title || lead.leadId)));
    }
  };

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;
    try {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Copied", label + " copied to clipboard.");
    } catch {}
  };

  // Handler: Save Edited Owner Details
  const handleSaveOwnerDetails = async () => {
    if (!editOwnerName.trim()) {
      Alert.alert("Required", "Owner Name cannot be empty.");
      return;
    }
    if (!editOwnerPhone.trim()) {
      Alert.alert("Required", "Owner Mobile Number cannot be empty.");
      return;
    }
    setSavingOwnerDetails(true);
    try {
      const payload = {
        ownerName: editOwnerName.trim(),
        ownerPhone: editOwnerPhone.replace(/\D/g, ""),
        alternatePhone: editAltPhone.trim(),
        ownerEmail: editOwnerEmail.trim().toLowerCase(),
        ownerAadhaarLast4: editOwnerAadhaar.trim().slice(-4),
        ownerPanCard: editOwnerPan.trim().toUpperCase(),
        ownerAddress: {
          houseNo: editHouseNo.trim(),
          street: editStreet.trim(),
          city: editCity.trim(),
          state: editState.trim(),
          pincode: editPincode.trim(),
          fullAddress: [editHouseNo, editStreet, editCity, editState, editPincode].filter(Boolean).join(", "),
        },
        ownerBankDetails: {
          accountHolderName: editAccountHolder.trim(),
          bankName: editBankName.trim(),
          accountNumber: editAccountNumber.trim(),
          ifscCode: editIfscCode.trim().toUpperCase(),
          accountType: "Savings",
          upiId: editUpiId.trim(),
        },
        ownerNotes: editOwnerNotes.trim(),
      };

      const res = await apiClient.patch("/leads/" + lead._id, payload);
      if (res.data?.data) {
        setLead(res.data.data);
      }
      setIsEditOwnerModalVisible(false);
      Alert.alert("Success", "Owner details updated successfully.");
      onStatusChange?.();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to update owner details.");
    } finally {
      setSavingOwnerDetails(false);
    }
  };

  // Handler: Record Tenant Rent Payment
  const handleRecordTenantRent = async () => {
    const amt = Number(rentAmount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid rent amount.");
      return;
    }
    setSavingRent(true);
    try {
      const res = await apiClient.post("/leads/" + lead._id + "/rent-ledger", {
        month: rentMonth,
        amount: amt,
        status: rentStatus,
        paymentMode: rentMode,
        utrNumber: rentUtr,
      });
      if (res.data?.data) {
        setLead(res.data.data);
      }
      setIsTenantRentModalVisible(false);
      Alert.alert("Success", "Tenant rent collection record saved successfully.");
      onStatusChange?.();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to record rent collection.");
    } finally {
      setSavingRent(false);
    }
  };

  // Handler: Release Owner Rent Payout
  const handleReleaseOwnerPayout = async () => {
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payout amount.");
      return;
    }
    setSavingPayout(true);
    try {
      const res = await apiClient.post("/leads/" + lead._id + "/owner-payout", {
        month: payoutMonth,
        amount: amt,
        status: "released",
        paymentMode: payoutMode,
        utrNumber: payoutUtr,
        remarks: payoutRemarks,
      });
      if (res.data?.data) {
        setLead(res.data.data);
      }
      setIsOwnerPayoutModalVisible(false);
      Alert.alert("Success", "Owner rent payout released and logged successfully.");
      onStatusChange?.();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to process owner payout.");
    } finally {
      setSavingPayout(false);
    }
  };

  // Calculations for Tenant & Owner Rent Status
  const isRented = lead.status === "rented" || lead.deal?.isClosed || lead.deal?.status === "closed_won";
  const tenantName = lead.deal?.tenantName || (isRented ? "Direct Tenant" : null);
  const tenantPhone = lead.deal?.tenantPhone;
  const tenantAadhaar = lead.deal?.tenantAadhaarLast4;

  const rentLedgerList = Array.isArray(lead.rentLedger) ? lead.rentLedger : [];
  const ownerPayoutList = Array.isArray(lead.ownerPayouts) ? lead.ownerPayouts : [];

  let totalRentCollected = 0;
  let totalRentPending = 0;
  let hasCurrentMonthPaid = false;

  rentLedgerList.forEach((r: any) => {
    if (r.status === "PAID") {
      totalRentCollected += Number(r.amount) || 0;
      hasCurrentMonthPaid = true;
    } else if (r.status === "PENDING" || r.status === "OVERDUE") {
      totalRentPending += Number(r.amount) || 0;
    }
  });

  let totalOwnerDisbursed = 0;
  let totalOwnerPending = 0;
  let hasOwnerPayoutReleased = false;

  ownerPayoutList.forEach((p: any) => {
    if (p.status === "released" || p.status === "paid") {
      totalOwnerDisbursed += Number(p.amount) || 0;
      hasOwnerPayoutReleased = true;
    } else if (p.status === "pending" || p.status === "approved") {
      totalOwnerPending += Number(p.amount) || 0;
    }
  });

  const getStatusColor = (st: string) => {
    switch (st?.toLowerCase()) {
      case "verified": return "#10B981";
      case "rented":
      case "sold": return "#0D9488";
      case "under_verification":
      case "assigned": return "#F59E0B";
      case "rejected": return "#EF4444";
      default: return "#3B82F6";
    }
  };

  const statusColor = getStatusColor(lead.status);
  const ownerInitials = (lead.ownerName || "O").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalSheet, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.leadIdBadge}>
                <Text style={styles.leadIdText}>{lead.leadId || "LEAD-DIR"}</Text>
                <View style={[styles.statusPill, { backgroundColor: statusColor + "20" }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {(lead.status || "NEW").toUpperCase().replace("_", " ")}
                  </Text>
                </View>
              </View>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]} numberOfLines={1}>
                {lead.title || (lead.propertyType + " in " + lead.locality)}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Duplicate Flag Alert */}
            {lead.duplicateFlag?.isDuplicate && (
              <View style={[styles.duplicateAlert, { backgroundColor: isDark ? "#451A03" : "#FEF3C7", borderColor: "#F59E0B" }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="warning" size={20} color="#D97706" />
                  <Text style={[styles.duplicateTitle, { color: isDark ? "#FCD34D" : "#92400E" }]}>
                    Duplicate Listing Detected
                  </Text>
                </View>
                <Text style={[styles.duplicateDesc, { color: isDark ? "#FDE68A" : "#B45309" }]}>
                  {lead.duplicateFlag.duplicateReason || "Matches an existing property by phone/address."}
                </Text>
                {onResolveDuplicate && lead.duplicateFlag.status !== "resolved" && (
                  <TouchableOpacity onPress={() => onResolveDuplicate(lead)} style={styles.resolveBtn}>
                    <Text style={styles.resolveBtnText}>Resolve Duplicate</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Photos Carousel */}
            {photos.length > 0 ? (
              <View style={styles.photoSection}>
                <Image source={{ uri: photos[activePhotoIdx] }} style={styles.mainImage} resizeMode="cover" />
                {photos.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
                    {photos.map((p: string, idx: number) => (
                      <TouchableOpacity key={idx} onPress={() => setActivePhotoIdx(idx)}>
                        <Image
                          source={{ uri: p }}
                          style={[styles.thumb, idx === activePhotoIdx && { borderColor: "#0D9488", borderWidth: 2 }]}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ) : null}

            {/* Financial Overview / Rent Reconciliation Banner */}
            {isRented && (
              <View style={[styles.financeCard, { backgroundColor: isDark ? "#1E293B" : "#F0FDFA", borderColor: "#0D9488" }]}>
                <View style={styles.financeHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name="receipt-outline" size={18} color="#0D9488" />
                    <Text style={[styles.financeTitle, { color: isDark ? "#5EEAD4" : "#0F766E" }]}>
                      Rent Reconciliation Balance
                    </Text>
                  </View>
                  <View style={[styles.rentLiveBadge, { backgroundColor: hasCurrentMonthPaid ? "#DCFCE7" : "#FEF3C7" }]}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: hasCurrentMonthPaid ? "#166534" : "#92400E" }}>
                      {hasCurrentMonthPaid ? "RENT CURRENT" : "RENT PENDING"}
                    </Text>
                  </View>
                </View>

                <View style={styles.financeMetricsRow}>
                  <View style={styles.financeMetricBox}>
                    <Text style={styles.financeMetricLabel}>Tenant Paid</Text>
                    <Text style={[styles.financeMetricVal, { color: "#10B981" }]}>
                      ₹{totalRentCollected.toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.financeMetricBox}>
                    <Text style={styles.financeMetricLabel}>Owner Disbursed</Text>
                    <Text style={[styles.financeMetricVal, { color: "#0D9488" }]}>
                      ₹{totalOwnerDisbursed.toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.financeMetricBox}>
                    <Text style={styles.financeMetricLabel}>Platform Margin</Text>
                    <Text style={[styles.financeMetricVal, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                      ₹{(totalRentCollected - totalOwnerDisbursed).toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ==================================================================== */}
            {/* 👑 FULL PROPERTY OWNER PROFILE & PAYOUT MANAGEMENT (SUPER ADMIN)     */}
            {/* ==================================================================== */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              {/* Owner Header with Avatar, Name & Edit Button */}
              <View style={styles.ownerHeaderRow}>
                <View style={styles.ownerAvatar}>
                  <Text style={styles.ownerAvatarText}>{ownerInitials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[styles.ownerNameTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                      {lead.ownerName || "Property Owner"}
                    </Text>
                    <View style={styles.ownerVerifiedBadge}>
                      <MaterialCommunityIcons name="shield-check" size={14} color="#0D9488" />
                      <Text style={styles.ownerVerifiedText}>
                        {lead.inspectionDetails?.ownershipDocsVerified ? "Title Verified" : "Owner"}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.ownerSubSubtitle, { color: colors.textSecondary }]}>
                    Full unmasked owner identity, bank accounts & payout controls
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsEditOwnerModalVisible(true)}
                  style={[styles.editOwnerIconBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}
                >
                  <Feather name="edit-2" size={14} color="#0D9488" />
                </TouchableOpacity>
              </View>

              {/* 1-Touch Quick Contact Actions */}
              <View style={styles.ownerContactBar}>
                <TouchableOpacity
                  onPress={() => handleCall(lead.ownerPhone)}
                  style={[styles.contactBarBtn, { backgroundColor: "rgba(13, 148, 136, 0.12)" }]}
                >
                  <Feather name="phone-call" size={14} color="#0D9488" />
                  <Text style={[styles.contactBarBtnText, { color: "#0D9488" }]}>Call Owner</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleWhatsApp(lead.ownerPhone, lead.ownerName)}
                  style={[styles.contactBarBtn, { backgroundColor: "rgba(16, 185, 129, 0.12)" }]}
                >
                  <FontAwesome5 name="whatsapp" size={14} color="#10B981" />
                  <Text style={[styles.contactBarBtnText, { color: "#10B981" }]}>WhatsApp</Text>
                </TouchableOpacity>

                {lead.ownerEmail ? (
                  <TouchableOpacity
                    onPress={() => handleEmail(lead.ownerEmail)}
                    style={[styles.contactBarBtn, { backgroundColor: "rgba(59, 130, 246, 0.12)" }]}
                  >
                    <Feather name="mail" size={14} color="#3B82F6" />
                    <Text style={[styles.contactBarBtnText, { color: "#3B82F6" }]}>Email</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  onPress={() => handleCopy(lead.ownerPhone || "", "Owner Phone")}
                  style={[styles.contactBarBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}
                >
                  <Feather name="copy" size={14} color={isDark ? "#94A3B8" : "#64748B"} />
                  <Text style={[styles.contactBarBtnText, { color: isDark ? "#94A3B8" : "#64748B" }]}>Copy</Text>
                </TouchableOpacity>
              </View>

              {/* 1. Contact & Communication Info */}
              <View style={styles.detailBlock}>
                <Text style={[styles.blockTitle, { color: "#0D9488" }]}>CONTACT & ADDRESS</Text>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Primary Mobile</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.detailValue, { color: "#0D9488", fontWeight: "700" }]}>
                      {lead.ownerPhone ? "+91 " + lead.ownerPhone : "Not Registered"}
                    </Text>
                    {lead.ownerPhone && (
                      <TouchableOpacity onPress={() => handleCopy(lead.ownerPhone, "Mobile")}>
                        <Feather name="copy" size={13} color="#0D9488" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {lead.alternatePhone ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Alternate Mobile</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A", fontWeight: "600" }]}>
                        +91 {lead.alternatePhone}
                      </Text>
                      <TouchableOpacity onPress={() => handleCall(lead.alternatePhone)}>
                        <Feather name="phone" size={13} color="#0D9488" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleWhatsApp(lead.alternatePhone, lead.ownerName)}>
                        <FontAwesome5 name="whatsapp" size={13} color="#10B981" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Email Address</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {lead.ownerEmail || "Not Provided"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Residential Address</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A", flex: 1, textAlign: "right" }]}>
                    {lead.ownerAddress?.fullAddress ||
                      [lead.ownerAddress?.houseNo, lead.ownerAddress?.street, lead.ownerAddress?.city, lead.ownerAddress?.pincode].filter(Boolean).join(", ") ||
                      "Same as property address"}
                  </Text>
                </View>
              </View>

              {/* 2. Government Identity & Legal Title Verification */}
              <View style={styles.detailBlock}>
                <Text style={[styles.blockTitle, { color: "#0D9488" }]}>GOVERNMENT IDENTITY & LEGAL TITLE</Text>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Owner Aadhaar (UIDAI)</Text>
                  <View style={styles.aadhaarPill}>
                    <MaterialCommunityIcons name="shield-account" size={13} color="#0D9488" />
                    <Text style={styles.aadhaarPillText}>
                      {lead.ownerAadhaarLast4 ? "XXXX-XXXX-" + lead.ownerAadhaarLast4 : "Not Submitted"}
                    </Text>
                  </View>
                </View>

                {lead.ownerPanCard ? (
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>PAN Card Number</Text>
                    <View style={styles.panPill}>
                      <Text style={styles.panPillText}>{lead.ownerPanCard}</Text>
                    </View>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Title / Registry Deed</Text>
                  <View style={[styles.verificationPill, { backgroundColor: lead.inspectionDetails?.ownershipDocsVerified ? "#DCFCE7" : "#FEF3C7" }]}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: lead.inspectionDetails?.ownershipDocsVerified ? "#166534" : "#92400E" }}>
                      {lead.inspectionDetails?.ownershipDocsVerified ? "✅ Verified" : "⏳ Under Verification"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Electricity Bill Check</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {lead.inspectionDetails?.electricityBillChecked ? "✅ Checked & Matched" : "⏳ Pending"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Property Keys Handover</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {lead.inspectionDetails?.keysAvailable ? "🔑 Keys with Field Team" : "🏠 With Owner"}
                  </Text>
                </View>
              </View>

              {/* 3. Bank Account & Payout Destination */}
              <View style={styles.detailBlock}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={[styles.blockTitle, { color: "#0D9488", marginBottom: 0 }]}>BANK & PAYOUT DESTINATION</Text>
                  {isRented && (
                    <TouchableOpacity
                      onPress={() => setIsOwnerPayoutModalVisible(true)}
                      style={[styles.addRecordBtn, { backgroundColor: "#0D9488" }]}
                    >
                      <Feather name="send" size={12} color="#FFFFFF" />
                      <Text style={styles.addRecordBtnText}>Release Payout</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Beneficiary</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A", fontWeight: "700" }]}>
                    {lead.ownerBankDetails?.accountHolderName || lead.ownerName || "—"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Bank Name</Text>
                  <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {lead.ownerBankDetails?.bankName || "HDFC Bank / Primary"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Account Number</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A", fontFamily: "monospace", fontWeight: "700" }]}>
                      {lead.ownerBankDetails?.accountNumber || (lead.ownerPhone ? "A/C-" + lead.ownerPhone : "50100••••••••")}
                    </Text>
                    {lead.ownerBankDetails?.accountNumber && (
                      <TouchableOpacity onPress={() => handleCopy(lead.ownerBankDetails.accountNumber, "Account Number")}>
                        <Feather name="copy" size={13} color="#0D9488" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>IFSC Code</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A", fontWeight: "700" }]}>
                      {lead.ownerBankDetails?.ifscCode || "HDFC0001234"}
                    </Text>
                    {lead.ownerBankDetails?.ifscCode && (
                      <TouchableOpacity onPress={() => handleCopy(lead.ownerBankDetails.ifscCode, "IFSC Code")}>
                        <Feather name="copy" size={13} color="#0D9488" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>UPI ID / VPA</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={[styles.detailValue, { color: "#0D9488", fontWeight: "700" }]}>
                      {lead.ownerBankDetails?.upiId || (lead.ownerPhone ? lead.ownerPhone + "@upi" : "Not Set")}
                    </Text>
                    <TouchableOpacity onPress={() => handleCopy(lead.ownerBankDetails?.upiId || (lead.ownerPhone + "@upi"), "UPI ID")}>
                      <Feather name="copy" size={13} color="#0D9488" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 4. Owner Special Notes */}
              {lead.ownerNotes ? (
                <View style={[styles.ownerNotesBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                  <Text style={[styles.ownerNotesTitle, { color: "#0D9488" }]}>ADMIN NOTES / OWNER PREFERENCES</Text>
                  <Text style={[styles.ownerNotesText, { color: isDark ? "#E2E8F0" : "#334155" }]}>
                    {lead.ownerNotes}
                  </Text>
                </View>
              ) : null}

              {/* 5. Owner Rent Payout History Ledger */}
              <View style={styles.historyWrap}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={[styles.historyHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    Owner Rent Disbursements ({ownerPayoutList.length})
                  </Text>
                  {isRented && (
                    <TouchableOpacity onPress={() => setIsOwnerPayoutModalVisible(true)}>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: "#0D9488" }}>+ Log Payout</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {ownerPayoutList.length === 0 ? (
                  <View style={[styles.emptyEntryBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                    <Text style={[styles.emptyEntryText, { color: colors.textSecondary }]}>
                      No owner payouts recorded yet. Tap "Release Payout" to log disbursement.
                    </Text>
                  </View>
                ) : (
                  ownerPayoutList.map((payout: any, pIdx: number) => (
                    <View
                      key={pIdx}
                      style={[
                        styles.ledgerItemRow,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: payout.status === "released" || payout.status === "paid" ? "#0D9488" : "#F59E0B",
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.ledgerMonth, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          {payout.month || "Month"}
                        </Text>
                        <Text style={[styles.ledgerDetails, { color: colors.textSecondary }]}>
                          {payout.paymentMode || "UPI"} {payout.utrNumber ? "• UTR: " + payout.utrNumber : ""}
                        </Text>
                        {payout.remarks ? (
                          <Text style={[styles.ledgerRemarks, { color: colors.textSecondary }]} numberOfLines={1}>
                            {payout.remarks}
                          </Text>
                        ) : null}
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={[styles.ledgerAmount, { color: payout.status === "released" || payout.status === "paid" ? "#0D9488" : "#F59E0B" }]}>
                          ₹{Number(payout.amount || 0).toLocaleString("en-IN")}
                        </Text>
                        <View style={[styles.ledgerBadge, { backgroundColor: payout.status === "released" || payout.status === "paid" ? "#CCFBF1" : "#FEF3C7" }]}>
                          <Text style={{ fontSize: 9.5, fontWeight: "800", color: payout.status === "released" || payout.status === "paid" ? "#0F766E" : "#92400E" }}>
                            {(payout.status || "PENDING").toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* ==================================================================== */}
            {/* 👤 ACTIVE TENANT & TENANT RENT COLLECTION LEDGER                     */}
            {/* ==================================================================== */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                  <Feather name="users" size={16} color="#10B981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    Active Tenant & Collection
                  </Text>
                  <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                    Tenant identity, lease agreement & monthly rent receipts
                  </Text>
                </View>
                {isRented && (
                  <TouchableOpacity
                    onPress={() => setIsTenantRentModalVisible(true)}
                    style={[styles.addRecordBtn, { backgroundColor: "#10B981" }]}
                  >
                    <Feather name="plus-circle" size={13} color="#FFFFFF" />
                    <Text style={styles.addRecordBtnText}>Record Rent</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isRented ? (
                <>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Current Tenant</Text>
                    <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A", fontWeight: "700" }]}>
                      {tenantName || "Direct Tenant"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tenant Phone</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={[styles.detailValue, { color: "#10B981", fontWeight: "700" }]}>
                        {tenantPhone ? "+91 " + tenantPhone : "Not Registered"}
                      </Text>
                      {tenantPhone ? (
                        <View style={{ flexDirection: "row", gap: 6 }}>
                          <TouchableOpacity onPress={() => handleCall(tenantPhone)} style={styles.commIconBtn}>
                            <Feather name="phone" size={13} color="#0D9488" />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleWhatsApp(tenantPhone, tenantName)} style={styles.commIconBtn}>
                            <FontAwesome5 name="whatsapp" size={13} color="#10B981" />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {tenantAadhaar ? (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tenant Aadhaar</Text>
                      <View style={styles.aadhaarPill}>
                        <Text style={styles.aadhaarPillText}>XXXX-XXXX-{tenantAadhaar}</Text>
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Monthly Rent / Deposit</Text>
                    <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A", fontWeight: "700" }]}>
                      ₹{(lead.deal?.finalPrice || lead.expectedPrice || 0).toLocaleString("en-IN")}/mo • Dep: ₹{(lead.deal?.deposit || lead.securityDeposit || 0).toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Agreement / Police Ver.</Text>
                    <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                      {lead.deal?.agreementNumber || "AGR-Active"} • {lead.deal?.policeVerificationStatus === "verified" ? "✅ Verified" : "⏳ Pending"}
                    </Text>
                  </View>

                  {/* Tenant Rent Collection History Entries */}
                  <View style={styles.historyWrap}>
                    <Text style={[styles.historyHeading, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                      Tenant Rent Collection Ledger ({rentLedgerList.length})
                    </Text>

                    {rentLedgerList.length === 0 ? (
                      <View style={[styles.emptyEntryBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                        <Text style={[styles.emptyEntryText, { color: colors.textSecondary }]}>
                          No rent receipts logged yet. Tap "Record Rent" to add first month collection.
                        </Text>
                      </View>
                    ) : (
                      rentLedgerList.map((entry: any, eIdx: number) => (
                        <View
                          key={eIdx}
                          style={[
                            styles.ledgerItemRow,
                            {
                              backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                              borderColor: entry.status === "PAID" ? "#10B981" : "#EF4444",
                            },
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.ledgerMonth, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                              {entry.month || "Month"}
                            </Text>
                            <Text style={[styles.ledgerDetails, { color: colors.textSecondary }]}>
                              {entry.paymentMode || "UPI"} {entry.utrNumber ? "• UTR: " + entry.utrNumber : ""}
                            </Text>
                          </View>

                          <View style={{ alignItems: "flex-end" }}>
                            <Text style={[styles.ledgerAmount, { color: entry.status === "PAID" ? "#10B981" : "#EF4444" }]}>
                              ₹{Number(entry.amount || 0).toLocaleString("en-IN")}
                            </Text>
                            <View style={[styles.ledgerBadge, { backgroundColor: entry.status === "PAID" ? "#DCFCE7" : "#FEE2E2" }]}>
                              <Text style={{ fontSize: 9.5, fontWeight: "800", color: entry.status === "PAID" ? "#166534" : "#991B1B" }}>
                                {entry.status}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </>
              ) : (
                <View style={[styles.vacantBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                  <Ionicons name="home-outline" size={24} color="#64748B" />
                  <Text style={[styles.vacantTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    Unit Currently Vacant
                  </Text>
                  <Text style={[styles.vacantSub, { color: colors.textSecondary }]}>
                    No tenant is currently occupying this property.
                  </Text>
                  {onDealPress && (
                    <TouchableOpacity onPress={() => onDealPress(lead)} style={styles.assignTenantBtn}>
                      <Feather name="user-plus" size={14} color="#FFFFFF" />
                      <Text style={styles.assignTenantBtnText}>Confirm Deal & Assign Tenant</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* PROPERTY SPECIFICATIONS */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
                  <Ionicons name="home-outline" size={16} color="#3B82F6" />
                </View>
                <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Property Specifications
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Property Type</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>{lead.propertyType || "—"}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Listing Type</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A", fontWeight: "700" }]}>
                  {(lead.listingType || "RENT").toUpperCase()}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Expected Rent / Price</Text>
                <Text style={[styles.detailValue, { color: "#0D9488", fontWeight: "700" }]}>
                  ₹{(lead.expectedPrice || 0).toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Security Deposit</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  ₹{(lead.securityDeposit || 0).toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Locality & City</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {lead.locality}, {lead.address?.city || "Delhi NCR"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Furnishing</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {(lead.furnishing || "unfurnished").replace("_", " ")}
                </Text>
              </View>
            </View>

            {/* COMMISSION MANAGEMENT */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
                  <Ionicons name="cash-outline" size={16} color="#10B981" />
                </View>
                <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Agent Commission
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Approved Amount</Text>
                <Text style={[styles.detailValue, { color: "#10B981", fontWeight: "700" }]}>
                  ₹{(lead.commission?.approvedAmount || lead.commission?.estimatedAmount || 0).toLocaleString("en-IN")}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Commission Status</Text>
                <View style={[styles.badge, { backgroundColor: lead.commission?.status === "paid" ? "#DCFCE7" : "#FEF3C7" }]}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: lead.commission?.status === "paid" ? "#166534" : "#92400E" }}>
                    {(lead.commission?.status || "pending").toUpperCase()}
                  </Text>
                </View>
              </View>

              {onCommissionPress && (
                <TouchableOpacity onPress={() => onCommissionPress(lead)} style={styles.actionOutlineBtn}>
                  <Feather name="dollar-sign" size={14} color="#0D9488" />
                  <Text style={styles.actionOutlineBtnText}>Manage Commission</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* FIELD STAFF & ASSIGNMENT */}
            <View style={[styles.sectionCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(245, 158, 11, 0.15)" }]}>
                  <Ionicons name="person-outline" size={16} color="#F59E0B" />
                </View>
                <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Field Operations
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Source Agent</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {lead.agent?.name || lead.agentName || "Direct / Self"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Assigned Staff</Text>
                <Text style={[styles.detailValue, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {lead.assignedTo?.name || lead.assignedStaffName || "Unassigned"}
                </Text>
              </View>

              {onAssignPress && (
                <TouchableOpacity onPress={() => onAssignPress(lead)} style={styles.actionOutlineBtn}>
                  <Feather name="user-check" size={14} color="#0D9488" />
                  <Text style={styles.actionOutlineBtnText}>
                    {lead.assignedTo ? "Reassign Field Staff" : "Assign Field Staff"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          {/* Bottom Close Button */}
          <View style={[styles.bottomBar, { borderTopColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
            <TouchableOpacity onPress={onClose} style={[styles.closeBottomBtn, { backgroundColor: "#0D9488" }]}>
              <Text style={styles.closeBottomBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ==================================================================== */}
      {/* ✏️ MODAL: EDIT OWNER DETAILS (SUPER ADMIN ONLY)                      */}
      {/* ==================================================================== */}
      <Modal visible={isEditOwnerModalVisible} animationType="fade" transparent onRequestClose={() => setIsEditOwnerModalVisible(false)}>
        <View style={styles.subModalBackdrop}>
          <View style={[styles.editOwnerSheet, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
            <View style={[styles.subModalHeader, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <View>
                <Text style={[styles.subModalTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Edit Owner Information
                </Text>
                <Text style={[styles.subModalSub, { color: colors.textSecondary }]}>
                  Update contact, bank details and KYC records for this property
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditOwnerModalVisible(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
              {/* Personal Contacts */}
              <Text style={[styles.formSectionHeader, { color: "#0D9488" }]}>PERSONAL & CONTACTS</Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Owner Legal Name *</Text>
              <TextInput
                value={editOwnerName}
                onChangeText={setEditOwnerName}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Primary Mobile *</Text>
                  <TextInput
                    value={editOwnerPhone}
                    onChangeText={setEditOwnerPhone}
                    placeholder="10-digit number"
                    keyboardType="phone-pad"
                    placeholderTextColor="#94A3B8"
                    style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Alternate Mobile</Text>
                  <TextInput
                    value={editAltPhone}
                    onChangeText={setEditAltPhone}
                    placeholder="Optional phone"
                    keyboardType="phone-pad"
                    placeholderTextColor="#94A3B8"
                    style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
              <TextInput
                value={editOwnerEmail}
                onChangeText={setEditOwnerEmail}
                placeholder="owner@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              {/* KYC & Identity */}
              <Text style={[styles.formSectionHeader, { color: "#0D9488", marginTop: 16 }]}>GOVERNMENT IDENTITY</Text>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Aadhaar Last 4 Digits</Text>
                  <TextInput
                    value={editOwnerAadhaar}
                    onChangeText={setEditOwnerAadhaar}
                    maxLength={4}
                    placeholder="e.g. 8921"
                    keyboardType="number-pad"
                    placeholderTextColor="#94A3B8"
                    style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>PAN Card Number</Text>
                  <TextInput
                    value={editOwnerPan}
                    onChangeText={setEditOwnerPan}
                    maxLength={10}
                    placeholder="ABCDE1234F"
                    autoCapitalize="characters"
                    placeholderTextColor="#94A3B8"
                    style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  />
                </View>
              </View>

              {/* Bank & Payout Information */}
              <Text style={[styles.formSectionHeader, { color: "#0D9488", marginTop: 16 }]}>BANK ACCOUNT & PAYOUTS</Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Beneficiary Name</Text>
              <TextInput
                value={editAccountHolder}
                onChangeText={setEditAccountHolder}
                placeholder="Account Holder Name"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bank Name</Text>
                  <TextInput
                    value={editBankName}
                    onChangeText={setEditBankName}
                    placeholder="e.g. HDFC Bank"
                    placeholderTextColor="#94A3B8"
                    style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>IFSC Code</Text>
                  <TextInput
                    value={editIfscCode}
                    onChangeText={setEditIfscCode}
                    placeholder="HDFC0001234"
                    autoCapitalize="characters"
                    placeholderTextColor="#94A3B8"
                    style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bank Account Number</Text>
              <TextInput
                value={editAccountNumber}
                onChangeText={setEditAccountNumber}
                placeholder="Account Number"
                keyboardType="number-pad"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>UPI ID (VPA)</Text>
              <TextInput
                value={editUpiId}
                onChangeText={setEditUpiId}
                placeholder="e.g. name@okhdfcbank"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              {/* Residential Address */}
              <Text style={[styles.formSectionHeader, { color: "#0D9488", marginTop: 16 }]}>RESIDENTIAL ADDRESS</Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>House / Flat No.</Text>
                  <TextInput
                    value={editHouseNo}
                    onChangeText={setEditHouseNo}
                    placeholder="A-402, Tower 2"
                    placeholderTextColor="#94A3B8"
                    style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Pincode</Text>
                  <TextInput
                    value={editPincode}
                    onChangeText={setEditPincode}
                    placeholder="110001"
                    keyboardType="number-pad"
                    placeholderTextColor="#94A3B8"
                    style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Street / Landmark</Text>
              <TextInput
                value={editStreet}
                onChangeText={setEditStreet}
                placeholder="Sector 62, Near Metro"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              {/* Admin Notes */}
              <Text style={[styles.formSectionHeader, { color: "#0D9488", marginTop: 16 }]}>ADMIN REMARKS & PREFERENCES</Text>
              <TextInput
                value={editOwnerNotes}
                onChangeText={setEditOwnerNotes}
                placeholder="Internal notes on payout timing, contact preference, special terms..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                style={[styles.inputField, { height: 75, textAlignVertical: "top", backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <TouchableOpacity
                onPress={handleSaveOwnerDetails}
                disabled={savingOwnerDetails}
                style={[styles.modalSubmitBtn, { backgroundColor: "#0D9488", marginTop: 20 }]}
              >
                {savingOwnerDetails ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.modalSubmitBtnText}>Save Owner Details</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================================================================== */}
      {/* 💳 SUB-MODAL: RECORD TENANT RENT PAYMENT                             */}
      {/* ==================================================================== */}
      <Modal visible={isTenantRentModalVisible} animationType="fade" transparent onRequestClose={() => setIsTenantRentModalVisible(false)}>
        <View style={styles.subModalBackdrop}>
          <View style={[styles.subModalSheet, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
            <View style={[styles.subModalHeader, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <View>
                <Text style={[styles.subModalTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Record Tenant Rent Payment
                </Text>
                <Text style={[styles.subModalSub, { color: colors.textSecondary }]}>
                  Log monthly collection receipt from tenant
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsTenantRentModalVisible(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Billing Month</Text>
              <TextInput
                value={rentMonth}
                onChangeText={setRentMonth}
                placeholder="e.g. Oct 2026"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Collected Rent Amount (₹)</Text>
              <TextInput
                value={rentAmount}
                onChangeText={setRentAmount}
                placeholder="Amount in INR"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Payment Status</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                {(["PAID", "PENDING", "OVERDUE"] as const).map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setRentStatus(st)}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor: rentStatus === st ? "#10B981" : isDark ? "#1E293B" : "#F1F5F9",
                        borderColor: rentStatus === st ? "#10B981" : isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: rentStatus === st ? "#FFF" : colors.textSecondary }}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Payment Mode</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {["UPI", "Bank Transfer", "NEFT", "Cash", "Cheque"].map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setRentMode(m)}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor: rentMode === m ? "#0D9488" : isDark ? "#1E293B" : "#F1F5F9",
                        borderColor: rentMode === m ? "#0D9488" : isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: rentMode === m ? "#FFF" : colors.textSecondary }}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>UTR / Transaction Reference</Text>
              <TextInput
                value={rentUtr}
                onChangeText={setRentUtr}
                placeholder="e.g. UTR1234567890"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <TouchableOpacity
                onPress={handleRecordTenantRent}
                disabled={savingRent}
                style={[styles.modalSubmitBtn, { backgroundColor: "#10B981", marginTop: 12 }]}
              >
                {savingRent ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check" size={16} color="#FFFFFF" />
                    <Text style={styles.modalSubmitBtnText}>Save Rent Collection</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================================================================== */}
      {/* 💸 SUB-MODAL: RELEASE OWNER RENT PAYOUT                              */}
      {/* ==================================================================== */}
      <Modal visible={isOwnerPayoutModalVisible} animationType="fade" transparent onRequestClose={() => setIsOwnerPayoutModalVisible(false)}>
        <View style={styles.subModalBackdrop}>
          <View style={[styles.subModalSheet, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
            <View style={[styles.subModalHeader, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
              <View>
                <Text style={[styles.subModalTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Release Owner Rent Payout
                </Text>
                <Text style={[styles.subModalSub, { color: colors.textSecondary }]}>
                  Transfer net rent to owner's bank/UPI destination
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsOwnerPayoutModalVisible(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
              {/* Destination Card */}
              <View style={[styles.payoutDestCard, { backgroundColor: isDark ? "#1E293B" : "#F0FDFA", borderColor: "#0D9488" }]}>
                <Text style={[styles.payoutDestLabel, { color: "#0D9488" }]}>PAYOUT DESTINATION</Text>
                <Text style={[styles.payoutDestName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  {lead.ownerBankDetails?.accountHolderName || lead.ownerName}
                </Text>
                <Text style={[styles.payoutDestDetails, { color: colors.textSecondary }]}>
                  {lead.ownerBankDetails?.bankName || "Bank"}: {lead.ownerBankDetails?.accountNumber || lead.ownerPhone} • IFSC: {lead.ownerBankDetails?.ifscCode || "IFSC"}
                </Text>
                <Text style={[styles.payoutDestUpi, { color: "#0D9488" }]}>
                  UPI: {lead.ownerBankDetails?.upiId || (lead.ownerPhone ? lead.ownerPhone + "@upi" : "Not Set")}
                </Text>
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Rent Month</Text>
              <TextInput
                value={payoutMonth}
                onChangeText={setPayoutMonth}
                placeholder="e.g. Oct 2026"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Disbursed Amount (₹)</Text>
              <TextInput
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                placeholder="Amount in INR"
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Disbursement Mode</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {["UPI", "Bank_Transfer", "NEFT", "RTGS", "Cheque"].map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setPayoutMode(m)}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor: payoutMode === m ? "#0D9488" : isDark ? "#1E293B" : "#F1F5F9",
                        borderColor: payoutMode === m ? "#0D9488" : isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: payoutMode === m ? "#FFF" : colors.textSecondary }}>
                      {m.replace("_", " ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bank UTR / Transaction ID</Text>
              <TextInput
                value={payoutUtr}
                onChangeText={setPayoutUtr}
                placeholder="e.g. UTR987654321"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Audit Remarks / Note</Text>
              <TextInput
                value={payoutRemarks}
                onChangeText={setPayoutRemarks}
                placeholder="e.g. October Rent Payout released via IMPS"
                placeholderTextColor="#94A3B8"
                style={[styles.inputField, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: isDark ? "#FFF" : "#000", borderColor: isDark ? "#334155" : "#E2E8F0" }]}
              />

              <TouchableOpacity
                onPress={handleReleaseOwnerPayout}
                disabled={savingPayout}
                style={[styles.modalSubmitBtn, { backgroundColor: "#0D9488", marginTop: 12 }]}
              >
                {savingPayout ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="send" size={16} color="#FFFFFF" />
                    <Text style={styles.modalSubmitBtnText}>Confirm & Release Payout</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    height: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  leadIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  leadIdText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0D9488",
    fontFamily: "monospace",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  duplicateAlert: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  duplicateTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  duplicateDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  resolveBtn: {
    backgroundColor: "#D97706",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  resolveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  photoSection: {
    borderRadius: 16,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: 180,
    borderRadius: 16,
  },
  thumbRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 8,
  },
  financeCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
  },
  financeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  financeTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  rentLiveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  financeMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  financeMetricBox: {
    flex: 1,
    alignItems: "center",
  },
  financeMetricLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },
  financeMetricVal: {
    fontSize: 14,
    fontWeight: "800",
  },
  metricDivider: {
    width: 1,
    height: 26,
    backgroundColor: "rgba(100, 116, 139, 0.2)",
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  ownerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  ownerAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  ownerNameTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  ownerVerifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ownerVerifiedText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0D9488",
  },
  ownerSubSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  editOwnerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerContactBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
    marginBottom: 4,
  },
  contactBarBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  contactBarBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  detailBlock: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.15)",
    paddingTop: 10,
    gap: 8,
  },
  blockTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  sectionSub: {
    fontSize: 11,
  },
  addRecordBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addRecordBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  commIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  aadhaarPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aadhaarPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
    fontFamily: "monospace",
  },
  panPill: {
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  panPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563EB",
    fontFamily: "monospace",
  },
  verificationPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ownerNotesBox: {
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#0D9488",
  },
  ownerNotesTitle: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  ownerNotesText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  historyWrap: {
    marginTop: 6,
    gap: 6,
  },
  historyHeading: {
    fontSize: 12,
    fontWeight: "700",
  },
  emptyEntryBox: {
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEntryText: {
    fontSize: 11.5,
    textAlign: "center",
  },
  ledgerItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  ledgerMonth: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  ledgerDetails: {
    fontSize: 10.5,
    marginTop: 1,
  },
  ledgerRemarks: {
    fontSize: 10,
    fontStyle: "italic",
    marginTop: 1,
  },
  ledgerAmount: {
    fontSize: 13,
    fontWeight: "800",
  },
  ledgerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  vacantBox: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  vacantTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  vacantSub: {
    fontSize: 11.5,
    textAlign: "center",
  },
  assignTenantBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0D9488",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  assignTenantBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  actionOutlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#0D9488",
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 4,
  },
  actionOutlineBtnText: {
    color: "#0D9488",
    fontSize: 12,
    fontWeight: "700",
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
  },
  closeBottomBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBottomBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  // Sub-modal styling
  subModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  subModalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    overflow: "hidden",
  },
  editOwnerSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
    overflow: "hidden",
  },
  subModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  subModalTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  subModalSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  formSectionHeader: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 8,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  choicePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
  },
  modalSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  payoutDestCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 2,
  },
  payoutDestLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  payoutDestName: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  payoutDestDetails: {
    fontSize: 11.5,
  },
  payoutDestUpi: {
    fontSize: 11.5,
    fontWeight: "700",
  },
});
