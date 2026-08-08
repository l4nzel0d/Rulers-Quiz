import { StyleSheet, Text, View } from 'react-native';

import type { President } from '@/data/presidents';
import { yearsText } from '@/lib/answers';
import { colors, fonts, radius, type } from '@/theme';

/** .reveal — styles.css:484. Shows the verdict and every term that counted as
 *  an answer: both terms for Cleveland and Trump when the name was the prompt. */
export function RevealPanel({
  allRight,
  terms,
  givenName,
}: {
  allRight: boolean;
  terms: President[];
  givenName?: string;
}) {
  return (
    <View style={[styles.panel, allRight ? styles.panelOk : styles.panelBad]}>
      <Text style={[styles.verdict, allRight ? styles.verdictOk : styles.verdictBad]}>
        {allRight ? 'Correct' : 'Not quite'}
      </Text>

      {terms.map((p) => (
        <View key={p.no} style={styles.term}>
          <Text style={styles.termNo}>#{p.no}</Text>
          <Text style={styles.termName}>{p.name}</Text>
          <Text style={styles.termYears}>{yearsText(p)}</Text>
        </View>
      ))}

      {givenName ? (
        <Text style={styles.born}>
          Born <Text style={styles.bornName}>{givenName}</Text> — either full name is accepted.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.input,
    borderWidth: 1,
  },
  panelOk: { backgroundColor: colors.okBg, borderColor: colors.okBorder },
  panelBad: { backgroundColor: colors.badBg, borderColor: colors.badBorder },
  verdict: { ...type.eyebrow, marginBottom: 8 },
  verdictOk: { color: colors.ok },
  verdictBad: { color: colors.bad },
  term: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  termNo: { fontSize: 16, fontWeight: '700', color: colors.brick, fontVariant: ['tabular-nums'] },
  termName: { fontFamily: fonts.serifBold, fontSize: 16, color: colors.ink, flexShrink: 1 },
  termYears: { fontSize: 15, color: colors.muted, fontVariant: ['tabular-nums'] },
  born: { fontSize: 14, lineHeight: 20, fontStyle: 'italic', color: colors.muted, marginTop: 10 },
  // .born strong — styles.css:535: the name itself drops back out of italic.
  bornName: { fontStyle: 'normal', fontWeight: '600', color: colors.brown },
});
