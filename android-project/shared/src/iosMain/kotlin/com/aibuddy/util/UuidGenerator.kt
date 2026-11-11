package com.aibuddy.util

import platform.Foundation.NSUUID

actual fun randomUuidString(): String = NSUUID().UUIDString()

