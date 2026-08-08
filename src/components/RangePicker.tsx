import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  NO_MAX,
  NO_MIN,
  PRESETS,
  makeRange,
  pool,
  rangeText,
  rangesEqual,
  type Range,
} from '@/lib/range';
import { colors, fonts, radius, spacing, type } from '@/theme';

/* The web build used two overlaid <input type="range"> to make a twin-thumb
 * control. React Native has no twin-thumb slider, and dragging two thumbs over
 * 47 steps is fiddly on a phone, so the presets carry the common cases and two
 * clamped single-thumb sliders handle custom ranges. Clamping matches the web
 * build: neither bound may cross the other. */

export function RangePicker({
  range,
  onChange,
}: {
  range: Range;
  onChange: (r: Range) => void;
}) {
  // Remounts the sliders when a value is set from outside a drag (presets, or a
  // clamped drag), so the thumb snaps back to the value the state actually holds.
  const [sliderKey, setSliderKey] = useState(0);
  const resync = () => setSliderKey((k) => k + 1);

  const list = pool(range);
  const first = list[0];
  const last = list[list.length - 1];

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>Presidents in play</Text>
        <Text style={styles.value}>{rangeText(range)}</Text>
      </View>

      <View style={styles.chips}>
        {PRESETS.map((p) => {
          const on = rangesEqual(range, { lo: p.lo, hi: p.hi });
          return (
            <Pressable
              key={p.label}
              onPress={() => {
                onChange(makeRange(p.lo, p.hi));
                resync();
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={({ pressed }) => [
                styles.chip,
                on && styles.chipOn,
                pressed && styles.chipPressed,
              ]}>
              <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Bound
        key={`lo-${sliderKey}`}
        label="From"
        value={range.lo}
        onChange={(v) => onChange({ lo: Math.min(v, range.hi), hi: range.hi })}
        onRelease={(v) => v > range.hi && resync()}
      />
      <Bound
        key={`hi-${sliderKey}`}
        label="To"
        value={range.hi}
        onChange={(v) => onChange({ lo: range.lo, hi: Math.max(v, range.lo) })}
        onRelease={(v) => v < range.lo && resync()}
      />

      <Text style={styles.count}>
        {list.length} {list.length === 1 ? 'term' : 'terms'}
        {first && last ? ` — ${first.name} to ${last.name}` : ''}
      </Text>
    </View>
  );
}

function Bound({
  label,
  value,
  onChange,
  onRelease,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  onRelease: (v: number) => void;
}) {
  return (
    <View style={styles.bound}>
      <Text style={styles.boundLabel}>{label}</Text>
      <Slider
        style={styles.slider}
        minimumValue={NO_MIN}
        maximumValue={NO_MAX}
        step={1}
        value={value}
        onValueChange={onChange}
        onSlidingComplete={onRelease}
        minimumTrackTintColor={colors.brick}
        maximumTrackTintColor={colors.tan}
        thumbTintColor={colors.brick}
        accessibilityLabel={`${label} presidency number`}
      />
      <Text style={styles.boundValue}>#{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { ...type.heading, fontSize: 17 },
  value: {
    fontFamily: fonts.serif,
    fontSize: 15,
    color: colors.brown,
    fontVariant: ['tabular-nums'],
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  chipOn: { backgroundColor: colors.brick, borderColor: colors.brick },
  chipPressed: { opacity: 0.7 },
  chipLabel: { fontSize: 14, color: colors.brown },
  chipLabelOn: { color: colors.paperWarm },
  bound: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  boundLabel: { ...type.small, width: 38 },
  slider: { flex: 1, height: 40 },
  boundValue: {
    ...type.small,
    width: 34,
    textAlign: 'right',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  count: { ...type.small, color: colors.stone },
});
