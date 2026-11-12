package com.aibuddy.ui.flashcard.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.VolumeUp
import androidx.compose.material.icons.outlined.Bookmark
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.TouchApp
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.ui.flashcard.model.FlashcardUiItem
import com.aibuddy.ui.theme.FlashcardColorPalette
import kotlin.math.abs

data class CardColorTheme(
    val background: Color,
    val textColor: Color,
    val textSecondaryColor: Color,
    val badgeBackground: Color,
    val badgeTextColor: Color,
    val iconButtonBackground: Color,
    val iconButtonTint: Color,
    val bookmarkActiveColor: Color,
    val exampleBoxBackground: Color,
    val exampleBoxBorder: Color
)

fun getCardThemeForColor(backgroundColor: Color): CardColorTheme {
    val luminance = 0.299f * backgroundColor.red + 0.587f * backgroundColor.green + 0.114f * backgroundColor.blue
    val isDarkBackground = luminance < 0.50f

    return if (isDarkBackground) {
        CardColorTheme(
            background = backgroundColor,
            textColor = Color.White,
            textSecondaryColor = Color.White.copy(alpha = 0.85f),
            badgeBackground = Color.White.copy(alpha = 0.22f),
            badgeTextColor = Color.White,
            iconButtonBackground = Color.White.copy(alpha = 0.20f),
            iconButtonTint = Color.White,
            bookmarkActiveColor = Color(0xFFFFD166),
            exampleBoxBackground = Color.Black.copy(alpha = 0.25f),
            exampleBoxBorder = Color.White.copy(alpha = 0.20f)
        )
    } else {
        CardColorTheme(
            background = backgroundColor,
            textColor = Color(0xFF0F0F14),
            textSecondaryColor = Color(0xFF262633),
            badgeBackground = Color.Black.copy(alpha = 0.12f),
            badgeTextColor = Color(0xFF0F0F14),
            iconButtonBackground = Color.Black.copy(alpha = 0.08f),
            iconButtonTint = Color(0xFF0F0F14),
            bookmarkActiveColor = Color(0xFFE63946),
            exampleBoxBackground = Color.Black.copy(alpha = 0.08f),
            exampleBoxBorder = Color.Black.copy(alpha = 0.12f)
        )
    }
}

fun getFlashcardColor(entryId: Int): Color {
    val index = abs(entryId) % FlashcardColorPalette.size
    return FlashcardColorPalette[index]
}

@Composable
fun VocabularyCardView(
    item: FlashcardUiItem,
    isFlipped: Boolean,
    isSpeaking: Boolean,
    onFlip: () -> Unit,
    onSpeak: () -> Unit,
    onToggleBookmark: () -> Unit,
    cardColor: Color = getFlashcardColor(item.id),
    reducedMotion: Boolean = false,
    hapticFeedbackEnabled: Boolean = true,
    modifier: Modifier = Modifier
) {
    val haptic = LocalHapticFeedback.current

    val rotation by animateFloatAsState(
        targetValue = if (isFlipped) 180f else 0f,
        animationSpec = if (reducedMotion) tween(durationMillis = 100) else tween(durationMillis = 380, easing = FastOutSlowInEasing),
        label = "CardFlipAnimation"
    )

    val theme = remember(cardColor) { getCardThemeForColor(cardColor) }
    val interactionSource = remember { MutableInteractionSource() }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 400.dp, max = 500.dp)
            .graphicsLayer {
                rotationY = rotation
                cameraDistance = 14f * density
            }
            .clip(RoundedCornerShape(28.dp))
            .background(theme.background)
            .border(
                width = 1.dp,
                color = theme.textColor.copy(alpha = 0.15f),
                shape = RoundedCornerShape(28.dp)
            )
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                role = Role.Button,
                onClick = {
                    if (hapticFeedbackEnabled) {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    }
                    onFlip()
                }
            )
            .padding(24.dp)
            .semantics {
                contentDescription = if (isFlipped) {
                    "Bagian belakang kartu. Arti: ${item.meaningsId}. Ketuk untuk membalik ke depan."
                } else {
                    "Bagian depan kartu. Kata: ${item.headword}. Ketuk untuk membalik dan melihat arti."
                }
            }
    ) {
        if (rotation <= 90f) {
            CardFrontContent(
                item = item,
                theme = theme,
                isSpeaking = isSpeaking,
                hapticFeedbackEnabled = hapticFeedbackEnabled,
                onSpeak = onSpeak,
                onToggleBookmark = onToggleBookmark
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer { rotationY = 180f }
            ) {
                CardBackContent(
                    item = item,
                    theme = theme,
                    isSpeaking = isSpeaking,
                    hapticFeedbackEnabled = hapticFeedbackEnabled,
                    onSpeak = onSpeak,
                    onToggleBookmark = onToggleBookmark
                )
            }
        }
    }
}

@Composable
private fun CardFrontContent(
    item: FlashcardUiItem,
    theme: CardColorTheme,
    isSpeaking: Boolean,
    hapticFeedbackEnabled: Boolean = true,
    onSpeak: () -> Unit,
    onToggleBookmark: () -> Unit
) {
    val haptic = LocalHapticFeedback.current
    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.SpaceBetween,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = theme.badgeBackground
            ) {
                Text(
                    text = item.partOfSpeech.lowercase(),
                    color = theme.badgeTextColor,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                )
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    shape = CircleShape,
                    color = if (isSpeaking) theme.badgeTextColor else theme.iconButtonBackground,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .clickable(role = Role.Button) {
                            if (hapticFeedbackEnabled) {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            }
                            onSpeak()
                        }
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Outlined.VolumeUp,
                            contentDescription = "Dengarkan pengucapan kata ${item.headword}",
                            tint = if (isSpeaking) theme.background else theme.iconButtonTint,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }

                Surface(
                    shape = CircleShape,
                    color = theme.iconButtonBackground,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .clickable(role = Role.Button) {
                            if (hapticFeedbackEnabled) {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            }
                            onToggleBookmark()
                        }
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = if (item.isBookmarked) Icons.Outlined.Bookmark else Icons.Outlined.BookmarkBorder,
                            contentDescription = if (item.isBookmarked) "Hapus markah" else "Tandai kata",
                            tint = if (item.isBookmarked) theme.bookmarkActiveColor else theme.iconButtonTint,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }
            }
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(vertical = 24.dp)
        ) {
            Text(
                text = item.headword,
                color = theme.textColor,
                fontSize = 38.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                lineHeight = 46.sp
            )

            if (item.ipa.isNotBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = item.ipa,
                    color = theme.textSecondaryColor,
                    fontSize = 17.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.TouchApp,
                contentDescription = null,
                tint = theme.textSecondaryColor.copy(alpha = 0.7f),
                modifier = Modifier.size(16.dp)
            )
            Text(
                text = "Ketuk untuk melihat arti",
                color = theme.textSecondaryColor.copy(alpha = 0.8f),
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
private fun CardBackContent(
    item: FlashcardUiItem,
    theme: CardColorTheme,
    isSpeaking: Boolean,
    hapticFeedbackEnabled: Boolean = true,
    onSpeak: () -> Unit,
    onToggleBookmark: () -> Unit
) {
    val haptic = LocalHapticFeedback.current
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = theme.badgeBackground
                    ) {
                        Text(
                            text = item.partOfSpeech.lowercase(),
                            color = theme.badgeTextColor,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }

                    Text(
                        text = item.headword,
                        color = theme.textSecondaryColor,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = CircleShape,
                        color = if (isSpeaking) theme.badgeTextColor else theme.iconButtonBackground,
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .clickable(role = Role.Button) {
                                if (hapticFeedbackEnabled) {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                }
                                onSpeak()
                            }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Outlined.VolumeUp,
                                contentDescription = "Dengarkan pengucapan kata ${item.headword}",
                                tint = if (isSpeaking) theme.background else theme.iconButtonTint,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    Surface(
                        shape = CircleShape,
                        color = theme.iconButtonBackground,
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .clickable(role = Role.Button) {
                                if (hapticFeedbackEnabled) {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                }
                                onToggleBookmark()
                            }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = if (item.isBookmarked) Icons.Outlined.Bookmark else Icons.Outlined.BookmarkBorder,
                                contentDescription = if (item.isBookmarked) "Hapus markah" else "Tandai kata",
                                tint = if (item.isBookmarked) theme.bookmarkActiveColor else theme.iconButtonTint,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = item.meaningsId,
                color = theme.textColor,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                lineHeight = 30.sp
            )

            if (item.ipa.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = item.ipa,
                    color = theme.textSecondaryColor,
                    fontSize = 15.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(18.dp))

            Surface(
                shape = RoundedCornerShape(16.dp),
                color = theme.exampleBoxBackground,
                modifier = Modifier
                    .fillMaxWidth()
                    .border(
                        width = 1.dp,
                        color = theme.exampleBoxBorder,
                        shape = RoundedCornerShape(16.dp)
                    )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "CONTOH KALIMAT",
                        color = theme.textSecondaryColor.copy(alpha = 0.9f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.8.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "“${item.exampleEn}”",
                        color = theme.textColor,
                        fontSize = 15.sp,
                        fontStyle = FontStyle.Italic,
                        lineHeight = 22.sp
                    )

                    if (item.exampleId.isNotBlank()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = item.exampleId,
                            color = theme.textSecondaryColor,
                            fontSize = 13.sp,
                            lineHeight = 18.sp
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Box(
            modifier = Modifier.fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Ketuk kartu untuk kembali ke depan",
                color = theme.textSecondaryColor.copy(alpha = 0.7f),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

