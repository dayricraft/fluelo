package com.aibuddy.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

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
    val hapticFeedbackEnabled: Boolean = true
)

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

class UserPreferencesRepository(private val context: Context) {

    private object PreferencesKeys {
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val APP_LANGUAGE = stringPreferencesKey("app_language")
        val AI_VOICE = stringPreferencesKey("ai_voice")
        val USER_NAME = stringPreferencesKey("user_name")
        val REDUCED_MOTION = booleanPreferencesKey("reduced_motion")
        val HAPTIC_FEEDBACK = booleanPreferencesKey("haptic_feedback")
    }

    val userPreferencesFlow: Flow<UserPreferences> = context.dataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
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

            UserPreferences(
                themeMode = themeMode,
                language = language,
                aiVoice = aiVoice,
                userName = userName,
                reducedMotion = reducedMotion,
                hapticFeedbackEnabled = hapticFeedback
            )
        }

    suspend fun setThemeMode(mode: ThemeMode) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.THEME_MODE] = mode.name
        }
    }

    suspend fun setLanguage(language: AppLanguage) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.APP_LANGUAGE] = language.name
        }
    }

    suspend fun setAiVoice(voice: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.AI_VOICE] = voice
        }
    }

    suspend fun setUserName(name: String) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.USER_NAME] = name
        }
    }

    suspend fun setReducedMotion(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.REDUCED_MOTION] = enabled
        }
    }

    suspend fun setHapticFeedback(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[PreferencesKeys.HAPTIC_FEEDBACK] = enabled
        }
    }
}
