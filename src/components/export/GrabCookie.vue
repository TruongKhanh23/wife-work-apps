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

const cookie = ref('')

watch(cookie, (val) => {
  if (val && val.trim() !== '') {
    console.log('Cookie value:', val)
  }
})
</script>
