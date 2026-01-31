import Vuex from 'vuex'
import VuexPersist from 'vuex-persist'
import { mutations } from '@/store/mutations'
import { actions } from '@/store/actions'
import { getters } from '@/store/getters'
import { state, type State } from '@/store/state'

const { createStore } = Vuex

const vuexPersist = new VuexPersist({
  key: 'wife-work-apps',
  storage: localStorage,
})

const store = createStore<State>({
  state,
  mutations,
  actions,
  getters,
  plugins: [vuexPersist.plugin],
})

export default store
