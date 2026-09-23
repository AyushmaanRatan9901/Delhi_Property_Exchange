import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useAppDispatch, useAppSelector } from "../Redux/hooks";
import {
  ActiveRent,
  addComplaintMessageThunk,
  addLiveTenantNotification,
  ComplaintMessage,
  EMPTY_TENANT_PAYMENT_INSTRUCTIONS,
  EMPTY_TENANT_PROFILE,
  fetchTenantDashboard,
  handleLivePropertyAssigned,
  handleLivePropertyRemoved,
  markAllTenantNotificationsReadThunk,
  markTenantNotificationReadThunk,
  PaymentInstructions,
  payRentThunk,
  raiseComplaintThunk,
  RentLedgerItem,
  reopenComplaintThunk,
  RoomChangeRequest,
  setRefreshing,
  submitRoomChangeThunk,
  TenantComplaint,
  TenantDocument,
  TenantInspection,
  TenantNotification,
  TenantProfile,
  TenantQuickStats,
  updateTenantProfileThunk,
  uploadTenantAadhaarThunk,
  TenantProperty,
} from "../Redux/Tenant/tenantSlice";
import { getSocket } from "../services/socketService";

// Re-export all types for backward compatibility across the app
export type {
  TenantProperty,
  ActiveRent,
  RentLedgerItem,
  PaymentInstructions,
  TenantDocument,
  ComplaintMessage,
  TenantComplaint,
  TenantInspection,
  RoomChangeRequest,
  TenantNotification,
  TenantProfile,
  TenantQuickStats,
};

export {
  EMPTY_TENANT_PROFILE as EMPTY_PROFILE,
  EMPTY_TENANT_PAYMENT_INSTRUCTIONS as EMPTY_PAYMENT_INSTRUCTIONS,
};

export const formatCurrency = (amount: number): string => {
  return "₹" + (amount || 0).toLocaleString("en-IN");
};

// ── Redux-Backed Tenant Context Interface ─────────────────────────

export interface TenantContextType {
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
  payRent: (data: {
    month: string;
    amount: number;
    paymentMode: string;
    utrNumber?: string;
  }) => Promise<{ success: boolean; receiptId?: string }>;
  raiseComplaint: (data: {
    category: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    preferredVisitTime?: string;
    photos?: string[];
  }) => Promise<TenantComplaint>;
  addComplaintMessage: (
    ticketId: string,
    text: string,
    photos?: string[],
  ) => Promise<boolean>;
  reopenComplaint: (ticketId: string, reason: string) => Promise<boolean>;
  submitRoomChangeRequest: (data: {
    reason: string;
    description: string;
    targetBhk?: string;
    targetLocality?: string;
    budgetRange?: string;
    preferredMoveDate?: string;
    photos?: string[];
  }) => Promise<RoomChangeRequest>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateProfile: (data: Partial<TenantProfile>) => Promise<boolean>;
  uploadAadhaar: (
    formData: FormData,
  ) => Promise<{ success: boolean; message?: string; aadhaarDoc?: string }>;
}

const TenantContext = createContext<TenantContextType | null>(null);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const tenantState = useAppSelector((state) => state.tenant);

  const refreshAll = useCallback(async () => {
    try {
      dispatch(setRefreshing(true));
      await dispatch(fetchTenantDashboard()).unwrap();
    } catch (err) {
      console.log("[TenantProvider via Redux] fetch error:", err);
    }
  }, [dispatch]);

  // Initial load
  useEffect(() => {
    refreshAll();

    const socket = getSocket();
    if (socket) {
      const handleRealtimeUpdate = () => {
        console.log(
          "⚡ [Redux Tenant] Real-time property/deal update received, dispatching refresh...",
        );
        refreshAll();
      };

      const handleNewNotification = (data: any) => {
        if (data) {
          dispatch(addLiveTenantNotification(data));
        }
      };

      socket.on("tenant:property_assigned", (data: any) => {
        if (data?.property) dispatch(handleLivePropertyAssigned(data.property));
        refreshAll();
      });
      socket.on("tenant:property_removed", () => {
        dispatch(handleLivePropertyRemoved());
        refreshAll();
      });
      socket.on("lead:deal_closed", handleRealtimeUpdate);
      socket.on("lead:updated", handleRealtimeUpdate);
      socket.on("notification:new", handleNewNotification);

      return () => {
        socket.off("tenant:property_assigned");
        socket.off("tenant:property_removed");
        socket.off("lead:deal_closed", handleRealtimeUpdate);
        socket.off("lead:updated", handleRealtimeUpdate);
        socket.off("notification:new", handleNewNotification);
      };
    }
  }, [dispatch, refreshAll]);

  // Pay Rent Action
  const payRent = async (data: {
    month: string;
    amount: number;
    paymentMode: string;
    utrNumber?: string;
  }) => {
    const res = await dispatch(payRentThunk(data)).unwrap();
    return { success: true, receiptId: res.receiptId };
  };

  // Raise Complaint Action
  const raiseComplaint = async (data: {
    category: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "urgent";
    preferredVisitTime?: string;
    photos?: string[];
  }) => {
    return await dispatch(raiseComplaintThunk(data)).unwrap();
  };

  // Add Message to Complaint
  const addComplaintMessage = async (
    ticketId: string,
    text: string,
    photos: string[] = [],
  ) => {
    await dispatch(
      addComplaintMessageThunk({ ticketId, text, photos }),
    ).unwrap();
    return true;
  };

  // Reopen Complaint
  const reopenComplaint = async (ticketId: string, reason: string) => {
    await dispatch(reopenComplaintThunk({ ticketId, reason })).unwrap();
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
  }) => {
    return await dispatch(submitRoomChangeThunk(data)).unwrap();
  };

  // Mark Notification Read
  const markNotificationRead = async (id: string) => {
    await dispatch(markTenantNotificationReadThunk(id));
  };

  // Mark All Notifications Read
  const markAllNotificationsRead = async () => {
    await dispatch(markAllTenantNotificationsReadThunk());
  };

  // Update Profile
  const updateProfile = async (data: Partial<TenantProfile>) => {
    await dispatch(updateTenantProfileThunk(data));
    return true;
  };

  // Upload Aadhaar Card
  const uploadAadhaar = async (formData: FormData) => {
    try {
      const res = await dispatch(uploadTenantAadhaarThunk(formData)).unwrap();
      return {
        success: true,
        message: res.message,
        aadhaarDoc: res.aadhaarDoc,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err || "Failed to upload Aadhaar card",
      };
    }
  };

  return (
    <TenantContext.Provider
      value={{
        property: tenantState.property,
        activeRent: tenantState.activeRent,
        ledgerHistory: tenantState.ledgerHistory,
        paymentInstructions: tenantState.paymentInstructions,
        documents: tenantState.documents,
        complaints: tenantState.complaints,
        inspections: tenantState.inspections,
        roomChangeRequests: tenantState.roomChangeRequests,
        notifications: tenantState.notifications,
        profile: tenantState.profile,
        quickStats: tenantState.quickStats,
        isLoading: tenantState.isLoading,
        isRefreshing: tenantState.isRefreshing,
        refreshAll,
        payRent,
        raiseComplaint,
        addComplaintMessage,
        reopenComplaint,
        submitRoomChangeRequest,
        markNotificationRead,
        markAllNotificationsRead,
        updateProfile,
        uploadAadhaar,
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
