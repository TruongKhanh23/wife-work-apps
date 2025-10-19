<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12">
        <AddDonviColumnButton />
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import AddDonviColumnButton from '@/components/add-donvi-column/AddDonviColumnButton.vue'

const currentPageTitle = ref('Add Donvi Column')
</script>

<style></style>
