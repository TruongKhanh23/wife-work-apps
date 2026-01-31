<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="grid grid-cols-12 gap-4">
      <div class="col-span-12">
        <div
          class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div class="px-4 py-4 sm:pl-6 sm:pr-4 flex flex-col gap-4 min-h-screen">
            <GrabCookie v-model:cookie="cookie"/>
            <div class="w-full">
              <div class="flex flex-col gap-4">
                <GrabSelectBranch v-model:selectedMerchants="selectedGrabMerchants" />
                <GrabSelectDate v-model:rangeDate="dateList" />
                <GrabExportButton @export="handleExport" />
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
import { useStore } from 'vuex';
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import GrabSelectBranch from '@/components/export/GrabSelectBranch.vue'
import GrabCookie from '@/components/export/GrabCookie.vue'
import GrabSelectDate from '@/components/export/GrabSelectDate.vue'
import GrabExportButton from '@/components/export/GrabExportButton.vue'

const store = useStore();
const currentPageTitle = ref('Grab Export')
const dateList = ref([]);
const selectedGrabMerchants = ref([]);
const cookie = ref('');

async function handleExport({ stopFlag, done }) {
  try {
    console.log('Start export...')
    const merchantInfos = store.getters.getGrabMerchants.map((m) => ({
      id: m.merchantID,
      name: m.merchantName
        .replace(/^Cà\s*Phê\s*Muối\s*Chú\s*Long\s*-?\s*/i, "")
        .trim(),
    }));;
    console.log('merchantInfos', merchantInfos);
    console.log('dateList', dateList.value);
    console.log('selectedGrabMerchants', selectedGrabMerchants.value);
    console.log('cookie', cookie.value);


    for (let i = 0; i < 10; i++) {
      if (stopFlag.value) break

      await new Promise(r => setTimeout(r, 500))
      console.log('processing', i)
    }
  } finally {
    done()
  }
}

</script>
<style></style>
