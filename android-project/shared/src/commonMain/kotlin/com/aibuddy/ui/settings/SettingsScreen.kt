package com.aibuddy.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.data.preferences.AppLanguage
import com.aibuddy.data.preferences.ThemeMode
import com.aibuddy.data.preferences.UserPreferences
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPurple

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    userPreferences: UserPreferences,
    onThemeModeChange: (ThemeMode) -> Unit,
    onLanguageChange: (AppLanguage) -> Unit,
    onAiVoiceChange: (String) -> Unit,
    onReducedMotionChange: (Boolean) -> Unit = {},
    onHapticFeedbackChange: (Boolean) -> Unit = {},
    onGeminiApiKeyChange: (String) -> Unit = {},
    onNavigateToDiagnostic: () -> Unit = {},
    onBack: () -> Unit
) {
    val isIndonesian = userPreferences.language == AppLanguage.INDONESIAN
    var apiKeyInput by remember(userPreferences.geminiApiKey) { mutableStateOf(userPreferences.geminiApiKey) }
    var showApiKey by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onBack,
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = if (isIndonesian) "Kembali ke Beranda" else "Back to Home",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                Text(
                    text = if (isIndonesian) "Pengaturan & Preferensi" else "Settings & Preferences",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 20.dp),
            contentPadding = PaddingValues(top = 8.dp, bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // 1. Tampilan / Appearance
            item {
                SettingsSectionHeader(
                    title = if (isIndonesian) "Tampilan" else "Appearance",
                    icon = Icons.Outlined.DarkMode
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    ThemeOptionButton(
                        label = if (isIndonesian) "Gelap" else "Dark",
                        selected = userPreferences.themeMode == ThemeMode.DARK,
                        icon = Icons.Outlined.DarkMode,
                        modifier = Modifier.weight(1f),
                        onClick = { onThemeModeChange(ThemeMode.DARK) }
                    )
                    ThemeOptionButton(
                        label = if (isIndonesian) "Terang" else "Light",
                        selected = userPreferences.themeMode == ThemeMode.LIGHT,
                        icon = Icons.Outlined.LightMode,
                        modifier = Modifier.weight(1f),
                        onClick = { onThemeModeChange(ThemeMode.LIGHT) }
                    )
                    ThemeOptionButton(
                        label = if (isIndonesian) "Sistem" else "System",
                        selected = userPreferences.themeMode == ThemeMode.SYSTEM,
                        icon = Icons.Outlined.SettingsBrightness,
                        modifier = Modifier.weight(1f),
                        onClick = { onThemeModeChange(ThemeMode.SYSTEM) }
                    )
                }
            }

            // 2. Bahasa Pengantar / Language
            item {
                SettingsSectionHeader(
                    title = if (isIndonesian) "Bahasa Pengantar Aplikasi" else "App Language",
                    icon = Icons.Outlined.Language
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    AppLanguage.entries.forEach { lang ->
                        ThemeOptionButton(
                            label = lang.displayName,
                            selected = userPreferences.language == lang,
                            icon = Icons.Outlined.Translate,
                            modifier = Modifier.weight(1f),
                            onClick = { onLanguageChange(lang) }
                        )
                    }
                }
            }

            // 3. Suara AI / AI Voice
            item {
                SettingsSectionHeader(
                    title = if (isIndonesian) "Pilihan Suara Buddy" else "Buddy Voice Model",
                    icon = Icons.Outlined.RecordVoiceOver
                )

                Spacer(modifier = Modifier.height(10.dp))

                val voices = listOf("Puck", "Charon", "Fenrir", "Aoede", "Kore")

                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        voices.forEachIndexed { index, voice ->
                            val isSelected = userPreferences.aiVoice.equals(voice, ignoreCase = true)
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isSelected) NeonLime.copy(alpha = 0.15f) else Color.Transparent)
                                    .clickable(role = Role.RadioButton) { onAiVoiceChange(voice) }
                                    .padding(horizontal = 14.dp, vertical = 12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Outlined.GraphicEq,
                                        contentDescription = null,
                                        tint = if (isSelected) NeonLime else MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        text = voice,
                                        color = if (isSelected) NeonLime else MaterialTheme.colorScheme.onSurface,
                                        fontSize = 14.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                    )
                                }

                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Terpilih",
                                        tint = NeonLime,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }

                            if (index < voices.lastIndex) {
                                HorizontalDivider(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.1f),
                                    modifier = Modifier.padding(horizontal = 8.dp)
                                )
                            }
                        }
                    }
                }
            }

            // 4. Interaksi & Aksesibilitas / Interaction & Accessibility
            item {
                SettingsSectionHeader(
                    title = if (isIndonesian) "Interaksi & Aksesibilitas" else "Interaction & Accessibility",
                    icon = Icons.Outlined.TouchApp
                )

                Spacer(modifier = Modifier.height(10.dp))

                Card(
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        // Reduced Motion Toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
                                Text(
                                    text = if (isIndonesian) "Animasi Halus (Reduced Motion)" else "Reduced Motion",
                                    color = MaterialTheme.colorScheme.onSurface,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = if (isIndonesian)
                                        "Gunakan transisi pudar instan tanpa efek gerak atau rotasi 3D berlebih"
                                    else
                                        "Use instant fade transitions without motion or 3D rotation",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 12.sp,
                                    lineHeight = 16.sp
                                )
                            }
                            Switch(
                                checked = userPreferences.reducedMotion,
                                onCheckedChange = onReducedMotionChange,
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.Black,
                                    checkedTrackColor = NeonLime
                                )
                            )
                        }

                        HorizontalDivider(
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.1f),
                            modifier = Modifier.padding(vertical = 12.dp)
                        )

                        // Haptic Feedback Toggle
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f).padding(end = 12.dp)) {
                                Text(
                                    text = if (isIndonesian) "Umpan Balik Haptik" else "Haptic Feedback",
                                    color = MaterialTheme.colorScheme.onSurface,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = if (isIndonesian)
                                        "Getaran sentuhan ringan saat menekan tombol atau membalik kartu"
                                    else
                                        "Subtle tactile vibration when pressing buttons or flipping cards",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 12.sp,
                                    lineHeight = 16.sp
                                )
                            }
                            Switch(
                                checked = userPreferences.hapticFeedbackEnabled,
                                onCheckedChange = onHapticFeedbackChange,
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.Black,
                                    checkedTrackColor = NeonLime
                                )
                            )
                        }
                    }
                }
            }

            // 5. API Key & Koneksi AI (BYOK)
            item {
                SettingsSectionHeader(
                    title = if (isIndonesian) "Koneksi AI (Gemini Live)" else "AI Connection (Gemini Live)",
                    icon = Icons.Outlined.Key
                )

                Spacer(modifier = Modifier.height(10.dp))

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Gemini API Key",
                            style = MaterialTheme.typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.Bold
                        )

                        Text(
                            text = if (isIndonesian)
                                "Kunci ini digunakan untuk menghubungkan panggilan suara live dengan Gemini. Kunci disimpan aman hanya di perangkat lokal Anda."
                            else
                                "This key connects live voice calls with Gemini. Stored securely only on your local device.",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )

                        OutlinedTextField(
                            value = apiKeyInput,
                            onValueChange = {
                                apiKeyInput = it
                                onGeminiApiKeyChange(it)
                            },
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = {
                                Text(
                                    text = "AIzaSy...",
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                                )
                            },
                            visualTransformation = if (showApiKey) VisualTransformation.None else PasswordVisualTransformation(),
                            trailingIcon = {
                                IconButton(onClick = { showApiKey = !showApiKey }) {
                                    Icon(
                                        imageVector = if (showApiKey) Icons.Outlined.VisibilityOff else Icons.Outlined.Visibility,
                                        contentDescription = if (showApiKey) "Sembunyikan" else "Tampilkan",
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = NeonLime,
                                unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                                focusedTextColor = MaterialTheme.colorScheme.onSurface,
                                unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                            ),
                            shape = RoundedCornerShape(12.dp)
                        )
                    }
                }
            }

            // 6. Informasi Versi
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Fluelo v2.0.0 • Compose Multiplatform",
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}

@Composable
private fun SettingsSectionHeader(
    title: String,
    icon: ImageVector
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = NeonLime,
            modifier = Modifier.size(18.dp)
        )
        Text(
            text = title,
            color = MaterialTheme.colorScheme.onSurface,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun ThemeOptionButton(
    label: String,
    selected: Boolean,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (selected) NeonLime else Color.Transparent)
            .clickable(role = Role.RadioButton, onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = if (selected) Color.Black else MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = label,
            color = if (selected) Color.Black else MaterialTheme.colorScheme.onSurface,
            fontSize = 12.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium
        )
    }
}

