<script setup lang="ts">
interface Props {
  currentStatus: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  setStatus: [status: 'acknowledged' | 'resolved']
}>()

const canAcknowledge = computed(() =>
  props.currentStatus === 'created',
)

const canResolve = computed(() =>
  props.currentStatus !== 'resolved',
)

const handleAcknowledge = () => {
  emit('setStatus', 'acknowledged')
}

const handleResolve = () => {
  emit('setStatus', 'resolved')
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UiButton
      v-if="canAcknowledge"
      variant="primary"
      outline
      :disabled="loading"
      @click="handleAcknowledge"
    >
      <Icon
        name="lucide:check"
        class="w-4 h-4 mr-2"
      />
      Подтвердить
    </UiButton>

    <UiButton
      v-if="canResolve"
      variant="primary"
      :disabled="loading"
      @click="handleResolve"
    >
      <Icon
        name="lucide:check-check"
        class="w-4 h-4 mr-2"
      />
      Разрешить
    </UiButton>

    <div
      v-if="currentStatus === 'resolved'"
      class="flex items-center gap-2 text-success"
    >
      <Icon
        name="lucide:check-circle"
        class="w-5 h-5"
      />
      <span>Разрешён</span>
    </div>
  </div>
</template>
