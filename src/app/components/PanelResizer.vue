<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

// =============================================================================
// State
// =============================================================================

const isDragging = ref(false)
const resizerEl = ref<HTMLElement | null>(null)

// =============================================================================
// Event Handlers
// =============================================================================

function handleMouseDown(event: MouseEvent): void {
  event.preventDefault()
  startDragging()
}

function handleTouchStart(event: TouchEvent): void {
  event.preventDefault()
  startDragging()
}

function startDragging(): void {
  isDragging.value = true
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
}

function stopDragging(): void {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

function handleMouseMove(event: MouseEvent): void {
  if (!isDragging.value) return
  resize(event.clientY)
}

function handleTouchMove(event: TouchEvent): void {
  if (!isDragging.value) return
  const touch = event.touches[0]
  resize(touch.clientY)
}

function handleMouseUp(): void {
  stopDragging()
}

function handleTouchEnd(): void {
  stopDragging()
}

function resize(clientY: number): void {
  if (!resizerEl.value) return

  const container = resizerEl.value.parentElement
  if (!container) return

  const panels = container.querySelectorAll('.panel')
  if (panels.length !== 2) {
    if (import.meta.env.DEV) {
      console.warn(`[PanelResizer] Expected 2 panels, found ${panels.length}`)
    }
    return
  }

  const topPanel = panels[0] as HTMLElement
  const bottomPanel = panels[1] as HTMLElement

  const containerRect = container.getBoundingClientRect()
  const resizerHeight = resizerEl.value.offsetHeight

  // Calculate new height for top panel
  let newTopHeight = clientY - containerRect.top - resizerHeight / 2

  // Apply constraints
  const minHeight = 100
  const maxHeight = containerRect.height - minHeight - resizerHeight

  newTopHeight = Math.max(minHeight, Math.min(maxHeight, newTopHeight))

  // Apply styles
  topPanel.style.flex = 'none'
  topPanel.style.height = `${newTopHeight}px`
  bottomPanel.style.flex = '1'

  // Mark container as resized
  container.classList.add('resized')
}

onUnmounted(() => {
  stopDragging()
})
</script>

<template>
  <div
    ref="resizerEl"
    class="panel-resizer"
    :class="{ dragging: isDragging }"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  />
</template>

<style scoped>
.panel-resizer {
  height: 6px;
  background: var(--paqato-border);
  cursor: row-resize;
  flex-shrink: 0;
  position: relative;
  transition: background 0.2s;
  margin: 10px 0;
}

.panel-resizer:hover,
.panel-resizer.dragging {
  background: var(--paqato-primary);
}

.panel-resizer::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 2px;
  background: var(--paqato-text-light);
  border-radius: 1px;
}

.panel-resizer:hover::after,
.panel-resizer.dragging::after {
  background: var(--paqato-white);
}
</style>
