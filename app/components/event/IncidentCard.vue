<script setup lang="ts">
import type { EventResponseIncident } from '~/api/types.gen'

interface Props {
  incident: EventResponseIncident
  currentStatus: string
  tenantName?: string
}

defineProps<Props>()

defineEmits<{
  click: []
  statusChange: [newStatus: string]
}>()
</script>

<template>
  <EventCardBase
    :current-status="currentStatus"
    :tenant-id="incident.tenant.id"
    :tenant-name="tenantName"
    :time="incident.time"
    :labels="incident.labels"
    @click="$emit('click')"
    @status-change="(status) => $emit('statusChange', status)"
  >
    <h3 class="font-medium text-lg mb-1">
      {{ incident.title }}
    </h3>

    <p
      v-if="incident.description"
      class="text-sm text-base-content/70 line-clamp-2 mb-3"
    >
      {{ incident.description }}
    </p>

    <template #footer>
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
    </template>
  </EventCardBase>
</template>
