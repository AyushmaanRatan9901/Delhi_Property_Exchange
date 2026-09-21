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
  Image,
  Dimensions,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

const { width } = Dimensions.get("window");

interface Props {
  visible: boolean;
  ticket?: any; // If provided, mode is View/Resolve; otherwise mode is Create New
  propertiesList?: any[]; // Passed when creating a new ticket to select property
  preselectedProperty?: any; // Optional property object to prefill
  onClose: () => void;
  onSuccess?: () => void;
}

export const ComplaintModal: React.FC<Props> = ({
  visible,
  ticket,
  propertiesList = [],
  preselectedProperty,
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
  const [category, setCategory] = useState("fake_scam");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"urgent" | "high" | "medium" | "low">("urgent");
  const [raisedByRole, setRaisedByRole] = useState("verification_staff");
  const [raisedByName, setRaisedByName] = useState("");
  const [tenantPhone, setTenantPhone] = useState("");

  // Proof Images state
  const [proofPhotos, setProofPhotos] = useState<string[]>([]);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Form State: Resolve Mode
  const [status, setStatus] = useState("in_progress");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const isScamCategory =
    category === "fake_scam" ||
    category === "owner_fraud" ||
    category === "misleading_media" ||
    category === "invalid_address";

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || "in_progress");
      setResolutionNotes(ticket.resolutionNotes || "");
      setProofPhotos(Array.isArray(ticket.photos) ? ticket.photos : []);
    } else {
      const initialPropId =
        preselectedProperty?._id ||
        (propertiesList.length > 0 ? propertiesList[0]._id : "");
      setSelectedPropertyId(initialPropId);
      setCategory("fake_scam");
      setTitle("Fake / Scam Property Reported during On-Ground Verification");
      setDescription("");
      setPriority("urgent");
      setRaisedByRole("verification_staff");
      setRaisedByName("");
      setTenantPhone("");
      setProofPhotos([]);
      setIsUploadingProof(false);
    }
  }, [ticket, visible, propertiesList, preselectedProperty]);

  // Handle Pick / Capture Proof Photo
  const handlePickProof = async (fromCamera: boolean) => {
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

      if (fromCamera) {
        const { status: permStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (permStatus !== "granted") {
          Alert.alert("Camera Permission", "Camera permission is required to capture proof photos.");
          return;
        }
      } else {
        const { status: permStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permStatus !== "granted") {
          Alert.alert("Gallery Permission", "Media library access is required to attach proof files.");
          return;
        }
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        // Instant visual feedback
        setProofPhotos((prev) => [...prev, localUri]);
        setIsUploadingProof(true);

        try {
          const filename = localUri.split("/").pop() || `proof_${Date.now()}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? `image/${match[1]}` : `image/jpeg`;

          const formData = new FormData();
          formData.append("file", {
            uri: localUri,
            name: filename,
            type: fileType,
          } as any);
          formData.append("slot", "scam_proof");

          const res = await apiClient.post("/leads/upload-media", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.data?.data?.url) {
            const serverUrl = res.data.data.url;
            setProofPhotos((prev) =>
              prev.map((p) => (p === localUri ? serverUrl : p))
            );
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          }
        } catch (uploadErr) {
          console.warn("Proof backend upload failed, keeping local URI:", uploadErr);
        } finally {
          setIsUploadingProof(false);
        }
      }
    } catch (err) {
      console.error("Error picking proof:", err);
      Alert.alert("Media Error", "Could not capture or pick proof photo.");
    }
  };

  const handleRemoveProof = (idx: number) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setProofPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuickAddScamReason = (reasonText: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setTitle(`[FRAUD ALERT] ${reasonText}`);
    setDescription((prev) =>
      prev ? `${prev}\n• ${reasonText}` : `On-ground audit confirmed: ${reasonText}. Requesting Super Admin to delete and flag property.`
    );
  };

  const handleQuickAddDemoProof = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setProofPhotos((prev) => [
      ...prev,
      "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80",
    ]);
  };

  // Submit New Complaint / Scam Report
  const handleCreateTicket = async () => {
    const targetPropId = selectedPropertyId || preselectedProperty?._id || propertiesList[0]?._id;
    if (!targetPropId) {
      Alert.alert("Required", "Please select a property to report.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Required", "Please enter a complaint title or reason.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        propertyId: targetPropId,
        category,
        title: title.trim(),
        description: description.trim() || (isScamCategory ? "Flagged for fraud/deletion with photographic proof." : "Issue logged by verification staff."),
        priority,
        raisedByRole,
        raisedByName: raisedByName.trim() || "Verification Officer",
        tenantPhone: tenantPhone.trim(),
        photos: proofPhotos,
      };

      await apiClient.post("/leads/complaints", payload);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Alert.alert(
        isScamCategory ? "Fraud Report Logged 🚨" : "Ticket Logged 🎉",
        isScamCategory
          ? "Property has been flagged as fake/scam with attached proof. Super Admin has been notified for deletion review."
          : "Issue ticket has been created successfully."
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert("Failed", err?.response?.data?.message || "Could not log complaint ticket.");
    } finally {
      setSaving(false);
    }
  };

  // Update Existing Ticket Status
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
    { id: "fake_scam", label: "🚨 Fake / Scam Property", icon: "alert-triangle", isScam: true },
    { id: "owner_fraud", label: "🚫 Owner Impersonation", icon: "user-x", isScam: true },
    { id: "misleading_media", label: "📸 Misleading Photos", icon: "camera-off", isScam: true },
    { id: "invalid_address", label: "⚠️ Non-Existent Address", icon: "map-pin", isScam: true },
    { id: "maintenance", label: "🔧 Maintenance & Repair", icon: "tool", isScam: false },
    { id: "room_change", label: "🔄 Room Change Request", icon: "refresh-cw", isScam: false },
    { id: "rent_issue", label: "💰 Rent / Ledger Dispute", icon: "dollar-sign", isScam: false },
    { id: "other", label: "❓ Other Inquiry", icon: "help-circle", isScam: false },
  ];

  const scamReasons = [
    "Property does not exist at physical address",
    "Owner unreachable / fake mobile number",
    "Stolen photos from another building",
    "Different owner residing on site (Broker scam)",
    "Tenant demanded advance money without visit",
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                borderBottomColor: borderCol,
                backgroundColor: isScamCategory && !isResolveMode ? (isDark ? "#2D1215" : "#FEF2F2") : isDark ? "#1E293B" : "#FFFFFF",
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                {isScamCategory && !isResolveMode ? (
                  <View style={styles.fraudPill}>
                    <Text style={styles.fraudPillText}>SCAM / DELETION REPORT</Text>
                  </View>
                ) : null}
                <Text style={[styles.headerTitle, { color: isScamCategory && !isResolveMode ? "#EF4444" : textPrimary }]}>
                  {isResolveMode
                    ? `Ticket ${ticket.ticketId || "Details"}`
                    : isScamCategory
                    ? "Report Fake Property & Request Deletion"
                    : "Log Issue / Complaint"}
                </Text>
              </View>
              <Text style={[styles.headerSub, { color: textSecondary }]}>
                {isResolveMode
                  ? ticket.titleProperty || "Property Record"
                  : "On-ground audit evidence & field investigation"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
              <Feather name="x" size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {isResolveMode ? (
              /* ── RESOLVE / VIEW MODE ── */
              <View>
                <View style={[styles.ticketSummaryBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol }]}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={[styles.ticketCatBadge, { color: ticket.category?.includes("scam") || ticket.category?.includes("fraud") ? "#EF4444" : "#0D9488" }]}>
                      {(ticket.category || "issue").replace("_", " ").toUpperCase()}
                    </Text>
                    <Text style={[styles.ticketPriorityText, { color: ticket.priority === "urgent" ? "#EF4444" : "#F59E0B" }]}>
                      {(ticket.priority || "MEDIUM").toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.ticketTitleText, { color: textPrimary }]}>{ticket.title}</Text>
                  {ticket.description ? (
                    <Text style={[styles.ticketDescText, { color: textSecondary }]}>{ticket.description}</Text>
                  ) : null}

                  {/* Attached Evidence Gallery in Ticket */}
                  {Array.isArray(ticket.photos) && ticket.photos.length > 0 && (
                    <View style={styles.evidenceSection}>
                      <Text style={[styles.evidenceLabel, { color: textPrimary }]}>Attached Photographic Proof ({ticket.photos.length}):</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        {ticket.photos.map((uri: string, idx: number) => (
                          <Image key={idx} source={{ uri }} style={styles.evidenceThumb} resizeMode="cover" />
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  <View style={{ marginTop: 10, borderTopWidth: 0.5, borderTopColor: borderCol, paddingTop: 8 }}>
                    <Text style={[styles.metaText, { color: textSecondary }]}>
                      Reported By: {ticket.raisedByName || "Staff"} ({ticket.raisedByRole || "verification_staff"})
                    </Text>
                    {ticket.tenantPhone ? (
                      <Text style={[styles.metaText, { color: textSecondary }]}>Phone: {ticket.tenantPhone}</Text>
                    ) : null}
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
                        onPress={() => {
                          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                          setStatus(st.id);
                        }}
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
                    placeholder="Enter resolution notes, admin action, or field investigation outcome..."
                    placeholderTextColor={textSecondary}
                    multiline
                    numberOfLines={3}
                    value={resolutionNotes}
                    onChangeText={setResolutionNotes}
                  />
                </View>
              </View>
            ) : (
              /* ── CREATE COMPLAINT / FRAUD REPORT MODE ── */
              <View>
                {/* Select Property */}
                {(propertiesList.length > 0 || preselectedProperty) && (
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Target Property</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                      {(preselectedProperty ? [preselectedProperty] : propertiesList).map((p) => {
                        const isSelected = selectedPropertyId === p._id;
                        return (
                          <TouchableOpacity
                            key={p._id}
                            onPress={() => {
                              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                              setSelectedPropertyId(p._id);
                            }}
                            style={[
                              styles.propChip,
                              isSelected && styles.propChipActive,
                              {
                                borderColor: isSelected ? "#0D9488" : borderCol,
                                backgroundColor: isSelected ? "#0D948815" : isDark ? "#1E293B" : "#F8FAFC",
                              },
                            ]}
                          >
                            <Text style={[styles.propChipTitle, { color: isSelected ? "#0D9488" : textPrimary }]}>
                              {p.title || `${p.propertyType} in ${p.locality}`}
                            </Text>
                            <Text style={[styles.propChipSub, { color: textSecondary }]}>
                              {p.leadId || p.locality}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}

                {/* Category Picker */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Complaint / Report Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                    {categories.map((cat) => {
                      const isSelected = category === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => {
                            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                            setCategory(cat.id);
                            if (cat.isScam) {
                              setPriority("urgent");
                            }
                          }}
                          style={[
                            styles.catChip,
                            isSelected && (cat.isScam ? styles.scamCatChipActive : styles.catChipActive),
                            {
                              borderColor: isSelected ? (cat.isScam ? "#EF4444" : "#0D9488") : borderCol,
                              backgroundColor: isSelected ? (cat.isScam ? "#EF444415" : "#0D948815") : isDark ? "#1E293B" : "#F8FAFC",
                            },
                          ]}
                        >
                          <Feather
                            name={cat.icon as any}
                            size={14}
                            color={isSelected ? (cat.isScam ? "#EF4444" : "#0D9488") : textSecondary}
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              styles.catChipText,
                              { color: isSelected ? (cat.isScam ? "#EF4444" : "#0D9488") : textSecondary, fontWeight: isSelected ? "700" : "500" },
                            ]}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* HIGH ALERT SCAM BANNER & QUICK REASONS */}
                {isScamCategory && (
                  <View style={[styles.scamAlertCard, { backgroundColor: isDark ? "#2A1215" : "#FEF2F2", borderColor: "#EF4444" }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                      <Feather name="shield-off" size={18} color="#EF4444" style={{ marginRight: 6 }} />
                      <Text style={styles.scamAlertTitle}>Request Super Admin Property Deletion</Text>
                    </View>
                    <Text style={[styles.scamAlertDesc, { color: isDark ? "#FCA5A5" : "#991B1B" }]}>
                      This ticket will flag this property lead as fraudulent. Attach photographic proof below so Super Admin can immediately ban and delete the record.
                    </Text>

                    <Text style={[styles.quickReasonHeader, { color: isDark ? "#FCA5A5" : "#7F1D1D" }]}>
                      Quick-Select Fraud Reasons:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }}>
                      {scamReasons.map((reason, idx) => (
                        <TouchableOpacity
                          key={idx}
                          onPress={() => handleQuickAddScamReason(reason)}
                          style={[styles.scamReasonChip, { backgroundColor: isDark ? "#3F1D24" : "#FEE2E2", borderColor: "#F87171" }]}
                        >
                          <Text style={[styles.scamReasonText, { color: isDark ? "#FECACA" : "#991B1B" }]}>
                            + {reason}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Priority Selector */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Priority Level</Text>
                  <View style={styles.pillRow}>
                    {(["urgent", "high", "medium", "low"] as const).map((pr) => {
                      const isSelected = priority === pr;
                      const activeColor = pr === "urgent" ? "#EF4444" : pr === "high" ? "#F97316" : "#0D9488";
                      return (
                        <TouchableOpacity
                          key={pr}
                          onPress={() => {
                            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                            setPriority(pr);
                          }}
                          style={[
                            styles.statusPill,
                            isSelected && { backgroundColor: activeColor + "15", borderColor: activeColor },
                            { borderColor: isSelected ? activeColor : borderCol },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusPillText,
                              { color: isSelected ? activeColor : textSecondary, fontWeight: isSelected ? "800" : "500", textTransform: "capitalize" },
                            ]}
                          >
                            {pr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Title & Description */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Issue / Fraud Summary *</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                    placeholder="e.g. Fake listing - location does not exist"
                    placeholderTextColor={textSecondary}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Detailed Audit Observation / Proof Description</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                    placeholder="Describe what was found on site, why it is fake/scam, or specific repair needed..."
                    placeholderTextColor={textSecondary}
                    multiline
                    numberOfLines={3}
                    value={description}
                    onChangeText={setDescription}
                  />
                </View>

                {/* ── PHOTOGRAPHIC PROOF UPLOAD SECTION ── */}
                <View style={[styles.proofUploadBox, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol }]}>
                  <View style={styles.proofHeaderRow}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Feather name="camera" size={16} color="#0D9488" style={{ marginRight: 6 }} />
                      <Text style={[styles.proofBoxTitle, { color: textPrimary }]}>
                        Photographic / Document Proof ({proofPhotos.length})
                      </Text>
                    </View>
                    {isUploadingProof && <ActivityIndicator size="small" color="#0D9488" />}
                  </View>
                  <Text style={[styles.proofBoxSub, { color: textSecondary }]}>
                    Attach live photos of wrong site, building board, fake registry docs, or damages:
                  </Text>

                  {/* Proof Thumbnails Grid */}
                  {proofPhotos.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.proofThumbsRow}>
                      {proofPhotos.map((uri, idx) => (
                        <View key={idx} style={styles.proofThumbWrap}>
                          <Image source={{ uri }} style={styles.proofThumbImg} resizeMode="cover" />
                          <TouchableOpacity onPress={() => handleRemoveProof(idx)} style={styles.removeProofBtn}>
                            <Feather name="trash-2" size={12} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}

                  {/* Action Buttons to Add Proof */}
                  <View style={styles.proofActionButtons}>
                    <TouchableOpacity
                      onPress={() => handlePickProof(true)}
                      style={[styles.proofBtn, { backgroundColor: "#0D9488" }]}
                    >
                      <Feather name="camera" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.proofBtnText}>Capture Camera Proof</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handlePickProof(false)}
                      style={[styles.proofBtn, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
                    >
                      <Feather name="image" size={14} color={textPrimary} style={{ marginRight: 6 }} />
                      <Text style={[styles.proofBtnText, { color: textPrimary }]}>Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleQuickAddDemoProof} style={styles.demoProofBtn}>
                      <Text style={styles.demoProofBtnText}>Sample</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Raised By Identity */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Reported By (Verification Officer / Staff)</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      style={[styles.textInput, { flex: 1, backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Staff Officer Name"
                      placeholderTextColor={textSecondary}
                      value={raisedByName}
                      onChangeText={setRaisedByName}
                    />
                    <TextInput
                      style={[styles.textInput, { flex: 1, backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Staff Mobile (Optional)"
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
              style={[
                styles.submitBtn,
                { backgroundColor: isScamCategory && !isResolveMode ? "#EF4444" : "#0D9488" },
              ]}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather
                    name={isResolveMode ? "check" : isScamCategory ? "alert-triangle" : "send"}
                    size={16}
                    color="#FFFFFF"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.submitBtnText}>
                    {isResolveMode
                      ? "Save Status"
                      : isScamCategory
                      ? "Submit Fraud Report & Request Deletion"
                      : "Submit Complaint Ticket"}
                  </Text>
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
  fraudPill: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fraudPillText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
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
  evidenceSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
  },
  evidenceLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  evidenceThumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
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
    backgroundColor: "rgba(13, 148, 136, 0.12)",
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
  scamCatChipActive: {
    borderColor: "#EF4444",
  },
  catChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  scamAlertCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  scamAlertTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#EF4444",
  },
  scamAlertDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  quickReasonHeader: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },
  scamReasonChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  scamReasonText: {
    fontSize: 11,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 65,
    textAlignVertical: "top",
  },
  proofUploadBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  proofHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  proofBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  proofBoxSub: {
    fontSize: 11,
    marginBottom: 10,
  },
  proofThumbsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  proofThumbWrap: {
    position: "relative",
    marginRight: 8,
  },
  proofThumbImg: {
    width: 65,
    height: 65,
    borderRadius: 8,
  },
  removeProofBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "rgba(239, 68, 68, 0.85)",
    padding: 4,
    borderRadius: 10,
  },
  proofActionButtons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  proofBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 8,
  },
  proofBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  demoProofBtn: {
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0D9488",
  },
  demoProofBtnText: {
    color: "#0D9488",
    fontSize: 11,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});

export default ComplaintModal;
