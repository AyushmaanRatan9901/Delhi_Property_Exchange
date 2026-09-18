import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./Auth/authSlice";
import verificationStaffReducer from "./VerificationStaff/verificationStaffSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    verificationStaff: verificationStaffReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
