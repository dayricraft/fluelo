package com.aibuddy.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.lerp
import com.aibuddy.ui.theme.BackgroundDark
import com.aibuddy.ui.theme.SoftPurple

/**
 * Native Jetpack Compose implementation of the ambient radial gradient background.
 * Translates: radial-gradient(125% 125% at 50% 10%, #000 40%, #glow 100%)
 *
 * Uses the AI Buddy brand palette (BackgroundDark with SoftPurple or chromatic accents).
 */
@Composable
fun RadialGradientBackground(
    modifier: Modifier = Modifier,
    glowColor: Color = SoftPurple,
    baseColor: Color = BackgroundDark,
    glowStrength: Float = 0.48f,
    content: @Composable BoxScope.() -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .drawBehind {
                val centerX = size.width * 0.50f
                val centerY = size.height * 0.10f
                // Radius tuned for Android portrait aspect ratios so glow is visible in the lower half
                val radius = size.height * 0.88f

                val brush = Brush.radialGradient(
                    0.00f to baseColor,
                    0.30f to baseColor,
                    0.65f to lerp(baseColor, glowColor, glowStrength * 0.40f),
                    1.00f to lerp(baseColor, glowColor, glowStrength),
                    center = Offset(centerX, centerY),
                    radius = radius
                )
                drawRect(brush = brush)
            },
        content = content
    )
}
