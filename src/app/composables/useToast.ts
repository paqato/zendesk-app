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
const toastTimeouts = new Map<number, ReturnType<typeof setTimeout>>()

// =============================================================================
// Actions
// =============================================================================

export function useToast() {
  function showToast(message: string, type: ToastType = 'info'): void {
    const id = ++toastIdCounter
    toasts.value.push({ id, message, type })
    const timeoutId = setTimeout(() => removeToast(id), 3000)
    toastTimeouts.set(id, timeoutId)
  }

  function removeToast(id: number): void {
    const timeoutId = toastTimeouts.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      toastTimeouts.delete(id)
    }
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clearAllToasts(): void {
    toastTimeouts.forEach((timeoutId) => clearTimeout(timeoutId))
    toastTimeouts.clear()
    toasts.value = []
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
  }
}
