<script setup lang="ts">
import type { EventResponseAlert } from '~/api/types.gen'

interface Props {
  alert: EventResponseAlert
  currentStatus: string
  tenantName?: string
}

defineProps<Props>()

defineEmits<{
  click: []
  statusChange: [newStatus: string]
}>()

const getAlertTitle = (alertItem: EventResponseAlert) => {
  const titleAnnotation = alertItem.annotations.find(
    annotation => annotation.key === 'title' && !annotation.deleted,
  )
  return titleAnnotation?.value ?? alertItem.source
}

const getAlertDescription = (alertItem: EventResponseAlert) => {
  const descAnnotation = alertItem.annotations.find(
    annotation => annotation.key === 'description' && !annotation.deleted,
  )
  return descAnnotation?.value
}

const getDisplayAnnotations = (alertItem: EventResponseAlert) =>
  alertItem.annotations.filter(
    annotation => !annotation.deleted && annotation.key !== 'title' && annotation.key !== 'description',
  )
</script>

<template>
  <EventCardBase
    :current-status="currentStatus"
    :tenant-id="alert.tenant.id"
    :tenant-name="tenantName"
    :time="alert.time"
    :labels="alert.labels"
    @click="$emit('click')"
    @status-change="(status) => $emit('statusChange', status)"
  >
    <h3 class="font-medium text-lg mb-1">
      {{ getAlertTitle(alert) }}
    </h3>

    <p
      v-if="getAlertDescription(alert)"
      class="text-sm text-base-content/70 line-clamp-2 mb-3"
    >
      {{ getAlertDescription(alert) }}
    </p>

    <template #footer>
      <div
        v-if="getDisplayAnnotations(alert).length > 0"
        class="flex flex-wrap items-center gap-1.5"
      >
        <span class="text-xs text-base-content/40 mr-1">Аннотации:</span>
        <span
          v-for="annotation in getDisplayAnnotations(alert)"
          :key="annotation.key"
          class="badge badge-sm bg-base-content/3 text-base-content/50 border-base-content/14"
        >
          {{ annotation.key }}: {{ annotation.value }}
        </span>
      </div>
    </template>
  </EventCardBase>
</template>
