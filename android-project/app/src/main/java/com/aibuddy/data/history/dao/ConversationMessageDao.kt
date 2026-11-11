package com.aibuddy.data.history.dao

import androidx.room.*
import com.aibuddy.data.history.model.ConversationMessageEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ConversationMessageDao {

    @Query("SELECT * FROM conversation_messages WHERE sessionId = :sessionId ORDER BY sequenceOrder ASC")
    fun getMessagesForSession(sessionId: String): Flow<List<ConversationMessageEntity>>

    @Query("SELECT * FROM conversation_messages WHERE sessionId = :sessionId ORDER BY sequenceOrder ASC")
    suspend fun getMessagesForSessionSync(sessionId: String): List<ConversationMessageEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: ConversationMessageEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessages(messages: List<ConversationMessageEntity>)

    @Query("UPDATE conversation_messages SET isInterrupted = :isInterrupted, content = :content WHERE messageId = :messageId")
    suspend fun updateMessageContentAndInterrupted(messageId: String, isInterrupted: Boolean, content: String)

    @Query("SELECT COUNT(*) FROM conversation_messages WHERE sessionId = :sessionId")
    suspend fun getMessageCountForSession(sessionId: String): Int
}

