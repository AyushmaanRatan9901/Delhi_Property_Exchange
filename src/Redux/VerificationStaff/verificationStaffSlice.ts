import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../api/axiosInstance";

export interface StaffNotification {
  id: string;
  _id?: string;
  title: string;
  message: string;
  leadId?: string;
  propertyId?: string;
  lead?: any;
  type:
    | "lead_assigned"
    | "lead_verified"
    | "lead_rejected"
    | "lead_updated"
    | "inspection"
    | "inspection_scheduled"
    | "inspection_completed"
    | "complaint"
    | "complaint_logged"
    | "complaint_resolved"
    | "scam_alert"
    | "system";
  priority?: "low" | "medium" | "high" | "urgent";
  data?: any;
  createdAt: string;
  read: boolean;
  isRead?: boolean;
}

export interface VerificationStaffState {
  assignedLeads: any[];
  notifications: StaffNotification[];
  unreadCount: number;
  isNotificationsLoading: boolean;
  notificationError: string | null;
  activeToast: StaffNotification | null;
  isSocketConnected: boolean;
  lastUpdated: string | null;
}

const initialState: VerificationStaffState = {
  assignedLeads: [],
  notifications: [],
  unreadCount: 0,
  isNotificationsLoading: false,
  notificationError: null,
  activeToast: null,
  isSocketConnected: false,
  lastUpdated: null,
};

// ── Async Thunks for Backend Notification Persistence ──────────────────────────

/**
 * Fetch Persisted Notifications from Backend
 */
export const fetchStaffNotifications = createAsyncThunk(
  "verificationStaff/fetchNotifications",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/notifications?limit=50");
      const data = response.data?.data || response.data || {};
      return {
        notifications: Array.isArray(data.notifications) ? data.notifications : [],
        unreadCount: typeof data.unreadCount === "number" ? data.unreadCount : 0,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to fetch notifications"
      );
    }
  }
);

/**
 * Mark Single Notification as Read in Backend
 */
export const markNotificationAsReadThunk = createAsyncThunk(
  "verificationStaff/markNotificationRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return {
        id: notificationId,
        unreadCount: response.data?.data?.unreadCount,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to mark notification read"
      );
    }
  }
);

/**
 * Mark All Notifications as Read in Backend
 */
export const markAllNotificationsAsReadThunk = createAsyncThunk(
  "verificationStaff/markAllNotificationsRead",
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

/**
 * Clear All Notifications in Backend
 */
export const clearAllNotificationsThunk = createAsyncThunk(
  "verificationStaff/clearAllNotifications",
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

// ── Slice Definition ──────────────────────────────────────────────────────────

export const verificationStaffSlice = createSlice({
  name: "verificationStaff",
  initialState,
  reducers: {
    setAssignedLeads: (state, action: PayloadAction<any[]>) => {
      state.assignedLeads = action.payload || [];
      state.lastUpdated = new Date().toISOString();
    },

    // Real-time assignment received from Socket.io
    leadAssignedRealTime: (
      state,
      action: PayloadAction<{ lead: any; notification?: StaffNotification }>
    ) => {
      const { lead, notification } = action.payload;
      if (!lead || !lead._id) return;

      // Update or prepend lead in assignedLeads
      const existingIdx = state.assignedLeads.findIndex(
        (l) => String(l._id) === String(lead._id)
      );
      if (existingIdx >= 0) {
        state.assignedLeads[existingIdx] = {
          ...state.assignedLeads[existingIdx],
          ...lead,
        };
      } else {
        state.assignedLeads.unshift(lead);
      }

      // Add to notifications
      const notifObj: StaffNotification = notification || {
        id: `notif_${Date.now()}_${lead._id}`,
        title: "New Property Assigned",
        message: `Property "${
          lead.propertyDetails?.address?.city || lead.title || lead.leadId || "Property"
        }" assigned for verification.`,
        leadId: lead._id,
        lead: lead,
        type: "lead_assigned",
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Check if notification already in list
      if (!state.notifications.some((n) => n.id === notifObj.id || (n._id && n._id === notifObj.id))) {
        state.notifications.unshift(notifObj);
        state.unreadCount += 1;
      }

      state.activeToast = notifObj;
      state.lastUpdated = new Date().toISOString();
    },

    // Real-time lead update (e.g. status change / locked / published)
    leadUpdatedRealTime: (state, action: PayloadAction<any>) => {
      const lead = action.payload;
      if (!lead || !lead._id) return;

      const idx = state.assignedLeads.findIndex(
        (l) => String(l._id) === String(lead._id)
      );
      if (idx >= 0) {
        state.assignedLeads[idx] = { ...state.assignedLeads[idx], ...lead };
      }
      state.lastUpdated = new Date().toISOString();
    },

    // Add manual / real-time notification from Socket.io
    addNotification: (state, action: PayloadAction<StaffNotification>) => {
      const notif = action.payload;
      const notifId = notif.id || notif._id || `notif_${Date.now()}`;
      const normalizedNotif: StaffNotification = {
        ...notif,
        id: notifId,
        read: Boolean(notif.read || notif.isRead),
      };

      if (!state.notifications.some((n) => n.id === notifId || (n._id && n._id === notifId))) {
        state.notifications.unshift(normalizedNotif);
        if (!normalizedNotif.read) {
          state.unreadCount += 1;
        }
      }
      state.activeToast = normalizedNotif;
    },

    // Mark single notification as read (local synchronous update)
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const targetId = action.payload;
      const notif = state.notifications.find(
        (n) => n.id === targetId || n._id === targetId
      );
      if (notif && !notif.read) {
        notif.read = true;
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all notifications as read (local synchronous update)
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
        n.isRead = true;
      });
      state.unreadCount = 0;
    },

    // Clear all notifications (local synchronous update)
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Dismiss active toast
    clearActiveToast: (state) => {
      state.activeToast = null;
    },

    // Socket connection status
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
    },
  },

  extraReducers: (builder) => {
    // fetchStaffNotifications
    builder
      .addCase(fetchStaffNotifications.pending, (state) => {
        state.isNotificationsLoading = true;
        state.notificationError = null;
      })
      .addCase(fetchStaffNotifications.fulfilled, (state, action) => {
        state.isNotificationsLoading = false;
        state.notifications = action.payload.notifications.map((n: any) => ({
          ...n,
          id: n.id || n._id,
          read: Boolean(n.read || n.isRead),
        }));
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchStaffNotifications.rejected, (state, action) => {
        state.isNotificationsLoading = false;
        state.notificationError = action.payload as string;
      });

    // markNotificationAsReadThunk
    builder.addCase(markNotificationAsReadThunk.fulfilled, (state, action) => {
      const { id, unreadCount } = action.payload;
      const notif = state.notifications.find((n) => n.id === id || n._id === id);
      if (notif && !notif.read) {
        notif.read = true;
        notif.isRead = true;
      }
      if (typeof unreadCount === "number") {
        state.unreadCount = unreadCount;
      } else {
        state.unreadCount = Math.max(
          0,
          state.notifications.filter((n) => !n.read && !n.isRead).length
        );
      }
    });

    // markAllNotificationsAsReadThunk
    builder.addCase(markAllNotificationsAsReadThunk.fulfilled, (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
        n.isRead = true;
      });
      state.unreadCount = 0;
    });

    // clearAllNotificationsThunk
    builder.addCase(clearAllNotificationsThunk.fulfilled, (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    });
  },
});

export const {
  setAssignedLeads,
  leadAssignedRealTime,
  leadUpdatedRealTime,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
  clearActiveToast,
  setSocketConnected,
} = verificationStaffSlice.actions;

export default verificationStaffSlice.reducer;
