package com.aibuddy.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.aibuddy.data.preferences.AppLanguage
import com.aibuddy.data.preferences.ThemeMode
import com.aibuddy.data.preferences.UserPreferences
import com.aibuddy.data.preferences.UserPreferencesRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = UserPreferencesRepository(application.applicationContext)

    val userPreferences: StateFlow<UserPreferences> = repository.userPreferencesFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = UserPreferences()
        )

    fun setThemeMode(mode: ThemeMode) {
        viewModelScope.launch {
            repository.setThemeMode(mode)
        }
    }

    fun setLanguage(language: AppLanguage) {
        viewModelScope.launch {
            repository.setLanguage(language)
        }
    }

    fun setAiVoice(voice: String) {
        viewModelScope.launch {
            repository.setAiVoice(voice)
        }
    }

    fun setUserName(name: String) {
        viewModelScope.launch {
            repository.setUserName(name)
        }
    }

    fun setReducedMotion(enabled: Boolean) {
        viewModelScope.launch {
            repository.setReducedMotion(enabled)
        }
    }

    fun setHapticFeedback(enabled: Boolean) {
        viewModelScope.launch {
            repository.setHapticFeedback(enabled)
        }
    }
}
