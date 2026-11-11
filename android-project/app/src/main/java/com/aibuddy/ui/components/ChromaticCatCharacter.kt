package com.aibuddy.ui.components

import android.graphics.BlurMaskFilter
import android.graphics.Paint
import android.graphics.Path
import android.graphics.SweepGradient
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import com.aibuddy.live.AudioSessionState

/**
 * Procedural Chromatic Cat Mascot Character for Fluelo.
 * Features an abstract dark cat silhouette, luminous white eyes,
 * and a chromatic aberration glow that reactively mirrors actual AI states.
 * Fully optimized for 60/120fps with ZERO per-frame heap allocations.
 */
@Composable
fun ChromaticCatCharacter(
    sessionState: AudioSessionState,
    audioAmplitude: Float = 0f,
    reducedMotion: Boolean = false,
    modifier: Modifier = Modifier
) {
    // Breathing / floating transition (disabled if reducedMotion is active)
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

    // Dynamic scale affected by speaking amplitude and session state
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

    // Continuous chromatic rotation (disabled if reducedMotion is active)
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

    // Pre-allocated native color arrays to avoid heap allocations
    val normalColors = remember {
        intArrayOf(
            android.graphics.Color.rgb(0, 235, 255),   // Cyan
            android.graphics.Color.rgb(50, 100, 255),  // Blue
            android.graphics.Color.rgb(220, 60, 255),  // Magenta
            android.graphics.Color.rgb(200, 245, 59),  // Neon Lime
            android.graphics.Color.rgb(0, 235, 255)    // Cyan
        )
    }

    val connectingColors = remember {
        intArrayOf(
            android.graphics.Color.rgb(255, 180, 0),   // Amber
            android.graphics.Color.rgb(255, 120, 50),  // Orange
            android.graphics.Color.rgb(255, 210, 80),  // Light Amber
            android.graphics.Color.rgb(255, 180, 0)    // Amber
        )
    }

    val errorColors = remember {
        intArrayOf(
            android.graphics.Color.rgb(255, 68, 68),   // Red
            android.graphics.Color.rgb(180, 40, 40),   // Dark Red
            android.graphics.Color.rgb(255, 100, 100), // Soft Red
            android.graphics.Color.rgb(255, 68, 68)    // Red
        )
    }

    // Reusable Paints with static mask filters (zero per-frame allocations)
    val shadowPaint = remember {
        Paint().apply {
            isAntiAlias = true
            color = android.graphics.Color.argb(160, 48, 35, 75)
            maskFilter = BlurMaskFilter(55f, BlurMaskFilter.Blur.NORMAL)
        }
    }

    val earPaint = remember {
        Paint().apply {
            isAntiAlias = true
            color = android.graphics.Color.rgb(10, 10, 12)
            maskFilter = BlurMaskFilter(8f, BlurMaskFilter.Blur.NORMAL)
        }
    }

    val bodyPaint = remember {
        Paint().apply {
            isAntiAlias = true
            color = android.graphics.Color.rgb(8, 8, 10)
            maskFilter = BlurMaskFilter(22f, BlurMaskFilter.Blur.NORMAL)
        }
    }

    val auraBlurFilter = remember {
        BlurMaskFilter(35f, BlurMaskFilter.Blur.NORMAL)
    }

    val auraPaint = remember {
        Paint().apply {
            isAntiAlias = true
            style = Paint.Style.STROKE
            maskFilter = auraBlurFilter
        }
    }

    // Cached Paths recalculated ONLY when Canvas dimensions change
    val leftEarPath = remember { Path() }
    val rightEarPath = remember { Path() }
    val bodyPath = remember { Path() }
    var cachedSize by remember { mutableStateOf(Size.Zero) }
    var cachedShader by remember { mutableStateOf<SweepGradient?>(null) }
    var lastSessionState by remember { mutableStateOf(sessionState) }

    Box(
        modifier = modifier.scale(animatedScale),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            // Recompute paths only upon dimension change (zero allocations per frame)
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

                val colors = when (sessionState) {
                    AudioSessionState.CONNECTING, AudioSessionState.RECONNECTING -> connectingColors
                    AudioSessionState.ERROR -> errorColors
                    else -> normalColors
                }
                cachedShader = SweepGradient(w * 0.48f, h * 0.48f, colors, null)
                auraPaint.shader = cachedShader
            } else if (sessionState != lastSessionState) {
                lastSessionState = sessionState
                val colors = when (sessionState) {
                    AudioSessionState.CONNECTING, AudioSessionState.RECONNECTING -> connectingColors
                    AudioSessionState.ERROR -> errorColors
                    else -> normalColors
                }
                cachedShader = SweepGradient(w * 0.48f, h * 0.48f, colors, null)
                auraPaint.shader = cachedShader
            }

            drawIntoCanvas { canvas ->
                val nativeCanvas = canvas.nativeCanvas

                // 1. Soft Ambient Purple Shadow Trail
                nativeCanvas.drawOval(
                    w * 0.28f,
                    h * 0.35f,
                    w * 0.88f,
                    h * 0.86f,
                    shadowPaint
                )

                // 2. Chromatic Aberration Aura Ring with audio modulation
                val auraStrokeWidth = 30f + (audioAmplitude * 22f).coerceIn(0f, 25f)
                auraPaint.strokeWidth = auraStrokeWidth
                auraPaint.alpha = when (sessionState) {
                    AudioSessionState.IDLE -> 180
                    AudioSessionState.CONNECTING, AudioSessionState.RECONNECTING -> 220
                    AudioSessionState.ERROR -> 100
                    AudioSessionState.BUDDY_SPEAKING -> 255
                    AudioSessionState.USER_SPEAKING -> 230
                    else -> 200
                }

                nativeCanvas.save()
                nativeCanvas.rotate(rotationDegrees, w * 0.48f, h * 0.48f)
                nativeCanvas.drawOval(
                    w * 0.25f,
                    h * 0.28f,
                    w * 0.75f,
                    h * 0.72f,
                    auraPaint
                )
                nativeCanvas.restore()

                // 3. Cat Silhouette Ears (Cached Paths)
                nativeCanvas.drawPath(leftEarPath, earPaint)
                nativeCanvas.drawPath(rightEarPath, earPaint)

                // 4. Cat Silhouette Body & Head (Cached Path)
                nativeCanvas.drawPath(bodyPath, bodyPaint)
            }

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
