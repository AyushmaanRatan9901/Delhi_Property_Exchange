import { useTranslation } from "react-i18next";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState, useEffect } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency, LeadItem, useFieldAgent } from "../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../constants/theme";

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

// Helper to parse date from string (e.g. "12 Sep 2026", "2026-09-12", "12/09/2026", "Today, 10:45 AM")
const parseLeadDate = (dateStr?: string): { day: number; month: number; year: number } => {
  if (!dateStr) {
    const now = new Date();
    return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
  }

  const str = String(dateStr).trim();
  const lower = str.toLowerCase();

  if (lower.includes("today") || lower.includes("just now") || lower.includes("recently")) {
    const now = new Date();
    return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
  }

  if (lower.includes("yesterday")) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    return {
      day: day || 1,
      month: m >= 0 && m <= 11 ? m : new Date().getMonth(),
      year: y || new Date().getFullYear(),
    };
  }

  // "12 Sep 2026", "12-Sep-2026", "12 Sept 2026", "September 12, 2026"
  const wordMonthMatch = str.match(/(\d{1,2})[\s-]+([A-Za-z]+)[\s,-]+(\d{4})/);
  if (wordMonthMatch) {
    const day = parseInt(wordMonthMatch[1], 10);
    const mStr = wordMonthMatch[2].toLowerCase().slice(0, 3);
    const monthIndex = MONTH_NAMES.findIndex((m) => m.toLowerCase().startsWith(mStr));
    const year = parseInt(wordMonthMatch[3], 10);
    return {
      day: day || 1,
      month: monthIndex >= 0 ? monthIndex : new Date().getMonth(),
      year: year || new Date().getFullYear(),
    };
  }

  // ISO or standard date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000) {
    return { day: parsed.getDate(), month: parsed.getMonth(), year: parsed.getFullYear() };
  }

  const now = new Date();
  return { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };
};

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  visible,
  onClose,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();
  const { leads: allLeads } = useFieldAgent();

  // Compute initial date from real lead submission
  const leadDateInfo = useMemo(() => parseLeadDate(lead?.submissionDate), [lead?.submissionDate]);

  // Calendar navigation state
  const [currentDate, setCurrentDate] = useState(() => new Date(leadDateInfo.year, leadDateInfo.month, 1));
  const [selectedDay, setSelectedDay] = useState<number>(leadDateInfo.day);

  // Sync calendar when lead changes
  useEffect(() => {
    if (lead) {
      const info = parseLeadDate(lead.submissionDate);
      setCurrentDate(new Date(info.year, info.month, 1));
      setSelectedDay(info.day);
    }
  }, [lead]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const today = useMemo(() => new Date(), []);
  const isCurrentMonthToday = today.getFullYear() === year && today.getMonth() === month;
  const todayDateNum = today.getDate();

  // Days in month and starting offset
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

  // Quick reset to current today's live date
  const handleResetToToday = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDay(now.getDate());
  };

  // Map real leads to day numbers for current month & year
  const leadsByDay = useMemo(() => {
    const map = new Map<number, LeadItem[]>();
    allLeads.forEach((item) => {
      const parsed = parseLeadDate(item.submissionDate);
      if (parsed.year === year && parsed.month === month) {
        const list = map.get(parsed.day) || [];
        list.push(item);
        map.set(parsed.day, list);
      }
    });

    if (lead && leadDateInfo.year === year && leadDateInfo.month === month) {
      const list = map.get(leadDateInfo.day) || [];
      if (!list.some((l) => l.id === lead.id)) {
        list.push(lead);
        map.set(leadDateInfo.day, list);
      }
    }

    return map;
  }, [allLeads, lead, year, month, leadDateInfo]);

  // Real status for each calendar day
  const getDayStatus = (day: number) => {
    if (day === selectedDay) return "SELECTED";

    const dayLeads = leadsByDay.get(day);
    if (!dayLeads || dayLeads.length === 0) return "NORMAL";

    if (dayLeads.some((l) => l.commissionStatus === "PAID" || l.status === "RENTED" || l.status === "SOLD")) {
      return "PAID";
    }
    if (dayLeads.some((l) => l.status === "VERIFIED")) {
      return "VERIFIED";
    }
    if (dayLeads.some((l) => l.commissionStatus === "PENDING" || l.status === "NEW")) {
      return "PENDING";
    }
    if (dayLeads.some((l) => l.status === "REJECTED")) {
      return "REJECTED";
    }
    return "NORMAL";
  };

  // Leads and commission for the selected day
  const selectedDayLeads = leadsByDay.get(selectedDay) || [];
  const isSelectedLeadDay = leadDateInfo.year === year && leadDateInfo.month === month && leadDateInfo.day === selectedDay;

  const totalDayCommission = useMemo(() => {
    if (selectedDayLeads.length > 0) {
      return selectedDayLeads.reduce((acc, curr) => acc + (curr.commissionAmount || 0), 0);
    }
    if (isSelectedLeadDay && lead) {
      return lead.commissionAmount || 0;
    }
    return 0;
  }, [selectedDayLeads, isSelectedLeadDay, lead]);

  // Commission status color & label for selected lead
  const getCommissionBadgeStyle = () => {
    if (!lead) return { bg: "", text: "", border: "", label: "" };
    if (lead.commissionStatus === "PAID") {
      return {
        bg: isDark ? "#062A1C" : "#DCFCE7",
        text: isDark ? "#34D399" : "#16A34A",
        border: isDark ? "#065F46" : "#86EFAC",
        label: "Paid",
      };
    }
    if (lead.commissionStatus === "APPROVED") {
      return {
        bg: isDark ? "#082F2C" : "#CCFBF1",
        text: isDark ? "#2DD4BF" : "#0F766E",
        border: isDark ? "#115E59" : "#5EEAD4",
        label: "Approved",
      };
    }
    return {
      bg: isDark ? "#2E1E08" : "#FEF3C7",
      text: isDark ? "#FBBF24" : "#D97706",
      border: isDark ? "#78350F" : "#FDE68A",
      label: "Pending Verification",
    };
  };

  const commBadge = getCommissionBadgeStyle();

  if (!lead) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF" },
          ]}
        >
          {/* Top Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: isDark ? colors.border : "#F1F5F9" },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.leadId,
                  { color: isDark ? colors.textPrimary : "#0F172A" },
                ]}
              >
                {lead.id}
              </Text>
              <Text
                style={[
                  styles.submittedOn,
                  { color: isDark ? colors.textMuted : "#64748B" },
                ]}
              >
                Submitted: {lead.submissionDate}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" },
              ]}
              activeOpacity={0.7}
            >
              <Feather
                name="x"
                size={22}
                color={isDark ? colors.textPrimary : "#0F172A"}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {/* Photos Preview */}
            {lead.photos && lead.photos.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.photoScroll}
              >
                {lead.photos.map((photo, i) => (
                  <Image
                    key={i}
                    source={{ uri: photo }}
                    style={styles.propertyPhoto}
                  />
                ))}
              </ScrollView>
            )}

            {/* Property Summary Card */}
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionHeader,
                  { color: isDark ? colors.textPrimary : "#0F172A" },
                ]}
              >
                Property Summary
              </Text>
              <View style={styles.row}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.textMuted : "#64748B" },
                  ]}
                >
                  Property Type
                </Text>
                <Text
                  style={[
                    styles.val,
                    { color: isDark ? colors.textPrimary : "#0F172A" },
                  ]}
                >
                  {lead.propertyType} (
                  {lead.listingType === "SALE" ? "For Sale" : "For Rent"})
                </Text>
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: isDark ? colors.border : "#E2E8F0" },
                ]}
              />
              <View style={styles.row}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.textMuted : "#64748B" },
                  ]}
                >
                  Expected Price
                </Text>
                <Text
                  style={[
                    styles.valHighlight,
                    { color: isDark ? "#2DD4BF" : "#0D9488" },
                  ]}
                >
                  {formatCurrency(lead.expectedPrice)}
                </Text>
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: isDark ? colors.border : "#E2E8F0" },
                ]}
              />
              <View style={styles.row}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.textMuted : "#64748B" },
                  ]}
                >
                  Locality
                </Text>
                <Text
                  style={[
                    styles.val,
                    { color: isDark ? colors.textPrimary : "#0F172A" },
                  ]}
                >
                  {lead.locality}
                </Text>
              </View>
              <View
                style={[
                  styles.divider,
                  { backgroundColor: isDark ? colors.border : "#E2E8F0" },
                ]}
              />
              <View style={styles.row}>
                <Text
                  style={[
                    styles.label,
                    { color: isDark ? colors.textMuted : "#64748B" },
                  ]}
                >
                  Lead Status
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        lead.status === "VERIFIED"
                          ? isDark
                            ? "#062A1C"
                            : "#DCFCE7"
                          : isDark
                          ? "#2E1E08"
                          : "#FEF3C7",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          lead.status === "VERIFIED"
                            ? isDark
                              ? "#34D399"
                              : "#16A34A"
                            : isDark
                            ? "#FBBF24"
                            : "#D97706",
                      },
                    ]}
                  >
                    {lead.status}
                  </Text>
                </View>
              </View>
            </View>

            {/* Real Interactive Commission Calendar */}
            <View
              style={[
                styles.calendarCard,
                {
                  backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              {/* Month Navigation */}
              <View style={styles.monthHeader}>
                <TouchableOpacity
                  onPress={handlePrevMonth}
                  style={[
                    styles.navBtn,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceLight
                        : "#F0F9FF",
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="chevron-left"
                    size={20}
                    color={isDark ? "#38BDF8" : "#0284C7"}
                  />
                </TouchableOpacity>

                <View style={styles.monthCenterWrapper}>
                  <Text
                    style={[
                      styles.monthTitle,
                      { color: isDark ? colors.textPrimary : "#0F172A" },
                    ]}
                  >
                    {MONTH_NAMES[month]} {year}
                  </Text>
                  <TouchableOpacity
                    onPress={handleResetToToday}
                    style={[
                      styles.todayPillBtn,
                      {
                        backgroundColor: isDark ? "#0C293D" : "#F0F9FF",
                        borderColor: isDark ? "#0369A1" : "#BAE6FD",
                      },
                    ]}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={12}
                      color={isDark ? "#38BDF8" : "#0284C7"}
                    />
                    <Text
                      style={[
                        styles.todayPillText,
                        { color: isDark ? "#38BDF8" : "#0284C7" },
                      ]}
                    >
                      Today
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleNextMonth}
                  style={[
                    styles.navBtn,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceLight
                        : "#F0F9FF",
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={isDark ? "#38BDF8" : "#0284C7"}
                  />
                </TouchableOpacity>
              </View>

              {/* Day of Week Headers */}
              <View style={styles.weekRow}>
                {WEEK_DAYS.map((d, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.weekDayText,
                      { color: isDark ? colors.textMuted : "#64748B" },
                    ]}
                  >
                    {d}
                  </Text>
                ))}
              </View>

              {/* Calendar Days Grid */}
              <View style={styles.daysGrid}>
                {Array.from({ length: startDayOffset }).map((_, i) => (
                  <View key={`offset-${i}`} style={styles.dayCellContainer}>
                    <View style={styles.dayCellEmpty} />
                  </View>
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayStatus = getDayStatus(dayNum);
                  const isSelected = dayNum === selectedDay;
                  const isTodayDay = isCurrentMonthToday && dayNum === todayDateNum;
                  const hasLeads = leadsByDay.has(dayNum);

                  let cellBg = isDark ? colors.surfaceLight : "#F8FAFC";
                  let textColor = isDark ? colors.textSecondary : "#334155";
                  let borderColor = "transparent";
                  let showClock = false;
                  let showPaid = false;
                  let showVerified = false;

                  if (isSelected) {
                    cellBg = isDark ? "#0C293D" : "#F0F9FF";
                    borderColor = isDark ? "#38BDF8" : "#0284C7";
                    textColor = isDark ? "#38BDF8" : "#0369A1";
                  } else if (dayStatus === "PAID") {
                    cellBg = isDark ? "#062A1C" : "#DCFCE7";
                    textColor = isDark ? "#34D399" : "#15803D";
                    showPaid = true;
                  } else if (dayStatus === "VERIFIED") {
                    cellBg = isDark ? "#082F49" : "#E0F2FE";
                    textColor = isDark ? "#38BDF8" : "#0284C7";
                    showVerified = true;
                  } else if (dayStatus === "PENDING") {
                    cellBg = isDark ? "#2E1E08" : "#FEF3C7";
                    textColor = isDark ? "#FBBF24" : "#B45309";
                    showClock = true;
                  } else if (dayStatus === "REJECTED") {
                    cellBg = isDark ? "#331111" : "#FEE2E2";
                    textColor = isDark ? "#F87171" : "#B91C1C";
                  } else if (isTodayDay) {
                    borderColor = isDark ? "#0369A1" : "#BAE6FD";
                    cellBg = isDark ? "#082238" : "#F0F9FF";
                    textColor = isDark ? "#38BDF8" : "#0284C7";
                  }

                  return (
                    <View key={dayNum} style={styles.dayCellContainer}>
                      <TouchableOpacity
                        style={[
                          styles.dayCell,
                          {
                            backgroundColor: cellBg,
                            borderColor: borderColor,
                            borderWidth: isSelected ? 2 : isTodayDay ? 1.5 : 0,
                          },
                        ]}
                        onPress={() => {
                          try {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          } catch {}
                          setSelectedDay(dayNum);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.dayNumberText,
                            {
                              color: textColor,
                              fontWeight: isSelected || hasLeads || isTodayDay ? "800" : "600",
                            },
                          ]}
                        >
                          {dayNum}
                        </Text>

                        {showClock && (
                          <View style={styles.dotIndicator}>
                            <Ionicons
                              name="time"
                              size={8}
                              color={isDark ? "#FBBF24" : "#D97706"}
                            />
                          </View>
                        )}
                        {showPaid && (
                          <View style={styles.dotIndicator}>
                            <Ionicons
                              name="checkmark-circle"
                              size={8}
                              color={isDark ? "#34D399" : "#16A34A"}
                            />
                          </View>
                        )}
                        {showVerified && (
                          <View style={styles.dotIndicator}>
                            <Ionicons
                              name="shield-checkmark"
                              size={8}
                              color={isDark ? "#38BDF8" : "#0284C7"}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* Commission & Status Legend Chips */}
              <View
                style={[
                  styles.legendContainer,
                  { borderTopColor: isDark ? colors.border : "#F1F5F9" },
                ]}
              >
                <TouchableOpacity
                  onPress={handleResetToToday}
                  style={[
                    styles.legendChip,
                    {
                      backgroundColor: isDark ? "#0C293D" : "#F0F9FF",
                      borderColor: isDark ? "#0369A1" : "#BAE6FD",
                    },
                  ]}
                  activeOpacity={0.75}
                >
                  <Ionicons
                    name="today"
                    size={12}
                    color={isDark ? "#38BDF8" : "#0284C7"}
                  />
                  <Text
                    style={[
                      styles.legendText,
                      { color: isDark ? "#38BDF8" : "#0284C7", fontWeight: "800" },
                    ]}
                  >
                    Today
                  </Text>
                </TouchableOpacity>

                <View
                  style={[
                    styles.legendChip,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceLight
                        : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.legendDot,
                      {
                        borderColor: isDark ? "#38BDF8" : "#0284C7",
                        borderWidth: 2,
                        backgroundColor: isDark
                          ? colors.cardBackground
                          : "#FFFFFF",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.legendText,
                      { color: isDark ? colors.textSecondary : "#475569" },
                    ]}
                  >
                    Selected
                  </Text>
                </View>

                <View
                  style={[
                    styles.legendChip,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceLight
                        : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: isDark ? "#34D399" : "#16A34A" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.legendText,
                      { color: isDark ? colors.textSecondary : "#475569" },
                    ]}
                  >
                    Rented / Paid
                  </Text>
                </View>

                <View
                  style={[
                    styles.legendChip,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceLight
                        : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: isDark ? "#38BDF8" : "#0284C7" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.legendText,
                      { color: isDark ? colors.textSecondary : "#475569" },
                    ]}
                  >
                    Verified / Listed
                  </Text>
                </View>

                <View
                  style={[
                    styles.legendChip,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceLight
                        : "#F8FAFC",
                      borderColor: isDark ? colors.border : "#E2E8F0",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: isDark ? "#FBBF24" : "#D97706" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.legendText,
                      { color: isDark ? colors.textSecondary : "#475569" },
                    ]}
                  >
                    In Verification
                  </Text>
                </View>
              </View>
            </View>

            {/* Selected Date Real Commission Summary */}
            <View style={styles.commissionSection}>
              <View style={styles.commHeaderRow}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={isDark ? colors.textPrimary : "#0F172A"}
                  />
                  <Text
                    style={[
                      styles.commHeaderTitle,
                      { color: isDark ? colors.textPrimary : "#0F172A" },
                    ]}
                  >
                    {t("fieldAgent.commissionBreakdown")}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badgePill,
                    {
                      backgroundColor: isDark ? "#0C293D" : "#E0F2FE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgePillText,
                      { color: isDark ? "#38BDF8" : "#0284C7" },
                    ]}
                  >
                    {selectedDay} {MONTH_NAMES[month]} {year}
                  </Text>
                </View>
              </View>

              {/* Commission Card Details */}
              <View
                style={[
                  styles.commissionCard,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#E2E8F0",
                  },
                ]}
              >
                <View style={styles.commTopRow}>
                  <View>
                    <Text
                      style={[
                        styles.commLabel,
                        { color: isDark ? colors.textMuted : "#64748B" },
                      ]}
                    >
                      {isSelectedLeadDay
                        ? "Lead Field Commission"
                        : "Total Day Potential Commission"}
                    </Text>
                    <Text
                      style={[
                        styles.commAmount,
                        { color: isDark ? "#2DD4BF" : "#0F766E" },
                      ]}
                    >
                      {formatCurrency(totalDayCommission)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusTag,
                      {
                        backgroundColor: commBadge.bg,
                        borderColor: commBadge.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagText,
                        { color: commBadge.text },
                      ]}
                    >
                      {commBadge.label}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.divider,
                    { backgroundColor: isDark ? colors.border : "#E2E8F0" },
                  ]}
                />

                {/* Milestone Step Tracker */}
                <View style={styles.milestoneBox}>
                  {/* Step 1: Lead Registered */}
                  <View style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepCircle,
                        { backgroundColor: isDark ? "#14B8A6" : "#0D9488" },
                      ]}
                    >
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                    <View style={styles.stepContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          { color: isDark ? colors.textPrimary : "#1E293B" },
                        ]}
                      >
                        1. Lead Registered
                      </Text>
                      <Text
                        style={[
                          styles.stepDate,
                          { color: isDark ? colors.textMuted : "#64748B" },
                        ]}
                      >
                        {lead.submissionDate}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.stepConnector,
                      { backgroundColor: isDark ? colors.border : "#CBD5E1" },
                    ]}
                  />

                  {/* Step 2: Staff Physical Inspection (No commission) */}
                  <View style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor:
                            lead.status === "VERIFIED" ||
                            lead.status === "RENTED" ||
                            lead.status === "SOLD"
                              ? isDark
                                ? "#14B8A6"
                                : "#0D9488"
                              : isDark
                              ? colors.border
                              : "#E2E8F0",
                        },
                      ]}
                    >
                      {lead.status === "VERIFIED" ||
                      lead.status === "RENTED" ||
                      lead.status === "SOLD" ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : (
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={12}
                          color={isDark ? colors.textMuted : "#64748B"}
                        />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          { color: isDark ? colors.textPrimary : "#1E293B" },
                        ]}
                      >
                        2. Staff Verification & Listing
                      </Text>
                      <Text
                        style={[
                          styles.stepDate,
                          { color: isDark ? colors.textMuted : "#64748B" },
                        ]}
                      >
                        {lead.status === "VERIFIED" ||
                        lead.status === "RENTED" ||
                        lead.status === "SOLD"
                          ? "Verified & Listed Live (Awaiting Tenant)"
                          : "Scheduled / In Progress"}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.stepConnector,
                      { backgroundColor: isDark ? colors.border : "#CBD5E1" },
                    ]}
                  />

                  {/* Step 3: Tenant Move-In & 1st Month Rent */}
                  <View style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor:
                            lead.status === "RENTED" ||
                            lead.status === "SOLD"
                              ? isDark
                                ? "#14B8A6"
                                : "#0D9488"
                              : isDark
                              ? colors.border
                              : "#E2E8F0",
                        },
                      ]}
                    >
                      {lead.status === "RENTED" || lead.status === "SOLD" ? (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      ) : (
                        <Ionicons
                          name="key-outline"
                          size={12}
                          color={isDark ? colors.textMuted : "#64748B"}
                        />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          { color: isDark ? colors.textPrimary : "#1E293B" },
                        ]}
                      >
                        3. Tenant Move-In & 1st Month Rent
                      </Text>
                      <Text
                        style={[
                          styles.stepDate,
                          { color: isDark ? colors.textMuted : "#64748B" },
                        ]}
                      >
                        {lead.status === "RENTED" || lead.status === "SOLD"
                          ? `1st Month Commission (${formatCurrency(lead.firstMonthCommission || lead.commissionAmount || 0)}) Unlocked`
                          : `Unlocks ${formatCurrency(lead.firstMonthCommission || Math.round(lead.expectedPrice * 0.15))} on tenant registration`}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.stepConnector,
                      { backgroundColor: isDark ? colors.border : "#CBD5E1" },
                    ]}
                  />

                  {/* Step 4: Recurring Monthly Commission */}
                  <View style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor:
                            lead.status === "RENTED"
                              ? isDark
                                ? "#34D399"
                                : "#16A34A"
                              : isDark
                              ? colors.border
                              : "#E2E8F0",
                        },
                      ]}
                    >
                      <Ionicons
                        name="repeat-outline"
                        size={12}
                        color={lead.status === "RENTED" ? "#FFFFFF" : isDark ? colors.textMuted : "#64748B"}
                      />
                    </View>
                    <View style={styles.stepContent}>
                      <Text
                        style={[
                          styles.stepTitle,
                          { color: isDark ? colors.textPrimary : "#1E293B" },
                        ]}
                      >
                        4. Monthly Recurring Commission
                      </Text>
                      <Text
                        style={[
                          styles.stepDate,
                          { color: isDark ? colors.textMuted : "#64748B" },
                        ]}
                      >
                        {lead.status === "RENTED"
                          ? `Active: ${formatCurrency(lead.recurringMonthlyCommission || Math.round(lead.expectedPrice * 0.05))}/month on each rent paid`
                          : `Earns ~${formatCurrency(lead.recurringMonthlyCommission || Math.round(lead.expectedPrice * 0.05))}/mo as long as tenant pays rent`}
                      </Text>
                    </View>
                  </View>
                </View>

                {lead.verificationNotes && (
                  <>
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: isDark ? colors.border : "#E2E8F0" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.label,
                        {
                          marginTop: 6,
                          color: isDark ? colors.textMuted : "#64748B",
                        },
                      ]}
                    >
                      Verification Notes:
                    </Text>
                    <Text
                      style={[
                        styles.notesText,
                        { color: isDark ? colors.textSecondary : "#334155" },
                      ]}
                    >
                      {lead.verificationNotes}
                    </Text>
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

export const LeadDetailsModal = LeadDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  container: {
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
  },
  leadId: {
    fontSize: 19,
    fontWeight: "900",
  },
  submittedOn: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    padding: 8,
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
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "800",
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
    fontWeight: "600",
  },
  val: {
    fontSize: 13,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },
  valHighlight: {
    fontSize: 13.5,
    fontWeight: "800",
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
    marginVertical: 6,
  },
  calendarCard: {
    borderRadius: 22,
    borderWidth: 1,
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
  monthCenterWrapper: {
    alignItems: "center",
    gap: 4,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 16.5,
    fontWeight: "800",
  },
  todayPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  todayPillText: {
    fontSize: 11,
    fontWeight: "800",
  },
  weekRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 8,
  },
  weekDayText: {
    width: "14.2857%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  dayCellContainer: {
    width: "14.2857%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 3,
  },
  dayCellEmpty: {
    width: 36,
    height: 36,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  dayNumberText: {
    fontSize: 13,
  },
  dotIndicator: {
    position: "absolute",
    bottom: 2,
    alignSelf: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    justifyContent: "center",
  },
  legendChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
  },
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
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePillText: {
    fontSize: 11.5,
    fontWeight: "800",
  },
  commissionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  commTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  commAmount: {
    fontSize: 20,
    fontWeight: "900",
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
  },
  stepDate: {
    fontSize: 11,
    marginTop: 1,
  },
  stepConnector: {
    width: 2,
    height: 14,
    marginLeft: 10,
    marginVertical: 2,
  },
  notesText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 16,
  },
});
