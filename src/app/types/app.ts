// =============================================================================
// App Types
// =============================================================================

export type AppState =
  | 'loading'
  | 'error'
  | 'feature-disabled'
  | 'feature-not-licensed'
  | 'api-key-invalid'
  | 'ready'

export type OAuthState = 'unknown' | 'connected' | 'not-connected' | 'not-licensed' | 'api-key-invalid'

export interface AppSettings {
  aiAgentEnabled: boolean
  shipmentHistoryEnabled: boolean
}

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

// =============================================================================
// API Error Types
// =============================================================================

export interface ApiError extends Error {
  status?: number
}
