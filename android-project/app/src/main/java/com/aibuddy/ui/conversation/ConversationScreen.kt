package com.aibuddy.ui.conversation

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.aibuddy.data.preferences.AppLanguage
import com.aibuddy.data.preferences.UserPreferences
import com.aibuddy.live.AudioSessionState
import com.aibuddy.live.LiveTranscriptEntry
import com.aibuddy.ui.components.BuddyAvatar
import com.aibuddy.ui.components.ChromaticCatCharacter
import com.aibuddy.ui.components.MarkdownText
import com.aibuddy.ui.components.RadialGradientBackground
import com.aibuddy.ui.theme.*
import com.aibuddy.ui.viewmodel.TranscriptSheetState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConversationScreen(
    sessionState: AudioSessionState,
    transcripts: List<LiveTranscriptEntry>,
    micAmplitude: Float,
    speakerAmplitude: Float,
    isMuted: Boolean,
    errorMessage: String?,
    transcriptSheetState: TranscriptSheetState,
    userPreferences: UserPreferences,
    feedbacks: Map<String, com.aibuddy.data.tutor.TutorFeedback> = emptyMap(),
    sessionModeState: com.aibuddy.data.mode.SessionModeState = com.aibuddy.data.mode.SessionModeState(),
    onSkipExercise: () -> Unit = {},
    onRepeatExercise: () -> Unit = {},
    onStopExercise: () -> Unit = {},
    onResumeExercise: () -> Unit = {},
    onSelectMode: (com.aibuddy.data.mode.LearningMode) -> Unit = {},
    onToggleCall: (voiceName: String) -> Unit,
    onToggleMute: () -> Unit,
    onManualInterrupt: () -> Unit,
    onToggleTranscript: () -> Unit,
    onSetTranscriptSheetState: (TranscriptSheetState) -> Unit,
    onSendTextMessage: (String) -> Unit,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
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
        if (isGranted) {
            onToggleCall(userPreferences.aiVoice)
        }
    }

    val isIndonesian = userPreferences.language == AppLanguage.INDONESIAN
    val listState = rememberLazyListState()
    var inCallInputText by remember { mutableStateOf("") }
    var showModeSheet by remember { mutableStateOf(false) }

    // Auto-scroll transcript when new items arrive
    LaunchedEffect(transcripts.size, transcripts.lastOrNull()?.text?.length) {
        if (transcripts.isNotEmpty()) {
            listState.animateScrollToItem(transcripts.lastIndex)
        }
    }

    if (showModeSheet) {
        AlertDialog(
            onDismissRequest = { showModeSheet = false },
            title = {
                Text(
                    text = if (isIndonesian) "Pilih Mode Belajar" else "Select Learning Mode",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    com.aibuddy.data.mode.LearningMode.entries.forEach { mode ->
                        val isSelected = sessionModeState.activeMode == mode
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (isSelected) NeonLime.copy(alpha = 0.18f) else MaterialTheme.colorScheme.surface,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .border(
                                    1.dp,
                                    if (isSelected) NeonLime else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f),
                                    RoundedCornerShape(12.dp)
                                )
                                .clickable {
                                    showModeSheet = false
                                    onSelectMode(mode)
                                }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = if (isIndonesian) mode.displayNameId else mode.displayNameEn,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = if (isSelected) NeonLime else MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = when (mode) {
                                            com.aibuddy.data.mode.LearningMode.FREE_CONVERSATION -> if (isIndonesian) "Ngobrol bebas santai dengan Buddy" else "Free casual conversation"
                                            com.aibuddy.data.mode.LearningMode.VOCABULARY -> if (isIndonesian) "Latihan kosakata kata-per-kata" else "Word-by-word vocabulary drills"
                                            com.aibuddy.data.mode.LearningMode.GRAMMAR -> if (isIndonesian) "Penjelasan & drill tata bahasa" else "Grammar concepts and drills"
                                            com.aibuddy.data.mode.LearningMode.ROLEPLAY -> if (isIndonesian) "Simulasi situasi nyata (interview, cafe)" else "Real-world conversational simulation"
                                        },
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = NeonLime,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showModeSheet = false }) {
                    Text(if (isIndonesian) "Tutup" else "Close", color = NeonLime)
                }
            },
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            shape = RoundedCornerShape(20.dp)
        )
    }

    val isCallActive = sessionState != AudioSessionState.IDLE && sessionState != AudioSessionState.ERROR

    RadialGradientBackground(
        glowColor = SoftPurple,
        glowStrength = 0.35f
    ) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Back Button
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = if (isIndonesian) "Kembali ke Beranda" else "Back to Home",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    // AI Buddy Chip + Status + Mode Chip
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(50))
                                    .background(NeonLime)
                                    .padding(horizontal = 12.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "AI Buddy",
                                    color = Color.Black,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            com.aibuddy.ui.components.ModeBadgeChip(
                                sessionModeState = sessionModeState,
                                isIndonesian = isIndonesian,
                                onClick = { showModeSheet = true }
                            )
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            val statusDotColor = when (sessionState) {
                                AudioSessionState.LISTENING, AudioSessionState.BUDDY_SPEAKING -> NeonLime
                                AudioSessionState.USER_SPEAKING, AudioSessionState.PROCESSING -> SoftPurple
                                AudioSessionState.CONNECTING, AudioSessionState.RECONNECTING -> WarningAmber
                                AudioSessionState.ERROR -> ErrorRed
                                else -> MaterialTheme.colorScheme.onSurfaceVariant
                            }

                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(statusDotColor)
                            )

                            Text(
                                text = getStatusLabel(sessionState, isIndonesian),
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }

                    // Toggle Transcript Button (Cycle: Hidden -> Peek -> Expanded)
                    IconButton(
                        onClick = onToggleTranscript,
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                when (transcriptSheetState) {
                                    TranscriptSheetState.EXPANDED -> NeonLime
                                    TranscriptSheetState.PEEK -> SoftPurple.copy(alpha = 0.35f)
                                    TranscriptSheetState.HIDDEN -> MaterialTheme.colorScheme.surfaceVariant
                                }
                            )
                    ) {
                        Icon(
                            imageVector = when (transcriptSheetState) {
                                TranscriptSheetState.EXPANDED -> Icons.Filled.ChatBubble
                                TranscriptSheetState.PEEK -> Icons.Outlined.ChatBubble
                                TranscriptSheetState.HIDDEN -> Icons.Outlined.ChatBubbleOutline
                            },
                            contentDescription = if (isIndonesian) "Ganti Tampilan Transkrip" else "Toggle Transcript View",
                            tint = if (transcriptSheetState == TranscriptSheetState.EXPANDED) Color.Black else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(horizontal = 16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Error Banner
                if (errorMessage != null) {
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.15f)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = ErrorRed,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = errorMessage,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontSize = 12.sp,
                                lineHeight = 16.sp,
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }

                // Active Exercise Progress Card
                val activeExercise = sessionModeState.activeExercise
                AnimatedVisibility(visible = activeExercise != null) {
                    if (activeExercise != null) {
                        com.aibuddy.ui.components.ExerciseProgressCard(
                            exercise = activeExercise,
                            isIndonesian = isIndonesian,
                            onSkip = onSkipExercise,
                            onRepeat = onRepeatExercise,
                            onStop = onStopExercise,
                            onResume = onResumeExercise,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }
                }

                val activeAmplitude = if (sessionState == AudioSessionState.BUDDY_SPEAKING) {
                    speakerAmplitude
                } else {
                    micAmplitude
                }

                // 3 Display Modes: HIDDEN, PEEK, EXPANDED
                when (transcriptSheetState) {
                    TranscriptSheetState.HIDDEN -> {
                        // Center Mascot + Latest Bubble
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                ChromaticCatCharacter(
                                    sessionState = sessionState,
                                    audioAmplitude = activeAmplitude,
                                    reducedMotion = userPreferences.reducedMotion,
                                    modifier = Modifier.size(230.dp)
                                )

                                Spacer(modifier = Modifier.height(20.dp))

                                val latestTurn = transcripts.lastOrNull()
                                if (latestTurn != null && latestTurn.text.isNotBlank()) {
                                    Card(
                                        shape = RoundedCornerShape(16.dp),
                                        colors = CardDefaults.cardColors(
                                            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.85f)
                                        ),
                                        modifier = Modifier
                                            .fillMaxWidth(0.92f)
                                            .padding(horizontal = 8.dp)
                                            .clickable {
                                                onSetTranscriptSheetState(TranscriptSheetState.PEEK)
                                            }
                                    ) {
                                        Column(modifier = Modifier.padding(14.dp)) {
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.SpaceBetween,
                                                verticalAlignment = Alignment.CenterVertically
                                            ) {
                                                Text(
                                                    text = if (latestTurn.sender == "Buddy") "Buddy" else (if (isIndonesian) "Anda" else "You"),
                                                    color = if (latestTurn.sender == "Buddy") SoftPurple else NeonLime,
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                                if (!latestTurn.isFinal) {
                                                    Text(
                                                        text = if (isIndonesian) "Sedang berbicara..." else "Speaking...",
                                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                        fontSize = 10.sp
                                                    )
                                                }
                                            }
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                text = latestTurn.text,
                                                color = MaterialTheme.colorScheme.onSurface,
                                                fontSize = 14.sp,
                                                lineHeight = 20.sp,
                                                fontWeight = FontWeight.Medium
                                            )
                                        }
                                    }
                                } else {
                                    Text(
                                        text = if (!isCallActive) {
                                            if (isIndonesian) "Tekan tombol telepon untuk mulai panggilan" else "Tap call button to start voice session"
                                        } else {
                                            if (isIndonesian) "Mendengarkan... Silakan berbicara" else "Listening... Go ahead and speak"
                                        },
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontSize = 14.sp,
                                        textAlign = TextAlign.Center
                                    )
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                // Quick Affordance to open Peek Text Input
                                Surface(
                                    shape = RoundedCornerShape(20.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(20.dp))
                                        .clickable {
                                            onSetTranscriptSheetState(TranscriptSheetState.PEEK)
                                        }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Outlined.Keyboard,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Text(
                                            text = if (isIndonesian) "Buka Transkrip / Ketik Pesan" else "Open Transcript / Type Message",
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Medium
                                        )
                                    }
                                }
                            }
                        }

                        // Bottom Voice Controls
                        VoiceControlsBar(
                            isCallActive = isCallActive,
                            isMuted = isMuted,
                            sessionState = sessionState,
                            hasMicPermission = hasMicPermission,
                            aiVoice = userPreferences.aiVoice,
                            reducedMotion = userPreferences.reducedMotion,
                            hapticFeedbackEnabled = userPreferences.hapticFeedbackEnabled,
                            onToggleMute = onToggleMute,
                            onToggleCall = onToggleCall,
                            onManualInterrupt = onManualInterrupt,
                            onRequestPermission = { permissionLauncher.launch(Manifest.permission.RECORD_AUDIO) }
                        )
                    }

                    TranscriptSheetState.PEEK -> {
                        // Top: Compact Mascot (continues to animate audio amplitude)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(140.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            ChromaticCatCharacter(
                                sessionState = sessionState,
                                audioAmplitude = activeAmplitude,
                                reducedMotion = userPreferences.reducedMotion,
                                modifier = Modifier.size(130.dp)
                            )
                        }

                        // Bottom: Peek Sheet with Recent Turns + In-Call Text Input
                        Card(
                            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.92f)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 14.dp, vertical = 10.dp),
                                verticalArrangement = Arrangement.SpaceBetween
                            ) {
                                // Sheet Handle & Controls Header
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = if (isIndonesian) "Transkrip Langsung" else "Live Transcript",
                                        color = MaterialTheme.colorScheme.onSurface,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold
                                    )

                                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        IconButton(
                                            onClick = { onSetTranscriptSheetState(TranscriptSheetState.EXPANDED) },
                                            modifier = Modifier.size(32.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Outlined.ExpandLess,
                                                contentDescription = if (isIndonesian) "Perluas Transkrip" else "Expand Transcript",
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                        IconButton(
                                            onClick = { onSetTranscriptSheetState(TranscriptSheetState.HIDDEN) },
                                            modifier = Modifier.size(32.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Outlined.Close,
                                                contentDescription = if (isIndonesian) "Tutup Panel" else "Close Panel",
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }

                                // Recent Messages List
                                LazyColumn(
                                    state = listState,
                                    modifier = Modifier
                                        .weight(1f)
                                        .fillMaxWidth()
                                        .padding(vertical = 6.dp),
                                    verticalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    if (transcripts.isEmpty()) {
                                        item {
                                            Box(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(24.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(
                                                    text = if (isIndonesian)
                                                        "Mulai berbicara atau ketik pesan di bawah ini."
                                                    else
                                                        "Start speaking or type a message below.",
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                    fontSize = 13.sp,
                                                    textAlign = TextAlign.Center
                                                )
                                            }
                                        }
                                    } else {
                                        items(transcripts, key = { it.id }) { entry ->
                                            ConversationTranscriptBubble(
                                                entry = entry,
                                                feedback = feedbacks[entry.id],
                                                isIndonesian = isIndonesian
                                            )
                                        }
                                    }
                                }

                                // In-Call Text Input Bar + Compact Call Action
                                InCallTextInputBar(
                                    inputText = inCallInputText,
                                    onInputTextChanged = { inCallInputText = it },
                                    isCallActive = isCallActive,
                                    hapticFeedbackEnabled = userPreferences.hapticFeedbackEnabled,
                                    onSend = { text ->
                                        onSendTextMessage(text)
                                        inCallInputText = ""
                                    },
                                    placeholder = if (isIndonesian) "Ketik pesan untuk Buddy..." else "Type a message to Buddy..."
                                )
                            }
                        }
                    }

                    TranscriptSheetState.EXPANDED -> {
                        // Full Expanded Transcript Sheet
                        Card(
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.92f)
                            ),
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(horizontal = 14.dp, vertical = 12.dp)
                            ) {
                                // Header: Title + Minimize Actions
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        BuddyAvatar(size = 24.dp)
                                        Text(
                                            text = if (isIndonesian) "Transkrip Percakapan Lengkap" else "Full Conversation Transcript",
                                            color = MaterialTheme.colorScheme.onSurface,
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }

                                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        IconButton(
                                            onClick = { onSetTranscriptSheetState(TranscriptSheetState.PEEK) },
                                            modifier = Modifier.size(36.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Outlined.ExpandMore,
                                                contentDescription = if (isIndonesian) "Kecilkan ke Peek" else "Collapse to Peek",
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                        IconButton(
                                            onClick = { onSetTranscriptSheetState(TranscriptSheetState.HIDDEN) },
                                            modifier = Modifier.size(36.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Outlined.Close,
                                                contentDescription = if (isIndonesian) "Tutup Transkrip" else "Close Transcript",
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                // Full Scrollable Transcript List
                                LazyColumn(
                                    state = listState,
                                    modifier = Modifier
                                        .weight(1f)
                                        .fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    if (transcripts.isEmpty()) {
                                        item {
                                            Box(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(top = 40.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(
                                                    text = if (isIndonesian)
                                                        "Belum ada transkrip. Mulai berbicara atau ketik pesan untuk mengobrol."
                                                    else
                                                        "No transcript yet. Start speaking or type to chat.",
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                    fontSize = 13.sp,
                                                    textAlign = TextAlign.Center
                                                )
                                            }
                                        }
                                    } else {
                                        items(transcripts, key = { it.id }) { entry ->
                                            ConversationTranscriptBubble(
                                                entry = entry,
                                                feedback = feedbacks[entry.id],
                                                isIndonesian = isIndonesian
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                // In-Call Text Input Bar
                                InCallTextInputBar(
                                    inputText = inCallInputText,
                                    onInputTextChanged = { inCallInputText = it },
                                    isCallActive = isCallActive,
                                    hapticFeedbackEnabled = userPreferences.hapticFeedbackEnabled,
                                    onSend = { text ->
                                        onSendTextMessage(text)
                                        inCallInputText = ""
                                    },
                                    placeholder = if (isIndonesian) "Ketik pesan ke Buddy..." else "Type message to Buddy..."
                                )
                            }
                        }

                        // Compact Call Control Strip for Expanded Mode
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .navigationBarsPadding()
                                .padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.SpaceEvenly,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            IconButton(
                                onClick = {
                                    if (userPreferences.hapticFeedbackEnabled) {
                                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    }
                                    onToggleMute()
                                },
                                enabled = isCallActive,
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(if (isMuted) ErrorRed.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                Icon(
                                    imageVector = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                                    contentDescription = if (isMuted) "Unmute Mic" else "Mute Mic",
                                    tint = if (isMuted) ErrorRed else MaterialTheme.colorScheme.onSurface
                                )
                            }

                            Button(
                                onClick = {
                                    if (userPreferences.hapticFeedbackEnabled) {
                                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                    }
                                    if (hasMicPermission) {
                                        onToggleCall(userPreferences.aiVoice)
                                    } else {
                                        permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isCallActive) ErrorRed.copy(alpha = 0.85f) else NeonLime,
                                    contentColor = if (isCallActive) Color.White else Color.Black
                                ),
                                shape = RoundedCornerShape(20.dp),
                                modifier = Modifier.height(44.dp)
                            ) {
                                Icon(
                                    imageVector = if (isCallActive) Icons.Default.CallEnd else Icons.Default.Call,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = if (isCallActive) {
                                        if (isIndonesian) "Akhiri Panggilan" else "End Call"
                                    } else {
                                        if (isIndonesian) "Mulai Bicara" else "Start Voice"
                                    },
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }

                            IconButton(
                                onClick = {
                                    if (userPreferences.hapticFeedbackEnabled) {
                                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    }
                                    onManualInterrupt()
                                },
                                enabled = sessionState == AudioSessionState.BUDDY_SPEAKING,
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (sessionState == AudioSessionState.BUDDY_SPEAKING) SoftPurple.copy(alpha = 0.25f)
                                        else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                    )
                            ) {
                                Icon(
                                    imageVector = Icons.Default.FrontHand,
                                    contentDescription = "Interupsi",
                                    tint = if (sessionState == AudioSessionState.BUDDY_SPEAKING) SoftPurple else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun VoiceControlsBar(
    isCallActive: Boolean,
    isMuted: Boolean,
    sessionState: AudioSessionState,
    hasMicPermission: Boolean,
    aiVoice: String,
    reducedMotion: Boolean = false,
    hapticFeedbackEnabled: Boolean = true,
    onToggleMute: () -> Unit,
    onToggleCall: (String) -> Unit,
    onManualInterrupt: () -> Unit,
    onRequestPermission: () -> Unit
) {
    val haptic = LocalHapticFeedback.current
    val callInteractionSource = remember { MutableInteractionSource() }
    val isCallPressed by callInteractionSource.collectIsPressedAsState()
    val pressScale by animateFloatAsState(
        targetValue = if (isCallPressed) 0.94f else 1.0f,
        animationSpec = spring(stiffness = Spring.StiffnessMediumLow),
        label = "callBtnPressScale"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(vertical = 20.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // 1. Mute Button
        IconButton(
            onClick = {
                if (hapticFeedbackEnabled) {
                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                }
                onToggleMute()
            },
            enabled = isCallActive,
            modifier = Modifier
                .size(50.dp)
                .clip(CircleShape)
                .background(if (isMuted) ErrorRed.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Icon(
                imageVector = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                contentDescription = if (isMuted) "Unmute Mic" else "Mute Mic",
                tint = if (isMuted) ErrorRed else MaterialTheme.colorScheme.onSurface
            )
        }

        // 2. Primary Call / Pulsing Mic Button
        val infiniteTransition = rememberInfiniteTransition(label = "micPulse")
        val pulseScale by infiniteTransition.animateFloat(
            initialValue = 1.0f,
            targetValue = if (reducedMotion) 1.0f else 1.08f,
            animationSpec = infiniteRepeatable(
                animation = tween(900, easing = FastOutSlowInEasing),
                repeatMode = RepeatMode.Reverse
            ),
            label = "micPulseAnim"
        )

        Box(
            modifier = Modifier
                .size(72.dp)
                .scale((if (isCallActive) pulseScale else 1f) * pressScale)
                .clip(CircleShape)
                .background(if (isCallActive) NeonLime else MaterialTheme.colorScheme.surfaceVariant)
                .clickable(
                    interactionSource = callInteractionSource,
                    indication = null,
                    role = Role.Button
                ) {
                    if (hapticFeedbackEnabled) {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    }
                    if (hasMicPermission) {
                        onToggleCall(aiVoice)
                    } else {
                        onRequestPermission()
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = if (isCallActive) Icons.Default.CallEnd else Icons.Default.Call,
                contentDescription = if (isCallActive) "Akhiri Sesi" else "Mulai Sesi",
                tint = if (isCallActive) Color.Black else NeonLime,
                modifier = Modifier.size(32.dp)
            )
        }

        // 3. Manual Interruption / Barge-in Button
        IconButton(
            onClick = {
                if (hapticFeedbackEnabled) {
                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                }
                onManualInterrupt()
            },
            enabled = sessionState == AudioSessionState.BUDDY_SPEAKING,
            modifier = Modifier
                .size(50.dp)
                .clip(CircleShape)
                .background(
                    if (sessionState == AudioSessionState.BUDDY_SPEAKING) SoftPurple.copy(alpha = 0.25f)
                    else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                )
        ) {
            Icon(
                imageVector = Icons.Default.FrontHand,
                contentDescription = "Potong / Interupsi Suara",
                tint = if (sessionState == AudioSessionState.BUDDY_SPEAKING) SoftPurple else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun InCallTextInputBar(
    inputText: String,
    onInputTextChanged: (String) -> Unit,
    isCallActive: Boolean,
    onSend: (String) -> Unit,
    placeholder: String,
    hapticFeedbackEnabled: Boolean = true
) {
    val haptic = LocalHapticFeedback.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .imePadding()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        TextField(
            value = inputText,
            onValueChange = onInputTextChanged,
            placeholder = {
                Text(
                    text = placeholder,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )
            },
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(20.dp)),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = MaterialTheme.colorScheme.surface,
                unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent,
                focusedTextColor = MaterialTheme.colorScheme.onSurface,
                unfocusedTextColor = MaterialTheme.colorScheme.onSurface
            ),
            maxLines = 3
        )

        val canSend = inputText.isNotBlank() && isCallActive
        IconButton(
            onClick = {
                if (canSend) {
                    if (hapticFeedbackEnabled) {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    }
                    onSend(inputText)
                }
            },
            enabled = canSend,
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(if (canSend) NeonLime else MaterialTheme.colorScheme.surface)
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.Send,
                contentDescription = "Kirim Pesan Teks",
                tint = if (canSend) Color.Black else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
private fun ConversationTranscriptBubble(
    entry: LiveTranscriptEntry,
    feedback: com.aibuddy.data.tutor.TutorFeedback? = null,
    isIndonesian: Boolean
) {
    val isUser = entry.sender == "You"
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = if (isUser) (if (isIndonesian) "Anda" else "You") else "Buddy",
                color = if (isUser) NeonLime else SoftPurple,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
            )
            if (!entry.isFinal) {
                Text(
                    text = "•",
                    color = SoftPurple,
                    fontSize = 12.sp
                )
            }
        }
        Box(
            modifier = Modifier
                .clip(
                    RoundedCornerShape(
                        topStart = 16.dp,
                        topEnd = 16.dp,
                        bottomStart = if (isUser) 16.dp else 4.dp,
                        bottomEnd = if (isUser) 4.dp else 16.dp
                    )
                )
                .background(
                    if (isUser) MaterialTheme.colorScheme.surface
                    else MaterialTheme.colorScheme.surface.copy(alpha = 0.85f)
                )
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            if (isUser) {
                Text(
                    text = entry.text,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            } else {
                MarkdownText(
                    text = entry.text,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            }
        }

        if (isUser && feedback != null) {
            Spacer(modifier = Modifier.height(6.dp))
            com.aibuddy.ui.components.TutorCorrectionCard(
                feedback = feedback,
                modifier = Modifier.fillMaxWidth(0.92f)
            )
        }
    }
}

private fun getStatusLabel(state: AudioSessionState, isIndonesian: Boolean): String {
    return when (state) {
        AudioSessionState.IDLE -> if (isIndonesian) "Siap" else "Ready"
        AudioSessionState.CONNECTING -> if (isIndonesian) "Menghubungkan..." else "Connecting..."
        AudioSessionState.CONNECTED -> if (isIndonesian) "Terhubung" else "Connected"
        AudioSessionState.LISTENING -> if (isIndonesian) "Mendengarkan..." else "Listening..."
        AudioSessionState.USER_SPEAKING -> if (isIndonesian) "Anda Berbicara" else "You Speaking"
        AudioSessionState.PROCESSING -> if (isIndonesian) "Memproses..." else "Processing..."
        AudioSessionState.BUDDY_SPEAKING -> if (isIndonesian) "Buddy Berbicara" else "Buddy Speaking"
        AudioSessionState.INTERRUPTED -> if (isIndonesian) "Terinterupsi" else "Interrupted"
        AudioSessionState.RECONNECTING -> if (isIndonesian) "Menghubungkan Ulang..." else "Reconnecting..."
        AudioSessionState.ERROR -> if (isIndonesian) "Terjadi Kesalahan" else "Error"
    }
}
