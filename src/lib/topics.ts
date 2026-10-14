import type { CefrLevel } from "./levels";
import { levelIndex } from "./levels";

export interface Topic {
  id: string;
  title: string;
  titleId: string;
  emoji: string;
  /** Minimum level this topic is recommended for. */
  minLevel: CefrLevel;
  /** Short brief for the AI about what to talk about. */
  brief: string;
}

/** Free-talk practice topics, roughly ordered from easy to hard. */
export const PRACTICE_TOPICS: Topic[] = [
  { id: "intro", title: "Introduce Yourself", titleId: "Perkenalan diri", emoji: "👋", minLevel: "A1", brief: "Get to know the learner: name, where they live, what they do, hobbies." },
  { id: "daily", title: "Daily Routine", titleId: "Rutinitas harian", emoji: "⏰", minLevel: "A1", brief: "The learner's typical day, morning and evening habits, weekends." },
  { id: "food", title: "Food & Cooking", titleId: "Makanan & memasak", emoji: "🍜", minLevel: "A1", brief: "Favourite foods, Indonesian dishes, cooking, eating out." },
  { id: "travel", title: "Travel & Holidays", titleId: "Liburan & perjalanan", emoji: "✈️", minLevel: "A2", brief: "Past trips, dream destinations, travel preferences and stories." },
  { id: "campus", title: "Campus Life", titleId: "Kehidupan kampus", emoji: "🎓", minLevel: "A2", brief: "Classes, professors, dormitories, clubs, student life (very common in TOEFL)." },
  { id: "study", title: "Study Habits", titleId: "Kebiasaan belajar", emoji: "📚", minLevel: "B1", brief: "How the learner studies, group vs individual study, exam preparation, motivation." },
  { id: "tech", title: "Technology & Daily Life", titleId: "Teknologi sehari-hari", emoji: "📱", minLevel: "B1", brief: "Smartphones, social media, AI tools, pros and cons of technology." },
  { id: "work", title: "Jobs & Career", titleId: "Pekerjaan & karier", emoji: "💼", minLevel: "B1", brief: "Career goals, ideal job, remote work, skills for the future." },
  { id: "environment", title: "Environment", titleId: "Lingkungan", emoji: "🌱", minLevel: "B2", brief: "Climate change, pollution, what individuals and governments should do." },
  { id: "education", title: "Education Systems", titleId: "Sistem pendidikan", emoji: "🏫", minLevel: "B2", brief: "Online vs in-person learning, university admissions, role of exams." },
  { id: "science", title: "Science & Research", titleId: "Sains & riset", emoji: "🔬", minLevel: "C1", brief: "Recent discoveries, funding for research, ethics of science." },
  { id: "society", title: "Society & Ethics", titleId: "Masyarakat & etika", emoji: "⚖️", minLevel: "C1", brief: "Urbanisation, inequality, privacy, ethical dilemmas in modern life." },
];

/**
 * Topics for the TOEFL iBT "Take an Interview" task: 4 questions on one topic,
 * moving from personal experience to broader/academic opinions.
 */
export const TOEFL_INTERVIEW_TOPICS: Topic[] = [
  { id: "t-online-learning", title: "Online Learning", titleId: "Belajar online", emoji: "💻", minLevel: "A2", brief: "Experiences with online classes and opinions on the future of online education." },
  { id: "t-part-time", title: "Part-time Jobs for Students", titleId: "Kerja paruh waktu", emoji: "🧑‍🍳", minLevel: "A2", brief: "Working while studying: experiences, benefits, drawbacks." },
  { id: "t-campus-facilities", title: "Campus Facilities", titleId: "Fasilitas kampus", emoji: "🏛️", minLevel: "A2", brief: "Libraries, study spaces, gyms, how universities should spend money." },
  { id: "t-group-projects", title: "Group Projects", titleId: "Kerja kelompok", emoji: "🤝", minLevel: "B1", brief: "Experiences with teamwork, conflicts, whether group grades are fair." },
  { id: "t-social-media", title: "Social Media", titleId: "Media sosial", emoji: "📲", minLevel: "B1", brief: "Personal use of social media and its impact on students and society." },
  { id: "t-city-life", title: "Living in Cities", titleId: "Hidup di kota", emoji: "🏙️", minLevel: "B1", brief: "Where the learner lives, city vs countryside, urban planning." },
  { id: "t-ai-education", title: "AI in Education", titleId: "AI dalam pendidikan", emoji: "🤖", minLevel: "B2", brief: "Using AI tools to study, academic honesty, how AI changes learning." },
  { id: "t-sustainability", title: "Sustainability on Campus", titleId: "Kampus berkelanjutan", emoji: "♻️", minLevel: "B2", brief: "Recycling, energy use, whether universities should lead on sustainability." },
];

export function topicsForLevel(topics: Topic[], level: CefrLevel): Topic[] {
  const li = levelIndex(level);
  return topics.filter((t) => levelIndex(t.minLevel) <= li);
}

export function findTopic(id: string | undefined): Topic | undefined {
  if (!id) return undefined;
  return [...PRACTICE_TOPICS, ...TOEFL_INTERVIEW_TOPICS].find((t) => t.id === id);
}
