import { getPortalMetrics, metricsContentType } from '../utils/metrics';

export default defineEventHandler(async (event) => {
  setHeader(event, 'content-type', metricsContentType());
  return await getPortalMetrics();
});
