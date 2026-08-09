import type { ImageSourcePropType } from 'react-native';

/* One portrait per presidency number, so Cleveland (22/24) and Trump (45/47)
 * each get two distinct photographs and every term is its own question.
 *
 * Metro resolves require() at build time from a literal path, so this map has
 * to be written out — `require(dir + no + '.jpg')` does not bundle. Note the
 * three odd extensions: 10 is a .png, 30 and 43 are .jpeg.
 *
 * This lives in components/, not lib/ or data/, on purpose. `npm test` runs the
 * pure modules under node with only the alias hook in tests/resolve-hook.mjs,
 * which cannot resolve @/assets/* or load a binary — so a require() reachable
 * from lib/ or data/ would break the suite.
 */
export const US_PORTRAITS: Record<number, ImageSourcePropType> = {
  1: require('@/assets/images/us-portraits/1.jpg'),
  2: require('@/assets/images/us-portraits/2.jpg'),
  3: require('@/assets/images/us-portraits/3.jpg'),
  4: require('@/assets/images/us-portraits/4.jpg'),
  5: require('@/assets/images/us-portraits/5.jpg'),
  6: require('@/assets/images/us-portraits/6.jpg'),
  7: require('@/assets/images/us-portraits/7.jpg'),
  8: require('@/assets/images/us-portraits/8.jpg'),
  9: require('@/assets/images/us-portraits/9.jpg'),
  10: require('@/assets/images/us-portraits/10.png'),
  11: require('@/assets/images/us-portraits/11.jpg'),
  12: require('@/assets/images/us-portraits/12.jpg'),
  13: require('@/assets/images/us-portraits/13.jpg'),
  14: require('@/assets/images/us-portraits/14.jpg'),
  15: require('@/assets/images/us-portraits/15.jpg'),
  16: require('@/assets/images/us-portraits/16.jpg'),
  17: require('@/assets/images/us-portraits/17.jpg'),
  18: require('@/assets/images/us-portraits/18.jpg'),
  19: require('@/assets/images/us-portraits/19.jpg'),
  20: require('@/assets/images/us-portraits/20.jpg'),
  21: require('@/assets/images/us-portraits/21.jpg'),
  22: require('@/assets/images/us-portraits/22.jpg'),
  23: require('@/assets/images/us-portraits/23.jpg'),
  24: require('@/assets/images/us-portraits/24.jpg'),
  25: require('@/assets/images/us-portraits/25.jpg'),
  26: require('@/assets/images/us-portraits/26.jpg'),
  27: require('@/assets/images/us-portraits/27.jpg'),
  28: require('@/assets/images/us-portraits/28.jpg'),
  29: require('@/assets/images/us-portraits/29.jpg'),
  30: require('@/assets/images/us-portraits/30.jpeg'),
  31: require('@/assets/images/us-portraits/31.jpg'),
  32: require('@/assets/images/us-portraits/32.jpg'),
  33: require('@/assets/images/us-portraits/33.jpg'),
  34: require('@/assets/images/us-portraits/34.jpg'),
  35: require('@/assets/images/us-portraits/35.jpg'),
  36: require('@/assets/images/us-portraits/36.jpg'),
  37: require('@/assets/images/us-portraits/37.jpg'),
  38: require('@/assets/images/us-portraits/38.jpg'),
  39: require('@/assets/images/us-portraits/39.jpg'),
  40: require('@/assets/images/us-portraits/40.jpg'),
  41: require('@/assets/images/us-portraits/41.jpg'),
  42: require('@/assets/images/us-portraits/42.jpg'),
  43: require('@/assets/images/us-portraits/43.jpeg'),
  44: require('@/assets/images/us-portraits/44.jpg'),
  45: require('@/assets/images/us-portraits/45.jpg'),
  46: require('@/assets/images/us-portraits/46.jpg'),
  47: require('@/assets/images/us-portraits/47.jpg'),
};
