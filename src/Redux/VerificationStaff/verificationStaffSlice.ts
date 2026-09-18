import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StaffNotification {
  id: string;
  title: string;
  message: string;
  leadId?: string;
  lead?: any;
  type: "lead_assigned" | "lead_updated" | "inspection" | "complaint" | "system";
  createdAt: string;
  read: boolean;
}

export interface VerificationStaffState {
  assignedLeads: any[];
  notifications: StaffNotification[];
  unreadCount: number;
  activeToast: StaffNotification | null;
  isSocketConnected: boolean;
  lastUpdated: string | null;
}

const initialState: VerificationStaffState = {
  assignedLeads: [],
  notifications: [],
  unreadCount: 0,
  activeToast: null,
  isSocketConnected: false,
  lastUpdated: null,
};

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
        message: `Property "${lead.propertyDetails?.address?.city || lead.title || lead.leadId || "Property"}" assigned for verification.`,
        leadId: lead._id,
        lead: lead,
        type: "lead_assigned",
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Check if notification already in list
      if (!state.notifications.some((n) => n.id === notifObj.id)) {
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

    // Add manual notification
    addNotification: (state, action: PayloadAction<StaffNotification>) => {
      const notif = action.payload;
      if (!state.notifications.some((n) => n.id === notif.id)) {
        state.notifications.unshift(notif);
        if (!notif.read) {
          state.unreadCount += 1;
        }
      }
      state.activeToast = notif;
    },

    // Mark single notification as read
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all notifications as read
    markAllNotificationsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },

    // Clear all notifications
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
