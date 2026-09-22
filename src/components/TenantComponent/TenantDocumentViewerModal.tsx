import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TenantDocument } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantDocumentViewerModalProps {
  visible: boolean;
  document: TenantDocument | null;
  onClose: () => void;
}

export const TenantDocumentViewerModal: React.FC<TenantDocumentViewerModalProps> = ({
  visible,
  document,
  onClose,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  if (!document) return null;

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `Delhi Property Exchange - Official Document\nTitle: ${document.title}\nDoc No: ${document.documentNumber}\nIssuer: ${document.issuer}\nStatus: ${document.status}`,
      });
    } catch {}
  };

  const handleDownload = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Alert.alert("Document Downloaded", `${document.title}.pdf has been saved to your downloads.`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: isDark ? colors.border : "#E2E8F0",
            },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? "#0C293D" : "#F0F9FF" }]}>
                <Ionicons name="document-text" size={20} color={isDark ? "#38BDF8" : "#0284C7"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]} numberOfLines={1}>
                  {document.title}
                </Text>
                <Text style={[styles.modalSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                  {document.category} • {document.fileSize}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={isDark ? colors.textMuted : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Document Preview Box */}
            <View
              style={[
                styles.previewBox,
                {
                  backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              <View style={styles.pdfMockHeader}>
                <Ionicons name="document" size={32} color="#EF4444" />
                <View style={styles.verifiedTag}>
                  <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                  <Text style={styles.verifiedTagText}>{document.status}</Text>
                </View>
              </View>

              <Text style={[styles.docHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                {document.title}
              </Text>
              <Text style={[styles.docIssuer, { color: isDark ? colors.textMuted : "#64748B" }]}>
                Issued by: {document.issuer}
              </Text>

              {/* Mock Page lines */}
              <View style={styles.pageLines}>
                <View style={[styles.pLine, { backgroundColor: isDark ? colors.border : "#E2E8F0", width: "90%" }]} />
                <View style={[styles.pLine, { backgroundColor: isDark ? colors.border : "#E2E8F0", width: "100%" }]} />
                <View style={[styles.pLine, { backgroundColor: isDark ? colors.border : "#E2E8F0", width: "75%" }]} />
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? colors.border : "#E2E8F0" }]} />

              {/* Metadata Details */}
              <View style={styles.metaList}>
                <View style={styles.metaRow}>
                  <Text style={[styles.mLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Document Number</Text>
                  <Text style={[styles.mVal, { color: isDark ? "#38BDF8" : "#0284C7" }]}>{document.documentNumber}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={[styles.mLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Issue Date</Text>
                  <Text style={[styles.mVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                    {new Date(document.issuedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </View>

                {document.validUntil && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.mLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Valid Through</Text>
                    <Text style={[styles.mVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                      {new Date(document.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.downloadBtn, { backgroundColor: isDark ? "#0284C7" : "#0284C7" }]}
                onPress={handleDownload}
                activeOpacity={0.8}
              >
                <Feather name="download" size={16} color="#FFFFFF" />
                <Text style={styles.downloadBtnText}>Download PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.shareBtn,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#CBD5E1",
                  },
                ]}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons name="share-social-outline" size={16} color={isDark ? "#38BDF8" : "#0284C7"} />
                <Text style={[styles.shareBtnText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: "90%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  modalSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  previewBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  pdfMockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#DCFCE7",
    gap: 4,
  },
  verifiedTagText: {
    color: "#16A34A",
    fontSize: 10.5,
    fontWeight: "900",
  },
  docHeading: {
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  docIssuer: {
    fontSize: 12,
    fontWeight: "600",
  },
  pageLines: {
    gap: 6,
    marginVertical: 4,
  },
  pLine: {
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: 1,
  },
  metaList: {
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  mVal: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  downloadBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    gap: 6,
  },
  downloadBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },
  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 13.5,
    fontWeight: "800",
  },
});
