export const actions = {
  increment(context: { commit: Function }) {
    context.commit('increment')
  },
  decrement(context: { commit: Function }) {
    context.commit('decrement')
  },
}
