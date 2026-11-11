package com.aibuddy.data.history.model

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entitas Room untuk sinyal memori pembelajaran yang transparan dan dapat dijelaskan (explainable).
 * Mencatat pola kesalahan berulang (misal kategori tata bahasa tertentu) dan kosakata yang perlu diulas.
 */
@Entity(
    tableName = "learning_memory_signals",
    indices = [
        Index(value = ["category"])
    ]
)
data class LearningMemorySignalEntity(
    @PrimaryKey
    val patternKey: String, // e.g. "CATEGORY_TENSE", "WORD_negotiate"
    val category: String, // "GRAMMAR_MISTAKE", "VOCABULARY_PRACTICED", "PREFERRED_MODE"
    val frequencyCount: Int = 1,
    val lastObservedEpochMs: Long = System.currentTimeMillis(),
    val examplesJson: String = "[]" // JSON array of up to 3 exact user snippets
)

