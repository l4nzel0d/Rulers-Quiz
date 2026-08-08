import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/AppBar';
import { PRESIDENTS } from '@/data/presidents';
import { yearsText } from '@/lib/answers';
import { MAX_CONTENT_WIDTH, colors, fonts, spacing, type } from '@/theme';

export default function ListScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <AppBar title={`All ${PRESIDENTS.length} terms`} showBack />

      {/* The width cap lives on the list itself, not its content container:
          inside a cell wrapper a percentage width resolves against the
          shrink-wrapped cell, which collapses every row to its text. */}
      <View style={styles.centre}>
        <FlatList
          data={PRESIDENTS}
          keyExtractor={(p) => String(p.no)}
          style={styles.list}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            /* Replaces the web build's .row:nth-child(even) zebra striping. */
            <View style={[styles.row, index % 2 === 1 && styles.rowAlt]}>
              <Text style={styles.no}>#{item.no}</Text>
              <View style={styles.body}>
                <Text style={styles.name}>{item.name}</Text>
                {item.givenName ? <Text style={styles.born}>born {item.givenName}</Text> : null}
              </View>
              <Text style={styles.years}>{yearsText(item)}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centre: { flex: 1, alignItems: 'center' },
  list: { flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH },
  content: { paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowAlt: { backgroundColor: 'rgba(242, 238, 228, 0.55)' },
  no: {
    ...type.small,
    width: 34,
    color: colors.brown,
    fontVariant: ['tabular-nums'],
  },
  body: { flex: 1 },
  name: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink },
  born: { ...type.small, fontSize: 12, color: colors.stone },
  years: { ...type.small, color: colors.muted, fontVariant: ['tabular-nums'] },
});
