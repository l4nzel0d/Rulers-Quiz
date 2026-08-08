import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/AppBar';
import { Card } from '@/components/Card';
import { ModeCard } from '@/components/ModeCard';
import { RangePicker } from '@/components/RangePicker';
import { TextLink } from '@/components/TextLink';
import { PRESIDENTS } from '@/data/presidents';
import { MODES, MODE_KEYS } from '@/lib/fields';
import { rangeSlug } from '@/lib/range';
import { useRange } from '@/state/RangeContext';
import { type, useLayout } from '@/theme';

export default function MenuScreen() {
  const { range, setRange } = useRange();
  const insets = useSafeAreaInsets();
  const { wide, maxWidth, gutter } = useLayout();

  return (
    <View style={styles.root}>
      <AppBar />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: gutter, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, { maxWidth }]}>
          {/* app.js:267 */}
          <Text style={styles.lede}>
            Every round gives you one piece of a presidency and asks for the other two. Questions
            keep coming until you stop.
          </Text>

          <Card style={styles.range}>
            <RangePicker range={range} onChange={setRange} />
          </Card>

          {/* .modes — one column, two past the 40rem breakpoint (styles.css:583). */}
          <View style={[styles.modes, wide && styles.modesWide]}>
            {MODE_KEYS.map((key) => (
              <View key={key} style={wide ? styles.modeHalf : undefined}>
                <ModeCard
                  title={MODES[key].title}
                  blurb={MODES[key].blurb}
                  onPress={() =>
                    router.push({
                      pathname: '/quiz/[mode]',
                      params: { mode: key, range: rangeSlug(range) },
                    })
                  }
                />
              </View>
            ))}
          </View>

          <TextLink
            label={`Browse all ${PRESIDENTS.length} terms →`}
            onPress={() => router.push('/list')}
          />
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
  range: { paddingTop: 16, paddingBottom: 18, paddingHorizontal: 18 },
  modes: { gap: 11 },
  modesWide: { flexDirection: 'row', flexWrap: 'wrap' },
  // Two per row with the 11px gap accounted for.
  modeHalf: { width: '50%', flexGrow: 1, flexBasis: 0, minWidth: 240 },
});
