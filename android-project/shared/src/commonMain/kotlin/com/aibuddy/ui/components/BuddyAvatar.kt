package com.aibuddy.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPurple

/**
 * Modern, branded Buddy Mascot Avatar component (Pure Compose Vector/Canvas).
 * Features the official chromatic cat persona with ambient aura,
 * pointed ears, and luminous expressive eyes.
 * 100% resilient across Android & iOS without external image file loading.
 */
@Composable
fun BuddyAvatar(
    size: Dp = 32.dp,
    useNeonAccent: Boolean = false,
    modifier: Modifier = Modifier
) {
    val accentColor = if (useNeonAccent) NeonLime else SoftPurple

    Box(
        modifier = modifier
            .size(size)
            .shadow(
                elevation = 4.dp,
                shape = CircleShape,
                ambientColor = Color.Black.copy(alpha = 0.6f),
                spotColor = accentColor.copy(alpha = 0.45f)
            )
            .clip(CircleShape)
            .border(
                width = 1.dp,
                brush = Brush.linearGradient(
                    colors = listOf(
                        accentColor.copy(alpha = 0.65f),
                        Color(0xFF2E2E36)
                    )
                ),
                shape = CircleShape
            )
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF24242E),
                        Color(0xFF111114)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.size(size * 0.72f)) {
            val w = this.size.width
            val h = this.size.height

            // 1. Left Ear
            val leftEarPath = Path().apply {
                moveTo(w * 0.22f, h * 0.50f)
                lineTo(w * 0.18f, h * 0.16f)
                lineTo(w * 0.46f, h * 0.34f)
                close()
            }
            drawPath(
                path = leftEarPath,
                color = Color(0xFF1E1E26)
            )
            // Left inner ear accent
            val leftInnerEar = Path().apply {
                moveTo(w * 0.24f, h * 0.46f)
                lineTo(w * 0.21f, h * 0.24f)
                lineTo(w * 0.40f, h * 0.36f)
                close()
            }
            drawPath(
                path = leftInnerEar,
                color = accentColor.copy(alpha = 0.85f)
            )

            // 2. Right Ear
            val rightEarPath = Path().apply {
                moveTo(w * 0.78f, h * 0.50f)
                lineTo(w * 0.82f, h * 0.16f)
                lineTo(w * 0.54f, h * 0.34f)
                close()
            }
            drawPath(
                path = rightEarPath,
                color = Color(0xFF1E1E26)
            )
            // Right inner ear accent
            val rightInnerEar = Path().apply {
                moveTo(w * 0.76f, h * 0.46f)
                lineTo(w * 0.79f, h * 0.24f)
                lineTo(w * 0.60f, h * 0.36f)
                close()
            }
            drawPath(
                path = rightInnerEar,
                color = accentColor.copy(alpha = 0.85f)
            )

            // 3. Cat Head Base
            drawOval(
                color = Color(0xFF16161C),
                topLeft = Offset(w * 0.15f, h * 0.28f),
                size = Size(w * 0.70f, h * 0.64f)
            )

            // 4. Luminous Expressive Eyes (Fluelo signature chromatic glow)
            // Left Eye
            drawOval(
                color = Color(0xFF00EBFF), // Cyan core
                topLeft = Offset(w * 0.30f, h * 0.50f),
                size = Size(w * 0.14f, h * 0.20f)
            )
            drawCircle(
                color = Color.White,
                radius = w * 0.035f,
                center = Offset(w * 0.35f, h * 0.56f)
            )

            // Right Eye
            drawOval(
                color = NeonLime, // Neon Lime core
                topLeft = Offset(w * 0.56f, h * 0.50f),
                size = Size(w * 0.14f, h * 0.20f)
            )
            drawCircle(
                color = Color.White,
                radius = w * 0.035f,
                center = Offset(w * 0.61f, h * 0.56f)
            )

            // 5. Small nose accent
            drawCircle(
                color = accentColor.copy(alpha = 0.9f),
                radius = w * 0.035f,
                center = Offset(w * 0.50f, h * 0.74f)
            )
        }
    }
}
