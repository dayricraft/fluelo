package com.aibuddy.data.history

import android.content.Context
import android.util.Log
import com.aibuddy.data.chat.ChatMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File

/**
 * Persistent repository for Chat Room message history (`chat_history.json`).
 * Allows the user to return to previous conversations or clear them at will.
 */
class ChatHistoryRepository private constructor(private val context: Context) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    private val json = Json {
        ignoreUnknownKeys = true
        prettyPrint = true
        isLenient = true
    }

    private val file by lazy {
        File(context.filesDir, "chat_history.json")
    }

    fun loadMessages(): List<ChatMessage> {
        return try {
            if (file.exists()) {
                val text = file.readText()
                if (text.isNotBlank()) {
                    json.decodeFromString<List<ChatMessage>>(text)
                } else emptyList()
            } else emptyList()
        } catch (e: Exception) {
            Log.e(TAG, "Error loading chat history: ${e.message}")
            emptyList()
        }
    }

    fun saveMessages(messages: List<ChatMessage>) {
        scope.launch {
            withContext(Dispatchers.IO) {
                try {
                    val encoded = json.encodeToString(messages)
                    file.writeText(encoded)
                } catch (e: Exception) {
                    Log.e(TAG, "Error saving chat history: ${e.message}")
                }
            }
        }
    }

    fun clearHistory() {
        scope.launch {
            withContext(Dispatchers.IO) {
                try {
                    if (file.exists()) {
                        file.delete()
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error clearing chat history: ${e.message}")
                }
            }
        }
    }

    companion object {
        private const val TAG = "ChatHistory"

        @Volatile
        private var INSTANCE: ChatHistoryRepository? = null

        fun getInstance(context: Context): ChatHistoryRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: ChatHistoryRepository(context.applicationContext).also {
                    INSTANCE = it
                }
            }
        }
    }
}
