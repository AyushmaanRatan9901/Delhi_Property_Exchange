import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  StatusBar,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useResponsiveTheme } from "../../../constants/theme";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { logout } from "../../../Redux/Auth/authActions";
import apiClient from "../../../Redux/api/axiosInstance";
import { SuperAdminSideMenu, SuperAdminNotificationModal } from "../../../components/SuperAdminComponent";

export default function SuperAdminSettingsScreen() {
  const [isSideMenuVisible, setIsSideMenuVisible] = useState<boolean>(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth?.user);
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Settings State
  const [whatsappDays, setWhatsappDays] = useState<string>("3");
  const [overdueDays, setOverdueDays] = useState<string>("1");
  const [inspectionHours, setInspectionHours] = useState<string>("48");
  const [agentRentPct, setAgentRentPct] = useState<string>("15");
  const [agentSalePct, setAgentSalePct] = useState<string>("0.5");
  const [dealerRentPct, setDealerRentPct] = useState<string>("25");

  const [autoBirthday, setAutoBirthday] = useState<boolean>(true);
  const [autoPoliceVerif, setAutoPoliceVerif] = useState<boolean>(true);
  const [dupAadhaarCheck, setDupAadhaarCheck] = useState<boolean>(true);
  const [dupPhoneCheck, setDupPhoneCheck] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiClient.get("/leads/admin/settings");
      if (res.data?.data) {
        const s = res.data.data;
        setWhatsappDays(String(s.whatsappReminderDays || 3));
        setOverdueDays(String(s.overdueReminderDays || 1));
        setInspectionHours(String(s.inspectionCycleHours || 48));
        setAgentRentPct(String(s.defaultAgentCommissionRentPct || 15));
        setAgentSalePct(String(s.defaultAgentCommissionSalePct || 0.5));
        setDealerRentPct(String(s.defaultDealerCommissionRentPct || 25));
        setAutoBirthday(Boolean(s.autoBirthdayWishes ?? true));
        setAutoPoliceVerif(Boolean(s.autoPoliceVerificationReminder ?? true));
        setDupAadhaarCheck(Boolean(s.duplicateAadhaarCheck ?? true));
        setDupPhoneCheck(Boolean(s.duplicatePhoneCheck ?? true));
      }
    } catch (e: any) {
      console.warn("Could not load settings:", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSettings();
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await apiClient.put("/leads/admin/settings", {
        whatsappReminderDays: Number(whatsappDays) || 3,
        overdueReminderDays: Number(overdueDays) || 1,
        inspectionCycleHours: Number(inspectionHours) || 48,
        defaultAgentCommissionRentPct: Number(agentRentPct) || 15,
        defaultAgentCommissionSalePct: Number(agentSalePct) || 0.5,
        defaultDealerCommissionRentPct: Number(dealerRentPct) || 25,
        autoBirthdayWishes: autoBirthday,
        autoPoliceVerificationReminder: autoPoliceVerif,
        duplicateAadhaarCheck: dupAadhaarCheck,
        duplicatePhoneCheck: dupPhoneCheck,
      });
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      Alert.alert("Settings Saved", "System automation rules and commission defaults updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of Delhi Property Exchange Super Admin panel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(logout()).unwrap();
            } catch (e) {
              await dispatch(logout());
            }
            router.replace("/(auth)/login" as any);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top + 10, 36) }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setIsSideMenuVisible(true)}
              style={styles.hamburgerBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="menu" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text style={styles.panelBadge}>SYSTEM ENGINE CONFIGURATION</Text>
              <Text style={styles.headerTitle}>Automation Settings</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={() => setIsNotificationModalVisible(true)}
              style={styles.headerIconCircle}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={18} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSaveSettings} disabled={saving} style={styles.saveHeaderBtn}>
              {saving ? (
                <ActivityIndicator color="#0D9488" size="small" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#0D9488" />
                  <Text style={styles.saveHeaderBtnText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          WhatsApp reminders, inspection SLAs, commission rules & automated verification
        </Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 85, 115) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <ActivityIndicator color="#0D9488" size="large" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* 1. WhatsApp & Notification Automation */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="whatsapp" size={18} color="#10B981" />
                <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  WhatsApp & Rent Reminders
                </Text>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>REMINDER BEFORE DUE DATE</Text>
                  <View style={[styles.inputGroup, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
                      keyboardType="numeric"
                      value={whatsappDays}
                      onChangeText={setWhatsappDays}
                    />
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>Days</Text>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>OVERDUE ALERT WINDOW</Text>
                  <View style={[styles.inputGroup, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
                      keyboardType="numeric"
                      value={overdueDays}
                      onChangeText={setOverdueDays}
                    />
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>Days</Text>
                  </View>
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>FIELD INSPECTION SLA DURATION</Text>
                <View style={[styles.inputGroup, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
                    keyboardType="numeric"
                    value={inspectionHours}
                    onChangeText={setInspectionHours}
                  />
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>Hours from lead submission</Text>
                </View>
              </View>
            </View>

            {/* 2. Default Commission Framework */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="pricetag" size={18} color="#0D9488" />
                <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  System Default Commission Rules
                </Text>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>AGENT RENT COMM.</Text>
                  <View style={[styles.inputGroup, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
                      keyboardType="numeric"
                      value={agentRentPct}
                      onChangeText={setAgentRentPct}
                    />
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>% (1st mo.)</Text>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>AGENT SALE COMM.</Text>
                  <View style={[styles.inputGroup, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
                      keyboardType="numeric"
                      value={agentSalePct}
                      onChangeText={setAgentSalePct}
                    />
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>% (Sale)</Text>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>DEALER COMM.</Text>
                  <View style={[styles.inputGroup, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, { color: isDark ? "#FFFFFF" : "#0F172A" }]}
                      keyboardType="numeric"
                      value={dealerRentPct}
                      onChangeText={setDealerRentPct}
                    />
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>% (Broker)</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. Automated System Toggles */}
            <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Feather name="zap" size={18} color="#F59E0B" />
                <Text style={[styles.cardTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                  Automated Background Workflows
                </Text>
              </View>

              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toggleTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    Automated Birthday & Anniversary Wishes
                  </Text>
                  <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                    Sends automated warm WhatsApp greetings to Owners & Tenants.
                  </Text>
                </View>
                <Switch
                  value={autoBirthday}
                  onValueChange={setAutoBirthday}
                  trackColor={{ false: "#CBD5E1", true: "#0D9488" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.toggleRow, { borderTopWidth: 1, borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toggleTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    Auto Police Verification Reminders
                  </Text>
                  <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                    Pings staff & tenant within 7 days of lease start date.
                  </Text>
                </View>
                <Switch
                  value={autoPoliceVerif}
                  onValueChange={setAutoPoliceVerif}
                  trackColor={{ false: "#CBD5E1", true: "#0D9488" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.toggleRow, { borderTopWidth: 1, borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toggleTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    Duplicate Phone Collision Shield
                  </Text>
                  <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
                    Automatically flags duplicate property submissions with identical owner phone.
                  </Text>
                </View>
                <Switch
                  value={dupPhoneCheck}
                  onValueChange={setDupPhoneCheck}
                  trackColor={{ false: "#CBD5E1", true: "#0D9488" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* 4. Save Button */}
            <TouchableOpacity
              onPress={handleSaveSettings}
              disabled={saving}
              style={[styles.saveBtn, { backgroundColor: saving ? "#94A3B8" : "#0D9488" }]}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="save" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Automation Settings</Text>
                </>
              )}
            </TouchableOpacity>

            {/* 5. Super Admin Account & Logout */}
            <View style={[styles.accountCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
              <View style={styles.accountInfo}>
                <View style={styles.adminAvatar}>
                  <Text style={styles.adminAvatarText}>{(user?.name || "SA").slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.adminName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                    {user?.name || "Super Admin"}
                  </Text>
                  <Text style={[styles.adminSub, { color: colors.textSecondary }]}>
                    {user?.phone || "+91 99999 99999"} • ROLE: SUPER ADMIN
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Feather name="log-out" size={16} color="#EF4444" />
                <Text style={styles.logoutBtnText}>Log Out of Super Admin</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
      {/* Side Bar Menu */}
      <SuperAdminSideMenu
        visible={isSideMenuVisible}
        onClose={() => setIsSideMenuVisible(false)}
        onNotificationPress={() => setIsNotificationModalVisible(true)}
      />

      {/* Notifications Modal */}
      <SuperAdminNotificationModal
        visible={isNotificationModalVisible}
        onClose={() => setIsNotificationModalVisible(false)}
      />
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
  },
  hamburgerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  panelBadge: {
    color: "#99F6E4",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  saveHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveHeaderBtnText: {
    color: "#0D9488",
    fontSize: 12,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#CCFBF1",
    fontSize: 12,
    marginTop: 6,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
  },
  formField: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    padding: 0,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  toggleDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  accountCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adminAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  adminAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  adminName: {
    fontSize: 15,
    fontWeight: "800",
  },
  adminSub: {
    fontSize: 11,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  logoutBtnText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
});
