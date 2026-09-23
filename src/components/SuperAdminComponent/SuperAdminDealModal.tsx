import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
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

interface OccupiedInfo {
  propertyId: string;
  propertyTitle: string;
}

interface Props {
  visible: boolean;
  lead: any;
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_TENANTS: TenantUser[] = [];

export const SuperAdminDealModal: React.FC<Props> = ({
  visible,
  lead,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Responsive device classifications
  const isTablet = windowWidth >= 768;
  const isSmallDevice = windowWidth < 380 || windowHeight < 700;

  const [dealType, setDealType] = useState<string>("rent");
  const [finalPrice, setFinalPrice] = useState<string>("50000");
  const [deposit, setDeposit] = useState<string>("");

  // Tenant selection state
  const [tenants, setTenants] = useState<TenantUser[]>(DEFAULT_TENANTS);
  const [occupiedTenantsMap, setOccupiedTenantsMap] = useState<
    Record<string, OccupiedInfo>
  >({});
  const [loadingTenants, setLoadingTenants] = useState<boolean>(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantUser | null>(null);
  const [tenantSearch, setTenantSearch] = useState<string>("");
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);

  // Form fields
  const [tenantName, setTenantName] = useState<string>("");
  const [tenantPhone, setTenantPhone] = useState<string>("");
  const [tenantEmail, setTenantEmail] = useState<string>("");
  const [tenantAadhaarLast4, setTenantAadhaarLast4] = useState<string>("");
  const [agreementNumber, setAgreementNumber] = useState<string>("");
  const [policeVerificationStatus, setPoliceVerificationStatus] =
    useState<string>("pending");
  const [notes, setNotes] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [removingTenant, setRemovingTenant] = useState<boolean>(false);

  // Ref to track initialized lead ID
  const initializedLeadIdRef = useRef<string | null>(null);

  // Check if lead currently has an assigned tenant or closed deal
  const hasAssignedTenant = Boolean(
    lead?.deal?.isClosed ||
    lead?.status === "rented" ||
    lead?.deal?.tenantName ||
    lead?.deal?.tenantId,
  );

  // Fetch tenants and active assignments when modal opens
  useEffect(() => {
    if (visible) {
      fetchTenants();
    }
  }, [visible]);

  // Stable initialization when modal opens or lead changes
  useEffect(() => {
    if (visible && lead) {
      const currentLeadId = String(lead._id || lead.id || "");
      if (initializedLeadIdRef.current !== currentLeadId) {
        initializedLeadIdRef.current = currentLeadId;
        setTenantSearch("");
        setDealType(
          lead.deal?.dealType ||
            (lead.listingType === "sale" ? "sale" : "rent"),
        );
        setFinalPrice(
          lead.deal?.finalPrice
            ? String(lead.deal.finalPrice)
            : lead.expectedPrice
              ? String(lead.expectedPrice)
              : "50000",
        );
        setDeposit(
          lead.deal?.deposit
            ? String(lead.deal.deposit)
            : lead.securityDeposit
              ? String(lead.securityDeposit)
              : "",
        );
        setTenantName(lead.deal?.tenantName || "");
        setTenantPhone(lead.deal?.tenantPhone || "");
        setTenantEmail(lead.deal?.tenantEmail || "");
        setTenantAadhaarLast4(lead.deal?.tenantAadhaarLast4 || "");
        setAgreementNumber(
          lead.deal?.agreementNumber ||
            "AGR-DPE-" + Math.floor(100000 + Math.random() * 900000),
        );
        setPoliceVerificationStatus(
          lead.deal?.policeVerificationStatus || "pending",
        );
        setNotes(lead.deal?.notes || "");

        if (lead.deal?.tenantName) {
          const match = tenants.find(
            (t) =>
              (lead.deal?.tenantId &&
                String(t._id) === String(lead.deal.tenantId)) ||
              (lead.deal?.tenantPhone && t.phone === lead.deal.tenantPhone) ||
              (lead.deal?.tenantName &&
                t.name.toLowerCase() === lead.deal.tenantName.toLowerCase()),
          );
          if (match) {
            setSelectedTenant(match);
            setIsManualEntry(false);
          } else {
            setIsManualEntry(true);
          }
        } else {
          // If no tenant currently assigned, leave unselected for user to pick
          setSelectedTenant(null);
          setIsManualEntry(false);
        }
      }
    } else if (!visible) {
      initializedLeadIdRef.current = null;
    }
  }, [visible, lead?._id]);

  const mergeTenants = (backendUsers: any[]): TenantUser[] => {
    const map = new Map<string, TenantUser>();
    // Add DEFAULT_TENANTS first
    DEFAULT_TENANTS.forEach((t) => map.set(t.phone, t));
    // Merge backend users
    if (Array.isArray(backendUsers)) {
      backendUsers.forEach((u) => {
        if (u && u.phone) {
          map.set(u.phone, {
            _id: String(u._id || u.id || u.phone),
            name: u.name || "Tenant",
            phone: u.phone,
            email: u.email || "",
            profilePhoto: u.profilePhoto,
            role: u.role || "tenant",
          });
        }
      });
    }
    return Array.from(map.values());
  };

  const fetchTenants = async () => {
    setLoadingTenants(true);
    try {
      // 1. Fetch registered tenants
      const res = await apiClient.get("/auth/users", {
        params: { role: "tenant", limit: 100 },
      });
      const userList = res.data?.data?.users || res.data?.users || [];
      const merged = mergeTenants(userList);
      setTenants(merged);

      // 2. Fetch all leads to map occupied properties for 1-tenant = 1-property rule
      try {
        const leadsRes = await apiClient.get("/leads/admin/all", {
          params: { limit: 200 },
        });
        const allLeads =
          leadsRes.data?.data?.leads || leadsRes.data?.leads || [];
        const occMap: Record<string, OccupiedInfo> = {};

        const currentLeadId = String(lead?._id || lead?.id || "");

        allLeads.forEach((l: any) => {
          const lId = String(l._id || l.id || "");
          const isClosedOrRented =
            l.status === "rented" ||
            l.status === "sold" ||
            Boolean(l.deal?.isClosed);

          if (isClosedOrRented && lId !== currentLeadId) {
            const propTitle =
              l.title ||
              `${l.propertyType || "Property"} in ${l.locality || "Delhi NCR"}`;

            if (l.deal?.tenantPhone) {
              const cleanP = String(l.deal.tenantPhone)
                .replace(/\D/g, "")
                .slice(-10);
              if (cleanP) {
                occMap[cleanP] = { propertyId: lId, propertyTitle: propTitle };
              }
              occMap[String(l.deal.tenantPhone)] = {
                propertyId: lId,
                propertyTitle: propTitle,
              };
            }
            if (l.deal?.tenantId) {
              occMap[String(l.deal.tenantId)] = {
                propertyId: lId,
                propertyTitle: propTitle,
              };
            }
          }
        });

        setOccupiedTenantsMap(occMap);
      } catch (leadsErr) {
        console.warn(
          "Could not fetch active leads for occupancy check:",
          leadsErr,
        );
      }

      if (lead?.deal?.tenantPhone || lead?.deal?.tenantId) {
        const match = merged.find(
          (t: TenantUser) =>
            (lead.deal?.tenantId &&
              String(t._id) === String(lead.deal.tenantId)) ||
            (lead.deal?.tenantPhone && t.phone === lead.deal.tenantPhone),
        );
        if (match) setSelectedTenant(match);
      }
    } catch (err) {
      console.log("Error fetching tenants, using fallback defaults:", err);
      setTenants(DEFAULT_TENANTS);
    } finally {
      setLoadingTenants(false);
    }
  };

  const getTenantOccupiedInfo = (tenant: TenantUser): OccupiedInfo | null => {
    const cleanPhone = tenant.phone
      ? tenant.phone.replace(/\D/g, "").slice(-10)
      : "";
    const currentLeadId = String(lead?._id || lead?.id || "");

    const occ =
      occupiedTenantsMap[cleanPhone] ||
      occupiedTenantsMap[tenant.phone] ||
      (tenant._id ? occupiedTenantsMap[tenant._id] : null);

    if (occ && occ.propertyId !== currentLeadId) {
      return occ;
    }
    return null;
  };

  const handleSelectTenant = (tenant: TenantUser) => {
    Keyboard.dismiss();
    const occInfo = getTenantOccupiedInfo(tenant);

    // Enforce ONE PROPERTY PER TENANT rule
    if (occInfo) {
      Alert.alert(
        "Tenant Already Occupying a Property 🚫",
        `"${tenant.name}" (+91 ${tenant.phone}) is already assigned to an active property:\n\n🏠 ${occInfo.propertyTitle}\n\n⚠️ Policy: One tenant can only take ONE property at a time.\n\nPlease vacate them from their current property first before assigning them to a new property.`,
        [{ text: "Understood" }],
      );
      return;
    }

    setSelectedTenant(tenant);
    setTenantName(tenant.name || "");
    setTenantPhone(tenant.phone || "");
    setTenantEmail(tenant.email || "");
    setIsManualEntry(false);
  };

  const filteredTenants = useMemo(() => {
    if (!tenantSearch.trim()) return tenants;
    const q = tenantSearch.toLowerCase();
    return tenants.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.phone?.includes(q) ||
        t.email?.toLowerCase().includes(q),
    );
  }, [tenants, tenantSearch]);

  const handleConfirmDeal = async () => {
    if (!tenantName.trim()) {
      Alert.alert(
        "Required",
        "Please select a registered tenant or enter the Tenant / Buyer name.",
      );
      return;
    }
    const cleanInputPhone = tenantPhone.trim().replace(/\D/g, "").slice(-10);
    if (!cleanInputPhone || cleanInputPhone.length < 10) {
      Alert.alert(
        "Required",
        "Please enter a valid 10-digit mobile number for the tenant.",
      );
      return;
    }
    if (!finalPrice || Number(finalPrice) <= 0) {
      Alert.alert("Required", "Please enter a valid finalized price.");
      return;
    }

    // Client-side 1-tenant = 1-property validation check
    const currentLeadId = String(lead?._id || lead?.id || "");
    const occConflict =
      occupiedTenantsMap[cleanInputPhone] ||
      (selectedTenant?._id ? occupiedTenantsMap[selectedTenant._id] : null);

    if (occConflict && occConflict.propertyId !== currentLeadId) {
      Alert.alert(
        "Assignment Conflict 🚫",
        `Tenant "${tenantName}" (Phone: ${tenantPhone}) is already assigned to active property: "${occConflict.propertyTitle}".\n\nRule: One tenant can only take ONE property at a time.\n\nPlease vacate them from that property before creating this new assignment.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const isValidObjectId =
        selectedTenant?._id && /^[0-9a-fA-F]{24}$/.test(selectedTenant._id);

      await apiClient.patch("/leads/" + lead._id + "/deal", {
        dealType,
        finalPrice: Number(finalPrice),
        deposit: Number(deposit) || 0,
        tenantId: isValidObjectId ? selectedTenant?._id : undefined,
        tenantName: tenantName.trim(),
        tenantPhone: cleanInputPhone,
        tenantEmail: tenantEmail.trim() || undefined,
        tenantAadhaarLast4: tenantAadhaarLast4.trim(),
        agreementNumber: agreementNumber.trim(),
        policeVerificationStatus,
        notes: notes.trim(),
      });

      Alert.alert(
        "Deal Finalized! 🎉",
        `Property "${lead.title || lead.locality || "Unit"}" has been successfully assigned to ${tenantName}. It is now immediately accessible on the Tenant's app and active in the rent ledger!`,
        [
          {
            text: "OK",
            onPress: () => {
              onSuccess();
              onClose();
            },
          },
        ],
      );
    } catch (e: any) {
      const msg =
        e.response?.data?.message || e.message || "Failed to confirm deal";
      Alert.alert("Deal Confirmation Error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveTenant = () => {
    const tenantDispName =
      lead?.deal?.tenantName ||
      selectedTenant?.name ||
      tenantName ||
      "Current Tenant";

    Alert.alert(
      "Remove / Vacate Tenant?",
      `Are you sure you want to remove "${tenantDispName}" from "${lead?.title || lead?.locality || "this property"}"?\n\n• The unit will be vacated immediately\n• Completed transactions & commissions remain permanent\n• Property status will revert to "VERIFIED"\n• The tenant will no longer see this property in their app`,
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
                `The tenant has been successfully removed. Tenancy history is archived and Property "${lead?.title || lead?.locality || "Unit"}" is now vacant and restored to VERIFIED status.`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      onSuccess();
                      onClose();
                    },
                  },
                ],
              );
            } catch (err: any) {
              Alert.alert(
                "Failed to Remove Tenant",
                err.response?.data?.message ||
                  err.message ||
                  "An error occurred while vacating the unit.",
              );
            } finally {
              setRemovingTenant(false);
            }
          },
        },
      ],
    );
  };

  if (!lead) return null;

  // Responsive modal dimensions
  const dynamicCardStyle = isTablet
    ? {
        width: Math.min(windowWidth * 0.85, 640),
        maxHeight: Math.min(windowHeight * 0.9, 780),
        borderRadius: 24,
        alignSelf: "center" as const,
      }
    : {
        width: "100%" as const,
        maxHeight: Math.min(windowHeight * 0.92, windowHeight - 30),
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, isTablet && styles.backdropTablet]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={isTablet ? styles.keyboardWrapTablet : styles.keyboardWrap}
        >
          <View
            style={[
              styles.modalCard,
              dynamicCardStyle,
              { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.header,
                { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.badge}>DEAL FINALIZATION & BOOKING</Text>
                <Text
                  style={[
                    styles.title,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Confirm Deal & Rent Agreement
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeBtn,
                  { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                ]}
              >
                <Feather
                  name="x"
                  size={20}
                  color={isDark ? "#94A3B8" : "#64748B"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.body,
                isSmallDevice && { padding: 14, gap: 10 },
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Property Summary */}
              <View
                style={[
                  styles.propSummary,
                  { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" },
                ]}
              >
                <Text
                  style={[
                    styles.propTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  {lead.title ||
                    lead.propertyType + " in " + (lead.locality || "Delhi NCR")}
                </Text>
                <Text
                  style={[styles.propOwner, { color: colors.textSecondary }]}
                >
                  Owner: {lead.ownerName} ({lead.ownerPhone})
                </Text>
              </View>

              {/* Current Occupancy Status Banner */}
              {hasAssignedTenant && (
                <View
                  style={[
                    styles.occupiedBanner,
                    {
                      backgroundColor: isDark
                        ? "rgba(239, 68, 68, 0.12)"
                        : "#FEF2F2",
                      borderColor: isDark ? "#DC2626" : "#FCA5A5",
                    },
                  ]}
                >
                  <View style={styles.occupiedBannerLeft}>
                    <Ionicons name="person-circle" size={24} color="#EF4444" />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.occupiedBannerTitle,
                          { color: isDark ? "#F87171" : "#991B1B" },
                        ]}
                      >
                        Current Tenant:{" "}
                        {lead.deal?.tenantName ||
                          selectedTenant?.name ||
                          "Assigned"}
                      </Text>
                      <Text
                        style={[
                          styles.occupiedBannerSub,
                          { color: isDark ? "#FCA5A5" : "#B91C1C" },
                        ]}
                      >
                        Phone:{" "}
                        {lead.deal?.tenantPhone ||
                          selectedTenant?.phone ||
                          "N/A"}{" "}
                        • Deal Closed / Active
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
                      backgroundColor:
                        dealType === "rent"
                          ? "#0D9488"
                          : isDark
                            ? "#1E293B"
                            : "#F1F5F9",
                    },
                  ]}
                >
                  <Ionicons
                    name="key"
                    size={16}
                    color={
                      dealType === "rent" ? "#FFFFFF" : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.dealTypeBtnText,
                      {
                        color:
                          dealType === "rent"
                            ? "#FFFFFF"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    RENTAL LEASE
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDealType("sale")}
                  style={[
                    styles.dealTypeBtn,
                    {
                      backgroundColor:
                        dealType === "sale"
                          ? "#6D28D9"
                          : isDark
                            ? "#1E293B"
                            : "#F1F5F9",
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="home-city"
                    size={16}
                    color={
                      dealType === "sale" ? "#FFFFFF" : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.dealTypeBtnText,
                      {
                        color:
                          dealType === "sale"
                            ? "#FFFFFF"
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    OUTRIGHT SALE
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Price & Deposit */}
              <View
                style={[
                  styles.formRow,
                  isSmallDevice && { flexDirection: "column" },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {dealType === "sale"
                      ? "FINAL SALE PRICE (₹)"
                      : "MONTHLY RENT (₹)"}
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                        color: isDark ? "#FFFFFF" : "#0F172A",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                    placeholder="e.g. 50000"
                    placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                    keyboardType="numeric"
                    value={finalPrice}
                    onChangeText={setFinalPrice}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    SECURITY DEPOSIT (₹)
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                        color: isDark ? "#FFFFFF" : "#0F172A",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
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
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: colors.textSecondary },
                  ]}
                >
                  TENANT / BUYER PARTICULARS
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsManualEntry(!isManualEntry);
                  }}
                  style={styles.toggleModeBtn}
                >
                  <Text style={styles.toggleModeText}>
                    {isManualEntry
                      ? "← Pick from Directory"
                      : "✏️ Enter Manually"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Policy Banner: 1 Tenant = 1 Property */}
              <View
                style={[
                  styles.ruleNoticeBanner,
                  {
                    backgroundColor: isDark
                      ? "rgba(13, 148, 136, 0.12)"
                      : "#F0FDFA",
                    borderColor: isDark ? "#0D9488" : "#99F6E4",
                  },
                ]}
              >
                <Ionicons name="shield-checkmark" size={16} color="#0D9488" />
                <Text
                  style={[
                    styles.ruleNoticeText,
                    { color: isDark ? "#2DD4BF" : "#0F766E" },
                  ]}
                >
                  <Text style={{ fontWeight: "800" }}>System Rule:</Text> One
                  tenant can only occupy 1 property at a time. Tenants with
                  active leases cannot be assigned.
                </Text>
              </View>

              {/* REGISTERED TENANT DIRECTORY (INLINE) */}
              {!isManualEntry ? (
                <View style={styles.tenantSelectionContainer}>
                  {/* Search Bar for Tenants */}
                  <View
                    style={[
                      styles.inlineSearchBar,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <Feather
                      name="search"
                      size={15}
                      color={isDark ? "#94A3B8" : "#64748B"}
                    />
                    <TextInput
                      style={[
                        styles.inlineSearchInput,
                        { color: isDark ? "#FFFFFF" : "#0F172A" },
                      ]}
                      placeholder="Search tenant by name, mobile, email..."
                      placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                      value={tenantSearch}
                      onChangeText={setTenantSearch}
                      autoFocus={false}
                    />
                    {tenantSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setTenantSearch("")}>
                        <Feather
                          name="x-circle"
                          size={15}
                          color={isDark ? "#94A3B8" : "#64748B"}
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Registered Tenants List Container */}
                  <View
                    style={[
                      styles.tenantListWrapper,
                      {
                        backgroundColor: isDark ? "#111827" : "#F8FAFC",
                        borderColor: isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    <View style={styles.tenantListHeaderRow}>
                      <Text
                        style={[
                          styles.tenantListCountText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        AVAILABLE REGISTERED TENANTS ({filteredTenants.length})
                      </Text>
                      {loadingTenants && (
                        <ActivityIndicator size="small" color="#0D9488" />
                      )}
                    </View>

                    {filteredTenants.length === 0 ? (
                      <View style={styles.emptyInlineBox}>
                        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                          No registered tenants found matching &quot;
                          {tenantSearch}&quot;
                        </Text>
                      </View>
                    ) : (
                      <ScrollView
                        nestedScrollEnabled={true}
                        style={{ maxHeight: 220 }}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled"
                      >
                        {filteredTenants.map((t) => {
                          const occInfo = getTenantOccupiedInfo(t);
                          const isOccupiedElsewhere = Boolean(occInfo);
                          const isCurrentPropertyResident =
                            (lead?.deal?.tenantPhone &&
                              (lead.deal.tenantPhone === t.phone ||
                                lead.deal.tenantPhone.endsWith(t.phone))) ||
                            (lead?.deal?.tenantId &&
                              String(lead.deal.tenantId) === String(t._id));

                          const isSelected =
                            selectedTenant?._id === t._id ||
                            tenantPhone === t.phone ||
                            selectedTenant?.phone === t.phone;

                          return (
                            <TouchableOpacity
                              key={t._id || t.phone}
                              onPress={() => handleSelectTenant(t)}
                              style={[
                                styles.inlineTenantCard,
                                {
                                  backgroundColor: isSelected
                                    ? isDark
                                      ? "rgba(13, 148, 136, 0.18)"
                                      : "#F0FDF4"
                                    : isDark
                                      ? "#1E293B"
                                      : "#FFFFFF",
                                  borderColor: isSelected
                                    ? "#10B981"
                                    : isOccupiedElsewhere
                                      ? isDark
                                        ? "#78350F"
                                        : "#FED7AA"
                                      : isDark
                                        ? "#334155"
                                        : "#E2E8F0",
                                  opacity: isOccupiedElsewhere ? 0.75 : 1,
                                },
                              ]}
                              activeOpacity={0.7}
                            >
                              <View style={styles.tenantAvatar}>
                                {t.profilePhoto ? (
                                  <Image
                                    source={{ uri: t.profilePhoto }}
                                    style={styles.avatarImg}
                                  />
                                ) : (
                                  <View
                                    style={[
                                      styles.avatarPlaceholder,
                                      {
                                        backgroundColor: isSelected
                                          ? "#10B981"
                                          : isOccupiedElsewhere
                                            ? "#D97706"
                                            : "#0D9488",
                                      },
                                    ]}
                                  >
                                    <Text style={styles.avatarLetter}>
                                      {t.name?.charAt(0)?.toUpperCase() || "T"}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <View style={styles.inlineTenantInfo}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.inlineTenantName,
                                      {
                                        color: isDark ? "#FFFFFF" : "#0F172A",
                                        fontWeight: isSelected ? "800" : "700",
                                      },
                                    ]}
                                  >
                                    {t.name}
                                  </Text>

                                  {isOccupiedElsewhere ? (
                                    <View style={styles.occupiedTag}>
                                      <Ionicons
                                        name="lock-closed"
                                        size={9}
                                        color="#D97706"
                                      />
                                      <Text style={styles.occupiedTagText}>
                                        OCCUPIED:{" "}
                                        {occInfo?.propertyTitle?.slice(0, 16)}
                                        ...
                                      </Text>
                                    </View>
                                  ) : isCurrentPropertyResident ? (
                                    <View
                                      style={[
                                        styles.verifiedTag,
                                        { backgroundColor: "#DBEAFE" },
                                      ]}
                                    >
                                      <Ionicons
                                        name="checkmark-circle"
                                        size={10}
                                        color="#2563EB"
                                      />
                                      <Text
                                        style={[
                                          styles.verifiedTagText,
                                          { color: "#1D4ED8" },
                                        ]}
                                      >
                                        CURRENT OCCUPANT
                                      </Text>
                                    </View>
                                  ) : (
                                    <View
                                      style={[
                                        styles.verifiedTag,
                                        isSelected && {
                                          backgroundColor: "#DCFCE7",
                                        },
                                      ]}
                                    >
                                      <Ionicons
                                        name="checkmark-circle"
                                        size={10}
                                        color="#10B981"
                                      />
                                      <Text style={styles.verifiedTagText}>
                                        AVAILABLE
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <Text
                                  style={[
                                    styles.inlineTenantPhone,
                                    { color: colors.textSecondary },
                                  ]}
                                >
                                  📞 +91 {t.phone}{" "}
                                  {t.email ? `• ✉️ ${t.email}` : ""}
                                </Text>
                              </View>
                              <View
                                style={[
                                  styles.selectRadioCircle,
                                  isSelected && styles.selectRadioCircleActive,
                                  isOccupiedElsewhere &&
                                    styles.selectRadioCircleOccupied,
                                ]}
                              >
                                {isSelected ? (
                                  <Ionicons
                                    name="checkmark"
                                    size={14}
                                    color="#FFFFFF"
                                  />
                                ) : isOccupiedElsewhere ? (
                                  <Ionicons
                                    name="ban"
                                    size={13}
                                    color="#D97706"
                                  />
                                ) : (
                                  <Ionicons
                                    name="add"
                                    size={14}
                                    color={isDark ? "#94A3B8" : "#64748B"}
                                  />
                                )}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                  </View>

                  {/* Selected Tenant Summary Pill */}
                  {selectedTenant && (
                    <View
                      style={[
                        styles.selectedPillBox,
                        {
                          backgroundColor: isDark
                            ? "rgba(16, 185, 129, 0.12)"
                            : "#ECFDF5",
                          borderColor: "#10B981",
                        },
                      ]}
                    >
                      <Ionicons name="person" size={16} color="#10B981" />
                      <Text
                        style={[
                          styles.selectedPillText,
                          { color: isDark ? "#34D399" : "#065F46" },
                        ]}
                      >
                        Selected:{" "}
                        <Text style={{ fontWeight: "800" }}>
                          {selectedTenant.name}
                        </Text>{" "}
                        (+91 {selectedTenant.phone})
                      </Text>
                    </View>
                  )}

                  {/* Aadhaar Input */}
                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.label, { color: colors.textSecondary }]}
                      >
                        AADHAAR LAST 4 DIGITS
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                            color: isDark ? "#FFFFFF" : "#0F172A",
                            borderColor: isDark ? "#334155" : "#E2E8F0",
                          },
                        ]}
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
                    <Text
                      style={[styles.label, { color: colors.textSecondary }]}
                    >
                      FULL NAME
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                          color: isDark ? "#FFFFFF" : "#0F172A",
                          borderColor: isDark ? "#334155" : "#E2E8F0",
                        },
                      ]}
                      placeholder="e.g. Rahul Sharma"
                      placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                      value={tenantName}
                      onChangeText={setTenantName}
                    />
                  </View>

                  <View
                    style={[
                      styles.formRow,
                      isSmallDevice && { flexDirection: "column" },
                    ]}
                  >
                    <View style={{ flex: 1.2 }}>
                      <Text
                        style={[styles.label, { color: colors.textSecondary }]}
                      >
                        MOBILE NUMBER
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                            color: isDark ? "#FFFFFF" : "#0F172A",
                            borderColor: isDark ? "#334155" : "#E2E8F0",
                          },
                        ]}
                        placeholder="10-digit number"
                        placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={tenantPhone}
                        onChangeText={setTenantPhone}
                      />
                    </View>

                    <View style={{ flex: 0.8 }}>
                      <Text
                        style={[styles.label, { color: colors.textSecondary }]}
                      >
                        AADHAAR LAST 4
                      </Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                            color: isDark ? "#FFFFFF" : "#0F172A",
                            borderColor: isDark ? "#334155" : "#E2E8F0",
                          },
                        ]}
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
                    <Text
                      style={[styles.label, { color: colors.textSecondary }]}
                    >
                      EMAIL ADDRESS (OPTIONAL)
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                          color: isDark ? "#FFFFFF" : "#0F172A",
                          borderColor: isDark ? "#334155" : "#E2E8F0",
                        },
                      ]}
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
              <Text
                style={[
                  styles.sectionHeading,
                  { color: colors.textSecondary, marginTop: 4 },
                ]}
              >
                COMPLIANCE & LEGAL AGREEMENT
              </Text>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  RENT AGREEMENT NUMBER
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      color: isDark ? "#FFFFFF" : "#0F172A",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                  value={agreementNumber}
                  onChangeText={setAgreementNumber}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  POLICE VERIFICATION STATUS
                </Text>
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
                        <Text
                          style={[
                            styles.statusChipText,
                            { color: isSel ? "#FFFFFF" : colors.textSecondary },
                          ]}
                        >
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
                        backgroundColor: isDark
                          ? "rgba(239, 68, 68, 0.15)"
                          : "#FEF2F2",
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
                        <Text style={styles.removeTenantBtnText}>
                          Remove Tenant & Vacate Unit
                        </Text>
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
                        {hasAssignedTenant
                          ? "Update Deal & Assignment"
                          : "Finalize Deal & Generate Records"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  backdropTablet: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  keyboardWrap: {
    width: "100%",
    justifyContent: "flex-end",
  },
  keyboardWrapTablet: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    paddingTop: 16,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
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
    backgroundColor: "rgba(13, 148, 136, 0.1)",
    borderRadius: 6,
  },
  toggleModeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
  ruleNoticeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  ruleNoticeText: {
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
  tenantSelectionContainer: {
    gap: 10,
  },
  inlineSearchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  inlineSearchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
  },
  tenantListWrapper: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 8,
    gap: 6,
  },
  tenantListHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  tenantListCountText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  emptyInlineBox: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineTenantCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 6,
  },
  tenantAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontSize: 15,
    fontWeight: "800",
  },
  inlineTenantInfo: {
    flex: 1,
    marginLeft: 10,
    gap: 2,
  },
  inlineTenantName: {
    fontSize: 14,
  },
  inlineTenantPhone: {
    fontSize: 11,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  verifiedTagText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#15803D",
  },
  occupiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  occupiedTagText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#B45309",
  },
  selectRadioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(100, 116, 139, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectRadioCircleActive: {
    backgroundColor: "#10B981",
  },
  selectRadioCircleOccupied: {
    backgroundColor: "#FEF3C7",
  },
  selectedPillBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedPillText: {
    fontSize: 12,
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
});
