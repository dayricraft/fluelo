package com.aibuddy.util

import java.util.UUID

actual fun randomUuidString(): String = UUID.randomUUID().toString()

