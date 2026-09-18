import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../../constants/theme";
import apiClient from "../../../Redux/api/axiosInstance";

const { width } = Dimensions.get("window");

export default function VerificationHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useResponsiveTheme();

  const textPrimary = colors.textPrimary || (isDark ? "#FFFFFF" : "#0F172A");
  const textSecondary = colors.textSecondary || (isDark ? "#94A3B8" : "#475569");
  const borderCol = colors.border || (isDark ? "#334155" : "#E2E8F0");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [historyLeads, setHistoryLeads] = useState<any[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await apiClient.get("/leads/assigned-to-me?limit=50");
      if (res.data?.data?.leads) {
        const verified = res.data.data.leads.filter((l: any) =>
          ["verified", "rented", "sold"].includes(l.status) || l.isLocked
        );
        setHistoryLeads(verified);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      {/* Header Banner */}
      <LinearGradient
        colors={isDark ? ["#0F172A", "#061A23", "#042F2E"] : ["#0D9488", "#0F766E", "#115E59"]}
        style={[styles.header, { paddingTop: Math.max(insets.top + 10, 36) }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.badgeText}>PUBLISHED & VERIFIED ARCHIVE</Text>
            <Text style={styles.headerTitle}>Verification History</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{historyLeads.length}</Text>
          </View>
        </View>
        <Text style={styles.headerSub}>
          Live listings published to internal exchange (Locked & PII Masked)
        </Text>
      </LinearGradient>

      {/* Main List */}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom + 80, 110) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D9488" />}
      >
        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={{ color: textSecondary, marginTop: 10, fontSize: 13 }}>Loading verification archive...</Text>
          </View>
        ) : historyLeads.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Feather name="archive" size={48} color={textSecondary} />
            <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Published Listings Yet</Text>
            <Text style={[styles.emptySub, { color: textSecondary }]}>
              Properties you verify and publish will be permanently logged here with lock status and masked PII.
            </Text>
          </View>
        ) : (
          historyLeads.map((item) => {
            const photoUrl = item.coverPhoto || item.photos?.[0]?.url || item.images?.[0];
            const verifiedDate = item.verifiedAt || item.publishedAt || item.updatedAt;
            const dateStr = verifiedDate
              ? new Date(verifiedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
              : "Verified";

            return (
              <View
                key={item._id}
                style={[styles.historyCard, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: borderCol }]}
              >
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={styles.cardImage} resizeMode="cover" />
                ) : null}

                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <View style={styles.verifiedBadge}>
                          <Feather name="check" size={10} color="#10B981" />
                          <Text style={styles.verifiedText}>PUBLISHED & LIVE</Text>
                        </View>
                        <View style={styles.lockedBadge}>
                          <Feather name="lock" size={10} color="#F59E0B" />
                          <Text style={styles.lockedText}>LOCKED</Text>
                        </View>
                      </View>
                      <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={1}>
                        {item.title || `${item.propertyType} in ${item.locality}`}
                      </Text>
                    </View>
                    <Text style={styles.priceText}>₹{(item.expectedPrice || 0).toLocaleString("en-IN")}/mo</Text>
                  </View>

                  <View style={[styles.metaBox, { backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}>
                    <Text style={[styles.metaItem, { color: textSecondary }]}>📍 {item.address?.fullAddress || item.locality}</Text>
                    <Text style={[styles.metaItem, { color: textSecondary }]}>👤 Owner: {item.ownerName || "Owner"} (PII Masked)</Text>
                    <Text style={[styles.metaItem, { color: textSecondary }]}>📅 Published: {dateStr}</Text>
                  </View>

                  <View style={[styles.lockNoticeRow, { borderColor: borderCol }]}>
                    <Feather name="shield" size={13} color="#0D9488" />
                    <Text style={[styles.lockNoticeText, { color: textSecondary }]}>
                      Record locked. Contact info masked for field staff.
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  badgeText: {
    color: "#CCFBF1",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  headerSub: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 11,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  content: {
    padding: 16,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 260,
  },
  historyCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  cardImage: {
    width: "100%",
    height: 140,
  },
  cardBody: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B98115",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 3,
  },
  verifiedText: {
    color: "#10B981",
    fontSize: 9,
    fontWeight: "800",
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B15",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    gap: 3,
  },
  lockedText: {
    color: "#F59E0B",
    fontSize: 9,
    fontWeight: "800",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  priceText: {
    color: "#0D9488",
    fontSize: 15,
    fontWeight: "800",
  },
  metaBox: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    gap: 3,
  },
  metaItem: {
    fontSize: 11,
  },
  lockNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 0.5,
    gap: 6,
  },
  lockNoticeText: {
    fontSize: 10,
    flex: 1,
  },
});
