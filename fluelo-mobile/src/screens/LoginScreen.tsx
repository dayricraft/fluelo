import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight, Check, User, Sparkles } from "lucide-react-native";
import { FlueloLogo } from "../components/FlueloLogo";
import { PARTNERS } from "../data/partners";

interface LoginScreenProps {
  onBack: () => void;
  onSuccess: (name: string, level: string, partnerId: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onSuccess }) => {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [name, setName] = useState("Alex");
  const [ageRange, setAgeRange] = useState("18 to 24");
  const [level, setLevel] = useState("A1");
  const [selectedPartnerId, setSelectedPartnerId] = useState("sarah");

  const ageOptions = ["18 to 24", "25 to 34", "35+"];
  const levelOptions = [
    { code: "A1", label: "Beginner" },
    { code: "A2", label: "Elementary" },
    { code: "B1", label: "Intermediate" },
    { code: "B2", label: "Upper" },
  ];

  const handleFinish = () => {
    onSuccess(name, level, selectedPartnerId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#0F0F12" strokeWidth={2.4} />
          </TouchableOpacity>
          <FlueloLogo size={32} showText={true} />
          <View style={{ width: 38 }} />
        </View>

        {!isGuestMode ? (
          /* Standard Login Options */
          <View style={styles.loginContent}>
            <View style={styles.welcomeBox}>
              <Text style={styles.welcomeTitle}>Welcome to Fluelo</Text>
              <Text style={styles.welcomeSubtitle}>Sign in to save your speaking streak, feedback scores, and conversation history.</Text>
            </View>

            <View style={styles.actionSection}>
              {/* Continue with Google */}
              <TouchableOpacity onPress={handleFinish} style={styles.googleButton} activeOpacity={0.85}>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Continue as Guest */}
              <TouchableOpacity onPress={() => setIsGuestMode(true)} style={styles.guestButton} activeOpacity={0.85}>
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
                <View style={styles.guestArrow}>
                  <ArrowRight size={16} color="#0F0F12" strokeWidth={2.4} />
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.privacyNote}>By continuing, you agree to Fluelo's Terms and Privacy Policy.</Text>
          </View>
        ) : (
          /* Guest Profile Setup Bento Form */
          <ScrollView style={styles.bentoScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.bentoHeader}>
              <Text style={styles.bentoTitle}>Profile Setup</Text>
              <Text style={styles.bentoSubtitle}>Personalize your AI speaking experience</Text>
            </View>

            {/* Name Input Bento Card */}
            <View style={styles.bentoCard}>
              <Text style={styles.cardLabel}>YOUR NAME</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                style={styles.textInput}
                placeholderTextColor="#A0A3B1"
              />
            </View>

            {/* Age Range Bento Card */}
            <View style={styles.bentoCard}>
              <Text style={styles.cardLabel}>AGE RANGE</Text>
              <View style={styles.optionsRow}>
                {ageOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setAgeRange(opt)}
                    style={[styles.pillOption, ageRange === opt && styles.pillOptionActive]}
                  >
                    <Text style={[styles.pillOptionText, ageRange === opt && styles.pillOptionTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Target Level Bento Card */}
            <View style={styles.bentoCard}>
              <Text style={styles.cardLabel}>CURRENT ENGLISH LEVEL</Text>
              <View style={styles.levelGrid}>
                {levelOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt.code}
                    onPress={() => setLevel(opt.code)}
                    style={[styles.levelCard, level === opt.code && styles.levelCardActive]}
                  >
                    <Text style={[styles.levelCode, level === opt.code && styles.levelCodeActive]}>{opt.code}</Text>
                    <Text style={[styles.levelLabel, level === opt.code && styles.levelLabelActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* AI Partner Choice */}
            <View style={styles.bentoCard}>
              <Text style={styles.cardLabel}>CHOOSE YOUR FIRST TUTOR</Text>
              <View style={styles.tutorRow}>
                {PARTNERS.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setSelectedPartnerId(p.id)}
                    style={[
                      styles.tutorAvatarBox,
                      { backgroundColor: p.color },
                      selectedPartnerId === p.id && styles.tutorAvatarBoxActive,
                    ]}
                  >
                    <Text style={styles.tutorAvatarInitial}>{p.name[0]}</Text>
                    <Text style={styles.tutorAvatarName}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Complete Button */}
            <TouchableOpacity onPress={handleFinish} style={styles.finishButton} activeOpacity={0.85}>
              <Text style={styles.finishButtonText}>Start Practice</Text>
              <View style={styles.finishArrow}>
                <ArrowRight size={16} color="#0F0F12" strokeWidth={2.4} />
              </View>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  loginContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 24,
  },
  welcomeBox: {
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F0F12",
    letterSpacing: -0.8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#7E8190",
    marginTop: 8,
    lineHeight: 22,
  },
  actionSection: {
    gap: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F4F8",
    height: 52,
    borderRadius: 999,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  googleG: {
    fontSize: 20,
    fontWeight: "800",
    color: "#EA4335",
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F0F12",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  dividerText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A0A3B1",
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0F0F12",
    height: 52,
    paddingLeft: 22,
    paddingRight: 6,
    borderRadius: 999,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  guestArrow: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#B8F3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  privacyNote: {
    fontSize: 11,
    color: "#A0A3B1",
    textAlign: "center",
    lineHeight: 16,
  },
  bentoScroll: {
    flex: 1,
  },
  bentoHeader: {
    marginBottom: 16,
  },
  bentoTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F0F12",
    letterSpacing: -0.6,
  },
  bentoSubtitle: {
    fontSize: 13,
    color: "#7E8190",
    marginTop: 4,
  },
  bentoCard: {
    backgroundColor: "#F8F8FC",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7E8190",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F0F12",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  optionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  pillOption: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  pillOptionActive: {
    backgroundColor: "#0F0F12",
    borderColor: "#0F0F12",
  },
  pillOptionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F0F12",
  },
  pillOptionTextActive: {
    color: "#FFFFFF",
  },
  levelGrid: {
    flexDirection: "row",
    gap: 8,
  },
  levelCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  levelCardActive: {
    backgroundColor: "#8F5BFF",
    borderColor: "#8F5BFF",
  },
  levelCode: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F0F12",
  },
  levelCodeActive: {
    color: "#FFFFFF",
  },
  levelLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#7E8190",
    marginTop: 2,
  },
  levelLabelActive: {
    color: "rgba(255,255,255,0.85)",
  },
  tutorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tutorAvatarBox: {
    width: 54,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  tutorAvatarBoxActive: {
    borderColor: "#0F0F12",
    transform: [{ scale: 1.05 }],
  },
  tutorAvatarInitial: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F0F12",
  },
  tutorAvatarName: {
    fontSize: 9,
    fontWeight: "700",
    color: "#0F0F12",
    marginTop: 2,
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0F0F12",
    height: 52,
    paddingLeft: 22,
    paddingRight: 6,
    borderRadius: 999,
    marginTop: 10,
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  finishArrow: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#B8F3B8",
    alignItems: "center",
    justifyContent: "center",
  },
});
