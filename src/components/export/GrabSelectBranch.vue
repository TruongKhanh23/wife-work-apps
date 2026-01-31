<template>
  <div>
    <div class="relative z-20 bg-transparent">
      <MultipleSelect v-model="model" :options="grabMerchantOptions" :is-multi="true">
        <template #label> Select Merchants </template>
      </MultipleSelect>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import MultipleSelect from '../forms/FormElements/MultipleSelect.vue'

const store = useStore()

/* ① nhận từ parent */
const props = defineProps({
  selectedMerchants: {
    type: Array,
    default: () => []
  }
})

/* ② emit */
const emit = defineEmits(['update:selectedMerchants'])

/* ③ 2 chiều */
const model = computed({
  get: () => props.selectedMerchants,
  set: (val) => emit('update:selectedMerchants', val)
})

const grabMerchants = computed(() => store.state.grabMerchants || [])

const grabMerchantOptions = computed(() =>
  grabMerchants.value.map((item) => ({
    value: item.merchantID,
    label: item.merchantName,
  }))
)
</script>
