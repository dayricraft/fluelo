import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Mic, MicOff, PhoneOff, Send, Volume2, Sparkles } from "lucide-react-native";
import { Partner } from "../data/partners";

interface RoomTalkScreenProps {
  partner: Partner;
  onEndCall: () => void;
}

interface Message {
  sender: "ai" | "user";
  text: string;
}

export const RoomTalkScreen: React.FC<RoomTalkScreenProps> = ({ partner, onEndCall }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: partner.greeting,
    },
  ]);

  const quickPrompts = [
    "Tell me about your city",
    "Can you correct my grammar?",
    "Let's practice ordering food",
    "How is my pronunciation?",
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Add user message
    const newMessages: Message[] = [...messages, { sender: "user", text: text.trim() }];
    setMessages(newMessages);
    setInputText("");

    // Simulate AI response
    setTimeout(() => {
      let aiReply = "That's a great sentence! Your structure was very natural. Here's a tip: you can also use 'I would prefer' to sound even more fluent.";
      if (text.toLowerCase().includes("food") || text.toLowerCase().includes("order")) {
        aiReply = "I love food! Imagine you're at a cafe in London. What drink would you like to order today?";
      } else if (text.toLowerCase().includes("pronunciation")) {
        aiReply = "Your clarity score is 89%! Your vowel sounds are clear, just make sure to soften the 'r' at the end of words.";
      }

      setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    }, 1200);
  };

  const toggleMic = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate listening and transcribing user speech
      setTimeout(() => {
        setIsRecording(false);
        handleSend("I want to improve my English speaking confidence!");
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Room Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onEndCall} style={styles.iconCircle} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#0F0F12" strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={styles.tutorInfo}>
            <View style={[styles.avatarDot, { backgroundColor: partner.faceBg }]}>
              <Text style={styles.avatarInitial}>{partner.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.tutorName}>{partner.name}</Text>
              <View style={styles.liveBadge}>
                <View style={styles.greenPulse} />
                <Text style={styles.liveBadgeText}>Live AI Room</Text>
              </View>
            </View>
          </View>

          {/* End Call Button */}
          <TouchableOpacity onPress={onEndCall} style={styles.endCallButton} activeOpacity={0.85}>
            <PhoneOff size={14} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.endCallText}>End</Text>
          </TouchableOpacity>
        </View>

        {/* Real-time In-Room Evaluation Metrics Bento */}
        <View style={styles.metricsBar}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>88%</Text>
            <Text style={styles.metricLabel}>Fluency</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>94%</Text>
            <Text style={styles.metricLabel}>Grammar</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>86%</Text>
            <Text style={styles.metricLabel}>Pronunciation</Text>
          </View>
        </View>

        {/* Conversation Stream */}
        <ScrollView style={styles.chatArea} showsVerticalScrollIndicator={false}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.bubbleWrapper,
                msg.sender === "user" ? styles.bubbleUserWrapper : styles.bubbleAiWrapper,
              ]}
            >
              {msg.sender === "ai" && (
                <View style={[styles.miniAvatar, { backgroundColor: partner.color }]}>
                  <Text style={styles.miniAvatarText}>{partner.name[0]}</Text>
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.sender === "user" ? styles.bubbleUser : styles.bubbleAi,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    msg.sender === "user" ? styles.bubbleUserText : styles.bubbleAiText,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {isRecording && (
            <View style={styles.listeningNotice}>
              <View style={styles.listeningDot} />
              <Text style={styles.listeningText}>Listening to your voice...</Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Quick Prompts Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {quickPrompts.map((prompt, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSend(prompt)}
              style={styles.chipButton}
              activeOpacity={0.8}
            >
              <Sparkles size={11} color="#8F5BFF" />
              <Text style={styles.chipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Voice & Text Input Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.inputRow}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Or type what you want to say..."
              placeholderTextColor="#A0A3B1"
              style={styles.textInput}
              onSubmitEditing={() => handleSend()}
            />

            {inputText.trim().length > 0 ? (
              <TouchableOpacity onPress={() => handleSend()} style={styles.sendButton} activeOpacity={0.85}>
                <Send size={15} color="#FFFFFF" strokeWidth={2.4} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Large Voice Recording Trigger Button */}
          <View style={styles.voiceRecordSection}>
            <TouchableOpacity
              onPress={toggleMic}
              style={[styles.bigMicButton, isRecording && styles.bigMicButtonActive]}
              activeOpacity={0.85}
            >
              {isRecording ? (
                <MicOff size={26} color="#FFFFFF" strokeWidth={2.4} />
              ) : (
                <Mic size={26} color="#FFFFFF" strokeWidth={2.4} />
              )}
            </TouchableOpacity>
            <Text style={styles.micHintText}>
              {isRecording ? "Tap to Stop & Evaluate" : "Hold or Tap to Speak with " + partner.name}
            </Text>
          </View>
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "#F4F4F8",
    alignItems: "center",
    justifyContent: "center",
  },
  tutorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarDot: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tutorName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F0F12",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#2E8540",
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2E8540",
  },
  endCallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F95E5E",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  endCallText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  metricsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#F8F8FC",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  metricItem: {
    alignItems: "center",
  },
  metricVal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F0F12",
  },
  metricLabel: {
    fontSize: 10,
    color: "#7E8190",
    fontWeight: "600",
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  bubbleWrapper: {
    flexDirection: "row",
    marginVertical: 6,
    maxWidth: "85%",
  },
  bubbleAiWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-end",
    gap: 8,
  },
  bubbleUserWrapper: {
    alignSelf: "flex-end",
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  miniAvatarText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F0F12",
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bubbleAi: {
    backgroundColor: "#F3F2F8",
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: "#0F0F12",
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleAiText: {
    color: "#0F0F12",
    fontWeight: "500",
  },
  bubbleUserText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  listeningNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF3E8",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "center",
    marginTop: 10,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#FF7A00",
  },
  listeningText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E56A00",
  },
  chipsScroll: {
    maxHeight: 38,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  chipButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F4F0FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8F5BFF",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F8",
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: "#0F0F12",
    fontWeight: "500",
  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#8F5BFF",
    alignItems: "center",
    justifyContent: "center",
  },
  voiceRecordSection: {
    alignItems: "center",
    gap: 6,
  },
  bigMicButton: {
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: "#0F0F12",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  bigMicButtonActive: {
    backgroundColor: "#FF3B30",
  },
  micHintText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7E8190",
  },
});
