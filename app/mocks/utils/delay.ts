import { delay as mswDelay } from 'msw'

export type DelayMode = 'instant' | 'fast' | 'realistic' | 'slow'

const delayMap: Record<DelayMode, number> = {
  instant: 0,
  fast: 100,
  realistic: 300,
  slow: 1500,
}

export const getDelay = (mode: DelayMode = 'realistic'): number => delayMap[mode]

export const withDelay = async (mode: DelayMode = 'realistic'): Promise<void> => {
  await mswDelay(delayMap[mode])
}

export const randomDelay = async (min: number = 100, max: number = 500): Promise<void> => {
  const duration = Math.floor(Math.random() * (max - min + 1)) + min
  await mswDelay(duration)
}
