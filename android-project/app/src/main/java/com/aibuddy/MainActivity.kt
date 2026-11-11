package com.aibuddy

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.aibuddy.data.preferences.ThemeMode
import com.aibuddy.live.AudioSessionState
import com.aibuddy.ui.navigation.AiBuddyNavGraph
import com.aibuddy.ui.theme.AIBuddyTheme
import com.aibuddy.ui.viewmodel.LiveSessionViewModel
import com.aibuddy.ui.viewmodel.SettingsViewModel

class MainActivity : ComponentActivity() {

    private val liveSessionViewModel: LiveSessionViewModel by viewModels()
    private val settingsViewModel: SettingsViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val userPreferences by settingsViewModel.userPreferences.collectAsState()
            val isSystemDark = isSystemInDarkTheme()

            val isDarkTheme = when (userPreferences.themeMode) {
                ThemeMode.DARK -> true
                ThemeMode.LIGHT -> false
                ThemeMode.SYSTEM -> isSystemDark
            }

            AIBuddyTheme(darkTheme = isDarkTheme) {
                AiBuddyNavGraph(
                    liveSessionViewModel = liveSessionViewModel,
                    settingsViewModel = settingsViewModel
                )
            }
        }
    }

    override fun onPause() {
        super.onPause()
        // Stop audio capture when app is backgrounded to protect user privacy
        if (liveSessionViewModel.sessionState.value != AudioSessionState.IDLE) {
            liveSessionViewModel.stopSession()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        liveSessionViewModel.stopSession()
    }
}
