package com.aibuddy.data.preferences

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

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
    }

    @Test
    fun appLanguage_displaysCorrectLabels() {
        assertEquals("Bahasa Indonesia", AppLanguage.INDONESIAN.displayName)
        assertEquals("ID", AppLanguage.INDONESIAN.code)
        assertEquals("English", AppLanguage.ENGLISH.displayName)
        assertEquals("EN", AppLanguage.ENGLISH.code)
    }
}
