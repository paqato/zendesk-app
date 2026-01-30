import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './style.css'

// Import translations
import de from '../translations/de.json'
import en from '../translations/en.json'

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'de', // Default locale (will be updated by ZAF client)
  fallbackLocale: 'de',
  messages: {
    de,
    en,
  },
})

// Create and mount the Vue app
const app = createApp(App)
app.use(i18n)
app.mount('#app')
