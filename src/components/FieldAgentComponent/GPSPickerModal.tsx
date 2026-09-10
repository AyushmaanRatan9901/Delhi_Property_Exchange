import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GPSLocation } from "../../constants/fieldAgentData";

interface GPSPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelected: (location: GPSLocation) => void;
  localityHint?: string;
}

export const GPSPickerModal: React.FC<GPSPickerModalProps> = ({
  visible,
  onClose,
  onLocationSelected,
  localityHint,
}) => {
  const [isFetching, setIsFetching] = useState(true);
  const [coords, setCoords] = useState<GPSLocation | null>(null);

  useEffect(() => {
    if (visible) {
      setIsFetching(true);
      const timer = setTimeout(() => {
        setIsFetching(false);
        const resolved: GPSLocation = {
          latitude: 28.6289 + (Math.random() - 0.5) * 0.01,
          longitude: 77.3654 + (Math.random() - 0.5) * 0.01,
          accuracyMeters: 3.8,
          formattedAddress: localityHint
            ? `Near ${localityHint}, Sector 62, Noida, UP 201309`
            : "Royal Palms Block B, Sector 62, Noida, Uttar Pradesh 201309",
        };
        setCoords(resolved);
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {}
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [visible, localityHint]);

  const handleConfirm = () => {
    if (coords) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
      onLocationSelected(coords);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.gpsTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="location" size={20} color="#0D9488" />
              </View>
              <View>
                <Text style={styles.title}>1-Click GPS Pin</Text>
                <Text style={styles.subtitle}>Automatic On-Site Verification</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {isFetching ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#0D9488" />
              <Text style={styles.loadingTitle}>Connecting to GPS Satellites...</Text>
              <Text style={styles.loadingSub}>
                Obtaining live high-precision coordinates
              </Text>
            </View>
          ) : (
            <View style={styles.coordsBox}>
              {/* Radar Map Graphic Simulation */}
              <View style={styles.mapSimContainer}>
                <View style={styles.pulseCircle} />
                <View style={styles.pinCenter}>
                  <Ionicons name="navigate" size={18} color="#FFFFFF" />
                </View>
              </View>

              {/* Verified Tag */}
              <View style={styles.verifiedRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.verifiedText}>High Accuracy (±3.8m)</Text>
              </View>

              {/* Coordinates Grid */}
              <View style={styles.coordsGrid}>
                <View style={styles.coordCol}>
                  <Text style={styles.coordLabel}>Latitude</Text>
                  <Text style={styles.coordValue}>{coords?.latitude.toFixed(6)}° N</Text>
                </View>
                <View style={styles.coordCol}>
                  <Text style={styles.coordLabel}>Longitude</Text>
                  <Text style={styles.coordValue}>{coords?.longitude.toFixed(6)}° E</Text>
                </View>
              </View>

              {/* Address Preview */}
              <View style={styles.addressBox}>
                <Feather name="map" size={14} color="#0D9488" style={{ marginTop: 2 }} />
                <Text style={styles.addressText}>{coords?.formattedAddress}</Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleConfirm}
                style={styles.confirmBtn}
              >
                <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
                <Text style={styles.confirmBtnText}>Confirm & Attach GPS Pin</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingBottom: 34,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gpsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  closeBtn: {
    padding: 6,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 14,
  },
  loadingSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  coordsBox: {
    alignItems: "center",
  },
  mapSimContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F0FDFA",
    borderWidth: 2,
    borderColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 10,
  },
  pulseCircle: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(13, 148, 136, 0.15)",
  },
  pinCenter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#059669",
  },
  coordsGrid: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 14,
  },
  coordCol: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  coordLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  coordValue: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  addressBox: {
    flexDirection: "row",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    borderRadius: 12,
    padding: 12,
    width: "100%",
    marginTop: 12,
    gap: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 12.5,
    color: "#0F766E",
    fontWeight: "600",
    lineHeight: 18,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    height: 50,
    borderRadius: 16,
    width: "100%",
    marginTop: 16,
    gap: 6,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
