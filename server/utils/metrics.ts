import client from 'prom-client'

const globalForMetrics = globalThis as typeof globalThis & {
  __portalMetrics?: {
    register: client.Registry;
    uptime: client.Gauge;
  };
};

if (!globalForMetrics.__portalMetrics) {
  const register = new client.Registry();

  const version = process.env.PORTAL_VERSION ?? 'unknown';
  const mockApi = process.env.NUXT_PUBLIC_MOCK_API ?? 'false';
  const startedAt = Math.floor(Date.now() / 1000);

  const buildInfo = new client.Gauge({
    name: 'portal_build_info',
    help: 'Portal build information',
    labelNames: ['version', 'mock_api'],
    registers: [register],
  });
  buildInfo.set({ version, mock_api: mockApi }, 1);

  const startTime = new client.Gauge({
    name: 'portal_start_time_seconds',
    help: 'Portal process start time (unix seconds)',
    registers: [register],
  });
  startTime.set(startedAt);

  const uptime = new client.Gauge({
    name: 'portal_uptime_seconds',
    help: 'Portal process uptime in seconds',
    registers: [register],
  });

  globalForMetrics.__portalMetrics = { register, uptime };
}

export const portalMetrics = globalForMetrics.__portalMetrics!;

export async function getPortalMetrics(): Promise<string> {
  portalMetrics.uptime.set(process.uptime());
  return portalMetrics.register.metrics();
}

export function metricsContentType(): string {
  return portalMetrics.register.contentType;
}
