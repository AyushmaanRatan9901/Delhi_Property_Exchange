import { Platform } from "react-native";

// Primary Backend API URL pointing to RentManagementBackend Express Server
export const API_BASE_URL = "http://192.168.1.22:5000/api/v1";

// Socket.io Server URL (strip /api/v1 prefix)
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

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
