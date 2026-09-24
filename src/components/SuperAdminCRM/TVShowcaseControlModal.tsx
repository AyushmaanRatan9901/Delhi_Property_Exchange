import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsiveTheme } from "../../constants/theme";
import { TVShowcaseItem } from "../../services/superAdminCrmApi";

interface TVShowcaseControlModalProps {
  visible: boolean;
  showcases: TVShowcaseItem[];
  onPlay: (id: string, index?: number) => void;
  onNext: (id: string) => void;
  onPrevious: (id: string) => void;
  onClose: () => void;
}

export const TVShowcaseControlModal: React.FC<TVShowcaseControlModalProps> = ({
  visible,
  showcases,
  onPlay,
  onNext,
  onPrevious,
  onClose,
}) => {
  const { isDark, colors } = useResponsiveTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <MaterialCommunityIcons name="television-play" size={22} color="#0D9488" />
              <Text style={[styles.title, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                Office TV Showcase Control
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Real-time slide playback, remote navigation & TV displays
          </Text>

          <ScrollView style={styles.contentList} showsVerticalScrollIndicator={false}>
            {showcases.length === 0 ? (
              <View style={styles.emptyBox}>
                <Feather name="tv" size={32} color="#94A3B8" />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No TV displays registered yet.
                </Text>
              </View>
            ) : (
              showcases.map((sc) => (
                <View
                  key={sc._id}
                  style={[
                    styles.showcaseCard,
                    {
                      backgroundColor: isDark ? "#1E293B" : "#F8FAFC",
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                    },
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={[styles.scTitle, { color: isDark ? "#FFFFFF" : "#0F172A" }]}>
                        {sc.title}
                      </Text>
                      <Text style={[styles.scLocation, { color: colors.textMuted }]}>
                        {sc.location} • Slide #{sc.currentPropertyIndex + 1}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor:
                            sc.status === "active" ? "#DCFCE7" : "#F1F5F9",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: sc.status === "active" ? "#15803D" : "#64748B",
                          },
                        ]}
                      >
                        {sc.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Remote Controls */}
                  <View style={styles.remoteRow}>
                    <TouchableOpacity
                      style={styles.remoteBtn}
                      onPress={() => onPrevious(sc._id)}
                    >
                      <Feather name="skip-back" size={16} color="#334155" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.remoteBtn, styles.playBtn]}
                      onPress={() => onPlay(sc._id, sc.currentPropertyIndex)}
                    >
                      <Feather name="play" size={18} color="#FFFFFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.remoteBtn}
                      onPress={() => onNext(sc._id)}
                    >
                      <Feather name="skip-forward" size={16} color="#334155" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 16,
    maxHeight: "75%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  closeBtn: {
    padding: 4,
  },
  contentList: {
    marginVertical: 4,
  },
  emptyBox: {
    paddingVertical: 30,
    alignItems: "center",
    gap: 6,
  },
  emptyText: {
    fontSize: 12,
  },
  showcaseCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  scTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  scLocation: {
    fontSize: 11,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  remoteRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
  },
  remoteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0D9488",
  },
  doneBtn: {
    backgroundColor: "#0D9488",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
