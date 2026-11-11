package com.aibuddy.data.history.memory

import com.aibuddy.data.history.dao.LearningMemoryDao
import com.aibuddy.data.history.model.LearningMemorySignalEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Repositori memori pembelajaran transparan untuk melacak pola bahasa nyata
 * tanpa membuat skor buatan atau profil fiktif.
 */
class LearningMemoryRepository(
    private val memoryDao: LearningMemoryDao
) {
    private val json = Json { ignoreUnknownKeys = true }

    val allSignals: Flow<List<LearningMemorySignalEntity>> = memoryDao.getAllSignals()

    fun getSignalsByCategory(category: String): Flow<List<LearningMemorySignalEntity>> {
        return memoryDao.getSignalsByCategory(category)
    }

    suspend fun recordGrammarMistake(category: String, originalSnippet: String) {
        val patternKey = "CATEGORY_${category.uppercase()}"
        val existing = memoryDao.getSignalByKey(patternKey)

        val updatedExamples = if (existing != null) {
            val examples = try {
                json.decodeFromString<List<String>>(existing.examplesJson).toMutableList()
            } catch (e: Exception) {
                mutableListOf()
            }
            if (originalSnippet.isNotBlank() && originalSnippet !in examples) {
                examples.add(0, originalSnippet.take(80))
            }
            examples.take(3)
        } else {
            listOf(originalSnippet.take(80))
        }

        val updatedSignal = LearningMemorySignalEntity(
            patternKey = patternKey,
            category = "GRAMMAR_MISTAKE",
            frequencyCount = (existing?.frequencyCount ?: 0) + 1,
            lastObservedEpochMs = System.currentTimeMillis(),
            examplesJson = json.encodeToString(updatedExamples)
        )
        memoryDao.insertOrUpdateSignal(updatedSignal)
    }

    suspend fun recordModeUsage(modeName: String) {
        val patternKey = "MODE_${modeName.uppercase()}"
        val existing = memoryDao.getSignalByKey(patternKey)
        val updatedSignal = LearningMemorySignalEntity(
            patternKey = patternKey,
            category = "PREFERRED_MODE",
            frequencyCount = (existing?.frequencyCount ?: 0) + 1,
            lastObservedEpochMs = System.currentTimeMillis(),
            examplesJson = "[]"
        )
        memoryDao.insertOrUpdateSignal(updatedSignal)
    }

    suspend fun clearMemory() {
        memoryDao.clearAllSignals()
    }
}

