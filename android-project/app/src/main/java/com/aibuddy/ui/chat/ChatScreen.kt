package com.aibuddy.ui.chat

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.R
import com.aibuddy.data.chat.ChatMessage
import com.aibuddy.data.mode.LearningMode
import com.aibuddy.data.mode.SessionModeState
import com.aibuddy.ui.components.BuddyAvatar
import com.aibuddy.ui.components.ExerciseProgressCard
import com.aibuddy.ui.components.MarkdownText
import com.aibuddy.ui.components.RadialGradientBackground
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPurple

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    messages: List<ChatMessage>,
    isLoading: Boolean,
    errorMessage: String?,
    feedbacks: Map<String, com.aibuddy.data.tutor.TutorFeedback> = emptyMap(),
    sessionModeState: SessionModeState = SessionModeState(),
    isIndonesian: Boolean = true,
    hapticFeedbackEnabled: Boolean = true,
    onSendMessage: (String) -> Unit,
    onClearChat: () -> Unit,
    onSelectMode: (LearningMode) -> Unit = {},
    onSkipExercise: () -> Unit = {},
    onRepeatExercise: () -> Unit = {},
    onStopExercise: () -> Unit = {},
    onResumeExercise: () -> Unit = {},
    onBack: () -> Unit
) {
    val haptic = LocalHapticFeedback.current
    var inputText by remember { mutableStateOf("") }
    var showClearDialog by remember { mutableStateOf(false) }
    val listState = rememberLazyListState()

    val density = LocalDensity.current
    val imeBottom = WindowInsets.ime.getBottom(density)

    // Auto-scroll to bottom on new message, loading change, or keyboard open
    LaunchedEffect(messages.size, isLoading, imeBottom) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    val quickChips = when (sessionModeState.activeMode) {
        LearningMode.FREE_CONVERSATION -> listOf(
            if (isIndonesian) "Latihan 10 kata vocab Indo-Inggris" else "Practice 10 vocab words",
            if (isIndonesian) "Ajarin Present Perfect Tense" else "Teach me Present Perfect Tense",
            if (isIndonesian) "Simulasi Job Interview" else "Job interview roleplay",
            if (isIndonesian) "Beda 'make' & 'do'?" else "Difference between 'make' & 'do'?"
        )
        LearningMode.VOCABULARY -> listOf(
            if (isIndonesian) "Lewati kata ini" else "Skip this word",
            if (isIndonesian) "Ulangi pertanyaan tadi" else "Repeat the question",
            if (isIndonesian) "Apa sinonim kata ini?" else "What is the synonym?",
            if (isIndonesian) "Berhenti latihan vocab" else "Stop vocabulary exercise"
        )
        LearningMode.GRAMMAR -> listOf(
            if (isIndonesian) "Beri contoh kalimat lain" else "Give another example",
            if (isIndonesian) "Apa rumus tenses ini?" else "What is the tense formula?",
            if (isIndonesian) "Beri soal latihan berikutnya" else "Next practice question",
            if (isIndonesian) "Kembali ngobrol santai" else "Back to free conversation"
        )
        LearningMode.ROLEPLAY -> listOf(
            if (isIndonesian) "Lanjutkan simulasi" else "Continue simulation",
            if (isIndonesian) "Koreksi respon saya tadi" else "Correct my last response",
            if (isIndonesian) "Tanya hal lain seputar interview" else "Ask another interview question",
            if (isIndonesian) "Selesai roleplay" else "Finish roleplay"
        )
    }

    if (showClearDialog) {
        AlertDialog(
            onDismissRequest = { showClearDialog = false },
            title = {
                Text(
                    text = if (isIndonesian) "Hapus Riwayat Obrolan?" else "Clear Chat History?",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            },
            text = {
                Text(
                    text = if (isIndonesian)
                        "Semua riwayat percakapan di ruang obrolan ini akan dihapus dari penyimpanan lokal."
                    else
                        "All conversation history in this chat room will be deleted locally.",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showClearDialog = false
                        onClearChat()
                    }
                ) {
                    Text(if (isIndonesian) "Hapus" else "Delete", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearDialog = false }) {
                    Text(if (isIndonesian) "Batal" else "Cancel", color = MaterialTheme.colorScheme.onSurface)
                }
            },
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
            shape = RoundedCornerShape(20.dp)
        )
    }

    RadialGradientBackground(
        glowColor = SoftPurple,
        glowStrength = 0.35f
    ) {
        Scaffold(
            containerColor = Color.Transparent,
            contentWindowInsets = WindowInsets(0, 0, 0, 0),
            topBar = {
                TopAppBar(
                    modifier = Modifier.statusBarsPadding(),
                    title = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_app_logo),
                                contentDescription = "Fluelo",
                                modifier = Modifier.size(32.dp)
                            )
                            Column {
                                Text(
                                    text = "Chat with Buddy",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Gemini Flash",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = if (isIndonesian) "Kembali" else "Back",
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    },
                    actions = {
                        IconButton(
                            onClick = { showClearDialog = true },
                            modifier = Modifier.size(44.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.DeleteOutline,
                                contentDescription = if (isIndonesian) "Bersihkan Obrolan" else "Clear Chat",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent
                    )
                )
            },
            bottomBar = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.background.copy(alpha = 0.92f))
                        .windowInsetsPadding(WindowInsets.ime.union(WindowInsets.navigationBars))
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    // Quick Suggestion Chips
                    LazyRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 10.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(quickChips) { chipText ->
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(16.dp))
                                    .clickable {
                                        if (hapticFeedbackEnabled) {
                                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                        }
                                        onSendMessage(chipText)
                                    }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.AutoAwesome,
                                        contentDescription = null,
                                        tint = SoftPurple,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Text(
                                        text = chipText,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface,
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }
                    }

                    // Input Text Bar with Send Button
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        TextField(
                            value = inputText,
                            onValueChange = { inputText = it },
                            placeholder = {
                                Text(
                                    text = if (isIndonesian) "Ketik pesan atau instruksi mode..." else "Type a message or mode command...",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 14.sp
                                )
                            },
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(22.dp)),
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent,
                                focusedTextColor = MaterialTheme.colorScheme.onSurface,
                                unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                            ),
                            maxLines = 4
                        )

                        val canSend = inputText.isNotBlank() && !isLoading
                        IconButton(
                            onClick = {
                                if (canSend) {
                                    if (hapticFeedbackEnabled) {
                                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    }
                                    onSendMessage(inputText)
                                    inputText = ""
                                }
                            },
                            enabled = canSend,
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(
                                    if (canSend) NeonLime else MaterialTheme.colorScheme.surfaceVariant
                                )
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Send,
                                contentDescription = if (isIndonesian) "Kirim" else "Send",
                                tint = if (canSend) Color.Black else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                            )
                        }
                    }
                }
            }
        ) { innerPadding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(horizontal = 16.dp)
            ) {
                // Active Exercise Progress Card
                val activeExercise = sessionModeState.activeExercise
                AnimatedVisibility(visible = activeExercise != null) {
                    if (activeExercise != null) {
                        ExerciseProgressCard(
                            exercise = activeExercise,
                            isIndonesian = isIndonesian,
                            onSkip = onSkipExercise,
                            onRepeat = onRepeatExercise,
                            onStop = onStopExercise,
                            onResume = onResumeExercise,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    }
                }

                LazyColumn(
                    state = listState,
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentPadding = PaddingValues(top = 8.dp, bottom = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    items(messages, key = { it.id }) { msg ->
                        ChatBubble(message = msg, feedback = feedbacks[msg.id])
                    }

                    if (isLoading) {
                        item {
                            LoadingBubble()
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ChatBubble(
    message: ChatMessage,
    feedback: com.aibuddy.data.tutor.TutorFeedback? = null
) {
    val isUser = message.isUser

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
    ) {
        Row(
            horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
            verticalAlignment = Alignment.Top,
            modifier = Modifier.fillMaxWidth(0.92f)
        ) {
            if (!isUser) {
                BuddyAvatar(size = 28.dp)
                Spacer(modifier = Modifier.width(8.dp))
            }

            Surface(
                shape = RoundedCornerShape(
                    topStart = 18.dp,
                    topEnd = 18.dp,
                    bottomStart = if (isUser) 18.dp else 4.dp,
                    bottomEnd = if (isUser) 4.dp else 18.dp
                ),
                color = if (isUser) {
                    SoftPurple.copy(alpha = 0.22f)
                } else {
                    MaterialTheme.colorScheme.surfaceVariant
                },
                modifier = Modifier
                    .then(
                        if (isUser) {
                            Modifier.border(
                                width = 1.dp,
                                color = SoftPurple.copy(alpha = 0.45f),
                                shape = RoundedCornerShape(18.dp, 18.dp, 4.dp, 18.dp)
                            )
                        } else Modifier
                    )
            ) {
                if (isUser) {
                    Text(
                        text = message.text,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        lineHeight = 22.sp,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp)
                    )
                } else {
                    MarkdownText(
                        text = message.text,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                        color = MaterialTheme.colorScheme.onSurface,
                        fontSize = 14.sp,
                        lineHeight = 22.sp
                    )
                }
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

@Composable
private fun LoadingBubble() {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.padding(start = 4.dp)
    ) {
        BuddyAvatar(size = 28.dp)

        Surface(
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = alpha),
            modifier = Modifier.padding(vertical = 4.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                CircularProgressIndicator(
                    strokeWidth = 2.dp,
                    color = SoftPurple,
                    modifier = Modifier.size(14.dp)
                )
                Text(
                    text = "Buddy sedang berpikir...",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 13.sp
                )
            }
        }
    }
}
