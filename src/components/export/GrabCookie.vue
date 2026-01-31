<template>
  <div>
    <TextArea
      v-model="cookie"
      label="Cookie"
      placeholder="Enter cookie value..."
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import TextArea from '../forms/FormElements/TextArea.vue'
import { useApi } from '@/composables/useApi'
import { useStore } from 'vuex';

const cookie = ref('')

const { callApi, loading, error } = useApi()
const store = useStore();

watch(cookie, async (val) => {
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

    console.log(data)
    store.dispatch('setGrabMerchants', data?.merchants || [])
  } catch {}
})

</script>
