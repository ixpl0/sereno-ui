<script setup lang="ts">
import type { EventResponseAlert } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

interface Props {
  alert: EventResponseAlert
  currentStatus: string
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="bg-base-200/50 hover:bg-base-200 border border-base-content/5 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
    @click="emit('click')"
  >
    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-2 min-w-0">
        <Icon
          name="lucide:bell"
          class="w-5 h-5 text-warning shrink-0"
        />
        <h3 class="font-medium truncate">
          {{ alert.source }}
        </h3>
      </div>
      <span
        class="badge badge-sm shrink-0"
        :class="getStatusColor(currentStatus)"
      >
        {{ formatStatus(currentStatus) }}
      </span>
    </div>

    <div class="flex items-center gap-2 text-sm text-base-content/60 mb-3">
      <Icon
        name="lucide:clock"
        class="w-3.5 h-3.5"
      />
      <span>{{ formatDateTime(alert.time) }}</span>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm text-base-content/50">
        <Icon
          name="lucide:building-2"
          class="w-3.5 h-3.5"
        />
        <span>{{ alert.tenant.id }}</span>
      </div>

      <div class="flex items-center gap-1">
        <div
          v-if="alert.labels.filter(l => !l.deleted).length > 0"
          class="flex items-center gap-1"
        >
          <Icon
            name="lucide:tag"
            class="w-3.5 h-3.5 text-base-content/40"
          />
          <span class="text-xs text-base-content/50">
            {{ alert.labels.filter(l => !l.deleted).length }}
          </span>
        </div>
        <div
          v-if="alert.comments.filter(c => !c.deleted).length > 0"
          class="flex items-center gap-1 ml-2"
        >
          <Icon
            name="lucide:message-square"
            class="w-3.5 h-3.5 text-base-content/40"
          />
          <span class="text-xs text-base-content/50">
            {{ alert.comments.filter(c => !c.deleted).length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
