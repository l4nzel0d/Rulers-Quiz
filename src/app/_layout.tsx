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
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Background } from '@/components/Background';
import { RangeProvider, useRange } from '@/state/RangeContext';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

/* The navigator paints its own scene background over everything below it —
 * React Navigation's default light theme is an opaque #f2f2f2, which would hide
 * the photo entirely. contentStyle does not reach that layer; the theme does. */
const transparentTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent' },
};

/** Holds the splash until both the bundled serif and the stored range are ready,
 *  so nothing ever renders with the wrong range or a fallback font. */
function Shell() {
  const { hydrated } = useRange();
  const [fontsLoaded, fontError] = useFonts({ Gelasio_400Regular, Gelasio_700Bold });

  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <View style={styles.root}>
      <Background />
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
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RangeProvider>
        <Shell />
      </RangeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.tan },
});
