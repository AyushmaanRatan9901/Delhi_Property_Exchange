import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSelector, useDispatch } from "react-redux";
import { useResponsiveTheme } from "../../../constants/theme";
import { logout } from "../../../Redux/Auth/authActions";

export default function VerificationStaffProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  const { colors, isDark } = useResponsiveTheme();

  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  const user = useSelector((state: any) => state.auth?.user) || {
    name: "Verification Officer",
    email: "staff@delhiexchange.com",
    phone: "+91 98765 43210",
    staffId: "VS-DEL-2026",
    role: "verification_staff",
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out of Verification Staff App?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          dispatch(logout() as any);
          router.replace("/(auth)/LoginScreen" as any);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        style={[styles.header, { paddingTop: Math.max(insets.top + 10, 36) }]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.badgeText}>STAFF IDENTITY & CREDENTIALS</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutIconBtn}>
            <Feather name="log-out" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80" }}
              style={styles.avatarImage}
            />
            <View style={styles.avatarVerifiedPin}>
              <Feather name="check" size={10} color="#FFFFFF" />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user.name || "Verification Staff"}</Text>
            <Text style={styles.profileRole}>Field Verification Officer</Text>
            <View style={styles.staffIdBadge}>
              <Text style={styles.staffIdText}>ID: {user.staffId || "VS-2026-981"}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Performance Metrics */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>On-Ground Performance</Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: "#0D9488" }]}>98.6%</Text>
              <Text style={[styles.metricLbl, { color: textSecondary }]}>Audit Accuracy</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: "#10B981" }]}>42</Text>
              <Text style={[styles.metricLbl, { color: textSecondary }]}>KYC Verified</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricVal, { color: "#3B82F6" }]}>35m</Text>
              <Text style={[styles.metricLbl, { color: textSecondary }]}>Avg Visit Time</Text>
            </View>
          </View>
        </View>

        {/* Access Rights & Security Policies */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Operational Access & Privacy</Text>

          <View style={styles.policyRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.policyText, { color: textSecondary }]}>Full on-ground access during assigned verification</Text>
          </View>
          <View style={styles.policyRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={[styles.policyText, { color: textSecondary }]}>Media capture & instant KYC duplicate Aadhaar check</Text>
          </View>
          <View style={styles.policyRow}>
            <Ionicons name="shield-checkmark" size={16} color="#0D9488" />
            <Text style={[styles.policyText, { color: textSecondary }]}>Auto-lock & PII masking enforced once published</Text>
          </View>
          <View style={styles.policyRow}>
            <Ionicons name="lock-closed" size={16} color="#F59E0B" />
            <Text style={[styles.policyText, { color: textSecondary }]}>Post-publication edits reserved for Super Admin only</Text>
          </View>
        </View>

        {/* Account Details */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Staff Account Information</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textSecondary }]}>Email:</Text>
            <Text style={[styles.infoVal, { color: textPrimary }]}>{user.email || "staff@delhiexchange.com"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textSecondary }]}>Mobile:</Text>
            <Text style={[styles.infoVal, { color: textPrimary }]}>{user.phone || "+91 98765 43210"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textSecondary }]}>Region / City:</Text>
            <Text style={[styles.infoVal, { color: textPrimary }]}>Delhi NCR (Zone 1)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: textSecondary }]}>App Version:</Text>
            <Text style={[styles.infoVal, { color: textPrimary }]}>v2.4.0 (Staff Build)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Feather name="log-out" size={16} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.logoutBtnText}>Log Out of Verification App</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  badgeText: {
    color: "#CCFBF1",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  logoutIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarVerifiedPin: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  profileRole: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    marginTop: 1,
  },
  staffIdBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  staffIdText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
  },
  metricVal: {
    fontSize: 18,
    fontWeight: "800",
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  policyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  policyText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: "600",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF444415",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  logoutBtnText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
});
