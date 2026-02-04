<script setup lang="ts">
interface KeyValueItem {
  key: string
  value: string
  deleted?: number
  creator?: string
}

interface Props {
  items: ReadonlyArray<KeyValueItem>
  title: string
  emptyText: string
  mode: 'badges' | 'blocks'
  loading?: boolean
  readonly?: boolean
  deletableOnlyWithCreator?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  readonly: false,
  deletableOnlyWithCreator: false,
})

const emit = defineEmits<{
  add: [key: string, value: string]
  delete: [key: string]
}>()

const keyInputRef = ref<{ focus: () => void } | null>(null)

const { isAdding, values, startAdding, cancelAdding } = useInlineAdd(
  { key: '', value: '' },
  () => keyInputRef.value,
)

const handleAdd = () => {
  const key = values.value.key.trim()
  const value = values.value.value.trim()
  if (!key || !value) {
    return
  }
  emit('add', key, value)
  cancelAdding()
}

const handleDelete = (key: string) => {
  emit('delete', key)
}

const activeItems = computed(() => props.items.filter(item => !item.deleted))

const canDelete = (item: KeyValueItem): boolean => {
  if (props.readonly) {
    return false
  }
  if (props.deletableOnlyWithCreator) {
    return Boolean(item.creator)
  }
  return true
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium">
        {{ title }}
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
            v-model="values.key"
            placeholder="Ключ"
            class="flex-1"
            @keyup.enter="handleAdd"
            @keyup.escape="cancelAdding"
          />
          <UiInput
            v-model="values.value"
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

      <template v-if="mode === 'badges'">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="item in activeItems"
            :key="item.key"
            class="badge badge-lg bg-base-content/8 text-base-content/70 border-base-content/15 gap-1 pr-1"
          >
            <span class="font-medium">{{ item.key }}</span>
            <span class="text-base-content/60">=</span>
            <span>{{ item.value }}</span>
            <button
              v-if="canDelete(item)"
              class="btn btn-ghost btn-xs btn-circle ml-1"
              @click="handleDelete(item.key)"
            >
              <Icon
                name="lucide:x"
                class="w-3 h-3"
              />
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="item in activeItems"
          :key="item.key"
          class="p-3 bg-base-200/50 rounded group"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <div class="font-medium text-sm text-base-content/70 mb-1">
                {{ item.key }}
              </div>
              <div class="text-sm">
                {{ item.value }}
              </div>
            </div>
            <button
              v-if="canDelete(item)"
              class="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              @click="handleDelete(item.key)"
            >
              <Icon
                name="lucide:x"
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>
      </template>

      <div
        v-if="activeItems.length === 0 && !isAdding"
        class="text-center py-6 text-base-content/50"
      >
        {{ emptyText }}
      </div>
    </div>
  </div>
</template>
