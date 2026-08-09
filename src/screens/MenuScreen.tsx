import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/AppBar';
import { Card } from '@/components/Card';
import { ModeCard } from '@/components/ModeCard';
import { RangePicker } from '@/components/RangePicker';
import { TextLink } from '@/components/TextLink';
import { selectionSlug } from '@/lib/range';
import { useDomain } from '@/state/DomainContext';
import { useRange } from '@/state/RangeContext';
import { type, useLayout } from '@/theme';

/** The mode menu. Every tile comes from the domain's `modeKeys`, so a domain
 *  that has no number to give simply offers one tile fewer. */
export function MenuScreen() {
  const domain = useDomain();
  const { range, setRange } = useRange();
  const insets = useSafeAreaInsets();
  const { wide, maxWidth, gutter } = useLayout();

  // Spelled out per domain rather than built from the key, so typed routes keep
  // checking these.
  const quizPath = domain.key === 'us' ? '/us/quiz/[mode]' : '/ru/quiz/[mode]';
  const listPath = domain.key === 'us' ? '/us/list' : '/ru/list';

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
          <Text style={styles.lede}>{domain.strings.lede}</Text>

          <Card style={styles.range}>
            <RangePicker domain={domain} range={range} onChange={setRange} />
          </Card>

          {/* .modes — one column, two past the 40rem breakpoint (styles.css:583). */}
          <View style={[styles.modes, wide && styles.modesWide]}>
            {domain.modeKeys.map((key) => (
              <View key={key} style={wide ? styles.modeHalf : undefined}>
                <ModeCard
                  title={domain.modes[key].title}
                  blurb={domain.modes[key].blurb}
                  onPress={() =>
                    router.push({
                      pathname: quizPath,
                      params: { mode: key, range: selectionSlug(range) },
                    })
                  }
                />
              </View>
            ))}
          </View>

          <TextLink
            label={domain.strings.browse(domain.records.length)}
            onPress={() => router.push(listPath)}
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
