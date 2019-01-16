<template>
  <div id="app" class="container-fluid">
    <div class="row u-mt-xs">
      <div class="col">
        <strong class="u-fs-md u-mt-sm d-block">
          {{ __('Most recent orders') }}
        </strong>
      </div>
    </div>
    <template v-if="packages.length > 0">
      <paqato-package v-for="p in packages" :key="p.id" :p="p" class="c-callout c-callout--recessed u-mt-xs u-mb-sm u-p-xs" />
    </template>
    <div v-else-if="!loading" class="c-callout c-callout--warning u-mt-xs">
      <strong class="c-callout__title">
        {{ __('No orders found') }}
      </strong>
    </div>
    <div v-else class="c-callout u-mt-xs">
      <strong class="c-callout__title">
        {{ __('Loading...') }}
      </strong>
    </div>
  </div>
</template>

<script>
import { ZendeskClient } from 'paqato-api-client/zendesk'
import { Api } from 'paqato-api-client/api'
import PaqatoPackage from './Package'

const TOKEN_PLACEHOLDER = '{{setting.token}}'

export default {
  components: { PaqatoPackage },
  data: () => {
    return {
      email: null,
      loading: true,
      packages: []
    }
  },
  created () {
    this.$client.invoke('resize', { width: '100%', height: '60vh' })
    this.api = new Api(new ZendeskClient(this.$client, TOKEN_PLACEHOLDER)) // Prod
    /*
    this.$client.metadata().then(metadata => {
      this.api = new Api(new AxiosClient(metadata.settings.token, 'http://api.paqato.dev/v2')) // Dev
    })
    */
    this.$client.get('ticket.requester').then(data => {
      if (this.email === null) {
        this.email = data['ticket.requester'].email
      }
      this.getPackages()
    })
  },
  methods: {
    async getPackages () {
      if (this.email === null) {
        return
      }

      this.api.packages
        .forCustomer(this.email)
        .then(response => {
          this.packages = response.packages || []
        })
        .catch(e => {
          this.packages = []
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
