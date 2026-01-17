<script setup lang="ts">
import type { EventResponseIncident } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor, getStatusBorderColor } from '~/utils/formatters'

interface Props {
  incident: EventResponseIncident
  currentStatus: string
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const getActiveLabels = (incident: EventResponseIncident) =>
  incident.labels.filter(label => !label.deleted)
</script>

<template>
  <div
    class="bg-base-200/50 hover:bg-base-200 border border-base-content/10 border-r-4 rounded-lg py-3 px-4 cursor-pointer transition-all hover:shadow-md flex gap-4"
    :class="getStatusBorderColor(currentStatus)"
    @click="emit('click')"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 text-sm text-base-content/60 mb-2">
        <Icon
          name="lucide:clock"
          class="w-3.5 h-3.5 shrink-0"
        />
        <span>{{ formatDateTime(incident.time) }}</span>
      </div>

      <h3 class="font-medium text-lg mb-1">
        {{ incident.title }}
      </h3>

      <p
        v-if="incident.description"
        class="text-sm text-base-content/70 line-clamp-2 mb-3"
      >
        {{ incident.description }}
      </p>

      <div
        v-if="getActiveLabels(incident).length > 0"
        class="flex flex-wrap gap-1.5 mb-2"
      >
        <span
          v-for="label in getActiveLabels(incident)"
          :key="label.key"
          class="badge badge-sm badge-success"
        >
          {{ label.key }}: {{ label.value }}
        </span>
      </div>

      <div
        v-if="incident.alerts.length > 0"
        class="flex items-center gap-1.5 text-sm text-base-content/60"
      >
        <Icon
          name="lucide:bell"
          class="w-3.5 h-3.5"
        />
        <span>{{ incident.alerts.length }} алертов</span>
      </div>
    </div>

    <div class="flex flex-col items-end gap-2 shrink-0">
      <span
        class="badge badge-sm"
        :class="getStatusColor(currentStatus)"
      >
        {{ formatStatus(currentStatus) }}
      </span>
      <span class="text-sm text-base-content/50">{{ incident.tenant.id }}</span>
    </div>
  </div>
</template>
