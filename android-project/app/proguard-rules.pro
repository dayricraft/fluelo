# AI Buddy / Fluelo ProGuard Rules

-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep KotlinX Serialization classes and fields
-keepclassmembers class * {
    @kotlinx.serialization.Serializable <fields>;
}
-keep class * implements kotlinx.serialization.KSerializer {
    <init>(...);
}
-keepclassmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}

# Keep AI Buddy Data Models
-keep class com.aibuddy.live.** { *; }
-keep class com.aibuddy.data.chat.** { *; }
-keep class com.aibuddy.data.tutor.** { *; }
-keep class com.aibuddy.data.mode.** { *; }
-keep class com.aibuddy.data.preferences.** { *; }
-keep class com.aibuddy.data.flashcard.model.** { *; }
-keep class com.aibuddy.data.history.model.** { *; }

# Keep Room Database DAOs and Entities
-keep class * extends androidx.room.RoomDatabase
-keep class com.aibuddy.data.db.** { *; }
-keep class com.aibuddy.data.history.dao.** { *; }
-keep class com.aibuddy.data.flashcard.dao.** { *; }
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao interface * { *; }

# OkHttp WebSocket and Network
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
