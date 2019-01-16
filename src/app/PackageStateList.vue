<template>
  <div>
    <div class="row u-mb-xs">
      <div class="col">
        <package-state :key="lastState.id" :state="lastState" />
      </div>
    </div>
    <div class="row u-mb-xs">
      <a class="col no-underline" href="#" @click.prevent="toggleShown">
        <strong>
          {{ __('State history') }}
        </strong>
        <span class="c-btn__icon">
          <chevron-down class="c-btn__icon" v-if="shown" />
          <chevron-right class="c-btn__icon" v-else />
        </span>
      </a>
    </div>
    <template v-if="shown">
      <package-state class="u-mb" v-for="state in previousStates" :key="state.id" :state="state" />
    </template>
  </div>
</template>

<script>
import PackageState from './PackageState'
import ChevronDown from '@zendeskgarden/svg-icons/src/12/chevron-down-fill.svg'
import ChevronRight from '@zendeskgarden/svg-icons/src/12/chevron-right-fill.svg'

export default {
  components: { PackageState, ChevronDown, ChevronRight },
  props: {
    states: Array
  },
  data () {
    return {
      shown: false
    }
  },
  methods: {
    toggleShown () {
      this.shown = !this.shown
    }
  },
  computed: {
    lastState () {
      return this.states[0]
    },
    previousStates () {
      return this.states.slice(1)
    }
  }
}
</script>

<style scoped>
.no-underline,
.no-underline:hover,
.no-underline:active {
  text-decoration: none;
}
</style>
