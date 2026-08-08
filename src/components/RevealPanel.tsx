import { StyleSheet, Text, View } from 'react-native';

import type { President } from '@/data/presidents';
import { yearsText } from '@/lib/answers';
import { colors, fonts, radius, spacing, type } from '@/theme';

/** Shows the verdict and every term that counted as an answer — both terms for
 *  Cleveland and Trump when the name was the prompt. */
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
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  panelOk: { backgroundColor: colors.okBg, borderColor: colors.ok },
  panelBad: { backgroundColor: colors.badBg, borderColor: colors.bad },
  verdict: { fontFamily: fonts.serif, fontSize: 18, marginBottom: spacing.xs },
  verdictOk: { color: colors.ok },
  verdictBad: { color: colors.bad },
  term: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, flexWrap: 'wrap' },
  termNo: {
    ...type.small,
    color: colors.brown,
    width: 34,
    fontVariant: ['tabular-nums'],
  },
  termName: { ...type.body, flexShrink: 1, fontFamily: fonts.serif },
  termYears: { ...type.small, color: colors.stone, fontVariant: ['tabular-nums'] },
  born: { ...type.small, marginTop: spacing.xs, color: colors.muted },
  bornName: { fontFamily: fonts.serif, color: colors.ink },
});
