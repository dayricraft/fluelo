package com.aibuddy.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import com.aibuddy.live.AudioSessionState

/**
 * Procedural Chromatic Cat Mascot Character for Fluelo (Compose Multiplatform).
 * Features an abstract dark cat silhouette, luminous white eyes,
 * and a chromatic aberration glow that reactively mirrors AI states.
 * Works natively on Android and iOS.
 */
@Composable
fun ChromaticCatCharacter(
    sessionState: AudioSessionState,
    audioAmplitude: Float = 0f,
    reducedMotion: Boolean = false,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "catFloat")
    val breathingScale by if (reducedMotion) {
        remember { mutableFloatStateOf(1.0f) }
    } else {
        infiniteTransition.animateFloat(
            initialValue = 0.98f,
            targetValue = 1.02f,
            animationSpec = infiniteRepeatable(
                animation = tween(2600, easing = FastOutSlowInEasing),
                repeatMode = RepeatMode.Reverse
            ),
            label = "catBreathing"
        )
    }

    val targetScale = when {
        reducedMotion -> 1.0f
        sessionState == AudioSessionState.BUDDY_SPEAKING -> 1.0f + (audioAmplitude * 0.10f).coerceIn(0f, 0.12f)
        sessionState == AudioSessionState.USER_SPEAKING -> 1.0f + (audioAmplitude * 0.06f).coerceIn(0f, 0.08f)
        sessionState == AudioSessionState.ERROR -> 0.94f
        else -> breathingScale
    }

    val animatedScale by animateFloatAsState(
        targetValue = targetScale,
        animationSpec = if (reducedMotion) snap() else spring(stiffness = Spring.StiffnessLow),
        label = "catScaleSpring"
    )

    val rotationDegrees by if (reducedMotion) {
        remember { mutableFloatStateOf(0f) }
    } else {
        infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = 360f,
            animationSpec = infiniteRepeatable(
                animation = tween(12000, easing = LinearEasing),
                repeatMode = RepeatMode.Restart
            ),
            label = "auraRotation"
        )
    }

    val normalColors = remember {
        listOf(
            Color(0xFF00EBFF), // Cyan
            Color(0xFF3264FF), // Blue
            Color(0xFFDC3CFF), // Magenta
            Color(0xFFC8F53B), // Neon Lime
            Color(0xFF00EBFF)  // Cyan
        )
    }

    val connectingColors = remember {
        listOf(
            Color(0xFFFFB400), // Amber
            Color(0xFFFF7832), // Orange
            Color(0xFFFFD250), // Light Amber
            Color(0xFFFFB400)  // Amber
        )
    }

    val errorColors = remember {
        listOf(
            Color(0xFFFF4444), // Red
            Color(0xFFB42828), // Dark Red
            Color(0xFFFF6464), // Soft Red
            Color(0xFFFF4444)  // Red
        )
    }

    val leftEarPath = remember { Path() }
    val rightEarPath = remember { Path() }
    val bodyPath = remember { Path() }
    var cachedSize by remember { mutableStateOf(Size.Zero) }

    Box(
        modifier = modifier.scale(animatedScale),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            if (size != cachedSize) {
                cachedSize = size

                leftEarPath.reset()
                leftEarPath.moveTo(w * 0.25f, h * 0.45f)
                leftEarPath.lineTo(w * 0.22f, h * 0.20f)
                leftEarPath.lineTo(w * 0.47f, h * 0.29f)
                leftEarPath.close()

                rightEarPath.reset()
                rightEarPath.moveTo(w * 0.48f, h * 0.29f)
                rightEarPath.lineTo(w * 0.73f, h * 0.21f)
                rightEarPath.lineTo(w * 0.69f, h * 0.46f)
                rightEarPath.close()

                bodyPath.reset()
                bodyPath.moveTo(w * 0.27f, h * 0.44f)
                bodyPath.cubicTo(w * 0.27f, h * 0.26f, w * 0.68f, h * 0.26f, w * 0.71f, h * 0.46f)
                bodyPath.cubicTo(w * 0.76f, h * 0.62f, w * 0.84f, h * 0.72f, w * 0.72f, h * 0.78f)
                bodyPath.cubicTo(w * 0.52f, h * 0.84f, w * 0.35f, h * 0.76f, w * 0.31f, h * 0.60f)
                bodyPath.close()
            }

            val auraColors = when (sessionState) {
                AudioSessionState.CONNECTING, AudioSessionState.RECONNECTING -> connectingColors
                AudioSessionState.ERROR -> errorColors
                else -> normalColors
            }

            // 1. Soft Ambient Purple Shadow Glow
            drawOval(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF30234B).copy(alpha = 0.6f), Color.Transparent),
                    center = Offset(w * 0.50f, h * 0.52f),
                    radius = w * 0.38f
                ),
                topLeft = Offset(w * 0.15f, h * 0.22f),
                size = Size(w * 0.70f, h * 0.60f)
            )

            // 2. Chromatic Aberration Aura Ring with Audio Modulation
            val auraStrokeWidth = 24f + (audioAmplitude * 20f).coerceIn(0f, 22f)
            val auraAlpha = when (sessionState) {
                AudioSessionState.IDLE -> 0.70f
                AudioSessionState.CONNECTING, AudioSessionState.RECONNECTING -> 0.85f
                AudioSessionState.ERROR -> 0.40f
                AudioSessionState.BUDDY_SPEAKING -> 1.0f
                AudioSessionState.USER_SPEAKING -> 0.90f
                else -> 0.80f
            }

            rotate(rotationDegrees, pivot = Offset(w * 0.48f, h * 0.48f)) {
                drawOval(
                    brush = Brush.sweepGradient(
                        colors = auraColors,
                        center = Offset(w * 0.48f, h * 0.48f)
                    ),
                    topLeft = Offset(w * 0.22f, h * 0.25f),
                    size = Size(w * 0.54f, h * 0.48f),
                    style = Stroke(width = auraStrokeWidth),
                    alpha = auraAlpha
                )
            }

            // 3. Cat Silhouette Ears
            val earColor = Color(0xFF0A0A0C)
            drawPath(leftEarPath, color = earColor)
            drawPath(rightEarPath, color = earColor)

            // 4. Cat Silhouette Body & Head
            val bodyColor = Color(0xFF08080A)
            drawPath(bodyPath, color = bodyColor)

            // 5. Bright Luminous Cat Eyes
            val eyeRadius = w * 0.042f
            drawCircle(
                color = Color.White,
                radius = eyeRadius,
                center = Offset(w * 0.38f, h * 0.49f)
            )
            drawCircle(
                color = Color.White,
                radius = eyeRadius,
                center = Offset(w * 0.59f, h * 0.49f)
            )
        }
    }
}

