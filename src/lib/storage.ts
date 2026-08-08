import AsyncStorage from '@react-native-async-storage/async-storage';

import { FULL_RANGE, parseRange, rangeSlug, type Range } from './range';

const STORE_KEY = 'usq.range';

/** Falls back to the full range if nothing is stored or storage is unavailable. */
export async function loadRange(): Promise<Range> {
  try {
    const saved = await AsyncStorage.getItem(STORE_KEY);
    return parseRange(saved) ?? FULL_RANGE;
  } catch {
    return FULL_RANGE;
  }
}

export async function saveRange(r: Range): Promise<void> {
  try {
    await AsyncStorage.setItem(STORE_KEY, rangeSlug(r));
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
}
