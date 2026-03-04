<script setup lang="ts">
import { ref, inject, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { shipmentsKey } from '../../composables/useShipments'
import { toastKey } from '../../composables/useToast'
import type { Shipment } from '../../types'
import ShipmentCard from './ShipmentCard.vue'
import ShipmentStatesModal from './ShipmentStatesModal.vue'
import OrderDetailsModal from './OrderDetailsModal.vue'
import logoSmall from '@assets/logo-small.png'

const { t } = useI18n()

// =============================================================================
// Inject
// =============================================================================

const shipments = inject(shipmentsKey)!
const toast = inject(toastKey)!

// =============================================================================
// Local State
// =============================================================================

const searchInput = ref('')
const searchScope = ref<'email' | 'all'>('email')
const showInfoPopover = ref(false)

const requesterEmail = computed(() => shipments.getRequesterEmail())

const showMinCharsHint = computed(() => {
  return searchScope.value === 'all' && searchInput.value.length > 0 && searchInput.value.length < 4
})

const isSearchDisabled = computed(() => {
  if (searchScope.value === 'email') return false
  return searchInput.value.length < 4
})

const isEmailOptionDisabled = computed(() => {
  return shipments.emailSearchFailed.value
})

// =============================================================================
// Helpers
// =============================================================================

function getPageInfo(): string {
  const pagination = shipments.pagination.value
  if (!pagination) return ''
  return t('page_info', {
    current: pagination.currentPage,
    total: pagination.maxPage,
  })
}

// =============================================================================
// Event Handlers
// =============================================================================

async function handleRefresh(): Promise<void> {
  await shipments.refresh()
  if (!shipments.isApiKeyInvalid.value && !shipments.isNotLicensed.value) {
    toast.showToast(t('shipments_refreshed'), 'success')
  }
}

async function handleSearch(): Promise<void> {
  if (isSearchDisabled.value) return
  if (searchScope.value === 'email') {
    await shipments.searchWithEmail(searchInput.value)
  } else {
    await shipments.searchWithoutEmail(searchInput.value)
  }

  // After email search with 0 results, switch to "all"
  if (searchScope.value === 'email' && shipments.shipments.value.length === 0) {
    searchScope.value = 'all'
  }
}

function handleSearchKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

function handleClearSearchInput(): void {
  searchInput.value = ''
  shipments.clearSearch()
  if (!isEmailOptionDisabled.value && requesterEmail.value) {
    searchScope.value = 'email'
  }
}

function handleToggleInfoPopover(): void {
  showInfoPopover.value = !showInfoPopover.value
}

function handleClickOutsidePopover(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (!target.closest('.info-popover-container')) {
    showInfoPopover.value = false
  }
}

async function handlePrevious(): Promise<void> {
  await shipments.goToPreviousPage()
}

async function handleNext(): Promise<void> {
  await shipments.goToNextPage()
}

function handleShowHistory(shipment: Shipment): void {
  shipments.openStatesModal(shipment.id)
}

function handleCloseModal(): void {
  shipments.closeStatesModal()
}

function handleShowOrderDetails(shipment: Shipment): void {
  shipments.openOrderDetailsModal(shipment.id)
}

function handleCloseOrderDetailsModal(): void {
  shipments.closeOrderDetailsModal()
}

async function handleDownloadPod(shipment: Shipment): Promise<void> {
  try {
    await shipments.downloadPod(shipment)
  } catch {
    toast.showToast(t('download_error'), 'error')
  }
}

async function handleDownloadSignature(shipment: Shipment): Promise<void> {
  try {
    await shipments.downloadSignature(shipment, shipment.signatureIds[0])
  } catch {
    toast.showToast(t('download_error'), 'error')
  }
}

// =============================================================================
// Lifecycle
// =============================================================================

onMounted(() => {
  document.addEventListener('click', handleClickOutsidePopover)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsidePopover)
})
</script>

<template>
  <div class="panel">
    <div class="panel-content">
      <!-- Header -->
      <div class="shipment-history-header">
        <div class="header-left">
          <h3>{{ t('shipment_history') }}</h3>
          <div class="info-popover-container">
            <button class="btn-icon info-btn" :title="t('search_info_title')" @click="handleToggleInfoPopover">
              &#9432;
            </button>
            <div v-if="showInfoPopover" class="info-popover">
              <div class="info-popover-title">{{ t('search_info_title') }}</div>
              <p>{{ t('search_info_text') }}</p>
            </div>
          </div>
        </div>
        <button class="btn btn-small btn-secondary" :title="t('refresh')" @click="handleRefresh">
          ↻
        </button>
      </div>

      <!-- Search Bar (visible after initial load completes) -->
      <div v-if="shipments.hasSearched.value || shipments.emailSearchFailed.value" class="search-bar">
        <div class="search-row">
          <select
            v-if="requesterEmail"
            v-model="searchScope"
            class="search-scope-select"
          >
            <option value="email" :disabled="isEmailOptionDisabled" :title="isEmailOptionDisabled ? t('search_scope_email_disabled') : ''">
              ✉ {{ requesterEmail }}
            </option>
            <option value="all">{{ t('search_scope_all') }}</option>
          </select>
          <div class="search-input-wrapper">
            <input
              v-model="searchInput"
              type="text"
              class="search-input"
              :placeholder="t('search_placeholder')"
              @keydown="handleSearchKeydown"
            />
            <button v-if="searchInput.length > 0" class="btn-icon clear-btn" @click="handleClearSearchInput">
              ✕
            </button>
          </div>
          <button
            class="btn btn-primary search-action-btn"
            :disabled="isSearchDisabled"
            @click="handleSearch"
          >
            {{ t('search_action') }}
          </button>
        </div>

        <!-- Min chars hint -->
        <div v-if="showMinCharsHint" class="search-hint warn">
          {{ t('search_min_chars') }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="shipments.isLoading.value" class="shipments-loading">
        <div class="spinner-small" />
        <span>{{ t('shipments_loading') }}</span>
      </div>

      <!-- Not Licensed State (403) -->
      <div v-else-if="shipments.isNotLicensed.value" class="info-container-small">
        <div class="info-icon-small locked">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h4>{{ t('shipment_not_licensed_title') }}</h4>
        <p>{{ t('shipment_not_licensed_message') }}</p>
        <a href="https://www.paqato.com" target="_blank" class="btn btn-small btn-primary btn-with-logo">
          <img :src="logoSmall" alt="PAQATO" class="btn-logo" />
          {{ t('feature_purchase') }}
        </a>
      </div>

      <!-- Empty State: Email search failed -->
      <div v-else-if="shipments.emailSearchFailed.value && shipments.shipments.value.length === 0 && !shipments.searchTerm.value" class="shipments-empty">
        <p>{{ t('no_shipments_for_email', { email: requesterEmail }) }}</p>
        <p class="search-hint">{{ t('search_hint') }}</p>
      </div>

      <!-- Empty State: Search returned no results -->
      <div v-else-if="shipments.hasSearched.value && shipments.shipments.value.length === 0 && shipments.searchTerm.value" class="shipments-empty">
        <p>{{ t('no_shipments_for_search', { search: shipments.searchTerm.value }) }}</p>
      </div>

      <!-- Empty State: Generic (before any search, or no email) -->
      <div v-else-if="shipments.shipments.value.length === 0 && !shipments.isLoading.value && shipments.hasSearched.value" class="shipments-empty">
        <p>{{ t('no_shipments') }}</p>
      </div>

      <!-- Shipments List -->
      <template v-if="shipments.shipments.value.length > 0">
        <div class="shipments-list">
          <ShipmentCard
            v-for="shipment in shipments.shipments.value"
            :key="shipment.id"
            :shipment="shipment"
            :is-downloading-pod="shipments.downloadingPod.value === shipment.id"
            :is-downloading-signature="shipments.downloadingSignature.value === shipment.id"
            @show-history="handleShowHistory"
            @show-order-details="handleShowOrderDetails"
            @download-pod="handleDownloadPod"
            @download-signature="handleDownloadSignature"
          />
        </div>

        <!-- Pagination -->
        <div v-if="shipments.hasPagination.value" class="shipments-pagination">
          <button
            class="btn btn-small btn-secondary"
            :disabled="!shipments.canGoPrevious.value"
            @click="handlePrevious"
          >
            {{ t('previous') }}
          </button>
          <span class="page-info">{{ getPageInfo() }}</span>
          <button
            class="btn btn-small btn-secondary"
            :disabled="!shipments.canGoNext.value"
            @click="handleNext"
          >
            {{ t('next') }}
          </button>
        </div>
      </template>
    </div>

    <!-- States Modal -->
    <ShipmentStatesModal
      :shipment="shipments.selectedShipment.value"
      :is-open="shipments.selectedShipment.value !== null"
      @close="handleCloseModal"
    />

    <!-- Order Details Modal -->
    <OrderDetailsModal
      :shipment="shipments.selectedOrderShipment.value"
      :is-open="shipments.selectedOrderShipment.value !== null"
      @close="handleCloseOrderDetailsModal"
    />
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.panel-content {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.shipment-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shipment-history-header h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--paqato-text);
}

/* Info Popover */
.info-popover-container {
  position: relative;
}

.info-btn {
  font-size: 14px;
  color: var(--paqato-text-light);
  cursor: pointer;
  line-height: 1;
}

.info-popover {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 100;
  width: 260px;
  padding: 10px 12px;
  margin-top: 4px;
  background: var(--paqato-white);
  border: 1px solid var(--paqato-border);
  border-radius: 6px;
  box-shadow: var(--paqato-shadow);
  font-size: 12px;
  color: var(--paqato-text);
  line-height: 1.5;
}

.info-popover-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 12px;
}

.info-popover p {
  margin: 0;
  color: var(--paqato-text-light);
}

/* Search Bar */
.search-bar {
  margin-bottom: 8px;
}

.search-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.search-scope-select {
  padding: 7px 8px;
  border: 1px solid var(--paqato-border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--paqato-text);
  background: var(--paqato-white);
  outline: none;
  cursor: pointer;
  max-width: 140px;
  text-overflow: ellipsis;
  transition: border-color 0.2s;
}

.search-scope-select:focus {
  border-color: var(--paqato-primary);
}

.search-scope-select option:disabled {
  color: var(--paqato-text-light);
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 7px 28px 7px 10px;
  border: 1px solid var(--paqato-border);
  border-radius: 6px;
  font-size: 13px;
  color: var(--paqato-text);
  background: var(--paqato-white);
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--paqato-primary);
}

.search-input::placeholder {
  color: var(--paqato-text-light);
}

.clear-btn {
  position: absolute;
  right: 4px;
  font-size: 10px;
  color: var(--paqato-text-light);
  cursor: pointer;
  padding: 2px 4px;
}

.clear-btn:hover {
  color: var(--paqato-text);
}

.search-action-btn {
  white-space: nowrap;
  padding: 7px 12px;
  font-size: 13px;
  border-radius: 6px;
}

/* Search Hint */
.search-hint {
  font-size: 11px;
  color: var(--paqato-text-light);
  margin-top: 4px;
}

.search-hint.warn {
  color: var(--paqato-warning);
}

.btn-icon {
  background: none;
  border: none;
  padding: 0;
  line-height: 1;
}

/* Loading State */
.shipments-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  color: var(--paqato-text-light);
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--paqato-border);
  border-top-color: var(--paqato-warning);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Info Container */
.info-container-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  text-align: center;
}

.info-icon-small {
  color: var(--paqato-text-light);
  margin-bottom: 8px;
}

.info-icon-small.locked {
  color: var(--paqato-warning);
}

.info-container-small h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.info-container-small p {
  color: var(--paqato-text-light);
  font-size: 12px;
  margin-bottom: 12px;
}

/* Empty State */
.shipments-empty {
  padding: 16px 12px;
  text-align: center;
  color: var(--paqato-text-light);
}

/* Shipments List */
.shipments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

/* Pagination */
.shipments-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid var(--paqato-border);
}

.page-info {
  font-size: 12px;
  color: var(--paqato-text-light);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary {
  background-color: var(--paqato-primary);
  color: var(--paqato-white);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--paqato-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-with-logo {
  gap: 6px;
}

.btn-logo {
  height: 14px;
  width: auto;
}

.btn-secondary {
  background-color: var(--paqato-white);
  color: var(--paqato-text);
  border: 1px solid var(--paqato-border);
}

.btn-secondary:hover {
  background-color: var(--paqato-background);
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
