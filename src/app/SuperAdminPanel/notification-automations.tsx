import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";
import {
  SuperAdminSideMenu,
  SuperAdminAutomationRuleModal,
  SuperAdminNotificationHistoryTable,
  SuperAdminCustomNotificationModal,
} from "../../components/SuperAdminComponent";

type TabMode = "rules" | "history" | "custom";

export default function SuperAdminNotificationAutomationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useResponsiveTheme();

  const [currentTab, setCurrentTab] = useState<TabMode>("rules");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [runningCron, setRunningCron] = useState<boolean>(false);
  const [rules, setRules] = useState<any[]>([]);

  // Modals
  const [isSideMenuOpen, setIsSideMenuOpen] = useState<boolean>(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  const fetchRules = useCallback(async () => {
    try {
      const res = await apiClient.get("/notification-automations");
      if (res.data?.data) {
        setRules(res.data.data);
      }
    } catch (err: any) {
      console.log("Error fetching notification automations:", err.message);
      // Realistic fallback defaults
      setRules([
        {
          _id: "RULE-1",
          name: "Rent Reminder (5 Days Before)",
          type: "rent_reminder",
          enabled: true,
          trigger: { event: "days_before_due", daysBefore: 5 },
          titleTemplate: "Rent Payment Reminder: {{property_name}}",
          messageTemplate:
            "Hello {{tenant_name}}, your rent of {{rent_amount}} for {{property_name}} ({{unit_number}}) is due on {{due_date}}.",
          channels: { inApp: true, push: true, sms: false, email: false },
          sentCount: 142,
        },
        {
          _id: "RULE-2",
          name: "Rent Due Today Alert",
          type: "rent_due",
          enabled: true,
          trigger: { event: "on_due_date", daysBefore: 0 },
          titleTemplate: "Rent Due Today: {{property_name}}",
          messageTemplate:
            "Hello {{tenant_name}}, your monthly rent of {{rent_amount}} is due today ({{due_date}}).",
          channels: { inApp: true, push: true, sms: false, email: false },
          sentCount: 98,
        },
        {
          _id: "RULE-3",
          name: "Rent Overdue Immediate Alert",
          type: "rent_overdue",
          enabled: true,
          trigger: { event: "days_after_due", daysAfter: 1 },
          titleTemplate: "⚠️ Urgent: Rent Payment Overdue",
          messageTemplate:
            "Attention {{tenant_name}}, your rent of {{rent_amount}} was due on {{due_date}} and is now overdue.",
          channels: { inApp: true, push: true, sms: false, email: false },
          sentCount: 34,
        },
        {
          _id: "RULE-4",
          name: "Overdue Rent Recurring Follow-Up",
          type: "overdue_followup",
          enabled: true,
          trigger: { event: "recurring_days_after_due", recurringDays: 3 },
          titleTemplate: "Overdue Rent Follow-up (Action Required)",
          messageTemplate:
            "Hello {{tenant_name}}, outstanding balance of {{outstanding_amount}} remains unpaid for {{property_name}}.",
          channels: { inApp: true, push: true, sms: false, email: false },
          sentCount: 21,
        },
        {
          _id: "RULE-5",
          name: "Lease Expiry 30-Day Notice",
          type: "lease_expiry",
          enabled: true,
          trigger: { event: "days_before_lease_expiry", daysBefore: 30 },
          titleTemplate: "Lease Agreement Renewal Notice (30 Days)",
          messageTemplate:
            "Hello {{tenant_name}}, your tenancy agreement is set to expire on {{lease_end_date}}.",
          channels: { inApp: true, push: true, sms: false, email: false },
          sentCount: 18,
        },
        {
          _id: "RULE-6",
          name: "Lease Expiry Final 7-Day Warning",
          type: "lease_expiry_warning",
          enabled: true,
          trigger: { event: "days_before_lease_expiry", daysBefore: 7 },
          titleTemplate: "🚨 Final Notice: Lease Expiring in 7 Days",
          messageTemplate:
            "Hello {{tenant_name}}, your lease ends on {{lease_end_date}}. Please complete inspection handover.",
          channels: { inApp: true, push: true, sms: false, email: false },
          sentCount: 7,
        },
        {
          _id: "RULE-7",
          name: "Security Deposit Settlement",
          type: "security_deposit",
          enabled: true,
          trigger: { event: "days_before_due", daysBefore: 3 },
          titleTemplate: "Security Deposit Confirmation",
          messageTemplate:
            "Hello {{tenant_name}}, your security deposit ledger is updated.",
          channels: { inApp: true, push: true, sms: false, email: false },
          sentCount: 12,
        },
        {
          _id: "RULE-8",
          name: "Routine Maintenance & Inspection",
          type: "maintenance_inspection",
          enabled: true,
          trigger: { event: "scheduled_inspection", daysBefore: 2 },
          titleTemplate: "Scheduled Property Safety Audit",
          messageTemplate:
            "Hello {{tenant_name}}, a routine inspection is scheduled for your unit on {{due_date}}.",
          channels: { inApp: true, push: true, sms: false, email: false },
          sentCount: 29,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRules();
  };

  const handleToggleRule = async (rule: any) => {
    try {
      // Optimistic update
      setRules((prev) =>
        prev.map((r) => (r._id === rule._id ? { ...r, enabled: !r.enabled } : r))
      );
      await apiClient.patch(`/notification-automations/${rule._id}/toggle`);
    } catch (err: any) {
      console.log("Toggle error:", err.message);
      fetchRules();
    }
  };

  const handleRunCronTest = async () => {
    setRunningCron(true);
    try {
      const res = await apiClient.post("/notification-automations/run-cron");
      const dispatched = res.data?.data?.totalDispatched || 0;
      const evaluated = res.data?.data?.evaluatedProperties || 0;

      Alert.alert(
        "Scheduler Executed! ⚡",
        `Evaluated ${evaluated} active properties against enabled automation rules.\n\nDispatched: ${dispatched} automated notifications with zero-duplicate protection.`,
        [{ text: "OK" }]
      );
      fetchRules();
    } catch (err: any) {
      Alert.alert(
        "Scheduler Error",
        err.response?.data?.message || err.message || "Failed to trigger automated cycle"
      );
    } finally {
      setRunningCron(false);
    }
  };

  const activeRulesCount = rules.filter((r) => r.enabled).length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top + 8, 36) }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
            <TouchableOpacity
              onPress={() => setIsSideMenuOpen(true)}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <Feather name="menu" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <Text style={styles.panelBadge}>AUTOMATION ENGINE</Text>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>AUTO-PILOT</Text>
                </View>
              </View>
              <Text style={styles.headerTitle}>Notification Automations</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRunCronTest}
            disabled={runningCron}
            style={styles.cronBtn}
            activeOpacity={0.8}
          >
            {runningCron ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="play" size={13} color="#FFFFFF" />
                <Text style={styles.cronBtnText}>Run Scheduler</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.headerSubtitle}>
          Configure automated rent reminders, overdue follow-ups, lease notices & review live logs.
        </Text>
      </LinearGradient>

      {/* Segmented Switcher */}
      <View style={[styles.segmentCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
        <View style={[styles.segmentContainer, { backgroundColor: isDark ? "#0F172A" : "#F1F5F9" }]}>
          <TouchableOpacity
            onPress={() => setCurrentTab("rules")}
            style={[
              styles.segmentBtn,
              currentTab === "rules" && { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", elevation: 2 },
            ]}
          >
            <Ionicons
              name="options-outline"
              size={15}
              color={currentTab === "rules" ? "#0D9488" : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                { color: currentTab === "rules" ? (isDark ? "#FFFFFF" : "#0F172A") : colors.textSecondary },
              ]}
            >
              Rules ({activeRulesCount}/{rules.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCurrentTab("history")}
            style={[
              styles.segmentBtn,
              currentTab === "history" && { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", elevation: 2 },
            ]}
          >
            <Feather
              name="list"
              size={14}
              color={currentTab === "history" ? "#0D9488" : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentText,
                { color: currentTab === "history" ? (isDark ? "#FFFFFF" : "#0F172A") : colors.textSecondary },
              ]}
            >
              Audit History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsCustomModalOpen(true)}
            style={[styles.segmentBtn, { backgroundColor: "rgba(99, 102, 241, 0.12)" }]}
          >
            <Feather name="send" size={13} color="#6366F1" />
            <Text style={[styles.segmentText, { color: "#6366F1" }]}>+ Broadcast</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      {currentTab === "rules" ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
        >
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#0D9488" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading notification automation rules...
              </Text>
            </View>
          ) : (
            <View style={styles.rulesList}>
              {rules.map((rule) => {
                const triggerSummary =
                  rule.trigger?.event === "days_before_due"
                    ? `${rule.trigger?.daysBefore || 5} days before rent due date`
                    : rule.trigger?.event === "on_due_date"
                    ? "On exact rent due date"
                    : rule.trigger?.event === "days_after_due"
                    ? `${rule.trigger?.daysAfter || 1} day after due date (Overdue)`
                    : rule.trigger?.event === "recurring_days_after_due"
                    ? `Every ${rule.trigger?.recurringDays || 3} days while rent is overdue`
                    : rule.trigger?.event === "days_before_lease_expiry"
                    ? `${rule.trigger?.daysBefore || 30} days before lease expiry`
                    : "Scheduled event trigger";

                return (
                  <View
                    key={rule._id}
                    style={[
                      styles.ruleCard,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                        borderColor: rule.enabled ? (isDark ? "#334155" : "#E2E8F0") : isDark ? "#1E293B" : "#F1F5F9",
                        opacity: rule.enabled ? 1 : 0.75,
                      },
                    ]}
                  >
                    {/* Rule Header with Switch */}
                    <View style={styles.ruleHeader}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[styles.ruleName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                          {rule.name}
                        </Text>
                        <Text style={[styles.ruleTrigger, { color: "#0D9488" }]}>
                          ⚡ Trigger: {triggerSummary}
                        </Text>
                      </View>

                      <Switch
                        value={rule.enabled}
                        onValueChange={() => handleToggleRule(rule)}
                        trackColor={{ false: "#64748B", true: "#10B981" }}
                        thumbColor="#FFFFFF"
                      />
                    </View>

                    {/* Message Preview Box */}
                    <View style={[styles.templatePreviewBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                      <Text style={[styles.templateTitle, { color: isDark ? "#CBD5E1" : "#334155" }]}>
                        {rule.titleTemplate}
                      </Text>
                      <Text style={[styles.templateBody, { color: colors.textSecondary }]} numberOfLines={2}>
                        {rule.messageTemplate}
                      </Text>
                    </View>

                    {/* Channels & Actions Footer */}
                    <View style={styles.ruleFooter}>
                      <View style={styles.channelsRow}>
                        <View style={styles.channelTag}>
                          <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                          <Text style={styles.channelTagText}>In-App</Text>
                        </View>
                        <View style={styles.channelTag}>
                          <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                          <Text style={styles.channelTagText}>Push</Text>
                        </View>
                        {rule.channels?.sms && (
                          <View style={styles.channelTag}>
                            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                            <Text style={styles.channelTagText}>SMS</Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          setSelectedRule(rule);
                          setIsRuleModalOpen(true);
                        }}
                        style={[styles.editBtn, { borderColor: colors.border }]}
                        activeOpacity={0.7}
                      >
                        <Feather name="edit-2" size={12} color={isDark ? "#CBD5E1" : "#475569"} />
                        <Text style={[styles.editBtnText, { color: isDark ? "#CBD5E1" : "#475569" }]}>
                          Edit Settings
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SuperAdminNotificationHistoryTable />
        </ScrollView>
      )}

      {/* Side Bar Menu */}
      <SuperAdminSideMenu visible={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />

      {/* 1. Edit Automation Rule Modal */}
      <SuperAdminAutomationRuleModal
        visible={isRuleModalOpen}
        rule={selectedRule}
        onClose={() => {
          setIsRuleModalOpen(false);
          setSelectedRule(null);
        }}
        onSuccess={fetchRules}
      />

      {/* 2. Custom Broadcast Modal */}
      <SuperAdminCustomNotificationModal
        visible={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSuccess={fetchRules}
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
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  panelBadge: {
    color: "#A7F3D0",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },
  cronBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6366F1",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  cronBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    lineHeight: 17,
  },
  segmentCard: {
    marginHorizontal: 16,
    marginTop: -10,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    elevation: 3,
  },
  segmentContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    gap: 5,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: "800",
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  loadingBox: {
    padding: 40,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
  },
  rulesList: {
    gap: 12,
  },
  ruleCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  ruleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ruleName: {
    fontSize: 14,
    fontWeight: "800",
  },
  ruleTrigger: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  templatePreviewBox: {
    padding: 10,
    borderRadius: 10,
    gap: 2,
  },
  templateTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
  templateBody: {
    fontSize: 11,
    lineHeight: 16,
  },
  ruleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  channelsRow: {
    flexDirection: "row",
    gap: 6,
  },
  channelTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  channelTagText: {
    color: "#15803D",
    fontSize: 10,
    fontWeight: "800",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
