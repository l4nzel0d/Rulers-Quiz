// Imported per weight, not from the package root: the barrel re-exports all
// eight faces and Metro would bundle every one of them (~850KB).
import { Gelasio_400Regular } from '@expo-google-fonts/gelasio/400Regular';
import { Gelasio_700Bold } from '@expo-google-fonts/gelasio/700Bold';
import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

/* The navigator paints its own scene background over everything below it —
 * React Navigation's default light theme is an opaque #f2f2f2, which would hide
 * the photo entirely. contentStyle does not reach that layer; the theme does. */
const transparentTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent' },
};

/** Holds the splash until the bundled serif is ready, so nothing renders in a
 *  fallback font. The stored range is gated one level down, in each domain's
 *  RangeProvider — the root sits above both domains and has no range of its own. */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Gelasio_400Regular, Gelasio_700Bold });
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      {/* Feeds the quiz screen's KeyboardAwareScrollView. Android draws
       * edge-to-edge and no longer resizes for the keyboard, so nothing else
       * lifts a focused field above it. Native-only: on web the library's
       * bindings are no-ops and this is an empty wrapper. */}
      <KeyboardProvider>
        <View style={styles.root}>
          <StatusBar style="dark" />
          <ThemeProvider value={transparentTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'slide_from_right',
              }}
            />
          </ThemeProvider>
        </View>
      </KeyboardProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.tan },
});
