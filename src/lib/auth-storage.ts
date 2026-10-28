import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Production-ready Auth Storage Adapter:
 * - Uses hardware-backed Keychain/Keystore (expo-secure-store) on iOS & Android.
 * - Safely falls back to AsyncStorage on Web.
 * Complies with CivicLens PRD Security §2 (FR-SEC-004).
 */
export const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.warn(`[AuthStorage] Failed to read ${key}:`, e);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.warn(`[AuthStorage] Failed to store ${key}:`, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      console.warn(`[AuthStorage] Failed to remove ${key}:`, e);
    }
  },
};

