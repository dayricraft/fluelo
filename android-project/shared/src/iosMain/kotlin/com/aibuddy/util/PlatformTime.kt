package com.aibuddy.util

import platform.Foundation.NSDate
import platform.Foundation.NSDateFormatter
import platform.Foundation.timeIntervalSince1970

actual fun currentTimeEpochMillis(): Long = (NSDate().timeIntervalSince1970 * 1000.0).toLong()

actual fun formatTimestamp(epochMs: Long): String {
    val date = NSDate(timeIntervalSince1970 = epochMs / 1000.0)
    val formatter = NSDateFormatter().apply {
        dateFormat = "dd MMM, HH:mm"
    }
    return formatter.stringFromDate(date)
}
