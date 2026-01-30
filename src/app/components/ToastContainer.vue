<script setup lang="ts">
import type { Toast } from '../types'

defineProps<{
  toasts: Toast[]
}>()
</script>

<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="toast.type"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 12px;
  left: 12px;
  right: 12px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: var(--paqato-shadow);
  animation: slideIn 0.3s ease;
}

.toast.success {
  background-color: #e6f5ed;
  color: var(--paqato-success);
  border: 1px solid #a8d5c2;
}

.toast.error {
  background-color: #fbe9eb;
  color: var(--paqato-error);
  border: 1px solid #f5b5bb;
}

.toast.info {
  background-color: #e6f1f9;
  color: var(--paqato-primary);
  border: 1px solid #a8c8e1;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
