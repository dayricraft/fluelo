package com.aibuddy.util

import platform.Foundation.NSDate
import platform.Foundation.NSDateFormatter
import platform.Foundation.timeIntervalSince1970

actual fun currentTimeEpochMillis(): Long = (NSDate().timeIntervalSince1970 * 1000.0).toLong()

actual fun formatTimestamp(epochMs: Long): String {
    // Reference date for Cocoa is 2001-01-01 00:00:00 UTC (978,307,200 seconds after Unix epoch)
    val secondsSinceReferenceDate = (epochMs / 1000.0) - 978307200.0
    val date = NSDate(timeIntervalSinceReferenceDate = secondsSinceReferenceDate)
    val formatter = NSDateFormatter().apply {
        dateFormat = "dd MMM, HH:mm"
    }
    return formatter.stringFromDate(date)
}
