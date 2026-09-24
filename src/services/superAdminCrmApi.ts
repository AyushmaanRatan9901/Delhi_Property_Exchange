import apiClient from "../Redux/api/axiosInstance";

export interface CRMDashboardData {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  matchingLeads: number;
  shortlistedLeads: number;
  siteVisitLeads: number;
  negotiationLeads: number;
  convertedLeads: number;
  lostLeads: number;
  callsToday: number;
  followUpsToday: number;
  overdueFollowUps: number;
  siteVisitsToday: number;
  pendingHandoffs: number;
  activeCallers: number;
  inactiveCallers: number;
  totalCallers: number;
}

export interface CallerItem {
  caller: {
    id: string;
    staffId?: string;
    name: string;
    phone: string;
    email?: string;
    status: "active" | "inactive";
    designation?: string;
    joiningDate?: string;
    lastLogin?: string;
  };
  statistics: {
    totalLeads: number;
    newLeads: number;
    calls: number;
    connectedCalls: number;
    notReachable: number;
    followUps: number;
    completedFollowUps: number;
    siteVisits: number;
    completedVisits: number;
    shortlists: number;
    whatsappShares: number;
    handoffs: number;
    conversions: number;
    lostLeads: number;
    pendingFollowUps: number;
    pendingVisits: number;
    currentWorkload: number;
    lastActivityAt?: string;
  };
  lastActivityAt?: string;
  currentWorkload: number;
  pendingFollowUps: number;
  pendingSiteVisits: number;
}

export interface CRMLeadItem {
  _id: string;
  leadId: string;
  name: string;
  phone: string;
  email?: string;
  alternatePhone?: string;
  source: string;
  requirementType: "rent" | "sale" | "mortgage";
  status:
    | "new"
    | "contacted"
    | "qualified"
    | "matching"
    | "shortlisted"
    | "site_visit"
    | "negotiation"
    | "converted"
    | "lost";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    staffId?: string;
  };
  assignedBy?: {
    _id: string;
    name: string;
    role: string;
  };
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  nextFollowUpAt?: string;
  lastContactedAt?: string;
  lostReason?: string;
  lostNotes?: string;
}

export interface CRMCallItem {
  _id: string;
  callId: string;
  lead: {
    _id: string;
    leadId: string;
    name: string;
    phone: string;
    requirementType?: string;
    status?: string;
  };
  teleCaller: {
    _id: string;
    name: string;
    phone: string;
    staffId?: string;
  };
  phoneNumber: string;
  startedAt: string;
  endedAt?: string;
  duration: number;
  direction?: "inbound" | "outbound";
  outcome: string;
  notes?: string;
  recordingUrl?: string;
  transcript?: string;
  aiSummary?: any;
  summary?: any;
}

export interface CRMSiteVisitItem {
  _id: string;
  visitId: string;
  lead: {
    _id: string;
    leadId: string;
    name: string;
    phone: string;
    requirementType?: string;
    status?: string;
  };
  property: {
    _id: string;
    leadId?: string;
    locality?: string;
    address?: any;
    expectedPrice?: number;
    propertyType?: string;
    photos?: any[];
  };
  scheduledAt: string;
  numberOfVisitors?: number;
  assignedFieldAgent?: {
    _id: string;
    name: string;
    phone: string;
    staffId?: string;
  };
  meetingLocation?: string;
  notes?: string;
  status:
    | "requested"
    | "confirmed"
    | "agent_assigned"
    | "client_reached"
    | "in_progress"
    | "completed"
    | "visit_completed"
    | "cancelled"
    | "no_show";
  feedback?: any;
}

export interface CRMFollowUpItem {
  _id: string;
  followupId: string;
  lead: {
    _id: string;
    leadId: string;
    name: string;
    phone: string;
    status?: string;
    priority?: string;
  };
  type: string;
  scheduledAt: string;
  priority: string;
  notes?: string;
  assignedTo: {
    _id: string;
    name: string;
    phone: string;
    staffId?: string;
  };
  status: "pending" | "completed" | "cancelled" | "snoozed" | "overdue";
  completedAt?: string;
  completionNotes?: string;
}

export interface CRMHandoffItem {
  _id: string;
  handoffId: string;
  lead: {
    _id: string;
    leadId: string;
    name: string;
    phone: string;
    requirementType?: string;
    status?: string;
  };
  teleCaller: {
    _id: string;
    name: string;
    phone: string;
    staffId?: string;
  };
  clientInterest?: string;
  teleCallerNotes?: string;
  lastCallSummary?: string;
  status: "pending" | "accepted" | "rejected" | "returned" | "completed" | "cancelled";
  reviewedBy?: any;
  reviewedAt?: string;
  adminRemarks?: string;
  createdAt: string;
}

export interface TVShowcaseItem {
  _id: string;
  showcaseId: string;
  title: string;
  location: string;
  status: "idle" | "active" | "paused" | "closed";
  currentPropertyIndex: number;
  properties: Array<{
    property: any;
    order: number;
  }>;
}

export interface CRMAuditLogItem {
  _id: string;
  actor: {
    _id: string;
    name: string;
    phone: string;
    role: string;
    staffId?: string;
  };
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
  ip?: string;
  createdAt: string;
}

export const superAdminCrmApi = {
  // Dashboard
  getDashboardStats: async (params?: any): Promise<CRMDashboardData> => {
    const res = await apiClient.get("/admin/crm/dashboard", { params });
    return res.data?.data;
  },

  // Callers
  getCallers: async (params?: any): Promise<{ callers: CallerItem[]; meta: any }> => {
    const res = await apiClient.get("/admin/crm/callers", { params });
    return {
      callers: res.data?.data || [],
      meta: res.data?.meta || {},
    };
  },

  getCallerById: async (id: string) => {
    const res = await apiClient.get(`/admin/crm/callers/${id}`);
    return res.data?.data;
  },

  createCaller: async (data: { name: string; phone: string; email?: string; designation?: string }) => {
    const res = await apiClient.post("/admin/crm/callers", data);
    return res.data?.data;
  },

  updateCaller: async (id: string, data: any) => {
    const res = await apiClient.patch(`/admin/crm/callers/${id}`, data);
    return res.data?.data;
  },

  updateCallerStatus: async (id: string, status: "active" | "inactive") => {
    const res = await apiClient.patch(`/admin/crm/callers/${id}/status`, { status, isActive: status === "active" });
    return res.data?.data;
  },

  // Leads
  getLeads: async (params?: any): Promise<{ leads: CRMLeadItem[]; meta: any }> => {
    const res = await apiClient.get("/admin/crm/leads", { params });
    return {
      leads: res.data?.data || [],
      meta: res.data?.meta || {},
    };
  },

  getUnassignedLeads: async (): Promise<CRMLeadItem[]> => {
    const res = await apiClient.get("/admin/crm/leads/unassigned");
    return res.data?.data || [];
  },

  getLeadById: async (leadId: string) => {
    const res = await apiClient.get(`/admin/crm/leads/${leadId}`);
    return res.data?.data;
  },

  createLead: async (data: any) => {
    const res = await apiClient.post("/admin/crm/leads", data);
    return res.data?.data;
  },

  updateLead: async (leadId: string, data: any) => {
    const res = await apiClient.patch(`/admin/crm/leads/${leadId}`, data);
    return res.data?.data;
  },

  updateLeadStatus: async (leadId: string, status: string, notes?: string, lostReason?: string) => {
    const res = await apiClient.patch(`/admin/crm/leads/${leadId}/status`, { status, notes, lostReason });
    return res.data?.data;
  },

  assignLead: async (leadId: string, teleCallerId: string, reason?: string) => {
    const res = await apiClient.patch(`/admin/crm/leads/${leadId}/assign`, { teleCallerId, reason });
    return res.data?.data;
  },

  reassignLead: async (leadId: string, teleCallerId: string, reason?: string) => {
    const res = await apiClient.patch(`/admin/crm/leads/${leadId}/reassign`, { teleCallerId, reason });
    return res.data?.data;
  },

  archiveLead: async (leadId: string) => {
    const res = await apiClient.post(`/admin/crm/leads/${leadId}/archive`);
    return res.data?.data;
  },

  // Calls
  getCalls: async (params?: any): Promise<{ calls: CRMCallItem[]; meta: any }> => {
    const res = await apiClient.get("/admin/crm/calls", { params });
    return {
      calls: res.data?.data || [],
      meta: res.data?.meta || {},
    };
  },

  getCallById: async (callId: string): Promise<CRMCallItem> => {
    const res = await apiClient.get(`/admin/crm/calls/${callId}`);
    return res.data?.data;
  },

  getCallSummary: async (callId: string) => {
    const res = await apiClient.get(`/admin/crm/calls/${callId}/summary`);
    return res.data?.data;
  },

  // Site Visits
  getSiteVisits: async (params?: any): Promise<{ visits: CRMSiteVisitItem[]; meta: any }> => {
    const res = await apiClient.get("/admin/crm/site-visits", { params });
    return {
      visits: res.data?.data || [],
      meta: res.data?.meta || {},
    };
  },

  checkAvailability: async (params: { scheduledAt: string; assignedFieldAgentId?: string; propertyId?: string; leadId?: string }) => {
    const res = await apiClient.get("/admin/crm/site-visits/availability", { params });
    return res.data?.data;
  },

  createSiteVisit: async (data: any) => {
    const res = await apiClient.post("/admin/crm/site-visits", data);
    return res.data?.data;
  },

  updateSiteVisitStatus: async (id: string, status: string, notes?: string) => {
    const res = await apiClient.patch(`/admin/crm/site-visits/${id}/status`, { status, notes });
    return res.data?.data;
  },

  updateSiteVisitFeedback: async (id: string, feedback: any) => {
    const res = await apiClient.patch(`/admin/crm/site-visits/${id}/feedback`, feedback);
    return res.data?.data;
  },

  cancelSiteVisit: async (id: string, reason?: string) => {
    const res = await apiClient.post(`/admin/crm/site-visits/${id}/cancel`, { reason });
    return res.data?.data;
  },

  // Follow-ups
  getFollowUps: async (params?: any): Promise<{ followups: CRMFollowUpItem[]; meta: any }> => {
    const res = await apiClient.get("/admin/crm/follow-ups", { params });
    return {
      followups: res.data?.data || [],
      meta: res.data?.meta || {},
    };
  },

  getFollowUpsToday: async (): Promise<CRMFollowUpItem[]> => {
    const res = await apiClient.get("/admin/crm/follow-ups/today");
    return res.data?.data || [];
  },

  getOverdueFollowUps: async (callerId?: string): Promise<CRMFollowUpItem[]> => {
    const res = await apiClient.get("/admin/crm/follow-ups/overdue", { params: { caller: callerId } });
    return res.data?.data || [];
  },

  createLeadFollowUp: async (leadId: string, data: any) => {
    const res = await apiClient.post(`/admin/crm/leads/${leadId}/follow-ups`, data);
    return res.data?.data;
  },

  completeFollowUp: async (id: string, completionNotes?: string) => {
    const res = await apiClient.patch(`/admin/crm/follow-ups/${id}/complete`, { completionNotes });
    return res.data?.data;
  },

  cancelFollowUp: async (id: string, reason?: string) => {
    const res = await apiClient.post(`/admin/crm/follow-ups/${id}/cancel`, { reason });
    return res.data?.data;
  },

  // Handoffs
  getHandoffs: async (params?: any): Promise<{ handoffs: CRMHandoffItem[]; meta: any }> => {
    const res = await apiClient.get("/admin/crm/handoffs", { params });
    return {
      handoffs: res.data?.data || [],
      meta: res.data?.meta || {},
    };
  },

  acceptHandoff: async (id: string, remarks?: string) => {
    const res = await apiClient.post(`/admin/crm/handoffs/${id}/accept`, { remarks });
    return res.data?.data;
  },

  rejectHandoff: async (id: string, remarks?: string) => {
    const res = await apiClient.post(`/admin/crm/handoffs/${id}/reject`, { remarks });
    return res.data?.data;
  },

  returnHandoff: async (id: string, remarks?: string) => {
    const res = await apiClient.post(`/admin/crm/handoffs/${id}/return`, { remarks });
    return res.data?.data;
  },

  // TV Showcases
  getShowcases: async (): Promise<TVShowcaseItem[]> => {
    const res = await apiClient.get("/admin/crm/tv/showcases");
    return res.data?.data || [];
  },

  playShowcase: async (id: string, propertyIndex = 0) => {
    const res = await apiClient.post(`/admin/crm/tv/showcases/${id}/play`, { propertyIndex });
    return res.data?.data;
  },

  nextShowcase: async (id: string) => {
    const res = await apiClient.post(`/admin/crm/tv/showcases/${id}/next`);
    return res.data?.data;
  },

  previousShowcase: async (id: string) => {
    const res = await apiClient.post(`/admin/crm/tv/showcases/${id}/previous`);
    return res.data?.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: any): Promise<{ logs: CRMAuditLogItem[]; meta: any }> => {
    const res = await apiClient.get("/admin/crm/audit-logs", { params });
    return {
      logs: res.data?.data || [],
      meta: res.data?.meta || {},
    };
  },

  // Lead Sources
  getLeadSources: async () => {
    const res = await apiClient.get("/admin/crm/lead-sources");
    return res.data?.data || [];
  },
};
