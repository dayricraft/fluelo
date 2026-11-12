package com.aibuddy.data.preferences

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class UserPreferencesTest {

    @Test
    fun defaultPreferences_hasCorrectDefaults() {
        val prefs = UserPreferences()
        assertEquals(ThemeMode.DARK, prefs.themeMode)
        assertEquals(AppLanguage.INDONESIAN, prefs.language)
        assertEquals("Puck", prefs.aiVoice)
        assertEquals("Teman", prefs.userName)
        assertFalse(prefs.reducedMotion)
        assertTrue(prefs.hapticFeedbackEnabled)
        assertEquals("", prefs.geminiApiKey)
    }

    @Test
    fun appLanguage_displaysCorrectLabels() {
        assertEquals("Bahasa Indonesia", AppLanguage.INDONESIAN.displayName)
        assertEquals("ID", AppLanguage.INDONESIAN.code)
        assertEquals("English", AppLanguage.ENGLISH.displayName)
        assertEquals("EN", AppLanguage.ENGLISH.code)
    }
}

