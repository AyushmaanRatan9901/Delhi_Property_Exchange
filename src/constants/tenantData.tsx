import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import apiClient from "../Redux/api/axiosInstance";
import { getSocket } from "../services/socketService";

export interface TenantProperty {
  id: string;
  _id?: string;
  propertyId: string;
  title: string;
  propertyType: string;
  configuration: string;
  locality: string;
  address: {
    fullAddress: string;
    street?: string;
    city: string;
    state: string;
    pincode: string;
  };
  rentAmount: number;
  securityDeposit: number;
  carpetAreaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  floorNumber: number;
  totalFloors: number;
  furnishing: string;
  parking: string;
  amenities: string[];
  photos: string[];
  coverPhoto: string;
  occupancyStatus: string;
  leaseStartDate: string;
  leaseDurationMonths: number;
  agreementNumber: string;
  agreementUrl?: string | null;
  policeVerificationStatus: string;
  policeVerificationDate?: string;
  policeVerificationUrl?: string | null;
}

export interface ActiveRent {
  ledgerId?: string | null;
  month: string;
  amount: number;
  dueDate: string | Date;
  status: "PAID" | "PENDING" | "OVERDUE" | "PROCESSING" | "FAILED";
  daysRemaining: number;
  isOverdue: boolean;
  utrNumber?: string | null;
  paymentMode?: string;
  paidDate?: string | Date | null;
}

export interface RentLedgerItem {
  id: string;
  _id?: string;
  month: string;
  amount: number;
  dueDate: string | Date;
  paidDate?: string | Date | null;
  status: "PAID" | "PENDING" | "OVERDUE" | "PROCESSING" | "FAILED";
  paymentMode?: string;
  utrNumber?: string | null;
  receiptId?: string | null;
}

export interface PaymentInstructions {
  upiId: string;
  merchantName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  qrCodeData: string;
}

export interface TenantDocument {
  id: string;
  title: string;
  type: "RENT_AGREEMENT" | "POLICE_VERIFICATION" | "HOUSE_RULES" | "KYC_PROOF" | "OTHER";
  category: string;
  documentNumber: string;
  issuedDate: string | Date;
  validUntil?: string | Date;
  status: "VERIFIED" | "SUBMITTED" | "ACTIVE" | "PENDING";
  fileUrl: string;
  fileSize: string;
  format: string;
  isDownloadable: boolean;
  issuer: string;
}

export interface ComplaintMessage {
  senderRole: string;
  senderName: string;
  text: string;
  photos?: string[];
  createdAt: string | Date;
}

export interface TenantComplaint {
  ticketId: string;
  id?: string;
  category: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "submitted" | "open" | "assigned" | "in_progress" | "resolved" | "reopened" | "closed";
  preferredVisitTime?: string;
  assignedStaffName?: string;
  photos: string[];
  messages: ComplaintMessage[];
  createdAt: string | Date;
  resolvedAt?: string | Date;
  resolutionNotes?: string;
  reopenedAt?: string | Date;
}

export interface TenantInspection {
  inspectionId: string;
  id?: string;
  scheduledDate: string | Date;
  completedDate?: string | Date | null;
  status: "scheduled" | "completed" | "overdue" | "cancelled";
  inspectorName: string;
  conditionScore: "excellent" | "good" | "fair" | "needs_repair" | "poor";
  structuralCheck: boolean;
  electricalCheck: boolean;
  plumbingCheck: boolean;
  cleanlinessCheck: boolean;
  tenantFeedback?: string;
  notes: string;
  photos: string[];
}

export interface RoomChangeRequest {
  requestId: string;
  id?: string;
  reason: string;
  description: string;
  preferredMoveDate: string | Date;
  targetBhk: string;
  targetLocality: string;
  budgetRange: string;
  status: "submitted" | "under_review" | "approved" | "rejected" | "completed";
  photos: string[];
  adminRemarks?: string;
  createdAt: string | Date;
}

export interface TenantNotification {
  _id: string;
  title: string;
  message: string;
  type: string;
  priority?: "low" | "medium" | "high";
  read: boolean;
  createdAt: string | Date;
  data?: any;
}

export interface TenantProfile {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  profilePhoto?: string;
  occupation: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  permanentAddress: string;
  assignedPropertyId?: string | null;
  assignedPropertyTitle?: string | null;
  leaseStartDate?: string | Date;
  agreementNumber?: string;
  verificationStatus: "VERIFIED" | "PENDING";
}

export interface TenantQuickStats {
  unpaidRentCount: number;
  openComplaintsCount: number;
  upcomingInspectionsCount: number;
  unreadNotificationsCount: number;
}

// ── Initial Mock Data Fallbacks ───────────────────────────────────

export const INITIAL_PROPERTY: TenantProperty = {
  id: "DPX-PROP-8842",
  propertyId: "DPX-8842",
  title: "Sunlit 2BHK Luxury High-Rise Apartment",
  propertyType: "2BHK",
  configuration: "2BHK (2 Bed, 2 Bath, 2 Balconies)",
  locality: "Sector 62, Noida, Delhi NCR",
  address: {
    fullAddress: "Flat 804, Tower B, Stellar Greens Society, Sector 62, Noida, Delhi NCR",
    street: "Stellar Greens, Sector 62",
    city: "Noida / Delhi NCR",
    state: "Uttar Pradesh / Delhi NCR",
    pincode: "201309",
  },
  rentAmount: 18500,
  securityDeposit: 37000,
  carpetAreaSqFt: 980,
  bedrooms: 2,
  bathrooms: 2,
  balconies: 2,
  floorNumber: 8,
  totalFloors: 14,
  furnishing: "Semi-Furnished (Modular Kitchen & Wardrobes)",
  parking: "Reserved Basement Car & Bike Parking (Slot #B-804)",
  amenities: [
    "24/7 Power Backup",
    "Gated Society with CCTV",
    "High-Speed Lift Access",
    "Geyser in Both Bathrooms",
    "Modular Kitchen & Chimney",
    "Rooftop Clubhouse & Gym",
    "RO Drinking Water",
    "High-Speed Fiber Ready",
  ],
  photos: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1000&auto=format&fit=crop&q=80",
  ],
  coverPhoto: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80",
  occupancyStatus: "Active Resident",
  leaseStartDate: "2026-04-01",
  leaseDurationMonths: 11,
  agreementNumber: "AGR-DEL-2026-8842",
  agreementUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  policeVerificationStatus: "verified",
  policeVerificationDate: "2026-04-03",
  policeVerificationUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
};

export const INITIAL_ACTIVE_RENT: ActiveRent = {
  ledgerId: "LEDGER-OCT-2026",
  month: "Oct 2026",
  amount: 18500,
  dueDate: "2026-10-05",
  status: "PENDING",
  daysRemaining: 14,
  isOverdue: false,
};

export const INITIAL_RENT_LEDGER: RentLedgerItem[] = [
  {
    id: "LED-001",
    month: "Oct 2026",
    amount: 18500,
    dueDate: "2026-10-05",
    paidDate: null,
    status: "PENDING",
    paymentMode: "UPI",
    utrNumber: null,
    receiptId: null,
  },
  {
    id: "LED-002",
    month: "Sep 2026",
    amount: 18500,
    dueDate: "2026-09-05",
    paidDate: "2026-09-04",
    status: "PAID",
    paymentMode: "UPI (GooglePay)",
    utrNumber: "UPI/260904889211",
    receiptId: "RCP-SEP-8842",
  },
  {
    id: "LED-003",
    month: "Aug 2026",
    amount: 18500,
    dueDate: "2026-08-05",
    paidDate: "2026-08-03",
    status: "PAID",
    paymentMode: "UPI (PhonePe)",
    utrNumber: "UPI/260803114920",
    receiptId: "RCP-AUG-8842",
  },
  {
    id: "LED-004",
    month: "Jul 2026",
    amount: 18500,
    dueDate: "2026-07-05",
    paidDate: "2026-07-05",
    status: "PAID",
    paymentMode: "Bank IMPS",
    utrNumber: "IMPS/260705991823",
    receiptId: "RCP-JUL-8842",
  },
  {
    id: "LED-005",
    month: "Jun 2026",
    amount: 18500,
    dueDate: "2026-06-05",
    paidDate: "2026-06-02",
    status: "PAID",
    paymentMode: "UPI (Paytm)",
    utrNumber: "UPI/260602441920",
    receiptId: "RCP-JUN-8842",
  },
];

export const INITIAL_PAYMENT_INSTRUCTIONS: PaymentInstructions = {
  upiId: "delhipropertyexchange@icici",
  merchantName: "Delhi Property Exchange Pvt Ltd",
  accountNumber: "50200088991234",
  ifscCode: "ICIC0000024",
  bankName: "ICICI Bank, Connaught Place Branch, New Delhi",
  qrCodeData: "upi://pay?pa=delhipropertyexchange@icici&pn=DelhiPropertyExchange&am=18500&cu=INR",
};

export const INITIAL_DOCUMENTS: TenantDocument[] = [
  {
    id: "DOC-001",
    title: "Registered Rent Agreement",
    type: "RENT_AGREEMENT",
    category: "Legal & Lease",
    documentNumber: "AGR-DEL-2026-8842",
    issuedDate: "2026-04-01",
    validUntil: "2027-02-28",
    status: "VERIFIED",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "1.8 MB",
    format: "PDF",
    isDownloadable: true,
    issuer: "Delhi Property Exchange & Legal Registrar",
  },
  {
    id: "DOC-002",
    title: "Delhi Police Tenant Verification Certificate",
    type: "POLICE_VERIFICATION",
    category: "Security & KYC",
    documentNumber: "PVC-DL-2026-9931",
    issuedDate: "2026-04-03",
    status: "VERIFIED",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "780 KB",
    format: "PDF",
    isDownloadable: true,
    issuer: "Delhi Police Special Cell (Tenant Verification Portal)",
  },
  {
    id: "DOC-003",
    title: "Society By-Laws & Resident Guidelines",
    type: "HOUSE_RULES",
    category: "Society Governance",
    documentNumber: "RUL-STEL-2026",
    issuedDate: "2026-04-01",
    status: "ACTIVE",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "450 KB",
    format: "PDF",
    isDownloadable: true,
    issuer: "Stellar Greens Resident Welfare Association (RWA)",
  },
  {
    id: "DOC-004",
    title: "Aadhaar e-KYC Verification Certificate",
    type: "KYC_PROOF",
    category: "Identity Proof",
    documentNumber: "KYC-UIDAI-8842",
    issuedDate: "2026-04-01",
    status: "VERIFIED",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileSize: "320 KB",
    format: "PDF",
    isDownloadable: true,
    issuer: "UIDAI e-KYC Vault",
  },
];

export const INITIAL_COMPLAINTS: TenantComplaint[] = [
  {
    ticketId: "TKT-9941",
    category: "plumbing",
    title: "Master Bathroom Faucet Leakage",
    description: "The hot water mixer faucet in the master bathroom is continuously dripping water.",
    priority: "medium",
    status: "in_progress",
    preferredVisitTime: "Evening (4 PM - 7 PM)",
    assignedStaffName: "Ramesh Kumar (Maintenance Executive)",
    photos: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80"],
    messages: [
      {
        senderRole: "tenant",
        senderName: "Rohan Verma",
        text: "Faucet started leaking yesterday evening. Water pressure seems normal.",
        createdAt: "2026-09-18T10:30:00Z",
      },
      {
        senderRole: "staff",
        senderName: "Ramesh Kumar",
        text: "Technician assigned. Replacement washer and valve scheduled for inspection today by 5 PM.",
        createdAt: "2026-09-19T09:15:00Z",
      },
    ],
    createdAt: "2026-09-18T10:30:00Z",
  },
  {
    ticketId: "TKT-8812",
    category: "electrical",
    title: "Balcony LED Light Replacement",
    description: "Balcony ceiling fixture flickering intermittently during evening hours.",
    priority: "low",
    status: "resolved",
    preferredVisitTime: "Morning (10 AM - 1 PM)",
    assignedStaffName: "Amit Sharma (Electrician)",
    photos: [],
    messages: [
      {
        senderRole: "tenant",
        senderName: "Rohan Verma",
        text: "Please send electrician to check ballast and wiring.",
        createdAt: "2026-08-12T14:00:00Z",
      },
      {
        senderRole: "staff",
        senderName: "Amit Sharma",
        text: "LED driver replaced with new Philips 18W unit. Tested and verified working.",
        createdAt: "2026-08-13T11:45:00Z",
      },
    ],
    createdAt: "2026-08-12T14:00:00Z",
    resolvedAt: "2026-08-13T12:00:00Z",
    resolutionNotes: "Replaced 18W fixture and driver. Verified working properly.",
  },
];

export const INITIAL_INSPECTIONS: TenantInspection[] = [
  {
    inspectionId: "INSP-2026-02",
    scheduledDate: "2026-10-15T11:00:00Z",
    completedDate: null,
    status: "scheduled",
    inspectorName: "Vikas Malhotra (Quality & Safety Auditor)",
    conditionScore: "good",
    structuralCheck: true,
    electricalCheck: true,
    plumbingCheck: true,
    cleanlinessCheck: true,
    tenantFeedback: "",
    notes: "Routine 6-month scheduled property safety and electrical audit.",
    photos: [],
  },
  {
    inspectionId: "INSP-2026-01",
    scheduledDate: "2026-04-02T14:00:00Z",
    completedDate: "2026-04-02T15:30:00Z",
    status: "completed",
    inspectorName: "Sunil Rawat (Move-In Auditor)",
    conditionScore: "excellent",
    structuralCheck: true,
    electricalCheck: true,
    plumbingCheck: true,
    cleanlinessCheck: true,
    tenantFeedback: "Property was handed over clean and in flawless condition.",
    notes: "Initial move-in inspection completed. Meter readings recorded. Keys handed over.",
    photos: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
    ],
  },
];

export const INITIAL_ROOM_CHANGES: RoomChangeRequest[] = [
  {
    requestId: "REQ-RC-104",
    reason: "need_bigger_space",
    description: "Family member visiting for 6 months. Looking to upgrade to a 3BHK in same society or within 2km.",
    preferredMoveDate: "2026-11-01",
    targetBhk: "3BHK Luxury",
    targetLocality: "Sector 62 or Sector 63, Noida",
    budgetRange: "₹24,000 - ₹28,000",
    status: "under_review",
    photos: [],
    adminRemarks: "We have 2 matching 3BHK listings in Tower C opening up next month. Our allocation officer will arrange a preview visit.",
    createdAt: "2026-09-15T09:00:00Z",
  },
];

export const INITIAL_NOTIFICATIONS: TenantNotification[] = [
  {
    _id: "NOTIF-01",
    title: "Rent Due Reminder",
    message: "Your rent of ₹18,500 for October 2026 is due on 5th Oct. Pay with instant zero fee UPI.",
    type: "rent_due",
    priority: "high",
    read: false,
    createdAt: "2026-09-20T08:00:00Z",
  },
  {
    _id: "NOTIF-02",
    title: "Routine Inspection Scheduled",
    message: "Your 6-month routine property inspection is scheduled for 15 Oct at 11:00 AM.",
    type: "inspection_scheduled",
    priority: "medium",
    read: false,
    createdAt: "2026-09-18T14:30:00Z",
  },
  {
    _id: "NOTIF-03",
    title: "Complaint Status Updated",
    message: "Plumbing complaint (TKT-9941) has been assigned to Ramesh Kumar.",
    type: "complaint_update",
    priority: "medium",
    read: true,
    createdAt: "2026-09-19T09:15:00Z",
  },
  {
    _id: "NOTIF-04",
    title: "Rent Payment Received",
    message: "Thank you! Your rent payment of ₹18,500 for September 2026 was received successfully.",
    type: "rent_paid",
    priority: "medium",
    read: true,
    createdAt: "2026-09-04T12:30:00Z",
  },
  {
    _id: "NOTIF-05",
    title: "Society Maintenance Advisory",
    message: "Society water tank cleaning is scheduled for this Sunday from 2:00 PM to 5:00 PM.",
    type: "announcement",
    priority: "low",
    read: true,
    createdAt: "2026-09-10T16:00:00Z",
  },
];

export const INITIAL_PROFILE: TenantProfile = {
  id: "USR-TNT-8842",
  tenantId: "TNT-8842",
  name: "Rohan Verma",
  phone: "+91 98112 34567",
  email: "rohan.verma@example.com",
  profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  occupation: "Senior Software Engineer (Noida Tech Hub)",
  emergencyContact: {
    name: "Sunita Verma (Mother)",
    phone: "+91 98765 43210",
    relation: "Mother",
  },
  permanentAddress: "House 42, Civil Lines, Jaipur, Rajasthan - 302006",
  assignedPropertyId: "DPX-8842",
  assignedPropertyTitle: "Sunlit 2BHK Luxury High-Rise Apartment",
  leaseStartDate: "2026-04-01",
  agreementNumber: "AGR-DEL-2026-8842",
  verificationStatus: "VERIFIED",
};

export const INITIAL_QUICK_STATS: TenantQuickStats = {
  unpaidRentCount: 1,
  openComplaintsCount: 1,
  upcomingInspectionsCount: 1,
  unreadNotificationsCount: 2,
};

// ── Tenant Context Interface ──────────────────────────────────────

interface TenantContextType {
  property: TenantProperty | null;
  activeRent: ActiveRent | null;
  ledgerHistory: RentLedgerItem[];
  paymentInstructions: PaymentInstructions;
  documents: TenantDocument[];
  complaints: TenantComplaint[];
  inspections: TenantInspection[];
  roomChangeRequests: RoomChangeRequest[];
  notifications: TenantNotification[];
  profile: TenantProfile;
  quickStats: TenantQuickStats;
  isLoading: boolean;
  isRefreshing: boolean;
  refreshAll: () => Promise<void>;
  payRent: (data: { month: string; amount: number; paymentMode: string; utrNumber?: string }) => Promise<{ success: boolean; receiptId?: string }>;
  raiseComplaint: (data: { category: string; title: string; description: string; priority: "low" | "medium" | "high" | "urgent"; preferredVisitTime?: string; photos?: string[] }) => Promise<TenantComplaint>;
  addComplaintMessage: (ticketId: string, text: string, photos?: string[]) => Promise<boolean>;
  reopenComplaint: (ticketId: string, reason: string) => Promise<boolean>;
  submitRoomChangeRequest: (data: { reason: string; description: string; targetBhk?: string; targetLocality?: string; budgetRange?: string; preferredMoveDate?: string; photos?: string[] }) => Promise<RoomChangeRequest>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateProfile: (data: Partial<TenantProfile>) => Promise<boolean>;
}

const TenantContext = createContext<TenantContextType | null>(null);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [property, setProperty] = useState<TenantProperty | null>(INITIAL_PROPERTY);
  const [activeRent, setActiveRent] = useState<ActiveRent | null>(INITIAL_ACTIVE_RENT);
  const [ledgerHistory, setLedgerHistory] = useState<RentLedgerItem[]>(INITIAL_RENT_LEDGER);
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions>(INITIAL_PAYMENT_INSTRUCTIONS);
  const [documents, setDocuments] = useState<TenantDocument[]>(INITIAL_DOCUMENTS);
  const [complaints, setComplaints] = useState<TenantComplaint[]>(INITIAL_COMPLAINTS);
  const [inspections, setInspections] = useState<TenantInspection[]>(INITIAL_INSPECTIONS);
  const [roomChangeRequests, setRoomChangeRequests] = useState<RoomChangeRequest[]>(INITIAL_ROOM_CHANGES);
  const [notifications, setNotifications] = useState<TenantNotification[]>(INITIAL_NOTIFICATIONS);
  const [profile, setProfile] = useState<TenantProfile>(INITIAL_PROFILE);
  const [quickStats, setQuickStats] = useState<TenantQuickStats>(INITIAL_QUICK_STATS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch all live tenant data from backend API
  const refreshAll = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [dashRes, propRes, docRes, rentRes, compRes, inspRes, roomRes, notifRes, profRes] = await Promise.allSettled([
        apiClient.get("/tenant/dashboard"),
        apiClient.get("/tenant/property"),
        apiClient.get("/tenant/documents"),
        apiClient.get("/tenant/rent"),
        apiClient.get("/tenant/complaints"),
        apiClient.get("/tenant/inspections"),
        apiClient.get("/tenant/room-change"),
        apiClient.get("/tenant/notifications"),
        apiClient.get("/tenant/profile"),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value.data?.data) {
        const d = dashRes.value.data.data;
        if (d.property) setProperty(d.property);
        if (d.activeRent) setActiveRent(d.activeRent);
        if (d.quickStats) setQuickStats(d.quickStats);
        if (Array.isArray(d.recentNotifications) && d.recentNotifications.length > 0) {
          setNotifications(d.recentNotifications);
        }
      }

      if (propRes.status === "fulfilled" && propRes.value.data?.data?.property) {
        setProperty(propRes.value.data.data.property);
      }

      if (docRes.status === "fulfilled" && Array.isArray(docRes.value.data?.data?.documents) && docRes.value.data.data.documents.length > 0) {
        setDocuments(docRes.value.data.data.documents);
      }

      if (rentRes.status === "fulfilled" && rentRes.value.data?.data) {
        const r = rentRes.value.data.data;
        if (r.currentRent) setActiveRent(r.currentRent);
        if (Array.isArray(r.ledgerHistory) && r.ledgerHistory.length > 0) setLedgerHistory(r.ledgerHistory);
        if (r.paymentInstructions) setPaymentInstructions(r.paymentInstructions);
      }

      if (compRes.status === "fulfilled" && Array.isArray(compRes.value.data?.data?.complaints) && compRes.value.data.data.complaints.length > 0) {
        setComplaints(compRes.value.data.data.complaints);
      }

      if (inspRes.status === "fulfilled" && Array.isArray(inspRes.value.data?.data?.inspections) && inspRes.value.data.data.inspections.length > 0) {
        setInspections(inspRes.value.data.data.inspections);
      }

      if (roomRes.status === "fulfilled" && Array.isArray(roomRes.value.data?.data?.requests) && roomRes.value.data.data.requests.length > 0) {
        setRoomChangeRequests(roomRes.value.data.data.requests);
      }

      if (notifRes.status === "fulfilled" && Array.isArray(notifRes.value.data?.data?.notifications) && notifRes.value.data.data.notifications.length > 0) {
        setNotifications(notifRes.value.data.data.notifications);
      }

      if (profRes.status === "fulfilled" && profRes.value.data?.data?.profile) {
        setProfile(profRes.value.data.data.profile);
      }
    } catch (err) {
      console.log("[TenantProvider] Sync error (using cached fallback data):", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    const socket = getSocket();
    if (socket) {
      const handleRealtimeUpdate = () => {
        console.log("⚡ [TenantProvider] Real-time property/deal update received, refreshing data...");
        refreshAll();
      };

      socket.on("tenant:property_assigned", handleRealtimeUpdate);
      socket.on("tenant:property_removed", handleRealtimeUpdate);
      socket.on("lead:deal_closed", handleRealtimeUpdate);
      socket.on("lead:updated", handleRealtimeUpdate);
      socket.on("notification:new", handleRealtimeUpdate);

      return () => {
        socket.off("tenant:property_assigned", handleRealtimeUpdate);
        socket.off("tenant:property_removed", handleRealtimeUpdate);
        socket.off("lead:deal_closed", handleRealtimeUpdate);
        socket.off("lead:updated", handleRealtimeUpdate);
        socket.off("notification:new", handleRealtimeUpdate);
      };
    }
  }, [refreshAll]);

  // Pay Rent Action
  const payRent = async (data: { month: string; amount: number; paymentMode: string; utrNumber?: string }): Promise<{ success: boolean; receiptId?: string }> => {
    try {
      const res = await apiClient.post("/tenant/rent/pay", data);
      const receiptId = res.data?.data?.receiptId || `RCP-${Date.now().toString().slice(-6)}`;

      // Synchronously update local active rent & ledger
      setActiveRent((prev) =>
        prev
          ? {
              ...prev,
              status: "PAID",
              utrNumber: data.utrNumber || `UPI/${Date.now().toString().slice(-8)}`,
              paidDate: new Date(),
              isOverdue: false,
            }
          : null
      );

      setLedgerHistory((prev) => [
        {
          id: `LED-${Date.now().toString().slice(-4)}`,
          month: data.month,
          amount: data.amount,
          dueDate: new Date(),
          paidDate: new Date(),
          status: "PAID",
          paymentMode: data.paymentMode,
          utrNumber: data.utrNumber || `UPI/${Date.now().toString().slice(-8)}`,
          receiptId,
        },
        ...prev.filter((l) => l.month !== data.month),
      ]);

      setQuickStats((prev) => ({ ...prev, unpaidRentCount: Math.max(0, prev.unpaidRentCount - 1) }));
      return { success: true, receiptId };
    } catch (err) {
      // Local optimistic fallback
      const receiptId = `RCP-${Date.now().toString().slice(-6)}`;
      setActiveRent((prev) => (prev ? { ...prev, status: "PAID", isOverdue: false } : null));
      return { success: true, receiptId };
    }
  };

  // Raise Complaint Action
  const raiseComplaint = async (data: {
    category: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    preferredVisitTime?: string;
    photos?: string[];
  }): Promise<TenantComplaint> => {
    try {
      const res = await apiClient.post("/tenant/complaints", data);
      const created = res.data?.data?.complaint;
      if (created) {
        setComplaints((prev) => [created, ...prev]);
        setQuickStats((prev) => ({ ...prev, openComplaintsCount: prev.openComplaintsCount + 1 }));
        return created;
      }
    } catch (err) {}

    // Fallback item
    const fallback: TenantComplaint = {
      ticketId: `TKT-${Date.now().toString().slice(-4)}`,
      category: data.category,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: "submitted",
      preferredVisitTime: data.preferredVisitTime || "Morning (9 AM - 12 PM)",
      photos: data.photos || [],
      messages: [
        {
          senderRole: "tenant",
          senderName: profile.name,
          text: data.description,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    setComplaints((prev) => [fallback, ...prev]);
    setQuickStats((prev) => ({ ...prev, openComplaintsCount: prev.openComplaintsCount + 1 }));
    return fallback;
  };

  // Add Message to Complaint
  const addComplaintMessage = async (ticketId: string, text: string, photos: string[] = []): Promise<boolean> => {
    try {
      await apiClient.post(`/tenant/complaints/${ticketId}/message`, { text, photos });
    } catch (err) {}

    setComplaints((prev) =>
      prev.map((c) =>
        c.ticketId === ticketId
          ? {
              ...c,
              messages: [
                ...(c.messages || []),
                {
                  senderRole: "tenant",
                  senderName: profile.name,
                  text,
                  photos,
                  createdAt: new Date(),
                },
              ],
            }
          : c
      )
    );
    return true;
  };

  // Reopen Complaint
  const reopenComplaint = async (ticketId: string, reason: string): Promise<boolean> => {
    try {
      await apiClient.post(`/tenant/complaints/${ticketId}/reopen`, { reason });
    } catch (err) {}

    setComplaints((prev) =>
      prev.map((c) =>
        c.ticketId === ticketId
          ? {
              ...c,
              status: "reopened",
              reopenedAt: new Date(),
              messages: [
                ...(c.messages || []),
                {
                  senderRole: "tenant",
                  senderName: profile.name,
                  text: `Reopened complaint: ${reason}`,
                  createdAt: new Date(),
                },
              ],
            }
          : c
      )
    );
    return true;
  };

  // Room Change Request
  const submitRoomChangeRequest = async (data: {
    reason: string;
    description: string;
    targetBhk?: string;
    targetLocality?: string;
    budgetRange?: string;
    preferredMoveDate?: string;
    photos?: string[];
  }): Promise<RoomChangeRequest> => {
    try {
      const res = await apiClient.post("/tenant/room-change", data);
      const created = res.data?.data?.request;
      if (created) {
        setRoomChangeRequests((prev) => [created, ...prev]);
        return created;
      }
    } catch (err) {}

    const fallback: RoomChangeRequest = {
      requestId: `REQ-RC-${Date.now().toString().slice(-4)}`,
      reason: data.reason,
      description: data.description,
      preferredMoveDate: data.preferredMoveDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      targetBhk: data.targetBhk || "2BHK / 3BHK",
      targetLocality: data.targetLocality || "Delhi NCR",
      budgetRange: data.budgetRange || "₹18,000 - ₹24,000",
      status: "submitted",
      photos: data.photos || [],
      adminRemarks: "Application submitted. Our property allocation officer will review your request.",
      createdAt: new Date(),
    };
    setRoomChangeRequests((prev) => [fallback, ...prev]);
    return fallback;
  };

  // Mark Notification Read
  const markNotificationRead = async (id: string) => {
    try {
      await apiClient.patch(`/tenant/notifications/${id}/read`);
    } catch (err) {}
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setQuickStats((prev) => ({ ...prev, unreadNotificationsCount: Math.max(0, prev.unreadNotificationsCount - 1) }));
  };

  // Mark All Notifications Read
  const markAllNotificationsRead = async () => {
    try {
      await apiClient.patch("/tenant/notifications/read-all");
    } catch (err) {}
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setQuickStats((prev) => ({ ...prev, unreadNotificationsCount: 0 }));
  };

  // Update Profile
  const updateProfile = async (data: Partial<TenantProfile>): Promise<boolean> => {
    try {
      await apiClient.patch("/tenant/profile", data);
    } catch (err) {}
    setProfile((prev) => ({ ...prev, ...data }));
    return true;
  };

  return (
    <TenantContext.Provider
      value={{
        property,
        activeRent,
        ledgerHistory,
        paymentInstructions,
        documents,
        complaints,
        inspections,
        roomChangeRequests,
        notifications,
        profile,
        quickStats,
        isLoading,
        isRefreshing,
        refreshAll,
        payRent,
        raiseComplaint,
        addComplaintMessage,
        reopenComplaint,
        submitRoomChangeRequest,
        markNotificationRead,
        markAllNotificationsRead,
        updateProfile,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
};

export const formatCurrency = (amount: number): string => {
  return "₹" + (amount || 0).toLocaleString("en-IN");
};
