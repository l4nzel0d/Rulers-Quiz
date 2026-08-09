import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DomainCore } from './domain';
import { fullSelection, parseSelectionIn, selectionSlug, type Selection } from './range';

/* Keyed per domain: the two index on the same `no` space but mean entirely
 * different things by it, so a range chosen under /us must not follow the player
 * into /ru. The stored value is the selection slug — "20-27", or "1-19,28-31"
 * once the chips hold a set — and the single-span form written by earlier builds
 * still parses. */
const key = (domain: DomainCore) => `usq.range.${domain.key}`;

/** Falls back to the full range if nothing is stored or storage is unavailable. */
export async function loadRange(domain: DomainCore): Promise<Selection> {
  try {
    const saved = await AsyncStorage.getItem(key(domain));
    return parseSelectionIn(domain, saved) ?? fullSelection(domain);
  } catch {
    return fullSelection(domain);
  }
}

export async function saveRange(domain: DomainCore, sel: Selection): Promise<void> {
  try {
    await AsyncStorage.setItem(key(domain), selectionSlug(sel));
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
}

/** How the list screen draws its records: as rows, or as portrait cards. */
export type ListView = 'list' | 'cards';

/* Not keyed per domain, unlike the range above. A range means something
 * different in each domain — the same `no` picks different people — but "I would
 * rather see faces than rows" is a preference about the screen, and a player who
 * expressed it under /us means it under /ru too. */
const VIEW_KEY = 'usq.listview';

/** Falls back to the row list, which is what the screen has always shown. */
export async function loadListView(): Promise<ListView> {
  try {
    return (await AsyncStorage.getItem(VIEW_KEY)) === 'cards' ? 'cards' : 'list';
  } catch {
    return 'list';
  }
}

export async function saveListView(view: ListView): Promise<void> {
  try {
    await AsyncStorage.setItem(VIEW_KEY, view);
  } catch {
    /* storage unavailable — the choice just won't persist */
  }
}
