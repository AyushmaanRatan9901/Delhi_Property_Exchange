import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CRMCallItem } from "../../services/superAdminCrmApi";

interface AISummaryModalProps {
  visible: boolean;
  call: CRMCallItem | null;
  summaryData: any;
  loading: boolean;
  onClose: () => void;
}

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  visible,
  call,
  summaryData,
  loading,
  onClose,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  if (!call) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="robot" size={22} color="#6366F1" />
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                AI Call Analysis
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Extracting structured requirements & sentiment...
              </Text>
            </View>
          ) : summaryData ? (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Executive Summary */}
              <View
                style={[
                  styles.summaryBox,
                  {
                    backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                  },
                ]}
              >
                <Text style={[styles.boxLabel, { color: "#6366F1" }]}>EXECUTIVE SUMMARY</Text>
                <Text style={[styles.summaryText, { color: isDark ? "#E2E8F0" : "#1E293B" }]}>
                  {summaryData.summary || "No summary text generated."}
                </Text>
              </View>

              {/* Extracted Requirements Grid */}
              <Text style={[styles.sectionTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Extracted Requirements
              </Text>

              <View style={styles.gridRow}>
                <View
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Purpose</Text>
                  <Text style={[styles.gridVal, { color: "#0D9488" }]}>
                    {summaryData.requirements?.purpose?.toUpperCase() || "RENT"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Configuration</Text>
                  <Text style={[styles.gridVal, { color: "#3B82F6" }]}>
                    {summaryData.requirements?.bhk ? `${summaryData.requirements.bhk} BHK` : "Any"}
                  </Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Budget Range</Text>
                  <Text style={[styles.gridVal, { color: "#10B981" }]}>
                    ₹{summaryData.requirements?.budget?.min?.toLocaleString("en-IN") || 0} - ₹{summaryData.requirements?.budget?.max?.toLocaleString("en-IN") || 0}
                  </Text>
                </View>

                <View
                  style={[
                    styles.gridItem,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <Text style={[styles.gridLabel, { color: colors.textSecondary }]}>Furnishing</Text>
                  <Text style={[styles.gridVal, { color: "#8B5CF6" }]}>
                    {summaryData.requirements?.furnishing?.replace("_", " ")?.toUpperCase() || "ANY"}
                  </Text>
                </View>
              </View>

              {/* Signals */}
              <View style={styles.signalsRow}>
                <View style={styles.signalBadge}>
                  <Text style={styles.signalLabel}>Interest Level:</Text>
                  <Text
                    style={[
                      styles.signalVal,
                      {
                        color:
                          summaryData.interestLevel === "high"
                            ? "#15803D"
                            : summaryData.interestLevel === "low"
                            ? "#DC2626"
                            : "#D97706",
                      },
                    ]}
                  >
                    {summaryData.interestLevel?.toUpperCase() || "MEDIUM"}
                  </Text>
                </View>

                <View style={styles.signalBadge}>
                  <Text style={styles.signalLabel}>Next Action:</Text>
                  <Text style={[styles.signalVal, { color: "#2563EB" }]}>
                    {summaryData.nextAction?.replace("_", " ")?.toUpperCase() || "FOLLOW UP"}
                  </Text>
                </View>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No AI summary available for this call log.
              </Text>
            </View>
          )}

          {/* Footer */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  closeBtn: {
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    textAlign: "center",
  },
  content: {
    marginVertical: 4,
  },
  summaryBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  boxLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  gridItem: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  gridVal: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  signalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 12,
    gap: 8,
  },
  signalBadge: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  signalLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  signalVal: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
  },
  doneBtn: {
    backgroundColor: "#6366F1",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
