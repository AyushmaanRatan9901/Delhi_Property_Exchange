import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AgentProfile } from "../../constants/fieldAgentData";

interface AgentHeaderProps {
  profile: AgentProfile;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({
  profile,
  onNotificationPress,
  onProfilePress,
}) => {
  const handleCopyId = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
    Alert.alert("Agent ID Copied", `Your unique Field Agent ID ${profile.id} is copied to clipboard.`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onProfilePress}
        style={styles.profileSection}
      >
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <View style={styles.onlineBadge} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.greetingText}>Namaste, {profile.name.split(" ")[0]} 👋</Text>
          </View>
          <View style={styles.badgesRow}>
            <TouchableOpacity
              onPress={handleCopyId}
              style={styles.agentIdBadge}
              activeOpacity={0.7}
            >
              <Feather name="shield" size={11} color="#0D9488" />
              <Text style={styles.agentIdText}>{profile.id}</Text>
              <Feather name="copy" size={10} color="#0D9488" style={{ marginLeft: 2 }} />
            </TouchableOpacity>

            <View style={styles.tierBadge}>
              <Ionicons name="star" size={10} color="#D97706" />
              <Text style={styles.tierBadgeText}>{profile.tier}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNotificationPress}
        style={styles.notifButton}
        activeOpacity={0.7}
      >
        <Feather name="bell" size={20} color="#0F172A" />
        <View style={styles.notifDot} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#0D9488",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  greetingText: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    flexWrap: "wrap",
  },
  agentIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    gap: 3,
  },
  agentIdText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#0F766E",
    letterSpacing: 0.2,
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    gap: 3,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#B45309",
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#EF4444",
  },
});
