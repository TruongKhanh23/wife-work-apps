<template>
  <div>
    <TextArea
      v-model="model"
      label="Cookie"
      placeholder="Enter cookie value..."
    />
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import TextArea from '../forms/FormElements/TextArea.vue'
import { useApi } from '@/composables/useApi'
import { useStore } from 'vuex'

/* ① nhận từ parent */
const props = defineProps({
  cookie: {
    type: String,
    default: ''
  }
})

/* ② emit */
const emit = defineEmits(['update:cookie'])

/* ③ 2 chiều */
const model = computed({
  get: () => props.cookie,
  set: (val) => emit('update:cookie', val)
})

const { callApi } = useApi()
const store = useStore()

/* ④ side-effect khi cookie đổi */
watch(model, async (val) => {
  if (!val?.trim()) return

  try {
    const data = await callApi({
      endpoint: '/api/grab/catalog-stores',
      method: 'POST',
      params: {
        offset: 0,
        limit: 100,
        cookie: val
      }
    })

    store.dispatch('setGrabMerchants', data?.merchants || [])
  } catch {}
})
</script>
