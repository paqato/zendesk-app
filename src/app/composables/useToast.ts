import { ref, type InjectionKey } from 'vue'
import type { Toast, ToastType } from '../types'

// =============================================================================
// Injection Key
// =============================================================================

export interface ToastContext {
  showToast: (message: string, type?: ToastType) => void
}

export const toastKey: InjectionKey<ToastContext> = Symbol('toast')

// =============================================================================
// State
// =============================================================================

const toasts = ref<Toast[]>([])
let toastIdCounter = 0

// =============================================================================
// Actions
// =============================================================================

export function useToast() {
  function showToast(message: string, type: ToastType = 'info'): void {
    const id = ++toastIdCounter
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), 3000)
  }

  function removeToast(id: number): void {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    showToast,
    removeToast,
  }
}
