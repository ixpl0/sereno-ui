<script setup lang="ts">
import type { EventResponseComment } from '~/api/types.gen'
import { formatDateTime } from '~/utils/formatters'

interface Props {
  comments: ReadonlyArray<EventResponseComment>
  loading?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  readonly: false,
})

const emit = defineEmits<{
  add: [text: string]
  delete: [id: string]
}>()

const inputRef = ref<HTMLTextAreaElement | null>(null)

const { isAdding, values, startAdding, cancelAdding } = useInlineAdd(
  { text: '' },
  () => inputRef.value,
)

const handleAdd = () => {
  const text = values.value.text.trim()
  if (!text) {
    return
  }
  emit('add', text)
  cancelAdding()
}

const handleDelete = (id: string) => {
  emit('delete', id)
}

const activeComments = computed(() =>
  props.comments.filter(c => !c.deleted).toSorted((a, b) => b.created - a.created),
)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium">
        Комментарии
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
        <textarea
          ref="inputRef"
          v-model="values.text"
          class="textarea textarea-bordered w-full"
          placeholder="Введите комментарий..."
          rows="3"
          @keydown.ctrl.enter="handleAdd"
          @keydown.escape="cancelAdding"
        />
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
        v-for="comment in activeComments"
        :key="comment.id"
        class="p-3 bg-base-200/50 rounded"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex-1 min-w-0">
            <p class="text-sm whitespace-pre-wrap break-words">
              {{ comment.text }}
            </p>
            <p class="text-xs text-base-content/50 mt-1">
              {{ formatDateTime(comment.created) }}
            </p>
          </div>
          <UiButton
            v-if="!readonly"
            variant="ghost"
            size="sm"
            class="shrink-0"
            aria-label="Удалить комментарий"
            @click="handleDelete(comment.id)"
          >
            <Icon
              name="lucide:trash-2"
              class="w-4 h-4"
            />
          </UiButton>
        </div>
      </div>

      <div
        v-if="activeComments.length === 0 && !isAdding"
        class="text-center py-6 text-base-content/50"
      >
        Нет комментариев
      </div>
    </div>
  </div>
</template>
