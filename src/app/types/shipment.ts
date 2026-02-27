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
  lineItemNumber?: string
  articleNumber?: string
  name?: string
  quantity?: number
  price?: string
  totalPrice?: string
  currency?: string
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
  shopToken?: string
  hasProofOfDelivery: boolean
  signatureIds: number[]
  estimatedDelivery: EstimatedDelivery | null
  orderDetails: OrderDetails | null
}

export interface FileDownloadResponse {
  data: string
  contentType: string
  filename: string
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
