<script setup lang="ts">
import type { EventResponseStatus } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

interface Props {
  statuses: ReadonlyArray<EventResponseStatus>
}

const props = defineProps<Props>()

const sortedStatuses = computed(() =>
  [...props.statuses].sort((a, b) => b.since - a.since),
)
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium">
      История статусов
    </h3>

    <div
      v-if="sortedStatuses.length === 0"
      class="text-center py-6 text-base-content/50"
    >
      Нет статусов
    </div>

    <div
      v-else
      class="relative pl-6"
    >
      <div class="absolute left-[15px] top-2 bottom-2 w-0.5 bg-base-300" />

      <div
        v-for="(status, index) in sortedStatuses"
        :key="`${status.status}-${status.since}`"
        class="relative pb-4 last:pb-0"
      >
        <div
          class="absolute left-[-16px] w-4 h-4 rounded-full border-2 bg-base-100"
          :class="index === 0 ? 'border-primary' : 'border-base-300'"
        />

        <div class="flex items-center gap-2">
          <span
            class="badge"
            :class="getStatusColor(status.status)"
          >
            {{ formatStatus(status.status) }}
          </span>
          <span class="text-sm text-base-content/60">
            {{ formatDateTime(status.since) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
