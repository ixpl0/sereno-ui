<script setup lang="ts">
import type { EventResponseAlert } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor, getStatusBorderColor } from '~/utils/formatters'

interface Props {
  alert: EventResponseAlert
  currentStatus: string
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const getActiveLabels = (alert: EventResponseAlert) =>
  alert.labels.filter(label => !label.deleted)

const getAlertTitle = (alert: EventResponseAlert) => {
  const titleAnnotation = alert.annotations.find(
    annotation => annotation.key === 'title' && !annotation.deleted,
  )
  return titleAnnotation?.value ?? alert.source
}

const getAlertDescription = (alert: EventResponseAlert) => {
  const descAnnotation = alert.annotations.find(
    annotation => annotation.key === 'description' && !annotation.deleted,
  )
  return descAnnotation?.value
}

const getDisplayAnnotations = (alert: EventResponseAlert) =>
  alert.annotations.filter(
    annotation => !annotation.deleted && annotation.key !== 'title' && annotation.key !== 'description',
  )
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
        <span>{{ formatDateTime(alert.time) }}</span>
      </div>

      <h3 class="font-medium text-lg mb-1">
        {{ getAlertTitle(alert) }}
      </h3>

      <p
        v-if="getAlertDescription(alert)"
        class="text-sm text-base-content/70 line-clamp-2 mb-3"
      >
        {{ getAlertDescription(alert) }}
      </p>

      <div
        v-if="getActiveLabels(alert).length > 0"
        class="flex flex-wrap gap-1.5 mb-2"
      >
        <span
          v-for="label in getActiveLabels(alert)"
          :key="label.key"
          class="badge badge-sm badge-success"
        >
          {{ label.key }}: {{ label.value }}
        </span>
      </div>

      <div
        v-if="getDisplayAnnotations(alert).length > 0"
        class="flex flex-wrap gap-1.5"
      >
        <span
          v-for="annotation in getDisplayAnnotations(alert)"
          :key="annotation.key"
          class="badge badge-sm badge-warning"
        >
          {{ annotation.key }}: {{ annotation.value }}
        </span>
      </div>
    </div>

    <div class="flex flex-col items-end gap-2 shrink-0">
      <span
        class="badge badge-sm"
        :class="getStatusColor(currentStatus)"
      >
        {{ formatStatus(currentStatus) }}
      </span>
      <span class="text-sm text-base-content/50">{{ alert.tenant.id }}</span>
    </div>
  </div>
</template>
