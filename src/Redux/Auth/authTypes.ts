export type UserRole =
  | "SUPER_ADMIN"
  | "SUB_ADMIN"
  | "PROPERTY_OWNER"
  | "FIELD_AGENT"
  | "CUSTOMER"
  | "TENANT"
  | "VERIFICATION_STAFF"
  | "ADMIN_PARTNER"
  | "BROKER";

export interface User {
  id: string;
  _id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  staffId?: string;
  recordCode?: string;
  avatar?: string;
  profilePhoto?: string;
  createdAt?: string;
  isActive?: boolean;
  isVerified?: boolean;
  commissionRate?: number;
  commissionWallet?: {
    balance: number;
    pendingBalance: number;
  };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  upiId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SendOtpPayload {
  identifier: string;
  roleType?: UserRole;
  name?: string;
  isRegister?: boolean;
}

export interface SendOtpResponseData {
  identifier: string;
  role?: UserRole;
  name?: string;
  isNewUser?: boolean;
  message?: string;
  otp?: string;
  staffId?: string;
}

export interface VerifyOtpPayload {
  identifier: string;
  otp: string;
  isRegister?: boolean;
}

export interface VerifyOtpResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  otpSent: boolean;
  identifier: string;
  selectedRole: UserRole;
  isNewUser: boolean;
  error: string | null;
  successMessage: string | null;
}
