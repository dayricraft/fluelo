package com.aibuddy.data.flashcard.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

/**
 * Immutable-ish lexical dictionary entry for a vocabulary headword.
 * Enriched offline at build-time.
 */
@Serializable
@Entity(tableName = "vocabulary_entries")
data class VocabularyEntry(
    @PrimaryKey
    val id: Int,
    val headword: String,
    val normalizedKey: String,
    val partOfSpeech: String,
    val meaningsId: String,
    val ipa: String,
    val pronunciationLocale: String = "en-US",
    val exampleEn: String,
    val exampleId: String,
    val contentStatus: String = "ready",
    val datasetVersion: Int = 1
)
