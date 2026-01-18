<script setup lang="ts">
import type { EventResponseAlert } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor, getStatusBorderColor } from '~/utils/formatters'

interface Props {
  alert: EventResponseAlert
  currentStatus: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
  statusChange: [newStatus: string]
}>()

const nextStatus = computed(() => {
  if (props.currentStatus === 'created') {
    return { status: 'acknowledged', label: 'Подтвердить' }
  }
  if (props.currentStatus === 'acknowledged') {
    return { status: 'resolved', label: 'Разрешить' }
  }
  return null
})

const handleStatusChange = (event: Event) => {
  event.stopPropagation()
  if (nextStatus.value) {
    emit('statusChange', nextStatus.value.status)
  }
}

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
    class="bg-base-200/50 hover:bg-base-200 border border-base-content/10 border-l-4 rounded-lg cursor-pointer transition-all hover:shadow-md overflow-hidden"
    :class="getStatusBorderColor(currentStatus)"
    @click="emit('click')"
  >
    <div class="flex items-center gap-3 pr-4 pb-2">
      <div class="flex items-center -ml-1 -mt-1">
        <span
          class="badge rounded-none rounded-br-lg"
          :class="getStatusColor(currentStatus)"
        >
          {{ formatStatus(currentStatus) }}
        </span>
        <template v-if="nextStatus">
          <span class="text-base-content/40 px-2">→</span>
          <span
            class="text-sm link link-hover text-base-content/60 hover:text-base-content"
            @click="handleStatusChange"
          >
            {{ formatStatus(nextStatus.status) }}
          </span>
        </template>
      </div>
      <div class="flex items-center gap-4 text-sm ml-auto pt-0.5">
        <span class="text-base-content/50">{{ alert.tenant.id }}</span>
        <div class="flex items-center gap-1.5 text-base-content/60">
          <Icon
            name="lucide:clock"
            class="w-3.5 h-3.5"
          />
          <span>{{ formatDateTime(alert.time) }}</span>
        </div>
      </div>
    </div>

    <div class="px-4 pb-3">
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
          class="badge badge-sm bg-base-content/8 text-base-content/70 border-base-content/15"
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
          class="badge badge-sm bg-base-content/3 text-base-content/50 border-base-content/14"
        >
          {{ annotation.key }}: {{ annotation.value }}
        </span>
      </div>
    </div>
  </div>
</template>
