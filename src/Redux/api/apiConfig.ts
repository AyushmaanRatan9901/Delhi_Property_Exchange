import { Platform } from "react-native";

// Primary API URL pointing to Express Server at 192.168.1.19:5000
export const API_BASE_URL = "http://192.168.1.21:5000/api/v1";

// Fallback for emulator / web development
export const LOCALHOST_API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api/v1"
    : "http://localhost:5000/api/v1";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@dpe_access_token",
  REFRESH_TOKEN: "@dpe_refresh_token",
  USER_DATA: "@dpe_user_data",
  SAVED_IDENTIFIER: "@dpe_saved_identifier",
};

export default {
  API_BASE_URL,
  LOCALHOST_API_URL,
  STORAGE_KEYS,
};
