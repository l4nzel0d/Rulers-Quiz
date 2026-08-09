import { Slot } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Background } from '@/components/Background';
import { RU } from '@/domains/ru';
import { DomainProvider } from '@/state/DomainContext';
import { RangeProvider } from '@/state/RangeContext';

/** Всё под /ru живёт внутри русского домена: свой фон, свой акцент и свой
 *  сохранённый диапазон. Ср. src/app/us/_layout.tsx. */
export default function RULayout() {
  return (
    <DomainProvider domain={RU}>
      <View style={styles.root}>
        {/* Вне RangeProvider намеренно: тот придерживает поддерево, пока не
         * прочитан сохранённый диапазон, — фон должен быть виден всё это время. */}
        <Background source={RU.background} />
        <RangeProvider domain={RU}>
          <Slot />
        </RangeProvider>
      </View>
    </DomainProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
