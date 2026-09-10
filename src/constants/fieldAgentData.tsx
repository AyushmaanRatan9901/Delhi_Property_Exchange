import React, { createContext, useContext, useState } from "react";

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

export interface LeadItem {
  id: string;
  ownerName: string;
  ownerPhone: string;
  maskedPhone: string;
  locality: string;
  fullAddress: string;
  propertyType: PropertyType;
  listingType: ListingType;
  expectedPrice: number; // e.g. 24000/mo or 8500000
  gpsLocation: GPSLocation;
  status: LeadStatus;
  submissionDate: string;
  commissionAmount: number;
  commissionStatus: "PENDING" | "APPROVED" | "PAID";
  photos: string[];
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
  id: "AGT-7821-DEL",
  name: "Pooja Sharma",
  phone: "+91 98765 43210",
  email: "pooja.sharma@estatepartner.in",
  tier: "Gold Field Partner",
  tierLevel: 2,
  assignedLocality: "Sector 62 & Indirapuram, Delhi-NCR",
  joinedDate: "12 Jan 2024",
  kycStatus: "VERIFIED",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  bankDetails: {
    upiId: "pooja@okaxis",
    accountHolder: "Pooja Sharma",
    bankName: "HDFC Bank Ltd",
    accountNumber: "•••• •••• 4912",
    ifsc: "HDFC0001824",
  },
};

export const INITIAL_LEADS: LeadItem[] = [
  {
    id: "LD-9042",
    ownerName: "Rajesh Verma",
    ownerPhone: "+91 98112 34567",
    maskedPhone: "+91 98112 •••••",
    locality: "Sector 62, Noida",
    fullAddress: "Flat 402, Tower B, Royal Palms, Sector 62",
    propertyType: "2BHK",
    listingType: "RENT",
    expectedPrice: 26000,
    gpsLocation: {
      latitude: 28.6289,
      longitude: 77.3654,
      accuracyMeters: 4.2,
      formattedAddress: "Block B, Sector 62, Noida, Uttar Pradesh 201309",
    },
    status: "RENTED",
    submissionDate: "06 Sep 2026, 11:20 AM",
    commissionAmount: 3500,
    commissionStatus: "PAID",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    ],
    remarks: "Owner willing to give keys for instant tenant visits.",
    verificationNotes: "Physical verification completed by Field Staff Rahul. Property rented out to IT executive.",
  },
  {
    id: "LD-9038",
    ownerName: "Sunita Agarwal",
    ownerPhone: "+91 99283 88123",
    maskedPhone: "+91 99283 •••••",
    locality: "Indirapuram, Ghaziabad",
    fullAddress: "House 14-A, Shipra Sun City, Indirapuram",
    propertyType: "3BHK",
    listingType: "RENT",
    expectedPrice: 38000,
    gpsLocation: {
      latitude: 28.6392,
      longitude: 77.3789,
      accuracyMeters: 5.8,
      formattedAddress: "Shipra Sun City, Indirapuram, Ghaziabad, UP 201014",
    },
    status: "VERIFIED",
    submissionDate: "08 Sep 2026, 04:15 PM",
    commissionAmount: 5000,
    commissionStatus: "APPROVED",
    photos: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80",
    ],
    remarks: "Fully furnished 3BHK flat with modular kitchen and 2 balconies.",
    verificationNotes: "Approved by Verification Staff. Listed on tenant app for booking.",
  },
  {
    id: "LD-9031",
    ownerName: "Amitabh Mehra",
    ownerPhone: "+91 98710 44219",
    maskedPhone: "+91 98710 •••••",
    locality: "Sector 63, Noida",
    fullAddress: "Shop No. 12, Ground Floor, Central Plaza Market",
    propertyType: "Commercial Shop",
    listingType: "RENT",
    expectedPrice: 45000,
    gpsLocation: {
      latitude: 28.6255,
      longitude: 77.3821,
      accuracyMeters: 6.1,
      formattedAddress: "Central Plaza, Sector 63, Noida 201301",
    },
    status: "NEW",
    submissionDate: "10 Sep 2026, 09:40 AM",
    commissionAmount: 4000,
    commissionStatus: "PENDING",
    photos: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
    ],
    remarks: "Prime ground floor corner shop opposite metro station exit.",
    verificationNotes: "Assigned to verification team. Inspection scheduled for today 03:00 PM.",
  },
  {
    id: "LD-9019",
    ownerName: "Kavita Singhal",
    ownerPhone: "+91 97182 99014",
    maskedPhone: "+91 97182 •••••",
    locality: "Vaishali Sector 4, Ghaziabad",
    fullAddress: "C-201, Express Greens Apartments",
    propertyType: "1BHK",
    listingType: "RENT",
    expectedPrice: 16500,
    gpsLocation: {
      latitude: 28.6471,
      longitude: 77.3412,
      accuracyMeters: 3.5,
      formattedAddress: "Express Greens, Sector 4, Vaishali 201010",
    },
    status: "RENTED",
    submissionDate: "02 Sep 2026, 01:10 PM",
    commissionAmount: 2500,
    commissionStatus: "PAID",
    photos: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80",
    ],
    remarks: "Close to Vaishali Metro station. Ideal for bachelors or working couples.",
    verificationNotes: "Verified & Rented via platform. Commission credited to wallet.",
  },
  {
    id: "LD-8994",
    ownerName: "Vikas Malhotra",
    ownerPhone: "+91 98101 22345",
    maskedPhone: "+91 98101 •••••",
    locality: "Sector 50, Noida",
    fullAddress: "Villa 8, Maple Enclave, Sector 50",
    propertyType: "Independent House",
    listingType: "SALE",
    expectedPrice: 14500000,
    gpsLocation: {
      latitude: 28.5714,
      longitude: 77.3688,
      accuracyMeters: 4.8,
      formattedAddress: "Maple Enclave, Sector 50, Noida 201301",
    },
    status: "VERIFIED",
    submissionDate: "28 Aug 2026, 11:00 AM",
    commissionAmount: 15000,
    commissionStatus: "APPROVED",
    photos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80",
    ],
    remarks: "Independent 4-bedroom duplex villa with private garden and car porch.",
    verificationNotes: "Verified by SuperAdmin inspection team. 3 prospective buyers lined up.",
  },
];

export const INITIAL_PAYOUT_HISTORY: PayoutTransaction[] = [
  {
    id: "TXN-88123",
    amount: 6000,
    method: "UPI (pooja@okaxis)",
    date: "07 Sep 2026",
    status: "COMPLETED",
    referenceId: "UPI/62491048102",
  },
  {
    id: "TXN-87940",
    amount: 12500,
    method: "Bank Transfer (HDFC ••4912)",
    date: "29 Aug 2026",
    status: "COMPLETED",
    referenceId: "NEFT/HDFC98214019",
  },
  {
    id: "TXN-86510",
    amount: 5000,
    method: "UPI (pooja@okaxis)",
    date: "15 Aug 2026",
    status: "COMPLETED",
    referenceId: "UPI/62271890241",
  },
];

export const maskPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length >= 10) {
    const last10 = cleaned.slice(-10);
    return `+91 ${last10.slice(0, 5)} •••••`;
  }
  return "+91 ••••• •••••";
};

export const formatCurrency = (amount: number): string => {
  return "₹" + amount.toLocaleString("en-IN");
};

interface FieldAgentContextType {
  agentProfile: AgentProfile;
  leads: LeadItem[];
  payoutHistory: PayoutTransaction[];
  availableBalance: number;
  totalEarnings: number;
  pendingApproval: number;
  paidEarnings: number;
  addNewLead: (lead: Omit<LeadItem, "id" | "maskedPhone" | "submissionDate" | "status" | "commissionAmount" | "commissionStatus">) => LeadItem;
  requestPayout: (amount: number, method: string) => Promise<boolean>;
  updateBankDetails: (details: Partial<BankDetails>) => void;
}

const FieldAgentContext = createContext<FieldAgentContextType | null>(null);

export const FieldAgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agentProfile, setAgentProfile] = useState<AgentProfile>(INITIAL_AGENT_PROFILE);
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [payoutHistory, setPayoutHistory] = useState<PayoutTransaction[]>(INITIAL_PAYOUT_HISTORY);

  // Derived Financials
  const availableBalance = leads
    .filter((l) => l.commissionStatus === "APPROVED")
    .reduce((acc, curr) => acc + curr.commissionAmount, 0) + 14500;

  const totalEarnings = leads
    .filter((l) => l.commissionStatus === "PAID" || l.commissionStatus === "APPROVED")
    .reduce((acc, curr) => acc + curr.commissionAmount, 0) + 23500;

  const paidEarnings = payoutHistory
    .filter((p) => p.status === "COMPLETED")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingApproval = leads
    .filter((l) => l.commissionStatus === "PENDING")
    .reduce((acc, curr) => acc + curr.commissionAmount, 0);

  const addNewLead = (newLeadData: Omit<LeadItem, "id" | "maskedPhone" | "submissionDate" | "status" | "commissionAmount" | "commissionStatus">) => {
    const randomId = "LD-" + Math.floor(1000 + Math.random() * 9000);
    const masked = maskPhoneNumber(newLeadData.ownerPhone);
    const estCommission = newLeadData.listingType === "SALE" ? 15000 : 3500;

    const createdLead: LeadItem = {
      ...newLeadData,
      id: randomId,
      maskedPhone: masked,
      submissionDate: "Just now",
      status: "NEW",
      commissionAmount: estCommission,
      commissionStatus: "PENDING",
      verificationNotes: "Submitted by Field Agent with 1-Click GPS. Verification team scheduled for inspection.",
    };

    setLeads((prev) => [createdLead, ...prev]);
    return createdLead;
  };

  const requestPayout = async (amount: number, method: string): Promise<boolean> => {
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
