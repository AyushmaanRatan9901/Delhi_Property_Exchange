import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, UserRole, User } from "./authTypes";
import {
  requestOtp,
  verifyOtp,
  fetchUserProfile,
  restoreSession,
  logout,
} from "./authActions";

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isSendingOtp: false,
  isVerifyingOtp: false,
  otpSent: false,
  identifier: "",
  selectedRole: "CUSTOMER",
  isNewUser: false,
  error: null,
  successMessage: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIdentifier: (state, action: PayloadAction<string>) => {
      state.identifier = action.payload;
    },
    setSelectedRole: (state, action: PayloadAction<UserRole>) => {
      state.selectedRole = action.payload;
    },
    resetOtpFlow: (state) => {
      state.otpSent = false;
      state.isSendingOtp = false;
      state.isVerifyingOtp = false;
      state.error = null;
      state.successMessage = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setUserData: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 1. requestOtp
    builder.addCase(requestOtp.pending, (state) => {
      state.isSendingOtp = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(requestOtp.fulfilled, (state, action) => {
      state.isSendingOtp = false;
      state.otpSent = true;
      state.identifier = action.payload.identifier;
      if (action.payload.role) {
        state.selectedRole = action.payload.role;
      }
      state.isNewUser = action.payload.isNewUser || false;
      state.successMessage = action.payload.message || "OTP sent successfully!";
    });
    builder.addCase(requestOtp.rejected, (state, action) => {
      state.isSendingOtp = false;
      state.otpSent = false;
      state.error = action.payload || "Failed to send OTP";
    });

    // 2. verifyOtp
    builder.addCase(verifyOtp.pending, (state) => {
      state.isVerifyingOtp = true;
      state.error = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.isVerifyingOtp = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.error = null;
      state.successMessage = "Authentication successful!";
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.isVerifyingOtp = false;
      state.error = action.payload || "Invalid OTP code";
    });

    // 3. fetchUserProfile
    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    // 4. restoreSession
    builder.addCase(restoreSession.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(restoreSession.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = action.payload.tokens;
      }
    });
    builder.addCase(restoreSession.rejected, (state) => {
      state.isLoading = false;
    });

    // 5. logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.identifier = "";
      state.error = null;
      state.successMessage = null;
    });
  },
});

export const {
  setIdentifier,
  setSelectedRole,
  resetOtpFlow,
  clearAuthError,
  setUserData,
} = authSlice.actions;

export default authSlice.reducer;
