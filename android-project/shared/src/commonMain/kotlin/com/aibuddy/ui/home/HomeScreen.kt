package com.aibuddy.ui.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.data.history.PracticeSession
import com.aibuddy.data.history.SessionModality
import com.aibuddy.data.preferences.AppLanguage
import com.aibuddy.data.preferences.UserPreferences
import com.aibuddy.live.AudioSessionState
import com.aibuddy.ui.components.BuddyAvatar
import com.aibuddy.ui.components.BentoCard
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPink
import com.aibuddy.ui.theme.SoftPurple
import com.aibuddy.util.formatTimestamp

@Composable
fun HomeScreen(
    userPreferences: UserPreferences,
    sessionState: AudioSessionState = AudioSessionState.IDLE,
    practiceSessions: List<PracticeSession> = emptyList(),
    onNavigateToConversation: () -> Unit,
    onNavigateToChat: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onNavigateToFlashcards: () -> Unit = {},
    onNavigateToSessionDetail: (String) -> Unit = {},
    onDeleteSession: (String) -> Unit = {},
    onClearAllSessions: () -> Unit = {}
) {
    var sessionToDelete by remember { mutableStateOf<String?>(null) }
    var showClearAllDialog by remember { mutableStateOf(false) }

    val isIndonesian = userPreferences.language == AppLanguage.INDONESIAN

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .statusBarsPadding()
            .padding(horizontal = 20.dp),
        contentPadding = PaddingValues(top = 16.dp, bottom = 32.dp)
    ) {
        // 1. Top Bar: Greeting & Action Buttons
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.padding(top = 4.dp)
                    ) {
                        BuddyAvatar(
                            size = 32.dp,
                            useNeonAccent = true
                        )
                        Text(
                            text = "Fluelo",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    IconButton(
                        onClick = onNavigateToSettings,
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Settings,
                            contentDescription = if (isIndonesian) "Pengaturan" else "Settings",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                val displayName = if (!isIndonesian && userPreferences.userName.equals("Teman", ignoreCase = true)) {
                    "Friend"
                } else {
                    userPreferences.userName
                }
                Text(
                    text = if (isIndonesian) "Hai, $displayName 👋" else "Hi, $displayName 👋",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }

        // 2. Hero Headline
        item {
            Text(
                text = if (isIndonesian) "Ada yang bisa saya bantu hari ini?" else "How may I help you today?",
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 28.sp,
                lineHeight = 34.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))

            if (sessionState != AudioSessionState.IDLE && sessionState != AudioSessionState.ERROR) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = NeonLime.copy(alpha = 0.15f),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .clickable { onNavigateToConversation() }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(10.dp)
                                    .clip(CircleShape)
                                    .background(NeonLime)
                            )
                            Column {
                                Text(
                                    text = if (isIndonesian) "Panggilan Suara Sedang Berlangsung" else "Voice Call in Progress",
                                    color = MaterialTheme.colorScheme.onSurface,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = if (isIndonesian) "Ketuk untuk kembali ke obrolan" else "Tap to return to conversation",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 11.sp
                                )
                            }
                        }
                        Icon(
                            imageVector = Icons.Outlined.Mic,
                            contentDescription = null,
                            tint = NeonLime,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            } else {
                Spacer(modifier = Modifier.height(4.dp))
            }
        }

        // 3. Bento Grid Actions
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                BentoCard(
                    title = if (isIndonesian) "Bicara\ndengan Buddy" else "Talk\nwith Buddy",
                    subtitle = if (sessionState == AudioSessionState.IDLE) {
                        if (isIndonesian) "Panggilan suara live" else "Live voice call"
                    } else {
                        if (isIndonesian) "Sesi sedang aktif" else "Session active"
                    },
                    backgroundColor = NeonLime,
                    contentColor = Color.Black,
                    icon = Icons.Outlined.Mic,
                    modifier = Modifier.weight(1f),
                    hapticFeedbackEnabled = userPreferences.hapticFeedbackEnabled,
                    onClick = onNavigateToConversation
                )

                BentoCard(
                    title = if (isIndonesian) "Chat\ndengan Buddy" else "Chat\nwith Buddy",
                    subtitle = if (isIndonesian) "Teks & tutor AI" else "Text & AI tutor",
                    backgroundColor = SoftPurple,
                    contentColor = Color.Black,
                    icon = Icons.Outlined.Forum,
                    modifier = Modifier.weight(1f),
                    hapticFeedbackEnabled = userPreferences.hapticFeedbackEnabled,
                    onClick = onNavigateToChat
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            BentoCard(
                title = if (isIndonesian) "Kartu Kosakata" else "Vocabulary Flashcards",
                subtitle = if (isIndonesian) "Jelajahi & ulas banyak kata" else "Explore & Review many words",
                backgroundColor = SoftPink,
                contentColor = Color.Black,
                icon = Icons.Outlined.Layers,
                modifier = Modifier.fillMaxWidth(),
                hapticFeedbackEnabled = userPreferences.hapticFeedbackEnabled,
                onClick = onNavigateToFlashcards
            )

            Spacer(modifier = Modifier.height(28.dp))
        }

        // 4. Riwayat Sesi (Practice History)
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isIndonesian) "Riwayat Sesi" else "Practice History",
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                if (practiceSessions.isNotEmpty()) {
                    TextButton(onClick = { showClearAllDialog = true }) {
                        Text(
                            text = if (isIndonesian) "Hapus Semua" else "Clear All",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
        }

        if (practiceSessions.isEmpty()) {
            item {
                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.ChatBubbleOutline,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(26.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = if (isIndonesian) "Belum ada riwayat obrolan" else "No practice sessions yet",
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Text(
                            text = if (isIndonesian)
                                "Mulai obrolan suara atau teks pertama Anda dengan Buddy. Riwayat percakapan akan tercatat di sini."
                            else
                                "Start your first live conversation or chat with Buddy. Conversation history will appear here.",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 13.sp,
                            lineHeight = 18.sp,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            }
        } else {
            items(practiceSessions, key = { it.id }) { session ->
                PracticeSessionCard(
                    session = session,
                    isIndonesian = isIndonesian,
                    onOpenSession = {
                        onNavigateToSessionDetail(session.id)
                    },
                    onDeleteSession = {
                        sessionToDelete = session.id
                    }
                )
                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }

    if (sessionToDelete != null) {
        AlertDialog(
            onDismissRequest = { sessionToDelete = null },
            title = {
                Text(
                    text = if (isIndonesian) "Hapus Sesi Percakapan?" else "Delete Session?",
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Text(
                    text = if (isIndonesian)
                        "Sesi ini beserta transkrip dan koreksi terkait akan dihapus secara permanen."
                    else
                        "This session, along with its transcripts and corrections, will be permanently deleted."
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        sessionToDelete?.let { onDeleteSession(it) }
                        sessionToDelete = null
                    }
                ) {
                    Text(
                        text = if (isIndonesian) "Hapus" else "Delete",
                        color = MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = { sessionToDelete = null }) {
                    Text(text = if (isIndonesian) "Batal" else "Cancel")
                }
            }
        )
    }

    if (showClearAllDialog) {
        AlertDialog(
            onDismissRequest = { showClearAllDialog = false },
            title = {
                Text(
                    text = if (isIndonesian) "Hapus Semua Riwayat?" else "Clear All History?",
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Text(
                    text = if (isIndonesian)
                        "Seluruh riwayat sesi percakapan akan dihapus permanen. Kosakata dan progres flashcard Anda akan tetap aman tersimpan."
                    else
                        "All conversation session history will be permanently deleted. Your vocabulary flashcard bookmarks and progress will remain safe."
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        onClearAllSessions()
                        showClearAllDialog = false
                    }
                ) {
                    Text(
                        text = if (isIndonesian) "Hapus Semua" else "Clear All",
                        color = MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearAllDialog = false }) {
                    Text(text = if (isIndonesian) "Batal" else "Cancel")
                }
            }
        )
    }
}

@Composable
private fun PracticeSessionCard(
    session: PracticeSession,
    isIndonesian: Boolean,
    onOpenSession: () -> Unit,
    onDeleteSession: () -> Unit
) {
    val isVoice = session.modality == SessionModality.VOICE
    val timeFormatted = remember(session.timestamp) { formatTimestamp(session.timestamp) }

    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .clickable(onClick = onOpenSession)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(
                                if (isVoice) NeonLime.copy(alpha = 0.2f) else SoftPurple.copy(alpha = 0.2f)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isVoice) Icons.Outlined.Mic else Icons.Outlined.Forum,
                            contentDescription = null,
                            tint = if (isVoice) NeonLime else SoftPurple,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        val localizedTitle = remember(session.title, isIndonesian) {
                            formatSessionTitle(session.title, isIndonesian)
                        }
                        Text(
                            text = localizedTitle,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "$timeFormatted • ${session.turnCount} ${if (isIndonesian) "giliran" else "turns"}",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 11.sp
                        )
                    }
                }

                IconButton(
                    onClick = onDeleteSession,
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Outlined.DeleteOutline,
                        contentDescription = if (isIndonesian) "Hapus Riwayat" else "Delete History",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            if (session.summarySnippet.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "\"${session.summarySnippet}\"",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 12.sp,
                    maxLines = 2
                )
            }
        }
    }
}

private fun formatSessionTitle(rawTitle: String, isIndonesian: Boolean): String {
    if (!isIndonesian) {
        var formatted = rawTitle
        if (formatted.contains("Panggilan Suara dengan Buddy", ignoreCase = true)) {
            formatted = formatted.replace("Panggilan Suara dengan Buddy", "Voice Call with Buddy", ignoreCase = true)
        }
        if (formatted.contains("Tutor Bahasa Inggris", ignoreCase = true)) {
            formatted = formatted.replace("Tutor Bahasa Inggris", "English Tutor", ignoreCase = true)
        }
        if (formatted.contains("Latihan Kosakata", ignoreCase = true)) {
            formatted = formatted.replace("Latihan Kosakata", "Vocabulary Practice", ignoreCase = true)
        }
        if (formatted.contains("Tata Bahasa (Grammar)", ignoreCase = true)) {
            formatted = formatted.replace("Tata Bahasa (Grammar)", "Grammar Practice", ignoreCase = true)
        } else if (formatted.contains("Tata Bahasa", ignoreCase = true)) {
            formatted = formatted.replace("Tata Bahasa", "Grammar Practice", ignoreCase = true)
        }
        if (formatted.contains("Simulasi Peran (Roleplay)", ignoreCase = true)) {
            formatted = formatted.replace("Simulasi Peran (Roleplay)", "Roleplay Practice", ignoreCase = true)
        } else if (formatted.contains("Simulasi Peran", ignoreCase = true)) {
            formatted = formatted.replace("Simulasi Peran", "Roleplay Practice", ignoreCase = true)
        }
        if (formatted.contains("Obrolan Bebas", ignoreCase = true)) {
            formatted = formatted.replace("Obrolan Bebas", "Free Conversation", ignoreCase = true)
        }
        return formatted
    } else {
        var formatted = rawTitle
        if (formatted.contains("Voice Call with Buddy", ignoreCase = true)) {
            formatted = formatted.replace("Voice Call with Buddy", "Panggilan Suara dengan Buddy", ignoreCase = true)
        }
        if (formatted.contains("English Tutor", ignoreCase = true)) {
            formatted = formatted.replace("English Tutor", "Tutor Bahasa Inggris", ignoreCase = true)
        }
        if (formatted.contains("Vocabulary Practice", ignoreCase = true)) {
            formatted = formatted.replace("Vocabulary Practice", "Latihan Kosakata", ignoreCase = true)
        }
        if (formatted.contains("Grammar Practice", ignoreCase = true)) {
            formatted = formatted.replace("Grammar Practice", "Tata Bahasa (Grammar)", ignoreCase = true)
        }
        if (formatted.contains("Roleplay Practice", ignoreCase = true)) {
            formatted = formatted.replace("Roleplay Practice", "Simulasi Peran", ignoreCase = true)
        }
        if (formatted.contains("Free Conversation", ignoreCase = true)) {
            formatted = formatted.replace("Free Conversation", "Obrolan Bebas", ignoreCase = true)
        }
        return formatted
    }
}

