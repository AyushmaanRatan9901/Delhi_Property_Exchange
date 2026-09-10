import { createAsyncThunk } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "../api/apiConfig";
import apiClient from "../api/axiosInstance";
import appStorage from "../api/storage";
import {
  AuthTokens,
  SendOtpPayload,
  SendOtpResponseData,
  User,
  VerifyOtpPayload,
  VerifyOtpResponseData,
} from "./authTypes";

/**
 * 1. Request OTP Action -> POST /auth/send-otp
 */
export const requestOtp = createAsyncThunk<
  SendOtpResponseData,
  SendOtpPayload,
  { rejectValue: string }
>("auth/requestOtp", async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/auth/send-otp", payload);
    const data = response.data?.data || {};
    return {
      identifier: payload.identifier,
      role: data.role || payload.roleType,
      name: data.name || payload.name,
      isNewUser: data.isNewUser || false,
      message: response.data?.message || "OTP sent successfully!",
    };
  } catch (error: any) {
    return rejectWithValue(
      error.message || "Failed to send OTP. Please check your credentials.",
    );
  }
});

/**
 * 2. Verify OTP Action -> POST /auth/verify-otp
 */
export const verifyOtp = createAsyncThunk<
  VerifyOtpResponseData,
  VerifyOtpPayload,
  { rejectValue: string }
>("auth/verifyOtp", async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post("/auth/verify-otp", payload);
    const result: VerifyOtpResponseData = response.data?.data;

    if (!result || !result.tokens?.accessToken) {
      throw new Error("Invalid response received from server");
    }

    console.log("==========================================");
    console.log("[Auth Action] ✅ Login Verified Successfully!");
    console.log("[Auth Action] User Data:", JSON.stringify(result.user, null, 2));
    console.log(
      "[Auth Action] Access Token:",
      result.tokens.accessToken
        ? `${result.tokens.accessToken.substring(0, 25)}...`
        : "None"
    );
    console.log("==========================================");

    // Persist session to appStorage
    await appStorage.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      result.tokens.accessToken,
    );
    await appStorage.setItem(
      STORAGE_KEYS.REFRESH_TOKEN,
      result.tokens.refreshToken || "",
    );
    await appStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(result.user),
    );
    await appStorage.setItem(STORAGE_KEYS.SAVED_IDENTIFIER, payload.identifier);

    return result;
  } catch (error: any) {
    return rejectWithValue(
      error.message || "Invalid or Expired OTP! Please try again.",
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

    const user = response.data?.data;
    console.log("USER DATA:", user);

    if (user) {
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

    if (token && userJson) {
      const user: User = JSON.parse(userJson);
      const tokens: AuthTokens = {
        accessToken: token,
        refreshToken: refreshToken || "",
      };
      return { user, tokens };
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
