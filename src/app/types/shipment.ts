// =============================================================================
// Shipment Types
// =============================================================================

export interface ShipmentState {
  scanTime: string
  state?: string
  event?: string
  location?: string
  city?: string
  country?: string
}

export interface Shipment {
  id: string
  trackingCode: string
  order: string
  name: string
  email: string
  street?: string
  zipCode?: string
  city?: string
  country?: string
  state: string
  states: ShipmentState[]
  trackingLink?: string
  paqatoLink: string
  carrierName: string
  carrierLogo: string
}

export interface ShipmentsPagination {
  currentPage: number
  maxPage: number
  perPage: number
  total: number
}

export interface ShipmentsResponse {
  data: Shipment[]
  meta: {
    pagination: ShipmentsPagination
  }
}
