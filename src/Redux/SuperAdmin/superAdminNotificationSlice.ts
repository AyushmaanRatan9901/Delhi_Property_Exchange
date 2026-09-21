import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../api/axiosInstance";

export type SuperAdminNotifCategory =
  | "ALL"
  | "USER"
  | "LEAD"
  | "PROPERTY_VERIFICATION"
  | "COMMISSION_PAYOUT"
  | "FRAUD_COMPLAINT"
  | "SYSTEM";

export type PanelSource =
  | "ALL"
  | "VERIFICATION_STAFF"
  | "BROKER_AGENT"
  | "TENANT"
  | "OWNER"
  | "SYSTEM_ADMIN";

export type PriorityLevel = "URGENT" | "HIGH" | "NORMAL" | "LOW";

export interface SuperAdminNotification {
  id: string;
  _id?: string;
  title: string;
  message: string;
  category: SuperAdminNotifCategory;
  panelSource: PanelSource;
  priority: PriorityLevel;
  type?: string;
  createdAt: string;
  isRead: boolean;
  read?: boolean;
  actionRequired?: boolean;
  actionType?:
    | "REVIEW_LEAD"
    | "APPROVE_PAYOUT"
    | "INVESTIGATE_FRAUD"
    | "INSPECT_USER"
    | "RESOLVE_COMPLAINT"
    | "VIEW_PROPERTY";
  meta?: {
    userId?: string;
    userName?: string;
    userRole?: string;
    leadId?: string;
    propertyTitle?: string;
    locality?: string;
    city?: string;
    amount?: number;
    utrNumber?: string;
    paymentMode?: string;
    ticketId?: string;
    complaintCategory?: string;
    staffName?: string;
    phone?: string;
    notes?: string;
  };
}

export interface SuperAdminNotificationState {
  notifications: SuperAdminNotification[];
  unreadCount: number;
  total: number;
  loading: boolean;
  error: string | null;
  isSocketConnected: boolean;
  lastUpdated: string | null;
}

const initialState: SuperAdminNotificationState = {
  notifications: [],
  unreadCount: 0,
  total: 0,
  loading: false,
  error: null,
  isSocketConnected: false,
  lastUpdated: null,
};

// ── ASYNC THUNKS ───────────────────────────────────────────────────────────────

export const fetchSuperAdminNotifications = createAsyncThunk(
  "superAdminNotifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/notifications?limit=100");
      const data = response.data?.data || response.data || {};
      return {
        notifications: Array.isArray(data.notifications) ? data.notifications : [],
        unreadCount: typeof data.unreadCount === "number" ? data.unreadCount : 0,
        total: typeof data.total === "number" ? data.total : 0,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch SuperAdmin notifications"
      );
    }
  }
);

export const markSuperAdminNotificationAsReadThunk = createAsyncThunk(
  "superAdminNotifications/markRead",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return {
        id,
        unreadCount: response.data?.data?.unreadCount,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to mark notification read"
      );
    }
  }
);

export const markAllSuperAdminNotificationsAsReadThunk = createAsyncThunk(
  "superAdminNotifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.patch("/notifications/mark-all-read");
      return true;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to mark all notifications read"
      );
    }
  }
);

export const deleteSuperAdminNotificationThunk = createAsyncThunk(
  "superAdminNotifications/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(`/notifications/${id}`);
      return {
        id,
        unreadCount: response.data?.data?.unreadCount,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to delete notification"
      );
    }
  }
);

export const clearAllSuperAdminNotificationsThunk = createAsyncThunk(
  "superAdminNotifications/clearAll",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.delete("/notifications/clear-all");
      return true;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to clear notifications"
      );
    }
  }
);

// ── SLICE DEFINITION ──────────────────────────────────────────────────────────

export const superAdminNotificationSlice = createSlice({
  name: "superAdminNotifications",
  initialState,
  reducers: {
    addRealTimeSuperAdminNotification: (
      state,
      action: PayloadAction<any>
    ) => {
      const b = action.payload;
      if (!b) return;

      const notifId = b.id || b._id || `notif_sa_${Date.now()}`;

      let cat: SuperAdminNotifCategory = "SYSTEM";
      if (b.category) cat = b.category;
      else if (b.type === "scam_alert" || b.type?.includes("complaint")) cat = "FRAUD_COMPLAINT";
      else if (b.type?.includes("commission") || b.type?.includes("payout")) cat = "COMMISSION_PAYOUT";
      else if (b.type?.includes("inspection") || b.type === "lead_verified") cat = "PROPERTY_VERIFICATION";
      else if (b.type?.includes("lead") || b.type?.includes("duplicate")) cat = "LEAD";
      else if (b.type?.includes("user") || b.type?.includes("kyc")) cat = "USER";

      let panel: PanelSource = "SYSTEM_ADMIN";
      if (b.panelSource) panel = b.panelSource;
      else if (b.recipientRole === "verification_staff" || b.sender?.role === "field_staff") panel = "VERIFICATION_STAFF";
      else if (b.sender?.role === "agent" || b.sender?.role === "broker") panel = "BROKER_AGENT";
      else if (b.sender?.role === "tenant") panel = "TENANT";
      else if (b.sender?.role === "owner") panel = "OWNER";

      const normalized: SuperAdminNotification = {
        id: notifId,
        _id: b._id || notifId,
        title: b.title || "SuperAdmin Notification",
        message: b.message || "",
        category: cat,
        panelSource: panel,
        priority: (b.priority?.toUpperCase() as PriorityLevel) || "NORMAL",
        type: b.type,
        createdAt: b.createdAt || new Date().toISOString(),
        isRead: Boolean(b.isRead || b.read),
        actionRequired: b.priority === "urgent" || b.priority === "high" || b.type === "scam_alert",
        actionType:
          b.actionType ||
          (b.type === "scam_alert"
            ? "INVESTIGATE_FRAUD"
            : b.type === "commission_requested"
            ? "APPROVE_PAYOUT"
            : b.type === "lead_submitted"
            ? "REVIEW_LEAD"
            : "INSPECT_USER"),
        meta: b.meta || b.data || {},
      };

      if (!state.notifications.some((n) => n.id === notifId || (n._id && n._id === notifId))) {
        state.notifications.unshift(normalized);
        if (!normalized.isRead) {
          state.unreadCount += 1;
        }
        state.total += 1;
      }

      state.lastUpdated = new Date().toISOString();
    },

    markLocalSuperAdminNotifRead: (state, action: PayloadAction<string>) => {
      const targetId = action.payload;
      const notif = state.notifications.find((n) => n.id === targetId || n._id === targetId);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    setSuperAdminSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
    },
  },

  extraReducers: (builder) => {
    // fetch
    builder
      .addCase(fetchSuperAdminNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSuperAdminNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.total = action.payload.total;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchSuperAdminNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // mark read
    builder.addCase(markSuperAdminNotificationAsReadThunk.fulfilled, (state, action) => {
      const { id, unreadCount } = action.payload;
      const notif = state.notifications.find((n) => n.id === id || n._id === id);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        notif.read = true;
      }
      if (typeof unreadCount === "number") {
        state.unreadCount = unreadCount;
      } else {
        state.unreadCount = Math.max(
          0,
          state.notifications.filter((n) => !n.isRead && !n.read).length
        );
      }
    });

    // mark all read
    builder.addCase(markAllSuperAdminNotificationsAsReadThunk.fulfilled, (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
        n.read = true;
      });
      state.unreadCount = 0;
    });

    // delete
    builder.addCase(deleteSuperAdminNotificationThunk.fulfilled, (state, action) => {
      const { id, unreadCount } = action.payload;
      state.notifications = state.notifications.filter((n) => n.id !== id && n._id !== id);
      if (typeof unreadCount === "number") {
        state.unreadCount = unreadCount;
      } else {
        state.unreadCount = state.notifications.filter((n) => !n.isRead && !n.read).length;
      }
      state.total = Math.max(0, state.total - 1);
    });

    // clear all
    builder.addCase(clearAllSuperAdminNotificationsThunk.fulfilled, (state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.total = 0;
    });
  },
});

export const {
  addRealTimeSuperAdminNotification,
  markLocalSuperAdminNotifRead,
  setSuperAdminSocketConnected,
} = superAdminNotificationSlice.actions;

export default superAdminNotificationSlice.reducer;
