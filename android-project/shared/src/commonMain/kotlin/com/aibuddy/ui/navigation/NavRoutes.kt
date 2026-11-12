package com.aibuddy.ui.navigation

sealed interface AppRoute {
    data object Home : AppRoute
    data object Chat : AppRoute
    data object Flashcards : AppRoute
    data object Settings : AppRoute
    data class SessionDetail(val sessionId: String) : AppRoute
}

