import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../../constants/theme";

export default function ListStayScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, moderateScale, spacing, radii, typography, layout, shadows } = useResponsiveTheme();

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
          <View>
            <Text style={styles.panelBadge}>HOUSE OWNER</Text>
            <Text style={styles.headerTitle}>List Stay</Text>
          </View>
          <View style={styles.headerIconCircle}>
            <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>Create a new property listing with photos and pricing</Text>
      </LinearGradient>

      {/* Content Body */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Metric Quick Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>1</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Drafts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>5</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Approved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>2 hrs</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Approval</Text>
          </View>
        </View>

        {/* Feature Section Card */}
        <View style={[styles.card, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? "rgba(13, 148, 136, 0.2)" : "#CCFBF1" }]}>
              <Ionicons name="add-circle" size={20} color="#0D9488" />
            </View>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>List Stay Management</Text>
          </View>

          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Welcome to the House Owner List Stay portal. Manage and monitor real-time records, activities, and operational workflows directly from this screen.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.primaryBtn, { backgroundColor: "#0D9488" }]}
          >
            <Text style={styles.primaryBtnText}>Add New Property</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        {/* Recent Activity / Status Notice */}
        <View style={[styles.noticeCard, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9", borderColor: colors.borderLight }]}>
          <Feather name="info" size={18} color="#0D9488" />
          <Text style={[styles.noticeText, { color: colors.textMuted }]}>
            All updates on this screen sync in real-time with the Delhi Property Exchange backend engine.
          </Text>
        </View>
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
  },
  panelBadge: {
    color: "#99F6E4",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSubtitle: {
    color: "#CCFBF1",
    fontSize: 13,
    marginTop: 6,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
