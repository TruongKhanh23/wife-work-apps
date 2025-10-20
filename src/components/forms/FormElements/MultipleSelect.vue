<template>
  <div class="w-full" :class="customClass">
    <div ref="triggerRef">
      <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        <slot name="label" />
      </label>

      <!-- Input field -->
      <div class="relative" @click="focusInput">
        <div
          class="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800
                 relative h-11 w-full cursor-text rounded-lg border border-gray-300 px-4 py-3 text-left text-sm
                 focus:ring-3 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50
                 dark:border-gray-700 dark:bg-gray-900"
          :class="[
            isDisabled
              ? 'bg-gray-50 text-gray-800 placeholder:text-gray-300'
              : 'bg-transparent text-gray-800 placeholder:text-gray-400 dark:text-white/90 dark:placeholder:text-white/30',
          ]"
        >
          <input
            ref="inputRef"
            v-model="search"
            type="text"
            :readonly="!isOpen"
            :disabled="isDisabled"
            :placeholder="selectedLabels.length ? '' : 'Vui lòng chọn'"
            class="w-full bg-transparent focus:outline-none pr-6"
            @focus="handleFocus"
            @keydown.stop
          >
          <span
            v-if="!isOpen && selectedLabels.length"
            class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-sm text-gray-800 dark:text-white"
          >
            {{ selectedLabels.join(', ') }}
          </span>

          <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      </div>

      <!-- Dropdown -->
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="isOpen"
            ref="dropdownEl"
            class="absolute z-9999 mt-1 overflow-hidden rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            :style="dropdownStyle"
          >
            <div class="max-h-96 overflow-y-auto">

              <!-- ✅ Select All / Unselect All -->
              <div
                v-if="isMulti && filteredOptions.length"
                class="flex h-11 items-center px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700"
                @click.stop="toggleSelectAll"
              >
                <CheckboxIcon :checked="isAllSelected" />
                <span class="ml-3">
                  {{ isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
                </span>
              </div>

              <div v-if="filteredOptions.length">
                <div
                  v-for="option in filteredOptions"
                  :key="option.value"
                  class="flex h-11 items-center px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                  @click="toggleOption(option.value)"
                >
                  <div class="flex w-full cursor-pointer items-center space-x-3">
                    <CheckboxIcon
                      v-if="isMulti"
                      :checked="Array.isArray(modelValue) && modelValue.includes(option.value)"
                    />
                    <span>{{ option.label }}</span>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="flex h-11 items-center px-4 py-3 text-sm text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              >
                <span>Không tìm thấy kết quả phù hợp</span>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <p v-if="errorMessage" class="mt-1 text-sm text-red-500">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue';
import { removeDiacritics } from '@/composables/useString.ts';
import CheckboxIcon from '@/icons/CheckboxIcon.vue';
import { ChevronDownIcon } from '@/icons';

const props = defineProps({
  inputId: String,
  modelValue: {
    type: [Array, String, Number],
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
  customClass: {
    type: [String, Array],
    default: '',
  },
  errorMessage: String,
  isDisabled: Boolean,
  isMulti: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const search = ref('');
const triggerRef = ref(null);
const inputRef = ref(null);
const dropdownEl = ref(null);
const dropdownStyle = ref({});

// 🟢 Computed: kiểm tra đã chọn hết chưa
const isAllSelected = computed(() => {
  if (!Array.isArray(props.modelValue)) return false;
  const allValues = props.options.map(o => o.value);
  return allValues.length > 0 && allValues.every(v => props.modelValue.includes(v));
});

onMounted(() => {
  if (props.isMulti && Array.isArray(props.modelValue) && props.modelValue.length === 0) {
    // Mặc định chọn tất cả
    emit('update:modelValue', props.options.map(o => o.value));
  }
});

// 🟢 Hàm toggle select all
function toggleSelectAll() {
  if (isAllSelected.value) {
    emit('update:modelValue', []); // unselect all
  } else {
    emit('update:modelValue', props.options.map(o => o.value)); // select all
  }
}

function calculateDropdownWidth() {
  if (!dropdownEl.value) return 0;
  const temp = document.createElement('div');
  temp.style.position = 'absolute';
  temp.style.visibility = 'hidden';
  temp.style.whiteSpace = 'nowrap';
  temp.style.fontSize = '0.875rem';
  temp.style.padding = '0 1rem';
  document.body.appendChild(temp);

  let maxWidth = 0;
  const options = filteredOptions.value.length ? filteredOptions.value : [{ label: 'Không tìm thấy kết quả phù hợp' }];
  options.forEach((opt) => {
    temp.textContent = opt.label;
    const w = temp.offsetWidth + (props.isMulti ? 24 : 0);
    maxWidth = Math.max(maxWidth, w);
  });
  document.body.removeChild(temp);

  const inputWidth = triggerRef.value?.getBoundingClientRect().width || 0;
  return Math.max(maxWidth + 8, inputWidth);
}

function updateDropdownPosition() {
  if (!triggerRef.value || !dropdownEl.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const dropdownHeight = dropdownEl.value.getBoundingClientRect().height;
  const windowHeight = window.innerHeight;
  const spaceBelow = windowHeight - rect.bottom;
  const spaceAbove = rect.top;

  let top;
  if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
    top = rect.top + window.scrollY - dropdownHeight;
  } else {
    top = rect.bottom + window.scrollY;
  }

  const dropdownWidth = calculateDropdownWidth();
  dropdownStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${rect.left + window.scrollX}px`,
    width: `${dropdownWidth}px`,
  };
}

watch(isOpen, (open) => {
  if (open) {
    nextTick(updateDropdownPosition);
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', updateDropdownPosition, true);
    window.addEventListener('resize', updateDropdownPosition);
  } else {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('scroll', updateDropdownPosition, true);
    window.removeEventListener('resize', updateDropdownPosition);
    search.value = '';
  }
});

function toggleOption(value) {
  if (props.isMulti) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    const idx = current.indexOf(value);
    idx >= 0 ? current.splice(idx, 1) : current.push(value);
    emit('update:modelValue', current);
  } else {
    emit('update:modelValue', value);
    isOpen.value = false;
  }
}

function focusInput() {
  if (!isOpen.value && !props.isDisabled) {
    isOpen.value = true;
    nextTick(() => inputRef.value?.focus());
  }
}

function handleClickOutside(e) {
  if (!triggerRef.value?.contains(e.target) && !dropdownEl.value?.contains(e.target)) {
    isOpen.value = false;
  }
}

const filteredOptions = computed(() =>
  props.options.filter((opt) =>
    removeDiacritics(opt.label.toLowerCase()).includes(removeDiacritics(search.value.toLowerCase()))
  )
);

const selectedLabels = computed(() => {
  if (props.isMulti) {
    return props.options.filter((opt) => props.modelValue.includes(opt.value)).map((opt) => opt.label);
  } else {
    const found = props.options.find((opt) => opt.value === props.modelValue);
    return found ? [found.label] : [];
  }
});

watch(filteredOptions, () => {
  if (isOpen.value) nextTick(updateDropdownPosition);
});
</script>
