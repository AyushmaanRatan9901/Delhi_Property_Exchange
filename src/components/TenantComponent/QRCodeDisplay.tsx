import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Rect, Path, G, Defs, LinearGradient, Stop } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 180,
  backgroundColor = "#FFFFFF",
  color = "#0F172A",
}) => {
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4F46E5" />
            <Stop offset="100%" stopColor="#0F172A" />
          </LinearGradient>
        </Defs>

        {/* Outer background */}
        <Rect x="0" y="0" width="100" height="100" fill={backgroundColor} rx="8" />

        {/* Top-Left Finder Pattern */}
        <Rect x="8" y="8" width="28" height="28" fill="none" stroke={color} strokeWidth="4" rx="4" />
        <Rect x="14" y="14" width="16" height="16" fill="url(#qrGrad)" rx="2" />

        {/* Top-Right Finder Pattern */}
        <Rect x="64" y="8" width="28" height="28" fill="none" stroke={color} strokeWidth="4" rx="4" />
        <Rect x="70" y="14" width="16" height="16" fill="url(#qrGrad)" rx="2" />

        {/* Bottom-Left Finder Pattern */}
        <Rect x="8" y="64" width="28" height="28" fill="none" stroke={color} strokeWidth="4" rx="4" />
        <Rect x="14" y="70" width="16" height="16" fill="url(#qrGrad)" rx="2" />

        {/* Timing and Alignment Blocks (Simulated QR Grid Matrix) */}
        <G fill={color}>
          {/* Timing horizontal */}
          <Rect x="40" y="10" width="4" height="4" rx="1" />
          <Rect x="48" y="10" width="4" height="4" rx="1" />
          <Rect x="56" y="10" width="4" height="4" rx="1" />

          {/* Timing vertical */}
          <Rect x="10" y="40" width="4" height="4" rx="1" />
          <Rect x="10" y="48" width="4" height="4" rx="1" />
          <Rect x="10" y="56" width="4" height="4" rx="1" />

          {/* Data clusters */}
          <Rect x="42" y="22" width="6" height="6" rx="1" />
          <Rect x="52" y="22" width="6" height="6" rx="1" />
          <Rect x="42" y="32" width="6" height="6" rx="1" />
          <Rect x="52" y="32" width="6" height="6" rx="1" />

          <Rect x="22" y="42" width="6" height="6" rx="1" />
          <Rect x="32" y="42" width="6" height="6" rx="1" />
          <Rect x="22" y="52" width="6" height="6" rx="1" />
          <Rect x="32" y="52" width="6" height="6" rx="1" />

          {/* Center alignment box */}
          <Rect x="42" y="42" width="16" height="16" fill="none" stroke={color} strokeWidth="3" rx="2" />
          <Rect x="46" y="46" width="8" height="8" fill="#6366F1" rx="1" />

          {/* Bottom right data blocks */}
          <Rect x="64" y="42" width="6" height="6" rx="1" />
          <Rect x="74" y="42" width="6" height="6" rx="1" />
          <Rect x="84" y="42" width="6" height="6" rx="1" />
          <Rect x="64" y="52" width="6" height="6" rx="1" />
          <Rect x="84" y="52" width="6" height="6" rx="1" />

          <Rect x="42" y="64" width="6" height="6" rx="1" />
          <Rect x="52" y="64" width="6" height="6" rx="1" />
          <Rect x="42" y="74" width="6" height="6" rx="1" />
          <Rect x="52" y="74" width="6" height="6" rx="1" />
          <Rect x="42" y="84" width="6" height="6" rx="1" />
          <Rect x="52" y="84" width="6" height="6" rx="1" />

          <Rect x="64" y="64" width="8" height="8" rx="1.5" />
          <Rect x="76" y="64" width="6" height="6" rx="1" />
          <Rect x="86" y="64" width="6" height="6" rx="1" />
          <Rect x="64" y="76" width="6" height="6" rx="1" />
          <Rect x="76" y="76" width="8" height="8" rx="1.5" />
          <Rect x="86" y="76" width="6" height="6" rx="1" />
          <Rect x="64" y="86" width="6" height="6" rx="1" />
          <Rect x="74" y="86" width="6" height="6" rx="1" />
          <Rect x="84" y="86" width="8" height="8" rx="1.5" />
        </G>
      </Svg>
    </View>
  );
};

export default QRCodeDisplay;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
});
