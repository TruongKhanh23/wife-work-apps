import type { State } from '@/store/state'
import type { GrabMerchant } from '@/types/grab/grabMerchant'

export const getters = {
  getGrabMerchants(state: State): GrabMerchant[] {
    return state.grabMerchants
  },
}
