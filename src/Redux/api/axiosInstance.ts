import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import appStorage from "./storage";
import { API_BASE_URL, STORAGE_KEYS } from "./apiConfig";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach Access Token if present
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await appStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Silently continue
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error messages cleanly
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response) {
      // Backend returned an error response
      const errorMessage =
        error.response.data?.message ||
        (Array.isArray(error.response.data?.errors)
          ? error.response.data.errors.join(", ")
          : "Server error occurred");
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      // Network failure or backend unreachable
      return Promise.reject(
        new Error(
          "Network Error: Unable to connect to server at 192.168.1.19:5000. Please ensure server is running and Wi-Fi is connected."
        )
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
