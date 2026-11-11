package com.aibuddy.ui.components

import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class MarkdownTextTest {

    @Test
    fun testParseInlineMarkdownBold() {
        val raw = "Kalimat yang benar adalah **\"I agree with you.\"**"
        val parsed = parseInlineMarkdown(raw)

        assertEquals("Kalimat yang benar adalah \"I agree with you.\"", parsed.text)
        val boldSpans = parsed.spanStyles.filter { it.item.fontWeight == FontWeight.Bold }
        assertEquals(1, boldSpans.size)
        assertEquals(26, boldSpans[0].start)
        assertEquals(26 + "\"I agree with you.\"".length, boldSpans[0].end)
    }

    @Test
    fun testParseInlineMarkdownItalic() {
        val raw = "Contoh: *She agrees with the plan.*"
        val parsed = parseInlineMarkdown(raw)

        assertEquals("Contoh: She agrees with the plan.", parsed.text)
        val italicSpans = parsed.spanStyles.filter { it.item.fontStyle == FontStyle.Italic }
        assertEquals(1, italicSpans.size)
        assertEquals(8, italicSpans[0].start)
        assertEquals(8 + "She agrees with the plan.".length, italicSpans[0].end)
    }

    @Test
    fun testParseInlineMarkdownMixed() {
        val raw = "Kata **'agree'** itu sudah berfungsi sebagai **kata kerja (verb)**"
        val parsed = parseInlineMarkdown(raw)

        assertNotNull(parsed)
        assertEquals("Kata 'agree' itu sudah berfungsi sebagai kata kerja (verb)", parsed.text)
        val boldSpans = parsed.spanStyles.filter { it.item.fontWeight == FontWeight.Bold }
        assertEquals(2, boldSpans.size)
    }
}
