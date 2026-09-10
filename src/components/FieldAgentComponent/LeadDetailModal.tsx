import { Feather, Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { formatCurrency, LeadItem } from "../../constants/fieldAgentData";

interface LeadDetailModalProps {
  lead: LeadItem | null;
  visible: boolean;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  visible,
  onClose,
}) => {
  if (!lead) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.header}>
            <View>
              <Text style={styles.leadId}>{lead.id}</Text>
              <Text style={styles.submittedOn}>Submitted: {lead.submissionDate}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Photos Preview */}
            {lead.photos && lead.photos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                {lead.photos.map((photo, i) => (
                  <Image key={i} source={{ uri: photo }} style={styles.propertyPhoto} />
                ))}
              </ScrollView>
            )}

            {/* Privacy Shield Alert */}
            <View style={styles.securityBox}>
              <Feather name="shield" size={16} color="#0F766E" />
              <View style={{ flex: 1 }}>
                <Text style={styles.securityTitle}>Customer Privacy Protection</Text>
                <Text style={styles.securitySub}>
                  Owner contact number is securely masked once submitted to safeguard lead confidentiality.
                </Text>
              </View>
            </View>

            {/* Property Summary Card */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Property Summary</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Property Type</Text>
                <Text style={styles.val}>{lead.propertyType} ({lead.listingType === "SALE" ? "For Sale" : "For Rent"})</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Expected Price</Text>
                <Text style={styles.valHighlight}>{formatCurrency(lead.expectedPrice)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Owner Name</Text>
                <Text style={styles.val}>{lead.ownerName}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Owner Phone</Text>
                <Text style={styles.valMasked}>{lead.maskedPhone}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Locality</Text>
                <Text style={styles.val}>{lead.locality}</Text>
              </View>
              {lead.fullAddress && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.row}>
                    <Text style={styles.label}>Full Address</Text>
                    <Text style={styles.val}>{lead.fullAddress}</Text>
                  </View>
                </>
              )}
            </View>

            {/* GPS Pin Information */}
            <View style={styles.sectionCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Ionicons name="location" size={16} color="#0D9488" />
                <Text style={styles.sectionHeader}>1-Click GPS Verified Location</Text>
              </View>
              <Text style={styles.gpsCoordsText}>
                Latitude: {lead.gpsLocation.latitude.toFixed(5)}° N • Longitude: {lead.gpsLocation.longitude.toFixed(5)}° E
              </Text>
              <Text style={styles.gpsAddressText}>{lead.gpsLocation.formattedAddress}</Text>
            </View>

            {/* Commission & Verification Status */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionHeader}>Verification & Commission</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.valHighlight}>{lead.status}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Commission</Text>
                <Text style={[styles.valHighlight, { color: "#059669" }]}>
                  {formatCurrency(lead.commissionAmount)} ({lead.commissionStatus})
                </Text>
              </View>
              {lead.verificationNotes && (
                <>
                  <View style={styles.divider} />
                  <Text style={[styles.label, { marginTop: 6 }]}>Admin / Staff Notes:</Text>
                  <Text style={styles.notesText}>{lead.verificationNotes}</Text>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  leadId: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  submittedOn: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  photoScroll: {
    marginBottom: 14,
  },
  propertyPhoto: {
    width: 180,
    height: 120,
    borderRadius: 14,
    marginRight: 10,
  },
  securityBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    borderRadius: 14,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  securityTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#0F766E",
  },
  securitySub: {
    fontSize: 11,
    color: "#0D9488",
    marginTop: 2,
    lineHeight: 15,
  },
  sectionCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  label: {
    fontSize: 12.5,
    color: "#64748B",
    fontWeight: "600",
  },
  val: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    maxWidth: "60%",
    textAlign: "right",
  },
  valMasked: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0D9488",
  },
  valHighlight: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0D9488",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  gpsCoordsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  gpsAddressText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  notesText: {
    fontSize: 12,
    color: "#334155",
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 16,
  },
});
