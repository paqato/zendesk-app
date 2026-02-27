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

export interface EstimatedDelivery {
  date: string
  timeFrom: string
  timeTo: string
}

export interface OrderItem {
  productName?: string
  sku?: string
  quantity?: number
}

export interface OrderDetails {
  orderNumber: string
  orderDate: string
  totalPrice: number | null
  currency: string | null
  paqatoOrderLink: string
  items: OrderItem[]
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
  portalLink?: string
  podLink: string | null
  signatureLinks: string[]
  estimatedDelivery: EstimatedDelivery | null
  orderDetails: OrderDetails | null
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
