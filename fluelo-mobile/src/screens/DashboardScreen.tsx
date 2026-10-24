import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame, Bell, Sparkles, ArrowRight, Play, CheckCircle2 } from "lucide-react-native";
import { FlueloLogo } from "../components/FlueloLogo";
import { PARTNERS, Partner } from "../data/partners";
import { BottomNav } from "../components/BottomNav";

interface DashboardScreenProps {
  userName: string;
  userLevel: string;
  onSelectPartner: (partner: Partner) => void;
  onNavigate: (screen: number) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  userName,
  userLevel,
  onSelectPartner,
  onNavigate,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <FlueloLogo size={36} showText={true} />

          <View style={styles.headerRight}>
            {/* Streak Badge */}
            <View style={styles.streakBadge}>
              <Flame size={15} color="#FF7A00" fill="#FF7A00" />
              <Text style={styles.streakText}>3 Days</Text>
            </View>

            {/* Notification Bell */}
            <TouchableOpacity style={styles.iconCircle} activeOpacity={0.8}>
              <Bell size={17} color="#0F0F12" strokeWidth={2.2} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* Welcome User Banner */}
          <View style={styles.welcomeSection}>
            <Text style={styles.greetingText}>Welcome back, {userName || "Alex"}!</Text>
            <Text style={styles.promptText}>Ready for today's 5-minute speaking session?</Text>
          </View>

          {/* Daily Goal Bento Hero Card */}
          <TouchableOpacity onPress={() => onNavigate(5)} activeOpacity={0.9} style={styles.goalCard}>
            <View style={styles.goalTopRow}>
              <View style={styles.goalBadge}>
                <CheckCircle2 size={13} color="#2E8540" />
                <Text style={styles.goalBadgeText}>OCTOBER CHALLENGE</Text>
              </View>
              <Text style={styles.goalRatio}>14/20</Text>
            </View>

            <Text style={styles.goalTitle}>Speaking Streak & Habit</Text>
            <Text style={styles.goalSubtitle}>You've completed 14 sessions this month. 6 more to reach Level {userLevel === "A1" ? "A2" : "B1"}!</Text>

            {/* Progress Bar */}
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: "70%" }]} />
            </View>

            <View style={styles.goalBottomRow}>
              <Text style={styles.goalStatusText}>70% Completed</Text>
              <View style={styles.viewCalendarLink}>
                <Text style={styles.viewCalendarText}>View Calendar</Text>
                <ArrowRight size={13} color="#8F5BFF" strokeWidth={2.4} />
              </View>
            </View>
          </TouchableOpacity>

          {/* AI Speaking Partners Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Speaking Partners</Text>
            <Text style={styles.sectionHint}>Tap to start call</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.partnersSlider}>
            {PARTNERS.map((partner) => (
              <TouchableOpacity
                key={partner.id}
                onPress={() => onSelectPartner(partner)}
                activeOpacity={0.85}
                style={[styles.partnerCard, { backgroundColor: partner.color }]}
              >
                <View style={styles.partnerTopRow}>
                  <Text style={styles.partnerLevelPill}>{partner.level.split(" ")[0]}</Text>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Ready</Text>
                  </View>
                </View>

                {/* Big Avatar Face */}
                <View style={[styles.partnerAvatarCircle, { backgroundColor: partner.faceBg }]}>
                  <Text style={styles.partnerInitial}>{partner.name[0]}</Text>
                </View>

                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.partnerRole}>{partner.role}</Text>

                <View style={styles.startCallButton}>
                  <Play size={11} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.startCallText}>Start Room</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bento Practice Scenarios */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Curated Scenarios</Text>
          </View>

          <View style={styles.scenariosGrid}>
            <TouchableOpacity
              onPress={() => onSelectPartner(PARTNERS[0])}
              style={[styles.scenarioCard, { backgroundColor: "#FDF5E6" }]}
              activeOpacity={0.85}
            >
              <Text style={styles.scenarioEmoji}>☕</Text>
              <Text style={styles.scenarioTitle}>Ordering Coffee</Text>
              <Text style={styles.scenarioDesc}>Learn polite phrasing and customization</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onSelectPartner(PARTNERS[2])}
              style={[styles.scenarioCard, { backgroundColor: "#EDF2FF" }]}
              activeOpacity={0.85}
            >
              <Text style={styles.scenarioEmoji}>💼</Text>
              <Text style={styles.scenarioTitle}>Job Interview</Text>
              <Text style={styles.scenarioDesc}>Practice answering "Tell me about yourself"</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Floating Bottom Dock */}
        <BottomNav activeScreen={3} onNavigate={onNavigate} />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF3E8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FFE4CC",
  },
  streakText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#E56A00",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#F4F4F8",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#8F5BFF",
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    marginTop: 6,
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F0F12",
    letterSpacing: -0.5,
  },
  promptText: {
    fontSize: 13,
    color: "#7E8190",
    marginTop: 3,
  },
  goalCard: {
    backgroundColor: "#F8F8FC",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    marginBottom: 20,
  },
  goalTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  goalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EAF7ED",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  goalBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#2E8540",
  },
  goalRatio: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F0F12",
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F0F12",
  },
  goalSubtitle: {
    fontSize: 12,
    color: "#7E8190",
    marginTop: 4,
    lineHeight: 18,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: "#ECEEF5",
    borderRadius: 999,
    marginTop: 14,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#8F5BFF",
    borderRadius: 999,
  },
  goalBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  goalStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7E8190",
  },
  viewCalendarLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewCalendarText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8F5BFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F0F12",
  },
  sectionHint: {
    fontSize: 11,
    color: "#A0A3B1",
    fontWeight: "600",
  },
  partnersSlider: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 22,
  },
  partnerCard: {
    width: 136,
    borderRadius: 22,
    padding: 14,
    marginRight: 12,
    alignItems: "center",
  },
  partnerTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  partnerLevelPill: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0F0F12",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#2E8540",
  },
  liveText: {
    fontSize: 8,
    fontWeight: "700",
    color: "#2E8540",
  },
  partnerAvatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  partnerInitial: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  partnerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F0F12",
  },
  partnerRole: {
    fontSize: 10,
    color: "rgba(15,15,18,0.75)",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
  startCallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#0F0F12",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 10,
  },
  startCallText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scenariosGrid: {
    flexDirection: "row",
    gap: 12,
  },
  scenarioCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
  },
  scenarioEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  scenarioTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F0F12",
  },
  scenarioDesc: {
    fontSize: 10,
    color: "#7E8190",
    marginTop: 4,
    lineHeight: 14,
  },
});
