import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Flame, Clock, Award } from "lucide-react-native";
import { BottomNav } from "../components/BottomNav";

interface CalendarScreenProps {
  onBack: () => void;
  onNavigate: (screen: number) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onBack, onNavigate }) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(24);

  // Check-ins map for October
  const checkedInDays: Record<number, { partner: string; color: string; duration: string }> = {
    2: { partner: "Sarah", color: "#B8F3B8", duration: "12m" },
    3: { partner: "Emma", color: "#F9A8A8", duration: "15m" },
    5: { partner: "David", color: "#FDE272", duration: "10m" },
    7: { partner: "Sarah", color: "#B8F3B8", duration: "18m" },
    9: { partner: "Sophia", color: "#D8C8FF", duration: "20m" },
    11: { partner: "Kenji", color: "#B5E2FA", duration: "14m" },
    12: { partner: "Emma", color: "#F9A8A8", duration: "16m" },
    14: { partner: "Sarah", color: "#B8F3B8", duration: "15m" },
    16: { partner: "David", color: "#FDE272", duration: "12m" },
    18: { partner: "Sophia", color: "#D8C8FF", duration: "22m" },
    20: { partner: "Kenji", color: "#B5E2FA", duration: "14m" },
    22: { partner: "Sarah", color: "#B8F3B8", duration: "16m" },
    23: { partner: "Emma", color: "#F9A8A8", duration: "15m" },
    24: { partner: "David", color: "#FDE272", duration: "10m" },
  };

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const totalDays = 31;
  const startDayOffset = 3; // October starts on Thursday (index 3)

  const calendarDays = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarDays.push({ day: 0, isEmpty: true });
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push({ day: d, isEmpty: false });
  }

  const selectedData = selectedDay && checkedInDays[selectedDay];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.iconCircle} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#0F0F12" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.monthSelector}>
            <TouchableOpacity style={styles.chevronBtn}><ChevronLeft size={16} color="#0F0F12" /></TouchableOpacity>
            <Text style={styles.monthTitle}>October 2026</Text>
            <TouchableOpacity style={styles.chevronBtn}><ChevronRight size={16} color="#0F0F12" /></TouchableOpacity>
          </View>

          <View style={{ width: 38 }} />
        </View>

        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* Monthly Stats Bento Card */}
          <View style={styles.statsBento}>
            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: "#EAF7ED" }]}>
                <CheckCircle2 size={16} color="#2E8540" />
              </View>
              <Text style={styles.statNum}>14 Days</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: "#FFF3E8" }]}>
                <Flame size={16} color="#FF7A00" />
              </View>
              <Text style={styles.statNum}>7 Days</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>

            <View style={styles.statBox}>
              <View style={[styles.statIconCircle, { backgroundColor: "#F4F0FF" }]}>
                <Clock size={16} color="#8F5BFF" />
              </View>
              <Text style={styles.statNum}>184m</Text>
              <Text style={styles.statLabel}>Total Talk</Text>
            </View>
          </View>

          {/* Calendar Grid Card */}
          <View style={styles.calendarCard}>
            {/* Weekday headers */}
            <View style={styles.weekHeaderRow}>
              {weekDays.map((wd, i) => (
                <Text key={i} style={styles.weekHeaderText}>{wd}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {calendarDays.map((item, index) => {
                if (item.isEmpty) {
                  return <View key={index} style={styles.emptyDayCell} />;
                }

                const dayNum = item.day;
                const checkIn = checkedInDays[dayNum];
                const isSelected = selectedDay === dayNum;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedDay(dayNum)}
                    style={[
                      styles.dayCell,
                      checkIn && { backgroundColor: checkIn.color },
                      isSelected && styles.dayCellSelected,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dayNumText, isSelected && styles.dayNumTextSelected]}>
                      {dayNum}
                    </Text>
                    {checkIn && (
                      <View style={styles.stickerDot}>
                        <Text style={styles.stickerText}>{checkIn.partner[0]}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Selected Day Detail Card */}
          {selectedDay && (
            <View style={styles.detailCard}>
              <Text style={styles.detailCardDate}>October {selectedDay}, 2026</Text>
              {selectedData ? (
                <View style={styles.sessionRecordRow}>
                  <View style={[styles.detailAvatar, { backgroundColor: selectedData.color }]}>
                    <Text style={styles.detailAvatarText}>{selectedData.partner[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailPartnerName}>Practiced with {selectedData.partner}</Text>
                    <Text style={styles.detailMeta}>Duration: {selectedData.duration} • Speaking Score: 92%</Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noSessionText}>No session recorded on this day. Tap "Start Room" to practice!</Text>
              )}
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Bottom Nav Dock */}
        <BottomNav activeScreen={5} onNavigate={onNavigate} />
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
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#F4F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chevronBtn: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F0F12",
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsBento: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F8F8FC",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statNum: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F0F12",
  },
  statLabel: {
    fontSize: 10,
    color: "#7E8190",
    fontWeight: "600",
    marginTop: 2,
  },
  calendarCard: {
    backgroundColor: "#F8F8FC",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    marginBottom: 16,
  },
  weekHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  weekHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#A0A3B1",
    width: 36,
    textAlign: "center",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  emptyDayCell: {
    width: 38,
    height: 44,
    marginVertical: 3,
  },
  dayCell: {
    width: 38,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 3,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  dayCellSelected: {
    borderColor: "#0F0F12",
    borderWidth: 2,
  },
  dayNumText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F0F12",
  },
  dayNumTextSelected: {
    fontWeight: "800",
  },
  stickerDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#0F0F12",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stickerText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  detailCard: {
    backgroundColor: "#F8F8FC",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  detailCardDate: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F0F12",
    marginBottom: 10,
  },
  sessionRecordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  detailAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F0F12",
  },
  detailPartnerName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F0F12",
  },
  detailMeta: {
    fontSize: 11,
    color: "#7E8190",
    marginTop: 2,
  },
  noSessionText: {
    fontSize: 12,
    color: "#7E8190",
    lineHeight: 18,
  },
});
