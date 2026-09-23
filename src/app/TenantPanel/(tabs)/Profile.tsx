import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { useResponsiveTheme } from "../../../constants/theme";
import { useTenant } from "../../../constants/tenantData";
import { API_BASE_URL } from "../../../Redux/api/apiConfig";
import { logout } from "../../../Redux/Auth/authActions";
import { TenantEditProfileModal } from "../../../components/TenantComponent/TenantEditProfileModal";
import { TenantProfileSkeleton } from "../../../components/TenantComponent/TenantSkeleton";

export default function ProfileScreen() {
  const { colors, isDark } = useResponsiveTheme();
  const { profile, property, isLoading, updateProfile } = useTenant();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [waNotif, setWaNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);

  const getDocUri = (uri?: string) => {
    if (!uri) return "";
    if (uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("file://") || uri.startsWith("data:")) {
      return uri;
    }
    const serverHost = API_BASE_URL.replace("/api/v1", "");
    return `${serverHost}${uri.startsWith("/") ? "" : "/"}${uri}`;
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of Delhi Property Exchange?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          (dispatch as any)(logout());
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const renderAadhaarStatusBadge = () => {
    const status = profile?.aadhaarStatus || (profile?.aadhaarDoc ? "UNDER_REVIEW" : "NOT_UPLOADED");
    switch (status) {
      case "VERIFIED":
        return (
          <View style={[styles.kycStatusBadge, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
            <Ionicons name="shield-checkmark" size={12} color="#10B981" />
            <Text style={[styles.kycStatusText, { color: "#065F46" }]}>VERIFIED</Text>
          </View>
        );
      case "UNDER_REVIEW":
        return (
          <View style={[styles.kycStatusBadge, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
            <Ionicons name="time-outline" size={12} color="#D97706" />
            <Text style={[styles.kycStatusText, { color: "#92400E" }]}>UNDER REVIEW</Text>
          </View>
        );
      case "REJECTED":
        return (
          <View style={[styles.kycStatusBadge, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
            <Ionicons name="alert-circle" size={12} color="#EF4444" />
            <Text style={[styles.kycStatusText, { color: "#991B1B" }]}>REJECTED</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.kycStatusBadge, { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" }]}>
            <Ionicons name="cloud-upload-outline" size={12} color="#64748B" />
            <Text style={[styles.kycStatusText, { color: "#475569" }]}>PENDING UPLOAD</Text>
          </View>
        );
    }
  };

  if (isLoading) {
    return <TenantProfileSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF" }]}>
        <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
          Tenant Account
        </Text>
        <TouchableOpacity
          style={styles.editHeaderBtn}
          onPress={() => setIsEditModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
          <View style={styles.avatarSection}>
            <Image
              source={{ uri: profile?.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" }}
              style={styles.avatar}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
            </View>
          </View>

          <Text style={[styles.nameText, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            {profile?.name || "Tenant"}
          </Text>
          <Text style={[styles.roleBadge, { backgroundColor: isDark ? "rgba(99,102,241,0.2)" : "#EEF2FF", color: "#6366F1" }]}>
            {profile?.verificationStatus === "VERIFIED" ? "VERIFIED TENANT" : "TENANT PROFILE"}
          </Text>

          {/* Contact Details with Immutable Badges */}
          <View style={styles.contactRow}>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={14} color={isDark ? colors.textMuted : "#64748B"} />
              <Text style={[styles.contactText, { color: isDark ? colors.textMuted : "#64748B" }]}>
                {profile?.phone || "N/A"}
              </Text>
              <Ionicons name="lock-closed" size={10} color={isDark ? "#94A3B8" : "#94A3B8"} />
            </View>
            <View style={styles.contactDot} />
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={14} color={isDark ? colors.textMuted : "#64748B"} />
              <Text style={[styles.contactText, { color: isDark ? colors.textMuted : "#64748B" }]}>
                {profile?.email || "N/A"}
              </Text>
              <Ionicons name="lock-closed" size={10} color={isDark ? "#94A3B8" : "#94A3B8"} />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editProfileBtn, { borderColor: isDark ? colors.border : "#E2E8F0" }]}
            onPress={() => setIsEditModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={14} color="#6366F1" />
            <Text style={styles.editProfileBtnText}>Edit Profile & KYC</Text>
          </TouchableOpacity>
        </View>

        {/* Aadhaar Card Verification Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Identity & KYC (Aadhaar)
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <View style={styles.kycCardHeader}>
              <View style={styles.kycIconBox}>
                <Ionicons name="card" size={20} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.kycCardTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                  Aadhaar Card Identification
                </Text>
                <Text style={[styles.kycCardSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                  {profile?.aadhaarNumber ? `UIDAI: ${profile.aadhaarNumber}` : "Government ID required for verification"}
                </Text>
              </View>
              {renderAadhaarStatusBadge()}
            </View>

            {profile?.aadhaarDoc ? (
              <View style={styles.aadhaarPreviewWrap}>
                <Image
                  source={{ uri: getDocUri(profile.aadhaarDoc) }}
                  style={styles.aadhaarThumb}
                  resizeMode="cover"
                />
                <View style={styles.aadhaarDocInfo}>
                  <Text style={[styles.aadhaarDocStatus, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                    Document Attached
                  </Text>
                  <Text style={[styles.aadhaarDocDetail, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    Encrypted and stored in government KYC vault
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.updateAadhaarSmallBtn}
                  onPress={() => setIsEditModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cloud-upload" size={14} color="#6366F1" />
                  <Text style={styles.updateAadhaarSmallBtnText}>Update</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.uploadAadhaarPrompt,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                  },
                ]}
                onPress={() => setIsEditModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload" size={22} color="#6366F1" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.uploadPromptTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                    Upload your Aadhaar Card photo
                  </Text>
                  <Text style={[styles.uploadPromptSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    Required for agreement generation & background compliance
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6366F1" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tenancy Terms Card */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Tenancy Terms & Lock-in
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <View style={styles.lockHeader}>
              <Ionicons name="shield-checkmark" size={18} color="#10B981" />
              <Text style={[styles.lockTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                {property ? "Verified Contract Terms" : "No Active Lease"}
              </Text>
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={11} color="#64748B" />
                <Text style={styles.lockedText}>LOCKED</Text>
              </View>
            </View>

            {property ? (
              <View style={styles.termsGrid}>
                <View style={styles.termItem}>
                  <Text style={[styles.termLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Agreement Start</Text>
                  <Text style={[styles.termVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                    {property.leaseStartDate
                      ? new Date(property.leaseStartDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                      : "Active"}
                  </Text>
                </View>

                <View style={styles.termItem}>
                  <Text style={[styles.termLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Agreement Number</Text>
                  <Text style={[styles.termVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                    {property.agreementNumber || "AGR-PENDING"}
                  </Text>
                </View>

                <View style={styles.termItem}>
                  <Text style={[styles.termLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Rent Cycle</Text>
                  <Text style={[styles.termVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>Monthly (1st to 5th)</Text>
                </View>

                <View style={styles.termItem}>
                  <Text style={[styles.termLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Lock-in Period</Text>
                  <Text style={[styles.termVal, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                    {property.leaseDurationMonths || 11} Months
                  </Text>
                </View>

                <View style={styles.termItem}>
                  <Text style={[styles.termLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Monthly Rent</Text>
                  <Text style={[styles.termVal, { color: "#6366F1" }]}>
                    ₹{(property.rentAmount || 0).toLocaleString("en-IN")}
                  </Text>
                </View>

                <View style={styles.termItem}>
                  <Text style={[styles.termLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Security Deposit</Text>
                  <Text style={[styles.termVal, { color: "#10B981" }]}>
                    ₹{(property.securityDeposit || 0).toLocaleString("en-IN")} (Held)
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noPropertyTerms}>
                <Ionicons name="home-outline" size={24} color={isDark ? colors.textMuted : "#94A3B8"} />
                <Text style={[styles.noPropertyText, { color: isDark ? colors.textMuted : "#64748B" }]}>
                  You do not currently have an active property lease agreement assigned to your profile.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Emergency Contact
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" }]}>
            <View style={styles.emergencyRow}>
              <View style={styles.emergencyIcon}>
                <Ionicons name="people" size={20} color="#6366F1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.emergencyName, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                  {profile?.emergencyContact?.name || "Not Added Yet"}
                </Text>
                <Text style={[styles.emergencyRelation, { color: isDark ? colors.textMuted : "#64748B" }]}>
                  {profile?.emergencyContact?.name
                    ? `${profile.emergencyContact.relation || "Contact"} • ${profile.emergencyContact.phone || "No phone"}`
                    : "Tap pencil to add emergency guardian"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.emergencyEditBtn}
                onPress={() => setIsEditModalVisible(true)}
              >
                <Ionicons name="create-outline" size={16} color="#6366F1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Navigations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Services & Records
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0", padding: 0 }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/TenantPanel/documents" as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: "#EEF2FF" }]}>
                <Ionicons name="document-text" size={18} color="#6366F1" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>Tenancy Documents & KYC</Text>
                <Text style={[styles.menuSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>Agreements, ID verification, receipts</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? colors.textMuted : "#94A3B8"} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.border : "#F1F5F9" }]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/TenantPanel/inspections" as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="shield-checkmark" size={18} color="#10B981" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>Property Inspections</Text>
                <Text style={[styles.menuSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>Condition logs, move-in scorecards</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? colors.textMuted : "#94A3B8"} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.border : "#F1F5F9" }]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/TenantPanel/roomChange" as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: "#FFF7ED" }]}>
                <Ionicons name="swap-horizontal" size={18} color="#EA580C" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>Room / Unit Change</Text>
                <Text style={[styles.menuSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>Apply for room upgrade or transfer</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? colors.textMuted : "#94A3B8"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences & App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Preferences & Settings
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0", padding: 0 }]}>
            <View style={styles.menuItem}>
              <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="notifications" size={18} color="#2563EB" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>Push Notifications</Text>
                <Text style={[styles.menuSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>Reminders, notices, and updates</Text>
              </View>
              <Switch
                value={pushNotif}
                onValueChange={setPushNotif}
                trackColor={{ false: "#E2E8F0", true: "#6366F1" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.border : "#F1F5F9" }]} />

            <View style={styles.menuItem}>
              <View style={[styles.menuIconBox, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="logo-whatsapp" size={18} color="#10B981" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>WhatsApp Alerts</Text>
                <Text style={[styles.menuSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>Direct receipts and bill links</Text>
              </View>
              <Switch
                value={waNotif}
                onValueChange={setWaNotif}
                trackColor={{ false: "#E2E8F0", true: "#10B981" }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.border : "#F1F5F9" }]} />

            <View style={styles.menuItem}>
              <View style={[styles.menuIconBox, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="mail" size={18} color="#D97706" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>Email Receipts</Text>
                <Text style={[styles.menuSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>Automated payment copies</Text>
              </View>
              <Switch
                value={emailNotif}
                onValueChange={setEmailNotif}
                trackColor={{ false: "#E2E8F0", true: "#D97706" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Support & Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Support & Privacy
          </Text>
          <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0", padding: 0 }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert("Privacy Policy", "Delhi Property Exchange strictly protects tenant privacy and safeguards sensitive personal and lease records under Indian IT Act regulations.")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: "#F1F5F9" }]}>
                <Ionicons name="shield-outline" size={18} color="#475569" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? colors.textMuted : "#94A3B8"} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.border : "#F1F5F9" }]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert("Tenancy Guidelines", "Standard tenancy terms apply as registered in your digital lease. For landlord communications, please raise a ticket via the Complaints tab.")}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: "#F1F5F9" }]}>
                <Ionicons name="information-circle-outline" size={18} color="#475569" />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>Tenancy Rules & Conduct</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDark ? colors.textMuted : "#94A3B8"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: isDark ? colors.textMuted : "#94A3B8" }]}>
          Delhi Property Exchange • Tenant v2.4.0
        </Text>
      </ScrollView>

      {/* Edit Profile Modal */}
      <TenantEditProfileModal
        visible={isEditModalVisible}
        profile={profile}
        onClose={() => setIsEditModalVisible(false)}
        onSave={updateProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  editHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  avatarSection: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#10B981",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nameText: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: "700",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contactDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#94A3B8",
  },
  contactText: {
    fontSize: 12,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366F1",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  kycCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  kycIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  kycCardTitle: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  kycCardSub: {
    fontSize: 11,
    marginTop: 1,
  },
  kycStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3,
  },
  kycStatusText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  aadhaarPreviewWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    gap: 10,
  },
  aadhaarThumb: {
    width: 50,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#0F172A",
  },
  aadhaarDocInfo: {
    flex: 1,
  },
  aadhaarDocStatus: {
    fontSize: 12,
    fontWeight: "700",
  },
  aadhaarDocDetail: {
    fontSize: 10.5,
    marginTop: 1,
  },
  updateAadhaarSmallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  updateAadhaarSmallBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6366F1",
  },
  uploadAadhaarPrompt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  uploadPromptTitle: {
    fontSize: 12.5,
    fontWeight: "700",
  },
  uploadPromptSub: {
    fontSize: 10.5,
    marginTop: 2,
  },
  lockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  lockTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 3,
  },
  lockedText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
  },
  termsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  termItem: {
    width: "50%",
  },
  termLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  termVal: {
    fontSize: 13,
    fontWeight: "700",
  },
  noPropertyTerms: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  noPropertyText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
  emergencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  emergencyName: {
    fontSize: 14,
    fontWeight: "700",
  },
  emergencyRelation: {
    fontSize: 12,
    marginTop: 2,
  },
  emergencyEditBtn: {
    padding: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    marginLeft: 62,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
  versionText: {
    textAlign: "center",
    fontSize: 11,
    marginBottom: 20,
  },
});
