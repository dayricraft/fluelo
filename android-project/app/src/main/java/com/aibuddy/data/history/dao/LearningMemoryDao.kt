package com.aibuddy.data.history.dao

import androidx.room.*
import com.aibuddy.data.history.model.LearningMemorySignalEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LearningMemoryDao {

    @Query("SELECT * FROM learning_memory_signals ORDER BY frequencyCount DESC, lastObservedEpochMs DESC")
    fun getAllSignals(): Flow<List<LearningMemorySignalEntity>>

    @Query("SELECT * FROM learning_memory_signals WHERE category = :category ORDER BY frequencyCount DESC")
    fun getSignalsByCategory(category: String): Flow<List<LearningMemorySignalEntity>>

    @Query("SELECT * FROM learning_memory_signals WHERE patternKey = :patternKey LIMIT 1")
    suspend fun getSignalByKey(patternKey: String): LearningMemorySignalEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateSignal(signal: LearningMemorySignalEntity)

    @Query("DELETE FROM learning_memory_signals")
    suspend fun clearAllSignals()

    @Query("DELETE FROM learning_memory_signals WHERE patternKey = :patternKey")
    suspend fun deleteSignal(patternKey: String)
}

