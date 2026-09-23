import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { TenantDocumentViewerModal } from "../../../components/TenantComponent/TenantDocumentViewerModal";
import { TenantNotificationsPreview } from "../../../components/TenantComponent/TenantNotificationsPreview";
import { TenantPaymentModal } from "../../../components/TenantComponent/TenantPaymentModal";
import { TenantPropertyCard } from "../../../components/TenantComponent/TenantPropertyCard";
import { TenantRentSummaryCard } from "../../../components/TenantComponent/TenantRentSummaryCard";
import { TenantQuickActionsGrid } from "../../../components/TenantComponent/TenantQuickActionsGrid";
import { TenantRaiseComplaintModal } from "../../../components/TenantComponent/TenantRaiseComplaintModal";
import { TenantReceiptModal } from "../../../components/TenantComponent/TenantReceiptModal";
import { TenantRoomChangeModal } from "../../../components/TenantComponent/TenantRoomChangeModal";
import { TenantHomeSkeleton } from "../../../components/TenantComponent/TenantSkeleton";
import {
  RentLedgerItem,
  TenantDocument,
  useTenant,
} from "../../../constants/tenantData";
import { useResponsiveTheme } from "../../../constants/theme";

export default function TenantHomeScreen() {
  const { isDark, colors } = useResponsiveTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    property,
    activeRent,
    paymentInstructions,
    documents,
    notifications,
    profile,
    quickStats,
    isLoading,
    isRefreshing,
    refreshAll,
    payRent,
    raiseComplaint,
    submitRoomChangeRequest,
  } = useTenant();

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [selectedReceiptItem, setSelectedReceiptItem] = useState<RentLedgerItem | null>(null);
  const [showComplaintModal, setShowComplaintModal] = useState<boolean>(false);
  const [showRoomChangeModal, setShowRoomChangeModal] = useState<boolean>(false);
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [selectedDoc, setSelectedDoc] = useState<TenantDocument | null>(null);

  const handleRefresh = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await refreshAll();
  };

  const handlePaySuccess = (res: { month: string; amount: number; paymentMode: string; utrNumber: string; receiptId: string }) => {
    payRent({
      month: res.month,
      amount: res.amount,
      paymentMode: res.paymentMode,
      utrNumber: res.utrNumber,
    });
  };

  const handleOpenReceipt = () => {
    if (activeRent && activeRent.status === "PAID") {
      setSelectedReceiptItem({
        id: activeRent.ledgerId || "LED-ACTIVE",
        month: activeRent.month,
        amount: activeRent.amount,
        dueDate: activeRent.dueDate,
        paidDate: activeRent.paidDate || new Date(),
        status: "PAID",
        paymentMode: activeRent.paymentMode || "UPI",
        utrNumber: activeRent.utrNumber,
        receiptId: `RCP-${activeRent.month.replace(/\s/g, "")}`,
      });
      setShowReceiptModal(true);
    } else {
      router.push("/TenantPanel/(tabs)/Rent" as any);
    }
  };

  if (isLoading) {
    return <TenantHomeSkeleton />;
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: isDark ? colors.background : "#F8FAFC",
          paddingTop: insets.top > 0 ? 0 : 10,
        },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top App Header */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#E2E8F0",
          },
        ]}
      >
        <View style={styles.profileMeta}>
          <TouchableOpacity
            onPress={() => router.push("/TenantPanel/(tabs)/Profile" as any)}
            activeOpacity={0.8}
            style={styles.avatarWrapper}
          >
            <Image
              source={{
                uri: profile?.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
              }}
              style={styles.avatar}
            />
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.nameBox}>
            <Text style={[styles.welcomeSub, { color: isDark ? colors.textMuted : "#64748B" }]}>
              Welcome home,
            </Text>
            <Text style={[styles.tenantName, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
              {profile?.name || "Resident"}
            </Text>
          </View>
        </View>

        {/* Right Action Icons */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[
              styles.headerIconBtn,
              {
                backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
                borderColor: isDark ? colors.border : "#E2E8F0",
              },
            ]}
            onPress={() => router.push("/TenantPanel/notifications" as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={isDark ? colors.textPrimary : "#0F172A"}
            />
            {quickStats.unreadNotificationsCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{quickStats.unreadNotificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#0284C7"]}
            tintColor={isDark ? "#38BDF8" : "#0284C7"}
          />
        }
      >
        {/* 1. Rent Summary Hero Card */}
        <TenantRentSummaryCard
          activeRent={activeRent}
          onPressPay={() => setShowPaymentModal(true)}
          onPressQR={() => setShowPaymentModal(true)}
          onPressHistory={handleOpenReceipt}
        />

        {/* 2. Quick Actions Grid */}
        <TenantQuickActionsGrid
          onPayRent={() => setShowPaymentModal(true)}
          onViewProperty={() => router.push("/TenantPanel/(tabs)/Property" as any)}
          onRaiseComplaint={() => setShowComplaintModal(true)}
          onRoomChange={() => setShowRoomChangeModal(true)}
          onViewDocuments={() => router.push("/TenantPanel/documents" as any)}
          onViewInspections={() => router.push("/TenantPanel/inspections" as any)}
          onViewNotifications={() => router.push("/TenantPanel/notifications" as any)}
          unreadNotificationsCount={quickStats.unreadNotificationsCount}
          openComplaintsCount={quickStats.openComplaintsCount}
          upcomingInspectionsCount={quickStats.upcomingInspectionsCount}
        />

        {/* 3. Current Property Card */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeading, { color: isDark ? colors.textPrimary : "#0F172A" }]}>
            My Residence
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/TenantPanel/(tabs)/Property" as any)}
            activeOpacity={0.7}
          >
            <Text style={[styles.seeAllText, { color: isDark ? "#38BDF8" : "#0284C7" }]}>Details</Text>
          </TouchableOpacity>
        </View>
        <TenantPropertyCard
          property={property}
          onPressDetails={() => router.push("/TenantPanel/(tabs)/Property" as any)}
          onPressDocuments={() => {
            if (documents && documents[0]) {
              setSelectedDoc(documents[0]);
              setShowDocModal(true);
            } else {
              router.push("/TenantPanel/documents" as any);
            }
          }}
        />

        {/* 4. Recent Notifications Ticker */}
        <TenantNotificationsPreview
          notifications={notifications}
          onViewAll={() => router.push("/TenantPanel/notifications" as any)}
          onNotificationPress={() => router.push("/TenantPanel/notifications" as any)}
        />
      </ScrollView>

      {/* Payment Flow Modal */}
      <TenantPaymentModal
        visible={showPaymentModal}
        month={activeRent?.month || "Current Month"}
        amount={activeRent?.amount || 18500}
        instructions={paymentInstructions}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaySuccess}
      />

      {/* Digital Receipt Modal */}
      <TenantReceiptModal
        visible={showReceiptModal}
        ledgerItem={selectedReceiptItem}
        property={property}
        tenantName={profile.name}
        tenantPhone={profile.phone}
        onClose={() => setShowReceiptModal(false)}
      />

      {/* Raise Complaint Modal */}
      <TenantRaiseComplaintModal
        visible={showComplaintModal}
        onClose={() => setShowComplaintModal(false)}
        onSubmit={raiseComplaint}
      />

      {/* Room Change Request Modal */}
      <TenantRoomChangeModal
        visible={showRoomChangeModal}
        onClose={() => setShowRoomChangeModal(false)}
        onSubmit={submitRoomChangeRequest}
      />

      {/* Document Viewer Modal */}
      <TenantDocumentViewerModal
        visible={showDocModal}
        document={selectedDoc}
        onClose={() => setShowDocModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  profileMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#0284C7",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  nameBox: {
    gap: 1,
  },
  welcomeSub: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  tenantName: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadgeText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "900",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 110,
    gap: 4,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
