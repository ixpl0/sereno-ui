<script setup lang="ts">
import type { EventResponseLabel } from '~/api/types.gen'

interface Props {
  labels: ReadonlyArray<EventResponseLabel>
  loading?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  readonly: false,
})

const emit = defineEmits<{
  add: [key: string, value: string]
  delete: [key: string]
}>()

const isAdding = ref(false)
const newLabelKey = ref('')
const newLabelValue = ref('')
const keyInputRef = ref<{ focus: () => void } | null>(null)

const startAdding = () => {
  isAdding.value = true
  newLabelKey.value = ''
  newLabelValue.value = ''
  nextTick(() => {
    keyInputRef.value?.focus()
  })
}

const cancelAdding = () => {
  isAdding.value = false
  newLabelKey.value = ''
  newLabelValue.value = ''
}

const handleAdd = () => {
  const key = newLabelKey.value.trim()
  const value = newLabelValue.value.trim()
  if (!key || !value) {
    return
  }
  emit('add', key, value)
  cancelAdding()
}

const handleDelete = (key: string) => {
  emit('delete', key)
}

const activeLabels = computed(() => props.labels.filter(l => !l.deleted))
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium">
        Метки
      </h3>
      <UiButton
        v-if="!readonly && !isAdding"
        variant="ghost"
        size="sm"
        @click="startAdding"
      >
        <Icon
          name="lucide:plus"
          class="w-4 h-4 mr-1"
        />
        Добавить
      </UiButton>
    </div>

    <div
      v-if="loading"
      class="flex justify-center py-4"
    >
      <span class="loading loading-spinner loading-md" />
    </div>

    <div
      v-else
      class="space-y-3"
    >
      <div
        v-if="isAdding"
        class="p-3 bg-base-200 rounded space-y-3"
      >
        <div class="flex gap-2">
          <UiInput
            ref="keyInputRef"
            v-model="newLabelKey"
            placeholder="Ключ"
            class="flex-1"
            @keyup.enter="handleAdd"
            @keyup.escape="cancelAdding"
          />
          <UiInput
            v-model="newLabelValue"
            placeholder="Значение"
            class="flex-1"
            @keyup.enter="handleAdd"
            @keyup.escape="cancelAdding"
          />
        </div>
        <div class="flex gap-2 justify-end">
          <UiButton
            variant="primary"
            size="sm"
            @click="handleAdd"
          >
            Добавить
          </UiButton>
          <UiButton
            variant="ghost"
            size="sm"
            @click="cancelAdding"
          >
            Отмена
          </UiButton>
        </div>
      </div>

      <div class="flex flex-wrap gap-2">
        <div
          v-for="label in activeLabels"
          :key="label.key"
          class="badge badge-lg gap-1 pr-1"
        >
          <span class="font-medium">{{ label.key }}</span>
          <span class="text-base-content/60">=</span>
          <span>{{ label.value }}</span>
          <button
            v-if="!readonly"
            class="btn btn-ghost btn-xs btn-circle ml-1"
            @click="handleDelete(label.key)"
          >
            <Icon
              name="lucide:x"
              class="w-3 h-3"
            />
          </button>
        </div>
      </div>

      <div
        v-if="activeLabels.length === 0 && !isAdding"
        class="text-center py-6 text-base-content/50"
      >
        Нет меток
      </div>
    </div>
  </div>
</template>
