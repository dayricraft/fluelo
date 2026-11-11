package com.aibuddy.data.history

import android.content.Context
import android.util.Log
import com.aibuddy.data.db.FlueloDatabase
import com.aibuddy.data.history.memory.LearningMemoryRepository
import com.aibuddy.data.history.model.ConversationMessageEntity
import com.aibuddy.data.history.model.ConversationSessionEntity
import com.aibuddy.data.history.model.SessionWithDetails
import com.aibuddy.data.history.model.StructuredCorrectionEntity
import com.aibuddy.data.history.summary.SessionSummaryGenerator
import com.aibuddy.data.repository.TurnModality
import com.aibuddy.data.repository.TurnSender
import com.aibuddy.data.tutor.TutorFeedback
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.io.File

/**
 * Repositori utama untuk persistensi riwayat sesi percakapan, pesan turn,
 * feedback koreksi terstruktur, dan ringkasan pembelajaran berbasis Room Database.
 */
class SessionHistoryRepository private constructor(
    private val context: Context,
    private val database: FlueloDatabase
) {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val sessionDao = database.conversationSessionDao()
    private val messageDao = database.conversationMessageDao()
    private val correctionDao = database.structuredCorrectionDao()
    private val summaryDao = database.sessionSummaryDao()
    private val memoryDao = database.learningMemoryDao()

    val learningMemoryRepository = LearningMemoryRepository(memoryDao)

    val allSessions: Flow<List<ConversationSessionEntity>> = sessionDao.getAllSessions()
    val totalSessionsCount: Flow<Int> = sessionDao.getTotalSessionsCount()

    init {
        migrateLegacyJsonIfNeeded()
    }

    private fun migrateLegacyJsonIfNeeded() {
        scope.launch {
            try {
                val legacyFile = File(context.filesDir, "practice_sessions.json")
                if (legacyFile.exists()) {
                    val count = sessionDao.getTotalSessionsCount().firstOrNull() ?: 0
                    if (count == 0) {
                        val content = legacyFile.readText()
                        if (content.isNotBlank()) {
                            val json = Json { ignoreUnknownKeys = true }
                            val legacySessions = json.decodeFromString<List<PracticeSession>>(content)
                            legacySessions.forEach { legacy ->
                                val entity = ConversationSessionEntity(
                                    sessionId = legacy.id,
                                    startTimeEpochMs = legacy.timestamp,
                                    endTimeEpochMs = legacy.timestamp,
                                    durationSeconds = 60,
                                    primaryMode = "FREE_CONVERSATION",
                                    modality = legacy.modality.name,
                                    title = legacy.title,
                                    turnCount = legacy.turnCount,
                                    userTurnCount = legacy.turnCount / 2,
                                    isCompleted = true
                                )
                                sessionDao.insertOrUpdateSession(entity)
                            }
                            Log.d(TAG, "Migrated ${legacySessions.size} legacy practice sessions to Room V2.")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Legacy practice session migration error: ${e.message}")
            }
        }
    }

    suspend fun createOrGetSession(
        sessionId: String,
        modality: String,
        primaryMode: String,
        title: String
    ): ConversationSessionEntity = withContext(Dispatchers.IO) {
        val existing = sessionDao.getSessionByIdSync(sessionId)
        if (existing != null) return@withContext existing

        val newSession = ConversationSessionEntity(
            sessionId = sessionId,
            startTimeEpochMs = System.currentTimeMillis(),
            primaryMode = primaryMode,
            modality = modality,
            title = title,
            turnCount = 0,
            userTurnCount = 0,
            isCompleted = false
        )
        sessionDao.insertOrUpdateSession(newSession)
        learningMemoryRepository.recordModeUsage(primaryMode)
        newSession
    }

    suspend fun saveMessage(
        sessionId: String,
        messageId: String,
        sender: TurnSender,
        modality: TurnModality,
        content: String,
        sequenceOrder: Int,
        isInterrupted: Boolean = false
    ) = withContext(Dispatchers.IO) {
        val messageEntity = ConversationMessageEntity(
            messageId = messageId,
            sessionId = sessionId,
            sender = sender.name,
            modality = modality.name,
            content = content,
            timestampEpochMs = System.currentTimeMillis(),
            sequenceOrder = sequenceOrder,
            isInterrupted = isInterrupted
        )
        messageDao.insertMessage(messageEntity)

        // Perbarui jumlah giliran sesi
        val session = sessionDao.getSessionByIdSync(sessionId)
        if (session != null) {
            val totalMessages = messageDao.getMessageCountForSession(sessionId)
            val userTurns = if (sender == TurnSender.USER) session.userTurnCount + 1 else session.userTurnCount
            sessionDao.updateSessionTurnCounts(sessionId, totalMessages, userTurns)
        }
    }

    suspend fun saveCorrection(
        sessionId: String,
        messageId: String?,
        feedback: TutorFeedback
    ) = withContext(Dispatchers.IO) {
        val correctionEntity = StructuredCorrectionEntity(
            correctionId = feedback.id,
            sessionId = sessionId,
            messageId = messageId,
            originalUtterance = feedback.originalText,
            correctedExpression = feedback.correctedText,
            explanation = feedback.explanation,
            category = feedback.category.name,
            severity = feedback.severity.name,
            spokenNote = feedback.spokenNote,
            timestampEpochMs = feedback.timestamp
        )
        correctionDao.insertCorrection(correctionEntity)
        learningMemoryRepository.recordGrammarMistake(feedback.category.name, feedback.originalText)
    }

    suspend fun finalizeSession(sessionId: String, isCompleted: Boolean = true) = withContext(Dispatchers.IO) {
        val session = sessionDao.getSessionByIdSync(sessionId) ?: return@withContext
        val now = System.currentTimeMillis()
        val durationSeconds = ((now - session.startTimeEpochMs) / 1000).toInt().coerceAtLeast(0)

        sessionDao.updateSessionCompletion(
            sessionId = sessionId,
            endTimeEpochMs = now,
            durationSeconds = durationSeconds,
            isCompleted = isCompleted
        )

        // Generate ringkasan pembelajaran deterministik
        val messages = messageDao.getMessagesForSessionSync(sessionId)
        val corrections = correctionDao.getCorrectionsForSessionSync(sessionId)
        val summary = SessionSummaryGenerator.generateSummary(
            session = session.copy(durationSeconds = durationSeconds, isCompleted = isCompleted),
            messages = messages,
            corrections = corrections
        )
        summaryDao.insertOrUpdateSummary(summary)
    }

    fun getSessionWithDetails(sessionId: String): Flow<SessionWithDetails?> {
        return sessionDao.getSessionWithDetails(sessionId)
    }

    suspend fun getSessionWithDetailsSync(sessionId: String): SessionWithDetails? = withContext(Dispatchers.IO) {
        sessionDao.getSessionWithDetailsSync(sessionId)
    }

    suspend fun deleteSession(sessionId: String) = withContext(Dispatchers.IO) {
        sessionDao.deleteSession(sessionId)
    }

    suspend fun clearAllHistory() = withContext(Dispatchers.IO) {
        sessionDao.deleteAllSessions()
    }

    companion object {
        private const val TAG = "SessionHistoryRepo"

        @Volatile
        private var INSTANCE: SessionHistoryRepository? = null

        fun getInstance(context: Context): SessionHistoryRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: run {
                    val db = FlueloDatabase.getInstance(context)
                    SessionHistoryRepository(context.applicationContext, db).also { INSTANCE = it }
                }
            }
        }
    }
}

