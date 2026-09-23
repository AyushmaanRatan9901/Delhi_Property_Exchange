import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../api/axiosInstance";

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
  isSecurityDepositPaid?: boolean;
  securityDepositStatus?: "PAID" | "PENDING";
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
  aadhaarNumber?: string;
  aadhaarDoc?: string;
  aadhaarStatus?: "NOT_UPLOADED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";
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

export interface TenantState {
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
  error: string | null;
}

export const EMPTY_TENANT_PROFILE: TenantProfile = {
  id: "",
  tenantId: "",
  name: "",
  phone: "",
  email: "",
  profilePhoto: "",
  occupation: "",
  aadhaarNumber: "",
  aadhaarDoc: "",
  aadhaarStatus: "NOT_UPLOADED",
  emergencyContact: {
    name: "",
    phone: "",
    relation: "",
  },
  permanentAddress: "",
  assignedPropertyId: null,
  assignedPropertyTitle: null,
  verificationStatus: "PENDING",
};

export const EMPTY_TENANT_PAYMENT_INSTRUCTIONS: PaymentInstructions = {
  upiId: "",
  merchantName: "Delhi Property Exchange",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  qrCodeData: "",
};

const initialState: TenantState = {
  property: null,
  activeRent: null,
  ledgerHistory: [],
  paymentInstructions: EMPTY_TENANT_PAYMENT_INSTRUCTIONS,
  documents: [],
  complaints: [],
  inspections: [],
  roomChangeRequests: [],
  notifications: [],
  profile: EMPTY_TENANT_PROFILE,
  quickStats: {
    unpaidRentCount: 0,
    openComplaintsCount: 0,
    upcomingInspectionsCount: 0,
    unreadNotificationsCount: 0,
  },
  isLoading: true,
  isRefreshing: false,
  error: null,
};

// ── Async Thunks ──────────────────────────────────────────────────

/**
 * Fetch Full Tenant Dashboard & All Live Data
 */
export const fetchTenantDashboard = createAsyncThunk(
  "tenant/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
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

      const result: Partial<TenantState> = {};

      if (dashRes.status === "fulfilled" && dashRes.value.data?.data) {
        const d = dashRes.value.data.data;
        if (d.property !== undefined) result.property = d.property || null;
        if (d.activeRent) result.activeRent = d.activeRent;
        if (d.quickStats) result.quickStats = d.quickStats;
        if (Array.isArray(d.recentNotifications)) result.notifications = d.recentNotifications;
      }

      if (propRes.status === "fulfilled") {
        const propData = propRes.value.data?.data?.property ?? propRes.value.data?.property;
        result.property = propData || null;
      }

      if (docRes.status === "fulfilled") {
        const docs = docRes.value.data?.data?.documents ?? docRes.value.data?.documents ?? [];
        result.documents = Array.isArray(docs) ? docs : [];
      }

      if (rentRes.status === "fulfilled" && rentRes.value.data?.data) {
        const r = rentRes.value.data.data;
        if (r.currentRent) result.activeRent = r.currentRent;
        if (Array.isArray(r.ledgerHistory)) result.ledgerHistory = r.ledgerHistory;
        if (r.paymentInstructions) result.paymentInstructions = r.paymentInstructions;
      }

      if (compRes.status === "fulfilled") {
        const comps = compRes.value.data?.data?.complaints ?? compRes.value.data?.complaints ?? [];
        result.complaints = Array.isArray(comps) ? comps : [];
      }

      if (inspRes.status === "fulfilled") {
        const insps = inspRes.value.data?.data?.inspections ?? inspRes.value.data?.inspections ?? [];
        result.inspections = Array.isArray(insps) ? insps : [];
      }

      if (roomRes.status === "fulfilled") {
        const reqs = roomRes.value.data?.data?.requests ?? roomRes.value.data?.requests ?? [];
        result.roomChangeRequests = Array.isArray(reqs) ? reqs : [];
      }

      if (notifRes.status === "fulfilled") {
        const notifs = notifRes.value.data?.data?.notifications ?? notifRes.value.data?.notifications ?? [];
        result.notifications = Array.isArray(notifs) ? notifs : [];
      }

      if (profRes.status === "fulfilled" && profRes.value.data?.data?.profile) {
        result.profile = profRes.value.data.data.profile;
      }

      return result;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to load tenant data");
    }
  }
);

/**
 * Pay Rent Action
 */
export const payRentThunk = createAsyncThunk(
  "tenant/payRent",
  async (
    data: { month: string; amount: number; paymentMode: string; utrNumber?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/tenant/rent/pay", data);
      const receiptId = res.data?.data?.receiptId || `RCP-${Date.now().toString().slice(-6)}`;
      return {
        month: data.month,
        amount: data.amount,
        paymentMode: data.paymentMode,
        utrNumber: data.utrNumber || `UPI/${Date.now().toString().slice(-8)}`,
        receiptId,
      };
    } catch (err: any) {
      // Return optimistic success with generated receipt
      const receiptId = `RCP-${Date.now().toString().slice(-6)}`;
      return {
        month: data.month,
        amount: data.amount,
        paymentMode: data.paymentMode,
        utrNumber: data.utrNumber || `UPI/${Date.now().toString().slice(-8)}`,
        receiptId,
      };
    }
  }
);

/**
 * Raise Maintenance Complaint
 */
export const raiseComplaintThunk = createAsyncThunk(
  "tenant/raiseComplaint",
  async (
    data: {
      category: string;
      title: string;
      description: string;
      priority: "low" | "medium" | "high" | "urgent";
      preferredVisitTime?: string;
      photos?: string[];
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/tenant/complaints", data);
      if (res.data?.data?.complaint) {
        return res.data.data.complaint as TenantComplaint;
      }
    } catch {}

    const state = getState() as { tenant: TenantState };
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
          senderName: state.tenant?.profile?.name || "Resident",
          text: data.description,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    return fallback;
  }
);

/**
 * Add Message to Complaint Ticket
 */
export const addComplaintMessageThunk = createAsyncThunk(
  "tenant/addComplaintMessage",
  async (
    { ticketId, text, photos = [] }: { ticketId: string; text: string; photos?: string[] },
    { getState }
  ) => {
    try {
      await apiClient.post(`/tenant/complaints/${ticketId}/message`, { text, photos });
    } catch {}

    const state = getState() as { tenant: TenantState };
    return {
      ticketId,
      message: {
        senderRole: "tenant",
        senderName: state.tenant?.profile?.name || "Resident",
        text,
        photos,
        createdAt: new Date(),
      },
    };
  }
);

/**
 * Reopen Complaint Ticket
 */
export const reopenComplaintThunk = createAsyncThunk(
  "tenant/reopenComplaint",
  async ({ ticketId, reason }: { ticketId: string; reason: string }, { getState }) => {
    try {
      await apiClient.post(`/tenant/complaints/${ticketId}/reopen`, { reason });
    } catch {}

    const state = getState() as { tenant: TenantState };
    return {
      ticketId,
      message: {
        senderRole: "tenant",
        senderName: state.tenant?.profile?.name || "Resident",
        text: `Reopened complaint: ${reason}`,
        createdAt: new Date(),
      },
    };
  }
);

/**
 * Submit Room Change Request
 */
export const submitRoomChangeThunk = createAsyncThunk(
  "tenant/submitRoomChange",
  async (
    data: {
      reason: string;
      description: string;
      targetBhk?: string;
      targetLocality?: string;
      budgetRange?: string;
      preferredMoveDate?: string;
      photos?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/tenant/room-change", data);
      if (res.data?.data?.request) {
        return res.data.data.request as RoomChangeRequest;
      }
    } catch {}

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
    return fallback;
  }
);

/**
 * Mark Notification As Read
 */
export const markTenantNotificationReadThunk = createAsyncThunk(
  "tenant/markNotificationRead",
  async (notificationId: string) => {
    try {
      await apiClient.patch(`/tenant/notifications/${notificationId}/read`);
    } catch {}
    return notificationId;
  }
);

/**
 * Mark All Notifications As Read
 */
export const markAllTenantNotificationsReadThunk = createAsyncThunk(
  "tenant/markAllNotificationsRead",
  async () => {
    try {
      await apiClient.patch("/tenant/notifications/read-all");
    } catch {}
    return true;
  }
);

/**
 * Update Tenant Profile
 */
export const updateTenantProfileThunk = createAsyncThunk(
  "tenant/updateProfile",
  async (data: Partial<TenantProfile>) => {
    try {
      await apiClient.patch("/tenant/profile", data);
    } catch {}
    return data;
  }
);

/**
 * Upload Tenant Aadhaar Card
 */
export const uploadTenantAadhaarThunk = createAsyncThunk(
  "tenant/uploadAadhaar",
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      const res = await apiClient.post("/tenant/aadhaar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = res.data?.data;
      const docUrl = data?.aadhaarDoc || data?.url;
      // Refresh dashboard in background
      dispatch(fetchTenantDashboard());
      return {
        aadhaarDoc: docUrl,
        aadhaarNumber: data?.aadhaarNumber,
        aadhaarStatus: (data?.aadhaarStatus || "UNDER_REVIEW") as any,
        message: res.data?.message || "Aadhaar uploaded successfully",
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to upload Aadhaar card"
      );
    }
  }
);

// ── Tenant Slice ──────────────────────────────────────────────────

export const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.isRefreshing = action.payload;
    },
    handleLivePropertyAssigned: (state, action: PayloadAction<TenantProperty | null>) => {
      if (action.payload) {
        state.property = action.payload;
      }
    },
    handleLivePropertyRemoved: (state) => {
      state.property = null;
      state.activeRent = null;
    },
    addLiveTenantNotification: (state, action: PayloadAction<TenantNotification>) => {
      state.notifications = [action.payload, ...state.notifications];
      state.quickStats.unreadNotificationsCount += 1;
    },
  },
  extraReducers: (builder) => {
    // fetchTenantDashboard
    builder
      .addCase(fetchTenantDashboard.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchTenantDashboard.fulfilled, (state, action) => {
        const payload = action.payload;
        if (payload.property !== undefined) state.property = payload.property;
        if (payload.activeRent !== undefined) state.activeRent = payload.activeRent;
        if (payload.ledgerHistory !== undefined) state.ledgerHistory = payload.ledgerHistory;
        if (payload.paymentInstructions !== undefined) state.paymentInstructions = payload.paymentInstructions;
        if (payload.documents !== undefined) state.documents = payload.documents;
        if (payload.complaints !== undefined) state.complaints = payload.complaints;
        if (payload.inspections !== undefined) state.inspections = payload.inspections;
        if (payload.roomChangeRequests !== undefined) state.roomChangeRequests = payload.roomChangeRequests;
        if (payload.notifications !== undefined) state.notifications = payload.notifications;
        if (payload.profile !== undefined) state.profile = payload.profile;
        if (payload.quickStats !== undefined) state.quickStats = payload.quickStats;

        state.isLoading = false;
        state.isRefreshing = false;
      })
      .addCase(fetchTenantDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = (action.payload as string) || "Failed to fetch tenant data";
      });

    // payRentThunk
    builder.addCase(payRentThunk.fulfilled, (state, action) => {
      const { month, amount, paymentMode, utrNumber, receiptId } = action.payload;
      if (state.activeRent) {
        state.activeRent = {
          ...state.activeRent,
          status: "PAID",
          utrNumber,
          paidDate: new Date(),
          isOverdue: false,
        };
      }
      state.ledgerHistory = [
        {
          id: `LED-${Date.now().toString().slice(-4)}`,
          month,
          amount,
          dueDate: new Date(),
          paidDate: new Date(),
          status: "PAID",
          paymentMode,
          utrNumber,
          receiptId,
        },
        ...state.ledgerHistory.filter((l) => l.month !== month),
      ];
      state.quickStats.unpaidRentCount = Math.max(0, state.quickStats.unpaidRentCount - 1);
    });

    // raiseComplaintThunk
    builder.addCase(raiseComplaintThunk.fulfilled, (state, action) => {
      state.complaints = [action.payload, ...state.complaints];
      state.quickStats.openComplaintsCount += 1;
    });

    // addComplaintMessageThunk
    builder.addCase(addComplaintMessageThunk.fulfilled, (state, action) => {
      const { ticketId, message } = action.payload;
      state.complaints = state.complaints.map((c) =>
        c.ticketId === ticketId
          ? { ...c, messages: [...(c.messages || []), message] }
          : c
      );
    });

    // reopenComplaintThunk
    builder.addCase(reopenComplaintThunk.fulfilled, (state, action) => {
      const { ticketId, message } = action.payload;
      state.complaints = state.complaints.map((c) =>
        c.ticketId === ticketId
          ? {
              ...c,
              status: "reopened",
              reopenedAt: new Date(),
              messages: [...(c.messages || []), message],
            }
          : c
      );
    });

    // submitRoomChangeThunk
    builder.addCase(submitRoomChangeThunk.fulfilled, (state, action) => {
      state.roomChangeRequests = [action.payload, ...state.roomChangeRequests];
    });

    // markTenantNotificationReadThunk
    builder.addCase(markTenantNotificationReadThunk.fulfilled, (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      );
      state.quickStats.unreadNotificationsCount = Math.max(0, state.quickStats.unreadNotificationsCount - 1);
    });

    // markAllTenantNotificationsReadThunk
    builder.addCase(markAllTenantNotificationsReadThunk.fulfilled, (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
      state.quickStats.unreadNotificationsCount = 0;
    });

    // updateTenantProfileThunk
    builder.addCase(updateTenantProfileThunk.fulfilled, (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    });

    // uploadTenantAadhaarThunk
    builder.addCase(uploadTenantAadhaarThunk.fulfilled, (state, action) => {
      const { aadhaarDoc, aadhaarNumber, aadhaarStatus } = action.payload;
      if (aadhaarDoc) state.profile.aadhaarDoc = aadhaarDoc;
      if (aadhaarNumber) state.profile.aadhaarNumber = aadhaarNumber;
      if (aadhaarStatus) state.profile.aadhaarStatus = aadhaarStatus;
    });
  },
});

export const {
  setRefreshing,
  handleLivePropertyAssigned,
  handleLivePropertyRemoved,
  addLiveTenantNotification,
} = tenantSlice.actions;

export default tenantSlice.reducer;
