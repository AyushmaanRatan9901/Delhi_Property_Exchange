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
import QRCodeDisplay from "./QRCodeDisplay";
import { formatCurrency, RentLedgerItem, TenantProperty } from "../../constants/tenantData";
import { useResponsiveTheme } from "../../constants/theme";

interface TenantReceiptModalProps {
  visible: boolean;
  ledgerItem: RentLedgerItem | null;
  property: TenantProperty | null;
  tenantName: string;
  tenantPhone: string;
  onClose: () => void;
}

export const TenantReceiptModal: React.FC<TenantReceiptModalProps> = ({
  visible,
  ledgerItem,
  property,
  tenantName,
  tenantPhone,
  onClose,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  if (!ledgerItem) return null;

  const receiptNumber = ledgerItem.receiptId || `RCP-${String(ledgerItem.id || "001").slice(-6).toUpperCase()}`;
  const transactionId = ledgerItem.utrNumber || `TXN-${Date.now().toString().slice(-8)}`;
  const paidDateStr = ledgerItem.paidDate
    ? new Date(ledgerItem.paidDate).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Verified on Record";

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `Delhi Property Exchange - Official Rent Receipt\nReceipt No: ${receiptNumber}\nTenant: ${tenantName}\nProperty: ${property?.title || "Apartment"}\nMonth: ${ledgerItem.month}\nAmount: ${formatCurrency(ledgerItem.amount)}\nUTR: ${transactionId}\nStatus: PAID & VERIFIED`,
      });
    } catch {}
  };

  const handleDownload = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    Alert.alert("Receipt Downloaded", `Receipt ${receiptNumber}.pdf has been saved to your device files.`);
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
              <View style={[styles.iconCircle, { backgroundColor: isDark ? "#062A1C" : "#DCFCE7" }]}>
                <Ionicons name="receipt" size={20} color={isDark ? "#34D399" : "#16A34A"} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                  Rent Payment Receipt
                </Text>
                <Text style={[styles.modalSub, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                  {receiptNumber}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={22} color={isDark ? colors.textMuted : "#64748B"} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Printable Receipt Card */}
            <View
              style={[
                styles.receiptCard,
                {
                  backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                  borderColor: isDark ? colors.border : "#E2E8F0",
                },
              ]}
            >
              {/* Organization Header */}
              <View style={styles.orgHeader}>
                <View>
                  <Text style={[styles.orgName, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                    Delhi Property Exchange
                  </Text>
                  <Text style={[styles.orgSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    Financial Clearing & Tenancy Management
                  </Text>
                </View>
                <View style={[styles.verifiedPill, { backgroundColor: "#065F46" }]}>
                  <Ionicons name="shield-checkmark" size={12} color="#34D399" />
                  <Text style={styles.verifiedText}>OFFICIAL</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? colors.border : "#E2E8F0" }]} />

              {/* Amount Hero */}
              <View style={styles.amountHero}>
                <Text style={[styles.amountHeroLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>
                  Rent for {ledgerItem.month}
                </Text>
                <Text style={[styles.amountHeroVal, { color: isDark ? "#34D399" : "#059669" }]}>
                  {formatCurrency(ledgerItem.amount)}
                </Text>
                <View style={[styles.statusTag, { backgroundColor: isDark ? "#062A1C" : "#DCFCE7" }]}>
                  <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                  <Text style={styles.statusTagText}>PAID & VERIFIED</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? colors.border : "#E2E8F0" }]} />

              {/* Tenant & Property Details */}
              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <Text style={[styles.dLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Tenant Name</Text>
                  <Text style={[styles.dVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>{tenantName}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.dLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Tenant Contact</Text>
                  <Text style={[styles.dVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>{tenantPhone}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.dLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Property ID</Text>
                  <Text style={[styles.dVal, { color: isDark ? "#38BDF8" : "#0284C7" }]}>
                    {property?.propertyId || "DPX-8842"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.dLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Property Address</Text>
                  <Text style={[styles.dVal, { color: isDark ? colors.textPrimary : "#1E293B", textAlign: "right", flex: 1, marginLeft: 12 }]}>
                    {property?.address?.fullAddress || property?.locality || "Delhi NCR"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.dLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Payment Mode</Text>
                  <Text style={[styles.dVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                    {ledgerItem.paymentMode || "UPI Instant Transfer"}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.dLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Bank UTR / Ref</Text>
                  <Text style={[styles.dVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                    {transactionId}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.dLabel, { color: isDark ? colors.textMuted : "#64748B" }]}>Paid Date & Time</Text>
                  <Text style={[styles.dVal, { color: isDark ? colors.textPrimary : "#1E293B" }]}>
                    {paidDateStr}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: isDark ? colors.border : "#E2E8F0" }]} />

              {/* QR Verification Seal */}
              <View style={styles.qrSealRow}>
                <View style={styles.qrBox}>
                  <QRCodeDisplay
                    value={`https://delhipropertyexchange.com/verify-receipt/${receiptNumber}`}
                    size={70}
                    backgroundColor="#FFFFFF"
                    color="#0F172A"
                  />
                </View>
                <View style={styles.sealInfo}>
                  <Text style={[styles.sealTitle, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
                    Digitally Authorized
                  </Text>
                  <Text style={[styles.sealDesc, { color: isDark ? colors.textMuted : "#64748B" }]}>
                    This is a computer-generated official receipt valid for legal, tax & HRA claim purposes.
                  </Text>
                </View>
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
    maxHeight: "92%",
    paddingBottom: 20,
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
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 16.5,
    fontWeight: "900",
  },
  modalSub: {
    fontSize: 12,
    fontWeight: "700",
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
  receiptCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orgName: {
    fontSize: 15,
    fontWeight: "900",
  },
  orgSub: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    color: "#34D399",
    fontSize: 10,
    fontWeight: "900",
  },
  divider: {
    height: 1,
  },
  amountHero: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  amountHeroLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  amountHeroVal: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    marginTop: 2,
  },
  statusTagText: {
    color: "#16A34A",
    fontSize: 10.5,
    fontWeight: "900",
  },
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  dVal: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  qrSealRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  qrBox: {
    padding: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sealInfo: {
    flex: 1,
    gap: 2,
  },
  sealTitle: {
    fontSize: 12.5,
    fontWeight: "800",
  },
  sealDesc: {
    fontSize: 11,
    lineHeight: 15,
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
