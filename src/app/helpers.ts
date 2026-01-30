import type { ShipmentState } from './types'

// =============================================================================
// Constants
// =============================================================================

export const MONI_BASE_URL = 'https://moni.paqato.com'
export const PAQATO_API_BASE_URL = 'https://api.paqato.com'

export const POLLING_INTERVAL_MS = 10000
export const POLLING_TIMEOUT_MS = 90000

// =============================================================================
// Confidence Helpers
// =============================================================================

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export function getConfidenceClass(confidence: number): ConfidenceLevel {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.5) return 'medium'
  return 'low'
}

// =============================================================================
// Time Formatting
// =============================================================================

export interface TimeAgoParts {
  days: number
  hours: number
  minutes: number
}

export function getTimeAgoParts(dateString: string): TimeAgoParts {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  return {
    days: diffDays,
    hours: diffHours,
    minutes: diffMins,
  }
}

// =============================================================================
// Date Formatting
// =============================================================================

export interface ScanDateTime {
  date: string
  time: string
}

export function formatScanDateTime(isoString: string): ScanDateTime {
  if (!isoString) return { date: '-', time: '' }

  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return {
    date: `${day}.${month}.${year}`,
    time: `${hours}:${minutes}`,
  }
}

// =============================================================================
// Shipment State Formatting
// =============================================================================

export function formatStateLocation(state: ShipmentState): string {
  if (!state) return '-'
  const parts: string[] = []
  if (state.location && state.location !== 'Standort nicht bekannt') {
    parts.push(state.location)
  }
  if (state.city) parts.push(state.city)
  if (state.country) parts.push(state.country)
  return parts.join(', ') || '-'
}

export function formatStateInfo(state: ShipmentState): string {
  if (!state) return '-'
  const texts: string[] = []
  if (state.state) texts.push(state.state)
  if (state.event && state.event.toLowerCase() !== 'kein ereignis') {
    texts.push(state.event)
  }
  return texts.join(' - ') || '-'
}

// =============================================================================
// Text Helpers
// =============================================================================

export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Convert HTML to plain text using browser DOM API
 */
export function htmlToPlainText(html: string): string {
  const temp = document.createElement('div')
  temp.style.cssText = 'position:absolute;left:-9999px;'
  temp.innerHTML = html
  document.body.appendChild(temp)
  try {
    const text = temp.innerText
    // Reduce double newlines (from <p> tags) to single newlines
    return text.replace(/\n\n/g, '\n')
  } finally {
    document.body.removeChild(temp)
  }
}

// =============================================================================
// Locale Helpers
// =============================================================================

export type SupportedLocale = 'de' | 'en'

export function mapToSupportedLocale(locale: string): SupportedLocale {
  const normalizedLocale = locale.toLowerCase().split('-')[0]
  if (normalizedLocale === 'de') return 'de'
  return 'en'
}
