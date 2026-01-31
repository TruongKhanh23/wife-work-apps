<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'CounterComponent',
  setup() {
    const store = useStore();

    // Sử dụng computed để truy cập state
    const count = computed(() => store.state.count);

    // Gọi mutation thông qua action
    const increment = () => store.dispatch('increment');
    const decrement = () => store.dispatch('decrement');

    return {
      count,
      increment,
      decrement,
    };
  },
});
</script>
