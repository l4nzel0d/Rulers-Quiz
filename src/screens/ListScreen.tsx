import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/AppBar';
import { surface } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { RulerCard } from '@/components/RulerCard';
import { TextLink } from '@/components/TextLink';
import { yearsText } from '@/lib/answers';
import { showsNumber, type Ruler } from '@/lib/domain';
import { loadListView, saveListView, type ListView } from '@/lib/storage';
import { useDomain } from '@/state/DomainContext';
import { cardShadow, colors, type, useLayout } from '@/theme';

export function ListScreen() {
  const domain = useDomain();
  const insets = useSafeAreaInsets();
  const { wide, maxWidth, gutter } = useLayout();

  /* Rows or portrait cards. Read back after the first paint rather than gated
   * on: RangeProvider may withhold its subtree because the wrong range would ask
   * the wrong questions, but the wrong view is only the wrong view, and one
   * frame of rows costs less than a screen that starts blank. */
  const [view, setView] = useState<ListView>('list');
  useEffect(() => {
    let cancelled = false;
    loadListView().then((stored) => {
      if (!cancelled) setView(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Write-through, as RangeContext does with the range.
  const choose = (next: ListView) => {
    setView(next);
    void saveListView(next);
  };

  const records = domain.records;
  const people = new Set(records.map((r) => r.name)).size;
  const withNumber = showsNumber(domain);
  const home = domain.key === 'us' ? '/us' : '/ru';

  const padding = { paddingHorizontal: gutter, paddingBottom: insets.bottom + 24 };

  /* Cards pair up once there is room — the same breakpoint the mode tiles use.
   * A row of two with an odd number of records would stretch the last card
   * across the whole row, so it gets a blank partner; both 47 and 31 are odd, so
   * this is the normal case rather than the edge one. */
  const columns = wide ? 2 : 1;
  const cells: (Ruler | null)[] =
    columns === 2 && records.length % 2 === 1 ? [...records, null] : records;

  const head = (
    <View style={[styles.column, styles.inner, { maxWidth }]}>
      {/* app.js:305 */}
      <Text style={styles.lede}>{domain.strings.listLede(records.length, people)}</Text>

      <View style={styles.views} accessibilityRole="radiogroup">
        <Chip
          label={domain.strings.viewList}
          on={view === 'list'}
          onPress={() => choose('list')}
          accessibilityRole="radio"
        />
        <Chip
          label={domain.strings.viewCards}
          on={view === 'cards'}
          onPress={() => choose('cards')}
          accessibilityRole="radio"
        />
      </View>
    </View>
  );

  const foot = (
    <View style={[styles.column, { maxWidth }]}>
      <TextLink label={domain.strings.back} onPress={() => router.navigate(home)} />
    </View>
  );

  return (
    <View style={styles.root}>
      <AppBar />

      {view === 'cards' ? (
        /* A FlatList here and a ScrollView below, and the difference is the
         * images. Forty-seven rows of text are nothing to mount at once; forty-
         * seven 960x1280 portraits are twelve megabytes of source and far more
         * decoded, and a plain ScrollView would ask for every one of them before
         * the first is on screen. Virtualising keeps that to a windowful. */
        <FlatList
          /* numColumns cannot change on a mounted list, and the breakpoint can
           * cross under a rotation or a resized browser window. Keying on it
           * remounts rather than throwing. */
          key={columns}
          numColumns={columns}
          data={cells}
          keyExtractor={(r, i) => (r ? String(r.no) : `blank-${i}`)}
          renderItem={({ item }) => (
            // One column: the cell is the content column itself. Two: the row
            // wrapper owns that width and the cell takes half of it, growing to
            // the row's height so a pair whose captions differ still squares off
            // at the bottom.
            <View style={columns === 2 ? styles.cell : [styles.column, { maxWidth }]}>
              {item ? (
                <RulerCard
                  domain={domain}
                  rec={item}
                  withNumber={withNumber}
                  style={columns === 2 && styles.grow}
                />
              ) : null}
            </View>
          )}
          columnWrapperStyle={columns === 2 ? [styles.column, styles.pair, { maxWidth }] : undefined}
          ListHeaderComponent={head}
          ListFooterComponent={foot}
          contentContainerStyle={[styles.content, padding]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          windowSize={5}
        />
      ) : (
        /* A plain ScrollView rather than a FlatList: a few dozen rows is nothing
           to render, and it lets the whole list sit inside one .rows card with
           the rounded corners clipping the striping, as the web build does. */
        <ScrollView
          contentContainerStyle={[styles.content, padding]}
          showsVerticalScrollIndicator={false}>
          {head}

          <View style={[styles.column, styles.rows, { maxWidth }]}>
            {records.map((r, i) => (
              <View
                key={r.no}
                style={[
                  styles.row,
                  wide && styles.rowWide,
                  i > 0 && styles.rowRule,
                  // .row:nth-child(even) — styles.css:369
                  i % 2 === 1 && styles.rowAlt,
                ]}>
                {withNumber ? (
                  <Text style={[styles.no, { color: domain.accent }]}>{r.no}</Text>
                ) : null}
                <View style={styles.name}>
                  <Text style={styles.nameText}>{r.name}</Text>
                  {r.givenName ? (
                    <Text style={styles.given}>
                      {domain.strings.bornPrefix} {r.givenName}
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.years,
                    !withNumber && styles.yearsFlush,
                    wide && styles.yearsWide,
                  ]}>
                  {yearsText(r, domain.strings.present)}
                </Text>
              </View>
            ))}
          </View>

          {foot}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  /* The gap does the spacing between the three blocks — and, in cards view,
     between every pair of cards, since the header, the cells and the footer are
     all children of this one container.

     The centring is per block (`column` below) rather than `alignItems` here on
     purpose. FlatList wraps every cell in a View of its own; under a centring
     container that wrapper is auto-width, so it shrinks to the caption and the
     card's `width: '100%'` has nothing definite to measure against — which is
     how a column of cards ends up a different width on every row. Leaving this
     container at the default stretch keeps the wrapper full-width, and each
     block centres itself inside it. */
  content: { paddingTop: 16, gap: 16 },
  /** Full width up to the layout's cap, centred in whatever is left. */
  column: { width: '100%', alignSelf: 'center' },
  inner: { gap: 16 },
  lede: type.lede,
  views: { flexDirection: 'row', gap: 6 },
  /** A row of two cards, and one half of it. */
  pair: { flexDirection: 'row', gap: 16 },
  cell: { flex: 1 },
  grow: { flex: 1 },

  // .rows — styles.css:352. overflow hidden so the striping is clipped by the
  // card's radius instead of squaring off its corners.
  rows: { ...surface, ...cardShadow, overflow: 'hidden' },

  /* Narrow layout mirrors the web build's grid areas: the number claims a
     2.4rem column and the years wrap to a second line under the name. */
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 11,
    paddingHorizontal: 16,
    columnGap: 11,
  },
  rowWide: { flexWrap: 'nowrap', alignItems: 'baseline', columnGap: 16 },
  rowRule: { borderTopWidth: 1, borderTopColor: colors.lineSolid },
  rowAlt: { backgroundColor: colors.rowAlt },

  no: { width: 38, fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  name: { flexGrow: 1, flexShrink: 1, flexBasis: 'auto', minWidth: 0 },
  nameText: { fontSize: 16, fontWeight: '600', color: colors.ink },
  given: { fontSize: 14, fontStyle: 'italic', color: colors.brown },
  years: {
    // Narrow: a full-width second line, indented past the number column.
    width: '100%',
    marginLeft: 49,
    fontSize: 14,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  // No number column to clear, so the second line starts at the text edge.
  yearsFlush: { marginLeft: 0 },
  yearsWide: { width: 'auto', marginLeft: 0 },
});
