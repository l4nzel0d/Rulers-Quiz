import { useEffect, useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import {
  NO_MAX,
  NO_MIN,
  PRESETS,
  clampNo,
  makeRange,
  pool,
  rangeText,
  rangesEqual,
  type Range,
} from '@/lib/range';
import { colors, fonts, radius, type } from '@/theme';

/* .range — styles.css:195. Head, twin-thumb slider, preset chips, live count,
 * in that order.
 *
 * React Native has no twin-thumb primitive, so the slider is built on
 * PanResponder (core RN — no extra dependency, and it behaves the same in Expo
 * Go, on device, and on web). One responder covers the whole track and decides
 * which thumb it is moving on touch-down. That is what makes the web build's
 * z-index hack (app.js:220-222) unnecessary: when both thumbs sit on the same
 * number, the touch position alone says which one the user meant, because a
 * touch outside the selected band always grabs the bound on that side. */

const THUMB = 22; // 1.35rem
const SPAN = NO_MAX - NO_MIN;

type Bound = 'lo' | 'hi';

/** Mutable state the pan handlers read. They are created once, so they cannot
 *  close over props — see the effect below that keeps this current. */
type Live = {
  range: Range;
  onChange: (r: Range) => void;
  width: number;
  bound: Bound;
  from: number;
};

export function RangePicker({
  range,
  onChange,
}: {
  range: Range;
  onChange: (r: Range) => void;
}) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<Bound | null>(null);

  const live = useRef<Live>({ range, onChange, width: 0, bound: 'lo', from: NO_MIN });
  useEffect(() => {
    live.current.range = range;
    live.current.onChange = onChange;
  });

  // Created once: the responder system dispatches to whichever handlers the
  // view currently holds, so a fresh PanResponder mid-drag would lose the
  // gesture's accumulated dx.
  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // Capture-phase claims plus a refused termination request. Without these
      // the enclosing ScrollView takes the responder over as soon as the finger
      // moves, so a drag registers as a tap and the thumb never follows.
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (e) => {
        const s = live.current;
        const v = valueAt(e.nativeEvent.locationX, s.width);
        s.bound = nearestBound(v, s.range);
        s.from = v;
        setActive(s.bound);
        apply(s, v); // tap anywhere on the track moves the nearer thumb there
      },
      onPanResponderMove: (_e, g) => {
        const s = live.current;
        apply(s, clampNo(s.from + Math.round((g.dx / usable(s.width)) * SPAN)));
      },
      onPanResponderRelease: () => setActive(null),
      onPanResponderTerminate: () => setActive(null),
    }),
  );

  const list = pool(range);
  const first = list[0];
  const last = list[list.length - 1];
  const loX = offset(range.lo, width);
  const hiX = offset(range.hi, width);

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>Presidents in play</Text>
        <Text style={styles.value}>{rangeText(range)}</Text>
      </View>

      <View
        style={styles.slider}
        onLayout={(e: LayoutChangeEvent) => {
          const w = e.nativeEvent.layout.width;
          live.current.width = w;
          setWidth(w);
        }}
        {...pan.panHandlers}>
        <View style={styles.rail} />
        <View style={[styles.fill, { left: loX + THUMB / 2, width: hiX - loX }]} />

        <Thumb
          label="Lowest presidency number"
          value={range.lo}
          x={loX}
          active={active === 'lo'}
          onNudge={(v) => onChange({ lo: Math.min(clampNo(v), range.hi), hi: range.hi })}
        />
        <Thumb
          label="Highest presidency number"
          value={range.hi}
          x={hiX}
          active={active === 'hi'}
          onNudge={(v) => onChange({ lo: range.lo, hi: Math.max(clampNo(v), range.lo) })}
        />
      </View>

      <View style={styles.presets}>
        {PRESETS.map((p) => {
          const on = rangesEqual(range, { lo: p.lo, hi: p.hi });
          return (
            <Pressable
              key={p.label}
              onPress={() => onChange(makeRange(p.lo, p.hi))}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              hitSlop={6}
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

      <Text style={styles.count}>
        {list.length} {list.length === 1 ? 'term' : 'terms'}
        {first && last ? ` — ${first.name} to ${last.name}` : ''}
      </Text>
    </View>
  );
}

function Thumb({
  label,
  value,
  x,
  active,
  onNudge,
}: {
  label: string;
  value: number;
  x: number;
  active: boolean;
  onNudge: (v: number) => void;
}) {
  return (
    <View
      // Absolute position is driven by state, so nothing has to be remounted
      // when a preset or a clamp moves a thumb from outside the drag.
      style={[styles.thumb, { left: x }, active && styles.thumbActive]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: NO_MIN, max: NO_MAX, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onNudge(value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))
      }
    />
  );
}

/** Track pixels the thumb centre can travel across. */
function usable(width: number): number {
  return Math.max(1, width - THUMB);
}

function offset(value: number, width: number): number {
  return ((value - NO_MIN) / SPAN) * Math.max(0, width - THUMB);
}

function valueAt(x: number, width: number): number {
  return clampNo(NO_MIN + Math.round(((x - THUMB / 2) / usable(width)) * SPAN));
}

/** Which bound a touch at `v` is asking to move. Outside the selected band it is
 *  always the bound on that side — including when both sit on the same number,
 *  which is the case the web build needed a z-index hack for. */
function nearestBound(v: number, { lo, hi }: Range): Bound {
  if (v < lo) return 'lo';
  if (v > hi) return 'hi';
  return v - lo <= hi - v ? 'lo' : 'hi';
}

/** Moves the active bound to `v`, clamped so neither bound crosses the other —
 *  the same rule as the web build's paired inputs (app.js:243-248). */
function apply(s: Live, v: number): void {
  const { lo, hi } = s.range;
  const next: Range = s.bound === 'lo' ? { lo: Math.min(v, hi), hi } : { lo, hi: Math.max(v, lo) };
  if (next.lo !== lo || next.hi !== hi) s.onChange(next);
}

const styles = StyleSheet.create({
  wrap: { gap: 11 }, // 0.7rem
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 },
  title: type.eyebrow,
  value: {
    fontFamily: fonts.serifBold,
    fontSize: 17,
    color: colors.brick,
    fontVariant: ['tabular-nums'],
  },

  // .slider — styles.css:233. The 10px inset is the web build's
  // `margin: 0 0.6rem`, leaving room for a thumb parked at either extreme.
  slider: { height: 26, justifyContent: 'center', marginHorizontal: 10 },
  rail: {
    position: 'absolute',
    left: THUMB / 2,
    right: THUMB / 2,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.tan,
  },
  fill: { position: 'absolute', height: 5, borderRadius: radius.pill, backgroundColor: colors.brick },
  thumb: {
    position: 'absolute',
    // Load-bearing: locationX is measured against the *event target*, so a touch
    // landing on a thumb would report 0-22px and snap that thumb to the start of
    // the track. Taking the thumbs out of hit-testing keeps the track as the
    // target for every touch, including one that starts on a thumb — which is
    // the ordinary way to drag one. Screen readers are unaffected: they
    // dispatch accessibility actions, not touches.
    pointerEvents: 'none',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.paperWarm,
    borderWidth: 3,
    borderColor: colors.brick,
    ...Platform.select({
      android: { elevation: 2 },
      default: {
        shadowColor: '#2f2721',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
      },
    }),
  },
  // Replaces the web build's :focus-visible ring on the thumb.
  thumbActive: { transform: [{ scale: 1.15 }] },

  // .presets / .chip — styles.css:318
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.tan,
    backgroundColor: colors.chip,
  },
  chipOn: { backgroundColor: colors.brick, borderColor: 'transparent' },
  chipPressed: { borderColor: colors.brick },
  chipLabel: { fontSize: 13, fontWeight: '600', color: colors.brown },
  chipLabelOn: { color: colors.paper },

  count: { fontSize: 13, lineHeight: 19, color: colors.muted },
});
