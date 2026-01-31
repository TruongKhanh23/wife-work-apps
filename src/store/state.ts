import type { GrabMerchant } from '@/types'
export interface State {
  grabMerchants: GrabMerchant[]
}
export const state: State = {
  grabMerchants: [],
}
