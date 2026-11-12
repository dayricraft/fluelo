package com.aibuddy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Chat
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.outlined.EditNote
import androidx.compose.material.icons.outlined.TheaterComedy
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.data.mode.LearningMode
import com.aibuddy.data.mode.SessionModeState
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPurple

@Composable
fun ModeBadgeChip(
    sessionModeState: SessionModeState,
    isIndonesian: Boolean = true,
    onClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val mode = sessionModeState.activeMode
    val exercise = sessionModeState.activeExercise

    val (icon: ImageVector, label: String, badgeColor: Color) = when (mode) {
        LearningMode.FREE_CONVERSATION -> Triple(
            Icons.AutoMirrored.Outlined.Chat,
            if (isIndonesian) "Bebas" else "Free Talk",
            SoftPurple
        )
        LearningMode.VOCABULARY -> {
            val progressSuffix = if (exercise != null) " (${exercise.currentQuestionIndex}/${exercise.totalQuestions})" else ""
            Triple(
                Icons.AutoMirrored.Outlined.MenuBook,
                (if (isIndonesian) "Kosakata" else "Vocab") + progressSuffix,
                NeonLime
            )
        }
        LearningMode.GRAMMAR -> Triple(
            Icons.Outlined.EditNote,
            "Grammar",
            NeonLime
        )
        LearningMode.ROLEPLAY -> {
            val roleplayTitle = exercise?.roleplayScenario?.title ?: if (isIndonesian) "Roleplay" else "Roleplay"
            Triple(
                Icons.Outlined.TheaterComedy,
                roleplayTitle,
                SoftPurple
            )
        }
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(badgeColor.copy(alpha = 0.16f))
            .border(1.dp, badgeColor.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
            .then(
                if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier
            )
            .padding(horizontal = 10.dp, vertical = 5.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = badgeColor,
                modifier = Modifier.size(14.dp)
            )
            Text(
                text = label,
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

