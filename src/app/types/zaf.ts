// =============================================================================
// ZAF Client Types
// =============================================================================

export interface ZafRequestOptions {
  url: string
  type: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  secure?: boolean
  headers?: Record<string, string>
  contentType?: string
  data?: string
  dataType?: 'json' | 'text'
}

export interface ZafMetadata {
  settings: {
    token?: string
    paqato_ai_agent_enabled?: boolean
    paqato_shipment_history_enabled?: boolean
  }
}

export interface ZafContext {
  account: {
    subdomain: string
  }
}

export interface ZafRequester {
  email: string
}

export interface ZafTicketComment {
  author: {
    role: 'end-user' | 'agent' | 'admin'
  }
  value: string
}

export interface ZafClient {
  init(): ZafClient
  metadata(): Promise<ZafMetadata>
  context(): Promise<ZafContext>
  get<T = unknown>(path: string): Promise<Record<string, T>>
  set(path: string, value: unknown): Promise<void>
  request<T = unknown>(options: ZafRequestOptions): Promise<T>
  invoke(method: string, options?: Record<string, unknown>): Promise<void>
  on(event: string, callback: (data?: unknown) => void | boolean | Promise<boolean>): void
}

declare global {
  interface Window {
    ZAFClient: {
      init(): ZafClient
    }
  }
}
