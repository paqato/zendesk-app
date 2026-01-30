<script setup lang="ts">
import { inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { suggestionsKey } from '../../composables/useSuggestions'
import { toastKey } from '../../composables/useToast'
import type { Suggestion } from '../../types'
import SuggestionCard from './SuggestionCard.vue'
import RatingModal from './RatingModal.vue'
import logoSmall from '@assets/logo-small.png'

const { t } = useI18n()

// =============================================================================
// Inject & Emits
// =============================================================================

const suggestions = inject(suggestionsKey)!
const toast = inject(toastKey)!

const emit = defineEmits<{
  oauthConnect: []
}>()

// =============================================================================
// Event Handlers
// =============================================================================

async function handleRefresh(): Promise<void> {
  await suggestions.refresh()
  toast.showToast(t('suggestions_refreshed'), 'success')
}

async function handleLoadMore(): Promise<void> {
  await suggestions.loadMore()
}

async function handleUseResponse(suggestion: Suggestion): Promise<void> {
  const success = await suggestions.useResponse(suggestion)
  if (success) {
    toast.showToast(t('response_copied'), 'success')
  } else {
    toast.showToast(t('error_copying'), 'error')
  }
}

async function handleRatePositive(suggestion: Suggestion): Promise<void> {
  const success = await suggestions.submitDirectRating(suggestion.id, 5)
  if (success) {
    toast.showToast(t('success_rated'), 'success')
  } else {
    toast.showToast(t('error_saving'), 'error')
  }
}

async function handleRateNegative(suggestion: Suggestion): Promise<void> {
  // Save 1-star rating immediately
  await suggestions.submitDirectRating(suggestion.id, 1)
  // Then open modal for optional comment/adjustment
  suggestions.openRatingModal(suggestion.id, 1)
}

async function handleSubmitRating(rating: number, feedback: string): Promise<void> {
  const success = await suggestions.handleSubmitRating(rating, feedback)
  if (success) {
    toast.showToast(t('success_rated'), 'success')
  } else {
    toast.showToast(t('error_saving'), 'error')
  }
}

function handleCancelRating(): void {
  suggestions.closeRatingModal()
}

function handleOAuthConnect(): void {
  emit('oauthConnect')
}
</script>

<template>
  <div class="panel">
    <!-- Loading State -->
    <div v-if="suggestions.isLoading.value" class="panel-loading">
      <div class="spinner-small" />
      <span>{{ t('loading') }}</span>
    </div>

    <!-- Not Licensed State -->
    <div v-else-if="suggestions.oauthState.value === 'not-licensed'" class="info-container-small">
      <div class="info-icon-small locked">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h4>{{ t('ai_agent_not_licensed_title') }}</h4>
      <p>{{ t('ai_agent_not_licensed_message') }}</p>
      <a href="https://www.paqato.com" target="_blank" class="btn btn-small btn-primary btn-with-logo">
        <img :src="logoSmall" alt="PAQATO" class="btn-logo" />
        {{ t('feature_purchase') }}
      </a>
    </div>

    <!-- OAuth Required State -->
    <div v-else-if="suggestions.oauthState.value === 'not-connected'" class="info-container-small">
      <div class="info-icon-small">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
      </div>
      <h4>{{ t('ai_agent_oauth_title') }}</h4>
      <p>{{ t('ai_agent_oauth_message') }}</p>
      <button class="btn btn-small btn-primary" @click="handleOAuthConnect">
        {{ t('connect') }}
      </button>
    </div>

    <!-- Ready State -->
    <div v-else class="suggestions-container">
      <!-- Header -->
      <div class="suggestions-header">
        <h3>PAQATO AI Agent</h3>
        <button class="btn btn-small btn-secondary" :title="t('refresh')" @click="handleRefresh">
          ↻
        </button>
      </div>

      <!-- Waiting Indicator -->
      <div v-if="suggestions.isWaitingForResponse.value" class="waiting-indicator">
        <span class="spinner-small" />
        <span>{{ t('waiting_for_ai') }}</span>
      </div>

      <!-- Empty State -->
      <div v-if="!suggestions.isLoading.value && suggestions.suggestions.value.length === 0" class="empty-container">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p>{{ t('no_suggestions') }}</p>
      </div>

      <!-- Suggestions List -->
      <div v-else class="suggestions-list">
        <SuggestionCard
          v-for="suggestion in suggestions.suggestions.value"
          :key="suggestion.id"
          :suggestion="suggestion"
          @use="handleUseResponse"
          @rate-positive="handleRatePositive"
          @rate-negative="handleRateNegative"
        />

        <!-- Load More Link -->
        <span
          v-if="suggestions.hasMore.value"
          class="load-more-link"
          @click="handleLoadMore"
        >
          {{ t('load_older_suggestions') }}
        </span>
      </div>
    </div>

    <!-- Rating Modal -->
    <RatingModal
      :is-open="suggestions.selectedSuggestionId.value !== null"
      :preselected-rating="suggestions.selectedRating.value"
      @submit="handleSubmitRating"
      @cancel="handleCancelRating"
    />
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
}

/* Loading & Info States */
.panel-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  color: var(--paqato-text-light);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--paqato-border);
  border-top-color: var(--paqato-warning);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.info-container-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  text-align: center;
}

.info-icon-small {
  color: var(--paqato-text-light);
  margin-bottom: 8px;
}

.info-icon-small.locked {
  color: var(--paqato-warning);
}

.info-container-small h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.info-container-small p {
  color: var(--paqato-text-light);
  font-size: 12px;
  margin-bottom: 12px;
}

/* Suggestions Container */
.suggestions-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  margin-bottom: 8px;
}

.suggestions-header h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--paqato-text);
}

/* Waiting Indicator */
.waiting-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #fff8e6;
  border: 1px solid #f5d670;
  border-radius: 4px;
  margin-bottom: 8px;
  color: #735c0f;
  font-size: 12px;
}

/* Empty State */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 12px;
  text-align: center;
  color: var(--paqato-text-light);
}

.empty-icon {
  margin-bottom: 12px;
  color: var(--paqato-border);
}

/* Suggestions List */
.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

/* Load More Link */
.load-more-link {
  color: var(--paqato-primary);
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  padding: 8px;
}

.load-more-link:hover {
  text-decoration: underline;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary {
  background-color: var(--paqato-primary);
  color: var(--paqato-white);
}

.btn-primary:hover {
  background-color: var(--paqato-primary-dark);
}

.btn-with-logo {
  gap: 6px;
}

.btn-logo {
  height: 14px;
  width: auto;
}

.btn-secondary {
  background-color: var(--paqato-white);
  color: var(--paqato-text);
  border: 1px solid var(--paqato-border);
}

.btn-secondary:hover {
  background-color: var(--paqato-background);
}
</style>
