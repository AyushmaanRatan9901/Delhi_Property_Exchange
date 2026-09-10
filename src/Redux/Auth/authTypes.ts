export type UserRole =
  | "SUPER_ADMIN"
  | "SUB_ADMIN"
  | "PROPERTY_OWNER"
  | "FIELD_AGENT"
  | "CUSTOMER"
  | "VERIFICATION_STAFF"
  | "ADMIN_PARTNER"
  | "BROKER";

export interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  subAdminModules?: string[];
  canViewUnmaskedPII?: boolean;
  recordCode?: string;
  avatar?: string;
  createdAt?: string;
  isActive?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SendOtpPayload {
  identifier: string;
  roleType?: UserRole;
  name?: string;
}

export interface SendOtpResponseData {
  identifier: string;
  role?: UserRole;
  name?: string;
  isNewUser?: boolean;
  message?: string;
}

export interface VerifyOtpPayload {
  identifier: string;
  otp: string;
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
