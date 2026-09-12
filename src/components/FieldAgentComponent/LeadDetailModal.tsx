import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency, LeadItem } from "../../constants/fieldAgentData";

interface LeadDetailModalProps {
  lead: LeadItem | null;
  visible: boolean;
  onClose: () => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  visible,
  onClose,
}) => {
  if (!lead) return null;

  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 12)); // September 2026
  const [selectedDay, setSelectedDay] = useState<number>(12);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Parse lead submission day if in current month/year
  const leadSubmissionDay = useMemo(() => {
    if (!lead.submissionDate) return 12;
    const match = lead.submissionDate.match(/\d+/);
    return match ? parseInt(match[0], 10) : 12;
  }, [lead.submissionDate]);

  // Compute days in month and starting offset
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const startDayOffset = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  // Commission status color & label
  const getCommissionBadgeStyle = () => {
    if (lead.commissionStatus === "PAID") {
      return { bg: "#DCFCE7", text: "#16A34A", border: "#86EFAC", label: "Paid" };
    }
    if (lead.commissionStatus === "APPROVED") {
      return { bg: "#CCFBF1", text: "#0F766E", border: "#5EEAD4", label: "Approved" };
    }
    return { bg: "#FEF3C7", text: "#D97706", border: "#FDE68A", label: "Pending Verification" };
  };

  const commBadge = getCommissionBadgeStyle();

  // Mock days with commission activities
  const getDayStatus = (day: number) => {
    if (day === selectedDay) return "SELECTED";
    if (day === 1 || day === 3 || day === 5 || day === 8 || day === 9 || day === 11) {
      return "PAID"; // Green
    }
    if (day === 2 || day === 7 || day === 10) {
      return "PENDING"; // Yellow with clock
    }
    if (day === 4 || day === 6) {
      return "LEAVE_ALERT"; // Soft red
    }
    return "NORMAL";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.leadId}>{lead.id}</Text>
              <Text style={styles.submittedOn}>Submitted: {lead.submissionDate}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Feather name="x" size={22} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Photos Preview */}
            {lead.photos && lead.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                {lead.photos.map((photo, i) => (
                  <Image key={i} source={{ uri: photo }} style={styles.propertyPhoto} />
                ))}
              </ScrollView>
            )}

            {/* Property Summary Card (Confidential: No Owner Info, No Full Address, No Raw GPS) */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Property Summary</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Property Type</Text>
                <Text style={styles.val}>{lead.propertyType} ({lead.listingType === "SALE" ? "For Sale" : "For Rent"})</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Expected Price</Text>
                <Text style={styles.valHighlight}>{formatCurrency(lead.expectedPrice)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Locality</Text>
                <Text style={styles.val}>{lead.locality}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Lead Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: lead.status === "VERIFIED" ? "#DCFCE7" : "#FEF3C7" }]}>
                  <Text style={[styles.statusText, { color: lead.status === "VERIFIED" ? "#16A34A" : "#D97706" }]}>
                    {lead.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Interactive Commission Calendar */}
            <View style={styles.calendarCard}>
              {/* Month Navigation */}
              <View style={styles.monthHeader}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn} activeOpacity={0.7}>
                  <Feather name="chevron-left" size={20} color="#0284C7" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                  {MONTH_NAMES[month]} {year}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn} activeOpacity={0.7}>
                  <Feather name="chevron-right" size={20} color="#0284C7" />
                </TouchableOpacity>
              </View>

              {/* Day of Week Headers */}
              <View style={styles.weekRow}>
                {WEEK_DAYS.map((d, index) => (
                  <Text key={index} style={styles.weekDayText}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Calendar Days Grid */}
              <View style={styles.daysGrid}>
                {/* Empty Offset Slots */}
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <View key={`offset-${i}`} style={styles.dayCellEmpty} />
                ))}

                {/* Actual Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayStatus = getDayStatus(dayNum);
                  const isSelected = dayNum === selectedDay;

                  let cellBg = "#F8FAFC";
                  let textColor = "#334155";
                  let borderColor = "transparent";
                  let showClock = false;
                  let showAlert = false;

                  if (isSelected) {
                    cellBg = "#F0F9FF";
                    borderColor = "#0284C7";
                    textColor = "#0369A1";
                    if (dayNum === 12) showAlert = true;
                  } else if (dayStatus === "PAID") {
                    cellBg = "#DCFCE7";
                    textColor = "#15803D";
                  } else if (dayStatus === "PENDING") {
                    cellBg = "#FEF3C7";
                    textColor = "#B45309";
                    showClock = true;
                  } else if (dayStatus === "LEAVE_ALERT") {
                    cellBg = "#FEE2E2";
                    textColor = "#B91C1C";
                  }

                  return (
                    <TouchableOpacity
                      key={dayNum}
                      style={[
                        styles.dayCell,
                        {
                          backgroundColor: cellBg,
                          borderColor: borderColor,
                          borderWidth: isSelected ? 2 : 0,
                        },
                      ]}
                      onPress={() => setSelectedDay(dayNum)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayNumberText,
                          { color: textColor, fontWeight: isSelected ? "800" : "600" },
                        ]}
                      >
                        {dayNum}
                      </Text>

                      {/* Micro Badge Indicators */}
                      {showClock && (
                        <View style={styles.clockDot}>
                          <Ionicons name="time" size={10} color="#D97706" />
                        </View>
                      )}
                      {showAlert && (
                        <View style={styles.alertDot}>
                          <Ionicons name="warning" size={10} color="#D97706" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Commission & Status Legend Chips */}
              <View style={styles.legendContainer}>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { borderColor: "#0284C7", borderWidth: 2, backgroundColor: "#FFFFFF" }]} />
                  <Text style={styles.legendText}>Selected Day</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: "#16A34A" }]} />
                  <Text style={styles.legendText}>Commission Paid</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: "#D97706" }]} />
                  <Text style={styles.legendText}>In Review</Text>
                </View>
                <View style={styles.legendChip}>
                  <View style={[styles.legendDot, { backgroundColor: "#0D9488" }]} />
                  <Text style={styles.legendText}>Submitted</Text>
                </View>
              </View>
            </View>

            {/* Selected Date Commission Summary */}
            <View style={styles.commissionSection}>
              <View style={styles.commHeaderRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Ionicons name="calendar-outline" size={18} color="#0F172A" />
                  <Text style={styles.commHeaderTitle}>
                    Commission Schedule
                  </Text>
                </View>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{selectedDay} {MONTH_NAMES[month]} {year}</Text>
                </View>
              </View>

              {/* Commission Card Details */}
              <View style={styles.commissionCard}>
                <View style={styles.commTopRow}>
                  <View>
                    <Text style={styles.commLabel}>Expected Field Commission</Text>
                    <Text style={styles.commAmount}>{formatCurrency(lead.commissionAmount)}</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: commBadge.bg, borderColor: commBadge.border }]}>
                    <Text style={[styles.statusTagText, { color: commBadge.text }]}>{commBadge.label}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Milestone Step Tracker */}
                <View style={styles.milestoneBox}>
                  <View style={styles.stepRow}>
                    <View style={[styles.stepCircle, { backgroundColor: "#0D9488" }]}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Lead Registered</Text>
                      <Text style={styles.stepDate}>{lead.submissionDate}</Text>
                    </View>
                  </View>

                  <View style={styles.stepConnector} />

                  <View style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor:
                            lead.status === "VERIFIED" || lead.commissionStatus === "PAID"
                              ? "#0D9488"
                              : "#E2E8F0",
                        },
                      ]}
                    >
                      {lead.status === "VERIFIED" ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : (
                        <MaterialCommunityIcons name="clock-outline" size={12} color="#64748B" />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Staff Physical Inspection</Text>
                      <Text style={styles.stepDate}>
                        {lead.status === "VERIFIED" ? "Verified & Approved" : "Scheduled / In Progress"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.stepConnector} />

                  <View style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor:
                            lead.commissionStatus === "PAID"
                              ? "#16A34A"
                              : lead.commissionStatus === "APPROVED"
                              ? "#0D9488"
                              : "#E2E8F0",
                        },
                      ]}
                    >
                      {lead.commissionStatus === "PAID" ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : (
                        <Ionicons name="wallet-outline" size={12} color="#64748B" />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>Commission Disbursal to Wallet</Text>
                      <Text style={styles.stepDate}>
                        {lead.commissionStatus === "PAID"
                          ? "Disbursed to Bank / UPI"
                          : "Credited automatically on lead deal closure"}
                      </Text>
                    </View>
                  </View>
                </View>

                {lead.verificationNotes && (
                  <>
                    <View style={styles.divider} />
                    <Text style={[styles.label, { marginTop: 6 }]}>Verification Notes:</Text>
                    <Text style={styles.notesText}>{lead.verificationNotes}</Text>
                  </>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Also export as LeadDetailsModal for alias compatibility
export const LeadDetailsModal = LeadDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  leadId: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
  },
  submittedOn: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  photoScroll: {
    marginBottom: 14,
  },
  propertyPhoto: {
    width: 190,
    height: 120,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: "#E2E8F0",
  },
  sectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
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
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0D9488",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 6,
  },

  // Calendar styles
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 6,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  weekDayText: {
    width: "13.5%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayCellEmpty: {
    width: "13.5%",
    height: 44,
    marginBottom: 6,
  },
  dayCell: {
    width: "13.5%",
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    position: "relative",
  },
  dayNumberText: {
    fontSize: 13.5,
  },
  clockDot: {
    position: "absolute",
    bottom: 3,
    alignSelf: "center",
  },
  alertDot: {
    position: "absolute",
    bottom: 3,
    alignSelf: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    justifyContent: "center",
  },
  legendChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },

  // Commission Details Section
  commissionSection: {
    marginTop: 4,
  },
  commHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  commHeaderTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  badgePill: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePillText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#0284C7",
  },
  commissionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
  },
  commTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  commAmount: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F766E",
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  milestoneBox: {
    marginTop: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#1E293B",
  },
  stepDate: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  stepConnector: {
    width: 2,
    height: 14,
    backgroundColor: "#CBD5E1",
    marginLeft: 10,
    marginVertical: 2,
  },
  notesText: {
    fontSize: 12,
    color: "#334155",
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 16,
  },
});
