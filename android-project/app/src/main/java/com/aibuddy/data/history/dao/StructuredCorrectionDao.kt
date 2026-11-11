package com.aibuddy.data.history.dao

import androidx.room.*
import com.aibuddy.data.history.model.StructuredCorrectionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface StructuredCorrectionDao {

    @Query("SELECT * FROM structured_corrections WHERE sessionId = :sessionId ORDER BY timestampEpochMs ASC")
    fun getCorrectionsForSession(sessionId: String): Flow<List<StructuredCorrectionEntity>>

    @Query("SELECT * FROM structured_corrections WHERE sessionId = :sessionId ORDER BY timestampEpochMs ASC")
    suspend fun getCorrectionsForSessionSync(sessionId: String): List<StructuredCorrectionEntity>

    @Query("SELECT * FROM structured_corrections WHERE messageId = :messageId LIMIT 1")
    fun getCorrectionForMessage(messageId: String): Flow<StructuredCorrectionEntity?>

    @Query("SELECT * FROM structured_corrections ORDER BY timestampEpochMs DESC")
    fun getAllCorrections(): Flow<List<StructuredCorrectionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCorrection(correction: StructuredCorrectionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCorrections(corrections: List<StructuredCorrectionEntity>)

    @Query("SELECT COUNT(*) FROM structured_corrections")
    fun getTotalCorrectionsCount(): Flow<Int>
}

