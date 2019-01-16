import '@babel/polyfill'
import Vue from 'vue'
import App from './App'
import i18n from '../lib/i18n'

/* global ZAFClient */

const client = ZAFClient.init()

client.get('currentUser.locale').then(data => {
  i18n.loadTranslations(data['currentUser.locale'])

  Vue.config.productionTip = false
  Vue.prototype.$client = client
  Vue.prototype.__ = i18n.t

  new Vue({
    render: h => h(App)
  }).$mount('#app')
})
