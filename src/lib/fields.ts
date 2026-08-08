import type { KeyboardTypeOptions } from 'react-native';

import type { President } from '@/data/presidents';
import { dropSuffix, nameKeys, norm, yearKeys, yearsText } from './answers';

export type FieldKey = 'no' | 'name' | 'years';
export type ModeKey = FieldKey | 'mixed';

export type FieldSpec = {
  label: string;
  placeholder: string;
  /** Replaces the web build's inputmode="numeric". */
  keyboardType?: KeyboardTypeOptions;
  show: (p: President) => string;
  check: (p: President, v: string) => boolean;
};

/* The three pieces of data. Each question shows one and asks for the other two. */
export const FIELDS: Record<FieldKey, FieldSpec> = {
  no: {
    label: 'Number',
    placeholder: 'e.g. 44',
    keyboardType: 'number-pad',
    show: (p) => `#${p.no}`,
    check: (p, v) => norm(v) === norm(p.no),
  },
  name: {
    label: 'Full name',
    placeholder: 'e.g. Barack Hussein Obama II',
    show: (p) => p.name,
    check: (p, v) => {
      const k = norm(v);
      const keys = nameKeys(p);
      return keys.includes(k) || keys.includes(dropSuffix(k));
    },
  },
  years: {
    label: 'Years in office',
    placeholder: 'e.g. 2009-2017',
    keyboardType: 'numbers-and-punctuation',
    show: yearsText,
    check: (p, v) => yearKeys(p).includes(norm(v)),
  },
};

export const ORDER: FieldKey[] = ['no', 'name', 'years'];

export const MODES: Record<ModeKey, { title: string; blurb: string }> = {
  no: { title: 'Given the number', blurb: 'Every question shows a presidency number.' },
  name: { title: 'Given the name', blurb: 'Every question shows a full name.' },
  years: { title: 'Given the years', blurb: 'Every question shows a term.' },
  mixed: { title: 'Mixed', blurb: 'The given piece changes each question.' },
};

export const MODE_KEYS: ModeKey[] = ['no', 'name', 'years', 'mixed'];

export function isModeKey(v: string | undefined): v is ModeKey {
  return v !== undefined && (MODE_KEYS as string[]).includes(v);
}
