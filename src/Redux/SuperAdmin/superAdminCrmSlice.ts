import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../api/axiosInstance";
import {
  CRMDashboardData,
  CallerItem,
  CRMLeadItem,
  CRMCallItem,
  CRMSiteVisitItem,
  CRMFollowUpItem,
  CRMHandoffItem,
  TVShowcaseItem,
  CRMAuditLogItem,
} from "../../services/superAdminCrmApi";

interface SuperAdminCRMState {
  dashboardStats: CRMDashboardData | null;
  callers: CallerItem[];
  selectedCaller: any | null;
  leads: CRMLeadItem[];
  unassignedLeads: CRMLeadItem[];
  selectedLead: any | null;
  calls: CRMCallItem[];
  selectedCallSummary: any | null;
  siteVisits: CRMSiteVisitItem[];
  followUps: CRMFollowUpItem[];
  overdueFollowUps: CRMFollowUpItem[];
  handoffs: CRMHandoffItem[];
  showcases: TVShowcaseItem[];
  auditLogs: CRMAuditLogItem[];
  leadSources: any[];
  pagination: {
    leadsTotal: number;
    callersTotal: number;
    callsTotal: number;
    visitsTotal: number;
    followupsTotal: number;
    handoffsTotal: number;
    logsTotal: number;
  };
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: SuperAdminCRMState = {
  dashboardStats: null,
  callers: [],
  selectedCaller: null,
  leads: [],
  unassignedLeads: [],
  selectedLead: null,
  leadSources: [],
  calls: [],
  selectedCallSummary: null,
  siteVisits: [],
  followUps: [],
  overdueFollowUps: [],
  handoffs: [],
  showcases: [],
  auditLogs: [],
  pagination: {
    leadsTotal: 0,
    callersTotal: 0,
    callsTotal: 0,
    visitsTotal: 0,
    followupsTotal: 0,
    handoffsTotal: 0,
    logsTotal: 0,
  },
  loading: false,
  actionLoading: false,
  error: null,
};

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchCRMDashboard = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchDashboard",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/dashboard", { params: params || {} });
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMCallers = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchCallers",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/callers", { params: params || {} });
      return {
        callers: res.data?.data || [],
        meta: res.data?.meta || {},
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createCRMCaller = createAsyncThunk(
  "superAdminCrm/createCaller",
  async (
    data: { name: string; phone: string; email?: string; designation?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post("/admin/crm/callers", data);
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleCRMCallerStatus = createAsyncThunk(
  "superAdminCrm/toggleCallerStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(`/admin/crm/callers/${id}/status`, {
        status,
        isActive: status === "active",
      });
      return { id, isActive: status === "active", data: res.data?.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMLeads = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchLeads",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/leads", { params: params || {} });
      return {
        leads: res.data?.data || [],
        meta: res.data?.meta || {},
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createCRMLead = createAsyncThunk(
  "superAdminCrm/createLead",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/admin/crm/leads", data);
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMUnassignedLeads = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchUnassignedLeads",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/leads/unassigned");
      return res.data?.data || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMLeadDetails = createAsyncThunk(
  "superAdminCrm/fetchLeadDetails",
  async (leadId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/admin/crm/leads/${leadId}`);
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const assignCRMLead = createAsyncThunk(
  "superAdminCrm/assignLead",
  async (
    { leadId, teleCallerId, reason }: { leadId: string; teleCallerId: string; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(`/admin/crm/leads/${leadId}/assign`, {
        teleCallerId,
        reason,
      });
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const reassignCRMLead = createAsyncThunk(
  "superAdminCrm/reassignLead",
  async (
    { leadId, teleCallerId, reason }: { leadId: string; teleCallerId: string; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(`/admin/crm/leads/${leadId}/reassign`, {
        teleCallerId,
        reason,
      });
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCRMLeadStatus = createAsyncThunk(
  "superAdminCrm/updateLeadStatus",
  async (
    { leadId, status, notes, lostReason }: { leadId: string; status: string; notes?: string; lostReason?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(`/admin/crm/leads/${leadId}/status`, {
        status,
        notes,
        lostReason,
      });
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMCalls = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchCalls",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/calls", { params: params || {} });
      return {
        calls: res.data?.data || [],
        meta: res.data?.meta || {},
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMAISummary = createAsyncThunk(
  "superAdminCrm/fetchAISummary",
  async (callId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.get(`/admin/crm/calls/${callId}/summary`);
      return { callId, summary: res.data?.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMSiteVisits = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchSiteVisits",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/site-visits", { params: params || {} });
      return {
        visits: res.data?.data || [],
        meta: res.data?.meta || {},
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createCRMSiteVisit = createAsyncThunk(
  "superAdminCrm/createSiteVisit",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await apiClient.post("/admin/crm/site-visits", data);
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateCRMSiteVisitStatus = createAsyncThunk(
  "superAdminCrm/updateSiteVisitStatus",
  async (
    { id, status, notes }: { id: string; status: string; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(`/admin/crm/site-visits/${id}/status`, { status, notes });
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMFollowUps = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchFollowUps",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/follow-ups", { params: params || {} });
      return {
        followups: res.data?.data || [],
        meta: res.data?.meta || {},
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const completeCRMFollowUp = createAsyncThunk(
  "superAdminCrm/completeFollowUp",
  async (
    { id, completionNotes }: { id: string; completionNotes?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.patch(`/admin/crm/follow-ups/${id}/complete`, { completionNotes });
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMHandoffs = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchHandoffs",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/handoffs", { params: params || {} });
      return {
        handoffs: res.data?.data || [],
        meta: res.data?.meta || {},
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const reviewCRMHandoff = createAsyncThunk(
  "superAdminCrm/reviewHandoff",
  async (
    { id, action, remarks }: { id: string; action: "accept" | "reject" | "return"; remarks?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(`/admin/crm/handoffs/${id}/${action}`, { remarks });
      return res.data?.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMShowcases = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchShowcases",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/tv/showcases");
      return res.data?.data || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const controlCRMShowcase = createAsyncThunk(
  "superAdminCrm/controlShowcase",
  async (
    { id, action, propertyIndex }: { id: string; action: "play" | "next" | "previous"; propertyIndex?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await apiClient.post(`/admin/crm/tv/showcases/${id}/${action}`, { propertyIndex });
      return { id, action, data: res.data?.data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMAuditLogs = createAsyncThunk<any, any | void>(
  "superAdminCrm/fetchAuditLogs",
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/audit-logs", { params: params || {} });
      return {
        logs: res.data?.data || [],
        meta: res.data?.meta || {},
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchCRMLeadSources = createAsyncThunk(
  "superAdminCrm/fetchLeadSources",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get("/admin/crm/lead-sources");
      return res.data?.data || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

export const superAdminCrmSlice = createSlice({
  name: "superAdminCrm",
  initialState,
  reducers: {
    clearSelectedLead: (state) => {
      state.selectedLead = null;
    },
    clearSelectedCaller: (state) => {
      state.selectedCaller = null;
    },
    clearSelectedCallSummary: (state) => {
      state.selectedCallSummary = null;
    },
    // Real-time Socket Dispatchers
    onSocketLeadNew: (state, action: PayloadAction<CRMLeadItem>) => {
      state.leads.unshift(action.payload);
      if (state.dashboardStats) {
        state.dashboardStats.totalLeads += 1;
        state.dashboardStats.newLeads += 1;
      }
    },
    onSocketLeadAssigned: (state, action: PayloadAction<{ lead: CRMLeadItem; assignedTo: string }>) => {
      const idx = state.leads.findIndex((l) => l._id === action.payload.lead._id);
      if (idx !== -1) {
        state.leads[idx] = action.payload.lead;
      }
    },
    onSocketLeadStatusChanged: (
      state,
      action: PayloadAction<{ leadId: string; from: string; to: string }>
    ) => {
      const lead = state.leads.find((l) => l._id === action.payload.leadId || l.leadId === action.payload.leadId);
      if (lead) {
        lead.status = action.payload.to as any;
      }
    },
    onSocketHandoffCreated: (state, action: PayloadAction<CRMHandoffItem>) => {
      state.handoffs.unshift(action.payload);
      if (state.dashboardStats) {
        state.dashboardStats.pendingHandoffs += 1;
      }
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder.addCase(fetchCRMDashboard.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCRMDashboard.fulfilled, (state, action) => {
      state.loading = false;
      state.dashboardStats = action.payload;
    });
    builder.addCase(fetchCRMDashboard.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Callers
    builder.addCase(fetchCRMCallers.fulfilled, (state, action) => {
      state.callers = action.payload.callers;
      state.pagination.callersTotal = action.payload.meta?.total || action.payload.callers.length;
    });
    builder.addCase(createCRMCaller.fulfilled, (state, action) => {
      state.callers.unshift({
        caller: {
          id: action.payload._id,
          staffId: action.payload.staffId,
          name: action.payload.name,
          phone: action.payload.phone,
          email: action.payload.email,
          status: "active",
          designation: action.payload.designation,
          joiningDate: action.payload.joiningDate,
        },
        statistics: {
          totalLeads: 0,
          newLeads: 0,
          calls: 0,
          connectedCalls: 0,
          notReachable: 0,
          followUps: 0,
          completedFollowUps: 0,
          siteVisits: 0,
          completedVisits: 0,
          shortlists: 0,
          whatsappShares: 0,
          handoffs: 0,
          conversions: 0,
          lostLeads: 0,
          pendingFollowUps: 0,
          pendingVisits: 0,
          currentWorkload: 0,
        },
        currentWorkload: 0,
        pendingFollowUps: 0,
        pendingSiteVisits: 0,
      });
      if (state.dashboardStats) {
        state.dashboardStats.activeCallers += 1;
        state.dashboardStats.totalCallers += 1;
      }
    });
    builder.addCase(toggleCRMCallerStatus.fulfilled, (state, action) => {
      const caller = state.callers.find((c) => c.caller.id === action.payload.id);
      if (caller) {
        caller.caller.status = action.payload.isActive ? "active" : "inactive";
      }
    });

    // Leads
    builder.addCase(fetchCRMLeads.fulfilled, (state, action) => {
      state.leads = action.payload.leads;
      state.pagination.leadsTotal = action.payload.meta?.total || action.payload.leads.length;
    });
    builder.addCase(createCRMLead.fulfilled, (state, action) => {
      if (action.payload) {
        state.leads.unshift(action.payload);
        state.pagination.leadsTotal += 1;
        if (!action.payload.assignedTo) {
          state.unassignedLeads.unshift(action.payload);
        }
      }
    });
    builder.addCase(fetchCRMUnassignedLeads.fulfilled, (state, action) => {
      state.unassignedLeads = action.payload;
    });
    builder.addCase(fetchCRMLeadDetails.fulfilled, (state, action) => {
      state.selectedLead = action.payload;
    });
    builder.addCase(assignCRMLead.fulfilled, (state, action) => {
      const idx = state.leads.findIndex((l) => l._id === action.payload._id);
      if (idx !== -1) {
        state.leads[idx] = action.payload;
      }
      state.unassignedLeads = state.unassignedLeads.filter((l) => l._id !== action.payload._id);
    });
    builder.addCase(reassignCRMLead.fulfilled, (state, action) => {
      const idx = state.leads.findIndex((l) => l._id === action.payload._id);
      if (idx !== -1) {
        state.leads[idx] = action.payload;
      }
    });
    builder.addCase(updateCRMLeadStatus.fulfilled, (state, action) => {
      const idx = state.leads.findIndex((l) => l._id === action.payload._id);
      if (idx !== -1) {
        state.leads[idx] = action.payload;
      }
    });

    // Calls
    builder.addCase(fetchCRMCalls.fulfilled, (state, action) => {
      state.calls = action.payload.calls;
      state.pagination.callsTotal = action.payload.meta?.total || action.payload.calls.length;
    });
    builder.addCase(fetchCRMAISummary.fulfilled, (state, action) => {
      state.selectedCallSummary = action.payload.summary;
    });

    // Site Visits
    builder.addCase(fetchCRMSiteVisits.fulfilled, (state, action) => {
      state.siteVisits = action.payload.visits;
      state.pagination.visitsTotal = action.payload.meta?.total || action.payload.visits.length;
    });
    builder.addCase(createCRMSiteVisit.fulfilled, (state, action) => {
      state.siteVisits.unshift(action.payload);
    });
    builder.addCase(updateCRMSiteVisitStatus.fulfilled, (state, action) => {
      const idx = state.siteVisits.findIndex((v) => v._id === action.payload._id);
      if (idx !== -1) {
        state.siteVisits[idx] = action.payload;
      }
    });

    // Follow-ups
    builder.addCase(fetchCRMFollowUps.fulfilled, (state, action) => {
      state.followUps = action.payload.followups;
      state.pagination.followupsTotal = action.payload.meta?.total || action.payload.followups.length;
    });
    builder.addCase(completeCRMFollowUp.fulfilled, (state, action) => {
      const idx = state.followUps.findIndex((f) => f._id === action.payload._id);
      if (idx !== -1) {
        state.followUps[idx] = action.payload;
      }
    });

    // Handoffs
    builder.addCase(fetchCRMHandoffs.fulfilled, (state, action) => {
      state.handoffs = action.payload.handoffs;
      state.pagination.handoffsTotal = action.payload.meta?.total || action.payload.handoffs.length;
    });
    builder.addCase(reviewCRMHandoff.fulfilled, (state, action) => {
      const idx = state.handoffs.findIndex((h) => h._id === action.payload._id);
      if (idx !== -1) {
        state.handoffs[idx] = action.payload;
      }
    });

    // TV Showcases
    builder.addCase(fetchCRMShowcases.fulfilled, (state, action) => {
      state.showcases = action.payload;
    });

    // Audit Logs
    builder.addCase(fetchCRMAuditLogs.fulfilled, (state, action) => {
      state.auditLogs = action.payload.logs;
      state.pagination.logsTotal = action.payload.meta?.total || action.payload.logs.length;
    });

    // Lead Sources
    builder.addCase(fetchCRMLeadSources.fulfilled, (state, action) => {
      state.leadSources = action.payload;
    });
  },
});

export const {
  clearSelectedLead,
  clearSelectedCaller,
  clearSelectedCallSummary,
  onSocketLeadNew,
  onSocketLeadAssigned,
  onSocketLeadStatusChanged,
  onSocketHandoffCreated,
} = superAdminCrmSlice.actions;

export default superAdminCrmSlice.reducer;
