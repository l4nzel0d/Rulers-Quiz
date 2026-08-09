import { US_PORTRAITS } from '@/components/us-portraits';
import type { Domain } from '@/lib/domain';
import { US_CORE } from './us-core';

/** The US domain, assets attached. Anything that require()s a file has to live
 *  here rather than in us-core.ts, which `npm test` imports without a bundler. */
export const US: Domain = {
  ...US_CORE,
  portraits: US_PORTRAITS,
  background: require('@/assets/images/us-background.jpg'),
};
