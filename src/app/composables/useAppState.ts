import { ref, computed } from 'vue'
import type { AppState, AppSettings } from '../types'

// =============================================================================
// State
// =============================================================================

const appState = ref<AppState>('loading')
const errorMessage = ref<string | null>(null)
const settings = ref<AppSettings>({
  aiAgentEnabled: false,
  shipmentHistoryEnabled: false,
})
const subdomain = ref<string | null>(null)
const ticketId = ref<number | null>(null)
const requesterEmail = ref<string | null>(null)

// =============================================================================
// Computed
// =============================================================================

const enabledFeaturesCount = computed(() => {
  return (
    (settings.value.aiAgentEnabled ? 1 : 0) +
    (settings.value.shipmentHistoryEnabled ? 1 : 0)
  )
})

const isSplitPanel = computed(() => enabledFeaturesCount.value === 2)

// =============================================================================
// Actions
// =============================================================================

export function useAppState() {
  function setState(state: AppState): void {
    appState.value = state
  }

  function setError(message: string | null): void {
    errorMessage.value = message
  }

  function setSettings(newSettings: AppSettings): void {
    settings.value = newSettings
  }

  function setSubdomain(value: string): void {
    subdomain.value = value
  }

  function setTicketId(value: number): void {
    ticketId.value = value
  }

  function setRequesterEmail(value: string): void {
    requesterEmail.value = value
  }

  return {
    // State
    appState,
    errorMessage,
    settings,
    subdomain,
    ticketId,
    requesterEmail,

    // Computed
    enabledFeaturesCount,
    isSplitPanel,

    // Actions
    setState,
    setError,
    setSettings,
    setSubdomain,
    setTicketId,
    setRequesterEmail,
  }
}
