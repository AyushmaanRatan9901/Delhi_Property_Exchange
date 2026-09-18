import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  Dimensions,
} from "react-native";
import { Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

const { width } = Dimensions.get("window");

interface Props {
  visible: boolean;
  lead: any;
  onClose: () => void;
  onSuccess?: () => void;
}

type StepType = 1 | 2 | 3 | 4;

export const PropertyVerificationModal: React.FC<Props> = ({
  visible,
  lead,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [publishing, setPublishing] = useState(false);

  // Step 1: Specs & Inspection Form
  const [carpetArea, setCarpetArea] = useState("");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("2");
  const [balconies, setBalconies] = useState("1");
  const [floorNo, setFloorNo] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [condition, setCondition] = useState("good");
  const [negotiablePrice, setNegotiablePrice] = useState("");
  const [keysAvailable, setKeysAvailable] = useState(true);
  const [visitDone, setVisitDone] = useState(true);
  const [docsVerified, setDocsVerified] = useState(true);
  const [billChecked, setBillChecked] = useState(true);
  const [inspectionRemarks, setInspectionRemarks] = useState("");

  // Step 2: KYC & Duplicate Aadhaar Check
  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [panCard, setPanCard] = useState("");
  const [aadhaarWarning, setAadhaarWarning] = useState<string | null>(null);
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);

  // Step 3: Guided Media Capture Slots
  const [mediaSlots, setMediaSlots] = useState<{ [key: string]: string }>({
    parking: "",
    stairs: "",
    livingRoom: "",
    kitchen: "",
    bedroom: "",
    bathroom: "",
    balcony: "",
    videoUrl: "",
  });

  // Step 4: Confirmation State
  const [confirmLockChecked, setConfirmLockChecked] = useState(false);

  useEffect(() => {
    if (lead) {
      setCurrentStep(1);
      setCarpetArea(String(lead.inspectionDetails?.actualCarpetAreaSqFt || ""));
      setBedrooms(String(lead.inspectionDetails?.actualBedrooms || (lead.propertyType?.includes("1") ? "1" : lead.propertyType?.includes("3") ? "3" : "2")));
      setBathrooms(String(lead.inspectionDetails?.actualBathrooms || "2"));
      setBalconies(String(lead.inspectionDetails?.actualBalconies || "1"));
      setFloorNo(String(lead.inspectionDetails?.floorNumber || ""));
      setTotalFloors(String(lead.inspectionDetails?.totalFloors || ""));
      setCondition(lead.inspectionDetails?.propertyCondition || "good");
      setNegotiablePrice(String(lead.inspectionDetails?.negotiablePriceMin || lead.expectedPrice || ""));
      setKeysAvailable(lead.inspectionDetails?.keysAvailable ?? true);
      setVisitDone(lead.inspectionDetails?.physicalVisitDone ?? true);
      setDocsVerified(lead.inspectionDetails?.ownershipDocsVerified ?? true);
      setBillChecked(lead.inspectionDetails?.electricityBillChecked ?? true);
      setInspectionRemarks(lead.inspectionDetails?.staffChecklistRemarks || "");

      setAadhaarLast4(lead.ownerAadhaarLast4 || "");
      setPanCard(lead.ownerPanCard || "");
      setAadhaarWarning(null);

      // Pre-fill existing photos
      const existingPhotos = lead.photos?.map((p: any) => (typeof p === "string" ? p : p.url)) || lead.images || [];
      setMediaSlots({
        parking: existingPhotos[0] || "",
        stairs: existingPhotos[1] || "",
        livingRoom: existingPhotos[2] || "",
        kitchen: existingPhotos[3] || "",
        bedroom: existingPhotos[4] || "",
        bathroom: existingPhotos[5] || "",
        balcony: existingPhotos[6] || "",
        videoUrl: lead.videoUrl || lead.videoLink || "",
      });

      setConfirmLockChecked(false);
    }
  }, [lead, visible]);

  if (!lead) return null;

  // Real-time Aadhaar last-4 duplicate check
  const handleAadhaarChange = async (text: string) => {
    const clean = text.replace(/\D/g, "").slice(0, 4);
    setAadhaarLast4(clean);
    if (clean.length === 4) {
      setCheckingAadhaar(true);
      try {
        const res = await apiClient.get(`/leads/check-aadhaar?last4=${clean}&excludeId=${lead._id}`);
        if (res.data?.data?.isDuplicate) {
          setAadhaarWarning(res.data.data.warningMessage || "Duplicate Aadhaar detected in system!");
          try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
        } else {
          setAadhaarWarning(null);
        }
      } catch (err) {
        setAadhaarWarning(null);
      } finally {
        setCheckingAadhaar(false);
      }
    } else {
      setAadhaarWarning(null);
    }
  };

  const handleMediaUrlInput = (key: string, url: string) => {
    setMediaSlots((prev) => ({ ...prev, [key]: url.trim() }));
  };

  const handleQuickAddDemoPhoto = (key: string) => {
    const demoPhotos: { [key: string]: string } = {
      parking: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80",
      stairs: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
      livingRoom: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
      kitchen: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
      bedroom: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?auto=format&fit=crop&w=600&q=80",
      bathroom: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
      balcony: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
      videoUrl: "https://youtube.com/watch?v=sample-walkthrough",
    };
    setMediaSlots((prev) => ({ ...prev, [key]: demoPhotos[key] || "" }));
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  };

  // Final Publish and Lock Handler
  const handlePublishListing = async () => {
    if (!confirmLockChecked) {
      Alert.alert("Confirmation Required", "Please check the confirmation box acknowledging that this listing will be locked and PII will be masked.");
      return;
    }

    setPublishing(true);
    try {
      const photosArray = Object.entries(mediaSlots)
        .filter(([k, v]) => k !== "videoUrl" && Boolean(v) && v.startsWith("http"))
        .map(([k, v]) => v);

      const payload = {
        actualCarpetAreaSqFt: Number(carpetArea) || undefined,
        actualBedrooms: Number(bedrooms) || undefined,
        actualBathrooms: Number(bathrooms) || undefined,
        actualBalconies: Number(balconies) || undefined,
        floorNumber: Number(floorNo) || undefined,
        totalFloors: Number(totalFloors) || undefined,
        propertyCondition: condition,
        negotiablePriceMin: Number(negotiablePrice) || lead.expectedPrice,
        keysAvailable,
        physicalVisitDone: visitDone,
        ownershipDocsVerified: docsVerified,
        electricityBillChecked: billChecked,
        staffChecklistRemarks: inspectionRemarks.trim() || "Inspected on-site, verified specs & KYC.",
        ownerAadhaarLast4: aadhaarLast4,
        ownerPanCard: panCard.toUpperCase(),
        photos: photosArray.length > 0 ? photosArray : undefined,
        videoUrl: mediaSlots.videoUrl || undefined,
      };

      await apiClient.post(`/leads/${lead._id}/publish-inspection`, payload);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Alert.alert("Listing Published & Locked 🎉", `Property ${lead.leadId || lead._id} is now verified and live on the internal exchange! PII has been securely masked.`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert("Publish Failed", err?.response?.data?.message || "Could not publish verification record.");
    } finally {
      setPublishing(false);
    }
  };

  const stepsConfig = [
    { num: 1, label: "Specs & Checklist", icon: "check-square" },
    { num: 2, label: "KYC & Aadhaar", icon: "shield" },
    { num: 3, label: "Photo / Video", icon: "camera" },
    { num: 4, label: "Publish & Lock", icon: "lock" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={[styles.stepBadge, { backgroundColor: "#0D948820" }]}>
                  <Text style={styles.stepBadgeText}>ON-GROUND VERIFICATION</Text>
                </View>
                <Text style={[styles.leadIdText, { color: textSecondary }]}>{lead.leadId || "LEAD"}</Text>
              </View>
              <Text style={[styles.headerTitle, { color: textPrimary }]} numberOfLines={1}>
                {lead.title || `${lead.propertyType} in ${lead.locality}`}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "#334155" : "#F1F5F9" }]}>
              <Feather name="x" size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Stepper Progress Bar */}
          <View style={[styles.stepperBar, { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
            {stepsConfig.map((st) => {
              const isDone = currentStep > st.num;
              const isCurrent = currentStep === st.num;
              return (
                <TouchableOpacity
                  key={st.num}
                  disabled={st.num > currentStep}
                  onPress={() => setCurrentStep(st.num as StepType)}
                  style={[styles.stepItem, isCurrent && styles.stepItemCurrent]}
                >
                  <View
                    style={[
                      styles.stepIconCircle,
                      {
                        backgroundColor: isDone ? "#10B981" : isCurrent ? "#0D9488" : isDark ? "#334155" : "#E2E8F0",
                      },
                    ]}
                  >
                    {isDone ? (
                      <Feather name="check" size={12} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.stepNumText, { color: isCurrent ? "#FFFFFF" : textSecondary }]}>{st.num}</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabelText,
                      {
                        color: isCurrent ? "#0D9488" : isDone ? "#10B981" : textSecondary,
                        fontWeight: isCurrent ? "700" : "500",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Step Content */}
          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* ── STEP 1: SPECS & PHYSICAL CHECKLIST ── */}
            {currentStep === 1 && (
              <View>
                <View style={styles.sectionHeader}>
                  <Feather name="home" size={18} color="#0D9488" />
                  <Text style={[styles.sectionTitle, { color: textPrimary }]}>On-Site Physical Specs</Text>
                </View>

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Actual Carpet Area (sq ft)</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 1150"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={carpetArea}
                      onChangeText={setCarpetArea}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Bedrooms</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 2"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={bedrooms}
                      onChangeText={setBedrooms}
                    />
                  </View>
                </View>

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Bathrooms</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 2"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={bathrooms}
                      onChangeText={setBathrooms}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Balconies</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 1"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={balconies}
                      onChangeText={setBalconies}
                    />
                  </View>
                </View>

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Floor Number</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 3"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={floorNo}
                      onChangeText={setFloorNo}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Total Building Floors</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 14"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={totalFloors}
                      onChangeText={setTotalFloors}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Min Negotiable Rent (₹)</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                    placeholder={`Expected: ₹${lead.expectedPrice || 0}`}
                    placeholderTextColor={textSecondary}
                    keyboardType="numeric"
                    value={negotiablePrice}
                    onChangeText={setNegotiablePrice}
                  />
                </View>

                {/* Property Condition Pills */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Property Overall Condition</Text>
                  <View style={styles.pillRow}>
                    {["excellent", "good", "needs_repair", "poor"].map((c) => (
                      <TouchableOpacity
                        key={c}
                        onPress={() => setCondition(c)}
                        style={[
                          styles.condPill,
                          condition === c && styles.condPillActive,
                          { borderColor: condition === c ? "#0D9488" : borderCol },
                        ]}
                      >
                        <Text style={[styles.condPillText, { color: condition === c ? "#0D9488" : textSecondary, textTransform: "capitalize" }]}>
                          {c.replace("_", " ")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Physical Checklist Switches */}
                <View style={[styles.checklistCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol }]}>
                  <Text style={[styles.checklistCardTitle, { color: textPrimary }]}>On-Site Verification Checklist</Text>

                  <View style={styles.checkSwitchRow}>
                    <Text style={[styles.switchText, { color: textPrimary }]}>Physical Inspection Done</Text>
                    <Switch value={visitDone} onValueChange={setVisitDone} trackColor={{ false: "#94A3B8", true: "#0D9488" }} />
                  </View>
                  <View style={styles.checkSwitchRow}>
                    <Text style={[styles.switchText, { color: textPrimary }]}>Ownership Docs & Registry Verified</Text>
                    <Switch value={docsVerified} onValueChange={setDocsVerified} trackColor={{ false: "#94A3B8", true: "#0D9488" }} />
                  </View>
                  <View style={styles.checkSwitchRow}>
                    <Text style={[styles.switchText, { color: textPrimary }]}>Latest Electricity Bill Checked</Text>
                    <Switch value={billChecked} onValueChange={setBillChecked} trackColor={{ false: "#94A3B8", true: "#0D9488" }} />
                  </View>
                  <View style={styles.checkSwitchRow}>
                    <Text style={[styles.switchText, { color: textPrimary }]}>Physical Keys In Hand / Ready</Text>
                    <Switch value={keysAvailable} onValueChange={setKeysAvailable} trackColor={{ false: "#94A3B8", true: "#0D9488" }} />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Inspection Remarks & Staff Notes</Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                    placeholder="e.g. Freshly painted, good sunlight, verified registry copy on site."
                    placeholderTextColor={textSecondary}
                    multiline
                    numberOfLines={2}
                    value={inspectionRemarks}
                    onChangeText={setInspectionRemarks}
                  />
                </View>
              </View>
            )}

            {/* ── STEP 2: KYC & DUPLICATE AADHAAR CHECK ── */}
            {currentStep === 2 && (
              <View>
                <View style={styles.sectionHeader}>
                  <Feather name="shield" size={18} color="#0D9488" />
                  <Text style={[styles.sectionTitle, { color: textPrimary }]}>Owner KYC & Aadhaar Verification</Text>
                </View>

                <View style={[styles.ownerBadgeCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol }]}>
                  <Text style={[styles.ownerBadgeName, { color: textPrimary }]}>{lead.ownerName || "Property Owner"}</Text>
                  <Text style={[styles.ownerBadgePhone, { color: textSecondary }]}>Contact: {lead.ownerPhone || "No contact"}</Text>
                  <Text style={[styles.ownerBadgeAddr, { color: textSecondary }]}>Location: {lead.locality}</Text>
                </View>

                <View style={styles.formGroup}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Text style={[styles.inputLabel, { color: textSecondary, marginBottom: 0 }]}>Owner Aadhaar Last 4 Digits *</Text>
                    {checkingAadhaar && <ActivityIndicator size="small" color="#0D9488" />}
                  </View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                        color: textPrimary,
                        borderColor: aadhaarWarning ? "#EF4444" : borderCol,
                      },
                    ]}
                    placeholder="Enter last 4 digits (e.g. 5432)"
                    placeholderTextColor={textSecondary}
                    keyboardType="numeric"
                    maxLength={4}
                    value={aadhaarLast4}
                    onChangeText={handleAadhaarChange}
                  />
                  {aadhaarWarning && (
                    <View style={styles.warningBox}>
                      <Ionicons name="warning" size={15} color="#EF4444" style={{ marginRight: 6 }} />
                      <Text style={styles.warningText}>{aadhaarWarning}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Owner PAN Card Number</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                    placeholder="e.g. ABCDE1234F"
                    placeholderTextColor={textSecondary}
                    autoCapitalize="characters"
                    value={panCard}
                    onChangeText={setPanCard}
                  />
                </View>

                <View style={[styles.kycStatusCard, { backgroundColor: "#10B98115", borderColor: "#10B98140" }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.kycStatusTitle, { color: "#10B981" }]}>KYC Identity Verification Checklist</Text>
                    <Text style={[styles.kycStatusSub, { color: textSecondary }]}>
                      Government ID collected & duplicate check passed for {lead.locality} registry.
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── STEP 3: GUIDED PHOTO & VIDEO CAPTURE ── */}
            {currentStep === 3 && (
              <View>
                <View style={styles.sectionHeader}>
                  <Feather name="camera" size={18} color="#0D9488" />
                  <Text style={[styles.sectionTitle, { color: textPrimary }]}>Guided Media Capture Flow</Text>
                </View>
                <Text style={[styles.stepDesc, { color: textSecondary }]}>
                  Take or enter photo links for each mandatory spot in the property:
                </Text>

                {[
                  { key: "parking", label: "1. Building Entrance & Parking", icon: "truck" },
                  { key: "stairs", label: "2. Stairs, Lift & Lobby", icon: "layers" },
                  { key: "livingRoom", label: "3. Drawing / Living Room", icon: "tv" },
                  { key: "kitchen", label: "4. Modular Kitchen", icon: "coffee" },
                  { key: "bedroom", label: "5. Master Bedroom", icon: "moon" },
                  { key: "bathroom", label: "6. Bathroom & Fittings", icon: "droplet" },
                  { key: "balcony", label: "7. Balcony & Outside View", icon: "sun" },
                ].map((slot) => {
                  const hasPhoto = Boolean(mediaSlots[slot.key]);
                  return (
                    <View
                      key={slot.key}
                      style={[
                        styles.mediaSlotCard,
                        {
                          backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                          borderColor: hasPhoto ? "#0D9488" : borderCol,
                        },
                      ]}
                    >
                      <View style={styles.mediaSlotHeader}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                          <Feather name={slot.icon as any} size={16} color={hasPhoto ? "#0D9488" : textSecondary} />
                          <Text style={[styles.mediaSlotLabel, { color: textPrimary }]}>{slot.label}</Text>
                        </View>
                        {hasPhoto ? (
                          <View style={styles.capturedBadge}>
                            <Feather name="check" size={12} color="#10B981" />
                            <Text style={styles.capturedText}>Captured</Text>
                          </View>
                        ) : (
                          <TouchableOpacity onPress={() => handleQuickAddDemoPhoto(slot.key)} style={styles.demoAddBtn}>
                            <Text style={styles.demoAddText}>+ Quick Fill</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      {hasPhoto && (
                        <Image source={{ uri: mediaSlots[slot.key] }} style={styles.slotPreviewImage} resizeMode="cover" />
                      )}

                      <TextInput
                        style={[
                          styles.slotInput,
                          {
                            backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                            color: textPrimary,
                            borderColor: borderCol,
                          },
                        ]}
                        placeholder="Photo URL / Image URI"
                        placeholderTextColor={textSecondary}
                        value={mediaSlots[slot.key]}
                        onChangeText={(txt) => handleMediaUrlInput(slot.key, txt)}
                      />
                    </View>
                  );
                })}

                {/* Walkthrough Video URL */}
                <View style={[styles.mediaSlotCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol }]}>
                  <View style={styles.mediaSlotHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Feather name="video" size={16} color="#0D9488" />
                      <Text style={[styles.mediaSlotLabel, { color: textPrimary }]}>8. Walkthrough Video Link</Text>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.slotInput, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF", color: textPrimary, borderColor: borderCol }]}
                    placeholder="YouTube / Cloud video link (Optional)"
                    placeholderTextColor={textSecondary}
                    value={mediaSlots.videoUrl}
                    onChangeText={(txt) => handleMediaUrlInput("videoUrl", txt)}
                  />
                </View>
              </View>
            )}

            {/* ── STEP 4: PRE-PUBLISH REVIEW & LOCK ── */}
            {currentStep === 4 && (
              <View>
                <View style={styles.sectionHeader}>
                  <Feather name="lock" size={18} color="#0D9488" />
                  <Text style={[styles.sectionTitle, { color: textPrimary }]}>Two-Step Confirmation & Publish</Text>
                </View>

                {/* Review Card */}
                <View style={[styles.reviewCard, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", borderColor: borderCol }]}>
                  <Text style={[styles.reviewTitle, { color: textPrimary }]}>Verification Summary</Text>
                  
                  <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: textSecondary }]}>Property:</Text>
                    <Text style={[styles.reviewVal, { color: textPrimary }]}>{lead.title || `${lead.propertyType} in ${lead.locality}`}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: textSecondary }]}>Carpet Area:</Text>
                    <Text style={[styles.reviewVal, { color: textPrimary }]}>{carpetArea ? `${carpetArea} sq ft` : "N/A"}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: textSecondary }]}>Configuration:</Text>
                    <Text style={[styles.reviewVal, { color: textPrimary }]}>{bedrooms} BHK ({bathrooms} Baths, {balconies} Balconies)</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: textSecondary }]}>Condition:</Text>
                    <Text style={[styles.reviewVal, { color: textPrimary, textTransform: "capitalize" }]}>{condition.replace("_", " ")}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: textSecondary }]}>Rent / Price:</Text>
                    <Text style={[styles.reviewVal, { color: "#0D9488", fontWeight: "800" }]}>₹{Number(lead.expectedPrice || 0).toLocaleString("en-IN")}/mo</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={[styles.reviewLabel, { color: textSecondary }]}>Aadhaar Last-4:</Text>
                    <Text style={[styles.reviewVal, { color: textPrimary }]}>{aadhaarLast4 ? `•••• ${aadhaarLast4}` : "Verified"}</Text>
                  </View>
                </View>

                {/* Lock & Privacy Warning Banner */}
                <View style={[styles.lockWarningCard, { backgroundColor: "#F59E0B15", borderColor: "#F59E0B50" }]}>
                  <Ionicons name="lock-closed" size={22} color="#F59E0B" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.lockWarningTitle, { color: "#F59E0B" }]}>Locking & PII Masking Rule</Text>
                    <Text style={[styles.lockWarningSub, { color: textSecondary }]}>
                      Once published, this record is locked. Contact numbers for owner and tenant will be permanently masked for field staff to protect customer privacy. Only Super Admin can modify published listings.
                    </Text>
                  </View>
                </View>

                {/* Checkbox Acknowledgment */}
                <TouchableOpacity
                  onPress={() => {
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                    setConfirmLockChecked(!confirmLockChecked);
                  }}
                  style={[styles.confirmCheckRow, { borderColor: borderCol }]}
                >
                  <View style={[styles.checkboxBox, { borderColor: confirmLockChecked ? "#0D9488" : borderCol, backgroundColor: confirmLockChecked ? "#0D9488" : "transparent" }]}>
                    {confirmLockChecked && <Feather name="check" size={14} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.confirmCheckText, { color: textPrimary }]}>
                    I confirm that on-ground inspection is complete, specs & KYC are accurate, and this listing is ready to publish.
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={[styles.footer, { borderTopColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={() => setCurrentStep((prev) => (prev - 1) as StepType)}
                style={[styles.backBtn, { borderColor: borderCol }]}
              >
                <Feather name="arrow-left" size={16} color={textSecondary} style={{ marginRight: 4 }} />
                <Text style={[styles.backBtnText, { color: textSecondary }]}>Back</Text>
              </TouchableOpacity>
            )}

            {currentStep < 4 ? (
              <TouchableOpacity
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  setCurrentStep((prev) => (prev + 1) as StepType);
                }}
                style={[styles.nextBtn, { backgroundColor: "#0D9488" }]}
              >
                <Text style={styles.nextBtnText}>Continue</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handlePublishListing}
                disabled={publishing || !confirmLockChecked}
                style={[
                  styles.publishBtn,
                  {
                    backgroundColor: confirmLockChecked ? "#0D9488" : "#94A3B8",
                  },
                ]}
              >
                {publishing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.publishBtnText}>Publish & Lock Listing</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
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
    marginTop: 35,
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stepBadgeText: {
    color: "#0D9488",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  leadIdText: {
    fontSize: 11,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBar: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepItemCurrent: {
    backgroundColor: "#0D948810",
  },
  stepIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: "700",
  },
  stepLabelText: {
    fontSize: 10,
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 60,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  stepDesc: {
    fontSize: 12,
    marginBottom: 14,
    lineHeight: 18,
  },
  rowInputs: {
    flexDirection: "row",
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
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
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  condPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  condPillActive: {
    backgroundColor: "#0D948815",
  },
  condPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  checklistCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  checklistCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  checkSwitchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  switchText: {
    fontSize: 12,
    fontWeight: "500",
  },
  ownerBadgeCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  ownerBadgeName: {
    fontSize: 14,
    fontWeight: "700",
  },
  ownerBadgePhone: {
    fontSize: 12,
    marginTop: 2,
  },
  ownerBadgeAddr: {
    fontSize: 11,
    marginTop: 2,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF444415",
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  warningText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "600",
    flex: 1,
  },
  kycStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  kycStatusTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  kycStatusSub: {
    fontSize: 11,
    marginTop: 2,
  },
  mediaSlotCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  mediaSlotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mediaSlotLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  capturedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B98115",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  capturedText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "700",
  },
  demoAddBtn: {
    backgroundColor: "#0D948815",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  demoAddText: {
    color: "#0D9488",
    fontSize: 11,
    fontWeight: "600",
  },
  slotPreviewImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  slotInput: {
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
  },
  reviewCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  reviewLabel: {
    fontSize: 12,
  },
  reviewVal: {
    fontSize: 12,
    fontWeight: "600",
  },
  lockWarningCard: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  lockWarningTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },
  lockWarningSub: {
    fontSize: 11,
    lineHeight: 16,
  },
  confirmCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCheckText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  publishBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
  },
  publishBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default PropertyVerificationModal;
