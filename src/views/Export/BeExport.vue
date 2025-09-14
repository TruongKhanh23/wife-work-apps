<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12">
        <BeUploadButton />
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import BeUploadButton from '@/components/export/BeUploadButton.vue'

const currentPageTitle = ref('Be Export')
</script>

<style></style>
