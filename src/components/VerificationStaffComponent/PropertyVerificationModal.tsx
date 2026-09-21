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
import ComplaintModal from "./ComplaintModal";

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
type EditTab = "basic" | "financials" | "location" | "specs" | "owner" | "tenant" | "media";

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

  // ────────────────────────────────────────────────────────────
  // SUB-MODAL: FULL PROPERTY EDIT MODAL STATE (LIKE SUPERADMIN)
  // ────────────────────────────────────────────────────────────
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editActiveTab, setEditActiveTab] = useState<EditTab>("basic");
  const [savingProperty, setSavingProperty] = useState(false);

  // 1. Basic & Overview
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPropertyType, setEditPropertyType] = useState("2BHK");
  const [editListingType, setEditListingType] = useState("rent");
  const [editStatus, setEditStatus] = useState("under_verification");
  const [editFurnishing, setEditFurnishing] = useState("unfurnished");
  const [editAvailableFrom, setEditAvailableFrom] = useState("");
  const [editRemarks, setEditRemarks] = useState("");

  // 2. Financials
  const [editPrice, setEditPrice] = useState("");
  const [editDeposit, setEditDeposit] = useState("");
  const [editMaintenance, setEditMaintenance] = useState("");
  const [editMinNegotiable, setEditMinNegotiable] = useState("");
  const [editCommissionEst, setEditCommissionEst] = useState("");
  const [editCommissionApproved, setEditCommissionApproved] = useState("");
  const [editCommissionStatus, setEditCommissionStatus] = useState("pending");

  // 3. Location & GPS
  const [editLocality, setEditLocality] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editLandmark, setEditLandmark] = useState("");
  const [editCity, setEditCity] = useState("Delhi NCR");
  const [editState, setEditState] = useState("Delhi");
  const [editPincode, setEditPincode] = useState("");
  const [editFullAddress, setEditFullAddress] = useState("");
  const [editLatitude, setEditLatitude] = useState("");
  const [editLongitude, setEditLongitude] = useState("");

  // 4. Specs & Physical Visit
  const [editCarpetArea, setEditCarpetArea] = useState("");
  const [editBedrooms, setEditBedrooms] = useState("");
  const [editBathrooms, setEditBathrooms] = useState("");
  const [editBalconies, setEditBalconies] = useState("");
  const [editFloorNo, setEditFloorNo] = useState("");
  const [editTotalFloors, setEditTotalFloors] = useState("");
  const [editCondition, setEditCondition] = useState("good");
  const [editKeysAvailable, setEditKeysAvailable] = useState(true);
  const [editPhysicalVisitDone, setEditPhysicalVisitDone] = useState(true);
  const [editOwnershipDocsVerified, setEditOwnershipDocsVerified] = useState(true);
  const [editElectricityBillChecked, setEditElectricityBillChecked] = useState(true);
  const [editStaffRemarks, setEditStaffRemarks] = useState("");

  // 5. Owner Details & Banking
  const [editOwnerName, setEditOwnerName] = useState("");
  const [editOwnerPhone, setEditOwnerPhone] = useState("");
  const [editAltPhone, setEditAltPhone] = useState("");
  const [editOwnerEmail, setEditOwnerEmail] = useState("");
  const [editOwnerAadhaar, setEditOwnerAadhaar] = useState("");
  const [editOwnerPan, setEditOwnerPan] = useState("");
  const [editOwnerHouseNo, setEditOwnerHouseNo] = useState("");
  const [editOwnerStreet, setEditOwnerStreet] = useState("");
  const [editOwnerCity, setEditOwnerCity] = useState("");
  const [editOwnerState, setEditOwnerState] = useState("");
  const [editOwnerPincode, setEditOwnerPincode] = useState("");
  const [editAccountHolder, setEditAccountHolder] = useState("");
  const [editBankName, setEditBankName] = useState("");
  const [editAccountNumber, setEditAccountNumber] = useState("");
  const [editIfscCode, setEditIfscCode] = useState("");
  const [editUpiId, setEditUpiId] = useState("");
  const [editOwnerKycStatus, setEditOwnerKycStatus] = useState("not_submitted");
  const [editOwnerNotes, setEditOwnerNotes] = useState("");

  // 6. Tenant & Deal Info
  const [editTenantName, setEditTenantName] = useState("");
  const [editTenantPhone, setEditTenantPhone] = useState("");
  const [editTenantAadhaar, setEditTenantAadhaar] = useState("");
  const [editDealPrice, setEditDealPrice] = useState("");
  const [editDealDeposit, setEditDealDeposit] = useState("");
  const [editLeaseMonths, setEditLeaseMonths] = useState("11");
  const [editAgreementNumber, setEditAgreementNumber] = useState("");
  const [editPoliceStatus, setEditPoliceStatus] = useState("pending");
  const [editDealClosed, setEditDealClosed] = useState(false);
  const [editDealNotes, setEditDealNotes] = useState("");

  // 7. Media Links
  const [editCoverPhoto, setEditCoverPhoto] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editVirtualTour, setEditVirtualTour] = useState("");
  const [editPhotosListStr, setEditPhotosListStr] = useState("");

  // ────────────────────────────────────────────────────────────
  // STEPPER GUIDED WORKFLOW STATE
  // ────────────────────────────────────────────────────────────
  const [aadhaarWarning, setAadhaarWarning] = useState<string | null>(null);
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);

  // Guided Media Capture Slots
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

  // Publish & Lock State
  const [confirmLockChecked, setConfirmLockChecked] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isReportFraudModalVisible, setIsReportFraudModalVisible] = useState(false);

  // Populate form values from lead object
  const populateFormValues = (currentLead: any) => {
    if (!currentLead) return;

    // 1. Basic
    setEditTitle(currentLead.title || "");
    setEditDesc(currentLead.description || "");
    setEditPropertyType(currentLead.propertyType || "2BHK");
    setEditListingType(currentLead.listingType || "rent");
    setEditStatus(currentLead.status || "under_verification");
    setEditFurnishing(currentLead.furnishing || "unfurnished");
    setEditAvailableFrom(
      currentLead.availableFrom ? new Date(currentLead.availableFrom).toISOString().split("T")[0] : ""
    );
    setEditRemarks(currentLead.remarks || "");

    // 2. Financials
    setEditPrice(String(currentLead.expectedPrice || ""));
    setEditDeposit(String(currentLead.securityDeposit || ""));
    setEditMaintenance(String(currentLead.maintenanceCharge || ""));
    setEditMinNegotiable(String(currentLead.inspectionDetails?.negotiablePriceMin || ""));
    setEditCommissionEst(String(currentLead.commission?.estimatedAmount || ""));
    setEditCommissionApproved(String(currentLead.commission?.approvedAmount || ""));
    setEditCommissionStatus(currentLead.commission?.status || "pending");

    // 3. Location & GPS
    setEditLocality(currentLead.locality || "");
    setEditStreet(currentLead.address?.street || "");
    setEditLandmark(currentLead.address?.landmark || "");
    setEditCity(currentLead.address?.city || "Delhi NCR");
    setEditState(currentLead.address?.state || "Delhi");
    setEditPincode(currentLead.address?.pincode || "");
    setEditFullAddress(currentLead.address?.fullAddress || "");

    const lat =
      currentLead.gpsDetails?.latitude ||
      (Array.isArray(currentLead.location?.coordinates) && currentLead.location.coordinates[1]) ||
      currentLead.latitude ||
      "";
    const lng =
      currentLead.gpsDetails?.longitude ||
      (Array.isArray(currentLead.location?.coordinates) && currentLead.location.coordinates[0]) ||
      currentLead.longitude ||
      "";
    setEditLatitude(lat ? String(lat) : "");
    setEditLongitude(lng ? String(lng) : "");

    // 4. Specs & Inspection
    setEditCarpetArea(String(currentLead.inspectionDetails?.actualCarpetAreaSqFt || ""));
    setEditBedrooms(
      String(
        currentLead.inspectionDetails?.actualBedrooms ||
          (currentLead.propertyType?.includes("1")
            ? "1"
            : currentLead.propertyType?.includes("3")
            ? "3"
            : "2")
      )
    );
    setEditBathrooms(String(currentLead.inspectionDetails?.actualBathrooms || "2"));
    setEditBalconies(String(currentLead.inspectionDetails?.actualBalconies || "1"));
    setEditFloorNo(String(currentLead.inspectionDetails?.floorNumber || ""));
    setEditTotalFloors(String(currentLead.inspectionDetails?.totalFloors || ""));
    setEditCondition(currentLead.inspectionDetails?.propertyCondition || "good");
    setEditKeysAvailable(currentLead.inspectionDetails?.keysAvailable ?? true);
    setEditPhysicalVisitDone(currentLead.inspectionDetails?.physicalVisitDone ?? true);
    setEditOwnershipDocsVerified(currentLead.inspectionDetails?.ownershipDocsVerified ?? true);
    setEditElectricityBillChecked(currentLead.inspectionDetails?.electricityBillChecked ?? true);
    setEditStaffRemarks(currentLead.inspectionDetails?.staffChecklistRemarks || "");

    // 5. Owner
    setEditOwnerName(currentLead.ownerName || "");
    setEditOwnerPhone(currentLead.ownerPhone || "");
    setEditAltPhone(currentLead.alternatePhone || "");
    setEditOwnerEmail(currentLead.ownerEmail || "");
    setEditOwnerAadhaar(currentLead.ownerAadhaarLast4 || "");
    setEditOwnerPan(currentLead.ownerPanCard || "");
    setEditOwnerHouseNo(currentLead.ownerAddress?.houseNo || "");
    setEditOwnerStreet(currentLead.ownerAddress?.street || "");
    setEditOwnerCity(currentLead.ownerAddress?.city || "");
    setEditOwnerState(currentLead.ownerAddress?.state || "");
    setEditOwnerPincode(currentLead.ownerAddress?.pincode || "");
    setEditAccountHolder(
      currentLead.ownerBankDetails?.accountHolderName || currentLead.ownerName || ""
    );
    setEditBankName(currentLead.ownerBankDetails?.bankName || "");
    setEditAccountNumber(currentLead.ownerBankDetails?.accountNumber || "");
    setEditIfscCode(currentLead.ownerBankDetails?.ifscCode || "");
    setEditUpiId(currentLead.ownerBankDetails?.upiId || "");
    setEditOwnerKycStatus(currentLead.ownerKYC?.status || "not_submitted");
    setEditOwnerNotes(currentLead.ownerNotes || "");

    // 6. Tenant & Deal
    setEditTenantName(currentLead.deal?.tenantName || "");
    setEditTenantPhone(currentLead.deal?.tenantPhone || "");
    setEditTenantAadhaar(currentLead.deal?.tenantAadhaarLast4 || "");
    setEditDealPrice(String(currentLead.deal?.finalPrice || currentLead.expectedPrice || ""));
    setEditDealDeposit(String(currentLead.deal?.deposit || currentLead.securityDeposit || ""));
    setEditLeaseMonths(String(currentLead.deal?.leaseDurationMonths || "11"));
    setEditAgreementNumber(currentLead.deal?.agreementNumber || "");
    setEditPoliceStatus(currentLead.deal?.policeVerificationStatus || "pending");
    setEditDealClosed(
      Boolean(
        currentLead.deal?.isClosed ||
          currentLead.status === "rented" ||
          currentLead.status === "sold"
      )
    );
    setEditDealNotes(currentLead.deal?.notes || "");

    // 7. Media
    setEditCoverPhoto(currentLead.coverPhoto || "");
    setEditVideoUrl(currentLead.videoUrl || currentLead.videoLink || "");
    setEditVirtualTour(currentLead.virtualTourLink || "");
    const photosArr =
      currentLead.photos?.map((p: any) => (typeof p === "string" ? p : p.url)) ||
      currentLead.images ||
      [];
    setEditPhotosListStr(photosArr.join("\n"));

    // Media slots for guided capture
    setMediaSlots({
      parking: photosArr[0] || "",
      stairs: photosArr[1] || "",
      livingRoom: photosArr[2] || "",
      kitchen: photosArr[3] || "",
      bedroom: photosArr[4] || "",
      bathroom: photosArr[5] || "",
      balcony: photosArr[6] || "",
      videoUrl: currentLead.videoUrl || currentLead.videoLink || "",
    });
  };

  useEffect(() => {
    setLead(initialLead);
    if (initialLead) {
      setCurrentStep(1);
      setActivePhotoIdx(0);
      populateFormValues(initialLead);
      setAadhaarWarning(null);
      setUploadingSlots({});
      setConfirmLockChecked(false);
    }
  }, [initialLead, visible]);

  if (!lead) return null;

  // Open Edit Modal with a specific active tab
  const handleOpenEditModalWithTab = (tab: EditTab = "basic") => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    populateFormValues(lead);
    setEditActiveTab(tab);
    setIsEditModalVisible(true);
  };

  // Master Save & Submit Handler for Entire Property
  const handleSaveFullProperty = async () => {
    if (!editLocality.trim()) {
      Alert.alert("Validation Error", "Locality is required.");
      setEditActiveTab("location");
      return;
    }
    if (!editOwnerName.trim()) {
      Alert.alert("Validation Error", "Owner Name is required.");
      setEditActiveTab("owner");
      return;
    }

    setSavingProperty(true);
    try {
      const photosArray = editPhotosListStr
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.length > 5);

      const payload: any = {
        title: editTitle.trim() || `${editPropertyType} in ${editLocality}`,
        description: editDesc.trim(),
        propertyType: editPropertyType,
        listingType: editListingType,
        status: editStatus,
        furnishing: editFurnishing,
        expectedPrice: Number(editPrice) || 0,
        securityDeposit: Number(editDeposit) || 0,
        maintenanceCharge: Number(editMaintenance) || 0,
        availableFrom: editAvailableFrom ? new Date(editAvailableFrom) : undefined,
        remarks: editRemarks.trim(),

        // Location & GPS
        locality: editLocality.trim(),
        address: {
          street: editStreet.trim(),
          landmark: editLandmark.trim(),
          city: editCity.trim(),
          state: editState.trim(),
          pincode: editPincode.trim(),
          fullAddress:
            editFullAddress.trim() ||
            [editStreet, editLandmark, editLocality, editCity].filter(Boolean).join(", "),
        },

        // Owner Info
        ownerName: editOwnerName.trim(),
        ownerPhone: editOwnerPhone.replace(/\D/g, ""),
        alternatePhone: editAltPhone.trim(),
        ownerEmail: editOwnerEmail.trim().toLowerCase(),
        ownerAadhaarLast4: editOwnerAadhaar.trim().slice(-4),
        ownerPanCard: editOwnerPan.trim().toUpperCase(),
        ownerAddress: {
          houseNo: editOwnerHouseNo.trim(),
          street: editOwnerStreet.trim(),
          city: editOwnerCity.trim(),
          state: editOwnerState.trim(),
          pincode: editOwnerPincode.trim(),
          fullAddress: [
            editOwnerHouseNo,
            editOwnerStreet,
            editOwnerCity,
            editOwnerState,
            editOwnerPincode,
          ]
            .filter(Boolean)
            .join(", "),
        },
        ownerBankDetails: {
          accountHolderName: editAccountHolder.trim() || editOwnerName.trim(),
          bankName: editBankName.trim(),
          accountNumber: editAccountNumber.trim(),
          ifscCode: editIfscCode.trim().toUpperCase(),
          accountType: "Savings",
          upiId: editUpiId.trim(),
        },
        ownerKYC: {
          ...lead.ownerKYC,
          status: editOwnerKycStatus,
        },
        ownerNotes: editOwnerNotes.trim(),

        // Physical Inspection & Specs
        inspectionDetails: {
          ...lead.inspectionDetails,
          actualCarpetAreaSqFt: Number(editCarpetArea) || undefined,
          actualBedrooms: Number(editBedrooms) || undefined,
          actualBathrooms: Number(editBathrooms) || undefined,
          actualBalconies: Number(editBalconies) || undefined,
          floorNumber: Number(editFloorNo) || undefined,
          totalFloors: Number(editTotalFloors) || undefined,
          propertyCondition: editCondition,
          negotiablePriceMin: Number(editMinNegotiable) || undefined,
          keysAvailable: editKeysAvailable,
          physicalVisitDone: editPhysicalVisitDone,
          ownershipDocsVerified: editOwnershipDocsVerified,
          electricityBillChecked: editElectricityBillChecked,
          staffChecklistRemarks: editStaffRemarks.trim(),
        },

        // Tenant Deal Info
        deal: {
          ...lead.deal,
          tenantName: editTenantName.trim(),
          tenantPhone: editTenantPhone.trim(),
          tenantAadhaarLast4: editTenantAadhaar.trim().slice(-4),
          finalPrice: Number(editDealPrice) || Number(editPrice) || 0,
          deposit: Number(editDealDeposit) || Number(editDeposit) || 0,
          leaseDurationMonths: Number(editLeaseMonths) || 11,
          agreementNumber: editAgreementNumber.trim(),
          policeVerificationStatus: editPoliceStatus,
          isClosed: editDealClosed,
          notes: editDealNotes.trim(),
        },

        // Commission Tracking
        commission: {
          ...lead.commission,
          estimatedAmount: Number(editCommissionEst) || 0,
          approvedAmount: (editStatus === "rented" || editStatus === "sold" || editDealClosed) ? (Number(editCommissionApproved) || 0) : 0,
          status: (editStatus === "rented" || editStatus === "sold" || editDealClosed) ? editCommissionStatus : "pending",
        },

        // Media Links
        coverPhoto: editCoverPhoto.trim() || (photosArray[0] || undefined),
        videoUrl: editVideoUrl.trim(),
        videoLink: editVideoUrl.trim(),
        virtualTourLink: editVirtualTour.trim(),
      };

      if (photosArray.length > 0) {
        payload.photos = photosArray.map((url, idx) => ({
          url,
          caption: "Photo " + (idx + 1),
          isCover: idx === 0,
        }));
        payload.images = photosArray;
      }

      if (editLatitude && editLongitude) {
        payload.latitude = Number(editLatitude);
        payload.longitude = Number(editLongitude);
        payload.gpsDetails = {
          latitude: Number(editLatitude),
          longitude: Number(editLongitude),
          accuracy: 3.5,
          reverseGeocodedAddress: editFullAddress.trim() || editLocality.trim(),
        };
      }

      const res = await apiClient.patch("/leads/" + lead._id, payload);
      if (res.data?.data) {
        setLead(res.data.data);
        populateFormValues(res.data.data);
      }
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      setIsEditModalVisible(false);
      Alert.alert(
        "Property Details Saved 🎉",
        "All property specifications, location, owner KYC and media have been updated successfully."
      );
      onSuccess?.();
    } catch (err: any) {
      console.error("Save property error:", err);
      Alert.alert(
        "Update Failed",
        err?.response?.data?.message || "Could not save property changes. Please try again."
      );
    } finally {
      setSavingProperty(false);
    }
  };

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
    setEditOwnerAadhaar(clean);
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
        actualCarpetAreaSqFt: Number(editCarpetArea) || undefined,
        actualBedrooms: Number(editBedrooms) || undefined,
        actualBathrooms: Number(editBathrooms) || undefined,
        actualBalconies: Number(editBalconies) || undefined,
        floorNumber: Number(editFloorNo) || undefined,
        totalFloors: Number(editTotalFloors) || undefined,
        propertyCondition: editCondition,
        negotiablePriceMin: Number(editMinNegotiable) || Number(editPrice) || lead.expectedPrice,
        keysAvailable: editKeysAvailable,
        physicalVisitDone: editPhysicalVisitDone,
        ownershipDocsVerified: editOwnershipDocsVerified,
        electricityBillChecked: editElectricityBillChecked,
        staffChecklistRemarks:
          editStaffRemarks.trim() || "Inspected on-site, verified specs & KYC.",
        ownerAadhaarLast4: editOwnerAadhaar.trim().slice(-4),
        ownerPanCard: editOwnerPan.trim().toUpperCase(),
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

  // Reusable Pill / Option Selector for Edit Form
  const renderOptionSelector = (
    label: string,
    options: { label: string; value: string }[],
    selectedValue: string,
    onSelect: (val: string) => void
  ) => (
    <View style={styles.formGroup}>
      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
        {options.map((opt) => {
          const isSelected = selectedValue.toLowerCase() === opt.value.toLowerCase();
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                onSelect(opt.value);
              }}
              style={[
                styles.optionPill,
                isSelected && styles.optionPillActive,
                {
                  backgroundColor: isSelected
                    ? "#0D9488"
                    : isDark
                    ? "#1E293B"
                    : "#F1F5F9",
                  borderColor: isSelected ? "#0D9488" : borderCol,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionPillText,
                  { color: isSelected ? "#FFFFFF" : isDark ? "#E2E8F0" : "#334155" },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

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

            {/* Header Action Buttons */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {/* Report Fake / Scam Property Button */}
              <TouchableOpacity
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
                  setIsReportFraudModalVisible(true);
                }}
                style={[styles.headerIconButton, { backgroundColor: "#EF444415", borderColor: "#EF444450" }]}
              >
                <Feather name="alert-triangle" size={17} color="#EF4444" />
              </TouchableOpacity>

              {/* Full Edit Property Button */}
              <TouchableOpacity
                onPress={() => handleOpenEditModalWithTab("basic")}
                style={[styles.headerIconButton, { backgroundColor: "#0D948815", borderColor: "#0D948850" }]}
              >
                <Feather name="edit-3" size={17} color="#0D9488" />
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
              >
                <Feather name="x" size={20} color={textPrimary} />
              </TouchableOpacity>
            </View>
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
            {/* 1. Photos Carousel Preview */}
            {photos.length > 0 ? (
              <View style={styles.carouselContainer}>
                <Image source={{ uri: photos[activePhotoIdx] }} style={styles.mainImage} resizeMode="cover" />
                <View style={styles.photoCountBadge}>
                  <Feather name="camera" size={12} color="#FFFFFF" />
                  <Text style={styles.photoCountText}>{activePhotoIdx + 1}/{photos.length}</Text>
                </View>
                {photos.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbStrip}>
                    {photos.map((p: string, idx: number) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => setActivePhotoIdx(idx)}
                        style={[styles.thumbWrap, idx === activePhotoIdx && styles.thumbWrapActive]}
                      >
                        <Image source={{ uri: p }} style={styles.thumbImage} resizeMode="cover" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            ) : null}

            {/* Quick Action Banner to Edit Any Property Section */}
            <View style={[styles.quickEditBanner, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.quickEditTitle, { color: textPrimary }]}>Full Property Editor</Text>
                <Text style={[styles.quickEditSub, { color: textSecondary }]}>Verification staff can edit every detail & specs</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleOpenEditModalWithTab("basic")}
                style={styles.quickEditButton}
              >
                <Feather name="edit" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.quickEditBtnText}>Edit Entire Property</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Key Pricing & Overview Banner */}
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
                <TouchableOpacity
                  onPress={() => handleOpenEditModalWithTab("financials")}
                  style={styles.cardEditBadge}
                >
                  <Feather name="edit-2" size={13} color="#0D9488" />
                  <Text style={styles.cardEditText}>Edit</Text>
                </TouchableOpacity>
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
                  <TouchableOpacity
                    onPress={() => handleOpenEditModalWithTab("location")}
                    style={styles.cardEditBadge}
                  >
                    <Feather name="edit-2" size={13} color="#0D9488" />
                    <Text style={styles.cardEditText}>Edit</Text>
                  </TouchableOpacity>
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

                {/* Address Details */}
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textSecondary }]}>Locality:</Text>
                  <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.locality || "Not Specified"}</Text>
                </View>
                {lead.address?.landmark ? (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: textSecondary }]}>Landmark:</Text>
                    <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.address.landmark}</Text>
                  </View>
                ) : null}
                {lead.address?.fullAddress ? (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: textSecondary }]}>Full Address:</Text>
                    <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.address.fullAddress}</Text>
                  </View>
                ) : null}
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
                  <TouchableOpacity
                    onPress={() => handleOpenEditModalWithTab("specs")}
                    style={styles.cardEditBadge}
                  >
                    <Feather name="edit-2" size={13} color="#0D9488" />
                    <Text style={styles.cardEditText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                {/* Spec Summary Grid */}
                <View style={styles.specGrid}>
                  <View style={[styles.specBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                    <Text style={[styles.specBoxLabel, { color: textSecondary }]}>Carpet Area</Text>
                    <Text style={[styles.specBoxVal, { color: textPrimary }]}>
                      {lead.inspectionDetails?.actualCarpetAreaSqFt ? `${lead.inspectionDetails.actualCarpetAreaSqFt} sq ft` : "N/A"}
                    </Text>
                  </View>
                  <View style={[styles.specBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                    <Text style={[styles.specBoxLabel, { color: textSecondary }]}>Bedrooms</Text>
                    <Text style={[styles.specBoxVal, { color: textPrimary }]}>
                      {lead.inspectionDetails?.actualBedrooms || lead.propertyType || "N/A"}
                    </Text>
                  </View>
                  <View style={[styles.specBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                    <Text style={[styles.specBoxLabel, { color: textSecondary }]}>Floor / Total</Text>
                    <Text style={[styles.specBoxVal, { color: textPrimary }]}>
                      {lead.inspectionDetails?.floorNumber !== undefined ? `${lead.inspectionDetails.floorNumber} / ${lead.inspectionDetails.totalFloors || "N/A"}` : "N/A"}
                    </Text>
                  </View>
                  <View style={[styles.specBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                    <Text style={[styles.specBoxLabel, { color: textSecondary }]}>Condition</Text>
                    <Text style={[styles.specBoxVal, { color: textPrimary, textTransform: "capitalize" }]}>
                      {lead.inspectionDetails?.propertyCondition || "Good"}
                    </Text>
                  </View>
                </View>

                {/* Checklist Badges */}
                <View style={[styles.checklistStatusRow, { backgroundColor: isDark ? "#0F172A" : "#F1F5F9" }]}>
                  <View style={styles.checkItem}>
                    <Feather
                      name={lead.inspectionDetails?.physicalVisitDone ? "check-circle" : "clock"}
                      size={14}
                      color={lead.inspectionDetails?.physicalVisitDone ? "#10B981" : "#94A3B8"}
                    />
                    <Text style={[styles.checkText, { color: textPrimary }]}>Visit Done</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Feather
                      name={lead.inspectionDetails?.ownershipDocsVerified ? "check-circle" : "clock"}
                      size={14}
                      color={lead.inspectionDetails?.ownershipDocsVerified ? "#10B981" : "#94A3B8"}
                    />
                    <Text style={[styles.checkText, { color: textPrimary }]}>Docs Verified</Text>
                  </View>
                  <View style={styles.checkItem}>
                    <Feather
                      name={lead.inspectionDetails?.keysAvailable ? "check-circle" : "clock"}
                      size={14}
                      color={lead.inspectionDetails?.keysAvailable ? "#10B981" : "#94A3B8"}
                    />
                    <Text style={[styles.checkText, { color: textPrimary }]}>Keys Ready</Text>
                  </View>
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
                  <TouchableOpacity
                    onPress={() => handleOpenEditModalWithTab("owner")}
                    style={styles.cardEditBadge}
                  >
                    <Feather name="edit-2" size={13} color="#0D9488" />
                    <Text style={styles.cardEditText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                {/* Owner Profile Banner */}
                <View style={styles.ownerTopProfile}>
                  <View style={[styles.ownerAvatar, { backgroundColor: "#0D9488" }]}>
                    <Text style={styles.ownerAvatarText}>
                      {(lead.ownerName || "O").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ownerMainName, { color: textPrimary }]}>
                      {lead.ownerName || "Unknown Owner"}
                    </Text>
                    <Text style={[styles.ownerMainPhone, { color: textSecondary }]}>
                      {lead.ownerPhone || "No Phone"}
                    </Text>
                  </View>
                  <View style={styles.ownerContactButtons}>
                    <TouchableOpacity
                      onPress={() => handleCall(lead.ownerPhone)}
                      style={styles.callCircleBtn}
                    >
                      <Feather name="phone-call" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleWhatsApp(lead.ownerPhone, lead.ownerName)}
                      style={[styles.callCircleBtn, { backgroundColor: "#25D366" }]}
                    >
                      <FontAwesome5 name="whatsapp" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textSecondary }]}>Email:</Text>
                  <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerEmail || "Not Provided"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textSecondary }]}>PAN Card:</Text>
                  <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerPanCard || "Not Provided"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textSecondary }]}>Aadhaar Last 4:</Text>
                  <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerAadhaarLast4 ? `•••• •••• ${lead.ownerAadhaarLast4}` : "Not Provided"}</Text>
                </View>

                {/* Bank Details Box */}
                {lead.ownerBankDetails?.bankName ? (
                  <View style={[styles.bankDetailsBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: borderCol }]}>
                    <View style={styles.bankBoxHeader}>
                      <MaterialCommunityIcons name="bank" size={16} color="#0D9488" />
                      <Text style={[styles.bankBoxTitle, { color: textPrimary }]}>Owner Payout Account</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: textSecondary }]}>Bank Name:</Text>
                      <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerBankDetails.bankName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: textSecondary }]}>Account No:</Text>
                      <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerBankDetails.accountNumber || "Not Set"}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: textSecondary }]}>IFSC Code:</Text>
                      <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerBankDetails.ifscCode || "Not Set"}</Text>
                    </View>
                  </View>
                ) : null}
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
                  <TouchableOpacity
                    onPress={() => handleOpenEditModalWithTab("media")}
                    style={styles.cardEditBadge}
                  >
                    <Feather name="edit-2" size={13} color="#0D9488" />
                    <Text style={styles.cardEditText}>Edit Links</Text>
                  </TouchableOpacity>
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
                      {lead.title || ((lead.propertyType || "Property") + " in " + (lead.locality || "Site"))}
                    </Text>
                  </View>
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryItemLabel, { color: textSecondary }]}>Verified Price:</Text>
                    <Text style={[styles.summaryItemVal, { color: "#0D9488", fontWeight: "800" }]}>
                      ₹{(Number(editPrice) || lead.expectedPrice || 0).toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View style={styles.summaryItemRow}>
                    <Text style={[styles.summaryItemLabel, { color: textSecondary }]}>Aadhaar Masked:</Text>
                    <Text style={[styles.summaryItemVal, { color: textPrimary }]}>
                      {lead.ownerAadhaarLast4 ? "•••• •••• " + lead.ownerAadhaarLast4 : "Not Provided"}
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

          {/* Bottom Fixed Action Bar */}
          <View
            style={[
              styles.bottomActionBar,
              { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderTopColor: borderCol },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleOpenEditModalWithTab("basic")}
              style={[styles.primaryActionBtn, { backgroundColor: "#0D9488" }]}
            >
              <Feather name="edit-3" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryActionBtnText}>Edit Full Property</Text>
            </TouchableOpacity>

            {currentStep > 1 && (
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
                <Feather name="arrow-left" size={16} color={textPrimary} />
              </TouchableOpacity>
            )}

            {currentStep < 5 && (
              <TouchableOpacity
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                  setCurrentStep((prev) => Math.min(prev + 1, 5) as StepType);
                }}
                style={[styles.nextStepBtn, { backgroundColor: "#0D9488" }]}
              >
                <Text style={styles.nextStepBtnText}>Next</Text>
                <Feather name="arrow-right" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* ──────────────────────────────────────────────────────────
          MASTER FULL PROPERTY EDIT MODAL (ALL 7 TABS & FIELDS)
      ────────────────────────────────────────────────────────── */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalContainer, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
            {/* Edit Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalHeaderTitle, { color: textPrimary }]}>Edit Entire Property Details</Text>
                <Text style={[styles.modalHeaderSub, { color: textSecondary }]}>{lead.leadId || "Property"}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={[styles.closeButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
              >
                <Feather name="x" size={20} color={textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Navigation Tabs */}
            <View style={[styles.editTabsBar, { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#F8FAFC" }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
                {[
                  { id: "basic", label: "Overview", icon: "home" },
                  { id: "financials", label: "Financials", icon: "dollar-sign" },
                  { id: "location", label: "Location & GPS", icon: "map-pin" },
                  { id: "specs", label: "Specs & Visit", icon: "tool" },
                  { id: "owner", label: "Owner & Bank", icon: "user" },
                  { id: "tenant", label: "Tenant & Deal", icon: "check-circle" },
                  { id: "media", label: "Media & Links", icon: "image" },
                ].map((tab) => {
                  const isActive = editActiveTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
                        setEditActiveTab(tab.id as EditTab);
                      }}
                      style={[
                        styles.tabItem,
                        isActive && styles.tabItemActive,
                        { borderColor: isActive ? "#0D9488" : "transparent" },
                      ]}
                    >
                      <Feather
                        name={tab.icon as any}
                        size={14}
                        color={isActive ? "#0D9488" : textSecondary}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.tabItemText,
                          { color: isActive ? "#0D9488" : textSecondary, fontWeight: isActive ? "700" : "500" },
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Tab Form Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.editFormScroll}>
              {/* TAB 1: BASIC & OVERVIEW */}
              {editActiveTab === "basic" && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Property Title</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. Luxury 2BHK in Indirapuram"
                      placeholderTextColor={textSecondary}
                      value={editTitle}
                      onChangeText={setEditTitle}
                    />
                  </View>

                  {renderOptionSelector(
                    "Property Type / Configuration",
                    [
                      { label: "1 BHK", value: "1BHK" },
                      { label: "2 BHK", value: "2BHK" },
                      { label: "3 BHK", value: "3BHK" },
                      { label: "PG / Studio", value: "PG / Studio" },
                      { label: "Independent House", value: "Independent House" },
                      { label: "Commercial Shop", value: "Commercial Shop" },
                      { label: "Office", value: "office" },
                      { label: "Villa", value: "villa" },
                    ],
                    editPropertyType,
                    setEditPropertyType
                  )}

                  {renderOptionSelector(
                    "Listing Type",
                    [
                      { label: "For Rent", value: "rent" },
                      { label: "For Sale", value: "sale" },
                    ],
                    editListingType,
                    setEditListingType
                  )}

                  {renderOptionSelector(
                    "Property Status",
                    [
                      { label: "Under Verification", value: "under_verification" },
                      { label: "Verified & Active", value: "verified" },
                      { label: "New Lead", value: "new" },
                      { label: "Assigned", value: "assigned" },
                      { label: "Rented Out", value: "rented" },
                      { label: "Sold", value: "sold" },
                      { label: "Rejected", value: "rejected" },
                    ],
                    editStatus,
                    setEditStatus
                  )}

                  {renderOptionSelector(
                    "Furnishing",
                    [
                      { label: "Unfurnished", value: "unfurnished" },
                      { label: "Semi Furnished", value: "semi_furnished" },
                      { label: "Fully Furnished", value: "fully_furnished" },
                    ],
                    editFurnishing,
                    setEditFurnishing
                  )}

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Available From (YYYY-MM-DD)</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 2026-10-01"
                      placeholderTextColor={textSecondary}
                      value={editAvailableFrom}
                      onChangeText={setEditAvailableFrom}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Description</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Enter detailed property description..."
                      placeholderTextColor={textSecondary}
                      multiline
                      numberOfLines={3}
                      value={editDesc}
                      onChangeText={setEditDesc}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Staff / Verification Notes</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Staff or verification notes..."
                      placeholderTextColor={textSecondary}
                      multiline
                      numberOfLines={2}
                      value={editRemarks}
                      onChangeText={setEditRemarks}
                    />
                  </View>
                </View>
              )}

              {/* TAB 2: FINANCIALS */}
              {editActiveTab === "financials" && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Expected Rent / Sale Price (₹) *</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 25000"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={editPrice}
                      onChangeText={setEditPrice}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Security Deposit (₹)</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 50000"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={editDeposit}
                      onChangeText={setEditDeposit}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Maintenance Charges (₹/mo)</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 2000"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={editMaintenance}
                      onChangeText={setEditMaintenance}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Min Negotiable Rent (₹)</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 22000"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                      value={editMinNegotiable}
                      onChangeText={setEditMinNegotiable}
                    />
                  </View>
                </View>
              )}

              {/* TAB 3: LOCATION & GPS */}
              {editActiveTab === "location" && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Locality / Area Name *</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. Indirapuram, Sector 62"
                      placeholderTextColor={textSecondary}
                      value={editLocality}
                      onChangeText={setEditLocality}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Street / Society Name</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. ATS Advantage, Flat 402"
                      placeholderTextColor={textSecondary}
                      value={editStreet}
                      onChangeText={setEditStreet}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Landmark</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. Near Shipra Mall"
                      placeholderTextColor={textSecondary}
                      value={editLandmark}
                      onChangeText={setEditLandmark}
                    />
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>City</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        value={editCity}
                        onChangeText={setEditCity}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Pincode</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 201014"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editPincode}
                        onChangeText={setEditPincode}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Full Formatted Address</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Full printable address..."
                      placeholderTextColor={textSecondary}
                      multiline
                      numberOfLines={2}
                      value={editFullAddress}
                      onChangeText={setEditFullAddress}
                    />
                  </View>

                  <View style={styles.formSectionDivider}>
                    <Text style={[styles.sectionSubtitle, { color: textPrimary }]}>Exact GPS Coordinates</Text>
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Latitude</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 28.633298"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editLatitude}
                        onChangeText={setEditLatitude}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Longitude</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 77.367870"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editLongitude}
                        onChangeText={setEditLongitude}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* TAB 4: SPECS & PHYSICAL INSPECTION */}
              {editActiveTab === "specs" && (
                <View>
                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Carpet Area (sq ft)</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 1250"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editCarpetArea}
                        onChangeText={setEditCarpetArea}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Bedrooms</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 2"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editBedrooms}
                        onChangeText={setEditBedrooms}
                      />
                    </View>
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Bathrooms</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 2"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editBathrooms}
                        onChangeText={setEditBathrooms}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Balconies</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 1"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editBalconies}
                        onChangeText={setEditBalconies}
                      />
                    </View>
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Floor Number</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 4"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editFloorNo}
                        onChangeText={setEditFloorNo}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Total Floors</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 14"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editTotalFloors}
                        onChangeText={setEditTotalFloors}
                      />
                    </View>
                  </View>

                  {renderOptionSelector(
                    "Property Condition",
                    [
                      { label: "Brand New", value: "new" },
                      { label: "Excellent", value: "excellent" },
                      { label: "Good", value: "good" },
                      { label: "Average", value: "average" },
                      { label: "Needs Repair", value: "needs_repair" },
                    ],
                    editCondition,
                    setEditCondition
                  )}

                  <View style={styles.formSectionDivider}>
                    <Text style={[styles.sectionSubtitle, { color: textPrimary }]}>On-Site Verification Checklist</Text>
                  </View>

                  <View style={[styles.switchRow, { borderColor: borderCol }]}>
                    <Text style={[styles.switchLabel, { color: textPrimary }]}>Physical Visit Completed</Text>
                    <Switch
                      value={editPhysicalVisitDone}
                      onValueChange={setEditPhysicalVisitDone}
                      trackColor={{ false: "#94A3B8", true: "#0D9488" }}
                    />
                  </View>

                  <View style={[styles.switchRow, { borderColor: borderCol }]}>
                    <Text style={[styles.switchLabel, { color: textPrimary }]}>Ownership Documents Verified</Text>
                    <Switch
                      value={editOwnershipDocsVerified}
                      onValueChange={setEditOwnershipDocsVerified}
                      trackColor={{ false: "#94A3B8", true: "#0D9488" }}
                    />
                  </View>

                  <View style={[styles.switchRow, { borderColor: borderCol }]}>
                    <Text style={[styles.switchLabel, { color: textPrimary }]}>Electricity Bills Checked</Text>
                    <Switch
                      value={editElectricityBillChecked}
                      onValueChange={setEditElectricityBillChecked}
                      trackColor={{ false: "#94A3B8", true: "#0D9488" }}
                    />
                  </View>

                  <View style={[styles.switchRow, { borderColor: borderCol }]}>
                    <Text style={[styles.switchLabel, { color: textPrimary }]}>Keys Available</Text>
                    <Switch
                      value={editKeysAvailable}
                      onValueChange={setEditKeysAvailable}
                      trackColor={{ false: "#94A3B8", true: "#0D9488" }}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Staff Inspection Remarks</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Inspection notes and audit observations..."
                      placeholderTextColor={textSecondary}
                      multiline
                      numberOfLines={2}
                      value={editStaffRemarks}
                      onChangeText={setEditStaffRemarks}
                    />
                  </View>
                </View>
              )}

              {/* TAB 5: OWNER DETAILS & BANKING */}
              {editActiveTab === "owner" && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Owner Full Name *</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. Ramesh Kumar"
                      placeholderTextColor={textSecondary}
                      value={editOwnerName}
                      onChangeText={setEditOwnerName}
                    />
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Phone Number</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 9876543210"
                        placeholderTextColor={textSecondary}
                        keyboardType="phone-pad"
                        value={editOwnerPhone}
                        onChangeText={setEditOwnerPhone}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Alternate Phone</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 9811122233"
                        placeholderTextColor={textSecondary}
                        keyboardType="phone-pad"
                        value={editAltPhone}
                        onChangeText={setEditAltPhone}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Email Address</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. owner@example.com"
                      placeholderTextColor={textSecondary}
                      keyboardType="email-address"
                      value={editOwnerEmail}
                      onChangeText={setEditOwnerEmail}
                    />
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Aadhaar Last 4</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 5678"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        maxLength={4}
                        value={editOwnerAadhaar}
                        onChangeText={setEditOwnerAadhaar}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>PAN Card</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol, textTransform: "uppercase" }]}
                        placeholder="e.g. ABCDE1234F"
                        placeholderTextColor={textSecondary}
                        maxLength={10}
                        value={editOwnerPan}
                        onChangeText={(val) => setEditOwnerPan(val.toUpperCase())}
                      />
                    </View>
                  </View>

                  <View style={styles.formSectionDivider}>
                    <Text style={[styles.sectionSubtitle, { color: textPrimary }]}>Owner Bank Payout Account</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Bank Name</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. HDFC Bank"
                      placeholderTextColor={textSecondary}
                      value={editBankName}
                      onChangeText={setEditBankName}
                    />
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Account Number</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 50100234567890"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editAccountNumber}
                        onChangeText={setEditAccountNumber}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>IFSC Code</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol, textTransform: "uppercase" }]}
                        placeholder="HDFC0001234"
                        placeholderTextColor={textSecondary}
                        value={editIfscCode}
                        onChangeText={(val) => setEditIfscCode(val.toUpperCase())}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>UPI ID</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. 9876543210@paytm"
                      placeholderTextColor={textSecondary}
                      value={editUpiId}
                      onChangeText={setEditUpiId}
                    />
                  </View>
                </View>
              )}

              {/* TAB 6: TENANT & DEAL */}
              {editActiveTab === "tenant" && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Tenant Name</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. Rohit Sharma"
                      placeholderTextColor={textSecondary}
                      value={editTenantName}
                      onChangeText={setEditTenantName}
                    />
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Tenant Phone</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 9811122233"
                        placeholderTextColor={textSecondary}
                        keyboardType="phone-pad"
                        value={editTenantPhone}
                        onChangeText={setEditTenantPhone}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Tenant Aadhaar Last 4</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 1234"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        maxLength={4}
                        value={editTenantAadhaar}
                        onChangeText={setEditTenantAadhaar}
                      />
                    </View>
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Agreed Rent (₹)</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 24000"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editDealPrice}
                        onChangeText={setEditDealPrice}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Deposit Paid (₹)</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 48000"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editDealDeposit}
                        onChangeText={setEditDealDeposit}
                      />
                    </View>
                  </View>

                  <View style={[styles.switchRow, { borderColor: borderCol }]}>
                    <Text style={[styles.switchLabel, { color: textPrimary }]}>Deal Closed / Occupied</Text>
                    <Switch
                      value={editDealClosed}
                      onValueChange={setEditDealClosed}
                      trackColor={{ false: "#94A3B8", true: "#0D9488" }}
                    />
                  </View>
                </View>
              )}

              {/* TAB 7: MEDIA & LINKS */}
              {editActiveTab === "media" && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Cover Photo URL</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="https://... cover photo url"
                      placeholderTextColor={textSecondary}
                      value={editCoverPhoto}
                      onChangeText={setEditCoverPhoto}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Video URL (YouTube / Direct Link)</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="https://youtube.com/watch?v=..."
                      placeholderTextColor={textSecondary}
                      value={editVideoUrl}
                      onChangeText={setEditVideoUrl}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Virtual Tour 3D Link</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="https://my.matterport.com/show/?m=..."
                      placeholderTextColor={textSecondary}
                      value={editVirtualTour}
                      onChangeText={setEditVirtualTour}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Property Photos (One URL Per Line)</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol, minHeight: 90 }]}
                      placeholder={"https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"}
                      placeholderTextColor={textSecondary}
                      multiline
                      value={editPhotosListStr}
                      onChangeText={setEditPhotosListStr}
                    />
                  </View>
                </View>
              )}

              {/* Bottom Safe Padding in Edit Modal */}
              <View style={{ height: 30 }} />
            </ScrollView>

            {/* Edit Modal Bottom Action Bar */}
            <View style={[styles.bottomActionBar, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderTopColor: borderCol }]}>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={[styles.prevStepBtn, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}
              >
                <Text style={[styles.prevStepBtnText, { color: textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveFullProperty}
                disabled={savingProperty}
                style={[styles.nextStepBtn, { backgroundColor: "#0D9488" }]}
              >
                {savingProperty ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.nextStepBtnText}>Save & Submit Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Fraud / Scam Modal with Proof */}
      {isReportFraudModalVisible && (
        <ComplaintModal
          visible={isReportFraudModalVisible}
          preselectedProperty={lead}
          onClose={() => setIsReportFraudModalVisible(false)}
          onSuccess={() => {
            setIsReportFraudModalVisible(false);
            onSuccess?.();
            onClose();
          }}
        />
      )}
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
  editModalContainer: {
    height: "90%",
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
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  modalHeaderSub: {
    fontSize: 12,
    marginTop: 1,
  },
  editTabsBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  tabItemActive: {
    backgroundColor: "rgba(13, 148, 136, 0.12)",
  },
  tabItemText: {
    fontSize: 13,
  },
  editFormScroll: {
    padding: 16,
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
  carouselContainer: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
  },
  mainImage: {
    width: "100%",
    height: 200,
  },
  photoCountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  photoCountText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  thumbStrip: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbWrapActive: {
    borderColor: "#0D9488",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  quickEditBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  quickEditTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  quickEditSub: {
    fontSize: 11,
    marginTop: 2,
  },
  quickEditButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  quickEditBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
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
  cardEditBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13, 148, 136, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  cardEditText: {
    color: "#0D9488",
    fontSize: 11,
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  specBox: {
    width: "48%",
    padding: 10,
    borderRadius: 10,
  },
  specBoxLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  specBoxVal: {
    fontSize: 13,
    fontWeight: "700",
  },
  checklistStatusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderRadius: 10,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  ownerTopProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 8,
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
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  prevStepBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  prevStepBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  nextStepBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  nextStepBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  formGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
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
    minHeight: 60,
    textAlignVertical: "top",
  },
  rowTwoInputs: {
    flexDirection: "row",
    marginBottom: 12,
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
  formSectionDivider: {
    marginTop: 8,
    marginBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default PropertyVerificationModal;
