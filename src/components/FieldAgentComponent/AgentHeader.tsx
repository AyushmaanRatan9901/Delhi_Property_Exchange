import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AgentProfile } from "../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../constants/theme";

interface AgentHeaderProps {
  profile?: AgentProfile;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  onLanguageChange?: (langCode: string) => void;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "EN", name: "English", nativeName: "English" },
  { code: "HI", name: "Hindi", nativeName: "हिन्दी" },
];

export const AgentHeader: React.FC<AgentHeaderProps> = ({
  profile,
  onNotificationPress,
  onProfilePress,
  onLanguageChange,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useResponsiveTheme();

  const [isLangModalVisible, setIsLangModalVisible] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(
    LANGUAGES[0],
  );

  const handleSelectLanguage = (lang: LanguageOption) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    setSelectedLang(lang);
    setIsLangModalVisible(false);
    onLanguageChange?.(lang.code);
    Alert.alert(
      "Language Updated",
      `App interface language switched to ${lang.name} (${lang.nativeName}).`,
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
          borderBottomColor: isDark ? colors.border : "#F1F5F9",
          paddingTop: Math.max(insets.top, 10) + 8,
        },
      ]}
    >
      {/* Company Brand & Logo Section */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onProfilePress}
        style={styles.brandSection}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.brandTitleText,
                { color: isDark ? colors.textPrimary : "#0F172A" },
              ]}
              numberOfLines={1}
            >
              Delhi Property{" "}
              <Text style={styles.brandHighlightText}>Exchange</Text>
            </Text>
          </View>
          <View style={styles.subRow}>
            <View style={styles.badgePill}>
              <Ionicons name="shield-checkmark" size={10} color="#0D9488" />
              <Text style={styles.badgePillText}>Field Partner Portal</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Right Action Buttons: Language Button + Notification Bell */}
      <View style={styles.rightActionsRow}>
        {/* Language Selector Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            setIsLangModalVisible(true);
          }}
          style={[
            styles.langButton,
            {
              backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          <Ionicons
            name="language"
            size={16}
            color={isDark ? "#2DD4BF" : "#0D9488"}
          />
          <Text
            style={[
              styles.langCodeText,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
          >
            {selectedLang.code}
          </Text>
        </TouchableOpacity>

        {/* Notification Bell Button */}
        <TouchableOpacity
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            if (onNotificationPress) {
              onNotificationPress();
            } else {
              router.push("/FiledAgentPanel/notifications" as any);
            }
          }}
          style={[
            styles.notifButton,
            {
              backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
          activeOpacity={0.75}
        >
          <Feather
            name="bell"
            size={19}
            color={isDark ? colors.textPrimary : "#0F172A"}
          />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={isLangModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsLangModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={isDark ? "#2DD4BF" : "#0D9488"}
                  />
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: isDark ? colors.textPrimary : "#0F172A" },
                    ]}
                  >
                    Select Language / भाषा चुनें
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsLangModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <Feather
                    name="x"
                    size={18}
                    color={isDark ? colors.textMuted : "#64748B"}
                  />
                </TouchableOpacity>
              </View>

              {/* Languages List */}
              <View style={styles.langList}>
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLang.code === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      activeOpacity={0.75}
                      onPress={() => handleSelectLanguage(lang)}
                      style={[
                        styles.langItem,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? "rgba(13, 148, 136, 0.2)"
                              : "#F0FDFA"
                            : isDark
                              ? colors.surfaceLight
                              : "#F8FAFC",
                          borderColor: isSelected
                            ? "#0D9488"
                            : isDark
                              ? colors.border
                              : "#E2E8F0",
                        },
                      ]}
                    >
                      <View style={styles.langItemLeft}>
                        <View
                          style={[
                            styles.langBadge,
                            {
                              backgroundColor: isSelected
                                ? "#0D9488"
                                : isDark
                                  ? colors.cardBackground
                                  : "#E2E8F0",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.langBadgeText,
                              {
                                color: isSelected
                                  ? "#FFFFFF"
                                  : isDark
                                    ? colors.textPrimary
                                    : "#475569",
                              },
                            ]}
                          >
                            {lang.code}
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.langNameText,
                              {
                                color: isDark ? colors.textPrimary : "#0F172A",
                                fontWeight: isSelected ? "800" : "600",
                              },
                            ]}
                          >
                            {lang.name}
                          </Text>
                          <Text
                            style={[
                              styles.langNativeText,
                              { color: isDark ? colors.textMuted : "#64748B" },
                            ]}
                          >
                            {lang.nativeName}
                          </Text>
                        </View>
                      </View>

                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#0D9488"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  logoWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F0FDFA",
    borderWidth: 1.2,
    borderColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandTitleText: {
    fontSize: 15.5,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  brandHighlightText: {
    color: "#0D9488",
    fontWeight: "900",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    gap: 3,
    borderWidth: 0.8,
    borderColor: "#CCFBF1",
  },
  badgePillText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#0F766E",
    letterSpacing: 0.2,
  },
  rightActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.2,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  langCodeText: {
    fontSize: 11.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  notifButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 22,
    borderWidth: 1.2,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 15.5,
    fontWeight: "800",
  },
  closeBtn: {
    padding: 4,
  },
  langList: {
    gap: 10,
  },
  langItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  langItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  langBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  langNameText: {
    fontSize: 14,
  },
  langNativeText: {
    fontSize: 11.5,
    marginTop: 1,
  },
});
