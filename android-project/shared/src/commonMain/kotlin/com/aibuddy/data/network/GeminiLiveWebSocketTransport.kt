package com.aibuddy.data.network

interface GeminiLiveWebSocketListener {
    fun onOpen()
    fun onMessage(text: String)
    fun onBinaryMessage(bytes: ByteArray)
    fun onClosing(code: Int, reason: String)
    fun onFailure(throwable: Throwable, response: String?)
}

interface GeminiLiveWebSocketTransport {
    fun connect(url: String, listener: GeminiLiveWebSocketListener)
    fun send(text: String): Boolean
    fun send(bytes: ByteArray): Boolean
    fun close(code: Int, reason: String): Boolean
    val isConnected: Boolean
}

expect fun createDefaultWebSocketTransport(): GeminiLiveWebSocketTransport


