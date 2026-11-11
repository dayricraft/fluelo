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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.data.history.SessionHistoryRepository
import com.aibuddy.data.history.model.ConversationMessageEntity
import com.aibuddy.data.history.model.SessionSummaryEntity
import com.aibuddy.data.history.model.StructuredCorrectionEntity
import com.aibuddy.data.tutor.FeedbackCategory
import com.aibuddy.data.tutor.FeedbackSeverity
import com.aibuddy.data.tutor.TutorFeedback
import com.aibuddy.ui.components.RadialGradientBackground
import com.aibuddy.ui.components.TutorCorrectionCard
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPink
import com.aibuddy.ui.theme.SoftPurple
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SessionDetailScreen(
    sessionId: String,
    isIndonesian: Boolean = true,
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val repository = remember { SessionHistoryRepository.getInstance(context) }
    val sessionDetailsFlow = remember(sessionId) { repository.getSessionWithDetails(sessionId) }
    val sessionDetails by sessionDetailsFlow.collectAsState(initial = null)
    val scope = rememberCoroutineScope()

    var showDeleteConfirmDialog by remember { mutableStateOf(false) }

    val json = remember { Json { ignoreUnknownKeys = true } }

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
            val details = sessionDetails
            if (details == null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = NeonLime)
                }
            } else {
                val session = details.session
                val messages = details.messages
                val corrections = details.corrections
                val summary = details.summary

                val dateFormat = remember { SimpleDateFormat("dd MMMM yyyy, HH:mm", Locale.getDefault()) }
                val formattedTime = remember(session.startTimeEpochMs) {
                    dateFormat.format(Date(session.startTimeEpochMs))
                }

                val durationText = remember(session.durationSeconds) {
                    val m = session.durationSeconds / 60
                    val s = session.durationSeconds % 60
                    if (m > 0) "${m}m ${s}s" else "${s}s"
                }

                val correctionsByMessageId = remember(corrections) {
                    corrections.filter { it.messageId != null }.associateBy { it.messageId!! }
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
                                        // Modality badge
                                        val isVoice = session.modality == "VOICE"
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
                                                    text = if (isVoice) "Suara" else "Chat",
                                                    color = if (isVoice) NeonLime else SoftPurple,
                                                    fontSize = 12.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }

                                        // Learning Mode badge
                                        Surface(
                                            shape = RoundedCornerShape(8.dp),
                                            color = MaterialTheme.colorScheme.surface
                                        ) {
                                            Text(
                                                text = formatModeLabel(session.primaryMode, isIndonesian),
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
                                    text = session.title,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = "$formattedTime • ${messages.size} ${if (isIndonesian) "pesan" else "messages"}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    // 2. Learning Summary Card (Grounded)
                    if (summary != null) {
                        item {
                            SummarySectionCard(summary = summary, isIndonesian = isIndonesian, json = json)
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
                    if (messages.isEmpty()) {
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
                        items(messages, key = { it.messageId }) { msg ->
                            val isUser = msg.sender == "USER"
                            val attachedCorrection = correctionsByMessageId[msg.messageId]

                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
                            ) {
                                // Message bubble
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

                                // Attached TutorCorrectionCard if correction exists for this message
                                if (attachedCorrection != null) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    TutorCorrectionCard(
                                        feedback = attachedCorrection.toTutorFeedback(),
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
                                scope.launch {
                                    repository.deleteSession(sessionId)
                                    onBack()
                                }
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
    summary: SessionSummaryEntity,
    isIndonesian: Boolean,
    json: Json
) {
    val topics = remember(summary.topicsDiscussedJson) {
        try {
            json.decodeFromString<List<String>>(summary.topicsDiscussedJson)
        } catch (e: Exception) {
            emptyList()
        }
    }

    val highlights = remember(summary.grammarHighlightsJson) {
        try {
            json.decodeFromString<List<String>>(summary.grammarHighlightsJson)
        } catch (e: Exception) {
            emptyList()
        }
    }

    val vocabulary = remember(summary.vocabularyPracticedJson) {
        try {
            json.decodeFromString<List<String>>(summary.vocabularyPracticedJson)
        } catch (e: Exception) {
            emptyList()
        }
    }

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

            // Topik
            if (topics.isNotEmpty()) {
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
                    topics.forEach { topic ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = SoftPurple.copy(alpha = 0.18f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SoftPurple.copy(alpha = 0.35f))
                        ) {
                            Text(
                                text = topic,
                                color = SoftPurple,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }

            // Koreksi & Grammar Highlights
            if (highlights.isNotEmpty()) {
                Spacer(modifier = Modifier.height(14.dp))
                Text(
                    text = if (isIndonesian) "CATATAN TATA BAHASA (GRAMMAR HIGHLIGHTS)" else "GRAMMAR HIGHLIGHTS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    highlights.forEach { item ->
                        Row(
                            verticalAlignment = Alignment.Top,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text("•", color = NeonLime, fontWeight = FontWeight.Bold)
                            Text(
                                text = item,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurface,
                                lineHeight = 17.sp
                            )
                        }
                    }
                }
            }

            // Kosakata yang Dilatih
            if (vocabulary.isNotEmpty()) {
                Spacer(modifier = Modifier.height(14.dp))
                Text(
                    text = if (isIndonesian) "KOSAKATA DIGUNAKAN" else "VOCABULARY PRACTICED",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    vocabulary.take(6).forEach { word ->
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = SoftPink.copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SoftPink.copy(alpha = 0.3f))
                        ) {
                            Text(
                                text = word,
                                color = SoftPink,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }
                }
            }

            // Rekomendasi Fokus Berikutnya
            if (!summary.suggestedFocusArea.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(14.dp))
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, NeonLime.copy(alpha = 0.25f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(NeonLime.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Lightbulb,
                                contentDescription = null,
                                tint = NeonLime,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = if (isIndonesian) "Rekomendasi Latihan" else "Recommended Focus",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonLime
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = summary.suggestedFocusArea,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurface,
                                lineHeight = 17.sp
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun formatModeLabel(rawMode: String, isIndonesian: Boolean): String {
    return when (rawMode.uppercase()) {
        "FREE_CONVERSATION" -> if (isIndonesian) "Obrolan Bebas" else "Free Talk"
        "VOCABULARY" -> if (isIndonesian) "Latihan Kosakata" else "Vocabulary"
        "GRAMMAR" -> if (isIndonesian) "Tata Bahasa" else "Grammar"
        "ROLEPLAY" -> if (isIndonesian) "Simulasi Peran" else "Roleplay"
        else -> rawMode
    }
}

private fun StructuredCorrectionEntity.toTutorFeedback(): TutorFeedback {
    return TutorFeedback(
        id = correctionId,
        turnId = messageId ?: "",
        originalText = originalUtterance,
        correctedText = correctedExpression,
        explanation = explanation,
        category = FeedbackCategory.fromString(category),
        severity = FeedbackSeverity.fromString(severity),
        spokenNote = spokenNote,
        timestamp = timestampEpochMs
    )
}

