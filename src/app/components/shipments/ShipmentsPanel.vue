<script setup lang="ts">
import { inject } from 'vue'
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
  toast.showToast(t('shipments_refreshed'), 'success')
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
</script>

<template>
  <div class="panel">
    <div class="panel-content">
      <!-- Header -->
      <div class="shipment-history-header">
        <h3>{{ t('shipment_history') }}</h3>
        <button class="btn btn-small btn-secondary" :title="t('refresh')" @click="handleRefresh">
          ↻
        </button>
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

      <!-- Empty State -->
      <div v-else-if="shipments.shipments.value.length === 0" class="shipments-empty">
        <p>{{ t('no_shipments') }}</p>
      </div>

      <!-- Shipments List -->
      <template v-else>
        <div class="shipments-list">
          <ShipmentCard
            v-for="shipment in shipments.shipments.value"
            :key="shipment.id"
            :shipment="shipment"
            @show-history="handleShowHistory"
            @show-order-details="handleShowOrderDetails"
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

.shipment-history-header h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--paqato-text);
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

.btn-primary:hover {
  background-color: var(--paqato-primary-dark);
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
