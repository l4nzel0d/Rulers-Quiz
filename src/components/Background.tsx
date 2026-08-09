import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { colors, scrim } from '@/theme';

/** The fixed full-bleed photo plus its readability scrim. In the web build these
 *  were body::before / body::after; here they sit behind the router's screens.
 *  The photo comes from the surrounding domain; a domain without one yet paints
 *  the scrim over the flat ground below. */
export function Background({ source }: { source: ImageSourcePropType | null }) {
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
        colors={[...scrim.colors]}
        locations={[...scrim.locations]}
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
