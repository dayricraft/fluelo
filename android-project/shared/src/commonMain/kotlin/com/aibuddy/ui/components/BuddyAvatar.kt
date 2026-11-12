package com.aibuddy.ui.components

import androidx.compose.foundation.Image
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import aibuddy.shared.generated.resources.Res
import aibuddy.shared.generated.resources.ic_app_logo
import org.jetbrains.compose.resources.painterResource
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPurple

/**
 * Modern, branded Buddy Avatar component.
 * Features the official Buddy hand-face character with dark gradient,
 * subtle glow border, and soft drop shadow.
 */
@Composable
fun BuddyAvatar(
    size: Dp = 32.dp,
    useNeonAccent: Boolean = false,
    modifier: Modifier = Modifier
) {
    val logoSize = (size.value * 0.65f).dp

    Box(
        modifier = modifier
            .size(size)
            .shadow(
                elevation = 4.dp,
                shape = CircleShape,
                ambientColor = Color.Black.copy(alpha = 0.6f),
                spotColor = if (useNeonAccent) NeonLime.copy(alpha = 0.45f) else SoftPurple.copy(alpha = 0.35f)
            )
            .clip(CircleShape)
            .border(
                width = 1.dp,
                brush = Brush.linearGradient(
                    colors = if (useNeonAccent) {
                        listOf(
                            NeonLime.copy(alpha = 0.6f),
                            Color(0xFF2E2E36)
                        )
                    } else {
                        listOf(
                            SoftPurple.copy(alpha = 0.5f),
                            Color(0xFF2E2E36)
                        )
                    }
                ),
                shape = CircleShape
            )
            .background(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF22222A),
                        Color(0xFF131316)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(Res.drawable.ic_app_logo),
            contentDescription = "Buddy",
            modifier = Modifier.size(logoSize)
        )
    }
}

