<script setup lang="ts">
import type { EventResponseAnnotation } from '~/api/types.gen'

interface Props {
  annotations: ReadonlyArray<EventResponseAnnotation>
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
const newAnnotationKey = ref('')
const newAnnotationValue = ref('')
const keyInputRef = ref<{ focus: () => void } | null>(null)

const startAdding = () => {
  isAdding.value = true
  newAnnotationKey.value = ''
  newAnnotationValue.value = ''
  nextTick(() => {
    keyInputRef.value?.focus()
  })
}

const cancelAdding = () => {
  isAdding.value = false
  newAnnotationKey.value = ''
  newAnnotationValue.value = ''
}

const handleAdd = () => {
  const key = newAnnotationKey.value.trim()
  const value = newAnnotationValue.value.trim()
  if (!key || !value) {
    return
  }
  emit('add', key, value)
  cancelAdding()
}

const handleDelete = (key: string) => {
  emit('delete', key)
}

const activeAnnotations = computed(() => props.annotations.filter(a => !a.deleted))
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium">
        Аннотации
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
            v-model="newAnnotationKey"
            placeholder="Ключ"
            class="flex-1"
            @keyup.enter="handleAdd"
            @keyup.escape="cancelAdding"
          />
          <UiInput
            v-model="newAnnotationValue"
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

      <div
        v-for="annotation in activeAnnotations"
        :key="annotation.key"
        class="p-3 bg-base-200/50 rounded group"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm text-base-content/70 mb-1">
              {{ annotation.key }}
            </div>
            <div class="text-sm">
              {{ annotation.value }}
            </div>
          </div>
          <button
            v-if="!readonly"
            class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            @click="handleDelete(annotation.key)"
          >
            <Icon
              name="lucide:x"
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>

      <div
        v-if="activeAnnotations.length === 0 && !isAdding"
        class="text-center py-6 text-base-content/50"
      >
        Нет аннотаций
      </div>
    </div>
  </div>
</template>
