package com.aibuddy.ui.theme

import androidx.compose.ui.graphics.Color

// Dark Palette (Default)
val BackgroundDark = Color(0xFF09090B)
val SurfaceDark = Color(0xFF17171B)
val SurfaceCardDark = Color(0xFF222227)
val TextPrimaryDark = Color(0xFFF4F4F6)
val TextSecondaryDark = Color(0xFF8E8E93)

// Light Palette
val BackgroundLight = Color(0xFFF6F7F9)
val SurfaceLight = Color(0xFFFFFFFF)
val SurfaceCardLight = Color(0xFFF0F1F5)
val TextPrimaryLight = Color(0xFF111113)
val TextSecondaryLight = Color(0xFF686870)

// Brand Accents
val NeonLime = Color(0xFFC8F53B)
val SoftPurple = Color(0xFFC9B6FF)
val SoftPink = Color(0xFFFFC8E2)

// Flashcard Accent Palette
val ElectricBlue = Color(0xFF5B8CFF)
val SkyCyan = Color(0xFF67D8FF)
val FreshMint = Color(0xFF8CF0C7)
val AquaTeal = Color(0xFF51DFC7)
val Peach = Color(0xFFFFC3A5)
val SoftCoral = Color(0xFFFF938F)
val ButterYellow = Color(0xFFFFE58A)
val Tangerine = Color(0xFFFFAE70)
val VividViolet = Color(0xFF9D79FF)

// Flashcard Color Palette for dynamic card backgrounds
val FlashcardColorPalette = listOf(
    ElectricBlue,
    VividViolet,
    SkyCyan,
    AquaTeal,
    FreshMint,
    NeonLime,
    ButterYellow,
    Tangerine,
    Peach,
    SoftCoral,
    SoftPurple,
    SoftPink
)

// Functional Status Colors
val ErrorRed = Color(0xFFFF5252)
val WarningAmber = Color(0xFFFFB74D)
val SuccessGreen = Color(0xFF4CAF50)

// Backward compatibility aliases
val SurfaceCard = SurfaceCardDark
val TextPrimary = TextPrimaryDark
val TextSecondary = TextSecondaryDark

