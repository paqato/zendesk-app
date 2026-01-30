<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import { useZafClient } from './composables/useZafClient'
import { useSuggestions, suggestionsKey } from './composables/useSuggestions'
import { useShipments, shipmentsKey } from './composables/useShipments'
import { useToast, toastKey } from './composables/useToast'
import { mapToSupportedLocale } from './helpers'
import type { AppState, AppSettings } from './types'

import AppStates from './components/AppStates.vue'
import ToastContainer from './components/ToastContainer.vue'
import SuggestionsPanel from './components/suggestions/SuggestionsPanel.vue'
import ShipmentsPanel from './components/shipments/ShipmentsPanel.vue'
import PanelResizer from './components/PanelResizer.vue'

const { t, locale } = useI18n()
const zafClient = useZafClient()
const suggestions = useSuggestions()
const shipments = useShipments()
const { toasts, showToast, clearAllToasts } = useToast()

// Provide composables to child components
provide(suggestionsKey, suggestions)
provide(shipmentsKey, shipments)
provide(toastKey, { showToast })

// =============================================================================
// App State
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
// Initialization
// =============================================================================

async function initialize(): Promise<void> {
  try {
    zafClient.init()

    // Register cleanup handler for Zendesk app lifecycle
    zafClient.onEvent('app.willDestroy', () => {
      suggestions.cleanup()
      shipments.cleanup()
      clearAllToasts()
    })

    // Resize iframe to use available height
    await zafClient.invoke('resize', { width: '100%', height: '75vh' })

    const userLocale = await zafClient.getUserLocale()
    locale.value = mapToSupportedLocale(userLocale)

    const metadata = await zafClient.getMetadata()
    settings.value = {
      aiAgentEnabled: metadata.settings.paqato_ai_agent_enabled ?? false,
      shipmentHistoryEnabled:
        metadata.settings.paqato_shipment_history_enabled ?? true,
    }

    if (!settings.value.aiAgentEnabled && !settings.value.shipmentHistoryEnabled) {
      appState.value = 'feature-disabled'
      return
    }

    const context = await zafClient.getContext()
    subdomain.value = context.account.subdomain

    ticketId.value = await zafClient.getTicketId()
    requesterEmail.value = await zafClient.getRequesterEmail()

    if (!ticketId.value) {
      errorMessage.value = t('no_ticket_found')
      appState.value = 'error'
      return
    }

    // Panels sofort anzeigen - sie haben eigene Loading-States
    appState.value = 'ready'

    // Parallel laden - jedes Panel zeigt seinen Inhalt sobald fertig
    if (settings.value.shipmentHistoryEnabled && requesterEmail.value) {
      shipments.initialize(requesterEmail.value)
      shipments.load().then(() => {
        if (shipments.isApiKeyInvalid.value) {
          appState.value = 'api-key-invalid'
        }
      })
    }

    if (settings.value.aiAgentEnabled && subdomain.value) {
      suggestions.initialize(ticketId.value, subdomain.value)
      suggestions.checkOAuthStatus().then(() => {
        if (suggestions.oauthState.value === 'api-key-invalid') {
          appState.value = 'api-key-invalid'
        } else if (suggestions.oauthState.value === 'connected') {
          suggestions.load()
        }
      })
    }
  } catch (error) {
    console.error('Initialization error:', error)
    errorMessage.value = t('error_loading')
    appState.value = 'error'
  }
}

async function handleRetry(): Promise<void> {
  appState.value = 'loading'
  await initialize()
}

async function handleOAuthConnect(): Promise<void> {
  const success = await suggestions.startOAuthFlow()
  if (success) {
    await suggestions.checkOAuthStatus()
    if (suggestions.oauthState.value === 'connected') {
      await suggestions.load()
    }
  }
}

// =============================================================================
// Lifecycle
// =============================================================================

onMounted(async () => {
  await initialize()
})

onUnmounted(() => {
  suggestions.cleanup()
  shipments.cleanup()
})
</script>

<template>
  <div class="paqato-app">
    <!-- Non-Ready States -->
    <AppStates
      v-if="appState !== 'ready'"
      :state="appState"
      :error-message="errorMessage"
      @retry="handleRetry"
    />

    <!-- Ready State - Panels -->
    <div
      v-else
      class="panels-container"
      :class="{
        'single-panel': !isSplitPanel,
        'split-panels': isSplitPanel,
      }"
    >
      <ShipmentsPanel v-if="settings.shipmentHistoryEnabled" />

      <PanelResizer v-if="isSplitPanel" />

      <SuggestionsPanel
        v-if="settings.aiAgentEnabled"
        @oauth-connect="handleOAuthConnect"
      />
    </div>

    <!-- Toast Notifications -->
    <ToastContainer :toasts="toasts" />
  </div>
</template>

<style scoped>
.paqato-app {
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: var(--paqato-text);
}

.panels-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
}

.panels-container.single-panel :deep(.panel) {
  flex: 1;
  height: 100%;
}

.panels-container.split-panels :deep(.panel) {
  flex: 0 0 auto;
  min-height: 100px;
  overflow: auto;
}
</style>
