package com.aibuddy.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore

private val Context.userPreferencesDataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

fun UserPreferencesRepository(context: Context): UserPreferencesRepository {
    return UserPreferencesRepository(context.userPreferencesDataStore)
}

