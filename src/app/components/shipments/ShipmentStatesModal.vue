<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatScanDateTime, formatStateLocation, formatStateInfo } from '../../helpers'
import type { Shipment, ShipmentState } from '../../types'

const { t } = useI18n()

defineProps<{
  shipment: Shipment | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function getFormattedDateTime(state: ShipmentState): { date: string; time: string } {
  return formatScanDateTime(state.scanTime)
}

function getFormattedLocation(state: ShipmentState): string {
  return formatStateLocation(state)
}

function getFormattedInfo(state: ShipmentState): string {
  return formatStateInfo(state)
}

function handleClose(): void {
  emit('close')
}
</script>

<template>
  <div v-if="isOpen && shipment" class="modal" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('state_history') }}</h3>
        <button class="btn-close" @click="handleClose">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="!shipment.states?.length" class="no-states">
          {{ t('no_state_history') }}
        </div>
        <div v-else class="shipment-states-list">
          <div
            v-for="(state, index) in shipment.states"
            :key="index"
            class="state-item"
          >
            <div class="state-time">
              <span class="state-date">{{ getFormattedDateTime(state).date }}</span>
              <span class="state-time-value">{{ getFormattedDateTime(state).time }}</span>
            </div>
            <div class="state-info">
              <span class="state-status">{{ getFormattedInfo(state) }}</span>
              <span class="state-location">{{ getFormattedLocation(state) }}</span>
            </div>
          </div>
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

.no-states {
  text-align: center;
  color: var(--paqato-text-light);
  padding: 16px;
}

.shipment-states-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.state-item {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--paqato-border);
}

.state-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.state-time {
  flex-shrink: 0;
  width: 70px;
  text-align: right;
}

.state-date {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--paqato-text);
}

.state-time-value {
  display: block;
  font-size: 11px;
  color: var(--paqato-text-light);
}

.state-info {
  flex: 1;
}

.state-status {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--paqato-text);
  margin-bottom: 2px;
}

.state-location {
  display: block;
  font-size: 11px;
  color: var(--paqato-text-light);
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
