package com.example.aibuddy

import android.graphics.BlurMaskFilter
import androidx.annotation.DrawableRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// ==========================================
// 1. STATE, TEMA & LOKALISASI BAHASA
// ==========================================

enum class AppLanguage(val label: String, val code: String) {
    INDONESIAN("Bahasa Indonesia", "ID"),
    ENGLISH("English", "EN")
}

enum class ActiveScreen {
    HOME, TALK_BOT
}

data class AppStrings(
    val greeting: String,
    val heroTitle: String,
    val talkWithBot: String,
    val chatWithBot: String,
    val searchByImage: String,
    val historyTitle: String,
    val seeAll: String,
    val historyItemSample: String,
    val onlineStatus: String,
    val voicePromptPart1: String,
    val voicePromptPart2: String,
    val settingsTitle: String,
    val themeSettingTitle: String,
    val darkModeLabel: String,
    val lightModeLabel: String,
    val languageSettingTitle: String
)

fun getLocalizedStrings(language: AppLanguage): AppStrings {
    return when (language) {
        AppLanguage.ENGLISH -> AppStrings(
            greeting = "Hi, Michael 👋",
            heroTitle = "How may I help\nyou today?",
            talkWithBot = "Talk\nwith Bot",
            chatWithBot = "Chat with Bot",
            searchByImage = "Search by Image",
            historyTitle = "History",
            seeAll = "See all",
            historyItemSample = "I need some UI inspiration for dark",
            onlineStatus = "Online",
            voicePromptPart1 = "What are the top trending\ncollabrating interface ",
            voicePromptPart2 = "design\ntools 2023",
            settingsTitle = "Preferences & Settings",
            themeSettingTitle = "Appearance Mode",
            darkModeLabel = "Dark",
            lightModeLabel = "Light",
            languageSettingTitle = "Language"
        )
        AppLanguage.INDONESIAN -> AppStrings(
            greeting = "Halo, Michael 👋",
            heroTitle = "Ada yang bisa saya\nbantu hari ini?",
            talkWithBot = "Bicara\nke Bot",
            chatWithBot = "Chat dengan Bot",
            searchByImage = "Cari lewat Gambar",
            historyTitle = "Riwayat",
            seeAll = "Lihat semua",
            historyItemSample = "Saya butuh inspirasi UI untuk tema gelap",
            onlineStatus = "Online",
            voicePromptPart1 = "Apa saja alat desain antarmuka\nkolaboratif yang sedang ",
            voicePromptPart2 = "tren\ntahun ini",
            settingsTitle = "Preferensi & Pengaturan",
            themeSettingTitle = "Mode Tampilan",
            darkModeLabel = "Gelap",
            lightModeLabel = "Terang",
            languageSettingTitle = "Bahasa"
        )
    }
}

// Palet Warna Asli Desain
val NeonLime = Color(0xFFC8F53B)
val SoftPurple = Color(0xFFC9B6FF)
val SoftPink = Color(0xFFFFC8E2)

data class BuddyThemeColors(
    val background: Color,
    val surfaceCard: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val iconButtonBg: Color,
    val iconButtonTint: Color,
    val isDark: Boolean
)

fun getBuddyThemeColors(isDark: Boolean): BuddyThemeColors {
    return if (isDark) {
        BuddyThemeColors(
            background = Color(0xFF09090B),
            surfaceCard = Color(0xFF17171B),
            textPrimary = Color(0xFFF4F4F6),
            textSecondary = Color(0xFF8E8E93),
            iconButtonBg = Color(0xFFF4F4F6),
            iconButtonTint = Color(0xFF09090B),
            isDark = true
        )
    } else {
        BuddyThemeColors(
            background = Color(0xFFF6F7F9),
            surfaceCard = Color(0xFFFFFFFF),
            textPrimary = Color(0xFF111113),
            textSecondary = Color(0xFF686870),
            iconButtonBg = Color(0xFF111113),
            iconButtonTint = Color(0xFFFFFFFF),
            isDark = false
        )
    }
}

// ==========================================
// 2. ENTRY POINT UTAMA APLIKASI
// ==========================================

@Composable
fun AiBuddyApp() {
    var isDarkMode by remember { mutableStateOf(true) }
    var currentLanguage by remember { mutableStateOf(AppLanguage.ENGLISH) }
    var activeScreen by remember { mutableStateOf(ActiveScreen.HOME) }
    var showSettingsMenu by remember { mutableStateOf(false) }

    val themeColors = getBuddyThemeColors(isDarkMode)
    val strings = getLocalizedStrings(currentLanguage)

    val animatedBg by animateColorAsState(targetValue = themeColors.background, label = "bgColor")

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(animatedBg)
    ) {
        when (activeScreen) {
            ActiveScreen.HOME -> {
                HomeScreen(
                    colors = themeColors,
                    strings = strings,
                    showSettings = showSettingsMenu,
                    onToggleSettings = { showSettingsMenu = !showSettingsMenu },
                    onThemeChange = { isDarkMode = it },
                    onLanguageChange = { currentLanguage = it },
                    onOpenTalkBot = { activeScreen = ActiveScreen.TALK_BOT }
                )
            }
            ActiveScreen.TALK_BOT -> {
                TalkBotScreen(
                    colors = themeColors,
                    strings = strings,
                    onClose = { activeScreen = ActiveScreen.HOME }
                )
            }
        }
    }
}

// ==========================================
// 3. LAYAR HOME (KANAN) + MENU SETTING
// ==========================================

@Composable
fun HomeScreen(
    colors: BuddyThemeColors,
    strings: AppStrings,
    showSettings: Boolean,
    onToggleSettings: () -> Unit,
    onThemeChange: (Boolean) -> Unit,
    onLanguageChange: (AppLanguage) -> Unit,
    onOpenTalkBot: () -> Unit
) {
    val historyItems = listOf(
        Triple(NeonLime, Icons.Outlined.RecordVoiceOver, strings.historyItemSample),
        Triple(SoftPurple, Icons.Outlined.Forum, strings.historyItemSample),
        Triple(SoftPink, Icons.Outlined.Image, strings.historyItemSample)
    )

    Box(modifier = Modifier.fillMaxSize()) {
        // Efek Cahaya & Garis Topografi Latar Belakang
        DecorativeBackgroundWaves(isDark = colors.isDark, showGreenGlow = true)

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(horizontal = 22.dp),
            contentPadding = PaddingValues(top = 16.dp, bottom = 32.dp)
        ) {
            // 1. Top Bar (Menu Button, Greeting, Profile + Quick Settings Icon)
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // Tombol Menu Kiri Atas (Membuka/Menutup UI Section Setting)
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(colors.iconButtonBg)
                                .clickable { onToggleSettings() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (showSettings) Icons.Default.Close else Icons.Default.Menu,
                                contentDescription = "Settings Menu",
                                tint = colors.iconButtonTint,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Text(
                            text = strings.greeting,
                            color = colors.textPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    // Avatar Pengguna di Kanan Atas
                    Box(
                        modifier = Modifier
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF2C2C30))
                            .border(1.dp, Color.White.copy(alpha = 0.2f), CircleShape)
                            .clickable { onToggleSettings() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profile",
                            tint = Color.LightGray,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }

            // 2. UI SECTION MENU SETTING (Terang/Gelap & Bahasa)
            item {
                AnimatedVisibility(
                    visible = showSettings,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    SettingsSectionCard(
                        colors = colors,
                        strings = strings,
                        onThemeChange = onThemeChange,
                        onLanguageChange = onLanguageChange,
                        modifier = Modifier.padding(top = 18.dp)
                    )
                }
            }

            // 3. Headline ("How may I help you today?")
            item {
                Spacer(modifier = Modifier.height(28.dp))
                Text(
                    text = strings.heroTitle,
                    color = colors.textPrimary,
                    fontSize = 32.sp,
                    lineHeight = 38.sp,
                    fontWeight = FontWeight.Normal
                )
                Spacer(modifier = Modifier.height(26.dp))
            }

            // 4. Bento Grid Cards (Talk with Bot, Chat with Bot, Search by Image)
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(210.dp),
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Kartu Kiri (Tinggi): Talk with Bot
                    BentoCard(
                        title = strings.talkWithBot,
                        backgroundColor = NeonLime,
                        icon = Icons.Outlined.RecordVoiceOver,
                        isTall = true,
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight(),
                        onClick = onOpenTalkBot
                    )

                    // Kolom Kanan: 2 Kartu Bertumpuk
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight(),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        BentoCard(
                            title = strings.chatWithBot,
                            backgroundColor = SoftPurple,
                            icon = Icons.Outlined.Forum,
                            isTall = false,
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            onClick = {}
                        )

                        BentoCard(
                            title = strings.searchByImage,
                            backgroundColor = SoftPink,
                            icon = Icons.Outlined.Image,
                            isTall = false,
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            onClick = {}
                        )
                    }
                }
                Spacer(modifier = Modifier.height(28.dp))
            }

            // 5. Header History
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = strings.historyTitle,
                        color = colors.textPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = strings.seeAll,
                        color = colors.textSecondary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
                Spacer(modifier = Modifier.height(14.dp))
            }

            // 6. Daftar Item History
            items(historyItems) { (badgeColor, icon, title) ->
                HistoryItemRow(
                    badgeColor = badgeColor,
                    icon = icon,
                    title = title,
                    colors = colors
                )
                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }
}

// ==========================================
// 4. UI SECTION MENU SETTING (TERANG/GELAP & BAHASA)
// ==========================================

@Composable
fun SettingsSectionCard(
    colors: BuddyThemeColors,
    strings: AppStrings,
    onThemeChange: (Boolean) -> Unit,
    onLanguageChange: (AppLanguage) -> Unit,
    modifier: Modifier = Modifier
) {
    val currentLang = if (strings.darkModeLabel == "Gelap") AppLanguage.INDONESIAN else AppLanguage.ENGLISH

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(colors.surfaceCard)
            .border(
                width = 1.dp,
                color = if (colors.isDark) Color.White.copy(alpha = 0.08f) else Color.Black.copy(alpha = 0.08f),
                shape = RoundedCornerShape(24.dp)
            )
            .padding(18.dp)
    ) {
        // Header Setting
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(NeonLime),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Outlined.Tune,
                    contentDescription = null,
                    tint = Color.Black,
                    modifier = Modifier.size(16.dp)
                )
            }
            Text(
                text = strings.settingsTitle,
                color = colors.textPrimary,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Baris 1: Pengaturan Tema (Terang / Gelap)
        Text(
            text = strings.themeSettingTitle,
            color = colors.textSecondary,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(if (colors.isDark) Color(0xFF0E0E11) else Color(0xFFEFF1F5))
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            // Tombol Mode Gelap
            SegmentedOptionButton(
                label = strings.darkModeLabel,
                icon = Icons.Outlined.DarkMode,
                selected = colors.isDark,
                activeColor = NeonLime,
                textColor = colors.textPrimary,
                modifier = Modifier.weight(1f),
                onClick = { onThemeChange(true) }
            )
            // Tombol Mode Terang
            SegmentedOptionButton(
                label = strings.lightModeLabel,
                icon = Icons.Outlined.LightMode,
                selected = !colors.isDark,
                activeColor = NeonLime,
                textColor = colors.textPrimary,
                modifier = Modifier.weight(1f),
                onClick = { onThemeChange(false) }
            )
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Baris 2: Pengaturan Bahasa (Indonesia / English)
        Text(
            text = strings.languageSettingTitle,
            color = colors.textSecondary,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(if (colors.isDark) Color(0xFF0E0E11) else Color(0xFFEFF1F5))
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            AppLanguage.entries.forEach { lang ->
                SegmentedOptionButton(
                    label = "${lang.code} • ${lang.label}",
                    icon = Icons.Outlined.Language,
                    selected = currentLang == lang,
                    activeColor = SoftPurple,
                    textColor = colors.textPrimary,
                    modifier = Modifier.weight(1f),
                    onClick = { onLanguageChange(lang) }
                )
            }
        }
    }
}

@Composable
private fun SegmentedOptionButton(
    label: String,
    icon: ImageVector,
    selected: Boolean,
    activeColor: Color,
    textColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(if (selected) activeColor else Color.Transparent)
            .clickable { onClick() }
            .padding(vertical = 10.dp, horizontal = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = if (selected) Color.Black else textColor.copy(alpha = 0.7f),
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = label,
            color = if (selected) Color.Black else textColor.copy(alpha = 0.8f),
            fontSize = 12.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

// ==========================================
// 5. LAYAR TALKBOT (KIRI) DENGAN KARAKTER KUCING
// ==========================================

@Composable
fun TalkBotScreen(
    colors: BuddyThemeColors,
    strings: AppStrings,
    @DrawableRes customCharacterRes: Int? = null, // Isi R.drawable.nama_file_kucing jika ingin memakai PNG langsung
    onClose: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        // Garis Gelombang di Kanan Atas
        DecorativeBackgroundWaves(isDark = colors.isDark, showGreenGlow = false)

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. Header "AI Buddy" & Status Online
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(NeonLime)
                        .padding(horizontal = 18.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "AI Buddy",
                        color = Color.Black,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(NeonLime)
                    )
                    Text(
                        text = strings.onlineStatus,
                        color = colors.textSecondary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // 2. Karakter Kucing Bayangan Chromatic + Teks Transkripsi Suara
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                ChromaticCatCharacter(
                    modifier = Modifier.size(250.dp),
                    customDrawableRes = customCharacterRes
                )

                Spacer(modifier = Modifier.height(28.dp))

                Text(
                    text = buildAnnotatedString {
                        withStyle(SpanStyle(color = colors.textPrimary)) {
                            append(strings.voicePromptPart1)
                        }
                        withStyle(SpanStyle(color = colors.textSecondary.copy(alpha = 0.55f))) {
                            append(strings.voicePromptPart2)
                        }
                    },
                    fontSize = 20.sp,
                    lineHeight = 28.sp,
                    fontWeight = FontWeight.Medium,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 12.dp)
                )
            }

            // 3. Kontrol Bawah (Keyboard, Tombol Mic Berdenyut, Tombol X)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Tombol Keyboard Kiri
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(SoftPurple.copy(alpha = if (colors.isDark) 0.25f else 0.45f))
                        .clickable { },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Keyboard,
                        contentDescription = "Keyboard",
                        tint = if (colors.isDark) SoftPurple else Color.Black,
                        modifier = Modifier.size(20.dp)
                    )
                }

                // Tombol Mikrofon Utama dengan Efek Ripple Melingkar
                PulsingMicButton(onClick = {})

                // Tombol Tutup (X) Kanan -> Kembali ke Layar Home
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(colors.surfaceCard)
                        .clickable { onClose() },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = colors.textSecondary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

// ==========================================
// 6. KOMPONEN KARAKTER KUCING CHROMATIC
// ==========================================

@Composable
fun ChromaticCatCharacter(
    modifier: Modifier = Modifier,
    @DrawableRes customDrawableRes: Int? = null
) {
    // Animasi mengambang halus (floating/breathing effect)
    val infiniteTransition = rememberInfiniteTransition(label = "catFloat")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.96f,
        targetValue = 1.04f,
        animationSpec = infiniteRepeatable(
            animation = tween(2400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scaleAnim"
    )

    Box(
        modifier = modifier.scale(scale),
        contentAlignment = Alignment.Center
    ) {
        if (customDrawableRes != null) {
            // Jika menggunakan file gambar PNG yang dimasukkan ke res/drawable
            Image(
                painter = painterResource(id = customDrawableRes),
                contentDescription = "TalkBot Cat Character",
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
            )
        } else {
            // Replikasi Canvas Prosedural Karakter Kucing Bayangan Chromatic Aberration
            Canvas(modifier = Modifier.fillMaxSize()) {
                val w = size.width
                val h = size.height

                drawIntoCanvas { canvas ->
                    val nativeCanvas = canvas.nativeCanvas

                    // 1. Bayangan Bawah Keunguan Halus (Bottom-Right Shadow Trail)
                    val shadowPaint = android.graphics.Paint().apply {
                        isAntiAlias = true
                        color = android.graphics.Color.argb(170, 48, 35, 75)
                        maskFilter = BlurMaskFilter(55f, BlurMaskFilter.Blur.NORMAL)
                    }
                    nativeCanvas.drawOval(
                        w * 0.28f,
                        h * 0.35f,
                        w * 0.88f,
                        h * 0.86f,
                        shadowPaint
                    )

                    // 2. Efek Pelangi Chromatic Aberration (Cyan, Biru, Magenta, Kuning)
                    val rainbowColors = intArrayOf(
                        android.graphics.Color.rgb(0, 235, 255),   // Cyan
                        android.graphics.Color.rgb(50, 100, 255),  // Blue
                        android.graphics.Color.rgb(220, 60, 255),  // Magenta
                        android.graphics.Color.rgb(255, 210, 60),  // Yellow-Green
                        android.graphics.Color.rgb(0, 235, 255)
                    )
                    val auraPaint = android.graphics.Paint().apply {
                        isAntiAlias = true
                        style = android.graphics.Paint.Style.STROKE
                        strokeWidth = 34f
                        shader = android.graphics.SweepGradient(
                            w * 0.48f,
                            h * 0.48f,
                            rainbowColors,
                            null
                        )
                        maskFilter = BlurMaskFilter(32f, BlurMaskFilter.Blur.NORMAL)
                    }
                    nativeCanvas.drawOval(
                        w * 0.25f,
                        h * 0.28f,
                        w * 0.75f,
                        h * 0.72f,
                        auraPaint
                    )

                    // 3. Telinga Kucing Hitam (Kiri & Kanan) dengan Sedikit Blur
                    val earPaint = android.graphics.Paint().apply {
                        isAntiAlias = true
                        color = android.graphics.Color.rgb(10, 10, 12)
                        maskFilter = BlurMaskFilter(8f, BlurMaskFilter.Blur.NORMAL)
                    }

                    val leftEarPath = android.graphics.Path().apply {
                        moveTo(w * 0.25f, h * 0.45f)
                        lineTo(w * 0.22f, h * 0.20f)
                        lineTo(w * 0.47f, h * 0.29f)
                        close()
                    }
                    val rightEarPath = android.graphics.Path().apply {
                        moveTo(w * 0.48f, h * 0.29f)
                        lineTo(w * 0.73f, h * 0.21f)
                        lineTo(w * 0.69f, h * 0.46f)
                        close()
                    }
                    nativeCanvas.drawPath(leftEarPath, earPaint)
                    nativeCanvas.drawPath(rightEarPath, earPaint)

                    // 4. Tubuh / Kepala Kucing Siluet Hitam Pekat
                    val bodyPaint = android.graphics.Paint().apply {
                        isAntiAlias = true
                        color = android.graphics.Color.rgb(8, 8, 10)
                        maskFilter = BlurMaskFilter(22f, BlurMaskFilter.Blur.NORMAL)
                    }

                    val bodyPath = android.graphics.Path().apply {
                        moveTo(w * 0.27f, h * 0.44f)
                        cubicTo(w * 0.27f, h * 0.26f, w * 0.68f, h * 0.26f, w * 0.71f, h * 0.46f)
                        cubicTo(w * 0.76f, h * 0.62f, w * 0.84f, h * 0.72f, w * 0.72f, h * 0.78f)
                        cubicTo(w * 0.52f, h * 0.84f, w * 0.35f, h * 0.76f, w * 0.31f, h * 0.60f)
                        close()
                    }
                    nativeCanvas.drawPath(bodyPath, bodyPaint)
                }

                // 5. Dua Mata Putih Bulat Menyala
                val eyeRadius = w * 0.042f
                drawCircle(
                    color = Color.White,
                    radius = eyeRadius,
                    center = Offset(w * 0.38f, h * 0.49f)
                )
                drawCircle(
                    color = Color.White,
                    radius = eyeRadius,
                    center = Offset(w * 0.59f, h * 0.49f)
                )
            }
        }
    }
}

// ==========================================
// 7. KOMPONEN PENDUKUNG (CARDS, MIC, WAVES)
// ==========================================

@Composable
fun BentoCard(
    title: String,
    backgroundColor: Color,
    icon: ImageVector,
    isTall: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(24.dp))
            .background(backgroundColor)
            .clickable { onClick() }
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(alpha = 0.08f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = Color.Black,
                    modifier = Modifier.size(18.dp)
                )
            }

            Icon(
                imageVector = Icons.Default.NorthEast,
                contentDescription = "Open",
                tint = Color.Black,
                modifier = Modifier.size(18.dp)
            )
        }

        Text(
            text = title,
            color = Color.Black,
            fontSize = if (isTall) 22.sp else 14.sp,
            lineHeight = if (isTall) 26.sp else 18.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}

@Composable
fun HistoryItemRow(
    badgeColor: Color,
    icon: ImageVector,
    title: String,
    colors: BuddyThemeColors
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(colors.surfaceCard)
            .clickable { }
            .padding(horizontal = 14.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(badgeColor),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = Color.Black,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Text(
                text = title,
                color = colors.textSecondary,
                fontSize = 13.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        Icon(
            imageVector = Icons.Default.MoreVert,
            contentDescription = "More Options",
            tint = colors.textSecondary,
            modifier = Modifier.size(18.dp)
        )
    }
}

@Composable
fun PulsingMicButton(onClick: () -> Unit) {
    val infiniteTransition = rememberInfiniteTransition(label = "micPulse")
    val rippleScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.25f,
        animationSpec = infiniteRepeatable(
            animation = tween(1600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "rippleScale"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier.size(110.dp)
    ) {
        // Lingkaran Ripple Luar 1
        Box(
            modifier = Modifier
                .size(106.dp)
                .scale(rippleScale)
                .border(1.dp, NeonLime.copy(alpha = 0.16f), CircleShape)
        )
        // Lingkaran Ripple Luar 2
        Box(
            modifier = Modifier
                .size(88.dp)
                .border(1.dp, NeonLime.copy(alpha = 0.3f), CircleShape)
        )
        // Tombol Inti Hijau Neon
        Box(
            modifier = Modifier
                .size(68.dp)
                .clip(CircleShape)
                .background(NeonLime)
                .clickable { onClick() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Outlined.Mic,
                contentDescription = "Voice Input",
                tint = Color.Black,
                modifier = Modifier.size(30.dp)
            )
        }
    }
}

@Composable
fun DecorativeBackgroundWaves(
    isDark: Boolean,
    showGreenGlow: Boolean
) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val w = size.width
        val h = size.height

        // Pendaran Cahaya Hijau Halus di Sisi Kiri Atas (Hanya di Home Screen)
        if (showGreenGlow) {
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        NeonLime.copy(alpha = if (isDark) 0.18f else 0.25f),
                        Color.Transparent
                    ),
                    center = Offset(w * 0.1f, h * 0.24f),
                    radius = w * 0.65f
                ),
                center = Offset(w * 0.1f, h * 0.24f),
                radius = w * 0.65f
            )
        }

        // Garis-garis Topografi Melengkung di Kanan Atas
        val lineColor = if (isDark) Color.White.copy(alpha = 0.07f) else Color.Black.copy(alpha = 0.06f)
        for (i in 0..6) {
            val offset = i * 22f
            val path = Path().apply {
                moveTo(w * 0.35f + offset, -20f)
                cubicTo(
                    w * 0.45f + offset, h * 0.18f,
                    w * 0.25f + offset, h * 0.30f,
                    w + 40f, h * 0.22f - offset * 0.5f
                )
            }
            drawPath(
                path = path,
                color = lineColor,
                style = Stroke(width = 2.dp.toPx())
            )
        }
    }
}

@Preview(showBackground = true, widthDp = 390, heightDp = 844)
@Composable
fun AiBuddyAppPreview() {
    AiBuddyApp()
}