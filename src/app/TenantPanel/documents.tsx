import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useResponsiveTheme } from "../../constants/theme";
import { useTenant, TenantDocument } from "../../constants/tenantData";
import { TenantDocumentViewerModal } from "../../components/TenantComponent/TenantDocumentViewerModal";
import { TenantDocumentsSkeleton } from "../../components/TenantComponent/TenantSkeleton";

export default function TenantDocumentsScreen() {
  const { colors, isDark } = useResponsiveTheme();
  const router = useRouter();
  const { documents, refreshAll, isLoading, isRefreshing } = useTenant();

  const [selectedDoc, setSelectedDoc] = useState<TenantDocument | null>(null);

  const getDocIconAndColor = (type: string) => {
    switch (type) {
      case "RENT_AGREEMENT":
        return { icon: "document-text", color: "#6366F1", bg: "#EEF2FF" };
      case "POLICE_VERIFICATION":
        return { icon: "shield-checkmark", color: "#10B981", bg: "#ECFDF5" };
      case "KYC_PROOF":
        return { icon: "id-card", color: "#F59E0B", bg: "#FEF3C7" };
      default:
        return { icon: "clipboard", color: "#8B5CF6", bg: "#F3E8FF" };
    }
  };

  const handleShare = async (title: string, url: string) => {
    try {
      await Share.share({
        message: `Delhi Property Exchange Document: ${title}\nSecure Link: ${url}`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  if (isLoading) {
    return <TenantDocumentsSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : "#F8FAFC" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF" }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: isDark ? colors.background : "#F1F5F9" }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? colors.textPrimary : "#0F172A"} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            Tenancy Documents & KYC
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? colors.textMuted : "#64748B" }]}>
            Digitally verified agreements and records
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Verification Summary Banner */}
        <View style={[styles.verifiedBanner, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
          <Ionicons name="shield-checkmark" size={28} color="#059669" />
          <View style={{ flex: 1 }}>
            <Text style={styles.verifiedTitle}>All KYC Documents Verified</Text>
            <Text style={styles.verifiedDesc}>
              Your tenancy agreement and government identity verification are digitally secured and verified by Delhi Property Exchange.
            </Text>
          </View>
        </View>

        {/* Documents List */}
        <Text style={[styles.sectionTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
          Available Records ({documents.length})
        </Text>

        {documents.length === 0 ? (
          <View
            style={[
              styles.docCard,
              {
                backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
                borderColor: isDark ? colors.border : "#E2E8F0",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 32,
                gap: 8,
              },
            ]}
          >
            <Ionicons name="document-text-outline" size={40} color={isDark ? colors.textMuted : "#94A3B8"} />
            <Text style={[styles.docTitle, { color: isDark ? colors.textPrimary : "#0F172A", textAlign: "center" }]}>
              No Documents Available
            </Text>
            <Text style={[styles.docMeta, { color: isDark ? colors.textMuted : "#64748B", textAlign: "center", maxWidth: 260 }]}>
              Your tenancy agreements, KYC certificates, and police verification will appear here once issued.
            </Text>
          </View>
        ) : (
          documents.map((doc: TenantDocument) => {
          const meta = getDocIconAndColor(doc.type);
          return (
            <TouchableOpacity
              key={doc.id}
              style={[
                styles.docCard,
                { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF", borderColor: isDark ? colors.border : "#E2E8F0" },
              ]}
              onPress={() => setSelectedDoc(doc)}
              activeOpacity={0.7}
            >
              <View style={[styles.docIcon, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon as any} size={22} color={meta.color} />
              </View>

              <View style={styles.docInfo}>
                <View style={styles.docTitleRow}>
                  <Text style={[styles.docTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]} numberOfLines={1}>
                    {doc.title}
                  </Text>
                </View>
                <Text style={[styles.docMeta, { color: isDark ? colors.textMuted : "#64748B" }]}>
                  {doc.category} • {doc.fileSize}
                </Text>
                <View style={styles.docFooterRow}>
                  <Text style={[styles.docDate, { color: isDark ? colors.textMuted : "#94A3B8" }]}>
                    Issued: {new Date(doc.issuedDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                  {doc.status === "VERIFIED" && (
                    <View style={styles.verifiedTag}>
                      <Ionicons name="checkmark-circle" size={12} color="#059669" />
                      <Text style={styles.verifiedTagText}>VERIFIED</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.docActions}>
                <TouchableOpacity
                  style={[styles.iconActionBtn, { backgroundColor: isDark ? colors.background : "#F1F5F9" }]}
                  onPress={() => handleShare(doc.title, doc.fileUrl)}
                >
                  <Ionicons name="share-social-outline" size={16} color={isDark ? colors.textPrimary : "#475569"} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconActionBtn, { backgroundColor: "rgba(99, 102, 241, 0.1)" }]}
                  onPress={() => setSelectedDoc(doc)}
                >
                  <Ionicons name="eye-outline" size={16} color="#6366F1" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }))}
      </ScrollView>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <TenantDocumentViewerModal
          visible={!!selectedDoc}
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  verifiedBanner: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: "center",
  },
  verifiedTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#065F46",
    marginBottom: 2,
  },
  verifiedDesc: {
    fontSize: 12,
    color: "#047857",
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  docCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  docIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  docInfo: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  docMeta: {
    fontSize: 12,
    marginBottom: 6,
  },
  docFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  docDate: {
    fontSize: 11,
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 3,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#15803D",
  },
  docActions: {
    flexDirection: "column",
    gap: 6,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
