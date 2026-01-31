declare module 'vuex' {
  import { Store as VuexStore, StoreOptions } from 'vuex'
  export * from 'vuex'
  export default VuexStore
  export function useStore<T = any>(key?: string): T
}
