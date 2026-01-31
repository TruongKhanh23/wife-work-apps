<template>
  <div>
    <div class="relative z-20 bg-transparent">
      <MultipleSelect v-model="selectedMerchant" :options="grabMerchantOptions" :is-multi="true">
        <template #label> Select Merchants </template>
      </MultipleSelect>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import MultipleSelect from '../forms/FormElements/MultipleSelect.vue'

const store = useStore()
const selectedMerchant = ref([])

const grabMerchants = computed(() => store.state.grabMerchants || [])
const grabMerchantOptions = computed(() =>
  grabMerchants.value.map((item) => ({
    value: item.merchantID,
    label: item.merchantName,
  }))
)
</script>
