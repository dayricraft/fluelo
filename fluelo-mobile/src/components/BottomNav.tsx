import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Home, Mic, Calendar, User } from "lucide-react-native";

interface BottomNavProps {
  activeScreen: number;
  onNavigate: (screen: number) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate }) => {
  return (
    <View style={styles.dockContainer}>
      <View style={styles.pillDock}>
        <TouchableOpacity
          onPress={() => onNavigate(3)}
          style={[styles.dockButton, activeScreen === 3 && styles.dockButtonActive]}
          activeOpacity={0.8}
        >
          <Home size={18} color={activeScreen === 3 ? "#0F0F12" : "rgba(255,255,255,0.7)"} strokeWidth={2.4} />
          {activeScreen === 3 && <Text style={styles.activeText}>Home</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate(4)}
          style={[styles.dockButton, activeScreen === 4 && styles.dockButtonActive]}
          activeOpacity={0.8}
        >
          <Mic size={18} color={activeScreen === 4 ? "#0F0F12" : "rgba(255,255,255,0.7)"} strokeWidth={2.4} />
          {activeScreen === 4 && <Text style={styles.activeText}>Room</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate(5)}
          style={[styles.dockButton, activeScreen === 5 && styles.dockButtonActive]}
          activeOpacity={0.8}
        >
          <Calendar size={18} color={activeScreen === 5 ? "#0F0F12" : "rgba(255,255,255,0.7)"} strokeWidth={2.4} />
          {activeScreen === 5 && <Text style={styles.activeText}>Check-In</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate(2)}
          style={[styles.dockButton, activeScreen === 2 && styles.dockButtonActive]}
          activeOpacity={0.8}
        >
          <User size={18} color={activeScreen === 2 ? "#0F0F12" : "rgba(255,255,255,0.7)"} strokeWidth={2.4} />
          {activeScreen === 2 && <Text style={styles.activeText}>Profile</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockContainer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 50,
  },
  pillDock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111116",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  dockButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  dockButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  activeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F0F12",
  },
});
