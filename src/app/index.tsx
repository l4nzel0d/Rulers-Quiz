import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/AppBar';
import { Card } from '@/components/Card';
import { ModeCard } from '@/components/ModeCard';
import { RangePicker } from '@/components/RangePicker';
import { MODES, MODE_KEYS } from '@/lib/fields';
import { pool, rangeSlug } from '@/lib/range';
import { useRange } from '@/state/RangeContext';
import { MAX_CONTENT_WIDTH, colors, spacing, type } from '@/theme';

export default function MenuScreen() {
  const { range, setRange } = useRange();
  const insets = useSafeAreaInsets();
  const count = pool(range).length;

  return (
    <View style={styles.root}>
      <AppBar title="US Presidents Quiz" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <Text style={styles.intro}>
            Every question shows one of three things — the presidency number, the full name, or the
            years in office. You supply the other two.
          </Text>

          <Card style={styles.rangeCard}>
            <RangePicker range={range} onChange={setRange} />
          </Card>

          <View style={styles.modes}>
            {MODE_KEYS.map((key) => (
              <ModeCard
                key={key}
                title={MODES[key].title}
                blurb={MODES[key].blurb}
                onPress={() =>
                  router.push({
                    pathname: '/quiz/[mode]',
                    params: { mode: key, range: rangeSlug(range) },
                  })
                }
              />
            ))}
          </View>

          <Pressable
            onPress={() => router.push('/list')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.browse, pressed && styles.browsePressed]}>
            <Text style={styles.browseText}>Browse all {count} terms →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  inner: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, gap: spacing.lg },
  intro: { ...type.body, color: colors.muted },
  rangeCard: { paddingVertical: spacing.lg },
  modes: { gap: spacing.md },
  browse: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  browsePressed: { opacity: 0.6 },
  browseText: { ...type.body, color: colors.brick, textDecorationLine: 'underline' },
});
