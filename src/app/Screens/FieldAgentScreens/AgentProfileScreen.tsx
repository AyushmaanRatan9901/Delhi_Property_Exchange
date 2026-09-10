import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BankDetailsModal } from "../../../components/FieldAgentComponent";
import { useFieldAgent } from "../../../constants/fieldAgentData";
import { useAppDispatch } from "../../../Redux/hooks";
import { logout } from "../../../Redux/Auth/authActions";

export function AgentProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { agentProfile, updateBankDetails } = useFieldAgent();

  const [isBankModalVisible, setIsBankModalVisible] = useState(false);

  const handleCopyId = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    Alert.alert("Agent ID Copied", `Agent ID ${agentProfile.id} copied to clipboard.`);
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
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Field Agent Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Agent ID Badge Card */}
        <View style={styles.idCard}>
          <View style={styles.idTopRow}>
            <Image source={{ uri: agentProfile.avatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.agentName}>{agentProfile.name}</Text>
                <Ionicons name="checkmark-circle" size={16} color="#0D9488" />
              </View>
              <Text style={styles.agentTierText}>⭐ {agentProfile.tier}</Text>
              <Text style={styles.agentJoined}>Partner since {agentProfile.joinedDate}</Text>
            </View>
          </View>

          <View style={styles.idDivider} />

          <View style={styles.idBottomRow}>
            <View>
              <Text style={styles.idLabel}>UNIQUE AGENT ID</Text>
              <Text style={styles.idNumber}>{agentProfile.id}</Text>
            </View>

            <TouchableOpacity onPress={handleCopyId} style={styles.copyIdBtn}>
              <Feather name="copy" size={14} color="#0D9488" />
              <Text style={styles.copyIdText}>Copy ID</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.cardSection}>
          <Text style={styles.cardHeader}>Personal Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Mobile Phone</Text>
            <Text style={styles.val}>{agentProfile.phone}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.val}>{agentProfile.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Assigned Territory</Text>
            <Text style={styles.val}>{agentProfile.assignedLocality}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>KYC Verification</Text>
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={14} color="#059669" />
              <Text style={styles.verifiedTagText}>Verified (Aadhaar/PAN)</Text>
            </View>
          </View>
        </View>

        {/* Bank & UPI Payout Info */}
        <View style={styles.cardSection}>
          <View style={styles.cardHeaderWithAction}>
            <Text style={styles.cardHeader}>Payout Account Details</Text>
            <TouchableOpacity onPress={() => setIsBankModalVisible(true)}>
              <Text style={styles.editActionText}>Update</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>UPI ID (Instant)</Text>
            <Text style={styles.valHighlight}>{agentProfile.bankDetails.upiId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Bank Name</Text>
            <Text style={styles.val}>{agentProfile.bankDetails.bankName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.val}>{agentProfile.bankDetails.accountNumber}</Text>
          </View>
        </View>

        {/* Security & Access Notice */}
        <View style={styles.securityBox}>
          <Feather name="shield" size={18} color="#0F766E" />
          <View style={{ flex: 1 }}>
            <Text style={styles.securityTitle}>Partner Mode Data Policy</Text>
            <Text style={styles.securityDesc}>
              • You can only view leads personally submitted by you.\n• Owner & tenant contact numbers are auto-masked once submitted to safeguard privacy.\n• Direct commission is calculated and disbursed automatically.
            </Text>
          </View>
        </View>

        {/* Support & Helpline */}
        <View style={styles.cardSection}>
          <Text style={styles.cardHeader}>Field Agent Support</Text>
          <TouchableOpacity
            onPress={() => Alert.alert("WhatsApp Support", "Connecting to Field Ops Manager on WhatsApp...")}
            style={styles.supportRow}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
            <Text style={styles.supportText}>Chat with Field Coordinator</Text>
            <Feather name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => Alert.alert("Agent Helpline", "Toll-free Field Agent Helpline: 1800-419-8800")}
            style={styles.supportRow}
          >
            <Feather name="phone-call" size={17} color="#0D9488" />
            <Text style={styles.supportText}>Agent Priority Helpline (Toll-Free)</Text>
            <Feather name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <Feather name="log-out" size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Log Out from Agent Portal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bank Modal */}
      <BankDetailsModal
        visible={isBankModalVisible}
        onClose={() => setIsBankModalVisible(false)}
        bankDetails={agentProfile.bankDetails}
        onSave={updateBankDetails}
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  idCard: {
    backgroundColor: "#0F766E",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  idTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
  },
  agentName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  agentTierText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FEF08A",
    marginTop: 2,
  },
  agentJoined: {
    fontSize: 11,
    color: "#CCFBF1",
    marginTop: 2,
  },
  idDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 14,
  },
  idBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  idLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 0.5,
  },
  idNumber: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  copyIdBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  copyIdText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F766E",
  },
  cardSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  cardHeaderWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  editActionText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0D9488",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
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
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 4,
  },
  securityBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 14,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F766E",
  },
  securityDesc: {
    fontSize: 11.5,
    color: "#0D9488",
    marginTop: 4,
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
    fontWeight: "700",
    color: "#334155",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1.2,
    borderColor: "#FECACA",
    height: 50,
    borderRadius: 16,
    marginTop: 8,
    gap: 8,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
  },
});
