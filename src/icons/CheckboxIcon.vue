<template>
  <div
    :class="[
      'flex h-5 w-5 items-center justify-center rounded-md border-[1.25px]',
      checked
        ? 'border-brand-500 bg-brand-500'
        : 'hover:border-brand-500 dark:hover:border-brand-500 border-gray-300 bg-transparent dark:border-gray-700',
    ]"
  >
    <svg
      v-if="checked"
      class="stroke-white"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
        stroke="white"
        stroke-width="1.94437"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  checked: Boolean,
});
</script>
