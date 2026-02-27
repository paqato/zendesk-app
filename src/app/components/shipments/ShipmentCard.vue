<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatScanDateTime, formatStateInfo } from '../../helpers'
import type { Shipment } from '../../types'
import logoSmall from '@assets/logo-small.png'

const { t } = useI18n()

const props = defineProps<{
  shipment: Shipment
  isDownloadingPod?: boolean
  isDownloadingSignature?: boolean
}>()

const emit = defineEmits<{
  'show-history': [shipment: Shipment]
  'show-order-details': [shipment: Shipment]
  'download-pod': [shipment: Shipment]
  'download-signature': [shipment: Shipment]
}>()

// Build address string
const addressLines = computed(() => {
  const lines: string[] = []
  if (props.shipment.name) lines.push(props.shipment.name)
  if (props.shipment.street) lines.push(props.shipment.street)

  let cityLine = ''
  if (props.shipment.zipCode) cityLine += props.shipment.zipCode + ' '
  if (props.shipment.city) cityLine += props.shipment.city
  if (props.shipment.country) cityLine += ', ' + props.shipment.country
  if (cityLine.trim()) lines.push(cityLine.trim())

  return lines
})

// Current state from states[0]
const currentState = computed(() => {
  if (!props.shipment.states || props.shipment.states.length === 0) {
    return null
  }
  return props.shipment.states[0]
})

const currentStateDateTime = computed(() => {
  if (!currentState.value) return null
  return formatScanDateTime(currentState.value.scanTime)
})

const currentStateInfo = computed(() => {
  if (!currentState.value) return props.shipment.state || '-'
  return formatStateInfo(currentState.value)
})

const formattedEstimatedDelivery = computed(() => {
  const ed = props.shipment.estimatedDelivery
  if (!ed) return null
  const { date } = formatScanDateTime(ed.date)
  let result = date
  if (ed.timeFrom && ed.timeTo) {
    result += ` ${ed.timeFrom} - ${ed.timeTo}`
  } else if (ed.timeFrom) {
    result += ` ${ed.timeFrom}`
  }
  return result
})

const hasOrderDetails = computed(() => {
  return props.shipment.orderDetails !== null
})
</script>

<template>
  <div class="shipment-card">
    <!-- Header: Tracking + Order + Links -->
    <div class="shipment-header">
      <div class="shipment-header-left">
        <a
          v-if="shipment.paqatoLink"
          :href="shipment.paqatoLink"
          target="_blank"
          class="shipment-tracking shipment-tracking-link"
        >
          {{ shipment.trackingCode }}
        </a>
        <div v-else class="shipment-tracking">{{ shipment.trackingCode }}</div>
        <div class="shipment-order">
          {{ t('order') }}:
          <a
            v-if="hasOrderDetails"
            href="#"
            class="order-link"
            @click.prevent="emit('show-order-details', shipment)"
          >{{ shipment.order || '-' }}</a>
          <span v-else>{{ shipment.order || '-' }}</span>
        </div>
      </div>
      <div class="shipment-links">
        <a
          v-if="shipment.trackingLink"
          :href="shipment.trackingLink"
          target="_blank"
          class="shipment-link"
          :title="shipment.carrierName || 'Carrier'"
        >
          <img
            v-if="shipment.carrierLogo"
            :src="shipment.carrierLogo"
            :alt="shipment.carrierName"
            class="carrier-logo"
          />
          <span v-else>{{ shipment.carrierName || 'Tracking' }}</span>
        </a>
        <a
          v-if="shipment.paqatoLink"
          :href="shipment.paqatoLink"
          target="_blank"
          class="shipment-link"
          title="PAQATO"
        >
          <img :src="logoSmall" alt="PAQATO" class="paqato-logo" />
        </a>
      </div>
    </div>

    <!-- Address -->
    <div v-if="addressLines.length > 0" class="shipment-address">
      <div v-for="(line, index) in addressLines" :key="index">{{ line }}</div>
    </div>

    <!-- Current Status -->
    <div class="shipment-status">
      <div v-if="currentState && currentStateDateTime" class="shipment-state-row">
        <div class="shipment-state-left">
          <div>{{ currentStateDateTime.date }}</div>
          <div>{{ currentStateDateTime.time }}</div>
          <div v-if="currentState.country">{{ currentState.country }}</div>
        </div>
        <div class="shipment-state-right">
          <div v-if="currentState.city">{{ currentState.city }}</div>
          <div>{{ currentStateInfo }}</div>
        </div>
      </div>
      <div v-else class="shipment-state-simple">
        <strong>{{ shipment.state }}</strong>
      </div>
    </div>

    <!-- Show History Link -->
    <a
      v-if="shipment.states && shipment.states.length > 0"
      href="#"
      class="history-link"
      @click.prevent="emit('show-history', shipment)"
    >{{ t('show_state_history') }}</a>

    <!-- Estimated Delivery -->
    <div v-if="formattedEstimatedDelivery" class="shipment-estimated-delivery">
      {{ t('estimated_delivery') }}: {{ formattedEstimatedDelivery }}
    </div>

    <!-- Action Buttons -->
    <hr class="shipment-divider" />
    <div class="shipment-actions">
      <button
        v-if="shipment.hasProofOfDelivery"
        class="btn btn-small btn-secondary"
        :disabled="isDownloadingPod"
        @click="emit('download-pod', shipment)"
      >
        <span v-if="isDownloadingPod" class="spinner-inline" />
        {{ t('pod_download') }}
      </button>
      <button v-else class="btn btn-small btn-secondary" disabled :title="t('not_available')">
        {{ t('pod_download') }}
      </button>

      <button
        v-if="shipment.signatureIds && shipment.signatureIds.length > 0"
        class="btn btn-small btn-secondary"
        :disabled="isDownloadingSignature"
        @click="emit('download-signature', shipment)"
      >
        <span v-if="isDownloadingSignature" class="spinner-inline" />
        {{ t('signature_download') }}
      </button>
      <button v-else class="btn btn-small btn-secondary" disabled :title="t('not_available')">
        {{ t('signature_download') }}
      </button>

      <a
        v-if="shipment.portalLink"
        :href="shipment.portalLink"
        target="_blank"
        class="btn btn-small btn-secondary"
      >{{ t('carrier_reroute') }}</a>
      <button v-else class="btn btn-small btn-secondary" disabled :title="t('not_available')">
        {{ t('carrier_reroute') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.shipment-card {
  background: var(--paqato-white);
  border: 1px solid var(--paqato-border);
  border-radius: 4px;
  padding: 12px;
}

/* Header */
.shipment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--paqato-border);
}

.shipment-header-left {
  flex: 1;
}

.shipment-tracking {
  font-size: 12px;
  font-family: monospace;
  color: var(--paqato-text);
  font-weight: 600;
}

.shipment-tracking-link {
  color: var(--paqato-primary);
  text-decoration: none;
}

.shipment-tracking-link:hover {
  text-decoration: underline;
}

.shipment-order {
  font-size: 11px;
  color: var(--paqato-text-light);
  margin-top: 2px;
}

.order-link {
  color: var(--paqato-primary);
  text-decoration: none;
  cursor: pointer;
}

.order-link:hover {
  text-decoration: underline;
}

.shipment-links {
  display: flex;
  gap: 8px;
  align-items: center;
}

.shipment-link {
  display: flex;
  align-items: center;
}

.carrier-logo,
.paqato-logo {
  height: 20px;
  width: auto;
}

/* Address */
.shipment-address {
  font-size: 12px;
  color: var(--paqato-text);
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--paqato-border);
  line-height: 1.4;
}

/* Status */
.shipment-status {
  margin-bottom: 8px;
}

.shipment-state-row {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.shipment-state-left {
  color: var(--paqato-text-light);
  min-width: 70px;
  line-height: 1.4;
}

.shipment-state-right {
  color: var(--paqato-text);
  flex: 1;
  line-height: 1.4;
}

.shipment-state-simple {
  font-size: 12px;
  color: var(--paqato-text);
}

/* Estimated Delivery */
.shipment-estimated-delivery {
  font-size: 11px;
  color: var(--paqato-text-light);
  margin-bottom: 8px;
}

/* History Link */
.history-link {
  display: inline-block;
  font-size: 11px;
  color: var(--paqato-primary);
  text-decoration: none;
  cursor: pointer;
  margin-bottom: 8px;
}

.history-link:hover {
  text-decoration: underline;
}

/* Divider */
.shipment-divider {
  border: none;
  border-top: 1px solid var(--paqato-border);
  margin: 0 0 8px 0;
}

/* Action Buttons */
.shipment-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

a.btn {
  text-decoration: none;
}

.spinner-inline {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid var(--paqato-border);
  border-top-color: var(--paqato-warning);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
