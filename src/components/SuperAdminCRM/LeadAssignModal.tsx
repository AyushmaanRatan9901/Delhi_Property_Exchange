import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { CallerItem, CRMLeadItem } from "../../services/superAdminCrmApi";

interface LeadAssignModalProps {
  visible: boolean;
  lead: CRMLeadItem | null;
  callers: CallerItem[];
  onClose: () => void;
  onAssign: (leadId: string, callerId: string, reason?: string) => Promise<void>;
}

export const LeadAssignModal: React.FC<LeadAssignModalProps> = ({
  visible,
  lead,
  callers,
  onClose,
  onAssign,
}) => {
  const { isDark, colors } = useResponsiveTheme();
  const [selectedCallerId, setSelectedCallerId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!lead) return null;

  const handleConfirm = async () => {
    if (!selectedCallerId) return;
    try {
      setSubmitting(true);
      await onAssign(lead._id, selectedCallerId, reason);
      setSelectedCallerId("");
      setReason("");
      onClose();
    } catch (err) {
      console.error("Assign error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const activeCallers = callers.filter((c) => c.caller.status === "active");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                {lead.assignedTo ? "Reassign Lead" : "Assign Lead to Caller"}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {lead.name} • {lead.leadId}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Caller Selection List */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            SELECT TELE-CALLER ({activeCallers.length} Active):
          </Text>

          <ScrollView style={styles.callerList} showsVerticalScrollIndicator={false}>
            {activeCallers.map((item) => {
              const isSelected = selectedCallerId === item.caller.id;
              const isCurrentlyAssigned = lead.assignedTo?._id === item.caller.id;

              return (
                <TouchableOpacity
                  key={item.caller.id}
                  style={[
                    styles.callerRow,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + "15"
                        : isDark
                        ? "#1E293B"
                        : "#F8FAFC",
                      borderColor: isSelected
                        ? colors.primary
                        : isDark
                        ? "#334155"
                        : "#E2E8F0",
                    },
                  ]}
                  onPress={() => setSelectedCallerId(item.caller.id)}
                >
                  <View style={styles.callerAvatar}>
                    <Text style={styles.avatarText}>
                      {item.caller.name.substring(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.callerInfo}>
                    <Text
                      style={[
                        styles.callerName,
                        { color: isDark ? "#FFFFFF" : "#0F172A" },
                      ]}
                    >
                      {item.caller.name} {isCurrentlyAssigned ? " (Current)" : ""}
                    </Text>
                    <Text style={[styles.callerWorkload, { color: colors.textMuted }]}>
                      Workload: {item.statistics.totalLeads} Leads • {item.pendingFollowUps} Pending Flp
                    </Text>
                  </View>
                  <Ionicons
                    name={isSelected ? "radio-button-on" : "radio-button-off"}
                    size={20}
                    color={isSelected ? colors.primary : "#94A3B8"}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Optional reason / instructions */}
          <View style={styles.reasonBox}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Assignment Notes / Reason (Optional):
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                  borderColor: colors.border,
                  color: isDark ? "#FFFFFF" : "#0F172A",
                },
              ]}
              placeholder="e.g. VIP client, requires urgent follow-up..."
              placeholderTextColor={colors.textMuted}
              value={reason}
              onChangeText={setReason}
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              {
                backgroundColor: selectedCallerId ? "#0D9488" : "#94A3B8",
              },
            ]}
            onPress={handleConfirm}
            disabled={!selectedCallerId || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.confirmBtnText}>
                {lead.assignedTo ? "Confirm Reassignment" : "Confirm Assignment"}
              </Text>
            )}
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
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  callerList: {
    maxHeight: 220,
  },
  callerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  callerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0D9488",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  callerInfo: {
    flex: 1,
  },
  callerName: {
    fontSize: 13,
    fontWeight: "600",
  },
  callerWorkload: {
    fontSize: 11,
    marginTop: 2,
  },
  reasonBox: {
    marginTop: 10,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
  },
  confirmBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
