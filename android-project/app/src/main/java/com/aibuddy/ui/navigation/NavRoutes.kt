package com.aibuddy.ui.navigation

sealed class Screen(val route: String) {
    data object Home : Screen("home")
    data object Conversation : Screen("conversation")
    data object Chat : Screen("chat")
    data object Settings : Screen("settings")
    data object DiagnosticM0 : Screen("diagnostic_m0")
    data object Flashcards : Screen("flashcards")
    data object SessionDetail : Screen("session_detail/{sessionId}") {
        fun createRoute(sessionId: String): String = "session_detail/$sessionId"
    }
}
