<script setup lang="ts">
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
])

interface StatsPoint {
  timestamp: number
  value: number
}

interface Props {
  created: ReadonlyArray<StatsPoint>
  acknowledged: ReadonlyArray<StatsPoint>
  resolved: ReadonlyArray<StatsPoint>
}

const props = defineProps<Props>()
const hostRef = ref<HTMLElement | null>(null)
const chartReady = ref(false)
let sizeCheckRaf = 0

const checkContainerSize = () => {
  const element = hostRef.value
  if (element && element.clientWidth > 0 && element.clientHeight > 0) {
    chartReady.value = true
    return
  }

  sizeCheckRaf = requestAnimationFrame(checkContainerSize)
}

onMounted(async () => {
  await nextTick()
  checkContainerSize()
})

onBeforeUnmount(() => {
  if (sizeCheckRaf) {
    cancelAnimationFrame(sizeCheckRaf)
  }
})

const formatTimeLabel = (timestamp: number): string =>
  new Date(timestamp * 1000).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })

const baseSeries = computed(() => {
  if (props.created.length > 0) {
    return props.created
  }
  if (props.acknowledged.length > 0) {
    return props.acknowledged
  }
  return props.resolved
})

const xAxisLabels = computed(() =>
  baseSeries.value.map(point => formatTimeLabel(point.timestamp)),
)

const seriesValues = computed(() => ({
  created: props.created.map(point => point.value),
  acknowledged: props.acknowledged.map(point => point.value),
  resolved: props.resolved.map(point => point.value),
}))

const SERIES_COLORS = {
  created: '#ef4444',
  acknowledged: '#eab308',
  resolved: '#22c55e',
} as const

const option = computed(() => ({
  color: [SERIES_COLORS.created, SERIES_COLORS.acknowledged, SERIES_COLORS.resolved],
  animationDuration: 450,
  legend: {
    top: 0,
    textStyle: {
      color: '#94a3b8',
    },
    data: ['Создан', 'Подтвержден', 'Закрыт'],
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#0f172acc',
    borderColor: '#334155',
    borderWidth: 1,
    textStyle: {
      color: '#e2e8f0',
    },
  },
  grid: {
    top: 42,
    left: 36,
    right: 18,
    bottom: 24,
    outerBoundsMode: 'same',
    outerBoundsContain: 'axisLabel',
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: xAxisLabels.value,
    axisLine: {
      lineStyle: {
        color: '#475569',
      },
    },
    axisLabel: {
      color: '#94a3b8',
      showMinLabel: true,
      showMaxLabel: true,
      interval: 'auto',
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    minInterval: 1,
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#94a3b8',
    },
    splitLine: {
      lineStyle: {
        color: '#334155',
        opacity: 0.7,
      },
    },
  },
  series: [
    {
      name: 'Закрыт',
      type: 'line',
      stack: 'alerts',
      step: 'end',
      symbol: 'circle',
      symbolSize: 10,
      showSymbol: false,
      lineStyle: { width: 2, color: SERIES_COLORS.resolved },
      itemStyle: {
        color: 'transparent',
        borderColor: SERIES_COLORS.resolved,
        borderWidth: 2,
      },
      areaStyle: { opacity: 0.22, color: SERIES_COLORS.resolved },
      data: seriesValues.value.resolved,
    },
    {
      name: 'Подтвержден',
      type: 'line',
      stack: 'alerts',
      step: 'end',
      symbol: 'circle',
      symbolSize: 10,
      showSymbol: false,
      lineStyle: { width: 2, color: SERIES_COLORS.acknowledged },
      itemStyle: {
        color: 'transparent',
        borderColor: SERIES_COLORS.acknowledged,
        borderWidth: 2,
      },
      areaStyle: { opacity: 0.22, color: SERIES_COLORS.acknowledged },
      data: seriesValues.value.acknowledged,
    },
    {
      name: 'Создан',
      type: 'line',
      stack: 'alerts',
      step: 'end',
      symbol: 'circle',
      symbolSize: 10,
      showSymbol: false,
      lineStyle: { width: 2, color: SERIES_COLORS.created },
      itemStyle: {
        color: 'transparent',
        borderColor: SERIES_COLORS.created,
        borderWidth: 2,
      },
      areaStyle: { opacity: 0.22, color: SERIES_COLORS.created },
      data: seriesValues.value.created,
    },
  ],
}))
</script>

<template>
  <div
    ref="hostRef"
    class="h-72 w-full"
  >
    <VChart
      v-if="chartReady"
      class="h-full w-full"
      :option="option"
      autoresize
    />
  </div>
</template>
