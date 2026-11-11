package com.aibuddy.data.history.dao

import androidx.room.*
import com.aibuddy.data.history.model.SessionSummaryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SessionSummaryDao {

    @Query("SELECT * FROM session_summaries WHERE sessionId = :sessionId LIMIT 1")
    fun getSummaryForSession(sessionId: String): Flow<SessionSummaryEntity?>

    @Query("SELECT * FROM session_summaries WHERE sessionId = :sessionId LIMIT 1")
    suspend fun getSummaryForSessionSync(sessionId: String): SessionSummaryEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateSummary(summary: SessionSummaryEntity)

    @Query("DELETE FROM session_summaries WHERE sessionId = :sessionId")
    suspend fun deleteSummary(sessionId: String)
}

