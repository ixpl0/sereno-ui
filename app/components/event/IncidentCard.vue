<script setup lang="ts">
import type { EventResponseIncident } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor, getStatusBorderColor } from '~/utils/formatters'

interface Props {
  incident: EventResponseIncident
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
    return { status: 'resolved', label: 'Закрыть' }
  }
  return null
})

const handleStatusChange = (event: Event) => {
  event.stopPropagation()
  if (nextStatus.value) {
    emit('statusChange', nextStatus.value.status)
  }
}

const getActiveLabels = (incident: EventResponseIncident) =>
  incident.labels.filter(label => !label.deleted)
</script>

<template>
  <div
    class="bg-base-200/50 hover:bg-base-200 border border-base-content/10 border-l-4 border-t-4 rounded-lg cursor-pointer transition-all hover:shadow-md overflow-hidden"
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
            class="text-sm link link-primary"
            @click="handleStatusChange"
          >
            {{ formatStatus(nextStatus.status) }}
          </span>
        </template>
      </div>
      <div class="flex items-center gap-4 text-sm ml-auto pt-0.5">
        <span class="text-base-content/50">{{ incident.tenant.id }}</span>
        <div class="flex items-center gap-1.5 text-base-content/60">
          <Icon
            name="lucide:clock"
            class="w-3.5 h-3.5"
          />
          <span>{{ formatDateTime(incident.time) }}</span>
        </div>
      </div>
    </div>

    <div class="px-4 pb-3">
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
  </div>
</template>
