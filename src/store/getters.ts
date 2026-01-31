import type { State } from '@/store/state'

export const getters = {
  count: (state: State) => state.count,
}
