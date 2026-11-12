package com.aibuddy.util

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

actual fun currentTimeEpochMillis(): Long = System.currentTimeMillis()

actual fun formatTimestamp(epochMs: Long): String {
    val sdf = SimpleDateFormat("dd MMM, HH:mm", Locale.getDefault())
    return sdf.format(Date(epochMs))
}
