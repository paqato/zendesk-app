/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

// JSON module declarations for translations
declare module '*.json' {
  const value: Record<string, unknown>
  export default value
}
