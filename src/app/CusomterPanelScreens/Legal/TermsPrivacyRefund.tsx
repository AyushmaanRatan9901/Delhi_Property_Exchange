import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TabType = "terms" | "privacy" | "refund";

const TermsPrivacyRefund = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    colors,
    moderateScale,
    spacing,
    radii,
    typography,
    layout,
    shadows,
    isDark,
  } = useResponsiveTheme();

  const [activeTab, setActiveTab] = useState<TabType>("terms");
  const [expandedSection, setExpandedSection] = useState<string | null>("t1");

  const toggleSection = (id: string) => {
    try {
      Haptics.selectionAsync();
    } catch (e) {}
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleDownloadPDF = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    Alert.alert(
      "Download Policy & Agreement PDF 📄",
      "Downloading the official Delhi Property Exchange Standard Tenant Agreement and Policy Document...",
      [{ text: "OK" }],
    );
  };

  const handleContactLegal = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    Linking.openURL("mailto:legal@delhipropertyexchange.com?subject=Tenant%20Policy%20Inquiry").catch(() => {
      Alert.alert(
        "Grievance Desk",
        "Email: grievance@delhipropertyexchange.com\nPhone: +91 11-4567-8900\nDelhi Property Exchange Legal Compliance Cell.",
      );
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? colors.background : "#F8FAFC" },
      ]}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Header */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.borderLight,
            paddingHorizontal: spacing.screenHorizontal,
            paddingVertical: spacing.sm + 2,
          },
        ]}
      >
        <View style={layout.horizontalViewBetween}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={[
              styles.iconBtn,
              {
                backgroundColor: isDark
                  ? colors.surfaceHover
                  : colors.surfaceLight,
                borderColor: colors.border,
                borderRadius: radii.pill,
              },
            ]}
          >
            <Feather
              name="arrow-left"
              size={moderateScale(18)}
              color={colors.textPrimary}
            />
          </TouchableOpacity>

          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: moderateScale(16),
                fontWeight: "800",
                color: colors.textPrimary,
              }}
            >
              Legal & Policy Desk
            </Text>
            <Text
              style={{
                fontSize: moderateScale(11),
                color: colors.textSecondary,
                fontWeight: "600",
                marginTop: 1,
              }}
            >
              Delhi Property Exchange Standards
            </Text>
          </View>

          {/* Download PDF button */}
          <TouchableOpacity
            onPress={handleDownloadPDF}
            activeOpacity={0.8}
            style={[
              styles.pdfHeaderBtn,
              {
                backgroundColor: isDark
                  ? colors.surfaceHover
                  : colors.primaryLight,
                borderRadius: radii.pill,
              },
            ]}
          >
            <Feather
              name="download"
              size={moderateScale(15)}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3-Way Policy Tab Selector */}
      <View
        style={[
          styles.tabBarContainer,
          {
            backgroundColor: colors.cardBackground,
            borderBottomColor: colors.borderLight,
            paddingHorizontal: spacing.screenHorizontal,
            paddingVertical: spacing.xs + 2,
          },
        ]}
      >
        <View
          style={[
            styles.tabBarTrack,
            {
              backgroundColor: isDark
                ? colors.surfaceHover
                : "#F1F5F9",
              borderRadius: radii.pill,
              padding: 3,
            },
          ]}
        >
          {/* Tab 1: Terms */}
          <TouchableOpacity
            onPress={() => {
              setActiveTab("terms");
              setExpandedSection("t1");
            }}
            activeOpacity={0.8}
            style={[
              styles.tabBtn,
              activeTab === "terms" && {
                backgroundColor: colors.cardBackground,
                borderRadius: radii.pill,
                ...shadows.sm,
              },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                {
                  fontSize: moderateScale(12),
                  fontWeight: activeTab === "terms" ? "800" : "600",
                  color:
                    activeTab === "terms"
                      ? colors.primary
                      : colors.textSecondary,
                },
              ]}
            >
              Terms of Stay
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Privacy */}
          <TouchableOpacity
            onPress={() => {
              setActiveTab("privacy");
              setExpandedSection("p1");
            }}
            activeOpacity={0.8}
            style={[
              styles.tabBtn,
              activeTab === "privacy" && {
                backgroundColor: colors.cardBackground,
                borderRadius: radii.pill,
                ...shadows.sm,
              },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                {
                  fontSize: moderateScale(12),
                  fontWeight: activeTab === "privacy" ? "800" : "600",
                  color:
                    activeTab === "privacy"
                      ? colors.primary
                      : colors.textSecondary,
                },
              ]}
            >
              Privacy & Data
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Refund */}
          <TouchableOpacity
            onPress={() => {
              setActiveTab("refund");
              setExpandedSection("r1");
            }}
            activeOpacity={0.8}
            style={[
              styles.tabBtn,
              activeTab === "refund" && {
                backgroundColor: colors.cardBackground,
                borderRadius: radii.pill,
                ...shadows.sm,
              },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                {
                  fontSize: moderateScale(12),
                  fontWeight: activeTab === "refund" ? "800" : "600",
                  color:
                    activeTab === "refund"
                      ? "#15803D"
                      : colors.textSecondary,
                },
              ]}
            >
              Refund Policy
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenHorizontal,
          paddingTop: spacing.md,
          paddingBottom: insets.bottom + moderateScale(40),
          gap: spacing.lg,
        }}
      >
        {/* Trust Seal Banner */}
        <View
          style={[
            styles.trustBanner,
            {
              backgroundColor: isDark
                ? "rgba(30, 58, 138, 0.2)"
                : "#EFF6FF",
              borderColor: isDark ? "#1E40AF" : "#BFDBFE",
              borderRadius: radii.xxl,
              padding: spacing.md + 2,
            },
          ]}
        >
          <View style={layout.horizontalView}>
            <View
              style={[
                styles.sealIconBox,
                { backgroundColor: colors.primary, borderRadius: radii.xl },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={moderateScale(24)}
                color="#FFFFFF"
              />
            </View>
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text
                style={{
                  fontSize: moderateScale(13.5),
                  fontWeight: "800",
                  color: isDark ? "#93C5FD" : "#1E40AF",
                }}
              >
                100% Zero-Brokerage Assurance
              </Text>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  color: colors.textSecondary,
                  marginTop: 2,
                  lineHeight: moderateScale(15),
                }}
              >
                Delhi Property Exchange directly manages tenant contracts,
                deposit security, and owner transparency.
              </Text>
            </View>
          </View>
        </View>

        {/* TAB 1: TERMS OF SERVICE */}
        {activeTab === "terms" && (
          <View style={{ gap: spacing.sm }}>
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(14.5),
                  fontWeight: "800",
                  color: colors.textPrimary,
                  marginBottom: 2,
                },
              ]}
            >
                Standard Tenant & Living Agreement
              </Text>

              {/* Clause 1 */}
              <TouchableOpacity
                onPress={() => toggleSection("t1")}
                activeOpacity={0.85}
                style={[
                  styles.accordionCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                  shadows.sm,
                ]}
              >
                <View style={layout.horizontalViewBetween}>
                  <View style={layout.horizontalView}>
                    <Text style={[styles.clauseNum, { color: colors.primary }]}>
                      01
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13.5),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      Monthly Rent & Payment Due Dates
                    </Text>
                  </View>
                  <Feather
                    name={
                      expandedSection === "t1" ? "chevron-up" : "chevron-down"
                    }
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </View>

                {expandedSection === "t1" && (
                  <View
                    style={[
                      styles.accordionBody,
                      { borderTopColor: colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.clauseBodyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      • Monthly rent is due on or before the 5th of each calendar
                      month.
                      {"\n"}• Automated receipts with GST invoice numbers are
                      generated instantly in your DPX App for easy HRA tax
                      exemptions.
                      {"\n"}• A grace period of 3 business days is provided
                      before a nominal late fee is charged.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Clause 2 */}
              <TouchableOpacity
                onPress={() => toggleSection("t2")}
                activeOpacity={0.85}
                style={[
                  styles.accordionCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                  shadows.sm,
                ]}
              >
                <View style={layout.horizontalViewBetween}>
                  <View style={layout.horizontalView}>
                    <Text style={[styles.clauseNum, { color: colors.primary }]}>
                      02
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13.5),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      30-Day Notice Period & Lock-in
                    </Text>
                  </View>
                  <Feather
                    name={
                      expandedSection === "t2" ? "chevron-up" : "chevron-down"
                    }
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </View>

                {expandedSection === "t2" && (
                  <View
                    style={[
                      styles.accordionBody,
                      { borderTopColor: colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.clauseBodyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      • Tenants must provide a minimum of 30 days notice
                      directly through the DPX customer mobile app.
                      {"\n"}• Standard initial lock-in period is 3 months unless
                      otherwise stated in custom executive leases.
                      {"\n"}• Early move-out prior to lock-in follows standard
                      pro-rata settlement.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Clause 3 */}
              <TouchableOpacity
                onPress={() => toggleSection("t3")}
                activeOpacity={0.85}
                style={[
                  styles.accordionCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                  shadows.sm,
                ]}
              >
                <View style={layout.horizontalViewBetween}>
                  <View style={layout.horizontalView}>
                    <Text style={[styles.clauseNum, { color: colors.primary }]}>
                      03
                    </Text>
                    <Text
                      style={{
                        fontSize: moderateScale(13.5),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      Visitor, Guest & Quiet Hours Policy
                    </Text>
                  </View>
                  <Feather
                    name={
                      expandedSection === "t3" ? "chevron-up" : "chevron-down"
                    }
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </View>

                {expandedSection === "t3" && (
                  <View
                    style={[
                      styles.accordionBody,
                      { borderTopColor: colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.clauseBodyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      • Day visitors are welcome between 8:00 AM and 10:00 PM
                      with digital QR gate logging.
                      {"\n"}• Quiet hours are observed from 11:00 PM to 6:30 AM
                      to maintain a peaceful work & study environment.
                      {"\n"}• Overnight stays for immediate family members can
                      be requested via the Caretaker desk.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
        )}

        {/* TAB 2: PRIVACY POLICY */}
        {activeTab === "privacy" && (
          <View style={{ gap: spacing.sm }}>
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(14.5),
                  fontWeight: "800",
                  color: colors.textPrimary,
                  marginBottom: 2,
                },
              ]}
            >
                Data Privacy & Encryption Safeguards
              </Text>

              {/* Privacy Item 1 */}
              <TouchableOpacity
                onPress={() => toggleSection("p1")}
                activeOpacity={0.85}
                style={[
                  styles.accordionCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                  shadows.sm,
                ]}
              >
                <View style={layout.horizontalViewBetween}>
                  <View style={layout.horizontalView}>
                    <Ionicons
                      name="lock-closed"
                      size={moderateScale(16)}
                      color="#2563EB"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(13.5),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      Aadhaar & KYC Document Masking
                    </Text>
                  </View>
                  <Feather
                    name={
                      expandedSection === "p1" ? "chevron-up" : "chevron-down"
                    }
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </View>

                {expandedSection === "p1" && (
                  <View
                    style={[
                      styles.accordionBody,
                      { borderTopColor: colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.clauseBodyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      • All government IDs uploaded for tenant verification are
                      cryptographically masked (only the last 4 digits are stored
                      in plain text).
                      {"\n"}• Documents are used exclusively for Delhi Police
                      Tenant Verification filing and never shared with commercial
                      data brokers.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Privacy Item 2 */}
              <TouchableOpacity
                onPress={() => toggleSection("p2")}
                activeOpacity={0.85}
                style={[
                  styles.accordionCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                  shadows.sm,
                ]}
              >
                <View style={layout.horizontalViewBetween}>
                  <View style={layout.horizontalView}>
                    <Ionicons
                      name="eye-off"
                      size={moderateScale(16)}
                      color="#059669"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(13.5),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      Zero Spam & Telemarketing Promise
                    </Text>
                  </View>
                  <Feather
                    name={
                      expandedSection === "p2" ? "chevron-up" : "chevron-down"
                    }
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </View>

                {expandedSection === "p2" && (
                  <View
                    style={[
                      styles.accordionBody,
                      { borderTopColor: colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.clauseBodyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      • Your phone number and email address are never sold or
                      distributed to third-party lenders, brokers, or advertisers.
                      {"\n"}• Communications are strictly limited to payment
                      receipts, maintenance updates, and verified property
                      alerts.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
        )}

        {/* TAB 3: REFUND & DEPOSIT POLICY */}
        {activeTab === "refund" && (
          <View style={{ gap: spacing.sm }}>
            <Text
              style={[
                typography.sectionTitle,
                {
                  fontSize: moderateScale(14.5),
                  fontWeight: "800",
                  color: colors.textPrimary,
                  marginBottom: 2,
                },
              ]}
            >
                Deposit Protection & Refund Timeline
              </Text>

              {/* Refund Item 1 */}
              <TouchableOpacity
                onPress={() => toggleSection("r1")}
                activeOpacity={0.85}
                style={[
                  styles.accordionCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                  shadows.sm,
                ]}
              >
                <View style={layout.horizontalViewBetween}>
                  <View style={layout.horizontalView}>
                    <MaterialCommunityIcons
                      name="cash-refund"
                      size={moderateScale(18)}
                      color="#16A34A"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(13.5),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      7-Day Security Deposit Refund Guarantee
                    </Text>
                  </View>
                  <Feather
                    name={
                      expandedSection === "r1" ? "chevron-up" : "chevron-down"
                    }
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </View>

                {expandedSection === "r1" && (
                  <View
                    style={[
                      styles.accordionBody,
                      { borderTopColor: colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.clauseBodyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      • Your security deposit is held in a dedicated DPX Escrow
                      Trust Account.
                      {"\n"}• Upon checkout inspection, 100% of your eligible
                      deposit is refunded directly to your linked UPI / Bank
                      account within 7 business days.
                      {"\n"}• Transparent deductions (only electricity unit
                      settlement and documented structural damages).
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Refund Item 2 */}
              <TouchableOpacity
                onPress={() => toggleSection("r2")}
                activeOpacity={0.85}
                style={[
                  styles.accordionCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                    borderRadius: radii.xl,
                    padding: spacing.md,
                  },
                  shadows.sm,
                ]}
              >
                <View style={layout.horizontalViewBetween}>
                  <View style={layout.horizontalView}>
                    <Ionicons
                      name="calendar"
                      size={moderateScale(16)}
                      color="#2563EB"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        fontSize: moderateScale(13.5),
                        fontWeight: "700",
                        color: colors.textPrimary,
                      }}
                    >
                      Token Booking Cancellation & Free Visits
                    </Text>
                  </View>
                  <Feather
                    name={
                      expandedSection === "r2" ? "chevron-up" : "chevron-down"
                    }
                    size={moderateScale(16)}
                    color={colors.textSecondary}
                  />
                </View>

                {expandedSection === "r2" && (
                  <View
                    style={[
                      styles.accordionBody,
                      { borderTopColor: colors.borderLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.clauseBodyText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      • 100% full refund on pre-booking tokens if cancelled
                      within 24 hours of site visit.
                      {"\n"}• Property scheduled visits and guided caretaker tours
                      are always 100% free of charge.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
        )}

        {/* Contact Legal & Grievance Desk Action Card */}
        <View
          style={[
            styles.legalDeskCard,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              borderRadius: radii.xxl,
              padding: spacing.md + 2,
            },
            shadows.sm,
          ]}
        >
          <Text
            style={{
              fontSize: moderateScale(14),
              fontWeight: "800",
              color: colors.textPrimary,
            }}
          >
            Have a Question or Grievance?
          </Text>
          <Text
            style={{
              fontSize: moderateScale(11.5),
              color: colors.textSecondary,
              marginTop: 2,
              lineHeight: moderateScale(16),
            }}
          >
            Our Legal Compliance & Grievance Cell ensures all tenant agreements
            adhere to the Delhi Rent Control Act & Model Tenancy Act.
          </Text>

          <View
            style={[
              layout.horizontalView,
              { marginTop: spacing.md, gap: spacing.sm },
            ]}
          >
            <TouchableOpacity
              onPress={handleContactLegal}
              activeOpacity={0.8}
              style={[
                styles.contactLegalBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radii.xl,
                  flex: 1,
                },
              ]}
            >
              <Feather
                name="mail"
                size={moderateScale(14)}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(12.5),
                  fontWeight: "700",
                  color: "#FFFFFF",
                }}
              >
                Email Grievance Cell
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDownloadPDF}
              activeOpacity={0.8}
              style={[
                styles.contactLegalBtn,
                {
                  backgroundColor: isDark
                    ? colors.surfaceHover
                    : colors.surfaceLight,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: radii.xl,
                  flex: 1,
                },
              ]}
            >
              <Feather
                name="file-text"
                size={moderateScale(14)}
                color={colors.textPrimary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: moderateScale(12.5),
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
                Sample PDF
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsPrivacyRefund;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  pdfHeaderBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBarContainer: {
    borderBottomWidth: 1,
  },
  tabBarTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtnText: {
    letterSpacing: 0.1,
  },
  trustBanner: {
    borderWidth: 1,
  },
  sealIconBox: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  accordionCard: {
    borderWidth: 1,
  },
  clauseNum: {
    fontSize: 14,
    fontWeight: "900",
    marginRight: 8,
  },
  accordionBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  clauseBodyText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  legalDeskCard: {
    borderWidth: 1,
  },
  contactLegalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
  },
});
