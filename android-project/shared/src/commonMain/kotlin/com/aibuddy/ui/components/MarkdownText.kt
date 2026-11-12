package com.aibuddy.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aibuddy.ui.theme.NeonLime
import com.aibuddy.ui.theme.SoftPurple

/**
 * A lightweight, high-performance Markdown renderer for Compose Multiplatform.
 * Formats headings, bullet lists, numbered lists, bold text, italics, and inline code.
 */
@Composable
fun MarkdownText(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = MaterialTheme.colorScheme.onSurface,
    fontSize: TextUnit = 14.sp,
    lineHeight: TextUnit = 22.sp
) {
    val lines = text.lines()

    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        var inList = false

        for (line in lines) {
            val trimmed = line.trim()

            when {
                trimmed.isEmpty() -> {
                    Spacer(modifier = Modifier.height(4.dp))
                    inList = false
                }

                trimmed.startsWith("### ") -> {
                    val headingText = trimmed.removePrefix("### ").trim()
                    Text(
                        text = parseInlineMarkdown(headingText, color),
                        color = SoftPurple,
                        fontSize = (fontSize.value + 2).sp,
                        fontWeight = FontWeight.Bold,
                        lineHeight = (lineHeight.value + 2).sp,
                        modifier = Modifier.padding(top = 4.dp, bottom = 2.dp)
                    )
                    inList = false
                }

                trimmed.startsWith("## ") -> {
                    val headingText = trimmed.removePrefix("## ").trim()
                    Text(
                        text = parseInlineMarkdown(headingText, color),
                        color = SoftPurple,
                        fontSize = (fontSize.value + 3).sp,
                        fontWeight = FontWeight.ExtraBold,
                        lineHeight = (lineHeight.value + 3).sp,
                        modifier = Modifier.padding(top = 6.dp, bottom = 2.dp)
                    )
                    inList = false
                }

                trimmed.startsWith("# ") -> {
                    val headingText = trimmed.removePrefix("# ").trim()
                    Text(
                        text = parseInlineMarkdown(headingText, color),
                        color = NeonLime,
                        fontSize = (fontSize.value + 4).sp,
                        fontWeight = FontWeight.Black,
                        lineHeight = (lineHeight.value + 4).sp,
                        modifier = Modifier.padding(top = 8.dp, bottom = 2.dp)
                    )
                    inList = false
                }

                trimmed.startsWith("* ") || trimmed.startsWith("- ") -> {
                    val content = trimmed.substring(2).trim()
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 4.dp, top = 2.dp, bottom = 2.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .padding(top = 8.dp)
                                .size(5.dp)
                                .clip(CircleShape)
                                .background(SoftPurple)
                        )
                        Text(
                            text = parseInlineMarkdown(content, color),
                            color = color,
                            fontSize = fontSize,
                            lineHeight = lineHeight,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    inList = true
                }

                line.startsWith("    * ") || line.startsWith("  * ") || line.startsWith("\t* ") -> {
                    val content = trimmed.removePrefix("* ").trim()
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 18.dp, top = 2.dp, bottom = 2.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .padding(top = 8.dp)
                                .size(4.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.onSurfaceVariant)
                        )
                        Text(
                            text = parseInlineMarkdown(content, color),
                            color = color,
                            fontSize = fontSize,
                            lineHeight = lineHeight,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    inList = true
                }

                trimmed.matches(Regex("""^\d+\.\s+.*$""")) -> {
                    val match = Regex("""^(\d+\.)\s+(.*)$""").find(trimmed)
                    val number = match?.groupValues?.get(1) ?: "•"
                    val content = match?.groupValues?.get(2) ?: trimmed

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 4.dp, top = 2.dp, bottom = 2.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = number,
                            color = SoftPurple,
                            fontWeight = FontWeight.Bold,
                            fontSize = fontSize,
                            lineHeight = lineHeight
                        )
                        Text(
                            text = parseInlineMarkdown(content, color),
                            color = color,
                            fontSize = fontSize,
                            lineHeight = lineHeight,
                            modifier = Modifier.weight(1f)
                        )
                    }
                    inList = true
                }

                else -> {
                    Text(
                        text = parseInlineMarkdown(trimmed, color),
                        color = color,
                        fontSize = fontSize,
                        lineHeight = lineHeight,
                        modifier = Modifier.fillMaxWidth()
                    )
                    inList = false
                }
            }
        }
    }
}

fun parseInlineMarkdown(raw: String, defaultColor: Color = Color.Unspecified): AnnotatedString {
    return buildAnnotatedString {
        val pattern = Regex("""(\*\*.+?\*\*|(?<!\*)\*(?!\s)[^*\n]+?(?<!\s)\*(?!\*)|`[^`\n]+?`)""")
        var lastIndex = 0
        val matches = pattern.findAll(raw)

        for (match in matches) {
            val range = match.range
            if (range.first > lastIndex) {
                append(raw.substring(lastIndex, range.first))
            }
            val token = match.value
            when {
                token.startsWith("**") && token.endsWith("**") && token.length >= 4 -> {
                    val inner = token.substring(2, token.length - 2)
                    withStyle(
                        SpanStyle(
                            fontWeight = FontWeight.Bold,
                            color = if (defaultColor != Color.Unspecified) defaultColor else Color.Unspecified
                        )
                    ) {
                        append(inner)
                    }
                }

                token.startsWith("*") && token.endsWith("*") && token.length >= 2 -> {
                    val inner = token.substring(1, token.length - 1)
                    withStyle(
                        SpanStyle(
                            fontStyle = FontStyle.Italic,
                            color = if (defaultColor != Color.Unspecified) defaultColor else Color.Unspecified
                        )
                    ) {
                        append(inner)
                    }
                }

                token.startsWith("`") && token.endsWith("`") && token.length >= 2 -> {
                    val inner = token.substring(1, token.length - 1)
                    withStyle(
                        SpanStyle(
                            fontFamily = FontFamily.Monospace,
                            background = Color.White.copy(alpha = 0.08f)
                        )
                    ) {
                        append(inner)
                    }
                }

                else -> append(token)
            }
            lastIndex = range.last + 1
        }

        if (lastIndex < raw.length) {
            append(raw.substring(lastIndex))
        }
    }
}

