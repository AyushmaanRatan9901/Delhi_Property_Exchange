import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useResponsiveTheme } from "../../../constants/theme";

export default function BrokerSettingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, isDark, themeMode, setThemeMode } =
    useResponsiveTheme();

  // Settings Toggles
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [autoSettle, setAutoSettle] = useState(true);
  const [leadPushAlerts, setLeadPushAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [vacationMode, setVacationMode] = useState(false);

  const handleBack = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/BrokerPanel/(tabs)/profile" as any);
    }
  };

  const handleClearCache = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    Alert.alert(
      "Cache Cleared",
      "Temporary property images & cached data have been successfully freed (24.6 MB).",
    );
  };

  const handleDeactivate = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {}
    Alert.alert(
      "Deactivate Broker Account",
      "Are you sure you want to request account deactivation? Active property listings and pending commission payouts will require administrative review.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request Deactivation",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Request Submitted",
              "Our broker partner support team will contact you within 24 hours.",
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.safeArea,
        { backgroundColor: isDark ? "#090D14" : "#F8FAFC" },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#090D14" : "#F8FAFC"}
      />

      {/* Top Header */}
      <View style={styles.topNav}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={[
            styles.backBtn,
            {
              backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E2E8F0",
            },
          ]}
        >
          <Feather
            name="arrow-left"
            size={20}
            color={isDark ? "#F8FAFC" : "#0F172A"}
          />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text
            style={[
              styles.screenTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Settings & Controls
          </Text>
          <Text
            style={[
              styles.screenSubtitle,
              { color: isDark ? "#94A3B8" : "#64748B" },
            ]}
          >
            Preferences, Security & Payout Controls
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* SECTION 1: Account Security & Authentication */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Security & Authentication
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            <View style={styles.switchRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#ECFDF5" }]}
                >
                  <Ionicons name="finger-print" size={20} color="#059669" />
                </View>
                <View style={styles.textWrap}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Biometric & Face ID Login
                  </Text>
                  <Text style={styles.rowSub}>Fast and secure app unlock</Text>
                </View>
              </View>
              <Switch
                value={biometricLogin}
                onValueChange={(val) => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setBiometricLogin(val);
                }}
                trackColor={{
                  false: "#CBD5E1",
                  true: colors.primary || "#0D9488",
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
              ]}
            />

            <View style={styles.switchRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}
                >
                  <Ionicons name="shield-checkmark" size={20} color="#2563EB" />
                </View>
                <View style={styles.textWrap}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Two-Factor Authentication (2FA)
                  </Text>
                  <Text style={styles.rowSub}>
                    Require OTP verification for commission payouts
                  </Text>
                </View>
              </View>
              <Switch
                value={twoFactorAuth}
                onValueChange={(val) => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setTwoFactorAuth(val);
                }}
                trackColor={{
                  false: "#CBD5E1",
                  true: colors.primary || "#0D9488",
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* SECTION 2: Payout & Commission Automation */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Commission & Payout Automation
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            <View style={styles.switchRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#F0FDF4" }]}
                >
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={20}
                    color="#16A34A"
                  />
                </View>
                <View style={styles.textWrap}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Instant Auto-Settlement
                  </Text>
                  <Text style={styles.rowSub}>
                    Auto-transfer verified commission to bank
                  </Text>
                </View>
              </View>
              <Switch
                value={autoSettle}
                onValueChange={(val) => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setAutoSettle(val);
                }}
                trackColor={{
                  false: "#CBD5E1",
                  true: colors.primary || "#0D9488",
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View
              style={[
                styles.divider,
                { backgroundColor: isDark ? "#334155" : "#F1F5F9" },
              ]}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push("/BrokerPanel/(tabs)/money" as any)}
              style={styles.actionRow}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#CCFBF1" }]}
                >
                  <MaterialCommunityIcons
                    name="bank-outline"
                    size={20}
                    color="#0F766E"
                  />
                </View>
                <View style={styles.textWrap}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Linked Settlement Accounts
                  </Text>
                  <Text style={styles.rowSub}>
                    HDFC Bank (•••• 4821) • Primary Account
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 3: Lead & Vacation Controls */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            Lead Flow & Availability
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            <View style={styles.switchRow}>
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#FEF3C7" }]}
                >
                  <Ionicons name="airplane-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.textWrap}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Vacation Mode
                  </Text>
                  <Text style={styles.rowSub}>
                    Temporarily pause new tenant visit assignments
                  </Text>
                </View>
              </View>
              <Switch
                value={vacationMode}
                onValueChange={(val) => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setVacationMode(val);
                }}
                trackColor={{ false: "#CBD5E1", true: "#D97706" }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* SECTION 4: Storage & Maintenance */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#F8FAFC" : "#0F172A" },
            ]}
          >
            App Maintenance
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#334155" : "#E2E8F0",
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClearCache}
              style={styles.actionRow}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#F1F5F9" }]}
                >
                  <Ionicons name="trash-outline" size={20} color="#64748B" />
                </View>
                <View style={styles.textWrap}>
                  <Text
                    style={[
                      styles.rowTitle,
                      { color: isDark ? "#F8FAFC" : "#0F172A" },
                    ]}
                  >
                    Clear Media & Cache
                  </Text>
                  <Text style={styles.rowSub}>
                    Free up local device memory (24.6 MB)
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 5: Danger Zone */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: "#DC2626" }]}>
            Danger Zone
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderColor: isDark ? "#7F1D1D" : "#FECACA",
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleDeactivate}
              style={styles.actionRow}
            >
              <View style={styles.rowLeft}>
                <View
                  style={[styles.iconCircle, { backgroundColor: "#FEF2F2" }]}
                >
                  <Ionicons name="warning-outline" size={20} color="#DC2626" />
                </View>
                <View style={styles.textWrap}>
                  <Text style={[styles.rowTitle, { color: "#DC2626" }]}>
                    Deactivate Broker Account
                  </Text>
                  <Text style={styles.rowSub}>
                    Close partner profile & delist managed stays
                  </Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color="#DC2626" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  screenSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  sectionContainer: {
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  rowSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: 14,
  },
});
