import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "./index";

export type Language = "en" | "hi";

export const LANGUAGE_STORAGE_KEY = "app_language";

export const SUPPORTED_LANGUAGES: Array<{
  code: Language;
  name: string;
  nativeName: string;
}> = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
];

/**
 * Get stored language from AsyncStorage
 */
export async function getStoredLanguage(): Promise<Language | null> {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (lang === "en" || lang === "hi") {
      return lang;
    }
    return null;
  } catch (error) {
    console.warn("[i18n] Error reading stored language:", error);
    return null;
  }
}

/**
 * Persist selected language to AsyncStorage
 */
export async function setStoredLanguage(lang: Language): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.warn("[i18n] Error persisting language:", error);
  }
}

/**
 * Detect initial language using priority:
 * 1. Saved user preference
 * 2. Device language from expo-localization
 * 3. Default fallback: 'en'
 */
export async function detectInitialLanguage(): Promise<Language> {
  const stored = await getStoredLanguage();
  if (stored) return stored;

  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const primaryLangCode = locales[0].languageCode?.toLowerCase();
      if (primaryLangCode === "hi") {
        return "hi";
      }
    }
  } catch (error) {
    console.warn("[i18n] Error detecting device locale:", error);
  }

  return "en";
}

/**
 * Change app language dynamically and persist selection
 */
export async function changeLanguage(lang: Language): Promise<void> {
  try {
    await i18n.changeLanguage(lang);
    await setStoredLanguage(lang);
  } catch (error) {
    console.warn("[i18n] Error changing language:", error);
  }
}

/**
 * Initialize language setup at application startup
 */
export async function initializeLanguage(): Promise<Language> {
  const initialLang = await detectInitialLanguage();
  if (i18n.language !== initialLang) {
    await i18n.changeLanguage(initialLang);
  }
  return initialLang;
}
