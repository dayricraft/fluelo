package com.aibuddy.ui.history

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
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
import com.aibuddy.data.tutor.TutorFeedback
import com.aibuddy.ui.components.RadialGradientBackground
import com.aibuddy.ui.components.TutorCorrectionCard
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPink
import com.aibuddy.ui.theme.SoftPurple
import com.aibuddy.util.formatTimestamp

data class SessionMessageUiItem(
    val messageId: String,
    val sender: String, // "USER" or "BUDDY"
    val content: String,
    val timestampEpochMs: Long,
    val isInterrupted: Boolean = false,
    val correction: TutorFeedback? = null
)

data class SessionSummaryUiItem(
    val topics: List<String> = emptyList(),
    val vocabulary: List<String> = emptyList(),
    val grammarHighlights: List<String> = emptyList(),
    val generalFeedback: String = ""
)

data class SessionDetailUiData(
    val sessionId: String,
    val title: String,
    val modality: String = "CHAT", // "VOICE" or "CHAT"
    val primaryMode: String = "CONVERSATION",
    val durationSeconds: Int = 0,
    val startTimeEpochMs: Long = 0L,
    val messages: List<SessionMessageUiItem> = emptyList(),
    val summary: SessionSummaryUiItem? = null
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SessionDetailScreen(
    data: SessionDetailUiData?,
    isLoading: Boolean = false,
    isIndonesian: Boolean = true,
    onBack: () -> Unit,
    onDeleteSession: () -> Unit = {}
) {
    var showDeleteConfirmDialog by remember { mutableStateOf(false) }

    RadialGradientBackground(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = if (isIndonesian) "Detail Riwayat Sesi" else "Session History Detail",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                                contentDescription = if (isIndonesian) "Kembali" else "Back",
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { showDeleteConfirmDialog = true }) {
                            Icon(
                                imageVector = Icons.Outlined.DeleteOutline,
                                contentDescription = if (isIndonesian) "Hapus Sesi Ini" else "Delete Session",
                                tint = MaterialTheme.colorScheme.error
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent
                    )
                )
            }
        ) { innerPadding ->
            if (isLoading || data == null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = NeonLime)
                }
            } else {
                val formattedTime = remember(data.startTimeEpochMs) {
                    formatTimestamp(data.startTimeEpochMs)
                }

                val durationText = remember(data.durationSeconds) {
                    val m = data.durationSeconds / 60
                    val s = data.durationSeconds % 60
                    if (m > 0) "${m}m ${s}s" else "${s}s"
                }

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .padding(horizontal = 20.dp),
                    contentPadding = PaddingValues(top = 8.dp, bottom = 40.dp)
                ) {
                    // 1. Session Metadata Header Card
                    item {
                        Card(
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.85f)
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(
                                    1.dp,
                                    MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.2f),
                                    RoundedCornerShape(20.dp)
                                )
                        ) {
                            Column(modifier = Modifier.padding(18.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                        val isVoice = data.modality.equals("VOICE", ignoreCase = true)
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = if (isVoice) NeonLime.copy(alpha = 0.2f) else SoftPurple.copy(alpha = 0.2f)
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                                            ) {
                                                Icon(
                                                    imageVector = if (isVoice) Icons.Outlined.Mic else Icons.Outlined.Forum,
                                                    contentDescription = null,
                                                    tint = if (isVoice) NeonLime else SoftPurple,
                                                    modifier = Modifier.size(14.dp)
                                                )
                                                Text(
                                                    text = if (isVoice) (if (isIndonesian) "Suara" else "Voice") else "Chat",
                                                    color = if (isVoice) NeonLime else SoftPurple,
                                                    fontSize = 12.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }

                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = MaterialTheme.colorScheme.surface
                                        ) {
                                            Text(
                                                text = formatModeLabel(data.primaryMode, isIndonesian),
                                                color = MaterialTheme.colorScheme.onSurface,
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Medium,
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                            )
                                        }
                                    }

                                    Text(
                                        text = durationText,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                Text(
                                    text = data.title,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = "$formattedTime • ${data.messages.size} ${if (isIndonesian) "pesan" else "messages"}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // 2. Learning Summary Card
                    if (data.summary != null) {
                        item {
                            SummarySectionCard(summary = data.summary, isIndonesian = isIndonesian)
                            Spacer(modifier = Modifier.height(20.dp))
                        }
                    }

                    // 3. Conversation Transcript Title
                    item {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.padding(vertical = 8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.ChatBubbleOutline,
                                contentDescription = null,
                                tint = NeonLime,
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = if (isIndonesian) "Transkrip Percakapan" else "Conversation Transcript",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }

                    // 4. Messages and Inline Corrections
                    if (data.messages.isEmpty()) {
                        item {
                            Card(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                ),
                                modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)
                            ) {
                                Text(
                                    text = if (isIndonesian) "Belum ada transkrip tersimpan untuk sesi ini." else "No transcripts saved for this session.",
                                    modifier = Modifier.padding(16.dp),
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    } else {
                        items(data.messages, key = { it.messageId }) { msg ->
                            val isUser = msg.sender.equals("USER", ignoreCase = true)
                            val attachedCorrection = msg.correction

                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
                            ) {
                                Surface(
                                    shape = RoundedCornerShape(
                                        topStart = 16.dp,
                                        topEnd = 16.dp,
                                        bottomStart = if (isUser) 16.dp else 4.dp,
                                        bottomEnd = if (isUser) 4.dp else 16.dp
                                    ),
                                    color = if (isUser) {
                                        SoftPurple.copy(alpha = 0.25f)
                                    } else {
                                        MaterialTheme.colorScheme.surfaceVariant
                                    },
                                    border = androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        if (isUser) SoftPurple.copy(alpha = 0.4f) else MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f)
                                    ),
                                    modifier = Modifier.widthIn(max = 300.dp)
                                ) {
                                    Column(modifier = Modifier.padding(12.dp)) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                                        ) {
                                            Text(
                                                text = if (isUser) "You" else "Buddy",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 11.sp,
                                                color = if (isUser) SoftPurple else NeonLime
                                            )
                                            if (msg.isInterrupted) {
                                                Surface(
                                                    shape = RoundedCornerShape(4.dp),
                                                    color = MaterialTheme.colorScheme.error.copy(alpha = 0.2f)
                                                ) {
                                                    Text(
                                                        text = if (isIndonesian) "Terpotong" else "Interrupted",
                                                        fontSize = 9.sp,
                                                        color = MaterialTheme.colorScheme.error,
                                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                                    )
                                                }
                                            }
                                        }

                                        Spacer(modifier = Modifier.height(4.dp))

                                        Text(
                                            text = msg.content,
                                            fontSize = 14.sp,
                                            color = MaterialTheme.colorScheme.onSurface,
                                            lineHeight = 20.sp
                                        )
                                    }
                                }

                                if (attachedCorrection != null) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    TutorCorrectionCard(
                                        feedback = attachedCorrection,
                                        modifier = Modifier.widthIn(max = 320.dp),
                                        initialExpanded = true
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Delete Confirmation Dialog
            if (showDeleteConfirmDialog) {
                AlertDialog(
                    onDismissRequest = { showDeleteConfirmDialog = false },
                    title = {
                        Text(
                            text = if (isIndonesian) "Hapus Sesi Percakapan?" else "Delete Session History?",
                            fontWeight = FontWeight.Bold
                        )
                    },
                    text = {
                        Text(
                            text = if (isIndonesian)
                                "Seluruh riwayat pesan, feedback koreksi, dan ringkasan sesi ini akan dihapus permanen. Progres kartu kosakata Anda tidak akan terpengaruh."
                            else
                                "All conversation messages, corrections, and summaries for this session will be permanently deleted. Your vocabulary flashcards will remain untouched."
                        )
                    },
                    confirmButton = {
                        TextButton(
                            onClick = {
                                showDeleteConfirmDialog = false
                                onDeleteSession()
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
                        TextButton(onClick = { showDeleteConfirmDialog = false }) {
                            Text(text = if (isIndonesian) "Batal" else "Cancel")
                        }
                    }
                )
            }
        }
    }
}

@Composable
private fun SummarySectionCard(
    summary: SessionSummaryUiItem,
    isIndonesian: Boolean
) {
    Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.9f)
        ),
        modifier = Modifier
            .fillMaxWidth()
            .border(
                1.dp,
                NeonLime.copy(alpha = 0.35f),
                RoundedCornerShape(20.dp)
            )
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.Outlined.AutoAwesome,
                    contentDescription = null,
                    tint = NeonLime,
                    modifier = Modifier.size(18.dp)
                )
                Text(
                    text = if (isIndonesian) "Ringkasan Pembelajaran" else "Learning Summary",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            if (summary.topics.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = if (isIndonesian) "TOPIK DIBAHAS" else "TOPICS DISCUSSED",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    summary.topics.forEach { topic ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = NeonLime.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = topic,
                                color = NeonLime,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }

            if (summary.vocabulary.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = if (isIndonesian) "KOSAKATA BARU" else "VOCABULARY PRACTICED",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    summary.vocabulary.forEach { word ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = SoftPurple.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = word,
                                color = SoftPurple,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }

            if (summary.grammarHighlights.isNotEmpty()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = if (isIndonesian) "SOROTAN TATA BAHASA" else "GRAMMAR HIGHLIGHTS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                summary.grammarHighlights.forEach { highlight ->
                    Row(
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.padding(vertical = 2.dp)
                    ) {
                        Text("•", color = SoftPink, fontSize = 14.sp)
                        Text(
                            text = highlight,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    }
                }
            }

            if (summary.generalFeedback.isNotBlank()) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = if (isIndonesian) "CATATAN BUDDY" else "BUDDY'S NOTE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "\"${summary.generalFeedback}\"",
                    color = MaterialTheme.colorScheme.onSurface,
                    fontSize = 13.sp,
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
                    lineHeight = 18.sp
                )
            }
        }
    }
}

private fun formatModeLabel(mode: String, isIndonesian: Boolean): String {
    return when (mode.uppercase()) {
        "CONVERSATION", "FREE_CONVERSATION" -> if (isIndonesian) "Obrolan Bebas" else "Free Conversation"
        "VOCABULARY" -> if (isIndonesian) "Kosakata" else "Vocabulary"
        "GRAMMAR" -> if (isIndonesian) "Tata Bahasa" else "Grammar"
        "ROLEPLAY" -> if (isIndonesian) "Simulasi Peran" else "Roleplay"
        else -> mode
    }
}

