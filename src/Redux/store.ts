import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Auth/authSlice";
import verificationStaffReducer from "./VerificationStaff/verificationStaffSlice";
import superAdminNotificationReducer from "./SuperAdmin/superAdminNotificationSlice";
import tenantReducer from "./Tenant/tenantSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    verificationStaff: verificationStaffReducer,
    superAdminNotifications: superAdminNotificationReducer,
    tenant: tenantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
