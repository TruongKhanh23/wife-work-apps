<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <div
          class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div class="px-4 py-4 sm:pl-6 sm:pr-4 flex flex-col gap-4 min-h-screen">
            <GrabCookie />
            <div class="w-full">
              <div class="flex flex-col gap-4">
                <GrabSelectBranch />
                <GrabSelectDate />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import GrabSelectBranch from '@/components/export/GrabSelectBranch.vue'
import GrabCookie from '@/components/export/GrabCookie.vue'
import GrabSelectDate from '@/components/export/GrabSelectDate.vue'

const currentPageTitle = ref('Grab Export')
</script>
<style></style>
