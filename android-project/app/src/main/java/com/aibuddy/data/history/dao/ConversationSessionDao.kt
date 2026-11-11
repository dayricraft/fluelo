package com.aibuddy.data.history.dao

import androidx.room.*
import com.aibuddy.data.history.model.ConversationSessionEntity
import com.aibuddy.data.history.model.SessionWithDetails
import kotlinx.coroutines.flow.Flow

@Dao
interface ConversationSessionDao {

    @Query("SELECT * FROM conversation_sessions ORDER BY startTimeEpochMs DESC")
    fun getAllSessions(): Flow<List<ConversationSessionEntity>>

    @Query("SELECT * FROM conversation_sessions WHERE sessionId = :sessionId LIMIT 1")
    fun getSessionById(sessionId: String): Flow<ConversationSessionEntity?>

    @Query("SELECT * FROM conversation_sessions WHERE sessionId = :sessionId LIMIT 1")
    suspend fun getSessionByIdSync(sessionId: String): ConversationSessionEntity?

    @Transaction
    @Query("SELECT * FROM conversation_sessions WHERE sessionId = :sessionId LIMIT 1")
    fun getSessionWithDetails(sessionId: String): Flow<SessionWithDetails?>

    @Transaction
    @Query("SELECT * FROM conversation_sessions WHERE sessionId = :sessionId LIMIT 1")
    suspend fun getSessionWithDetailsSync(sessionId: String): SessionWithDetails?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateSession(session: ConversationSessionEntity)

    @Query("""
        UPDATE conversation_sessions 
        SET endTimeEpochMs = :endTimeEpochMs, 
            durationSeconds = :durationSeconds, 
            isCompleted = :isCompleted 
        WHERE sessionId = :sessionId
    """)
    suspend fun updateSessionCompletion(
        sessionId: String,
        endTimeEpochMs: Long,
        durationSeconds: Int,
        isCompleted: Boolean
    )

    @Query("""
        UPDATE conversation_sessions 
        SET turnCount = :turnCount, 
            userTurnCount = :userTurnCount 
        WHERE sessionId = :sessionId
    """)
    suspend fun updateSessionTurnCounts(
        sessionId: String,
        turnCount: Int,
        userTurnCount: Int
    )

    @Query("DELETE FROM conversation_sessions WHERE sessionId = :sessionId")
    suspend fun deleteSession(sessionId: String)

    @Query("DELETE FROM conversation_sessions")
    suspend fun deleteAllSessions()

    @Query("SELECT COUNT(*) FROM conversation_sessions")
    fun getTotalSessionsCount(): Flow<Int>
}

