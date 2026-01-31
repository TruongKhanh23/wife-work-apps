import type { GrabMerchant } from '@/types'

export const actions = {
  setGrabMerchants(
    context: { commit: (mutation: string, payload?: any) => void },
    grabMerchants: GrabMerchant[],
  ) {
    context.commit('setGrabMerchants', { grabMerchants })
  },
}
