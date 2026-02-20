import { useZafClient } from './useZafClient'
import { MONI_BASE_URL } from '../helpers'
import type {
  SuggestionsResponse,
  OAuthStatusResponse,
  OAuthInitResponse,
} from '../types'

// =============================================================================
// API Methods
// =============================================================================

export function useAiAgentApi() {
  const { request } = useZafClient()

  async function apiRequest<T>(
    method: 'GET' | 'POST',
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    const options = {
      url: `${MONI_BASE_URL}/api/v1/zendesk-app${endpoint}`,
      type: method,
      secure: true,
      headers: {
        Authorization: 'Bearer {{setting.token}}',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      contentType: 'application/json',
      data: data ? JSON.stringify(data) : undefined,
    }

    return request<T>(options)
  }

  async function getSuggestions(
    ticketId: number,
    page = 1
  ): Promise<SuggestionsResponse> {
    let endpoint = `/suggestions/${encodeURIComponent(ticketId)}`
    if (page > 1) {
      endpoint += `?page=${page}`
    }
    return apiRequest<SuggestionsResponse>('GET', endpoint)
  }

  async function submitRating(
    suggestionId: number,
    rating: number,
    feedback: string | null
  ): Promise<{ success: boolean }> {
    return apiRequest('POST', `/rating/${suggestionId}`, {
      rating,
      feedback,
    })
  }

  async function editSuggestion(
    suggestionId: number,
    content: string
  ): Promise<{ success: boolean }> {
    return apiRequest('POST', `/edit/${suggestionId}`, { content })
  }

  async function getOAuthStatus(): Promise<OAuthStatusResponse> {
    return apiRequest<OAuthStatusResponse>('GET', '/oauth/status')
  }

  async function initOAuth(subdomain: string): Promise<OAuthInitResponse> {
    return apiRequest<OAuthInitResponse>('POST', '/oauth/init', {
      subdomain,
    })
  }

  return {
    getSuggestions,
    submitRating,
    editSuggestion,
    getOAuthStatus,
    initOAuth,
  }
}
