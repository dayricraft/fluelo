export interface Partner {
  id: string;
  name: string;
  role: string;
  accent: string;
  level: string;
  color: string;
  faceBg: string;
  greeting: string;
  bio: string;
}

export const PARTNERS: Partner[] = [
  {
    id: "sarah",
    name: "Sarah",
    role: "Patient Tutor",
    accent: "British (London)",
    level: "A1 Beginner",
    color: "#B8F3B8",
    faceBg: "#48B848",
    greeting: "Hi there! I'm Sarah. Don't worry about making mistakes — let's have a fun and relaxed English chat!",
    bio: "Specializes in daily vocabulary, basic grammar, and pronunciation confidence."
  },
  {
    id: "emma",
    name: "Emma",
    role: "Casual Friend",
    accent: "American (California)",
    level: "A2 Elementary",
    color: "#F9A8A8",
    faceBg: "#E05A5A",
    greeting: "Hey! What's up? Tell me about your day or what you did over the weekend!",
    bio: "Focuses on conversational natural speech, idioms, and casual expressions."
  },
  {
    id: "david",
    name: "David",
    role: "Career Coach",
    accent: "American (New York)",
    level: "B1 Intermediate",
    color: "#FDE272",
    faceBg: "#D4B01A",
    greeting: "Good to meet you! Ready to practice your professional English and job interview skills?",
    bio: "Helps with business meetings, pitch presentations, and professional vocabulary."
  },
  {
    id: "sophia",
    name: "Sophia",
    role: "IELTS & Academic",
    accent: "Australian (Sydney)",
    level: "B2 Upper Intermediate",
    color: "#D8C8FF",
    faceBg: "#8F5BFF",
    greeting: "Welcome! Today we'll explore structured speaking topics to boost your lexical resource and coherence.",
    bio: "Ideal for TOEFL/IELTS preparation, complex sentence structures, and academic discussions."
  },
  {
    id: "kenji",
    name: "Kenji",
    role: "Travel Guide",
    accent: "Global English",
    level: "A1 to A2",
    color: "#B5E2FA",
    faceBg: "#3A9ED6",
    greeting: "Konnichiwa! Let's practice ordering food, asking for directions, and travel essentials!",
    bio: "Perfect for travelers, airport navigation, and everyday hospitality scenarios."
  }
];
