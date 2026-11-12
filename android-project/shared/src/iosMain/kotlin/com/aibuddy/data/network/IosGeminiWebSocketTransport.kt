package com.aibuddy.data.network

import platform.Foundation.*
import platform.darwin.NSObject
import kotlinx.cinterop.*

/**
 * iOS native WebSocket transport implementing GeminiLiveWebSocketTransport
 * using Apple's NSURLSessionWebSocketTask.
 */
@OptIn(ExperimentalForeignApi::class)
class IosGeminiWebSocketTransport : GeminiLiveWebSocketTransport {

    private var session: NSURLSession? = null
    private var webSocketTask: NSURLSessionWebSocketTask? = null
    private var listener: GeminiLiveWebSocketListener? = null
    private var connected = false

    override val isConnected: Boolean
        get() = connected

    override fun connect(url: String, listener: GeminiLiveWebSocketListener) {
        this.listener = listener
        try {
            val nsUrl = NSURL(string = url) ?: run {
                listener.onFailure(IllegalArgumentException("Invalid URL: $url"), null)
                return
            }

            val config = NSURLSessionConfiguration.defaultSessionConfiguration
            val urlSession = NSURLSession.sessionWithConfiguration(config)
            session = urlSession

            val task = urlSession.webSocketTaskWithURL(nsUrl)
            webSocketTask = task

            task.resume()
            connected = true
            listener.onOpen()

            receiveNextMessage(task)
        } catch (e: Exception) {
            connected = false
            listener.onFailure(e, null)
        }
    }

    private fun receiveNextMessage(task: NSURLSessionWebSocketTask) {
        if (!connected) return

        task.receiveMessageWithCompletionHandler { message, error ->
            if (error != null) {
                if (connected) {
                    connected = false
                    listener?.onFailure(Exception(error.localizedDescription), null)
                }
                return@receiveMessageWithCompletionHandler
            }

            if (message != null) {
                val text = message.string
                val data = message.data
                if (text != null) {
                    listener?.onMessage(text)
                } else if (data != null) {
                    val bytes = data.toByteArray()
                    listener?.onBinaryMessage(bytes)
                }
            }

            // Loop for next message
            if (connected) {
                receiveNextMessage(task)
            }
        }
    }

    override fun send(text: String): Boolean {
        val task = webSocketTask ?: return false
        if (!connected) return false

        val message = NSURLSessionWebSocketMessage(string = text)
        task.sendMessage(message) { error ->
            if (error != null) {
                println("[IosWebSocket] send error: ${error.localizedDescription}")
            }
        }
        return true
    }

    override fun send(bytes: ByteArray): Boolean {
        val task = webSocketTask ?: return false
        if (!connected) return false

        val data = bytes.toNSData()
        val message = NSURLSessionWebSocketMessage(data = data)
        task.sendMessage(message) { error ->
            if (error != null) {
                println("[IosWebSocket] send bytes error: ${error.localizedDescription}")
            }
        }
        return true
    }

    override fun close(code: Int, reason: String): Boolean {
        connected = false
        val task = webSocketTask ?: return false
        val reasonData = reason.encodeToByteArray().toNSData()
        task.cancelWithCloseCode(code.toLong(), reasonData)
        webSocketTask = null
        session?.invalidateAndCancel()
        session = null
        listener?.onClosing(code, reason)
        return true
    }

    private fun NSData.toByteArray(): ByteArray {
        val length = this.length.toInt()
        val bytes = ByteArray(length)
        if (length > 0) {
            bytes.usePinned { pinned ->
                platform.posix.memcpy(pinned.addressOf(0), this.bytes, this.length)
            }
        }
        return bytes
    }

    private fun ByteArray.toNSData(): NSData {
        if (isEmpty()) return NSData()
        return this.usePinned { pinned ->
            NSData.dataWithBytes(pinned.addressOf(0), this.size.toULong())
        }
    }
}

actual fun createDefaultWebSocketTransport(): GeminiLiveWebSocketTransport = IosGeminiWebSocketTransport()

