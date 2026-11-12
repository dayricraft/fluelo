package com.aibuddy.ui

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Mic
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.data.chat.ChatMessage
import com.aibuddy.data.history.PracticeSession
import com.aibuddy.data.history.SessionModality
import com.aibuddy.data.mode.LearningMode
import com.aibuddy.data.mode.SessionModeState
import com.aibuddy.data.preferences.AppLanguage
import com.aibuddy.data.preferences.ThemeMode
import com.aibuddy.data.preferences.UserPreferences
import com.aibuddy.data.tutor.FeedbackCategory
import com.aibuddy.data.tutor.FeedbackSeverity
import com.aibuddy.data.tutor.TutorFeedback
import com.aibuddy.live.AudioSessionState
import com.aibuddy.ui.chat.ChatScreen
import com.aibuddy.ui.flashcard.FlashcardScreen
import com.aibuddy.ui.flashcard.FlashcardScreenUiState
import com.aibuddy.ui.flashcard.model.FlashcardUiItem
import com.aibuddy.ui.history.*
import com.aibuddy.ui.home.HomeScreen
import com.aibuddy.ui.navigation.AppRoute
import com.aibuddy.ui.settings.SettingsScreen
import com.aibuddy.audio.*
import com.aibuddy.data.network.createDefaultWebSocketTransport
import com.aibuddy.live.GeminiLiveClient
import com.aibuddy.ui.theme.FlueloTheme
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPurple
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun FlueloAppRoot(
    initialRoute: AppRoute = AppRoute.Home,
    audioCaptureService: IAudioCaptureService = remember { createAudioCaptureService() },
    audioPlaybackService: IAudioPlaybackService = remember { createAudioPlaybackService() },
    ttsManager: ITtsManager = remember { createFlashcardTtsManager() }
) {
    var userPreferences by remember {
        mutableStateOf(
            UserPreferences(
                themeMode = ThemeMode.DARK,
                language = AppLanguage.INDONESIAN,
                aiVoice = "Puck",
                userName = "Teman",
                reducedMotion = false,
                hapticFeedbackEnabled = true
            )
        )
    }

    val isDarkTheme = when (userPreferences.themeMode) {
        ThemeMode.DARK -> true
        ThemeMode.LIGHT -> false
        ThemeMode.SYSTEM -> true // Default to dark aesthetic
    }

    val backstack = remember { mutableStateListOf(initialRoute) }
    val currentRoute = backstack.lastOrNull() ?: AppRoute.Home

    fun navigateTo(route: AppRoute) {
        backstack.add(route)
    }

    fun navigateBack() {
        if (backstack.size > 1) {
            backstack.removeAt(backstack.lastIndex)
        }
    }

    val coroutineScope = rememberCoroutineScope()

    val liveClient = remember {
        GeminiLiveClient(
            scope = coroutineScope,
            transport = createDefaultWebSocketTransport(),
            onAudioReceived = { pcmChunk ->
                audioPlaybackService.enqueueAudio(pcmChunk)
            },
            onInterrupted = {
                audioPlaybackService.clearAndInterrupt()
            }
        )
    }

    val liveSessionState by liveClient.sessionState.collectAsState()
    val liveMetrics by liveClient.metrics.collectAsState()
    val liveTranscripts by liveClient.transcripts.collectAsState()
    val liveErrorMessage by liveClient.errorMessage.collectAsState()
    val isTtsSpeaking by ttsManager.isSpeaking.collectAsState()

    var showApiKeyPromptDialog by remember { mutableStateOf(false) }

    fun toggleVoiceCall() {
        if (liveSessionState == AudioSessionState.IDLE || liveSessionState == AudioSessionState.ERROR) {
            if (userPreferences.geminiApiKey.isBlank()) {
                showApiKeyPromptDialog = true
            } else {
                audioPlaybackService.startPlayback(coroutineScope)
                audioCaptureService.startCapture(
                    scope = coroutineScope,
                    onSpeechStateChanged = { isSpeaking ->
                        liveClient.onSpeechStateChanged(isSpeaking)
                    },
                    onAudioChunk = { chunk ->
                        liveClient.sendAudioChunk(chunk)
                    }
                )
                liveClient.connect(userPreferences.geminiApiKey, userPreferences.aiVoice)
            }
        } else {
            liveClient.disconnect()
            audioCaptureService.stopCapture()
            audioPlaybackService.stopPlayback()
        }
    }


    // Sample data for initial multiplatform experience
    val initialPracticeSessions = remember {
        mutableStateListOf(
            PracticeSession(
                id = "session-1",
                timestamp = 1731388800000L,
                title = "Obrolan Santai: Daily Routine",
                modality = SessionModality.CHAT,
                turnCount = 14,
                summarySnippet = "Membahas kebiasaan pagi dan perbaikan penggunaan kata 'wake up' vs 'get up'."
            ),
            PracticeSession(
                id = "session-2",
                timestamp = 1731302400000L,
                title = "Latihan Kosakata: Job Interview",
                modality = SessionModality.CHAT,
                turnCount = 8,
                summarySnippet = "Mempelajari 10 istilah profesional seperti 'collaborate', 'deadline', dan 'objective'."
            )
        )
    }

    // Chat Screen State
    val chatMessages = remember {
        mutableStateListOf(
            ChatMessage(
                id = "welcome-msg",
                text = "Halo! Aku Buddy, teman belajar bahasa Inggrismu. Mau ngobrol santai, latihan kosakata, atau bahas tata bahasa hari ini? Bebas pakai bahasa Indonesia atau Inggris ya!",
                isUser = false,
                timestamp = 1731388800000L
            )
        )
    }
    val chatFeedbacks = remember { mutableStateMapOf<String, TutorFeedback>() }
    var isChatLoading by remember { mutableStateOf(false) }
    var chatSessionModeState by remember { mutableStateOf(SessionModeState(activeMode = LearningMode.FREE_CONVERSATION)) }

    LaunchedEffect(liveTranscripts) {
        if (liveTranscripts.isNotEmpty()) {
            val lastEntry = liveTranscripts.last()
            val existingIndex = chatMessages.indexOfFirst { it.id == lastEntry.id }
            if (existingIndex != -1) {
                chatMessages[existingIndex] = chatMessages[existingIndex].copy(
                    text = lastEntry.text
                )
            } else {
                chatMessages.add(
                    ChatMessage(
                        id = lastEntry.id,
                        text = lastEntry.text,
                        isUser = lastEntry.sender == "You",
                        timestamp = lastEntry.timestamp
                    )
                )
            }
        }
    }

    // Flashcard Screen State (Sample curated 3000-vocabulary items for UI)
    val flashcardDeck = remember {
        mutableStateListOf(
            FlashcardUiItem(
                id = 1,
                headword = "accomplish",
                partOfSpeech = "verb",
                meaningsId = "menyelesaikan; mencapai; menuntaskan suatu tujuan",
                ipa = "/əˈkɑːm.plɪʃ/",
                exampleEn = "She worked hard to accomplish her lifelong dream.",
                exampleId = "Dia bekerja keras untuk mencapai impian seumur hidupnya.",
                isBookmarked = false,
                reviewCount = 0
            ),
            FlashcardUiItem(
                id = 2,
                headword = "resilient",
                partOfSpeech = "adjective",
                meaningsId = "ulet; tangguh; cepat bangkit dari kesulitan",
                ipa = "/rɪˈzɪl.jənt/",
                exampleEn = "Local businesses have proven remarkably resilient during the crisis.",
                exampleId = "Usaha-usaha lokal terbukti sangat tangguh selama masa krisis.",
                isBookmarked = true,
                reviewCount = 2
            ),
            FlashcardUiItem(
                id = 3,
                headword = "articulate",
                partOfSpeech = "verb / adj",
                meaningsId = "menyampaikan gagasan dengan jelas; pandai berbicara",
                ipa = "/ɑːrˈtɪk.jə.lət/",
                exampleEn = "He struggled to articulate his true thoughts in English.",
                exampleId = "Dia berusaha keras untuk mengutarakan pikiran sebenarnya dalam bahasa Inggris.",
                isBookmarked = false,
                reviewCount = 1
            ),
            FlashcardUiItem(
                id = 4,
                headword = "meticulous",
                partOfSpeech = "adjective",
                meaningsId = "sangat teliti; cermat; memperhatikan setiap detail",
                ipa = "/məˈtɪk.jə.ləs/",
                exampleEn = "Her meticulous attention to detail saved the project from failure.",
                exampleId = "Perhatiannya yang sangat teliti terhadap detail menyelamatkan proyek dari kegagalan.",
                isBookmarked = false,
                reviewCount = 0
            ),
            FlashcardUiItem(
                id = 5,
                headword = "endeavor",
                partOfSpeech = "noun / verb",
                meaningsId = "upaya keras; ikhtiar; berusaha sekuat tenaga",
                ipa = "/ɪnˈdev.ər/",
                exampleEn = "We wish you the best of luck in your new career endeavor.",
                exampleId = "Kami mendoakan yang terbaik dalam ikhtiar karier barumu.",
                isBookmarked = true,
                reviewCount = 3
            )
        )
    }

    var flashcardActiveMode by remember { mutableStateOf("EXPLORE") }
    var flashcardReviewFilter by remember { mutableStateOf("ALL_SEEN") }
    var flashcardCurrentIndex by remember { mutableIntStateOf(0) }
    var flashcardIsFlipped by remember { mutableStateOf(false) }

    val activeFlashcard: FlashcardUiItem? = remember(flashcardActiveMode, flashcardReviewFilter, flashcardCurrentIndex, flashcardDeck) {
        val list = if (flashcardActiveMode == "EXPLORE") {
            flashcardDeck
        } else {
            if (flashcardReviewFilter == "BOOKMARKED") flashcardDeck.filter { it.isBookmarked } else flashcardDeck
        }
        if (list.isEmpty()) null else list[flashcardCurrentIndex.coerceIn(0, list.lastIndex)]
    }

    FlueloTheme(darkTheme = isDarkTheme) {
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background
        ) {
            AnimatedContent(
                targetState = currentRoute,
                transitionSpec = {
                    if (userPreferences.reducedMotion) {
                        fadeIn(animationSpec = tween(100)) togetherWith fadeOut(animationSpec = tween(100))
                    } else {
                        fadeIn(animationSpec = tween(220)) togetherWith fadeOut(animationSpec = tween(180))
                    }
                },
                label = "FlueloAppNavigation"
            ) { route ->
                when (route) {
                    is AppRoute.Home -> {
                        HomeScreen(
                            userPreferences = userPreferences,
                            sessionState = liveSessionState,
                            practiceSessions = initialPracticeSessions,
                            onNavigateToConversation = {
                                toggleVoiceCall()
                            },
                            onNavigateToChat = { navigateTo(AppRoute.Chat) },
                            onNavigateToSettings = { navigateTo(AppRoute.Settings) },
                            onNavigateToFlashcards = { navigateTo(AppRoute.Flashcards) },
                            onNavigateToSessionDetail = { sessionId ->
                                navigateTo(AppRoute.SessionDetail(sessionId))
                            },
                            onDeleteSession = { id ->
                                initialPracticeSessions.removeAll { it.id == id }
                            },
                            onClearAllSessions = {
                                initialPracticeSessions.clear()
                            }
                        )
                    }

                    is AppRoute.Chat -> {
                        ChatScreen(
                            messages = chatMessages,
                            isLoading = isChatLoading,
                            errorMessage = null,
                            feedbacks = chatFeedbacks,
                            sessionModeState = chatSessionModeState,
                            isIndonesian = userPreferences.language == AppLanguage.INDONESIAN,
                            hapticFeedbackEnabled = userPreferences.hapticFeedbackEnabled,
                            onSendMessage = { text ->
                                val userMsgId = "msg-${currentTimeEpochMs()}"
                                chatMessages.add(
                                    ChatMessage(
                                        id = userMsgId,
                                        text = text,
                                        isUser = true,
                                        timestamp = currentTimeEpochMs()
                                    )
                                )

                                // Check for common grammatical pattern to display hybrid feedback
                                if (text.contains("I am agree", ignoreCase = true) || text.contains("i am agree", ignoreCase = true)) {
                                    chatFeedbacks[userMsgId] = TutorFeedback(
                                        turnId = userMsgId,
                                        originalText = "I am agree",
                                        correctedText = "I agree",
                                        explanation = "Gunakan 'I agree' tanpa to-be 'am'. Kata 'agree' adalah verb, bukan adjective.",
                                        category = FeedbackCategory.GRAMMAR,
                                        severity = FeedbackSeverity.MODERATE,
                                        spokenNote = "Dalam bahasa Inggris, cukup katakan 'I agree' karena 'agree' adalah kata kerja."
                                    )
                                } else if (text.contains("more better", ignoreCase = true)) {
                                    chatFeedbacks[userMsgId] = TutorFeedback(
                                        turnId = userMsgId,
                                        originalText = "more better",
                                        correctedText = "much better / better",
                                        explanation = "'Better' sudah merupakan bentuk komparatif dari 'good'. Menambahkan 'more' menjadikannya double comparative.",
                                        category = FeedbackCategory.GRAMMAR,
                                        severity = FeedbackSeverity.MODERATE,
                                        spokenNote = "Cukup katakan 'better' ya, tidak perlu menambahkan 'more'."
                                    )
                                }

                                // Buddy AI response simulation
                                isChatLoading = true
                                coroutineScope.launch {
                                    delay(900)
                                    val reply = generateBuddyResponse(text, userPreferences.language == AppLanguage.INDONESIAN)
                                    chatMessages.add(
                                        ChatMessage(
                                            id = "buddy-${currentTimeEpochMs()}",
                                            text = reply,
                                            isUser = false,
                                            timestamp = currentTimeEpochMs()
                                        )
                                    )
                                    isChatLoading = false
                                }
                            },
                            onClearChat = {
                                chatMessages.clear()
                                chatFeedbacks.clear()
                            },
                            onSelectMode = { mode ->
                                chatSessionModeState = chatSessionModeState.copy(activeMode = mode)
                            },
                            onBack = { navigateBack() }
                        )
                    }

                    is AppRoute.Flashcards -> {
                        val reviewCards = if (flashcardReviewFilter == "BOOKMARKED") {
                            flashcardDeck.filter { it.isBookmarked }
                        } else {
                            flashcardDeck
                        }

                        FlashcardScreen(
                            uiState = FlashcardScreenUiState(
                                isLoading = false,
                                currentCard = activeFlashcard,
                                isFlipped = flashcardIsFlipped,
                                seenCount = flashcardDeck.count { it.reviewCount > 0 },
                                totalCount = 3000,
                                bookmarkedCount = flashcardDeck.count { it.isBookmarked },
                                activeMode = flashcardActiveMode,
                                reviewFilter = flashcardReviewFilter,
                                reviewCards = reviewCards,
                                reviewIndex = flashcardCurrentIndex.coerceIn(0, (reviewCards.size - 1).coerceAtLeast(0)),
                                isSpeaking = isTtsSpeaking,
                                isFirstPassCompleted = false
                            ),
                            onBack = { navigateBack() },
                            onSpeakHeadword = {
                                activeFlashcard?.let { card ->
                                    ttsManager.speak(card.headword)
                                }
                            },
                            onSelectMode = { mode ->
                                flashcardActiveMode = mode
                                flashcardCurrentIndex = 0
                                flashcardIsFlipped = false
                            },
                            onSelectReviewFilter = { filter ->
                                flashcardReviewFilter = filter
                                flashcardCurrentIndex = 0
                                flashcardIsFlipped = false
                            },
                            onFlipCard = {
                                flashcardIsFlipped = !flashcardIsFlipped
                            },
                            onToggleBookmark = {
                                activeFlashcard?.let { card ->
                                    val idx = flashcardDeck.indexOfFirst { it.id == card.id }
                                    if (idx != -1) {
                                        flashcardDeck[idx] = flashcardDeck[idx].copy(isBookmarked = !card.isBookmarked)
                                    }
                                }
                            },
                            onNextCard = {
                                flashcardIsFlipped = false
                                val maxIdx = if (flashcardActiveMode == "EXPLORE") {
                                    flashcardDeck.lastIndex
                                } else {
                                    reviewCards.lastIndex
                                }
                                if (flashcardCurrentIndex < maxIdx) {
                                    flashcardCurrentIndex++
                                } else {
                                    flashcardCurrentIndex = 0
                                }
                            },
                            onPreviousCard = {
                                flashcardIsFlipped = false
                                val maxIdx = if (flashcardActiveMode == "EXPLORE") {
                                    flashcardDeck.lastIndex
                                } else {
                                    reviewCards.lastIndex
                                }
                                if (flashcardCurrentIndex > 0) {
                                    flashcardCurrentIndex--
                                } else {
                                    flashcardCurrentIndex = (maxIdx).coerceAtLeast(0)
                                }
                            },
                            reducedMotion = userPreferences.reducedMotion,
                            hapticFeedbackEnabled = userPreferences.hapticFeedbackEnabled
                        )
                    }

                    is AppRoute.Settings -> {
                        SettingsScreen(
                            userPreferences = userPreferences,
                            onThemeModeChange = { mode ->
                                userPreferences = userPreferences.copy(themeMode = mode)
                            },
                            onLanguageChange = { lang ->
                                userPreferences = userPreferences.copy(language = lang)
                            },
                            onAiVoiceChange = { voice ->
                                userPreferences = userPreferences.copy(aiVoice = voice)
                            },
                            onReducedMotionChange = { reduced ->
                                userPreferences = userPreferences.copy(reducedMotion = reduced)
                            },
                            onHapticFeedbackChange = { haptic ->
                                userPreferences = userPreferences.copy(hapticFeedbackEnabled = haptic)
                            },
                            onGeminiApiKeyChange = { key ->
                                userPreferences = userPreferences.copy(geminiApiKey = key)
                            },
                            onBack = { navigateBack() }
                        )
                    }

                    is AppRoute.SessionDetail -> {
                        val session = initialPracticeSessions.find { it.id == route.sessionId }
                        val detailData = SessionDetailUiData(
                            sessionId = route.sessionId,
                            title = session?.title ?: "Detail Percakapan",
                            modality = if (session?.modality == SessionModality.VOICE) "VOICE" else "CHAT",
                            primaryMode = "CONVERSATION",
                            durationSeconds = 185,
                            startTimeEpochMs = session?.timestamp ?: 1731388800000L,
                            messages = listOf(
                                SessionMessageUiItem(
                                    messageId = "m-1",
                                    sender = "USER",
                                    content = "Hello Buddy, how do I say 'saya setuju dengan ide kamu'?",
                                    timestampEpochMs = 1731388810000L
                                ),
                                SessionMessageUiItem(
                                    messageId = "m-2",
                                    sender = "BUDDY",
                                    content = "You can say: 'I agree with your idea' or 'I am on board with your suggestion!'.",
                                    timestampEpochMs = 1731388820000L
                                ),
                                SessionMessageUiItem(
                                    messageId = "m-3",
                                    sender = "USER",
                                    content = "Ah I see, I am agree with your explanation!",
                                    timestampEpochMs = 1731388835000L,
                                    correction = TutorFeedback(
                                        turnId = "m-3",
                                        originalText = "I am agree",
                                        correctedText = "I agree with your explanation",
                                        explanation = "'Agree' adalah verb (kata kerja), jadi tidak memerlukan to-be.",
                                        category = FeedbackCategory.GRAMMAR,
                                        severity = FeedbackSeverity.MODERATE,
                                        spokenNote = "Katakan 'I agree' ya, jangan pakai 'am'."
                                    )
                                ),
                                SessionMessageUiItem(
                                    messageId = "m-4",
                                    sender = "BUDDY",
                                    content = "Awesome progress! Keep practicing sentences with 'agree'.",
                                    timestampEpochMs = 1731388845000L
                                )
                            ),
                            summary = SessionSummaryUiItem(
                                topics = listOf("Daily English", "Expressing Agreement"),
                                vocabulary = listOf("agree", "suggestion", "on board"),
                                grammarHighlights = listOf("Verb vs Adjective with to-be (I agree vs I am happy)"),
                                generalFeedback = "Percakapan mengalir sangat baik dengan antusiasme tinggi!"
                            )
                        )

                        SessionDetailScreen(
                            data = detailData,
                            isIndonesian = userPreferences.language == AppLanguage.INDONESIAN,
                            onBack = { navigateBack() },
                            onDeleteSession = {
                                initialPracticeSessions.removeAll { it.id == route.sessionId }
                                navigateBack()
                            }
                        )
                    }
                }
            }

            // Modal API Key Prompt for Voice Call
            if (showApiKeyPromptDialog) {
                AlertDialog(
                    onDismissRequest = { showApiKeyPromptDialog = false },
                    icon = {
                        Icon(
                            imageVector = Icons.Outlined.Mic,
                            contentDescription = null,
                            tint = NeonLime,
                            modifier = Modifier.size(36.dp)
                        )
                    },
                    title = {
                        Text(
                            text = if (userPreferences.language == AppLanguage.INDONESIAN)
                                "Aktifkan Panggilan Suara Live"
                            else
                                "Enable Live Voice Call",
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center
                        )
                    },
                    text = {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = if (userPreferences.language == AppLanguage.INDONESIAN)
                                    "Untuk berbicara langsung secara bilingual dengan Buddy via audio real-time Gemini Live, silakan masukkan Gemini API Key Anda di Pengaturan."
                                else
                                    "To speak directly in real-time with Buddy via Gemini Live audio, please configure your Gemini API Key in Settings.",
                                fontSize = 14.sp,
                                lineHeight = 20.sp,
                                textAlign = TextAlign.Center,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = SoftPurple.copy(alpha = 0.15f),
                                modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
                            ) {
                                Text(
                                    text = if (userPreferences.language == AppLanguage.INDONESIAN)
                                        "🔒 Kunci Anda tersimpan aman hanya di penyimpanan lokal perangkat."
                                    else
                                        "🔒 Your key is securely stored only on your local device.",
                                    fontSize = 12.sp,
                                    lineHeight = 16.sp,
                                    color = SoftPurple,
                                    modifier = Modifier.padding(10.dp),
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                showApiKeyPromptDialog = false
                                navigateTo(AppRoute.Settings)
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = NeonLime),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                text = if (userPreferences.language == AppLanguage.INDONESIAN) "Buka Pengaturan" else "Open Settings",
                                color = Color.Black,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showApiKeyPromptDialog = false }) {
                            Text(
                                text = if (userPreferences.language == AppLanguage.INDONESIAN) "Nanti Saja" else "Later",
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                )
            }
        }
    }
}

private fun currentTimeEpochMs(): Long {
    return com.aibuddy.util.currentTimeEpochMillis()
}

private fun generateBuddyResponse(userText: String, isIndonesian: Boolean): String {
    val lower = userText.lowercase()
    return when {
        lower.contains("halo") || lower.contains("hi") || lower.contains("hello") -> {
            if (isIndonesian) "Halo! Senang bisa ngobrol lagi. Apa yang mau kita latih hari ini?" else "Hello! Great to hear from you. What would you like to practice today?"
        }
        lower.contains("interview") -> {
            "Great! Let's practice job interviews. 'Tell me about yourself and your greatest strength?' Take your time to answer!"
        }
        lower.contains("vocab") || lower.contains("kata") -> {
            "Keren! Mari pelajari kata baru: 'Accomplish' (verb) artinya menyelesaikan atau mencapai target. Coba buat satu kalimat menggunakan kata tersebut!"
        }
        lower.contains("grammar") || lower.contains("tata bahasa") -> {
            "Untuk grammar, ingat rumus Present Perfect Tense: 'Subject + have/has + Past Participle (V3)'. Contoh: 'I have visited Bali twice.' Coba giliranmu!"
        }
        else -> {
            if (isIndonesian) {
                "Gagasan yang menarik! Kalimatmu sudah mudah dipahami. Terus gunakan kosakata baru ya, aku siap menemani setiap hari!"
            } else {
                "That's really interesting! Your expression is clear. Let's keep exploring new topics together!"
            }
        }
    }
}
