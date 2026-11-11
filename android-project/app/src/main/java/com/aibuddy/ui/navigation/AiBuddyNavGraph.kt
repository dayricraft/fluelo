package com.aibuddy.ui.navigation

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.FastOutLinearInEasing
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.aibuddy.ui.M0FeasibilityScreen
import com.aibuddy.ui.chat.ChatScreen
import com.aibuddy.ui.home.HomeScreen
import com.aibuddy.ui.conversation.ConversationScreen
import com.aibuddy.ui.history.SessionDetailScreen
import com.aibuddy.ui.settings.SettingsScreen
import com.aibuddy.ui.viewmodel.ChatViewModel
import com.aibuddy.ui.viewmodel.LiveSessionViewModel
import com.aibuddy.ui.viewmodel.SettingsViewModel
import com.aibuddy.ui.flashcard.FlashcardScreen
import com.aibuddy.ui.flashcard.FlashcardViewModel

@Composable
fun AiBuddyNavGraph(
    navController: NavHostController = rememberNavController(),
    liveSessionViewModel: LiveSessionViewModel = viewModel(),
    settingsViewModel: SettingsViewModel = viewModel(),
    chatViewModel: ChatViewModel = viewModel()
) {
    val context = LocalContext.current
    val userPreferences by settingsViewModel.userPreferences.collectAsState()

    val sessionState by liveSessionViewModel.sessionState.collectAsState()
    val transcripts by liveSessionViewModel.transcripts.collectAsState()
    val metrics by liveSessionViewModel.metrics.collectAsState()
    val errorMessage by liveSessionViewModel.errorMessage.collectAsState()
    val micAmplitude by liveSessionViewModel.micAmplitude.collectAsState()
    val speakerAmplitude by liveSessionViewModel.speakerAmplitude.collectAsState()
    val isMuted by liveSessionViewModel.isMuted.collectAsState()
    val transcriptSheetState by liveSessionViewModel.transcriptSheetState.collectAsState()

    var hasMicPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasMicPermission = isGranted
    }

    val isReducedMotion = userPreferences.reducedMotion

    NavHost(
        navController = navController,
        startDestination = Screen.Home.route,
        enterTransition = {
            if (isReducedMotion) {
                fadeIn(animationSpec = tween(120))
            } else {
                slideInHorizontally(
                    initialOffsetX = { fullWidth -> fullWidth / 6 },
                    animationSpec = tween(280, easing = FastOutSlowInEasing)
                ) + fadeIn(animationSpec = tween(200))
            }
        },
        exitTransition = {
            if (isReducedMotion) {
                fadeOut(animationSpec = tween(120))
            } else {
                slideOutHorizontally(
                    targetOffsetX = { fullWidth -> -fullWidth / 6 },
                    animationSpec = tween(240, easing = FastOutLinearInEasing)
                ) + fadeOut(animationSpec = tween(180))
            }
        },
        popEnterTransition = {
            if (isReducedMotion) {
                fadeIn(animationSpec = tween(120))
            } else {
                slideInHorizontally(
                    initialOffsetX = { fullWidth -> -fullWidth / 6 },
                    animationSpec = tween(280, easing = FastOutSlowInEasing)
                ) + fadeIn(animationSpec = tween(200))
            }
        },
        popExitTransition = {
            if (isReducedMotion) {
                fadeOut(animationSpec = tween(120))
            } else {
                slideOutHorizontally(
                    targetOffsetX = { fullWidth -> fullWidth / 6 },
                    animationSpec = tween(240, easing = FastOutLinearInEasing)
                ) + fadeOut(animationSpec = tween(180))
            }
        }
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                userPreferences = userPreferences,
                sessionState = sessionState,
                onNavigateToConversation = {
                    navController.navigate(Screen.Conversation.route)
                },
                onNavigateToChat = {
                    navController.navigate(Screen.Chat.route)
                },
                onNavigateToSettings = {
                    navController.navigate(Screen.Settings.route)
                },
                onNavigateToDiagnostic = {
                    navController.navigate(Screen.DiagnosticM0.route)
                },
                onNavigateToFlashcards = {
                    navController.navigate(Screen.Flashcards.route)
                },
                onNavigateToSessionDetail = { sessionId ->
                    navController.navigate(Screen.SessionDetail.createRoute(sessionId))
                }
            )
        }

        composable(Screen.Chat.route) {
            val chatMessages by chatViewModel.messages.collectAsState()
            val isChatLoading by chatViewModel.isLoading.collectAsState()
            val chatError by chatViewModel.errorMessage.collectAsState()
            val chatFeedbacks by chatViewModel.feedbacks.collectAsState()
            val sessionModeState by chatViewModel.sessionModeState.collectAsState()

            ChatScreen(
                messages = chatMessages,
                isLoading = isChatLoading,
                errorMessage = chatError,
                feedbacks = chatFeedbacks,
                sessionModeState = sessionModeState,
                isIndonesian = userPreferences.language == com.aibuddy.data.preferences.AppLanguage.INDONESIAN,
                hapticFeedbackEnabled = userPreferences.hapticFeedbackEnabled,
                onSendMessage = { text ->
                    chatViewModel.sendMessage(text)
                },
                onClearChat = {
                    chatViewModel.clearChat()
                },
                onSelectMode = { mode ->
                    chatViewModel.setLearningMode(mode)
                },
                onSkipExercise = {
                    chatViewModel.skipCurrentQuestion()
                },
                onRepeatExercise = {
                    chatViewModel.repeatCurrentQuestion()
                },
                onStopExercise = {
                    chatViewModel.stopCurrentExercise()
                },
                onResumeExercise = {
                    chatViewModel.resumePreviousExercise()
                },
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.Conversation.route) {
            val liveFeedbacks by liveSessionViewModel.feedbacks.collectAsState()
            val liveModeState by liveSessionViewModel.sessionModeState.collectAsState()

            ConversationScreen(
                sessionState = sessionState,
                transcripts = transcripts,
                micAmplitude = micAmplitude,
                speakerAmplitude = speakerAmplitude,
                isMuted = isMuted,
                errorMessage = errorMessage,
                transcriptSheetState = transcriptSheetState,
                userPreferences = userPreferences,
                feedbacks = liveFeedbacks,
                sessionModeState = liveModeState,
                onSkipExercise = {
                    liveSessionViewModel.skipCurrentQuestion()
                },
                onRepeatExercise = {
                    liveSessionViewModel.repeatCurrentQuestion()
                },
                onStopExercise = {
                    liveSessionViewModel.stopCurrentExercise()
                },
                onResumeExercise = {
                    liveSessionViewModel.resumePreviousExercise()
                },
                onSelectMode = { mode ->
                    liveSessionViewModel.setLearningMode(mode)
                },
                onToggleCall = { voiceName ->
                    liveSessionViewModel.toggleCall(voiceName)
                },
                onToggleMute = {
                    liveSessionViewModel.toggleMute()
                },
                onManualInterrupt = {
                    liveSessionViewModel.manualBargeIn()
                },
                onToggleTranscript = {
                    liveSessionViewModel.toggleTranscript()
                },
                onSetTranscriptSheetState = { state ->
                    liveSessionViewModel.setTranscriptSheetState(state)
                },
                onSendTextMessage = { text ->
                    liveSessionViewModel.sendTextMessage(text)
                },
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                userPreferences = userPreferences,
                onThemeModeChange = { mode ->
                    settingsViewModel.setThemeMode(mode)
                },
                onLanguageChange = { lang ->
                    settingsViewModel.setLanguage(lang)
                },
                onAiVoiceChange = { voice ->
                    settingsViewModel.setAiVoice(voice)
                },
                onReducedMotionChange = { enabled ->
                    settingsViewModel.setReducedMotion(enabled)
                },
                onHapticFeedbackChange = { enabled ->
                    settingsViewModel.setHapticFeedback(enabled)
                },
                onNavigateToDiagnostic = {
                    navController.navigate(Screen.DiagnosticM0.route)
                },
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.DiagnosticM0.route) {
            M0FeasibilityScreen(
                sessionState = sessionState,
                metrics = metrics,
                transcripts = transcripts,
                micAmplitude = micAmplitude,
                speakerAmplitude = speakerAmplitude,
                isMuted = isMuted,
                errorMessage = errorMessage,
                hasMicPermission = hasMicPermission,
                onRequestPermission = {
                    permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                },
                onToggleCall = {
                    liveSessionViewModel.toggleCall(userPreferences.aiVoice)
                },
                onToggleMute = {
                    liveSessionViewModel.toggleMute()
                },
                onManualInterrupt = {
                    liveSessionViewModel.manualBargeIn()
                },
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.Flashcards.route) {
            val flashcardViewModel: FlashcardViewModel = viewModel(
                factory = object : androidx.lifecycle.ViewModelProvider.Factory {
                    @Suppress("UNCHECKED_CAST")
                    override fun <T : androidx.lifecycle.ViewModel> create(modelClass: Class<T>): T {
                        return FlashcardViewModel(
                            application = context.applicationContext as android.app.Application,
                            getAudioSessionState = { liveSessionViewModel.sessionState.value }
                        ) as T
                    }
                }
            )
            FlashcardScreen(
                viewModel = flashcardViewModel,
                userPreferences = userPreferences,
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(
            route = Screen.SessionDetail.route,
            arguments = listOf(androidx.navigation.navArgument("sessionId") { type = androidx.navigation.NavType.StringType })
        ) { backStackEntry ->
            val sessionId = backStackEntry.arguments?.getString("sessionId") ?: ""
            SessionDetailScreen(
                sessionId = sessionId,
                isIndonesian = userPreferences.language == com.aibuddy.data.preferences.AppLanguage.INDONESIAN,
                onBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}
