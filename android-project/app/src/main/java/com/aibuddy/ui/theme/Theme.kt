package com.aibuddy.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = NeonLime,
    onPrimary = BackgroundDark,
    primaryContainer = SurfaceDark,
    onPrimaryContainer = TextPrimaryDark,
    secondary = SoftPurple,
    onSecondary = BackgroundDark,
    tertiary = SoftPink,
    background = BackgroundDark,
    surface = SurfaceDark,
    onBackground = TextPrimaryDark,
    onSurface = TextPrimaryDark,
    surfaceVariant = SurfaceCardDark,
    onSurfaceVariant = TextSecondaryDark,
    error = ErrorRed,
    onError = TextPrimaryDark
)

private val LightColorScheme = lightColorScheme(
    primary = NeonLime,
    onPrimary = BackgroundDark,
    primaryContainer = SurfaceLight,
    onPrimaryContainer = TextPrimaryLight,
    secondary = SoftPurple,
    onSecondary = BackgroundDark,
    tertiary = SoftPink,
    background = BackgroundLight,
    surface = SurfaceLight,
    onBackground = TextPrimaryLight,
    onSurface = TextPrimaryLight,
    surfaceVariant = SurfaceCardLight,
    onSurfaceVariant = TextSecondaryLight,
    error = ErrorRed,
    onError = SurfaceLight
)

@Composable
fun AIBuddyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window ?: return@SideEffect
            val insetsController = WindowCompat.getInsetsController(window, view)
            insetsController.isAppearanceLightStatusBars = !darkTheme
            insetsController.isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
