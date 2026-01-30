<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
  preselectedRating?: number | null
}>()

const emit = defineEmits<{
  submit: [rating: number, feedback: string]
  cancel: []
}>()

const selectedRating = ref<number | null>(null)
const hoverRating = ref<number | null>(null)
const feedback = ref('')

// Sync preselectedRating when it changes
const displayedRating = computed(() => {
  if (hoverRating.value !== null) return hoverRating.value
  return selectedRating.value ?? props.preselectedRating ?? null
})

function handleSelectRating(rating: number): void {
  selectedRating.value = rating
}

function handleSubmit(): void {
  const rating = selectedRating.value ?? props.preselectedRating
  if (rating) {
    emit('submit', rating, feedback.value)
    resetForm()
  }
}

function handleCancel(): void {
  emit('cancel')
  resetForm()
}

function resetForm(): void {
  selectedRating.value = null
  hoverRating.value = null
  feedback.value = ''
}
</script>

<template>
  <div v-if="isOpen" class="modal" @click.self="handleCancel">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('rate') }}</h3>
        <button class="btn-close" @click="handleCancel">&times;</button>
      </div>
      <div class="modal-body">
        <div class="star-rating">
          <button
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ selected: displayedRating !== null && i <= displayedRating }"
            @mouseenter="hoverRating = i"
            @mouseleave="hoverRating = null"
            @click="handleSelectRating(i)"
          >
            ★
          </button>
        </div>
        <textarea
          v-model="feedback"
          class="feedback-textarea"
          rows="3"
          :placeholder="t('feedback_placeholder')"
        />
      </div>
      <div class="modal-footer modal-footer-vertical">
        <button class="btn btn-primary" @click="handleSubmit">
          {{ t('save') }}
        </button>
        <button class="btn-cancel-link" @click="handleCancel">
          {{ t('cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--paqato-white);
  border-radius: 8px;
  width: 90%;
  max-width: 320px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--paqato-border);
}

.modal-header h3 {
  font-size: 14px;
  font-weight: 600;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--paqato-text-light);
  line-height: 1;
}

.modal-body {
  padding: 16px;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.star-rating .star {
  font-size: 32px;
  color: var(--paqato-border);
  cursor: pointer;
  background: transparent;
  border: none;
  transition: color 0.2s;
}

.star-rating .star:hover,
.star-rating .star.selected {
  color: #f5a623;
}

.feedback-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--paqato-border);
  border-radius: 4px;
  font-size: 13px;
  resize: none;
  font-family: inherit;
}

.feedback-textarea:focus {
  outline: none;
  border-color: var(--paqato-primary);
}

.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--paqato-border);
}

.modal-footer-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.btn-cancel-link {
  background: transparent;
  border: none;
  color: var(--paqato-text-light);
  font-size: 13px;
  cursor: pointer;
}

.btn-cancel-link:hover {
  color: var(--paqato-text);
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

.btn-primary {
  background-color: var(--paqato-primary);
  color: var(--paqato-white);
}

.btn-primary:hover {
  background-color: var(--paqato-primary-dark);
}
</style>
