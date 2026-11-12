package com.aibuddy.data.network

import okhttp3.*
import okio.ByteString
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Android OkHttp-based WebSocket transport implementing GeminiLiveWebSocketTransport.
 */
class AndroidOkHttpWebSocketTransport(
    private val client: OkHttpClient = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .pingInterval(30, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()
) : GeminiLiveWebSocketTransport {

    private var webSocket: WebSocket? = null
    private val connected = AtomicBoolean(false)

    override val isConnected: Boolean
        get() = connected.get()

    override fun connect(url: String, listener: GeminiLiveWebSocketListener) {
        val request = Request.Builder().url(url).build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                connected.set(true)
                listener.onOpen()
            }

            override fun onMessage(ws: WebSocket, text: String) {
                listener.onMessage(text)
            }

            override fun onMessage(ws: WebSocket, bytes: ByteString) {
                listener.onBinaryMessage(bytes.toByteArray())
            }

            override fun onClosing(ws: WebSocket, code: Int, reason: String) {
                connected.set(false)
                listener.onClosing(code, reason)
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                connected.set(false)
                val httpDetail = response?.let { " (HTTP ${it.code}: ${it.message})" }
                listener.onFailure(t, httpDetail)
            }
        })
    }

    override fun send(text: String): Boolean {
        return webSocket?.send(text) ?: false
    }

    override fun send(bytes: ByteArray): Boolean {
        return webSocket?.send(ByteString.of(*bytes)) ?: false
    }

    override fun close(code: Int, reason: String): Boolean {
        connected.set(false)
        val result = webSocket?.close(code, reason) ?: false
        webSocket = null
        return result
    }
}

actual fun createDefaultWebSocketTransport(): GeminiLiveWebSocketTransport = AndroidOkHttpWebSocketTransport()
