import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";

interface FlueloLogoProps {
  size?: number;
  showText?: boolean;
}

export const FlueloLogo: React.FC<FlueloLogoProps> = ({ size = 36, showText = true }) => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 240 240">
        {/* Lingkaran Luar (Fresh Soft Lilac) */}
        <Circle cx="120" cy="120" r="108" fill="#B899FF" />
        {/* Cincin Tengah (Vibrant Violet) */}
        <Circle cx="120" cy="120" r="80" fill="#8F5BFF" />
        {/* Lingkaran Inti Dalam (Icy Lavender White) */}
        <Circle cx="120" cy="120" r="60" fill="#F5F0FF" />
      </Svg>
      {showText && <Text style={[styles.brandText, { fontSize: size * 0.65 }]}>Fluelo</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandText: {
    fontWeight: "800",
    color: "#0F0F12",
    letterSpacing: -0.8,
  },
});
