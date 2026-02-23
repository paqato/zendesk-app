// =============================================================================
// Suggestion Types
// =============================================================================

export interface SuggestionRating {
  stars: number
  feedback?: string
}

export interface Suggestion {
  id: number
  text: string
  confidence: number
  created_at: string
  edited: boolean
  rating?: SuggestionRating
  is_success: boolean
  error?: string
}

export interface SuggestionsPagination {
  currentPage: number
  maxPage: number
  perPage: number
  total: number
}

export interface SuggestionsResponse {
  suggestions: Suggestion[]
  total_count: number
  pagination: SuggestionsPagination | null
}

export interface RatingPayload {
  rating: number
  feedback: string | null
}

export interface EditPayload {
  content: string
}

export interface OAuthInitPayload {
  subdomain: string
}

export interface OAuthStatusResponse {
  connected: boolean
  subdomain?: string
}

export interface OAuthInitResponse {
  authorize_url: string
}
