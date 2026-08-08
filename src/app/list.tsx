import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/AppBar';
import { surface } from '@/components/Card';
import { TextLink } from '@/components/TextLink';
import { PRESIDENTS } from '@/data/presidents';
import { yearsText } from '@/lib/answers';
import { cardShadow, colors, type, useLayout } from '@/theme';

const PEOPLE = new Set(PRESIDENTS.map((p) => p.name)).size;

export default function ListScreen() {
  const insets = useSafeAreaInsets();
  const { wide, maxWidth, gutter } = useLayout();

  return (
    <View style={styles.root}>
      <AppBar />

      {/* A plain ScrollView rather than a FlatList: 47 rows is nothing to
          render, and it lets the whole list sit inside one .rows card with the
          rounded corners clipping the striping, as the web build does. */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: gutter, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, { maxWidth }]}>
          {/* app.js:305 */}
          <Text style={styles.lede}>
            {PRESIDENTS.length} terms, {PEOPLE} people. Cleveland and Trump each appear twice —
            nonconsecutive terms get separate numbers.
          </Text>

          <View style={styles.rows}>
            {PRESIDENTS.map((p, i) => (
              <View
                key={p.no}
                style={[
                  styles.row,
                  wide && styles.rowWide,
                  i > 0 && styles.rowRule,
                  // .row:nth-child(even) — styles.css:369
                  i % 2 === 1 && styles.rowAlt,
                ]}>
                <Text style={styles.no}>{p.no}</Text>
                <View style={styles.name}>
                  <Text style={styles.nameText}>{p.name}</Text>
                  {p.givenName ? <Text style={styles.given}>born {p.givenName}</Text> : null}
                </View>
                <Text style={[styles.years, wide && styles.yearsWide]}>{yearsText(p)}</Text>
              </View>
            ))}
          </View>

          <TextLink label="← Back to modes" onPress={() => router.navigate('/')} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { alignItems: 'center', paddingTop: 16 },
  inner: { width: '100%', gap: 16 },
  lede: type.lede,

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

  no: { width: 38, fontSize: 16, fontWeight: '700', color: colors.brick, fontVariant: ['tabular-nums'] },
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
  yearsWide: { width: 'auto', marginLeft: 0 },
});
