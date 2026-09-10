import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// In-memory fallback map for web / dev-reload when native storage module isn't loaded
const memoryStorage = new Map<string, string>();

export const appStorage = {
  getItem: async (key: string): Promise<string | null> => {
    // 1. Web browser LocalStorage
    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const webVal = window.localStorage.getItem(key);
          if (webVal !== null) return webVal;
        }
      } catch (e) {}
      return memoryStorage.get(key) || null;
    }

    // 2. Native AsyncStorage
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === "function") {
        const value = await AsyncStorage.getItem(key);
        if (value !== null && value !== undefined) {
          memoryStorage.set(key, value);
          return value;
        }
      }
    } catch (e: any) {
      console.warn("[appStorage] Native getItem warning:", e?.message);
    }

    return memoryStorage.get(key) || null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    memoryStorage.set(key, value);

    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (e) {}
      return;
    }

    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === "function") {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e: any) {
      console.warn("[appStorage] Native setItem warning:", e?.message);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    memoryStorage.delete(key);

    if (Platform.OS === "web") {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (e) {}
      return;
    }

    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === "function") {
        await AsyncStorage.removeItem(key);
      }
    } catch (e: any) {
      console.warn("[appStorage] Native removeItem warning:", e?.message);
    }
  },
};

export default appStorage;
