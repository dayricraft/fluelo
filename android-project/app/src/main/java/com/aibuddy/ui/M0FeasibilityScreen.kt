package com.aibuddy.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.live.AudioSessionState
import com.aibuddy.live.LiveSessionMetrics
import com.aibuddy.live.LiveTranscriptEntry
import com.aibuddy.ui.theme.*

@Composable
fun M0FeasibilityScreen(
    sessionState: AudioSessionState,
    metrics: LiveSessionMetrics,
    transcripts: List<LiveTranscriptEntry>,
    micAmplitude: Float,
    speakerAmplitude: Float,
    isMuted: Boolean,
    errorMessage: String?,
    hasMicPermission: Boolean,
    onRequestPermission: () -> Unit,
    onToggleCall: () -> Unit,
    onToggleMute: () -> Unit,
    onManualInterrupt: () -> Unit,
    onBack: (() -> Unit)? = null
) {
    val listState = rememberLazyListState()

    LaunchedEffect(transcripts.size) {
        if (transcripts.isNotEmpty()) {
            listState.animateScrollToItem(transcripts.size - 1)
        }
    }

    Scaffold(
        containerColor = BackgroundDark
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (onBack != null) {
                        IconButton(
                            onClick = onBack,
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(SurfaceDark)
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Back",
                                tint = TextPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }

                    Column {
                        Text(
                            text = "AI Buddy",
                            color = TextPrimary,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "M0 Voice Feasibility PoC",
                            color = TextSecondary,
                            fontSize = 12.sp
                        )
                    }
                }

                StatusBadge(sessionState)
            }

            // Error banner if any
            AnimatedVisibility(visible = errorMessage != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = ErrorRed.copy(alpha = 0.15f)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = errorMessage ?: "",
                        color = ErrorRed,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(12.dp)
                    )
                }
            }

            // Permission missing notice
            AnimatedVisibility(visible = !hasMicPermission) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = SurfaceDark),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, WarningAmber.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Microphone Permission Required",
                            color = WarningAmber,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Grant permission to enable live voice input and testing.",
                            color = TextSecondary,
                            fontSize = 13.sp
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Button(
                            onClick = onRequestPermission,
                            colors = ButtonDefaults.buttonColors(containerColor = WarningAmber, contentColor = BackgroundDark),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Grant Permission", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            // Metrics Card (Truthful benchmarks)
            MetricsCard(metrics)

            // Audio Level Visualizers (Input Mic & Output Speaker)
            AudioLevelsCard(
                micAmplitude = micAmplitude,
                speakerAmplitude = speakerAmplitude,
                isMuted = isMuted,
                sessionState = sessionState
            )

            // Transcripts Area
            Text(
                text = "Live Conversation Stream",
                color = TextSecondary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )

            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceDark)
                    .padding(8.dp)
            ) {
                if (transcripts.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (sessionState == AudioSessionState.LISTENING) {
                                "Start speaking in Indonesian or English..."
                            } else {
                                "Tap 'Connect Live' below to start the session"
                            },
                            color = TextSecondary.copy(alpha = 0.6f),
                            fontSize = 14.sp
                        )
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(transcripts, key = { it.id }) { entry ->
                            TranscriptBubble(entry)
                        }
                    }
                }
            }

            // Bottom Controls
            ControlsRow(
                sessionState = sessionState,
                isMuted = isMuted,
                hasMicPermission = hasMicPermission,
                onToggleCall = onToggleCall,
                onToggleMute = onToggleMute,
                onManualInterrupt = onManualInterrupt
            )
        }
    }
}

@Composable
private fun StatusBadge(state: AudioSessionState) {
    val (bgColor, textColor, label) = when (state) {
        AudioSessionState.IDLE -> Triple(SurfaceDark, TextSecondary, "Disconnected")
        AudioSessionState.CONNECTING -> Triple(WarningAmber.copy(alpha = 0.2f), WarningAmber, "Connecting...")
        AudioSessionState.CONNECTED -> Triple(SoftPurple.copy(alpha = 0.2f), SoftPurple, "Connected")
        AudioSessionState.LISTENING -> Triple(NeonLime.copy(alpha = 0.2f), NeonLime, "Listening")
        AudioSessionState.USER_SPEAKING -> Triple(NeonLime.copy(alpha = 0.35f), NeonLime, "User Speaking")
        AudioSessionState.PROCESSING -> Triple(SoftPurple.copy(alpha = 0.2f), SoftPurple, "Processing...")
        AudioSessionState.BUDDY_SPEAKING -> Triple(SoftPurple.copy(alpha = 0.35f), SoftPurple, "Buddy Speaking")
        AudioSessionState.INTERRUPTED -> Triple(WarningAmber.copy(alpha = 0.25f), WarningAmber, "Interrupted")
        AudioSessionState.RECONNECTING -> Triple(WarningAmber.copy(alpha = 0.2f), WarningAmber, "Reconnecting...")
        AudioSessionState.ERROR -> Triple(ErrorRed.copy(alpha = 0.2f), ErrorRed, "Error")
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(bgColor)
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .clip(CircleShape)
                    .background(textColor)
            )
            Text(
                text = label,
                color = textColor,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
private fun MetricsCard(metrics: LiveSessionMetrics) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            MetricItem("Connect Latency", if (metrics.connectionLatencyMs > 0) "${metrics.connectionLatencyMs} ms" else "-")
            MetricItem("TTFA (Voice)", if (metrics.timeToFirstAudioMs > 0) "${metrics.timeToFirstAudioMs} ms" else "-")
            MetricItem("Sent / Recv", "${metrics.chunksSent} / ${metrics.chunksReceived}")
        }
    }
}

@Composable
private fun MetricItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = label, color = TextSecondary, fontSize = 11.sp)
        Spacer(modifier = Modifier.height(2.dp))
        Text(text = value, color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun AudioLevelsCard(
    micAmplitude: Float,
    speakerAmplitude: Float,
    isMuted: Boolean,
    sessionState: AudioSessionState
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            // Mic Level
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                    contentDescription = "Mic",
                    tint = if (isMuted) ErrorRed else NeonLime,
                    modifier = Modifier.size(16.dp)
                )
                Text(text = "Mic", color = TextSecondary, fontSize = 12.sp, modifier = Modifier.width(42.dp))
                LinearProgressIndicator(
                    progress = { if (isMuted) 0f else micAmplitude },
                    modifier = Modifier
                        .weight(1f)
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = NeonLime,
                    trackColor = BackgroundDark,
                )
            }

            // Speaker Level
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                    contentDescription = "Speaker",
                    tint = SoftPurple,
                    modifier = Modifier.size(16.dp)
                )
                Text(text = "Speaker", color = TextSecondary, fontSize = 12.sp, modifier = Modifier.width(42.dp))
                LinearProgressIndicator(
                    progress = { speakerAmplitude },
                    modifier = Modifier
                        .weight(1f)
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = SoftPurple,
                    trackColor = BackgroundDark,
                )
            }
        }
    }
}

@Composable
private fun TranscriptBubble(entry: LiveTranscriptEntry) {
    val isUser = entry.sender == "You"
    val align = if (isUser) Alignment.End else Alignment.Start
    val bgColor = if (isUser) NeonLime.copy(alpha = 0.15f) else SurfaceCard
    val textColor = if (isUser) NeonLime else TextPrimary

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = align
    ) {
        Text(
            text = entry.sender,
            color = TextSecondary,
            fontSize = 11.sp,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
        )
        Box(
            modifier = Modifier
                .widthIn(max = 280.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(bgColor)
                .padding(horizontal = 12.dp, vertical = 8.dp)
        ) {
            Text(
                text = entry.text,
                color = textColor,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )
        }
    }
}

@Composable
private fun ControlsRow(
    sessionState: AudioSessionState,
    isMuted: Boolean,
    hasMicPermission: Boolean,
    onToggleCall: () -> Unit,
    onToggleMute: () -> Unit,
    onManualInterrupt: () -> Unit
) {
    val isConnected = sessionState != AudioSessionState.IDLE && sessionState != AudioSessionState.ERROR

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Mute button
        IconButton(
            onClick = onToggleMute,
            enabled = isConnected,
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(if (isMuted) ErrorRed.copy(alpha = 0.2f) else SurfaceDark)
        ) {
            Icon(
                imageVector = if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                contentDescription = if (isMuted) "Unmute" else "Mute",
                tint = if (isMuted) ErrorRed else TextPrimary
            )
        }

        // Manual Interrupt button (for testing barge-in)
        Button(
            onClick = onManualInterrupt,
            enabled = isConnected && sessionState == AudioSessionState.BUDDY_SPEAKING,
            colors = ButtonDefaults.buttonColors(
                containerColor = WarningAmber.copy(alpha = 0.25f),
                contentColor = WarningAmber
            ),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.height(48.dp)
        ) {
            Icon(Icons.Default.Stop, contentDescription = "Interrupt", modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(4.dp))
            Text("Interrupt", fontSize = 13.sp)
        }

        // Main Connect / Disconnect button
        val callButtonColor by animateColorAsState(
            targetValue = if (isConnected) ErrorRed else NeonLime,
            label = "callBtnColor"
        )

        Button(
            onClick = onToggleCall,
            enabled = hasMicPermission,
            colors = ButtonDefaults.buttonColors(
                containerColor = callButtonColor,
                contentColor = if (isConnected) TextPrimary else BackgroundDark
            ),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier
                .weight(1f)
                .height(48.dp)
        ) {
            Icon(
                imageVector = if (isConnected) Icons.Default.CallEnd else Icons.Default.Call,
                contentDescription = if (isConnected) "Disconnect" else "Connect"
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (isConnected) "End Call" else "Connect Live",
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
        }
    }
}
