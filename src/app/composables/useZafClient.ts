import type {
  ZafClient,
  ZafMetadata,
  ZafContext,
  ZafRequestOptions,
  ZafRequester,
} from '../types'

// Singleton client instance - NICHT als Vue ref speichern!
// Vue refs werden zu Proxies, die Cross-Origin-Fehler mit dem ZAF SDK verursachen.
let client: ZafClient | null = null
let initialized = false

export function useZafClient() {
  /**
   * Initialize the ZAF client
   */
  function init(): ZafClient {
    if (client) return client

    client = window.ZAFClient.init()
    initialized = true
    return client
  }

  /**
   * Get the raw ZAF client instance
   */
  function getClient(): ZafClient {
    if (!client) {
      throw new Error('ZAF Client not initialized. Call init() first.')
    }
    return client
  }

  /**
   * Check if client is initialized
   */
  function isInitialized(): boolean {
    return initialized
  }

  /**
   * Get app metadata (settings, feature flags)
   */
  async function getMetadata(): Promise<ZafMetadata> {
    return getClient().metadata()
  }

  /**
   * Get account context (subdomain)
   */
  async function getContext(): Promise<ZafContext> {
    return getClient().context()
  }

  /**
   * Get current ticket ID
   */
  async function getTicketId(): Promise<number | null> {
    const data = await getClient().get<number>('ticket.id')
    return data['ticket.id'] ?? null
  }

  /**
   * Get requester email address
   */
  async function getRequesterEmail(): Promise<string | null> {
    const data = await getClient().get<ZafRequester>('ticket.requester')
    const requester = data['ticket.requester']
    return requester?.email ?? null
  }

  /**
   * Get current user's locale
   */
  async function getUserLocale(): Promise<string> {
    const data = await getClient().get<string>('currentUser.locale')
    return data['currentUser.locale'] ?? 'de'
  }

  /**
   * Escape HTML special characters in a text string.
   * This ensures that plain text is not interpreted as HTML when inserted into the comment.
   */
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;')
  }

  /**
   * Set the comment text in the ticket editor
   */
  async function setCommentText(text: string): Promise<void> {
    const escapedText = escapeHtml(text)
    const htmlText = escapedText.replace(/\n/g, '<br>')
    await getClient().set('comment.text', htmlText)
  }

  /**
   * Get the current comment text from the ticket editor
   */
  async function getCommentText(): Promise<string> {
    const data = await getClient().get<string>('comment.text')
    return data['comment.text'] ?? ''
  }

  /**
   * Get the ticket conversation (all comments)
   */
  async function getConversation(): Promise<Array<{ author?: { role?: string } }>> {
    const data = await getClient().get('ticket.conversation')
    return (data['ticket.conversation'] as Array<{ author?: { role?: string } }>) ?? []
  }

  /**
   * Make an API request through ZAF's secure proxy
   */
  async function request<T>(options: ZafRequestOptions): Promise<T> {
    return getClient().request<T>(options)
  }

  /**
   * Invoke a ZAF method (e.g., resize)
   */
  async function invoke(
    method: string,
    options?: Record<string, unknown>
  ): Promise<void> {
    await getClient().invoke(method, options)
  }

  /**
   * Register an event listener
   */
  function onEvent(
    event: string,
    callback: (data?: unknown) => void | boolean | Promise<boolean>
  ): void {
    getClient().on(event, callback)
  }

  return {
    init,
    getClient,
    isInitialized,
    getMetadata,
    getContext,
    getTicketId,
    getRequesterEmail,
    getUserLocale,
    setCommentText,
    getCommentText,
    getConversation,
    request,
    invoke,
    onEvent,
  }
}
