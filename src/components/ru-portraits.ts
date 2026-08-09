import type { ImageSourcePropType } from 'react-native';

/* Портреты русских правителей — по одному на `no` из src/data/ru-rulers.ts.
 *
 * Metro разрешает require() по литеральному пути на этапе сборки, поэтому карту
 * приходится выписывать целиком: `require('...' + no + '.jpg')` не соберётся.
 * Не все файлы .jpg: 14.png.
 *
 * Файл лежит в components/, а не в lib/ или data/, — иначе `npm test` не сможет
 * загрузить домен: тестовый резолвер не знает про @/assets/*. См. AGENTS.md.
 *
 * Пропущенные номера перечислены закомментированными строками. Отсутствующий
 * портрет — не поломка: PortraitPrompt рисует пустую рамку. Но вопрос про этого
 * правителя в режиме «Дан портрет» становится неотвечаемым, так что дырки стоит
 * закрывать.
 */
export const RU_PORTRAITS: Record<number, ImageSourcePropType> = {
  1: require('@/assets/images/ru-portraits/1.jpg'), // Михаил Фёдорович
  2: require('@/assets/images/ru-portraits/2.jpg'), // Алексей Михайлович
  3: require('@/assets/images/ru-portraits/3.jpg'), // Фёдор Алексеевич
  4: require('@/assets/images/ru-portraits/4.jpg'), // Софья Алексеевна
  5: require('@/assets/images/ru-portraits/5.jpg'), // Иван V
  6: require('@/assets/images/ru-portraits/6.jpg'), // Пётр I
  7: require('@/assets/images/ru-portraits/7.jpg'), // Екатерина I
  8: require('@/assets/images/ru-portraits/8.jpg'), // Пётр II
  9: require('@/assets/images/ru-portraits/9.jpg'), // Анна Иоанновна
  10: require('@/assets/images/ru-portraits/10.jpg'), // Иван VI
  11: require('@/assets/images/ru-portraits/11.jpg'), // Елизавета Петровна
  12: require('@/assets/images/ru-portraits/12.jpg'), // Пётр III
  13: require('@/assets/images/ru-portraits/13.jpg'), // Екатерина II
  14: require('@/assets/images/ru-portraits/14.png'), // Павел I
  15: require('@/assets/images/ru-portraits/15.jpg'), // Александр I
  16: require('@/assets/images/ru-portraits/16.jpg'), // Николай I
  17: require('@/assets/images/ru-portraits/17.jpg'), // Александр II
  18: require('@/assets/images/ru-portraits/18.jpg'), // Александр III
  19: require('@/assets/images/ru-portraits/19.jpg'), // Николай II
  20: require('@/assets/images/ru-portraits/20.jpg'), // Владимир Ильич Ленин
  21: require('@/assets/images/ru-portraits/21.jpg'), // Иосиф Виссарионович Сталин
  22: require('@/assets/images/ru-portraits/22.jpg'), // Георгий Максимилианович Маленков
  23: require('@/assets/images/ru-portraits/23.jpg'), // Никита Сергеевич Хрущёв
  24: require('@/assets/images/ru-portraits/24.jpg'), // Леонид Ильич Брежнев
  25: require('@/assets/images/ru-portraits/25.jpg'), // Юрий Владимирович Андропов
  26: require('@/assets/images/ru-portraits/26.jpg'), // Константин Устинович Черненко
  27: require('@/assets/images/ru-portraits/27.jpg'), // Михаил Сергеевич Горбачёв
  28: require('@/assets/images/ru-portraits/28.jpg'), // Борис Николаевич Ельцин
  29: require('@/assets/images/ru-portraits/29.jpg'), // Владимир Владимирович Путин
  30: require('@/assets/images/ru-portraits/30.jpg'), // Дмитрий Анатольевич Медведев
  31: require('@/assets/images/ru-portraits/31.jpg'), // Владимир Владимирович Путин
};
