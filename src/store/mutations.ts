import type { State } from '@/store/state'

export const mutations = {
  increment(state: State) {
    state.count++
  },
  decrement(state: State) {
    state.count--
  },
}
