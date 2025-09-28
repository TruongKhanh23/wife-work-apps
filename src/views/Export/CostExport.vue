<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12">
        <CostUploadButton />
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import CostUploadButton from '@/components/export/CostUploadButton.vue'

const currentPageTitle = ref('Cost Export')
</script>

<style></style>
