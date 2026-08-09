import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Background } from '@/components/Background';
import { US } from '@/domains/us';
import { DomainProvider } from '@/state/DomainContext';
import { RangeProvider } from '@/state/RangeContext';

/** Everything under /us runs inside its domain: its photograph, its accent, and
 *  its own stored range. The Russian layout is this file with RU swapped in. */
export default function USLayout() {
  return (
    <DomainProvider domain={US}>
      <View style={styles.root}>
        {/* Outside RangeProvider on purpose: that provider withholds its subtree
         * until the stored range is read, and this keeps the domain's own ground
         * on screen through the wait. */}
        <Background source={US.background} />
        <RangeProvider domain={US}>
          <Slot />
        </RangeProvider>
      </View>
    </DomainProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
