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
import { useResponsiveTheme } from "../../constants/theme";
import apiClient from "../../Redux/api/axiosInstance";

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
  onAssignPress?: (lead: any) => void;
  onDealPress?: (lead: any) => void;
  onCommissionPress?: (lead: any) => void;
  onResolveDuplicate?: (lead: any) => void;
  onStatusChange?: () => void;
}

type EditTab = "basic" | "financials" | "location" | "specs" | "owner" | "tenant" | "media";

export const SuperAdminLeadDetailModal: React.FC<Props> = ({
  visible,
  lead: initialLead,
  onClose,
  onAssignPress,
  onDealPress,
  onCommissionPress,
  onResolveDuplicate,
  onStatusChange,
}) => {
  const { colors, isDark } = useResponsiveTheme();
  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  const [lead, setLead] = useState<any>(initialLead);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Map state
  const [mapZoom, setMapZoom] = useState(16);
  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "hybrid" | "terrain">("roadmap");

  // Sub-modal: Full Property Edit Modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editActiveTab, setEditActiveTab] = useState<EditTab>("basic");
  const [savingProperty, setSavingProperty] = useState(false);

  // Form State: 1. Basic & Overview
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPropertyType, setEditPropertyType] = useState("2BHK");
  const [editListingType, setEditListingType] = useState("rent");
  const [editStatus, setEditStatus] = useState("new");
  const [editFurnishing, setEditFurnishing] = useState("unfurnished");
  const [editAvailableFrom, setEditAvailableFrom] = useState("");
  const [editRemarks, setEditRemarks] = useState("");

  // Form State: 2. Financials
  const [editPrice, setEditPrice] = useState("");
  const [editDeposit, setEditDeposit] = useState("");
  const [editMaintenance, setEditMaintenance] = useState("");
  const [editMinNegotiable, setEditMinNegotiable] = useState("");
  const [editCommissionEst, setEditCommissionEst] = useState("");
  const [editCommissionApproved, setEditCommissionApproved] = useState("");
  const [editCommissionPct, setEditCommissionPct] = useState("");
  const [editCommissionStatus, setEditCommissionStatus] = useState("pending");

  // Form State: 3. Location & GPS
  const [editLocality, setEditLocality] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editLandmark, setEditLandmark] = useState("");
  const [editCity, setEditCity] = useState("Delhi NCR");
  const [editState, setEditState] = useState("Delhi");
  const [editPincode, setEditPincode] = useState("");
  const [editFullAddress, setEditFullAddress] = useState("");
  const [editLatitude, setEditLatitude] = useState("");
  const [editLongitude, setEditLongitude] = useState("");

  // Form State: 4. Specs & Physical Inspection
  const [editCarpetArea, setEditCarpetArea] = useState("");
  const [editBedrooms, setEditBedrooms] = useState("");
  const [editBathrooms, setEditBathrooms] = useState("");
  const [editBalconies, setEditBalconies] = useState("");
  const [editFloorNo, setEditFloorNo] = useState("");
  const [editTotalFloors, setEditTotalFloors] = useState("");
  const [editCondition, setEditCondition] = useState("good");
  const [editKeysAvailable, setEditKeysAvailable] = useState(false);
  const [editPhysicalVisitDone, setEditPhysicalVisitDone] = useState(false);
  const [editOwnershipDocsVerified, setEditOwnershipDocsVerified] = useState(false);
  const [editElectricityBillChecked, setEditElectricityBillChecked] = useState(false);
  const [editStaffRemarks, setEditStaffRemarks] = useState("");

  // Form State: 5. Owner Details & Banking
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

  // Form State: 6. Tenant & Booking (Deal)
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

  // Form State: 7. Media Links
  const [editCoverPhoto, setEditCoverPhoto] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editVirtualTour, setEditVirtualTour] = useState("");
  const [editPhotosListStr, setEditPhotosListStr] = useState("");

  // Sub-modal: Delete Property Confirmation
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deletingProperty, setDeletingProperty] = useState(false);

  // Sub-modal for Recording Tenant Rent Payment
  const [isTenantRentModalVisible, setIsTenantRentModalVisible] = useState(false);
  const [rentMonth, setRentMonth] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [rentUtr, setRentUtr] = useState("");
  const [rentMode, setRentMode] = useState("UPI");
  const [rentStatus, setRentStatus] = useState<"PAID" | "PENDING" | "OVERDUE">("PAID");
  const [savingRent, setSavingRent] = useState(false);

  // Sub-modal for Releasing Owner Rent Payout
  const [isOwnerPayoutModalVisible, setIsOwnerPayoutModalVisible] = useState(false);
  const [payoutMonth, setPayoutMonth] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutUtr, setPayoutUtr] = useState("");
  const [payoutMode, setPayoutMode] = useState("UPI");
  const [payoutRemarks, setPayoutRemarks] = useState("");
  const [savingPayout, setSavingPayout] = useState(false);

  // Populate state when lead changes
  const populateFormValues = (currentLead: any) => {
    if (!currentLead) return;
    
    // 1. Basic
    setEditTitle(currentLead.title || "");
    setEditDesc(currentLead.description || "");
    setEditPropertyType(currentLead.propertyType || "2BHK");
    setEditListingType(currentLead.listingType || "rent");
    setEditStatus(currentLead.status || "new");
    setEditFurnishing(currentLead.furnishing || "unfurnished");
    setEditAvailableFrom(currentLead.availableFrom ? new Date(currentLead.availableFrom).toISOString().split("T")[0] : "");
    setEditRemarks(currentLead.remarks || "");

    // 2. Financials
    setEditPrice(String(currentLead.expectedPrice || ""));
    setEditDeposit(String(currentLead.securityDeposit || ""));
    setEditMaintenance(String(currentLead.maintenanceCharge || ""));
    setEditMinNegotiable(String(currentLead.inspectionDetails?.negotiablePriceMin || ""));
    setEditCommissionEst(String(currentLead.commission?.estimatedAmount || ""));
    setEditCommissionApproved(String(currentLead.commission?.approvedAmount || ""));
    setEditCommissionPct(String(currentLead.commission?.percentage || ""));
    setEditCommissionStatus(currentLead.commission?.status || "pending");

    // 3. Location & GPS
    setEditLocality(currentLead.locality || "");
    setEditStreet(currentLead.address?.street || "");
    setEditLandmark(currentLead.address?.landmark || "");
    setEditCity(currentLead.address?.city || "Delhi NCR");
    setEditState(currentLead.address?.state || "Delhi");
    setEditPincode(currentLead.address?.pincode || "");
    setEditFullAddress(currentLead.address?.fullAddress || "");
    
    const lat = currentLead.gpsDetails?.latitude || (currentLead.location?.coordinates?.[1]) || currentLead.latitude || "";
    const lng = currentLead.gpsDetails?.longitude || (currentLead.location?.coordinates?.[0]) || currentLead.longitude || "";
    setEditLatitude(lat ? String(lat) : "");
    setEditLongitude(lng ? String(lng) : "");

    // 4. Specs & Inspection
    setEditCarpetArea(String(currentLead.inspectionDetails?.actualCarpetAreaSqFt || ""));
    setEditBedrooms(String(currentLead.inspectionDetails?.actualBedrooms || ""));
    setEditBathrooms(String(currentLead.inspectionDetails?.actualBathrooms || ""));
    setEditBalconies(String(currentLead.inspectionDetails?.actualBalconies || ""));
    setEditFloorNo(String(currentLead.inspectionDetails?.floorNumber || ""));
    setEditTotalFloors(String(currentLead.inspectionDetails?.totalFloors || ""));
    setEditCondition(currentLead.inspectionDetails?.propertyCondition || "good");
    setEditKeysAvailable(Boolean(currentLead.inspectionDetails?.keysAvailable));
    setEditPhysicalVisitDone(Boolean(currentLead.inspectionDetails?.physicalVisitDone));
    setEditOwnershipDocsVerified(Boolean(currentLead.inspectionDetails?.ownershipDocsVerified));
    setEditElectricityBillChecked(Boolean(currentLead.inspectionDetails?.electricityBillChecked));
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
    setEditAccountHolder(currentLead.ownerBankDetails?.accountHolderName || currentLead.ownerName || "");
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
    setEditDealClosed(Boolean(currentLead.deal?.isClosed || currentLead.status === "rented" || currentLead.status === "sold"));
    setEditDealNotes(currentLead.deal?.notes || "");

    // 7. Media
    setEditCoverPhoto(currentLead.coverPhoto || "");
    setEditVideoUrl(currentLead.videoUrl || currentLead.videoLink || "");
    setEditVirtualTour(currentLead.virtualTourLink || "");
    const photosArr = currentLead.photos?.map((p: any) => (typeof p === "string" ? p : p.url)) || currentLead.images || [];
    setEditPhotosListStr(photosArr.join("\n"));
  };

  useEffect(() => {
    setLead(initialLead);
    if (initialLead) {
      populateFormValues(initialLead);
      const currentM = new Date().toLocaleString("default", { month: "short", year: "numeric" });
      setRentMonth(currentM);
      setPayoutMonth(currentM);
      const rentVal = String(initialLead.deal?.finalPrice || initialLead.expectedPrice || "");
      setRentAmount(rentVal);
      setPayoutAmount(String(Math.round((Number(rentVal) || 0) * 0.95) || ""));
    }
  }, [initialLead]);

  if (!lead) return null;

  // Open Edit Modal with a specific active tab
  const handleOpenEditModalWithTab = (tab: EditTab = "basic") => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    populateFormValues(lead);
    setEditActiveTab(tab);
    setIsEditModalVisible(true);
  };

  // Master Save Handler for Entire Property
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
    if (!editOwnerPhone.trim()) {
      Alert.alert("Validation Error", "Owner Phone Number is required.");
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
        title: editTitle.trim(),
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
          fullAddress: editFullAddress.trim() || [editStreet, editLandmark, editLocality, editCity].filter(Boolean).join(", "),
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
          fullAddress: [editOwnerHouseNo, editOwnerStreet, editOwnerCity, editOwnerState, editOwnerPincode].filter(Boolean).join(", "),
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
          approvedAmount: Number(editCommissionApproved) || 0,
          percentage: Number(editCommissionPct) || 0,
          status: editCommissionStatus,
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
      }
      setIsEditModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success 🎉", "Entire property has been updated successfully!");
      onStatusChange?.();
    } catch (err: any) {
      Alert.alert("Update Failed", err?.response?.data?.message || "Could not update property details.");
    } finally {
      setSavingProperty(false);
    }
  };

  // Extract Exact GPS Coordinates for Map View
  const latitude =
    Number(lead.gpsDetails?.latitude) ||
    (Array.isArray(lead.location?.coordinates) && lead.location.coordinates[1] ? Number(lead.location.coordinates[1]) : null) ||
    Number(lead.latitude) ||
    28.633298;

  const longitude =
    Number(lead.gpsDetails?.longitude) ||
    (Array.isArray(lead.location?.coordinates) && lead.location.coordinates[0] ? Number(lead.location.coordinates[0]) : null) ||
    Number(lead.longitude) ||
    77.36787;

  const gpsAccuracy = lead.gpsDetails?.accuracy || 3.8;
  const hasCapturedGps = Boolean(lead.gpsDetails?.latitude || (Array.isArray(lead.location?.coordinates) && lead.location.coordinates.length >= 2));

  // High-Res Slippy Map Tile Calculations
  const containerW = Math.min(width - 48, 480);
  const containerH = 200;
  const tileInfo = latLngToTile(latitude, longitude, mapZoom);

  const getTileUrl = (tx: number, ty: number) => {
    if (mapType === "satellite" || mapType === "hybrid") {
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

  const photos = lead.photos && lead.photos.length > 0
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
      Linking.openURL("whatsapp://send?phone=" + full + "&text=" + greet + "%20regarding%20property%20" + encodeURIComponent(lead.title || lead.leadId));
    }
  };

  const handleEmail = (email?: string) => {
    if (email) {
      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
      Linking.openURL("mailto:" + email + "?subject=" + encodeURIComponent("Regarding Property: " + (lead.title || lead.leadId)));
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

  // Handler: Delete Property
  const handleDeleteProperty = async () => {
    setDeletingProperty(true);
    try {
      await apiClient.delete("/leads/" + lead._id, {
        data: { reason: deleteReason.trim() || "Deleted by Super Admin" },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsDeleteModalVisible(false);
      onClose();
      Alert.alert("Deleted", "Property " + (lead.leadId || "") + " has been successfully deleted.");
      onStatusChange?.();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to delete property.");
    } finally {
      setDeletingProperty(false);
    }
  };

  // Handler: Record Tenant Rent Payment
  const handleRecordTenantRent = async () => {
    const amt = Number(rentAmount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid rent amount.");
      return;
    }
    setSavingRent(true);
    try {
      const res = await apiClient.post("/leads/" + lead._id + "/rent-ledger", {
        month: rentMonth,
        amount: amt,
        status: rentStatus,
        paymentMode: rentMode,
        utrNumber: rentUtr,
      });
      if (res.data?.data) {
        setLead(res.data.data);
      }
      setIsTenantRentModalVisible(false);
      Alert.alert("Success", "Tenant rent collection record saved successfully.");
      onStatusChange?.();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to record rent collection.");
    } finally {
      setSavingRent(false);
    }
  };

  // Handler: Release Owner Rent Payout
  const handleReleaseOwnerPayout = async () => {
    const amt = Number(payoutAmount);
    if (!amt || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payout amount.");
      return;
    }
    setSavingPayout(true);
    try {
      const res = await apiClient.post("/leads/" + lead._id + "/owner-payout", {
        month: payoutMonth,
        amount: amt,
        status: "released",
        paymentMode: payoutMode,
        utrNumber: payoutUtr,
        remarks: payoutRemarks,
      });
      if (res.data?.data) {
        setLead(res.data.data);
      }
      setIsOwnerPayoutModalVisible(false);
      Alert.alert("Success", "Owner rent payout released and logged successfully.");
      onStatusChange?.();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to process owner payout.");
    } finally {
      setSavingPayout(false);
    }
  };

  // Calculations for Tenant & Owner Rent Status
  const isRented = lead.status === "rented" || lead.deal?.isClosed || lead.deal?.status === "closed_won";
  const tenantName = lead.deal?.tenantName || (isRented ? "Direct Tenant" : null);
  const tenantPhone = lead.deal?.tenantPhone;
  const tenantAadhaar = lead.deal?.tenantAadhaarLast4;

  const rentLedgerList = Array.isArray(lead.rentLedger) ? lead.rentLedger : [];
  const ownerPayoutList = Array.isArray(lead.ownerPayouts) ? lead.ownerPayouts : [];

  let totalRentCollected = 0;
  let totalRentPending = 0;
  let hasCurrentMonthPaid = false;

  rentLedgerList.forEach((r: any) => {
    if (r.status === "PAID") {
      totalRentCollected += Number(r.amount) || 0;
      hasCurrentMonthPaid = true;
    } else if (r.status === "PENDING" || r.status === "OVERDUE") {
      totalRentPending += Number(r.amount) || 0;
    }
  });

  let totalOwnerDisbursed = 0;
  let totalOwnerPending = 0;
  let hasOwnerPayoutReleased = false;

  ownerPayoutList.forEach((p: any) => {
    if (p.status === "released" || p.status === "paid") {
      totalOwnerDisbursed += Number(p.amount) || 0;
      hasOwnerPayoutReleased = true;
    } else if (p.status === "pending" || p.status === "approved") {
      totalOwnerPending += Number(p.amount) || 0;
    }
  });

  const getStatusColor = (st: string) => {
    switch (st?.toLowerCase()) {
      case "verified": return "#10B981";
      case "rented":
      case "sold": return "#0D9488";
      case "under_verification":
      case "assigned": return "#F59E0B";
      case "rejected":
      case "cancelled": return "#EF4444";
      default: return "#3B82F6";
    }
  };

  const statusColor = getStatusColor(lead.status);

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
          <View style={[styles.modalHeader, { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.headerBadgeRow}>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {(lead.status || "NEW").toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.leadIdText, { color: textSecondary }]}>{lead.leadId || "LEAD"}</Text>
              </View>
              <Text style={[styles.headerTitle, { color: textPrimary }]} numberOfLines={1}>
                {lead.title || `${lead.propertyType || "Property"} in ${lead.locality || "Delhi"}`}
              </Text>
            </View>

            {/* Header Action Buttons */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {/* Full Edit Property Button */}
              <TouchableOpacity
                onPress={() => handleOpenEditModalWithTab("basic")}
                style={[styles.headerIconButton, { backgroundColor: "#0D948815", borderColor: "#0D948850" }]}
              >
                <Feather name="edit-3" size={17} color="#0D9488" />
              </TouchableOpacity>

              {/* Delete Property Button */}
              <TouchableOpacity
                onPress={() => setIsDeleteModalVisible(true)}
                style={[styles.headerIconButton, { backgroundColor: "#EF444415", borderColor: "#EF444450" }]}
              >
                <Feather name="trash-2" size={17} color="#EF4444" />
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}>
                <Feather name="x" size={20} color={textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* 1. Photos Carousel */}
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
            ) : (
              <View style={[styles.noImagePlaceholder, { backgroundColor: isDark ? "#1E293B" : "#E2E8F0" }]}>
                <Ionicons name="images-outline" size={48} color={textSecondary} />
                <Text style={{ color: textSecondary, marginTop: 8, fontSize: 13 }}>No property photos uploaded</Text>
              </View>
            )}

            {/* Quick Action Bar to Edit Any Section */}
            <View style={[styles.quickEditBanner, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.quickEditTitle, { color: textPrimary }]}>Admin Full Control</Text>
                <Text style={[styles.quickEditSub, { color: textSecondary }]}>Super Admin has full authority to edit every section</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleOpenEditModalWithTab("basic")}
                style={styles.quickEditButton}
              >
                <Feather name="edit" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.quickEditBtnText}>Edit Entire Property</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Key Price & Stats Banner */}
            <View style={[styles.pricingCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol }]}>
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceLabel}>
                    {lead.listingType === "sale" || lead.listingType === "SALE" ? "EXPECTED SALE PRICE" : "MONTHLY RENT"}
                  </Text>
                  <Text style={styles.priceAmount}>₹{(lead.expectedPrice || 0).toLocaleString("en-IN")}</Text>
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
                    {lead.securityDeposit ? `₹${Number(lead.securityDeposit).toLocaleString("en-IN")}` : "None"}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: textSecondary }]}>Maintenance</Text>
                  <Text style={[styles.statValue, { color: textPrimary }]}>
                    {lead.maintenanceCharge ? `₹${Number(lead.maintenanceCharge).toLocaleString("en-IN")}/mo` : "Included"}
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

            {/* 3. Comprehensive Property Location & GPS Map */}
            <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol }]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: "#0D948820" }]}>
                    <Ionicons name="location" size={18} color="#0D9488" />
                  </View>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>Property Location & Map</Text>
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
                      style={[styles.layerChip, mapType === "roadmap" && styles.layerChipActive]}
                    >
                      <Text style={[styles.layerChipText, mapType === "roadmap" && styles.layerChipTextActive]}>Road</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setMapType("satellite")}
                      style={[styles.layerChip, mapType === "satellite" && styles.layerChipActive]}
                    >
                      <Text style={[styles.layerChipText, mapType === "satellite" && styles.layerChipTextActive]}>Satellite</Text>
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
                      {hasCapturedGps ? `GPS ±${gpsAccuracy}m` : "Estimated Area"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Coordinates & External Navigation */}
              <View style={[styles.gpsActionRow, { backgroundColor: isDark ? "#0F172A" : "#F1F5F9" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.coordLabel, { color: textSecondary }]}>GPS Coordinates</Text>
                  <Text style={[styles.coordValue, { color: textPrimary }]}>
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </Text>
                </View>
                <TouchableOpacity onPress={openInGoogleMaps} style={styles.navActionButton}>
                  <Ionicons name="map-outline" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.navActionText}>Google Maps</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openDirections} style={[styles.navActionButton, { backgroundColor: "#3B82F6" }]}>
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

            {/* 4. Physical Specs & Field Inspection */}
            <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol }]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: "#8B5CF620" }]}>
                    <Ionicons name="construct" size={18} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>Specifications & Inspection</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenEditModalWithTab("specs")}
                  style={styles.cardEditBadge}
                >
                  <Feather name="edit-2" size={13} color="#0D9488" />
                  <Text style={styles.cardEditText}>Edit</Text>
                </TouchableOpacity>
              </View>

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

            {/* 5. Complete Owner Details & KYC */}
            <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol }]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: "#F59E0B20" }]}>
                    <Ionicons name="person" size={18} color="#F59E0B" />
                  </View>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>Property Owner Information</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenEditModalWithTab("owner")}
                  style={styles.cardEditBadge}
                >
                  <Feather name="edit-2" size={13} color="#0D9488" />
                  <Text style={styles.cardEditText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ownerTopProfile}>
                <View style={[styles.ownerAvatar, { backgroundColor: "#0D9488" }]}>
                  <Text style={styles.ownerAvatarText}>
                    {(lead.ownerName || "O").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ownerMainName, { color: textPrimary }]}>{lead.ownerName || "Unknown Owner"}</Text>
                  <Text style={[styles.ownerMainPhone, { color: textSecondary }]}>{lead.ownerPhone || "No Phone"}</Text>
                </View>
                <View style={styles.ownerContactButtons}>
                  <TouchableOpacity onPress={() => handleCall(lead.ownerPhone)} style={styles.callCircleBtn}>
                    <Feather name="phone-call" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleWhatsApp(lead.ownerPhone, lead.ownerName)} style={[styles.callCircleBtn, { backgroundColor: "#25D366" }]}>
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

              {/* Bank & Payouts Account */}
              <View style={[styles.bankDetailsBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", borderColor: borderCol }]}>
                <View style={styles.bankBoxHeader}>
                  <MaterialCommunityIcons name="bank" size={16} color="#0D9488" />
                  <Text style={[styles.bankBoxTitle, { color: textPrimary }]}>Owner Payout Account</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textSecondary }]}>Bank Name:</Text>
                  <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerBankDetails?.bankName || "Not Set"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textSecondary }]}>Account No:</Text>
                  <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerBankDetails?.accountNumber || "Not Set"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textSecondary }]}>IFSC Code:</Text>
                  <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerBankDetails?.ifscCode || "Not Set"}</Text>
                </View>
                {lead.ownerBankDetails?.upiId ? (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: textSecondary }]}>UPI ID:</Text>
                    <Text style={[styles.infoValue, { color: textPrimary }]}>{lead.ownerBankDetails.upiId}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* 6. Tenant & Rent Management Module */}
            <View style={[styles.card, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderColor: borderCol }]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: "#10B98120" }]}>
                    <FontAwesome5 name="hand-holding-usd" size={16} color="#10B981" />
                  </View>
                  <Text style={[styles.cardTitle, { color: textPrimary }]}>Tenant & Rent Ledger</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpenEditModalWithTab("tenant")}
                  style={styles.cardEditBadge}
                >
                  <Feather name="edit-2" size={13} color="#0D9488" />
                  <Text style={styles.cardEditText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Tenant Profile / Status */}
              <View style={[styles.tenantProfileBanner, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tenantNameText, { color: textPrimary }]}>
                    {tenantName || "No Tenant Assigned (Vacant)"}
                  </Text>
                  {tenantPhone ? (
                    <Text style={[styles.tenantPhoneText, { color: textSecondary }]}>{tenantPhone}</Text>
                  ) : null}
                </View>
                <View style={[styles.rentStatusChip, { backgroundColor: isRented ? "#10B98120" : "#F59E0B20" }]}>
                  <Text style={[styles.rentStatusChipText, { color: isRented ? "#10B981" : "#F59E0B" }]}>
                    {isRented ? "OCCUPIED" : "VACANT"}
                  </Text>
                </View>
              </View>

              {/* Rent Metrics Summary */}
              <View style={styles.rentMetricsRow}>
                <View style={[styles.metricCard, { backgroundColor: isDark ? "#0F172A" : "#F1F5F9" }]}>
                  <Text style={[styles.metricLabel, { color: textSecondary }]}>Collected</Text>
                  <Text style={[styles.metricValue, { color: "#10B981" }]}>₹{totalRentCollected.toLocaleString("en-IN")}</Text>
                </View>
                <View style={[styles.metricCard, { backgroundColor: isDark ? "#0F172A" : "#F1F5F9" }]}>
                  <Text style={[styles.metricLabel, { color: textSecondary }]}>Disbursed to Owner</Text>
                  <Text style={[styles.metricValue, { color: "#0D9488" }]}>₹{totalOwnerDisbursed.toLocaleString("en-IN")}</Text>
                </View>
              </View>

              {/* Action Buttons to Record Ledger / Owner Payout */}
              <View style={styles.rentActionButtonsRow}>
                <TouchableOpacity
                  onPress={() => setIsTenantRentModalVisible(true)}
                  style={[styles.rentActionButton, { backgroundColor: "#10B981" }]}
                >
                  <Feather name="plus-circle" size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.rentActionBtnText}>Record Rent Payment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsOwnerPayoutModalVisible(true)}
                  style={[styles.rentActionButton, { backgroundColor: "#0D9488" }]}
                >
                  <MaterialCommunityIcons name="bank-transfer-out" size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.rentActionBtnText}>Release Owner Payout</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Safe Padding */}
            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Bottom Fixed Action Bar */}
          <View style={[styles.bottomActionBar, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF", borderTopColor: borderCol }]}>
            <TouchableOpacity
              onPress={() => handleOpenEditModalWithTab("basic")}
              style={[styles.primaryActionBtn, { backgroundColor: "#0D9488" }]}
            >
              <Feather name="edit-3" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.primaryActionBtnText}>Edit Full Property</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsDeleteModalVisible(true)}
              style={[styles.secondaryActionBtn, { borderColor: "#EF4444" }]}
            >
              <Feather name="trash-2" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ──────────────────────────────────────────────────────────
          MASTER FULL PROPERTY EDIT MODAL (ALL TABS & FIELDS)
      ────────────────────────────────────────────────────────── */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalContainer, { backgroundColor: isDark ? "#0F172A" : "#FFFFFF" }]}>
            {/* Edit Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalHeaderTitle, { color: textPrimary }]}>Edit Entire Property</Text>
                <Text style={[styles.modalHeaderSub, { color: textSecondary }]}>{lead.leadId || "Property"}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={[styles.closeButton, { backgroundColor: isDark ? "#334155" : "#E2E8F0" }]}>
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
                      { label: "New Lead", value: "new" },
                      { label: "Assigned", value: "assigned" },
                      { label: "Under Verification", value: "under_verification" },
                      { label: "Verified & Active", value: "verified" },
                      { label: "Rented Out", value: "rented" },
                      { label: "Sold", value: "sold" },
                      { label: "Rejected", value: "rejected" },
                      { label: "Cancelled", value: "cancelled" },
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
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Internal Super Admin Remarks</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Staff or internal notes..."
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

                  <View style={styles.formSectionDivider}>
                    <Text style={[styles.sectionSubtitle, { color: textPrimary }]}>Agent Commission Tracking</Text>
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Estimated (₹)</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 5000"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editCommissionEst}
                        onChangeText={setEditCommissionEst}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Approved (₹)</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. 5000"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editCommissionApproved}
                        onChangeText={setEditCommissionApproved}
                      />
                    </View>
                  </View>

                  {renderOptionSelector(
                    "Commission Status",
                    [
                      { label: "Pending", value: "pending" },
                      { label: "Approved", value: "approved" },
                      { label: "Paid", value: "paid" },
                      { label: "Rejected", value: "rejected" },
                    ],
                    editCommissionStatus,
                    setEditCommissionStatus
                  )}
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
                      { label: "Excellent", value: "excellent" },
                      { label: "Good", value: "good" },
                      { label: "Needs Repair", value: "needs_repair" },
                      { label: "Poor", value: "poor" },
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
                      placeholder="Inspection notes and comments..."
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
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Primary Mobile *</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="10-digit number"
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
                        placeholder="Optional"
                        placeholderTextColor={textSecondary}
                        keyboardType="phone-pad"
                        value={editAltPhone}
                        onChangeText={setEditAltPhone}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Owner Email Address</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. owner@example.com"
                      placeholderTextColor={textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={editOwnerEmail}
                      onChangeText={setEditOwnerEmail}
                    />
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Aadhaar Last 4</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="4 digits"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        maxLength={4}
                        value={editOwnerAadhaar}
                        onChangeText={setEditOwnerAadhaar}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>PAN Card Number</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="ABCDE1234F"
                        placeholderTextColor={textSecondary}
                        autoCapitalize="characters"
                        value={editOwnerPan}
                        onChangeText={setEditOwnerPan}
                      />
                    </View>
                  </View>

                  {renderOptionSelector(
                    "Owner KYC Status",
                    [
                      { label: "Not Submitted", value: "not_submitted" },
                      { label: "Pending", value: "pending" },
                      { label: "Verified", value: "verified" },
                      { label: "Rejected", value: "rejected" },
                    ],
                    editOwnerKycStatus,
                    setEditOwnerKycStatus
                  )}

                  <View style={styles.formSectionDivider}>
                    <Text style={[styles.sectionSubtitle, { color: textPrimary }]}>Owner Bank & UPI Details</Text>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Account Holder Name</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="Name as per bank"
                      placeholderTextColor={textSecondary}
                      value={editAccountHolder}
                      onChangeText={setEditAccountHolder}
                    />
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Bank Name</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="e.g. HDFC Bank"
                        placeholderTextColor={textSecondary}
                        value={editBankName}
                        onChangeText={setEditBankName}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Account Number</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="Account Number"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editAccountNumber}
                        onChangeText={setEditAccountNumber}
                      />
                    </View>
                  </View>

                  <View style={styles.rowTwoInputs}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>IFSC Code</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="HDFC0001234"
                        placeholderTextColor={textSecondary}
                        autoCapitalize="characters"
                        value={editIfscCode}
                        onChangeText={setEditIfscCode}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>UPI ID</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="owner@upi"
                        placeholderTextColor={textSecondary}
                        autoCapitalize="none"
                        value={editUpiId}
                        onChangeText={setEditUpiId}
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* TAB 6: TENANT & DEAL */}
              {editActiveTab === "tenant" && (
                <View>
                  <View style={[styles.switchRow, { borderColor: borderCol, marginBottom: 16 }]}>
                    <Text style={[styles.switchLabel, { color: textPrimary }]}>Deal Closed / Property Occupied</Text>
                    <Switch
                      value={editDealClosed}
                      onValueChange={setEditDealClosed}
                      trackColor={{ false: "#94A3B8", true: "#10B981" }}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Tenant Full Name</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. Amit Sharma"
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
                        placeholder="10-digit number"
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
                        placeholder="4 digits"
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
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Final Agreed Rent (₹)</Text>
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
                      <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Lease Months</Text>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                        placeholder="11"
                        placeholderTextColor={textSecondary}
                        keyboardType="numeric"
                        value={editLeaseMonths}
                        onChangeText={setEditLeaseMonths}
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Agreement Number</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="e.g. AGR-2026-9812"
                      placeholderTextColor={textSecondary}
                      value={editAgreementNumber}
                      onChangeText={setEditAgreementNumber}
                    />
                  </View>

                  {renderOptionSelector(
                    "Police Verification Status",
                    [
                      { label: "Pending", value: "pending" },
                      { label: "Submitted", value: "submitted" },
                      { label: "Verified", value: "verified" },
                      { label: "Not Required", value: "not_required" },
                    ],
                    editPoliceStatus,
                    setEditPoliceStatus
                  )}
                </View>
              )}

              {/* TAB 7: MEDIA & LINKS */}
              {editActiveTab === "media" && (
                <View>
                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Cover Photo URL</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="https://..."
                      placeholderTextColor={textSecondary}
                      value={editCoverPhoto}
                      onChangeText={setEditCoverPhoto}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Property Photos URLs (one per line)</Text>
                    <TextInput
                      style={[styles.textArea, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol, height: 110 }]}
                      placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                      placeholderTextColor={textSecondary}
                      multiline
                      value={editPhotosListStr}
                      onChangeText={setEditPhotosListStr}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Video URL / YouTube Link</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="https://youtube.com/..."
                      placeholderTextColor={textSecondary}
                      value={editVideoUrl}
                      onChangeText={setEditVideoUrl}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? "#94A3B8" : "#475569" }]}>Virtual 3D Tour Link</Text>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: isDark ? "#1E293B" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
                      placeholder="https://my.matterport.com/..."
                      placeholderTextColor={textSecondary}
                      value={editVirtualTour}
                      onChangeText={setEditVirtualTour}
                    />
                  </View>
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Modal Bottom Footer */}
            <View style={[styles.editModalFooter, { borderTopColor: borderCol, backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                style={[styles.editCancelBtn, { borderColor: borderCol }]}
              >
                <Text style={[styles.editCancelText, { color: textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveFullProperty}
                disabled={savingProperty}
                style={[styles.editSaveBtn, { backgroundColor: "#0D9488" }]}
              >
                {savingProperty ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="check" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.editSaveText}>Save All Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ──────────────────────────────────────────────────────────
          SUB-MODAL: DELETE PROPERTY CONFIRMATION
      ────────────────────────────────────────────────────────── */}
      <Modal visible={isDeleteModalVisible} transparent animationType="fade" onRequestClose={() => setIsDeleteModalVisible(false)}>
        <View style={styles.subModalOverlay}>
          <View style={[styles.subModalCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={[styles.deleteIconWrap, { backgroundColor: "#EF444420" }]}>
              <Feather name="trash-2" size={28} color="#EF4444" />
            </View>
            <Text style={[styles.subModalTitle, { color: textPrimary }]}>Delete Property?</Text>
            <Text style={[styles.subModalSub, { color: textSecondary }]}>
              Are you sure you want to delete lead {lead.leadId || lead._id}? This property will be archived.
            </Text>

            <TextInput
              style={[styles.subModalInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
              placeholder="Reason for deletion (Optional)"
              placeholderTextColor={textSecondary}
              value={deleteReason}
              onChangeText={setDeleteReason}
            />

            <View style={styles.subModalActions}>
              <TouchableOpacity onPress={() => setIsDeleteModalVisible(false)} style={[styles.subModalBtn, { borderColor: borderCol }]}>
                <Text style={{ color: textSecondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteProperty}
                disabled={deletingProperty}
                style={[styles.subModalBtn, { backgroundColor: "#EF4444" }]}
              >
                {deletingProperty ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Confirm Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ──────────────────────────────────────────────────────────
          SUB-MODAL: RECORD TENANT RENT PAYMENT
      ────────────────────────────────────────────────────────── */}
      <Modal visible={isTenantRentModalVisible} transparent animationType="slide" onRequestClose={() => setIsTenantRentModalVisible(false)}>
        <View style={styles.subModalOverlay}>
          <View style={[styles.subModalCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <Text style={[styles.subModalTitle, { color: textPrimary }]}>Record Rent Payment</Text>
            <Text style={[styles.subModalSub, { color: textSecondary }]}>Log rent received from tenant</Text>

            <TextInput
              style={[styles.subModalInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
              placeholder="Month (e.g. Oct 2026)"
              placeholderTextColor={textSecondary}
              value={rentMonth}
              onChangeText={setRentMonth}
            />
            <TextInput
              style={[styles.subModalInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
              placeholder="Amount Received (₹)"
              placeholderTextColor={textSecondary}
              keyboardType="numeric"
              value={rentAmount}
              onChangeText={setRentAmount}
            />
            <TextInput
              style={[styles.subModalInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
              placeholder="Payment Mode (UPI / Bank Transfer / Cash)"
              placeholderTextColor={textSecondary}
              value={rentMode}
              onChangeText={setRentMode}
            />
            <TextInput
              style={[styles.subModalInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
              placeholder="UTR / Transaction Ref Number"
              placeholderTextColor={textSecondary}
              value={rentUtr}
              onChangeText={setRentUtr}
            />

            <View style={styles.subModalActions}>
              <TouchableOpacity onPress={() => setIsTenantRentModalVisible(false)} style={[styles.subModalBtn, { borderColor: borderCol }]}>
                <Text style={{ color: textSecondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRecordTenantRent}
                disabled={savingRent}
                style={[styles.subModalBtn, { backgroundColor: "#10B981" }]}
              >
                {savingRent ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Save Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ──────────────────────────────────────────────────────────
          SUB-MODAL: RELEASE OWNER RENT PAYOUT
      ────────────────────────────────────────────────────────── */}
      <Modal visible={isOwnerPayoutModalVisible} transparent animationType="slide" onRequestClose={() => setIsOwnerPayoutModalVisible(false)}>
        <View style={styles.subModalOverlay}>
          <View style={[styles.subModalCard, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <Text style={[styles.subModalTitle, { color: textPrimary }]}>Release Owner Rent Payout</Text>
            <Text style={[styles.subModalSub, { color: textSecondary }]}>
              Disburse monthly rental earnings to {lead.ownerName || "Owner"}
            </Text>

            <TextInput
              style={[styles.subModalInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
              placeholder="Month (e.g. Oct 2026)"
              placeholderTextColor={textSecondary}
              value={payoutMonth}
              onChangeText={setPayoutMonth}
            />
            <TextInput
              style={[styles.subModalInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
              placeholder="Payout Amount (₹)"
              placeholderTextColor={textSecondary}
              keyboardType="numeric"
              value={payoutAmount}
              onChangeText={setPayoutAmount}
            />
            <TextInput
              style={[styles.subModalInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
              placeholder="Bank / UPI Reference (UTR)"
              placeholderTextColor={textSecondary}
              value={payoutUtr}
              onChangeText={setPayoutUtr}
            />
            <TextInput
              style={[styles.subModalInput, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary, borderColor: borderCol }]}
              placeholder="Notes / Remarks"
              placeholderTextColor={textSecondary}
              value={payoutRemarks}
              onChangeText={setPayoutRemarks}
            />

            <View style={styles.subModalActions}>
              <TouchableOpacity onPress={() => setIsOwnerPayoutModalVisible(false)} style={[styles.subModalBtn, { borderColor: borderCol }]}>
                <Text style={{ color: textSecondary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReleaseOwnerPayout}
                disabled={savingPayout}
                style={[styles.subModalBtn, { backgroundColor: "#0D9488" }]}
              >
                {savingPayout ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Release Payout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  leadIdText: {
    fontSize: 11,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  carouselContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#1E293B",
  },
  photoCountBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
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
    fontWeight: "600",
  },
  thumbStrip: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
  },
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 6,
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
  noImagePlaceholder: {
    height: 120,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  quickEditBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  quickEditTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  quickEditSub: {
    fontSize: 11,
    marginTop: 2,
  },
  quickEditButton: {
    backgroundColor: "#0D9488",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickEditBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  pricingCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: 0.5,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0D9488",
    marginTop: 2,
  },
  cardEditBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D948815",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  cardEditText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0D9488",
  },
  statGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.15)",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(148, 163, 184, 0.2)",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  mapFrame: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  mapContainer: {
    overflow: "hidden",
    position: "relative",
    borderRadius: 14,
    backgroundColor: "#1E293B",
  },
  pinCenterWrap: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -16,
    marginTop: -32,
    alignItems: "center",
    zIndex: 10,
  },
  pinGlow: {
    position: "absolute",
    bottom: -4,
    width: 20,
    height: 6,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  pinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 4,
  },
  pinPoint: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderStyle: "solid",
    backgroundColor: "transparent",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#EF4444",
  },
  mapLayerSwitcher: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 8,
    padding: 2,
    zIndex: 12,
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
    fontSize: 10,
    fontWeight: "600",
  },
  layerChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  zoomControlsWrap: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    overflow: "hidden",
    zIndex: 12,
  },
  zoomBtn: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
  },
  accuracyPill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    zIndex: 12,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  accuracyText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },
  gpsActionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  coordLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  coordValue: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 1,
  },
  navActionButton: {
    backgroundColor: "#0D9488",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
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
    alignItems: "center",
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  specBox: {
    flex: 1,
    minWidth: "45%",
    padding: 10,
    borderRadius: 10,
  },
  specBoxLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  specBoxVal: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
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
    gap: 5,
  },
  checkText: {
    fontSize: 11,
    fontWeight: "600",
  },
  ownerTopProfile: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
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
    marginTop: 1,
  },
  ownerContactButtons: {
    flexDirection: "row",
    gap: 8,
  },
  callCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    fontSize: 12,
    fontWeight: "700",
  },
  tenantProfileBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  tenantNameText: {
    fontSize: 14,
    fontWeight: "700",
  },
  tenantPhoneText: {
    fontSize: 11,
    marginTop: 2,
  },
  rentStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rentStatusChipText: {
    fontSize: 10,
    fontWeight: "800",
  },
  rentMetricsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  rentActionButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  rentActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  rentActionBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  bottomActionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
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
    paddingVertical: 13,
    borderRadius: 12,
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryActionBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  // Full Property Edit Modal Styles
  editModalContainer: {
    flex: 1,
    marginTop: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  modalHeaderSub: {
    fontSize: 11,
    marginTop: 1,
  },
  editTabsBar: {
    borderBottomWidth: 1,
  },
  tabsScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderBottomWidth: 2,
  },
  tabItemActive: {
    backgroundColor: "#0D948815",
  },
  tabItemText: {
    fontSize: 12,
  },
  editFormScroll: {
    padding: 16,
    paddingBottom: 60,
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
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  optionPillActive: {
    borderColor: "#0D9488",
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  rowTwoInputs: {
    flexDirection: "row",
    marginBottom: 14,
  },
  formSectionDivider: {
    marginVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.2)",
    paddingTop: 10,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  editModalFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  editCancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  editCancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  editSaveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 12,
  },
  editSaveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  // Sub-modal shared styles
  subModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  subModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  deleteIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  subModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  subModalSub: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  subModalInput: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 12,
  },
  subModalActions: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
    marginTop: 8,
  },
  subModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
});
