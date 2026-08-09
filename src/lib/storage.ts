import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DomainCore } from './domain';
import { bounds, parseRangeIn, rangeSlug, type Range } from './range';

/* Keyed per domain: the two index on the same `no` space but mean entirely
 * different things by it, so a range chosen under /us must not follow the player
 * into /ru. */
const key = (domain: DomainCore) => `usq.range.${domain.key}`;

/** Falls back to the full range if nothing is stored or storage is unavailable. */
export async function loadRange(domain: DomainCore): Promise<Range> {
  try {
    const saved = await AsyncStorage.getItem(key(domain));
    return parseRangeIn(domain, saved) ?? bounds(domain);
  } catch {
    return bounds(domain);
  }
}

export async function saveRange(domain: DomainCore, r: Range): Promise<void> {
  try {
    await AsyncStorage.setItem(key(domain), rangeSlug(r));
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
}
