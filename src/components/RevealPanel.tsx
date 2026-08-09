import { StyleSheet, Text, View } from 'react-native';

import { yearsText } from '@/lib/answers';
import { showsNumber, type Domain, type Ruler } from '@/lib/domain';
import { colors, fonts, radius, type } from '@/theme';

/** .reveal — styles.css:484. Shows the verdict and every term that counted as
 *  an answer: both terms for Cleveland and Trump when the name was the prompt,
 *  and both of Putin's under /ru. The number column appears only in a domain
 *  that numbers its rulers. */
export function RevealPanel({
  domain,
  allRight,
  terms,
  givenName,
}: {
  domain: Domain;
  allRight: boolean;
  terms: Ruler[];
  givenName?: string;
}) {
  const { strings, accent } = domain;
  const withNumber = showsNumber(domain);

  return (
    <View style={[styles.panel, allRight ? styles.panelOk : styles.panelBad]}>
      <Text style={[styles.verdict, allRight ? styles.verdictOk : styles.verdictBad]}>
        {allRight ? strings.correct : strings.notQuite}
      </Text>

      {terms.map((r) => (
        <View key={r.no} style={styles.term}>
          {withNumber ? <Text style={[styles.termNo, { color: accent }]}>#{r.no}</Text> : null}
          <Text style={styles.termName}>{r.name}</Text>
          <Text style={styles.termYears}>{yearsText(r, strings.present)}</Text>
        </View>
      ))}

      {givenName ? (
        <Text style={styles.born}>
          {strings.bornPrefix} <Text style={styles.bornName}>{givenName}</Text>{' '}
          {strings.bornSuffix}
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
  termNo: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  termName: { fontFamily: fonts.serifBold, fontSize: 16, color: colors.ink, flexShrink: 1 },
  termYears: { fontSize: 15, color: colors.muted, fontVariant: ['tabular-nums'] },
  born: { fontSize: 14, lineHeight: 20, fontStyle: 'italic', color: colors.muted, marginTop: 10 },
  // .born strong — styles.css:535: the name itself drops back out of italic.
  bornName: { fontStyle: 'normal', fontWeight: '600', color: colors.brown },
});
