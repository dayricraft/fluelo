package com.aibuddy.ui.flashcard.model

data class FlashcardUiItem(
    val id: Int,
    val headword: String,
    val normalizedKey: String = "",
    val partOfSpeech: String,
    val meaningsId: String,
    val ipa: String,
    val pronunciationLocale: String = "en-US",
    val exampleEn: String,
    val exampleId: String,
    val isBookmarked: Boolean = false,
    val reviewCount: Int = 0
)

