<script setup lang="ts">
import type { EventResponseIncident } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor } from '~/utils/formatters'

interface Props {
  incident: EventResponseIncident
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
    <div class="flex items-start justify-between gap-3 mb-2">
      <div class="flex items-center gap-2 min-w-0">
        <Icon
          name="lucide:alert-triangle"
          class="w-5 h-5 text-error shrink-0"
        />
        <h3 class="font-medium truncate">
          {{ incident.title }}
        </h3>
      </div>
      <span
        class="badge badge-sm shrink-0"
        :class="getStatusColor(currentStatus)"
      >
        {{ formatStatus(currentStatus) }}
      </span>
    </div>

    <p
      v-if="incident.description"
      class="text-sm text-base-content/70 line-clamp-2 mb-3"
    >
      {{ incident.description }}
    </p>

    <div class="flex items-center gap-2 text-sm text-base-content/60 mb-3">
      <Icon
        name="lucide:clock"
        class="w-3.5 h-3.5"
      />
      <span>{{ formatDateTime(incident.time) }}</span>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm text-base-content/50">
        <Icon
          name="lucide:building-2"
          class="w-3.5 h-3.5"
        />
        <span>{{ incident.tenant.id }}</span>
      </div>

      <div class="flex items-center gap-1">
        <div
          v-if="incident.alerts.length > 0"
          class="flex items-center gap-1"
        >
          <Icon
            name="lucide:bell"
            class="w-3.5 h-3.5 text-base-content/40"
          />
          <span class="text-xs text-base-content/50">
            {{ incident.alerts.length }}
          </span>
        </div>
        <div
          v-if="incident.labels.filter(l => !l.deleted).length > 0"
          class="flex items-center gap-1 ml-2"
        >
          <Icon
            name="lucide:tag"
            class="w-3.5 h-3.5 text-base-content/40"
          />
          <span class="text-xs text-base-content/50">
            {{ incident.labels.filter(l => !l.deleted).length }}
          </span>
        </div>
        <div
          v-if="incident.comments.filter(c => !c.deleted).length > 0"
          class="flex items-center gap-1 ml-2"
        >
          <Icon
            name="lucide:message-square"
            class="w-3.5 h-3.5 text-base-content/40"
          />
          <span class="text-xs text-base-content/50">
            {{ incident.comments.filter(c => !c.deleted).length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
