import { ref, computed, type InjectionKey } from 'vue'
import { useZafClient } from './useZafClient'
import { useAiAgentApi } from './useAiAgentApi'
import { useOAuth } from './useOAuth'
import { usePolling } from './usePolling'
import type {
  Suggestion,
  SuggestionsPagination,
  ApiError,
} from '../types'
import { htmlToPlainText } from '../helpers'

// =============================================================================
// Injection Key
// =============================================================================

export type SuggestionsContext = ReturnType<typeof useSuggestions>
export const suggestionsKey: InjectionKey<SuggestionsContext> = Symbol('suggestions')

// =============================================================================
// State
// =============================================================================

const suggestions = ref<Suggestion[]>([])
const pagination = ref<SuggestionsPagination | null>(null)
const totalCount = ref(0)
const currentPage = ref(1)
const isLoading = ref(false)

// Rating modal state
const selectedSuggestionId = ref<number | null>(null)
const selectedRating = ref<number | null>(null)

// Tracking state for "Use Response" action
const pendingUsedSuggestionId = ref<number | null>(null)
const pendingUsedText = ref<string | null>(null)

// Context
let ticketId: number | null = null
let subdomain: string | null = null

export function useSuggestions() {
  const { onEvent, setCommentText, getCommentText, getConversation } = useZafClient()
  const { getSuggestions, submitRating, editSuggestion } = useAiAgentApi()
  const { oauthState, checkOAuthStatus, startOAuthFlow, setOAuthState } = useOAuth()
  const { isWaitingForResponse, startPolling, stopPolling } = usePolling()

  // =============================================================================
  // Computed
  // =============================================================================

  const hasMore = computed(() => {
    return pagination.value !== null && currentPage.value < pagination.value.maxPage
  })

  const isReady = computed(() => oauthState.value === 'connected')

  // =============================================================================
  // Load & Refresh
  // =============================================================================

  async function load(page = 1, append = false): Promise<void> {
    if (!ticketId) return

    // Don't show loading spinner while waiting for AI or when appending
    if (!isWaitingForResponse.value && !append) {
      isLoading.value = true
    }

    try {
      const response = await getSuggestions(ticketId, page)
      const newSuggestions = response.suggestions || []
      totalCount.value = response.total_count || 0
      pagination.value = response.pagination || null
      currentPage.value = page

      if (append) {
        suggestions.value = [...suggestions.value, ...newSuggestions]
      } else {
        suggestions.value = newSuggestions
      }
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.status === 401) {
        setOAuthState('api-key-invalid')
      } else if (apiError.status === 403) {
        setOAuthState('not-licensed')
      }
      console.error('Load suggestions error:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function refresh(): Promise<void> {
    currentPage.value = 1
    await load(1, false)
  }

  async function loadMore(): Promise<void> {
    if (hasMore.value) {
      await load(currentPage.value + 1, true)
    }
  }

  // =============================================================================
  // Polling for AI Response
  // =============================================================================

  function startAiPolling(): void {
    const initialCount = totalCount.value

    startPolling(async () => {
      if (!ticketId) return false

      const response = await getSuggestions(ticketId, 1)
      if (response.total_count > initialCount) {
        // New suggestion arrived
        suggestions.value = response.suggestions || []
        totalCount.value = response.total_count
        pagination.value = response.pagination || null
        return true
      }
      return false
    })
  }

  // =============================================================================
  // Rating Modal
  // =============================================================================

  function openRatingModal(suggestionId: number, preselectedRating?: number): void {
    selectedSuggestionId.value = suggestionId
    selectedRating.value = preselectedRating ?? null
  }

  function closeRatingModal(): void {
    selectedSuggestionId.value = null
    selectedRating.value = null
  }

  async function handleSubmitRating(
    rating: number,
    feedback: string
  ): Promise<boolean> {
    if (!selectedSuggestionId.value) return false

    try {
      await submitRating(selectedSuggestionId.value, rating, feedback || null)

      // Update local state
      const suggestion = suggestions.value.find(
        (s) => s.id === selectedSuggestionId.value
      )
      if (suggestion) {
        suggestion.rating = { stars: rating, feedback: feedback || undefined }
      }

      closeRatingModal()
      return true
    } catch (error) {
      console.error('Submit rating error:', error)
      return false
    }
  }

  async function submitDirectRating(
    suggestionId: number,
    rating: number
  ): Promise<boolean> {
    try {
      await submitRating(suggestionId, rating, null)

      // Update local state
      const suggestion = suggestions.value.find((s) => s.id === suggestionId)
      if (suggestion) {
        suggestion.rating = { stars: rating }
      }

      return true
    } catch (error) {
      console.error('Submit rating error:', error)
      return false
    }
  }

  // =============================================================================
  // Use Response
  // =============================================================================

  async function useResponse(suggestion: Suggestion): Promise<boolean> {
    try {
      await setCommentText(suggestion.text)
      pendingUsedSuggestionId.value = suggestion.id
      return true
    } catch (error) {
      console.error('Use response error:', error)
      return false
    }
  }

  // =============================================================================
  // Event Handlers
  // =============================================================================

  function setupEventHandlers(): void {
    // Handle ticket.save to capture comment text
    onEvent('ticket.save', async () => {
      if (pendingUsedSuggestionId.value) {
        try {
          pendingUsedText.value = await getCommentText()
        } catch (error) {
          console.error('Error getting comment text:', error)
        }
      }
      return true
    })

    // Handle ticket.submit.done to track used suggestions
    onEvent('ticket.submit.done', async () => {
      if (pendingUsedSuggestionId.value && pendingUsedText.value) {
        try {
          const plainText = htmlToPlainText(pendingUsedText.value)
          await editSuggestion(pendingUsedSuggestionId.value, plainText)
          await load(1, false)
        } catch (error) {
          console.error('Error tracking used suggestion:', error)
        }
      }
      pendingUsedSuggestionId.value = null
      pendingUsedText.value = null
      return true
    })

    // Handle conversation changes to start polling
    onEvent('ticket.conversation.changed', async () => {
      // Don't react if already waiting
      if (isWaitingForResponse.value) return true

      try {
        const messages = await getConversation()
        if (messages.length === 0) return true

        const lastComment = messages[messages.length - 1]
        if (lastComment.author?.role === 'end-user') {
          startAiPolling()
        }
      } catch (error) {
        console.error('Error checking conversation:', error)
      }
      return true
    })
  }

  // =============================================================================
  // OAuth Wrapper
  // =============================================================================

  async function handleOAuthFlow(): Promise<boolean> {
    if (!subdomain) return false
    return startOAuthFlow(subdomain)
  }

  // =============================================================================
  // Initialize
  // =============================================================================

  function initialize(
    currentTicketId: number,
    currentSubdomain: string
  ): void {
    ticketId = currentTicketId
    subdomain = currentSubdomain
    setupEventHandlers()
  }

  function cleanup(): void {
    stopPolling()
    suggestions.value = []
    pagination.value = null
    totalCount.value = 0
    currentPage.value = 1
  }

  return {
    // State
    suggestions,
    pagination,
    totalCount,
    currentPage,
    isLoading,
    oauthState,
    isWaitingForResponse,
    selectedSuggestionId,
    selectedRating,

    // Computed
    hasMore,
    isReady,

    // Methods
    initialize,
    cleanup,
    load,
    refresh,
    loadMore,
    checkOAuthStatus,
    startOAuthFlow: handleOAuthFlow,
    openRatingModal,
    closeRatingModal,
    handleSubmitRating,
    submitDirectRating,
    useResponse,
    startPolling: startAiPolling,
    stopPolling,
  }
}
