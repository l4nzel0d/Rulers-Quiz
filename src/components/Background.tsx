import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { colors, scrim } from '@/theme';

/** The fixed full-bleed photo plus its readability scrim. In the web build these
 *  were body::before / body::after; here they sit behind the router's screens. */
export function Background() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={require('@/assets/images/background.jpg')}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
      <LinearGradient
        colors={[...scrim.colors]}
        locations={[...scrim.locations]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export const backgroundFallbackColor = colors.tan;
