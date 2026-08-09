import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/AppBar';
import { Background } from '@/components/Background';
import { ModeCard } from '@/components/ModeCard';
import { RU_CORE } from '@/domains/ru-core';
import { US_CORE } from '@/domains/us-core';
import { chooserGradient, type, useLayout } from '@/theme';

/* The chooser. It sits above both domains, so there is no DomainProvider here —
 * AppBar and ModeCard fall back to the app's own name and accent. The cores are
 * enough for a title and a count; the asset-bearing modules stay unimported
 * until you pick a side, which keeps the other domain's images out of the
 * first bundle the player loads. */

const DOMAINS = [
  {
    key: 'us' as const,
    href: '/us' as const,
    title: US_CORE.brand,
    blurb: `${US_CORE.records.length} terms, from George Washington to today.`,
  },
  {
    key: 'ru' as const,
    href: '/ru' as const,
    title: RU_CORE.brand,
    // Through the domain's own pluraliser: "31 правитель", not "31 правлений".
    blurb: `${RU_CORE.strings.count(RU_CORE.records.length)} — Романовы, советский период, современная Россия.`,
  },
];

export default function ChooserScreen() {
  const insets = useSafeAreaInsets();
  const { wide, maxWidth, gutter } = useLayout();

  return (
    <View style={styles.root}>
      {/* The chooser sits above both domains, so it carries its own ground
       * rather than inheriting one — and having no photo of its own, it paints
       * the palette's gradient in place of the scrim. */}
      <Background source={null} gradient={chooserGradient} />
      <AppBar />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: gutter, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.inner, { maxWidth }]}>
          <Text style={styles.lede}>
            Two sets of rulers, one quiz. Pick a side — each keeps its own range and its own
            score.
          </Text>

          <View style={[styles.domains, wide && styles.domainsWide]}>
            {DOMAINS.map((d) => (
              <View key={d.key} style={wide ? styles.half : undefined}>
                <ModeCard title={d.title} blurb={d.blurb} onPress={() => router.push(d.href)} />
              </View>
            ))}
          </View>
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
  domains: { gap: 11 },
  domainsWide: { flexDirection: 'row', flexWrap: 'wrap' },
  half: { width: '50%', flexGrow: 1, flexBasis: 0, minWidth: 240 },
});
