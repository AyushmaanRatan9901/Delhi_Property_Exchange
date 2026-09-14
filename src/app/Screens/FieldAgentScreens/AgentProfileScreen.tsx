import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AgentQRCode,
  BankDetailsModal,
} from "../../../components/FieldAgentComponent";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";
import { API_BASE_URL } from "../../../Redux/api/apiConfig";
import { logout } from "../../../Redux/Auth/authActions";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";

export function AgentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);

  const [realUser, setRealUser] = useState<any>(reduxUser);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  // KYC States (Aadhaar & PAN)
  const [aadhaarDoc, setAadhaarDoc] = useState<string>(
    (reduxUser as any)?.kyc?.aadhaarDoc || (reduxUser as any)?.aadhaarCard || (reduxUser as any)?.documents?.aadhaar || ""
  );
  const [panDoc, setPanDoc] = useState<string>(
    (reduxUser as any)?.kyc?.panDoc || (reduxUser as any)?.panCard || (reduxUser as any)?.documents?.pan || ""
  );
  const [aadhaarNumber, setAadhaarNumber] = useState<string>(
    (reduxUser as any)?.kyc?.aadhaarNumber || (reduxUser as any)?.aadhaarNumber || ""
  );
  const [panNumber, setPanNumber] = useState<string>(
    (reduxUser as any)?.kyc?.panNumber || (reduxUser as any)?.panNumber || ""
  );
  const [isSavingKyc, setIsSavingKyc] = useState(false);

  // Fetch real profile from backend /auth/me
  const fetchRealProfile = useCallback(async () => {
    try {
      const res = await apiClient.get("/auth/me");
      if (res.data?.data) {
        setRealUser(res.data.data);
      }
    } catch (err) {
      console.log("[AgentProfileScreen] fetch profile error:", err);
    }
  }, []);

  useEffect(() => {
    fetchRealProfile();
  }, [fetchRealProfile]);

  // Sync KYC states when realUser loads
  useEffect(() => {
    if (realUser) {
      const aDoc = realUser.kyc?.aadhaarDoc || realUser.aadhaarCard || realUser.documents?.aadhaar;
      const pDoc = realUser.kyc?.panDoc || realUser.panCard || realUser.documents?.pan;
      const aNum = realUser.kyc?.aadhaarNumber || realUser.aadhaarNumber;
      const pNum = realUser.kyc?.panNumber || realUser.panNumber;

      if (aDoc) setAadhaarDoc(aDoc);
      if (pDoc) setPanDoc(pDoc);
      if (aNum) setAadhaarNumber(aNum);
      if (pNum) setPanNumber(pNum);
    }
  }, [realUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRealProfile();
    setRefreshing(false);
  };

  const currentUser = realUser || reduxUser || {};

  // Formatted Profile Data
  const displayName = currentUser.name || "Field Partner";
  const displayPhone = currentUser.phone
    ? `+91 ${currentUser.phone.replace(/\D/g, "").slice(-10)}`
    : "Phone Not Set";
  const displayEmail = currentUser.email || "No email registered";
  const displayStaffId =
    currentUser.staffId ||
    currentUser.recordCode ||
    currentUser.id ||
    currentUser._id ||
    "AGT-PENDING";
  const displayRole = (currentUser.role || "FIELD_AGENT")
    .replace(/_/g, " ")
    .toUpperCase();
  const displayLocality = currentUser.address?.city
    ? `${currentUser.address.street ? currentUser.address.street + ", " : ""}${currentUser.address.city}`
    : currentUser.address?.fullAddress || "Delhi NCR Region";
  const displayJoined = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Active";
  const displayAvatar =
    currentUser.profilePhoto ||
    currentUser.avatar ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  const bankDetails = {
    upiId: currentUser.bankDetails?.upiId || currentUser.upiId || "",
    accountHolder:
      currentUser.bankDetails?.accountHolder ||
      currentUser.bankDetails?.accountHolderName ||
      currentUser.name ||
      "",
    bankName: currentUser.bankDetails?.bankName || "",
    accountNumber: currentUser.bankDetails?.accountNumber || "",
    ifsc:
      currentUser.bankDetails?.ifsc || currentUser.bankDetails?.ifscCode || "",
  };

  const handleCopyId = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    Alert.alert("Staff / Agent ID", `Your ID: ${displayStaffId}`);
  };

  const handleUpdateBank = async (details: any) => {
    try {
      setIsLoading(true);
      const res = await apiClient.put("/auth/profile", {
        upiId: details.upiId,
        bankDetails: {
          upiId: details.upiId,
          accountHolder: details.accountHolder,
          accountHolderName: details.accountHolder,
          bankName: details.bankName,
          accountNumber: details.accountNumber,
          ifsc: details.ifsc,
          ifscCode: details.ifsc,
        },
      });

      if (res.data?.data) {
        setRealUser(res.data.data);
      }
      setIsBankModalVisible(false);
      // Alert.alert("Saved Successfully", "Your payout account details have been updated.");
    } catch (err: any) {
      Alert.alert(
        "Update Error",
        err.message || "Could not save payout details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Document Upload Handlers (Aadhaar & PAN)
  const handlePickDocument = async (type: "aadhaar" | "pan", source: "camera" | "gallery") => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Camera Permission Required",
            "Please allow camera access in your device settings to photograph your ID document."
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.85,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uri = result.assets[0].uri;
          if (type === "aadhaar") setAadhaarDoc(uri);
          else setPanDoc(uri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Gallery Permission Required",
            "Please allow media access in your device settings to select your document photo."
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [16, 10],
          quality: 0.85,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const uri = result.assets[0].uri;
          if (type === "aadhaar") setAadhaarDoc(uri);
          else setPanDoc(uri);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (err) {
      console.log("[AgentProfileScreen] document picker error:", err);
      Alert.alert("Picker Error", "Could not load selected document image.");
    }
  };

  const getDocUri = (uri?: string) => {
    if (!uri) return "";
    if (uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("file://")) {
      return uri;
    }
    const serverHost = API_BASE_URL.replace("/api/v1", "");
    return `${serverHost}${uri.startsWith("/") ? "" : "/"}${uri}`;
  };

  const uploadDocumentFile = async (localUri: string, docType: "aadhaar" | "pan"): Promise<string> => {
    if (localUri.startsWith("http://") || localUri.startsWith("https://") || localUri.startsWith("/uploads/")) {
      return localUri;
    }

    const formData = new FormData();
    const filename = localUri.split("/").pop() || `${docType}_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1].toLowerCase()}` : "image/jpeg";

    formData.append("document", {
      uri: localUri,
      name: filename,
      type,
    } as any);
    formData.append("docType", docType);

    const res = await apiClient.post("/auth/kyc/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (res.data?.data?.url) {
      return res.data.data.url;
    }
    return localUri;
  };

  const handleDocumentAction = (type: "aadhaar" | "pan") => {
    const isAadhaar = type === "aadhaar";
    const currentDoc = isAadhaar ? aadhaarDoc : panDoc;
    const title = isAadhaar ? t("profile.aadhaarCardTitle") : t("profile.panCardTitle");

    const buttons: any[] = [
      {
        text: t("profile.takePhoto"),
        onPress: () => handlePickDocument(type, "camera"),
      },
      {
        text: t("profile.chooseFromGallery"),
        onPress: () => handlePickDocument(type, "gallery"),
      },
    ];

    if (currentDoc) {
      buttons.push({
        text: "Remove Photo",
        style: "destructive",
        onPress: () => {
          if (isAadhaar) setAadhaarDoc("");
          else setPanDoc("");
        },
      });
    }

    buttons.push({ text: t("common.cancel"), style: "cancel" });

    Alert.alert(title, "Select photo source for verification document:", buttons);
  };

  const handleSaveKyc = async () => {
    if (!aadhaarDoc && !panDoc && !aadhaarNumber.trim() && !panNumber.trim()) {
      Alert.alert("No Changes", "Please upload Aadhaar or PAN card to save.");
      return;
    }

    try {
      setIsSavingKyc(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      let finalAadhaarUrl = aadhaarDoc;
      let finalPanUrl = panDoc;

      if (aadhaarDoc && (aadhaarDoc.startsWith("file://") || aadhaarDoc.startsWith("content://"))) {
        try {
          finalAadhaarUrl = await uploadDocumentFile(aadhaarDoc, "aadhaar");
          setAadhaarDoc(finalAadhaarUrl);
        } catch (uploadErr) {
          console.log("[AgentProfileScreen] Aadhaar upload error:", uploadErr);
        }
      }

      if (panDoc && (panDoc.startsWith("file://") || panDoc.startsWith("content://"))) {
        try {
          finalPanUrl = await uploadDocumentFile(panDoc, "pan");
          setPanDoc(finalPanUrl);
        } catch (uploadErr) {
          console.log("[AgentProfileScreen] PAN upload error:", uploadErr);
        }
      }

      const res = await apiClient.put("/auth/kyc", {
        aadhaarDoc: finalAadhaarUrl,
        panDoc: finalPanUrl,
        aadhaarNumber: aadhaarNumber.trim(),
        panNumber: panNumber.trim().toUpperCase(),
      });

      if (res.data?.data) {
        setRealUser(res.data.data);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t("profile.docUploadSuccess"),
        t("profile.kycSavedSuccess")
      );
    } catch (err: any) {
      Alert.alert(
        "KYC Update Failed",
        err.message || "Could not save verification documents."
      );
    } finally {
      setIsSavingKyc(false);
    }
  };

  const handleLogout = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out from Field Agent Panel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await dispatch(logout());
            router.replace("/(auth)/login" as any);
          },
        },
      ],
    );
  };

  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();

  // Theme Gradients
  const primaryGradient = isDark
    ? (["#14b8a6", "#0d9488"] as const)
    : (["#0d9488", "#0f766e"] as const);

  const purpleGradient = isDark
    ? (["#0f766e", "#115e59"] as const)
    : (["#0d9488", "#0f766e"] as const);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.background : "#F8FAFC" },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? colors.cardBackground : "#FFFFFF"}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 10) + 8,
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#F1F5F9",
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? colors.textPrimary : "#0F172A" },
          ]}
        >
          {t("profile.headerTitle")}
        </Text>
        {isLoading && <ActivityIndicator size="small" color="#0D9488" />}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0D9488"]}
          />
        }
      >
        {/* Agent ID Badge Card */}
        <LinearGradient
          colors={primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.idCard}
        >
          {/* Top Row: Official Badge Tag + Status */}
          <View style={styles.idTopRow}>
            <View style={styles.officialBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#FFFFFF" />
              <Text style={styles.officialBadgeText}>
                {t("fieldAgent.verifiedPartner")}
              </Text>
            </View>
            <View style={styles.statusPill}>
              <View style={styles.liveDot} />
              <Text style={styles.statusPillText}>
                {currentUser.isActive !== false ? "ACTIVE" : "PENDING"}
              </Text>
            </View>
          </View>

          {/* Main Info Row: Avatar + Agent Details + QR at Right */}
          <View style={styles.idMainRow}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: displayAvatar }} style={styles.avatar} />
              <View style={styles.verifiedCheckBadge}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.agentInfoBlock}>
              <Text style={styles.agentName} numberOfLines={1}>
                {displayName}
              </Text>
              <View style={styles.agentTierBadge}>
                <Text style={styles.agentTierText}>⭐ {displayRole}</Text>
              </View>
              <Text style={styles.agentJoined}>Reg: {displayJoined}</Text>
            </View>

            {/* QR Code Container at Right Side */}
            <View style={styles.qrBox}>
              <AgentQRCode
                value={displayStaffId}
                size={60}
                color="#0F766E"
                backgroundColor="#FFFFFF"
              />
              <Text style={styles.qrScanText}>{t("fieldAgent.scanId")}</Text>
            </View>
          </View>

          <View style={styles.idDivider} />

          {/* Bottom Row: Staff ID & Copy button */}
          <View style={styles.idBottomRow}>
            <View>
              <Text style={styles.idLabel}>{t("fieldAgent.uniqueId")}</Text>
              <Text style={styles.idNumber}>{displayStaffId}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopyId}
              style={styles.copyIdBtn}
            >
              <Feather name="copy" size={13} color="#FFFFFF" />
              <Text style={styles.copyIdText}>{t("fieldAgent.copyId")}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Real Contact Information */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <Text
            style={[
              styles.cardHeader,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
          >
            {t("profile.personalDetails")}
          </Text>
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {t("profile.mobilePhone")}
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {displayPhone}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {t("profile.emailAddress")}
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {displayEmail}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {t("profile.assignedTerritory")}
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {displayLocality}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              {t("profile.accountStatus")}
            </Text>
            <View
              style={[
                styles.verifiedTag,
                isDark && { backgroundColor: "rgba(5, 150, 105, 0.2)" },
              ]}
            >
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text
                style={[styles.verifiedTagText, isDark && { color: "#34D399" }]}
              >
                {currentUser.isActive !== false
                  ? t("profile.activeVerified")
                  : t("profile.underReview")}
              </Text>
            </View>
          </View>
        </View>

        {/* Real Bank & UPI Payout Info */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.cardHeaderWithAction}>
            <Text
              style={[
                styles.cardHeader,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {t("profile.payoutAccountDetails")}
            </Text>
            <TouchableOpacity onPress={() => setIsBankModalVisible(true)}>
              <Text
                style={[styles.editActionText, isDark && { color: "#2dd4bf" }]}
              >
                {bankDetails.upiId ||
                bankDetails.accountNumber ||
                bankDetails.bankName
                  ? "Update"
                  : "+ Add"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              UPI ID (Instant)
            </Text>
            <Text style={[styles.valHighlight, isDark && { color: "#2dd4bf" }]}>
              {bankDetails.upiId || "Not Linked"}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              Bank Name
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {bankDetails.bankName || "Not Linked"}
            </Text>
          </View>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <View style={styles.row}>
            <Text
              style={[
                styles.label,
                { color: isDark ? colors.textMuted : "#64748B" },
              ]}
            >
              Account Number
            </Text>
            <Text
              style={[
                styles.val,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
            >
              {bankDetails.accountNumber
                ? `•••• ${String(bankDetails.accountNumber).slice(-4)}`
                : "Not Linked"}
            </Text>
          </View>
          {bankDetails.ifsc ? (
            <>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: isDark ? colors.border : "#F1F5F9" },
                ]}
              />
              <View style={styles.row}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.textMuted : "#64748B" },
                  ]}
                >
                  IFSC Code
                </Text>
                <Text
                  style={[
                    styles.val,
                    { color: isDark ? colors.textPrimary : "#0F172A" },
                  ]}
                >
                  {bankDetails.ifsc}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* KYC & Identity Verification Section */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <View style={styles.cardHeaderWithAction}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={isDark ? "#2DD4BF" : "#0D9488"}
                />
                <Text
                  style={[
                    styles.cardHeader,
                    { color: isDark ? colors.textPrimary : "#0F172A", marginBottom: 0 },
                  ]}
                >
                  {t("profile.kycSectionTitle")}
                </Text>
              </View>
              <Text
                style={[
                  styles.kycSub,
                  { color: isDark ? colors.textMuted : "#64748B" },
                ]}
              >
                {t("profile.kycSectionSub")}
              </Text>
            </View>
          </View>

          {/* Documents Cards */}
          <View style={styles.kycGrid}>
            {/* 1. Aadhaar Card Card */}
            <View
              style={[
                styles.kycDocCard,
                {
                  backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              <View style={styles.kycDocTopRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <View
                    style={[
                      styles.kycIconBox,
                      { backgroundColor: isDark ? "#082F2C" : "#E6FFFA" },
                    ]}
                  >
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={isDark ? "#2DD4BF" : "#0D9488"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.kycDocTitle,
                        { color: isDark ? colors.textPrimary : "#0F172A" },
                      ]}
                    >
                      {t("profile.aadhaarCardTitle")}
                    </Text>
                    <Text
                      style={[
                        styles.kycDocSub,
                        { color: isDark ? colors.textMuted : "#64748B" },
                      ]}
                    >
                      {t("profile.aadhaarCardSub")}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.kycStatusBadge,
                    aadhaarDoc
                      ? {
                          backgroundColor: isDark ? "rgba(5, 150, 105, 0.2)" : "#DCFCE7",
                          borderColor: isDark ? "#065F46" : "#86EFAC",
                        }
                      : {
                          backgroundColor: isDark ? "rgba(100, 116, 139, 0.2)" : "#F1F5F9",
                          borderColor: isDark ? "#334155" : "#CBD5E1",
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.kycStatusBadgeText,
                      aadhaarDoc
                        ? { color: isDark ? "#34D399" : "#16A34A" }
                        : { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    {aadhaarDoc ? t("profile.underReviewBadge") : t("profile.notUploadedBadge")}
                  </Text>
                </View>
              </View>

              {/* Aadhaar Preview or Upload Area */}
              {aadhaarDoc ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: getDocUri(aadhaarDoc) }} style={styles.docImagePreview} resizeMode="cover" />
                  <View style={styles.previewActionOverlay}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleDocumentAction("aadhaar")}
                      style={styles.reuploadPill}
                    >
                      <Feather name="refresh-cw" size={12} color="#FFFFFF" />
                      <Text style={styles.reuploadPillText}>{t("profile.changeDoc")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleDocumentAction("aadhaar")}
                  style={[
                    styles.uploadPlaceholder,
                    {
                      backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                      borderColor: isDark ? colors.border : "#CBD5E1",
                    },
                  ]}
                >
                  <Ionicons name="cloud-upload-outline" size={24} color={isDark ? "#2DD4BF" : "#0D9488"} />
                  <Text
                    style={[
                      styles.uploadPlaceholderText,
                      { color: isDark ? "#2DD4BF" : "#0D9488" },
                    ]}
                  >
                    {t("profile.uploadDoc")}
                  </Text>
                  <Text
                    style={[
                      styles.uploadPlaceholderSub,
                      { color: isDark ? colors.textMuted : "#94A3B8" },
                    ]}
                  >
                    JPG, PNG • Max 5MB
                  </Text>
                </TouchableOpacity>
              )}

              {/* Aadhaar Number Input */}
              <View style={styles.docInputContainer}>
                <Text
                  style={[
                    styles.docInputLabel,
                    { color: isDark ? colors.textMuted : "#64748B" },
                  ]}
                >
                  {t("profile.aadhaarNumber")}
                </Text>
                <TextInput
                  value={aadhaarNumber}
                  onChangeText={setAadhaarNumber}
                  placeholder={t("profile.enterAadhaarPlaceholder")}
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  keyboardType="numeric"
                  maxLength={16}
                  style={[
                    styles.docTextInput,
                    {
                      backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                      color: isDark ? colors.textPrimary : "#0F172A",
                    },
                  ]}
                />
              </View>
            </View>

            {/* 2. PAN Card Card */}
            <View
              style={[
                styles.kycDocCard,
                {
                  backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              <View style={styles.kycDocTopRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                  <View
                    style={[
                      styles.kycIconBox,
                      { backgroundColor: isDark ? "#082F2C" : "#E6FFFA" },
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={isDark ? "#2DD4BF" : "#0D9488"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.kycDocTitle,
                        { color: isDark ? colors.textPrimary : "#0F172A" },
                      ]}
                    >
                      {t("profile.panCardTitle")}
                    </Text>
                    <Text
                      style={[
                        styles.kycDocSub,
                        { color: isDark ? colors.textMuted : "#64748B" },
                      ]}
                    >
                      {t("profile.panCardSub")}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.kycStatusBadge,
                    panDoc
                      ? {
                          backgroundColor: isDark ? "rgba(5, 150, 105, 0.2)" : "#DCFCE7",
                          borderColor: isDark ? "#065F46" : "#86EFAC",
                        }
                      : {
                          backgroundColor: isDark ? "rgba(100, 116, 139, 0.2)" : "#F1F5F9",
                          borderColor: isDark ? "#334155" : "#CBD5E1",
                        },
                  ]}
                >
                  <Text
                    style={[
                      styles.kycStatusBadgeText,
                      panDoc
                        ? { color: isDark ? "#34D399" : "#16A34A" }
                        : { color: isDark ? "#94A3B8" : "#64748B" },
                    ]}
                  >
                    {panDoc ? t("profile.underReviewBadge") : t("profile.notUploadedBadge")}
                  </Text>
                </View>
              </View>

              {/* PAN Preview or Upload Area */}
              {panDoc ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: getDocUri(panDoc) }} style={styles.docImagePreview} resizeMode="cover" />
                  <View style={styles.previewActionOverlay}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleDocumentAction("pan")}
                      style={styles.reuploadPill}
                    >
                      <Feather name="refresh-cw" size={12} color="#FFFFFF" />
                      <Text style={styles.reuploadPillText}>{t("profile.changeDoc")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleDocumentAction("pan")}
                  style={[
                    styles.uploadPlaceholder,
                    {
                      backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                      borderColor: isDark ? colors.border : "#CBD5E1",
                    },
                  ]}
                >
                  <Ionicons name="cloud-upload-outline" size={24} color={isDark ? "#2DD4BF" : "#0D9488"} />
                  <Text
                    style={[
                      styles.uploadPlaceholderText,
                      { color: isDark ? "#2DD4BF" : "#0D9488" },
                    ]}
                  >
                    {t("profile.uploadDoc")}
                  </Text>
                  <Text
                    style={[
                      styles.uploadPlaceholderSub,
                      { color: isDark ? colors.textMuted : "#94A3B8" },
                    ]}
                  >
                    JPG, PNG • Max 5MB
                  </Text>
                </TouchableOpacity>
              )}

              {/* PAN Number Input */}
              <View style={styles.docInputContainer}>
                <Text
                  style={[
                    styles.docInputLabel,
                    { color: isDark ? colors.textMuted : "#64748B" },
                  ]}
                >
                  {t("profile.panNumber")}
                </Text>
                <TextInput
                  value={panNumber}
                  onChangeText={(text) => setPanNumber(text.toUpperCase())}
                  placeholder={t("profile.enterPanPlaceholder")}
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  autoCapitalize="characters"
                  maxLength={10}
                  style={[
                    styles.docTextInput,
                    {
                      backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                      color: isDark ? colors.textPrimary : "#0F172A",
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Save KYC Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSaveKyc}
            disabled={isSavingKyc}
            style={[
              styles.saveKycBtn,
              { backgroundColor: isDark ? "#0D9488" : "#0F766E" },
            ]}
          >
            {isSavingKyc ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={17} color="#FFFFFF" />
                <Text style={styles.saveKycBtnText}>{t("profile.saveKycBtn")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Security & Access Notice */}
        <View
          style={[
            styles.securityBox,
            isDark && {
              backgroundColor: "rgba(13, 148, 136, 0.15)",
              borderColor: "rgba(13, 148, 136, 0.3)",
            },
          ]}
        >
          <Feather
            name="shield"
            size={18}
            color={isDark ? "#2dd4bf" : "#0F766E"}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.securityTitle, isDark && { color: "#2dd4bf" }]}
            >
              {t("profile.partnerPrivacySecurity")}
            </Text>
            <Text style={[styles.securityDesc, isDark && { color: "#99F6E4" }]}>
              • You can only view leads personally submitted by you.{"\n"}•
              Owner contact numbers are automatically masked once submitted to
              protect privacy.{"\n"}• Commission payouts are credited directly
              to your registered UPI / Bank account.
            </Text>
          </View>
        </View>

        {/* Support & Helpline */}
        <View
          style={[
            styles.cardSection,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <Text
            style={[
              styles.cardHeader,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
          >
            {t("profile.supportHeader")}
          </Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "WhatsApp Support",
                "Connecting to Field Coordinator on WhatsApp...",
              )
            }
            style={styles.supportRow}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
            <Text
              style={[
                styles.supportText,
                { color: isDark ? colors.textSecondary : "#334155" },
              ]}
            >
              {t("profile.chatWithCoordinator")}
            </Text>
            <Feather
              name="chevron-right"
              size={16}
              color={isDark ? colors.textMuted : "#94A3B8"}
            />
          </TouchableOpacity>
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          />
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Agent Helpline",
                "Toll-free Agent Helpline: 1800-419-8800",
              )
            }
            style={styles.supportRow}
          >
            <Feather
              name="phone-call"
              size={17}
              color={isDark ? "#2dd4bf" : "#0D9488"}
            />
            <Text
              style={[
                styles.supportText,
                { color: isDark ? colors.textSecondary : "#334155" },
              ]}
            >
              {t("profile.agentPriorityHelpline")}
            </Text>
            <Feather
              name="chevron-right"
              size={16}
              color={isDark ? colors.textMuted : "#94A3B8"}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogout}
          style={[
            styles.logoutBtn,
            isDark && {
              backgroundColor: "rgba(220, 38, 38, 0.15)",
              borderColor: "rgba(220, 38, 38, 0.3)",
            },
          ]}
        >
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={[styles.logoutBtnText, isDark && { color: "#F87171" }]}>
            {t("profile.logoutBtn")}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bank Modal */}
      <BankDetailsModal
        visible={isBankModalVisible}
        onClose={() => setIsBankModalVisible(false)}
        bankDetails={bankDetails}
        onSave={handleUpdateBank}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  idCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
  idTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  officialBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  officialBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.92)",
    letterSpacing: 0.8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4ADE80",
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  idMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  verifiedCheckBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    backgroundColor: "#059669",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  agentInfoBlock: {
    flex: 1,
    justifyContent: "center",
  },
  agentName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  agentTierBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  agentTierText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  agentJoined: {
    fontSize: 10.5,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 3,
    fontWeight: "500",
  },
  qrBox: {
    backgroundColor: "#FFFFFF",
    padding: 5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  qrScanText: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#0F766E",
    marginTop: 3,
    letterSpacing: 0.5,
  },
  idDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    marginVertical: 14,
  },
  idBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  idLabel: {
    fontSize: 9.5,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  idNumber: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  copyIdBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  copyIdText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  cardHeaderWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editActionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0D9488",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  label: {
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "600",
  },
  val: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    maxWidth: "60%",
    textAlign: "right",
  },
  valHighlight: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0D9488",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 8,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#16A34A",
  },
  securityBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDFA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F766E",
    marginBottom: 4,
  },
  securityDesc: {
    fontSize: 11.5,
    color: "#0F766E",
    lineHeight: 16,
  },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  supportText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1.2,
    borderColor: "#FEE2E2",
    height: 50,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },
  kycSub: {
    fontSize: 11.5,
    marginTop: 2,
    fontWeight: "500",
  },
  kycGrid: {
    gap: 14,
    marginTop: 14,
  },
  kycDocCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  kycDocTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kycIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  kycDocTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  kycDocSub: {
    fontSize: 10.5,
    fontWeight: "500",
  },
  kycStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  kycStatusBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  previewContainer: {
    height: 120,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    marginVertical: 6,
  },
  docImagePreview: {
    width: "100%",
    height: "100%",
  },
  previewActionOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  reuploadPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  reuploadPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  uploadPlaceholder: {
    height: 96,
    borderRadius: 10,
    borderWidth: 1.2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
    gap: 4,
  },
  uploadPlaceholderText: {
    fontSize: 12,
    fontWeight: "700",
  },
  uploadPlaceholderSub: {
    fontSize: 10,
    fontWeight: "500",
  },
  docInputContainer: {
    marginTop: 8,
  },
  docInputLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  docTextInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  saveKycBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    borderRadius: 14,
    marginTop: 14,
    gap: 8,
  },
  saveKycBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },
});
