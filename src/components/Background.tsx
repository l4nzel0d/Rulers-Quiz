import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { colors, scrim } from '@/theme';

/** The fixed full-bleed photo plus its readability scrim. In the web build these
 *  were body::before / body::after; here they sit behind the router's screens.
 *  The photo comes from the surrounding domain; a domain without one yet paints
 *  the scrim over the flat ground below.
 *
 *  `gradient` replaces the scrim outright, for a screen that carries no photo
 *  and wants the ground itself to be the gradient rather than a wash over one. */
export function Background({
  source,
  gradient = scrim,
}: {
  source: ImageSourcePropType | null;
  // Tuples, not arrays: LinearGradient's own props demand at least two stops.
  gradient?: {
    colors: readonly [string, string, ...string[]];
    locations: readonly [number, number, ...number[]];
  };
}) {
  return (
    <View style={styles.fill}>
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
      ) : null}
      <LinearGradient
        colors={[...gradient.colors]}
        locations={[...gradient.locations]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // styles.css:52 paints #cbb99b under the photo; it shows only while the
  // bundled asset decodes, but it keeps that moment in the right key.
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    backgroundColor: '#cbb99b',
  },
});

export const backgroundFallbackColor = colors.tan;
