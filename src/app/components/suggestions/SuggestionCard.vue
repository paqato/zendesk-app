<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getConfidenceClass, getTimeAgoParts } from '../../helpers'
import type { Suggestion } from '../../types'

const { t } = useI18n()

defineProps<{
  suggestion: Suggestion
}>()

const emit = defineEmits<{
  use: [suggestion: Suggestion]
  'rate-positive': [suggestion: Suggestion]
  'rate-negative': [suggestion: Suggestion]
}>()

function formatTimeAgo(dateString: string): string {
  const parts = getTimeAgoParts(dateString)
  if (parts.days > 0) {
    return t('time_ago_days', { count: parts.days })
  }
  if (parts.hours > 0) {
    return t('time_ago_hours', { count: parts.hours })
  }
  if (parts.minutes > 0) {
    return t('time_ago_minutes', { count: parts.minutes })
  }
  return t('time_ago_now')
}
</script>

<template>
  <div class="suggestion-card" :class="{ rated: suggestion.rating, notice: !suggestion.is_success }">
    <!-- Status Badge -->
    <div class="suggestion-status">
      <span
        v-if="!suggestion.is_success"
        class="status-badge notice"
      >
        {{ t('status_error') }}
      </span>
      <span v-else class="status-badge" :class="getConfidenceClass(suggestion.confidence)">
        {{ suggestion.edited ? t('status_already_sent') : t('status_ai_suggestion') }}
      </span>
      <span class="suggestion-time">{{ formatTimeAgo(suggestion.created_at) }}</span>
    </div>

    <!-- Notice Text -->
    <div v-if="!suggestion.is_success" class="suggestion-text notice-text">{{ suggestion.error }}</div>

    <!-- Suggestion Text -->
    <div v-else class="suggestion-text">{{ suggestion.text }}</div>

    <!-- Actions (hidden for errors) -->
    <div v-if="suggestion.is_success" class="suggestion-actions">
      <button class="btn btn-small btn-primary" @click="emit('use', suggestion)">
        {{ t('use_response') }}
      </button>
      <div class="rating-buttons">
        <button
          class="btn-icon"
          :class="{ active: suggestion.rating && suggestion.rating.stars >= 3 }"
          :title="t('positive')"
          @click="emit('rate-positive', suggestion)"
        >
          👍
        </button>
        <button
          class="btn-icon"
          :class="{ active: suggestion.rating && suggestion.rating.stars <= 2 }"
          :title="t('negative')"
          @click="emit('rate-negative', suggestion)"
        >
          👎
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.suggestion-card {
  background: var(--paqato-white);
  border: 1px solid var(--paqato-border);
  border-radius: 4px;
  padding: 12px;
}

.suggestion-card.rated {
  border-color: var(--paqato-success);
  background: #f6fbf9;
}

.suggestion-card.notice {
  border-color: #93c5fd;
  background: #eff6ff;
}

.notice-text {
  color: #1e40af;
}

.suggestion-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 3px;
  background: var(--paqato-background);
  color: var(--paqato-text-light);
}

.status-badge.high {
  background: #e6f5ed;
  color: var(--paqato-success);
}

.status-badge.medium {
  background: #fff8e6;
  color: var(--paqato-warning);
}

.status-badge.notice {
  background: #dbeafe;
  color: #1e40af;
}

.suggestion-time {
  font-size: 11px;
  color: var(--paqato-text-light);
}

.suggestion-text {
  font-size: 13px;
  line-height: 1.5;
  color: var(--paqato-text);
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.suggestion-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rating-buttons {
  display: flex;
  gap: 4px;
}

.btn-icon {
  background: transparent;
  border: 1px solid var(--paqato-border);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background: var(--paqato-background);
}

.btn-icon.active {
  background: var(--paqato-primary);
  border-color: var(--paqato-primary);
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
</style>
