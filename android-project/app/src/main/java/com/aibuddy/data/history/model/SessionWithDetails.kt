package com.aibuddy.data.history.model

import androidx.room.Embedded
import androidx.room.Relation

/**
 * Model komposit Room untuk memuat detail sesi lengkap:
 * entitas sesi, daftar pesan urut, koreksi terstruktur, dan ringkasan pembelajaran.
 */
data class SessionWithDetails(
    @Embedded
    val session: ConversationSessionEntity,

    @Relation(
        parentColumn = "sessionId",
        entityColumn = "sessionId"
    )
    val messages: List<ConversationMessageEntity>,

    @Relation(
        parentColumn = "sessionId",
        entityColumn = "sessionId"
    )
    val corrections: List<StructuredCorrectionEntity>,

    @Relation(
        parentColumn = "sessionId",
        entityColumn = "sessionId"
    )
    val summary: SessionSummaryEntity?
)

