import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { Feather, Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";
import { SOCKET_URL } from "../../Redux/api/apiConfig";

const { width } = Dimensions.get("window");

// Helper: Convert Lat/Lng to Slippy Map Tile Coordinates
function latLngToTile(lat: number, lon: number, zoom: number) {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const rad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
  const fullX = ((lon + 180) / 360) * Math.pow(2, zoom);
  const fullY =
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, zoom);
  const offsetX = (fullX - x) * 256;
  const offsetY = (fullY - y) * 256;
  return { x, y, offsetX, offsetY };
}

interface Props {
  visible: boolean;
  lead: any;
  onClose: () => void;
  onSuccess?: () => void;
}

type StepType = 1 | 2 | 3 | 4 | 5;

export const PropertyVerificationModal: React.FC<Props> = ({
  visible,
  lead: initialLead,
  onClose,
  onSuccess,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  const [lead, setLead] = useState<any>(initialLead);
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Map state
  const [mapZoom, setMapZoom] = useState(16);
  const [mapType, setMapType] = useState<"roadmap" | "satellite">("roadmap");

  // Step 1: Location & GPS Info
  const [locality, setLocality] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Delhi NCR");
  const [pincode, setPincode] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  // Step 2: Specs & Physical Checklist
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

  // Step 3: Owner KYC & Aadhaar
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [aadhaarLast4, setAadhaarLast4] = useState("");
  const [panCard, setPanCard] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [upiId, setUpiId] = useState("");
  const [aadhaarWarning, setAadhaarWarning] = useState<string | null>(null);
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);

  // Step 4: Guided Media Capture Slots
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
  const [uploadingSlots, setUploadingSlots] = useState<{ [key: string]: boolean }>({});

  // Step 5: Publish & Lock State
  const [confirmLockChecked, setConfirmLockChecked] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    setLead(initialLead);
    if (initialLead) {
      setCurrentStep(1);
      setActivePhotoIdx(0);

      // Location
      setLocality(initialLead.locality || "");
      setStreet(initialLead.address?.street || "");
      setLandmark(initialLead.address?.landmark || "");
      setCity(initialLead.address?.city || "Delhi NCR");
      setPincode(initialLead.address?.pincode || "");
      setFullAddress(initialLead.address?.fullAddress || "");

      // Specs & Checklist
      setCarpetArea(String(initialLead.inspectionDetails?.actualCarpetAreaSqFt || ""));
      setBedrooms(
        String(
          initialLead.inspectionDetails?.actualBedrooms ||
            (initialLead.propertyType?.includes("1")
              ? "1"
              : initialLead.propertyType?.includes("3")
              ? "3"
              : "2")
        )
      );
      setBathrooms(String(initialLead.inspectionDetails?.actualBathrooms || "2"));
      setBalconies(String(initialLead.inspectionDetails?.actualBalconies || "1"));
      setFloorNo(String(initialLead.inspectionDetails?.floorNumber || ""));
      setTotalFloors(String(initialLead.inspectionDetails?.totalFloors || ""));
      setCondition(initialLead.inspectionDetails?.propertyCondition || "good");
      setNegotiablePrice(
        String(
          initialLead.inspectionDetails?.negotiablePriceMin ||
            initialLead.expectedPrice ||
            ""
        )
      );
      setKeysAvailable(initialLead.inspectionDetails?.keysAvailable ?? true);
      setVisitDone(initialLead.inspectionDetails?.physicalVisitDone ?? true);
      setDocsVerified(initialLead.inspectionDetails?.ownershipDocsVerified ?? true);
      setBillChecked(initialLead.inspectionDetails?.electricityBillChecked ?? true);
      setInspectionRemarks(initialLead.inspectionDetails?.staffChecklistRemarks || "");

      // Owner & KYC
      setOwnerName(initialLead.ownerName || "");
      setOwnerPhone(initialLead.ownerPhone || "");
      setOwnerEmail(initialLead.ownerEmail || "");
      setAadhaarLast4(initialLead.ownerAadhaarLast4 || "");
      setPanCard(initialLead.ownerPanCard || "");
      setBankName(initialLead.ownerBankDetails?.bankName || "");
      setAccountNumber(initialLead.ownerBankDetails?.accountNumber || "");
      setIfscCode(initialLead.ownerBankDetails?.ifscCode || "");
      setUpiId(initialLead.ownerBankDetails?.upiId || "");
      setAadhaarWarning(null);

      // Photos
      const existingPhotos =
        initialLead.photos?.map((p: any) => (typeof p === "string" ? p : p.url)) ||
        initialLead.images ||
        [];
      setMediaSlots({
        parking: existingPhotos[0] || "",
        stairs: existingPhotos[1] || "",
        livingRoom: existingPhotos[2] || "",
        kitchen: existingPhotos[3] || "",
        bedroom: existingPhotos[4] || "",
        bathroom: existingPhotos[5] || "",
        balcony: existingPhotos[6] || "",
        videoUrl: initialLead.videoUrl || initialLead.videoLink || "",
      });

      setUploadingSlots({});
      setConfirmLockChecked(false);
    }
  }, [initialLead, visible]);

  if (!lead) return null;

  // Extract Coordinates for Map View
  const latitude =
    Number(lead.gpsDetails?.latitude) ||
    (Array.isArray(lead.location?.coordinates) && lead.location.coordinates[1]
      ? Number(lead.location.coordinates[1])
      : null) ||
    Number(lead.latitude) ||
    28.633298;

  const longitude =
    Number(lead.gpsDetails?.longitude) ||
    (Array.isArray(lead.location?.coordinates) && lead.location.coordinates[0]
      ? Number(lead.location.coordinates[0])
      : null) ||
    Number(lead.longitude) ||
    77.36787;

  const gpsAccuracy = lead.gpsDetails?.accuracy || 3.8;
  const hasCapturedGps = Boolean(
    lead.gpsDetails?.latitude ||
      (Array.isArray(lead.location?.coordinates) && lead.location.coordinates.length >= 2)
  );

  // Slippy Map Tiles
  const containerW = Math.min(width - 48, 480);
  const containerH = 200;
  const tileInfo = latLngToTile(latitude, longitude, mapZoom);

  const getTileUrl = (tx: number, ty: number) => {
    if (mapType === "satellite") {
      return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + mapZoom + "/" + ty + "/" + tx;
    }
    return "https://a.basemaps.cartocdn.com/rastertiles/voyager/" + mapZoom + "/" + tx + "/" + ty + "@2x.png";
  };

  const tiles = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tx = tileInfo.x + dx;
      const ty = tileInfo.y + dy;
      const left = containerW / 2 - tileInfo.offsetX + dx * 256;
      const top = containerH / 2 - tileInfo.offsetY + dy * 256;
      tiles.push({
        key: mapZoom + "-" + tx + "-" + ty,
        url: getTileUrl(tx, ty),
        left,
        top,
      });
    }
  }

  const photos =
    lead.photos && lead.photos.length > 0
      ? lead.photos.map((p: any) => (typeof p === "string" ? p : p.url))
      : lead.images && lead.images.length > 0
      ? lead.images
      : lead.coverPhoto
      ? [lead.coverPhoto]
      : [];

  const handleCall = (phone?: string) => {
    if (phone) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      Linking.openURL("tel:" + String(phone).replace(/\s+/g, ""));
    }
  };

  const handleWhatsApp = (phone?: string, name?: string) => {
    if (phone) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      const clean = String(phone).replace(/\D/g, "");
      const full = clean.length === 10 ? "91" + clean : clean;
      const greet = name ? encodeURIComponent("Hello " + name + ",") : "Hello,";
      Linking.openURL(
        "whatsapp://send?phone=" +
          full +
          "&text=" +
          greet +
          "%20regarding%20property%20verification%20for%20" +
          encodeURIComponent(lead.title || lead.leadId)
      );
    }
  };

  const handleCopy = async (text: string, label: string) => {
    if (!text) return;
    try {
      await Clipboard.setStringAsync(text);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Copied", label + " copied to clipboard.");
    } catch {}
  };

  const openInGoogleMaps = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    const query = latitude + "," + longitude;
    const label = encodeURIComponent(lead.title || lead.locality || "Property Location");
    const url = "https://www.google.com/maps/search/?api=1&query=" + query + "&query_place_id=" + label;
    Linking.openURL(url);
  };

  const openDirections = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    const destination = latitude + "," + longitude;
    const url = "https://www.google.com/maps/dir/?api=1&destination=" + destination;
    Linking.openURL(url);
  };

  // Real-time Aadhaar last-4 duplicate check
  const handleAadhaarChange = async (text: string) => {
    const clean = text.replace(/\D/g, "").slice(0, 4);
    setAadhaarLast4(clean);
    if (clean.length === 4) {
      setCheckingAadhaar(true);
      try {
        const res = await apiClient.get(
          "/leads/check-aadhaar?last4=" + clean + "&excludeId=" + lead._id
        );
        if (res.data?.data?.isDuplicate) {
          setAadhaarWarning(
            res.data.data.warningMessage || "Duplicate Aadhaar detected in system!"
          );
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch {}
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

  // Pick or Capture Photo for a specific slot
  const handlePickImage = async (slotKey: string, fromCamera: boolean) => {
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Camera Permission", "Camera access is required to capture property photos.");
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Gallery Permission", "Photo library access is required to select property images.");
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
        setMediaSlots((prev) => ({ ...prev, [slotKey]: localUri }));
        setUploadingSlots((prev) => ({ ...prev, [slotKey]: true }));

        try {
          const filename = localUri.split("/").pop() || ("photo_" + slotKey + "_" + Date.now() + ".jpg");
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? "image/" + match[1] : "image/jpeg";

          const formData = new FormData();
          formData.append("file", {
            uri: localUri,
            name: filename,
            type: fileType,
          } as any);
          formData.append("slot", slotKey);

          const res = await apiClient.post("/leads/upload-media", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.data?.data?.url) {
            const serverUrl = res.data.data.url;
            setMediaSlots((prev) => ({ ...prev, [slotKey]: serverUrl }));
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          }
        } catch (uploadErr) {
          console.warn("Backend media upload failed, keeping local URI:", uploadErr);
        } finally {
          setUploadingSlots((prev) => ({ ...prev, [slotKey]: false }));
        }
      }
    } catch (err) {
      console.error("Error capturing photo:", err);
      Alert.alert("Media Error", "Could not capture or select photo. Please try again.");
    }
  };

  // Pick or Record Walkthrough Video
  const handlePickVideo = async (fromCamera: boolean) => {
    try {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}

      if (fromCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Camera Permission", "Camera access is required to record walkthrough videos.");
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Gallery Permission", "Video library access is required to select video files.");
          return;
        }
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["videos"],
            allowsEditing: true,
            videoMaxDuration: 120,
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["videos"],
            allowsEditing: true,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const localUri = result.assets[0].uri;
        setMediaSlots((prev) => ({ ...prev, videoUrl: localUri }));
        setUploadingSlots((prev) => ({ ...prev, videoUrl: true }));

        try {
          const filename = localUri.split("/").pop() || ("video_" + Date.now() + ".mp4");
          const match = /\.(\w+)$/.exec(filename);
          const fileType = match ? "video/" + match[1] : "video/mp4";

          const formData = new FormData();
          formData.append("file", {
            uri: localUri,
            name: filename,
            type: fileType,
          } as any);
          formData.append("slot", "walkthrough_video");

          const res = await apiClient.post("/leads/upload-media", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.data?.data?.url) {
            setMediaSlots((prev) => ({ ...prev, videoUrl: res.data.data.url }));
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          }
        } catch (uploadErr) {
          console.warn("Backend video upload failed, keeping local URI:", uploadErr);
        } finally {
          setUploadingSlots((prev) => ({ ...prev, videoUrl: false }));
        }
      }
    } catch (err) {
      console.error("Error capturing video:", err);
      Alert.alert("Media Error", "Could not capture or pick video. Please try again.");
    }
  };

  const handleRemovePhoto = (key: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setMediaSlots((prev) => ({ ...prev, [key]: "" }));
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
      Alert.alert(
        "Confirmation Required",
        "Please check the confirmation box acknowledging that this listing will be locked and PII will be masked."
      );
      return;
    }

    setPublishing(true);
    try {
      const photosArray = Object.entries(mediaSlots)
        .filter(
          ([k, v]) =>
            k !== "videoUrl" &&
            Boolean(v) &&
            (v.startsWith("http") || v.startsWith("/uploads") || v.startsWith("file://"))
        )
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
        staffChecklistRemarks:
          inspectionRemarks.trim() || "Inspected on-site, verified specs & KYC.",
        ownerAadhaarLast4: aadhaarLast4,
        ownerPanCard: panCard.toUpperCase(),
        photos: photosArray.length > 0 ? photosArray : undefined,
        videoUrl: mediaSlots.videoUrl || undefined,
      };

      await apiClient.post("/leads/" + lead._id + "/publish-inspection", payload);
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      Alert.alert(
        "Listing Published & Locked 🎉",
        "Property " + (lead.leadId || lead._id) + " is now verified and live on the internal exchange! PII has been securely masked."
      );
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.log("ERROR PUBLISH:", err);
      Alert.alert(
        "Publish Failed",
        err?.response?.data?.message || "Could not publish verification record."
      );
    } finally {
      setPublishing(false);
    }
  };

  const stepsConfig = [
    { num: 1, label: "Location & GPS", icon: "map-pin" },
    { num: 2, label: "Specs & Visit", icon: "tool" },
    { num: 3, label: "Owner & KYC", icon: "shield" },
    { num: 4, label: "Photo / Video", icon: "camera" },
    { num: 5, label: "Publish & Lock", icon: "lock" },
  ];

  const conditionOptions = [
    { label: "Brand New", value: "new" },
    { label: "Excellent", value: "excellent" },
    { label: "Good", value: "good" },
    { label: "Average", value: "average" },
    { label: "Needs Repair", value: "needs_repair" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.headerBadgeRow}>
                <View style={[styles.statusBadge, { backgroundColor: "#0D948820" }]}>
                  <Text style={[styles.statusText, { color: "#0D9488" }]}>
                    {(lead.status || "UNDER VERIFICATION").replace("_", " ").toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.leadIdText, { color: textSecondary }]}>
                  {lead.leadId || "LEAD"}
                </Text>
              </View>
              <Text style={[styles.headerTitle, { color: textPrimary }]} numberOfLines={1}>
                {lead.title || (lead.propertyType || "Property") + " in " + (lead.locality || "Site")}
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
            >
              <Feather name="x" size={20} color={textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Stepper Wizard Bar */}
          <View
            style={[
              styles.stepperBar,
              { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" },
            ]}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepperScroll}>
              {stepsConfig.map((s) => {
                const isActive = currentStep === s.num;
                const isPassed = currentStep > s.num;
                return (
                  <TouchableOpacity
                    key={s.num}
                    onPress={() => {
                      try { Haptics.selectionAsync(); } catch {}
                      setCurrentStep(s.num as StepType);
                    }}
                    style={[
                      styles.stepItem,
                      isActive && { borderBottomColor: "#0D9488", borderBottomWidth: 3 },
                    ]}
                  >
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor: isActive
                            ? "#0D9488"
                            : isPassed
                            ? "#10B981"
                            : isDark
                            ? "#334155"
                            : "#E2E8F0",
                        },
                      ]}
                    >
                      {isPassed ? (
                        <Feather name="check" size={12} color="#FFFFFF" />
                      ) : (
                        <Text
                          style={[
                            styles.stepNum,
                            { color: isActive || isPassed ? "#FFFFFF" : textSecondary },
                          ]}
                        >
                          {s.num}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabelText,
                        {
                          color: isActive ? "#0D9488" : textSecondary,
                          fontWeight: isActive ? "800" : "600",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Top Quick Overview Banner */}
            <View
              style={[
                styles.pricingCard,
                { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol },
              ]}
            >
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceLabel}>
                    {lead.listingType === "sale" || lead.listingType === "SALE"
                      ? "EXPECTED SALE PRICE"
                      : "MONTHLY RENT"}
                  </Text>
                  <Text style={styles.priceAmount}>
                    ₹{(lead.expectedPrice || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: "#0D948815" }]}>
                  <Text style={[styles.typeBadgeText, { color: "#0D9488" }]}>
                    {lead.propertyType || "Residential"} • {(lead.listingType || "Rent").toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.statGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: textSecondary }]}>Deposit</Text>
                  <Text style={[styles.statValue, { color: textPrimary }]}>
                    {lead.securityDeposit
                      ? "₹" + Number(lead.securityDeposit).toLocaleString("en-IN")
                      : "None"}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: textSecondary }]}>Maintenance</Text>
                  <Text style={[styles.statValue, { color: textPrimary }]}>
                    {lead.maintenanceCharge
                      ? "₹" + Number(lead.maintenanceCharge).toLocaleString("en-IN") + "/mo"
                      : "Included"}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: textSecondary }]}>Furnishing</Text>
                  <Text style={[styles.statValue, { color: textPrimary, textTransform: "capitalize" }]}>
                    {(lead.furnishing || "Unfurnished").replace("_", " ")}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── STEP 1: LOCATION & INTERACTIVE SLIPPY MAP ── */}
            {currentStep === 1 && (
              <View
                style={[
                  styles.card,
                  { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: "#0D948820" }]}>
                      <Ionicons name="location" size={18} color="#0D9488" />
                    </View>
                    <Text style={[styles.cardTitle, { color: textPrimary }]}>
                      On-Site Location & GPS
                    </Text>
                  </View>
                  <View style={[styles.stepCountPill, { backgroundColor: "#0D948815" }]}>
                    <Text style={[styles.stepCountText, { color: "#0D9488" }]}>Step 1 of 5</Text>
                  </View>
                </View>

                {/* Interactive Slippy Map Canvas */}
                <View style={styles.mapFrame}>
                  <View style={[styles.mapContainer, { width: containerW, height: containerH }]}>
                    {tiles.map((t) => (
                      <Image
                        key={t.key}
                        source={{ uri: t.url }}
                        style={{
                          position: "absolute",
                          left: t.left,
                          top: t.top,
                          width: 256,
                          height: 256,
                        }}
                        resizeMode="cover"
                      />
                    ))}

                    {/* Centered Animated Pin Marker */}
                    <View style={styles.pinCenterWrap} pointerEvents="none">
                      <View style={styles.pinGlow} />
                      <View style={styles.pinHead}>
                        <FontAwesome5 name="home" size={12} color="#FFFFFF" />
                      </View>
                      <View style={styles.pinPoint} />
                    </View>

                    {/* Map Layer Mode Switcher */}
                    <View style={styles.mapLayerSwitcher}>
                      <TouchableOpacity
                        onPress={() => setMapType("roadmap")}
                        style={[
                          styles.layerChip,
                          mapType === "roadmap" && styles.layerChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.layerChipText,
                            mapType === "roadmap" && styles.layerChipTextActive,
                          ]}
                        >
                          Road
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setMapType("satellite")}
                        style={[
                          styles.layerChip,
                          mapType === "satellite" && styles.layerChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.layerChipText,
                            mapType === "satellite" && styles.layerChipTextActive,
                          ]}
                        >
                          Satellite
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Zoom Controls */}
                    <View style={styles.zoomControlsWrap}>
                      <TouchableOpacity
                        onPress={() => setMapZoom((prev) => Math.min(prev + 1, 18))}
                        style={styles.zoomBtn}
                      >
                        <Feather name="plus" size={16} color="#0F172A" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setMapZoom((prev) => Math.max(prev - 1, 12))}
                        style={styles.zoomBtn}
                      >
                        <Feather name="minus" size={16} color="#0F172A" />
                      </TouchableOpacity>
                    </View>

                    {/* Accuracy Badge */}
                    <View style={styles.accuracyPill}>
                      <View style={styles.livePulseDot} />
                      <Text style={styles.accuracyText}>
                        {hasCapturedGps ? ("GPS ±" + gpsAccuracy + "m") : "Estimated Coordinates"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* GPS Actions & Shortcuts */}
                <View
                  style={[
                    styles.gpsActionRow,
                    { backgroundColor: isDark ? "#0F172A" : "#F1F5F9" },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.coordLabel, { color: textSecondary }]}>
                      GPS Coordinates
                    </Text>
                    <Text style={[styles.coordValue, { color: textPrimary }]}>
                      {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={openInGoogleMaps} style={styles.navActionButton}>
                    <Ionicons name="map-outline" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.navActionText}>Google Maps</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={openDirections}
                    style={[styles.navActionButton, { backgroundColor: "#3B82F6" }]}
                  >
                    <Ionicons name="navigate-outline" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.navActionText}>Directions</Text>
                  </TouchableOpacity>
                </View>

                {/* Address Form Verification */}
                <View style={styles.formSection}>
                  <Text style={[styles.subSectionTitle, { color: textPrimary }]}>
                    Address & Locality Details
                  </Text>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Locality / Area</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: borderCol,
                          color: textPrimary,
                        },
                      ]}
                      value={locality}
                      onChangeText={setLocality}
                      placeholder="e.g. Indirapuram, Sector 62"
                      placeholderTextColor={textSecondary}
                    />
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: textSecondary }]}>Street / Block</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                            borderColor: borderCol,
                            color: textPrimary,
                          },
                        ]}
                        value={street}
                        onChangeText={setStreet}
                        placeholder="e.g. Tower B, Flat 402"
                        placeholderTextColor={textSecondary}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: textSecondary }]}>Landmark</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                            borderColor: borderCol,
                            color: textPrimary,
                          },
                        ]}
                        value={landmark}
                        onChangeText={setLandmark}
                        placeholder="Near Metro / Park"
                        placeholderTextColor={textSecondary}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Full Address String</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: borderCol,
                          color: textPrimary,
                        },
                      ]}
                      value={fullAddress}
                      onChangeText={setFullAddress}
                      placeholder="Complete verified physical address"
                      placeholderTextColor={textSecondary}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* ── STEP 2: SPECS & PHYSICAL CHECKLIST ── */}
            {currentStep === 2 && (
              <View
                style={[
                  styles.card,
                  { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: "#8B5CF620" }]}>
                      <Ionicons name="construct" size={18} color="#8B5CF6" />
                    </View>
                    <Text style={[styles.cardTitle, { color: textPrimary }]}>
                      Specifications & Physical Visit
                    </Text>
                  </View>
                  <View style={[styles.stepCountPill, { backgroundColor: "#8B5CF615" }]}>
                    <Text style={[styles.stepCountText, { color: "#8B5CF6" }]}>Step 2 of 5</Text>
                  </View>
                </View>

                {/* Specs Inputs */}
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Carpet Area (sq ft)</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: borderCol,
                          color: textPrimary,
                        },
                      ]}
                      value={carpetArea}
                      onChangeText={setCarpetArea}
                      placeholder="e.g. 1150"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Bedrooms</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: borderCol,
                          color: textPrimary,
                        },
                      ]}
                      value={bedrooms}
                      onChangeText={setBedrooms}
                      placeholder="e.g. 2"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Bathrooms</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: borderCol,
                          color: textPrimary,
                        },
                      ]}
                      value={bathrooms}
                      onChangeText={setBathrooms}
                      placeholder="e.g. 2"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Balconies</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: borderCol,
                          color: textPrimary,
                        },
                      ]}
                      value={balconies}
                      onChangeText={setBalconies}
                      placeholder="e.g. 1"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Floor Number</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: borderCol,
                          color: textPrimary,
                        },
                      ]}
                      value={floorNo}
                      onChangeText={setFloorNo}
                      placeholder="e.g. 4"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>Total Floors</Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: borderCol,
                          color: textPrimary,
                        },
                      ]}
                      value={totalFloors}
                      onChangeText={setTotalFloors}
                      placeholder="e.g. 12"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Property Condition Pills */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>
                    Property Physical Condition
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                    {conditionOptions.map((opt) => {
                      const isSelected = condition.toLowerCase() === opt.value.toLowerCase();
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          onPress={() => {
                            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                            setCondition(opt.value);
                          }}
                          style={[
                            styles.optionPill,
                            isSelected && styles.optionPillActive,
                            {
                              backgroundColor: isSelected
                                ? "#0D9488"
                                : isDark
                                ? "#0F172A"
                                : "#F1F5F9",
                              borderColor: isSelected ? "#0D9488" : borderCol,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.optionPillText,
                              {
                                color: isSelected ? "#FFFFFF" : isDark ? "#E2E8F0" : "#334155",
                              },
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Physical Inspection Checklist Switches */}
                <View style={styles.checklistSection}>
                  <Text style={[styles.subSectionTitle, { color: textPrimary }]}>
                    Mandatory Physical Verification Checklist
                  </Text>

                  <View
                    style={[
                      styles.switchCard,
                      { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: borderCol },
                    ]}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={[styles.switchCardTitle, { color: textPrimary }]}>
                        Physical On-Site Visit Completed
                      </Text>
                      <Text style={[styles.switchCardSub, { color: textSecondary }]}>
                        Staff member physically entered the property
                      </Text>
                    </View>
                    <Switch
                      value={visitDone}
                      onValueChange={(val) => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                        setVisitDone(val);
                      }}
                      trackColor={{ false: "#64748B", true: "#0D9488" }}
                    />
                  </View>

                  <View
                    style={[
                      styles.switchCard,
                      { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: borderCol },
                    ]}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={[styles.switchCardTitle, { color: textPrimary }]}>
                        Ownership Documents Verified
                      </Text>
                      <Text style={[styles.switchCardSub, { color: textSecondary }]}>
                        Registry copy, allotment letter, or tax receipt checked
                      </Text>
                    </View>
                    <Switch
                      value={docsVerified}
                      onValueChange={(val) => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                        setDocsVerified(val);
                      }}
                      trackColor={{ false: "#64748B", true: "#0D9488" }}
                    />
                  </View>

                  <View
                    style={[
                      styles.switchCard,
                      { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: borderCol },
                    ]}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={[styles.switchCardTitle, { color: textPrimary }]}>
                        Electricity & Utility Bills Checked
                      </Text>
                      <Text style={[styles.switchCardSub, { color: textSecondary }]}>
                        Confirmed CA number and zero pending arrears
                      </Text>
                    </View>
                    <Switch
                      value={billChecked}
                      onValueChange={(val) => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                        setBillChecked(val);
                      }}
                      trackColor={{ false: "#64748B", true: "#0D9488" }}
                    />
                  </View>

                  <View
                    style={[
                      styles.switchCard,
                      { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: borderCol },
                    ]}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={[styles.switchCardTitle, { color: textPrimary }]}>
                        Keys Handed Over / Available
                      </Text>
                      <Text style={[styles.switchCardSub, { color: textSecondary }]}>
                        Keys with guard or available on call for visits
                      </Text>
                    </View>
                    <Switch
                      value={keysAvailable}
                      onValueChange={(val) => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                        setKeysAvailable(val);
                      }}
                      trackColor={{ false: "#64748B", true: "#0D9488" }}
                    />
                  </View>
                </View>

                {/* Remarks */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>
                    Staff Inspection Notes & Audit Remarks
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      {
                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                        borderColor: borderCol,
                        color: textPrimary,
                      },
                    ]}
                    value={inspectionRemarks}
                    onChangeText={setInspectionRemarks}
                    placeholder="Enter on-ground audit observations (e.g. newly painted, lift working, sunny balcony)..."
                    placeholderTextColor={textSecondary}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            )}

            {/* ── STEP 3: OWNER & KYC VERIFICATION ── */}
            {currentStep === 3 && (
              <View
                style={[
                  styles.card,
                  { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: "#F59E0B20" }]}>
                      <Ionicons name="shield-checkmark" size={18} color="#F59E0B" />
                    </View>
                    <Text style={[styles.cardTitle, { color: textPrimary }]}>
                      Owner KYC & Identity Check
                    </Text>
                  </View>
                  <View style={[styles.stepCountPill, { backgroundColor: "#F59E0B15" }]}>
                    <Text style={[styles.stepCountText, { color: "#F59E0B" }]}>Step 3 of 5</Text>
                  </View>
                </View>

                {/* Owner Profile Banner */}
                <View style={styles.ownerTopProfile}>
                  <View style={[styles.ownerAvatar, { backgroundColor: "#0D9488" }]}>
                    <Text style={styles.ownerAvatarText}>
                      {(ownerName || lead.ownerName || "O").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ownerMainName, { color: textPrimary }]}>
                      {ownerName || lead.ownerName || "Unknown Owner"}
                    </Text>
                    <Text style={[styles.ownerMainPhone, { color: textSecondary }]}>
                      {ownerPhone || lead.ownerPhone || "No Phone"}
                    </Text>
                  </View>
                  <View style={styles.ownerContactButtons}>
                    <TouchableOpacity
                      onPress={() => handleCall(ownerPhone || lead.ownerPhone)}
                      style={styles.callCircleBtn}
                    >
                      <Feather name="phone-call" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleWhatsApp(ownerPhone || lead.ownerPhone, ownerName || lead.ownerName)}
                      style={[styles.callCircleBtn, { backgroundColor: "#25D366" }]}
                    >
                      <FontAwesome5 name="whatsapp" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Aadhaar Last 4 & Real-time Check */}
                <View style={styles.formGroup}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={[styles.inputLabel, { color: textSecondary }]}>
                      Owner Aadhaar (Last 4 Digits) *
                    </Text>
                    {checkingAadhaar && <ActivityIndicator size="small" color="#0D9488" />}
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                        borderColor: aadhaarWarning ? "#EF4444" : borderCol,
                        color: textPrimary,
                        fontSize: 18,
                        letterSpacing: 4,
                        fontWeight: "700",
                      },
                    ]}
                    value={aadhaarLast4}
                    onChangeText={handleAadhaarChange}
                    placeholder="4-digit PIN (e.g. 7890)"
                    placeholderTextColor={textSecondary}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  {aadhaarWarning && (
                    <View style={styles.warningBox}>
                      <Feather name="alert-triangle" size={14} color="#EF4444" style={{ marginRight: 6 }} />
                      <Text style={styles.warningText}>{aadhaarWarning}</Text>
                    </View>
                  )}
                </View>

                {/* PAN Card */}
                <View style={styles.formGroup}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>Owner PAN Card Number</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                        borderColor: borderCol,
                        color: textPrimary,
                        textTransform: "uppercase",
                      },
                    ]}
                    value={panCard}
                    onChangeText={(val) => setPanCard(val.toUpperCase())}
                    placeholder="e.g. ABCDE1234F"
                    placeholderTextColor={textSecondary}
                    autoCapitalize="characters"
                    maxLength={10}
                  />
                </View>

                {/* Owner Banking / Payout Account */}
                <View
                  style={[
                    styles.bankDetailsBox,
                    { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: borderCol },
                  ]}
                >
                  <View style={styles.bankBoxHeader}>
                    <MaterialCommunityIcons name="bank" size={16} color="#0D9488" />
                    <Text style={[styles.bankBoxTitle, { color: textPrimary }]}>
                      Owner Direct Payout Bank Account
                    </Text>
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: textSecondary }]}>Bank Name</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            borderColor: borderCol,
                            color: textPrimary,
                          },
                        ]}
                        value={bankName}
                        onChangeText={setBankName}
                        placeholder="e.g. HDFC Bank"
                        placeholderTextColor={textSecondary}
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: textSecondary }]}>IFSC Code</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            borderColor: borderCol,
                            color: textPrimary,
                            textTransform: "uppercase",
                          },
                        ]}
                        value={ifscCode}
                        onChangeText={(val) => setIfscCode(val.toUpperCase())}
                        placeholder="HDFC0001234"
                        placeholderTextColor={textSecondary}
                      />
                    </View>
                  </View>

                  <View style={styles.formRow}>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: textSecondary }]}>Account Number</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            borderColor: borderCol,
                            color: textPrimary,
                          },
                        ]}
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        placeholder="Account Number"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.formGroup, { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: textSecondary }]}>UPI ID</Text>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                            borderColor: borderCol,
                            color: textPrimary,
                          },
                        ]}
                        value={upiId}
                        onChangeText={setUpiId}
                        placeholder="owner@okhdfcbank"
                        placeholderTextColor={textSecondary}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* ── STEP 4: GUIDED PHOTO & VIDEO CAPTURE FLOW ── */}
            {currentStep === 4 && (
              <View
                style={[
                  styles.card,
                  { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: "#0D948820" }]}>
                      <Feather name="camera" size={18} color="#0D9488" />
                    </View>
                    <Text style={[styles.cardTitle, { color: textPrimary }]}>
                      Guided Media Capture Flow
                    </Text>
                  </View>
                  <View style={[styles.stepCountPill, { backgroundColor: "#0D948815" }]}>
                    <Text style={[styles.stepCountText, { color: "#0D9488" }]}>Step 4 of 5</Text>
                  </View>
                </View>

                <Text style={[styles.stepSubDesc, { color: textSecondary }]}>
                  Capture verified high-resolution photographs and 360° walkthrough videos for live listing publication:
                </Text>

                {[
                  { key: "parking", label: "1. Building Entrance & Parking", icon: "truck" },
                  { key: "stairs", label: "2. Stairs, Lift & Lobby", icon: "layers" },
                  { key: "livingRoom", label: "3. Drawing / Living Room", icon: "tv" },
                  { key: "kitchen", label: "4. Modular Kitchen", icon: "coffee" },
                  { key: "bedroom", label: "5. Master Bedroom", icon: "moon" },
                  { key: "bathroom", label: "6. Washroom & Fittings", icon: "droplet" },
                  { key: "balcony", label: "7. Balcony & Open View", icon: "sun" },
                ].map((item) => {
                  const hasPhoto = Boolean(mediaSlots[item.key]);
                  const isUploading = Boolean(uploadingSlots[item.key]);

                  return (
                    <View
                      key={item.key}
                      style={[
                        styles.photoSlotCard,
                        {
                          backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                          borderColor: hasPhoto ? "#10B981" : borderCol,
                        },
                      ]}
                    >
                      <View style={styles.photoSlotHeader}>
                        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                          <Feather
                            name={item.icon as any}
                            size={16}
                            color={hasPhoto ? "#10B981" : "#0D9488"}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={[styles.photoSlotTitle, { color: textPrimary }]}>
                            {item.label}
                          </Text>
                        </View>
                        {hasPhoto ? (
                          <View style={styles.verifiedBadge}>
                            <Feather name="check" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                            <Text style={styles.verifiedBadgeText}>CAPTURED</Text>
                          </View>
                        ) : (
                          <Text style={styles.requiredTag}>*REQUIRED</Text>
                        )}
                      </View>

                      {hasPhoto ? (
                        <View style={styles.previewContainer}>
                          <Image
                            source={{ uri: mediaSlots[item.key] }}
                            style={styles.slotImagePreview}
                            resizeMode="cover"
                          />
                          {isUploading && (
                            <View style={styles.uploadingOverlay}>
                              <ActivityIndicator size="small" color="#FFFFFF" />
                              <Text style={styles.uploadingOverlayText}>Syncing to Server...</Text>
                            </View>
                          )}
                          <TouchableOpacity
                            onPress={() => handleRemovePhoto(item.key)}
                            style={styles.removePhotoBtn}
                          >
                            <Feather name="trash-2" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.slotButtonsRow}>
                          <TouchableOpacity
                            onPress={() => handlePickImage(item.key, true)}
                            style={[styles.mediaActionBtn, { backgroundColor: "#0D9488" }]}
                          >
                            <Feather name="camera" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.mediaActionBtnText}>Take Photo</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handlePickImage(item.key, false)}
                            style={[
                              styles.mediaActionBtn,
                              { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" },
                            ]}
                          >
                            <Feather name="image" size={14} color={textPrimary} style={{ marginRight: 6 }} />
                            <Text style={[styles.mediaActionBtnText, { color: textPrimary }]}>
                              Gallery
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => handleQuickAddDemoPhoto(item.key)}
                            style={styles.demoSampleBtn}
                          >
                            <Text style={styles.demoSampleBtnText}>Sample</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}

                {/* Walkthrough Video Slot */}
                <View
                  style={[
                    styles.photoSlotCard,
                    {
                      backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
                      borderColor: mediaSlots.videoUrl ? "#10B981" : borderCol,
                    },
                  ]}
                >
                  <View style={styles.photoSlotHeader}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <Feather
                        name="video"
                        size={16}
                        color={mediaSlots.videoUrl ? "#10B981" : "#8B5CF6"}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={[styles.photoSlotTitle, { color: textPrimary }]}>
                        8. Walkthrough Video (Max 2 Mins)
                      </Text>
                    </View>
                    {mediaSlots.videoUrl ? (
                      <View style={styles.verifiedBadge}>
                        <Feather name="check" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.verifiedBadgeText}>ATTACHED</Text>
                      </View>
                    ) : (
                      <Text style={[styles.requiredTag, { color: "#64748B" }]}>OPTIONAL</Text>
                    )}
                  </View>

                  {mediaSlots.videoUrl ? (
                    <View style={[styles.videoAttachedBox, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
                      <Feather name="film" size={20} color="#8B5CF6" style={{ marginRight: 10 }} />
                      <Text style={[styles.videoAttachedText, { color: textPrimary }]} numberOfLines={1}>
                        {mediaSlots.videoUrl}
                      </Text>
                      <TouchableOpacity onPress={() => handleRemovePhoto("videoUrl")} style={styles.removeVideoBtn}>
                        <Feather name="x" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.slotButtonsRow}>
                      <TouchableOpacity
                        onPress={() => handlePickVideo(true)}
                        style={[styles.mediaActionBtn, { backgroundColor: "#8B5CF6" }]}
                      >
                        <Feather name="video" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                        <Text style={styles.mediaActionBtnText}>Record Video</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handlePickVideo(false)}
                        style={[
                          styles.mediaActionBtn,
                          { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" },
                        ]}
                      >
                        <Feather name="folder" size={14} color={textPrimary} style={{ marginRight: 6 }} />
                        <Text style={[styles.mediaActionBtnText, { color: textPrimary }]}>
                          Video File
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleQuickAddDemoPhoto("videoUrl")}
                        style={styles.demoSampleBtn}
                      >
                        <Text style={styles.demoSampleBtnText}>Sample</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ── STEP 5: PUBLISH & LOCK LISTING ── */}
            {currentStep === 5 && (
              <View
                style={[
                  styles.card,
                  { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: "#10B98120" }]}>
                      <Ionicons name="checkmark-done-circle" size={18} color="#10B981" />
                    </View>
                    <Text style={[styles.cardTitle, { color: textPrimary }]}>
                      Publish & Lock Verification
                    </Text>
                  </View>
                  <View style={[styles.stepCountPill, { backgroundColor: "#10B98115" }]}>
                    <Text style={[styles.stepCountText, { color: "#10B981" }]}>Step 5 of 5</Text>
                  </View>
                </View>

                {/* Audit Summary Box */}
                <View
                  style={[
                    styles.summaryAuditBox,
                    { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: borderCol },
                  ]}
                >
                  <Text style={[styles.summaryTitle, { color: textPrimary }]}>
                    Verification Audit Summary
                  </Text>
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryItemLabel, { color: textSecondary }]}>Property:</Text>
                    <Text style={[styles.summaryItemVal, { color: textPrimary }]}>
                      {lead.title || ((lead.propertyType || "Property") + " in " + (locality || lead.locality))}
                    </Text>
                  </View>
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryItemLabel, { color: textSecondary }]}>Verified Price:</Text>
                    <Text style={[styles.summaryItemVal, { color: "#0D9488", fontWeight: "800" }]}>
                      ₹{(Number(negotiablePrice) || lead.expectedPrice || 0).toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryItemLabel, { color: textSecondary }]}>Aadhaar Masked:</Text>
                    <Text style={[styles.summaryItemVal, { color: textPrimary }]}>
                      {aadhaarLast4 ? "•••• •••• " + aadhaarLast4 : "Not Provided"}
                    </Text>
                  </View>
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryItemLabel, { color: textSecondary }]}>Photos Uploaded:</Text>
                    <Text style={[styles.summaryItemVal, { color: textPrimary }]}>
                      {Object.values(mediaSlots).filter((v) => Boolean(v) && !v.includes("youtube")).length} media items
                    </Text>
                  </View>
                </View>

                {/* Mandatory Confirmation Switch */}
                <TouchableOpacity
                  onPress={() => {
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                    setConfirmLockChecked(!confirmLockChecked);
                  }}
                  style={[
                    styles.confirmLockCard,
                    {
                      backgroundColor: confirmLockChecked ? "#10B98115" : isDark ? "#0F172A" : "#FFFBEB",
                      borderColor: confirmLockChecked ? "#10B981" : "#F59E0B",
                    },
                  ]}
                >
                  <Switch
                    value={confirmLockChecked}
                    onValueChange={(val) => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                      setConfirmLockChecked(val);
                    }}
                    trackColor={{ false: "#64748B", true: "#10B981" }}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.confirmLockTitle, { color: textPrimary }]}>
                      I confirm all details are authentic & verified on site
                    </Text>
                    <Text style={[styles.confirmLockSub, { color: textSecondary }]}>
                      Once published, owner PII will be permanently masked and this listing record will be locked.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Final Publish Button */}
                <TouchableOpacity
                  onPress={handlePublishListing}
                  disabled={publishing}
                  style={[
                    styles.publishMainBtn,
                    { backgroundColor: confirmLockChecked ? "#10B981" : "#94A3B8" },
                  ]}
                >
                  {publishing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.publishMainBtnText}>Publish & Lock Listing</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Safe Padding */}
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Bottom Fixed Stepper Action Bar */}
          <View
            style={[
              styles.bottomActionBar,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderTopColor: borderCol },
            ]}
          >
            {currentStep > 1 ? (
              <TouchableOpacity
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  setCurrentStep((prev) => Math.max(prev - 1, 1) as StepType);
                }}
                style={[
                  styles.prevStepBtn,
                  { backgroundColor: isDark ? "#334155" : "#E2E8F0" },
                ]}
              >
                <Feather name="arrow-left" size={16} color={textPrimary} style={{ marginRight: 6 }} />
                <Text style={[styles.prevStepBtnText, { color: textPrimary }]}>Previous</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {currentStep < 5 ? (
              <TouchableOpacity
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  setCurrentStep((prev) => Math.min(prev + 1, 5) as StepType);
                }}
                style={[styles.nextStepBtn, { backgroundColor: "#0D9488" }]}
              >
                <Text style={styles.nextStepBtnText}>Next: {stepsConfig[currentStep].label}</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            ) : null}
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
    height: "92%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  leadIdText: {
    fontSize: 12,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  stepperScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: "700",
  },
  stepLabelText: {
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
  },
  pricingCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: 0.5,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0D9488",
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  stepCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepCountText: {
    fontSize: 11,
    fontWeight: "800",
  },
  mapFrame: {
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  mapContainer: {
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
    position: "relative",
  },
  pinCenterWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -16,
    marginTop: -32,
    alignItems: "center",
  },
  pinGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(13, 148, 136, 0.3)",
    top: -4,
  },
  pinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#0D9488",
  },
  mapLayerSwitcher: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    borderRadius: 8,
    padding: 2,
  },
  layerChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  layerChipActive: {
    backgroundColor: "#0D9488",
  },
  layerChipText: {
    color: "#E2E8F0",
    fontSize: 11,
    fontWeight: "600",
  },
  layerChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  zoomControlsWrap: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    overflow: "hidden",
  },
  zoomBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  accuracyPill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  accuracyText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  gpsActionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  coordLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  coordValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  navActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  navActionText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  formSection: {
    marginTop: 6,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  formGroup: {
    marginBottom: 12,
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  pillRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  optionPillActive: {
    borderColor: "#0D9488",
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  checklistSection: {
    marginTop: 10,
  },
  switchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  switchCardTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  switchCardSub: {
    fontSize: 11,
    marginTop: 2,
  },
  ownerTopProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerAvatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  ownerMainName: {
    fontSize: 15,
    fontWeight: "700",
  },
  ownerMainPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  ownerContactButtons: {
    flexDirection: "row",
    gap: 8,
  },
  callCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 8,
    borderRadius: 8,
  },
  warningText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "600",
  },
  bankDetailsBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  bankBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  bankBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  stepSubDesc: {
    fontSize: 12,
    marginBottom: 12,
  },
  photoSlotCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  photoSlotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  photoSlotTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  requiredTag: {
    color: "#EF4444",
    fontSize: 10,
    fontWeight: "800",
  },
  previewContainer: {
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
    height: 140,
  },
  slotImagePreview: {
    width: "100%",
    height: "100%",
  },
  uploadingOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadingOverlayText: {
    color: "#FFFFFF",
    fontSize: 11,
    marginTop: 6,
    fontWeight: "700",
  },
  removePhotoBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(239, 68, 68, 0.85)",
    padding: 6,
    borderRadius: 16,
  },
  slotButtonsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  mediaActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
  },
  mediaActionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  demoSampleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0D9488",
  },
  demoSampleBtnText: {
    color: "#0D9488",
    fontSize: 11,
    fontWeight: "700",
  },
  videoAttachedBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  videoAttachedText: {
    flex: 1,
    fontSize: 12,
  },
  removeVideoBtn: {
    padding: 4,
  },
  summaryAuditBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  summaryItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryItemLabel: {
    fontSize: 12,
  },
  summaryItemVal: {
    fontSize: 12,
    fontWeight: "600",
  },
  confirmLockCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  confirmLockTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  confirmLockSub: {
    fontSize: 11,
    marginTop: 2,
  },
  publishMainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  publishMainBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  bottomActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  prevStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  prevStepBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  nextStepBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextStepBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});

export default PropertyVerificationModal;
