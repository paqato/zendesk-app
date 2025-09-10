<template>
  <div>
    <div class="row">
      <div class="col">
        <strong class="u-mr-xs">
          {{ p.trackingCode }}
        </strong>
        <br />
        {{ __('Order') }}:  {{ p.order }}
      </div>
      <div class="col u-ta-right">
        <div class="l-btn-group" style="font-size: 0;">
          <a v-if="p.trackingLink" class="c-btn c-btn--icon" :href="p.trackingLink" target="_blank" rel="noreferrer noopener">
            <img class="c-btn__icon" v-if="p.carrierLogo" :src="p.carrierLogo" :alt="p.carrierName" />
            <template v-else>
              {{ p.carrierName }}
            </template>
          </a>
          <a class="c-btn c-btn--icon" :href="p.paqatoLink" target="_blank" rel="noreferrer noopener">
            <img class="c-btn__icon" src="logo-small.png" alt="PAQATO" />
          </a>
        </div>
      </div>
    </div>
    <p class="c-callout__paragraph">
      {{ p.name }}
      <br />
      {{ p.street }}
      <br />
      {{ p.city }} {{ p.zipCode }}
      <br />
      {{ p.country }}
    </p>
    <div class="c-callout__paragraph">
      <package-state-list :states="p.states" />
    </div>
  </div>
</template>

<script>
import PackageStateList from './PackageStateList'

export default {
  name: 'PaqatoPackage',
  components: { PackageStateList },
  props: {
    p: Object
  }
}
</script>

<style scoped>
.c-btn__icon {
  width: 32px;
  height: auto;
}
</style>
