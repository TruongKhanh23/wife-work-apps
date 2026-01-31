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

const cookie = ref('')

const { callApi, loading, error } = useApi()

watch(cookie, async (val) => {
  if (!val?.trim()) return

  try {
    const data = await callApi({
      endpoint: '/api/hello',
      method: 'GET'
    })

    console.log('API response:', data)
  } catch (_) {}
})
</script>
