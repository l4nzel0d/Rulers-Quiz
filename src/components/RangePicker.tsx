import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { Chip } from '@/components/Chip';
import type { Domain } from '@/lib/domain';
import {
  bounds,
  clampNo,
  covers,
  makeRange,
  pool,
  selectionText,
  toggleSpan,
  type Range,
  type Selection,
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
 * touch outside the selected band always grabs the bound on that side.
 *
 * The slider is optional. A domain that never shows its `no` sets slider:false
 * and the chips become the whole control: an arbitrary numeric span means
 * nothing to a player who is never told the numbers.
 *
 * That is also what decides how the chips behave. Where the slider owns the
 * range, a chip is a shortcut into it and picking one replaces the span — the
 * slider has no way to draw a gap, so it must not be handed one. Where the chips
 * *are* the control they are a set: each toggles, and "Романовы + Россия" leaves
 * the Soviet period out. Both cases hand up a Selection; only the slider domain
 * promises it will always hold exactly one span. */

const THUMB = 22; // 1.35rem

type Bound = 'lo' | 'hi';

/** Mutable state the pan handlers read. They are created once, so they cannot
 *  close over props — see the effect below that keeps this current. */
type Live = {
  domain: Domain;
  range: Range;
  onChange: (r: Range) => void;
  width: number;
  bound: Bound;
  from: number;
};

export function RangePicker({
  domain,
  range,
  onChange,
}: {
  domain: Domain;
  range: Selection;
  onChange: (r: Selection) => void;
}) {
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<Bound | null>(null);

  const span = useMemo(() => bounds(domain), [domain]);

  /* The slider edits one span, and a slider domain's selection only ever holds
   * one — see parseSelectionIn, which collapses anything else on the way in.
   * Every move it makes replaces the selection outright. */
  const sliderRange = range[0];
  const setSliderRange = (r: Range) => onChange([r]);

  const live = useRef<Live>({
    domain,
    range: sliderRange,
    onChange: setSliderRange,
    width: 0,
    bound: 'lo',
    from: span.lo,
  });
  useEffect(() => {
    live.current.domain = domain;
    live.current.range = sliderRange;
    live.current.onChange = setSliderRange;
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
        const v = valueAt(s.domain, e.nativeEvent.locationX, s.width);
        s.bound = nearestBound(v, s.range);
        s.from = v;
        setActive(s.bound);
        apply(s, v); // tap anywhere on the track moves the nearer thumb there
      },
      onPanResponderMove: (_e, g) => {
        const s = live.current;
        const total = spanOf(s.domain);
        apply(s, clampNo(s.domain, s.from + Math.round((g.dx / usable(s.width)) * total)));
      },
      onPanResponderRelease: () => setActive(null),
      onPanResponderTerminate: () => setActive(null),
    })
  );

  const { strings, accent } = domain;
  const list = pool(domain, range);
  const first = list[0];
  const last = list[list.length - 1];
  const loX = offset(domain, sliderRange.lo, width);
  const hiX = offset(domain, sliderRange.hi, width);

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>{strings.rangeTitle}</Text>
        <Text style={[styles.value, { color: accent }]}>{selectionText(domain, range)}</Text>
      </View>

      {domain.slider ? (
        <View
          style={styles.slider}
          onLayout={(e: LayoutChangeEvent) => {
            const w = e.nativeEvent.layout.width;
            live.current.width = w;
            setWidth(w);
          }}
          {...pan.panHandlers}>
          <View style={styles.rail} />
          <View
            style={[
              styles.fill,
              { left: loX + THUMB / 2, width: hiX - loX, backgroundColor: accent },
            ]}
          />

          <Thumb
            label={strings.thumbLo}
            value={sliderRange.lo}
            span={span}
            accent={accent}
            x={loX}
            active={active === 'lo'}
            onNudge={(v) =>
              setSliderRange({
                lo: Math.min(clampNo(domain, v), sliderRange.hi),
                hi: sliderRange.hi,
              })
            }
          />
          <Thumb
            label={strings.thumbHi}
            value={sliderRange.hi}
            span={span}
            accent={accent}
            x={hiX}
            active={active === 'hi'}
            onNudge={(v) =>
              setSliderRange({
                lo: sliderRange.lo,
                hi: Math.max(clampNo(domain, v), sliderRange.lo),
              })
            }
          />
        </View>
      ) : null}

      <View style={styles.presets}>
        {domain.presets.map((p) => (
          <Chip
            key={p.label}
            label={p.label}
            // Lit when the era is wholly in play, however it got there: the chip
            // for the Soviet period lights whether it was tapped or arrived
            // inside "Все". Two chips tapped in turn therefore agree with the
            // readout.
            on={covers(range, p)}
            onPress={() =>
              onChange(
                domain.slider
                  ? [makeRange(domain, p.lo, p.hi)]
                  : toggleSpan(domain, range, { lo: p.lo, hi: p.hi })
              )
            }
            accessibilityRole={domain.slider ? 'button' : 'checkbox'}
          />
        ))}
      </View>

      {/* The two ends only describe the pool while it is one run. Across a gap
        * "Михаил Фёдорович … Путин" would name everyone in between as well, so a
        * gapped selection shows the count alone and lets the chips say the rest. */}
      <Text style={styles.count}>
        {strings.count(list.length)}
        {range.length === 1 && first && last ? strings.spanNames(first.name, last.name) : ''}
      </Text>
    </View>
  );
}

function Thumb({
  label,
  value,
  span,
  accent,
  x,
  active,
  onNudge,
}: {
  label: string;
  value: number;
  span: Range;
  accent: string;
  x: number;
  active: boolean;
  onNudge: (v: number) => void;
}) {
  return (
    <View
      // Absolute position is driven by state, so nothing has to be remounted
      // when a preset or a clamp moves a thumb from outside the drag.
      style={[styles.thumb, { left: x, borderColor: accent }, active && styles.thumbActive]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: span.lo, max: span.hi, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onNudge(value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))
      }
    />
  );
}

/** How many steps the track covers. Never zero — a one-record domain would
 *  otherwise divide by it. */
function spanOf(domain: Domain): number {
  const { lo, hi } = bounds(domain);
  return Math.max(1, hi - lo);
}

/** Track pixels the thumb centre can travel across. */
function usable(width: number): number {
  return Math.max(1, width - THUMB);
}

function offset(domain: Domain, value: number, width: number): number {
  const { lo } = bounds(domain);
  return ((value - lo) / spanOf(domain)) * Math.max(0, width - THUMB);
}

function valueAt(domain: Domain, x: number, width: number): number {
  const { lo } = bounds(domain);
  return clampNo(domain, lo + Math.round(((x - THUMB / 2) / usable(width)) * spanOf(domain)));
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
  // Label left, readout right — but the readout is a sentence, not a number.
  // "Романовы + Советский период" and "Founding + 19th c." are both wider than
  // the space left beside the label, and a Text in a row does not shrink on its
  // own (yoga's flexShrink defaults to 0), so it used to run off the card. The
  // wrap drops it onto a line of its own instead; flexShrink then lets it break
  // internally in the case where even a full line is not enough.
  head: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    columnGap: 16,
    rowGap: 2,
  },
  title: type.eyebrow,
  value: {
    flexShrink: 1,
    fontFamily: fonts.serifBold,
    fontSize: 17,
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
  fill: { position: 'absolute', height: 5, borderRadius: radius.pill },
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

  // .presets — styles.css:318. The chip itself is src/components/Chip.tsx.
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  count: { fontSize: 13, lineHeight: 19, color: colors.muted },
});
