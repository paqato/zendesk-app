import { ref, computed, type InjectionKey } from 'vue'
import { useZafClient } from './useZafClient'
import { PAQATO_API_BASE_URL } from '../helpers'
import type {
  Shipment,
  ShipmentsPagination,
  ShipmentsResponse,
  FileDownloadResponse,
  ApiError,
} from '../types'

// =============================================================================
// Injection Key
// =============================================================================

export type ShipmentsContext = ReturnType<typeof useShipments>
export const shipmentsKey: InjectionKey<ShipmentsContext> = Symbol('shipments')

// =============================================================================
// State
// =============================================================================

const shipments = ref<Shipment[]>([])
const pagination = ref<ShipmentsPagination | null>(null)
const currentPage = ref(1)
const isLoading = ref(false)
const isNotLicensed = ref(false)
const isApiKeyInvalid = ref(false)

// Search state
const searchTerm = ref('')
const useEmailFilter = ref(true)
const emailSearchFailed = ref(false)
const hasSearched = ref(false)

// Modal state
const selectedShipmentId = ref<string | null>(null)
const selectedOrderShipmentId = ref<string | null>(null)

// Download state
const downloadingPod = ref<string | null>(null)
const downloadingSignature = ref<string | null>(null)

// Context
let requesterEmail: string | null = null

export function useShipments() {
  const { request } = useZafClient()

  // =============================================================================
  // Computed
  // =============================================================================

  const selectedShipment = computed(() => {
    if (!selectedShipmentId.value) return null
    return (
      shipments.value.find((s) => s.id === selectedShipmentId.value) ?? null
    )
  })

  const selectedOrderShipment = computed(() => {
    if (!selectedOrderShipmentId.value) return null
    return (
      shipments.value.find((s) => s.id === selectedOrderShipmentId.value) ?? null
    )
  })

  const hasPagination = computed(() => {
    return pagination.value !== null && pagination.value.maxPage > 1
  })

  const canGoPrevious = computed(() => {
    return currentPage.value > 1
  })

  const canGoNext = computed(() => {
    return pagination.value !== null && currentPage.value < pagination.value.maxPage
  })

  // =============================================================================
  // API Methods
  // =============================================================================

  async function searchShipments(
    page: number,
    pageSize = 5,
    options?: { email?: string; search?: string }
  ): Promise<ShipmentsResponse> {
    let url =
      `${PAQATO_API_BASE_URL}/v3/shipments/search?` +
      `token={{setting.token}}` +
      `&page=${page}` +
      `&pageSize=${pageSize}`

    if (options?.email) {
      url += `&email=${encodeURIComponent(options.email)}`
    }
    if (options?.search) {
      url += `&search=${encodeURIComponent(options.search)}`
    }

    return request<ShipmentsResponse>({
      url,
      type: 'GET',
      secure: true,
      headers: {
        'paqato-system-name': 'zendesk',
        'paqato-system-version': '1',
        'paqato-plugin-version': '2.1',
      },
    })
  }

  // =============================================================================
  // Load
  // =============================================================================

  async function load(page = 1): Promise<void> {
    const email = useEmailFilter.value ? requesterEmail : null
    const search = searchTerm.value.length >= 4 ? searchTerm.value : undefined

    if (!email && !search) {
      shipments.value = []
      return
    }

    isLoading.value = true
    currentPage.value = page

    try {
      const response = await searchShipments(page, 5, {
        email: email || undefined,
        search,
      })
      shipments.value = response.data || []
      pagination.value = response.meta?.pagination || null
      isNotLicensed.value = false
      isApiKeyInvalid.value = false
    } catch (error) {
      const apiError = error as ApiError
      console.error('Load shipments error:', error)

      if (apiError.status === 401) {
        isApiKeyInvalid.value = true
        shipments.value = []
      } else if (apiError.status === 403) {
        isNotLicensed.value = true
        shipments.value = []
      } else {
        shipments.value = []
      }
    } finally {
      isLoading.value = false
      hasSearched.value = true
    }
  }

  async function initialLoad(): Promise<void> {
    await load(1)

    // If email search returned no results, disable email filter for future searches
    if (shipments.value.length === 0 && useEmailFilter.value && requesterEmail) {
      emailSearchFailed.value = true
      useEmailFilter.value = false
    }
  }

  async function searchWithEmail(term: string): Promise<void> {
    useEmailFilter.value = true
    searchTerm.value = term
    await load(1)
  }

  async function searchWithoutEmail(term: string): Promise<void> {
    useEmailFilter.value = false
    searchTerm.value = term
    await load(1)
  }

  function clearSearch(): void {
    searchTerm.value = ''
  }

  async function refresh(): Promise<void> {
    await load(currentPage.value)
  }

  async function goToPreviousPage(): Promise<void> {
    if (canGoPrevious.value) {
      await load(currentPage.value - 1)
    }
  }

  async function goToNextPage(): Promise<void> {
    if (canGoNext.value) {
      await load(currentPage.value + 1)
    }
  }

  // =============================================================================
  // Modal
  // =============================================================================

  function openStatesModal(shipmentId: string): void {
    selectedShipmentId.value = shipmentId
  }

  function closeStatesModal(): void {
    selectedShipmentId.value = null
  }

  function openOrderDetailsModal(shipmentId: string): void {
    selectedOrderShipmentId.value = shipmentId
  }

  function closeOrderDetailsModal(): void {
    selectedOrderShipmentId.value = null
  }

  // =============================================================================
  // Downloads
  // =============================================================================

  async function downloadFile(url: string, fallbackFilename: string): Promise<void> {
    const response = await request<FileDownloadResponse>({
      url,
      type: 'GET',
      secure: true,
      dataType: 'json',
      headers: {
        'paqato-system-name': 'zendesk',
        'paqato-system-version': '1',
        'paqato-plugin-version': '2.1',
      },
    })

    const byteCharacters = atob(response.data)
    const byteNumbers = new Uint8Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const blob = new Blob([byteNumbers], { type: response.contentType })

    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = response.filename || fallbackFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  }

  async function downloadPod(shipment: Shipment): Promise<void> {
    const shopTokenParam = shipment.shopToken
      ? `&shopToken=${encodeURIComponent(shipment.shopToken)}`
      : ''
    const url =
      `${PAQATO_API_BASE_URL}/v3/shipments/${encodeURIComponent(shipment.order)}/${encodeURIComponent(shipment.trackingCode)}/pod?` +
      `format=base64` +
      `&token={{setting.token}}` +
      shopTokenParam

    downloadingPod.value = shipment.id
    try {
      await downloadFile(url, `pod-${shipment.id}.pdf`)
    } finally {
      downloadingPod.value = null
    }
  }

  async function downloadSignature(shipment: Shipment, signatureId: number): Promise<void> {
    const shopTokenParam = shipment.shopToken
      ? `&shopToken=${encodeURIComponent(shipment.shopToken)}`
      : ''
    const url =
      `${PAQATO_API_BASE_URL}/v3/shipments/${encodeURIComponent(shipment.order)}/${encodeURIComponent(shipment.trackingCode)}/signatures/${signatureId}?` +
      `format=base64` +
      `&token={{setting.token}}` +
      shopTokenParam

    downloadingSignature.value = shipment.id
    try {
      await downloadFile(url, `signature-${signatureId}.pdf`)
    } finally {
      downloadingSignature.value = null
    }
  }

  // =============================================================================
  // Initialize
  // =============================================================================

  function initialize(email: string): void {
    requesterEmail = email
  }

  function getRequesterEmail(): string | null {
    return requesterEmail
  }

  function cleanup(): void {
    shipments.value = []
    pagination.value = null
    currentPage.value = 1
    isLoading.value = false
    isNotLicensed.value = false
    isApiKeyInvalid.value = false
    selectedShipmentId.value = null
    selectedOrderShipmentId.value = null
    searchTerm.value = ''
    useEmailFilter.value = true
    emailSearchFailed.value = false
    hasSearched.value = false
  }

  return {
    // State
    shipments,
    pagination,
    currentPage,
    isLoading,
    isNotLicensed,
    isApiKeyInvalid,
    selectedShipmentId,
    selectedOrderShipmentId,
    downloadingPod,
    downloadingSignature,
    searchTerm,
    useEmailFilter,
    emailSearchFailed,
    hasSearched,

    // Computed
    selectedShipment,
    selectedOrderShipment,
    hasPagination,
    canGoPrevious,
    canGoNext,

    // Methods
    initialize,
    getRequesterEmail,
    cleanup,
    load,
    initialLoad,
    searchWithEmail,
    searchWithoutEmail,
    clearSearch,
    refresh,
    goToPreviousPage,
    goToNextPage,
    openStatesModal,
    closeStatesModal,
    openOrderDetailsModal,
    closeOrderDetailsModal,
    downloadPod,
    downloadSignature,
  }
}
