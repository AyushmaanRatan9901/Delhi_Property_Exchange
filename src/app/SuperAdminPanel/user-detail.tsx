import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiClient from "../../Redux/api/axiosInstance";
import {
  SuperAdminKycModal,
  SuperAdminLeadDetailModal,
} from "../../components/SuperAdminComponent";
import { useResponsiveTheme } from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function SuperAdminUserDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useResponsiveTheme();
  const params = useLocalSearchParams();
  const userId = (params.userId || params.id) as string;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({});
  const [properties, setProperties] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [rentLedger, setRentLedger] = useState<any[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Tenant Specific State
  const [assignedProperty, setAssignedProperty] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [roomChangeRequests, setRoomChangeRequests] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Sub-tab selection: 'overview' | 'properties' | 'payouts' | 'tasks' | 'ledger' | 'complaints' | 'inspections' | 'room_change' | 'activity'
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Modals
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<any>(null);
  const [isLeadDetailModalVisible, setIsLeadDetailModalVisible] =
    useState(false);
  const [isKycModalVisible, setIsKycModalVisible] = useState(false);
  const [isCommModalVisible, setIsCommModalVisible] = useState(false);
  const [commInputRate, setCommInputRate] = useState<string>("");
  const [savingComm, setSavingComm] = useState<boolean>(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  // Tenant Inspection Modal State
  const [
    isScheduleInspectionModalVisible,
    setIsScheduleInspectionModalVisible,
  ] = useState(false);
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>("");
  const [selectedInspectorName, setSelectedInspectorName] =
    useState<string>("");
  const [inspectionDate, setInspectionDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [inspectionNotes, setInspectionNotes] = useState<string>("");
  const [inspectionCondition, setInspectionCondition] =
    useState<string>("good");
  const [schedulingInspection, setSchedulingInspection] = useState(false);

  // Tenant Complaint Modal State
  const [isComplaintModalVisible, setIsComplaintModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [complaintStatus, setComplaintStatus] = useState<string>("in_progress");
  const [complaintStaffId, setComplaintStaffId] = useState<string>("");
  const [complaintStaffName, setComplaintStaffName] = useState<string>("");
  const [complaintResolutionNotes, setComplaintResolutionNotes] =
    useState<string>("");
  const [savingComplaint, setSavingComplaint] = useState(false);

  // Tenant Record Rent Modal State
  const [isRecordRentModalVisible, setIsRecordRentModalVisible] =
    useState(false);
  const [selectedLedgerMonth, setSelectedLedgerMonth] = useState<string>("");
  const [rentRecordAmount, setRentRecordAmount] = useState<string>("");
  const [rentPaymentMode, setRentPaymentMode] = useState<string>("UPI");
  const [rentUtrNumber, setRentUtrNumber] = useState<string>("");
  const [savingRent, setSavingRent] = useState(false);

  const fetchUserDetails = useCallback(
    async (isRefresh = false) => {
      if (!userId) return;
      if (!isRefresh) setLoading(true);
      try {
        const res = await apiClient.get(`/auth/users/${userId}/details`);
        if (res.data?.data) {
          const payload = res.data.data;
          setUserData(payload.user || {});
          setMetrics(payload.metrics || {});
          setProperties(payload.properties || []);
          setPayouts(payload.payouts || []);
          setRentLedger(payload.rentLedger || []);
          setAssignedTasks(payload.assignedTasks || []);
          setActivityLogs(payload.activityLogs || []);

          // Tenant Payload
          setAssignedProperty(
            payload.assignedProperty ||
              (payload.properties && payload.properties[0]) ||
              null,
          );
          setComplaints(payload.complaints || []);
          setInspections(payload.inspections || []);
          setRoomChangeRequests(payload.roomChangeRequests || []);
        }
      } catch (err: any) {
        console.error("[UserDetail Error]", err?.response?.data || err.message);
        Alert.alert(
          "Error",
          err?.response?.data?.message || "Failed to load user profile dossier",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId],
  );

  const fetchStaffMembers = useCallback(async () => {
    try {
      const res = await apiClient.get("/auth/users?role=field_staff&limit=50");
      if (res.data?.data?.users) {
        setStaffList(res.data.data.users);
      }
    } catch (e) {
      console.error("[Staff fetch error]", e);
    }
  }, []);

  useEffect(() => {
    fetchUserDetails();
    fetchStaffMembers();
  }, [fetchUserDetails, fetchStaffMembers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserDetails(true);
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL("tel:" + phone.replace(/\s+/g, ""));
    }
  };

  const handleWhatsApp = (phone?: string) => {
    if (phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const clean = phone.replace(/\D/g, "");
      const full = clean.length === 10 ? "91" + clean : clean;
      Linking.openURL(
        "whatsapp://send?phone=" +
          full +
          "&text=Hello%20" +
          encodeURIComponent(userData?.name || "User") +
          "%20from%20Delhi%20Property%20Exchange%20Admin",
      );
    }
  };

  // Schedule Inspection Handler
  const handleScheduleInspection = async () => {
    const targetProp = assignedProperty || (properties && properties[0]);
    if (!targetProp?._id) {
      Alert.alert(
        "No Property",
        "Tenant does not have an active assigned property to inspect.",
      );
      return;
    }
    setSchedulingInspection(true);
    try {
      await apiClient.post(`/leads/${targetProp._id}/inspections/schedule`, {
        inspectorId: selectedInspectorId || undefined,
        inspectorName: selectedInspectorName || "Field Staff",
        scheduledDate: inspectionDate,
        notes: inspectionNotes,
        conditionScore: inspectionCondition,
      });
      Alert.alert(
        "Success",
        "Property inspection scheduled and assigned successfully.",
      );
      setIsScheduleInspectionModalVisible(false);
      setInspectionNotes("");
      fetchUserDetails(true);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to schedule inspection.",
      );
    } finally {
      setSchedulingInspection(false);
    }
  };

  // Update Complaint Status & Assign Staff
  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    const propId = selectedComplaint.propertyId || assignedProperty?._id;
    if (!propId) return;

    setSavingComplaint(true);
    try {
      await apiClient.patch(
        `/leads/${propId}/complaints/${selectedComplaint.ticketId || selectedComplaint._id}`,
        {
          status: complaintStatus,
          resolutionNotes: complaintResolutionNotes,
          assignedStaff: complaintStaffId || undefined,
          assignedStaffName: complaintStaffName || undefined,
        },
      );
      Alert.alert(
        "Updated",
        "Complaint ticket status and technician assignment updated.",
      );
      setIsComplaintModalVisible(false);
      fetchUserDetails(true);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to update complaint ticket.",
      );
    } finally {
      setSavingComplaint(false);
    }
  };

  // Update Room Change Request
  const handleUpdateRoomChange = async (requestId: string, status: string) => {
    const targetProp = assignedProperty || (properties && properties[0]);
    if (!targetProp?._id) return;

    try {
      await apiClient.patch(
        `/leads/${targetProp._id}/room-change/${requestId}`,
        {
          status,
          adminRemarks: `Status updated to ${status} by Super Admin`,
        },
      );
      Alert.alert(
        "Status Updated",
        `Room change request marked as '${status}'.`,
      );
      fetchUserDetails(true);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message ||
          "Failed to update room transfer request.",
      );
    }
  };

  // Record Rent Payment
  const handleRecordRentPayment = async () => {
    const targetProp = assignedProperty || (properties && properties[0]);
    if (!targetProp?._id) return;
    if (!rentRecordAmount || Number(rentRecordAmount) <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid rent payment amount.",
      );
      return;
    }

    setSavingRent(true);
    try {
      await apiClient.post(`/leads/${targetProp._id}/rent-ledger`, {
        month:
          selectedLedgerMonth ||
          new Date().toLocaleString("en-US", {
            month: "short",
            year: "numeric",
          }),
        amount: Number(rentRecordAmount),
        status: "PAID",
        paymentMode: rentPaymentMode,
        utrNumber: rentUtrNumber || `UTR-${Date.now().toString().slice(-8)}`,
      });
      Alert.alert(
        "Success",
        "Rent payment recorded and ledger marked as PAID.",
      );
      setIsRecordRentModalVisible(false);
      setRentUtrNumber("");
      fetchUserDetails(true);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to record rent payment.",
      );
    } finally {
      setSavingRent(false);
    }
  };

  const handleSaveUserCommission = async () => {
    if (!userData) return;
    const rateNum = Number(commInputRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      Alert.alert(
        "Invalid Rate",
        "Please enter a commission percentage between 0 and 100.",
      );
      return;
    }
    setSavingComm(true);
    try {
      await apiClient.put(`/auth/users/${userData._id}/commission`, {
        commissionRate: rateNum,
      });
      setUserData((prev: any) => ({ ...prev, commissionRate: rateNum }));
      setIsCommModalVisible(false);
      Alert.alert("Success", "Commission rate updated successfully.");
      fetchUserDetails(true);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to update commission rate.",
      );
    } finally {
      setSavingComm(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!userData) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newStatus = !userData.isActive;
    try {
      await apiClient.put(`/auth/users/${userData._id}/status`);
      setUserData((prev: any) => ({ ...prev, isActive: newStatus }));
      Alert.alert(
        "Status Updated",
        `User account ${newStatus ? "Activated" : "Deactivated"} successfully.`,
      );
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to update account status",
      );
    }
  };

  const handleDeleteUser = () => {
    if (!userData) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert(
      "Delete User Account?",
      `Are you sure you want to permanently delete ${userData.name} (${userData.role})? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/auth/users/${userData._id}`);
              Alert.alert(
                "Deleted",
                `User ${userData.name} deleted successfully.`,
                [
                  {
                    text: "OK",
                    onPress: () => router.back(),
                  },
                ],
              );
            } catch (err: any) {
              Alert.alert(
                "Deletion Failed",
                err?.response?.data?.message || "Could not delete user.",
              );
            }
          },
        },
      ],
    );
  };

  const getRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "field_agent":
        return {
          bg: "#CCFBF1",
          text: "#0F766E",
          label: "Field Agent",
          icon: "user-check" as const,
        };
      case "dealer":
      case "broker":
        return {
          bg: "#EDE9FE",
          text: "#6D28D9",
          label: "Dealer / Broker",
          icon: "briefcase" as const,
        };
      case "field_staff":
        return {
          bg: "#DBEAFE",
          text: "#1E40AF",
          label: "Verification Staff",
          icon: "shield" as const,
        };
      case "tele_caller":
        return {
          bg: "#FEF3C7",
          text: "#92400E",
          label: "Tele-caller",
          icon: "phone-call" as const,
        };
      case "owner":
        return {
          bg: "#DCFCE7",
          text: "#166534",
          label: "Property Owner",
          icon: "key" as const,
        };
      case "tenant":
        return {
          bg: "#E0F2FE",
          text: "#0369A1",
          label: "Tenant",
          icon: "home" as const,
        };
      case "admin":
        return {
          bg: "#FEE2E2",
          text: "#991B1B",
          label: "Sub Admin",
          icon: "lock" as const,
        };
      case "super_admin":
        return {
          bg: "#FEF2F2",
          text: "#B91C1C",
          label: "Super Admin",
          icon: "award" as const,
        };
      default:
        return {
          bg: "#F1F5F9",
          text: "#475569",
          label: role || "User",
          icon: "user" as const,
        };
    }
  };

  const getKycBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "VERIFIED":
        return {
          bg: "#DCFCE7",
          text: "#166534",
          label: "KYC VERIFIED",
          icon: "check-circle" as const,
        };
      case "UNDER_REVIEW":
        return {
          bg: "#FEF3C7",
          text: "#92400E",
          label: "UNDER REVIEW",
          icon: "clock" as const,
        };
      case "REJECTED":
        return {
          bg: "#FEE2E2",
          text: "#991B1B",
          label: "KYC REJECTED",
          icon: "x-circle" as const,
        };
      default:
        return {
          bg: "#F1F5F9",
          text: "#64748B",
          label: "NOT UPLOADED",
          icon: "alert-circle" as const,
        };
    }
  };

  const role = userData?.role || "user";
  const roleBadge = getRoleBadge(role);
  const kycBadge = getKycBadge(userData?.kyc?.status);

  const isAgentOrDealer = ["field_agent", "dealer", "broker"].includes(role);
  const isOwner = role === "owner";
  const isStaff = ["field_staff", "tele_caller"].includes(role);
  const isAdmin = ["admin", "super_admin"].includes(role);
  const isTenant = role === "tenant";

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.loadingCenter,
          { backgroundColor: isDark ? colors.background : "#F8FAFC" },
        ]}
      >
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading User Dossier...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : "#F8FAFC" },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Top Glassmorphic Header */}
      <LinearGradient
        colors={
          isDark
            ? ["#0F172A", "#061A23", "#042F2E"]
            : ["#0D9488", "#0F766E", "#115E59"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top + 8, 32) }]}
      >
        <View style={styles.headerTopBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.badgeRow}>
              <View style={styles.livePulseDot} />
              <Text style={styles.headerSuperBadge}>
                USER PROFILE & ACTIVITY DOSSIER
              </Text>
            </View>
            <Text style={styles.headerMainTitle} numberOfLines={1}>
              {userData?.name || "User Details"}
            </Text>
          </View>

          <TouchableOpacity onPress={onRefresh} style={styles.refreshHeaderBtn}>
            <Feather name="refresh-cw" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* User Identity Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrapper}>
              <View
                style={[
                  styles.heroAvatar,
                  {
                    backgroundColor: userData?.isActive ? "#0D9488" : "#64748B",
                  },
                ]}
              >
                {userData?.profilePhoto ? (
                  <Image
                    source={{ uri: userData.profilePhoto }}
                    style={styles.heroAvatarImg}
                  />
                ) : (
                  <Text style={styles.heroAvatarText}>
                    {(userData?.name || "U").slice(0, 1).toUpperCase()}
                  </Text>
                )}
              </View>
              <View
                style={[
                  styles.heroStatusDot,
                  {
                    backgroundColor: userData?.isActive ? "#10B981" : "#94A3B8",
                  },
                ]}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.heroUserName} numberOfLines={1}>
                  {userData?.name}
                </Text>
                <View
                  style={[styles.rolePill, { backgroundColor: roleBadge.bg }]}
                >
                  <Feather
                    name={roleBadge.icon}
                    size={10}
                    color={roleBadge.text}
                    style={{ marginRight: 3 }}
                  />
                  <Text
                    style={[styles.rolePillText, { color: roleBadge.text }]}
                  >
                    {roleBadge.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.heroSubText}>
                ID:{" "}
                {userData?.staffId ||
                  userData?._id?.slice(-6).toUpperCase() ||
                  "N/A"}{" "}
                • Joined:{" "}
                {new Date(userData?.createdAt || Date.now()).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: userData?.isActive
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(239, 68, 68, 0.2)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: userData?.isActive
                          ? "#10B981"
                          : "#EF4444",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: userData?.isActive ? "#34D399" : "#F87171" },
                    ]}
                  >
                    {userData?.isActive ? "ACTIVE" : "INACTIVE"}
                  </Text>
                </View>

                {isAgentOrDealer && (
                  <TouchableOpacity
                    onPress={() => {
                      setCommInputRate(String(userData?.commissionRate || 15));
                      setIsCommModalVisible(true);
                    }}
                    style={styles.commEditPill}
                  >
                    <Ionicons name="pricetag" size={11} color="#5EEAD4" />
                    <Text style={styles.commEditPillText}>
                      {userData?.commissionRate || 15}% Comm.
                    </Text>
                    <Feather name="edit-2" size={9} color="#5EEAD4" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Quick Communication & Action Grid */}
          <View style={styles.actionGrid}>
            {/* Direct Call Tile */}
            <TouchableOpacity
              onPress={() => handleCall(userData?.phone)}
              style={[
                styles.actionGridTile,
                { backgroundColor: "rgba(13, 148, 136, 0.25)" },
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionTileIcon, { backgroundColor: "#0D9488" }]}
              >
                <Feather name="phone-call" size={13} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTileLabel}>Direct Call</Text>
                <Text style={styles.actionTileSub} numberOfLines={1}>
                  {userData?.phone ? `+91 ${userData.phone}` : "No Phone"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* WhatsApp Tile */}
            <TouchableOpacity
              onPress={() => handleWhatsApp(userData?.phone)}
              style={[
                styles.actionGridTile,
                { backgroundColor: "rgba(16, 185, 129, 0.22)" },
              ]}
              activeOpacity={0.8}
            >
              <View
                style={[styles.actionTileIcon, { backgroundColor: "#10B981" }]}
              >
                <FontAwesome5 name="whatsapp" size={14} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTileLabel}>WhatsApp</Text>
                <Text style={styles.actionTileSub} numberOfLines={1}>
                  Send Message
                </Text>
              </View>
            </TouchableOpacity>

            {/* KYC Status Tile */}
            <TouchableOpacity
              onPress={() => setIsKycModalVisible(true)}
              style={[styles.actionGridTile, { backgroundColor: kycBadge.bg }]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionTileIcon,
                  { backgroundColor: kycBadge.text },
                ]}
              >
                <Feather name={kycBadge.icon} size={13} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.actionTileLabel, { color: kycBadge.text }]}
                >
                  KYC Status
                </Text>
                <Text
                  style={[
                    styles.actionTileSub,
                    { color: kycBadge.text, fontWeight: "800" },
                  ]}
                  numberOfLines={1}
                >
                  {kycBadge.label}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Account Access & Delete Tile */}
            <View
              style={[
                styles.actionGridTile,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  justifyContent: "space-between",
                },
              ]}
            >
              <View style={{ flex: 1, marginRight: 4 }}>
                <Text style={styles.actionTileLabel}>Access Control</Text>
                <Text
                  style={[
                    styles.actionTileSub,
                    {
                      color: userData?.isActive ? "#34D399" : "#F87171",
                      fontWeight: "800",
                    },
                  ]}
                >
                  {userData?.isActive ? "ACTIVE" : "INACTIVE"}
                </Text>
              </View>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Switch
                  value={userData?.isActive}
                  onValueChange={handleToggleStatus}
                  trackColor={{ false: "#64748B", true: "#10B981" }}
                  thumbColor="#FFFFFF"
                  style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                />
                {userData?.role !== "super_admin" && (
                  <TouchableOpacity
                    onPress={handleDeleteUser}
                    style={styles.actionTileDeleteBtn}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Feather name="trash-2" size={13} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Navigation Sub-Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab("overview");
            }}
            style={[
              styles.tabItem,
              activeTab === "overview" && styles.tabItemActive,
            ]}
          >
            <Feather
              name={isTenant ? "home" : "user-check"}
              size={14}
              color={
                activeTab === "overview" ? "#0D9488" : "rgba(255,255,255,0.75)"
              }
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === "overview" && styles.tabItemTextActive,
              ]}
            >
              {isTenant ? "Residence & Dossier" : "Dossier & KYC"}
            </Text>
          </TouchableOpacity>

          {isTenant && (
            <>
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab("ledger");
                }}
                style={[
                  styles.tabItem,
                  activeTab === "ledger" && styles.tabItemActive,
                ]}
              >
                <Feather
                  name="dollar-sign"
                  size={14}
                  color={
                    activeTab === "ledger"
                      ? "#0D9488"
                      : "rgba(255,255,255,0.75)"
                  }
                />
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === "ledger" && styles.tabItemTextActive,
                  ]}
                >
                  Rent Ledger ({rentLedger.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab("complaints");
                }}
                style={[
                  styles.tabItem,
                  activeTab === "complaints" && styles.tabItemActive,
                ]}
              >
                <Feather
                  name="alert-circle"
                  size={14}
                  color={
                    activeTab === "complaints"
                      ? "#0D9488"
                      : "rgba(255,255,255,0.75)"
                  }
                />
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === "complaints" && styles.tabItemTextActive,
                  ]}
                >
                  Complaints ({complaints.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab("inspections");
                }}
                style={[
                  styles.tabItem,
                  activeTab === "inspections" && styles.tabItemActive,
                ]}
              >
                <Feather
                  name="clipboard"
                  size={14}
                  color={
                    activeTab === "inspections"
                      ? "#0D9488"
                      : "rgba(255,255,255,0.75)"
                  }
                />
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === "inspections" && styles.tabItemTextActive,
                  ]}
                >
                  Inspections ({inspections.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  setActiveTab("room_change");
                }}
                style={[
                  styles.tabItem,
                  activeTab === "room_change" && styles.tabItemActive,
                ]}
              >
                <Feather
                  name="repeat"
                  size={14}
                  color={
                    activeTab === "room_change"
                      ? "#0D9488"
                      : "rgba(255,255,255,0.75)"
                  }
                />
                <Text
                  style={[
                    styles.tabItemText,
                    activeTab === "room_change" && styles.tabItemTextActive,
                  ]}
                >
                  Transfer ({roomChangeRequests.length})
                </Text>
              </TouchableOpacity>
            </>
          )}

          {(isAgentOrDealer || isOwner) && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("properties");
              }}
              style={[
                styles.tabItem,
                activeTab === "properties" && styles.tabItemActive,
              ]}
            >
              <Feather
                name="home"
                size={14}
                color={
                  activeTab === "properties"
                    ? "#0D9488"
                    : "rgba(255,255,255,0.75)"
                }
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === "properties" && styles.tabItemTextActive,
                ]}
              >
                Properties ({properties.length})
              </Text>
            </TouchableOpacity>
          )}

          {(isAgentOrDealer || isOwner) && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("payouts");
              }}
              style={[
                styles.tabItem,
                activeTab === "payouts" && styles.tabItemActive,
              ]}
            >
              <Feather
                name="dollar-sign"
                size={14}
                color={
                  activeTab === "payouts" ? "#0D9488" : "rgba(255,255,255,0.75)"
                }
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === "payouts" && styles.tabItemTextActive,
                ]}
              >
                {isOwner
                  ? `Rent Ledger (${payouts.length + rentLedger.length})`
                  : `Payouts (${payouts.length})`}
              </Text>
            </TouchableOpacity>
          )}

          {isStaff && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("tasks");
              }}
              style={[
                styles.tabItem,
                activeTab === "tasks" && styles.tabItemActive,
              ]}
            >
              <Feather
                name="check-square"
                size={14}
                color={
                  activeTab === "tasks" ? "#0D9488" : "rgba(255,255,255,0.75)"
                }
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === "tasks" && styles.tabItemTextActive,
                ]}
              >
                Assigned Tasks ({assignedTasks.length})
              </Text>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("activity");
              }}
              style={[
                styles.tabItem,
                activeTab === "activity" && styles.tabItemActive,
              ]}
            >
              <Feather
                name="activity"
                size={14}
                color={
                  activeTab === "activity"
                    ? "#0D9488"
                    : "rgba(255,255,255,0.75)"
                }
              />
              <Text
                style={[
                  styles.tabItemText,
                  activeTab === "activity" && styles.tabItemTextActive,
                ]}
              >
                Admin Logs
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom + 40, 60) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0D9488"
          />
        }
      >
        {/* Role-Specific Metric Summary Cards */}
        {isTenant && (
          <View style={styles.metricsContainer}>
            <Text
              style={[
                styles.sectionHeading,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Tenant Residency & Rent Summary
            </Text>
            <View style={styles.metricGrid}>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    {
                      backgroundColor:
                        metrics.currentRentStatus === "PAID"
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(245, 158, 11, 0.15)",
                    },
                  ]}
                >
                  <Feather
                    name={
                      metrics.currentRentStatus === "PAID"
                        ? "check-circle"
                        : "clock"
                    }
                    size={13}
                    color={
                      metrics.currentRentStatus === "PAID"
                        ? "#10B981"
                        : "#F59E0B"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.metricVal,
                    {
                      color:
                        metrics.currentRentStatus === "PAID"
                          ? "#10B981"
                          : metrics.currentRentStatus === "OVERDUE"
                            ? "#EF4444"
                            : "#F59E0B",
                    },
                  ]}
                >
                  {metrics.currentRentStatus === "PAID"
                    ? "RENT PAID"
                    : metrics.currentRentStatus === "OVERDUE"
                      ? "OVERDUE"
                      : "RENT DUE"}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  ₹{(metrics.currentRentAmount || 0).toLocaleString("en-IN")}/mo{" "}
                  {metrics.daysRemaining !== null &&
                  metrics.daysRemaining !== undefined
                    ? `(${metrics.daysRemaining >= 0 ? `${metrics.daysRemaining}d left` : `${Math.abs(metrics.daysRemaining)}d overdue`})`
                    : ""}
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    {
                      backgroundColor: metrics.isSecurityDepositPaid
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(245, 158, 11, 0.15)",
                    },
                  ]}
                >
                  <Feather
                    name="shield"
                    size={13}
                    color={
                      metrics.isSecurityDepositPaid ? "#10B981" : "#F59E0B"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.metricVal,
                    {
                      color: metrics.isSecurityDepositPaid
                        ? "#10B981"
                        : "#F59E0B",
                    },
                  ]}
                >
                  {metrics.isSecurityDepositPaid
                    ? "DEPOSIT PAID"
                    : "DEPOSIT DUE"}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  ₹
                  {(metrics.securityDepositAmount || 0).toLocaleString("en-IN")}{" "}
                  Deposit
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(13, 148, 136, 0.12)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="currency-inr"
                    size={14}
                    color="#0D9488"
                  />
                </View>
                <Text style={[styles.metricVal, { color: "#0D9488" }]}>
                  ₹{(metrics.totalRentPaid || 0).toLocaleString("en-IN")}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Total Rent Paid
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(99, 102, 241, 0.12)" },
                  ]}
                >
                  <Feather name="home" size={13} color="#6366F1" />
                </View>
                <Text style={[styles.metricVal, { color: "#6366F1" }]}>
                  {metrics.activeAgreements || (assignedProperty ? 1 : 0)}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Active Residence
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    {
                      backgroundColor:
                        (metrics.activeComplaintsCount || 0) > 0
                          ? "rgba(239, 68, 68, 0.12)"
                          : "rgba(16, 185, 129, 0.12)",
                    },
                  ]}
                >
                  <Feather
                    name="alert-triangle"
                    size={13}
                    color={
                      (metrics.activeComplaintsCount || 0) > 0
                        ? "#EF4444"
                        : "#10B981"
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.metricVal,
                    {
                      color:
                        (metrics.activeComplaintsCount || 0) > 0
                          ? "#EF4444"
                          : "#10B981",
                    },
                  ]}
                >
                  {metrics.activeComplaintsCount || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Active Complaints
                </Text>
              </View>

              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(139, 92, 246, 0.12)" },
                  ]}
                >
                  <Feather name="clipboard" size={13} color="#8B5CF6" />
                </View>
                <Text style={[styles.metricVal, { color: "#8B5CF6" }]}>
                  {inspections.length}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Inspections ({metrics.pendingInspectionsCount || 0} Pending)
                </Text>
              </View>
            </View>
          </View>
        )}

        {isAgentOrDealer && (
          <View style={styles.metricsContainer}>
            <Text
              style={[
                styles.sectionHeading,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Agent Performance & Commission Summary
            </Text>
            <View style={styles.metricGrid}>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(13, 148, 136, 0.12)" },
                  ]}
                >
                  <Feather name="home" size={13} color="#0D9488" />
                </View>
                <Text style={[styles.metricVal, { color: "#0D9488" }]}>
                  {metrics.totalProperties || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Registered Leads
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(16, 185, 129, 0.12)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="currency-inr"
                    size={14}
                    color="#10B981"
                  />
                </View>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>
                  ₹
                  {(metrics.totalCommissionEarned || 0).toLocaleString("en-IN")}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Total Commission
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                  ]}
                >
                  <Feather name="clock" size={13} color="#F59E0B" />
                </View>
                <Text style={[styles.metricVal, { color: "#F59E0B" }]}>
                  ₹
                  {(metrics.pendingCommissionDues || 0).toLocaleString("en-IN")}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Pending Dues
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(99, 102, 241, 0.12)" },
                  ]}
                >
                  <Feather name="check-circle" size={13} color="#6366F1" />
                </View>
                <Text style={[styles.metricVal, { color: "#6366F1" }]}>
                  ₹
                  {(metrics.fulfilledCommissionDues || 0).toLocaleString(
                    "en-IN",
                  )}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Fulfilled Dues
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(59, 130, 246, 0.12)" },
                  ]}
                >
                  <Feather name="shield" size={13} color="#3B82F6" />
                </View>
                <Text style={[styles.metricVal, { color: "#3B82F6" }]}>
                  {metrics.verifiedProperties || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Verified Leads
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(139, 92, 246, 0.12)" },
                  ]}
                >
                  <Feather name="award" size={13} color="#8B5CF6" />
                </View>
                <Text style={[styles.metricVal, { color: "#8B5CF6" }]}>
                  {metrics.closedDeals || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Deals Won
                </Text>
              </View>
            </View>
          </View>
        )}

        {isOwner && (
          <View style={styles.metricsContainer}>
            <Text
              style={[
                styles.sectionHeading,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Owner Portfolio & Rent Revenue Summary
            </Text>
            <View style={styles.metricGrid}>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(13, 148, 136, 0.12)" },
                  ]}
                >
                  <Feather name="home" size={13} color="#0D9488" />
                </View>
                <Text style={[styles.metricVal, { color: "#0D9488" }]}>
                  {metrics.totalProperties || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Properties Owned
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(16, 185, 129, 0.12)" },
                  ]}
                >
                  <Feather name="user-check" size={13} color="#10B981" />
                </View>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>
                  {metrics.occupiedProperties || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Occupied Units
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(100, 116, 139, 0.12)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="door-open"
                    size={14}
                    color="#64748B"
                  />
                </View>
                <Text style={[styles.metricVal, { color: "#64748B" }]}>
                  {metrics.vacantProperties || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Vacant Units
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(16, 185, 129, 0.12)" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="currency-inr"
                    size={14}
                    color="#10B981"
                  />
                </View>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>
                  ₹{(metrics.fulfilledRentPayouts || 0).toLocaleString("en-IN")}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Released Payouts
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                  ]}
                >
                  <Feather name="clock" size={13} color="#F59E0B" />
                </View>
                <Text style={[styles.metricVal, { color: "#F59E0B" }]}>
                  ₹{(metrics.pendingRentPayouts || 0).toLocaleString("en-IN")}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Pending Payouts
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(239, 68, 68, 0.12)" },
                  ]}
                >
                  <Feather name="alert-circle" size={13} color="#EF4444" />
                </View>
                <Text style={[styles.metricVal, { color: "#EF4444" }]}>
                  ₹
                  {(metrics.pendingRentFromTenants || 0).toLocaleString(
                    "en-IN",
                  )}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Tenant Overdue Rent
                </Text>
              </View>
            </View>
          </View>
        )}

        {isStaff && (
          <View style={styles.metricsContainer}>
            <Text
              style={[
                styles.sectionHeading,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Verification Staff Performance Metrics
            </Text>
            <View style={styles.metricGrid}>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(13, 148, 136, 0.12)" },
                  ]}
                >
                  <Feather name="check-square" size={13} color="#0D9488" />
                </View>
                <Text style={[styles.metricVal, { color: "#0D9488" }]}>
                  {metrics.totalAssigned || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Total Assigned
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(16, 185, 129, 0.12)" },
                  ]}
                >
                  <Feather name="check-circle" size={13} color="#10B981" />
                </View>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>
                  {metrics.completedInspections || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Completed
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                  ]}
                >
                  <Feather name="clock" size={13} color="#F59E0B" />
                </View>
                <Text style={[styles.metricVal, { color: "#F59E0B" }]}>
                  {metrics.pendingInspections || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Pending Verification
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(59, 130, 246, 0.12)" },
                  ]}
                >
                  <Feather name="trending-up" size={13} color="#3B82F6" />
                </View>
                <Text style={[styles.metricVal, { color: "#3B82F6" }]}>
                  {metrics.completionRate || 0}%
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  SLA Completion Rate
                </Text>
              </View>
            </View>
          </View>
        )}

        {isAdmin && (
          <View style={styles.metricsContainer}>
            <Text
              style={[
                styles.sectionHeading,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Sub-Admin Activity & Governance Stats
            </Text>
            <View style={styles.metricGrid}>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(13, 148, 136, 0.12)" },
                  ]}
                >
                  <Feather name="user-plus" size={13} color="#0D9488" />
                </View>
                <Text style={[styles.metricVal, { color: "#0D9488" }]}>
                  {metrics.usersCreatedCount || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Users Created
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(59, 130, 246, 0.12)" },
                  ]}
                >
                  <Feather name="home" size={13} color="#3B82F6" />
                </View>
                <Text style={[styles.metricVal, { color: "#3B82F6" }]}>
                  {metrics.leadsAssignedCount || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Leads Assigned
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(16, 185, 129, 0.12)" },
                  ]}
                >
                  <Feather name="check-circle" size={13} color="#10B981" />
                </View>
                <Text style={[styles.metricVal, { color: "#10B981" }]}>
                  {metrics.dealsClosedCount || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Deals Closed
                </Text>
              </View>
              <View
                style={[
                  styles.metricCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.metricIconBadge,
                    { backgroundColor: "rgba(139, 92, 246, 0.12)" },
                  ]}
                >
                  <Feather name="dollar-sign" size={13} color="#8B5CF6" />
                </View>
                <Text style={[styles.metricVal, { color: "#8B5CF6" }]}>
                  {metrics.payoutsApprovedCount || 0}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Payouts Approved
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 1: Dossier & KYC (or Tenant Residence & Overview) */}
        {activeTab === "overview" && (
          <View style={styles.tabContentWrap}>
            {/* If Tenant: Assigned Property Residence Card */}
            {isTenant && assignedProperty && (
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: "#0D9488",
                    borderWidth: 1.5,
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <Feather name="home" size={17} color="#0D9488" />
                  <Text
                    style={[
                      styles.sectionCardTitle,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    Active Rented Residence
                  </Text>
                  <View
                    style={[
                      styles.rolePill,
                      { backgroundColor: "#DCFCE7", marginLeft: "auto" },
                    ]}
                  >
                    <Text style={[styles.rolePillText, { color: "#166534" }]}>
                      OCCUPIED UNIT
                    </Text>
                  </View>
                </View>

                {/* Property Cover / Info */}
                <View style={styles.propertyTopRow}>
                  <View
                    style={[styles.propImageWrap, { width: 84, height: 84 }]}
                  >
                    {assignedProperty.coverPhoto ||
                    (assignedProperty.photos &&
                      assignedProperty.photos[0]?.url) ? (
                      <Image
                        source={{
                          uri:
                            assignedProperty.coverPhoto ||
                            assignedProperty.photos[0]?.url ||
                            assignedProperty.photos[0],
                        }}
                        style={styles.propCoverImg}
                      />
                    ) : (
                      <View
                        style={[
                          styles.propNoImg,
                          { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                        ]}
                      >
                        <Feather name="home" size={24} color="#64748B" />
                      </View>
                    )}
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={[
                        styles.propertyTitle,
                        {
                          color: isDark ? "#FFFFFF" : "#0F172A",
                          fontSize: 14.5,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {assignedProperty.title ||
                        `${assignedProperty.propertyType || "Apartment"} in ${assignedProperty.locality || "Delhi NCR"}`}
                    </Text>
                    <Text
                      style={[
                        styles.propLocation,
                        { color: colors.textSecondary, marginTop: 3 },
                      ]}
                      numberOfLines={1}
                    >
                      📍 {assignedProperty.locality || "Delhi NCR"} • ID:{" "}
                      {assignedProperty.leadId ||
                        assignedProperty._id?.slice(-6)?.toUpperCase()}
                    </Text>
                    <Text
                      style={[
                        styles.propPrice,
                        { color: "#0D9488", marginTop: 4 },
                      ]}
                    >
                      ₹
                      {(
                        assignedProperty.deal?.finalPrice ||
                        assignedProperty.expectedPrice ||
                        assignedProperty.rentAmount ||
                        0
                      ).toLocaleString("en-IN")}
                      /mo
                    </Text>
                  </View>
                </View>

                {/* Tenancy & Agreement Grid */}
                <View
                  style={[
                    styles.tenancyGrid,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.tenancyGridItem}>
                    <Text
                      style={[
                        styles.tenancyGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Security Deposit
                    </Text>
                    <Text
                      style={[
                        styles.tenancyGridVal,
                        {
                          color: metrics.isSecurityDepositPaid
                            ? "#10B981"
                            : "#F59E0B",
                        },
                      ]}
                    >
                      ₹
                      {(
                        assignedProperty.deal?.deposit ||
                        assignedProperty.securityDeposit ||
                        0
                      ).toLocaleString("en-IN")}{" "}
                      ({metrics.isSecurityDepositPaid ? "PAID" : "DUE"})
                    </Text>
                  </View>

                  <View style={styles.tenancyGridItem}>
                    <Text
                      style={[
                        styles.tenancyGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Agreement No.
                    </Text>
                    <Text
                      style={[
                        styles.tenancyGridVal,
                        { color: isDark ? "#FFFFFF" : "#0F172A" },
                      ]}
                    >
                      {assignedProperty.deal?.agreementNumber ||
                        `AGR-${String(assignedProperty._id || "")
                          .slice(-6)
                          .toUpperCase()}`}
                    </Text>
                  </View>

                  <View style={styles.tenancyGridItem}>
                    <Text
                      style={[
                        styles.tenancyGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Lease Duration
                    </Text>
                    <Text
                      style={[
                        styles.tenancyGridVal,
                        { color: isDark ? "#FFFFFF" : "#0F172A" },
                      ]}
                    >
                      {assignedProperty.deal?.leaseDurationMonths || 11} Months
                    </Text>
                  </View>

                  <View style={styles.tenancyGridItem}>
                    <Text
                      style={[
                        styles.tenancyGridLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Police Verification
                    </Text>
                    <Text
                      style={[
                        styles.tenancyGridVal,
                        {
                          color:
                            assignedProperty.deal?.policeVerificationStatus ===
                            "verified"
                              ? "#10B981"
                              : "#F59E0B",
                        },
                      ]}
                    >
                      {String(
                        assignedProperty.deal?.policeVerificationStatus ||
                          "VERIFIED",
                      ).toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Open Lead Detail Button */}
                <TouchableOpacity
                  onPress={() => {
                    setSelectedLeadForDetail(assignedProperty);
                    setIsLeadDetailModalVisible(true);
                  }}
                  style={styles.openKycDeskBtn}
                  activeOpacity={0.85}
                >
                  <Feather name="external-link" size={14} color="#FFFFFF" />
                  <Text style={styles.openKycDeskBtnText}>
                    View Complete Property Dossier
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* If Tenant: Rent Due & Security Deposit Status Alert Box */}
            {isTenant && (
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.sectionHeaderRow}>
                  <MaterialCommunityIcons
                    name="currency-inr"
                    size={17}
                    color="#0D9488"
                  />
                  <Text
                    style={[
                      styles.sectionCardTitle,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    Active Rent & Security Deposit Status
                  </Text>
                </View>

                {/* Live Rent Status Banner */}
                <View
                  style={[
                    styles.statusAlertBox,
                    {
                      backgroundColor:
                        metrics.currentRentStatus === "PAID"
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(245, 158, 11, 0.15)",
                      borderColor:
                        metrics.currentRentStatus === "PAID"
                          ? "#10B981"
                          : "#F59E0B",
                    },
                  ]}
                >
                  <Feather
                    name={
                      metrics.currentRentStatus === "PAID"
                        ? "check-circle"
                        : "clock"
                    }
                    size={19}
                    color={
                      metrics.currentRentStatus === "PAID"
                        ? "#10B981"
                        : "#F59E0B"
                    }
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      style={[
                        styles.statusAlertTitle,
                        {
                          color:
                            metrics.currentRentStatus === "PAID"
                              ? "#065F46"
                              : "#92400E",
                        },
                      ]}
                    >
                      {metrics.currentRentStatus === "PAID"
                        ? "Rent Paid for Current Active Month"
                        : "Rent Payment Outstanding"}
                    </Text>
                    <Text
                      style={[
                        styles.statusAlertSub,
                        {
                          color:
                            metrics.currentRentStatus === "PAID"
                              ? "#047857"
                              : "#B45309",
                        },
                      ]}
                    >
                      {metrics.currentRentStatus === "PAID"
                        ? "All tenancy dues are up to date."
                        : `₹${(metrics.currentRentAmount || 0).toLocaleString("en-IN")} is pending for ${metrics.nextDueDate ? new Date(metrics.nextDueDate).toLocaleDateString("en-IN") : "current cycle"}.`}
                    </Text>
                  </View>

                  {metrics.currentRentStatus !== "PAID" && (
                    <TouchableOpacity
                      onPress={() => {
                        setRentRecordAmount(
                          String(metrics.currentRentAmount || ""),
                        );
                        setSelectedLedgerMonth(
                          new Date().toLocaleString("en-US", {
                            month: "short",
                            year: "numeric",
                          }),
                        );
                        setIsRecordRentModalVisible(true);
                      }}
                      style={[
                        styles.quickPayBtn,
                        { backgroundColor: "#0D9488" },
                      ]}
                    >
                      <Text style={styles.quickPayBtnText}>Record Paid</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Security Deposit Banner */}
                <View
                  style={[
                    styles.statusAlertBox,
                    {
                      marginTop: 10,
                      backgroundColor: metrics.isSecurityDepositPaid
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                      borderColor: metrics.isSecurityDepositPaid
                        ? "#10B981"
                        : "#EF4444",
                    },
                  ]}
                >
                  <Feather
                    name={
                      metrics.isSecurityDepositPaid
                        ? "shield"
                        : "alert-triangle"
                    }
                    size={19}
                    color={
                      metrics.isSecurityDepositPaid ? "#10B981" : "#EF4444"
                    }
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text
                      style={[
                        styles.statusAlertTitle,
                        {
                          color: metrics.isSecurityDepositPaid
                            ? "#065F46"
                            : "#991B1B",
                        },
                      ]}
                    >
                      {metrics.isSecurityDepositPaid
                        ? "Security Deposit Fully Paid"
                        : "Security Deposit Unpaid"}
                    </Text>
                    <Text
                      style={[
                        styles.statusAlertSub,
                        {
                          color: metrics.isSecurityDepositPaid
                            ? "#047857"
                            : "#B91C1C",
                        },
                      ]}
                    >
                      {metrics.isSecurityDepositPaid
                        ? `₹${(metrics.securityDepositAmount || 0).toLocaleString("en-IN")} deposited with landlord/company.`
                        : `Tenant has not cleared the move-in security deposit (₹${(metrics.securityDepositAmount || 0).toLocaleString("en-IN")}).`}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Identity & Contact Details */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <Feather name="info" size={16} color="#0D9488" />
                <Text
                  style={[
                    styles.sectionCardTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Identity & Contact Information
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Full Name
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  {userData?.name || "N/A"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Primary Phone
                </Text>
                <TouchableOpacity onPress={() => handleCall(userData?.phone)}>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: "#0D9488", fontWeight: "700" },
                    ]}
                  >
                    +91 {userData?.phone}
                  </Text>
                </TouchableOpacity>
              </View>

              {userData?.alternatePhone ? (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Alternate Phone
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    +91 {userData?.alternatePhone}
                  </Text>
                </View>
              ) : null}

              {userData?.email ? (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Email Address
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    {userData?.email}
                  </Text>
                </View>
              ) : null}

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  System Role
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: roleBadge.text, fontWeight: "700" },
                  ]}
                >
                  {roleBadge.label}
                </Text>
              </View>

              {userData?.designation ? (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Designation
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    {userData?.designation}
                  </Text>
                </View>
              ) : null}

              {userData?.locality && userData?.locality.length > 0 ? (
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Localities
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    {Array.isArray(userData?.locality)
                      ? userData.locality.join(", ")
                      : userData.locality}
                  </Text>
                </View>
              ) : null}

              {userData?.address ? (
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Address
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    {typeof userData.address === "object"
                      ? `${userData.address.street || ""}, ${userData.address.city || ""}, ${userData.address.pincode || ""}`
                      : userData.address}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Bank & Payout Information */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons name="bank" size={17} color="#0D9488" />
                <Text
                  style={[
                    styles.sectionCardTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Bank & Payment Disbursement Details
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Bank Name
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  {userData?.bankDetails?.bankName || "Not Provided"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Account Number
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: isDark ? "#FFFFFF" : "#0F172A",
                      fontWeight: "600",
                    },
                  ]}
                >
                  {userData?.bankDetails?.accountNumber || "Not Provided"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  IFSC Code
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  {userData?.bankDetails?.ifsc ||
                    userData?.bankDetails?.ifscCode ||
                    "Not Provided"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  Account Holder Name
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  {userData?.bankDetails?.accountHolder ||
                    userData?.bankDetails?.accountHolderName ||
                    userData?.name ||
                    "Not Provided"}
                </Text>
              </View>

              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text
                  style={[styles.detailLabel, { color: colors.textSecondary }]}
                >
                  UPI ID
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: "#0D9488", fontWeight: "700" },
                  ]}
                >
                  {userData?.upiId ||
                    userData?.bankDetails?.upiId ||
                    "Not Provided"}
                </Text>
              </View>
            </View>

            {/* KYC & Identity Verification Desk */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Feather name="shield" size={17} color="#0D9488" />
                  <Text
                    style={[
                      styles.sectionCardTitle,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    KYC Verification Dossier
                  </Text>
                </View>
                <View
                  style={[styles.rolePill, { backgroundColor: kycBadge.bg }]}
                >
                  <Text style={[styles.rolePillText, { color: kycBadge.text }]}>
                    {kycBadge.label}
                  </Text>
                </View>
              </View>

              {/* Aadhaar Section */}
              <View style={styles.docBlock}>
                <View style={styles.docHeaderRow}>
                  <Text
                    style={[
                      styles.docHeading,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    Aadhaar Card:{" "}
                    {userData?.kyc?.aadhaarNumber
                      ? `•••• ${userData.kyc.aadhaarNumber.slice(-4)}`
                      : "Number Not Added"}
                  </Text>
                  {userData?.kyc?.aadhaarDoc ? (
                    <TouchableOpacity
                      onPress={() => setPreviewDocUrl(userData.kyc.aadhaarDoc)}
                      style={styles.viewDocBtn}
                    >
                      <Feather name="eye" size={13} color="#0D9488" />
                      <Text style={styles.viewDocBtnText}>View Document</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {userData?.kyc?.aadhaarDoc ? (
                  <TouchableOpacity
                    onPress={() => setPreviewDocUrl(userData.kyc.aadhaarDoc)}
                    style={styles.docThumbContainer}
                  >
                    <Image
                      source={{ uri: userData.kyc.aadhaarDoc }}
                      style={styles.docThumbImg}
                      resizeMode="cover"
                    />
                    <View style={styles.docOverlay}>
                      <Feather name="maximize-2" size={15} color="#FFFFFF" />
                      <Text style={styles.docOverlayText}>Tap to inspect</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.noDocBox,
                      { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" },
                    ]}
                  >
                    <Feather name="alert-circle" size={15} color="#64748B" />
                    <Text
                      style={[
                        styles.noDocText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Aadhaar card document not uploaded yet
                    </Text>
                  </View>
                )}
              </View>

              {/* PAN Section */}
              <View style={[styles.docBlock, { marginTop: 16 }]}>
                <View style={styles.docHeaderRow}>
                  <Text
                    style={[
                      styles.docHeading,
                      { color: isDark ? "#FFFFFF" : "#0F172A" },
                    ]}
                  >
                    PAN Card: {userData?.kyc?.panNumber || "Number Not Added"}
                  </Text>
                  {userData?.kyc?.panDoc ? (
                    <TouchableOpacity
                      onPress={() => setPreviewDocUrl(userData.kyc.panDoc)}
                      style={styles.viewDocBtn}
                    >
                      <Feather name="eye" size={13} color="#0D9488" />
                      <Text style={styles.viewDocBtnText}>View Document</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {userData?.kyc?.panDoc ? (
                  <TouchableOpacity
                    onPress={() => setPreviewDocUrl(userData.kyc.panDoc)}
                    style={styles.docThumbContainer}
                  >
                    <Image
                      source={{ uri: userData.kyc.panDoc }}
                      style={styles.docThumbImg}
                      resizeMode="cover"
                    />
                    <View style={styles.docOverlay}>
                      <Feather name="maximize-2" size={15} color="#FFFFFF" />
                      <Text style={styles.docOverlayText}>Tap to inspect</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.noDocBox,
                      { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" },
                    ]}
                  >
                    <Feather name="alert-circle" size={15} color="#64748B" />
                    <Text
                      style={[
                        styles.noDocText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      PAN card document not uploaded yet
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Button to Open KYC Desk */}
              <TouchableOpacity
                onPress={() => setIsKycModalVisible(true)}
                style={styles.openKycDeskBtn}
                activeOpacity={0.85}
              >
                <Feather name="check-square" size={15} color="#FFFFFF" />
                <Text style={styles.openKycDeskBtnText}>
                  Open KYC Approval & Verification Desk
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 2: Properties & Leads (For Agent / Dealer / Owner) */}
        {activeTab === "properties" && (
          <View style={styles.tabContentWrap}>
            <View style={styles.listHeaderRow}>
              <Text
                style={[
                  styles.sectionHeading,
                  { color: isDark ? "#FFFFFF" : "#0F172A" },
                ]}
              >
                {isOwner
                  ? "Properties Owned by User"
                  : "Leads Registered by Agent"}{" "}
                ({properties.length})
              </Text>
            </View>

            {properties.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="home" size={32} color="#64748B" />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  No Properties Found
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  This user has not registered or owned any property listings
                  yet.
                </Text>
              </View>
            ) : (
              properties.map((prop) => (
                <TouchableOpacity
                  key={prop._id}
                  onPress={() => {
                    setSelectedLeadForDetail(prop);
                    setIsLeadDetailModalVisible(true);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.propertyCard,
                    {
                      backgroundColor: isDark
                        ? colors.cardBackground
                        : "#FFFFFF",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.propertyTopRow}>
                    <View style={styles.propImageWrap}>
                      {prop.coverPhoto ? (
                        <Image
                          source={{ uri: prop.coverPhoto }}
                          style={styles.propCoverImg}
                        />
                      ) : (
                        <View
                          style={[
                            styles.propNoImg,
                            { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" },
                          ]}
                        >
                          <Feather name="image" size={18} color="#64748B" />
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={[
                            styles.propertyTitle,
                            { color: isDark ? "#FFFFFF" : "#0F172A" },
                          ]}
                          numberOfLines={1}
                        >
                          {prop.title || "Untitled Property"}
                        </Text>
                        <View
                          style={[
                            styles.statusTag,
                            {
                              backgroundColor:
                                prop.status === "verified"
                                  ? "#DCFCE7"
                                  : prop.status === "rented"
                                    ? "#EDE9FE"
                                    : "#FEF3C7",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusTagText,
                              {
                                color:
                                  prop.status === "verified"
                                    ? "#166534"
                                    : prop.status === "rented"
                                      ? "#6D28D9"
                                      : "#92400E",
                              },
                            ]}
                          >
                            {String(prop.status || "NEW").toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.propLocation,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        📍 {prop.locality || "Delhi NCR"} •{" "}
                        {prop.propertyType || "Apartment"}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: 6,
                        }}
                      >
                        <Text style={[styles.propPrice, { color: "#0D9488" }]}>
                          ₹
                          {(prop.price || prop.rentAmount || 0).toLocaleString(
                            "en-IN",
                          )}
                          <Text
                            style={{
                              fontSize: 11,
                              fontWeight: "normal",
                              color: colors.textSecondary,
                            }}
                          >
                            {prop.listingType === "sale" ? "" : "/mo"}
                          </Text>
                        </Text>

                        {prop.commission?.amount ? (
                          <Text
                            style={[styles.propCommText, { color: "#10B981" }]}
                          >
                            Comm: ₹
                            {Number(prop.commission.amount).toLocaleString(
                              "en-IN",
                            )}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* TENANT TAB: Rent Ledger */}
        {activeTab === "ledger" && isTenant && (
          <View style={styles.tabContentWrap}>
            <View style={styles.listHeaderRow}>
              <View>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: isDark ? "#FFFFFF" : "#0F172A", marginBottom: 2 },
                  ]}
                >
                  Monthly Tenancy Rent Ledger
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary, textAlign: "left" },
                  ]}
                >
                  Complete history of rent invoices, payments, and UTR
                  references
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setRentRecordAmount(String(metrics.currentRentAmount || ""));
                  setSelectedLedgerMonth(
                    new Date().toLocaleString("en-US", {
                      month: "short",
                      year: "numeric",
                    }),
                  );
                  setIsRecordRentModalVisible(true);
                }}
                style={styles.addRecordBtn}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.addRecordBtnText}>Record Payment</Text>
              </TouchableOpacity>
            </View>

            {rentLedger.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="file-text" size={32} color="#64748B" />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  No Rent Invoices Found
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  No monthly rent ledger entries have been recorded yet for this
                  tenancy.
                </Text>
              </View>
            ) : (
              rentLedger.map((rent, rIdx) => (
                <View
                  key={rent._id || rIdx}
                  style={[
                    styles.payoutCard,
                    {
                      backgroundColor: isDark
                        ? colors.cardBackground
                        : "#FFFFFF",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.payoutCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.payoutTitle,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        {rent.month || "Rent Month"} •{" "}
                        {rent.propertyTitle || "Unit"}
                      </Text>
                      <Text
                        style={[
                          styles.payoutSub,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Due Date:{" "}
                        {rent.dueDate
                          ? new Date(rent.dueDate).toLocaleDateString("en-IN")
                          : "5th of month"}
                        {rent.paidDate
                          ? ` • Paid: ${new Date(rent.paidDate).toLocaleDateString("en-IN")}`
                          : ""}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={[styles.payoutAmount, { color: "#0D9488" }]}>
                        ₹{Number(rent.amount || 0).toLocaleString("en-IN")}
                      </Text>
                      <View
                        style={[
                          styles.statusTag,
                          {
                            backgroundColor:
                              rent.status === "PAID"
                                ? "#DCFCE7"
                                : rent.status === "OVERDUE"
                                  ? "#FEE2E2"
                                  : "#FEF3C7",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTagText,
                            {
                              color:
                                rent.status === "PAID"
                                  ? "#166534"
                                  : rent.status === "OVERDUE"
                                    ? "#991B1B"
                                    : "#92400E",
                            },
                          ]}
                        >
                          {rent.status || "PENDING"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.payoutDestStrip,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                        justifyContent: "space-between",
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Feather name="credit-card" size={13} color="#0D9488" />
                      <Text
                        style={[
                          styles.payoutDestText,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        {rent.paymentMode || "UPI"}{" "}
                        {rent.utrNumber
                          ? `• UTR: ${rent.utrNumber}`
                          : "• Direct Portal"}
                      </Text>
                    </View>

                    {rent.status !== "PAID" && (
                      <TouchableOpacity
                        onPress={() => {
                          setRentRecordAmount(String(rent.amount || ""));
                          setSelectedLedgerMonth(rent.month || "");
                          setIsRecordRentModalVisible(true);
                        }}
                        style={[
                          styles.smallActionBtn,
                          { backgroundColor: "#0D9488" },
                        ]}
                      >
                        <Text style={styles.smallActionBtnText}>Mark Paid</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TENANT TAB: Complaints & Maintenance */}
        {activeTab === "complaints" && isTenant && (
          <View style={styles.tabContentWrap}>
            <View style={styles.listHeaderRow}>
              <View>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: isDark ? "#FFFFFF" : "#0F172A", marginBottom: 2 },
                  ]}
                >
                  Tenant Maintenance Complaints & Tickets ({complaints.length})
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary, textAlign: "left" },
                  ]}
                >
                  Issues raised by tenant requiring staff assignment and
                  resolution
                </Text>
              </View>
            </View>

            {complaints.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="check-circle" size={32} color="#10B981" />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  No Complaints Raised
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  This tenant has not reported any maintenance issues or repair
                  requests.
                </Text>
              </View>
            ) : (
              complaints.map((ticket) => {
                const isResolved =
                  ticket.status === "resolved" || ticket.status === "closed";
                return (
                  <View
                    key={ticket.ticketId || ticket._id}
                    style={[
                      styles.taskCard,
                      {
                        backgroundColor: isDark
                          ? colors.cardBackground
                          : "#FFFFFF",
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.taskCardTop}>
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            marginBottom: 4,
                          }}
                        >
                          <View
                            style={[
                              styles.statusTag,
                              { backgroundColor: "#CCFBF1" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusTagText,
                                { color: "#0F766E" },
                              ]}
                            >
                              {String(
                                ticket.category || "GENERAL",
                              ).toUpperCase()}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusTag,
                              {
                                backgroundColor:
                                  ticket.priority === "urgent"
                                    ? "#FEE2E2"
                                    : ticket.priority === "high"
                                      ? "#FEF3C7"
                                      : "#F1F5F9",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusTagText,
                                {
                                  color:
                                    ticket.priority === "urgent"
                                      ? "#991B1B"
                                      : ticket.priority === "high"
                                        ? "#92400E"
                                        : "#475569",
                                },
                              ]}
                            >
                              {String(
                                ticket.priority || "MEDIUM",
                              ).toUpperCase()}{" "}
                              PRIORITY
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.taskTitle,
                            { color: isDark ? "#FFFFFF" : "#0F172A" },
                          ]}
                        >
                          {ticket.title || "Issue Ticket"}
                        </Text>
                        <Text
                          style={[
                            styles.taskLoc,
                            { color: colors.textSecondary },
                          ]}
                        >
                          Ticket ID:{" "}
                          {ticket.ticketId ||
                            String(ticket._id).slice(-6).toUpperCase()}{" "}
                          • Raised on{" "}
                          {new Date(
                            ticket.createdAt || Date.now(),
                          ).toLocaleDateString("en-IN")}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusTag,
                          {
                            backgroundColor: isResolved
                              ? "#DCFCE7"
                              : ticket.status === "in_progress"
                                ? "#DBEAFE"
                                : "#FEF3C7",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTagText,
                            {
                              color: isResolved
                                ? "#166534"
                                : ticket.status === "in_progress"
                                  ? "#1E40AF"
                                  : "#92400E",
                            },
                          ]}
                        >
                          {String(ticket.status || "SUBMITTED").toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {ticket.description ? (
                      <Text
                        style={[
                          styles.complaintDesc,
                          { color: isDark ? "#E2E8F0" : "#334155" },
                        ]}
                      >
                        {ticket.description}
                      </Text>
                    ) : null}

                    {/* Assigned Technician / Staff */}
                    <View
                      style={[
                        styles.taskNotesBox,
                        {
                          backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Feather name="user-check" size={13} color="#0D9488" />
                        <Text
                          style={[
                            styles.taskNotesText,
                            {
                              color: isDark ? "#FFFFFF" : "#0F172A",
                              fontWeight: "600",
                            },
                          ]}
                        >
                          Assigned: {ticket.assignedStaffName || "Not Assigned"}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedComplaint(ticket);
                          setComplaintStatus(ticket.status || "in_progress");
                          setComplaintStaffName(ticket.assignedStaffName || "");
                          setComplaintResolutionNotes(
                            ticket.resolutionNotes || "",
                          );
                          setIsComplaintModalVisible(true);
                        }}
                        style={[
                          styles.smallActionBtn,
                          { backgroundColor: "#0D9488" },
                        ]}
                      >
                        <Text style={styles.smallActionBtnText}>
                          Assign / Update
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {ticket.resolutionNotes ? (
                      <View
                        style={[
                          styles.taskNotesBox,
                          {
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            marginTop: 6,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.taskNotesText, { color: "#065F46" }]}
                        >
                          Resolution Note: {ticket.resolutionNotes}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* TENANT TAB: Scheduled & Past Inspections */}
        {activeTab === "inspections" && isTenant && (
          <View style={styles.tabContentWrap}>
            <View style={styles.listHeaderRow}>
              <View>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: isDark ? "#FFFFFF" : "#0F172A", marginBottom: 2 },
                  ]}
                >
                  Property Audits & Inspections ({inspections.length})
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary, textAlign: "left" },
                  ]}
                >
                  Routine 6-month property condition inspections and auditor
                  reports
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setInspectionDate(new Date().toISOString().split("T")[0]);
                  setIsScheduleInspectionModalVisible(true);
                }}
                style={styles.addRecordBtn}
                activeOpacity={0.8}
              >
                <Feather name="plus" size={13} color="#FFFFFF" />
                <Text style={styles.addRecordBtnText}>Schedule Inspection</Text>
              </TouchableOpacity>
            </View>

            {inspections.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="clipboard" size={32} color="#64748B" />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  No Inspections Scheduled
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Schedule a periodic property audit or physical checkup for
                  this tenant's property.
                </Text>
                <TouchableOpacity
                  onPress={() => setIsScheduleInspectionModalVisible(true)}
                  style={[styles.openKycDeskBtn, { marginTop: 14 }]}
                >
                  <Feather name="plus-circle" size={14} color="#FFFFFF" />
                  <Text style={styles.openKycDeskBtnText}>
                    Schedule First Inspection
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              inspections.map((insp, idx) => (
                <View
                  key={insp.inspectionId || insp._id || idx}
                  style={[
                    styles.taskCard,
                    {
                      backgroundColor: isDark
                        ? colors.cardBackground
                        : "#FFFFFF",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.taskCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.taskTitle,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        {insp.notes || "Periodic Physical Inspection"}
                      </Text>
                      <Text
                        style={[
                          styles.taskLoc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Audit ID: {insp.inspectionId || `INSP-${idx + 1}`} •
                        Scheduled:{" "}
                        {insp.scheduledDate
                          ? new Date(insp.scheduledDate).toLocaleDateString(
                              "en-IN",
                            )
                          : "N/A"}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusTag,
                        {
                          backgroundColor:
                            insp.status === "completed" ? "#DCFCE7" : "#FEF3C7",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          {
                            color:
                              insp.status === "completed"
                                ? "#166534"
                                : "#92400E",
                          },
                        ]}
                      >
                        {String(insp.status || "SCHEDULED").toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Auditor Details & Score */}
                  <View
                    style={[
                      styles.tenancyGrid,
                      {
                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                        borderColor: colors.border,
                        marginTop: 10,
                      },
                    ]}
                  >
                    <View style={styles.tenancyGridItem}>
                      <Text
                        style={[
                          styles.tenancyGridLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Assigned Inspector
                      </Text>
                      <Text
                        style={[
                          styles.tenancyGridVal,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        {insp.inspectorName || "Staff Auditor"}
                      </Text>
                    </View>

                    <View style={styles.tenancyGridItem}>
                      <Text
                        style={[
                          styles.tenancyGridLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Condition Rating
                      </Text>
                      <Text
                        style={[styles.tenancyGridVal, { color: "#0D9488" }]}
                      >
                        {String(insp.conditionScore || "GOOD").toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.tenancyGridItem}>
                      <Text
                        style={[
                          styles.tenancyGridLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Structural & Electric
                      </Text>
                      <Text
                        style={[styles.tenancyGridVal, { color: "#10B981" }]}
                      >
                        Verified OK
                      </Text>
                    </View>

                    <View style={styles.tenancyGridItem}>
                      <Text
                        style={[
                          styles.tenancyGridLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Plumbing & Hygiene
                      </Text>
                      <Text
                        style={[styles.tenancyGridVal, { color: "#10B981" }]}
                      >
                        Verified OK
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TENANT TAB: Room / Property Change Requests */}
        {activeTab === "room_change" && isTenant && (
          <View style={styles.tabContentWrap}>
            <View style={styles.listHeaderRow}>
              <View>
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: isDark ? "#FFFFFF" : "#0F172A", marginBottom: 2 },
                  ]}
                >
                  Room & Property Transfer Applications (
                  {roomChangeRequests.length})
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary, textAlign: "left" },
                  ]}
                >
                  Tenant requests to switch rooms, upgrade BHK, or transfer to
                  another property
                </Text>
              </View>
            </View>

            {roomChangeRequests.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="repeat" size={32} color="#64748B" />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  No Transfer Requests
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Tenant has not applied for any room relocation or unit
                  transfer.
                </Text>
              </View>
            ) : (
              roomChangeRequests.map((req) => (
                <View
                  key={req.requestId || req._id}
                  style={[
                    styles.taskCard,
                    {
                      backgroundColor: isDark
                        ? colors.cardBackground
                        : "#FFFFFF",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.taskCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.taskTitle,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        Reason:{" "}
                        {String(req.reason || "Room Change")
                          .replace(/_/g, " ")
                          .toUpperCase()}
                      </Text>
                      <Text
                        style={[
                          styles.taskLoc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Request ID:{" "}
                        {req.requestId ||
                          String(req._id).slice(-6).toUpperCase()}{" "}
                        • Applied:{" "}
                        {new Date(
                          req.createdAt || Date.now(),
                        ).toLocaleDateString("en-IN")}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusTag,
                        {
                          backgroundColor:
                            req.status === "approved"
                              ? "#DCFCE7"
                              : req.status === "rejected"
                                ? "#FEE2E2"
                                : "#FEF3C7",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          {
                            color:
                              req.status === "approved"
                                ? "#166534"
                                : req.status === "rejected"
                                  ? "#991B1B"
                                  : "#92400E",
                          },
                        ]}
                      >
                        {String(req.status || "SUBMITTED").toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {req.description ? (
                    <Text
                      style={[
                        styles.complaintDesc,
                        { color: isDark ? "#E2E8F0" : "#334155" },
                      ]}
                    >
                      {req.description}
                    </Text>
                  ) : null}

                  {/* Transfer Preferences */}
                  <View
                    style={[
                      styles.tenancyGrid,
                      {
                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                        borderColor: colors.border,
                        marginTop: 10,
                      },
                    ]}
                  >
                    <View style={styles.tenancyGridItem}>
                      <Text
                        style={[
                          styles.tenancyGridLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Target Configuration
                      </Text>
                      <Text
                        style={[
                          styles.tenancyGridVal,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        {req.targetBhk || "Any BHK"}
                      </Text>
                    </View>

                    <View style={styles.tenancyGridItem}>
                      <Text
                        style={[
                          styles.tenancyGridLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Preferred Locality
                      </Text>
                      <Text
                        style={[
                          styles.tenancyGridVal,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        {req.targetLocality || "Nearby"}
                      </Text>
                    </View>

                    <View style={styles.tenancyGridItem}>
                      <Text
                        style={[
                          styles.tenancyGridLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Budget Range
                      </Text>
                      <Text
                        style={[styles.tenancyGridVal, { color: "#0D9488" }]}
                      >
                        {req.budgetRange || "Flexible"}
                      </Text>
                    </View>

                    <View style={styles.tenancyGridItem}>
                      <Text
                        style={[
                          styles.tenancyGridLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Move Date
                      </Text>
                      <Text
                        style={[
                          styles.tenancyGridVal,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        {req.preferredMoveDate
                          ? new Date(req.preferredMoveDate).toLocaleDateString(
                              "en-IN",
                            )
                          : "Immediate"}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateRoomChange(
                          req.requestId || req._id,
                          "rejected",
                        )
                      }
                      style={[
                        styles.smallActionBtn,
                        { backgroundColor: "#EF4444" },
                      ]}
                    >
                      <Text style={styles.smallActionBtnText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateRoomChange(
                          req.requestId || req._id,
                          "approved",
                        )
                      }
                      style={[
                        styles.smallActionBtn,
                        { backgroundColor: "#10B981" },
                      ]}
                    >
                      <Text style={styles.smallActionBtnText}>
                        Approve Transfer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 4: Assigned Tasks (For Verification Staff) */}
        {activeTab === "tasks" && isStaff && (
          <View style={styles.tabContentWrap}>
            <Text
              style={[
                styles.sectionHeading,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Assigned Field Verification Tasks ({assignedTasks.length})
            </Text>

            {assignedTasks.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="check-square" size={32} color="#64748B" />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  No Tasks Assigned
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  This staff member currently has no verification or inspection
                  tasks assigned.
                </Text>
              </View>
            ) : (
              assignedTasks.map((task) => (
                <View
                  key={task._id}
                  style={[
                    styles.taskCard,
                    {
                      backgroundColor: isDark
                        ? colors.cardBackground
                        : "#FFFFFF",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.taskCardTop}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.taskTitle,
                          { color: isDark ? "#FFFFFF" : "#0F172A" },
                        ]}
                      >
                        {task.title || "Field Inspection Task"}
                      </Text>
                      <Text
                        style={[
                          styles.taskLoc,
                          { color: colors.textSecondary },
                        ]}
                      >
                        📍 {task.locality || "Delhi NCR"} • Owner:{" "}
                        {task.ownerName || "Owner"} (+91 {task.ownerPhone})
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusTag,
                        {
                          backgroundColor:
                            task.status === "verified" ? "#DCFCE7" : "#FEF3C7",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTagText,
                          {
                            color:
                              task.status === "verified"
                                ? "#166534"
                                : "#92400E",
                          },
                        ]}
                      >
                        {String(task.status).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {task.assignmentNotes ? (
                    <View
                      style={[
                        styles.taskNotesBox,
                        { backgroundColor: isDark ? "#1E293B" : "#F8FAFC" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.taskNotesText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Notes: {task.assignmentNotes}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 5: Admin Activity Logs */}
        {activeTab === "activity" && isAdmin && (
          <View style={styles.tabContentWrap}>
            <Text
              style={[
                styles.sectionHeading,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Accounts Created by this Admin ({activityLogs.length})
            </Text>

            {activityLogs.length === 0 ? (
              <View
                style={[
                  styles.emptyBox,
                  {
                    backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="activity" size={32} color="#64748B" />
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  No Activity Records
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  This admin has not provisioned any staff or agent accounts
                  yet.
                </Text>
              </View>
            ) : (
              activityLogs.map((log) => (
                <View
                  key={log._id}
                  style={[
                    styles.logCard,
                    {
                      backgroundColor: isDark
                        ? colors.cardBackground
                        : "#FFFFFF",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.logName,
                        { color: isDark ? "#FFFFFF" : "#0F172A" },
                      ]}
                    >
                      {log.name}
                    </Text>
                    <Text
                      style={[styles.logPhone, { color: colors.textSecondary }]}
                    >
                      +91 {log.phone} • Role: {log.role}
                    </Text>
                  </View>
                  <Text style={[styles.logDate, { color: colors.textMuted }]}>
                    {new Date(log.createdAt).toLocaleDateString("en-IN")}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* KYC Review Modal */}
      {userData && (
        <SuperAdminKycModal
          visible={isKycModalVisible}
          user={userData}
          onClose={() => setIsKycModalVisible(false)}
          onSuccess={() => {
            setIsKycModalVisible(false);
            fetchUserDetails(true);
          }}
        />
      )}

      {/* Commission Rate Edit Modal */}
      <Modal
        visible={isCommModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCommModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            <View style={styles.modalHeader}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons name="pricetag" size={20} color="#0D9488" />
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Edit Commission Rate (%)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsCommModalVisible(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Adjust the commission percentage rule applied for `
              {userData?.name || "Agent"}`.
            </Text>

            <View
              style={[
                styles.commInputWrap,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  borderColor: colors.border,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.commInputText,
                  { color: isDark ? "#FFFFFF" : "#0F172A" },
                ]}
                keyboardType="numeric"
                value={commInputRate}
                onChangeText={setCommInputRate}
                placeholder="15"
                placeholderTextColor="#94A3B8"
                maxLength={3}
              />
              <Text style={styles.commPercentSign}>%</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setIsCommModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text
                  style={[
                    styles.modalCancelBtnText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveUserCommission}
                disabled={savingComm}
                style={styles.modalSubmitBtn}
              >
                {savingComm ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Save Commission</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Schedule / Assign Inspection Modal (Tenant Flow) */}
      <Modal
        visible={isScheduleInspectionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsScheduleInspectionModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            <View style={styles.modalHeader}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Feather name="clipboard" size={20} color="#0D9488" />
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Schedule Property Inspection
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsScheduleInspectionModalVisible(false)}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Assign field staff to physically audit "
              {assignedProperty?.title || "Tenant Residence"}".
            </Text>

            {/* Inspector Selection */}
            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Assign Inspector Staff
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
            >
              <View style={{ flexDirection: "row", gap: 6 }}>
                {staffList.map((staff) => (
                  <TouchableOpacity
                    key={staff._id}
                    onPress={() => {
                      setSelectedInspectorId(staff._id);
                      setSelectedInspectorName(staff.name);
                    }}
                    style={[
                      styles.staffChip,
                      {
                        backgroundColor:
                          selectedInspectorId === staff._id
                            ? "#0D9488"
                            : isDark
                              ? "#0F172A"
                              : "#F1F5F9",
                        borderColor:
                          selectedInspectorId === staff._id
                            ? "#0D9488"
                            : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.staffChipText,
                        {
                          color:
                            selectedInspectorId === staff._id
                              ? "#FFFFFF"
                              : isDark
                                ? "#FFFFFF"
                                : "#0F172A",
                        },
                      ]}
                    >
                      {staff.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Custom Staff Name (If not selected above)
            </Text>
            <TextInput
              style={[
                styles.modalFormInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  borderColor: colors.border,
                },
              ]}
              value={selectedInspectorName}
              onChangeText={setSelectedInspectorName}
              placeholder="e.g. Ramesh Kumar (Auditor)"
              placeholderTextColor="#94A3B8"
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A", marginTop: 10 },
              ]}
            >
              Inspection Date (YYYY-MM-DD)
            </Text>
            <TextInput
              style={[
                styles.modalFormInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  borderColor: colors.border,
                },
              ]}
              value={inspectionDate}
              onChangeText={setInspectionDate}
              placeholder="2026-10-15"
              placeholderTextColor="#94A3B8"
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A", marginTop: 10 },
              ]}
            >
              Inspection Audit Notes
            </Text>
            <TextInput
              style={[
                styles.modalFormInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  borderColor: colors.border,
                  height: 65,
                },
              ]}
              value={inspectionNotes}
              onChangeText={setInspectionNotes}
              placeholder="e.g. 6-month routine audit, electrical safety check"
              placeholderTextColor="#94A3B8"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setIsScheduleInspectionModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text
                  style={[
                    styles.modalCancelBtnText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleScheduleInspection}
                disabled={schedulingInspection}
                style={styles.modalSubmitBtn}
              >
                {schedulingInspection ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>
                    Assign & Schedule
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Complaint Update & Staff Assign Modal */}
      <Modal
        visible={isComplaintModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsComplaintModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            <View style={styles.modalHeader}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Feather name="tool" size={20} color="#0D9488" />
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Assign Staff & Update Ticket
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsComplaintModalVisible(false)}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Assign technician and update resolution progress for `
              {selectedComplaint?.title || "Issue"}`.
            </Text>

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Assign Technician / Field Staff
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 12 }}
            >
              <View style={{ flexDirection: "row", gap: 6 }}>
                {staffList.map((staff) => (
                  <TouchableOpacity
                    key={staff._id}
                    onPress={() => {
                      setComplaintStaffId(staff._id);
                      setComplaintStaffName(staff.name);
                    }}
                    style={[
                      styles.staffChip,
                      {
                        backgroundColor:
                          complaintStaffId === staff._id
                            ? "#0D9488"
                            : isDark
                              ? "#0F172A"
                              : "#F1F5F9",
                        borderColor:
                          complaintStaffId === staff._id
                            ? "#0D9488"
                            : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.staffChipText,
                        {
                          color:
                            complaintStaffId === staff._id
                              ? "#FFFFFF"
                              : isDark
                                ? "#FFFFFF"
                                : "#0F172A",
                        },
                      ]}
                    >
                      {staff.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Status
            </Text>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
              {["submitted", "in_progress", "resolved", "closed"].map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setComplaintStatus(st)}
                  style={[
                    styles.staffChip,
                    {
                      backgroundColor:
                        complaintStatus === st
                          ? "#0D9488"
                          : isDark
                            ? "#0F172A"
                            : "#F1F5F9",
                      borderColor:
                        complaintStatus === st ? "#0D9488" : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.staffChipText,
                      {
                        color:
                          complaintStatus === st
                            ? "#FFFFFF"
                            : isDark
                              ? "#FFFFFF"
                              : "#0F172A",
                      },
                    ]}
                  >
                    {st.replace(/_/g, " ").toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Custom Staff Name (if applicable)
            </Text>
            <TextInput
              style={[
                styles.modalFormInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  borderColor: colors.border,
                },
              ]}
              value={complaintStaffName}
              onChangeText={setComplaintStaffName}
              placeholder="e.g. Suresh (Electrician)"
              placeholderTextColor="#94A3B8"
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A", marginTop: 10 },
              ]}
            >
              Resolution & Action Notes
            </Text>
            <TextInput
              style={[
                styles.modalFormInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  borderColor: colors.border,
                  height: 65,
                },
              ]}
              value={complaintResolutionNotes}
              onChangeText={setComplaintResolutionNotes}
              placeholder="e.g. Electrician visited on-site and fixed the MCB tripping issue."
              placeholderTextColor="#94A3B8"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setIsComplaintModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text
                  style={[
                    styles.modalCancelBtnText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateComplaint}
                disabled={savingComplaint}
                style={styles.modalSubmitBtn}
              >
                {savingComplaint ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Update Ticket</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Record Rent Payment Modal (Tenant Flow) */}
      <Modal
        visible={isRecordRentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRecordRentModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            <View style={styles.modalHeader}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <MaterialCommunityIcons
                  name="currency-inr"
                  size={20}
                  color="#0D9488"
                />
                <Text
                  style={[
                    styles.modalTitle,
                    { color: isDark ? "#FFFFFF" : "#0F172A" },
                  ]}
                >
                  Record Rent Payment
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsRecordRentModalVisible(false)}
              >
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              Mark rent payment as received for `
              {selectedLedgerMonth || "Current Cycle"}`.
            </Text>

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              Month (e.g. Oct 2026)
            </Text>
            <TextInput
              style={[
                styles.modalFormInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  borderColor: colors.border,
                },
              ]}
              value={selectedLedgerMonth}
              onChangeText={setSelectedLedgerMonth}
              placeholder="Oct 2026"
              placeholderTextColor="#94A3B8"
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A", marginTop: 10 },
              ]}
            >
              Payment Amount (₹)
            </Text>
            <TextInput
              style={[
                styles.modalFormInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  borderColor: colors.border,
                },
              ]}
              keyboardType="numeric"
              value={rentRecordAmount}
              onChangeText={setRentRecordAmount}
              placeholder="15000"
              placeholderTextColor="#94A3B8"
            />

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A", marginTop: 10 },
              ]}
            >
              Payment Mode
            </Text>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
              {["UPI", "Bank_Transfer", "Cash", "Cheque"].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setRentPaymentMode(mode)}
                  style={[
                    styles.staffChip,
                    {
                      backgroundColor:
                        rentPaymentMode === mode
                          ? "#0D9488"
                          : isDark
                            ? "#0F172A"
                            : "#F1F5F9",
                      borderColor:
                        rentPaymentMode === mode ? "#0D9488" : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.staffChipText,
                      {
                        color:
                          rentPaymentMode === mode
                            ? "#FFFFFF"
                            : isDark
                              ? "#FFFFFF"
                              : "#0F172A",
                      },
                    ]}
                  >
                    {mode.replace(/_/g, " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.inputLabel,
                { color: isDark ? "#FFFFFF" : "#0F172A" },
              ]}
            >
              UTR / Transaction Reference
            </Text>
            <TextInput
              style={[
                styles.modalFormInput,
                {
                  backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  borderColor: colors.border,
                },
              ]}
              value={rentUtrNumber}
              onChangeText={setRentUtrNumber}
              placeholder="e.g. UTR-93821038"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setIsRecordRentModalVisible(false)}
                style={styles.modalCancelBtn}
              >
                <Text
                  style={[
                    styles.modalCancelBtnText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRecordRentPayment}
                disabled={savingRent}
                style={styles.modalSubmitBtn}
              >
                {savingRent ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>
                    Save Rent Payment
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Lead Detail Sheet Modal */}
      <SuperAdminLeadDetailModal
        visible={isLeadDetailModalVisible}
        lead={selectedLeadForDetail}
        onClose={() => setIsLeadDetailModalVisible(false)}
      />

      {/* Document Image Zoom Modal */}
      <Modal
        visible={!!previewDocUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewDocUrl(null)}
      >
        <View style={styles.docZoomBackdrop}>
          <TouchableOpacity
            onPress={() => setPreviewDocUrl(null)}
            style={styles.docZoomCloseBtn}
          >
            <Feather name="x" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          {previewDocUrl && (
            <Image
              source={{ uri: previewDocUrl }}
              style={styles.docZoomImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 2,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2DD4BF",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  headerSuperBadge: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
    color: "#5EEAD4",
  },
  headerMainTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  refreshHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroCard: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
  },
  heroAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  heroAvatarImg: {
    width: 54,
    height: 54,
  },
  heroAvatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroStatusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  heroUserName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    maxWidth: width * 0.45,
    letterSpacing: -0.2,
  },
  heroSubText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: "800",
  },
  commEditPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    backgroundColor: "rgba(13, 148, 136, 0.4)",
    gap: 3,
  },
  commEditPillText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#5EEAD4",
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  actionGridTile: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  actionTileIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTileLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  actionTileSub: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 9.5,
    marginTop: 1,
  },
  actionTileDeleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    gap: 6,
    paddingTop: 4,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 5,
  },
  tabItemActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabItemText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.85)",
  },
  tabItemTextActive: {
    color: "#0D9488",
  },
  content: {
    padding: 16,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCard: {
    width: (width - 40) / 2,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  metricVal: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  tabContentWrap: {
    gap: 14,
  },
  sectionCard: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.15)",
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    maxWidth: width * 0.55,
    textAlign: "right",
  },
  docBlock: {
    marginTop: 4,
  },
  docHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  docHeading: {
    fontSize: 12,
    fontWeight: "700",
  },
  viewDocBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewDocBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
  docThumbContainer: {
    height: 130,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
  },
  docThumbImg: {
    width: "100%",
    height: "100%",
  },
  docOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  docOverlayText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  noDocBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  noDocText: {
    fontSize: 11,
    fontWeight: "500",
  },
  openKycDeskBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 14,
    gap: 6,
  },
  openKycDeskBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  listHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 26,
    borderRadius: 18,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 11.5,
    textAlign: "center",
    marginTop: 3,
    lineHeight: 16,
  },
  propertyCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  propertyTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  propImageWrap: {
    width: 65,
    height: 65,
    borderRadius: 12,
    overflow: "hidden",
  },
  propCoverImg: {
    width: "100%",
    height: "100%",
  },
  propNoImg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  propertyTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    maxWidth: width * 0.48,
  },
  propLocation: {
    fontSize: 11,
    marginTop: 2,
  },
  propPrice: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  propCommText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 8.5,
    fontWeight: "800",
  },
  payoutCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  payoutCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payoutTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    maxWidth: width * 0.55,
  },
  payoutSub: {
    fontSize: 10.5,
    marginTop: 2,
  },
  payoutAmount: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  payoutDestStrip: {
    flexDirection: "row",
    alignItems: "center",
    padding: 7,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  payoutDestText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  taskCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  taskCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  taskLoc: {
    fontSize: 11,
    marginTop: 2,
  },
  taskNotesBox: {
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  taskNotesText: {
    fontSize: 10.5,
    fontStyle: "italic",
  },
  logCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  logName: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  logPhone: {
    fontSize: 10.5,
    marginTop: 2,
  },
  logDate: {
    fontSize: 10.5,
  },
  docZoomBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  docZoomCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  docZoomImage: {
    width: "100%",
    height: "80%",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 22,
    padding: 18,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  modalSub: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 17,
  },
  commInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 18,
  },
  commInputText: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
  },
  commPercentSign: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D9488",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalSubmitBtn: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalSubmitBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  tenancyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    gap: 6,
  },
  tenancyGridItem: {
    width: "48%",
    marginBottom: 3,
  },
  tenancyGridLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tenancyGridVal: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 1,
  },
  statusAlertBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  statusAlertTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  statusAlertSub: {
    fontSize: 10.5,
    fontWeight: "500",
    marginTop: 1,
    lineHeight: 15,
  },
  quickPayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 6,
  },
  quickPayBtnText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "800",
  },
  addRecordBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    gap: 3,
  },
  addRecordBtnText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  smallActionBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 7,
  },
  smallActionBtnText: {
    color: "#FFFFFF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  complaintDesc: {
    fontSize: 11.5,
    lineHeight: 17,
    marginVertical: 6,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    marginBottom: 5,
    marginTop: 8,
  },
  staffChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  staffChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  modalFormInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
});
