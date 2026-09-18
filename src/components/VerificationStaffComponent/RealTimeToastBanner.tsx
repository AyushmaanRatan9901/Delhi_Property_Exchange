import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import * as Haptics from "expo-haptics";
import { RootState } from "../../Redux/store";
import {
  clearActiveToast,
  markNotificationRead,
} from "../../Redux/VerificationStaff/verificationStaffSlice";

const { width } = Dimensions.get("window");

interface Props {
  onOpenLead?: (lead: any) => void;
}

export const RealTimeToastBanner: React.FC<Props> = ({ onOpenLead }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const activeToast = useSelector(
    (state: RootState) => state.verificationStaff.activeToast
  );

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (activeToast) {
      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: insets.top + 8,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        handleDismiss();
      }, 6500);
    } else {
      handleDismiss();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeToast]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dispatch(clearActiveToast());
    });
  };

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    if (activeToast) {
      dispatch(markNotificationRead(activeToast.id));
      if (activeToast.lead && onOpenLead) {
        onOpenLead(activeToast.lead);
      }
    }
    handleDismiss();
  };

  if (!activeToast) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          <Feather name="bell" size={20} color="#FFFFFF" />
          <View style={styles.pulseDot} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.badge}>REAL-TIME</Text>
            <Text style={styles.title} numberOfLines={1}>
              {activeToast.title}
            </Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {activeToast.message}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.closeBtn}
        >
          <Ionicons name="close" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#0D9488",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pulseDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: "#0F172A",
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  badge: {
    fontSize: 9,
    fontWeight: "900",
    color: "#0D9488",
    backgroundColor: "rgba(13, 148, 136, 0.2)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 6,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  message: {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
  },
});

export default RealTimeToastBanner;
