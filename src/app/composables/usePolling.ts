import { ref } from 'vue'
import { POLLING_INTERVAL_MS, POLLING_TIMEOUT_MS } from '../helpers'

// =============================================================================
// State
// =============================================================================

const isWaitingForResponse = ref(false)
let pollingTimer: ReturnType<typeof setInterval> | null = null
let pollingStartTime: number | null = null

// =============================================================================
// Polling Methods
// =============================================================================

export function usePolling() {
  function startPolling(
    checkCallback: () => Promise<boolean>
  ): void {
    if (pollingTimer) return

    isWaitingForResponse.value = true
    pollingStartTime = Date.now()

    pollingTimer = setInterval(async () => {
      // Check timeout
      if (
        pollingStartTime &&
        Date.now() - pollingStartTime > POLLING_TIMEOUT_MS
      ) {
        stopPolling()
        return
      }

      // Check for new data
      try {
        const hasNewData = await checkCallback()
        if (hasNewData) {
          stopPolling()
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, POLLING_INTERVAL_MS)
  }

  function stopPolling(): void {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
    pollingStartTime = null
    isWaitingForResponse.value = false
  }

  return {
    isWaitingForResponse,
    startPolling,
    stopPolling,
  }
}
