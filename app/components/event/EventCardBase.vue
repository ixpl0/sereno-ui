<script setup lang="ts">
import type { EventResponseLabel } from '~/api/types.gen'
import { formatDateTime, formatStatus, getStatusColor, getStatusBorderColor, getStatusTextColor, getStatusBgLight } from '~/utils/formatters'

interface Props {
  currentStatus: string
  tenantId: string
  tenantName?: string
  time: number
  labels: ReadonlyArray<EventResponseLabel>
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

const activeLabels = computed(() => props.labels.filter(label => !label.deleted))
</script>

<template>
  <div
    class="bg-base-200/50 hover:bg-base-200 border border-base-content/10 border-l-4 rounded-lg cursor-pointer transition-all hover:shadow-md overflow-hidden"
    :class="getStatusBorderColor(currentStatus)"
    @click="emit('click')"
  >
    <div class="flex items-center gap-3 pr-4 pb-2">
      <div class="flex items-center -ml-1 mt-0">
        <span
          class="badge rounded-none rounded-br-lg"
          :class="getStatusColor(currentStatus)"
        >
          {{ formatStatus(currentStatus) }}
        </span>
        <template v-if="nextStatus">
          <span class="text-base-content/40 px-2 flex items-center">→</span>
          <span
            class="badge font-semibold cursor-pointer hover:opacity-80 transition-opacity border-transparent"
            :class="[getStatusTextColor(nextStatus.status), getStatusBgLight(nextStatus.status)]"
            :title="`Сменить статус на «${formatStatus(nextStatus.status)}»`"
            @click="handleStatusChange"
          >
            {{ formatStatus(nextStatus.status) }}
          </span>
        </template>
      </div>
      <div class="flex items-center gap-4 text-sm ml-auto pt-0.5">
        <span class="text-base-content/50">{{ tenantName ?? tenantId }}</span>
        <div class="flex items-center gap-1.5 text-base-content/60">
          <Icon
            name="lucide:clock"
            class="w-3.5 h-3.5"
          />
          <span>{{ formatDateTime(time) }}</span>
        </div>
      </div>
    </div>

    <div class="px-4 pb-3">
      <slot />

      <div
        v-if="activeLabels.length > 0"
        class="flex flex-wrap items-center gap-1.5 mb-2"
      >
        <span class="text-xs text-base-content/40 mr-1">Лейблы:</span>
        <span
          v-for="label in activeLabels"
          :key="label.key"
          class="badge badge-sm bg-base-content/8 text-base-content/70 border-base-content/15"
        >
          {{ label.key }}: {{ label.value }}
        </span>
      </div>

      <slot name="footer" />
    </div>
  </div>
</template>
