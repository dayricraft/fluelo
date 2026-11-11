package com.aibuddy.ui.flashcard

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.aibuddy.audio.FlashcardTtsManager
import com.aibuddy.data.flashcard.FlashcardRepository
import com.aibuddy.data.flashcard.model.FlashcardDeckState
import com.aibuddy.data.flashcard.model.FlashcardItem
import com.aibuddy.live.AudioSessionState
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class FlashcardUiState(
    val isLoading: Boolean = true,
    val currentCard: FlashcardItem? = null,
    val isFlipped: Boolean = false,
    val seenCount: Int = 0,
    val totalCount: Int = 3000,
    val bookmarkedCount: Int = 0,
    val activeMode: String = "EXPLORE", // "EXPLORE" or "REVIEW"
    val reviewFilter: String = "ALL_SEEN", // "ALL_SEEN" or "BOOKMARKED"
    val reviewCards: List<FlashcardItem> = emptyList(),
    val reviewIndex: Int = 0,
    val isSpeaking: Boolean = false,
    val isFirstPassCompleted: Boolean = false,
    val isCallActive: Boolean = false,
    val snackbarMessage: String? = null
)

@OptIn(ExperimentalCoroutinesApi::class)
class FlashcardViewModel(
    application: Application,
    private val getAudioSessionState: () -> AudioSessionState = { AudioSessionState.IDLE }
) : AndroidViewModel(application) {

    private val repository = FlashcardRepository.getInstance(application)
    private val ttsManager = FlashcardTtsManager(application, getAudioSessionState)

    private val _isFlipped = MutableStateFlow(false)
    private val _isLoading = MutableStateFlow(true)
    private val _snackbarMessage = MutableStateFlow<String?>(null)
    private val _reviewIndex = MutableStateFlow(0)

    private val deckStateFlow: StateFlow<FlashcardDeckState?> = repository.deckState
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    private val exploreCardFlow: StateFlow<FlashcardItem?> = deckStateFlow
        .flatMapLatest { state ->
            val rank = state?.currentExploreRank ?: 1
            repository.getFlashcardByRank(rank)
        }
        .stateIn(viewModelScope, SharingStarted.Eagerly, null)

    val uiState: StateFlow<FlashcardUiState> = combine(
        _isLoading,
        _isFlipped,
        _snackbarMessage,
        _reviewIndex,
        deckStateFlow,
        exploreCardFlow,
        repository.seenCount,
        repository.totalCount,
        repository.bookmarkedCount,
        repository.allSeenCards,
        repository.bookmarkedCards,
        ttsManager.isSpeaking
    ) { args ->
        val isLoading = args[0] as Boolean
        val isFlipped = args[1] as Boolean
        val snackbarMsg = args[2] as String?
        val reviewIdx = args[3] as Int
        val deckState = args[4] as FlashcardDeckState?
        val exploreCard = args[5] as FlashcardItem?
        val seenCount = args[6] as Int
        val totalCount = args[7] as Int
        val bookmarkedCount = args[8] as Int
        @Suppress("UNCHECKED_CAST")
        val allSeen = args[9] as List<FlashcardItem>
        @Suppress("UNCHECKED_CAST")
        val bookmarked = args[10] as List<FlashcardItem>
        val isSpeaking = args[11] as Boolean

        val activeMode = deckState?.activeMode ?: "EXPLORE"
        val reviewFilter = deckState?.reviewFilter ?: "ALL_SEEN"
        val isFirstPassCompleted = deckState?.isFirstPassCompleted ?: false

        val activeReviewCards = if (reviewFilter == "BOOKMARKED") bookmarked else allSeen
        val boundedReviewIdx = if (activeReviewCards.isEmpty()) 0 else reviewIdx.coerceIn(0, activeReviewCards.lastIndex)

        val activeCard = if (activeMode == "EXPLORE") {
            exploreCard
        } else {
            activeReviewCards.getOrNull(boundedReviewIdx)
        }

        FlashcardUiState(
            isLoading = isLoading,
            currentCard = activeCard,
            isFlipped = isFlipped,
            seenCount = seenCount,
            totalCount = if (totalCount > 0) totalCount else 3000,
            bookmarkedCount = bookmarkedCount,
            activeMode = activeMode,
            reviewFilter = reviewFilter,
            reviewCards = activeReviewCards,
            reviewIndex = boundedReviewIdx,
            isSpeaking = isSpeaking,
            isFirstPassCompleted = isFirstPassCompleted,
            isCallActive = getAudioSessionState() != AudioSessionState.IDLE,
            snackbarMessage = snackbarMsg
        )
    }.stateIn(
        viewModelScope,
        SharingStarted.WhileSubscribed(5000),
        FlashcardUiState()
    )

    init {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                repository.ensureDatabaseSeeded()
            } catch (e: Exception) {
                _snackbarMessage.value = "Gagal memuat basis data kosakata: ${e.localizedMessage}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun onFlipCard() {
        val current = uiState.value.currentCard ?: return
        val nextFlipped = !_isFlipped.value
        _isFlipped.value = nextFlipped

        if (nextFlipped && current.progress.revealedAt == null) {
            viewModelScope.launch {
                repository.markCardRevealed(current.entry.id)
            }
        }
    }

    fun onNextCard() {
        _isFlipped.value = false
        val state = uiState.value

        if (state.activeMode == "EXPLORE") {
            viewModelScope.launch {
                repository.nextExploreCard()
            }
        } else {
            if (state.reviewCards.isNotEmpty()) {
                val nextIdx = (state.reviewIndex + 1).coerceAtMost(state.reviewCards.lastIndex)
                _reviewIndex.value = nextIdx
                state.reviewCards.getOrNull(nextIdx)?.let {
                    viewModelScope.launch {
                        repository.recordReview(it.entry.id)
                    }
                }
            }
        }
    }

    fun onPreviousCard() {
        _isFlipped.value = false
        val state = uiState.value

        if (state.activeMode == "EXPLORE") {
            viewModelScope.launch {
                repository.previousExploreCard()
            }
        } else {
            if (state.reviewCards.isNotEmpty()) {
                val prevIdx = (state.reviewIndex - 1).coerceAtLeast(0)
                _reviewIndex.value = prevIdx
            }
        }
    }

    fun onToggleBookmark() {
        val card = uiState.value.currentCard ?: return
        val newBookmarkState = !card.progress.isBookmarked
        viewModelScope.launch {
            repository.toggleBookmark(card.entry.id, newBookmarkState)
        }
    }

    fun onSpeakHeadword() {
        val card = uiState.value.currentCard ?: return
        val isCallActive = getAudioSessionState() != AudioSessionState.IDLE

        if (isCallActive) {
            _snackbarMessage.value = "Pengucapan audio dinonaktifkan saat panggilan suara Buddy aktif."
            return
        }

        val success = ttsManager.speak(card.entry.headword) {
            _snackbarMessage.value = "Panggilan suara sedang berlangsung."
        }

        if (!success && !ttsManager.isReady.value) {
            _snackbarMessage.value = "Mesin pengucapan suara (TextToSpeech) tidak tersedia di perangkat ini."
        }
    }

    fun onSelectMode(mode: String) {
        _isFlipped.value = false
        viewModelScope.launch {
            repository.setActiveMode(mode)
        }
    }

    fun onSelectReviewFilter(filter: String) {
        _isFlipped.value = false
        _reviewIndex.value = 0
        viewModelScope.launch {
            repository.setReviewFilter(filter)
        }
    }

    fun onDismissSnackbar() {
        _snackbarMessage.value = null
    }

    override fun onCleared() {
        super.onCleared()
        ttsManager.release()
    }
}
