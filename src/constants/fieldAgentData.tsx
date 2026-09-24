import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import apiClient from "../Redux/api/axiosInstance";

export type LeadStatus = "NEW" | "VERIFIED" | "RENTED" | "SOLD" | "REJECTED";
export type PropertyType =
  | "1BHK"
  | "2BHK"
  | "3BHK"
  | "PG / Studio"
  | "Independent House"
  | "Commercial Shop";

export type ListingType = "RENT" | "SALE";

export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  formattedAddress: string;
}

export interface RecurringCommissionItem {
  month: string;
  rentAmount: number;
  commissionAmount: number;
  type: "first_month" | "monthly_recurring";
  status: "pending" | "approved" | "paid";
  paidAt?: string;
}

export interface LeadItem {
  id: string;
  _id?: string;
  ownerName: string;
  ownerPhone: string;
  maskedPhone: string;
  locality: string;
  fullAddress: string;
  propertyType: PropertyType;
  listingType: ListingType;
  expectedPrice: number;
  gpsLocation: GPSLocation;
  status: LeadStatus;
  submissionDate: string;
  commissionAmount: number;
  firstMonthCommission?: number;
  recurringMonthlyCommission?: number;
  recurringMonthlyRate?: number;
  recurringCommissions?: RecurringCommissionItem[];
  tenantName?: string;
  tenantPhone?: string;
  commissionStatus: "PENDING" | "APPROVED" | "PAID";
  photos: string[];
  videoLink?: string;
  remarks?: string;
  verificationNotes?: string;
}

export interface PayoutTransaction {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: "COMPLETED" | "PROCESSING" | "FAILED";
  referenceId: string;
}

export interface BankDetails {
  upiId: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: string;
  tierLevel: number;
  assignedLocality: string;
  joinedDate: string;
  kycStatus: "VERIFIED" | "PENDING";
  avatar: string;
  bankDetails: BankDetails;
}

export const INITIAL_AGENT_PROFILE: AgentProfile = {
  id: "",
  name: "",
  phone: "",
  email: "",
  tier: "Field Partner",
  tierLevel: 1,
  assignedLocality: "",
  joinedDate: "",
  kycStatus: "PENDING",
  avatar: "",
  bankDetails: {
    upiId: "",
    accountHolder: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
  },
};

export const INITIAL_LEADS: LeadItem[] = [];

export const INITIAL_PAYOUT_HISTORY: PayoutTransaction[] = [];

export const maskPhoneNumber = (phone: string): string => {
  if (!phone) return "+91 ••••• •••••";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length >= 10) {
    const last10 = cleaned.slice(-10);
    return `+91 ${last10.slice(0, 5)} •••••`;
  }
  return phone;
};

export const formatCurrency = (amount: number): string => {
  return "₹" + (amount || 0).toLocaleString("en-IN");
};

// Map backend PropertyLead document to frontend LeadItem
const mapBackendToLeadItem = (doc: any): LeadItem => {
  const photoUrls = Array.isArray(doc.photos)
    ? doc.photos.map((p: any) => (typeof p === "string" ? p : p.url))
    : doc.images || [];

  const isRentedOrSold =
    doc.status === "rented" ||
    doc.status === "sold" ||
    doc.deal?.isClosed === true;
  const firstMonth =
    doc.commission?.firstMonthCommission ||
    (isRentedOrSold ? doc.commission?.approvedAmount : 0) ||
    0;
  const recurringRate = doc.commission?.recurringMonthlyRate || 5;
  const recurringAmt =
    doc.commission?.recurringMonthlyCommission ||
    Math.round(
      (doc.deal?.finalPrice || doc.expectedPrice || 0) * (recurringRate / 100),
    );

  return {
    id: doc.leadId || doc._id || "LD-0000",
    _id: doc._id,
    ownerName: doc.ownerName || "Property Owner",
    ownerPhone: doc.ownerPhone || "",
    maskedPhone: doc.maskedPhone || maskPhoneNumber(doc.ownerPhone || ""),
    locality: doc.locality || doc.address?.city || "Delhi NCR",
    fullAddress:
      doc.address?.fullAddress || doc.address?.street || doc.locality || "",
    propertyType: (doc.propertyType || "2BHK") as PropertyType,
    listingType: (doc.listingType || "rent").toUpperCase() as ListingType,
    expectedPrice: doc.expectedPrice || 0,
    gpsLocation: {
      latitude:
        doc.gpsDetails?.latitude || doc.location?.coordinates?.[1] || 28.6139,
      longitude:
        doc.gpsDetails?.longitude || doc.location?.coordinates?.[0] || 77.209,
      accuracyMeters: doc.gpsDetails?.accuracy || 4.2,
      formattedAddress:
        doc.gpsDetails?.reverseGeocodedAddress ||
        doc.locality ||
        "Captured Live On-Site",
    },
    status: (doc.status || "new").toUpperCase() as LeadStatus,
    submissionDate: doc.createdAt
      ? new Date(doc.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Recently",
    commissionAmount: isRentedOrSold ? doc.commission?.approvedAmount || 0 : 0,
    firstMonthCommission: firstMonth,
    recurringMonthlyCommission: recurringAmt,
    recurringMonthlyRate: recurringRate,
    recurringCommissions: doc.commission?.recurringCommissions || [],
    tenantName: doc.deal?.tenantName,
    tenantPhone: doc.deal?.tenantPhone,
    commissionStatus: isRentedOrSold
      ? ((
          doc.commission?.status ||
          doc.commissionStatus ||
          "pending"
        ).toUpperCase() as "PENDING" | "APPROVED" | "PAID")
      : "PENDING",
    photos: photoUrls.length > 0 ? photoUrls : [],
    videoLink: doc.videoLink || doc.videoUrl,
    remarks: doc.remarks,
    verificationNotes:
      doc.verificationNotes || doc.inspectionDetails?.staffChecklistRemarks,
  };
};

interface FieldAgentContextType {
  agentProfile: AgentProfile;
  leads: LeadItem[];
  payoutHistory: PayoutTransaction[];
  availableBalance: number;
  totalEarnings: number;
  pendingApproval: number;
  paidEarnings: number;
  recurringMonthlyActive: number;
  activeTenantsCount: number;
  isLoading: boolean;
  refreshLeads: () => Promise<void>;
  addNewLead: (
    lead: Omit<
      LeadItem,
      | "id"
      | "maskedPhone"
      | "submissionDate"
      | "status"
      | "commissionAmount"
      | "commissionStatus"
    >,
  ) => Promise<LeadItem>;
  requestPayout: (amount: number, method: string) => Promise<boolean>;
  updateBankDetails: (details: Partial<BankDetails>) => void;
}

const FieldAgentContext = createContext<FieldAgentContextType | null>(null);

export const FieldAgentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [agentProfile, setAgentProfile] = useState<AgentProfile>(
    INITIAL_AGENT_PROFILE,
  );
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [payoutHistory, setPayoutHistory] = useState<PayoutTransaction[]>(
    INITIAL_PAYOUT_HISTORY,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statsData, setStatsData] = useState<any>(null);

  // Fetch real leads from Backend API
  const fetchMyLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/leads/my-leads");
      if (res.data?.data?.leads && Array.isArray(res.data.data.leads)) {
        const backendLeads = res.data.data.leads.map(mapBackendToLeadItem);
        setLeads(backendLeads);
      } else if (Array.isArray(res.data?.data)) {
        const backendLeads = res.data.data.map(mapBackendToLeadItem);
        setLeads(backendLeads);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.log(
        "[FieldAgentProvider] Fetching leads from backend (using cached fallback):",
        err,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch real agent dashboard stats
  const fetchMyStats = useCallback(async () => {
    try {
      const res = await apiClient.get("/leads/my-stats");
      if (res.data?.data) {
        setStatsData(res.data.data);
      }
    } catch (err) {
      // Silently continue
    }
  }, []);

  useEffect(() => {
    fetchMyLeads();
    fetchMyStats();
  }, [fetchMyLeads, fetchMyStats]);

  // Derived Financials from Backend or leads
  const availableBalance =
    statsData?.walletBalance !== undefined
      ? statsData.walletBalance
      : leads
          .filter(
            (l) =>
              (l.status === "RENTED" || l.status === "SOLD") &&
              l.commissionStatus === "APPROVED",
          )
          .reduce((acc, curr) => acc + curr.commissionAmount, 0);

  const totalEarnings =
    statsData?.approvedCommission !== undefined
      ? statsData.approvedCommission
      : leads
          .filter(
            (l) =>
              (l.status === "RENTED" || l.status === "SOLD") &&
              (l.commissionStatus === "PAID" ||
                l.commissionStatus === "APPROVED"),
          )
          .reduce((acc, curr) => acc + curr.commissionAmount, 0);

  const paidEarnings =
    statsData?.paidCommission !== undefined
      ? statsData.paidCommission
      : payoutHistory
          .filter((p) => p.status === "COMPLETED")
          .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingApproval =
    statsData?.potentialCommission !== undefined
      ? statsData.potentialCommission
      : leads
          .filter(
            (l) =>
              l.status !== "RENTED" &&
              l.status !== "SOLD" &&
              l.status !== "REJECTED",
          )
          .reduce(
            (acc, curr) =>
              acc + (curr.firstMonthCommission || curr.commissionAmount || 0),
            0,
          );

  const recurringMonthlyActive =
    statsData?.recurringMonthlyActive !== undefined
      ? statsData.recurringMonthlyActive
      : leads
          .filter((l) => l.status === "RENTED")
          .reduce(
            (acc, curr) => acc + (curr.recurringMonthlyCommission || 0),
            0,
          );

  const activeTenantsCount =
    statsData?.activeTenantsCount !== undefined
      ? statsData.activeTenantsCount
      : leads.filter((l) => l.status === "RENTED").length;

  // Submit Lead to Backend & update local state
  const addNewLead = async (
    newLeadData: Omit<
      LeadItem,
      | "id"
      | "maskedPhone"
      | "submissionDate"
      | "status"
      | "commissionAmount"
      | "commissionStatus"
    >,
  ): Promise<LeadItem> => {
    try {
      const payload = {
        ownerName: newLeadData.ownerName,
        ownerPhone: newLeadData.ownerPhone,
        locality: newLeadData.locality,
        address: {
          fullAddress: newLeadData.fullAddress,
          city: "Delhi NCR",
        },
        propertyType: newLeadData.propertyType,
        listingType: newLeadData.listingType.toLowerCase(),
        expectedPrice: newLeadData.expectedPrice,
        photos: newLeadData.photos,
        gpsDetails: newLeadData.gpsLocation
          ? {
              latitude: newLeadData.gpsLocation.latitude,
              longitude: newLeadData.gpsLocation.longitude,
              accuracy: newLeadData.gpsLocation.accuracyMeters,
              reverseGeocodedAddress: newLeadData.gpsLocation.formattedAddress,
            }
          : undefined,
        videoLink: newLeadData.videoLink,
        remarks: newLeadData.remarks,
      };

      const res = await apiClient.post("/leads", payload);
      if (res.data?.data) {
        const createdFromBackend = mapBackendToLeadItem(res.data.data);
        setLeads((prev) => [createdFromBackend, ...prev]);
        fetchMyStats();
        return createdFromBackend;
      }
    } catch (err) {
      console.log(
        "[FieldAgentProvider] API submit failed, saving locally:",
        err,
      );
    }

    // Local fallback creation
    const randomId = "LD-" + Math.floor(1000 + Math.random() * 9000);
    const masked = maskPhoneNumber(newLeadData.ownerPhone);
    const est1stMonth =
      newLeadData.listingType === "SALE"
        ? 15000
        : Math.round(newLeadData.expectedPrice * 0.15);
    const estRecurring =
      newLeadData.listingType === "SALE"
        ? 0
        : Math.round(newLeadData.expectedPrice * 0.05);

    const createdLead: LeadItem = {
      ...newLeadData,
      id: randomId,
      maskedPhone: masked,
      submissionDate: "Just now",
      status: "NEW",
      commissionAmount: 0,
      firstMonthCommission: est1stMonth,
      recurringMonthlyCommission: estRecurring,
      recurringMonthlyRate: 5,
      commissionStatus: "PENDING",
      verificationNotes:
        "Submitted with 1-Click GPS. Verification scheduled. Commission activates upon tenant registration and 1st month rent.",
    };

    setLeads((prev) => [createdLead, ...prev]);
    return createdLead;
  };

  const requestPayout = async (
    amount: number,
    method: string,
  ): Promise<boolean> => {
    const newTxn: PayoutTransaction = {
      id: "TXN-" + Math.floor(10000 + Math.random() * 90000),
      amount,
      method,
      date: "Today",
      status: "PROCESSING",
      referenceId: "REQ/" + Math.floor(1000000000 + Math.random() * 9000000000),
    };

    setPayoutHistory((prev) => [newTxn, ...prev]);
    return true;
  };

  const updateBankDetails = (details: Partial<BankDetails>) => {
    setAgentProfile((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        ...details,
      },
    }));
  };

  return (
    <FieldAgentContext.Provider
      value={{
        agentProfile,
        leads,
        payoutHistory,
        availableBalance,
        totalEarnings,
        pendingApproval,
        paidEarnings,
        recurringMonthlyActive,
        activeTenantsCount,
        isLoading,
        refreshLeads: fetchMyLeads,
        addNewLead,
        requestPayout,
        updateBankDetails,
      }}
    >
      {children}
    </FieldAgentContext.Provider>
  );
};

export const useFieldAgent = () => {
  const context = useContext(FieldAgentContext);
  if (!context) {
    throw new Error("useFieldAgent must be used within a FieldAgentProvider");
  }
  return context;
};
