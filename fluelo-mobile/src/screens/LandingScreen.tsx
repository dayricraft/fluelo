import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { FlueloLogo } from "../components/FlueloLogo";

interface LandingScreenProps {
  onStart: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onStart }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <FlueloLogo size={42} showText={true} />
          <View style={styles.pillBadge}>
            <Sparkles size={13} color="#8F5BFF" />
            <Text style={styles.pillBadgeText}>AI Speaking 2.0</Text>
          </View>
        </View>

        {/* Hero Editorial Headline */}
        <View style={styles.heroContent}>
          <Text style={styles.headline}>
            Ready to Speak{"\n"}
            <Text style={styles.headlineHighlight}>Fluent English?</Text>
          </Text>
          <Text style={styles.subtitle}>
            Practice daily AI voice conversations with friendly native tutors without fear of making mistakes.
          </Text>

          {/* Pill CTA Button */}
          <TouchableOpacity onPress={onStart} style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Let's Start</Text>
            <View style={styles.ctaArrowCircle}>
              <ArrowRight size={16} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Interactive Character Cluster */}
        <View style={styles.clusterContainer}>
          {/* Sarah Mint Circle */}
          <View style={[styles.mascotCircle, { backgroundColor: "#B8F3B8", left: 30, top: 20 }]}>
            <Text style={styles.mascotEmoji}>😊</Text>
            <Text style={styles.mascotName}>Sarah</Text>
          </View>

          {/* Sophia Lilac Circle */}
          <View style={[styles.mascotCircle, { backgroundColor: "#D8C8FF", right: 28, top: 10 }]}>
            <Text style={styles.mascotEmoji}>✨</Text>
            <Text style={styles.mascotName}>Sophia</Text>
          </View>

          {/* David Yellow Shape */}
          <View style={[styles.mascotCircle, { backgroundColor: "#FDE272", left: "38%", top: 90, width: 92, height: 92 }]}>
            <Text style={styles.mascotEmoji}>⚡</Text>
            <Text style={styles.mascotName}>David</Text>
          </View>

          {/* Emma Coral Circle */}
          <View style={[styles.mascotCircle, { backgroundColor: "#F9A8A8", left: 24, top: 160 }]}>
            <Text style={styles.mascotEmoji}>💬</Text>
            <Text style={styles.mascotName}>Emma</Text>
          </View>

          {/* Kenji Blue Circle */}
          <View style={[styles.mascotCircle, { backgroundColor: "#B5E2FA", right: 34, top: 150 }]}>
            <Text style={styles.mascotEmoji}>✈️</Text>
            <Text style={styles.mascotName}>Kenji</Text>
          </View>
        </View>

        {/* Bottom Tagline */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Over 14,000+ speaking sessions completed this week</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F4F0FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8F5BFF",
  },
  heroContent: {
    alignItems: "center",
    marginTop: 20,
  },
  headline: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F0F12",
    textAlign: "center",
    lineHeight: 38,
    letterSpacing: -0.9,
  },
  headlineHighlight: {
    color: "#8F5BFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#7E8190",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 21,
    maxWidth: 290,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F8",
    paddingLeft: 22,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    gap: 16,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F0F12",
  },
  ctaArrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#0F0F12",
    alignItems: "center",
    justifyContent: "center",
  },
  clusterContainer: {
    height: 270,
    position: "relative",
    marginVertical: 10,
  },
  mascotCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mascotEmoji: {
    fontSize: 26,
  },
  mascotName: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F0F12",
    marginTop: 2,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 11,
    color: "#A0A3B1",
    fontWeight: "600",
  },
});
