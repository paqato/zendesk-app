<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatScanDateTime } from '../../helpers'
import type { Shipment } from '../../types'

const { t } = useI18n()

const props = defineProps<{
  shipment: Shipment | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const orderDetails = computed(() => props.shipment?.orderDetails ?? null)

const formattedOrderDate = computed(() => {
  if (!orderDetails.value?.orderDate) return null
  return formatScanDateTime(orderDetails.value.orderDate)
})

const formattedTotalPrice = computed(() => {
  if (!orderDetails.value || orderDetails.value.totalPrice === null) return null
  const price = orderDetails.value.totalPrice
  const currency = orderDetails.value.currency || ''
  return `${price.toFixed(2)} ${currency}`.trim()
})

function handleClose(): void {
  emit('close')
}
</script>

<template>
  <div v-if="isOpen && shipment && orderDetails" class="modal" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('order_details') }}</h3>
        <button class="btn-close" @click="handleClose">&times;</button>
      </div>
      <div class="modal-body">
        <!-- Order Number -->
        <div class="detail-row">
          <span class="detail-label">{{ t('order_number') }}</span>
          <a
            v-if="orderDetails.paqatoOrderLink"
            :href="orderDetails.paqatoOrderLink"
            target="_blank"
            class="detail-value detail-link"
          >{{ orderDetails.orderNumber }}</a>
          <span v-else class="detail-value">{{ orderDetails.orderNumber }}</span>
        </div>

        <!-- Order Date -->
        <div v-if="formattedOrderDate" class="detail-row">
          <span class="detail-label">{{ t('order_date') }}</span>
          <span class="detail-value">{{ formattedOrderDate.date }} {{ formattedOrderDate.time }}</span>
        </div>

        <!-- Articles -->
        <div v-if="orderDetails.items && orderDetails.items.length > 0" class="detail-section">
          <span class="detail-label">{{ t('articles') }}</span>
          <table class="articles-table">
            <thead>
              <tr>
                <th>{{ t('product_name') }}</th>
                <th>{{ t('sku') }}</th>
                <th>{{ t('quantity') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in orderDetails.items" :key="index">
                <td>{{ item.productName || '-' }}</td>
                <td>{{ item.sku || '-' }}</td>
                <td>{{ item.quantity ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="detail-section">
          <span class="detail-label">{{ t('articles') }}</span>
          <span class="detail-value no-data">{{ t('no_articles') }}</span>
        </div>

        <!-- Total Amount -->
        <div v-if="formattedTotalPrice" class="detail-row">
          <span class="detail-label">{{ t('total_amount') }}</span>
          <span class="detail-value">{{ formattedTotalPrice }}</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="handleClose">
          {{ t('close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--paqato-white);
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--paqato-border);
}

.modal-header h3 {
  font-size: 14px;
  font-weight: 600;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--paqato-text-light);
  line-height: 1;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--paqato-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 12px;
  color: var(--paqato-text-light);
  font-weight: 500;
}

.detail-value {
  font-size: 12px;
  color: var(--paqato-text);
  font-weight: 500;
}

.detail-link {
  color: var(--paqato-primary);
  text-decoration: none;
}

.detail-link:hover {
  text-decoration: underline;
}

.detail-section {
  padding: 8px 0;
  border-bottom: 1px solid var(--paqato-border);
}

.detail-section:last-child {
  border-bottom: none;
}

.no-data {
  display: block;
  margin-top: 4px;
  color: var(--paqato-text-light);
  font-style: italic;
}

.articles-table {
  width: 100%;
  margin-top: 8px;
  border-collapse: collapse;
  font-size: 11px;
}

.articles-table th {
  text-align: left;
  padding: 4px 8px 4px 0;
  color: var(--paqato-text-light);
  font-weight: 500;
  border-bottom: 1px solid var(--paqato-border);
}

.articles-table td {
  padding: 4px 8px 4px 0;
  color: var(--paqato-text);
  border-bottom: 1px solid var(--paqato-border);
}

.articles-table tr:last-child td {
  border-bottom: none;
}

.modal-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--paqato-border);
  display: flex;
  justify-content: flex-end;
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

.btn-primary {
  background-color: var(--paqato-primary);
  color: var(--paqato-white);
}

.btn-primary:hover {
  background-color: var(--paqato-primary-dark);
}
</style>
