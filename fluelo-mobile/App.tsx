import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { LandingScreen } from "./src/screens/LandingScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { RoomTalkScreen } from "./src/screens/RoomTalkScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { PARTNERS, Partner } from "./src/data/partners";

export default function App() {
  // Screen state: 1: Landing, 2: Login/Guest, 3: Dashboard, 4: Room Talk, 5: Calendar
  const [activeScreen, setActiveScreen] = useState<number>(1);
  const [userName, setUserName] = useState<string>("Alex");
  const [userLevel, setUserLevel] = useState<string>("A1");
  const [activePartner, setActivePartner] = useState<Partner>(PARTNERS[0]);

  const handleSelectPartner = (partner: Partner) => {
    setActivePartner(partner);
    setActiveScreen(4); // Navigate to Room Talk
  };

  const handleLoginSuccess = (name: string, level: string, partnerId: string) => {
    if (name) setUserName(name);
    if (level) setUserLevel(level);
    const foundPartner = PARTNERS.find((p) => p.id === partnerId) || PARTNERS[0];
    setActivePartner(foundPartner);
    setActiveScreen(3); // Navigate to Dashboard
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {activeScreen === 1 && (
          <LandingScreen onStart={() => setActiveScreen(2)} />
        )}

        {activeScreen === 2 && (
          <LoginScreen
            onBack={() => setActiveScreen(1)}
            onSuccess={handleLoginSuccess}
          />
        )}

        {activeScreen === 3 && (
          <DashboardScreen
            userName={userName}
            userLevel={userLevel}
            onSelectPartner={handleSelectPartner}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 4 && (
          <RoomTalkScreen
            partner={activePartner}
            onEndCall={() => setActiveScreen(3)}
          />
        )}

        {activeScreen === 5 && (
          <CalendarScreen
            onBack={() => setActiveScreen(3)}
            onNavigate={setActiveScreen}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
