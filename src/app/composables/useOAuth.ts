import { ref } from 'vue'
import { useAiAgentApi } from './useAiAgentApi'
import type { OAuthState, ApiError } from '../types'

// =============================================================================
// State
// =============================================================================

const oauthState = ref<OAuthState>('unknown')

// =============================================================================
// OAuth Methods
// =============================================================================

export function useOAuth() {
  const { getOAuthStatus, initOAuth } = useAiAgentApi()

  async function checkOAuthStatus(): Promise<void> {
    try {
      const response = await getOAuthStatus()
      oauthState.value = response.connected ? 'connected' : 'not-connected'
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.status === 401) {
        oauthState.value = 'api-key-invalid'
      } else if (apiError.status === 403) {
        oauthState.value = 'not-licensed'
      } else {
        oauthState.value = 'unknown'
      }
    }
  }

  async function startOAuthFlow(subdomain: string): Promise<boolean> {
    try {
      const response = await initOAuth(subdomain)

      // Open popup window
      const popup = window.open(
        response.authorize_url,
        'paqato_oauth',
        'width=600,height=700,scrollbars=yes'
      )

      if (!popup) {
        console.error('Failed to open OAuth popup')
        return false
      }

      // Wait for popup to close (with timeout)
      return new Promise<boolean>((resolve) => {
        const maxWaitMs = 90 * 1000 // 90 seconds
        const startTime = Date.now()

        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed)
            resolve(true)
          } else if (Date.now() - startTime > maxWaitMs) {
            clearInterval(checkClosed)
            console.warn('OAuth popup check timed out')
            resolve(false)
          }
        }, 500)
      })
    } catch (error) {
      console.error('OAuth flow error:', error)
      return false
    }
  }

  function setOAuthState(state: OAuthState): void {
    oauthState.value = state
  }

  return {
    oauthState,
    checkOAuthStatus,
    startOAuthFlow,
    setOAuthState,
  }
}
