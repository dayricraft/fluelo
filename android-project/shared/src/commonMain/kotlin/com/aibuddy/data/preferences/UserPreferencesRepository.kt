package com.aibuddy.data.preferences

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map

enum class ThemeMode {
    DARK,
    LIGHT,
    SYSTEM
}

enum class AppLanguage(val code: String, val displayName: String) {
    INDONESIAN("ID", "Bahasa Indonesia"),
    ENGLISH("EN", "English")
}

data class UserPreferences(
    val themeMode: ThemeMode = ThemeMode.DARK,
    val language: AppLanguage = AppLanguage.INDONESIAN,
    val aiVoice: String = "Puck",
    val userName: String = "Teman",
    val reducedMotion: Boolean = false,
    val hapticFeedbackEnabled: Boolean = true,
    val geminiApiKey: String = ""
)

class UserPreferencesRepository(private val dataStore: DataStore<Preferences>) {

    object PreferencesKeys {
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val APP_LANGUAGE = stringPreferencesKey("app_language")
        val AI_VOICE = stringPreferencesKey("ai_voice")
        val USER_NAME = stringPreferencesKey("user_name")
        val REDUCED_MOTION = booleanPreferencesKey("reduced_motion")
        val HAPTIC_FEEDBACK = booleanPreferencesKey("haptic_feedback")
        val GEMINI_API_KEY = stringPreferencesKey("gemini_api_key")
    }

    val userPreferencesFlow: Flow<UserPreferences> = dataStore.data
        .catch {
            emit(emptyPreferences())
        }
        .map { preferences ->
            val themeModeStr = preferences[PreferencesKeys.THEME_MODE] ?: ThemeMode.DARK.name
            val themeMode = try {
                ThemeMode.valueOf(themeModeStr)
            } catch (_: Exception) {
                ThemeMode.DARK
            }

            val langStr = preferences[PreferencesKeys.APP_LANGUAGE] ?: AppLanguage.INDONESIAN.name
            val language = try {
                AppLanguage.valueOf(langStr)
            } catch (_: Exception) {
                AppLanguage.INDONESIAN
            }

            val aiVoice = preferences[PreferencesKeys.AI_VOICE] ?: "Puck"
            val userName = preferences[PreferencesKeys.USER_NAME] ?: "Teman"
            val reducedMotion = preferences[PreferencesKeys.REDUCED_MOTION] ?: false
            val hapticFeedback = preferences[PreferencesKeys.HAPTIC_FEEDBACK] ?: true
            val geminiApiKey = preferences[PreferencesKeys.GEMINI_API_KEY] ?: ""

            UserPreferences(
                themeMode = themeMode,
                language = language,
                aiVoice = aiVoice,
                userName = userName,
                reducedMotion = reducedMotion,
                hapticFeedbackEnabled = hapticFeedback,
                geminiApiKey = geminiApiKey
            )
        }

    suspend fun setThemeMode(mode: ThemeMode) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.THEME_MODE] = mode.name
        }
    }

    suspend fun setLanguage(language: AppLanguage) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.APP_LANGUAGE] = language.name
        }
    }

    suspend fun setAiVoice(voice: String) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.AI_VOICE] = voice
        }
    }

    suspend fun setUserName(name: String) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.USER_NAME] = name
        }
    }

    suspend fun setReducedMotion(reduced: Boolean) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.REDUCED_MOTION] = reduced
        }
    }

    suspend fun setHapticFeedback(enabled: Boolean) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.HAPTIC_FEEDBACK] = enabled
        }
    }

    suspend fun setGeminiApiKey(apiKey: String) {
        dataStore.edit { preferences ->
            preferences[PreferencesKeys.GEMINI_API_KEY] = apiKey.trim()
        }
    }
}

