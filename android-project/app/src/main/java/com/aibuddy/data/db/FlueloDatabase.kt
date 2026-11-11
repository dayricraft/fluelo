package com.aibuddy.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.aibuddy.data.flashcard.dao.FlashcardDeckDao
import com.aibuddy.data.flashcard.dao.VocabularyDao
import com.aibuddy.data.flashcard.model.FlashcardDeckState
import com.aibuddy.data.flashcard.model.VocabularyEntry
import com.aibuddy.data.flashcard.model.VocabularyProgress
import com.aibuddy.data.history.dao.ConversationMessageDao
import com.aibuddy.data.history.dao.ConversationSessionDao
import com.aibuddy.data.history.dao.LearningMemoryDao
import com.aibuddy.data.history.dao.SessionSummaryDao
import com.aibuddy.data.history.dao.StructuredCorrectionDao
import com.aibuddy.data.history.model.ConversationMessageEntity
import com.aibuddy.data.history.model.ConversationSessionEntity
import com.aibuddy.data.history.model.LearningMemorySignalEntity
import com.aibuddy.data.history.model.SessionSummaryEntity
import com.aibuddy.data.history.model.StructuredCorrectionEntity

/**
 * Canonical Room database for Fluelo.
 * Version 1 established offline vocabulary and flashcard learning progress.
 * Version 2 establishes local conversation history, structured corrections,
 * session summaries, and persistent learning memory signals.
 */
@Database(
    entities = [
        VocabularyEntry::class,
        VocabularyProgress::class,
        FlashcardDeckState::class,
        ConversationSessionEntity::class,
        ConversationMessageEntity::class,
        StructuredCorrectionEntity::class,
        SessionSummaryEntity::class,
        LearningMemorySignalEntity::class
    ],
    version = 2,
    exportSchema = false
)
abstract class FlueloDatabase : RoomDatabase() {

    abstract fun vocabularyDao(): VocabularyDao
    abstract fun flashcardDeckDao(): FlashcardDeckDao
    abstract fun conversationSessionDao(): ConversationSessionDao
    abstract fun conversationMessageDao(): ConversationMessageDao
    abstract fun structuredCorrectionDao(): StructuredCorrectionDao
    abstract fun sessionSummaryDao(): SessionSummaryDao
    abstract fun learningMemoryDao(): LearningMemoryDao

    companion object {
        @Volatile
        private var INSTANCE: FlueloDatabase? = null

        val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(db: SupportSQLiteDatabase) {
                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS conversation_sessions (
                        sessionId TEXT PRIMARY KEY NOT NULL,
                        startTimeEpochMs INTEGER NOT NULL,
                        endTimeEpochMs INTEGER,
                        durationSeconds INTEGER NOT NULL,
                        primaryMode TEXT NOT NULL,
                        modality TEXT NOT NULL,
                        title TEXT NOT NULL,
                        turnCount INTEGER NOT NULL,
                        userTurnCount INTEGER NOT NULL,
                        isCompleted INTEGER NOT NULL
                    )
                """.trimIndent())

                db.execSQL("""
                    CREATE INDEX IF NOT EXISTS index_conversation_sessions_startTimeEpochMs 
                    ON conversation_sessions(startTimeEpochMs)
                """.trimIndent())

                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS conversation_messages (
                        messageId TEXT PRIMARY KEY NOT NULL,
                        sessionId TEXT NOT NULL,
                        sender TEXT NOT NULL,
                        modality TEXT NOT NULL,
                        content TEXT NOT NULL,
                        timestampEpochMs INTEGER NOT NULL,
                        sequenceOrder INTEGER NOT NULL,
                        isInterrupted INTEGER NOT NULL,
                        FOREIGN KEY(sessionId) REFERENCES conversation_sessions(sessionId) ON UPDATE NO ACTION ON DELETE CASCADE
                    )
                """.trimIndent())

                db.execSQL("""
                    CREATE INDEX IF NOT EXISTS index_conversation_messages_sessionId_sequenceOrder 
                    ON conversation_messages(sessionId, sequenceOrder)
                """.trimIndent())

                db.execSQL("""
                    CREATE INDEX IF NOT EXISTS index_conversation_messages_sessionId 
                    ON conversation_messages(sessionId)
                """.trimIndent())

                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS structured_corrections (
                        correctionId TEXT PRIMARY KEY NOT NULL,
                        sessionId TEXT NOT NULL,
                        messageId TEXT,
                        originalUtterance TEXT NOT NULL,
                        correctedExpression TEXT NOT NULL,
                        explanation TEXT NOT NULL,
                        category TEXT NOT NULL,
                        severity TEXT NOT NULL,
                        spokenNote TEXT,
                        timestampEpochMs INTEGER NOT NULL,
                        FOREIGN KEY(sessionId) REFERENCES conversation_sessions(sessionId) ON UPDATE NO ACTION ON DELETE CASCADE,
                        FOREIGN KEY(messageId) REFERENCES conversation_messages(messageId) ON UPDATE NO ACTION ON DELETE SET NULL
                    )
                """.trimIndent())

                db.execSQL("""
                    CREATE INDEX IF NOT EXISTS index_structured_corrections_sessionId 
                    ON structured_corrections(sessionId)
                """.trimIndent())

                db.execSQL("""
                    CREATE INDEX IF NOT EXISTS index_structured_corrections_messageId 
                    ON structured_corrections(messageId)
                """.trimIndent())

                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS session_summaries (
                        sessionId TEXT PRIMARY KEY NOT NULL,
                        topicsDiscussedJson TEXT NOT NULL,
                        grammarHighlightsJson TEXT NOT NULL,
                        vocabularyPracticedJson TEXT NOT NULL,
                        suggestedFocusArea TEXT,
                        generatedAtEpochMs INTEGER NOT NULL,
                        isAiGenerated INTEGER NOT NULL,
                        FOREIGN KEY(sessionId) REFERENCES conversation_sessions(sessionId) ON UPDATE NO ACTION ON DELETE CASCADE
                    )
                """.trimIndent())

                db.execSQL("""
                    CREATE TABLE IF NOT EXISTS learning_memory_signals (
                        patternKey TEXT PRIMARY KEY NOT NULL,
                        category TEXT NOT NULL,
                        frequencyCount INTEGER NOT NULL,
                        lastObservedEpochMs INTEGER NOT NULL,
                        examplesJson TEXT NOT NULL
                    )
                """.trimIndent())

                db.execSQL("""
                    CREATE INDEX IF NOT EXISTS index_learning_memory_signals_category 
                    ON learning_memory_signals(category)
                """.trimIndent())
            }
        }

        fun getInstance(context: Context): FlueloDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    FlueloDatabase::class.java,
                    "fluelo.db"
                )
                    .addMigrations(MIGRATION_1_2)
                    .build()
                    .also { INSTANCE = it }
            }
        }
    }
}
