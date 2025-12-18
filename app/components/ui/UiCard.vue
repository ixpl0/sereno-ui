<script setup lang="ts">
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface Props {
  title?: string
  padding?: CardPadding
  bordered?: boolean
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  padding: 'md',
  bordered: false,
  hoverable: false,
})

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}
</script>

<template>
  <div
    class="card-glass backdrop-blur-xl rounded-2xl shadow-2xl ring-1 ring-white/5 transition-all duration-200"
    :class="{
      'border border-base-300': bordered,
      'hover:shadow-primary/20 hover:scale-[1.01]': hoverable,
    }"
  >
    <div
      v-if="title || $slots.header"
      class="px-6 py-4"
    >
      <slot name="header">
        <h3 class="text-lg font-semibold">
          {{ title }}
        </h3>
      </slot>
    </div>

    <div :class="paddingClasses[padding]">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      class="px-6 py-4"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
