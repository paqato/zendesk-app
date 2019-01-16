<template>
  <div class="row u-fs-sm">
    <div class="col-5">
      <span class="u-display-block">
        {{ scanDate }}
        <br />
        {{ scanTime }}
        <br />
        {{ location }}
      </span>
    </div>
    <div class="col-7">
      <span class="u-display-block" v-for="info in infoTexts">
        {{ info }}
      </span>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

const NO_EVENT_TEXT = 'kein Ereignis'

export default {
  props: {
    state: Object
  },
  data () {
    return {
      scanDateTime: moment(this.state.scanTime)
    }
  },
  computed: {
    scanDate () {
      return this.scanDateTime.format('DD.MM.YYYY')
    },
    scanTime () {
      return this.scanDateTime.format('HH:mm')
    },
    location () {
      if (this.state.city && this.state.country) {
        return this.state.city + ', ' + this.state.country
      }

      return this.state.city || this.state.country
    },
    infoTexts () {
      return [this.state.location, this.state.state, this.state.event === NO_EVENT_TEXT ? null : this.state.event].filter(e => !!e)
    }
  }
}
</script>
