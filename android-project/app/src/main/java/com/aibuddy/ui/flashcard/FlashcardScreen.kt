package com.aibuddy.ui.flashcard

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.automirrored.outlined.ArrowForward
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.data.preferences.UserPreferences
import com.aibuddy.ui.flashcard.components.VocabularyCardView
import com.aibuddy.ui.flashcard.components.getFlashcardColor
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPink
import com.aibuddy.ui.theme.SoftPurple
import kotlinx.coroutines.launch
import kotlin.math.abs

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FlashcardScreen(
    viewModel: FlashcardViewModel,
    userPreferences: UserPreferences? = null,
    onBack: () -> Unit
) {
    val haptic = LocalHapticFeedback.current
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(uiState.snackbarMessage) {
        uiState.snackbarMessage?.let { msg ->
            snackbarHostState.showSnackbar(msg)
            viewModel.onDismissSnackbar()
        }
    }

    // Toss and Swipe Animation State
    val offsetX = remember { Animatable(0f) }
    val offsetY = remember { Animatable(0f) }
    var isSwipingOut by remember { mutableStateOf(false) }

    fun performSwipe(direction: Int, onComplete: () -> Unit) {
        if (isSwipingOut) return
        if (userPreferences?.hapticFeedbackEnabled != false) {
            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
        }
        isSwipingOut = true
        coroutineScope.launch {
            val targetX = if (direction < 0) -1400f else 1400f
            offsetX.animateTo(
                targetValue = targetX,
                animationSpec = tween(durationMillis = 260, easing = FastOutLinearInEasing)
            )
            onComplete()
            offsetX.snapTo(0f)
            offsetY.snapTo(0f)
            isSwipingOut = false
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
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
                            imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                            contentDescription = "Kembali ke Beranda",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    // Mode Switcher Pills (Explore vs Review)
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .padding(3.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = if (uiState.activeMode == "EXPLORE") NeonLime else Color.Transparent,
                            modifier = Modifier.clickable { viewModel.onSelectMode("EXPLORE") }
                        ) {
                            Text(
                                text = "Jelajahi",
                                color = if (uiState.activeMode == "EXPLORE") Color.Black else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = if (uiState.activeMode == "REVIEW") SoftPurple else Color.Transparent,
                            modifier = Modifier.clickable { viewModel.onSelectMode("REVIEW") }
                        ) {
                            Text(
                                text = "Ulas",
                                color = if (uiState.activeMode == "REVIEW") Color.Black else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                            )
                        }
                    }

                    // Bookmark filter quick shortcut
                    Surface(
                        shape = CircleShape,
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .clickable {
                                if (uiState.activeMode != "REVIEW") {
                                    viewModel.onSelectMode("REVIEW")
                                }
                                val newFilter = if (uiState.reviewFilter == "BOOKMARKED") "ALL_SEEN" else "BOOKMARKED"
                                viewModel.onSelectReviewFilter(newFilter)
                            }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = if (uiState.reviewFilter == "BOOKMARKED" && uiState.activeMode == "REVIEW") {
                                    Icons.Outlined.Bookmark
                                } else {
                                    Icons.Outlined.BookmarkBorder
                                },
                                contentDescription = "Filter kata bertanda",
                                tint = if (uiState.bookmarkedCount > 0) SoftPink else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 20.dp)
        ) {
            if (uiState.isLoading) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator(
                        color = SoftPink,
                        modifier = Modifier.size(44.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Menyiapkan 3.000 kartu kosakata...",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 14.sp
                    )
                }
            } else {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    // Header Status Context Bar
                    Column(modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (uiState.activeMode == "EXPLORE") {
                                    "Dilihat ${uiState.seenCount} / ${uiState.totalCount}"
                                } else {
                                    if (uiState.reviewFilter == "BOOKMARKED") {
                                        "Kata Bertanda (${uiState.reviewCards.size})"
                                    } else {
                                        "Ulasan (${uiState.reviewCards.size} kata)"
                                    }
                                },
                                color = MaterialTheme.colorScheme.onSurface,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                            )

                            if (uiState.activeMode == "REVIEW") {
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text(
                                        text = "Semua",
                                        color = if (uiState.reviewFilter == "ALL_SEEN") SoftPurple else MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.clickable { viewModel.onSelectReviewFilter("ALL_SEEN") }
                                    )
                                    Text(
                                        text = "•",
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontSize = 12.sp
                                    )
                                    Text(
                                        text = "Bertanda (${uiState.bookmarkedCount})",
                                        color = if (uiState.reviewFilter == "BOOKMARKED") SoftPink else MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.clickable { viewModel.onSelectReviewFilter("BOOKMARKED") }
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Progress Bar
                        val progressRatio = if (uiState.totalCount > 0) {
                            uiState.seenCount.toFloat() / uiState.totalCount.toFloat()
                        } else 0f

                        LinearProgressIndicator(
                            progress = { progressRatio.coerceIn(0f, 1f) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = if (uiState.activeMode == "EXPLORE") NeonLime else SoftPurple,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Central Card Display with Stack Effect & Throw Animation
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        val activeCard = uiState.currentCard

                        if (uiState.activeMode == "EXPLORE" && uiState.isFirstPassCompleted && activeCard == null) {
                            // Completed state
                            FirstPassCompletedCard(
                                onSwitchToReview = { viewModel.onSelectMode("REVIEW") }
                            )
                        } else if (activeCard != null) {
                            val dragDistance = abs(offsetX.value)
                            val dragProgress = (dragDistance / 800f).coerceIn(0f, 1f)

                            // Stack Layer 3 (Deepest card in deck)
                            val layer3Color = getFlashcardColor(activeCard.entry.id + 2)
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = 400.dp, max = 500.dp)
                                    .graphicsLayer {
                                        translationY = -22.dp.toPx()
                                        scaleX = 0.88f + (dragProgress * 0.04f)
                                        scaleY = 0.88f + (dragProgress * 0.04f)
                                        rotationZ = -3.5f
                                    }
                                    .clip(RoundedCornerShape(28.dp))
                                    .background(layer3Color.copy(alpha = 0.45f))
                            )

                            // Stack Layer 2 (Next card in deck waiting underneath)
                            val layer2Color = getFlashcardColor(activeCard.entry.id + 1)
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .heightIn(min = 400.dp, max = 500.dp)
                                    .graphicsLayer {
                                        translationY = (-11.dp.toPx()) * (1f - dragProgress)
                                        scaleX = 0.94f + (dragProgress * 0.06f)
                                        scaleY = 0.94f + (dragProgress * 0.06f)
                                        rotationZ = 1.8f * (1f - dragProgress)
                                    }
                                    .clip(RoundedCornerShape(28.dp))
                                    .background(layer2Color.copy(alpha = 0.75f))
                                    .border(
                                        width = 1.dp,
                                        color = Color.White.copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(28.dp)
                                    )
                            )

                            // Active Top Card (Swipeable with Throw/Toss physics)
                            val rotationZ = (offsetX.value / 42f).coerceIn(-28f, 28f)
                            val cardAlpha = (1f - (dragDistance / 1600f)).coerceIn(0.2f, 1f)

                            VocabularyCardView(
                                item = activeCard,
                                isFlipped = uiState.isFlipped,
                                isSpeaking = uiState.isSpeaking,
                                onFlip = { viewModel.onFlipCard() },
                                onSpeak = { viewModel.onSpeakHeadword() },
                                onToggleBookmark = { viewModel.onToggleBookmark() },
                                reducedMotion = userPreferences?.reducedMotion ?: false,
                                hapticFeedbackEnabled = userPreferences?.hapticFeedbackEnabled ?: true,
                                modifier = Modifier
                                    .graphicsLayer {
                                        translationX = offsetX.value
                                        translationY = offsetY.value
                                        this.rotationZ = rotationZ
                                        alpha = cardAlpha
                                    }
                                    .pointerInput(activeCard.entry.id) {
                                        detectDragGestures(
                                            onDragStart = { },
                                            onDrag = { change, dragAmount ->
                                                if (!isSwipingOut) {
                                                    change.consume()
                                                    coroutineScope.launch {
                                                        offsetX.snapTo(offsetX.value + dragAmount.x)
                                                        offsetY.snapTo((offsetY.value + dragAmount.y * 0.25f).coerceIn(-120f, 120f))
                                                    }
                                                }
                                            },
                                            onDragEnd = {
                                                if (isSwipingOut) return@detectDragGestures
                                                val swipeThreshold = 220f
                                                if (offsetX.value < -swipeThreshold) {
                                                    // Swipe left -> NEXT (Thrown off-screen to left)
                                                    performSwipe(-1) { viewModel.onNextCard() }
                                                } else if (offsetX.value > swipeThreshold) {
                                                    // Swipe right -> PREVIOUS (Thrown off-screen to right)
                                                    performSwipe(1) { viewModel.onPreviousCard() }
                                                } else {
                                                    // Snap back with spring
                                                    coroutineScope.launch {
                                                        launch {
                                                            offsetX.animateTo(
                                                                targetValue = 0f,
                                                                animationSpec = spring(
                                                                    dampingRatio = Spring.DampingRatioMediumBouncy,
                                                                    stiffness = Spring.StiffnessMedium
                                                                )
                                                            )
                                                        }
                                                        launch {
                                                            offsetY.animateTo(
                                                                targetValue = 0f,
                                                                animationSpec = spring(stiffness = Spring.StiffnessMedium)
                                                            )
                                                        }
                                                    }
                                                }
                                            },
                                            onDragCancel = {
                                                coroutineScope.launch {
                                                    offsetX.animateTo(0f, spring(stiffness = Spring.StiffnessMedium))
                                                    offsetY.animateTo(0f, spring(stiffness = Spring.StiffnessMedium))
                                                }
                                            }
                                        )
                                    }
                            )
                        } else {
                            // Empty Review State
                            EmptyReviewState(
                                isBookmarkedFilter = uiState.reviewFilter == "BOOKMARKED",
                                onSwitchToExplore = { viewModel.onSelectMode("EXPLORE") }
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Bottom Navigation Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 24.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Previous Card Button
                        IconButton(
                            onClick = {
                                performSwipe(1) { viewModel.onPreviousCard() }
                            },
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                                contentDescription = "Kata sebelumnya (Geser kanan)",
                                tint = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        // Index or Navigation Guide
                        if (uiState.activeMode == "REVIEW" && uiState.reviewCards.isNotEmpty()) {
                            Text(
                                text = "${uiState.reviewIndex + 1} / ${uiState.reviewCards.size}",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium
                            )
                        } else {
                            Text(
                                text = "Geser untuk melempar kartu",
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }

                        // Next Card Button
                        IconButton(
                            onClick = {
                                performSwipe(-1) { viewModel.onNextCard() }
                            },
                            modifier = Modifier
                                .size(52.dp)
                                .clip(CircleShape)
                                .background(NeonLime)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Outlined.ArrowForward,
                                contentDescription = "Kata berikutnya (Geser kiri)",
                                tint = Color.Black
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FirstPassCompletedCard(
    onSwitchToReview: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = Icons.Outlined.CheckCircle,
                contentDescription = null,
                tint = NeonLime,
                modifier = Modifier.size(56.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Luar Biasa!",
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Kamu telah menyelesaikan putaran pertama untuk 3.000 kata! Kata-kata yang terlewat akan ditawarkan kembali di mode Ulas.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = onSwitchToReview,
                colors = ButtonDefaults.buttonColors(containerColor = SoftPurple),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Mulai Mode Ulas",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun EmptyReviewState(
    isBookmarkedFilter: Boolean,
    onSwitchToExplore: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        modifier = Modifier.fillMaxWidth().padding(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = if (isBookmarkedFilter) Icons.Outlined.BookmarkBorder else Icons.Outlined.Layers,
                contentDescription = null,
                tint = SoftPurple,
                modifier = Modifier.size(52.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = if (isBookmarkedFilter) "Belum Ada Kata Bertanda" else "Belum Ada Kata untuk Diulas",
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (isBookmarkedFilter) {
                    "Tandai kartu kosakata saat belajar dengan menekan ikon markah agar tersimpan di sini."
                } else {
                    "Buka dan balik kartu kosakata di mode Jelajahi terlebih dahulu untuk mengulangnya di sini."
                },
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(20.dp))

            Button(
                onClick = onSwitchToExplore,
                colors = ButtonDefaults.buttonColors(containerColor = NeonLime),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(
                    text = "Jelajahi Kosakata Baru",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
