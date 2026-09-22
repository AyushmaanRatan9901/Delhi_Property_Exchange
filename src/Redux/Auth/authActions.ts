import { createAsyncThunk } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "../api/apiConfig";
import apiClient from "../api/axiosInstance";
import appStorage from "../api/storage";
import {
  AuthTokens,
  SendOtpPayload,
  SendOtpResponseData,
  User,
  UserRole,
  VerifyOtpPayload,
  VerifyOtpResponseData,
} from "./authTypes";

/**
 * Normalizes backend role format (e.g. 'field_agent') to frontend UserRole ('FIELD_AGENT')
 */
export const normalizeBackendRole = (role?: string): UserRole => {
  if (!role) return "CUSTOMER";
  const r = role.toLowerCase();
  if (r === "super_admin") return "SUPER_ADMIN";
  if (r === "admin" || r === "sub_admin" || r === "admin_partner") return "ADMIN_PARTNER";
  if (r === "field_agent") return "FIELD_AGENT";
  if (r === "field_staff" || r === "verification_staff") return "VERIFICATION_STAFF";
  if (r === "broker") return "BROKER";
  if (r === "property_owner" || r === "owner") return "PROPERTY_OWNER";
  if (r === "tenant" || r === "client") return "TENANT";
  return "CUSTOMER";
};

/**
 * Normalizes user object returned by backend
 */
const normalizeUser = (backendUser: any): User => {
  const normalizedRole = normalizeBackendRole(backendUser.role);
  return {
    id: backendUser._id || backendUser.id || "",
    _id: backendUser._id,
    name: backendUser.name || "Member",
    email: backendUser.email || null,
    phone: backendUser.phone || null,
    role: normalizedRole,
    staffId: backendUser.staffId,
    recordCode: backendUser.staffId || (backendUser._id ? `REC-${backendUser._id.slice(-4)}` : undefined),
    avatar: backendUser.profilePhoto || backendUser.avatar,
    profilePhoto: backendUser.profilePhoto,
    createdAt: backendUser.createdAt,
    isActive: backendUser.isActive !== undefined ? backendUser.isActive : true,
    isVerified: backendUser.isVerified !== undefined ? backendUser.isVerified : true,
    commissionRate: backendUser.commissionRate,
    commissionWallet: backendUser.commissionWallet,
    bankDetails: backendUser.bankDetails,
    upiId: backendUser.upiId,
  };
};

/**
 * 1. Request OTP Action -> Calls backend /auth/send-otp or /auth/register
 */
export const requestOtp = createAsyncThunk<
  SendOtpResponseData,
  SendOtpPayload,
  { rejectValue: string }
>("auth/requestOtp", async (payload, { rejectWithValue }) => {
  try {
    const isEmail = payload.identifier.includes("@");
    const cleanIdentifier = payload.identifier.trim();

    // If new user registration is active with name provided, call /auth/register
    if (payload.name && payload.name.trim().length > 0 && !isEmail) {
      console.log("[Auth Action] 📝 Calling POST /auth/register for new user:", payload.name, cleanIdentifier);
      const registerRes = await apiClient.post("/auth/register", {
        name: payload.name.trim(),
        phone: cleanIdentifier,
        email: isEmail ? cleanIdentifier : undefined,
      });

      const resData = registerRes.data?.data || {};
      const devOtp = resData.otp;
      console.log("[Auth Action] ✅ Registration initiated. Staff ID:", resData.staffId, "Dev OTP:", devOtp);

      return {
        identifier: cleanIdentifier,
        role: payload.roleType || "FIELD_AGENT",
        name: payload.name.trim(),
        isNewUser: true,
        otp: devOtp,
        staffId: resData.staffId,
        message: devOtp
          ? `OTP is ${devOtp} (Dev Mode)`
          : (registerRes.data?.message || "OTP sent successfully!"),
      };
    }

    // Standard Login OTP -> POST /auth/send-otp
    console.log("[Auth Action] 🚀 Calling POST /auth/send-otp for:", cleanIdentifier);
    const response = await apiClient.post("/auth/send-otp", {
      identifier: cleanIdentifier,
    });

    const data = response.data?.data || {};
    const devOtp = data.otp;

    // Check if we have stored user info in appStorage for this identifier
    let detectedRole: UserRole | undefined = payload.roleType;
    let detectedName: string | undefined = payload.name;
    try {
      const storedUserJson = await appStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUserJson) {
        const storedUser = JSON.parse(storedUserJson);
        if (storedUser.phone === cleanIdentifier || storedUser.email === cleanIdentifier) {
          if (storedUser.role) detectedRole = normalizeBackendRole(storedUser.role);
          if (storedUser.name) detectedName = storedUser.name;
        }
      }
    } catch (e) {}

    return {
      identifier: cleanIdentifier,
      role: detectedRole || payload.roleType,
      name: detectedName || payload.name,
      isNewUser: false,
      otp: devOtp,
      message: devOtp
        ? `OTP is ${devOtp} (Dev Mode)`
        : (response.data?.message || "OTP sent successfully!"),
    };
  } catch (error: any) {
    console.log("[Auth Action] ❌ Request OTP Error:", error.message);
    return rejectWithValue(
      error.message || "Failed to send OTP. Please check your credentials."
    );
  }
});

/**
 * 2. Verify OTP Action -> Calls backend /auth/verify-otp or /auth/register/verify-otp
 */
export const verifyOtp = createAsyncThunk<
  VerifyOtpResponseData,
  VerifyOtpPayload,
  { rejectValue: string }
>("auth/verifyOtp", async (payload, { rejectWithValue }) => {
  try {
    const isEmail = payload.identifier.includes("@");
    const cleanIdentifier = payload.identifier.trim();
    const cleanOtp = payload.otp.trim();

    let response: any;

    // Try standard verify OTP first
    try {
      console.log("[Auth Action] 🔑 Verifying OTP via POST /auth/verify-otp:", cleanIdentifier, cleanOtp);
      response = await apiClient.post("/auth/verify-otp", {
        identifier: cleanIdentifier,
        otp: cleanOtp,
      });
    } catch (verifyErr: any) {
      // If error mentions unverified account or registration, try /auth/register/verify-otp
      if (
        !isEmail &&
        (verifyErr.message?.toLowerCase().includes("complete registration") ||
          verifyErr.message?.toLowerCase().includes("register") ||
          payload.isRegister)
      ) {
        console.log("[Auth Action] 🔄 Retrying verification via POST /auth/register/verify-otp:", cleanIdentifier);
        response = await apiClient.post("/auth/register/verify-otp", {
          phone: cleanIdentifier,
          otp: cleanOtp,
        });
      } else {
        throw verifyErr;
      }
    }

    const resData = response.data?.data || {};
    const backendUser = resData.user;
    const token = resData.token;

    if (!backendUser || !token) {
      throw new Error("Invalid response received from server");
    }

    const user = normalizeUser(backendUser);
    const tokens: AuthTokens = {
      accessToken: token,
      refreshToken: token,
    };

    console.log("==========================================");
    console.log("[Auth Action] ✅ Login Verified with Backend!");
    console.log("[Auth Action] User Name:", user.name);
    console.log("[Auth Action] Role:     ", user.role);
    console.log("[Auth Action] Staff ID: ", user.staffId || "N/A");
    console.log("==========================================");

    // Persist to local appStorage
    await appStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await appStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    await appStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    await appStorage.setItem(STORAGE_KEYS.SAVED_IDENTIFIER, cleanIdentifier);

    return { user, tokens };
  } catch (error: any) {
    console.log("[Auth Action] ❌ Verify OTP Error:", error.message);
    return rejectWithValue(
      error.message || "Invalid or Expired OTP! Please try again."
    );
  }
});

/**
 * 3. Fetch User Profile -> GET /auth/me
 */
export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/fetchUserProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get("/auth/me");
    const backendUser = response.data?.data;

    if (backendUser) {
      const user = normalizeUser(backendUser);
      await appStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    }
    throw new Error("Failed to load user profile");
  } catch (error: any) {
    return rejectWithValue(error.message || "Could not fetch user profile");
  }
});

/**
 * 4. Restore Session from appStorage on App Launch
 */
export const restoreSession = createAsyncThunk<
  { user: User; tokens: AuthTokens } | null,
  void,
  { rejectValue: string }
>("auth/restoreSession", async (_, { rejectWithValue }) => {
  try {
    const token = await appStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await appStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userJson = await appStorage.getItem(STORAGE_KEYS.USER_DATA);

    if (token) {
      let user: User | null = null;
      if (userJson) {
        try {
          const rawUser = JSON.parse(userJson);
          user = normalizeUser(rawUser);
        } catch (e) {}
      }

      // If user profile is not in storage, fetch from /auth/me
      if (!user) {
        try {
          const response = await apiClient.get("/auth/me");
          if (response.data?.data) {
            user = normalizeUser(response.data.data);
            await appStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
          }
        } catch (meErr) {}
      }

      if (user) {
        const tokens: AuthTokens = {
          accessToken: token,
          refreshToken: refreshToken || token,
        };
        return { user, tokens };
      }
    }
    return null;
  } catch (error: any) {
    return rejectWithValue("Failed to restore session");
  }
});

/**
 * 5. Logout Action
 */
export const logout = createAsyncThunk<void, void>("auth/logout", async () => {
  try {
    await appStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await appStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await appStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (e) {
    // Silently continue
  }
});
