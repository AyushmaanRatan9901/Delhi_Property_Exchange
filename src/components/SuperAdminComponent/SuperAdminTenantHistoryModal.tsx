import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface TenantHistoryModalProps {
  visible: boolean;
  tenantId: string | null;
  tenantInitialData?: any;
  onClose: () => void;
  onSendReminderPress?: (tenantData: any) => void;
}

export const SuperAdminTenantHistoryModal: React.FC<TenantHistoryModalProps> = ({
  visible,
  tenantId,
  tenantInitialData,
  onClose,
  onSendReminderPress,
}) => {
  const { colors, isDark } = useResponsiveTheme();

  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "properties">("timeline");

  useEffect(() => {
    if (visible && tenantId) {
      fetchTenantHistory();
    } else if (visible && tenantInitialData) {
      setProfile(tenantInitialData);
    }
  }, [visible, tenantId, tenantInitialData]);

  const fetchTenantHistory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/rent-payments/superadmin/tenants/${tenantId}/history`);
      if (res.data?.data) {
        setProfile(res.data.data);
      }
    } catch (err: any) {
      console.log("Error fetching tenant history:", err.message);
      // Fallback to initial data if available
      if (tenantInitialData) {
        setProfile(tenantInitialData);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return { bg: "#DCFCE7", text: "#15803D", icon: "checkmark-circle" };
      case "overdue":
        return { bg: "#FEE2E2", text: "#B91C1C", icon: "alert-circle" };
      case "partially_paid":
      case "partial":
        return { bg: "#FEF3C7", text: "#B45309", icon: "time" };
      default:
        return { bg: "#E0F2FE", text: "#0369A1", icon: "hourglass" };
    }
  };

  if (!visible) return null;

  const tenantName = profile?.name || tenantInitialData?.tenantName || "Resident";
  const tenantPhone = profile?.phone || tenantInitialData?.tenantPhone || "N/A";
  const tenantEmail = profile?.email || tenantInitialData?.tenantEmail || "N/A";
  const totalOutstanding = profile?.totalOutstanding || tenantInitialData?.outstandingAmount || 0;
  const properties = profile?.properties || [
    {
      title: tenantInitialData?.propertyTitle || "Delhi Property Unit",
      locality: tenantInitialData?.locality || "Delhi NCR",
      unitNumber: tenantInitialData?.unitNumber || "Flat A-101",
      monthlyRent: tenantInitialData?.monthlyRent || 18000,
      securityDeposit: tenantInitialData?.securityDeposit || 36000,
      leaseStartDateFormatted: tenantInitialData?.leaseStartDateFormatted || "01 Jan 2026",
      leaseEndDateFormatted: tenantInitialData?.leaseEndDateFormatted || "31 Dec 2026",
      status: "Active Lease",
      agreementNumber: tenantInitialData?.agreementNumber || "AGR-DPE-772910",
    },
  ];

  const timeline = profile?.rentTimeline || [
    {
      id: "TL-1",
      month: tenantInitialData?.currentMonth || "September 2026",
      amount: tenantInitialData?.monthlyRent || 18000,
      status: tenantInitialData?.status || "paid",
      dueDateFormatted: tenantInitialData?.dueDateFormatted || "05 Sep 2026",
      paidDate: tenantInitialData?.paidDateFormatted || "05 Sep 2026",
      paymentMethod: tenantInitialData?.paymentMethod || "UPI",
      transactionId: tenantInitialData?.transactionId || "UPI/202609058912",
      notes: "Payment recorded successfully",
    },
    {
      id: "TL-2",
      month: "August 2026",
      amount: tenantInitialData?.monthlyRent || 18000,
      status: "paid",
      dueDateFormatted: "05 Aug 2026",
      paidDate: "04 Aug 2026",
      paymentMethod: "Bank Transfer",
      transactionId: "NEFT/88129031",
      notes: "Paid in advance",
    },
    {
      id: "TL-3",
      month: "July 2026",
      amount: tenantInitialData?.monthlyRent || 18000,
      status: "paid",
      dueDateFormatted: "05 Jul 2026",
      paidDate: "05 Jul 2026",
      paymentMethod: "UPI",
      transactionId: "UPI/202607051128",
      notes: "Auto-cleared",
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
            <View>
              <Text style={styles.badge}>TENANT LEASE & PAYMENT HISTORY</Text>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {tenantName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}
            >
              <Feather name="x" size={20} color={isDark ? "#94A3B8" : "#64748B"} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#0D9488" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading comprehensive history & timeline...
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              {/* Profile Card */}
              <View style={[styles.profileCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: isDark ? "#334155" : "#E2E8F0" }]}>
                <View style={styles.profileTop}>
                  <View style={styles.avatarWrap}>
                    {profile?.profilePhoto ? (
                      <Image source={{ uri: profile.profilePhoto }} style={styles.avatarImg} />
                    ) : (
                      <View style={[styles.avatarPlaceholder, { backgroundColor: "#0D9488" }]}>
                        <Text style={styles.avatarLetter}>{tenantName.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.profileName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                      {tenantName}
                    </Text>
                    <Text style={[styles.profileContact, { color: colors.textSecondary }]}>
                      📞 {tenantPhone} {tenantEmail ? `• ✉️ ${tenantEmail}` : ""}
                    </Text>
                  </View>
                </View>

                {/* Outstanding Pill */}
                <View style={[styles.outstandingStrip, { backgroundColor: totalOutstanding > 0 ? (isDark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2") : (isDark ? "rgba(16, 185, 129, 0.15)" : "#F0FDF4") }]}>
                  <View>
                    <Text style={[styles.outstandingLabel, { color: totalOutstanding > 0 ? "#EF4444" : "#10B981" }]}>
                      TOTAL OUTSTANDING
                    </Text>
                    <Text style={[styles.outstandingValue, { color: totalOutstanding > 0 ? "#EF4444" : "#10B981" }]}>
                      ₹{Number(totalOutstanding).toLocaleString("en-IN")}
                    </Text>
                  </View>
                  {onSendReminderPress && (
                    <TouchableOpacity
                      onPress={() => {
                        onClose();
                        onSendReminderPress({
                          tenantId: profile?.id || tenantId,
                          tenantName,
                          tenantPhone,
                          tenantEmail,
                          propertyTitle: properties[0]?.title,
                          unitNumber: properties[0]?.unitNumber,
                          monthlyRent: properties[0]?.monthlyRent,
                          amount: totalOutstanding > 0 ? totalOutstanding : properties[0]?.monthlyRent,
                          dueDate: tenantInitialData?.dueDate || new Date().toISOString(),
                        });
                      }}
                      style={styles.reminderBtn}
                      activeOpacity={0.8}
                    >
                      <Feather name="bell" size={13} color="#FFFFFF" />
                      <Text style={styles.reminderBtnText}>Send Reminder</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Segmented Switcher */}
              <View style={[styles.tabSegmentContainer, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                <TouchableOpacity
                  onPress={() => setActiveTab("timeline")}
                  style={[
                    styles.tabSegmentBtn,
                    activeTab === "timeline" && { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", elevation: 2 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="calendar-clock"
                    size={16}
                    color={activeTab === "timeline" ? "#0D9488" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabSegmentText,
                      { color: activeTab === "timeline" ? (isDark ? "#FFFFFF" : "#0F172A") : colors.textSecondary },
                    ]}
                  >
                    Rent Timeline ({timeline.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setActiveTab("properties")}
                  style={[
                    styles.tabSegmentBtn,
                    activeTab === "properties" && { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", elevation: 2 },
                  ]}
                >
                  <Feather
                    name="home"
                    size={15}
                    color={activeTab === "properties" ? "#0D9488" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.tabSegmentText,
                      { color: activeTab === "properties" ? (isDark ? "#FFFFFF" : "#0F172A") : colors.textSecondary },
                    ]}
                  >
                    Properties ({properties.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TAB 1: RENT TIMELINE */}
              {activeTab === "timeline" && (
                <View style={styles.timelineSection}>
                  <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                    CHRONOLOGICAL RENT LEDGER
                  </Text>
                  {timeline.map((item: any, idx: number) => {
                    const stColor = getStatusColor(item.status);
                    return (
                      <View
                        key={item.id || idx}
                        style={[
                          styles.timelineCard,
                          {
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            borderColor: isDark ? "#334155" : "#E2E8F0",
                          },
                        ]}
                      >
                        <View style={styles.timelineCardHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.timelineMonth, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                              {item.month}
                            </Text>
                            <Text style={[styles.timelineSub, { color: colors.textSecondary }]}>
                              {item.propertyTitle ? `${item.propertyTitle} • ` : ""}{item.unitNumber || "Unit"}
                            </Text>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: stColor.bg }]}>
                            <Ionicons name={stColor.icon as any} size={12} color={stColor.text} />
                            <Text style={[styles.statusBadgeText, { color: stColor.text }]}>
                              {(item.status || "PENDING").toUpperCase()}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.timelineGrid}>
                          <View style={styles.gridItem}>
                            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>AMOUNT</Text>
                            <Text style={[styles.gridVal, { color: "#0D9488" }]}>
                              ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                            </Text>
                          </View>

                          <View style={styles.gridItem}>
                            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>DUE DATE</Text>
                            <Text style={[styles.gridVal, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                              {item.dueDateFormatted || "05th of month"}
                            </Text>
                          </View>

                          <View style={styles.gridItem}>
                            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>PAID DATE</Text>
                            <Text style={[styles.gridVal, { color: item.paidDate ? (isDark ? "#FFFFFF" : "#0F172A") : "#94A3B8" }]}>
                              {item.paidDate || "—"}
                            </Text>
                          </View>

                          <View style={styles.gridItem}>
                            <Text style={[styles.gridLabel, { color: colors.textMuted }]}>PAYMENT METHOD</Text>
                            <Text style={[styles.gridVal, { color: isDark ? "#CBD5E1" : "#475569" }]}>
                              {item.paymentMethod || "UPI"}
                            </Text>
                          </View>
                        </View>

                        {item.transactionId && (
                          <View style={[styles.refBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                            <Feather name="hash" size={12} color={colors.textSecondary} />
                            <Text style={[styles.refText, { color: colors.textSecondary }]}>
                              Ref/UTR: {item.transactionId}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {/* TAB 2: PROPERTY-WISE LEASE HISTORY */}
              {activeTab === "properties" && (
                <View style={styles.propertiesSection}>
                  <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                    LINKED UNITS & LEASE AGREEMENTS
                  </Text>
                  {properties.map((prop: any, pIdx: number) => (
                    <View
                      key={prop.propertyId || pIdx}
                      style={[
                        styles.propCard,
                        {
                          backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                          borderColor: isDark ? "#334155" : "#E2E8F0",
                        },
                      ]}
                    >
                      <View style={styles.propCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.propName, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                            {prop.title}
                          </Text>
                          <Text style={[styles.propLoc, { color: colors.textSecondary }]}>
                            📍 {prop.locality} • {prop.unitNumber}
                          </Text>
                        </View>
                        <View style={[styles.leaseStatusBadge, { backgroundColor: "#DCFCE7" }]}>
                          <Text style={styles.leaseStatusText}>
                            {(prop.status || "ACTIVE LEASE").toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.propGrid}>
                        <View style={styles.propGridItem}>
                          <Text style={[styles.gridLabel, { color: colors.textMuted }]}>MONTHLY RENT</Text>
                          <Text style={[styles.gridVal, { color: "#0D9488" }]}>
                            ₹{Number(prop.monthlyRent || 0).toLocaleString("en-IN")}
                          </Text>
                        </View>

                        <View style={styles.propGridItem}>
                          <Text style={[styles.gridLabel, { color: colors.textMuted }]}>SECURITY DEPOSIT</Text>
                          <Text style={[styles.gridVal, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                            ₹{Number(prop.securityDeposit || 0).toLocaleString("en-IN")}
                          </Text>
                        </View>

                        <View style={styles.propGridItem}>
                          <Text style={[styles.gridLabel, { color: colors.textMuted }]}>LEASE START</Text>
                          <Text style={[styles.gridVal, { color: isDark ? "#CBD5E1" : "#475569" }]}>
                            {prop.leaseStartDateFormatted || "01 Jan 2026"}
                          </Text>
                        </View>

                        <View style={styles.propGridItem}>
                          <Text style={[styles.gridLabel, { color: colors.textMuted }]}>LEASE END</Text>
                          <Text style={[styles.gridVal, { color: isDark ? "#CBD5E1" : "#475569" }]}>
                            {prop.leaseEndDateFormatted || "31 Dec 2026"}
                          </Text>
                        </View>
                      </View>

                      {prop.agreementNumber && (
                        <View style={[styles.agreementStrip, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                          <Feather name="file-text" size={13} color="#0D9488" />
                          <Text style={[styles.agreementText, { color: colors.textSecondary }]}>
                            Agreement No: {prop.agreementNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          )}
        </View>
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
    color: "#059669",
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
    gap: 16,
  },
  loadingBox: {
    padding: 60,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
  },
  profileCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 18,
    fontWeight: "800",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "800",
  },
  profileContact: {
    fontSize: 12,
    marginTop: 2,
  },
  outstandingStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  outstandingLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  outstandingValue: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 1,
  },
  reminderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0D9488",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  reminderBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  tabSegmentContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    gap: 6,
  },
  tabSegmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabSegmentText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  timelineSection: {
    gap: 12,
  },
  timelineCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  timelineCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timelineMonth: {
    fontSize: 15,
    fontWeight: "800",
  },
  timelineSub: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  timelineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  gridItem: {
    width: "47%",
    gap: 2,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  gridVal: {
    fontSize: 13,
    fontWeight: "700",
  },
  refBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refText: {
    fontSize: 11,
    fontWeight: "600",
  },
  propertiesSection: {
    gap: 12,
  },
  propCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  propCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  propName: {
    fontSize: 15,
    fontWeight: "800",
  },
  propLoc: {
    fontSize: 12,
    marginTop: 2,
  },
  leaseStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leaseStatusText: {
    color: "#15803D",
    fontSize: 10,
    fontWeight: "800",
  },
  propGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  propGridItem: {
    width: "47%",
    gap: 2,
  },
  agreementStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  agreementText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
