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

// Response Interceptor: Format error messages cleanly from ApiResponse / ApiError
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response) {
      const errorMessage =
        error.response.data?.message ||
        (Array.isArray(error.response.data?.errors)
          ? error.response.data.errors.map((err: any) => err.msg || err).join(", ")
          : "Server error occurred");
      return Promise.reject(new Error(errorMessage));
    } else if (error.request) {
      return Promise.reject(
        new Error(
          "Network Error: Unable to connect to server at 192.168.1.16:5000. Please ensure the backend is running."
        )
      );
    }
    return Promise.reject(error);
  }
);

export default apiClient;
