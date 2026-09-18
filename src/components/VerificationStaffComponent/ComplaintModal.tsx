import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

interface Props {
  visible: boolean;
  ticket?: any; // If provided, mode is View/Resolve; otherwise mode is Create New
  propertiesList?: any[]; // Passed when creating a new ticket to select property
  onClose: () => void;
  onSuccess?: () => void;
}

export const ComplaintModal: React.FC<Props> = ({
  visible,
  ticket,
  propertiesList = [],
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  const isResolveMode = Boolean(ticket);

  // Form State: Create Mode
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [category, setCategory] = useState("plumbing");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [raisedByRole, setRaisedByRole] = useState("tenant");
  const [raisedByName, setRaisedByName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");

  // Form State: Resolve Mode
  const [status, setStatus] = useState("in_progress");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || "in_progress");
      setResolutionNotes(ticket.resolutionNotes || "");
    } else {
      setSelectedPropertyId(propertiesList[0]?._id || "");
      setCategory("plumbing");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setRaisedByRole("tenant");
      setRaisedByName("");
      setTenantPhone("");
    }
  }, [ticket, visible, propertiesList]);

  const handleCreateTicket = async () => {
    if (!selectedPropertyId && propertiesList.length > 0) {
      Alert.alert("Required", "Please select a property for this ticket.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a title or issue summary.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        propertyId: selectedPropertyId || propertiesList[0]?._id,
        category,
        title: title.trim(),
        description: description.trim(),
        priority,
        raisedByRole,
        raisedByName: raisedByName.trim(),
        tenantPhone: tenantPhone.trim(),
      };

      await apiClient.post("/leads/complaints", payload);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Alert.alert("Ticket Logged 🎉", "Issue ticket has been created and assigned.");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message || "Could not create complaint ticket.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTicket = async () => {
    setSaving(true);
    try {
      const propertyId = ticket.propertyLeadId;
      const ticketId = ticket.ticketId || ticket._id;

      await apiClient.patch(`/leads/${propertyId}/complaints/${ticketId}`, {
        status,
        resolutionNotes: resolutionNotes.trim(),
      });

      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Alert.alert("Status Updated", `Complaint marked as ${status}.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message || "Could not update complaint ticket.");
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    { id: "plumbing", label: "Plumbing", icon: "droplet" },
    { id: "electrical", label: "Electrical", icon: "zap" },
    { id: "leakage", label: "Seepage / Leak", icon: "cloud-rain" },
    { id: "carpentry", label: "Carpentry", icon: "tool" },
    { id: "room_change", label: "Room Change", icon: "refresh-cw" },
    { id: "rent_issue", label: "Rent / Ledger", icon: "dollar-sign" },
    { id: "other", label: "Other", icon: "help-circle" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: textPrimary }]}>
                {isResolveMode ? `Ticket ${ticket.ticketId || "Details"}` : "Log Issue / Room Change"}
              </Text>
              <Text style={[styles.headerSub, { color: textSecondary }]}>
                {isResolveMode ? ticket.titleProperty || "Property" : "Field verification & maintenance support"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
              <Feather name="x" size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {isResolveMode ? (
              /* RESOLVE MODE */
              <View>
                <View style={[styles.ticketSummaryBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={[styles.ticketCatBadge, { color: "#0D9488" }]}>{(ticket.category || "issue").toUpperCase()}</Text>
                    <Text style={[styles.ticketPriorityText, { color: ticket.priority === "urgent" ? "#EF4444" : "#F59E0B" }]}>
                      {(ticket.priority || "MEDIUM").toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.ticketTitleText, { color: textPrimary }]}>{ticket.title}</Text>
                  {ticket.description ? (
                    <Text style={[styles.ticketDescText, { color: textSecondary }]}>{ticket.description}</Text>
                  ) : null}
                  <View style={{ marginTop: 8, borderTopWidth: 0.5, borderTopColor: borderCol, paddingTop: 6 }}>
                    <Text style={[styles.metaText, { color: textSecondary }]}>Raised By: {ticket.raisedByName || "Tenant"} ({ticket.raisedByRole || "tenant"})</Text>
                    {ticket.tenantPhone ? <Text style={[styles.metaText, { color: textSecondary }]}>Phone: {ticket.tenantPhone}</Text> : null}
                  </View>
                </View>

                {/* Status Selector */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Update Ticket Status</Text>
                  <View style={styles.pillRow}>
                    {[
                      { id: "open", label: "Open" },
                      { id: "in_progress", label: "In Progress" },
                      { id: "resolved", label: "Resolved" },
                      { id: "closed", label: "Closed" },
                    ].map((st) => (
                      <TouchableOpacity
                        key={st.id}
                        onPress={() => setStatus(st.id)}
                        style={[
                          styles.statusPill,
                          status === st.id && styles.statusPillActive,
                          { borderColor: status === st.id ? "#0D9488" : borderCol },
                        ]}
                      >
                        <Text style={[styles.statusPillText, { color: status === st.id ? "#0D9488" : textSecondary }]}>
                          {st.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Resolution Remarks */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Resolution Remarks / Action Taken</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                    placeholder="e.g. Plumber visited site, replaced gasket, tap tested OK."
                    placeholderTextColor={textSecondary}
                    multiline
                    numberOfLines={3}
                    value={resolutionNotes}
                    onChangeText={setResolutionNotes}
                  />
                </View>
              </View>
            ) : (
              /* CREATE MODE */
              <View>
                {/* Select Property */}
                {propertiesList.length > 0 && (
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Select Assigned Property</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                      {propertiesList.map((p) => {
                        const isSelected = selectedPropertyId === p._id;
                        return (
                          <TouchableOpacity
                            key={p._id}
                            onPress={() => setSelectedPropertyId(p._id)}
                            style={[
                              styles.propChip,
                              isSelected && styles.propChipActive,
                              { borderColor: isSelected ? "#0D9488" : borderCol, backgroundColor: isSelected ? "#0D948815" : isDark ? "#1E293B" : "#F8FAFC" },
                            ]}
                          >
                            <Text style={[styles.propChipTitle, { color: isSelected ? "#0D9488" : textPrimary }]}>
                              {p.title || `${p.propertyType} in ${p.locality}`}
                            </Text>
                            <Text style={[styles.propChipSub, { color: textSecondary }]}>{p.leadId || p.locality}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Category Picker */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Issue Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                    {categories.map((cat) => {
                      const isSelected = category === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => setCategory(cat.id)}
                          style={[
                            styles.catChip,
                            isSelected && styles.catChipActive,
                            { borderColor: isSelected ? "#0D9488" : borderCol, backgroundColor: isSelected ? "#0D948815" : isDark ? "#1E293B" : "#F8FAFC" },
                          ]}
                        >
                          <Feather name={cat.icon as any} size={14} color={isSelected ? "#0D9488" : textSecondary} style={{ marginRight: 6 }} />
                          <Text style={[styles.catChipText, { color: isSelected ? "#0D9488" : textSecondary }]}>{cat.label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Priority Selector */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Priority Level</Text>
                  <View style={styles.pillRow}>
                    {["low", "medium", "high", "urgent"].map((pr) => (
                      <TouchableOpacity
                        key={pr}
                        onPress={() => setPriority(pr)}
                        style={[
                          styles.statusPill,
                          priority === pr && styles.statusPillActive,
                          { borderColor: priority === pr ? "#0D9488" : borderCol },
                        ]}
                      >
                        <Text style={[styles.statusPillText, { color: priority === pr ? "#0D9488" : textSecondary, textTransform: "capitalize" }]}>
                          {pr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Title & Description */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Issue Summary *</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                    placeholder="e.g. Geyser tripping circuit in master bath"
                    placeholderTextColor={textSecondary}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Detailed Description / Room-Change Details</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                    placeholder="Provide context, tenant reason for request, urgency..."
                    placeholderTextColor={textSecondary}
                    multiline
                    numberOfLines={3}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Raised By (Name & Mobile)</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      style={[styles.textInput, { flex: 1, backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Person Name"
                      placeholderTextColor={textSecondary}
                      value={raisedByName}
                      onChangeText={setRaisedByName}
                    />
                    <TextInput
                      style={[styles.textInput, { flex: 1, backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Phone (Optional)"
                      placeholderTextColor={textSecondary}
                      keyboardType="phone-pad"
                      value={tenantPhone}
                      onChangeText={setTenantPhone}
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <TouchableOpacity onPress={onClose} style={[styles.cancelBtn, { borderColor: borderCol }]}>
              <Text style={{ color: textSecondary, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={isResolveMode ? handleUpdateTicket : handleCreateTicket}
              disabled={saving}
              style={styles.submitBtn}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>{isResolveMode ? "Save Status" : "Log Issue Ticket"}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    marginTop: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerSub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 60,
  },
  ticketSummaryBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  ticketCatBadge: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  ticketPriorityText: {
    fontSize: 10,
    fontWeight: "800",
  },
  ticketTitleText: {
    fontSize: 15,
    fontWeight: "700",
  },
  ticketDescText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  metaText: {
    fontSize: 11,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  statusPillActive: {
    backgroundColor: "#0D948815",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  propChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  propChipActive: {
    borderColor: "#0D9488",
  },
  propChipTitle: {
    fontSize: 12,
    fontWeight: "700",
  },
  propChipSub: {
    fontSize: 10,
    marginTop: 2,
  },
  catChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  catChipActive: {
    borderColor: "#0D9488",
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    textAlignVertical: "top",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default ComplaintModal;
