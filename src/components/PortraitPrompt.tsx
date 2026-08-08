import { Image } from 'expo-image';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { PORTRAITS } from '@/components/portraits';
import { colors, radius } from '@/theme';

/* The portrait prompt. Sits where the given value's <Text> sits in the other
 * modes, so it carries the card's rhythm rather than the type scale.
 *
 * A centred 3:4 frame, filled rather than fitted: the sources' aspects run
 * 0.72-0.80, so contentFit="cover" crops the few percent of overhang instead of
 * letterboxing it. The crop is pinned to the top because these are portraits —
 * the face sits high in every one, and a centred crop would cut foreheads. */
export function PortraitPrompt({ no }: { no: number }) {
  const { height } = useWindowDimensions();
  const source = PORTRAITS[no];

  // Roughly a third of the screen: big enough to read a face, small enough to
  // leave all three fields and the Check button above the fold.
  const frameHeight = Math.max(220, Math.min(340, height * 0.34));

  return (
    <View style={[styles.frame, { height: frameHeight }]}>
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="top center"
          cachePolicy="memory-disk"
          transition={120}
          /* Without this the fade runs between two presidents, so the previous
           * question's answer is briefly visible under the new one. */
          recyclingKey={String(no)}
          accessible
          accessibilityRole="image"
          /* Deliberately not the president's name — on web the label becomes an
           * alt attribute, which would hand over the answer. */
          accessibilityLabel="Portrait of a US president"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    aspectRatio: 3 / 4,
    maxWidth: '100%',
    alignSelf: 'center',
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.tan,
    backgroundColor: colors.paperWarm,
    overflow: 'hidden',
  },
});
