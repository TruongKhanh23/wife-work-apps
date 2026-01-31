import type { State } from '@/store/state'
import type { GrabMerchant } from '@/types/grab/grabMerchant'

export const mutations = {
  setGrabMerchants(state: State, payload: { grabMerchants: GrabMerchant[] }) {
    state.grabMerchants = payload.grabMerchants
  },
}
