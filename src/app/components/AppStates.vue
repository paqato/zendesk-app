<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { AppState } from '../types'

const { t } = useI18n()

defineProps<{
  state: AppState
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  retry: []
}>()

function handleRetry(): void {
  emit('retry')
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="state === 'loading'" class="loading-container">
    <div class="spinner" />
    <p>{{ t('loading') }}</p>
  </div>

  <!-- Error State -->
  <div v-else-if="state === 'error'" class="error-container">
    <div class="error-icon">!</div>
    <p>{{ errorMessage || t('error_loading') }}</p>
    <button class="btn btn-secondary" @click="handleRetry">
      {{ t('retry') }}
    </button>
  </div>

  <!-- Feature Disabled State -->
  <div v-else-if="state === 'feature-disabled'" class="info-container">
    <div class="info-icon">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    </div>
    <h3>{{ t('feature_disabled_title') }}</h3>
    <p>{{ t('feature_disabled_message') }}</p>
  </div>

  <!-- API Key Invalid State -->
  <div v-else-if="state === 'api-key-invalid'" class="info-container">
    <div class="info-icon error">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
        />
      </svg>
    </div>
    <h3>{{ t('api_key_invalid_title') }}</h3>
    <p>{{ t('api_key_invalid_message') }}</p>
  </div>
</template>

<style scoped>
/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  text-align: center;
  flex: 1;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--paqato-border);
  border-top-color: var(--paqato-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  text-align: center;
  flex: 1;
}

.error-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--paqato-error);
  color: var(--paqato-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 8px;
}

/* Info Container (Feature Disabled, API Key Invalid) */
.info-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  text-align: center;
  flex: 1;
}

.info-icon {
  color: var(--paqato-text-light);
  margin-bottom: 12px;
}

.info-icon.error {
  color: var(--paqato-error);
}

.info-container h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.info-container p {
  color: var(--paqato-text-light);
  font-size: 12px;
  margin-bottom: 12px;
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
  transition: background-color 0.2s, border-color 0.2s;
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
