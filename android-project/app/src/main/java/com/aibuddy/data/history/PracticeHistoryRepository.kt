package com.aibuddy.data.history

import android.content.Context
import com.aibuddy.data.history.model.ConversationSessionEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * Adapter repository untuk PracticeSession guna menjaga kompatibilitas penuh dengan kode eksisting,
 * dengan Room Database V2 (melalui SessionHistoryRepository) sebagai Single Source of Truth.
 */
class PracticeHistoryRepository private constructor(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val sessionHistoryRepository = SessionHistoryRepository.getInstance(context)

    private val _sessions = MutableStateFlow<List<PracticeSession>>(emptyList())
    val sessions: StateFlow<List<PracticeSession>> = _sessions.asStateFlow()

    init {
        scope.launch {
            sessionHistoryRepository.allSessions.collect { entities ->
                _sessions.value = entities.map { it.toPracticeSession() }
            }
        }
    }

    fun addSession(session: PracticeSession) {
        scope.launch {
            sessionHistoryRepository.createOrGetSession(
                sessionId = session.id,
                modality = session.modality.name,
                primaryMode = "FREE_CONVERSATION",
                title = session.title
            )
        }
    }

    fun deleteSession(sessionId: String) {
        scope.launch {
            sessionHistoryRepository.deleteSession(sessionId)
        }
    }

    fun clearAllSessions() {
        scope.launch {
            sessionHistoryRepository.clearAllHistory()
        }
    }

    private fun ConversationSessionEntity.toPracticeSession(): PracticeSession {
        val mod = try {
            SessionModality.valueOf(modality)
        } catch (e: Exception) {
            SessionModality.VOICE
        }
        val durationFormatted = if (durationSeconds > 0) {
            val mins = durationSeconds / 60
            val secs = durationSeconds % 60
            if (mins > 0) "${mins}m ${secs}s" else "${secs}s"
        } else ""

        val snippet = if (durationFormatted.isNotBlank()) {
            "Durasi: $durationFormatted • $turnCount giliran"
        } else {
            "$turnCount giliran"
        }

        return PracticeSession(
            id = sessionId,
            title = title,
            modality = mod,
            timestamp = startTimeEpochMs,
            turnCount = turnCount,
            summarySnippet = snippet
        )
    }

    companion object {
        @Volatile
        private var INSTANCE: PracticeHistoryRepository? = null

        fun getInstance(context: Context): PracticeHistoryRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: PracticeHistoryRepository(context.applicationContext).also {
                    INSTANCE = it
                }
            }
        }
    }
}
